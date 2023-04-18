// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let uid = wxContext.OPENID;
  let mid = event.mid;
  const db = cloud.database()
  let db_res = await db.collection("orders").where({mid:mid,openid:uid}).update({data:{
    invoiceState:1
  }})
  let notify_res = await db.collection("config").limit(1).get();
  let notifyId = notify_res.data[0].admin_openid;

  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  var currentdate = year + "-" + month + "-" + strDate;

  try {
    const result = await cloud.openapi.uniformMessage.send({
        "touser": notifyId,
        "mpTemplateMsg": {
          "appid": 'wx4e202e1e3fdbac1a',
          //"url": 'https://https://www.astroedu.link',
          "miniprogram": {
            "appid": 'wx75e2c3eac30fa903',
            "pagepath": 'pages/kecheng/index/index'
          },
          "data": {
            "first": {
              "value": '有用户购买的课程需要开票。',
              "color": '#173177'
            },
            "keyword1": {
              "value": uid,
              "color": '#173177'
            },
            "keyword2": {
              "value": currentdate,
              "color": '#173177'
            },
            "keyword3": {
              "value": mid,
              "color": '#173177'
            },
            "keyword4": {
              "value": '无',
              "color": '#173177'
            },
            "remark": {
              "value": '欢迎使用！',
              "color": '#173177'
            }
          },
          "templateId": 'eczeBBFWJlAvEN6z8n6yAb_MQNrc3qtvAnoUNoedyck'
        }
      })
    
  } catch (err) {
    console.log(err);
  }
  return db_res
}