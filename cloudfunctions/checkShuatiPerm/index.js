// 看有没有对应module的权限，判断能否访问知识检测
const cloud = require('wx-server-sdk')
// 云开发环境初始化
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 判断有没有权限
async function checkPermission (openid, mid) {
    const db = cloud.database()
    const user = db.collection('users')
    const userInfo = await user.where({
        _openid: openid
    }).get()

    // 检查openid是否有权限访问kid
    // 先看是不是上帝teacher
    let isGod = (userInfo.data[0].identityType == 'teacher')
    if (isGod) {
        return true
    }
    
    // 不是上帝
    // 查询users表
    let g_clearance = userInfo.data[0].g_clearance || []
    let m_clearance = userInfo.data[0].m_clearance || []

    // 获取用户的学校信息
    const school = db.collection('school')
    const schoolInfo = await school.where({
        bind_openid: openid
    }).get()
    // 有学校，检查过没过期
    if (schoolInfo.data.length > 0) {
        let nDate = new Date().getTime();
        let iDate = new Date(schoolInfo.data[0].invalid_date).getTime();
        if (iDate >= nDate) {
            // 没过期，添加学校的clearance
            g_clearance.push.apply(g_clearance, schoolInfo.data[0].g_clearance);
            m_clearance.push.apply(m_clearance, schoolInfo.data[0].m_clearance);
        }
    }

    // 从super_modules表中查询group_id在g_clearance中的记录
    // 兔费课程也在这儿加进去
    const _ = db.command
    const module = db.collection('super_modules')
    const moduleInfo = await module.where(_.or([
        {
            group_id: db.command.in(g_clearance),
        },
        {
            module_price: _.lte(0),
        }
    ])).get()
    // 遍历moduleInfo，将其_id与m_clearance拼接起来
    for (let i = 0; i < moduleInfo.data.length; i++) {
        m_clearance.push(moduleInfo.data[i]._id)
    }

    return m_clearance.includes(mid)
}

// 云函数入口函数
exports.main = async (event, context) => {
    // 这里获取到的 openId、 appId 和 unionId 是可信的，注意 unionId 仅在满足 unionId 获取条件时返回
    let { OPENID, APPID, UNIONID } = cloud.getWXContext()
    let permission = await checkPermission(OPENID, event.mid)
    if (permission) {
        // 有权限
        return true
    } else {
        // 没权限
        return false
    }
}