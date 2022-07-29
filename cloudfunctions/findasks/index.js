// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  console.log(event)
  const db = cloud.database()
  
  await db.collection('asks1').aggregate()//发起聚合操作
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
      create_time: -1,
     })                  //类似于limit，不填默认是20，没有上限
    .end()        //注意，end标志聚合操作的完成    
    .then(res =>{
      console.log(res)
      asks1 = res.list
    })
    .catch(err =>{
    })

    await db.collection('asks2').aggregate()//发起聚合操作
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
      create_time: -1,
     })                 //类似于limit，不填默认是20，没有上限
    .end()                 //注意，end标志聚合操作的完成    
    .then(res =>{
      console.log(res)
      asks2 = res.list
    })
    .catch(err =>{
    })
	for(let i=0;i<asks1.length;i++)
	{
		  //asks1[i].create_time = (new Date(asks1[i].create_time));//.format("MM-dd hh:mm");
	}	
	for(let i=0;i<asks2.length;i++)
	{
		  //asks2[i].create_time = (new Date(asks2[i].create_time));//.format("MM-dd hh:mm");
	}	
    return {
      asks1: asks1,
      asks2: asks2
    }
  
  
}