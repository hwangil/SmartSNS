//** intro - login, register router **//
module.exports = function(app){
  var express = require('express');
  var router = express.Router();

  //mysql module
  var mysql = require('mysql');
  var conn = mysql.createConnection({
    host      : 'localhost',
    user      : 'root',
    password  : '123147',
    database  : 'smart_sns'
  });
  conn.connect();

  router.post('/login', function(req, res){
    console.log('# post/login');
    var query = 'select user_no, user_name, user_gender, user_profile_url from user where user_id = ? and user_pw = ?';
    conn.query(query, [req.body.user_id, req.body.user_pw], function(err, rows){
      if(err){
        console.log(err);
        res.status(500).send();           // status code 500 : 내부 서버 오류 (여기서 db오류)
      }else{
          if(rows[0]){
            console.log('-> login OK');
            res.status(200).send(JSON.stringify(rows[0]));
          }else{
            console.log('-> login failure');
            res.status(401).send();         // status code 401 : 권한없음
          }
      }
    });

  });

  router.post('/regist', function(req, res){
    console.log('# post/regist');
  
    var query = 'insert into user (user_id, user_pw, user_name, user_age, user_gender,'+
    'user_interest_bighash1, user_interest_bighash2, user_interest_bighash3, user_profile_url) values (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    conn.query(query, [req.body.user_id, req.body.user_pw, req.body.user_name, req.body.user_age,
      req.body.user_gender, req.body.user_interest_bighash1, req.body.user_interest_bighash2, req.body.user_interest_bighash3,
      req.body.user_profile_url], function(err, rows){
      if(err){
        console.log('-> '+err);
        res.status(505).send();
      }else{
        console.log('-> regist OK');
        res.status(200).send();
      }
    });
  });

return router;
};
