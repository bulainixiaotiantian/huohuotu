const Joi = require('joi');
var hhtMainService=require("../service/hhtMainService");
const hhtUserService = require('../service/hhtUserService');
const adminService=require("../service/adminService");
const roleService=require("../service/roleService");
/**  SMS 短信接口  start **/
  
module.exports=[
    {
        method:'POST',
        path:'/hhtMain/sms/SmsService',
        config:{
            auth:false,
            handler:hhtMainService.sendRegSMS,
            description: '发送注册验证码OK',
            notes: '发送注册验证码API OK',
            tags: ['api'],
            validate:{
                payload:{
                    mobile: Joi.string().required().description('电话号码'),
                }
            }
        }
    },
    {
        method:'POST',
        path:'/hhtMain/sms/SmsOrder',
        config:{
            auth:false,
            handler:hhtMainService.SmsOrder,
            description: '发送下订单验证码OK',
            notes: '发送下订单验证码OK',
            tags: ['api'],
            validate:{
                payload:{
                    mobile:Joi.string().required().description('电话号码'),
                }
            }
        }
    },
    //忘记密码验证
    {
        method:'POST',
        path:'/hhtMain/sms/regPwd',
        config:{
            auth:false,
            handler:hhtMainService.sendSetPwdSMS,
            description: 'ok发送找回密码验证码',
            notes: 'ok发送找回密码验证码',
            tags: ['api'],
            validate:{
                payload: {
                    username: Joi.string().required().description('用户名'),
                }
            }
        }
    },

/**  SMS 短信接口  end **/

/*******  ROLE API 角色资源操作接口1  start *******/

    //获取权限组列表
    {
        method:'GET',
        path:'/role/group',
        //异步控制方法
        handler: roleService.getPrivilageGroup,
        config: {
            //拦截器
            auth:{
                strategy: 'bearer',
                scope: 'ROLE_MANAGE'
            },
            description: '获取权限组',
            notes: '获取权限组',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //获取角色列表
    {
        method:'GET',
        path:'/role/list',
        handler: roleService.roleList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ROLE_MANAGE'
            },
            description: '获取角色列表',
            notes: '获取角色资源列表',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //增加角色
    {
        method:'POST',
        path:'/role',
        handler: roleService.addRole,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ROLE_MANAGE'
            },
            description: '增加角色资源',
            notes: '增加角色资源',
            tags: ['api'],
            validate: {
                payload:{
                    name: Joi.string().required().description('角色名称'),
                    note: Joi.string().description('角色描述'),
                    isShow: Joi.number().default(1).description('是否显示'),
                    level: Joi.number().default(1).description('角色等级'),
                    scope: Joi.array().required().description('权限字符串数组如：["ADMIN_ADD_EDUT","ROLE_MANAGE"]')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //修改角色
    {
        method:'PUT',
        path:'/role/{roleId}',
        handler: roleService.updateRole,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ROLE_MANAGE'
            },
            description: '修改角色资源',
            notes: '修改角色资源',
            tags: ['api'],
            validate: {
                params:{
                    roleId : Joi.string().required().description("路径参数：角色id，类型：字符串")
                },
                payload: {
                    name: Joi.string().description('角色名称'),
                    note: Joi.string().description('角色描述'),
                    scope: Joi.array().description('权限字符串数组如：["ADMIN_ADD_EDUT","ROLE_MANAGE"]')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

    //删除角色
    {
        method:'DELETE',
        path:'/role/{roleId}',
        handler: roleService.delRole,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ROLE_MANAGE'
            },
            description: '删除角色资源',
            notes: '删除角色资源',
            tags: ['api'],
            validate: {
                params:{
                    roleId : Joi.string().required().description("路径参数：角色id，类型：字符串")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },

/*******  ROLE API 角色资源操作接口  end *******/


/**  用户充值  start **/
 //
    {
        method:'POST',
        path:'/hhtMain/userPay',
        handler:hhtMainService.userPay,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","USER",'FINANCIAL']
            },
            description: '用户充值',
            notes: '用户充值',
            tags: ['api'],
            validate: {
                payload: {
                    number: Joi.number().description('充值火兔币的数量'),
                    payType:Joi.number().description('类型1为支付宝2为微信'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //充值审核
    {
        method:'GET',
        path:'/hhtMain/pay/{id}/{status}',
        handler:hhtMainService.updatePay,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER","ADMIN",'FINANCIAL']
            },
            description: '管理员审核充值状态',
            notes: '管理员审核充值状态',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('用户id'),
                    status: Joi.number().required().description('状态，2为通过，3为驳回')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
/**  用户充值  end **/





/*******  ADMIN API 管理员资源接口  start *******/
    //管理员登陆接口
    {
        method:'GET',
        path:'/admin/login',
        handler: adminService.Login,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员登陆接口 OK',
            notes: '管理员登陆接口 OK',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //获取管理员列表
    {
        method:'GET',
        path:'/admin/list',
        handler: adminService.getAdminList,
        config:{
            //拦截器
            auth:{
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '获取管理员列表 OK',
            notes: '获取管理员资源列表 OK',
            tags: ['api'],
            validate:{
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
//获得前端用户user列表
    {
        method:'GET',
        path:'/admin/getUserList/{page}/{size}',
        handler: adminService.getUserList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '获取用户列表 OK',
            notes: '获取用户列表 OK',
            tags: ['api'],
            validate:{
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
    //获得前端用户正在养殖的兔子列表
    {
        method:'GET',
        path:'/admin/getRabbitList/{page}/{size}',
        handler: adminService.getRabbitList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '获得前端用户正在养殖的兔子列表 OK',
            notes: '获得前端用户正在养殖的兔子列表 OK',
            tags: ['api'],
            validate:{
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },//获得前端用户仓库列表
    {
        method:'GET',
        path:'/admin/getDepotList/{page}/{size}',
        handler: adminService.getDepotList,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '获得前端用户仓库列表 OK',
            notes: '获得前端用户仓库列表 OK',
            tags: ['api'],
            validate:{
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
     //搜索仓库
    {
        method:'POST',
        path:'/admin/searchDepot/{page}/{size}',
        handler:adminService.searchDepot,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","USER",'FINANCIAL']
            },
            description: '搜索仓库',
            notes: '搜索仓库',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload: {
                    where: Joi.object().description('搜索')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        } 
    },
        //搜索兑换记录
    {
        method:'POST',
        path:'/admin/searchDuiHuan/{page}/{size}',
        handler:adminService.searchDuiHuan,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","USER",'FINANCIAL']
            },
            description: '搜索兑换记录',
            notes: '搜索兑换记录',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload: {
                    where: Joi.object().description('搜索')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        } 
    },
     //获取用户未完成交易记录
    {
        method:'POST',
        path:'/admin/getAllnoTran/{page}/{size}',
        handler:adminService.getAllnoTran,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","USER",'FINANCIAL']
            },
            description: '搜索未交易记录',
            notes: '搜索未交易记录',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload: {
                    where: Joi.object().description('搜索')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        } 
    },  //获取用户已经购买的交易记录
    {
        method:'POST',
        path:'/admin/getallBoughtTran/{page}/{size}',
        handler:adminService.getallBoughtTran,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","USER",'FINANCIAL']
            },
            description: '获取完成的交易记录',
            notes: '获取完成的交易记录',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload: {
                    where: Joi.object().description('搜索')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        } 
    },
     {
        method:'POST',
        path:'/admin/searchDingDan/{page}/{size}',
        handler:adminService.searchDingDan,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","USER",'FINANCIAL']
            },
            description: '竞猜记录',
            notes: '竞猜记录',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload: {
                    where: Joi.object().description('搜索')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        } 
    },
  //获取某个用户
    {
       method:'GET',
       path:'/user/{id}',
       handler:adminService.getUser,
       config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN"]
            },
            description: '获取某个用户admin',
            notes: '获取某个用户admin',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('用户id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
     //获取某个shop
    {
        method:'GET',
        path:'/admin/getShopOne/{id}',
        handler:adminService.getShopOne,
        config:{
            auth:{
                strategy:'bearer',
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
     {
        method:'GET',
        path:'/admin/getPackactOne/{id}',
        handler:adminService.getPackactOne,
        config:{
            auth:{
                strategy:'bearer',
                scope: ["USER","ADMIN"]
            },
            description: '获取某个套餐 admin/user OK',
            notes: '获取某个套餐 admin/user OK',
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
     {
        method:'GET',
        path:'/admin/getOrderOne/{id}',
        handler:adminService.getOrderOne,
        config:{
            auth:{
                strategy:'bearer',
                scope: ["USER","ADMIN"]
            },
            description: '获取某个订单 admin/user OK',
            notes: '获取某个订单 admin/user OK',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('订单的id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //管理员修改套餐商城信息
    {
        method:'PUT',
        path:'/admin/editTaoCan/{id}',
        handler: adminService.editTaoCan,
        config:{
            //拦截器
            auth:{
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员修改套餐商城信息OK',
            notes: '管理员修改套餐商城信息OK',
            tags: ['api'],
            validate:{
                params:{
                    id: Joi.string().required().description('套餐id')
                },
                payload:{
                    name: Joi.string().description('套餐名'),
                    rabbit: Joi.number().description('套餐里火火兔的数量'),
                    carrot: Joi.number().description('套餐里胡萝卜的数量'),
                    price: Joi.number().description('套餐价格'),
                    introduce: Joi.string().description('套餐描述')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
     //管理员修改奖励参数
    {
        method:'PUT',
        path:'/admin/editJiangLiSet/{id}',
        handler: adminService.editJiangLiSet,
        config:{
            //拦截器
            auth:{
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员修改奖励参数',
            notes: '管理员修改奖励参数',
            tags: ['api'],
            validate:{
                params:{
                    id: Joi.string().required().description('奖励的id')
                },
                payload:{
                    one: Joi.number().description('第一代奖励胡萝卜个数'),
                    two: Joi.number().description('第二代奖励胡萝卜个数'),
                    three:Joi.number().description('第三代奖励胡萝卜个数')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
      //获得奖励参数
    {
        method:'GET',
        path:'/admin/getJiangLiSet',
        handler: adminService.getJiangLiSet,
        config:{
            //拦截器
            auth:{
                strategy: 'bearer',
                scope: ['ADMIN',"USER"]
            },
            description: '获得奖励参数 admin user',
            notes: '获得奖励参数 admin user',
            tags: ['api'],
            validate:{               
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
       //获得兑换火兔币参数
    {
        method:'GET',
        path:'/admin/getSystemSet',
        handler: adminService.getSystemSet,
        config:{
            //拦截器
            auth:{
                strategy: 'bearer',
                scope: ['ADMIN',"USER"]
            },
            description: '获得兑换火兔币参数 admin user',
            notes: '获得兑换火兔币参数 admin user',
            tags: ['api'],
            validate:{               
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //获得提现手续费参数
    {
        method:'GET',
        path:'/admin/getTiXianSet',
        handler: adminService.getTiXianSet,
        config:{
            //拦截器
            auth:{
                strategy: 'bearer',
                scope: ['ADMIN',"USER"]
            },
            description: '获得提现手续费参数 admin user',
            notes: '获得提现手续费参数 admin user',
            tags: ['api'],
            validate:{               
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
     //管理修改提现手续费
    {
        method:'POST',
        path:'/admin/editTixianFei/{id}',
        handler: adminService.editTixianFei,
        config:{
            //拦截器
            auth:{
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理修改提现手续费OK',
            notes: '管理修改提现手续费OK',
            tags: ['api'],
            validate:{
                params:{
                    id:Joi.string().required().description('提现手续费id')
                },
                payload:{
                    tiXianSXF: Joi.number().description('提现比例'),
                    tixianDescrible: Joi.string().description('提现费用描述')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },  //管理修改等价火兔币参数
    {
        method:'POST',
        path:'/admin/editsystemSet/{id}',
        handler: adminService.editsystemSet,
        config:{
            //拦截器
            auth:{
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理修改等价火兔币参数',
            notes: '管理修改等价火兔币参数',
            tags: ['api'],
            validate:{
                params:{
                    id:Joi.string().required().description('id')
                },
                payload:{
                    rabbitC: Joi.number().description('小兔等价火兔币数额'),
                    carrot: Joi.number().description('胡萝卜等价火兔币数额')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
      //获取某个用户的仓库
    {
        method:'POST',
        path:'/admin/getOneDepot',
        handler: adminService.getOneDepot,
        config:{
            //拦截器
            auth:{
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '获取某个用户的仓库',
            notes: '获取某个用户的仓库',
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
/**  管理用户提现  start **/
      //管理员前端获取所有用户的提现申请列表
    {
        method:'POST',
        path:'/admin/allSafelist/{page}/{size}',
        handler:adminService.allSafeList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN",'FINANCIAL'] //or ["user",admin]
            },
            description: '管理员获取所有提现申请列表 ok',
            notes: '管理员获取所有提现申请列表ok',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload:{
                    where: Joi.object().description('搜索')
                }
                , headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
   //更新提现进度关于某个用户--------------------
    {
        method:'POST',
        path:'/admin/updateSafe/{id}',
        handler:adminService.updateSafe,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN",'FINANCIAL']
            },
            description: '管理后台审核提现 OK',
            notes: '管理后台审核提现 OK',
            tags: ['api'],
            validate:{
                params:{
                    id:Joi.string().required().description('提现申请的id')
                },
                payload:{
                    status:Joi.number().required().description(" 1完成提现，2驳回提现申请")// 0未完成 1 已完成 2拒绝申请提现
                    //gold:Joi.number().description("用户积分")
                },
                headers:Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //后台管理获取全部的充值记录
    {
        method:'POST',
        path:'/admin/searchPay/{page}/{size}',
        handler:adminService.getAllPayList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","USER"]
            }, 
            description: '获取奖金记录',
            notes: '获取奖金记录',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload: {
                    where: Joi.object().description('搜索')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    {//获取所有用户的奖励记录-----------------------------
        method:'POST',
        path:'/admin/getAlljiangLiJiLu/{page}/{size}',
        handler:adminService.getAlljiangLiJiLu,
        config:{
            auth:{
                strategy: 'bearer',
                scope:'ADMIN'
            },
            description:'获取所有用户的奖励记录 OK',
            notes: '获取所有用户的奖励记录 OK',
            tags: ['api'],
             validate:{
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
    //管理员修改实体商城信息
    {
        method:'PUT',
        path:'/admin/editShop/{id}',
        handler: adminService.editShop,
        config:{
            //拦截器
            auth:{
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员修改实体商品 ok',
            notes: '管理员修改实体商品ok',
            tags: ['api'],
            validate:{
                params:{
                    id: Joi.string().required().description('套餐id')
                },
                payload:{
                    price: Joi.number().description('商品的价格'),
                    introduce: Joi.string().description('商品作用描述')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //  //管理员 增加实体商城商品
    // {
    //     method:'POST',
    //     path:'/admin/addShop',
    //     handler: adminService.addShop,
    //     config:{
    //         //拦截器
    //         auth:{
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: 'ok管理员添加实体商品，不建议使用',
    //         notes: 'ok管理员添加实体商品，不建议使用，因为商品的名字需要加入新字段到user里',
    //         tags: ['api'],
    //         validate:{
    //             payload:{
    //                 productName: Joi.string().description('商品英文名称'),
    //                 name: Joi.string().description('商品中文名称'),
    //                 price: Joi.number().description('商品的价格'),
    //                 function: Joi.string().description('商品作用描述')
    //             },
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown()
    //         }
    //     }
    // },
    //  //管理员 删除商城商品
    // {
    //     method:'DELETE',
    //     path:'/admin/delShop/{id}',
    //     handler: adminService.delShop,
    //     config:{
    //         //拦截器
    //         auth:{
    //             strategy: 'bearer',
    //             scope: 'ADMIN'
    //         },
    //         description: 'ok 删除实体商品 不建议使用 牵扯到user的字段',
    //         notes: 'ok 删除实体商品 不建议使用 牵扯到user的字段',
    //         tags: ['api'],
    //         validate:{
    //             params:{
    //                 id: Joi.string().required().description('商品id')
    //             },
    //             headers: Joi.object({
    //                 'authorization': Joi.string().required().description('需要加token请求头')
    //             }).unknown()
    //         }
    //     }
    // },
    {//添加管理员
        method:'POST',
        path:'/admin/addAdmin',
        handler: adminService.addAdmin,
        config:{
            //拦截器
            auth:
            {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员添加 OK',
            notes: '管理员添加接口 OK',
            tags: ['api'],
            validate:{
                payload:{
                    username: Joi.string().required().description('管理员账号'),
                    password: Joi.string().required().description('管理员密码'),
                    name: Joi.string().description('真实名称'),
                    state: Joi.number().default(1).description('管理员状态 0冻结 1 正常'),
                    headImg: Joi.string().default("").description('管理员头像'),
                    telephone: Joi.string().description('管理员手机号'),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    {//更新管理员信息
        method:'PUT',
        path:'/admin/updateAdmin/{id}',
        handler: adminService.updateAdmin,
        config: {
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'ADMIN'
            },
            description: '管理员修改 OK',
            notes: '管理员修改接口 OK',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('管理员id')
                },
                payload: {
                    username: Joi.string().description('管理员账号'),
                    password: Joi.string().description('管理员密码'),
                    name: Joi.string().description('真实名称'),
                    state: Joi.number().description('管理员状态'),
                    headImg: Joi.string().description('管理员头像'),
                    telephone: Joi.string().description('管理员手机号'),
                    roleId: Joi.string().description('角色id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //删除某个管理员
    {
        method:'DELETE',
        path:'/admin/delAdmin/{id}',
        handler:adminService.delAdmin,
        config:{
            auth:{
                strategy: 'bearer',
                scope: "ADMIN"
            },
            description: '删除某个管理员 OK',
            notes: '删除某个管理员 OK',
            tags: ['api'],
            validate: {
                params:{
                    id: Joi.string().required().description('管理员id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },



/*******  ADMIN API 管理员资资源接口  end *******/



]