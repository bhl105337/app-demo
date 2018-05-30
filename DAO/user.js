/**
 * Created by Administrator on 2016/12/15.
 */
var query = require('../config/config');

//收藏、取消收藏
var user = {
    login:function (user_tel,password,callback) {
        var sql = "select id,nick_name,portrait,coin,integral,achievement_point,time_logon,tel,pay from t_user where tel=? and password=?";
        query(sql,[user_tel,password],function (result) {
            if(result.length>0){
                return callback(result)
            }else {
                var sql = "select id,nick_name,portrait,coin,integral,achievement_point,time_logon,tel pay from t_user where nick_name=? and password=?";
                query(sql,[user_tel,password],function (res) {
                    return callback(res)
                })
            }
        })
    },
    gameComment:function (userId,gameId,score,content,agree,addTime,parentId,address,callback) {
        var sql="INSERT INTO t_game_recommend (user_id,game_id,score,content,agree,add_time,parent_id,address) values (?,?,?,?,?,?,?,?)";
        query(sql,[userId,gameId,score,content,agree,addTime,parentId,address],function (result) {
            return callback(result)
        })
    },
    getGameCommentScoreById:function (game_id,callback) {
        var  sql="select score from t_game_recommend where game_id=?";
        query(sql,[game_id],function (result) {
            return callback(result)
        })
    },
    getUserCommentLen:function (game_id,user_id,callback) {
        var  sql="select count(*) as count from t_game_recommend where game_id=? and user_id=?";
        query(sql,[game_id,user_id],function (result) {
            return callback(result)
        })
    },
    updateGameScore:function (game_id,score,callback) {
        var sql="UPDATE t_game SET grade=? where id=?";
        query(sql,[score,game_id],function (result) {
            return callback(result)
        })
    },
    reg:function (tel,password,timeLogon,callback) {
        var sqlUser="select * from t_user where tel =?";
        var sql ="INSERT INTO t_user (nick_name,password,portrait,coin,integral,achievement_point,sign,time_unlock,time_logon,tel) values (?,?,0,0,500,0,0,0,?,?)";
        query(sqlUser,[tel],function (result) {
            if(result.length<=0){
                query(sql,[tel,password,timeLogon,tel],function (res) {
                    return callback(res);
                })
            }else {
                return callback(result)
            }
        })
    },
    updateOnlyidById:function (id,callback) {
        var onlyId=(parseInt(id)+123456);
        var sql="UPDATE t_user SET only_id=? where id=?";
        query(sql,[onlyId,id],function (result) {
            return callback(result)
        })
    },
    userList:function (callback) {
        var sql='select nick_name,coin,integral,achievement_point,time_logon,tel,new_online,channel,sign,new_sign from t_user';
        query(sql,[],function (result) {
            return callback(result);
        })
    },
    getChannel:function (callback) {
        var sql="select * from t_channel";
        query(sql,[],function (result) {
            return callback(result)
        })
    },
    updateChannel:function (channel,uid,callback) {
        var sql="UPDATE t_user SET channel=? where id=?";
        query(sql,[channel,uid],function (result) {
                var sql = "select id,nick_name,portrait,coin,integral,achievement_point,sign,time_unlock,time_logon,tel,pay from t_user where id=?";
                query(sql,[uid],function (res) {
                    return callback(res)
                })

        })
    },
    selectUserIntegral:function (id,callback) {
        var sql="select integral from t_user where id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    updateUserIntegral:function (id,integral,callback) {
        var sql="update t_user set integral=? where id=?";
        query(sql,[integral,id],function (result) {
            return callback(result)
        })
    },
    selectUserCoin:function (id,callback) {
        var sql="select coin from t_user where id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    updateUserCoin:function (id,integral,callback) {
        var sql="update t_user set Coin=? where id=?";
        query(sql,[integral,id],function (result) {
            return callback(result)
        })
    },
    addLottery:function (uid,gty,num,start,end,value,callback) {
        var sql="insert into t_lottery (user_id,gift_type,num,start_time,end_time,value) values (?,?,?,?,?,?)";
        query(sql,[uid,gty,num,start,end,value],function (result) {
            return callback(result);
        })
    },
    updateLottery:function (uid,gty,callback) {
        var sql="select * from t_lottery where user_id =? and gift_type=? LIMIT 1;";
        query(sql,[uid,gty],function (result) {
            if(result.length){
                console.log(result);
                var num=result[0].num+1;
                var sql= "update t_lottery set num=? where user_id =? and gift_type=?";
                query(sql,[num,uid,gty],function (result) {
                    return callback(result)
                })
            }else {
                var sql="insert into t_lottery (user_id,gift_type,num) values (?,?,1)";
                query(sql,[uid,gty],function (result) {
                    return callback(result)
                })
            }
        })
    },
    getLotteryByUid:function (uid,callback) {
        var sql="select * from t_lottery where user_id=?";
        query(sql,[uid],function (result) {
            return callback(result)
        })
    },

    getServerAddress:function (callback) {
        var sql="select * from t_server";
        query(sql,[],function (result) {
            return callback(result)
        })
    },
    getCoinById:function (id,callback) {
        var sql="select coin from t_user where id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    getSignById:function (id,callback) {
        var  sql = "select sign,new_sign from t_user where id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    updateSign:function (id,sign,newSign,callbcak) {
        var sql ="update t_user set sign=?,new_sign=? where id=?";
        query(sql,[sign,newSign,id],function (result) {
            return callbcak(result)
        })
    },
    updateNickName:function (id,nickName,callback) {
        var sql="update t_user set nick_name=? where id=?";
        query(sql,[nickName,id],function (result) {
            return callback(result)
        })
    },
    updateHead:function (head,id,callback) {
        var sql="update t_user set portrait=? where id=?";
        query(sql,[head,id],function (result) {
            return callback(result)
        })
    },
    updateSex:function (id,sex,callback) {
        var sql="update t_user set sex=? where id=?";
        query(sql,[sex,id],function (result) {
            return callback(result)
        })
    },
    updateBirthday:function (id,birthday,callback) {
        var sql="update t_user set birthday=? where id=?";
        query(sql,[birthday,id],function (result) {
            return callback(result)
        })
    },
    getUserMsgById:function (id,callback) {
        var sql="select id,nick_name,portrait,coin,integral,tel,sign,new_sign,channel,sex,pay,only_id,birthday,head_add  from t_user where id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    addAddress:function (uid,name,tel,area,detail,callback) {
        var sql="insert into t_address (user_id,user_name,tel,area,detail_address) values (?,?,?,?,?)";
        query(sql,[uid,name,tel,area,detail],function (result) {
            return callback(result);
        })
    },
    editAddress:function (uid,name,tel,area,detail,callback) {
        var sql="update t_address set user_name=?,tel=?,area=?,detail_address=? where id=?";
        query(sql,[name,tel,area,detail,uid],function (result) {
            return callback(result)
        })
    },
    getAddress:function (uid,callback) {
        var sql="select * from t_address where user_id=?";
        query(sql,[uid],function (result) {
            return callback(result)
        })
    },
    updatePassword:function (tel,password,callback) {
        var sql = "update t_user set password=? where tel=?";
        query(sql,[password,tel],function (result) {
            return callback(result)
        })
    },
    getNewsByUserId:function (userId,page,callback) {
        var sql="SELECT a.id,a.title,a.img,a.add_time,a.agree,a.game_id,a.browse,b.game_name,b.icon,b.game_recommend FROM t_news AS a\n" +
            "LEFT JOIN t_game AS b ON a.`game_id`=b.`id` where a.add_user=? order by a.up desc,a.add_time desc limit ?,10";
        query(sql,[userId,(page-1)*10],function (result) {
            return callback(result)
        })
    },
    getStrategyByUserId:function (userId,page,callback) {
        var sql = 'select t_strategy.*,t_strategy_img.src,t_user.`nick_name`,t_user.portrait from t_strategy left join t_strategy_img on t_strategy_img.strategy_id= t_strategy.id LEFT JOIN t_user ON t_user.id=t_strategy.`user_id` where t_strategy.`user_id`=? group by t_strategy.id order by add_time desc  limit ?,10';
        query(sql,[userId,(page-1)*10],function (result) {
            return callback(result)
        })
    },
    getStrategyCollect:function (userId,page,callback) {
        var sql = 'select t_strategy.*,t_strategy_img.src,t_user.`nick_name`,t_user.portrait from t_collect  left join t_strategy on t_strategy.id=t_collect.target_id left join t_strategy_img on t_strategy_img.strategy_id= t_strategy.id LEFT JOIN t_user ON t_user.id=t_strategy.`user_id` where t_strategy.`user_id`=? and t_collect.target_type=2 group by t_strategy.id order by add_time desc  limit ?,10';
        query(sql,[userId,(page-1)*10],function (result) {
            return callback(result)
        })
    },
    getNewsCollect:function (userId,page,callback) {
        var sql="SELECT a.id,a.title,a.img,a.add_time,a.agree,a.game_id,a.browse,b.game_name,b.icon,b.game_recommend FROM t_collect as c left join t_news AS a on a.id= c.target_id and c.user_id=?\n" +
            "LEFT JOIN t_game AS b ON a.`game_id`=b.`id` where c.target_type=1  order by a.up desc,a.add_time desc limit ?,10";
        query(sql,[userId,(page-1)*10],function (result) {
            return callback(result)
        })
    },
    getH5ByUser:function (userId,page,callback) {
        var sql = 'select t_h5.* from t_collect left join t_h5 on t_h5.id = t_collect.target_id where t_collect.user_id = ? and t_collect.target_type=4 limit ?,10';
        query(sql,[userId,(page-1)*10],function (result) {
            return callback(result)
        })
    },
    getGameByUser:function (userId,page,callback) {
        var sql="SELECT t_game.*,GROUP_CONCAT(t_tag.name) AS tagList,GROUP_CONCAT(t_tag.id) AS tagId FROM t_collect \n" +
            "LEFT JOIN t_game ON t_game.`id`=t_collect.`target_id`\n" +
            "LEFT JOIN t_tag_relation ON t_tag_relation.game_id = t_game.id \n" +
            "LEFT JOIN t_tag ON t_tag.`id`=t_tag_relation.`tag_id` WHERE t_collect.`user_id`=? AND t_collect.`target_type`=3 GROUP BY t_game.id  LIMIT ?,10";
        query(sql,[userId,(page-1)*10],function (result) {
            return callback(result)
        })
    },
    newMessage:function (userId,page,callback) {
        var sql ='call pro_newMessage(?,?)';
        query(sql,[userId,(page-1)*10],function (result) {
            var arr=[];
            for (var i=0;i<result.length-1;i++){
                arr=arr.concat(result[i])
            }
            // result.forEach(function (t) {
            //
            // });
            return callback(arr)
        })
    },
    addFeedbackMsg:function (userId,content,callback) {
        var sql = 'insert into t_feedback (detail,user_id) values (?,?)';
        query(sql,[content,userId],function (result) {
            return callback(result)
        })
    },
    addFeedbackImg:function (feedbackId,img,callbcak) {
        var sql = 'insert into t_feedback_img (feedback_id,img) values (?,?)';
        query(sql,[feedbackId,img],function (result) {
            return callbcak(result)
        })
    }

};
module.exports = user;