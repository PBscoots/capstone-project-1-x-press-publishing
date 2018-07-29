// declare router
const artistRouter = require('express').Router();

// import database functions
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// ***REQUEST HANDLING***

// const validity checks
const isValidArtist = artist => {
    if (!artist.name){
        console.log('Missing Artist Name');
        return false;
    } else if (!artist.dateOfBirth){
        console.log('Missing Artist DOB');
        return false;
    } else if (!artist.biography){
        console.log('Missing Artist biography');
        return false;
    } else {
    } 
    return true;
}

// param handling
artistRouter.param('id', (req,res,next,id)=> {
    const artist = db.get(`SELECT * FROM Artist
                        WHERE id = ${id}`,
            (err, artist)=>{
                if(artist){
                    req.artist = artist;
                    next();
                } else {
                    res.sendStatus(404);
                }
            });
});

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
artistRouter.post('/',(req,res,next)=>{
    // check validity
    debugger;
    let artist = req.body.artist;
    artist.isCurrentlyEmployed = artist.isCurrentlyEmployed || '1';
    if(isValidArtist(artist)){
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
                db.get('SELECT * FROM Artist WHERE id = $id ',
                {
                    $id : this.lastID
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
    }
    res.sendStatus(400);
});

// get artist by ID
artistRouter.get('/:id',(req,res,next)=>{
    res.send({artist: req.artist});
});





// export router
module.exports = artistRouter;