// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init(
  {env: cloud.DYNAMIC_CURRENT_ENV}
)

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  const db = cloud.database()

  var type = ''
  if (event.attach == "学校账号购买"){
    type = '学校账号购买'
    var attach = []
    for(var i = 0 ; i< 7;i++){
      var username = Math.random().toString(36).substr(7)
      var password = Math.random().toString(36).substr(7)
      attach.push({
        username:username,
        password:password,
        checked:false,
        time:event.timeEnd,
        type: '子账号'
      })
    }
  } else{
    type = '个人账号购买'
  }

  try {
    const res =  await db.collection('orders').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        type:type,
        attach: attach,
        outTradeNo: event.outTradeNo,
        resultCode: event.resultCode,
        totalFee: event.totalFee/100,
        openid: event.subOpenid,
        timeEnd:event.timeEnd,
        mid:event.nonceStr,
        invoiceState:0,
      }
    })

    const res2 = await db.collection('order_detail').add({
      data: attach
    })
    
    const _ = db.command
    const res3 = await db.collection('users')
      .where({
        _openid: event.subOpenid,
      })
      .update({
        data:{
          m_clearance: _.push(event.nonceStr)
        }
      })

    return{
      res: res,
      res2 : res2,
      res3 : res3,
      errcode: 0,
      errmsg: 'ok'
    }

  } catch(e) {
    console.error(e)
  }
  
}