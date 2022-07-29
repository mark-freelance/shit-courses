// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let mid = event.mid;
  let kid = event.kid;
  let ask1_id = event.ask1_id;
  let user_recv_id = event.user_recv_id;
  let path = event.path?event.path:'pages/kecheng/index/index';

  const db = cloud.database()
  let kechengs =  await db.collection("kechengs").where({_id:kid}).limit(1).get();
  if(kechengs.data.length==0)
  {
    return
  }
  let kecheng = kechengs.data[0];
  let names = kecheng.kecheng_name.split(".");
  let kecheng_name = names[names.length-1].trim();

  try {
    const result = await cloud.openapi.uniformMessage.send({
        "touser": user_recv_id,
        "mpTemplateMsg": {
          "appid": 'wx4e202e1e3fdbac1a',
          //"url": 'https://https://www.astroedu.link',
          "miniprogram": {
            "appid": 'wx75e2c3eac30fa903',
            "pagepath": path
          },
          "data": {
            "first": {
              "value": '您好，您提问的问题有新的回复了。',
              "color": '#173177'
            },
            "keyword1": {
              "value": kecheng_name,
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
    
  } catch (err) {
    console.log(err);
  }
}