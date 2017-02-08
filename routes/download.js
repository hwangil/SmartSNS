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
        // makeFileHavingHash(rows, res);  // file과 같이 작성된 hash tag정보 json형태로 합치기
      }

    });
  });


//** download thumbnail image having specific hash
router.get('/thumbnail_hash/:hash_text', function(req,res){
  console.log('# get/download/thumbnail_hash');
  var hash_text = req.params.hash_text;
  console.log(hash_text);
  var query = 'select * from uploaded_file where file_no in'+
    '(select file_no from relation_file_hash where hash_no = (select hash_no from big_hash where hash_text = ?)) order by file_no desc ';
  conn.query(query, [hash_text], function(err, rows){
    if(err){
      console.log(err);
    }else{

      makeFileHavingHash(rows, res);    // file과 같이 작성된 hash tag정보 json형태로 합치기
    }
  });
});

//** download original image
  router.get('/original/:thumb_image_path', function(req, res){
      console.log('# get/download/original');
      var thumb_image_path = req.params.thumb_image_path; // 썸네일 이미지 저장 경로
      var thumb_locate = 'thumbnail/thumb_';
      var origin_image_path = 'original/'+thumb_image_path.substring(thumb_locate.length);    //원본 이미지 저장경로
      console.log('-> thumbnail path : '+thumb_image_path);
      console.log('-> original path : '+origin_image_path);
      var json_msg = {'file_path' : origin_image_path};

      res.status(200).send(JSON.stringify(json_msg));

  });

//** download hashes
 router.get('/big_hash', function(req, res){
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
  conn.query('select A.file_no, B.hash_text from relation_file_hash as A, big_hash as B'+
  ' where A.hash_no = B.hash_no', function(err,hash_rows){
    // console.log(rows);
    // console.log(hash_rows);

    // rows[0].push(hash_rows[0]);
    // console.log(JSON.stringify(rows[0]));

    var msg = '[';
    for(var i=0; i<rows.length; i++){

      msg += '{\"file_no\": \"' + rows[i].file_no +
             '\", \"file_name\": \"' + rows[i].file_name +
             '\", \"file_path\": \"' + rows[i].file_path +
             '\", \"file_host\": \"' + rows[i].file_host +
             '\", \"file_date\": \"' + rows[i].file_date +
             '\", \"file_width\": \"' + rows[i].file_width +
             '\", \"file_height\": \"' + rows[i].file_height +'\"';
      var count = 0;
      for(var j=0; j<hash_rows.length; j++){

        if(rows[i].file_no === hash_rows[j].file_no){
          if(count === 0){
            count ++;
            msg+= ', \"hash_list\":[';
          }else{
            msg+=', ';
          }
          msg += '{\"hash_text\": \"' + hash_rows[j].hash_text + '\"}';

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
