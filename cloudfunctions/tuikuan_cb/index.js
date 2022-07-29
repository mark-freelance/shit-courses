// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  
  console.log(event)

  const res = await cloud.cloudPay.queryRefund({
    "out_trade_no" : event.out_trade_no,
    "sub_mch_id" : "1607976973",
    "nonce_str": 'KCH16CQ2502SI8ZNMT',
  })
  console.log(res)
  return res
}