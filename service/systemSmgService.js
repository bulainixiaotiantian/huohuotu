/**
 * 系统公告处理器
 * Created by chenda on 2017/3/9.
 */

const dao = require("../dao/dao");

//添加公告信息
exports.addSystemSmg = async function(request,reply){
    var systemSmg = request.payload;
    systemSmg.createTime = new Date().getTime();
    var result = await dao.save(request,"systemSmg",systemSmg);
    await dao.updateMore(request,"user",{},{readSysSmgTime:true});

    if(result==null){
        reply({"message":"添加公告信息失败","statusCode":102,"status":false});
    }else{
        reply({"message":"添加公告信息成功","statusCode":101,"status":true,"resource":result.ops[0]});
    }
}

//删除公告信息
exports.delSystemSmg = async function(request,reply){
    var result = await dao.del(request,"systemSmg",{"_id":request.params.id});
    if(result==null){
        reply({"message":"删除公告信息失败","statusCode":104,"status":false});
    }else{
        reply({"message":"删除公告信息成功","statusCode":103,"status":true});
    }
}

//更新公告信息
exports.updateSystemSmg = async function(request,reply){
    var result = await dao.updateOne(request,"systemSmg",{"_id":request.params.id},request.payload);
    if(result==null){
        reply({"message":"更新公告信息失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新公告信息成功","statusCode":105,"status":true});
    }
}

//获取systemSmglist
exports.getSystemSmgList = async function(request,reply){
    var user = request.auth.credentials;
    var data = await dao.find(request,"systemSmg",{},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var time = new Date().getTime();
    var sum = await dao.findCount(request,"systemSmg",{});
    await dao.updateOne(request,"user",{_id:user._id+""},{readSysSmgTime:false});
    if(data == null){
        reply({"message":"查找公告信息列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找公告信息列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}

//获取systemSmglist
exports.getSystemSmg = async function(request,reply){
    //列表
    var result = await dao.findById(request,"systemSmg",request.params.id);
    if(result == null){
        reply({"message":"查找公告信息列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找公告信息列表成功","statusCode":107,"status":true,"resource":result});
    }
}


//获取getSmgNoReadlList
exports.getSmgNoReadlList = async function(request,reply){
    var user = request.auth.credentials;
    var sum = await dao.findCount(request,"systemSmg",{createTime:{$gte:user.readSysSmgTime}});
    if(sum == null){
        reply({"message":"获取未读信息数失败","statusCode":108,"status":false});
    }else{
        reply({"message":"获取未读信息数成功","statusCode":107,"status":true,"sum":sum});
    }
}
