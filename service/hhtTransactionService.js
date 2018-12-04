/**
 * 交易记录处理器
 * Created by chenda on 2016/10/23.
 */
const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");

//用户进入交易信息界面------火兔币----------

exports.enterTransact=async function(request,reply){
    var user=request.auth.credentials;
    if(user.state==0){
        reply({"message":"交易失败，您的账户已经被冻结","statusCode":102,"status":false});
        return;
    };
    var requestData=request.payload;
    var rabbitCoinNum=requestData.rabbitCoinNum;
    //找到用户系统参数
     var systemSet=await dao.findOne(request,"systemSet");
    //找到交易对象
    var buyer=await dao.findOne(request,"user",{username:requestData.buyerName});
    if(requestData.number<=0){
        reply({"message":"交易失败，请输入正确的商品数量","statusCode":"102","status":false});
        return;
    };
    if(rabbitCoinNum<=0){    
        reply({"message":"交易失败，自定义的交易金额必须大于零","statusCode":"102","status":false});
        return;
    };
    if(buyer==null){
        reply({"message":"交易失败，您交易的对方账号不存在","statusCode":"102","status":false});
        return;
    }else if(requestData.buyerName==user.username){
        reply({"message":"交易失败，您不能跟自己交易！","statusCode":102,"status":false});
        return;
    };
    if(requestData.tranpwd){
        if(requestData.tranpwd!=CryptoJS.AES.decrypt(user.tranpwd,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8)){
            reply({"message": "交易密码不正确，请重试！", "statusCode": 102, "status": false});
            return;
        };
    };
    var depotuser=await dao.findOne(request,"depot",{userId:user._id+""});
        var transactData={
            "buyerName":buyer.username,
            "buyerNiCheng":buyer.name,
            "buyerId":buyer._id+"",
            "buyerwechat" :buyer.wechat,
            "buyMobile":buyer.mobile,
            "shouxufei": 0,
            "productType":requestData.type,//1是胡萝卜 2是火火兔
            "number":requestData.number,  //交易商品总数量
            "rabbitCoinNum":rabbitCoinNum, //交易的总火兔币金额
            "createName":user.username,
            "sellerName" :user.username,
            "sellerNiCheng":user.name,
            "sellerId":user._id+"",
            "status":0,         // 0 未确认 2交易关闭  3交易成功  
            "sellerwechat" :user.wechat,
            "sellerMoblie":user.mobile,
            "outTime": new Date().getTime()+86400000*5,  // 过期时间
            "createTime" : new Date().getTime()
        };
        if(requestData.type==1){    // 1 交易类型为胡萝卜  2 交易类型火火兔
            if(rabbitCoinNum==0){     //如果用户没有设置交易金额，以系统设置为准
                 transactData.rabbitCoinNum=systemSet.carrot*requestData.number;
            };
            if(requestData.number>user.carrot){
                reply({"message":"进入交易失败,您的萝卜数量少于交易数量","statusCode":102,"status":false})
                return;
            };
            await dao.updateOne(request,"user",{_id:user._id},{carrot:user.carrot-requestData.number});
        }else if(requestData.type==2){                                           
            if(rabbitCoinNum==0){     //如果用户没有设置交易金额，以系统设置为准     
                transactData.rabbitCoinNum=systemSet.rabbitC*requestData.number;
            };
            if(requestData.number>depotuser.rabbitC){
                reply({"message":"确认交易失败,您仓库里可交易的小小火兔数量不足","statusCode":102,"status":false});
                return;
            };
            await dao.updateOne(request,"depot",{_id:depotuser._id},{rabbitC:depotuser.rabbitC-requestData.number});
        };
        //建立交易记录
        var result = await dao.save(request,"transaction",transactData); 
        var resulta=await dao.findById(request,"transaction",result.ops[0]._id+"");
        reply({"message": "添加交易成功等待买家确认,5天后未确认关闭交易,并返回给卖家交易的商品", "statusCode": 101,"status":true, "resource": resulta});
        return;
        
    };
//用户确认交易--------------火兔币---------------
exports.makeSureTransact=async function(request,reply){
    var user=request.auth.credentials;
    if(user.state==0){
        reply({"message":"确认失败，您的账户已经被冻结","statusCode":102,"status":false});
        return;
    };
    var result = await dao.findById(request,"transaction",request.params.id);
    if(result==null){
        reply({"message":"确认交易失败,没有正在处理的交易","statusCode":102,"status":false});
        return;
    };
    //找到用户系统参数
    var systemSet=await dao.findOne(request,"systemSet");
    //找到卖方
    var Seller=await dao.findById(request,"user",result.sellerId);
    var buyer=await dao.findById(request,"user",result.buyerId);
    var depotuser=await dao.findOne(request,"depot",{userId:user._id+""});
    var buyerDepot=await dao.findOne(request,"depot",{userId:result.buyerId});
    var sellerDepot=await dao.findOne(request,"depot",{userId:result.sellerId});

    if(result.productType==1){  //交易的是胡萝卜
        if(result.buyerId==user._id+""){  //用户是买方
            await dao.updateOne(request,"transaction",{_id:result._id},{status:1});
                if(result.rabbitCoinNum>user.RabbitCoin){
                    reply({"message":"确认交易失败,您的火兔币数量不足","statusCode":102,"status":false});
                    return;
                };
                if(result.number>Seller.carrot){
                    reply({"message":"确认交易失败,卖方胡萝卜不足","statusCode":102,"status":false});
                    return;
                };
                await dao.updateOne(request,"user",{_id:user._id},{"RabbitCoin":user.RabbitCoin-result.rabbitCoinNum,"carrot":user.carrot+result.number});
                await dao.updateOne(request,"user",{_id:result.sellerId},{"RabbitCoin":Seller.RabbitCoin+result.rabbitCoinNum});
                
                await dao.updateOne(request,"transaction",{_id:request.params.id},{status:3});
                var tran=await dao.findById(request,"transaction",request.params.id);

                await dao.save(request,"transactionRecord",tran);
                await dao.del(request,"transaction",{_id:request.params.id});
                reply({"message":"交易成功","statusCode":101,"status":true})
                return;
        }else{//用户是卖方
            reply({"message":"等待买家确认","statusCode":101,"status":true})
            return;
        }
    }else if(result.productType==2){//交易的是火火兔
         if(result.buyerId==user._id+""){
            await dao.updateOne(request,"transaction",{_id:result._id},{status:1});
            if(result.rabbitCoinNum>user.RabbitCoin){
                reply({"message":"确认交易失败,您的火兔币数量不足","statusCode":102,"status":false})
                return;
            };
            if(result.number>sellerDepot.rabbitC){
                reply({"message":"确认交易失败,卖方小小兔不足","statusCode":102,"status":false})
                return;
            };
            await dao.updateOne(request,"user",{_id:user._id},{"RabbitCoin":user.RabbitCoin-result.rabbitCoinNum});
            await dao.updateOne(request,"user",{_id:result.sellerId},{"RabbitCoin":Seller.RabbitCoin+result.rabbitCoinNum});
            await dao.updateOne(request,"depot",{_id:depotuser._id},{"rabbitC":depotuser.rabbitC+result.number});
           // await dao.updateOne(request,"depot",{_id:sellerDepot._id},{"rabbitC":sellerDepot.rabbitC-result.number});  

            await dao.updateOne(request,"transaction",{_id:request.params.id},{status:3});
            var tran=await dao.findById(request,"transaction",request.params.id);
                  
            await dao.save(request,"transactionRecord",tran);
            await dao.del(request,"transaction",{_id:request.params.id});
            reply({"message":"交易成功","statusCode":101,"status":true})
            return;
        }else{
            reply({"message":"等待买家确认","statusCode":101,"status":true})
            return;
        }
    }
    
}
//----------------进入交易 线下交易--------------------
exports.enterTran=async function(request,reply){
     var user=request.auth.credentials;
    var requestData=request.payload;
    var rabbitCoinNum=requestData.rabbitCoinNum;   
    //找到用户系统参数  
     var systemSet=await dao.findOne(request,"systemSet");
    //找到交易对象
    var buyer=await dao.findOne(request,"user",{username:requestData.buyerName});
    if(buyer==null){
        reply({"message":"交易失败，您交易的对方账号不存在","statusCode":"102","status":false});
        return;
    }else if(requestData.buyerName == user.username){
        reply({"message":"交易失败，您不能跟自己交易！","statusCode":102,"status":false});
        return;
    };
    if(requestData.tranpwd){
        if(requestData.tranpwd!=CryptoJS.AES.decrypt(user.tranpwd,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8)){
            reply({"message": "交易密码不正确，请重试！", "statusCode": 102, "status": false});
            return;
        };
    };
    var depotuser=await dao.findOne(request,"depot",{userId:user._id+""});
        var transactData={
            "buyerName":buyer.username,
            "buyerNiCheng":buyer.name,
            "buyerId":buyer._id+"",
            "buyerwechat" :buyer.wechat,
            "buyMobile":buyer.mobile,
            "shouxufei": 0,
            "productType":requestData.type,//1是胡萝卜 2是火火兔
            "number":requestData.number,  //交易商品总数量
            "rabbitCoinNum":rabbitCoinNum, //交易的单个火兔币金额
            "createName":user.username,
            "sellerName" :user.username,
            "sellerNiCheng":user.name,
            "sellerId":user._id+"",
            "status":1,         // 0 未确认 1确认 
            "sellerwechat" :user.wechat,
            "sellerMoblie":user.mobile,
            "outTime": new Date().getTime()+86400000*5,  // 过期时间
            "createTime" : new Date().getTime()
        };
        if(requestData.type==1){    // 1 交易类型为胡萝卜  2 交易类型火火兔
            if(rabbitCoinNum==0){     //如果用户没有设置交易金额，以系统设置为准默认交易胡萝卜金额是1
                 transactData.rabbitCoinNum=systemSet.carrot;
            };
            if(requestData.number>user.carrot){
                reply({"message":"进入交易失败,您的萝卜数量少于交易数量","statusCode":102,"status":false})
                return;
            };
            await dao.updateOne(request,"user",{_id:user._id},{carrot:user.carrot-requestData.number});
        }else if(requestData.type==2){                                           
            if(rabbitCoinNum==0){     //如果用户没有设置交易金额，以系统设置为准     
                transactData.rabbitCoinNum=systemSet.rabbitC;
            };
            if(requestData.number>depotuser.rabbitC){
                reply({"message":"确认交易失败,您仓库里可交易的火火兔数量不足","statusCode":102,"status":false});
                return;
            };
            await dao.updateOne(request,"depot",{_id:depotuser._id},{rabbitC:depotuser.rabbitC-requestData.number});
        };
        //建立交易记录
        var result = await dao.save(request,"transaction",transactData); 
        var resulta=await dao.findById(request,"transaction",result.ops[0]._id+"");
        reply({"message": "添加交易成功等待买家确认,5天后未确认关闭交易,并返回给卖家交易的商品", "statusCode": 101,"status":true, "resource": resulta});
        return;

}
//----------------确认交易 线下交易--------------------
exports.makeSureTran=async function(request,reply){
       var user=request.auth.credentials;
}


//只将仓库的复投的兔子转化成火兔币，------------------------------
exports.rabbitCToRabbitCoin=async function(request,reply){
    var user=request.auth.credentials;
    if(user.state==0){
        reply({"message":"操作失败，您的账户已经被冻结","statusCode":102,"status":false});
        return;
    };
    var time = new Date().getTime();
    var requestData=request.payload;
    var systemSet=await dao.findOne(request,"systemSet",{systemType:"toRabbitCoin"});
    //找到用户的仓库                    
    var userDepot=await dao.findOne(request,"depot",{userId:user._id+""});
    if(requestData.number<=0){
        reply({"message":"请输入正确的兔子的数量","statusCode":102,"status":false});
        return;
    }
    if(userDepot.rabbitC<requestData.number){
        reply({"message":"您仓库复投的兔子数量不足","statusCode":102,"status":false});
        return;
    };
    var jilu={
        userName:user.username,
        rabbitCoinNum:requestData.number*systemSet.rabbitC,
        rabbitCNum:requestData.number,
        createTime:time
    };
    await dao.updateOne(request,"depot",{_id:userDepot._id+""},{rabbitC:userDepot.rabbitC-requestData.number});
    await dao.updateOne(request,"user",{_id:user._id+""},{RabbitCoin:user.RabbitCoin+requestData.number*systemSet.rabbitC});
    await dao.save(request,"duiHuanJiLu",jilu);
    reply({"message":"转换火兔币成功","statusCode":101,"status":true});
    return;
};

// //将仓库的兔子转化成火兔币-购买的，复投的都可以转换火兔币
// exports.rabbitBCToRabbitCoin=async function(request,reply){
//     var user=request.auth.credentials;
//     var requestData=request.payload;
//     //找到用户的仓库

//     var userDepot=await dao.findOne(request,"depot",{userId:user._id+""});

//     //操作的是rabbitB购买来的兔子--------
//     if(requestData.type==1){
//         if(userDepot.rabbitB<requestData.number){
//             reply({"message":"仓库该类型兔子数量不足","statusCode":102,"status":false});
//             return;
//         } 
//         // await dao.updateOne(request,"depot",{_id:userDepot._id+""},{rabbitB:userDepot.rabbitB+requestData.number});
//         console.log(userDepot)
//         var result=await dao.updateOne(request,"depot",{_id:userDepot._id+""},{rabbitB:userDepot.rabbitB-requestData.number});
        
//         if(result==null){
//             reply("result错误")
//             return;
//         }
//         await dao.updateOne(request,"user",{_id:user._id+""},{RabbitCoin:user.RabbitCoin+requestData.number*200});
//     //操作的兔子是复投的兔子------------
//     }else if(requestData.type==2){
//         if(userDepot.rabbitC<requestData.number){
//             reply({"message":"仓库该类型兔子数量不足","statusCode":102,"status":false});
//             return;
//         }
//         await dao.updateOne(request,"depot",{_id:userDepot._id+""},{rabbitC:userDepot.rabbitC-requestData.number});
//         await dao.updateOne(request,"user",{_id:user._id+""},{RabbitCoin:user.RabbitCoin+requestData.number*180});
//     }
//     reply({"message":"转换火兔币成功","statusCode":101,"status":true});
//     return;
// };

// //将兔子回收到仓库-----------------------

// exports.takeToDepot=async function(request,reply){
//     var user=request.auth.credentials;
//     var data=request.payload;
//     var rabbit0=await dao.findById(request,"userRabbit",data.content[0]);

//     if(rabbit0.pond!=data.pond){
//         reply({"message":"回收失败，输入的兔场编号和兔子所在的兔场编号不一致","statusCode":102,"status":false});
//         return;
//     }
//     if(data.pond==1){
//         reply({"message":"回收失败，体验兔子不允许放置仓库","statusCode":102,"status":false});
//         return;
//     };
//     if(data.pond>12||data.pond<1){
//         reply({"message":"回收失败,请输入正确兔场编号","statusCode":102,"status":false})
//         return;
//     };
//     var userWareen=await dao.findOne(request,"warren",{"pond":data.pond,"userId":user._id+""});
//     if(userWareen==null){
//         reply({"message":"要操作的兔场还未开垦","statusCode":102,"status":false});
//         return;
//     };
//     //删除的兔子的个数
//     var num=data.content.length;
//     //是普通兔场
//     if(data.pond<9){
//         for(var i=0;i<num;i++){
//             //因为循环里要用到n次的 用户的仓库，用户的兔场，每用一次，都要重新获取，
//             //否则，读取到属性值还可能是原来的；
//             var userDepot=await dao.findOne(request,"depot",{userId:user._id+""});
//             var userWareen=await dao.findOne(request,"warren",{"pond":data.pond,"userId":user._id+""});
//             var rabbit=await dao.findById(request,"userRabbit",data.content[i]);
//             console.log(data.content[i]);

//             if(rabbit.rabbitType=="rabbitB"){
//                 await dao.updateOne(request,"warren",{"_id":userWareen._id+""},{rabbitB:userWareen.rabbitB-1,raisingRabbit:userWareen.raisingRabbit+1});
//                 await dao.updateOne(request,"depot",{"_id":userDepot._id+""},{rabbitB:userDepot.rabbitB+1});
//             };
//             if(rabbit.rabbitType=="rabbitC"){
//                 await dao.updateOne(request,"warren",{"_id":userWareen._id+""},{rabbitC:userWareen.rabbitC-1,raisingRabbit:userWareen.raisingRabbit+1});
//                 await dao.updateOne(request,"depot",{"_id":userDepot._id+""},{rabbitC:userDepot.rabbitC+1});
//             };
//             await dao.del(request,"userRabbit",{_id:data.content[i]});
//         }
//         reply({"message":"回收兔子成功","statusCode":102,"status":true});
//         return;
//     }else if(data.pond>9){
//         for(var i=0;i<num;i++){
//             var userDepot=await dao.findOne(request,"depot",{userId:user._id+""});
//             var userWareen=await dao.findOne(request,"warren",{"pond":data.pond,"userId":user._id+""});
//             await dao.del(request,"userRabbit",{_id:data.content[i]});
//             await dao.updateOne(request,"warren",{"_id":userWareen._id+""},{rabbitC:userWareen.rabbitC-1});
//             await dao.updateOne(request,"depot",{"_id":userDepot._id+""},{rabbitC:userDepot.rabbitC+1});
//         }
//         reply({"message":"回收兔子成功","statusCode":102,"status":true});
//         return;
//     }
   
// }

//将兔子回收到仓库-----------------------
// exports.takeToDepot=async function(request,reply){

//     var user=request.auth.credentials;
//     var requestData=request.payload;
//     //找到用户的仓库
//     var userDepot=await dao.findOne(request,"depot",{userId:user._id+""});
//     //找到用户的兔场
//     var userWareen=await dao.findOne(request,"warren",{"pond":requestData.pond,"userId":user._id+""});
//     //判断是不是兔子类型rabbitB
//     if(userWareen==null){
//         reply({"message":"您的兔场还未开采","statusCode":102,"status":false});
//     }
//     console.log("兔场编号是"+requestData.pond);
//     console.log(userWareen);
//     if(requestData.type==1){
//         if(userWareen.rabbitB<requestData.number){
//             reply({"message":"操作失败，兔场该类型的兔子不足","statusCode":102,"status":false});
//             return;
//         }
//         await dao.updateOne(request,"warren",{"_id":userWareen._id+""},{rabbitB:userWareen.rabbitB-requestData.number});
//         await dao.updateOne(request,"depot",{"_id":userDepot._id+""},{rabbitB:userDepot.rabbitB+requestData.number});
//     }else if(requestData.type==2){
//         if(userWareen.rabbitC<requestData.number){
//             reply({"message":"操作失败，兔场该类型的兔子不足","statusCode":102,"status":false});
//             return;
//         }
//         await dao.updateOne(request,"warren",{"_id":userWareen._id+""},{rabbitC:userWareen.rabbitC-requestData.number});
//         await dao.updateOne(request,"depot",{"_id":userDepot._id+""},{rabbitC:userDepot.rabbitC+requestData.number});
//     }
//      reply({"message":"回收兔子成功","statusCode":101,"status":true});
//      return;
// }
//火兔币转化成余额
// exports.goldToMoney=async function(request,reply){
//     var user=request.auth.credentials;
//     var data=request.payload;
//     if(request.payload.tranpwd!=CryptoJS.AES.decrypt(user.tranpwd,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8)){
//         reply({"message": "交易密码不正确，请重试！", "statusCode": 102, "status": false});
//         return;
//     }
//     if(user.RabbitCoin<data.number){
//         reply({"message":"转化余额失败，您的火兔不足","statusCode":102,"status":false})
//         return;
//     };
//     var newdate={
//         RabbitCoin:user.RabbitCoin-data.number,
//         RabbitCoin:user.RabbitCoin+data.number
//     }
//     var result=await dao.updateOne(request,"user",{_id:user._id+""},newdate);
//     if(result){
//         reply({"message":"火兔币转化余额成功","statusCode":101,"status":true});
//         return;
//     }else{
//         reply({"message":"火兔币转化余额失败","statusCode":102,"status":false});
//         return;
//     }
// }