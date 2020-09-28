$(document).ready(function () {
  // in case we want to load this app with a model pre-loaded
  var urn = getParameterByName('urn');
  if (urn !== null && urn !== '')
    launchViewer(urn);
});

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
    console.log(results);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var viewer;

// @urn the model to show
// @viewablesId which viewables to show, applies to BIM 360 Plans folder
function launchViewer(urn, projectid, documentnumber) {
  $('#forge123').show();
  document.getElementById("ProjectID").value = projectid;
  document.getElementById("URN").value = urn;
  document.getElementById("DocumentNumber").value = documentnumber;
}

function insertmdl() {
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/";
  
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mdl");
    var myobj = { Project_ID: projectid, URN: urn, Document:documentnumber };
    dbo.collection("master").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });
}