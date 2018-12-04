
const Joi = require('joi');
const hhtUserService = require('../service/hhtUserService');

module.exports=[
    //1----注册用户接口--------------------
    {
        method:'post',
        path:'/hhtUser/user/Register',
        handler:hhtUserService.registerUser,
        config:{
            auth:false,
            description: '√注册新用户',
            notes: '开始注册新用户',
            tags: ['api'],
            validate:{
                payload:{
                    username:Joi.string().required().description('昵称'),
                    password:Joi.string().required().description('登陆密码'),
                    mobile:Joi.string().required().description('手机号'),
                    VerificationCode:Joi.string().required().description("手机验证码"),
                    tranpwd:Joi.string().required().description('交易密码'),
                    name:Joi.string().description('昵称'),
                    parenteName:Joi.string().required().description('推荐人账号'),
                    wechat:Joi.string().default("").description('微信号'),
                    alipay:Joi.string().default("").description('支付宝号'),
                    bank:Joi.string().default("").description("银行卡"),
                    bankCard:Joi.string().default("").description("银行卡账号"),
                }
            }
        }
    },

    //修改用户信息---------------
    {
        method:'post',
        path:'/hhtUser/userUpdate/{id}',
        handler:hhtUserService.MessageEdit,
        config:{
            auth:{
                strategy: 'bearer',
                scope:['USER','ADMIN']
            },
            description: 'ok修改用户信息',
            notes: 'ok修改用户信息',
            tags: ['api'],
            validate:{
                params:{
                    id : Joi.string().required().description("数据id"),
                },
                payload:{
                    username:Joi.string().description('昵称'),
                    wechat:Joi.string().description('微信号'),
                    password:Joi.string().description('登陆密码'),
                    mobile:Joi.number().description('手机号'),
                    alipay:Joi.string().description('支付宝号'),
                    tranpwd:Joi.string().description('交易密码'),
                    name:Joi.string().default("").description('姓名'),
                   bank:Joi.string().description("银行卡"),
                    bankCard:Joi.string().description("银行卡号"),
                    RabbitCoin:Joi.number().description('火兔币'),
                    water:Joi.number().description('泉水数量'),
                    cabbage:Joi.number().description('白菜数量'),
                    carrot:Joi.number().description('胡萝卜数量'),
                    state:Joi.number().description("用户状态0为冻结，1存在")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //1用户登陆------------------
    {
        method:'GET',
        path:'/hhtUser/userLogin',
        handler:hhtUserService.userLogin,
        config:{
            //拦截器
            auth: {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: '用户登陆接口后台并添加了下小兔子的记录 OK state',
            notes: '用户登陆接口后台并添加了下小兔子的记录 OK state',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
     //忘记密码
    {
        method:'POST',
        path:'/hhtUser/backPwd',
        handler:hhtUserService.getbackPwd,
        config:{
            auth:false,
            description: 'ok忘记密码',
            notes: 'ok忘记密码',
            tags: ['api'],
            validate: {
                payload: {
                    username: Joi.string().description('用户名'),
                    password:Joi.string().description('新登陆密码'),
                    tranpwd:Joi.string().description('新交易密码'),
                    VerificationCode:Joi.number().description('验证码')
                },
            }
        }
    },
    //获取用户好友列表
    {
        method:'GET',
        path:'/hhtUser/friends/{page}/{size}',
        handler:hhtUserService.getUserFriends,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            }, 
            description: 'OK获取用户好友列表',
            notes: 'OK获取用户好友列表',
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
      //用户获取自己的开垦记录
    {
        method:'GET',
        path:'/hhtUser/getOpenWarJiLu/{page}/{size}',
        handler:hhtUserService.getOpenWarJiLu,
        config:{
            auth:{
                strategy: 'bearer',
                scope:'USER'
            },
            description:'ok用户获取自己的开垦记录',
            notes: 'ok用户获取自己的开垦记录',
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
       //获取用户已经完成的交易记录
    {
        method:'GET',
        path:'/hhtUser/getTransacRecord/{id}/{page}/{size}',
        handler:hhtUserService.getTransacRecord,
        config:{
            auth:{
                strategy: 'bearer',
                scope:['USER','ADMIN']
            },
            description:'ok获取用户已经完成的交易记录user和admin',
            notes: 'ok获取自己的已经完成的交易记录user和admin',
            tags: ['api'],
             validate:{
                params:{
                    id: Joi.string().required().description('user的id'),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
              }).unknown()
            }
        }
    },
    //获取用户未完成的交易记录
    {
        method:'GET',
        path:'/hhtUser/getdoingTran/{id}/{page}/{size}',
        handler:hhtUserService.getdoingTran,
        config:{
            auth:{
                strategy: 'bearer',
                scope:['USER','ADMIN']
            },
            description:'ok获取用户未完成的交易记录user和admin',
            notes: 'ok获取用户未完成的交易记录user和admin',
            tags: ['api'],
             validate:{
                params:{
                    id: Joi.string().required().description('user的id'),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
              }).unknown()
            }
        }
    },
    //获取用户已经购买的交易记录
    {
        method:'GET',
        path:'/hhtUser/getBoughtTran/{page}/{size}',
        handler:hhtUserService.getBoughtTran,
        config:{
            auth: 
            {
              strategy: 'bearer',
              scope: 'USER'
            },
            description:'ok获取用户已购买交易记录',
            notes: 'ok获取用户已购买交易记录',
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
    
       
    {//获取用户购买套餐记录
        method:'GET',
        path:'/hhtUser/getPurchaseList/{page}/{size}',
        handler:hhtUserService.getPurchaseList,
        config:{
            auth: 
            {
              strategy: 'bearer',
              scope: 'USER'
            },
            description:'OK获取用户购买套餐记录',
            notes: 'OK获取用户购买套餐记录',
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
     {//获取用户购买套餐记录
        method:'POST',
        path:'/hhtUser/getAllPurchaseList/{page}/{size}',
        handler:hhtUserService.getAllPurchaseList,
        config:{
            auth: 
            {
              strategy: 'bearer',
              scope: 'ADMIN'
            },
            description:'OK获取所有用户购买套餐记录',
            notes: 'OK获取所有用户购买套餐记录',
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
   
    {//获取用户的奖励记录-----------------------------
        method:'GET',
        path:'/hhtUser/getjiangLiJiLu/{id}/{page}/{size}',
        handler:hhtUserService.getjiangLiJiLu,
        config:{
            auth:{
                strategy: 'bearer',
                scope:['USER','ADMIN']
            },
            description:'ok获取用户的奖励记录user和admin',
            notes: 'ok获取用户的奖励记录user和admin',
            tags: ['api'],
             validate:{
                params:{
                    id: Joi.string().required().description('user的id'),
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    {   //1获取产品套餐信息-------------
    	method:'GET',
        path:'/hhtUser/getPackageList',
        handler:hhtUserService.getPackageList,
        config:{
            auth:{
                strategy: 'bearer',
                scope:['USER','ADMIN']
            },
            description: 'ok获取火火兔套餐列表',
            notes: 'ok获取火火兔套餐列表',
            tags: ['api'],
            validate: {
              headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
              }).unknown()
            }
        }
    },{   //1获取产品套餐信息-------------
        method:'GET',
        path:'/hhtUser/adminPackageList',
        handler:hhtUserService.adminPackageList,
        config:{
            auth:{
                strategy: 'bearer',
                scope:['USER','ADMIN']
            },
            description: 'ok获取火火兔套餐列表',
            notes: 'ok获取火火兔套餐列表',
            tags: ['api'],
            validate: {
              headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
              }).unknown()
            }
        }
    },
// getShopList
//1获取商品水 和白菜信息-------------
    { 
    	method:'GET',
        path:'/hhtUser/getShopList',
        handler:hhtUserService.getShopList,
        config:{
             auth:{
                strategy: 'bearer',
                scope: ['USER','ADMIN']
            },
            description: 'ok获取商品列表',
            notes: 'ok获取火火兔商品列表',
            tags: ['api'],
            validate:{
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //1用户购买套餐-------
	{ 
    	method:'post',
        path:'/hhtUser/buyPackage',
        handler:hhtUserService.buyPackage,
        config:{
            auth: 
            {
                strategy: 'bearer',
                scope: 'USER'
            },
            description: 'ok用户购买套餐并自动添加奖励记录 state',
            notes: 'ok用户购买套餐并自动添加奖励记录 state',
            tags: ['api'],
            validate: {
             	payload:{
                    "num":Joi.number().required().description('购买的次数'),
				    "purchaseType":Joi.number().required().description('套餐的类型'),//num 1为A套餐 num为2为B套餐 num为3为C套餐
             	},
             	headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    } ,
    {//购买实体商品---------
        method:'POST',
        path:'/hhtUser/buyWaterCabbage',
        handler:hhtUserService.buyWaterCabbage,
        config:{
            auth: 
            {
              strategy: 'bearer',
              scope: 'USER'
            },
            description: '买水/白菜 添加购买套餐记录OK  ',
            notes: '买水/白菜 加入购买套餐记录 OK state',
            tags: ['api'],
            validate: {
                payload:{
                    "shopType":Joi.string().required().description('购买的产品名称 例如 water 还是 cabbage'),
                    "howMuch":Joi.number().required().description('购买的数量 单位是 瓶/颗等')
                },
                headers:Joi.object({
                    "authorization":Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    }, 
     //获取某个用户的所有在兔场上的兔子信息列表
    {
        method: 'get',
        path: '/hhtUser/getUserRabbit',
        handler:hhtUserService.getUserRabbit,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            },
            description: 'ok查询某个用户的兔场信息',
            notes: 'ok查询某个用户的兔场信息',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
    //查询用户的仓库信息
    {
        method: 'get',
        path: '/hhtUser/getUserDepot',
        handler:hhtUserService.getUserDepot,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            },
            description: 'ok查询用户的仓库',
            notes: 'ok查询用户的仓库',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
     //查询用户的的兔场信息
    {
        method: 'get',
        path: '/hhtUser/getUserWarren',
        handler:hhtUserService.getUserWarren,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"]
            },
            description: 'ok查询用户的兔场',
            notes: 'ok查询用户的兔场',
            tags: ['api'],
            validate:{
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
    {//添加提现申请
        method:'POST',
        path:'/hhtUser/tiXianShenQing',
        handler:hhtUserService.tiXianShenQing,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["USER"] //or ["user",admin]
            },
            description: 'ok提现申请 state',
            notes: 'ok提现申请 atate',
            tags: ['api'],
            validate:{
                payload:{
                    number:Joi.number().required().description('火兔币的数量'),
                    tranpwd:Joi.string().required().description("交易密码"),
                    type:Joi.number().required().description("提现类型 1 支付宝 2 微信"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
 
    //1前端获取当前用户的提现申请列表
    {
        method:'GET',
        path:'/hhtUser/userSafelist/{page}/{size}',
        handler:hhtUserService.safeList,
        config:{
            auth:{
                strategy: 'bearer',
                scope:['USER'] 
            },
            description: 'ok获取当前用户提现列表',
            notes: 'ok获取当前用户提现列表',
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

]
