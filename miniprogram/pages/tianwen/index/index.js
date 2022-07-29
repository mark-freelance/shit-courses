const colorLight = "rgba(0, 0, 0, .9)";
const colorDark = "rgba(255, 255, 255, .8)";

const app = getApp();
Page({
  data: {
    avatarUrl: "./xinqiu.png",
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: "",
    iconList: [
      {
        icon: "pencil",
        color: "red",
        size: 30,
        name: "开始刷题",
        bindtap: "openMenu",
      },
      {
        icon: "setting",
        color: "green",
        size: 30,
        name: "刷题设置",
      },
      {
        icon: "note",
        color: "RoyalBlue",
        size: 30,
        name: "错题本",
      },
      {
        icon: "search",
        color: "cyan",
        size: 30,
        name: "题目搜索",
      },
      {
        icon: "add",
        color: "orange",
        size: 30,
        name: "添加题目",
      },
      {
        icon: "at",
        color: "DimGray",
        size: 30,
        name: "分享题目",
      },
      {
        icon: "copy",
        color: "DarkCyan",
        size: 30,
        name: "刷题榜单",
      },
      {
        icon: "shop",
        color: "gold",
        size: 30,
        name: "课程训练",
      },
      {
        icon: "bellring-on",
        color: "red",
        size: 30,
        name: "刷题说明",
      },
    ],
    showActionsheet: false,
    groups: [
      { text: "天体力学 卷一", value: { type: "天体力学", order: 1 } },
      { text: "天体力学 卷二", value: { type: "天体力学", order: 2 } },
    ],
  },
  onLoad() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting["scope.userInfo"]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: (res) => {
              this.setData({
                userInfo: res.userInfo,
              });
            },
          });
        }
      },
    });
  },

  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      app.globalData.openid = e.detail.userInfo.openid;
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
      });
    }
  },

  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: "login",
      data: {},
      success: (res) => {
        console.log("[云函数] [login] user openid: ", res.result.openid);
        app.globalData.openid = res.result.openid;
        app.globalData.serverConfig = res.result.config;
        wx.navigateTo({
          url: "../../geren/userConsole/userConsole",
        });
      },
      fail: (err) => {
        console.error("[云函数] [login] 调用失败", err);
        wx.navigateTo({
          url: "../deployFunctions/deployFunctions",
        });
      },
    });
  },

  //生成不同题目
  onCreateQuestionArray: function () {
    //清空wrong array
    app.globalData.wrong_question_array = [];
    //跳转
    wx.navigateTo({
      url: "../shuati/shuati",
    });
  },

  onShow: function () {},
  //关闭题目类别菜单（初中、小学、高中）
  close: function () {
    this.setData({
      showActionsheet: false,
    });
  },
  //菜单选择
  btnClick(e) {
    //清空wrong array
    app.globalData.wrong_question_array = [];
    this.setData({
      showActionsheet: false,
    });
    var type = e.detail.value.type;
    var order = e.detail.value.order;
    wx.navigateTo({
      url: "../shuati/shuati?type=" + type + "&order=" + order,
    });
  },

  //打开菜单
  openMenu: function () {
    this.setData({
      showActionsheet: true,
    });
  },
});
