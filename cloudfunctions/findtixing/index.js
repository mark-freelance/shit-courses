// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  console.log(event)
  const db = cloud.database()
  let user = await db.collection("users").where({
    _openid:event.uid,
	isBanned:false,
  }).get();
  
  if(user.data.length>0)
  {
    let userItem = user.data[0]
    if(userItem.identityType=="teacher")
    {
      let ownModules = userItem.ownedModules
      let result = [];
      if(ownModules&&ownModules.length>0)
      {
		  let midList = [];
		  const _ = db.command;
          for(let i=0;i<ownModules.length;i++)
          {		  
			let mid = ownModules[i].kid
			if(mid&&mid.trim())
			{
				midList.push(mid)	
			}
		  }
		  if(midList.length)
		  {
			  await db.collection("asks1").aggregate().match({
				kecheng_id: _.in(midList),
				is_delete:false,
				is_handled:false,
			  })
			  .lookup({
				from: 'users',
				localField: '_openid',
				foreignField: '_openid',
				as: 'userList',
			  }).lookup({
				from: 'kechengs',
				localField: 'kecheng_id',
				foreignField: '_id',
				as: "kechengList",
			  }).limit(100)
			  .sort({
				create_time: -1,
			  })
			  .end().then(res=>{
				  result.push(...res.list)
			  })
		  }
        }    
		
	  for(let i=0;i<result.length;i++)
	  {
		  //result[i].create_time = (new Date(result[i].create_time));//.format("MM-dd hh:mm");
	  }		
      
      return {asks1:result}
    }
    else{
      await db.collection('asks2').aggregate()//发起聚合操作
      .match({
        user_recv_id: event.uid,
        is_delete:false,
        is_handled:false,
      })                           
      .lookup({
        from: 'users',
        localField: '_openid',
        foreignField: '_openid',
        as: 'userList',
      }).limit(100) 
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
  
	  for(let i=0;i<asks2.length;i++)
	  {
		  //asks2[i].create_time = (new Date(asks2[i].create_time));//.format("MM-dd hh:mm");
	  }
  
      return {
        asks2: asks2
      }
    }
  }
  else{
    return undefined
  }
  
}