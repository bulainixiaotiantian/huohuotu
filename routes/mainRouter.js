/**
 * 路由文件
 * Created by chenda on 2016/4/14.
 */
const Joi = require('joi');

const token = require('../service/validate');

module.exports = [
    //测试接口
    {
        method:'post',
        path:'/',
        config:{
            auth:false,
            description: '测试接口',
            notes: '测试接口',
            tags: ['api'],
            handler:function(request,reply){
                console.log(request.payload);
                reply({"ceshi":"访问成功！"});
            }
        }
    },
    //token生成器
    {
        method:'POST',
        path:'/get/token',
        config:{
            auth:false,
            handler:token.getToken,
            description: '获取token接口',
            notes: '获取token接口',
            tags: ['api'],
            validate: {
                payload: {
                    username: Joi.string().default('admin').description('用户名'),
                    pwd: Joi.string().default('123456').description('密码'),
                    url:Joi.string().required().description("要访问的路径"),
                    userORadmin:Joi.string().default('admin').description('管理员还是用户 admin or user')
                }
            }
        }
    },


]
