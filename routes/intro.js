//** intro - login, register router **//
module.exports = function(app){
  var express = require('express');
  var router = express.Router();

  //mysql module
  var mysql = require('mysql');
  var conn = mysql.createConnection({
    host      : 'localhost',
    user      : 'root',
    port      :  3308,
    password  : '123147',
    database  : 'smart_sns'
  });
  conn.connect();

  var fileName = "";
  // file system module
  var fs = require('fs');
  // file upload module
  var multer = require('multer');
  // resize image module
  var gm = require('gm');
  // set file path & file name
  var _storage = multer.diskStorage(
    {
    destination: function(req, file, cb){
      cb(null, 'public/profile_image');
    },
    filename: function(req, file, cb){
      console.log('into multer function :::');
      fileName =file.originalname;
      console.log('original name' + fileName);
      cb(null, fileName);
    }
  });


  router.post('/login', function(req, res){
    console.log('# post/login');
    console.log(req.body);
    var query = 'select * from user where user_id = ? and user_pw = ?';
    conn.query(query, [req.body.user_id, req.body.user_pw], function(err, rows){
      if(err){
        console.log(err);
        res.status(500).send();           // status code 500 : 내부 서버 오류 (여기서 db오류)
      }else{
          if(rows[0]){
            console.log('-> login OK');
            res.status(200).send(JSON.stringify(rows[0]));
          }else{
            console.log(req.body.user_id +", " + req.body.user_pw);
            console.log('-> login failure');
            res.status(401).send();         // status code 401 : 권한없음
          }
      }
    });

  });


  router.post('/regist', function(req, res){
    console.log('# post/regist');
    console.log('regist request body : '+req.body);
    var upload = multer({storage: _storage}).single('profile_image');
    upload(req, res, function(err){
      if(err){
        console.log(err);
      }
      else {
        console.log('-> save the profile image!!');
        gm('./public/profile_image/'+fileName).resize(460, null).write('./public/profile_image/'+fileName, function(err){
                                          // resize : 920 -> 460
          if(err){
            console.log(err);
          }else{
            console.log('-> profile image resize success!');
            var query = 'insert into user (user_id, user_pw, user_name, user_age, user_gender,'+
            'user_interest_bighash1, user_interest_bighash2, user_interest_bighash3, user_profile_url) values (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            conn.query(query, [req.body.id, req.body.pw, req.body.name, req.body.user_age,
              req.body.gender, req.body.bighash1, req.body.bighash2, req.body.bighash3,
              fileName], function(err, rows){
              if(err){
                console.log('-> '+err);
                res.status(505).send();
              }else{
                console.log('-> regist OK');
                res.status(200).send();
              }
            });
          }
        });
      }
    });
  });

return router;
};
