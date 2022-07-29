// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init(
  {  env: cloud.DYNAMIC_CURRENT_ENV
  }
)

// 云函数入口函数
exports.main = async (event, context) => {

  console.log(event)
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  let uid = wxContext.OPENID;
  let mid= event.mid;
  let aid = event.aid;
  if(mid&&mid.length>0)
  {
    const res = await db.collection('orders').where({openid:uid,mid:mid}).limit(1).get();
    return res;
  }
  else if(aid&&aid.length>0){
    const res = await db.collection('orders_activity').where({openid:uid,aid:aid}).get();
    return res;
  }
  return {data:[]}
}