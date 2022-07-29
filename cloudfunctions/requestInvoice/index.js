// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()


function dateFormat(fmt, date) {
  let ret;
  const opt = {
      "Y+": date.getFullYear().toString(),        // 年
      "m+": (date.getMonth() + 1).toString(),     // 月
      "d+": date.getDate().toString(),            // 日
      "H+": date.getHours().toString(),           // 时
      "M+": date.getMinutes().toString(),         // 分
      "S+": date.getSeconds().toString()          // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
      ret = new RegExp("(" + k + ")").exec(fmt);
      if (ret) {
          fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
      };
  };
  return fmt;
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let uid = wxContext.OPENID;
  const db = cloud.database()
  let db_res = await db.collection("fapiao").where({orderid:event.orderid}).get();
  if(db_res.data.length>0)//已经申请过了
  {
    return db_res
  }
  let date = new Date();
  date.setTime(date.getTime() + (8*60*60*1000));
  let create_time = date.getTime();
  let data={
    _openid:uid,
    orderid: event.orderid,
    taitou: event.taitou,
    shuihao: event.shuihao,
    jine: event.jine,
    youxiang: event.youxiang,
    dianhua: event.dianhua,
    invoiceState: event.invoiceState,
    type: event.type,
    create_time:create_time,
  }
  db_res = await db.collection("fapiao").add({
    data:data
  });

  let notify_res = await db.collection("config").limit(1).get();
  let notifyId = notify_res.data[0].admin_openid;
  let result={}
  try {
    result = await cloud.openapi.uniformMessage.send({
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
            "value": dateFormat("YYYY-mm-dd HH:MM:SS",date),
            "color": '#173177'
          },
          "keyword3": {
            "value": event.orderid,
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
    // return result;
  } catch (err) {
    console.log(err);
  }
  return result
}