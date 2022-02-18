//import modules
const exp = require('express')
const { ObjectID } = require('mongodb')
var path = require("path");

//create an express js instance
const app = exp()

//config express js
app.use(exp.json())
const port = process.env.PORT || 3000
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Headers", "*");
    res.setHeader('Access-Control-Allow-Origin', '*');

    next()
})

//Connect to mongodb
const MongoClient = require('mongodb').MongoClient
let db
MongoClient.connect('mongodb+srv://user223:Blackboy7@cluster0.xust5.mongodb.net/test ', (err, client) => {
    db = client.db('web-store')
})

//middleware to handle images 
app.get('/collection/lessons/img', (req, res, next) => {
    var imagePath = path.resolve(__dirname, "img"); 
    app.use("/img", express.static(imagePath));
})

//display a message or root path to show that API is working
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., collection/messages')
})

//get collection
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})

//retrieve all the objects from collection
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})

//posting new data to the collection
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => { 
        if (e) return next(e)    
        res.send(results.ops) 
    })
})

//update object
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update(
        { _id: new ObjectID(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (e, result) => {
            if (e) return next(e)
            res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' })
        }
    )
})


//delete object
app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
        { _id: ObjectID(req.params.id) },
        (e, result) => {
            if (e) return next(e)
            res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' })
        }
    )
})

//start server
app.listen(port, () => {
    console.log('Express js server runnning on localhost:3000')
})
