var socket_io = require('socket.io');
var socketDao =require("../DAO/socketio");
var socketio = {
    getSocketio : function(server){ // http(s) serve
        var io = socket_io.listen(server);
        io.sockets.on('connection', function (socket) {
            // console.log('连接成功');
            socket.on('login',function(data){ // 处理来自客户端的’login’事件
                // console.log(data.soc);
                !socketio[data.userId+data.soc] ? socketio[data.userId+data.soc]=socket : "";
                socketDao.hasNewTip(data.userId,function (result) {
                    socket.emit('hsaNwsTip', {tip: result[0].num}); // 给该客户端发送event02事件
                });
                // socket.broadcast.emit('event02', {datas: datas}); // 发送给其它客户端
            });
            socket.on('exit',function (data) {
                delete socketio[data.userId]
            });
            // socket.on('sendMsg',function (data) {
            //     socketio[data.userId].emit('msg',{msg:data.msg})
            // })
            // 更多事件，就更多处理函数
        })
    },
    senMsg:function (userId) {
        socketio[userId+'1'] && socketio[userId+'1'].emit('newMessage');
        socketio[userId+'2'] && socketio[userId+'2'].emit('newMessage');
        socketio[userId+'3'] && socketio[userId+'3'].emit('newMessage')
    },
    cancelMsg:function (userId) {
        socketio[userId+'1'] && socketio[userId+'1'].emit('cancelMessage');
        socketio[userId+'2'] && socketio[userId+'2'].emit('cancelMessage');
        socketio[userId+'3'] && socketio[userId+'3'].emit('cancelMessage')
    }
};

// 获取io



module.exports = socketio;