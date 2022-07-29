// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

function isAllChecked(tags){
  if(!tags.tag1||!tags.tag2||!tags.tag3||!tags.tag4){
    return false
  }
  for(let i=0;i<tags.tag1.length;i++)
  {
    let item = tags.tag1[i];
    if(!item.checked)
    {
      return false;
    }
  }
  for(let i=0;i<tags.tag2.length;i++)
  {
    let item = tags.tag2[i];
    if(!item.checked)
    {
      return false;
    }
  }
  for(let i=0;i<tags.tag3.length;i++)
  {
    let item = tags.tag3[i];
    if(!item.checked)
    {
      return false;
    }
  }
  for(let i=0;i<tags.tag4.length;i++)
  {
    let item = tags.tag4[i];
    if(!item.checked)
    {
      return false;
    }
  }
  return true;
}
function isAllUnChecked(tags){
  if(!tags.tag1&&!tags.tag2&&!tags.tag3&&!tags.tag4){
    return true
  }
  for(let i=0;i<tags.tag1.length;i++)
  {
    let item = tags.tag1[i];
    if(item.checked)
    {
      return false;
    }
  }
  for(let i=0;i<tags.tag2.length;i++)
  {
    let item = tags.tag2[i];
    if(item.checked)
    {
      return false;
    }
  }
  for(let i=0;i<tags.tag3.length;i++)
  {
    let item = tags.tag3[i];
    if(item.checked)
    {
      return false;
    }
  }
  for(let i=0;i<tags.tag4.length;i++)
  {
    let item = tags.tag4[i];
    if(item.checked)
    {
      return false;
    }
  }
  return true;
}

function getCheckedTags(tagList){
  let array =[]
  for(let i=0;i<tagList.length;i++){
    let item = tagList[i];
    if(item.checked)
    {
      array.push(item.text);
    }
  }
  if(array.length==0)
  {
    for(let i=0;i<tagList.length;i++){
      let item = tagList[i];
      array.push(item.text);
    }
  }
  return array;
}

async function  exeSearchQuery(event){
  const db = cloud.database()
  const _ = db.command
  let tags = event.tags;
  let city = event.city;
  let time = new Date().getTime();
  let query={};

  let res = await db.collection("activity").where({
    is_delete:false,
    tag1:_.in(getCheckedTags(tags.tag1)),
    tag2:_.in(getCheckedTags(tags.tag2)),
    tag3:_.in(getCheckedTags(tags.tag3)),
    tag4:_.in(getCheckedTags(tags.tag4)),
    timeEnd:_.gt(time)
  }).orderBy("show_order","desc").limit(999).get();
  
  let needLocation = false;
  let allChecked = true;
  for(let i=0;i<tags.tag1.length;i++)
  {
    let item = tags.tag1[i];
    if(item.checked&&item.needLocation){
      needLocation = true;
    }
    if(!item.checked){
      allChecked = false;
    }
  }
  if(needLocation&&city&&!allChecked)
  {
    let name = city.name;
    let fullname = city.fullname;
    for(let i=res.data.length-1;i>=0;i--)
    {
      let row = res.data[i];
      let location = row.location;
      let match = false;
      for(let j=0;j<location.length;j++){
        let loc = location[j]
        if(loc.includes(name)){
          match = true;
          break;
        }
      }
      if(!match)
      {
        res.data.splice(i,1)
      }
    }
  }
  return res
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  const $ = db.command.aggregate
  let time = new Date().getTime();
  let tags = event.tags;
  let aid = event.aid;
  if(event.searchOrdered)
  {
    let ordered_res =await db.collection("orders_activity").where({openid:wxContext.OPENID,payState:_.gt(0)}).limit(999).get();
    // let aidList=[];
    // for(let i=0;i<ordered_res.data.length;i++)
    // {
    //   let ordered = ordered_res.data[i];
    //   aidList.push(ordered.aid);
    // }
    let activity_res=[];
    for(let i=0;i<ordered_res.data.length;i++){
      let ordered = ordered_res.data[i];
      let db_res = await db.collection("activity").where({_id:ordered.aid}).orderBy("show_order","desc").limit(1).get();
      if(db_res.data.length>0)
      {
        let item = db_res.data[0]
        item.order = ordered;
        activity_res.push(item);
      }
      // for(let j=db_res.data.length;j>0;j--)
      // {
      //   let item=db_res.data[j]
      //   if(ordered.aid==item._id)
      //   {
      //     item.order = ordered;
      //     
      //     break;
      //   }
      // }
    }
    // for(let i=0;i<db_res.data.length;i++)
    // {
    //   let item = db_res.data[i];
    //   for(let j=0;j<ordered_res.data.length;j++)
    //   {
    //     let ordered = ordered_res.data[j];
    //     if(ordered.aid==item._id)
    //     {
    //       item.order = ordered;
    //       break;
    //     }
    //   }
    // }
    return {data:activity_res};
  }
  else if(event.searchSaved)
  {
    let saved_res =await db.collection("saved_activity").where({_openid:wxContext.OPENID,isDelete:false}).limit(999).get();
    let aidList=[];
    for(let i=0;i<saved_res.data.length;i++)
    {
      let saved = saved_res.data[i];
      aidList.push(saved.aid);
    }
    let db_res = await db.collection("activity").where({is_delete:false,_id:_.in(aidList)}).orderBy("show_order","desc").limit(999).get();
    return db_res;
    // return await db.collection("saved_activity").aggregate()
    // .match({_openid:wxContext.OPENID})
    // .lookup({
    //   from: 'activity',
    //   let:{
    //     order_aid:"$aid",
    //   },
    //   pipeline:$.pipeline()
    //   .match(_.expr($.and([
    //     $.eq(["$_id","$$order_aid"]),
    //     $.eq(["is_delete",false])
    //   ])))
    //   .sort({show_order:1})
    //   .done(),
    //   as: 'activityList',
    // }).end()
  }
  else if(aid&&aid.length>0)
  {
    let db_res = await db.collection("activity").where({is_delete:false,_id:aid}).orderBy("show_order","desc").get();
    if(event.withExtra&&db_res.data.length>0)
    {
      let activity = db_res.data[0];
      let comment_res = await db.collection("order_comment").aggregate()
      .match({is_delete:false,aid:aid}).sort({time:-1}).lookup({
        from: 'users',
        localField: '_openid',
        foreignField: '_openid',
        as: 'userList',
      }).end();
      activity.comments=comment_res.list;

      let ask_res = await db.collection("order_ask").aggregate()
      .match({is_delete:false,aid:aid}).sort({time:-1}).lookup({
        from: 'users',
        localField: '_openid',
        foreignField: '_openid',
        as: 'userList',
      }).lookup({
        from: 'users',
        localField: 'reply_openid',
        foreignField: '_openid',
        as: 'replyList',
      }).end();
      activity.asks=ask_res.list;
      //return activity
    }
    return db_res;
  }
  else if(!isAllUnChecked(tags)&&!isAllChecked(tags)){
    return exeSearchQuery(event);
  }
  else{//return all
    return await  db.collection("activity").where({is_delete:false,timeEnd:_.gt(time)}).orderBy("show_order","desc").limit(999).get();
  }
}