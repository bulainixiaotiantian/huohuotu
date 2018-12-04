/**
 * Created by shichenda on 2016/6/13.
 */
var settings = require('../settings.js');
const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");
const Alipay = require('egg-alipay');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
var xml2js = require('xml2js');
var WechatAPI = require('wechat-api');
var accessToken = require('./accessToken.js');
var jsapi_ticket = require('./jsapi_ticket.js');
const axios = require('axios');
//支付宝配置
const ali = new Alipay({
    appId: '2018111362172204',    //支付宝的appId
    notifyUrl: 'http://47.92.71.158:2000/callback/alipay',//支付宝服务器主动通知商户服务器里指定的页面http/https路径
    rsaPrivate: path.resolve(__dirname+'/rsa_private_key.pem'),//商户私钥pem文件路径
    rsaPublic: path.resolve(__dirname+'/rsa_public_alipay_key.pem'),//支付宝公钥pem文件路径
    sandbox: false,             //是否是沙盒环境        
    signType: 'RSA2'   //签名方式, 'RSA' or 'RSA2'
});

//支付宝充值接口
exports.alipay =async function(request,reply){
    var user = request.auth.credentials;

    //request.payload.total_fee = 0.01;
    if(request.payload.tranpwd){
        if(request.payload.tranpwd!=CryptoJS.AES.decrypt(user.tranpwd,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8)){
            reply({"message": "交易密码不正确，请重试！", "statusCode": 102, "status": false});
            return;
        };
    };
    var chongzhi = {
        orderNumber:new Date().getTime()+"",
        total_fee:request.payload.total_fee,
        userId:user._id+"",
        username:user.username,
        name:user.name,
        body:"用户火兔币充值",
        createTime:new Date().getTime(),
        status:1,                 //0 驳回 1未支付 2已充值
        type:request.payload.type,  //1 支付宝 2 微信
        payType:1,//0代表认证用户，1代表正常充值
    }
    // if(request.payload.total_fee==398){
    //     if(user.certification==1){
    //         reply({"message":"用户已认证，请勿重复认证","statusCode":108,"status":false});
    //         return;
    //     };
    //     var parent = await dao.findOne(request,"user",{username:user.parentUsername});
    //     if(parent!=null){
    //         var plantSum = await dao.findCount(request,"plant",{username:user.parentUsername});
    //         if(plantSum>=12){
    //             reply({"message":"您的推荐人下级认证位置已满，不可认证","statusCode":108,"status":false});
    //             return;
    //         };
    //     };
    //     chongzhi.payType=0;
    //     chongzhi.body="认证用户";
    // };
    await dao.save(request,"payOrder",chongzhi);
    var params = "";
    if(request.payload.type==1){
        //手机支付链接
        params = ali.wapPay({
            subject: chongzhi.body,
            body: chongzhi.body,
            outTradeId: chongzhi.orderNumber,
            timeout: '10m',
            amount: request.payload.total_fee,
            return_url:"http://www.kxgpe.cn",
            goodsType: '0'
        });
    }else{
        //网页支付链接
        params = ali.pagePay({
            subject: chongzhi.body,            //商品的标题/交易标题/订单标题/订单关键字等
            body: chongzhi.body,               //对一笔交易的具体描述信息。如果是多种商品，请将商品描述字符串累加传给body
            outTradeId: chongzhi.orderNumber,  //商户网站唯一订单号
            timeout: '10m',                    //设置未付款支付宝交易的超时时间，一旦超时，该笔交易就会自动被关闭。
            amount: request.payload.total_fee, //订单总金额，单位为元，精确到小数点后两位，取值范围[0.01,100000000]
            return_url:"http://www.kxgpe.cn",  
            goodsType: '0',                    //商品主类型：0—虚拟类商品，1—实物类商品注：虚拟类商品不支持使用花呗渠道
            qrPayMode: 0        
        });
    };
    reply({"message":"支付成功","statusCode":107,"status":true,"resource":"https://openapi.alipay.com/gateway.do?"+params});
};
//某用户获取自己的充值记录
exports.getPayment=async function(request,reply){
    var user=request.auth.credentials;
    var data = await dao.find(request,"payOrder",{userId:user._id+""},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"payOrder",{userId:user._id+""});
    if(data == null){
        reply({"message":"获取充值记录失败","statusCode":102,"status":false});
    }else{
        reply({"message":"获取充值记录成功","statusCode":101,"status":true,"resource":data,"sum":sum});
    };
}

//删除充值信息
exports.delpay = async function(request,reply){
    var result = await dao.del(request,"payOrder",{"_id":request.params.id});
    if(result==null){
        reply({"message":"删除记录失败","statusCode":104,"status":false});
    }else{
        reply({"message":"删除记录成功","statusCode":103,"status":true});
    }
}
//管理员获取用户充值记录
exports.admingetPayment=async function(request,reply){
     //列表
    var data = await dao.find(request,"payOrder",request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"payOrder",request.payload.where);
    if(data == null){
        reply({"message":"查找提现列表失败","statusCode":102,"status":false});
    }else{
        reply({"message":"查找提现列表成功","statusCode":101,"status":true,"resource":data,"sum":sum});
    }
}



//---------------支付通知接口-------------------
exports.alipayNotify =async function(request,reply){
    var params = request.payload;
    var mysign = ali.signVerify(params);
    //验证支付宝签名mysign为true表示签名正确
    try{
    //验签成功
    if(mysign){
        var order = await dao.findOne(request,"payOrder",{"orderNumber":params.out_trade_no,"status":1});
        if(order!=null){
            if(params.trade_status=="TRADE_SUCCESS"){
                order.status = 2;
                var user = await dao.findById(request,"user",order.userId);
                var newOrder = await dao.updateOne(request,"payOrder",{"_id":order._id+""},order);
                if(newOrder!=null){
                    if (order.payType==0){
                        await dao.updateOne(request,"user",{_id:order.userId},{certification:1});
                        var plant = {
                            userId:user._id+"",
                            username:user.username,
                            pond:0,
                            level:2,
                            createTime:new Date().getTime(),
                            sowTime:0,
                            harvestTime:0,
                            sowStatus:0,
                            harvestStatus:0,
                            harvestNum:0
                        }
                        await dao.save(request,"plant",plant);
                        var renzhengList = {
                            userId:user._id+"",
                            username:user.username,
                            createTime:new Date().getTime(),
                            type:newOrder.type
                        }
                        await dao.save(request,"renzhengList",renzhengList);
                        var parent = await dao.findOne(request,"user",{username:user.parentUsername});
                        if (parent!=null) {
                           var plantSum = await dao.findCount(request,"plant",{username:user.parentUsername});
                           if (plantSum<12) {
                            var plant = {
                                userId:parent._id+"",
                                username:parent.username,
                                pond:plantSum,
                                level:1,
                                createTime:new Date().getTime(),
                                sowTime:0,
                                harvestTime:0,
                                sowStatus:0,
                                harvestStatus:0,
                                harvestNum:0
                            }
                            await dao.save(request,"plant",plant);   
                        }

                    }
                }else{
                    await dao.updateIce(request,"user",{_id:order.userId},{gold:order.total_fee});
                    var goldList = {
                        userId:user._id+"",
                        username:user.username,
                        number:order.total_fee,
                        createTime:new Date().getTime(),
                        type:"pay"
                    }
                    await dao.save(request,"goldList",goldList);
                }
                reply("SUCCESS");
            }
        }
    }else{
        reply("SUCCESS");
    }
        //存储信息
        var orderPayMsg = await dao.findOne(request,"orderPayMsg",{"out_trade_no":params.out_trade_no});
        if(orderPayMsg==null){
            dao.save(request,"orderPayMsg",params);
        }
    }else{
        console.log('验证失败！');
    }
}catch(err){
    console.log('notify err', err);
}
}


//随机生成32位字符串
function str32(){
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789'; /*ABCDEFGHIJKLMNOPQRSTUVWXYZ*/
    var maxPos = chars.length;
    var noceStr = "";
    for (var i = 0; i < 32; i++) {
        noceStr = noceStr + chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return noceStr; //随机数
}
// 微信支付通知接口
exports.wechatNotifyMsg = function(request,reply){
    var builder = new xml2js.Builder();
    xml2js.parseString(request.payload, {explicitArray: false}, async function(err, result) {
        if (result.xml.return_code == "SUCCESS" && result.xml.appid==settings.AppID && result.xml.mch_id==settings.mch_id) {
            var order = await dao.findOne(request,"payOrder",{"orderNumber":result.xml.out_trade_no,"status":1});
            if(order!=null){
                order.status = 2;
                var user = await dao.findById(request,"user",order.userId);
                var newOrder = await dao.updateOne(request,"payOrder",{"_id":order._id+""},order);
                if(newOrder!=null){
                    if (order.payType==0){
                        await dao.updateOne(request,"user",{_id:order.userId},{certification:1});
                        var plant = {
                            userId:user._id+"",
                            username:user.username,
                            pond:0,
                            level:2,
                            createTime:new Date().getTime(),
                            sowTime:0,
                            harvestTime:0,
                            sowStatus:0,
                            harvestStatus:0,
                            harvestNum:0
                        }
                        await dao.save(request,"plant",plant);
                        var renzhengList = {
                            userId:user._id+"",
                            username:user.username,
                            createTime:new Date().getTime(),
                            type:newOrder.type
                        }
                        await dao.save(request,"renzhengList",renzhengList);
                        var parent = await dao.findOne(request,"user",{username:user.parentUsername});
                        if (parent!=null) {
                         var plantSum = await dao.findCount(request,"plant",{username:user.parentUsername});
                         if (plantSum<12) {
                            var plant = {
                                userId:parent._id+"",
                                username:parent.username,
                                pond:plantSum,
                                level:1,
                                createTime:new Date().getTime(),
                                sowTime:0,
                                harvestTime:0,
                                sowStatus:0,
                                harvestStatus:0,
                                harvestNum:0
                            }
                            await dao.save(request,"plant",plant);   
                        }
                    }
                    }else{
                        await dao.updateIce(request,"user",{_id:order.userId},{gold:order.total_fee});
                        var goldList = {
                            userId:user._id+"",
                            username:user.username,
                            number:order.total_fee,
                            createTime:new Date().getTime(),
                            type:"pay"
                        }
                        await dao.save(request,"goldList",goldList);
                    }
                    reply("SUCCESS");
                }
            }
            var orderPayMsg = await dao.findOne(request,"orderPayMsg",{"out_trade_no":result.xml.out_trade_no});
            if(orderPayMsg==null){
                dao.save(request,"orderPayMsg",result.xml);
            }
        } else {
            reply(builder.buildObject({return_code: "FAIL", return_msg: "返回失败通知"}));
        }
    });
}

// 微信配置接口
exports.wechatConfig = function(request,reply){
    reply(request.query.echostr);
}

exports.wechatPay2 = async function(request,reply){
    var md5 = require('md5');
    var user = request.auth.credentials;
    var chongzhi = {
        orderNumber:new Date().getTime()+"",
        total_fee:request.payload.num,
        userId:user._id+"",
        username:user.username,
        name:user.name,
        body:"用户钻石充值",
        createTime:new Date().getTime(),
        status:1,
        type:3,
        payType:1,//0代表认证用户，1代表正常充值
    };
    if (chongzhi.total_fee==398){
        if (user.certification==1){
            reply({"message":"用户已认证，请勿重复认证","statusCode":108,"status":false});
            return;
        };
        var parent = await dao.findOne(request,"user",{username:user.parentUsername});
        if (parent!=null){
            var plantSum = await dao.findCount(request,"plant",{username:user.parentUsername});
            if (plantSum>=12){
                reply({"message":"您的推荐人下级认证位置已满，不可认证","statusCode":108,"status":false});
                return;
            };
        };
        chongzhi.payType=0;
        chongzhi.body="认证用户";
    };
    await dao.save(request,"payOrder",chongzhi);
    var Time = new Date()
    var ReTime = Time.getFullYear() + '-' + (Time.getMonth() + 1) + '-' + Time.getDate() + ' ' + Time.getHours() + ':' + Time.getMinutes();
    var mch_id = settings.mch_id //微信支付商户号MCHID
    var key = settings.key //微信支付密码PartnerKey
    var appid = settings.AppID;
    var body = "用户购买商品" //商品描述
    var out_trade_no = chongzhi.orderNumber; //订单号
    var total_fee =chongzhi.total_fee*100; //支付金额
    var spbill_create_ip = request.info.remoteAddress; //客户端ip
    //开始微信支付模块
    var nonce_str = str32(); //随机数

     if (total_fee == 0) {
         console.log(ReTime + ' 用户选择0元的商品，终止微信支付')
         reply({"message":"您选择的是0元的商品,无需微信支付。","statusCode":102,"status":false});
         return;
     }
     if (total_fee > 2000000) {
         console.log(ReTime + ' 商品总价超出微信支付范围，终止微信支付')
         reply({"message":"商品总价超出微信支付范围，终止微信支付","statusCode":102,"status":false})
         return;
     }

     var notify_url = settings.host + ":2000/wechat/payment/notifyMsg";
     //var trade_type = "JSAPI";
     var trade_type = "NATIVE";
     var product_id = chongzhi.orderNumber;

    var keyvaluestring = "appid=" + appid + "&body=" + body + "&mch_id=" + mch_id + "&nonce_str=" + nonce_str + "&notify_url=" + notify_url + "&out_trade_no=" + out_trade_no +"&product_id="+product_id + "&spbill_create_ip=" + spbill_create_ip + "&total_fee=" + total_fee + "&trade_type=" + trade_type;
    var stringTmp = keyvaluestring + "&key=" + key;
    var stringMd5 = md5(stringTmp).toUpperCase();
     var tpl1 = ['<xml>',
         '<appid>' + appid + '</appid>',
         '<body><![CDATA[' + body + ']]></body>',
         '<mch_id>' + mch_id + '</mch_id>',
         '<nonce_str>' + nonce_str + '</nonce_str>',
         '<notify_url>' + notify_url + '</notify_url>',
         '<out_trade_no>' + out_trade_no + '</out_trade_no>',
         '<spbill_create_ip>' + spbill_create_ip + '</spbill_create_ip>',
         '<total_fee>' + total_fee + '</total_fee>',
         '<trade_type>' + trade_type + '</trade_type>',
         '<product_id>' + product_id + '</product_id>',
         '<sign><![CDATA[' + stringMd5 + ']]></sign>',
         //'<openid><![CDATA[' + openid + ']]></openid>',
         '</xml>'
     ].join('');

    var urllib = require('urllib')

    var path = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
     urllib.request(path, {
             method: 'POST',
             headers: {
                 'Content-Type': 'text/xml'
             },
             content: tpl1
         },
         function(err, data) {
             xml2js.parseString(data, {explicitArray: false}, function(err, result) {
                 // 微信浏览器外部支付时使用
                 if(result.xml.return_code== "SUCCESS" && result.xml.result_code == "SUCCESS"){
                    reply({
                         "statusCode":107,
                         "status": true,
                         "message": '微信支付接口已通过',
                         "resource": result.xml.code_url//prepay_id
                     })
                 }else if(result.xml.return_code== "SUCCESS" || result.xml.result_code == "SUCCESS"){
                    reply({
                         "statusCode":102,
                         "status": false,
                         "message": result.xml.err_code_des,
                     })
                 }else{
                     console.log(ReTime + '调用微信支付失败，错误码：' + result.xml.return_code + ',错误信息：' + result.xml.return_msg)
                     reply({"message":'调用微信支付失败.错误码：' + result.xml.return_code + ',错误信息：' + result.xml.return_msg,
                         "statusCode":102,
                         "status": false});
                 }
             })
         });
}
//公众号支付接口
exports.getWechatPayEncy =async function(request,reply){
    var md5 = require('md5');
    var user = request.auth.credentials;
    var chongzhi = {
        orderNumber:new Date().getTime()+"",
        total_fee:request.payload.num,//
        userId:user._id+"",
        username:user.username,
        name:user.name,
        body:"用户钻石充值",
        createTime:new Date().getTime(),
        status:1,
        type:3,
        payType:1//0代表认证用户，1代表正常充值
    }
     if (chongzhi.total_fee==398) {
        if (user.certification==1) {
            reply({"message":"用户已认证，请勿重复认证","statusCode":108,"status":false});
            return;
        }
        var parent = await dao.findOne(request,"user",{username:user.parentUsername});
        if (parent!=null) {
            var plantSum = await dao.findCount(request,"plant",{username:user.parentUsername});
            if (plantSum>=12) {
                reply({"message":"您的推荐人下级认证位置已满，不可认证","statusCode":108,"status":false});
                return;
            }
        }
        chongzhi.payType=0;
        chongzhi.body="认证用户";
    }
    await dao.save(request,"payOrder",chongzhi);
     var Time = new Date()
     var ReTime = Time.getFullYear() + '-' + (Time.getMonth() + 1) + '-' + Time.getDate() + ' ' + Time.getHours() + ':' + Time.getMinutes()
     var mch_id = settings.mch_id //微信支付商户号MCHID
     var key = settings.key //微信支付密码PartnerKey
     var appid = settings.AppID;
     var body = chongzhi.body //商品描述
     var out_trade_no = chongzhi.orderNumber; //订单号
     var total_fee = chongzhi.total_fee*100; //合计数
     var spbill_create_ip = request.info.remoteAddress; //客户端ip
     var openid = user.openId;
     //开始微信支付模块
     var nonce_str = str32(); //随机数
     if (total_fee == 0) {
         console.log(ReTime + ' 用户选择0元的商品，终止微信支付')
         reply({"message":"您选择的是0元的商品,无需微信支付。","statusCode":102,"status":false});
         return;
     }
     if (total_fee > 2000000) {
         console.log(ReTime + ' 商品总价超出微信支付范围，终止微信支付')
         reply({"message":"商品总价超出微信支付范围，终止微信支付","statusCode":102,"status":false})
         return;
     }

     var notify_url = settings.host + ":2000/wechat/payment/notifyMsg";
     var trade_type = "JSAPI";
     var keyvaluestring = "appid=" + appid + "&body=" + body + "&mch_id=" + mch_id + "&nonce_str=" + nonce_str + "&notify_url=" + notify_url + "&openid=" + openid + "&out_trade_no=" + out_trade_no + "&spbill_create_ip=" + spbill_create_ip + "&total_fee=" + total_fee + "&trade_type=" + trade_type;
     var stringTmp = keyvaluestring + "&key=" + key;
     var stringMd5 = md5(stringTmp).toUpperCase();
     var tpl1 = ['<xml>',
         '<appid>' + appid + '</appid>',
         '<body><![CDATA[' + body + ']]></body>',
         '<mch_id>' + mch_id + '</mch_id>',
         '<nonce_str>' + nonce_str + '</nonce_str>',
         '<notify_url>' + notify_url + '</notify_url>',
         '<out_trade_no>' + out_trade_no + '</out_trade_no>',
         '<spbill_create_ip>' + spbill_create_ip + '</spbill_create_ip>',
         '<total_fee>' + total_fee + '</total_fee>',
         '<trade_type>' + trade_type + '</trade_type>',
         '<sign><![CDATA[' + stringMd5 + ']]></sign>',
         '<openid><![CDATA[' + openid + ']]></openid>',
         '</xml>'
     ].join('');
     var urllib = require('urllib');
     var path = 'https://api.mch.weixin.qq.com/pay/unifiedorder'
     urllib.request(path, {
             method: 'POST',
             headers: {
                 'Content-Type': 'text/xml'
             },
             content: tpl1
         },
         function(err, data) {
             xml2js.parseString(data, {explicitArray: false}, function(err, result) {
                 //console.log(result);
                 if (result.xml.result_code == "SUCCESS") {
                     var timeStamp = new Date().getTime().toString()
                     //随机码
                     var nonceStr = str32();
                     var signType = "MD5"
                     var keyvaluestring = "appId=" + appid + "&nonceStr=" + nonceStr + "&package=prepay_id=" + result.xml.prepay_id + "&signType=" + signType + "&timeStamp=" + timeStamp
                     //console.log("拼接前" + keyvaluestring);
                     var stringTmp = keyvaluestring + "&key=" + key;
                     //console.log("全部拼接完成的" + stringTmp)
                     var stringMd5 = md5(stringTmp).toUpperCase();
                     //console.log('加密后', stringMd5);
                     reply({
                         "statusCode":101,
                         "status": true,
                         "message": '微信支付接口已通过',
                         "orderid": out_trade_no,
                         "appId": appid,
                         "timeStamp": timeStamp,
                         "nonceStr": nonceStr,
                         "package": "prepay_id=" + result.xml.prepay_id,
                         "signType": signType,
                         "paySign": stringMd5
                     })
                 } else {
                     //console.log(ReTime + '调用微信支付失败，错误码：' + result.xml.return_code + ',错误信息：' + result.xml.return_msg)
                     reply({"message":'调用微信支付失败.错误码：' + result.xml.return_code + ',错误信息：' + result.xml.return_msg,
                         "statusCode":102,
                         "status": false});
                 }
             })
         });

}
//获取微信配置信息接口
exports.getWechatJsConfig = async function(request,reply){
    var accesstoken = new accessToken(settings.gid,request);
    console.log(accesstoken);
    var api = new WechatAPI(settings.AppID, settings.AppSecret,accesstoken.get,accesstoken.save);
    var jsapiticket = new jsapi_ticket(settings.gid,request);
    api.registerTicketHandle(jsapiticket.get,jsapiticket.save);

    var param = {
        debug: false,
        jsApiList: [
            'chooseWXPay',
        ],
        url: "http://www.kxgpe.cn"
    };

    api.getJsConfig(param, function(err,result){
        if(err){
            request.server.log(['error'],err);
            reply({"message":"获取页面配置信息失败，请退出重新进入。","statusCode":108,"status":false})
        }else{
		console.log(result);
            reply({"message":"获取页面配置信息成功。","statusCode":107,"status":true,"resource":result})
        }
    });
     /*const getAccessToken = async () => {
         const {data} = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${settings.AppID}&secret=${settings.AppSecret}`);
          console.log(data);
          return data.access_token
           }
   var token = await getAccessToken();
    console.log(token);
    const getTicket = async () => {
       const token = await getAccessToken()
       const {data} = await axios.get(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`)
       return data.ticket
        }*/
}


