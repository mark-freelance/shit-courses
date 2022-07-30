// miniprogram/pages/kecheng/index/index.js
const app = getApp();
const db = wx.cloud.database();   // todo: 这里
const config = require("../../../config.js");
const versionControl = require("../../../version.js");
Page({
  /**
   * 页面的初始数据
   */

  data: {
    background: ["demo-text-1", "demo-text-2", "demo-text-3"],
    indicatorDots: false,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    userInfo: {},
    kechengs: [],
    modules: [],  // todo: 傻子库存到了这里
    module_groups: [], // 我又加了个groups
  },

  /**
   * 生命周期函数--监听页面加载
   */

  loadcompany: function (company) {
    app.globalData.company = company;
  },

  // todo: 这里调用的傻子库
  onLoad: function (options) {
    //获取公司名
    this.loadcompany(options.company);
    //
    //获取课程
    this.onGetOpenid();
    //获取课程
    this.getmodules();
  },
  //跳转
  tomodule: function (e) {
    // if (
    //   app.globalData.serverConfig &&
    //   app.globalData.serverConfig.auditVersionNum &&
    //   versionControl.isAuditVersion(app.globalData.serverConfig.auditVersionNum)
    // ) {
    //   wx.showToast({ title: config.data.auditTip });
    // } else
    {
      app.globalData.mid = e.currentTarget.dataset.mid;

      var mid = e.currentTarget.dataset.mid;
      wx.navigateTo({
        url: "../kecheng/kecheng?mid=" + mid,
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //this.showDot(2,"0");
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  //登陆
  onGetOpenid: function () {
    wx.showLoading({
      title: "获取openid中",
    });
    // 调用云函数
    wx.cloud.callFunction({
      name: "login",
      data: {},
      success: (res) => {
        console.log("[云函数] [login]  ", res.result);
        app.globalData.openid = res.result.openid;
        app.globalData.serverConfig = res.result.config;
        wx.hideLoading();
      },
      fail: (err) => {
        console.error("[云函数] [login] 调用失败", err);
      },
    });
  },

  toshuati: function (e) {
    console.log(e);
    app.globalData.mid = e.currentTarget.dataset.mid;
    wx.navigateTo({
      url: "../../tianwen/shuati/shuati?type=天体力学&order=1",
    });
  },

  toteacher: function () {
    wx.navigateTo({
      url: "../teachers/teachers",
    });
  },

  tostudent: function () {
    wx.navigateTo({
      url: "../student/student",
    });
  },

  tous: function () {
    wx.navigateTo({
      url: "../us/us",
    });
  },

  toweidian: function () {
    wx.navigateTo({
      url: "../weidian/weidian",
    });
  },

  getkechengs: function () {
    wx.showLoading({
      title: "加载课程中",
    });
    db.collection("kechengs").get({
      success: (res) => {
        this.setData({
          kechengs: res.data,
        });
        console.log(this.data.kechengs);
        setTimeout(() => {
          wx.hideLoading();
        }, 100);
      },
    });
  },

  // todo: 这里取傻子库
  getmodules: function () {
    wx.showLoading({
      title: "加载模块中",
    });
    db.collection("module_groups")
      .orderBy("show_order", "asc")
      .get({
        success: (res) => {
          this.setData({
            module_groups: res.data,
          });
          console.log('groups:')
          console.log(this.data.module_groups)
          setTimeout(() => {
            wx.hideLoading();
          }, 100);
        },
      });
    db.collection("super_modules")
      .orderBy("show_order", "asc")
      .get({
        success: (res) => {
          this.setData({
            modules: res.data,
          });
          console.log('modules')
          console.log(this.data.modules)
          setTimeout(() => {
            wx.hideLoading();
          }, 100);
        },
      });
  },
  showDot(index, count) {
    wx.setTabBarBadge({
      index: index,
      text: count,
    });
  },
});
