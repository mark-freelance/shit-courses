// miniprogram/pages/geren/bags/bags.js
const app = getApp();
const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    phone: "",
    email: "",
    back: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    if (options.back) {
      this.setData({ back: options.back });
    }
    if (!app.globalData.openid) {
      this.login();
    } else if (!app.globalData.user) {
      this.getopeninfo();
    } else {
      if (app.globalData.user.phone) {
        this.setData({
          phone: app.globalData.user.phone,
        });
      }
      if (app.globalData.user.email) {
        this.setData({
          phone: app.globalData.user.email,
        });
      }
    }
  },
  login() {
    // 调用云函数
    wx.cloud.callFunction({
      name: "login",
      data: {},
      success: (res) => {
        console.log("[云函数] [login]  ", res.result);
        app.globalData.openid = res.result.openid;
        app.globalData.serverConfig = res.result.config;
        this.getopeninfo();
      },
      fail: (err) => {
        console.error("[云函数] [login] 调用失败", err);
      },
    });
  },
  getopeninfo() {
    db.collection("users")
      .where({
        _openid: app.globalData.openid,
      })
      .get({
        success: (res) => {
          if (res.data.length == 0) {
          } else {
            app.globalData.user = res.data[0];
          }
        },
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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
  onSubmit(e) {
    if (!app.globalData.user) {
      return;
    }
    console.log(app.globalData.user);
    let phone = this.data.phone,
      email = this.data.email;
    let phoneReg = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
    let emailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (phone.length > 0) {
      if (!phoneReg.test(phone)) {
        wx.showToast({
          title: "手机号码有错",
          icon: "none",
          image: "",
          duration: 1500,
          mask: false,
          success: (result) => {},
          fail: () => {},
          complete: () => {},
        });
        return;
      }
    } else if (email.length > 0) {
      if (!emailReg.test(email)) {
        wx.showToast({
          title: "邮箱有误",
          icon: "none",
          image: "",
          duration: 1500,
          mask: false,
          success: (result) => {},
          fail: () => {},
          complete: () => {},
        });
        return;
      }
    }

    if (phone.length > 0 || email.length > 0) {
      let data = {};
      if (phone.length > 0) {
        data.phone = phone;
      }
      if (email.length > 0) {
        data.email = email;
      }
      let self = this;
      db.collection("users")
        .doc(app.globalData.user._id)
        .update({
          data: data,
          success: function (res) {
            console.log(res);
            console.log(self.data.back);
            app.globalData.user.phone = data.phone;
            app.globalData.user.email = data.email;

            wx.navigateBack({
              delta: 1,
            });
            // if (self.data.back == "kecheng") {
            //   wx.navigateTo({
            //     url: "../../geren/bags/bags",
            //   });
            // } else if (self.data.back == "activity") {
            //   wx.navigateTo({
            //     url: "../../geren/activity/activity",
            //   });
            // }
          },
          fail(err) {
            console.log(err);
          },
        });
    } else {
      wx.showToast({
        title: "电话和邮箱不能同时为空",
        icon: "none",
        image: "",
        duration: 1500,
        mask: false,
        success: (result) => {},
        fail: () => {},
        complete: () => {},
      });
    }
  },
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },
  onEmailInput(e) {
    this.setData({ email: e.detail.value });
  },
});
