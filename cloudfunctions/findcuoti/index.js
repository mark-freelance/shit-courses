// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
    const db = cloud.database()
    
    await db.collection('cuotiben').where({
      _openid: event.uid
   }).field({
     mid:true,
     wrong_answer:true,
     _id:true
   }).get().then(res => {
    // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
    console.log(res.data)
    cuoti = res.data
  })

  return {
   cuoti:cuoti
  }
}