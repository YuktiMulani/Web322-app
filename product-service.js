const fs = require("fs"); // required at the top of your module
//Globally declared arrays
var products = []
var categories = []
    //initialize() function that will read the content of the products.json object
exports.initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/products.json', 'utf8', (err, data) => {
            if (err) {
                reject("unable to read file");
            } else {
                products = JSON.parse(data);
            }
        });

        fs.readFile('./data/categories.json', 'utf8', (err, data) => {
            if (err) {
                reject("unable to read file");
            } else {
                categories = JSON.parse(data);
            }
        });
        resolve();
    })
};
//function that will provide the full array of "products object"
exports.getAllProducts = () => {
    return new Promise((resolve, reject) => {
        if (products.length == 0) {
            reject('no results returned');
        } else {
            resolve(products);
        }
    })
};
//function that will provide an array of "product" objects whose published property is true
exports.getPublishedProducts = () => {
    return new Promise((resolve, reject) => {
        var publishproducts = products.filter(product => product.published == true);

        if (publishproducts.length == 0) {
            reject('no results returned');
        }
        resolve(publishproducts);
    })
};
//function that will provide the full array of "category" objects
exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject('no results returned');
        } else {
            resolve(categories);
        }
    })
};