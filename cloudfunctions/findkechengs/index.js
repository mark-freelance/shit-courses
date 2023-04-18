// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
	console.log(event)
	const wxContext = cloud.getWXContext()
  const db = cloud.database()
  let schoolUser = await db.collection('school').where({bind_openid:event.uid}).limit(1).get()
  console.log(schoolUser)
  
  if(schoolUser.data.length>0)
  {
	  let iDate = new Date(schoolUser.data[0].invalid_date).getTime()
	  let nDate = new Date().getTime()
	  if(iDate>nDate)
	  {
      let result = await db.collection("super_modules").get()
      let list=[]
      for(let i=0;i<result.data.length;i++)
      {
        list.push({mlist:[result.data[i]]});
      }
		  return {list:list};
	  }
	  else{
		  return {list:[]}
	  }
  }else{
		await db.collection('orders').aggregate()//发起聚合操作
		.match({
		  openid: wxContext.OPENID
		  //totalFee: 498
		})                           
		.lookup({
		  from: 'super_modules',
		  localField: 'mid',
		  foreignField: '_id',
		  as: 'mlist',
		}).limit(999)   //类似于limit，不填默认是20，没有上限
		.end()        //注意，end标志聚合操作的完成    
		.then(res =>{
		  console.log(res)
		  data = res
		})
		.catch(err =>{
		})

		return data
  }
  
}