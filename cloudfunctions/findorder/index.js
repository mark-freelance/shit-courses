// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init(
  {  env: cloud.DYNAMIC_CURRENT_ENV
  }
)

// 云函数入口函数
exports.main = async (event, context) => {

  console.log(event)
  const res  =  await cloud.cloudPay.queryOrder({
    sub_mch_id:"1607976973",
    out_trade_no: event.out_trade_no,
    nonce_str:"28ee4e3e6072feb50ee72ab166ee72c6"
  })

  return {
    res:res,
    returnCode:0,
    returnMsg:'ok'
  }
}