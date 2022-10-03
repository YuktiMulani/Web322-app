const fs = require("fs");

var products = []
var categories = []

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

exports.getAllProducts = () => {
    return new Promise((resolve, reject) => {
        if (products.length == 0) {
            reject('no results returned');
        } else {
            resolve(posts);
        }
    })
};

exports.getPublishedProducts = () => {
    return new Promise((resolve, reject) => {
        var publishproducts = products.filter(products => products.published == true);

        if (publishproducts.length == 0) {
            reject('no results returned');
        }
        resolve(publishproducts);
    })
};

exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject('no results returned');
        } else {
            resolve(categories);
        }
    })
};