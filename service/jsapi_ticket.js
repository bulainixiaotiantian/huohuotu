const dao = require("../dao/dao");

var Jsapi_ticket = function(relation_gid,request) {
	Jsapi_ticket.prototype.relation_gid = relation_gid;
    Jsapi_ticket.prototype.request = request;
}

module.exports = Jsapi_ticket;

Jsapi_ticket.prototype.get =async function(type,callback) {

    var result = await dao.findOne(Jsapi_ticket.prototype.request,"jsapi_ticket",{"relation_gid":Jsapi_ticket.prototype.relation_gid});

    if(result!=null){
        return callback(null, result.ticket);
    }else{
        console.log('Jsapi_ticket没有获取到');
        return callback(null);
    }
}

Jsapi_ticket.prototype.save =async function(type, ticketToken, callback) {

	var expireTime = (new Date().getTime()) + 7100 * 1000;
	var postData = {
		'relation_gid': Jsapi_ticket.prototype.relation_gid,
		'ticket': ticketToken.ticket,
		'expireTime': ticketToken.expireTime
	};

  	var result = await dao.findOne(Jsapi_ticket.prototype.request,"jsapi_ticket",{"relation_gid":Jsapi_ticket.prototype.relation_gid});

    if(result==null){
        var jsapiticket =await dao.save(Jsapi_ticket.prototype.request,"jsapi_ticket",postData);
        if(jsapiticket==null){
            callback("保存失败。");
        }else{
            callback(null)
        }
    }else{
        var jsapiticket =await dao.updateOne(Jsapi_ticket.prototype.request,"jsapi_ticket",{_id:result._id},postData);
        if(jsapiticket==null){
            callback("保存失败。");
        }else{
            callback(null)
        }
    }
}