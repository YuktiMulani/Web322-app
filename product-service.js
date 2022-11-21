const Sequelize = require('sequelize');
require('dotenv').config()

var sequelize = new Sequelize(process.env.DATABASE, {
    host: 'host',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Schema Model

var Product = sequelize.define('Product', {
    body: Sequelize.STRING,
    title: Sequelize.TEXT,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING,
});

// Schema Relationship

Product.belongsTo(Category, {foreignKey: 'category'});

// Database Functions

module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
        .then(function(){
            resolve();
        })
        .catch(function(){
            reject('unable to sync the database');
        })
    });
}

module.exports.getAllproducts = function() {
    return new Promise((resolve, reject) => {
        Product.findAll()
        .then((data)=>{
            resolve(data);
        })
        .catch((err)=>{
            reject('no results returned');
        })
    });
}

module.exports.getproductsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        Product.findAll({
            where:{
                category: category
            }
        })
        .then((data)=>{
            resolve(data);
        })
        .catch((err)=>{
            reject('no results returned');
        })
    });
}

module.exports.getproductsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
        Product.findAll({
            where:{
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
        .then((data)=>{
            resolve(data);
        })
        .catch((err)=>{
            reject('no results returned');
        })
    });
}

module.exports.getproductById = function(id) {
    return new Promise((resolve, reject) => {
        Product.findAll({
            where:{
                id: id
            }
        })
        .then((data)=>{
            resolve(data[0]);
        })
        .catch((err)=>{
            reject('no results returned');
        })
    });
}

module.exports.addProduct = function(productData) {
    return new Promise((resolve, reject) => {

        productData.published = (productData.published) ? true : false;
        productData.body = (productData.body==="") ? null : productData.body;
        productData.title = (productData.title==="") ? null : productData.title;
        productData.featureImage = (productData.featureImage==="") ? null : productData.featureImage;
        productData.postDate = new Date();

        Product.create(productData)
        .then((data)=>{
            resolve();
        })
        .catch((err)=>{
            reject('unable to create product');
        })

    });
}

module.exports.getPublishedproducts = function() {
    return new Promise((resolve, reject) => {
        Product.findAll({
            where:{
                published: true
            }
        })
        .then((data)=>{
            resolve(data);
        })
        .catch((err)=>{
            reject('no results returned');
        })
    });
}

module.exports.getPublishedproductsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        Product.findAll({
            where:{
                published: true,
                category: category
            }
        })
        .then((data)=>{
            resolve(data);
        })
        .catch((err)=>{
            reject('no results returned');
        })
    });
}

module.exports.deleteProductById = function(id) {
    return new Promise((resolve, reject) => {
        Product.destroy({
            where:{
                id: id
            }
        })
        .then((data)=>{
            resolve('destroyed');   
        })
        .catch((err)=>{
            reject('unable to delete product');
        })
    });
}

// Category realted functions

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        Category.findAll()
        .then((data)=>{
            resolve(data);
        })
        .catch((err)=>{
            reject('no results returned');
        })
    });
}

module.exports.addCategory = function(categoryData) {
    return new Promise((resolve, reject) => {
        categoryData.category = (categoryData.category==="") ? null : categoryData.category;
        Category.create(categoryData)
        .then((data)=>{
            resolve();
        })
        .catch((err)=>{
            reject('unable to create category');
        })

    });
}

module.exports.deleteCategoryById = function(id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where:{
                id: id
            }
        })
        .then((data)=>{
            resolve('destroyed');   
        })
        .catch((err)=>{
            reject('unable to delete category');
        })
    });
}

