const config = require('C://Yukti//WEB322//web322-app//product-service.js');
var express = require("express");
var app = express();


var HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public')); 
// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
  }
// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
    res.sendFile("C://Yukti//WEB322//web322-app//views//index.html");
  });
  app.get("/products", (req, res) => {
    res.sendFile("C://Yukti//WEB322//web322-app//data//products.json");
    res.send("<h1>TODO: get all products which have published==true</h1>")
  });
  app.get("/categories", (req, res) => {
    res.sendFile("C://Yukti//WEB322//web322-app//data//categories.json");
    res.send("<h1>TODO: get all categories which have published==true</h1>")
  });
  app.get("/demos", (req, res) => {
    res.sendFile("C://Yukti//WEB322//web322-app//data//categories.json");
    res.send("<h1>TODO: get all demos which have published==true</h1>")
  });
  

  // setup http server to listen on HTTP_PORT
  app.listen(HTTP_PORT, onHttpStart);