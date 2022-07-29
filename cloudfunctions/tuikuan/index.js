// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init(
  {env: cloud.DYNAMIC_CURRENT_ENV}
)

// 云函数入口函数
exports.main = async (event, context) => {
  
  console.log(event)
  
  const res = await cloud.cloudPay.refund({
    "functionName" : "tuikuan_cb",
    "envId": "cloud1-0gycvki2e3212ab3",
    "out_trade_no" : event.order_id,
    "sub_mch_id" : "1607976973",
    "nonce_str": 'KCH16CQ2502SI8ZNMT',
    "out_refund_no": event.out_refund_no,
    "total_fee" : 6,
    "refund_fee" :6,
  })
  console.log(res)
  return res

}