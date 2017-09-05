var http=require('http');
var express = require('express');
var fs = require('fs');

var app = express();

http.createServer(app).listen(3002, function(){
  console.log("Express server listening on port " + 3002);
});

app.post('/', function (req, res) {
    res.writeHead(200, {'Content-Type' : 'text/html'});
    res.write('<h3>Welcome</h3>');
    res.write('<a href="/login">Please login</a>');
    res.end();
});
