// ** download router **//
module.exports = function(app){
  var express = require('express');
  var router = express.Router();

  var mysql = require('mysql');
  var conn = mysql.createConnection({   // db연결
    host      : 'localhost',
    user      : 'root',
    password  : '123147',
    database  : 'smart_sns'
  });

  conn.connect();

//** download thumbnail image
  router.get('/thumbnail', function(req, res){
    console.log('# get/download/thumbanail');
    var msg;
    conn.query('select * from content order by content_no desc', function(err, rows, fields){
      if(err){
        msg = err;
        res.status(505).send(msg);
      }else{
        makeFileHavingHash(rows, res);  // file과 같이 작성된 hash tag정보 json형태로 합치기
      }

    });
  });


//** download thumbnail image having specific hash
router.get('/thumbnail/search/:hash_name', function(req,res){
  console.log('# get/download/thumbnail_hash');
  var hash_name = req.params.hash_name;
  console.log(hash_name);
  var query = 'select * from content where content_no in'+
    '(select content_no from ch_upload where bighash_no = (select bighash_no from bighash where bighash_name = ?)) order by content_no desc ';
  conn.query(query, [hash_name], function(err, rows){
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
      var json_msg = {'content_url' : origin_content_url};

      res.status(200).send(JSON.stringify(json_msg));

  });

//** download hashes
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

/*
** my function
**/

//** file 과 그에 따른 hash 정보 꺼내어 json 형태로 만들기
var makeFileHavingHash = function(rows ,res){
  conn.query('select A.content_no, B.bighash_name from ch_upload as A, bighash as B'+
  ' where A.bighash_no = B.bighash_no', function(err,hash_rows){
    // console.log(rows);
    // console.log(hash_rows);

    // rows[0].push(hash_rows[0]);
    // console.log(JSON.stringify(rows[0]));

    var msg = '[';
    for(var i=0; i<rows.length; i++){

      msg += '{\"content_no\": \"' + rows[i].content_no +
             '\", \"content_desc\": \"' + rows[i].content_desc +
             '\", \"content_url\": \"' + rows[i].content_url +
             '\", \"content_host\": \"' + rows[i].user_no +
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
          msg += '{\"bighash_name\": \"' + hash_rows[j].bighash_name + '\"}';

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


  });
};

  return router;
};
