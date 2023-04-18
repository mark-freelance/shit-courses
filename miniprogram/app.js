//app.js
App({
  onLaunch: function () {
    wx.setInnerAudioOption({
      obeyMuteSwitch: false
    })
    
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'cloud1-0gycvki2e3212ab3',
        traceUser: true,
      });
    }
    var res = wx.getSystemInfoSync();
    //res.platform="ios"
    this.globalData = {
      question_array: [],
      wrong_question_array: [],
      kou_num: 0,
      all_num: 0,
      openid: "",
      mid: "",
      sorttype: [],
      company: "",
      is_ios: "ios" == res.platform,
      not_buy_text: "ios" == res.platform ? "您不是会员" : "未购",
      vip_only: "ios" == res.platform ? "您不是会员" : "付费用户可见",
    };
  },

  getUserProfile(e) {
    // wx.getUserProfile完犊子啦！现在要用狗日的获取头像昵称功能！
    wx.navigateTo({
      url: '/pages/userProfile/userProfile',
    })
    /*
    wx.getUserProfile({
      desc: "用于完善会员资料", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        //this.setData({
        //user: res.userInfo,
        //hasUserInfo: true,
        //avatarUrl: res.userInfo.avatarUrl,
        //logged: true,
        //});
        // app.globalData.openid = res.userInfo.openid;
        wx.cloud.callFunction({
          name: "add_user",
          data: {
            nickName: res.userInfo.nickName,
            avatarUrl: res.userInfo.avatarUrl,
          },
          success: (res) => {
            console.log(res.result);
            this.setData({
              logged: true,
              user: res.result.data[0],
            });
            app.globalData.user = res.result.data[0];
          },
          fail: (err) => {
            console.error("[云函数] [add_user] 调用失败", err);
          },
        });
      },
      fail(error) {
        console.log(error);
      },
    });
    */
  },
});
