// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async ({toUserOpenID, path, title, msgTitle}) => {
	return await cloud.openapi.uniformMessage
	.send({
		"touser": toUserOpenID,
		"mpTemplateMsg": {
			"appid": 'wx4e202e1e3fdbac1a',
			//"url": 'https://https://www.astroedu.link',
			"miniprogram": {
				"appid": 'wx75e2c3eac30fa903',
				"pagepath": path || 'pages/kecheng/index/index',
			},
			"data": {
				"first": {
					"value": msgTitle,
					"color": '#173177'
				},
				"keyword1": {
					"value": title,
					"color": '#173177'
				},
				"keyword2": {
					"value": new Date().toLocaleString("zh-CN", {timeZone: "Asia/ShangHai"}), // ref: d.toLocaleString("zh-CN", {timeZone: "Asia/ShangHai"})
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
	
}
