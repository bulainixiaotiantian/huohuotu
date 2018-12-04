/**
 * 订单路由管理
 * Created by chenda on 2016/10/23.
 */
    
const Joi = require('joi');
const orderService = require('../service/orderService');

module.exports = [
    //获取订单列表
    {
        method:'POST',
        path:'/order/list/{page}/{size}',
        handler:orderService.getAllOrderList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","USER","SERVICE"]
            },
            description: '管理员获取所有订单列表admin OK',
            notes: '管理员获取所有订单列表admin OK',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
    //获取我的订单列表
    {
        method:'GET',
        path:'/order/my/list',
        handler:orderService.getOrderMyList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            },
            description: '获取我的订单列表ok',
            notes: '获取我的订单列表ok',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    //删除某个订单
    {
        method:'DELETE',
        path:'/order/{id}',
        handler:orderService.delOrder,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","SERVICE"]
            },
            description: '删除某个订单admin OK',
            notes: '删除某个订单admin OK',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('订单 id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

     //添加订单
    {
        method:'POST',
        path:'/order/addOrder',
        handler:orderService.addOrder,
        config:{
            auth:{
                strategy:'bearer',
                scope:["USER"]
            },
            description: '添加订单ok',
            notes: '添加订单ok',
            tags: ['api'],
            validate:{
                payload:{
                    productId:Joi.string().required().description("商品id"),
                    number:Joi.number().required().description("购买商品数量"),
                    name:Joi.string().required().description("收件人姓名"),
                    mobile:Joi.string().required().description("收件人手机号"),
                    address:Joi.string().required().description("收货地址"),
                    note:Joi.string().description("说明")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    //修改订单
    {
        method:'PUT',
        path:'/order/{id}',
        handler:orderService.updateOrder,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","SERVICE"]
            },
            description: '修改订单admin',
            notes: '修改订单admin',
            tags: ['api'],
            validate: {
                params:{
                    id: Joi.string().required().description('订单id')
                },
                payload:{
                    express:Joi.string().description("快递公司"),
                    status: Joi.number().description('订单状态'),
                    expressNumber:Joi.string().description("快递订单编号"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
    // //获取某个订单
    // {
    //     method:'GET',
    //     path:'/order/{id}',
    //     handler:orderService.getOrder,
    //     config:{
    //         auth:{
    //             strategy: 'bearer',
    //             scope: ["ADMIN","USER","SERVICE"]
    //         },
    //         description: '获取某个订单user/admin OK',
    //         notes: '获取某个订单user/admin OK',
    //         tags: ['api'],
    //         validate: {
    //             params: {
    //                 id: Joi.string().required().description('订单id')
    //             },
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头'),
    //             }).unknown()
    //         }
    //     }
    // },
    
]