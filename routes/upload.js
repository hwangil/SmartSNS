
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
    port      :  3308,
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
      date = new Date();
      date = new Date().toISOString().slice(0, 19).replace('T', '-').replace(/:/g, '-');
      // date = date = Math.floor(date.getTime()/1000);
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
        console.log(req.body);
        // file Name = time + user
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
        gm('./public/original_contents/'+fileName).resize(460, null).write('./public/thumbnail_contents/thumb_'+fileName, function(err){
                                          // resize : 920 -> 460
          if(err){
            console.log(err);
          }else{
            console.log('-> resize success!');

            // db에 경로저장
            // console.log(req.file);
            gm('./public/thumbnail_contents/thumb_'+fileName).size(function(err, size){
              if(err){
                console.log(err);
              }else{
                var ratio = size.height/size.width;
                height = ratio * width;     //** thumbnail로 저장된 이미지 widhtm height 저장!
                // console.log(width +", " + height);
                var msg;

                // into uploaded_file table
                var query = 'insert into content (content_name, content_url, content_desc, user_no, content_date, content_width, content_height) values (?, ?, ?, ?, ?, ?, ?)';
                var locate = 'thumbnail_contents/thumb_';    // thumbnail 이미지 저장된 위치 지정
                console.log(req.body);

                // modified by Moonki
                var user_no = Number(req.body.host);
                conn.query(query, [fileName, locate+fileName, req.body.description, user_no, date, width, height] ,function(err, rows, fields){
                  if(err){
                    msg = err;
                    console.log(err);
                    res.send(msg);
                  }else{
                    msg = 'success';
                    console.log('-> into uploaded_file table success');

                    // content table totalcount increase
                    conn.query('update total_count set total_count.count = total_count.count+1 ', function(err){
                      if(err)
                        console.log('total count increase fail :: ' + err);
                      else{
                        console.log('total count increase succeess  ');
                      }
                    });
                    // into relation_file_hash table
                    var bighash = JSON.parse(req.body.bighash);       // bighash는 no로
                    var smallhash = JSON.parse(req.body.smallhash);  // smallhash는 name으로
                    console.log(bighash);
                    console.log(smallhash);


                    for(var i=0; i<bighash.length; i++){
                      console.log('-> into loop');
                      // bighash count 증가
                      var query1 = 'update bighash set bighash_count = bighash_count+1 where bighash_no = ?';
                      conn.query(query1, [bighash[i]], function(err, rows){
                        if(err)
                          console.log(err);
                        else
                          console.log('increase the bighash count success');
                      });

                      //** content bighash 관계 테이블에 저장
                        var query3 = 'insert into ch_upload (content_no, bighash_no) values('+
                        '(SELECT content_no FROM smart_sns.content WHERE user_no = ? ORDER BY content_no DESC limit 1), ?)';
                        conn.query(query3, [req.body.host, bighash[i]], function(err, rows){
                          if(err){
                            console.log(err);
                          }else{
                            console.log('-> into relation_file_hash success!');
                            // res.status(200).send();
                          }
                        });
                    }
                    // small hash가 있을때
                    if(smallhash.length !== 0){

                        for(var i=0; i<smallhash.length; i++){
                            insertSmallhashInfo(req, res, user_no, bighash, smallhash, i);

                        }



                    }else{
                      // small hash가 없을때는 bighash_no 만으로 올려준다
                      // modified by Moonki



                    }

                  res.status(200).send();
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
  var countUploadIncrease = function(req, res, user_no, bighash, smallhash_no, bighash_index){


      var query_search = 'select uh_upload_no from uh_upload where bighash_no = ? and smallhash_no = ?';
      conn.query(query_search, [bighash[bighash_index], smallhash_no], function(err, rows, fields){
        if(err){
          console.log(err)
        }else{

          // select 성공했으면, 존재하면
          if(rows[0]){
            console.log('insertSmallHashInfo : uh_upload_no 에 존재 -> 카운트 증가');
            var query_update = 'update uh_upload set count = count+1 where bighash_no = ? and smallhash_no = ?';
            conn.query(query_update, [bighash[bighash_index], smallhash_no], function(err, rows){
              if(err){
                console.log(err);
              }else{
                // 1 올리기 성공!
                console.log('add 1 count success!!');
              }
            })

          }else{
            // 데이터 삽입
            console.log('insertSmallHashInfo : uh_upload_no 에 존재X -> 데이터 삽입');
            var query_success = 'insert into uh_upload (user_no, bighash_no, smallhash_no, count) values (?, ?, ?, 1)';
            conn.query(query_success, [user_no, bighash[bighash_index], smallhash_no], function(err, rows, fields){
              if(err){
                console.log(err);
              }else{
                // 새로운 데이터 넣기 성공!!
                msg == 'insert new hashmap_upload success!!';
                console.log(msg);
              }
            })
          }
        }
      });



  }
  var insertSmallhashInfo = function(req, res, user_no, bighash, smallhash, small_index){
    // smallhash_no를 smallhash_name으로 검색 함 for문을 통해 smallhash 갯수만큼 실행됨 그럼 이거 한번 실행 될 때 마다 하나의 smallhash_no를 구할 수 있다는 뜻이므로 이 안에서는 bighash 크기 만큼의 루프만 추가로 더 돌면됨
    console.log('insertSmallHashInfo : start');
    var query2 = 'select smallhash_no from smallhash where smallhash_name = ? ';
    conn.query(query2, [smallhash[small_index]], function(err, rows){
      if(err){

      }else{
        if(rows[0]){      // 존재하면
          console.log('insertSmallHashInfo : small hash is exists');
          console.log('-> exists smallhash '+rows[0].smallhash_no);
          //** smallhash count 증가


          // modified by Moonki
          var smallhash_no = rows[0].smallhash_no;

          for(var j=0;j<bighash.length; j++){
            countUploadIncrease(req, res, user_no, bighash ,smallhash_no, j);
          }


          /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

          conn.query('update smallhash set smallhash_count = smallhash_count+1 where smallhash_no = ?', [smallhash_no], function(err, rows){
            if(err) console.log(err);
          });

          //** contents smallhash relation 저장
          var query3 = 'insert into ch_upload_small (content_no, smallhash_no) values('+
          '(SELECT content_no FROM smart_sns.content WHERE user_no = ? ORDER BY content_no DESC limit 1), ?)';
          conn.query(query3, [req.body.host, rows[0].smallhash_no], function(err, rows){
            if(err){
              console.log(err);
            }else{
              console.log('-> into relation_file_hash success when smallhash exists!');
              // res.status(200).send();
            }
          });

        }else{            // 존재하지 않으면 테이블 삽입
          console.log('insertSmallHashInfo : smallhash is not exists');
          console.log('-> Not exists smallhash ')
          console.log('->' + smallhash[small_index]);
          conn.query('insert into smallhash (smallhash_name) values(?)',[smallhash[small_index]], function(err, rows){
            if(err) console.log(err);
            else{

              //
              // uh_upload 삽입
              for(var i = 0; i < bighash.length; i++){
                    var query_success = 'insert into uh_upload (user_no, bighash_no, smallhash_no, count) values (?, ?, (SELECT smallhash_no FROM smart_sns.smallhash where smallhash_name = ?), 1)';
                    conn.query(query_success, [user_no, bighash[i], smallhash[small_index]], function(err, rows){
                      if(err){
                        console.log(err);
                      }else{

                        console.log('insertSmallHashInfo : uh_upload_no 에 존재X -> 데이터 삽입');
                        console.log('-> insert into uh_upload success');
                      }
                    });

              }

              // contents bighash smallhash relation 저장
              var query3 = 'insert into ch_upload_small (content_no, smallhash_no) values('+
              '(SELECT content_no FROM smart_sns.content WHERE user_no = ? ORDER BY content_no DESC limit 1), '+
              '(SELECT smallhash_no FROM smart_sns.smallhash where smallhash_name = ?))';
              conn.query(query3, [req.body.host, smallhash[small_index]], function(err, rows){
                if(err){
                  console.log(err);
                }else{
                  console.log('-> into relation_file_hash success when smallhash doesnt exist!!');
                  // res.status(200).send();
                }
              });


        ////////////////////////////////////////////////////////////////////////////////////////


            }
          });
        }
      }
  });
  };

  // bighash랑 smallhash 정보 바탕으로 count 올려줘야함

  return router;
};
