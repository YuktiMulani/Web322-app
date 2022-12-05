/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Yukti Manoj Mulani Student ID: 156809212 Date: 20-Nov-2022
*
*  Online (Cyclic) Link: https://dull-pear-barnacle-shoe.cyclic.app
*
********************************************************************************/ 
const express = require('express');
const productData = require("./product-service");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require("express-handlebars");
const path = require("path");
const stripJs = require('strip-js');
const authData = require('./auth-service.js');
const clientSessions = require('client-sessions');

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dpvrtu9b0',
    api_key: '512778642227934',
    api_secret: '8mU8y2UufWxwZQPYs7aQaODYBhI'
});
const upload = multer();

app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    helpers: {
        navLink: function(url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
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
        },
        formatDate: function(dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
    }
}));

app.set('view engine', '.hbs');

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.use(clientSessions({
    cookieName: "session",
    secret: "ymulani@myseneca.ca",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

ensureLogin = (req, res, next) => {
    if (!(req.session.user)) {
        res.redirect("/login");
    } else { next(); }
};


app.get('/', (req, res) => {
    res.render("home");
});

app.get('/product', async(req, res) => {

    let viewData = {};

    try {

        let posts = [];

        if (req.query.category) {
            products = await productData.getPublishedProductsByCategory(req.query.category);
        } else {
            products = await productData.getPublishedProducts();
        }

        products.sort((a, b) => new Date(b.productDate) - new Date(a.productDate));

        let product = products[0];
        viewData.products = products;
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

app.get('/demos', ensureLogin, (req, res) => {

    let queryPromise = null;

    if (req.query.category) {
        queryPromise = productData.getProductsByCategory(req.query.category);
    } else if (req.query.minDate) {
        queryPromise = productData.getProductsByMinDate(req.query.minDate);
    } else {
        queryPromise = productData.getAllProducts()
    }

    queryPromise.then(data => {
        (data.length > 0) ? res.render("productts", { products: data }): res.render("products", { message: "no results" });
    }).catch(err => {
        res.render("products", { message: "no results" });
    })

});

app.post("/products/add", ensureLogin, upload.single("featureImage"), (req, res) => {

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
            processProduct(uploaded.url);
        });
    } else {
        processProduct("");
    }

    function processProduct(imageUrl) {
        req.body.featureImage = imageUrl;

        productData.addProduct(req.body).then(product => {
            res.redirect("/products");
        }).catch(err => {
            res.status(500).send(err);
        })
    }
});

app.get('/products/add', ensureLogin, (req, res) => {
    productData.getCategories().then((data) => {
        res.render("addProduct", { categories: data });
    }).catch((err) => {
        res.render("addProduct", { categories: [] });
    });
});

app.get("/demos/delete/:id", ensureLogin, (req, res) => {
    productData.deleteProductById(req.params.id).then(() => {
        res.redirect("/demos");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Product / Product Not Found");
    });
});

app.get('/product/:id', ensureLogin, (req, res) => {
    productData.getProductById(req.params.id).then(data => {
        res.json(data);
    }).catch(err => {
        res.json({ message: err });
    });
});

app.get('/product/:id', async(req, res) => {

    let viewData = {};

    try {

        let products = [];
        if (req.query.category) {
            products = await productData.getPublishedProductsByCategory(req.query.category);
        } else {
            products = await productData.getPublishedProducts();
        }

        products.sort((a, b) => new Date(b.productDate) - new Date(a.productDate));
        viewData.products = products;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        viewData.product = await productData.getProducttById(req.params.id);
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

app.get('/categories', ensureLogin, (req, res) => {
    productData.getCategories().then((data => {
        (data.length > 0) ? res.render("categories", { categories: data }): res.render("categories", { message: "no results" });
    })).catch(err => {
        res.render("categories", { message: "no results" });
    });
});

app.get('/categories/add', ensureLogin, (req, res) => {
    res.render("addCategory");
});

app.post('/categories/add', ensureLogin, (req, res) => {
    productData.addCategory(req.body).then(category => {
        res.redirect("/categories");
    }).catch(err => {
        res.status(500).send(err.message);
    })
});

app.get("/categories/delete/:id", ensureLogin, (req, res) => {
    productData.deleteCategoryById(req.params.id).then(() => {
        res.redirect("/categories");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Category / Category Not Found");
    });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    authData.registerUser(req.body)
        .then(() => res.render("register", { successMessage: "User created" }))
        .catch(err => res.render("register", { errorMessage: err, userName: req.body.userName }))
});

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body)
        .then(user => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            }
            res.redirect('/posts');
        })
        .catch(err => {
            res.render("login", { errorMessage: err, userName: req.body.userName })
        })
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/login");
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory", { user: req.session.user });
});

app.use((req, res) => {
    res.status(404).render("404");
})

productData.initialize()
    .then(authData.initialize)
    .then(function() {
        app.listen(HTTP_PORT, function() {
            console.log("app listening on: " + HTTP_PORT)
        });
    }).catch(function(err) {
        console.log("unable to start server: " + err);
    });