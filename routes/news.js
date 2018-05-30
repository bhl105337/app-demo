var router=require('express').Router();
var news =require("../DAO/news");
var socketio=require('./socketio');
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

router.get("/addNewsBrowse",function (req,res,next) {
    if(req.query.id){
        news.addNewsBrowse(req.query.id,function (result) {
            if(result.affectedRows){
                res.json({state:1})
            }else {
                res.json({state:0})
            }
        })
    }
});
router.get('/getNewsByPage',function (req,res,next) {
    news.getNewsListByPage(req.query.page,function (result) {
        result.length?res.json({state:1,news:result}):res.json({state:0})
    })
});
router.get("/getNewsById",function (req,res,next) {
    if(req.query.id){
        news.getNewsById(req.query.id,req.query.userId,function (result) {
            if(result.length){
                var str=result[0].add_time.substring(11,16);
                str=str.replace(/-/g, ':');
                result[0].add_time=result[0].add_time.substring(0,10);
                result[0].add_time+=" ";
                result[0].add_time+=str;
            }
            result.length?res.json({state:1,news:result[0]}):res.json({state:0})
        })
    }else {

    }
});
router.get("/addNum",function (req,res,next) {
    if(req.query.id && req.query.type){
        switch (req.query.type){
            case "browse":
                news.addNewsBrowse(req.query.id,function (result) {
                    result.affectedRows?res.json({state:1}):res.json({state:0})
                });break;
            case "agree":
                news.addNewsAgree(req.query.id,function (result) {
                    result.affectedRows?res.json({state:1}):res.json({state:0})
                });break;
            case "comment":
                news.addNewsComment(req.query.id,function (result) {
                    result.affectedRows?res.json({state:1}):res.json({state:0})
                });break;
        }

    }
});
router.get("/addCommentNum",function (req,res,next) {
    if(req.query.id && req.query.type){
        switch (req.query.type){
            case "agree":
                news.addNewsCommentAgree(req.query.id,function (result) {
                    result.affectedRows?res.json({state:1}):res.json({state:0})
                });break;
            case "comment":
                news.addNewsCommentComment(req.query.id,function (result) {
                    result.affectedRows?res.json({state:1}):res.json({state:0})
                });break;
        }

    }
});
router.get("/comment",function (req,res,next) {
    // console.log(req.query);
    var date=new Date();
    if(req.query.targetCommentId){
       var data=req.query;
       news.newsComment(data.targetCommentId,data.userId,data.series,data.content,date.Format('yyyy-MM-dd-HH-mm-SS'),data.targetUserId || 0,function (result) {
           if(result.insertId){
               if(data.series==1){
                   news.addNewsComment(req.query.targetCommentId,function (result) {
                       result.affectedRows ? res.json({state:1}) : res.json({state:0})
                   })
               }else {
                   news.addUserTip(result.insertId,data.targetUserId);
                   console.log('news'+data.targetUserId);
                   socketio.senMsg(data.targetUserId);
                   news.addNewsCommentComment(req.query.targetCommentId,function (result) {
                       result.affectedRows ? res.json({state:1}) : res.json({state:0})
                   })
               }
           }else {
               res.json({state:0})
           }
       })
   }
});
router.get("/like",function (req,res,next) {
    if(req.query.parentId && req.query.userId && req.query.type){
        var data=req.query;
        var type=data.type;
        news.like(data.parentId,data.userId,data.type,function (result) {
            if(result.affectedRows||result.insertId){
                if(type=="11"){
                    news.addNewsAgree(data.parentId,function () {
                    })
                }else if(type=="12"){
                    news.addNewsCommentAgree(data.parentId,function () {
                    })
                }
                res.json({state:1})
            }else {
                res.json({state:0})
            }
        })
    }
});
router.get("/unlike",function (req,res,next) {
    if(req.query.parentId){
        var data=req.query;
        news.unlike(data.parentId,data.userId,data.type,function (result) {
            if(result.affectedRows){
                if(data.type=="11"){
                    news.minusNewsAgree(data.parentId,function () {
                    })
                }else if(data.type=="12"){
                    news.minusNewsCommendAgree(data.parentId,function () {
                    })
                }
            }
            result.affectedRows?res.json({state:1}):res.json({state:0})
        })
    }
});
router.get("/getLikeState",function (req,res,next) {
    if(req.query.parentId){
        var data=req.query;
        news.getLikeState(data.parentId,data.userId,11,function (result) {
            result.length?res.json({state:1,likeState:result[0].state}):res.json({state:1,likeState:0})
        })
    }
});
router.get("/getCommentByPage",function (req,res,next) {
    if(req.query.commentParentId){
        news.getNewsCommentByPage(req.query.userId,req.query.commentParentId,req.query.page,function (result) {
            if(result.length){
                var data=result;
                data.forEach(function (t) {
                    t.add_time=subdate(t.add_time);
                });
                var len=result.length;
                var index =0;
                function selectTow() {
                    news.getNewsCommentTow(result[index].id,function (result) {
                        result.forEach(function (t) {
                            t.add_time=subdate(t.add_time);
                        });
                        data[index].towCommentList=result;
                        if(index<(len-1)){
                            index++;
                            selectTow()
                        }else {
                            res.json({state:1,comment:data})
                        }
                    });
                }
                selectTow();
            }else {
                res.json({state:4,comment:[]})
            }
        })
    }else {
        res.json({state:0})
    }
});
router.get("/getNewsCommentTowByPage",function (req,res,next) {
    news.getNewsCommentTowByPage(req.query.parentId,req.query.page,function (result) {
        if(result.length){
            result.forEach(function (t) {
                t.add_time=subdate(t.add_time);
            });
            res.json({state:1,comment:result})
        }else {
            res.json({state:1,comment:result})
        }
    })
});
router.get("/getCommentById",function (req,res,next) {
    if(req.query.commentId){
        news.getCommentById(req.query.commentId,function (result) {
            result.length && (result[0].add_time=subdate(result[0].add_time));
            result.length?res.json({state:1,comment:result[0]}):res.json({state:0});
        })
    }else {
        res.json({state:0})
    }
});
router.get("/getHeadGame",function (req,res) {
    news.getNewsHeadGame(function (result) {
        result.length?res.json({state:1,game:result[0]}):res.json({state:0})
    })
});
router.get("/getSlideGame",function (req,res) {
    news.getNewsSlideGame(function (result) {
        result.length?res.json({state:1,gameList:result}):res.json({state:0})
    })
});
router.get('/searchNewsByGameName',function (req,res) {
    var data = req.query;
    if(data.sys && data.msg && data.page){
        news.searchNewsByGameName(data.sys,data.msg,data.page,function (result) {
            res.json({state:1,newsList:result})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/collect',function (req,res) {
    var data = req.query;
    if(data.targetId && data.userId && data.type && data.sys){
        news.collect(data.targetId,data.userId,data.type,data.sys,function (result) {
            result.insertId ? res.json({state:1}) : res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/unCollect',function (req,res) {
    var data = req.query;
    if(data.targetId && data.userId && data.type ){
        news.unCollect(data.targetId,data.userId,data.type,function (result) {
            result.affectedRows ? res.json({state:1}) : res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/cancelMessage',function (req,res) {
    var data = req.query;
    if(data.userId){
        news.readMessage(data.userId,function (result) {
            socketio.cancelMsg(data.userId);
            result.affectedRows ? res.json({state:1}) : res.json({state:0})
        })
    } else {
        res.json({state:0})
    }
});
function subdate(str) {
    return str.substring(0,10);
}
module.exports = router;