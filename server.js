/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Yukti Manoj Mulani Student ID: 156809212 Date: 06-Nov-2022
*
*  Online (Cyclic) Link: https://dull-pear-barnacle-shoe.cyclic.app
*
********************************************************************************/ 
// Express 
const express = require('express');
const exphbs = require('express-handlebars');

// Database Service
const productData = require('./product-service');

// Handling Images
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Handling Multipart Data
const multer = require("multer");

// Handling Paths
const path = require("path");

// Instance of Express
const app = express();

// Ports
const HTTP_PORT = process.env.PORT || 8080;

// HTTP Body Parser
var bodyParser = require('body-parser')

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.engine('.hbs', exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
    }
}));

app.set('view engine', '.hbs');

// cloudinary Config for Images
cloudinary.config({ 
    cloud_name: 'dpvrtu9b0', 
    api_key: '512778642227934', 
    api_secret: '8mU8y2UufWxwZQPYs7aQaODYBhI' 
  });

const upload = multer();

app.use(express.static('public'));
app.use(function(req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

// Default Home Page Route

app.get('/', (req, res) => {
    res.redirect("/product");
});

// Home Route
app.get('/home', (req, res) => {
    res.render(path.join(__dirname + "/views/home.hbs"))
});

// Product (Single) Route
app.get('/product', async(req, res) => {

    let viewData = {};

    try {
        let Products = [];

        if (req.query.category) {
            Products = await productData.getPublishedproductsByCategory(req.query.category);
        } else {
            Products = await productData.getPublishedproducts();
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

// Get Product By Id Route

app.get('/product/:id', async(req, res) => {

    let viewData = {};

    try {
        let Products = [];

        if (req.query.category) {
            Products = await productData.getPublishedproductsByCategory(req.query.category);
        } else {
            Products = await productData.getPublishedproducts();
        }

        Products.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

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

// Get Product By Id Route

app.get('/product/:id', (req, res) => {
    productData.getproductById(req.params.id).then(data => {
        res.json(data);
    }).catch(err => {
        res.json({ message: err });
    });
});

// Get Routes

app.get('/categories', (req, res) => {
    productData.getCategories().then((data => {
        if(data.length>0){
            res.render("categories", { categories: data });
        }else{
            res.render("categories", { message: 'no results' });
        }
    })).catch(err => {
        res.render("categories", { message: err });
    });
});

app.get('/demos', (req, res) => {

    let queryPromise = null;

    if (req.query.category) {
        queryPromise = productData.getproductsByCategory(req.query.category);
    } else if (req.query.minDate) {
        queryPromise = productData.getproductsByMinDate(req.query.minDate);
    } else {
        queryPromise = productData.getAllproducts()
    }

    queryPromise.then(data => {
        if(data.length>0){
            res.render("demos", { Products: data });
        }else{
            res.render("demos", { message: 'no results' });
        }
    }).catch(err => {
        res.render("demos", { message: err });
    })

});

// Post (Add New) Routes

app.get('/demos/add', (req, res) => {
    productData.getCategories().then((data => {
        res.render(path.join(__dirname + "/views/addProducts.hbs"),{categories: data})
    })).catch(err => {
        res.render(path.join(__dirname + "/views/addProducts.hbs"),{categories: null})
    });
});

app.post("/demos/add", upload.single("featureImage"), (req, res) => {
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
        productData.addProduct(req.body).then(product => {
            res.redirect("/demos");
        }).catch(err => {
            res.status(500).send(err);
        })
    }
});

app.get('/categories/add', (req, res) => {
    res.render(path.join(__dirname + "/views/addCategory.hbs"))
});

app.post("/categories/add", urlencodedParser, (req, res) => {
    productData.addCategory(req.body)
    .then(category => {
        res.redirect("/categories");
    }).catch(err => {
        res.status(500).send(err);
    })
});

// Delete Routes

app.get('/categories/delete/:id', (req, res) => {
    productData.deleteCategoryById(req.params.id).then((data => {
        res.redirect("/categories");
    })).catch(err => {
        res.send(500).send('Unable to Remove category / catgory not found');
    });
});

app.get('/demos/delete/:id', (req, res) => {
    productData.deleteProductById(req.params.id).then((data => {
        res.redirect("/demos");
    })).catch(err => {
        res.send(500).send('Unable to Remove Product / Product not found');
    });
});

productData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log('server listening on: ' + HTTP_PORT);
    });
}).catch((err) => {
    console.log(err);
})