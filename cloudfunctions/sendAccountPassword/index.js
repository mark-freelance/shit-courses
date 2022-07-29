// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  let db_res = await db.collection("account_message").where({state:0}).limit(10).get();
  
  if(db_res.data&&db_res.data.length>0){
    try {
      let item = db_res.data[0];
      const result = await cloud.openapi.uniformMessage.send({
          "touser": item.openid,
          "mpTemplateMsg": {
            "appid": 'wx4e202e1e3fdbac1a',
            //"url": 'https://https://www.astroedu.link',
            "miniprogram": {
              "appid": 'wx75e2c3eac30fa903',
              "pagepath": 'pages/kecheng/index/index'
            },
            "data": {
              "first": {
                "value": '您好，您已成为我们的会员。账号和密码如下：',
                "color": '#173177'
              },
              "keyword1": {
                "value": item.account,
                "color": '#173177'
              },
              "keyword2": {
                "value": item.password,
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
                "value": '绑定账号和密码后即可使用我们的会员服务',
                "color": '#173177'
              }
            },
            "templateId": 'vqmsQkg7HMiZrvjzdCZhywWFn24sTRqKJPLx5ltuvKs'
          }
        })
      if(result.errCode==0)
      {
        await db.collection("account_message").where({_id:item._id}).update({data:{
          state:1
        }})
      }
      else{
        await db.collection("account_message").where({_id:item._id}).update({data:{
          state:-1
        }})
      }
      return result
    } catch (err) {
      return err
    }
  }
  return db_res
}