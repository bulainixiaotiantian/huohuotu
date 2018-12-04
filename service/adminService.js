/**
 * 管理员服务层
 * Created by chenda on 2016/4/30.
 */

const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");


//管理员登录
exports.Login = function(request,reply){
    var admin = request.auth.credentials;
    delete admin.password;
    reply({"message":"登陆成功","statusCode":107,"status":true,"resource":request.auth.credentials});
}


//添加管理员 
//问题？添加管理员不需要判断管理员账号在管理员列表里是否已经存在吗？

exports.addAdmin = async function(request,reply){
    var admin = request.payload;
    admin.roleName = "";
    admin.createTime = new Date().getTime();
    admin.scope = ["ADMIN"];
    admin.password = CryptoJS.AES.encrypt(admin.password,"AiMaGoo2016!@.")+"";
    var result = await dao.save(request,"admin",admin);
    if(result==null){
        reply({"message":"添加管理员失败","statusCode":102,"status":false});
    }else{
        reply({"message":"添加管理员成功","statusCode":101,"status":true,"resource":result.ops[0]});
    };
}

//获取某个用户
exports.getUser = function(request,reply){
    var db = request.server.plugins['hapi-mongodb'].db;
    var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
    db.collection('user').findOne({"_id":new ObjectID(request.params.id)},{"password":0},function(err,result){
        if(err){
            request.server.log(['error'],err);
            throw err;
            reply({"message":"查找用户失败","statusCode":108,"status":false});
        }else{
            reply({"message":"查找用户成功","statusCode":107,"status":true,"resource":result});
        }
    });
}
//获取充值记录
exports.getAllPayList = async function(request,reply){
    var data = await dao.find(request,"payOrder",request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"payOrder",request.payload.where);
    if(data == null){
        reply({"message":"查找充值记录","statusCode":108,"status":false});
    }else{
        reply({"message":"查找充值记录","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}
//搜索用户仓库
exports.searchDepot=async function(request,reply){
    var data = await dao.find(request,"depot",request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"depot",request.payload.where);
    if(data == null){
        reply({"message":"查找失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}
//搜索兑换记录
exports.searchDuiHuan=async function(request,reply){
    var data = await dao.find(request,"duiHuanJiLu",request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"duiHuanJiLu",request.payload.where);
   var goldSum = await dao.findSum(request,"duiHuanJiLu",{$match:{rabbitCoinNum:{$gt:0}}},{$group:{_id:null,sum:{$sum:"$rabbitCoinNum"}}});
    var aa = {
        goldSum:goldSum==0?0:goldSum[0].sum,//全部的充值金额
    };
    if(data == null){
        reply({"message":"搜索兑换记录失败","statusCode":102,"status":false});
    }else{
        reply({"message":"搜索兑换记录成功","statusCode":101,"status":true,"resource":data,"sum":sum,"aa":aa});
    }
}
//搜索未完成交易
exports.getAllnoTran=async function(request,reply){
    var data = await dao.find(request,"transaction",request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"transaction",request.payload.where);
    var goldSum = await dao.findSum(request,"transaction",{$match:{rabbitCoinNum:{$gt:0}}},{$group:{_id:null,sum:{$sum:"$rabbitCoinNum"}}});
    var aa = {
        goldSum:goldSum==0?0:goldSum[0].sum,//全部的充值金额
    };
    if(data == null){
        reply({"message":"搜索已完成交易记录失败","statusCode":102,"status":false});
    }else{
        reply({"message":"搜索已完成交易记录成功","statusCode":101,"status":true,"resource":data,"sum":sum,"aa":aa});
    }

}
//获取所有用户已购买的记录
exports.getallBoughtTran=async function(request,reply){

    var data = await dao.find(request,"transactionRecord",request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"transactionRecord");
       var goldSum = await dao.findSum(request,"transactionRecord",{$match:{rabbitCoinNum:{$gt:0}}},{$group:{_id:null,sum:{$sum:"$rabbitCoinNum"}}});
    var aa = {
        goldSum:goldSum==0?0:goldSum[0].sum,//全部的充值金额
    };
    if(data == null){
        reply({"message":"搜索已完成交易记录失败","statusCode":102,"status":false});
    }else{
        reply({"message":"搜索已完成交易记录成功","statusCode":101,"status":true,"resource":data,"sum":sum,"aa":aa});
    }

}
exports.searchDingDan=async function(request,reply){
    var data = await dao.find(request,"order",request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"order",request.payload.where);
    if(data == null){
        reply({"message":"查找失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}


//获取某个shop
exports.getShopOne=async function(request,reply){
    //列表
    var result = await dao.findById(request,"shop",request.params.id);
    if(result == null){
        reply({"message":"查找公告信息列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找公告信息列表成功","statusCode":107,"status":true,"resource":result});
    }
}

//获取某个shop
exports.getPackactOne=async function(request,reply){
    //列表
    var result = await dao.findById(request,"packageType",request.params.id);
    if(result == null){
        reply({"message":"查找套餐列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找套餐信息列表成功","statusCode":107,"status":true,"resource":result});
    }
}

//获取某个订单
exports.getOrderOne=async function(request,reply){
    //列表
    var result = await dao.findById(request,"order",request.params.id);
    if(result == null){
        reply({"message":"获取某个订单失败","statusCode":108,"status":false});
    }else{
        reply({"message":"获取某个订单成功","statusCode":107,"status":true,"resource":result});
    }
}

//管理员修改套餐商城信息
exports.editTaoCan=async function(request,reply){
    var data=request.payload;
    var taoCan=await dao.findById(request,"packageType",request.params.id);
     if(taoCan==null){
        reply({"message":"修改套餐失败","statusCode":102,"status":false});
        return;
    }else{
        var result=await dao.updateOne(request,"packageType",{_id:request.params.id},data);
        if(result){
            reply({"message":"修改套餐成功","statusCode":101,"status":true});
            return;
        }else{
            reply({"message":"修改套餐失败","statusCode":102,"status":false});
            return;
        }
       
    }

}
//管理员修改奖励参数
exports.editJiangLiSet=async function(request,reply){
    var data=request.payload;
    var taoCan=await dao.findById(request,"systemSetJiling",request.params.id);
     if(taoCan==null){
        reply({"message":"修改奖励参数失败","statusCode":102,"status":false});
        return;
    }else{
        var result=await dao.updateOne(request,"systemSetJiling",{_id:request.params.id},data);
        if(result){
            reply({"message":"修改奖励参数成功","statusCode":101,"status":true});
            return;
        }else{
            reply({"message":"修改奖励参数失败","statusCode":102,"status":false});
            return;
        }
       
    }

}
//获得奖励参数
exports.getJiangLiSet=async function(request,reply){
    var data=await dao.findOne(request,"systemSetJiling");
     if(data==null){
        reply({"message":"获取奖励参数失败","statusCode":102,"status":false});
        return;
    }else{
        reply({"message":"获取奖励参数成功","statusCode":101,"status":true,"resource":data});
        return;
    }
}
//获取等价火兔币参数成功
exports.getSystemSet=async function(request,reply){
    var data=await dao.findOne(request,"systemSet");
     if(data==null){
        reply({"message":"获取等价火兔币参数失败","statusCode":102,"status":false});
        return;
    }else{
        reply({"message":"获取等价火兔币参数成功","statusCode":101,"status":true,"resource":data});
        return;
    }
}
//获取提现手续参数
exports.getTiXianSet=async function(request,reply){
    var data=await dao.findOne(request,"systemTiXianShouXu");
     if(data==null){
        reply({"message":"获取提现手续参数失败","statusCode":102,"status":false});
        return;
    }else{
        reply({"message":"获取提现手续参数成功","statusCode":101,"status":true,"resource":data});
        return;
    }
}

//管理修改提现手续费
exports.editTixianFei=async function(request,reply){
     var data=request.payload;
     var result=await dao.updateOne(request,"systemTiXianShouXu",{_id:request.params.id},data);

     if(result){
        reply({"message":"修改提现手续费成功","statusCode":101,"status":true});
        await dao.updateMore(request,"user",{},data);
        return;
    }else{
        reply({"message":"修改提现手续费失败","statusCode":102,"status":false});
        return;
    }
}
//管理修改等价火兔币参数
exports.editsystemSet=async function(request,reply){
     var data=request.payload;
     var result=await dao.updateOne(request,"systemSet",{_id:request.params.id},data);

     if(result){
        reply({"message":"修改等价火兔币参数成功","statusCode":101,"status":true});
        await dao.updateMore(request,"user",{},data);
        return;
    }else{
        reply({"message":"修改等价火兔币参数失败","statusCode":102,"status":false});
        return;
    }
}

//管理员修改实体商城信息
exports.editShop=async function(request,reply){
    var data=request.payload;

    var taoCan=await dao.findById(request,"shop",request.params.id);
     if(taoCan==null){
        reply({"message":"修改商品失败，您找的商品不存在","statusCode":102,"status":false});
        return;
    }else{

        var result=await dao.updateOne(request,"shop",{_id:request.params.id},data);
        if(result){
            reply({"message":"修改商品成功","statusCode":101,"status":true});
            return;
        }else{
            reply({"message":"修改商品失败，请重试","statusCode":102,"status":false});
        }
       
    }

}


//管理员增加商品
exports.addShop=async function(request,reply){
    var data=request.payload;
    var result=await dao.save(request,"shop",data);
    if(result == null){
        reply({"message":"添加商品失败！请重试","statusCode":102,"status":false});
    }else{
        reply({"message":"添加商品成功","statusCode":101,"status":true});
    }
}

//管理员删除某个商品
exports.delShop=async function(request,reply){
    
    var result = await dao.del(request,"shop",{"_id":request.params.id});
    if(result==null){
        reply({"message":"删除商品失败","statusCode":102,"status":false});
    }else{
        reply({"message":"删除商品成功","statusCode":101,"status":true});
    };
}
//管理员获取所有的提现申请列表
// exports.allSafeList=async function(request,reply){
//     //列表
//     var data = await dao.find(request,"safeList",{},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
//     //总数
//     var sum = await dao.findCount(request,"safeList",{});
//     var goldSum = await dao.findSum(request,"safeList",{$match:{number:{$gt:0}}},{$group:{_id:null,sum:{$sum:"$number"}}});
//     var aa = {
//         goldSum:goldSum==0?0:goldSum[0].sum,//全部的充值金额
//     };
//     var sum = await dao.findCount(request,"safeList");
//     if(data == null){
//         reply({"message":"查找提现列表失败","statusCode":108,"status":false});
//     }else{
//         reply({"message":"查找提现列表成功","statusCode":107,"status":true,"resource":data,"sum":sum,"aa":aa});
//     }
// }
//管理员获取所有的提现申请列表
exports.allSafeList=async function(request,reply){
    //列表
    var data = await dao.find(request,"safeList",request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"safeList",request.payload.where);
    if(data == null){
        reply({"message":"查找提现列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找提现列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}
//更新用户的提现申请-----------
exports.updateSafe=async function(request,reply){
    //var user=request.auth.credentials;
    //console.log(request.params.id);
    var safe = await dao.findById(request,"safeList",request.params.id);
    var user = await dao.findById(request,"user",safe.userId);
    var result = null;
    if(safe.status!=0){
        reply({"message":"请勿重复操作","statusCode":105,"status":true});
        return;
    }else{
        result = await dao.updateOne(request,"safeList",{"_id":request.params.id},request.payload);
        if(request.payload.status==2){
            var result = await dao.updateOne(request,"user",{_id:safe.userId},{RabbitCoin:user.RabbitCoin+safe.number+safe.shouxufei});
        };
        if(result!=null){
            reply({"message":"更新提现成功","statusCode":105,"status":true});
        }else{
            reply({"message":"更新提现失败","statusCode":106,"status":false});
        };
    };
}

//获取管理员list
exports.getAdminList = async function(request,reply){
    //列表
    var data = await dao.find(request,"admin",{"state":1},{"password":0},{createTime:-1});
    //总数
    var sum = await dao.findCount(request,"admin",{"state":1});
    if(data == null){
        reply({"message":"查找管理员列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找管理员列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}
//获取所有用户的奖励记录
exports.getAlljiangLiJiLu=async function(request,reply){
    var data=await dao.find(request,"jiangLiJiLu",{},{},{createTime:-1});
    var sum = await dao.findCount(request,"jiangLiJiLu");
    if(data == null){
        reply({"message":"获取所有用户的奖励记录失败","statusCode":108,"status":false});
    }else{
        reply({"message":"获取所有用户的奖励记录成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    };
}
//获得前端用户user列表
exports.getUserList=async function(request,reply){
    var data = await dao.find(request,"user",{},{"password":0},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"user");
    if(data == null){
        reply({"message":"查找管理员列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找管理员列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    };
}

//获得前端用户在养殖的兔子列表
exports.getRabbitList=async function(request,reply){
    var data = await dao.find(request,"userRabbit",{},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"userRabbit");
    if(data==null){
        reply({"message":"查找在养殖兔子列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找在养殖兔子列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    };
}

//获得前端用户在养殖的兔子列表
exports.getDepotList=async function(request,reply){
    var data = await dao.find(request,"depot",{},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"depot");
    if(data==null){
        reply({"message":"查找在养殖兔子列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找在养殖兔子列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    };
}

exports.getOneDepot=async function(request,reply){
   //列表
    var data = await dao.find(request,"user",request.payload.where,{"password":0},{},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"user",request.payload.where);

    if(data == null){
        reply({"message":"搜索资源列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"搜索资源列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//更新管理员
exports.updateAdmin = async function(request,reply){
    var admin = request.payload;
    console.log(admin);
    if(admin.password){
        admin.password = CryptoJS.AES.encrypt(admin.password,"AiMaGoo2016!@.")+"";
    }
    console.log(admin);
    var result = await dao.updateOne(request,"admin",{"_id":request.params.id},admin);
    if(result==null){
        reply({"message":"更新管理员失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新管理员成功","statusCode":105,"status":true});
    }
}

//删除管理员
exports.delAdmin = async function(request,reply){

    var result = await dao.del(request,"admin",{"_id":request.params.id});
    if(result==null){
        reply({"message":"删除管理员失败","statusCode":104,"status":false});
    }else{
        reply({"message":"删除管理员成功","statusCode":103,"status":true});
    }
}
// var number = 0;
// exports.bianli = async function(request,reply){
//     var list = await dao.find(request,"user",{teamNumber:NaN});
//     //console.log(list);
//     for(let i =0;i<list.length;i++){
//         number = 0;
//         await dedai2(list[i],request);
//         await dao.updateOne(request,"user",{_id:list[i]._id+""},{teamNumber:number});
//     };
//     reply({"message":"成功","statusCode":103,"status":true});
// }

// async function dedai2(parent,request){
//     const userList = await dao.find(request,"user",{parentUsername:parent.username});
//     for(let i =0;i<userList.length;i++){
//         number = number+1;
//         await dedai2(userList[i],request);
//     }    
// }
exports.aaaa = async function(request,reply){
    var systemSet = await dao.find(request,"systemSet");
    var time = new Date(format("yyyy/M/d",new Date())).getTime()-86400000;
    var oneUp = await dao.find(request,"futuresList",{createTime:{$gte:time},seedType:1},{},{createTime:1});
    var oneDown = await dao.find(request,"futuresList",{createTime:{$gte:time},seedType:1},{},{createTime:-1});
    var aa={};
    aa.oneUp=oneUp==0?0:oneUp[0].seedNumber;
    aa.oneDown=oneDown==0?0:oneDown[0].seedNumber;
    reply({"message":"成功","statusCode":103,"status":true,resource:systemSet,"aa":aa});
}
exports.bianli3 = async function(request,reply){
    reply({"resource":4});
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
// // exports.bianli = async function(request,reply){
// //     var aa = await dao.findCount(request,"growthRecord",{createTime:{$gte:1507564800000}});
// //     console.log(aa);
// //     var list = await dao.find(request,"growthRecord",{createTime:{$gte:1507564800000}});
// //     //console.log(list);
// //     for(let i =0;i<list.length;i++){
// //         var user = await dao.findById(request,"user",list[i].userId);
// //         await dao.updateOne(request,"user",{_id:user._id+""},{gold:user.gold-list[i].number,totalRevenue:user.totalRevenue-list[i].number,totalSteal:user.totalSteal-list[i].number});
// //         await dao.del(request,"growthRecord",{"_id":list[i]._id+""});
// //     };
// //     reply({"message":"成功","statusCode":103,"status":true});
// // }
// exports.bianli = async function(request,reply){
//     var aa = await dao.findCount(request,"user",{gold:{$lt:0}});
//     var list = await dao.find(request,"user",{gold:{$lt:0}});
//     console.log(aa);
//     for(let i =0;i<list.length;i++){
//         var user = await dao.find(request,"plant",{userId:list[i]._id+""});
//         await dao.updateOne(request,"user",{_id:list[i]._id+""},{gold:0});
//         let b = Math.abs(Math.floor((list[i].gold*100)/100));
//         console.log(b);
//         await dao.updateOne(request,"plant",{_id:user[0]._id+""},{number:user[0].number-b});
//     };
//     reply({"message":"成功","statusCode":103,"status":true});
// }