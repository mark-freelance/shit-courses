// 云函数入口文件
const cloud = require('wx-server-sdk')
// 云开发环境初始化
cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})
exports.main = async (event, context) => {
  let table = 'super_modules'
  const db = cloud.database()
  // 1，获取数据的总个数
  let count = await db.collection(table).count()
  count = count.total
  // 2，通过for循环做多次请求，并把多次请求的数据放到一个数组里
  let all = []
  for (let i = 0; i < count; i += 100) { //自己设置每次获取数据的量
    let list = await db.collection(table).skip(i).get()
    all = all.concat(list.data);
  }
  // 3,把组装好的数据一次性全部返回
  return all;
}