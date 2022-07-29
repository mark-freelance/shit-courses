// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  const db = cloud.database()
  let gameList = await db.collection("games").where({is_delete:false}).orderBy('show_order', 'asc').get();
  return gameList;
}