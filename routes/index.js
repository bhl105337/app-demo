var express = require('express');
var router = express.Router();
var index = require("../DAO/index");

/* GET home page. */
router.get('/', function (req, res, next) {
    // console.log(1);
    // console.log(res.render());
    // // console.log(next);
    res.json({s: 1})

    // 传递参数sql执行，调用函数在文件夹DAO里面调用的index.js文件carousel函数
    // index.carousel(242,function (result) {
    //     res.json(result)
    // });
    // res.type('html');//渲染html模板
    // res.render('index', { title: 'Express' });
});

module.exports = router;
