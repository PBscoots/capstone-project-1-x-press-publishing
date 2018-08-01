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
const isValidArtist = (req,res,next) => {
    const artist = req.body.artist;
    if(!artist.name || !artist.dateOfBirth || !artist.biography){
        res.sendStatus(400);
    }
    artist.isCurrentlyEmployed = artist.isCurrentlyEmployed || '1';
    next();
}

// get all series
issueRouter.get('/',(req,res,next)=>{
    db.all(`SELECT * FROM Issue`,
        (err, issues)=>{
            if(err){
                console.log(err);
                return;
            }
            res.body = {issues : issues};
            res.send(res.body);
        });
});

// get by id
issueRouter.get(`/:issueId`,(req,res,next)=>{
    res.send({issue    :   req.issue})
});

module.exports = issueRouter;

