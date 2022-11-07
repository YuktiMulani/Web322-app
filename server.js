/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Yukti Manoj Mulani Student ID: 156809212 Date: 06-Nov-2022
*
*  Online (Cyclic) Link: https://dull-pear-barnacle-shoe.cyclic.app
*
********************************************************************************/ 

const express = require('express');
const productData = require("./product-service");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const path = require("path");
const app = express();
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');

const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context) {
            return stripJs(context);
        }
    }
}));

app.set('view engine', '.hbs');

cloudinary.config({
    cloud_name: 'dpvrtu9b0',
    api_key: '512778642227934',
    api_secret: '8mU8y2UufWxwZQPYs7aQaODYBhI',
    secure: true
});

const upload = multer();

app.use(express.static('public'));
app.use(function(req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

app.get('/', (req, res) => {
    res.redirect("/product");
});

app.get('/home', (req, res) => {
    res.render(path.join(__dirname + "/views/home.hbs"))
});

app.get('/product', async(req, res) => {

    let viewData = {};

    try {
        let Products = [];

        if (req.query.category) {
            Products = await productData.getPublishedProductsByCategory(req.query.category);
        } else {
            Products = await productData.getPublishedProducts();
        }

        Products.sort((a, b) => new Date(b.productDate) - new Date(a.productDate));

        let product = Products[0];

        viewData.Products = Products;
        viewData.product = product;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await productData.getCategories();

        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    res.render("product", { data: viewData })

});

app.get('/product/:id', async(req, res) => {

    let viewData = {};

    try {
        let Products = [];

        if (req.query.category) {
            Products = await productData.getPublishedProductsByCategory(req.query.category);
        } else {
            Products = await productData.getPublishedProducts();
        }

        Products.sort((a, b) => new Date(b.productDate) - new Date(a.productDate));

        viewData.Products = Products;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        viewData.product = await productData.getproductById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await productData.getCategories();

        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    res.render("product", { data: viewData })
});

app.get('/Products', (req, res) => {

    let queryPromise = null;

    if (req.query.category) {
        queryPromise = productData.getProductsByCategory(req.query.category);
    } else if (req.query.minDate) {
        queryPromise = productData.getProductsByMinDate(req.query.minDate);
    } else {
        queryPromise = productData.getAllProducts()
    }

    queryPromise.then(data => {
        res.render("Products", { Products: data });
    }).catch(err => {
        res.render("Products", { message: err });
    })

});

app.post("/Products/add", upload.single("featureImage"), (req, res) => {

    if (req.file) {
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
            processproduct(uploaded.url);
        });
    } else {
        processproduct("");
    }

    function processproduct(imageUrl) {
        req.body.featureImage = imageUrl;
        req.body.productDate = new Date().toISOString();
        productData.addproduct(req.body).then(product => {
            res.redirect("/Products");
        }).catch(err => {
            res.status(500).send(err);
        })
    }
});

app.get('/Products/add', (req, res) => {
    res.render(path.join(__dirname + "/views/addproduct.hbs"))
});

app.get('/product/:id', (req, res) => {
    productData.getproductById(req.params.id).then(data => {
        res.json(data);
    }).catch(err => {
        res.json({ message: err });
    });
});

app.get('/categories', (req, res) => {
    productData.getCategories().then((data => {
        res.render("categories", { categories: data });
    })).catch(err => {
        res.render("categories", { message: err });
    });
});

app.use((req, res) => {
    res.status(404).render(path.join(__dirname + "/views/404.hbs"));
    res
})

productData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log('server listening on: ' + HTTP_PORT);
    });
}).catch((err) => {
    console.log(err);
})