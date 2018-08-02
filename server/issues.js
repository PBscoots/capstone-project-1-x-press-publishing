const express = require('express');
const issueRouter = express.Router({mergeParams : true});

// import database functions
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// ***REQUEST HANDLING***

// param handling
issueRouter.param('issueId', (req,res,next,issueId)=> {
    db.get(`SELECT * FROM Issue
            WHERE Issue.id = $issueId`,
            {
                $issueId   :   issueId
            },
            (err, row)=>{
                if(row){
                    req.issue = row;
                    next();
                } else {
                    res.sendStatus(404);
                }
            });
});

// const validity checks
const isValidIssue = (req,res,next) => {
    const issue = req.body.issue;
    if(!issue.name || !issue.issueNumber || !issue.publicationDate || !issue.artistId){
        res.sendStatus(400);
        return;
    } else {
        next();
    }
}

// get all series
issueRouter.get('/',(req,res,next)=>{
    db.all(`SELECT * FROM Issue
        WHERE series_id = $seriesId`,
        {
            $seriesId   :   req.params.seriesId
        },
        (err, issues)=>{
            if(err){
                res.sendStatus(404);
                return;
            } else {
                res.send({issues : issues});
            }
        });
});

issueRouter.post('/', isValidIssue, (req,res,next)=>{
    const issue = req.body.issue;
    const param = req.params.seriesId;
    db.run(`INSERT INTO Issue
        (name, issue_number, publication_date, artist_id, series_id)
        VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId);`,
        {
            $name               :   issue.name,
            $issueNumber        :   issue.issueNumber,
            $publicationDate    :   issue.publicationDate,
            $artistId            :   issue.artistId,
            $seriesId           :   req.params.seriesId
        },
        function(err){
            if(err){
                res.sendStatus(400);
            } else {
                db.get(`SELECT * FROM Issue
                    WHERE id = $issueId;`,
                    {
                        $issueId   :   this.lastID
                    },
                (err, issue)=>{
                    if(err){
                        res.sendStatus(400);
                    } else {
                        res.status(201).send({issue    :   issue});
                    }
                });
            }
        }
    );
});

// put update issue
issueRouter.put('/:issueId', isValidIssue, (req,res,next)=>{

    debugger;
    const issue = req.body.issue;
    db.run(`UPDATE Issue SET
        name = $name,
        issue_number = $issueNumber,
        publication_date = $publicationDate,
        artist_id = $artistId,
        series_id = $seriesId
        WHERE Issue.id = $issueId;`,
        {
            $name               :   issue.name,
            $issueNumber        :   issue.issueNumber,
            $publicationDate   :   issue.publicationDate,
            $artistId           :   issue.artistId,
            $seriesId           :   req.params.seriesId,
            $issueId            :   req.params.issueId
        },
        (err)=>{
            if(err){
                debugger;
                res.sendStatus(400);
            } else {
                db.get(`SELECT * FROM Issue
                    WHERE id = $issueId`,
                    {
                        $issueId   :   req.params.issueId
                    },
                    (err, issue)=>{
                        debugger;
                        if(err){
                            res.sendStatus(400);
                        } else {
                            res.status(200).send({issue    :   issue});
                        }
                    })
            }
        })
});

issueRouter.delete('/:issueId',(req,res,next)=>{
    db.run(`DELETE FROM Issue
        WHERE id = $issueId;`,
        {
            $issueId   :   req.params.issueId
        },
        (err)=>{
            if(err){
                res.sendStatus(404);
            } else {
                db.get(`SELECT * FROM Issue
                    WHERE id = $issueId;`,
                    {
                        $issueId   :   req.params.issueId
                    },
                    (err,issue)=>{
                        if(err){
                            res.sendStatus(404);
                        } else {
                            res.sendStatus(204);
                        }
                    });
            }
        });
});
module.exports = issueRouter;

