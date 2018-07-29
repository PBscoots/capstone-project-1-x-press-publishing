const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const sqlite3= require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// api router setup
const app = express();
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(express.static('public'));

const apiRouter = require('./server/api');
app.use('/api', apiRouter);



const PORT = process.env.PORT || 4000;

app.listen(PORT);

module.exports = app;    