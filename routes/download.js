// ** download router **//
module.exports = function(app){
  var express = require('express');
  var router = express.Router();
  var fs = require('fs');
  var mysql = require('mysql');
  var conn = mysql.createConnection({   // db연결
    host      : 'localhost',
    user      : 'root',
    port      :  3308,
    password  : '123147',
    database  : 'smart_sns'
  });

  conn.connect();

//** download thumbnail image
  router.get('/thumbnail', function(req, res){
    console.log('# get/download/thumbanail');
    var msg;

    var user_no = req.query.user_no;
    var current_page = req.query.current_page;

    var date = new Date;
    date = date = date = Math.floor(date.getTime()/1000);
    console.log("현재 페이지 : " + current_page);
    console.log("현재 timestamp : " + date);

    // var query = 'insert into latest_thumbnail(user_no, date) values (?, ?) on duplicate key update user_no = ?';
    // conn.query(query, [user_no, date, user_no], function(err, rows, fields){
    //   if(err){
    //     msg = err;
    //     console.log(msg);
    //   }else{
    //     // contents를 업로드한 user의 user_no과 user_name 검색
    //
    //   }
    // })

    conn.query('select content_no, content_url, content_width, content_height,'+
    'content_desc, content_date, content_like_count, content_comment_count, content.user_no, '+
    'user.user_name, user.user_id, user.user_profile_url, if( EXISTS(select * from uc_like where uc_like.user_no = ? and uc_like.content_no = content.content_no), true, false ) as content_like_flag '+
    'from content, user where content.user_no = user.user_no order by content_no desc limit ?, ?',[req.query.user_no, (current_page-1)*15, 15] ,function(err, rows, fields){
      if(err){
        msg = err;
        console.log(err);
        res.status(505).send(msg);
      }else{
        makeFileHavingHash(rows, res);  // file과 같이 작성된 hash tag정보 json형태로 합치기
      }
    });

  });

//** download thumbnail image (특정 user)
  router.get('/user_thumbnail', function(req, res){
    console.log('# get/download/user_thumbnail');

    var msg;

    // modified by Moonki
    var user_no = req.query.user_no;
    var host_no = req.query.host_no;
    // 해당 데이터가 있으면 count 1 올려주고, 해당 데이터가 없으면 insert! 즉 select를 먼저..!

    var query_search = 'select uu_other_click_no from uu_other_click where user_no = ? and host_no = ?';

    conn.query(query_search, [user_no, host_no], function(err, rows){
      if(err){
        msg = err;
        console.log(err);
      }else{
        if(rows[0]){
          // 결과가 있다면
          var query_update = 'update uu_other_click set count = count + 1 where user_no = ? and host_no = ?';
          conn.query(query_update, [user_no, host_no], function(err, rows){
            if(err){
              msg == err;
              console.log(err);
            }else{
              // 1 올리기 성공!
              msg == 'add 1 count in othertimeline success!!';
              console.log(err);
            }
          })

        }else{
          // 결과가 없다면 insert

          var query_success = 'insert into uu_other_click ( user_no, host_no, count) values ( ?, ?, 1)';
          conn.query(query_success, [user_no, host_no], function(err, rows){
            if(err){
              msg == err;
              console.log(err);
            }else{
              // 새로운 데이터 넣기 성공!!
              msg == 'insert new hash_map count success!!';
              console.log(msg);
            }
          })
        }
      }
    })



    // contents를 업로드한 user의 user_no과 user_name 검색
    conn.query('select content_no, content_url, content_width, content_height, content_desc, content_date, '+
    'content_like_count, content_comment_count, content.user_no, user.user_name, user.user_id, user.user_profile_url, if( EXISTS(select * from uc_like where uc_like.user_no = ? and uc_like.content_no = content.content_no), true, false ) as content_like_flag from content, user where content.user_no = user.user_no and content.user_no = ? order by content_no desc', [user_no, host_no], function(err, rows, fields){
      if(err){
        msg = err;
        console.log(err);
        res.status(505).send(msg);
      }else{
        makeFileHavingHash(rows, res);  // file과 같이 작성된 hash tag정보 json형태로 합치기
      }

    });
  });

//** download thumbnail image having specific hash      // 2. 누른사람 체크하기 위해 query로 바구고
router.get('/thumbnail/search/:hash_name', function(req,res){
  console.log('# get/download/thumbnail_hash');
  var hash_name = req.params.hash_name;
  console.log(hash_name);
  //select content_no, content_url, content_width, content_height, content_desc, content_date, content_like_count, content_comment_count, content.user_no, user.user_name, user.user_profile_url from content, user where content.user_no = user.user_no
  var query = 'select content_no, content_url, content_width, content_height, content_desc, content_date, content_like_count, content_comment_count, content.user_no, user.user_name, user.user_id, user.user_profile_url, if( EXISTS(select * from uc_like where uc_like.user_no = ? and uc_like.content_no = content.content_no), true, false ) as content_like_flag from content, user where content.user_no = user.user_no and (content_no in'+
    '(select content_no from ch_upload where bighash_no in (select bighash_no from bighash where bighash_name like ?))'+
    'OR content_no in (select content_no from ch_upload_small where smallhash_no in (select smallhash_no from smallhash where smallhash_name like ?))) order by content_no desc ';
  conn.query(query, [req.query.user_no, "%"+hash_name+"%", "%"+hash_name+"%"], function(err, rows){
    if(err){
      console.log(err);
    }else{

      makeFileHavingHash(rows, res);    // file과 같이 작성된 hash tag정보 json형태로 합치기
    }
  });
});

//** download original image
  router.get('/original/:thumb_content_url', function(req, res){
      console.log('# get/download/original');
      var thumb_content_url = req.params.thumb_content_url; // 썸네일 이미지 저장 경로
      var thumb_locate = 'thumbnail_contents/thumb_';
      var origin_content_url = 'original_contents/'+thumb_content_url.substring(thumb_locate.length);    //원본 이미지 저장경로
      console.log('-> thumbnail path : '+thumb_content_url);
      console.log('-> original path : '+origin_content_url);

      // original image size도 보내주기


      // var file = fs.readFileSync('public/' + origin_content_url, 'binary');
      var fileName = origin_content_url.substring(origin_content_url.lastIndexOf('/')+1);
      var stats = fs.statSync('public/'+origin_content_url);
      var fileSizeInBytes = stats.size


      var json_msg = {'content_url' : origin_content_url, 'content_size' : fileSizeInBytes};

      // modified by Moonki
      // 원본이미지를 넘겨줄때 path만 넘겨주는 것이 아니고 user_no, bighash_no, smallhash_no를 알아야한다..

      var user_no = req.query.user_no;
      var bigHash = JSON.parse(req.query.big_hash_info);
      var smallHash = JSON.parse(req.query.small_hash_info);

      console.log('bighash_list : ' + bigHash);
      console.log('smallhash_list : ' + smallHash);

      var query = '';

      for(var i=0; i<bigHash.length; i++){
        for(var j=0; j<smallHash.length; j++){
          // 두개 다 구했으니까 이 두개를 이용해서 insert or update 해주자.
          var bigHash_no = bigHash[i];
          var smallHash_no = smallHash[j];
          countHashIncrease(bigHash_no, smallHash_no, user_no);

        }
      }
      res.status(200).send(JSON.stringify(json_msg));

  });

//** download bighashes
 router.get('/bighash', function(req, res){
   console.log('# get/download/bigHash');
   var query = 'select * from bigHash';
   conn.query(query, function(err, rows){
     if(err){
       console.log(err);
     }else{
       console.log('success select hash');
       res.status(200).send(JSON.stringify(rows));
     }
   });

 });

 //** download smallhashes
 router.get('/smallhash/:smallhash', function(req, res){
   console.log("# get/smallhash/" + req.params.smallhash);
 });

/*
** my function
**/

//** 해쉬태그 카운트 증가
var countHashIncrease = function(bighash_no, smallhash_no, user){
  var query_search = 'select uh_click_no from uh_click where bighash_no = ? and smallhash_no = ? and user_no = ?';
  conn.query(query_search, [bighash_no, smallhash_no, user], function(err, rows3){
    if(err){
      msg = err;
    }else{
      // select 성공했으면, 존재하면
      if(rows3[0]){
        var query_update = 'update uh_click set count = count + 1 where uh_click_no = ?';
        conn.query(query_update, [rows3[0].uh_click_no], function(err, row, fields){
          if(err){
            msg = err;
            console.log(err);
          }else{
            // 1 올리기 성공!
            msg = 'add 1 count in uc_click success!!';
            console.log(msg);
          }
        })

        }else{
          // 데이터 삽입
          var query_success = 'insert into uh_click (user_no, bighash_no, smallhash_no) values (?, ?, ?)';
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
  })

}


//** file 과 그에 따른 hash 정보 꺼내어 json 형태로 만들기
var makeFileHavingHash = function(rows ,res){
  conn.query('select A.content_no, B.bighash_no, B.bighash_name from ch_upload as A, bighash as B'+
  ' where A.bighash_no = B.bighash_no', function(err,hash_rows){
    conn.query('select A.content_no, B.smallhash_no, B.smallhash_name from ch_upload_small as A, smallhash as B'+
    ' where A.smallhash_no = B.smallhash_no', function(err, smallhash_rows){

      var msg = '[';
      for(var i=0; i<rows.length; i++){

        msg += '{\"content_no\": \"' + rows[i].content_no +
               '\", \"content_desc\": \"' + rows[i].content_desc +
               '\", \"content_url\": \"' + rows[i].content_url +
                '\", \"content_like_count\": \"' + rows[i].content_like_count +
                '\", \"content_like_flag\": \"' + rows[i].content_like_flag +
                 '\", \"content_comment_count\": \"' + rows[i].content_comment_count +
               '\", \"content_host_no\": \"' + rows[i].user_no +
               '\", \"content_host\": \"' + rows[i].user_name +
               '\", \"content_host_id\": \"' + rows[i].user_id +
               '\", \"content_host_profile_url\": \"' + rows[i].user_profile_url +
               '\", \"content_date\": \"' + rows[i].content_date +
               '\", \"content_width\": \"' + rows[i].content_width +
               '\", \"content_height\": \"' + rows[i].content_height +'\"';
        var count = 0;
        for(var j=0; j<hash_rows.length; j++){

          if(rows[i].content_no === hash_rows[j].content_no){
            if(count === 0){
              count ++;
              msg+= ', \"hash_list\":[';
            }else{
              msg+=', ';
            }
            msg += '{\"bighash_no\": \"' + hash_rows[j].bighash_no + '\", \"bighash_name\": \"' + hash_rows[j].bighash_name + '\"}';

          }
        }
        if(count === 1)
          msg += ']';
        count = 0;
        for(var j=0; j<smallhash_rows.length; j++){

          if(rows[i].content_no === smallhash_rows[j].content_no){
            if(count === 0){
              count ++;
              msg+= ', \"small_hash_list\":[';
            }else{
              msg+=', ';
            }
            msg += '{\"smallhash_no\": \"' + smallhash_rows[j].smallhash_no + '\", \"smallhash_name\": \"' + smallhash_rows[j].smallhash_name + '\"}';

          }
        }
        if(count === 1)
          msg += ']';
        if(i === rows.length-1)
          msg +='}';
        else
          msg+='}, ';

      }
      msg += ']';
        // console.log(msg);
        // console.log(JSON.stringify(rows));
        res.status(200).send(msg);

    })
    // console.log(rows);
    // console.log(hash_rows);

    // rows[0].push(hash_rows[0]);
    // console.log(JSON.stringify(rows[0]));

    });


};


//** download the user info who likes contents
router.get('/like_user/:content_no', function(req, res){
  console.log('#GET /download/like_user');
  var query = 'select user_no, user_id, user_name, user_profile_url from user '+
      'where user_no in (select user_no from uc_like where content_no = ?)';

  conn.query(query, [req.params.content_no], function(err, rows){
    if(err)
      console.log('select user who likes the content error : ' + err);
    else{
      console.log('select user who likes the content success');
      console.log(JSON.stringify(rows));
      res.status(200).send(JSON.stringify(rows));
    }
  });

});

//** download the user who searched
router.get('/search_user', function(req, res){
  console.log('#GET /download/search_user');
  console.log(req.query);
  var query = 'select user_no, user_id, user_name, user_profile_url, user_interest_bighash1, user_interest_bighash2, user_interest_bighash3 from user '+
  'where user_id like ? or user_name like ? ';
// search_name
  conn.query(query, ['%'+req.query.search_name+'%', '%'+req.query.search_name+'%'], function(err, rows){
    if(err){
      console.log('search user fail : ' + err);
    }else{
      console.log('search user success');
      console.log(JSON.stringify(rows));
      res.status(200).send(rows);

    }
  });
});

router.get('/total_count', function(req, res){
  console.log('#GET /download/total_count');
  var query = 'select count from total_count';
  conn.query(query, function(err, rows){
    if(err){s
      console.log('get total_count fail : '+ err);
    }else{
      console.log(rows);
      console.log(rows[0].count);
      res.status(200).send(JSON.stringify(rows));
    }
  });
});







  return router;
};
