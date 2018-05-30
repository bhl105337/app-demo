var router = require('express').Router();
var page = require("../DAO/page");

router.get('/gamePage', function (req, res, next) {
    var pageCount = 0;//总页数
    var sizeCount = 0;//总条数，总行数
    var p_num = 10;//每页显示数量，输出大小，暂定10条
    var lastPage = "";//是否最后一页
    var firstPage = "";//是否第一页
    var arr = {};//最后返回
    var p = 1;//当前页数,默认第一页
    var nextPage = 2;//下一页
    var prevPage = 1;//上一页

    if (parseFloat(req.query.p) > 0) {
        p = parseFloat(req.query.p);//当前页数
        nextPage = p + 1;//下一页
        prevPage = p - 1;//上一页
        if (p <= 1) {//没有上一页
            prevPage = 1;
            firstPage = 1
        }
    } else {
        firstPage = 1
    }

    page.getGamePageCount(function (resultCount) {
        sizeCount = resultCount.length;//总记录数
        // res.json({pageCount: pageCount});
        if (sizeCount > 0) {
            pageCount = sizeCount % p_num == 0 ? sizeCount / p_num : sizeCount / p_num + 1;//总页数

            pageCount = parseInt(pageCount);//去除小数点
            if (pageCount < p) {//当传递的页数大于最大的页数时固定在最后一页
                p = pageCount;
                prevPage = pageCount - 1;
            }
            // 传递参数sql执行，调用函数在文件夹DAO里面调用的index.js文件carousel函数
            // p当前页数，p_mun每页显示条数，暂定为10条
            page.getgamePage(p, p_num, function (result) {
                if (result.length < p_num) {
                    lastPage = 1;//没有下一页
                }
                arr = {
                    result: result,//当前页的记录
                    nowPage: p,//当前页
                    firstPage: firstPage,//判断是否为首页
                    lastPage: lastPage,//判断是否为尾页
                    nextPage: nextPage,//下一页
                    prevPage: prevPage,//上一页
                    totalPage: pageCount//总页数
                };
                res.json(arr)
            });
        }
    })

});

module.exports = router;