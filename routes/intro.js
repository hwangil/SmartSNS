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
    database  : 'sns_test'
  });
  conn.connect();

  router.post('/login', function(req, res){
    console.log('# post/login');
    var query = 'select user_id, user_name, user_gender from user_info where user_id = ? and user_pw = ?';
    conn.query(query, [req.body.id, req.body.pw], function(err, rows){
      if(err){
        console.log(err);
        res.status(505).send();
      }else{
          if(rows[0]){
            console.log('-> login OK');
            res.status(200).send(JSON.stringify(rows[0]));
          }else{
            res.status(404).send();
            console.log('-> login failure');
          }
      }
    });

  });

  router.post('/regist', function(req, res){
    console.log('# post/regist');
    var query = 'insert into user_info (user_id, user_pw, user_name, user_gender) values (?, ?, ?, ?)';
    conn.query(query, [req.body.id, req.body.pw, req.body.name, req.body.gender], function(err, rows){
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
