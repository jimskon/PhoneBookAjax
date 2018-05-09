
const util = require('util')
var mysql = require('mysql');
var http = require('http');
var fs = require('fs');
var urlp = require('url');

var con = mysql.createConnection({
    host: "localhost",
    user: "skon",
    password: "PhilanderChase",
    database: "skon"
});
con.connect(function(err) {
    	if (err) throw err;
});

// Set up the Web server
var server = http.createServer(function(req, res) {
    var url = req.url;
    if (url.startsWith("/message")) {
	ajaxHandle(req,res);
	return;
    }
    
  // If no path, get the index.html
  if (url == "/") url = "/phoneApp.html";
  // get the file extension (needed for Content-Type)
  var ext = url.split('.').pop();
    console.log(url + "  :  " + ext);
  // convert file type to correct Content-Type
  var memeType = 'text/html'; // default
  switch (ext) {
    case 'css':
      memeType = 'text/css';
      break;
    case 'png':
      memeType = 'text/png';
      break;
    case 'jpg':
      memeType = 'text/jpeg';
      break;
    case 'js':
      memeType = 'application/javascript';
      break;
  }
  // Send the requested file
  fs.readFile('.' + url, 'utf-8', function(error, content) {
  res.setHeader("Content-Type", memeType);
  res.end(content);
  });
});
function ajaxHandle(req, res) {
    var data= urlp.parse(req.url,true);
    // route to ajax handler
    console.log('Client Command:'+data.query.operation);
    if (data.query.operation == 'Last') {
      query = "SELECT * FROM PhoneBook WHERE Last like '%"+data.query.searchText+"%'";
      sendQueryResults(query, res);
    } else if (data.query.operation == 'First') {
      query = "SELECT * FROM PhoneBook WHERE First like '%"+data.query.searchText+"%'";
      sendQueryResults(query, res);
    } else if (data.query.operation == 'Type') {
      query = "SELECT * FROM PhoneBook WHERE Type like '%"+data.query.searchText+"%'";
      sendQueryResults(query, res);
    } else if (data.query.operation == 'New') {
      query = "INSERT INTO PhoneBook(First, Last, Phone, Type) VALUES ('"+data.query.First+"','"+data.query.Last+"','"+data.query.Phone+"','"+data.query.Type+"')";
      AddRow(query, res);
    } else if (data.query.operation == 'Update') {
      query = "UPDATE PhoneBook SET First='"+data.query.First+"', Last='"+data.query.Last+"', Phone='"+data.query.Phone+"', Type='"+data.query.Type+"' WHERE RecNum='"+data.query.RecNum+"'";
      UpdateRow(query, res);
    } else if (data.query.operation == 'Delete') {
      query = "DELETE FROM PhoneBook WHERE RecNum='"+data.query.RecNum+"'";
      DeleteRow(query, res);
    }
}


// Perform search, send results to caller
function sendQueryResults(query,res) {
    console.log(query);
    con.query(query, function (err, result, fields) {
		if (err) throw err;
		var results = [];
		Object.keys(result).forEach(function(key) {
			var row = result[key];
			results.push(row);
			//console.log(row.First+" "+row.Last+", Phone:"+row.Phone+"  ["+row.Type+"]");	    	
		});
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({
    		operation: 'rows',
    		rows: results
    	}));
    });
}

// Add record
function AddRow(query,res) {
	console.log(query);
    con.query(query, function (err, result, fields) {
		if (err) throw err;
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({
    		operation: 'Add',
    		Status: "Row Added"
    	}));
	});
}
// Delete record
function DeleteRow(query,res) {
	console.log(query);
    con.query(query, function (err, result, fields) {
		if (err) throw err;
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({
    		operation: 'delete',
    		Status: "Row Deleted"
    	}));
    });
}

// update record
function UpdateRow(query,res) {
	console.log(query);
    con.query(query, function (err, result, fields) {
		if (err) throw err;
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({
    		operation: 'update',
    		Status: "Record Updated"
    	}));
    });
}
//Everyone must use own port > 8000
server.listen(8081);
