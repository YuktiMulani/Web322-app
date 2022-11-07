const fs = require("fs");

let products = [];
let categories = [];

module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/products.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                products = JSON.parse(data);

                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

module.exports.getAllproducts = function() {
    return new Promise((resolve, reject) => {
        (products.length > 0) ? resolve(products): reject("no results returned");
    });
}

module.exports.getproductsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        let filteredproducts = products.filter(product => product.category == category);

        if (filteredproducts.length == 0) {
            reject("no results returned")
        } else {
            resolve(filteredproducts);
        }
    });
}

module.exports.getproductsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
        let filteredproducts = products.filter(product => (new Date(product.productDate)) >= (new Date(minDateStr)))

        if (filteredproducts.length == 0) {
            reject("no results returned")
        } else {
            resolve(filteredproducts);
        }
    });
}

module.exports.getproductById = function(id) {
    return new Promise((resolve, reject) => {
        let foundproduct = products.find(product => product.id == id);

        if (foundproduct) {
            resolve(foundproduct);
        } else {
            reject("no result returned");
        }
    });
}

module.exports.addproduct = function(productData) {
    return new Promise((resolve, reject) => {
        productData.published = productData.published ? true : false;
        productData.id = products.length + 1;
        products.push(productData);
        resolve();
    });
}

module.exports.getPublishedproducts = function() {
    return new Promise((resolve, reject) => {
        let filteredproducts = products.filter(product => product.published);
        (filteredproducts.length > 0) ? resolve(filteredproducts): reject("no results returned");
    });
}

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        (categories.length > 0) ? resolve(categories): reject("no results returned");
    });
}

module.exports.getPublishedproductsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        let filteredproducts = products.filter(product => product.published == true && product.category == category);
        (filteredproducts.length > 0) ? resolve(filteredproducts): reject("no results returned");
    });
}