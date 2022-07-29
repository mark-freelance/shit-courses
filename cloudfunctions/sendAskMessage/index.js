// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let mid = event.mid;
  let kid = event.kid;

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

  let teachers = await db.collection("users").where({identityType:"teacher"}).limit(999).get();
  let sendList=[];
  for(let i=0;i<teachers.data.length;i++){
    let user = teachers.data[i];
    let ownedModules = user.ownedModules;
    if(ownedModules&&ownedModules.length>0)
    {
      for(let j=0;j<ownedModules.length;j++){
        let ownedKid = ownedModules[j].kid;
        if(ownedKid==kid)
        {
          sendList.push({openid:user._openid})               
          try {
            const result = await cloud.openapi.uniformMessage.send({
                "touser": user._openid,
                "mpTemplateMsg": {
                  "appid": 'wx4e202e1e3fdbac1a',
                  //"url": 'https://https://www.astroedu.link',
                  "miniprogram": {
                    "appid": 'wx75e2c3eac30fa903',
                    "pagepath": path
                  },
                  "data": {
                    "first": {
                      "value": '你好，你负责的客户有新的问题需要你回答。',
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
      }
    }
  }
  return sendList
}