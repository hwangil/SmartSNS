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


//** like event
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
            conn.query('select content_no, content_like_count,  if( EXISTS(select * from uc_like where uc_like.user_no = ? and uc_like.content_no = ?), true, false ) as content_like_flag from content where content_no = ?',
          [req.query.user_no, req.query.content_no, req.query.content_no], function(err, rows){
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

//** unlike event
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
          conn.query('select content_no, content_like_count, if( EXISTS(select * from uc_like where uc_like.user_no = ? and uc_like.content_no = ?), true, false ) as content_like_flag from content where content_no = ?',
        [req.query.user_no, req.query.content_no, req.query.content_no], function(err, rows){
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

  //** get comment info event
  router.get('/download_comment', function(req, res){
    console.log('#GET others/download_comment');
    var dbQuery = 'select user.user_no, user.user_profile_url, user.user_id, uc_comment.uc_comment_name from uc_comment, user '+
    'where uc_comment.user_no = user.user_no and uc_comment.content_no = ?';
    conn.query(dbQuery, [req.query.content_no], function(err, rows){
      if(err){
        console.log(err);
      }else{
        // console.log(JSON.stringify(rows));
        res.status(200).send(rows);
      }
    });
  });

  //** add_comment event
  router.get('/add_comment', function(req, res){
    //query로 받자
    console.log('#GET others/add_comment');
    var dbQuery = 'insert into uc_comment (user_no, content_no, uc_comment_name) values (?, ?, ?)';
    conn.query(dbQuery, [req.query.user_no, req.query.content_no, req.query.uc_comment_name], function(err){
      if(err)
        console.log(err);
      else{
        dbQuery = 'select user.user_no, user.user_profile_url, user.user_id, uc_comment.uc_comment_name from uc_comment, user '+
        'where uc_comment.user_no = user.user_no and uc_comment.content_no = ?';
        conn.query(dbQuery, [req.query.content_no], function(err, rows){
          if(err){
            console.log(err);
          }else{
            dbQuery = 'update content set content_comment_count = content_comment_count+1 where content_no = ?';
            conn.query(dbQuery, [req.query.content_no], function(err, rows){
              if(err){
                console.log(err);
              }else{
                console.log('update count numbet');
              }
            });
            // console.log(JSON.stringify(rows));
            res.status(200).send(rows);
          }
        });

      }
    });


  });





  return router;
};
