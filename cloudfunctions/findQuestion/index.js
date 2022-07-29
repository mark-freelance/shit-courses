// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  console.log(event)
  const db = cloud.database()
  let questions = await db.collection("questions").where({
    question_type: event.type,
    question_order: parseInt(event.order),
    is_delete: false,
  }).field({
	is_fill: true,
	_id: true,
	question_order: true,
	question_type: true,
	question_text: true,
	question_options: true,
	question_class: true,
	question_answer: true,
	jiexi: true,
	question_score: true,
  })
  .orderBy("is_fill", "asc")
  .get();
	return {questions:questions}
}