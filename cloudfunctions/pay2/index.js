// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

function randomString(e) {    
  e = e || 32;
  var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
  a = t.length,
  n = "";
  for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log(event)
  const db = cloud.database()

 

  let data = {
    aid:event.aid,
    body:event.body,
    sid:event.sid,
    amount:event.amount,
    openid:wxContext.OPENID,
    nickName:event.nickName,
    phone:event.phone,
    city:event.city,
    nonceStr:randomString(),
    price:event.price,
    payState:0,
    createTime:event.createTime,
    refundPrice:0,
    refundState:0,
  };

  let db_res = await db.collection("orders_activity").add({
    data:data
  })

  if(db_res._id)
  {
    let res = await cloud.cloudPay.unifiedOrder({
      "body" : event.body,
      "outTradeNo" : db_res._id,//event.order_id+time,
      "spbillCreateIp" : "127.0.0.1",
      "subMchId" : "1607976973",
      "totalFee" : 100*event.price,
      "envId": "cloud1-0gycvki2e3212ab3",
      "functionName": "pay2_cb",
      "tradeType": "JSAPI",
      "nonceStr": randomString(),
    })
    
    return res
  }
  else{
    return {}
  }
}