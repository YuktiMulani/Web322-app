const fs = require("fs");

let products = [];
let categories = [];

module.exports.initialize = function () {
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

module.exports.getAllProducts = function(){
    return new Promise((resolve,reject)=>{
        (products.length > 0 ) ? resolve(products) : reject("no results returned"); 
    });
}

module.exports.getPublishedProducts = function(){
    return new Promise((resolve,reject)=>{
        (products.length > 0) ? resolve(products.filter(product => product.published)) : reject("no results returned");
    });
}

module.exports.getCategories = function(){
    return new Promise((resolve,reject)=>{
        (categories.length > 0 ) ? resolve(categories) : reject("no results returned"); 
    });
}