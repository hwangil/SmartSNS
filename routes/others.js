//** event - like, ... **//
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

  router.get('/like', function(req, res){
      console.log('#GET others/like');
      console.log(req.query);

      //** 누가 좋아요 했는지 관계 테이블에 저장
      var dbQuery2 = 'insert into uc_like (user_no, content_no) values (?, ?)';
      conn.query(dbQuery2, [req.query.user_no, req.query.content_no], function(err){
        if(err)
          console.log('insert into uc_like error : ' + err);
      });

      //** content의 좋아요 개수 증가
      var dbQuery = 'update content set content_like_count = content_like_count+1 where content_no = ?';
      conn.query(dbQuery, [req.query.content_no], function(err){
        if(err){
          console.log('update count error : ' + err);
        }else{
            // response!
            conn.query('select content_no, content_like_count from content where content_no = ?',
          [req.query.content_no], function(err, rows){
              if(err){
                res.status(500).send();
              }else {
                console.log('-> like event response success ' + JSON.stringify(rows[0]));
                res.status(200).send(JSON.stringify(rows[0]));
              }
          });
        }
      });
  });

  router.get('/unlike', function(req, res){
    console.log('#GET others/unlike');
    console.log(req.query);

    //** 누가 좋아요취소 했는지 관계 테이블에 제거
    var dbQuery2 = 'delete from uc_like where user_no = ? and content_no = ?';
    conn.query(dbQuery2, [req.query.user_no, req.query.content_no], function(err){
      if(err)
        console.log('delete from uc_like error : ' + err);
    });

    //** content의 좋아요 개수 감소
    var dbQuery = 'update content set content_like_count = content_like_count-1 where content_no = ?';
    conn.query(dbQuery, [req.query.content_no], function(err){
      if(err){
        console.log('update count error : ' + err);
      }else{
          // response!
          conn.query('select content_no, content_like_count from content where content_no = ?',
        [req.query.content_no], function(err, rows){
            if(err){
              res.status(500).send();
            }else {
              console.log('-> unlike event response success ' + JSON.stringify(rows[0]));
              res.status(200).send(JSON.stringify(rows[0]));
            }
        });
      }
    });

  });





  return router;
};
