// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const result = await cloud.openapi.subscribeMessage.send({
    touser: event.touser, // 通过 getWXContext 获取 OPENID
    page: 'index',
    data: {
      thing6: {
        value: event.kecheng_name
      },
      thing9: {
        value: event.user_name
      },
      date3: {
        value: event.time
      },
    },
    template_id: 'kpg44pswUwCyF2aNaZXgljrznbSpJO9MeODqFfdMBDQ',
  })
  //const wxContext = cloud.getWXContext()
  /*
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
  */
}