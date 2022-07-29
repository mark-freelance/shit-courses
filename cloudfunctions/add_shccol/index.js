// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init(
  {env: cloud.DYNAMIC_CURRENT_ENV}
)

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  const db = cloud.database()
  var attach = []
  for(var i = 0 ; i< 35;i++){
      var username = Math.random().toString(36).substr(7)
      var password = Math.random().toString(36).substr(7)

      attach.push({
        username:username,
        password:password,
        checked:false,
        type: '子账号'
      })
  } 

  try {
    
    const res2 = await db.collection('order_detail').add({
      data: attach
    })

    return{
      res2 : res2,
      
    }

  } catch(e) {
    console.error(e)
  }
  
}