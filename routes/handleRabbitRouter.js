const Joi = require('joi');
const handleRabbitService = require('../service/handleRabbitService');


//把兔子从仓库转移到兔场-------
module.exports=[
	{
    	method:'post',
        path:'/handle/toWrren',
        handler:handleRabbitService.toWrren,
        config:{
             auth: 
            {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: 'ok把兔子从仓库转移到兔场 state',
            notes: 'ok把兔子从仓库转移到兔场 state',
            tags: ['api'],
            validate:{
             	payload:{
				    "rabbitNum":Joi.number().default(1).description("转移到兔场兔子的个数"),
				    "warrenPond":Joi.number().default(0).description("兔场编号 1-8 普通，9-12超级"),
				    "rabbitType":Joi.number().required().description("转移兔子的类型，1是购买的类型 2是复投的"),
             	},
             	headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //喂水兔子，按照传入的兔子的id数组
    {
        method: 'PUT',
        path: '/handle/drinkMoreRabbit',
        handler:handleRabbitService.drinkMoreRabbit,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            },
            description: '按照传入的兔子的id数组喂水',
            notes: '按照传入的兔子的id数组喂水',
            tags: ['api'],
            validate: {
                payload:{
                    content:Joi.array().required().description('兔子的id数组'),
                    pond: Joi.number().required().description("兔场的编号"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
      //喂养兔子，按照传入的兔子的id数组
    {
        method: 'PUT',
        path: '/handle/feedMoreRabbit',
        handler:handleRabbitService.feedMoreRabbit,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            },
            description: '喂养兔子，按照传入的兔子的id数组',
            notes: '喂养兔子，按照传入的兔子的id数组',
            tags: ['api'],
            validate: {
                payload:{
                    content:Joi.array().required().description('兔子的id数组'),
                    pond: Joi.number().required().description("兔场的编号"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
    //用户喂养兔子需要传入一个兔子id
    {
    	method:'put',
        path:'/handle/feedRabbit/{id}',
        handler:handleRabbitService.feedRabbit,
        config:{
             auth: 
            {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '一只一只喂养兔子',
            notes: '一只一只喂养兔子',
            tags: ['api'],
            validate: {
            	params:{
                    "id" : Joi.string().required().description("喂养兔子的id"),
                },
             	headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //1一键用户喂养兔子-------只需要传入兔场的编号
    {
    	method:'post',
        path:'/handle/feedRabbit',
        handler:handleRabbitService.feedRabbitPond,
        config:{
             auth: 
            {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: 'ok一键喂养兔子',
            notes: 'ok一键喂养兔子',
            tags: ['api'],
            validate: {
             	payload:{
				    "warrenPond":Joi.number().required().description('兔场编号'),
             	},
             	headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
     //一键给兔子喂水------------------------------
    {
    	method:'post',
        path:'/handle/yiDrinkRabbit',
        handler:handleRabbitService.yiDrinkRabbit,
        config:{
             auth: 
            {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: 'ok一键给兔子喂水',
            notes: 'ok一键给兔子喂水',
            tags: ['api'],
            validate: {
            	payload:{
                    "warrenPond" : Joi.number().required().description("兔场编号"),
                },
             	headers: Joi.object({
                    'authorization':Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },  
   
     //1按照id给兔子喂水-------
    {
    	method:'put',
        path:'/handle/drinkRabbit/{id}',
        handler:handleRabbitService.drinkRabbit,
        config:{
             auth: 
            {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '一只一只给兔子喂水',
            notes: '一只一只给兔子喂水',
            tags: ['api'],
            validate: {
            	params:{
                    "id" : Joi.string().required().description("喂养兔子的id"),
                },
             	headers: Joi.object({
                    'authorization':Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },     
    {//1开垦兔场------------
    	method:'post',
        path:'/handle/openUpWarren',
        handler:handleRabbitService.openUpWarren,
        config:{
             auth: 
            {
              strategy: 'bearer',
              scope: 'USER'
            },
            description: 'ok开垦兔场并自动生成记录 state',
            notes: 'ok开垦兔场并自动生成记录 state',
            tags: ['api'],
            validate: {
            	payload:{
				    "pond":Joi.number().required().description('开垦兔场的编号从0-11'),
             	},
             	headers:Joi.object({
                    "authorization":Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    {//用户一键收集火兔币------------
        method:'post',
        path:'/handle/shouRabbitCoin',
        handler:handleRabbitService.shouRabbitCoin,
        config:{
             auth: 
            {
              strategy: 'bearer',
              scope: 'USER'
            },
            description: 'ok用户一键收集火兔币',
            notes: 'ok用户一键收集火兔币',
            tags: ['api'],
            validate:{
                // payload:{
                //     "pond":Joi.number().required().description('兔场的编号从0-11'),
                // },
                headers:Joi.object({
                    "authorization":Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    {//用户手动收集火兔币-按照兔场编号-----------
        method:'post',
        path:'/handle/wareenSRabbitCoin',
        handler:handleRabbitService.wareenSRabbitCoin,
        config:{
             auth: 
            {
              strategy: 'bearer',
              scope: 'USER'
            },
            description: 'ok按照兔场编号，收集火兔币',
            notes: 'ok按照兔场编号，收集火兔币',
            tags: ['api'],
            validate:{
                payload:{
                    "pond":Joi.number().required().description('兔场的编号从1-12'),
                },
                headers:Joi.object({
                    "authorization":Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    {   //分享朋友圈获得泉水--------------------------
    	method:'post',
        path:'/handle/shareWeiXin',
        handler:handleRabbitService.shareWeiXin,
        config:{
             auth: 
            {
              strategy: 'bearer',
              scope: 'USER'
            },
            description: '分享朋友圈获得泉水',
            notes: '分享朋友圈获得泉水',
            tags: ['api'],
            validate: {
             	headers:Joi.object({
                    "authorization":Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
]