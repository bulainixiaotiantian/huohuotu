/**
 * 系统公告路由
 * Created by chenda on 2017/3/9.
 */

const Joi = require('joi');
const systemSmgService = require('../service/systemSmgService');

module.exports = [

    //获取系统公告列表
    {
        method:'GET',
        path:'/systemSmg/list/{page}/{size}',
        handler:systemSmgService.getSystemSmgList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER","ADMIN"]
            },
            description: '获取所有系统公告列表 admin/user OK',
            notes: '获取所有系统公告列表 admin/user OK',
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
    //获取某个系统公告
    {
        method:'GET',
        path:'/systemSmg/{id}',
        handler:systemSmgService.getSystemSmg,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER","ADMIN"]
            },
            description: '获取某个系统公告内容 admin/user OK',
            notes: '获取某个系统公告内容 admin/user OK',
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


    //添加系统公告
    {
        method:'POST',
        path:'/systemSmg',
        handler:systemSmgService.addSystemSmg,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '添加系统公告 admin OK',
            notes: '添加系统公告 admin OK',
            tags: ['api'],
            validate: {
                payload: {
                    title:Joi.string().required().description("公告标题"),
                    content:Joi.string().required().description("公告内容"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    //删除某个系统公告
    {
        method:'DELETE',
        path:'/systemSmg/{id}',
        handler:systemSmgService.delSystemSmg,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '删除某个系统公告 admin OK',
            notes: '删除某个系统公告 admin OK',
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
    //修改系统公告
    {
        method:'PUT',
        path:'/systemSmg/{id}',
        handler:systemSmgService.updateSystemSmg,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '修改系统公告 admin OK',
            notes: '修改系统公告 admin OK',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('系统公告id')
                },
                payload: {
                    title: Joi.string().required().description('标题'),
                    content:Joi.string().required().description('内容')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
     //获取所有站内信列表
    {
        method:'GET',
        path:'/systemSmg/not/read/list',
        handler:systemSmgService.getSmgNoReadlList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            },
            description: '获取未读系统信息列表',
            notes: '获取未读系统信息列表',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    }

]
