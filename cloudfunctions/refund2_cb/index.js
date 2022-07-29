// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init(
  {env: cloud.DYNAMIC_CURRENT_ENV}
)

// 云函数入口函数
exports.main = async (event, context) => {

  const db = cloud.database()
  let data;
  if(event.returnCode=="SUCCESS"&&event.refundStatus=="SUCCESS")
  {
    data={
      resultCode: event.refundStatus,
      refundState:3,
    }
  }
  else{
    data={
      resultCode: event.refundStatus,
      refundState:4,
    }
  }

  try {
    const res =  await db.collection('orders_activity').where({
      _id:event.outTradeNo
    }).update({
      // data 字段表示需新增的 JSON 数据
      data:data
    })
    return{
      res: res,
      errcode: 0,
      errmsg: 'ok',
      event: event
    }

  } catch(e) {
    console.error(e)
  }
}