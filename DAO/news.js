var query = require('../config/config');

//收藏、取消收藏
var news = {
    getNewsListByPage:function (page,callback) {
        // var sql="SELECT a.*,b.game_name,b.icon FROM t_news AS a\n" +
        //     "LEFT JOIN t_game AS b ON a.`game_id`=b.`id` order by a.add_time desc limit 0,20";
        // query(sql,[(page-1)*20],function (result) {
        //     return callback(result)
        // })
        var sql="SELECT a.id,a.title,a.img,a.add_time,a.agree,a.game_id,a.browse,b.game_name,b.icon,b.game_recommend FROM t_news AS a\n" +
            "LEFT JOIN t_game AS b ON a.`game_id`=b.`id` order by a.up desc,a.add_time desc limit ?,5";
        query(sql,[(page-1)*5],function (result) {
            return callback(result)
        })
    },
    getNewsById:function (id,userId,callback) {
        var sql="SELECT a.id,a.title,a.add_time,a.add_user,a.agree,a.browse,a.comment,a.detail_addr,a.game_id,a.sys,b.icon,b.game_name,c.state,d.id AS collect FROM t_news AS a\n" +
            "            LEFT JOIN t_game AS b ON  (a.`game_id`=b.`id`)\n" +
            "            LEFT JOIN t_like AS c ON a.id=c.parent_id AND c.like_type=11 AND c.like_user_id=? \n" +
            "            LEFT JOIN t_collect AS d ON a.id=d.`target_id` AND d.`target_type`=1 AND d.`user_id`=?\n" +
            "            WHERE a.id=? GROUP BY a.id";
        query(sql,[userId,userId,id],function (result) {
            return callback(result);
        })
    },
    minusNewsAgree:function (parentId,callback) {
        var sql="update t_news set agree=agree-1 where id =?";
        query(sql,[parentId],function (result) {
            return callback(result)
        })
    },
    minusNewsCommendAgree:function (parentId,callback) {
        var sql="update t_news_comment set agree=agree-1 where id =?";
        query(sql,[parentId],function (result) {
            return callback(result)
        })
    },
    addNewsBrowse:function (id,callback) {
        var sql="update t_news set browse=browse+1 where id =?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    addNewsAgree:function (id,callback) {
        var sql="update t_news set agree=agree+1 where id =?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    addNewsComment:function (id,callback) {
        var sql="update t_news set comment=comment+1 where id =?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    addNewsCommentAgree:function (id,callback) {
        var sql="update t_news_comment set agree=agree+1 where id =?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    addNewsCommentComment:function (id,callback) {
        var sql="update t_news_comment set comment=comment+1 where id =?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    newsComment:function (targetCommentId,userId,series,content,addTime,targetUserId,callback) {
        var sql="insert into t_news_comment (content,user_id,series,target_comment_id,add_time,target_user_id) values (?,?,?,?,?,?)";
        query(sql,[content,userId,series,targetCommentId,addTime,targetUserId],function (result) {
            return callback(result)
        })
    },
    like:function (parentId,userId,type,callback) {
        var sql="select * from t_like where parent_id=? and like_type=? and like_user_id=?";
        query(sql,[parentId,type,userId],function (result) {
            if(result.length){
                var updatesql="update t_like set state=1 where id ="+result[0].id;
                query(updatesql,[],function (result) {
                    return callback(result)
                });
            }else {
                var insertsql="insert into t_like (parent_id,like_type,like_user_id,state) values (?,?,?,?)";
                query(insertsql,[parentId,type,userId,1],function (result) {
                    return callback(result)
                })
            }
        })
    },
    unlike:function (parentId,userId,type,callback) {
        var updatesql="update t_like set state=0 where parent_id=? and like_type=? and like_user_id=?";
        query(updatesql,[parentId,type,userId],function (result) {
            return callback(result)
        });
    },

    getLikeState:function (parentId,userId,type,callback) {
        var sql="select state from t_like where parent_id=? and like_type=? and like_user_id=?";
        query(sql,[parentId,type,userId],function (result) {
            return callback(result)
        })
    },
    getNewsCommentByPage:function (userId,commentParentId,page,callback) {
        var sql="SELECT t_news_comment.id,t_news_comment.content,t_news_comment.add_time,t_news_comment.agree,t_news_comment.comment,t_user.nick_name,t_user.portrait, t_like.state  \n" +
            "FROM t_news_comment  \n" +
            "LEFT JOIN t_user ON t_news_comment.user_id = t_user.id  \n" +
            "LEFT JOIN t_like ON t_news_comment.id=t_like.parent_id and t_like.like_user_id=? AND t_like.`like_type`=12 WHERE t_news_comment.target_comment_id=? AND \n" +
            "t_news_comment.series=1  LIMIT ?,5";
        query(sql,[userId,commentParentId,(page-1)*5],function (result) {
            return callback(result)
        })
    },
    getCommentById:function (id,callback) {
        var sql="select t_news_comment.*,t_user.nick_name,t_user.portrait from t_news_comment left join t_user on t_news_comment.user_id = t_user.id where  t_news_comment.id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    getNewsCommentTow:function (parentId,callback) {
        var sql="SELECT t_news_comment.content,t_news_comment.add_time,a.nick_name AS selfNickName,b.nick_name AS targetUserNickName FROM t_news_comment\n" +
            "LEFT  JOIN  t_user AS a ON t_news_comment.user_id=a.id \n" +
            "LEFT  JOIN  t_user AS b ON t_news_comment.target_user_id=b.id WHERE t_news_comment.target_comment_id=? AND t_news_comment.series=2 limit 0,2";
        query(sql,[parentId],function (result) {
            return callback(result)
        })
    },
    getNewsCommentTowByPage:function (parentId,page,callback) {
        var sql="SELECT t_news_comment.id,t_news_comment.content,t_news_comment.add_time,a.nick_name AS selfNickName,a.portrait,b.nick_name AS targetUserNickName,a.id AS selfUserId FROM t_news_comment\n" +
            "LEFT  JOIN  t_user AS a ON t_news_comment.user_id=a.id \n" +
            "LEFT  JOIN  t_user AS b ON t_news_comment.target_user_id=b.id WHERE t_news_comment.`target_comment_id` =? AND t_news_comment.series=2 limit ?,10";
        query(sql,[parentId,(page-1)*10],function (result) {
            return callback(result)
        })
    },
    getNewsHeadGame:function (callbcak) {
        var sql="SELECT t_news_headgame.img,t_game.id,t_game.icon,t_game.game_name,t_game.grade,t_game.game_recommend FROM `t_news_headgame` left join t_game on t_news_headgame.game_id=t_game.id ORDER BY RAND() LIMIT 1";
        query(sql,[],function (result) {
            return callbcak(result)
        })
    },
    getNewsSlideGame:function (callbcak) {
        var sql="SELECT t_game.id,t_game.grade,t_game.game_name,t_game.game_title_img FROM `t_news_slidegame`  left join t_game on t_news_slidegame.game_id=t_game.id ORDER BY RAND() LIMIT 10";
        query(sql,[],function (result) {
            return callbcak(result)
        })
    },
    searchNewsByGameName:function (sys,msg,page,callback) {
        var sql ="SELECT t_news.id,t_news.`title` FROM t_news\n" +
            "LEFT JOIN t_game ON t_news.`game_id`=t_game.`id`\n" +
            "WHERE t_game.`game_name` LIKE '%"+msg+"%' and t_game.sys=? limit ?,20";
        query(sql,[sys,(page-1)*20],function (result) {
            return callback(result)
        })
    },
    collect:function (targetId,userId,type,sys,callback) {
        var sql ='insert into t_collect (target_id,user_id,target_type,sys) values (?,?,?,?)';
        query(sql,[targetId,userId,type,sys],function (result) {
            return callback(result)
        })
    },
    unCollect:function (targetId,userId,type,callback) {
        var sql ='delete from  t_collect where target_id=? and user_id=? and target_type=?';
        query(sql,[targetId,userId,type],function (result) {
            return callback(result)
        })
    },
    addUserTip:function (targetId,userId,callback) {
        var sql = 'insert into t_tip(tip_id,user_id,type) values (?,?,1)';
        query(sql,[targetId,userId],function () {

        })
    },
    readMessage:function (userId,callback) {
        var sql = 'update t_tip set state=1 where user_id=?';
        query(sql,[userId],function (result) {
            return callback(result)
        })
    }
};

module.exports = news;
