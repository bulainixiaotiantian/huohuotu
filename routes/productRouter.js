/**
 * 作物种类路由管理
 * Created by chenda on 2016/10/23.
 */
const Joi = require('joi');
const productService = require('../service/productService');
module.exports=[
    //获取所有商品分页
    {
        method:'GET',
        path:'/product/list/{page}/{size}',
        handler:productService.getProductList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","USER","SERVICE"]
            },
            description: '获取所有商品分页 admin/user OK',
            notes: '获取所有商品分页 admin/user OK',
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
    //获取商品总量
    {
        method:'GET',
        path:'/product/listAll',
        handler:productService.getProductAllList,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","USER","SERVICE"]
            },
            description: '获取所有商品 admin/user OK',
            notes: '获取所有商品 admin/user OK',
            tags: ['api'],
            validate: {
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
    //添加作物种类
    {
        method:'POST',
        path:'/product',
        handler:productService.addProduct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","SERVICE"]
            },
            description: '添加实体商品 admin OK',
            notes: '添加实体商品 admin OK',
            tags: ['api'],
            validate:{
                payload:{
                    name:Joi.string().required().description("商品名称"),
                    number:Joi.number().required().description("商品的数量"),
                    rabbitCoin: Joi.number().required().description("火兔币价格"),
                    description:Joi.string().required().description("商品描述"),
                    thumbnail:Joi.string().description("缩略图路径"),
                    img:Joi.string().description("商品大图"),
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },

    //删除某个作物种类
    {
        method:'DELETE',
        path:'/product/{id}',
        handler:productService.delProduct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","SERVICE"]
            },
            description: '删除某个商品 admin OK',
            notes: '删除某个商品 admin OK',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('作物种类 id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头')
                }).unknown()
            }
        }
    },
    //修改作物种类
    {
        method:'PUT',
        path:'/product/updateProduct/{id}',
        handler:productService.updateProduct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","SERVICE"]
            },
            description: '修改商品 admin OK',
            notes: '修改商品 admin OK',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('商品id')
                },
                payload:{
                    number:Joi.number().description("商品库存"),
                    name:Joi.string().description("商品名称"),
                    rabbitCoin: Joi.number().description("火兔币价格"),
                    description:Joi.string().description("商品描述"),
                    thumbnail:Joi.string().description("缩略图路径"),
                    img:Joi.string().description("商品大图")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
    //获取某个商品
    {
        method:'GET',
        path:'/product/{id}',
        handler:productService.getProduct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","USER","SERVICE"]
            },
            description: '获取某个商品 admin/user OK',
            notes: '获取某个商品 admin/user OK',
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string().required().description('某个商品的id')
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    },
    //搜索某个产品
    {
        method:'POST',
        path:'/product/searchList/list/{page}/{size}',
        handler:productService.searchProduct,
        config:{
            auth:{
                strategy: 'bearer',
                scope: ["ADMIN","USER","SERVICE"]
            },
            description: '搜索某个产品',
            notes: '搜索某个产品',
            tags: ['api'],
            validate: {
                params:{
                    page : Joi.string().default("0").description("页数"),
                    size : Joi.string().default("0").description("长度")
                },
                payload:{
                    where:Joi.object().description("搜索")
                },
                headers: Joi.object({
                    'authorization': Joi.string().required().description('需要加token请求头'),
                }).unknown()
            }
        }
    }
]