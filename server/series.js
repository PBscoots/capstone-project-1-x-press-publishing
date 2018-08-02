// declare router
const seriesRouter = require('express').Router();

// import database functions
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// ***REQUEST HANDLING***
// Middleware
// import nested router from issues
const issueRouter = require('./issues');
seriesRouter.use('/:seriesId/issues', issueRouter);
// param handling
seriesRouter.param('seriesId', (req,res,next,seriesId)=> {
    db.get(`SELECT * FROM Series
            WHERE Series.id = $seriesId`,
            {
                $seriesId   :   seriesId
            },
            (err, row)=>{
        
                if(row){
                    req.series = row;
                    next();
                } else {
                    res.sendStatus(404);
                }
            });
});

// validation
const isValidSeries = (req,res,next) => {
    const series = req.body.series
    if(!series.name || !series.description){
        res.sendStatus(400);
        return;
    } else {
        next();
    }
}

// get all series
seriesRouter.get('/',(req,res,next)=>{
    db.all(`SELECT * FROM Series`,
        (err, series)=>{
            if(err){
                console.log(err);
                return;
            }
            res.body = {series : series};
            res.send(res.body);
        });
});

seriesRouter.get(`/:seriesId`,(req,res,next)=>{
    res.send({series    :   req.series})
});

seriesRouter.post('/', isValidSeries, (req,res,next)=>{
    const series = req.body.series;
    db.run(`INSERT INTO Series
        (name, description)
        VALUES ($name, $description);`,
        {
            $name   :   series.name,
            $description    :   series.description
        },
        function(err){
            if(err){
                res.sendStatus(400);
            } else {
                db.get(`SELECT * FROM Series
                    WHERE id = $seriesId`,
                    {
                        $seriesId   :   this.lastID
                    },
                (err, series)=>{
                    if(err){
                        res.sendStatus(400);
                    } else {
                        res.status(201).send({series    :   series});
                    }
                });
            }
        }
    );
});

seriesRouter.put('/:seriesId', isValidSeries, (req,res,next)=>{
    const series = req.body.series;
    db.run(`UPDATE Series SET
        name = $name,
        description = $newDescription
        WHERE Series.id = $seriesId;`,
        {
            $name              :   series.name,
            $newDescription    :   series.description,
            $seriesId          :   req.params.seriesId
        },
        (err)=>{
            if(err){
                res.sendStatus(400);
            } else {
                db.get(`SELECT * FROM Series
                    WHERE id = $seriesId`,
                    {
                        $seriesId   :   req.params.seriesId
                    },
                    (err, series)=>{
                        if(err){
                            res.sendStatus(400);
                        } else {
                            res.status(200).send({series    :   series});
                        }
                    })
            }
        })
});

// needs work. Does not yet pass all tests
seriesRouter.delete('/:seriesId',(req,res,next)=>{
    debugger;
    db.all(`SELECT * FROM Issue
        WHERE series_id = $seriesId`,
        {
            $seriesId   :   req.params.seriesId
        },
        (err,issues)=>{
            debugger;
            if(issues = []){
                db.run(`DELETE FROM Series
                    WHERE id = $seriesId;`,
                    {
                        $seriesId   :   req.params.seriesId
                    },
                    (err)=>{
                        if(err){
                            debugger;
                            res.sendStatus(400); 
                            return;
                        } else {
                            debugger;
                            res.sendStatus(204);
                            return;
                        }
                    }
                );
            } else {
                res.sendStatus(400);
                return;
            }
        }
    );
});

module.exports = seriesRouter;
