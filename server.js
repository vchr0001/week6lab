const express = require("express");
const mongodb = require("mongodb");
const bodyparser = require('body-parser');
// var ObjectID = require('mongodb').ObjectID;
//Configure Express
const app = express()
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static('images'));
app.use(express.static('views'));
app.use(express.static('css'));
app.use(bodyparser.urlencoded({
    extended: false
}));

app.listen(8080);
//Configure MongoDB
const MongoClient = mongodb.MongoClient;
// Connection URL
const url = "mongodb://localhost:27017/";
//reference to the database (i.e. collection)
let db;
//Connect to mongoDB server
MongoClient.connect(url, {
        useNewUrlParser: true
    },
    function (err, client) {
        if (err) {
            console.log("Err  ", err);
        } else {
            console.log("Connected successfully to server");
            db = client.db("Week6db");
        }
    });

//Insert new User
//GET request: send the page to the client
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});
//POST request: receive the details from the client and insert new document (i.e. object) to the collection (i.e. table)
app.post('/addnewtask', function (req, res) {
    let taskDetails = req.body;
    db.collection('tasks').insertOne({
        taskID : Math.floor(100000 + Math.random() * 900000),
        taskName: taskDetails.name,
        taskPIC: taskDetails.pic,
        taskDue: taskDetails.date,
        taskStatus: taskDetails.status,
        taskDesc: taskDetails.desc
    });
    res.redirect('/gettasks'); // redirect the client to list users page
});
//List all users
let viewPath = __dirname + '/views/';
//GET request: send the page to the client. Get the list of documents form the collections and send it to the rendering engine
app.get('/gettasks', function (req, res) {
    let query = {};
    db.collection('tasks').find(query).toArray(function (err, data) {
        res.render(viewPath + 'listtask.html', {
            taskDb: data
        });
    });
});
//Update user: 
//GET request: send the page to the client 
app.get('/updatetask', function (req, res) {
    res.sendFile(__dirname + '/views/updatetask.html');
});
//POST request: receive the details from the client and do the update
app.post('/updatetaskstatus', function (req, res) {
    let upTaskID = req.body;
    let filter = {
        taskID : parseInt(upTaskID.id)
        // _id: ObjectID(upTaskID.id)
    };
    let theUpdate = {
        $set: {taskStatus: upTaskID.statusnew}
    };
    db.collection('tasks').updateOne(filter, theUpdate);
    res.redirect('/gettasks'); // redirect the client to list users page
})
//Update User: 
//GET request: send the page to the client to enter the user's name
app.get('/deletetask', function (req, res) {
    res.sendFile(__dirname + '/views/deletetask.html');
});
//POST request: receive the user's name and do the delete operation 
app.post('/deletebyid', function (req, res) {
    let taskDetails = req.body;
    let filter = {
        taskID : parseInt(taskDetails.id)
        // _id: ObjectID(taskDetails.id)
    };
    db.collection('tasks').deleteOne(filter);
    res.redirect('/gettasks'); // redirect the client to list users page
});

app.get('/deletecompleted', function (req, res) {
    res.sendFile(__dirname + '/views/deletecompleted.html');
});

app.post('/deletecompleted', function (req, res) {
    let userrespond = req.body;
    if ( userrespond.respond === "yes") {
        db.collection('tasks').deleteMany({
            taskStatus: "Complete"
        });
        res.redirect('/gettasks'); // redirect the client to list users page
    }
    else {
        res.redirect('/gettasks');
    }
});