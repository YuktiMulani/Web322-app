/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Yukti Manoj Mulani Student ID: 156809212 Date: 02-Oct-2022
*
*  Online (Cyclic) Link: ________________________________________________________
*
********************************************************************************/ 


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require('path');
var productservice = require(__dirname + '/product-service');
app.use(express.static('public'));
// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
  }

  app.use(express.static('public'));
// setup a 'route' to listen on the default url path (http://localhost)
app.get('/', (req, res) => {
  res.redirect('/home')
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname + "/views/index.html"));
});

app.get("/demos", (req, res) => {
  productservice.getPublishedProducts().then((data) => {
      res.json({ data });
  }).catch((err) => {
      res.json({ message: err });
  })
});

app.get("/data/products.json", (req, res) => {
  productservice.getAllProducts().then((data) => {
      res.json({ data });
  }).catch((err) => {
      res.json({ message: err });
  })
});

app.get("/data/categories.json", (req, res) => {
  productservice.getCategories().then((data) => {
      res.json({ data });
  }).catch((err) => {
      res.json({ message: err });
  })
});

app.get('*', function(req, res) {
  res.status(404).send("Page Not Found!");
});

productservice.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart());
}).catch(() => {
  console.log("ERROR : From starting the server");
});