// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    const result = await cloud.openapi.uniformMessage.send({
        "touser": wxContext.OPENID,
        "mpTemplateMsg": {
          "appid": 'wx4e202e1e3fdbac1a',
          //"url": 'https://https://www.astroedu.link',
          "miniprogram": {
            "appid": 'wx75e2c3eac30fa903',
            "pagepath": 'pages/kecheng/index/index'
          },
          "data": {
            "first": {
              "value": '你好，你负责的客户有新的问题需要你回答。',
              "color": '#173177'
            },
            "keyword1": {
              "value": '待回复的问题',
              "color": '#173177'
            },
            "keyword2": {
              "value": '2014年9月22日',
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