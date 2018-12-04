/**
 * Created by chenda on 2016/4/14.
 */

'use strict';

require("babel-core/register");

require("babel-polyfill");

//定时任务
//const scheduled=require("./service/schedule");
//scheduled.scheduleRen();


const Hapi = require('hapi');

const Good = require('good');

var time = new Date().getTime();

//  var AES = require("crypto-js/aes");
//  console.log("bearer "+"admin:"+AES.encrypt("/admin/login:"+time, "e3704f875c5de47c8c2589bbd0e455ec")+":admin");
//  console.log(AES.encrypt("123456","AiMaGoo2016!@.")+"");

 const server = new Hapi.Server();//创建服务器

/** 跨域请求配置 **/
//定时

var corsConfig = {
    "maxAge": 86400,
    "headers": ["Accept", "Authorization", "Content-Type", "If-None-Match","cross-origin"],
    "additionalHeaders": [],
    "exposedHeaders": ["WWW-Authenticate", "Server-Authorization"],
    "additionalExposedHeaders": [],
    "credentials": true,
    "origin" : ["*"],
    
}
    server.connection({port : 3000, routes: { cors: corsConfig }});
    server.register(require('inert'), () => {});   //我们使用一个名为 inert 的插件去创建静态页面------------------
    /** 数据库连接 start **/
    var dbOpts = {
        "url":"mongodb://127.0.0.1:27017/hht",
        "settings":{
            "db":{
                "native_parser":false
            }
        }
    };

    server.register({
        register:require('hapi-mongodb'),
        options:dbOpts
    },function(err){
        if(err){
            server.log(['error'], err);
            throw err;
        }
    });
    
    /** 数据库连接 end **/
    /** 异步流程库 start **/
    //server.register([
    //    require('hapi-async-handler')
    //], function(err) {
    //    if(err){
    //        server.log(['error'], err);
    //        throw err;
    //    }
    //});
    /** 异步流程库 end **/


   /** 拦截验证 start **/
    server.register(require('hapi-auth-bearer-simple'), function (err) {
        if (err) {
            throw err;
        }
        server.auth.strategy('bearer', 'bearerAuth', {
            validateFunction: require('./service/validate').validateFunc,//具有签名的令牌查找和验证功能function(token,callback){}
            exposeRequest: true
        });           //exposeRequest:true ------意思是指定权限匹配时松散模式，符合要求的任何权限即可。
    });

    /** 拦截验证 end **/

   /** 路由 start **/
    server.register({
        register:require('hapi-router'),
        options:{
            routes:'routes/*.js'
        }
    },function(err){
        if(err){
            server.log(['error'],err);
            throw err;
        }
    });


    /** 路由 start  end**/


    /** api文档系统 start **/
    const doc = {
        info: {
            'title': '农场 API 文档',
            'version': '1.0'
        },
        documentationPath:"/doc",
        tags: [{
            'name': 'sms',
            'description': '短信操作接口'
        },{
            'name': 'privilage',
            'description': '权限操作接口'
        },{
            'name': 'role',
            'description': '角色资源操作接口'
        },{
            'name': 'admin',
            'description': '管理员资源操作接口'
        },{
            'name': 'user',
            'description': '用户数据操作接口'
        },{
            'name': 'goods',
            'description': '商品数据操作接口'
        },{
            'name':'dishes',
            'description': '菜品数据操作接口'
        },{
            'name':'recruit',
            'description': '求职招聘数据操作接口'
        }]
    };

    server.register([
        require('inert'),
        require('vision'),
        {
            'register': require('hapi-swagger'),
            'options': doc
        }], function(err) {
        server.log(['error'],err);
    });

    // /** api文档系统 end **/

    // server.register([
    //         require('inert'),
    //         require('vision'),
    //         ],
    //     function (err) {
    //     server.views({
    //         engines: {
    //             'html': {
    //                 module: require('handlebars')
    //             }
    //         },
    //         relativeTo:__dirname,
    //         path:'public/templates'
    //     });
     
     
    //     if (err) {
    //         throw err; // something bad happened loading a plugin
    //     }
    // });




    /** 日志系统 start **/
    var options = {
        reporters:[{
            reporter:require('good-console'),
            events:{response:'*', log:'*'}
        },{
            reporter:require('good-file'),
            events:{log:'debug'},
            config:'log/debug_log.log'
        }, {
            reporter: require('good-file'),
            events: {log: 'error'},
            config: 'log/error_log.log'
        }]
    }

    server.register({
        register:Good,
        options:options
    },function(err) {
        if(err){
            server.log(['error'],err);
            //throw err;
        }

        server.start(function(err){
            if(err){
                server.log(['error'], err);
                //throw err;
            }
            console.log('Server runing at:',server.info.uri);
            server.log(['debug'], 'Started...');
        });

    });

