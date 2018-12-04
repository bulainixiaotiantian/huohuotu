//引入数据操作类库


var http = require('http');
var settings = require('../settings.js');
var xml2js = require('xml2js');
var iconv = require('iconv-lite');
const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");

//注册用户--------------------------

exports.registerUser = async function(request,reply){
    var user = request.payload;
     var tiXianSXF=await dao.findOne(request,"systemTiXianShouXu");
    var users = await dao.find(request,"user",{username:user.username});
    var userName=await dao.find(request,"user",{name:user.name});
    var mobiles = await dao.find(request,"user",{mobile:user.mobile});
    //if(user.parenteName){
        var parentuser = await dao.find(request,"user",{username:user.parenteName});

        if(parentuser.length==0){
            reply({"message":"推荐用户不存在，请重新输入！","statusCode":102,"status":false});
            return;
        }
        user.parenteName=parentuser[0].username;
   // }
   // var policy = await dao.findOne(request,"systemSet");
    if(users.length!=0){
        reply({"message":"该账号已存在，请重新输入！","statusCode":102,"status":false});
        return;
    };
    if(userName!=0){
        reply({"message":"该昵称已存在，请重新输入！","statusCode":102,"status":false});
        return;
    };
    if(mobiles.length!=0){
        reply({"message":"此手机号已注册过，请重新输入手机号！","statusCode":102,"status":false});
        return;
    };
    var sms=await dao.findOne(request,"smsVerification",{"mobile":user.mobile,"type":"register"});
    // if(sms==null){
    //     reply({"message":"该手机号未注册验证码，请确保手机输入正确","statusCode":102,"status":false});
    //     return;
    // }
    // if(user.VerificationCode != sms.code){
    //     reply({"message":"验证码错误，请重新输入","statusCode":102,"status":false});
    //     return;
    // }
    // var time = new Date().getTime();
    // if (time-sms.createTime>=120000){
    //     reply({"message":"验证码已超时，请重新发送！","statusCode":102,"status":false});
    //     return;
    // }
    var time = new Date().getTime();
    user.scope = ["USER"];
    user.tranpwd = CryptoJS.AES.encrypt(user.tranpwd,"AiMaGoo2016!@.")+"";
    user.password = CryptoJS.AES.encrypt(user.password,"AiMaGoo2016!@.")+"";
    user.createTime = time;
    user.buyTaoCan="never";
    
    user.cabbage=100;          //白菜的数量
    user.water=100;	           //水的数量
    user.RabbitCoin = 100;     //充值进来的金额单位是元
    user.carrot=100;         //胡萝卜的数量	
    //user.RabbitCoin=0;     //体验火火兔产火兔币
    user.secondPeopleNum=0; //推荐下的人数
    user.shareWeiXinTime="";
    user.state=1;            //用户状态 1 是正常 2是被冻结
    user.tiXianSXF=tiXianSXF.tiXianSXF;
    user.tixianDescrible=tiXianSXF.tixianDescrible;
    var result = await dao.save(request,"user",user);

    if(result==null){
        reply({"message":"注册用户失败","statusCode":102,"status":false});
    }else{
        //给用户生成一个仓库------------------
    	var depot={
			userName:user.username,
	    	userId:result.ops[0]._id+"",
	    	createWarrenTime:time,   
	    	rabbitA:0,		  //体验兔子的数量
			rabbitB:0,        //购买来的兔子的数量
			rabbitC:0,        //复投和交易得到的兔子数量和
            // titleImg:"\upload\img\depot.png",
            // sRabbitTitleImg:"\upload\img\sRabbitTitle.png",
            // bRabbitTitleImg:"\upload\img\bRabbitTitle.png"
		};
		await dao.save(request,"depot",depot);
    	//给账户添加1个兔场------
    	var time3=new Date().getTime();
		var warren={
			userName:user.username,
			userId:result.ops[0]._id+"",
			createWarrenTime:time3,   //创建兔场时间
			pond:1,			//兔场的编号
			rabbitA:2,			//体验兔子的数量
			rabbitB:0,			//购买来的兔子
		    rabbitC:0,		    //rabbitA:体验火火兔  rabbitB:购买的火火兔  rabbitC:下的小兔和收购来的
		    RabbitCoin:0,		//该兔场的体验兔子下的火兔币
		    warrenType:"ordinary", //兔场的类型 普通类型
		    raisingRabbit:0  //允许养兔子的数量
		};	
	    var result2=await dao.save(request,"warren",warren);
		
    	
		//注册既赠送2只体验火火兔--------------------------
    	var time2 = new Date().getTime();
        // var result2=await dao.find(request,"warren",{userName:user.username});//获得该账户拥有的所有兔场的数组
    	for (var i = 0; i < 2; i++){   //这里data要被插入数据库俩次，所以，也要重新创建俩次-否则会插入的文档会被后一条覆盖--------
    	 	var data={
		    	"userId":result.ops[0]._id+"",
		    	"userName":user.username,
		    	"creatRabbitTime":time2,
		    	"rabbitType":"rabbitA",		     //rabbitA:体验火火兔  rabbitB:购买的火火兔  rabbitC:下的火火兔和交易得来的
	    		"eateState":1,                   //1 需要吃白菜的状态，-1是不需要吃白菜
	    		"drinkState":1,                  //1 需要喝水的状态，-1是不需要喝水
	    		"eatTime":time2,				 //喂养时间
	    		"drinkTime":time2,				 //喝水的时间
	    		"plantId":result2.ops[0]._id+"", //所在兔场的的id
	    		"beOut":false,					 //是否出具 false 为否 true为已经出局
	    		"pond":1,					     //所在兔场的编号为1
	    		"everyTimesCoin":60,             //每次产火兔币60个
	    		"madeTimes":0,	   //makeCoinTimes    //产火兔币的次数，当达到 6次时 则为出局
                "haiYouTimes":6, //haiYouCoinTimes            //还有几次下火火兔的期数
	    		"lastMadeTime":time2 //makeCoinTime		     //上一次产火兔币的时间
	     	};								
    	 	await dao.save(request,"userRabbit",data);
    	};

        let dateTime = format("yyyy/M/d",new Date());
        var todoyAdd = await dao.find(request,"userRecord",{createTime:format("yyyy/M/d",new Date())});
        if(todoyAdd.length!=0){
            await dao.updateOne(request,"userRecord",{createTime:dateTime},{number:todoyAdd[0].number+1});
        }else{
            var addUserSum ={
                createTime:format("yyyy/M/d",new Date()),
                number:1
            }
            await dao.save(request,"userRecord",addUserSum);
        }
        addparentNumber(request,parentuser[0].username,true);
   

    	reply({"message":"注册成功","statusCode":101,"status":true});
    	return;
    }      
}

//用户登陆------------------------
exports.userLogin=async function(request,reply){
    var user = request.auth.credentials;  //credentials是包含用户的身份信息的
    delete user.password; 
    if(user.state==0){
        reply({"message":"登陆成功，您的账户已经被冻结","statusCode":101,"status":true});
        return;
    };
    var nowTime=new Date().getTime();
    //查询 得到购买的兔子和复投收购的兔子的数组 
    //已经测试过，没有错
    var transation=await dao.find(request,"transaction",{"status":0});
    if(transation.length!=0){//
        for(var k=0;k<transation.length;k++){
            if(nowTime-transation[k].createTime>=86400000*5){//判断时间是不是大于等于5天了。
                await dao.updateOne(request,"transaction",{_id:transation[k]._id},{status:2});//把状态码改为关闭状态
                var sellerUser=await dao.findById(request,"user",transation[k].sellerId);
                console.log(sellerUser);
                if(transation[k].productType==1){        //交易的是胡萝卜
                    await dao.updateOne(request,"user",{_id:sellerUser._id},{carrot:sellerUser.carrot+transation[k].number});
                }else if(transation[k].productType==2){  //交易的是火火兔 
                    var sellerDepot=await dao.findOne(request,"depot",{userId:sellerUser._id+""});                     
                    await dao.updateOne(request,"depot",{_id:sellerDepot._id},{rabbitC:sellerDepot.rabbitC+transation[k].number});
                };
            };
        };
    };
   
    var allResultBC = await dao.find(request,"userRabbit",{"userId":user._id+"",$or:[{"rabbitType":"rabbitB"},{"rabbitType":"rabbitC"}]});
    var allResultA =await dao.find(request,"userRabbit",{"userId":user._id+"","rabbitType":"rabbitA"});
    
    //如果用户拥有体验的兔子，没有跳过  测试过没有问题
    if(allResultA.length!=0){
        for(var j=0;j<allResultA.length;j++){
        	var userWarren=await dao.findOne(request,"warren",{userId:user._id+"",pond:allResultA[j].pond});
            if(allResultA[j].madeTimes>=6){//reply("已经达到六期出具");
                await dao.updateOne(request,"userRabbit",{_id:allResultA[j]._id},{beOut:true});
                var theResulAAt=await dao.findById(request,"userRabbit",allResultA[j]._id+"")
                await dao.save(request,"chuJuJiLU",theResulAAt);
                await dao.del(request,"userRabbit",{_id:theResulAAt._id});
                continue; //符合条件跳出本次循环
            };
            //得到当前时间和上一次下火兔币时间差 单位为天         
            //var difDateA=(nowTime-allResultA[j].lastMadeTime)/86400000; //时间差单位为天
            var  difminute=(nowTime-allResultA[j].lastMadeTime)/60000;  //时间差单位为分钟
    		//var  difSedonds=(nowTime-allResultA[j].lastMadeTime)/1000;  //时间差单位为秒
            if(difminute>=3){
                //var num=parseInt(difDate/9);//时间差换成单位天数
                var num=parseInt(difminute/3);
                var zongNum=allResultA[j].madeTimes+num;
                //判断总次数是否超过6，是的话，超过多少就让num减多少
                if(6-zongNum<0){
                    num=num+(6-zongNum);
                    console.log("减之后"+zongNum);
                    console.log("减之后"+num);
                };
                console.log(num+"次数")
                console.log("原来兔场火兔币数量"+userWarren.RabbitCoin)
                //更新用户的火兔币的个数00
                // await dao.updateOne(request,"user",{_id:user._id+""},{RabbitCoin:user.RabbitCoin+allResultA[j].everyTimesCoin*num});
                await dao.updateOne(request,"warren",{_id:userWarren._id},{RabbitCoin:userWarren.RabbitCoin+allResultA[j].everyTimesCoin*num});
                var data={
                    "haiYouTimes":allResultA[j].haiYouTimes-num,
                    "madeTimes":allResultA[j].madeTimes+num,   //产火兔币的次数，当达到 6次时 则为出局
                    "lastMadeTime":nowTime                              //上一次产火兔币的时间
                };                              
                //更新该兔子的下火兔币的时间和下火兔的次数
                await dao.updateOne(request,"userRabbit",{_id:allResultA[j]._id+""},data);
                var theResultA=await dao.findById(request,"userRabbit",allResultA[j]._id+"")
                if(theResultA.madeTimes>=6){
                    await dao.updateOne(request,"userRabbit",{_id:theResultA._id+""},{beOut:true});
                    var shanA=await dao.findById(request,"userRabbit",theResultA._id+"");
                    await dao.save(request,"chuJuJiLU",shanA);
                    await dao.del(request,"userRabbit",{_id:shanA._id});

                };
            }
        }
    };
    //如果用户拥有在养殖的下火火兔的兔子
    if(allResultBC.length!=0){
    	 //查询得到用户的仓库------
	    for(var i=0;i<allResultBC.length;i++){
    		var userDepot=await dao.findOne(request,"depot",{userId:user._id+""});
    		if(allResultBC[i].madeTimes>=6){
    			await dao.updateOne(request,"userRabbit",{_id:allResultBC[i]._id},{beOut:true});
                var theResultBB=await dao.findById(request,"userRabbit",allResultBC[i]._id+"")
                await dao.save(request,"chuJuJiLU",theResultBB);
                await dao.del(request,"userRabbit",{_id:theResultBB._id});
    			//reply({"message":"达到六周期了，需要出局","statusCode":102,"status":false});
    			continue;
    		};
    		//得到当前和 上一次下兔子的时间差 单位是天
    		//var difDateB=(nowTime-allResultBC[i].lastMadeTime)/86400000;
    			//var  difminuteB=(nowTime-allResultBC[i].lastMadeTime)/60000;//时间差为分钟
    			//var  difSedondsB=(nowTime-allResultBC[i].lastMadeTime)/1000;//时间差为秒
    		if(difminuteB>=3){
    			//判断时间是否超过规定时间，如果达到条件则下循环一个小小兔，
    			//并且更新下小小兔子的时间，
    			//并且更新用户仓库小小兔子的数量
    			var numB=parseInt(difminuteB/3);
    			console.log("减之前"+numB);
    			var zonNumB=allResultBC[i].madeTimes+numB;
    			//判断总次数是否超过6，是的话，超过多少就让num减多少
            	if(6-zonNumB<0){
            		numB=numB+(6-zonNumB);
            		console.log("减之后"+numB);
            	};
                console.log("火火兔B次数"+numB);
                console.log("原来的仓库的小小兔的个数"+userDepot.rabbitC);
    			var data={
    				lastMadeTime:nowTime,
    				madeTimes:allResultBC[i].madeTimes+numB,
                    haiYouTimes:allResultBC[i].haiYouTimes-numB
    			};
    			var formatTime = new Date(format("yyyy/M/d",new Date()))
    			await dao.updateOne(request,"userRabbit",{_id:allResultBC[i]._id+""},data);
    			//更新仓库的复投的兔子的数量，原有的基础上加。
    			await dao.updateOne(request,"depot",{_id:userDepot._id+""},{rabbitC:userDepot.rabbitC+numB});
                await dao.save(request,"makeRabbitJiLu",{userName:user.username,userId:user._id+"",createTime:nowTime,addRabbitNum:numB});
    			//reply({"message":"登陆成功，"+difSedonds+"下小小兔成功，已经放置仓库成功","statusCode":101,"status":true});
    			
                var theResultB=await dao.findById(request,"userRabbit",allResultBC[i]._id+"")
                if(theResultB.madeTimes>=6){
                    await dao.updateOne(request,"userRabbit",{_id:theResultB._id+""},{beOut:true});
                    var shan=await dao.findById(request,"userRabbit",theResultB._id+"");
                    await dao.save(request,"chuJuJiLU",shan);
                    await dao.del(request,"userRabbit",{_id:shan._id});

                };

    		};
	    };
    }else{
    	reply({"message":"登陆成功,暂无添加小小兔","statusCode":101,"status":true,"source":user});
    	return;
    };
      	reply({"message":"登陆成功,快去仓库看看您的小小兔添加几只了","statusCode":101,"status":true,"source":user});
    	return;	
}

//用户修改个人信息----------------------
exports.MessageEdit =async function(request,reply){
    var result = await dao.updateOne(request,"user",{"_id":request.params.id},request.payload);                                                
    if(result!=null){
        reply({"message":"更新数据成功!","statusCode":101,"status":true});
    }else{
        reply({"message":"更新数据失败!","statusCode":102,"status":false});
    }
}

//获取商品套餐列表信息----------------

exports.getPackageList=async function(request,reply){
	var result = await dao.find(request,"packageType");
	if(result){
        reply({"message":"查询成功","statusCode":101,"status":true,"resource":result});
    }else{
       	reply({"message":"失败","statusCode":102,"status":false});
    };
}

exports.adminPackageList=async function(request,reply){
    var data = await dao.find(request,"packageType");
    var sum = await dao.findCount(request,"packageType");
    if(data == null){
        reply({"message":"获取用户开垦记录失败","statusCode":102,"status":false});
    }else{
        reply({"message":"获取用户开垦记录成功","statusCode":101,"status":true,"resource":data,"sum":sum});
    };
}


//在实体商城买商品---
exports.buyWaterCabbage=async function(request,reply){
    var user=request.auth.credentials; 
    if(user.state==0){
        reply({"message":"购买失败，您的账户已经被冻结","statusCode":102,"status":false});
        return;
    };
    var data=request.payload;
    var time=new Date().getTime();
    //找到用户要购买的商品；
    var shopResult=await dao.findOne(request,"shop",{ "productName":data.shopType});
    if(shopResult==null){
        reply({"message":"购买失败，购买的商品不存在","statusCode":102,"status":false});
        return;
    };
    if(data.howMuch<=0){
        reply({"message":"购买失败,请输入正确的购买数量","statusCode":102,"status":false});
        return;
    };
    if(user.RabbitCoin<shopResult.price*data.howMuch){
        reply({"message":"购买失败余额不足","statusCode":102,"status":false});
        return;
    };
    if(data.shopType=="cabbage"){
        await dao.updateOne(request,"user",{_id:user._id+""},{
            "RabbitCoin":user.RabbitCoin-(shopResult.price*data.howMuch),
            "cabbage":user.cabbage+data.howMuch
        });  
        var purchaseList={
            userId:user._id+"",
            usersName:user.username,
            purchaseType:shopResult.name,        //套餐类型   1是A套餐，2，B套餐，3，C套餐
            taoCanNum:data.howMuch,                  //本次购买个数
            priceNum:shopResult.price*data.howMuch,
            createTime:time
        };
        await dao.save(request,"purchaseList",purchaseList);
       
    }else if(data.shopType=="water"){
        await dao.updateOne(request,"user",{_id:user._id+""},{
            "RabbitCoin":user.RabbitCoin-(shopResult.price*data.howMuch),
            "water":user.water+data.howMuch
        })
        var purchaseList={
            userId:user._id+"",
            usersName:user.username,
            purchaseType:shopResult.name,        //套餐类型   1是A套餐，2，B套餐，3，C套餐
            taoCanNum:data.howMuch,                  //本次购买个数
            priceNum:shopResult.price*data.howMuch,
            createTime:time
        };  
        await dao.save(request,"purchaseList",purchaseList); 
    };
    reply({"message":"购买成功","statusCode":101,"status":true});
    return;
    //console.log("user.engNames:"+user[engNames]+"data.howMuch:"+data.howMuch);
    
}    


//获取商品 水 和白菜 等信息
exports.getShopList=async function(request,reply){
	var result = await dao.find(request,"shop");
	if(result){
        reply({"message":"查询成功","statusCode":101,"status":true,"resource":result});
    }else{
       	reply({"message":"失败","statusCode":102,"status":false});
    };
}
//购买任一套餐,并判断有没有一代好友二代好友三代好友，有均获得或萝卜的奖励。

exports.buyPackage=async function(request,reply){
	var user=request.auth.credentials;
    var systemSetJiling=await dao.findOne(request,"systemSetJiling");
    if(user.state==0){
        reply({"message":"购买失败，您的账户已经被冻结","statusCode":102,"status":false});
        return;
    };
	var data=request.payload;
	//找到购买的套餐类型-----------------------
	var result=await dao.findOne(request,"packageType",{purchaseType:data.purchaseType});
    var rabbitNum=result.rabbit*data.num;
    var carrotNum=result.carrot*data.num;
    var priceNum=result.price*data.num;
    console.log("rabbitNum"+rabbitNum);
    console.log("carrotNum"+carrotNum);
    console.log("priceNum"+priceNum);

	if(result==null){
		reply({"message":"查询失败","statusCode":102,"status":false});
		return;
	};
    if(data.num<=0){
        reply({"message":"购买失败,请输入正确的购买数量","statusCode":102,"status":false});
        return;
    };
	if(user.RabbitCoin<priceNum){
		reply({"message":"够买失败，金额不足","statusCode":102,"status":false});
		return 
	};
    if(data.tranpwd){
        if(data.tranpwd!=CryptoJS.AES.decrypt(user.tranpwd,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8)){
            reply({"message": "交易密码不正确，请重试！", "statusCode": 102, "status": false});
            return;
        }
    };
    //创建一条购买记录
	var time=new Date().getTime(); 
	var purchaseList={
		userId:user._id+"",
		usersName:user.username,
		purchaseType:result.name,   //套餐类型 1是A套餐，2，B套餐，3，C套餐
        taoCanNum:data.num,         //本次购买套餐个数
		rabbitNum:rabbitNum,   		//购买的兔子的数量------------
        carrotNum:carrotNum,        //购买的胡萝卜的数量------------
        priceNum:priceNum,         //花费的火火兔币数量
		createTime:time            
	};
	await dao.save(request,"purchaseList",purchaseList);
	//找到用户的仓库
	var userDepot=await dao.findOne(request,"depot",{userId:user._id+""});
    console.log("原来user的rabbitB"+userDepot.rabbitB);
    console.log("原来user的胡萝卜"+user.carrot);
    console.log("原来user的胡萝卜"+user.RabbitCoin);
	//更新用户仓库里购买的兔子的数量
	var result1=await dao.updateOne(request,"depot",{_id:userDepot._id+""},{rabbitB:userDepot.rabbitB+rabbitNum});
	if(result1==null){
		reply({"message":"够买失败，没有更新成功仓库","statusCode":102,"status":false});
		return
	};
  	//更新购买后用户信息
    var result3=await dao.updateOne(request,"user",{_id:user._id},{ RabbitCoin:user.RabbitCoin-priceNum, carrot:user.carrot+carrotNum,buyTaoCan:"did"});

    if(result3!=null){	
		//找到该用户有没有被推荐人
		var resultParente=await dao.findOne(request,"user",{"username":user.parenteName});

		if(resultParente!=null){//说明该用户有一代好友
			await dao.updateOne(request,"user",{_id:resultParente._id+''},{carrot:resultParente.carrot+2*rabbitNum});   
            
            var dataOne={
                toUserName:resultParente.username,//受益用户名字
                toUserId:resultParente._id+"",   //受益用户id  
                fromUserName:user.username,     //奖励来自某某用户的账户
                fromName:user.name,             //奖励来自某用户的的昵称
                type:"一代好友奖励",                  //奖励类型 一代好友
                jiangLicarrot:systemSetJiling.one*rabbitNum,              //奖励的胡萝卜的数量
                boughtRabbitNum:rabbitNum,          //一代好友购买兔子的数量
                createTime:time,
            }
          //添加奖励记录
            await dao.save(request,"jiangLiJiLu",dataOne);
			var returnParent2=await dao.findOne(request,"user",{"username":resultParente.parenteName});

			if(returnParent2!=null){//说明用户有第二代好友

				await dao.updateOne(request,"user",{_id:returnParent2._id+''},{carrot:returnParent2.carrot+rabbitNum});
                var dataTwo={                                       
                    toUserName:returnParent2.username,//受益用户名字 
                    toUserId:returnParent2._id+"",   //受益用户id  
                    fromUserName:user.username,     //来自某某用户的奖励
                    fromName:user.name,             //奖励来自某用户的的昵称
                    type:"二代好友奖励",                  //奖励类型 二代好友
                    jiangLicarrot:systemSetJiling.two*rabbitNum,              //奖励的胡萝卜的数量
                    boughtRabbitNum:rabbitNum,          //一代好友购买兔子的数量
                    createTime:time,
                }
                //添加奖励记录
                await dao.save(request,"jiangLiJiLu",dataTwo);

				var returnParent3=await dao.findOne(request,"user",{"username":returnParent2.parenteName});
				if(returnParent3!=null){//说明用户还有第三代好友
                    await dao.updateOne(request,"user",{_id:returnParent3._id+''},{carrot:returnParent3.carrot+rabbitNum});
				    var datathree={
                        toUserName:returnParent3.username,//受益用户名字
                        toUserId:returnParent3._id+"",   //受益用户id  
                        fromUserName:user.username,       //来自某某用户的奖励
                        fromName:user.name,             //奖励来自某用户的的昵称
                        type:"三代代好友奖励",               //奖励类型 三代好友
                        jiangLicarrot:systemSetJiling.three*rabbitNum,      //奖励的胡萝卜的数量
                        boughtRabbitNum:rabbitNum,          //一代好友购买兔子的数量
                        createTime:time,
                    }
                    //添加奖励记录
                    await dao.save(request,"jiangLiJiLu",datathree);
                }
			}
		};
		reply({"message":"购买成功","statusCode":101,"status":true});
		return
	}else{
		reply({"message":"购买失败","statusCode":102,"status":false});
		return
	};
}
// //获取用户好友列表
// exports.getUserFriends=async function(request,reply){
//     var user= request.auth.credentials;
// //查询有过购买套餐的好友
//     var buyOneDai = await dao.findSum(request,"jiangLiJiLu",{$match:{toUserName:user.username,type:"一代好友奖励"}},{$group:{_id:"$fromName",carrotSum:{$sum:"$jiangLicarrot"},boughtRabbitNum:{$sum:"$boughtRabbitNum"}}});
//     var buyTwoDai = await dao.findSum(request,"jiangLiJiLu",{$match:{toUserName:user.username,type:"二代好友奖励"}},{$group:{_id:"$fromName",carrotSum:{$sum:"$jiangLicarrot"},boughtRabbitNum:{$sum:"$boughtRabbitNum"}}});
//     var buyThreeDai=await dao.findSum(request,"jiangLiJiLu",{$match:{toUserName:user.username,type:"三代好友奖励"}},{$group:{_id:"$fromName",carrotSum:{$sum:"$jiangLicarrot"},boughtRabbitNum:{$sum:"$boughtRabbitNum"}}});
//     var neverOneDai=await dao.find(request,"user",{parenteName:user.username,buyTaoCan:"never"});
//     var neverTwoDai=[];
//     var neverThreeDai=[];
//     if(neverOneDai.length!=0){//一代好友数组不为空
//         for(var i=0;i<neverOneDai.length;i++){
//             var resultParente2=await dao.find(request,"user",{parenteName:neverOneDai[i].username});
//             if(resultParente2.length!=0){//二代好友的数组不为空
//                 //往二代好友的数组里push找到的这个二代好友
//                 neverTwoDai=neverTwoDai.concat(resultParente);
//                 for(var j=0;j<resultParente2;j++){
//                     var resultParente3=await dao.find(request,"user",{parenteName:resultParente2[j].username});
//                     if(resultParente3.length!=0){//三代好友的数组不为空
//                         neverThreeDai=neverThreeDai.concat(resultParente3);
//                     };
//                 };
//                 //往三代好友的数组里加入这个新找到的三代好友
//             };
//         };
//     };
//     var dd={
//         "bought":{
//             "oneDai":buyOneDai,
//             "twoDai":buyTwoDai,
//             "threeDai":buyThreeDai
//         },
//         "neverBuy":{
//             "oneDai":neverOneDai,
//             "twoDai":neverTwoDai,
//             "threeDai":neverThreeDai
//         }
//     };
//     reply({"message":"查询成功","statusCode":101,"status":true,"resource":dd});
//     return;
// }
//获取用户好友列表
exports.getUserFriends=async function(request,reply){
    var user= request.auth.credentials;
//查询有过购买套餐的好友
   
    var neverOneDai=await dao.find(request,"user",{parenteName:user.username});
    var neverTwoDai=[];
    var neverThreeDai=[];
    if(neverOneDai.length!=0){//一代好友数组不为空
        for(var i=0;i<neverOneDai.length;i++){
            var resultParente2=await dao.find(request,"user",{parenteName:neverOneDai[i].username});
            if(resultParente2.length!=0){//二代好友的数组不为空
                //往二代好友的数组里push找到的这个二代好友
                neverTwoDai=neverTwoDai.concat(resultParente2);
                for(var j=0;j<resultParente2.length;j++){
                    var resultParente3=await dao.find(request,"user",{parenteName:resultParente2[j].username});
                    if(resultParente3.length!=0){//三代好友的数组不为空
                        neverThreeDai=neverThreeDai.concat(resultParente3);
                    };
                };
                //往三代好友的数组里加入这个新找到的三代好友
            };
        };
    };
    var dd={
        "oneDai":neverOneDai,
        "twoDai":neverTwoDai,
        "threeDai":neverThreeDai
    };
    reply({"message":"查询成功","statusCode":101,"status":true,"resource":dd});
    return;
}


//获取用户的仓库信息
exports.getUserDepot=async function(request,reply){
	var user=request.auth.credentials;
	var result=await dao.find(request,"depot",{userId:user._id+""});
	if(result){
        reply({"message":"查询成功","statusCode":101,"status":true,"resource":result});
    }else{
       	reply({"message":"失败","statusCode":102,"status":false});
    };
};
//获取用户的兔场的信息
exports.getUserWarren=async function(request,reply){
    var user=request.auth.credentials;
    var userWarren=await dao.find(request,"warren",{userId:user._id+""});
    if(userWarren){
        reply({"message":"查询成功","statusCode":101,"status":true,"resource":userWarren});
    }else{
        reply({"message":"查询失败","statusCode":102,"status":false});
    };
}

//获取用户的所有在兔场养殖的兔子的信息
exports.getUserRabbit=async function(request,reply){
	var user=request.auth.credentials;
	var result=await dao.find(request,"userRabbit",{userId:user._id+""},{},{pond:1});
	if(result){
        reply({"message":"查询成功","statusCode":101,"status":true,"resource":result});
    }else{
       	reply({"message":"失败","statusCode":102,"status":false});
    };
}
//提交提现申请---------
exports.tiXianShenQing=async function(request,reply){
	var user=request.auth.credentials;
    if(user.state==0){
        reply({"message":"提现失败，您的账户已经被冻结","statusCode":102,"status":false});
        return;
    };
    var resultFei=await dao.findOne(request,"systemTiXianShouXu");
    var tiXianFeiYong=resultFei.tiXianSXF;
	var data=request.payload;
	if(data.number<100||data.number%100!=0){
		reply({"message":"您的提现金额不对，必须是100起提,并且提现金额是100的整数","statusCode":102,"status":false});
		return;
	};
	var day = new Date().getDay();
    // if (day!=1){
    //     reply({"message": "今天不在提现周期内，请周一进行提现！", "statusCode": 102, "status": false});
    //     return;
    // };
    var nowTime = new Date().getTime();
    var startOne = new Date(format("yyyy/M/d",new Date())+" "+0+":"+"00").getTime();//9点的时间
    if (nowTime<startOne){
        reply({"message": "请在规定时间内提现！", "statusCode": 102, "status": false});
        return;
    }else{
        var startTwo = new Date(format("yyyy/M/d",new Date())+""+20+":"+"00").getTime();//11点30分的时间
        if (nowTime>startTwo){
            reply({"message": "请在规定时间内提现！", "statusCode": 102, "status": false});
            return;
        }; 
    };
    if(data.type==1){//判断是支付宝提现
        if (user.alipay == ""){
            reply({"message":"提现申请失败，请完善支付宝账号信息！","statusCode":102,"status":false});
            return;
        };
    }else if(data.type==2){//判断是微信提现
        if (user.wechat == ""){
            reply({"message":"提现申请失败，请完善微信账号信息！","statusCode":102,"status":false});
            return;
        };
    }else{
        reply({"message":"提现申请失败，请选择正确的提现类型！","statusCode":102,"status":false});
        return;
    };

    if(data.tranpwd!=CryptoJS.AES.decrypt(user.tranpwd,"AiMaGoo2016!@.").toString(CryptoJS.enc.Utf8)){
        reply({"message": "交易密码不正确，请重试！", "statusCode": 102, "status": false});
        return;
    };
    if(data.number+data.number*tiXianFeiYong>user.RabbitCoin){
        reply({"message":"申请提现失败,需要手续费扣除"+data.number*tiXianFeiYong+"个火兔币,火兔币余额不足","statusCode":102,"status":false});
        return;
    }else{
        await dao.updateOne(request,"user",{_id:user._id+""},{RabbitCoin:user.RabbitCoin-data.number-data.number*tiXianFeiYong});   
    };
    var safeList = {
        userId:user._id+"",
        username:user.username,
        name:user.name,
        number:data.number,
        shouxufei:data.number*tiXianFeiYong,
        tiXianzhangHao:"",
        status:0,               //默认为0，后台给客户已打钱是1，2是驳回申请
        createTime:new Date().getTime(),
    };
    if(data.type==1){//判断是支付宝提现
        safeList.zhangHaotype="支付宝";
        safeList.tiXianzhangHao=user.alipay;
    }else if(data.type==2){//判断是微信提现
        safeList.zhangHaotype="微信";
        safeList.tiXianzhangHao=user.wechat;
    };
    //建立一个申请列表--------------
    var result =await dao.save(request,"safeList",safeList);
    if(result==null){
        reply({"message":"提交提现申请失败","statusCode":102,"status":false});
        return;
    }else{
        reply({"message":"提交提现申请成功","statusCode":101,"status":true});
        return;
    } 
}

//用户获取开垦记录
exports.getOpenWarJiLu=async function(request,reply){
    var user=request.auth.credentials;
    //列表
    var data = await dao.find(request,"openWarJiLu",{userId:user._id+""},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"openWarJiLu",{userId:user._id+""});
    if(data == null){
        reply({"message":"获取用户开垦记录失败","statusCode":102,"status":false});
    }else{
        reply({"message":"获取用户开垦记录成功","statusCode":101,"status":true,"resource":data,"sum":sum});
    };
}

//获取用户完成的交易记录
exports.getTransacRecord=async function(request,reply){
    var id=request.params.id;
    var data = await dao.find(request,"transactionRecord",{$or:[{"buyerId":id},{"sellerId":id}]},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"transactionRecord",{$or:[{"buyerId":id},{"sellerId":id}]});
    if(data == null){
        reply({"message":"获取交易记录失败","statusCode":102,"status":false});
    }else{
        reply({"message":"获取交易记录成功","statusCode":101,"status":true,"resource":data,"sum":sum});
    }
}
//获取用户未完成的交易记录
exports.getdoingTran=async function(request,reply){
    var id=request.params.id;
    var data = await dao.find(request,"transaction",{$or:[{"buyerId":id},{"sellerId":id}]},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"transaction",{$or:[{"buyerId":id},{"sellerId":id}]});
    if(data == null){
        reply({"message":"获取交易记录失败","statusCode":102,"status":false});
    }else{
        reply({"message":"获取交易记录成功","statusCode":101,"status":true,"resource":data,"sum":sum});
    }
}

//获取用户的奖励记录
exports.getjiangLiJiLu=async function(request,reply){
    var id=request.params.id;
    var data = await dao.find(request,"jiangLiJiLu",{toUserId:id},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"jiangLiJiLu",{toUserId:id});
    if(data == null){
        reply({"message":"获取奖励记录失败","statusCode":102,"status":false});
    }else{
        reply({"message":"获取奖励记录成功","statusCode":101,"status":true,"resource":data,"sum":sum});
    }
}

//获取用户已购买的记录
exports.getBoughtTran=async function(request,reply){
    var user=request.auth.credentials;

    var data = await dao.find(request,"transactionRecord",{"buyerId":user._id+""},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"transactionRecord",{"buyerId":user._id+""});
    if(data == null){
        reply({"message":"获取交易记录失败","statusCode":102,"status":false});
    }else{
        reply({"message":"获取交易记录成功","statusCode":101,"status":true,"resource":data,"sum":sum});
    }
}


 //列表
//     var data = await dao.find(request,"safeList",{},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
//     //总数
//     var sum = await dao.findCount(request,"safeList",{});

//获取用户购买套餐记录
exports.getPurchaseList=async function(request,reply){
    var user=request.auth.credentials;
    var data = await dao.find(request,"purchaseList",{"userId":user._id+""},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"purchaseList",{"userId":user._id+""});
    if(data == null){
        reply({"message":"获取交易记录失败","statusCode":102,"status":false});
    }else{
        reply({"message":"获取交易记录成功","statusCode":101,"status":true,"resource":data,"sum":sum});
    }
}
//获取用户购买套餐记录
exports.getAllPurchaseList=async function(request,reply){
    var user=request.auth.credentials;
    var data = await dao.find(request,"purchaseList",request.payload.where,{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    var sum = await dao.findCount(request,"purchaseList",request.payload.where);
    if(data == null){
        reply({"message":"获取交易记录失败","statusCode":102,"status":false});
    }else{
        reply({"message":"获取交易记录成功","statusCode":101,"status":true,"resource":data,"sum":sum});
    }
}

//获取当前用户的提现列表
exports.safeList = async function(request,reply){
	var user=request.auth.credentials;
	//列表
    var data = await dao.find(request,"safeList",{userId:user._id+""},{},{createTime:-1},parseInt(request.params.size),parseInt(request.params.page));
    //总数
    var sum = await dao.findCount(request,"safeList",{userId:user._id+""});
    //findSum的结果是一个数组 $match的作用是过滤出符合条件的 并且将符合条传到下一个 $group 作用里，进行分组
    //$group里的 _id分组条件为null  则为统计总数，此处是累加属性值number总数，
    //如果$group里的 _id的属性值是查询的文档的某个属性值，则是按该属性值有个几个就分为几组 ，
    //$sum统计总数，$sum的属性值如果是"$属性值",这是统计这个属性值的总和，而此处_id的值是null,不按照_id进行分组，统计符合
    //条件的文档的每个number的属性值的总和。
    //$num的值是1是，则是统计符合条件的文档的个数，分组的话，计算每组的文档的个数，不分组的话，是所有文档的个数
    var goldSum = await dao.findSum(request,"safeList",{$match:{userId:user._id+""}},{$group:{_id:null,sum:{$sum:"$number"}}});
    var aa = {
        goldSum:goldSum.length==0?0:goldSum[0].sum,//全部的充值金额
    };
    // var sum = await dao.findCount(request,"safeList");
    if(data == null){
        reply({"message":"用户获取当前用户的提现列表","statusCode":102,"status":false});
    }else{
        reply({"message":"用户获取当前用户的提现列表","statusCode":101,"status":true,"resource":data,"sum":sum,"aa":aa});
    }
}



//用户忘记登陆密码
exports.getbackPwd=async function(request,reply){
	var data = request.payload;
    var user = await dao.find(request,"user",{"username":data.username});
    if (user.length==0){
        reply({"message":"账号错误，请重新输入","statusCode":102,"status":false});
        return;
    }
    var sms = await dao.find(request,"smsVerification",{mobile:user[0].mobile});
    if (sms.length==0){
        reply({"message":"验证码错误，请重新输入","statusCode":102,"status":false});
        return;
    }
    if(data.VerificationCode != sms[0].code){
		reply({"message":"验证码错误，请重新输入","statusCode":102,"status":false});
		return;
    }
    // var time = new Date().getTime();
    // if (time-sms[0].createTime>=120000){
    //     reply({"message":"验证码已超时，请重新发送！","statusCode":102,"status":false});
    //     return;
    // }
    if (data.password){
        data.password = CryptoJS.AES.encrypt(data.password,"AiMaGoo2016!@.")+"";
        await  dao.updateOne(request,"user",{_id:user[0]._id+""},{password:data.password});
    }
    if (data.tranpwd){
        data.tranpwd =  CryptoJS.AES.encrypt(data.tranpwd,"AiMaGoo2016!@.")+"";
        await  dao.updateOne(request,"user",{_id:user[0]._id+""},{tranpwd:data.tranpwd});
    }
    await dao.del(request,"smsVerification",{_id:sms[0]._id+""});
    reply({"message":"密码修改成功","statusCode":101,"status":true});


}

//时间格式化
function format(fmt,data){ //author: meizz 
    var o = {
        "M+": data.getMonth() + 1, //月份 
        "d+": data.getDate(), //日 
        "h+": data.getHours(), //小时 
        "m+": data.getMinutes(), //分 
        "s+": data.getSeconds(), //秒 
        "q+": Math.floor((data.getMonth() + 3) / 3), //季度 
        "S": data.getMilliseconds() //毫秒 
    };
    if(/(y+)/.test(fmt))fmt = fmt.replace(RegExp.$1, (data.getFullYear() + "").substr(4 - RegExp.$1.length));
    for(var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

//计算团队人数
async function addparentNumber(request,parentUsername,remdNumber = false){
    let parent = await dao.find(request,'user',{username:parentUsername});
    if (parent==0){
        return;
    }
    if(parent){
        if(remdNumber){
           await dao.updateOne(request,"user",{'_id':parent[0]._id+""},{remdNumber:parent[0].remdNumber+1,teamNumber:parent[0].teamNumber+1}); 
        }else{
           await dao.updateOne(request,'user',{'_id':parent[0]._id+""},{teamNumber:parent[0].teamNumber+1});
        }
        if(parent[0].parentUsername){
          await addparentNumber(request,parent[0].parentUsername);
        }
    }
}
//计算团队人数
async function jiangjinList(request,user,number){
    var jiangjin = {
        userId:user._id+"",
        username:user.username,
        number:number,
        type:"xitong",
        downId:user._id+"",
        downUser:user.username,
        generation:1,
        createTime:new Date().getTime()
    }
    await dao.save(request,"jiangjin",jiangjin);
}
//计算团队人数
async function addYeji(request,parentUsername,number,remdNumber = false){
    let parent = await dao.find(request,'user',{username:parentUsername});
    if (parent==0){
        return;
    }
    if(parent){
        if(remdNumber){
           await dao.updateIce(request,"user",{'_id':parent[0]._id+""},{zhituiYeji:number,teamYeji:number}); 
        }else{
           await dao.updateIce(request,'user',{'_id':parent[0]._id+""},{teamYeji:number});
        }
        if(parent[0].parentUsername){
          await addparentNumber(request,parent[0].parenteName,number);
        }
    }
}
