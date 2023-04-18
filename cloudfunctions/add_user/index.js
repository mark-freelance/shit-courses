// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  console.log(event)
  console.log(context)

  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  const wxContext = cloud.getWXContext()

  const db = cloud.database()
    
  const res = await db.collection('users').where({_openid:wxContext.OPENID}).limit(999).get();
  if(res.data.length>0)
  {
    let user = res.data[0];
    await db.collection("users").where({_id:user._id}).update({data:{
      nickName:event.nickName,
      avatarUrl:event.avatarUrl,
      unionid: wxContext.UNIONID,
    }})
    return await db.collection('users').where({_openid:wxContext.OPENID}).limit(999).get();
   
  }
  else{
    await db.collection("users").add({data:{
      nickName: event.nickName,
      avatarUrl: event.avatarUrl,
      _openid:wxContext.OPENID,
      unionid: wxContext.UNIONID,
      identityType:"student",
      isBanned:false,
      g_clearance: [],
      m_clearance: [],
      k_clearance: []
    }})
    return await db.collection('users').where({_openid:wxContext.OPENID}).limit(999).get();
  
  }
}

