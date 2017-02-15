// Smart SNS beta.ver

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());       //** 이게 있어야 post로 보낸 객체를 받을 수 있따.
app.use(express.static('public'));

var intro = require('./routes/intro')(app);
var download = require('./routes/download')(app);
var upload = require('./routes/upload')(app);
var others = require('./routes/others')(app);

app.use('/intro', intro);        // route intro - register, login
app.use('/download', download);  // route downlaod
app.use('/upload', upload);      // route upload
app.use('/others', others);      // route others

app.listen(3001, function(){
  console.log('Connected 3001 port');
});
