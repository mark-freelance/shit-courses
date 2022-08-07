// 云函数入口文件
const cloud = require('wx-server-sdk')
// 云开发环境初始化
cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})

// 云函数入口函数
exports.main = async (event, context) => {
  // 这里获取到的 openId、 appId 和 unionId 是可信的，注意 unionId 仅在满足 unionId 获取条件时返回
  let { OPENID, APPID, UNIONID } = cloud.getWXContext()

  // 检查openid是否有权限访问kid
  // 查询users表
  const db = cloud.database()
  const user = db.collection('users')
  const userInfo = await user.where({
    _openid: OPENID
  }).get()

  let g_clearance = userInfo.data[0].g_clearance
  if (g_clearance == undefined) {
    g_clearance = []
  }
  let m_clearance = userInfo.data[0].m_clearance
  if (m_clearance == undefined) {
    m_clearance = []
  }
  let k_clearance = userInfo.data[0].k_clearance
  if (k_clearance == undefined) {
    k_clearance = []
  }

  // 从super_modules表中查询group_id在g_clearance中的记录
  const module = db.collection('super_modules')
  const moduleInfo = await module.where({
    group_id: db.command.in(g_clearance),
  }).get()
  // 遍历moduleInfo，将其_id与m_clearance拼接起来
  for (let i = 0; i < moduleInfo.data.length; i++) {
    m_clearance.push(moduleInfo.data[i]._id)
  }

  // 从kechengs表中查询kid在m_clearance中的记录
  const kecheng = db.collection('kechengs')
  const kechengInfo = await kecheng.where({
    mid: db.command.in(m_clearance),
  }).get()
  // 遍历kechengInfo，将其_id与k_clearance拼接起来
  for (let i = 0; i < kechengInfo.data.length; i++) {
    k_clearance.push(kechengInfo.data[i]._id)
  }

  // 如果kid在k_clearance中，则返回该kid的视频地址
  let url = null
  if(k_clearance.includes(event.kid)) {
    const kecheng_url = db.collection('kecheng_url')
    const kecheng_urlInfo = await kecheng_url.where({
      _id: event.kid
    }).get()
    url = kecheng_urlInfo.data[0].url
  }
  return url
}