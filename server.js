const express = require('express');
const exphbs=require('express-handlebars');
const productData = require("./product-service");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const path = require("path");
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dfigibz6e',
    api_key: '964183147451584',
    api_secret: 'Ap59uY4V1aViroxLP3QA6WmeqHk',
    secure: true
});

const upload = multer();

app.use(express.static('public'));

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.get('/', (req, res) => {
    res.render(path.join(__dirname, "views/layouts/main.hbs"))
});

app.get('/products', (req,res)=>{
    productData.getPublishedProducts().then((data=>{
        res.json(data);
    })).catch(err=>{
        res.json({message: err});
    });
});

app.get('/demos', (req,res)=>{

    let queryPromise = null;

    if(req.query.category){
        queryPromise = productData.getProductsByCategory(req.query.category);
    }else if(req.query.minDate){
        queryPromise = productData.getProductsByMinDate(req.query.minDate);
    }else{
        queryPromise = productData.getAllProducts()
    } 

    queryPromise.then(data=>{
        res.json(data);
    }).catch(err=>{
        res.json({message: err});
    })

});

app.get('/categories', (req,res)=>{
    productData.getCategories().then((data=>{
        res.json(data);
    })).catch(err=>{
        res.json({message: err});
    });
});

app.post("/products/add", upload.single("featureImage"), (req,res)=>{

    if(req.file){
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
    
        upload(req).then((uploaded)=>{
            processProduct(uploaded.url);
        });
    }else{
        processProduct("");
    }

    function processProduct(imageUrl){
        req.body.featureImage = imageUrl;

        productData.addProduct(req.body).then(product=>{
            res.redirect("/demos");
        }).catch(err=>{
            res.status(500).send(err);
        })
    }   
});

app.get('/products/add', (req,res)=>{
   res.render(path.join(__dirname, "/views/addProduct.hbs"));
}); 

app.get('/product/:id', (req,res)=>{
    productData.getProductById(req.params.id).then(data=>{
        res.json(data);
    }).catch(err=>{
        res.json({message: err});
    });
});






app.use((req,res)=>{
    res.status(404).send("404 - Page Not Found")
})

productData.initialize().then(()=>{
    app.listen(HTTP_PORT, () => { 
        console.log('server listening on: ' + HTTP_PORT); 
    });
}).catch((err)=>{
    console.log(err);
})