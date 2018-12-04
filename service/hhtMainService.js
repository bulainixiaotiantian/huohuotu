/**
 * 短信验证码
 * Created by chenda on 2016/4/27.
 */
var http = require('http');
var settings = require('../settings.js');
const dao = require("../dao/dao");
var xml2js = require('xml2js');
var iconv = require('iconv-lite');
//发送注册验证码
exports.sendRegSMS = async function(request,reply){
    const reqData = request.payload;
    var smsVerification =await dao.findOne(request,"smsVerification",{"mobile":reqData.mobile,"type":"register"});
    if(smsVerification!=null){
        if(smsVerification.createTime+120000>new Date().getTime()){
            reply({"message":"您的发送请求过于频繁，请在两分钟后再试。","statusCode":102,"status":false});
            return;
        }
    }
    //查找手机号是否有重复
    var findeUser = await dao.findOne(request,"user",{"username":reqData.mobile});
    if(findeUser!=null){
        reply({"message":"该手机号已被注册，请提交新的手机号码。","statusCode":102,"status":false});
        return;
    }
    const host = "114.113.154.5";
    const path = "/sms.aspx?";
    var smsCode=num();
    const data = {
       action:"send",
       account:"15810599979",
       password:"a15810599979@",
       mobile:reqData.mobile,
       content:"您的验证码为："+smsCode+"【生肖守护神】"
    }
    var smsResult = await getFrom(path,host,require('querystring').stringify(data));

   if(smsResult==null){
        reply({"message":"验证码获取失败，请重新获取。","statusCode":102,"status":false});
    }else{
        xml2js.parseString(smsResult, {explicitArray: false},async function (err, result){
            var smsResult = null;
            //console.log(result);
            if(result.returnsms.returnstatus == "Success"){
                if(smsVerification!=null){
                    const id = smsVerification._id+""
                    smsVerification.code = smsCode;
                    smsVerification.createTime = new Date().getTime();
                    delete smsVerification._id;
                    smsResult = await dao.updateOne(request,"smsVerification",{"_id":id},smsVerification);
                }else{
                    const smsData={
                        code : smsCode,
                        createTime: new Date().getTime(),
                        type:"register",
                        mobile:data.mobile
                    }
                    smsResult =await dao.save(request,"smsVerification",smsData);
                }
                if(smsResult==null){
                    reply({"message":"验证码发送失败，请重新发送","statusCode":102,"status":false});
                }else{
                    reply({"message":"验证码发送成功","statusCode":101,"status":true});
                }
            }else{
                reply({"message":"验证码发送失败，"+result.returnsms.message,"statusCode":102,"status":false});
            }
        });
    }
}

//发送下订单验证码
exports.SmsOrder=async function(request,reply){
    const reqData = request.payload;
    var smsVerification =await dao.findOne(request,"smsVerification",{"mobile":reqData.mobile,"type":"register"});
    if(smsVerification!=null){
        if(smsVerification.createTime+120000>new Date().getTime()){
            reply({"message":"您的发送请求过于频繁，请在两分钟后再试。","statusCode":102,"status":false});
            return;
        };
    }
    //查找手机号是否有重复
    var findeUser = await dao.findOne(request,"user",{"username":reqData.mobile});
    const host = "114.113.154.5";
    const path = "/sms.aspx?";
    var smsCode=num();
    const data = {
       action:"send",
       account:"15810599979",
       password:"a15810599979@",
       mobile:reqData.mobile,
       content:"您的验证码为："+smsCode+"【生肖守护神】"
    }
    var smsResult = await getFrom(path,host,require('querystring').stringify(data));

   if(smsResult==null){
        reply({"message":"验证码获取失败，请重新获取。","statusCode":102,"status":false});
    }else{
        xml2js.parseString(smsResult, {explicitArray: false},async function (err, result){
            var smsResult = null;
            //console.log(result);
            if(result.returnsms.returnstatus == "Success"){
                if(smsVerification!=null){
                    const id = smsVerification._id+""
                    smsVerification.code = smsCode;
                    smsVerification.createTime = new Date().getTime();
                    delete smsVerification._id;
                    smsResult = await dao.updateOne(request,"smsVerification",{"_id":id},smsVerification);
                }else{
                    const smsData={
                        code : smsCode,
                        createTime: new Date().getTime(),
                        type:"register",
                        mobile:data.mobile
                    }
                    smsResult =await dao.save(request,"smsVerification",smsData);
                }
                if(smsResult==null){
                    reply({"message":"验证码发送失败，请重新发送","statusCode":102,"status":false});
                }else{
                    reply({"message":"验证码发送成功","statusCode":101,"status":true});
                }
            }else{
                reply({"message":"验证码发送失败，"+result.returnsms.message,"statusCode":102,"status":false});
            }
        });
    }
}



//发送找回密码验证码
exports.sendSetPwdSMS = async function(request,reply){
    var reqData = request.payload;
    //console.log(reqData);
    var user = await dao.find(request,"user",{username:reqData.username});
    //console.log(user.length);
    if(user.length==0){
        reply({"message":"您输入的用户不存在，请重新输入。","statusCode":102,"status":false});
        return;
    }
    if (user[0].codeTime+120000>new Date().getTime()){
        reply({"message":"您的发送请求过于频繁，请在两分钟后再试。","statusCode":102,"status":false});
        return;
    }
    var smsVerification =await dao.findOne(request,"smsVerification",{"mobile":user[0].mobile,"type":"register"});
    // if(smsVerification!=null){
    //     if(smsVerification.createTime+120000>new Date().getTime()){
    //         reply({"message":"您的发送请求过于频繁，请在两分钟后再试。","statusCode":102,"status":false});
    //         return;
    //     }
    // }
    const host = "114.113.154.5";
    const path = "/sms.aspx?";
    var smsCode = num();

    const data = {
       action:"send",
       account:"15810599979",
       password:"a15810599979@",
       mobile:user[0].mobile,
       content:"您的验证码为："+smsCode+"【生肖守护神】"
    }
    var smsResult = await getFrom(path,host,require('querystring').stringify(data));

   if(smsResult==null){
        reply({"message":"验证码获取失败，请重新获取。","statusCode":102,"status":false});
    }else{
        xml2js.parseString(smsResult, {explicitArray: false},async function (err, result) {
            var smsResult = null;
            console.log(result.returnsms.message);
            if (result.returnsms.returnstatus == "Success") {
                if(smsVerification!=null){
                    const id = smsVerification._id+""
                    smsVerification.code = smsCode;
                    smsVerification.createTime = new Date().getTime();
                    delete smsVerification._id;
                    smsResult = await dao.updateOne(request,"smsVerification",{"_id":id},smsVerification);
                }else{
                    const smsData = {
                        code : smsCode,
                        createTime: new Date().getTime(),
                        type:"register",
                        mobile:user[0].mobile
                    }
                    smsResult =await dao.save(request,"smsVerification",smsData);
                }
                if(smsResult==null){
                    reply({"message":"验证码发送失败，请重新发送","statusCode":102,"status":false});
                }else{
                    await dao.updateOne(request,"user",{_id:user[0]._id+""},{codeTime:new Date().getTime()});
                    reply({"message":"验证码发送成功","statusCode":101,"status":true});
                }
            }else{
                reply({"message":"验证码发送失败，"+result.returnsms.message,"statusCode":102,"status":false});
            }
        });
    }
}
//随机数
function num(){
    var mm=Math.random();
    var six ="";
    if(mm>0.1){
        six=Math.round(mm*1000000);
    }else{
        mm += 0.1;
        six = Math.round(mm*1000000);
    }
    return six;
}

//火兔币充值
exports.userPay=async function(request,reply){
    var user = request.auth.credentials;
    var userOrder = await dao.find(request,"payOrder",{userId:user._id+"",status:1,type:request.payload.type});
    var order={
        userId:user._id+"",
        userName:user.username,
        total_fee:request.payload.number,
        createTime:new Date().getTime(),
        payType:request.payload.payType,
        status:1   
    };
    var data=await dao.save(request,"order",order);
    var pay =await dao.findOne(request,"pay",{type:request.payload.payType});
    if(data == null){
        reply({"message":"保存记录失败","statusCode":108,"status":false});
    }else{
        reply({"message":"记录生成，请尽快支付","statusCode":107,"status":true,"resource":pay});
    }
}

//充值审核
exports.updatePay=async function(request,reply){
    var user = request.auth.credentials;
    var data1 = await dao.findById(request,"payOrder",request.params.id);
    
    if(data1.status!=1){
        reply({"message":"记录已审核，请勿重复审核","statusCode":103,"status":true});
        return;
    }
    await dao.updateOne(request,"payOrder",{_id:request.params.id},{status:request.params.status,examineUser:user.username});
    if(request.params.status==2){//判断状态码是不是通过了
        var data = await dao.findById(request,"payOrder",request.params.id);
        await dao.updateIce(request,"user",{_id:data.userId},{RabbitCoin:data.total_fee});
        var yonghu = await dao.findById(request,"user",data.userId);
        reply({"message":"充值成功","statusCode":103,"status":true});
    }else{
        reply({"message":"驳回成功","statusCode":103,"status":true});
    } 
}


//表单提交。
function getFrom(path,host,data){
    return new Promise(function(resolve,reject){
        var options = {
            host:host,
            path:path+data,
            method:'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        }
        var req1 = http.request(options, function (res1){
            if (res1.statusCode !== 200) {
                options = JSON.stringify(options)
                var Time = new Date()
                var ReTime = Time.getFullYear() + '-' + (Time.getMonth() + 1) + '-' + Time.getDate() + ' ' + Time.getHours() + ':' + Time.getMinutes()
                var errMessage = JSON.stringify({
                    'status': false,
                    'info': ReTime + ' POST请求数据' + res1.statusCode + '错误，请联系系统管理员'
                })
                console.log(errMessage);
                resolve(null);
            }
            var postDataStr = [];
            var size = 0;
            res1.on('data', function (chunk) {
                postDataStr.push(chunk)
                size += chunk.length
            })
            res1.on('end', function () {
                var buf = Buffer.concat(postDataStr, size);
                var str = iconv.decode(buf, 'utf8');
                //var posts = JSON.parse(str)
                resolve(str);
            })
        }).on('error', function (err) {
            if (err) {
                options = JSON.stringify(options)
                var Time = new Date()
                var ReTime = Time.getFullYear() + '-' + (Time.getMonth() + 1) + '-' + Time.getDate() + ' ' + Time.getHours() + ':' + Time.getMinutes()
                console.log(ReTime + ' POST请求数据库500错误,请求头：' + options + ',请求内容:' + postData + '，错误代码：' + err)
                resolve(null);
            }
        })
        // req1.write(postData + "\n")
        req1.end();
    });
}