// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  let text = event.text;
  let aid = event.aid;
  let notify_res = await db.collection("config").limit(1).get();
  let notifyId = notify_res.data[0].admin_openid;
  let path = event.path?event.path:'pages/kecheng/index/index';

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
            "pagepath": path
          },
          "data": {
            "first": {
              "value": text,
              "color": '#173177'
            },
            "keyword1": {
              "value": aid,
              "color": '#173177'
            },
            "keyword2": {
              "value": currentdate,
              "color": '#173177'
            },
            "keyword3": {
              "value": '无',
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
    return result
  } catch (err) {
    return err
  }
}