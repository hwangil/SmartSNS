module.exports = function(app){
  var express = require('express');
  var router = express.Router();

  var mime = require('mime');
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

  /**
  * prefetch로 원본이미지 받기
  */
  router.post('/original/:content_url', function(req, res){
    console.log('# post/prefetch/original/:'+req.params.content_url);
    // var thumb_content_url = req.params.thumb_content_url; // 썸네일 이미지 저장 경로
    var thumb_content_url = req.params.content_url; // 썸네일 이미지 저장 경로
    var thumb_locate = 'thumb_';
    // var thumb_locate = 'thumbnail_contents/thumb_';
    var origin_content_url = 'original_contents/'+thumb_content_url.substring(thumb_locate.length);    //원본 이미지 저장경로
    console.log('-> thumbnail path : '+thumb_content_url);
    console.log('-> original path : '+origin_content_url);

    // var file = fs.readFileSync('public/' + origin_content_url, 'binary');
    var fileName = origin_content_url.substring(origin_content_url.lastIndexOf('/')+1);
    var stats = fs.statSync('public/'+origin_content_url);
    var fileSizeInBytes = stats.size
    var range = req.headers.range;
    var start = 0;
    if(range != null){
          start = range;
    }

    console.log('range : ' + req.headers.range);
    console.log('file size : ' + fileSizeInBytes);

    // console.log(lastModified());
    // console.log('fileName : ' + fileName);
    // res.setHeader('Content-Length', file.length);
    // res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
    // res.setHeader('Content-type', mime.lookup(file));
    // res.status(200);
    // res.statusMessage = 'this is test';
    // response.statusCode = 200;
    // res.write(file, 'binary');
    // res.end("hi");
    // res.download('c:/users/ccs/server/sns_test/public/' + origin_content_url, fileName);
// #1
  //   fs.readFile('public/'+origin_content_url, function (err, content) {
  //       if (err) {
  //           res.writeHead(400, {'Content-type':'text/html'});
  //           console.log(err);
  //           res.end("No such file");
  //       } else {
  //           //specify Content will be an attachment
  //           // res.setHeader('Content-disposition', 'attachment; filename='+ origin_content_url);
  //           // console.log('mime.lookup(content) : ' + mime.lookup(content));
  //           // res.writeHead(200, {'Content-type':'multipart/formed-data'});
  //           console.log('file length : '+content.length);
  //
  //           res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
  //           res.setHeader('Content-type', 'multipart/formed-data');
  //           res.setHeader('Content-Length', content.length);
  //           // res.setHeader('Last-Modified', )
  //           // console.log(content);
  //           res.statusCode = 200;
  //           res.statusMessage = "Current password does not match";
  //           res.write(content);
  //           res.end();
  //
  //
  //       }
  //   });
  // });

// #2

      var buf = new Buffer(fileSizeInBytes - start);
      // buf[fileSizeInBytes - start + 1] = -1;
      var fd = fs.openSync('public/'+origin_content_url, 'r');
      var length  = (fileSizeInBytes - start);
      if(start !== 0)
        fs.readSync(fd, buf, 0, fileSizeInBytes - start, start-1);
      else {
        fs.readSync(fd, buf, 0, fileSizeInBytes - start, start);
      }
      fs.closeSync(fd);
      res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
      res.setHeader('Content-Length', length);
      res.setHeader('content-type', ' image/jpeg');
      // res.setHeader("Content-Range", "bytes " + start + "-" + fileSizeInBytes + "/" + (fileSizeInBytes - start + 1));
      res.status(200);
      res.statusMessage = 'content-length :: ' + length;
      // console.log(buf);
      res.end(buf);
      // res.send();
      //  (fd, buf, 0, end - start, start) 자세히 안살펴봄
      console.log(fileName + 'download completed');
    });
// #3
// var readStream = fs.createReadStream('public/'+origin_content_url);
//
//   // This will wait until we know the readable stream is actually valid before piping
//   readStream.on('open', function () {
//     // This just pipes the read stream to the response object (which goes to the client)
//     readStream.pipe(res);
//   });


  router.get('/increase_total', function(req, res){
    console.log('# get/increase_total');
    var query = 'insert into total_count(id, count) values(1, 1) on duplicate key update count = count +1';
    conn.query(query, function(err, rows){
      if(err){
        msg = err;
        console.log(msg);
        res.status(505).send();
      }else{
        res.status(202).send();
      }
    })
  });
  router.get('/hit', function(req, res){
    console.log('# get/prefetch/hit ');
    var user_no = req.query.user_no;
    var hit = req.query.hit;
    var query = '';
    console.log('boolean test : ' + typeof(hit));
    if(hit === 'true'){
      query = 'insert into accuracy(user_no, hit) values(?, 1) on duplicate key update hit = hit +1';
    }else{
      query = 'insert into accuracy(user_no, fail) values(?, 1) on duplicate key update fail = fail +1';
    }

    conn.query(query, [user_no], function(err, rows, fields){
      if(err){
        msg = err;
        console.log(msg);
        res.status(505).send();
      }else{
        console.log('-> hit precessing OK');
        res.status(200).send();
      }
    })
  })

// ** download the prefetch list      ---- 'thumbnail_contents/' 제거해주기
  router.get('/list/:user_no', function(req, res){
    console.log('# get/prefetch/list/' + req.params.user_no);
    var user_no = req.params.user_no;
    var current_page = req.query.current_page;
    var totalContentCount =  req.query.totalContentCount;
    console.log('프리패칭 리스트 Current_Page : ' + current_page);
    console.log('프리패칭 총 컨텐츠 ' + req.query.totalContentCount);
    var big1, big2, big3, big4, big5;
    var small1, small2, small3, small4, small5;
    var count1, count2, count3, count4, count5;
    var favorite_user1_count, favorite_user2_count;
    var favorite_user1, favorite_user2;
    var query = 'select bighash_no1, bighash_no2, bighash_no3, bighash_no4, bighash_no5, smallhash_no1, smallhash_no2, smallhash_no3, smallhash_no4, smallhash_no5, count_no1, count_no2, count_no3, count_no4, count_no5, count1, count2, favorite_user1, favorite_user2 from user_favorite_hash where user_no = ?';
    conn.query(query,[user_no], function(err, rows){
      if(err)
        console.log(err);
      else{
        if(rows[0]){
          big1 = rows[0].bighash_no1;     big2 = rows[0].bighash_no2;     big3 = rows[0].bighash_no3;     big4 = rows[0].bighash_no4;   big5 = rows[0].bighash_no5;
          small1 = rows[0].smallhash_no1; small2 = rows[0].smallhash_no2; small3 = rows[0].smallhash_no3; small4 = rows[0].smallhash_no4;   small5 = rows[0].smallhash_no5;
          count1 = rows[0].count_no1; count2 = rows[0].count_no2; count3 = rows[0].count_no3; count4 = rows[0].count_no4; count5 = rows[0].count_no5;
          favorite_user1_count = rows[0].count1; favorite_user2_count = rows[0].count2; favorite_user1 = rows[0].favorite_user1; favorite_user2 = rows[0].favorite_user2;
          // 최근에 들어온 컨텐츠의 해쉬태그 정보들을 가지고 와서 얼마나 일치하는지 확인해준다. 그러면 각 컨텐츠에 점수가 나오게 되고 그 점수에 따라 위 5개만 해주면됨.

          var map = new Object();
          // content_no, hit
          // upload에서의 content_no를 가져옴. upload 정보를 바탕으로 upload_small테이블에 있는 정보들을 가져옴.
          // 조건은 해쉬들이 일치하는것. hit에 의해 내림차순으로 정렬되게.
          // currentpage를 이용해서 limit문 사용
          if(current_page*15 < totalContentCount){
            query = 'select s.content_no, l.bighash_no, m.smallhash_no, user_no from (select * from content order by content_no desc limit ?, ?) as s left join ch_upload as l on s.content_no = l.content_no left join ch_upload_small as m on s.content_no = m.content_no order by s.content_no;';
            conn.query(query,[(current_page-1)*15, 15], function(err, no_rows){
              if(err){
                console.log(err);
              }
              else{
                // 데이터 다 받아 왔으니까... 우선 hashmap 초기화 시켜주자
                var content_no = 0;
                var bighash_no = 0;
                var smallhash_no = 0;
                var temp_user_no = -1;
                var add = 1;
                console.log('#Prefetching List Recommendation Information# ');
                console.log('User no : ' + user_no + ', most favorite user no : ' + favorite_user1 + ', secondest favorite user no : ' + favorite_user2 );
                console.log('most favorite user count : ' + favorite_user1_count + ", secondest favorite user count : " + favorite_user2_count );
                for(var i=0; i<no_rows.length; i++){
                  content_no = no_rows[i].content_no;
                  bighash_no = no_rows[i].bighash_no;
                  smallhash_no = no_rows[i].smallhash_no;
                  if(!map[content_no]){
                    map[content_no] = 0;
                  }

                  if(temp_user_no != no_rows[i].user_no){
                    // must add when it's first but after first, compare two vars
                    temp_user_no = no_rows[i].user_no;
                    if(favorite_user1 == temp_user_no){
                      console.log('favorite user1 match!!' + ' user_no, favorite_user1 , content_no ' + user_no + ", " + temp_user_no + ", " + content_no);
                      map[content_no] = map[content_no] + favorite_user1_count;
                    }
                    if(favorite_user2 == temp_user_no){
                      console.log('favorite user2 match!!' + ' user_no, favorite_user2, content_no ' + user_no + ", " + temp_user_no+ ", " + content_no);
                      map[content_no] = map[content_no] + favorite_user2_count;
                    }
                  }


                  // console.log(big1 + " , " + bighash_no + " : " + small1 + " , " + smallhash_no);
                  if(big1 == bighash_no && small1 == smallhash_no){
                    console.log(content_no + " 1번째 태그 일치!");
                    map[content_no] = map[content_no] + count1;
                  }else if(big2 == bighash_no && small2 == smallhash_no){
                    console.log(content_no + " 2번째 태그 일치!");
                    map[content_no] = map[content_no] + count2;
                  }else if(big3 == bighash_no && small3 == smallhash_no){
                    map[content_no] = map[content_no] + count3;
                    console.log(content_no + " 3번째 태그 일치! " + count3);
                  }else if(big4 == bighash_no && small4 == smallhash_no){
                    console.log(content_no + " 4번째 태그 일치!");
                    map[content_no] = map[content_no] + count4;
                  }else if(big5 == bighash_no && small5 == smallhash_no){
                    console.log(content_no + " 5번째 태그 일치!");
                    map[content_no] = map[content_no] + count5;
                  }
                }
                console.log(map);
                // map에 content_no를 key로 해서 값들이 들어가 있으니까 정렬하고 위에서 5개만 추천      해주자..!
                // 소팅
                var sorted = Object.keys(map).sort(function(a,b){return map[b]-map[a]});
                console.log("정렬완료");
                console.log(sorted);

                query = 'select content_url from content where content_no = ? or content_no = ? or content_no = ?;';
                conn.query(query, [sorted[0], sorted[1], sorted[2]], function(err, url_rows){
                    if(err){
                      console.log(err);
                    }
                    else{

                        res.status(200).send(url_rows);
                    }
                });

              }

            });
          }else{
            res.status(200).send();
          }

        }
        else{
          res.status(505).send();
          console.log('dont exists user info');
        }

      }
    });


  });

  return router;
};

Map = function(){
 this.map = new Object();
};
Map.prototype = {
    put : function(key, value){
        this.map[key] = value;
    },
    get : function(key){
        return this.map[key];
    },
    containsKey : function(key){
     return key in this.map;
    },
    containsValue : function(value){
     for(var prop in this.map){
      if(this.map[prop] == value) return true;
     }
     return false;
    },
    isEmpty : function(key){
     return (this.size() == 0);
    },
    clear : function(){
     for(var prop in this.map){
      delete this.map[prop];
     }
    },
    remove : function(key){
     delete this.map[key];
    },
    keys : function(){
        var keys = new Array();
        for(var prop in this.map){
            keys.push(prop);
        }
        return keys;
    },
    values : function(){
     var values = new Array();
        for(var prop in this.map){
         values.push(this.map[prop]);
        }
        return values;
    },
    size : function(){
      var count = 0;
      for (var prop in this.map) {
        count++;
      }
      return count;
    }
};
