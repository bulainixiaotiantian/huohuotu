
/**
 * 验证服务器
 * auth加密方式 密码加密 访问地址:UID或者时间戳
 * auth信息格式：bearer 用户名:加密字符串:(管理员需要加最后一个参数admin)
 * Created by chenda on 2016/4/16.
 */

var CryptoJS = require("crypto-js");

//验证函数
exports.validateFunc = function(token, request, callback){

    var user;
    var allTokens = token.split("^");
    var tokens = allTokens[0].split(":");
    var db = request.server.plugins['hapi-mongodb'].db;
    var collectionName;
    var reponseCode;
    if(tokens.length==2){
        collectionName = 'user';
    }else if(tokens.length==3){
        collectionName = 'admin';
    }else{
        callback(null, false, null);
        return;
    }
    //查询用户是否存在
    db.collection(collectionName).findOne({"username":tokens[0]},function(err,result){
        if(err){
            request.server.log(['error'],err);
            throw err;
            callback(null, false, null);
            return;
        }
        if(result){
            user = result;
            var decoded;
            //console.log(user.scope);
            if (user.scope=="[]") {
                reponseCode={"statusCode":403,"status":false,"message":"账户已被冻结"};
                callback(reponseCode, false, null);
                return;
            }
            try {
                var password = CryptoJS.AES.decrypt(result.password,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8);
                var passwordmd5 = CryptoJS.HmacMD5(password,password).toString();
                decoded = CryptoJS.AES.decrypt(tokens[1], passwordmd5).toString(CryptoJS.enc.Utf8).split(":");
            }catch (e){
                //console.log(12312312);
                callback(null, false, null);
                request.server.log(["error"],e);
                // throw e;
                return;
            }
            //对比访问的url是否与token中的url相等
            if(decoded[0]!=request.url.path){
                reponseCode={"statusCode":401,"status":false,"message":"用户名或密码错误！"};
                callback(reponseCode, false, null);
                return;
            }
            
            //对比是否为多端登录
            if(collectionName == "user"){           //手机端 需要多端验证
                if(allTokens[1] != "" && user.tokenStr && allTokens[1] != user.tokenStr){
                    reponseCode={"statusCode":401,"status":false,"message":"登录失败请重新尝试！"};
                    callback(reponseCode, false, null);
                    return;
                }
            }

            //查询之前是否访问过
            db.collection('access_record').findOne({"guid":decoded[1]},function(err,result){
                if(err){
                    request.server.log(['error'],err);
                    throw err;
                    callback(null, false, null);
                    return;
                }
                if(result){
                    callback(null, false, null);
                    return;
                }
                //存储唯一路径
                db.collection('access_record').save({guid:decoded[1]},function(err,result){
                    if(err) {
                        request.server.log(['error'], err);
                        throw err;
                    }
                });
                callback(null, true, user);
            });
        }else{
            reponseCode={"statusCode":401,"status":false,"message":"用户不存在"};
           callback(reponseCode, false, null);
        }
    });
}


exports.getToken = function(request,reply){
    var time = new Date().getTime();
    var admin = "";
    if(request.payload.userORadmin == "admin"){
        admin = ":admin"
    }
    var token = "bearer "+request.payload.username+":"+CryptoJS.AES.encrypt(request.payload.url+":"+time,CryptoJS.HmacMD5(request.payload.pwd,request.payload.pwd).toString())+admin;
    reply({"toekn":token});
}