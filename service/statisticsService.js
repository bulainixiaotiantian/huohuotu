
/**
 * 信息处理器
 * Created by chenda on 2017/3/9.
 */
 const dao = require("../dao/dao");

//返回数据
exports.today = async function (request,reply){
    var weekaddUser =await weekAddUser(request);//今日新增
    var plantsums = await plantSums(request);
    var todayaddUser = await todayAddUser(request);
    plantsums.todayAddUser = todayaddUser;
    let resource = {
        weekAddUser:weekaddUser,
        allShuju:plantsums
    }
    reply({"message":"查询统计资源成功！","statusCode":107,"status":true,resource:resource});
}


// //统计今日新增用户数据
async function todayAddUser(request){
    let dateTime = new Date(format("yyyy/M/d",new Date())).getTime();
	//总数
    var sum = await dao.findCount(request,"user",{createTime:{$gt:dateTime}});
    return sum;
}
async function plantSums(request){
    var sum = await dao.findCount(request,"user",{});//获取所有用户量
    var plantSum = await dao.findCount(request,"warren",{});//获取土地量
    var basisSum = 0;
    var goldSum =  await dao.findSum(request,"user",{$match:{}},{$group:{_id:null,sum:{$sum:"$RabbitCoin"}}});
    goldSum=goldSum.length==0?0:goldSum[0].sum;//火兔币总数
    // var shopGold =  await dao.findSum(request,"user",{$match:{}},{$group:{_id:null,sum:{$sum:"$shopGold"}}});
    // shopGold=shopGold.length==0?0:shopGold[0].sum;//购物积分总数
    // var zhongtu =  await dao.findSum(request,"user",{$match:{}},{$group:{_id:null,sum:{$sum:"$zhongtu"}}});
    // zhongtu=zhongtu.length==0?0:zhongtu[0].sum;//种兔总数
    // var xiaotu =  await dao.findSum(request,"user",{$match:{}},{$group:{_id:null,sum:{$sum:"$xiaotu"}}});
    // xiaotu=xiaotu.length==0?0:xiaotu[0].sum;//小兔总数
    // var jueyu =  await dao.findSum(request,"user",{$match:{}},{$group:{_id:null,sum:{$sum:"$jueyu"}}});
    // jueyu=jueyu.length==0?0:jueyu[0].sum;//绝育总数
    var routu =  await dao.findSum(request,"depot",{$match:{}},{$group:{_id:null,sum:{$sum:"$rabbitB"}}});
    routu=routu.length==0?0:routu[0].sum;//肉兔总数
    var guquan =  await dao.findSum(request,"depot",{$match:{}},{$group:{_id:null,sum:{$sum:"$rabbitC"}}});
    guquan=guquan.length==0?0:guquan[0].sum;//股权总数
    // var yanglao =  await dao.findSum(request,"user",{$match:{}},{$group:{_id:null,sum:{$sum:"$yanglao"}}});
    // yanglao=yanglao.length==0?0:yanglao[0].sum;//养老院总数
    var xiaotuwoYiyong =  await dao.findCount(request,"userRabbit",{rabbitType:"rabbitC"});//放羊小兔子
    xiaotuwoYiyong=xiaotuwoYiyong
    var tuwoYiyong =  await dao.findCount(request,"userRabbit",{rabbitType:"rabbitB"});//放羊种兔子
    tuwoYiyong=tuwoYiyong
    var userAllList = {
        createTime : new Date().getTime(),
        userSum : sum,
        goldSum : goldSum,
        // zhongtu:zhongtu,
        // xiaotu:xiaotu,
        // jueyu:jueyu,
           routu:routu,  //仓库种兔的个数
           guquan:guquan, //guquan仓库小兔的个数
        // yanglao:yanglao,
        xiaotuwoYiyong:xiaotuwoYiyong,
        tuwoYiyong:tuwoYiyong
    }
    return userAllList;
}
//近七日新增用户数量查询
async function weekAddUser(request){
    //查询倒叙
    var users = await dao.find(request,"userRecord",{},{},{createTime:-1},12,1);
    return users;
}
//时间格式化
function format(fmt,data) { //author: meizz 
    var o = {
        "M+": data.getMonth() + 1, //月份 
        "d+": data.getDate(), //日 
        "h+": data.getHours(), //小时 
        "m+": data.getMinutes(), //分 
        "s+": data.getSeconds(), //秒 
        "q+": Math.floor((data.getMonth() + 3) / 3), //季度 
        "S": data.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (data.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
