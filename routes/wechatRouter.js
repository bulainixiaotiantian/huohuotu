/**
 * 微信模块路由管理
 * Created by shichenda on 2016/6/13.
 */

const Joi = require('joi');
const wechatService = require('../service/wechatService');

module.exports = [
    //支付宝支付获取支付链接
    {
        method:'POST',
        path:'/alipay/payment',
        handler:wechatService.alipay,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "USER"
            },
            description: '支付宝支付获取支付链接 OK',
            notes: '支付宝支付获取支付链接 OK',
            tags: ['api'],
            validate: {
                payload: {
                    tranpwd:Joi.string().required().description("交易密码"),
                    total_fee:Joi.number().required().description("订单金额"),
                    type:Joi.number().required().description("支付支付类型"),//1 手机支付类型 2 网页类型
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
     //支付宝充值记录
    {
        method:'GET',
        path:'/alipay/getPayment/{page}/{size}',
        handler:wechatService.getPayment,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "USER"
            },
            description: '用户查询自己的支付宝充值记录 OK',
            notes: '用户查询自己的支付宝充值记录 OK',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
 //支付宝充值记录
    {
        method:'POST',
        path:'/alipay/admingetPayment/{page}/{size}',
        handler:wechatService.admingetPayment,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "ADMIN"
            },
            description: '支付宝充值记录 OK',
            notes: '支付宝充值记录 OK',
            tags: ['api'],
            validate:{
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload:{
                    where: Joi.object().description('搜索')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //删除某个系统公告
    {
        method:'DELETE',
        path:'/alipay/delpay/{id}',
        handler:wechatService.delpay,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '删除某个充值记录 admin OK',
            notes: '删除某个充值记录 admin OK',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('系统公告 id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //支付宝支付通知链接
    {
        method:'POST',
        path:'/callback/alipay',
        handler:wechatService.alipayNotify,
        config:{
            auth:false,
            description: '支付宝支付通知接口',
            notes: '支付宝支付通知接口',
            tags: ['api'],
        
        }
    },
    {
        method:'POST',
        path:'/wechat/payment/notifyMsg',
        handler:wechatService.wechatNotifyMsg,
        config:{
            auth:false,
            description: '支付成功通知接口',
            tags: ['api'],
        }
    },
    {
        method:'get',
        path:'/wechat/wechatConfig',
        handler:wechatService.wechatConfig,
        config:{
            auth:false,
            description: '支付配置接口',
            tags: ['api'],
        }
    },
    {
        method:'POST',
        path:'/wechat/pay2',
        handler:wechatService.wechatPay2,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "USER"
            },
            description: '微信code获取jssdk配置信息',
            notes: '微信code获取jssdk配置信息',
            tags: ['api'],
            validate:{
                payload:{
                    num:Joi.number().required().description("购买的数量"),
                },
                headers:Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
     //微信支付获取配置信息
    {
        method:'POST',
        path:'/wechat/payment/config',
        handler:wechatService.getWechatPayEncy,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "USER"
            },
            description: '微信code获取jssdk配置信息',
            notes: '微信code获取jssdk配置信息',
            tags: ['api'],
            validate: {
                payload: {
                    num:Joi.number().required().description("订单金额"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
        //获取jssdk配置
    {
        method:'GET',
        path:'/wechat/js/config',
        handler:wechatService.getWechatJsConfig,
        config:{
            auth:false,
            description: '微信code获取jssdk配置信息',
            notes: '微信code获取jssdk配置信息',
            tags: ['api'],
        }
    },

]