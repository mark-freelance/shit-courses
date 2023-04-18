// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

const getBetterNameDisplay = (name) => {
	const segs = name.split('.')
	return segs[segs.length - 1]
}

// 云函数入口函数
exports.main = async ({path, kid}) => {
	
	const {data: kecheng} = await db.collection("kechengs_safe").doc(kid).get()
	if (!kecheng) throw Error(`kid=${kid} should exist!`)
	
	const kechengName = getBetterNameDisplay(kecheng.kecheng_name)
	const currentDate = new Date().toLocaleString("zh-CN", {timeZone: "Asia/ShangHai"}) // ref: d.toLocaleString("zh-CN", {timeZone: "Asia/ShangHai"})

	const pagePath = path || 'pages/kecheng/index/index'
	
	const sendNotification = async (targetID) =>  await cloud.openapi.uniformMessage
    .send({
      "touser": targetID,
      "mpTemplateMsg": {
        "appid": 'wx4e202e1e3fdbac1a',
        //"url": 'https://https://www.astroedu.link',
        "miniprogram": {
          "appid": 'wx75e2c3eac30fa903',
          "pagepath": pagePath,
        },
        "data": {
          "first": {
            "value": '你好，你负责的客户有新的问题需要你回答。',
            "color": '#173177'
          },
          "keyword1": {
            "value": kechengName,
            "color": '#173177'
          },
          "keyword2": {
            "value": currentDate,
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
	
	const {data: teachers} = await db.collection("users").where({
		identityType: "teacher",
		ownedModules: {"$elemMatch": {kid}}
	}).get();
	
  return Promise.all(teachers.map(async ({_openid}) => await sendNotification(_openid)))
}
