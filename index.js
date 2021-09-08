const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors");
const fsExtra = require("fs-extra");
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require("express-fileupload");
const port = process.env.PORT || 4000;
require('dotenv').config()

app.use(cors())
app.use(bodyParser.json())
app.use(fileUpload())

app.get("/", (req, res) => {
    res.send("connected")
})

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvvgh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    if(err){
        console.log(err)
    }
    const newsCollection = client.db("newsTime").collection("news");
    const adminCollection = client.db("newsTime").collection("admins");
    // post service with img
    app.post('/addNews', (req, res) => {
        console.log(req.body)
        const file = req.files.file;
        const title = req.body.newsTitle;
        const newsAuthor = req.body.newsAuthor;
        const newsCategory = req.body.newsCategory;
        const newsDetails = req.body.newsDetails;
        const newsUploadDate = req.body.uploadDate;

        const newImg = file.data;//read local file
        const encriptedImg = newImg.toString('base64')//convert to base64

        const image = {
            contentType: file.mimetype,//imgType
            size: file.size,
            img: Buffer.from(encriptedImg, 'base64')
        }

        newsCollection.insertOne({ title, newsAuthor, image, newsCategory, newsDetails, newsUploadDate})
            .then(result => {
                res.send(result.insertedCount > 0);
            })

    })
    //get politics news
    app.get('/getNewsDetails', (req, res) => {
        newsCollection.find()
            .toArray((err, result) => {
                res.send(result)
            })
    })
    //read with id
    app.get('/singleNewsDetails/:_id', (req, res) => {
        newsCollection.find({ _id: ObjectId(req.params._id) })
            .toArray((err, document) => {
                res.send(document[0])
            })
    })
    //post admin 
    app.post('/addAdmin', (req, res) => {
        const adminEmail = req.body;
        adminCollection.insertOne(adminEmail)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
});



app.listen(port, () => {
    console.log(`App listen at http://localhost:${port}`)
})

