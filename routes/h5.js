var express = require('express');
var router = express.Router();
var PATH=require("../path");
var h5=require('../DAO/h5');
router.get("/getH5",function (req,res,next) {
   h5.getH5(req.query.page,function (result) {
       res.json({state:1,h5:result})
   })
});
router.get("/getH5ByMsg",function (req,res,next) {
    if(req.query.msg){
        h5.getH5ByMsg(req.query.msg,function (result) {
            res.json({state:1,h5:result})
        })
    }
});
router.get('/addMyH5',function (req,res) {
   var data =req.query;
   if(data.userId && data.gameId ){
       h5.addMyH5(data.userId,data.gameId,function (result) {
           res.json({state:1})
       })
   }else {
       res.json({state:0})
   }
});
module.exports = router;