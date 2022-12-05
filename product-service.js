const Sequelize = require('sequelize');

// local 
// database='postgres';
// username='postgres';
// host='localhost';
// password='password';

// d6
// database='d6ujnl3iar8u7g';
// username='ifjsbifzliwugs';
// host='ec2-44-206-89-185.compute-1.amazonaws.com';
// password='c7acdf94caf20c68e61d7c807aa959afabd83c36c7c13c9dc5dc1faf3995a902';

// d2
// database='d2u7h53lnspsnd';
// username='mugdncxmlyngwt';
// host='ec2-52-72-56-59.compute-1.amazonaws.com';
// password='494bc60a0241075b7971263283f80e97477563c77f13090a7cf112e6a7a98383';

// elephant
const database='esowotiv'
const username='esowotiv'
const password='s6NFvc6Zi_CSIWIvjjhie9yZ9pumwfWC'
const host='peanut.db.elephantsql.com'

var sequelize = new Sequelize(database
    , username, password, {
    host: host,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define a "Product" model

var Product = sequelize.define('Product', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

// Define a "Category" model

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

// set up association between Product & Category
Product.belongsTo(Category, {foreignKey: 'category'})


module.exports.initialize = function () {
    return sequelize.sync()
}

module.exports.getAllProducts = function () {
    return new Promise((resolve, reject) => {
        Product.findAll().then(data=>{
            resolve(data);
        }).catch( err =>{
            reject("no results returned");
        });
    });
}

module.exports.getProductsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Product.findAll({
            where: {
                category: category
            }
        }).then( data => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

module.exports.getProductsByMinDate = function (minDateStr) {

    const { gte } = Sequelize.Op;

    return new Promise((resolve, reject) => {
        Product.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                  }
            }
        }).then( data => {
            resolve(data);
        }).catch((err) => {
            reject("no results returned");
        });
    });
}

module.exports.getProductById = function (id) {
    return new Promise((resolve, reject) => {
        Product.findAll({
            where: {
                id: id
            }
        }).then( data => {
            resolve(data[0]);
        }).catch((err) => {
            reject("no results returned");
        });
    });
}

module.exports.addProduct = function (productData) {
    return new Promise((resolve, reject) => {
        productData.published = productData.published ? true : false;

        for (var prop in productData) {
            if (productData[prop] === '')
            productData[prop] = null;
        }

        productData.postDate = new Date();

        Product.create(productData).then(() => {
            resolve();
        }).catch((e) => {
            reject("unable to create product");
        });

    });
}

module.exports.deleteProductById = function (id) {
    return new Promise((resolve, reject) => {
        Product.destroy({
            where: {
                id: id
            }
        }).then( data => {
            resolve();
        }).catch(() => {
            reject("unable to delete product");
        });
    });
}

module.exports.getPublishedProducts = function () {
    return new Promise((resolve, reject) => {
        Product.findAll({
            where: {
                published: true
            }
        }).then( data => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

module.exports.getPublishedProductsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Product.findAll({
            where: {
                published: true,
                category: category
            }
        }).then( data => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll().then(data=>{
            resolve(data);
        }).catch( err =>{
            reject("no results returned")
        });
    });
}

module.exports.addCategory = function (categoryData) {
    return new Promise((resolve, reject) => {

        for (var prop in categoryData) {
            if (categoryData[prop] === '')
            categoryData[prop] = null;
        }

        Category.create(categoryData).then(() => {
            resolve();
        }).catch((e) => {
            reject("unable to create category");
        });

    });
}

module.exports.deleteCategoryById = function (id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        }).then( data => {
            resolve();
        }).catch(() => {
            reject("unable to delete category");
        });
    });
}

