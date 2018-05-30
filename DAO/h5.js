var query = require('../config/config');
var h5={
    getH5:function (page,callback) {
        var sql="select * from t_h5 order by sort desc limit ?,5";
        query(sql,[(page-1)*5],function (result) {
            return callback(result)
        })
    },
    getH5ByMsg:function (msg,callback) {
        var sql="select * from t_h5 where name like '%"+msg+"%'  ORDER BY sort DESC limit 0,10";
        query(sql,[],function (result) {
            return callback(result)
        })
    },
    addMyH5:function (userId,gameId,callback) {
        var sql = 'select id from t_collect where target_id=? and user_id=? and target_type=?';
        query(sql,[gameId,userId,4],function (result) {
            if(!result.length){
                var sql = 'insert into t_collect (target_id,user_id,sys,target_type) values (?,?,0,?)';
                query(sql,[gameId,userId,4],function (result) {
                    return callback(result)
                })
            }else {
                return callback(result)
            }
        })
    }
};
module.exports=h5;