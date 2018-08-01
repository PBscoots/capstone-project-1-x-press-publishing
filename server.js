const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3= require('sqlite3');

const morgan = require('morgan');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Add middleware for handling CORS requests from index.html
// api router setup
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(morgan('tiny'));

const apiRouter = require('./server/api');
app.use('/api', apiRouter);



const PORT = process.env.PORT || 4000;

app.listen(PORT);

module.exports = app;    