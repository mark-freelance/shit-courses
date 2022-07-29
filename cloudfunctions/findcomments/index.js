// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  
  console.log(event)
  const db = cloud.database()
  
  await db.collection('comments1').aggregate()//发起聚合操作
    .match({
      kecheng_id: event.kecheng_id,
      is_delete:false,
    })                           
    .lookup({
      from: 'users',
      localField: '_openid',
      foreignField: '_openid',
      as: 'userList',
    }).limit(999)
    .sort({
      comment_time: -1,
     })                  //类似于limit，不填默认是20，没有上限
    .end()        //注意，end标志聚合操作的完成    
    .then(res =>{
      console.log(res)
      com1 = res.list
    })
    .catch(err =>{
    })

    await db.collection('comments2').aggregate()//发起聚合操作
    .match({
      kecheng_id: event.kecheng_id,
      is_delete:false,
    })                           
    .lookup({
      from: 'users',
      localField: '_openid',
      foreignField: '_openid',
      as: 'userList',
    }).limit(999) 
    .sort({
      comment_time: -1,
     })                 //类似于limit，不填默认是20，没有上限
    .end()                 //注意，end标志聚合操作的完成    
    .then(res =>{
      console.log(res)
      com2 = res.list
    })
    .catch(err =>{
    })

    return {
      comment1: com1,
      comment2: com2
    }
}