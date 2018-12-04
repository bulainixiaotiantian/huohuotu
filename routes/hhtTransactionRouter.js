/**
 * 交易信息路由管理
 * Created by chenda on 2016/10/23.
 */

const Joi = require('joi');
const transactionService = require('../service/hhtTransactionService');
const hhtUserService = require('../service/hhtUserService');
module.exports = [
// 进入交易-----交易的是火兔币
    {
        method: 'POST',
        path: '/tran/enterTransact',
        handler:transactionService.enterTransact,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            },
            description: '线上交易卖家建立交易记录 OK state',
            notes: '线上交易卖家建立交易记录 OK state',
            tags: ['api'],
            validate:{
                payload:{
                    rabbitCoinNum:Joi.number().default(0).description("交易总金额"),
                    number: Joi.number().required().description("交易商品的数量"),
                    buyerName: Joi.string().required().description("交易的对方账号"),
                    tranpwd: Joi.string().required().description("用户的交易密码"),
                    type: Joi.number().description("商品的类型 1是胡萝卜 2 复投的兔子" ),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
    
    // 确认交易------交易的是火兔币
    {
        method: 'POST',
        path: '/tran/makeSureTransact/{id}',
        handler:transactionService.makeSureTransact,
        config:{
            auth: {
                strategy: 'bearer',
                scope: ["USER"]
            },
            description: '线上玩家确认交易 OK state',
            notes: '线上玩家确认交易 OK state',
            tags: ['api'],
            validate:{
                params: {
                    id: Joi.string().required().description('交易信息 id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
    //////------线下交易--------start--------------
    //--------------进入交易线下交易的是钱-----------
    // {
    //     method: 'POST',
    //     path: '/tran/enterTran',
    //     handler:transactionService.enterTran,
    //     config:{
    //         auth:{
    //             strategy: 'bearer',
    //             scope: ["USER"]
    //         },
    //         description: '线下卖家建立交易记录',
    //         notes: '线下卖家建立交易记录',
    //         tags: ['api'],
    //         validate:{
    //             payload:{
    //                 rabbitCoinNum:Joi.number().default(0).description("交易单个商品金额"),
    //                 number: Joi.number().required().description("交易商品的数量"),
    //                 buyerName: Joi.string().required().description("交易的对方账号"),
    //                 tranpwd: Joi.string().required().description("用户的交易密码"),
    //                 type: Joi.number().description("商品的类型 1是胡萝卜 2 复投的兔子" ),
    //                 status:Joi.number().description(" 0 未购买 1已购买未支付 2已支付未确认 3交易完成" ),
    //             },
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头'),
    //             }).unknown()
    //         }
    //     }
    // },
     //-----------确认交易--线下交易的是钱-----------
    // {
    //     method: 'POST',
    //     path: '/tran/makeSureTran/{id}',
    //     handler:transactionService.makeSureTran,
    //     config:{
    //         auth: {
    //             strategy: 'bearer',
    //             scope: ["USER"]
    //         },
    //         description: '线下玩家确认交易',
    //         notes: '线下玩家确认交易',
    //         tags: ['api'],
    //         validate:{
    //             params: {
    //                 id: Joi.string().required().description('交易信息 id')
    //             },
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头'),
    //             }).unknown()
    //         }
    //     }
    // },

    //------------------复投的兔子转化成火兔币---------------------，
    {
        method: 'POST',
        path: '/tran/rabbitCToRabbitCoin',
        handler:transactionService.rabbitCToRabbitCoin,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            },
            description: '复投的兔子转化成火兔币 OK state',
            notes: '复投的兔子转化成火兔币 OK state',
            tags: ['api'],
            validate:{
                payload:{
                    number: Joi.number().default(1).description("兔子的个数"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
    //把仓库的兔子的转换成火兔币，-购买的，复投的都可以转换火兔币
    // {
    //     method: 'POST',
    //     path: '/tran/rabbitBCToRabbitCoin',
    //     handler:transactionService.rabbitBCToRabbitCoin,
    //     config:{
    //         auth:{
    //             strategy: 'bearer',
    //             scope: ["USER"]
    //         },
    //         description: 'OK复投和购买的兔子转换成火兔币，一只购买200，一只复投180',
    //         notes: 'OK复投和购买的兔子转换成火兔币，一只购买200，一只复投180',
    //         tags: ['api'],
    //         validate: {
    //             payload:{
    //                 number: Joi.number().default(1).description("兔子的个数"),
    //                 type: Joi.number().default(1).description("1 购买的火火兔 2复投的兔子"),
    //             },
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头'),
    //             }).unknown()
    //         }
    //     }
    // },
   
    // {
    //     method: 'get',
    //     path: '/view',
    //     handler: {
    //         directory: {
    //             path: 'public/templates'
    //         }
    //     },
    //     config:{
    //         auth:false,
    //         description: '读取静态资源',
    //         notes: '读取静态资源',
    //         tags: ['api'],
    //         validate: {

    //         }
    //     }
    // },
    
]