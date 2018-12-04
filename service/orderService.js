/**
 * 订单处理器
 * Created by chenda on 2016/10/23.
 */

const dao = require("../dao/dao");


//添加订单信息
exports.addOrder = async function(request,reply){
    var user = request.auth.credentials;
    var order = request.payload;
    if(order.number<=0){
        reply({"message":"购买失败,您输入的商品的数量必须大于0！","statusCode":102,"status":false});
        return;
    };
    var product = await dao.findById(request,"product",order.productId);
    if(user.RabbitCoin<(product.rabbitCoin*order.number)){
        reply({"message":"购买失败,您的火兔币不足！","statusCode":102,"status":false});
        return;
    };
    if(order.number>product.number){
        reply({"message":"购买失败,商品数量不足！","statusCode":102,"status":false});
        return;
    };
    order.userId = user._id+"";
    order.user = user.username;
    order.userMobile = user.mobile;
    order.product = product;
    order.status = 1; //下单成功未发货
    order.rabbitCoin = product.rabbitCoin*order.number;
    order.createTime = new Date().getTime();
    order.expressNumber="";
    order.express="";
    await dao.updateOne(request,"product",{_id:product._id+""},{number:product.number-order.number});
    await dao.updateOne(request,"user",{"_id":user._id+""},{RabbitCoin:user.RabbitCoin-product.rabbitCoin*order.number});
    var result = await dao.save(request,"order",order);
    
    if(result==null){
        reply({"message":"购买失败","statusCode":102,"status":false});
    }else{
        reply({"message":"购买成功","statusCode":101,"status":true});
    }
}

//删除订单
exports.delOrder = async function(request,reply){
    var result = await dao.del(request,"order",{"_id":request.params.id});
    if(result==null){
        reply({"message":"删除订单失败","statusCode":104,"status":false});
    }else{
        reply({"message":"删除订单成功","statusCode":103,"status":true});
    }
}

//更新订单
exports.updateOrder = async function(request,reply){
    var result = await dao.updateOne(request,"order",{"_id":request.params.id},request.payload);
    if(result==null){
        reply({"message":"更新订单失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新订单成功","statusCode":105,"status":true});
    }
}

//获取某个order
exports.getOrder =async function(request,reply){
    const order = await dao.findById(request,"order",request.params.id);
    if(order == null){
        reply({"message":"没有查到该订单！","statusCode":108,"status":false});
    }else{
        dao.updateOne(request,"order",{"_id":request.params.id},{"volume":order.volume+7});
        reply({"message":"查找订单成功","statusCode":107,"status":true,"resource":order});
    }
}
//获取我的订单列表
exports.getOrderMyList = async function(request,reply){
    var user = request.auth.credentials;
    //列表
    var data = await dao.find(request,"order",{userId:user._id+""},{},{createTime:-1});
    //总数
    var sum = await dao.findCount(request,"order",{userId:user._id+""});
    if(data == null){
        reply({"message":"查找订单列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找订单列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//获取orderlist
exports.getAllOrderList = async function(request,reply){
    var data = await dao.find(request,"order",{},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数-----------------
    var sum = await dao.findCount(request,"order");
    console.log(sum);
    if(data == null){
        reply({"message":"查找订单列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找订单列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}


//搜索订单列表
exports.searchOrder = async function(request,reply){
    //列表
    var data = await dao.find(request,"order",{"state":2,$or:[{"title":eval("/"+request.payload.keyword+"/")},{"userName":eval("/"+request.payload.keyword+"/")}]},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"order",{"state":2,$or:[{"title":eval("/"+request.payload.keyword+"/")},{"userName":eval("/"+request.payload.keyword+"/")}]});
    if(data == null){
        reply({"message":"搜索订单列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"搜索订单列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}
//流水记录
async function goldList(request,userId,number,gold,type){
    var goldUser = await dao.findById(request,"user",userId);
    var arr = [1,5,6,7,8,10,11,13,16];
    if (arr.indexOf(type)>=0){
        var goldSum = gold+number;
    }else{
        var goldSum = gold-number;
    };
    var goldRecord={
            userId:userId,
            username:goldUser.user_name,
            createTime:new Date().getTime(),
            number:number,
            gold:goldSum,
            type:type//1：仙果回收 2：仙果复投 3：点亮生肖 4:激活用户 5：直推奖 6:拆分收益 7：领导奖 8:挂单或者往外面交易 9：获得转账,10,未成功退回,11撤销订单，12仙果换购,13,后台充值14：后台扣除，15：游戏消耗16：游戏获得
        }
    await dao.save(request,"goldRecord",goldRecord);
}