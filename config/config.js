//导入所需模块
var mysql=require("mysql");
//导入配置文件
// var cfg  =require("./config/db");
// var pool = mysql.createPool({
//     host:      "192.168.2.151",
//     user:      "root",
//     password:  "",
//     database:  "gcyx",
//     port:      "3306"
// });
// //导出查询相关
// var query=function(sql,callback){
//     pool.getConnection(function(err,conn){
//         if(err){
//             console.log("数据库链接失败");
//             callback(err,null,null);
//         }else{
//             conn.query(sql,function(qerr,vals,fields){
//                 //释放连接
//                 conn.release();
//                 //事件驱动回调
//                 callback(qerr,vals,fields);
//             });
//         }
//     });
// };



//访问本地mysql服务器的配置
var config = {
    host:'182.61.26.179',
    port:3306,
    database:'sywltest',
    user:'root',
    password:'990205'
};

//创建连接池
var pool = mysql.createPool(config);

/**
 * 数据库查询操作封装
 * @param sql 执行的sql语句
 * @param params sql语句中的参数
 * @param callback  回调函数
 */
var query = function (sql,params,callback) {

    //从连接池中获取一个连接
    pool.getConnection(function (err,connection) {

        if(err) return console.log('创建数据库连接失败,',err);

        //执行sql语句
        connection.query(sql,params,function (err,result) {
            if(err) return console.log('数据库查询失败,',err,"错误语句：",sql);
            //释放连接对象
            connection.release();
            //调用回调函数,传入查询结果
            callback(result);

        })
    });
};


module.exports = query;
