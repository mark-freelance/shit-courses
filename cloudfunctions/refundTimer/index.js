// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

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

  let db_res = await db.collection("orders_activity").where({payState:1,refundState:2}).limit(10).get();

  if(db_res.data&&db_res.data.length>0){
    for(let i=0;i<db_res.data.length;i++)
    {
      let item = db_res.data[i];
      let res = await cloud.cloudPay.refund({
        "functionName": "refund2_cb",
        "envId": "cloud1-0gycvki2e3212ab3",
        "sub_mch_id":"1607976973",
        "nonce_str":randomString(),
        "out_trade_no":item._id,
        "out_refund_no":item.out_refund_no,
        "total_fee":100*item.price,
        "refund_fee":100*item.refundPrice,     
      })
      if(res.resultCode!="SUCCESS")
      {
        return {
          res:res,
          db_res:db_res
        }
      }
    }
  }
  return db_res;
}