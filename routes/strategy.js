var express = require('express');
var router = express.Router();
var strategy=require('../DAO/strategy');
var socketio=require('./socketio');
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
router.get('/addStrategyMsg',function (req,res) {
    var data=req.query;
    if(data.userId && data.title && data.detail && data.gameName){
        var date=new Date();
        strategy.addStartegy(data.userId,data.title,data.detail,data.gameName,date.Format('yyyy-MM-dd-hh-mm-ss'),function (result) {
            result.insertId ? res.json({state:1,strategyId:result.insertId}) : res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/addStrategyImg',function (req,res) {
    var data=req.query;
    if(data.strategyId && data.img){
        strategy.addStartegyImg(data.strategyId,data.img,function (result) {
            result.insertId ? res.json({state:1}) : res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/collect',function (req,res) {
    var data = req.query;
    if(data.targetId && data.userId && data.sys && data.type){
        strategy.collect(data.targetId,data.userId,data.sys,data.type,function (result) {
            res.json({state:1})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/unCollect',function (req,res) {
    var data = req.query;
    if(data.targetId && data.userId && data.type ){
        strategy.unCollect(data.targetId,data.userId,data.type,function (result) {
            result.affectedRows ? res.json({state:1}) : res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getSearchGame',function (req,res) {
    var data = req.query;
    if(data.sys){
        strategy.getSearchGame(data.sys,function (result) {
            result.length ? res.json({state:1,gameList:result}) : res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getStrategyByMsg',function (req,res) {
    var data = req.query;
    if(data.sort && data.page){
        if(data.sort=='essence'){
            strategy.getStrategyByEssence(data.page,function (result) {
                res.json({state:1,strategy:result})
            })
        }else {
            strategy.getStrategyByMsg(data.sort,data.page,function (result) {
                res.json({state:1,strategy:result})
            })
        }
    }else {
        res.json({state:0})
    }
});
router.get('/getStrategyByEssence',function (req,res) {
    var data = req.query;
    if(data.page){
        strategy.getStrategyByEssence(data.page,function (result) {
            res.json({state:1,strategy:result})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getStrategyById',function (req,res) {
    var data = req.query;
    if(data.strategyId && data.userId){
        strategy.getStrategyById(data.userId,data.strategyId,function (result) {
            res.json({state:1,strategy:result[0]})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/addNum',function (req,res) {
    var data = req.query;
    if(data.strategyId && data.numType){
        strategy.addNum(data.strategyId,data.numType,function (result) {
            res.json({state:1})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/strategyComment',function (req,res) {
    var data = req.query;
    if(data.content && data.targetCommentId && data.targetUserId && data.userId && data.series){
        var date=new Date();
        strategy.strategyComment(data.content,data.userId,data.targetCommentId,data.targetUserId,data.series,date.Format('yyyy-MM-dd-hh-mm-ss'),function (result) {
            result.insertId && strategy.addUserTip(result.insertId,data.targetUserId) ;
            socketio.senMsg(data.targetUserId);
            result.insertId ? res.json({state:1,commentId:result.insertId}) : res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/updateStrategyCommentImg',function (req,res) {
    var data= req.query;
    if(data.strategyId && data.img){
        strategy.updateStrategyCommentImg(data.strategyId,data.img,function (result) {
            result.affectedRows ? res.json({state:1}) : res.json({state:0})
        })
    } else {
        res.json({state:0})
    }
});
router.get('/getStrategyCommentByPage',function (req,res) {
    var data = req.query;
    if(data.strategyId && data.page && data.userId && data.sort){
        strategy.getStrategyCommentByPage(data.userId,data.strategyId,data.page,data.sort,function (result) {
            if(result.length){
                var data=result;
                data.forEach(function (t) {
                    t.add_time=subdate(t.add_time);
                });
                var len=result.length;
                var index =0;
                function selectTow() {
                    strategy.getStrategyCommentTow(result[index].id,function (result) {
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
router.get('/getStrategyCommentTowByPage',function (req,res) {
    var data =req.query;
    if(data.commentId && data.page){
        strategy.getStrategyCommentTowByPage(data.commentId,data.page,function (result) {
            if(result.length){
                result.forEach(function (t) {
                    t.add_time=subdate(t.add_time);
                });
                res.json({state:1,comment:result})
            }else {
                res.json({state:1,comment:result})
            };
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getCommentById',function (req,res) {
    var data = req.query;
    if(data.commentId){
        strategy.getCommentById(req.query.commentId,function (result) {
            result.length && (result[0].add_time=subdate(result[0].add_time));
            result.length?res.json({state:1,comment:result[0]}):res.json({state:0});
        })
    }else {
        res.json({state:0})
    }
});
router.get('/likeComment',function (req,res) {
    var data = req.query;
    if(data.commentId && data.userId){
        strategy.likeComment(data.commentId,data.userId,function (result) {
            result.insertId ? res.json({state:1}) : res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/unLikeComment',function (req,res) {
    var data = req.query;
    if(data.commentId && data.userId){
        strategy.unLikeComment(data.commentId,data.userId,function (result) {
            result.affectedRows ? res.json({state:1}) : res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getStrategyByGameName',function (req,res) {
    var data =req.query;
    if(data.msg && data.page && data.sort){
        if(data.sort=='essence'){
            strategy.getEssenceStrategyByGameName(data.msg,data.page,function (result) {
                res.json({state:1,strategy:result})
            })
        }else {
            strategy.getStrategyByGameName(data.msg,data.sort,data.page,function (result) {
                res.json({state:1,strategy:result})
            })
        }

    }else {
        res.json({state:0})
    }
});
router.get('/getStrategyGameNameByMsg',function (req,res) {
    var data = req.query;
    if(data.msg){

        strategy.getStrategyGameNameByMsg(data.msg,function (result) {
            res.json({state:1,gameName:result})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/updateCommentImg',function (req,res) {
    var data =req.query;
    if(data.commentId && data.img){
        strategy.updateCommentImg(data.commentId,data.img,function (result) {
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