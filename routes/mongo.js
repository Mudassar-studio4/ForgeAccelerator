
const express = require('express');
let router = express.Router();
const mongodb = require('mongodb');
let MongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/";
router.get('/insert', async(req,res) => {
  var myobj=req.query;
  MongoClient.connect(url,function(err,db){
    if (err) throw err;
    var dbo = db.db("mdl");
    dbo.collection("master").insertOne(myobj ,function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });
});

module.exports = router;
