// pages/activity/detail.js
const app = getApp();
const db = wx.cloud.database();
const util = require("../../../utils/util.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    activity: {},
    tabs: [
      {
        title: "详情",
      },
      {
        title: "评价",
      },
      {
        title: "用户提问",
      },
    ],
    activeTab: 0,
    loginVisible: true,
    askInput: "",
    commentInput: "",
    // scrollViewHeight0: 0,
    // scrollViewHeight1: 0,
    // scrollViewHeight2: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(util);
    let id = options.activity_id;
    this.getDetail(id);
    //wx.hideTabBar({});
    if (!app.globalData.openid) {
      this.login();
    } else if (!app.globalData.user) {
      this.getopeninfo();
    }
    // const sysInfo = wx.getSystemInfoSync();
    // console.log(sysInfo);
    // const safeArea = sysInfo.safeArea;
    // let usedHeight = 600;
    // let height = (safeArea.height / safeArea.width) * 750;
    // let restHeight = height - usedHeight;
    // this.setData({ scrollViewHeight0: restHeight });
    // this.setData({ scrollViewHeight1: restHeight - 170 });
    // this.setData({ scrollViewHeight2: restHeight - 170 });
    // console.log(this.data.scrollViewHeight0);
    // console.log(this.data.scrollViewHeight1);
    // console.log(this.data.scrollViewHeight2);
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
  onHide: function () {
    //wx.showTabBar({});
  },

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
  onShareAppMessage: function () {
    return {
      title: this.data.activity.shareTitle
        ? this.data.activity.shareTitle
        : this.data.activity.name,
      path:
        "pages/activity/detail/detail?activity_id=" + this.data.activity._id,
    };
  },
  onTabClick(e) {},
  getDetail(id) {
    let self = this;
    console.log(id);
    wx.cloud.callFunction({
      name: "searchActivity",
      data: {
        aid: id,
        tags: [],
        withExtra: true,
      },
      success(res) {
        console.log(res);
        let activity = res.result.data[0];
        if (activity) {
          let comments = activity.comments;
          if (comments) {
            for (let i = 0; i < comments.length; i++) {
              let comment = comments[i];
              comment.time = util.formatTimeV2(comment.time);
              comment.user = comment.userList[0];
            }
          }
          let asks = activity.asks;
          if (asks) {
            for (let i = 0; i < asks.length; i++) {
              let ask = asks[i];
              ask.time = util.formatTimeV2(ask.time);
              ask.reply_time &&
                (ask.reply_time = util.formatTimeV2(ask.reply_time));
              ask.user = ask.userList[0];
              ask.replies = [];
              if (ask.reply_text && ask.reply_text.length > 0) {
                ask.replies.push({
                  user: ask.replyList[0],
                  time: ask.reply_time,
                  text: ask.reply_text,
                });
              }
            }
          }
        }
        self.setData({
          activity: res.result.data[0],
        });
        wx.setNavigationBarTitle({
          title: self.data.activity.name,
        });
      },
      fail(res) {
        console.log(res);
      },
    });
  },
  onSave(e) {
    console.log(e);
    // debugger;
    if (app.globalData.user) {
      // wx.cloud.callFunction({
      //   name: "sendMessage",
      //   data: {},
      //   success(res) {
      //     console.log(res);
      //   },
      //   fail(error) {
      //     console.log(error);
      //   },
      // });
      let data = {
        aid: e.currentTarget.dataset.id,
      };
      db.collection("saved_activity")
        .where({ _openid: app.globalData.openid, aid: data.aid })
        .get({
          success(res) {
            console.log(res);
            if (res.data.length == 0) {
              db.collection("saved_activity").add({
                data: data,
                success(res) {
                  console.log(res);
                  wx.showToast({
                    title: "收藏成功",
                  });
                },
              });
            } else {
              wx.showToast({
                title: "已收藏",
              });
            }
          },
          fail(err) {
            console.log(err);
          },
        });
    } else {
      this.getUserProfile();
    }
  },
  onBuy(e) {
    console.log(e);
    if (app.globalData.user) {
      wx.showLoading({
        title: "支付请求中",
      });

      let aid = e.currentTarget.dataset.id;
      let savedCity = wx.getStorageSync("city");
      let self = this;
      wx.cloud.callFunction({
        name: "pay2",
        data: {
          aid: aid,
          body: e.currentTarget.dataset.name,
          sid: "sub_class1",
          amount: 1,
          nickName: "小学生",
          phone: 13810599490,
          city: savedCity ? savedCity.name : "无",
          createTime: new Date().getTime(),
          //openid: app.globalData.openid,
          price: e.currentTarget.dataset.price,
        },
        success: (res) => {
          wx.hideLoading();
          console.log(res);
          const payment = res.result.payment;
          console.log(payment);
          wx.requestPayment({
            ...payment,
            success(res) {
              console.log("pay success", res);
              wx.showLoading({
                title: "支付成功，正在跳转",
              });
              setTimeout(() => {
                wx.hideLoading();
              }, 3000);
              wx.navigateBack();
            },
            fail(err) {
              console.error("pay fail", err);
            },
          });
        },
        fail: console.error,
      });
    } else {
      this.getUserProfile();
    }
  },
  // onShare(e) {
  //   let id = e.currentTarget.dataset.id;
  //   if (app.globalData.user) {
  //     if (id) {
  //       wx.showShareMenu({
  //         withShareTicket: true,
  //         menus: ["shareAppMessage", "shareTimeline"],
  //       });
  //     }
  //   } else {
  //     this.getUserProfile();
  //   }
  // },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
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
  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value });
  },
  onAskInput(e) {
    this.setData({ askInput: e.detail.value });
  },
  sendAdminMessage(param) {
    wx.cloud.callFunction({
      name: "sendAdminMessage",
      data: param,
      success: (res) => {
        console.log("[云函数] [sendAdminMessage]", res);
      },
      fail: (err) => {
        console.error("[云函数] [sendAdminMessage] 调用失败", err);
      },
    });
  },
  onAsk(e) {
    if (this.data.askInput.length > 0) {
      console.log(this.data.askInput);
      let self = this;
      db.collection("order_ask").add({
        data: {
          is_delete: false,
          aid: self.data.activity._id,
          text: self.data.askInput,
          time: new Date().getTime(),
          love: 0,
        },
        success(res) {
          console.log(res);
          self.getDetail(self.data.activity._id);
          self.setData({ askInput: "" });
          self.sendAdminMessage({
            text: "有用户发表了活动提问",
            aid: self.data.activity._id,
            path: "pages/activity/detail/detail?activity_id=" + self.data.activity._id,
          });
        },
        fail(err) {
          console.log(err);
        },
      });
    }
  },
  onComment(e) {
    if (this.data.commentInput.length > 0) {
      let self = this;
      console.log(this.data.commentInput);
      db.collection("order_comment").add({
        data: {
          is_delete: false,
          aid: self.data.activity._id,
          text: self.data.commentInput,
          time: new Date().getTime(),
          love: 0,
        },
        success(res) {
          console.log(res);
          self.getDetail(self.data.activity._id);
          self.setData({ commentInput: "" });
          self.sendAdminMessage({
            text: "有用户发表了活动评论",
            aid: self.data.activity._id,
            path: "pages/activity/detail/detail?activity_id=" + self.data.activity._id,
          });
        },
        fail(err) {
          console.log(err);
        },
      });
    }
  },
});
