// declare router
const artistRouter = require('express').Router();

// import database functions
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// ***REQUEST HANDLING***

// param handling
artistRouter.param('artistId', (req,res,next,artistId)=> {
    db.get(`SELECT * FROM Artist
            WHERE Artist.id = $artistId`,
            {
                $artistId   :   artistId
            },
            (err, row)=>{
                if(row){
                    req.artist = row;
                    next();
                } else {
                    res.sendStatus(404);
                }
            });
});

// const validity checks
const isValidArtist = (req,res,next) => {
    const artist = req.body.artist;
    if(!artist.name || !artist.dateOfBirth || !artist.biography){
        res.sendStatus(400);
    }
    artist.isCurrentlyEmployed = artist.isCurrentlyEmployed || '1';
    next();
}

// get all artists
artistRouter.get('/',(req,res,next)=>{
    db.all(`SELECT * FROM Artist
            WHERE is_currently_employed = 1`,
        (err, artists)=>{
            if(err){
                console.log(err);
                return;
            }
            res.body = {artists : artists};
            res.send(res.body);
        })
});

// create new artist
artistRouter.post('/',isValidArtist, (req,res,next)=>{
    const artist = req.body.artist;
    db.run(`INSERT INTO Artist
        (name, date_of_birth, biography, is_currently_employed)
        VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed);`,
    {
        $name                   :   artist.name,
        $dateOfBirth            :   artist.dateOfBirth,
        $biography              :   artist.biography,
        $isCurrentlyEmployed    :   artist.isCurrentlyEmployed
    },
    function(err){
        if(err){
            res.sendStatus(400);
        } else {
            db.get('SELECT * FROM Artist WHERE Artist.id = $artistId;',
            {
                $artistId : this.lastID
            },
            (err,artist)=>{
                if(artist){
                    res.status(201).send({artist : artist});
                } else if(err){
                    res.sendStatus(400);
                }
            });
        }

    });
});

// get artist by ID
artistRouter.get('/:artistId',(req,res,next)=>{
    res.send({artist: req.artist});
});

// update an artist
artistRouter.put('/:artistId',isValidArtist,(req,res,next)=>{
    const artist = req.body.artist;
    db.run(`UPDATE Artist SET
            name = $name,
            date_of_birth = $dateOfBirth,
            biography = $biography,
            is_currently_employed = $isCurrentlyEmployed
            WHERE Artist.id = $artistId;`,
            {
                $name                   :   artist.name,
                $dateOfBirth            :   artist.dateOfBirth,
                $biography              :   artist.biography,
                $isCurrentlyEmployed    :   artist.isCurrentlyEmployed,
                $artistId               :   req.params.artistId
            },(err)=>{
                if(err){
                    res.sendStatus(400);
                } else {
                    db.get(`SELECT * FROM Artist
                            WHERE id = $artistId`,
                            {
                                $artistId   :   req.params.artistId
                            },
                            (err,artist)=>{
                                if(artist){
                                    res.status(200).send({artist: artist});
                                } else {
                                    res.sendStatus(400);
                                }
                            });
                }
            }
    );
});

artistRouter.delete('/:artistId',(req,res,next)=>{
    db.run(`UPDATE Artist SET
        is_currently_employed = 0
        WHERE id = $artistId;`,
        {
            $artistId   :   req.params.artistId
        },
        (err)=>{
            if(err){
                res.sendStatus(404);
            } else {
                db.get(`SELECT * FROM Artist
                    WHERE id = $artistId;`,
                    {
                        $artistId   :   req.params.artistId
                    },
                    (err,artist)=>{
                        if(err){
                            res.sendStatus(404);
                        } else {
                            res.status(200).send({artist :   artist});
                        }
                    });
            }
        });
});

// export router
module.exports = artistRouter;