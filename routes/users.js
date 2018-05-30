var express = require('express');
var router = express.Router();
var user =require("../DAO/user");
var https = require('https');
var qs = require('querystring');
var path='F:/node/public/';
var crypto=require('crypto');
var md5=crypto.createHash("md5");

//qiniu
var Base64 = {

    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode: function(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }
}
var qiniuBucket={
    img:"oneyouxiimg",
    apk:"oneyouxiapk",
    base64:'onebase64'
    // img:"oneyouxitestimg",
    //  apk:"oneyouxitestapk"
};
var qiniu = require('qiniu');
var config = new qiniu.conf.Config();
var accessKey = 'Uusbv77fI10iNTVF3n7EZWbksckUrKYwUpAype4i';
var secretKey = 'dEDgtx_QEJxfs2GltCUVgDIqyqiR6tKjStQEnBVq';
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
// 空间对应的机房
config.zone = qiniu.zone.Zone_z2;
var bucketManager = new qiniu.rs.BucketManager(mac, config);

var cdnManager = new qiniu.cdn.CdnManager(mac)//cnd对象；

// var urlsToRefresh = [
//     'http://if-pbl.qiniudn.com/nodejs.png',
//     'http://if-pbl.qiniudn.com/qiniu.jpg'
// ];
//刷新链接，单次请求链接不可以超过100个，如果超过，请分批发送请求
// cdnManager.refreshUrls(urlsToRefresh, function(err, respBody, respInfo) {
//     if (err) {
//         throw err;
//     }
//     console.log(respInfo.statusCode);
//     if (respInfo.statusCode == 200) {
//         var jsonBody = JSON.parse(respBody);
//         console.log(jsonBody.code);
//         console.log(jsonBody.error);
//         console.log(jsonBody.requestId);
//         console.log(jsonBody.invalidUrls);
//         console.log(jsonBody.invalidDirs);
//         console.log(jsonBody.urlQuotaDay);
//         console.log(jsonBody.urlSurplusDay);
//         console.log(jsonBody.dirQuotaDay);
//         console.log(jsonBody.dirSurplusDay);
//     }
// });

function getUpToken(scope,key) {
    var options = {
        scope: scope+":"+key,
        returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(mac);
}
router.get('/getUptokenByMsg',function (req,res,next) {
    if(req.query.scope && req.query.key){
        if(req.query.scope=='img'){
            res.json({state:1,upToken:getUpToken(qiniuBucket.img,req.query.key)})
        }else if(req.query.scope=='base64'){
            res.json({state:1,upToken:getUpToken(qiniuBucket.base64,req.query.key),url:"http://upload-z2.qiniup.com/putb64/-1/key/"+Base64.encode(req.query.key)+'/mimeType/'+Base64.encode('octet-stream')})
        }
    }else {
        res.json({state:0})
    }

});

function isReverse(text){
    return text.split('').reverse().join('');
}
var verify={};
var date=new  Date();
Date.prototype.Format = function(formatStr)
{
    var str = formatStr;
    var Week = ['日','一','二','三','四','五','六'];

    str=str.replace(/yyyy|YYYY/,this.getFullYear());
    str=str.replace(/yy|YY/,(this.getYear() % 100)>9?(this.getYear() % 100).toString():'0' + (this.getYear() % 100));

    str=str.replace(/MM/,this.getMonth()>9?(this.getMonth()+1).toString():'0' + (this.getMonth()+1));
    str=str.replace(/M/g,this.getMonth());

    str=str.replace(/w|W/g,Week[this.getDay()]);

    str=str.replace(/dd|DD/,this.getDate()>9?this.getDate().toString():'0' + this.getDate());
    str=str.replace(/d|D/g,this.getDate());

    str=str.replace(/hh|HH/,this.getHours()>9?this.getHours().toString():'0' + this.getHours());
    str=str.replace(/h|H/g,this.getHours());
    str=str.replace(/mm/,this.getMinutes()>9?this.getMinutes().toString():'0' + this.getMinutes());
    str=str.replace(/m/g,this.getMinutes());

    str=str.replace(/ss|SS/,this.getSeconds()>9?this.getSeconds().toString():'0' + this.getSeconds());
    str=str.replace(/s|S/g,this.getSeconds());

    return str;
};

router.get('/list',function (req,res,next) {
    user.userList(function (result) {
        res.json(result);
    })
});
router.get('/getChannel',function (req,res,next) {
    // console.log(1);
    user.getChannel(function (result) {
        // console.log(result);
        result.length? res.json({state:1,channel:result}):res.json({state:0})
   })
});
router.get("/updateChannel",function (req,res,next) {
   user.updateChannel(req.query.channel,req.query.uid,function (result) {
       res.json({user:result})
   })
});


var signArr=
    [{day:1,type:0,value:100},{day:2,type:1,value:10},{day:3,type:0,value:200},{day:4,type:0,value:100},{day:5,type:0,value:100},{day:6,type:0,value:300},{day:7,type:1,value:20},{day:8,type:0,value:100},{day:9,type:0,value:150},{day:10,type:1,value:10},{day:11,type:0,value:100},{day:12,type:0,value:500},{day:13,type:0,value:100},{day:14,type:0,value:150},{day:15,type:0,value:100},{day:16,type:1,value:10},{day:17,type:0,value:100},{day:18,type:2,value:2},{day:19,type:0,value:50},{day:20,type:1,value:10},{day:21,type:0,value:100},{day:22,type:0,value:100},{day:23,type:0,value:100},{day:24,type:1,value:30},{day:25,type:0,value:200},{day:26,type:0,value:100},{day:27,type:0,value:150},{day:28,type:1,value:10},{day:29,type:0,value:100},{day:30,type:2,value:5}];
router.get("/sign",function (req,res,next) {
    if(req.query.id){
       var id= req.query.id;
        user.getSignById(id,function (result) {
            if(result.length){
                var sign=result[0];
                if(sign.new_sign != date.Format('yyyy-MM-dd')){
                    user.updateSign(id,sign.sign+1,date.Format('yyyy-MM-dd'),function (result) {
                        if(result.affectedRows){
                            var index=signArr[(sign.sign)%30];
                            switch (index.type){
                                case 0:
                                    user.selectUserIntegral(id,function (result) {
                                        user.updateUserIntegral(id,result[0].integral+index.value,function (result) {
                                            result.affectedRows?res.json({state:1}):res.json({state:0})
                                        })
                                    });break;
                                case 1:
                                    console.log(id);
                                    user.selectUserCoin(id,function (result) {

                                        user.updateUserCoin(id,result[0].coin+index.value,function (result) {
                                            result.affectedRows?res.json({state:1}):res.json({state:0})
                                        })
                                    });break;
                                case 2:

                                    var startTime=date.Format('yyyy-MM-dd');
                                    var endTime;
                                    var day = new Date(parseInt(startTime.split("-")[0]),parseInt(startTime.split("-")[1])+1,0);
//获取天数：
                                    var daycount = day.getDate();
                                    if(daycount<parseInt(startTime.split("-")[2])){
                                        endTime=startTime.split("-")[0]+"-"+((parseInt(startTime.split("-")[1])+1)>9?(parseInt(startTime.split("-")[1])+1):"0"+(parseInt(startTime.split("-")[1])+1))+"-"+daycount;
                                    }else {
                                        endTime=startTime.split("-")[0]+"-"+((parseInt(startTime.split("-")[1])+1)>9?(parseInt(startTime.split("-")[1])+1):"0"+(parseInt(startTime.split("-")[1])+1))+"-"+parseInt(startTime.split("-")[2])
                                    }
                                    user.addLottery(id,4,1,startTime,endTime,index.value,function (result) {
                                        result.insertId?res.json({state:1}):res.json({state:0})
                                    });
                                    break;
                            }
                        }else {
                            res.json({state:0})
                        }
                    })
                }else {
                    res.json({state:4})
                }
            }

        })
   }
});
router.get("/getLottery",function (req,res,next) {
    if(req.query.id){
        user.getLotteryByUid(req.query.id,function (result) {
            result.length?res.json({state:1,lottery:result}):res.json({state:0})
        })
    }
});
router.get("/getSign",function (req,res,next) {
    user.getSignById(req.query.id,function (result) {
        result.length?res.json({state:1,user:result[0]}):res.json({state:0})
    })
});


router.post('/login', function(req, res, next) {
    var password=req.body.password;
    var md5 = crypto.createHash('md5');
    md5.update(password);
    var sign = md5.digest('hex');
    sign=isReverse(sign);
    user.login(req.body.tel,sign,function (result) {
        res.json({state:result.length==0 ? 0 : 1,user:result[0]})
  })
});
router.get('/game/comment',function (req,res,next) {
    var data=req.query;
    user.getUserCommentLen(data.gameId,data.userId,function (count) {
        if(count[0].count<3){
            user.gameComment(data.userId,data.gameId,data.score,data.content,data.agree,date.Format('yyyy-MM-dd'),data.parentId,data.address,function (result) {
                if(result.insertId){
                    user.getGameCommentScoreById(data.gameId,function (result) {

                        if(result.length>0){
                            var len=result.length;
                            var allScore=0;
                            for(var i=0;i<len;i++){
                                allScore+=result[i].score;
                            }
                            // console.log((allScore / len).toFixed(1));
                            user.updateGameScore(data.gameId,(allScore / len).toFixed(1),function (result) {
                                result.affectedRows?res.json({state:1}):res.json({state:0})
                            })
                        }
                    })
                }
            })
        }else {
            res.json({state:4})
        }
    });

});
router.post('/reg',function (req,res,next) {
    res.json({s:1});
    return;
    var ver=req.body.verify;
    var tel=req.body.tel;
    var password=req.body.password;
    var md5 = crypto.createHash('md5');
    md5.update(password);
    var sign = md5.digest('hex');
    sign=isReverse(sign);
    if(ver&&tel&&sign){
        if(ver==verify[tel]){
            user.reg(tel,sign,date.Format('yyyy-MM-dd'),function (result) {
                result.insertId?user.updateOnlyidById(result.insertId,function () {}):"";
                res.json({state:result.insertId && 1 || result[0].id && 2 || 0,id:result.insertId||""})
            })
        }else {
            res.json({state:3});
        }
    }else {
        res.json({state:99});
    }
});
router.get('/verify',function (req,result,next) {
    var val= Math.floor(Math.random() * 900000)+100000;
    var apikey = 'f589b7ce8a38a90b9d8e2ce20e26c020';
// 手机号码，多个号码用逗号隔开
    var mobile = req.query.tel;
// 要发送的短信内容
    var text = '【one游戏平台】您的验证码是'+val;
// 查询账户信息https地址
    var get_user_info_uri = '/v2/user/get.json';
// 智能匹配模板发送https地址
    var sms_host = 'sms.yunpian.com';
    send_sms_uri = '/v2/sms/single_send.json';
// 指定模板发送接口https地址
//     query_user_info(get_user_info_uri,apikey);
    send_sms(send_sms_uri,apikey,mobile,text);
    // function query_user_info(uri,apikey){
    //     var post_data = {
    //         'apikey': apikey,
    //     };//这是需要提交的数据
    //     var content = qs.stringify(post_data);
    //     post(uri,content,sms_host);
    // }
    function send_sms(uri,apikey,mobile,text){
        var post_data = {
            'apikey': apikey,
            'mobile':mobile,
            'text':text,
        };//这是需要提交的数据
        var content = qs.stringify(post_data);
        post(uri,content,sms_host);
    }

    function post(uri,content,host,next){

        var options = {
            hostname: host,
            port: 443,
            path: uri,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        };
        var req = https.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                chunk=JSON.parse(chunk);
                var state;
                switch (chunk.code){
                    case 0:verify[mobile]=val;
                        state=1;
                        var x=mobile;
                        setTimeout(function () {
                            verify[x]=null;
                            // console.log(verify);
                        },600000);break;
                    case 33: state=0;
                            console.log('请求过于频繁');break;
                    default :state=0;
                        console.log(chunk);break;
                }
              result.json({state:state});
            });
        });
        req.write(content);
        return  req.end();
        // return next()
    }
});
router.post('/updatePassword',function (req,res) {
    if(req.body.tel && req.body.password,req.body.verify){
        var ver=req.body.verify;
        var tel=req.body.tel;
        var password=req.body.password;
        var md5 = crypto.createHash('md5');
        md5.update(password);
        var sign = md5.digest('hex');
        sign=isReverse(sign);
        user.updatePassword()
        if(verify[tel]==ver){
            user.updatePassword(tel,sign,function (result) {
                result.affectedRows ? res.json({state:1}) : res.json({state:0})
            })
        }else {
            res.json({state:3});
        }
    }else {
        res.json({state:99})
    }
});

router.get("/lottery",function (req,res) {
    var uid=req.query.id;
    user.selectUserIntegral(uid,function (result) {
        // console.log(result);
        if(result.length){
            if(result[0].integral>=500){
                user.updateUserIntegral(uid,(parseInt(result[0].integral)-500),function (result) {
                    // console.log(result);
                    if(result.affectedRows){
                        var arr=[1,2,3,4,5,6,7,8];
                        var num=Math.random();
                        if(num>=0.3){
                            user.selectUserIntegral(uid,function (result) {
                                if(result.length){
                                    user.updateUserIntegral(uid,(result[0].integral+50),function (result) {
                                        result.affectedRows?res.json({state:1,num:6}):res.json({state:0})//50积分
                                    })
                                }
                            })
                        }else if(num>=0.1&&num<0.3){
                            user.selectUserIntegral(uid,function (result) {
                                if(result.length){
                                    user.updateUserIntegral(uid,(result[0].integral+100),function (result) {
                                        result.affectedRows?res.json({state:1,num:8}):res.json({state:0})//100积分
                                    })
                                }
                            })
                        }else if(num>=0.0403&&num<0.1){
                            user.selectUserIntegral(uid,function (result) {
                                if(result.length){
                                    user.updateUserIntegral(uid,(result[0].integral+500),function (result) {
                                        result.affectedRows?res.json({state:1,num:7}):res.json({state:0})//再抽一次
                                    })
                                }
                            })
                        }else if(num>=0.0103&&num<0.0403){
                            user.selectUserIntegral(uid,function (result) {
                                if(result.length){
                                    user.updateUserIntegral(uid,(result[0].integral+500),function (result) {
                                        result.affectedRows?res.json({state:1,num:4}):res.json({state:0})//500积分
                                    })
                                }
                            })
                        }else if(num>=0.0000&&num<0.0103){
                            user.selectUserCoin(uid,function (result) {
                                if(result.length){
                                    user.updateUserCoin(uid,(result[0].coin+5),function (result) {
                                        result.affectedRows?res.json({state:1,num:4}):res.json({state:0})//5币
                                    })
                                }
                            })
                        }else if(num>=0.0002&&num<0.0000){
                            user.updateLottery(uid,1,function (result) {
                                result.affectedRows?res.json({state:1,num:2}):res.json({state:0})
                            })
                        }else if(num>=0.0001&&num<0.0000){
                            user.updateLottery(uid,2,function (result) {
                                result.affectedRows?res.json({state:1,num:5}):res.json({state:0})//腾讯会员
                            })
                        }else if(num>=0&&num<0.0000){
                            user.updateLottery(uid,3,function (result) {
                                result.affectedRows?res.json({state:1,num:1}):res.json({state:0})//爱奇艺会员
                            })
                        }
                    }else {
                        res.json({state:0});
                        return;
                    }
                });
            }else {
                res.json({state:0})
            }
        }
    })
});
router.get("/getIntegral",function (req,res,next) {
    if(req.query.id){
        user.selectUserIntegral(req.query.id,function (result) {
            result.length?res.json({state:1,integral:result[0]}):res.json({state:0})
        })
    }
});
router.get("/serverAddress",function (req,res,next) {
    user.getServerAddress(function (result) {
        result.length?res.json({state:1,address:result}):res.json({state:0})

    })
});
router.get("/getCoin",function (req,res,next) {
    if(req.query.id){
        user.getCoinById(req.query.id,function (result) {
            result.length?res.json({state:1,coin:result[0]}):res.json({state:0})
        })
    }
});
router.get("/updateNickName",function (req,res,next) {
   if(req.query.id && req.query.nickName){
        user.updateNickName(req.query.id,req.query.nickName,function (result) {
            result.affectedRows?res.json({state:1}):res.json({state:0})
        })
   }else {
       res.json({state:0})
   }
});
router.get("/updateSex",function (req,res,next) {
    if(req.query.id && req.query.sex){
        user.updateSex(req.query.id,req.query.sex,function (result) {
            result.affectedRows?res.json({state:1}):res.json({state:0})
        })
    }
});
router.get('/updateBirthday',function (req,res) {
    if(req.query.id && req.query.birthday){
        user.updateBirthday(req.query.id,req.query.birthday,function (result) {
            result.affectedRows?res.json({state:1}):res.json({state:0})
        })
    }
});
router.post("/updateHead",function (req,res,next) {
    console.log(req.body);
    if(req.body.id && req.body.head){
        user.updateHead(req.body.head,req.body.id,function (result) {
            result.affectedRows?res.json({state:1}):res.json({state:0})
        })
        // cdnManager.refreshUrls(['http://base64.oneyouxi.com.cn/'+req.query.head], function(err, respBody, respInfo) {
        //     if (err) {
        //         throw err;
        //     }
        //     // console.log(respInfo.statusCode);
        //     if (respInfo.statusCode == 200) {
        //         var jsonBody = JSON.parse(respBody);
        //
        //         // console.log(jsonBody.code);
        //         // console.log(jsonBody.error);
        //         // console.log(jsonBody.requestId);
        //         // console.log(jsonBody.invalidUrls);
        //         // console.log(jsonBody.invalidDirs);
        //         // console.log(jsonBody.urlQuotaDay);
        //         // console.log(jsonBody.urlSurplusDay);
        //         // console.log(jsonBody.dirQuotaDay);
        //         // console.log(jsonBody.dirSurplusDay);
        //     }
        // });

    }
});
router.get("/getUserMsgById",function (req,res,next) {
    if(req.query.id){
        user.getUserMsgById(req.query.id,function (result) {
            result.length?res.json({state:1,user:result[0]}):res.json({state:0})
        })
    }
});
router.get("/addAddress",function (req,res,next) {
    if(req.query.id){
        var data=req.query;
        user.addAddress(data.id,data.name,data.tel,data.area,data.detail,function (result) {
            result.insertId?res.json({state:1}):res.json({state:0})
        })
    }
});
router.get("/editAddress",function (req,res,next) {
    if(req.query.id){
        var data=req.query;
        user.editAddress(data.id,data.name,data.tel,data.area,data.detail,function (result) {
            result.affectedRows?res.json({state:1}):res.json({state:0})
        })
    }
});
router.get("/getAddress",function (req,res,next) {
    if(req.query.id){
        user.getAddress(req.query.id,function (result) {
            res.json({state:1,address:result})
        })
    }
});
router.get('/getNewsByUserId',function (req,res) {
    var data= req.query;
    if(data.page && data.userId){
        user.getNewsByUserId(data.userId,data.page,function (result) {
            res.json({state:1,newsList:result})
        })
    }else{
        res.json({state:0})
    }
});
router.get('/getStrategyByUserId',function (req,res) {
    var data= req.query;
    if(data.page && data.userId){
        user.getStrategyByUserId(data.userId,data.page,function (result) {
            if(result.length){
                result.forEach(function (t) {
                   t.add_time = subdate(t.add_time);
                });
            }
            res.json({state:1,strategyList:result})
        })
    }else{
        res.json({state:0})
    }
});
router.get('/getCollectByUserId',function (req,res) {
    var data =req.query;
    if(data.userId && data.type && data.page){
        if(data.type == 1){
            user.getNewsCollect(data.userId,data.page,function (result) {
                if(result.length){
                    result.forEach(function (t) {
                        t.add_time=subdate(t.add_time)
                    })
                }
                res.json({state:1,newsList:result})
            })
        }else if(data.type == 2){
            user.getStrategyCollect(data.userId,data.page,function (result) {
                if(result.length){
                    result.forEach(function (t) {
                        t.add_time=subdate(t.add_time)
                    })
                }
                res.json({state:1,strategyList:result})
            })
        }else {
            res.json({state:0})
        }
    }else {
        res.json({state:0})
    }
});
router.get('/getGameByUserId',function (req,res) {
    var data = req.query;
    if(data.userId && data.page && data.type){
        if(data.type==3){
            user.getGameByUser(data.userId,data.page,function (result) {
                res.json({state:1,gameList:result})
            })
        }else if(data.type==4){
            user.getH5ByUser(data.userId,data.page,function (result) {
                res.json({state:1,h5List:result})
            })
        }else {
            res.json({state:0})
        }
    }else {
        res.json({state:0})
    }
});
function subdate(str) {
       if(Object.prototype.toString.call(str) === "[object String]"){
           return str.substring(0,10);
       }else {
           return str
       }
}
router.get('/newMessage',function (req,res) {
    var data = req.query;
    if(data.userId && data.page){
        user.newMessage(data.userId,data.page,function (result) {
            if(result.length){
                result.forEach(function (t) {
                    t.add_time=subdate(t.add_time)
                })
            }
            res.json({state:1,tip:result})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/addFeedbackMsg',function (req,res) {
    var data =req.query;
    if(data.userId && data.content){
        user.addFeedbackMsg(data.userId,data.content,function (result) {
            result.insertId ? res.json({state:1,feedbackId:result.insertId}) : res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/addFeedbackImg',function (req,res) {
    var data = req.query;
    if(data.feedbackId && data.img){
        user.addFeedbackImg(data.feedbackId,data.img,function (result) {
            console.log(result);
        })
    }else {
        res.json({state:0})
    }
});



// router.get("/edit");
module.exports = router;





