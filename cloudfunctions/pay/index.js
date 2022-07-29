// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {

  console.log(event)
  var date = new Date()
  var time = date.getSeconds().toString()
  const res = await cloud.cloudPay.unifiedOrder({
    "body" : event.body,
    "outTradeNo" : event.order_id+time,
    "spbillCreateIp" : "127.0.0.1",
    "subMchId" : "1607976973",
    "totalFee" : 100*event.price,
    "envId": "cloud1-0gycvki2e3212ab3",
    "functionName": "pay_cb",
    "tradeType": "JSAPI",
    "nonceStr": event.mid,
    "detail": event.mid,
    "attach": event.attach,
  })
  return res
}