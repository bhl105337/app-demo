var router=require('express').Router();
var game =require("../DAO/game");
var socketio=require('./socketio');

router.get('/getGameById', function(req, res, next) {
    var data=req.query;
    if(data.gameId){
        game.getDetailById(data.gameId,function (result) {
            result.length? res.json({state:1,gameDetail:result[0]}):res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getGameImgListById',function (req,res) {
    var data=req.query;
    if(data.gameId){
        game.getGameImgListById(data.gameId,function (result) {
            result.length? res.json({state:1,gameList:result}):res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/edit',function (req,res,next) {
    game.editGameById(1,req.query.text,function (result) {
        res.json({result:result})
    });
});
router.get("/carousel",function (req,res,next) {
   game.getCarousel(function (result) {
       result.length? res.json({state:1,carousel:result}):res.json({state:0})
   })
});
router.get("/active",function (req,res,next) {
    game.getActive(function (result) {
        result.length? res.json({state:1,active:result}):res.json({state:0})
    })
});
router.get("/clsActive",function (req,res,next) {
    game.getClsActive(function (result) {
        result.length? res.json({state:1,clsActive:result}):res.json({state:0})
    })
});
router.get("/getGameByMsg",function (req,res,next) {
    req=req.query;
    // console.log(req);
    game.getGameByMsg(req.sys,req.type,req.sort,req.page,function (result) {
        // console.log(result);
        res.json({state:1,game:result})
    })
});
router.get("/hotGame",function (req,res,next) {
    game.getHotGame(function (result) {
        result.length?res.json({state:1,game:result[0]}):res.json({state:0})
    })
});
router.get("/clsIconActive",function (req,res,next) {
   game.getClsIconActive(function (result) {
       result.length?res.json({state:1,game:result}):res.json({state:0})
   })
});
router.get("/getGameCommentById",function (req,res,next) {
    if(req.query.gameId){
        game.getGameCommentById(req.query.gameId,req.query.page,function (result) {
            res.json({state:1,comment:result})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getGameHotComment',function (req,res) {
    var data=req.query;
    if(data.gameId){
        game.getGameHotComment(data.gameId,function (result) {
            res.json({state:1,comment:result})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getOneCommentByCommentId',function (req,res) {
    var data= req.query;
    if(data.commentId){
        game.getOneCommentByCommentId(data.commentId,function (result) {
            res.json({state:1,comment:result[0]})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getGameTowComment',function (req,res) {
     var data= req.query;
     if(data.page && data.parentId){
         game.getGameTowComment(data.parentId,data.page,function (result) {
             res.json({state:1,comment:result})
         })
     }else {
         res.json({state:0})
     }
});
router.get('/likeComment',function (req,res) {
    var data = req.query;
    if(data.commentId && data.userId ){
        game.likeComment(data.commentId,data.userId,function (result) {
            if(result.insertId){
                game.addCommmentLikeNum(data.commentId,function () {

                })
            }
            res.json({state:1})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/unLikeComment',function (req,res) {
    var data = req.query;
    if (data.commentId && data.userId){
        game.unLikeComment(data.commentId,data.userId,function (result) {
            if(result.affectedRows){
                game.minusCommmentLikeNum(data.commentId,function () {

                })
            }
            res.json({state:1})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getGameLikeTag',function (req,res) {
    var data = req.query;
    if(data.gameId){
        game.getGameLikeTag(data.gameId,function (result) {
            res.json({state:1,gameList:result})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getNewsByGameId',function (req,res) {
    var data=req.query;
    if(data.gameId){
        game.getNewsByGameId(data.gameId,function (result) {
            if(result.length){
                for (var i=0,l=result.length;i<l;i++){
                    result[i].add_time=result[i].add_time.substring(0,10)
                }
            }
            res.json({state:1,newsList:result})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getGameCommentScore',function (req,res) {
    var data = req.query;
    if(data.gameId){
        game.getGameCommentScore(data.gameId,function (result) {
            res.json({state:1,scoreList:result})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/comment',function (req,res,next) {
    var data=req.query;
    if(data.userId && data.gameId && data.content){
        var date=new Date();
        game.gameComment(data.userId,data.gameId,data.score,data.content,date.Format('yyyy-MM-dd'),data.parentId,data.series,data.targetUserId || null,function (result) {
            if(result.insertId){
                data.targetUserId && game.addUserTip(result.insertId,data.targetUserId);
                data.targetUserId && socketio.senMsg(data.targetUserId);
                game.getGameCommentScoreById(data.gameId,function (result) {
                    if(result.length>0){
                        var len=result.length;
                        var allScore=0;
                        for(var i=0;i<len;i++){
                            allScore+=result[i].score;
                        }
                        game.updateGameScore(data.gameId,(allScore / len).toFixed(1),function (result) {
                            result.affectedRows?res.json({state:1}):res.json({state:0})
                        })
                    }
                })
            }
        })
    }else {
        res.json({state:0})
    }

});
router.get('/getGameCls',function (req,res) {
    game.getGameCls(function (result) {
        res.json({state:1,cls:result})
    })
});
router.get('/getAppCls',function (req,res) {
    game.getAppCls(function (result) {
        res.json({state:1,cls:result})
    })
});
router.get('/getGameByCls',function (req,res) {
    var data =req.query;
    if(data.clsId && data.page){
        game.getGameByCls(data.clsId,data.page,function (result) {
            res.json({state:1,gameList:result})
        })
    }else {
        res.json({state:0})
    }
});

router.get("/searchGameByMsg",function (req,res,next) {
   if(req.query.msg && req.query.sys){
       var data= req.query;
       game.searchGameByMsg(data.sys,data.msg,data.sort,data.page,function (result) {
           result.length?res.json({state:1,game:result}):res.json({state:0})
       })
   }
});
router.get("/likeGameComment",function (req,res,next) {
    console.log(req.query);
    // game.like(req.query.)
});
router.get("/addDownloadNum",function (req,res,next) {
   if(req.query.id){
       game.addDownloadNum(req.query.id,function (result) {
           result.affectedRows?res.json({state:1}):res.json({state:0})
       })
   }
});

router.get('/getSubject',function (req,res) {
    var data = req.query;
    if(data.sys){
        game.getSubject(data.sys,function (result) {
            result.length ? res.json({state:1,subject:result}) : res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getSubjectById',function (req,res) {
    var data=req.query;
    if(data.subjectId){
        game.getSubjectById(data.subjectId,function (result) {
            result.length ? res.json({state:1,subject:result[0]}) : res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getActiveTag',function (req,res) {
    var data = req.query;
    if (data.sys){
        game.getActiveTag(data.sys,function (result) {
            res.json({state:1,activeTagGame:result})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getGameBySubject',function (req,res) {
    var data= req.query;
    if(data.subjectId && data.sys && data.page){
        game.getGameBySubject(data.subjectId,data.sys,data.page,function (result) {
            res.json({state:1,game:result})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getGameByTag',function (req,res) {
    var data = req.query;
    if(data.tagId && data.sys && data.page){
        game.getGameByTag(data.tagId,data.sys,data.page,function (result) {
            res.json({state:1,game:result})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/addMyGame',function (req,res) {
    var data =req.query;
    if(data.userId && data.gameId && data.sys){
        game.addMyGame(data.gameId,data.userId,data.sys,function (result) {
            res.json({state:1})
        })
    }else {
        res.json({state:0})
    }
});
router.get('/getActiveLenOfTow',function (req,res) {
        game.getActiveLenOfTow(function (result) {
            res.json({state:1,game:result})
        })
});
router.get('/getActiveLenOfTen',function (req,res) {
    game.getActiveLenOfTen(function (result) {
        res.json({state:1,game:result})
    })
});
module.exports = router;