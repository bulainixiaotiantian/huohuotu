
//引入数据操作类库
const dao = require("../dao/dao");
var CryptoJS = require("crypto-js");


//一键喂养 喂养兔子只需要传入兔场编号 
exports.feedRabbitPond=async function(request,reply){
	var user = request.auth.credentials;  //credentials是包含用户的身份信息的
	//得到要喂养的兔子的数组
	var nowTime=new Date().getTime();
	var userWarren=await dao.find(request,"warren",{userId:user._id+"",pond:request.payload.warrenPond});
	var userRabbit=await dao.find(request,"userRabbit",{userId:user._id+"",pond:request.payload.warrenPond});

	//reply({"message":"一键喂养失败，白菜数量不足","statusCode":102,"status":false});
		if(userWarren.length==0){
			reply({"message":"该兔场暂未开垦","statusCode":102,"status":false});
			return;
		}
		if(userRabbit.length==0){
			reply({"message":"该兔场无火火兔养殖","statusCode":102,"status":false});
			return;
		}
		if(userRabbit[0].eateState==-1){
			reply({"message":"一键喂养失败，兔子不需要喂养","statusCode":102,"status":false});
			return;
		};		
		//判断兔子是不是体验兔 
		//判断是否是体验兔  只喂白菜
		if(userRabbit[0].rabbitType=="rabbitA"){ //因为一个兔场如果有一个是体验兔子，则全部都是体验兔子。所以只需判断其中一个就行了。
			if(user.cabbage<userRabbit.length){//白菜数量不足
				reply({"message":"一键喂养失败，白菜数量不足","statusCode":102,"status":false});
				return
			}else{//更新用户的拥有的白菜数量				
				await dao.updateOne(request,"user",{_id:user._id+""},{cabbage:user.cabbage-userRabbit.length});
				for(var i=0;i<userRabbit.length;i++){
					await dao.updateOne(request,"userRabbit",{_id:userRabbit[i]._id+""},{eateState:-1,eatTime:nowTime});
				}
				var feedJiLu={
					username:user.username,				  //用户的姓名
					userId:user._id+"",					  //用户的id
					warrenPond:request.payload.warrenPond,//喂水的兔子的数量
					time:nowTime,
					rabbitNum:userRabbit.length			  //喂养兔子的数量
				}
				await dao.save(request,"feedJiLu",feedJiLu);
				reply({"message":"一键喂养成功","statusCode":101,"status":true});
				return;
			};
			console.log("体验兔"+userRabbit);
		}else{
			console.log("购买的"+userRabbit);
			if(user.carrot<userRabbit.length){//萝卜数量不足
				reply({"message":"一键喂养失败，用户的胡萝卜数量不足","statusCode":102,"status":false});
				return
			}else{//更新用户的拥有的萝卜数量		
				await dao.updateOne(request,"user",{_id:user._id+""},{carrot:user.carrot-userRabbit.length});
				for(var j=0;j<userRabbit.length;j++){
					await dao.updateOne(request,"userRabbit",{_id:userRabbit[j]._id+""},{eateState:-1,eatTime:nowTime});
				};
				var feedJiLu={
					username:user.username,				  //用户的姓名
					userId:user._id+"",					  //用户的id
					warrenPond:request.payload.warrenPond,//喂水的兔子的数量
					time:nowTime,
					rabbitNum:userRabbit.length			  //喂养兔子的数量
				};
				
				await dao.save(request,"feedJiLu",feedJiLu);
				reply({"message":"一键喂养成功","statusCode":101,"status":true});
				return
			};
		};
}

//一---------------------一键给兔子喂水------------------------------
exports.yiDrinkRabbit=async function(request,reply){
	var user = request.auth.credentials;
	//得到要喂养的兔子的数组----
	var nowTime=new Date().getTime();  
	var userWarren=await dao.find(request,"warren",{userId:user._id+"",pond:request.payload.warrenPond});
	var userRabbit=await dao.find(request,"userRabbit",{userId:user._id+"",pond:request.payload.warrenPond});
	if(userWarren.length==0){
		reply({"message":"该兔场暂未开垦","statusCode":102,"status":false});
		return;
	};
	//因为是一起喂的，所以喂水状态都一样，判断其中一个兔子是不是需要喂水就可以了，
	if(userRabbit.length==0){
		reply({"message":"该兔场暂无火火兔在养殖","statusCode":102,"status":false});
		return;
	};
	if(userRabbit[0].drinkState==-1){
		reply({"message":"一键喂水失败，兔子不需要喂水","statusCode":102,"status":false});
		return
	};
    if(user.water<userRabbit.length){//萝卜数量不足
		reply({"message":"一键喂水失败，用户的水数量不足","statusCode":102,"status":false});
		return
	}else{
		//更新用户的拥有的萝卜数量		
		await dao.updateOne(request,"user",{_id:user._id+""},{water:user.water-userRabbit.length});
		for(var j=0;j<userRabbit.length;j++){
			await dao.updateOne(request,"userRabbit",{_id:userRabbit[j]._id+""},{drinkState:-1,drinkTime:nowTime});
		};
		var drinkJiLu={
			username:user.username,				  //用户的姓名
			userId:user._id+"",					  //用户的id
			warrenPond:request.payload.warrenPond,//喂水的兔子的数量
			time:nowTime,
			rabbitNum:userRabbit.length			  //喂养兔子的数量
		}
		await dao.save(request,"drinkJiLu",drinkJiLu);
		reply({"message":"一键喂水成功","statusCode":101,"status":true});
		return
	}
}
//一只一只地喂养兔子  需要传入兔子的id 
exports.feedRabbit=async function(request,reply){
	var user = request.auth.credentials;//credentials是包含用户的身份信息的
	var data=request.payload;
	//得到要喂养的兔子
	var feedingRabbit=await dao.findById(request,"userRabbit",request.params.id);
	//判断喂养兔子是否存在
	if(feedingRabbit==null){
		reply({"message":"喂养失败，喂养的兔子不存在","statusCode":102,"status":false});
		return 
	};
	//判断兔子是否需要喂养  1需要喂养  -1不需要喂养
	if(feedingRabbit.eateState==-1){
		reply({"message":"喂养失败，喂养的兔子不需要喂养","statusCode":102,"status":false});
		return
	};
	if(feedingRabbit.rabbitType=="rabbitA"){//判断是不是喂养的体验兔子，
		if(user.cabbage==0){//白菜数量不足
			reply({"message":"喂养失败，用户的白菜数量不足","statusCode":102,"status":false});
			return
		}else{//更新用户的拥有的萝卜数量		
			await dao.updateOne(request,"user",{_id:user._id+""},{cabbage:user.cabbage-1});
		}
	}else if(feedingRabbit.rabbitType!="rabbitA"){ 
		if(user.carrot==0){//萝卜数量不足
			reply({"message":"喂养失败，用户的胡萝卜数量不足","statusCode":102,"status":false});
			return
		}else{//更新用户的拥有的萝卜数量				
			await dao.updateOne(request,"user",{_id:user._id+""},{carrot:user.carrot-1});
		};
	}
	var time=new Date().getTime();
	//更新兔子的喂养状态和喂养时间
	await dao.updateOne(request,"userRabbit",{_id:feedingRabbit._id+""},{eatTime:time,eateState:-1});
	reply({"message":"喂养成功","statusCode":101,"status":true});
	return
}

//一只一只给兔子喂水---------------------
exports.drinkRabbit=async function(request,reply){
	var user = request.auth.credentials;  
	//得到要喂养的兔子
	var feedingRabbit=await dao.findById(request,"userRabbit",request.params.id);
	//判断喂养兔子是否存在
	if(feedingRabbit==null){
		reply({"message":"喂水失败，该兔子不存在","statusCode":102,"status":false});
		return
	};
	//判断兔子是否需要喂水  1需要喂养  -1不需要喂养
	if(feedingRabbit.drinkState==-1){
		reply({"message":"喂水失败，该兔子不需要喂水","statusCode":102,"status":false});
		return			
	};
	if(user.water==0){//水数量不足
		reply({"message":"喂水失败，用户的水不足","statusCode":102,"status":false});
		return
	}else{
		//更新用户的拥有的水	//更新兔子的喝水状态和喝水时间	
		var time=new Date().getTime();		
		await dao.updateOne(request,"user",{_id:user._id+""},{water:user.water-1});
		await dao.updateOne(request,"userRabbit",{_id:feedingRabbit._id+""},{drinkTime:time,drinkState:-1});
		reply({"message":"喂水成功","statusCode":101,"status":true});
		return
	};
}

//按照传入的兔子的id数组喂水
exports.drinkMoreRabbit=async function(request,reply){
    var user=request.auth.credentials;
    var data=request.payload;
    var userWareen=await dao.findOne(request,"warren",{"pond":data.pond,"userId":user._id+""});
    if(userWareen==null){
        reply({"message":"该兔场还未开垦","statusCode":102,"status":false});
        return;
    };
    //要喂水的兔子的个数
    var num=data.content.length;
    if(user.water<num){//萝卜数量不足
		reply({"message":"喂水失败，用户的水数量不足","statusCode":102,"status":false});
		return
	};
	
    for(var j=0;j<num;j++){
    	var rabbit=await dao.findById(request,"userRabbit",data.content[j]);
    	if(rabbit[j].pond!=data.pond){
    		reply({"message":"喂水失败，输入的兔场编号和兔子所在的兔场编号不一致","statusCode":102,"status":false});
    		return;
    	}
    	if(rabbit.drinkState==-1){
 			reply({"message":"喂水失败,请选择需要喂水的兔子，","statusCode":102,"status":false});
    		return;
 		}
    };
    var time=new Date().getTime();	
    for(var i=0;i<num;i++){
    	var needRabbit=await dao.findById(request,"userRabbit",data.content[i]);	
		await dao.updateOne(request,"user",{_id:user._id+""},{water:user.water-1});
		await dao.updateOne(request,"userRabbit",{_id:needRabbit._id+""},{drinkTime:time,drinkState:-1});
    	continue;
    }
   reply({"message":"喂水成功","statusCode":101,"status":true});
   return;
   
}
//喂养兔子，按照传入的兔子的id数组
exports.feedMoreRabbit=async function(request,reply){
	var user=request.auth.credentials;
    var data=request.payload;
    var userWareen=await dao.findOne(request,"warren",{"pond":data.pond,"userId":user._id+""});
    if(userWareen==null){
        reply({"message":"该兔场还未开垦","statusCode":102,"status":false});
        return;
    };
}

//转移兔子从仓库到兔场-----------
exports.toWrren=async function(request,reply){
	var user = request.auth.credentials; 
	if(user.state==0){
        reply({"message":"放养失败，您的账户已经被冻结","statusCode":102,"status":false});
        return;
    };
	var data=request.payload;
	var warrenPond=data.warrenPond;//得到兔场的编号
	//找到要养兔子的兔场--------
	var userWarren=await dao.findOne(request,"warren",{userId:user._id+"",pond:warrenPond});
	if(userWarren==null){
		reply({"message":"放置失败，该兔场未开垦"});
		return
	}
	console.log(userWarren)
	//得到用户的仓库-----------
	var userDepot=await dao.findOne(request,"depot",{userId:user._id+""});
	//判断要转移的兔子的类型---- 
	if(data.rabbitType==1){//data.rabbitType=1  是购买的兔子
		if(data.rabbitNum>userDepot.rabbitB){
			reply({"message":"转移失败!仓库该类型兔子不足","statusCode":102,"status":false});
			return
		}else{
			//判断兔场是超级 还是普通 1-8为普通  9-12为超级
			if(warrenPond>=9&&warrenPond<=12){//超级兔场
				reply({"message":"转移失败!该类型兔子不允许放置此兔场","statusCode":102,"status":false});
				return
			}else if(0<warrenPond&&warrenPond<9){//普通兔场
					//判断要放置的兔子的数量是否小于兔场允许养数量
					if(userWarren.raisingRabbit<data.rabbitNum){
						reply({"message":"转移失败!空间不足","statusCode":102,"status":false});
						return
					}else{
							var dataWarren={
								raisingRabbit:userWarren.raisingRabbit-data.rabbitNum, //更新该兔场允许养兔子的数量  
								rabbitB:userWarren.rabbitB+data.rabbitNum              //更新兔场的购买来的兔子数量
							}
							await dao.updateOne(request,"warren",{_id:userWarren._id+""},dataWarren);
							//更新仓库的兔子数量---
							await dao.updateOne(request,"depot",{_id:userDepot._id+""},{rabbitB:userDepot.rabbitB-data.rabbitNum});
							var time3 =new Date().getTime();
							for (var i = 0; i < data.rabbitNum; i++){   
					    		 var RabbitB={
							    	"userId":user._id+"",
							    	"userName":user.username,
							    	"creatRabbitTime":time3,
							    	"rabbitType":"rabbitB",		 //rabbitA:体验火火兔  rabbitB:购买的火火兔  rabbitC:下的火火兔和交易得来的
						    		"eateState":1,               //1 需要吃白菜的状态，-1是不需要吃白菜
						    		"drinkState":1,              //1 需要喝水的状态，-1是不需要喝水
						    		"eatTime":"",				 //喂养时间 
						    		"drinkTime":"",				 //喝水的时间
						    		"plantId":userWarren._id+"", //所在兔场的的id
						    		"beOut" : false,			 //兔子是否出局 false为 未出局，true为已经出局	
						    		"pond":warrenPond,           //所在兔场的编号
						    		"everyTimesCoin":0,          //每次产火兔币60个
						    		"madeTimes":0, //makeRabbitNum  //下兔子的个数，当边变为6的时候，则出局
						    		//"makeRabbitState":false,	 //当为false时，没有到达下小小兔子的条件，为true时，则达到下小小兔子的条件。
						    		"lastMadeTime":time3,	//makeRabbitTime //上一次下小小兔子的时间
						    		"haiYouTimes":6,// haiYouRabbitNum
						    	};
					    		await dao.save(request,"userRabbit",RabbitB);
					    	};
					    	reply({"message":"放置成功"+warrenPond+"!","statusCode":101,"status":true});
							return
					};
			}else{
				reply({"message":"放置失败!，请传入正确的兔场编号","statusCode":102,"status":false});
				return
			};
		};
	}else if(data.rabbitType==2){	
		if(data.rabbitNum>userDepot.rabbitC){
			reply({"message":"转移失败!仓库该类型兔子不足","statusCode":102,"status":false});
			return
		}
		//判断要放置的兔子的数量是否小于兔场允许养数量
		if(data.rabbitNum>userWarren.raisingRabbit){
			reply({"message":"转移失败!仓库该已经满了","statusCode":102,"status":false});
			return
		}else{
			var dataWarren={
				raisingRabbit:userWarren.raisingRabbit-data.rabbitNum, //更新该兔场允许养兔子的数量  
				rabbitC:userWarren.rabbitC+data.rabbitNum             //更新兔场的复投或收购的兔子数量
			}
			await dao.updateOne(request,"warren",{_id:userWarren._id+""},dataWarren);
			//更新仓库的复投或收购的兔子数量
			await dao.updateOne(request,"depot",{_id:userDepot._id+""},{rabbitC:userDepot.rabbitC-data.rabbitNum});
			var time3 =new Date().getTime();
			for (var i = 0; i < data.rabbitNum; i++){   
	    			var RabbitC={
			    	"userId":user._id+"",
			    	"userName":user.username,
			    	"creatRabbitTime":time3,
			    	"rabbitType":"rabbitC",		//rabbitA:体验火火兔  rabbitB:购买的火火兔  rabbitC:下的火火兔和交易得来的
		    		"eateState":1,              //1 需要吃白菜的状态，-1是不需要吃白菜
		    		"drinkState":1,             //1 需要喝水的状态，-1是不需要喝水             
		    		"eatTime":"",				//喂养时间 
		    		"drinkTime":"",				//喝水的时间
		    		"plantId":userWarren._id+"",//所在兔场的的id
		    		"beOut" : false,			//兔子是否出局 false为 未出局，true为已经出局
		    		"pond":warrenPond,          //所在兔场的编号
		    		"everyTimesCoin":0,
		    		'madeTimes':0,          //下火兔币的个数，当边变为6的时候，则出局
		    		//"makeRabbitState":false,	//当为false时，没有到达下小小兔子的条件，为true时，则达到下小小兔子的条件。
		    		"lastMadeTime":time3,		//刚放置兔场时，上一次产生火兔币的时间和放置兔场的时间相等
		    		"haiYouTimes":6			//还有6次下小小兔的期数
		    	};
	    		await dao.save(request,"userRabbit",RabbitC);
	    	};
	    	reply({"message":"放置成功!","statusCode":101,"status":true});
			return
		}			
	}
}
//用户一键采集火兔币-------------------------
exports.shouRabbitCoin=async function(request,reply){
	var user=request.auth.credentials;
	//var Pond=request.payload;
	var userWarren=await dao.find(request,"warren",{userId:user._id+""});
	if(userWarren.length==0){
		reply({"message":"您现在暂无兔场被开发","statusCode":102,"status":true});
	}
	var num=0;
	for(var i=0;i<userWarren.length;i++){
		if(userWarren[i].RabbitCoin>0){
			num+=userWarren[i].RabbitCoin;
			await dao.updateOne(request,"warren",{_id:userWarren[i]._id},{RabbitCoin:0});
		};
	};
	var result=await dao.updateOne(request,"user",{_id:user._id},{RabbitCoin:user.RabbitCoin+num});
	if(result==null){
		reply({"message":"回收失败，请重试","statusCode":102,"status":false});
		return;
	}else{
		reply({"message":"回收火兔币成功","statusCode":101,"status":true});
		return;
	}
}

exports.yiChuRabbit=async function(request,reply){
	var user=request.auth.credentials;
	var userWarren=await dao.findOne(request,"warren",{"userId":user._id+"","pond":pond});
	if(userWarren.length==0){
		reply({"message":"您现在暂无兔场被开发","statusCode":102,"status":true});
	};
	var rabbit=await dao.find(request,"userRabbit",{"userId":user._id+"","pond":pond});
	for(var i=0;i<rabbit.length;i++){
		await dao.del(request,"userRabbit",{_id:rabbit[i]._id});
	}

	reply({"message":"移除火火兔子成功","statusCode":101,"status":true});
	return;
}


//用户按兔场编号采集火兔币-------------------------
exports.wareenSRabbitCoin=async function(request,reply){
	var user=request.auth.credentials;
	var pond=request.payload.pond;
	var userWarren=await dao.findOne(request,"warren",{"userId":user._id+"","pond":pond});
	if(userWarren==null){
		reply({"message":"当前兔场没有被开发","statusCode":102,"status":false});
		return;
	}
	var num=0;
	if(userWarren.RabbitCoin<=0){
		reply({"message":"当前兔场没有火兔币","statusCode":102,"status":false});
		return;
	};
	num=userWarren.RabbitCoin;
	await dao.updateOne(request,"warren",{_id:userWarren._id},{RabbitCoin:0});

	var result=await dao.updateOne(request,"user",{_id:user._id},{RabbitCoin:user.RabbitCoin+num});
	if(result==null){
		reply({"message":"收获失败，请重试","statusCode":102,"status":false});
		return;
	}else{
		reply({"message":"收获火兔币成功","statusCode":101,"status":true});
		return;
	}
}
// //体验火火兔下火兔币--------------------	
// exports.rabbitCoin=async function(request,reply){
// 	var user = request.auth.credentials; 
// 	var nowTime = new Date().getTime();     //得到当前的时间---
// 	  //查询 得到体验兔子的数组
//     var RabbtitA=await dao.find(request,"userRabbit",{"userId":user._id+"","rabbitType":"rabbitA"});
// 	for(var i=0;i<RabbtitA.length;i++){
// 			if(RabbtitA[i].makeCoinTimes>=6){
// 				reply("第"+i+1+"个体验兔已经出具");
//     			continue;//不符合条件跳出本次循环
// 			};
// 			var difSedonds=(nowTime-RabbtitA[i].lastMadeTime)/1000;//得到当前毫秒戳和 上一次下兔子的时间戳的的差 并换算成秒数
//     		var difDate=difSedonds/86400;                		   //时间差换成单位天数	
// 			if(difDate<9){
// 				reply("第"+i+1+"个体验兔的时间不够");
//     			continue;//不符合条件跳出本次循环
// 			}else{
// 				//更新用户的火兔币的个数
// 				await dao.updateOne(request,"user",{_id:user._id+""},{RabbitCoin:user.RabbitCoin+RabbtitA[i].everyTimesCoin});
// 				var data={
// 		    		"makeCoinTimes":RabbtitA[i].makeCoinTimes+1,   //产火兔币的次数，当达到 6次时 则为出局
// 		    		"makeCoinTime":nowTime			             //上一次产火兔币的时间
// 				};
// 				//更新该兔子的下火兔币的时间和下火兔的次数
// 				await dao.updateOne(request,"userRabbit",{_id:RabbtitA[i]._id+""},data);
// 			};							
// 	};
// 	reply({"message":"产火兔币成功","statusCode":101,"status":true});
// }

//开垦兔场----------------------------
exports.openUpWarren=async function(request,reply){
	var user = request.auth.credentials; 
	if(user.state==0){
        reply({"message":"开垦失败，您的账户已经被冻结","statusCode":102,"status":false});
        return;
    };
	//用户的第二代好友人数
	var secondPeopleNum=await dao.find(request,"user",{parenteName:user.username});
	//找到，用户现在拥有的兔场的数组
	var arrayWarren=await dao.find(request,"warren",{userId:user._id+""});
	var warrenPond=request.payload.pond;
	var kaiKenWarren=await dao.findOne(request,"warren",{userId:user._id+"",pond:warrenPond});

	//判断该兔场是否已经开垦

	if(kaiKenWarren!=null){
		reply({"message":"开垦失败该兔场已经被开垦","statusCode":102,"status":false});
		return
	}
	var nowTime=new Date().getTime();
	//判断开垦的是不是超级兔场
	if(12>=warrenPond&&warrenPond>=9){
		if(arrayWarren.length>=8){
			var warren={
				userName:user.username,
				userId:user._id+"",
				createWarrenTime:nowTime, //创建兔场时间
				pond:warrenPond,		//兔场的编号
			    rabbitC:0,		//rabbitA:体验火火兔  rabbitB:购买的火火兔  rabbitC:下的小兔和收购来的
	    		rabbitA:0,      //体验兔子的数量
	    		rabbitB:0,	    //购买来的兔子的数量
	    		warrenType:"super", //当i小于8时，标注兔场为普通兔场
	    		raisingRabbit:4,
	    		RabbitCoin:0   //
    		} 
    		await dao.save(request,"warren",warren);
			var openJiLu={
				userName:user.username,
				userId:user._id+"",
				Time:nowTime, //创建兔场时间
				pond:warrenPond,		//兔场的编号
				warrenType:"super", //当i小于8时，标注兔场为普通兔场
			};	
			await dao.save(request,"openWarJiLu",openJiLu);
			reply({"message":"开垦成功","statusCode":101,"status":true});
			return
		}else if(arrayWarren.length<8){
			reply({"message":"开垦失败，普通兔场开垦完才可以开垦超级兔场","statusCode":102,"status":false});
			return
		}
	//判断开垦的是不是普通的兔场
	}else if(warrenPond>1&&warrenPond<=8){
		//判断是否开垦到第5-8个普通兔场
		if(arrayWarren.length<4){//判断目前普通兔场不足4个
			var warren={
				userName:user.username,
				userId:user._id+"",
				createWarrenTime:nowTime, //创建兔场时间
				pond:warrenPond,		//兔场的编号
			    rabbitC:0,		//rabbitA:体验火火兔  rabbitB:购买的火火兔  rabbitC:下的小兔和收购来的
	    		rabbitA:0,      //体验兔子的数量
	    		rabbitB:0,	    //购买来的兔子的数量
	    		warrenType:"ordinary", //当i小于8时，标注兔场为普通兔场
	    		raisingRabbit:2,
	    		RabbitCoin:0
    		} ;
    		await dao.save(request,"warren",warren);
   			var openJiLu={
				userName:user.username,
				userId:user._id+"",
				Time:nowTime, //创建兔场时间
				pond:warrenPond,		//兔场的编号
				warrenType:"ordinary", //当i小于8时，标注兔场为普通兔场
			};	
			await dao.save(request,"openWarJiLu",openJiLu);
			
			reply({"message":"开垦成功","statusCode":101,"status":true});
			return
			
		}else if(arrayWarren.length>=4){//判断目前普通兔场已经满足4个，则在开垦普通需要判断第二代推荐人数是否足够8人
			if(secondPeopleNum.length>=8){
				var warren={
					userName:user.username,
	    			userId:user._id+"",
	    			createWarrenTime:nowTime, //创建兔场时间
					pond:warrenPond,		//兔场的编号
	    		    rabbitC:0,		        //rabbitA:体验火火兔  rabbitB:购买的火火兔  rabbitC:下的小兔和收购来的
		    		rabbitA:0,      //体验兔子的数量
		    		rabbitB:0,	    //购买来的兔子的数量
		    		warrenType:"ordinary", //当i小于8时，标注兔场为普通兔场-
		    		raisingRabbit:2,
		    		RabbitCoin:0
		    	}
		    	await dao.save(request,"warren",warren);
				var openJiLu={
					userName:user.username,
					userId:user._id+"",
					Time:nowTime, //创建兔场时间
					pond:warrenPond,		//兔场的编号
					warrenType:"ordinary", //当i小于8时，标注兔场为普通兔场
				};	
				await dao.save(request,"openWarJiLu",openJiLu);
				saveOpenWarJiLu("ordinary")//创建开垦记录
			    reply({"message":"开垦成功","statusCode":101,"status":true});
			    return
			}else{
				reply({"message":"开垦失败第二代人数不足8人"+secondPeopleNum.length+"","statusCode":102,"status":false});
				return
			};
		}
	}else if(warrenPond>12||warrenPond<=1){
		reply({"message":"开垦失败，情输入正确的兔场编号","statusCode":102,"status":false});
		return
	};
}


//分享到微信朋友圈获得泉水
exports.shareWeiXin=async function(request,reply){
	//微信分享过调用该接口----------------
	//如果没有分享过微信就不调用这个接口
	//至于是不是微信分享过好友了，这里不做判断，有其他的接口逻辑负责判断微信有没有实现
	//目前在等待客户发这个微信接口，
	var user=request.auth.credentials;
	//得到当前的时间毫秒------------------
	var nowTime=new Date().getTime();
	//判断用户之前是否分享过朋友圈，如果有时间就不会为空
	if(user.shareWeiXinTime==null){//时间这里为空，则说明是第一次分享，就不比较时间有没有超过一天，
		//因为每天只允许分享一次，这里是第一次分享就不做判断
		var data={
			shareWeiXinTime:nowTime,
			water:user.water+1
		};
		await dao.updateOne(request,"user",{_id:user._id+""},data);
		reply({"message":"分享朋友圈成功获得泉水"+dif_second+"","statusCode":101,"status":true});
		return;
	}else{
		//得到当前时间和上一次分享的时间差 
		var disTime=nowTime-user.shareWeiXinTime;// 单位毫秒
		var	dif_second=disTime/1000;//换算成秒
		var dif_hours=dif_second/3600;//单位毫秒换换算成小时
		if(dif_second>200){//满足一天以后 可以获得泉水
			var data={
				shareWeiXinTime:nowTime,
				water:user.water+1
			}
			await dao.updateOne(request,"user",{_id:user._id+""},data);
			reply({"message":"分享朋友圈成功获得泉水"+dif_second+"","statusCode":101,"status":true});
			return
		}else{
			reply({"message":"获取泉水失败"+dif_second+"秒，时间不足够24个小时","statusCode":102,"status":false});
			return
		}
	}
}