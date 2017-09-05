// ** download router **//
module.exports = function(app){
  var express = require('express');
  var router = express.Router();

  var mysql = require('mysql');
  var conn = mysql.createConnection({   // db연결
    host      : 'localhost',
    user      : 'root',
    port      :  3308,
    password  : '123147',
    database  : 'smart_sns'
  });

  conn.connect();

  router.get('/like', function(req, res){
      console.log('# get/count/like');
      //req.query

      var user_no = req.query.user_no;
      var content_info = JSON.parse(req.query.content_info);
      var smallHashList = content_info.small_hash_list;
      var bigHashList = content_info.hash_list;


      var query = '';

      for(var i=0; i<bigHashList.length; i++){
        for(var j=0; j<smallHashList.length; j++){
          // 두개 다 구했으니까 이 두개를 이용해서 insert or update 해주자.
          var bigHash_no = bigHashList[i].bighash_no;
          var smallHash_no = smallHashList[j].smallhash_no;
          countLikeIncrease(bigHash_no, smallHash_no, user_no);

        }
      }
        res.status(200).send();
  });

  router.get('/comment', function(req, res){
      console.log('# get/count/comment');
      //req.query

      var user_no = req.query.user_no;
      var content_info = JSON.parse(req.query.content_info);
      var smallHashList = content_info.small_hash_list;
      var bigHashList = content_info.hash_list;


      var query = '';

      for(var i=0; i<bigHashList.length; i++){
        for(var j=0; j<smallHashList.length; j++){
          // 두개 다 구했으니까 이 두개를 이용해서 insert or update 해주자.
          var bigHash_no = bigHashList[i].bighash_no;
          var smallHash_no = smallHashList[j].smallhash_no;
          countCommentIncrease(bigHash_no, smallHash_no, user_no);

        }
      }
        res.status(200).send();
  });

  router.get('/smallhash_surf', function(req, res){
      console.log('# get/count/smallhash_surf');

      var user_no = req.query.user_no;
      var smallHash_no = req.query.smallhash;
      var bigHashList = JSON.parse(req.query.bighash_list);

      for(var i=0; i<bigHashList.length; i++){
          // 두개 다 구했으니까 이 두개를 이용해서 insert or update 해주자.
          var bigHash_no = bigHashList[i];
          console.log(bigHash_no);
          countSmallSurfIncrease(bigHash_no, smallHash_no, user_no);

      }
        res.status(200).send();
  });

  router.get('/bighash_surf', function(req, res){
      console.log('# get/count/bighash_surf');

      var user_no = req.query.user_no;
      var bigHash_no = req.query.bighash;
      console.log('-> user_no : ' + user_no + ", bigHash_no : " + bigHash_no);
      countBigSurfIncrease(bigHash_no, user_no);

      res.status(200).send();
  });

  router.get('/search', function(req, res){     // searched_hash
      console.log('# get/count/search');

      var user_no = req.query.user_no;
      var searched_hash = req.query.searched_hash;
      console.log('-> searched_hash : ' + searched_hash);
      countSearchIncrease(searched_hash, user_no);

      res.status(200).send();
  });




  var countCommentIncrease = function(bighash_no, smallhash_no, user){
    var query_search = 'select uh_comment_no from uh_comment where bighash_no = ? and smallhash_no = ? and user_no = ?';
    conn.query(query_search, [bighash_no, smallhash_no, user], function(err, rows3){
      if(err){
        msg = err;
      }else{
        // select 성공했으면, 존재하면
        if(rows3[0]){
          var query_update = 'update uh_comment set count = count + 1 where uh_comment_no = ?';
          conn.query(query_update, [rows3[0].uh_comment_no], function(err, row, fields){
            if(err){
              msg = err;
              console.log(err);
            }else{
              // 1 올리기 성공!
              msg = 'add 1 count in uh_comment success!!';
              console.log(msg);
            }
          })

          }else{
            // 데이터 삽입
            var query_success = 'insert into uh_comment (user_no, bighash_no, smallhash_no) values (?, ?, ?)';
            conn.query(query_success, [user, bighash_no, smallhash_no], function(err, rows, fields){
              if(err){
                msg = err;
                console.log(msg);
              }else{
                // 새로운 데이터 넣기 성공!!
                msg = 'insert new uh_comment success!!';
                console.log(msg);
              }
            })
          }


      }
    });
  }

  var countLikeIncrease = function(bighash_no, smallhash_no, user){
    var query_search = 'select uh_like_no from uh_like where bighash_no = ? and smallhash_no = ? and user_no = ?';
    conn.query(query_search, [bighash_no, smallhash_no, user], function(err, rows3){
      if(err){
        msg = err;
      }else{
        // select 성공했으면, 존재하면
        if(rows3[0]){
          var query_update = 'update uh_like set count = count + 1 where uh_like_no = ?';
          conn.query(query_update, [rows3[0].uh_like_no], function(err, row, fields){
            if(err){
              msg = err;
              console.log(err);
            }else{
              // 1 올리기 성공!
              msg = 'add 1 count in uh_like success!!';
              console.log(msg);
            }
          })

          }else{
            // 데이터 삽입
            var query_success = 'insert into uh_like (user_no, bighash_no, smallhash_no) values (?, ?, ?)';
            conn.query(query_success, [user, bighash_no, smallhash_no], function(err, rows, fields){
              if(err){
                msg = err;
                console.log(msg);
              }else{
                // 새로운 데이터 넣기 성공!!
                msg = 'insert new hashmap_click success!!';
                console.log(msg);
              }
            })
          }


      }
    });
  }

  var countSmallSurfIncrease = function(bighash_no, smallhash_no, user){
    var query_search = 'select uh_surf_no from uh_surf where bighash_no = ? and smallhash_no = ? and user_no = ?';
    conn.query(query_search, [bighash_no, smallhash_no, user], function(err, rows3){
      if(err){
        console.log(err);
      }else{
        // select 성공했으면, 존재하면
        if(rows3[0]){
          var query_update = 'update uh_surf set count = count + 1 where uh_surf_no = ?';
          conn.query(query_update, [rows3[0].uh_surf_no], function(err, row){
            if(err){
              console.log(err);
            }else{
              // 1 올리기 성공!
              msg = 'add 1 count in uh_surf success!!';
              console.log(msg);
            }
          })

          }else{
            // 데이터 삽입
            var query_success = 'insert into uh_surf (user_no, bighash_no, smallhash_no) values (?, ?, ?)';
            conn.query(query_success, [user, bighash_no, smallhash_no], function(err, rows){
              if(err){
                console.log(err);
              }else{
                // 새로운 데이터 넣기 성공!!
                msg = 'insert new uh_surf count success!!';
                console.log(msg);
              }
            })
          }
      }
    });
  }
  var countBigSurfIncrease = function(bighash_no, user){
    var query_search = 'select uh_surf_no from uh_surf where bighash_no = ? and user_no = ? and smallhash_no is null';
    conn.query(query_search, [bighash_no, user], function(err, rows3){
      if(err){
        console.log(err);
      }else{
        // select 성공했으면, 존재하면
        if(rows3[0]){
          var query_update = 'update uh_surf set count = count + 1 where uh_surf_no = ?';
          conn.query(query_update, [rows3[0].uh_surf_no], function(err, row){
            if(err){
              console.log(err);
            }else{
              // 1 올리기 성공!
              msg = 'add 1 count in uh_surf success!!';
              console.log(msg);
            }
          })

          }else{
            // 데이터 삽입
            var query_success = 'insert into uh_surf (user_no, bighash_no) values (?, ?)';
            conn.query(query_success, [user, bighash_no], function(err, rows){
              if(err){
                console.log(err);
              }else{
                // 새로운 데이터 넣기 성공!!
                msg = 'insert new uh_surf count success!!';
                console.log(msg);
              }
            })
          }
      }
    });
  }

  var countSearchIncrease = function(searched_hash, user){
    var bighash_no, smallhash_no;
    var query_bighash_search = 'select bighash_no from bighash where bighash_name = ?';
    conn.query(query_bighash_search, [searched_hash], function(err, rows){
      if(err){
        console.log(err);
      }else{
        if(rows[0]){    // bighash_no 있다.
          bighash_no = rows[0].bighash_no;
          conn.query('select smallhash_no from smallhash where smallhash_name = ?', [searched_hash], function(err, rows2){
            if(err){console.log(err); }
            else{
              if(rows2[0]){      // smallhash_no 있다.
                smallhash_no = rows2[0].smallhash_no;
                conn.query('select uh_search_no from uh_search where bighash_no = ? or smallhash_no = ?', [bighash_no, smallhash_no], function(err, rows3){
                  if(err){}
                  else{
                    if(rows3[0]){
                        //update count + 1
                        conn.query('update uh_search set count = count + 1 where uh_search_no = ?', [rows3[0].uh_search_no], function(err, rows3){});
                    }else{
                        conn.query('insert into uh_search (user_no, bighash_no, smallhash_no) values (?, ?, ?)', [user, bighash_no, smallhash_no], function(err, row){ console.log(err);});
                    }
                  }
                });

              }else{            // smallhash_no 없다.
                conn.query('select uh_search_no from uh_search where bighash_no = ? ', [bighash_no], function(err, rows3){
                  if(err){}
                  else{
                    if(rows3[0]){
                        //update count + 1
                        conn.query('update uh_search set count = count + 1 where uh_search_no = ?', [rows3[0].uh_search_no], function(err, rows3){});
                    }else{
                        conn.query('insert into uh_search (user_no, bighash_no) values (?, ?)', [user, bighash_no], function(err, row){ console.log(err);});
                    }
                  }
                });

              }
            }
          });
        }else{      // bighash_no 없다.
          conn.query('select smallhash_no from smallhash where smallhash_name = ?', [searched_hash], function(err, rows2){
            if(err){
              console.log(err);
            }else{
              if(rows2[0]){
                smallhash_no = rows2[0].smallhash_no;
                conn.query('select uh_search_no from uh_search where smallhash_no = ? ', [smallhash_no], function(err, rows3){
                  if(err){}
                  else{
                    if(rows3[0]){
                        //update count + 1
                        conn.query('update uh_search set count = count + 1 where uh_search_no = ?', [rows3[0].uh_search_no], function(err, rows3){});
                    }else{
                        conn.query('insert into uh_search (user_no, smallhash_no) values (?, ?)', [user, smallhash_no], function(err, row){ console.log(err);});
                    }
                  }
                });
              }else{

              }
            }
          });
        }
      }
    });
  }








  return router;
};
