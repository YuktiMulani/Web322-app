/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part
* Of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Devarsh Yatinbhai Dave ID: 163077217 Date: 10/14/2022

*
* Online (Cyclic) Link: https://busy-red-perch-tam.cyclic.app
*
********************************************************************************/

var express = require("express");
var app = express();
var path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
var productservice = require(__dirname + '/product-service.js');

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
    console.log('Express http server listening on ' + HTTP_PORT);
}

cloudinary.config({
    cloud_name: 'dh3im9qbr',
    api_key: '985997496459944',
    api_secret: 'r1uPEyRIBjMW4RAoH0LVGNJQshw',
    secure: true
});

const upload = multer() // no { storage: storage }

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/index')
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/index.html"));
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

app.get("/home", function(req, res) {
    productservice.getPublishedProducts().then(function(data) {
        res.json({ data });
    }).catch(function(err) {
        res.json({ message: err });
    })
});

app.get("/demos", function(req, res) {

    if (req.query.category) {
        home.getProductsByCategory(req.query.category).then((data) => {
            res.json(data);
        }).catch(function(err) {
            res.json({ message: err });
        })
    } else if (req.query.minDate) {
        home.getProductsByMinDate(req.query.minDate).then((data) => {
            res.json(data);
        }).catch(function(err) {
            res.json({ message: err });
        })
    } else {
        productservice
            .getAllProducts()
            .then(function(data) {
                res.json(data);
            })
            .catch(function(err) {
                res.json({ message: err });
            });
    }
});

app.get('/product/:id', (req, res) => {
    home.getProductById(req.params.id).then((data) => {

        res.json(data);
    }).catch(function(err) {
        res.json({ message: err });
    });


});

app.get("/categories", function(req, res) {
    productservice.getCategories().then(function(data) {
        res.json({ data });
    }).catch(function(err) {
        res.json({ message: err });
    })
});


app.get('/products/add', function(req, res) {
    res.sendFile(path.join(__dirname + "/views/addProduct.html"));
});

app.post('/products/add', upload.single("featureImage"), (req, res) => {

    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;
        productservice.addProduct(req.body).then(() => {
            res.redirect('/demos');
        }).catch((data) => { res.send(data); })
    });

})


app.get('*', function(req, res) {
    res.status(404).send("Page Not Found!!!");
});

productservice.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart());
}).catch(() => {
    console.log("ERROR : From starting the server");
});