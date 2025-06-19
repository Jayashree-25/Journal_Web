const express = require("express");  // Import Express
const bodyParser = require("body-parse");  //parse json request
const fs = require("fs");  //for read/write
const cors = require("cors");  //allow frontend access

const app = express();  //create express app
const port = 5000;

app.use(cors());   // Enable frontend access
app.use(bodyParser.json());   // Accept JSON input
