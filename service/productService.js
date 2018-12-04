/**
 * 产品处理器
 * Created by chenda on 2016/10/23.
 */

const dao = require("../dao/dao");
//添加产品
exports.addProduct = async function(request,reply){
    var product = request.payload;
    var result = await dao.save(request,"product",product);
    if(result==null){
        reply({"message":"添加产品失败","statusCode":102,"status":false});
    }else{
        reply({"message":"添加产品成功","statusCode":101,"status":true,"resource":result.ops[0]});
    }
}

//删除产品
exports.delProduct = async function(request,reply){

    var result = await dao.del(request,"product",{"_id":request.params.id});
    if(result==null){
        reply({"message":"删除产品失败","statusCode":104,"status":false});
    }else{
        reply({"message":"删除产品成功","statusCode":103,"status":true});
    }
}

//更新产品
exports.updateProduct = async function(request,reply){

    var result = await dao.updateOne(request,"product",{"_id":request.params.id},request.payload);

    if(result==null){
        reply({"message":"更新产品失败","statusCode":106,"status":false});
    }else{
        reply({"message":"更新产品成功","statusCode":105,"status":true});
    }
}

//获取productlist
exports.getProductList = async function(request,reply){
    console.log(123);
    //列表
    var data = await dao.find(request,"product",{},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"product"); 

    if(data == null){
        reply({"message":"查找产品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找产品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}
//获取productlist
exports.getProductAllList = async function(request,reply){
    //列表
    var data = await dao.find(request,"product");
    //总数
    var sum = await dao.findCount(request,"product"); 
    console.log(123);
    if(data == null){
        reply({"message":"查找产品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"查找产品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}
//获取某个product
exports.getProduct =async function(request,reply){
    const product = await dao.findById(request,"product",request.params.id);
    if(product == null){
        reply({"message":"没有查到该产品！","statusCode":108,"status":false});
    }else{
        reply({"message":"查找产品成功","statusCode":107,"status":true,"resource":product});
    }
}


//搜索产品列表
exports.searchProduct = async function(request,reply){
    //列表
    //{$or:[{age:11},{name:'xttt'}]}
    console.log(request.payload.where);
    
    var data = await dao.find(request,"product",{$or:[request.payload.where]},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"product",{$or:[request.payload.where]});

    if(data == null){
        reply({"message":"搜索产品列表失败","statusCode":108,"status":false});
    }else{
        reply({"message":"搜索产品列表成功","statusCode":107,"status":true,"resource":data,"sum":sum});
    }
}
//购买商品
