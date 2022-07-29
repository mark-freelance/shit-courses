// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

function randomString(e) {    
  e = e || 32;
  var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
  a = t.length,
  n = "";
  for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log(event)
  const db = cloud.database()
  //var date = new Date()
  //var time = date.getSeconds().toString()
  let id=event.id;
  //let price = event.price;
  //let refundPrice = event.refundPrice;
  let out_refund_no= randomString();

  let data = {
    refundTime:event.refundTime,
    //refundPrice:refundPrice,
    refundState:1,
    out_refund_no:out_refund_no,
  };

  let db_res = await db.collection("orders_activity").where({_id:id,payState:1,refundState:0}).update({
    data:data
  })

  return db_res
  // if(db_res.stats.updated>0)
  // {
  //   let res = await cloud.cloudPay.refund({
  //     "functionName": "refund2_cb",
  //     "envId": "cloud1-0gycvki2e3212ab3",
  //     "sub_mch_id":"1607976973",
  //     "nonce_str":randomString(),
  //     "out_trade_no":id,
  //     "out_refund_no":out_refund_no,
  //     "total_fee":100*price,
  //     "refund_fee":100*refundPrice,     
  //   })
    
  //   return res
  // }
  // else{
  //   return {errorCode:-100,errorMsg:"订单查询失败"}
  // }
}