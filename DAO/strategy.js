var query = require('../config/config');
var startegy={
    addStartegy:function (userId,title,detail,gameName,addTime,callback) {
        var sql='insert into t_strategy (user_id,title,detail,game_name,add_time) values (?,?,?,?,?)';
        query(sql,[userId,title,detail,gameName,addTime],function (result) {
            return callback(result)
        })
    },
    addStartegyImg:function (strategyId,img,callback) {
        // var val = '';
        // for(var i=0;i<arr.length;i++){
        //     val+='('+strategyId+','+arr[i]+')'
        // }
        // val = val.substring(0,val.length-1);
        // var sql = 'insert into t_strategy (strategy_id,src) values '+val;
        var sql = 'insert into t_strategy_img (strategy_id,src) values (?,?)';
        query(sql,[strategyId,img],function (result) {
            return callback(result)
        })
    },
    collect:function (targetId,userId,sys,type,callback) {
        var sql = 'select id from t_collect where target_id=? and user_id=? and target_type=?';
        query(sql,[targetId,userId,type],function (result) {
            if(!result.length){
                var sql = 'insert into t_collect (target_id,user_id,sys,target_type) values (?,?,?,?)';
                query(sql,[targetId,userId,sys,type],function (result) {
                    return callback(result)
                })
            }else {
                return callback(result)
            }
        })

    },
    unCollect:function (targetId,userId,type,callback) {
        var sql = 'delete from  t_collect where target_id=? and user_id=? and target_type=?';
        query(sql,[targetId,userId,type],function (result) {
            return callback(result)
        })
    },
    getSearchGame:function (sys,callback) {
        var sql = 'select t_game.icon,t_game.game_name from t_game where sys=? order by sort desc limit 0,8';
        query(sql,[sys],function (result) {
            return callback(result)
        })
    },
    getStrategyByMsg:function (sort,page,callback) {
        var sql = 'select t_strategy.*,t_strategy_img.src,t_user.`nick_name`,t_user.portrait from t_strategy left join t_strategy_img on t_strategy_img.strategy_id= t_strategy.id LEFT JOIN t_user ON t_user.id=t_strategy.`user_id` group by t_strategy.id order by '+sort+' desc  limit ?,10';
        query(sql,[(page-1)*10],function (result) {
            return callback(result)
        })
    },
    getStrategyByEssence:function (page,callback) {
        var sql = "select t_strategy.*,t_strategy_img.src from t_strategy left join t_strategy_img on t_strategy_img.strategy_id= t_strategy.id where essence = 1 group by t_strategy.id limit ?,10";
        query(sql,[((page-1)*10)],function (result) {
            return callback(result)
        })
    },

    getStrategyById:function (userId,id,callback) {
        var sql ="SELECT t_strategy.*,GROUP_CONCAT(t_strategy_img.src) as imgList,t_user.`nick_name`,t_user.portrait,d.id as collect,t_strategy_like.`state` FROM t_strategy LEFT JOIN t_strategy_img ON t_strategy_img.strategy_id= t_strategy.id LEFT JOIN t_user ON t_user.id=t_strategy.`user_id` LEFT JOIN t_strategy_like ON t_strategy_like.`strategy_id`=t_strategy.`id` AND t_strategy_like.`user_id`=? LEFT JOIN t_collect AS d ON t_strategy.id=d.`target_id` AND d.`target_type`=2 AND d.`user_id`=?  WHERE t_strategy.id =? GROUP BY t_strategy.id";
        query(sql,[userId,userId,id],function (result) {
            return callback(result)
        })
    },
    addNum:function (strategyId,numType,callback) {
        var sql = 'update t_strategy set '+numType+'='+numType+'+1 where id =?';
        query(sql,[strategyId],function (result) {
            return callback(result)
        })
    },
    strategyComment:function (content,userId,targetCommentId,targetUserId,series,addTime,callback) {
        var sql = 'insert into t_strategy_comment (content,user_id,target_comment_id,target_user_id,series,add_time) values (?,?,?,?,?,?)';
        query(sql,[content,userId,targetCommentId,targetUserId,series,addTime],function (result) {
            return callback(result)
        })
    },
    updateStrategyCommentImg:function (strategyId,img,callback) {
        var sql = 'update t_strategy_comment set img=? where id =?';
        query(sql,[img,strategyId],function (result) {
            return callback(result)
        })
    },
    getStrategyCommentByPage:function (userId,strategyId,page,sort,callback) {
        var sql="SELECT t_strategy_comment.id,t_strategy_comment.img,t_strategy_comment.content,t_strategy_comment.add_time,t_strategy_comment.agree_num,t_strategy_comment.comment_num,t_user.nick_name,t_user.portrait, t_strategy_like.state  \n" +
            "            FROM t_strategy_comment \n" +
            "            LEFT JOIN t_user ON t_strategy_comment.user_id = t_user.id \n" +
            "            LEFT JOIN t_strategy_like ON t_strategy_like.`strategy_id`=t_strategy_comment.`id` AND t_strategy_like.`user_id`=? WHERE t_strategy_comment.target_comment_id=? AND \n" +
            "            t_strategy_comment.series=1  ORDER BY t_strategy_comment."+sort+" DESC  LIMIT ?,5";
        query(sql,[userId,strategyId,(page-1)*5],function (result) {
            return callback(result)
        })
    },
    getStrategyCommentTow:function (parentId,callback) {
        var sql="SELECT t_strategy_comment.content,t_strategy_comment.add_time,a.nick_name AS selfNickName,b.nick_name AS targetUserNickName FROM t_strategy_comment\n" +
            "LEFT  JOIN  t_user AS a ON t_strategy_comment.user_id=a.id \n" +
            "LEFT  JOIN  t_user AS b ON t_strategy_comment.target_user_id=b.id WHERE t_strategy_comment.target_comment_id=? AND t_strategy_comment.series=2 limit 0,2";
        query(sql,[parentId],function (result) {
            return callback(result)
        })
    },
    getStrategyCommentTowByPage:function (parentId,page,callback) {
        var sql="SELECT t_strategy_comment.id,t_strategy_comment.content,t_strategy_comment.add_time,a.nick_name AS selfNickName,a.portrait,b.nick_name AS targetUserNickName,a.id AS selfUserId FROM t_strategy_comment\n" +
            "LEFT  JOIN  t_user AS a ON t_strategy_comment.user_id=a.id \n" +
            "LEFT  JOIN  t_user AS b ON t_strategy_comment.target_user_id=b.id WHERE t_strategy_comment.`target_comment_id` =? AND t_strategy_comment.series=2 limit ?,10";
        query(sql,[parentId,(page-1)*10],function (result) {
            return callback(result)
        })
    },
    getCommentById:function (id,callback) {
        var sql="select t_strategy_comment.*,t_user.nick_name,t_user.portrait from t_strategy_comment left join t_user on t_strategy_comment.user_id = t_user.id where  t_strategy_comment.id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    likeComment:function (commentId,userId,callback) {
        var sql = 'insert into t_strategy_like (strategy_id,user_id) values (?,?)';
        query(sql,[commentId,userId],function (result) {
            return callback(result)
        })
    },
    unLikeComment:function (commentId,userId,callback) {
        var sql = 'delete from  t_strategy_like where strategy_id=? and user_id=?';
        query(sql,[commentId,userId],function (result) {
            return callback(result)
        })
    },
    getStrategyGameNameByMsg:function (msg,callback) {
        var sql = "select t_strategy.game_name from t_strategy where t_strategy.game_name like '%"+msg+"%' group by game_name limit 0,10";
        query(sql,[],function (result) {
            return callback(result)
        })
    },
    getStrategyByGameName:function (gameName,sort,page,callback) {
        var sql = "select t_strategy.*,t_strategy_img.src,t_user.`nick_name`,t_user.portrait from t_strategy left join t_strategy_img on t_strategy_img.strategy_id= t_strategy.id LEFT JOIN t_user ON t_user.id=t_strategy.`user_id` where t_strategy.game_name  =? group by t_strategy.id  order by "+sort+" desc limit ?,10";
        query(sql,[gameName,(page-1)*10],function (result) {
            return callback(result)
        })
    },
    getEssenceStrategyByGameName:function (gameName,page,callback) {
        var sql = "select t_strategy.*,t_strategy_img.src from t_strategy left join t_strategy_img on t_strategy_img.strategy_id= t_strategy.id where essence = 1 and t_strategy.game_name  =? group by t_strategy.id limit ?,10";
        query(sql,[gameName,(page-1)*10],function (result) {
            return callback(result)
        })
    },
    addUserTip:function (targetId,userId,callback) {
        var sql = 'insert into t_tip(tip_id,user_id,type) values (?,?,2)';
        query(sql,[targetId,userId],function () {

        })
    },
    updateCommentImg:function (commentId,img,callback) {
        var sql = 'update t_strategy_comment set img = ? where id =?';
        query(sql,[img,commentId],function (result) {
            return callback(result)
        })
    }
};
module.exports=startegy;