
// ** upload router **//
module.exports = function(app){
  var date;                           // 시간 정보 저장
  var express = require('express');
  var router = express.Router();
  // mysql module
  var mysql = require('mysql');
  var conn = mysql.createConnection({
    host      : 'localhost',
    user      : 'root',
    password  : '123147',
    database  : 'smart_sns'
  });
  conn.connect();

  // file system module
  var fs = require('fs');
  // file upload module
  var multer = require('multer');
  // resize image module
  var gm = require('gm');
  // set file path & file name
  var _storage = multer.diskStorage({
    destination: function(req, file, cb){
      cb(null, 'public/original_contents');
    },
    filename: function(req, file, cb){
      date = new Date().toISOString().slice(0, 19).replace('T', '-').replace(/:/g, '-');
      console.log('original name date : '+date);
      var fileName = '['+date +']'+file.originalname;
      console.log('original name' + fileName);
      cb(null, fileName);
    }
  });


//** upload single image
  router.post('/single',  function(req, res){
    console.log('# post upload/single');
    var upload = multer({storage: _storage}).single('picture');
    upload(req, res, function(err){
      if(err){
        console.log(err);
      }
      else {
        // file Name + user + time?? -> file구분하는 정책 생각! (익명이냐 친구기반이냐 에따라) -> 그냥 아이디 + 시간 등등
          var fileName = req.file.originalname;
          console.log('date : '+ date);
          fileName =  '['+date +']'+ fileName;
          // //** file이 존재하는지 확인
          // if(fs.existsSync('./public/original/'+fileName)){
          //   console.log('The file is already exists!');
          //   return;
          // }
        //** 썸네일 이미지 만들기
        // gm('./public/'+fileName).thumb(100,100, './public/thumbnail/thumb_'+fileName, function(err){
        //   if(err){
        //     console.log(err);
        //   }else{
        //     console.log('thumbnail success!');
        //   }
        // });

        //** image resizing
        var width = 920;
        var height;
        gm('./public/original/'+fileName).resize(460, null).write('./public/thumbnail/thumb_'+fileName, function(err){
                                          // resize : 920 -> 460
          if(err){
            console.log(err);
          }else{
            console.log('-> resize success!');

            // db에 경로저장
            // console.log(req.file);
            gm('./public/thumbnail/thumb_'+fileName).size(function(err, size){
              if(err){
                console.log(err);
              }else{
                var ratio = size.height/size.width;
                height = ratio * width;     //** thumbnail로 저장된 이미지 widhtm height 저장!
                // console.log(width +", " + height);
                var msg;

                // into uploaded_file table
                var query = 'insert into uploaded_file (file_name, file_path, file_host, file_date, file_width, file_height) values (?, ?, ?, ?, ?, ?)';
                var locate = 'thumbnail/thumb_';    // thumbnail 이미지 저장된 위치 지정
                console.log(req.body);
                conn.query(query, [req.body.description, locate+fileName, req.body.host, date, width, height] ,function(err, rows, fields){
                  if(err){
                    msg = err;
                    res.send(msg);
                  }else{
                    msg = 'success';
                    console.log('-> into uploaded_file table success');
                    // into relation_file_hash table
                    var hash = JSON.parse(req.body.hash);

                    for(var i=0; i<hash.length; i++){
                      console.log('-> into loop');
                      var query2 = 'insert into relation_file_hash (file_no, hash_no) values('+
                      '(SELECT file_no FROM sns_test.uploaded_file WHERE file_host = ? ORDER BY file_no DESC limit 1), ?)';
                      conn.query(query2, [req.body.host, hash[i]], function(err, rows){
                        if(err){
                          console.log(err);
                        }else{
                          console.log('-> into relation_file_hash success!');
                          res.status(200).send();
                        }
                      });
                    }
                  }
                });

                // conn.query(query, [req.body.host, ])

              }
            });

          }
        });
      }
    });
  });

  return router;
};
