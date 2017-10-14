'use strict';

const express = require('express');
const morgan = require('morgan');
const path = require('path');
const  bodyParser = require('body-parser')
const { checkSig } = require('./app');
const PORT = process.env.PORT || 9000;
const jsonParser = bodyParser.json()

const app = express();

// Setup logger
// app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')));

// Always return the main index.html, so react-router render the route in the client
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
// });

app.post('/authenticate', jsonParser, checkSig);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
