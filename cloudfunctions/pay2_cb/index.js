// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init(
  {env: cloud.DYNAMIC_CURRENT_ENV}
)

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  const db = cloud.database()

  try {
    const res =  await db.collection('orders_activity').where({
      _id:event.outTradeNo
    }).update({
      // data 字段表示需新增的 JSON 数据
      data: {
        resultCode: event.resultCode,
        //totalFee: event.totalFee/100,
        //openid: event.subOpenid,
        //timeEnd:event.timeEnd,
        //nonceStr:event.nonceStr,
        payState:1,
      }
    })
    return{
      res: res,
      errcode: 0,
      errmsg: 'ok'
    }

  } catch(e) {
    console.error(e)
  }
}