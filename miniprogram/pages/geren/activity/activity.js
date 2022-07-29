// miniprogram/pages/geren/bags/bags.js
const app = getApp();
const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    safeHeight: 0,
    toolBarHeight: 50,

    activityList: [],
    tips: "",

    showEditor: false,
    commentText: "",
    comment_aid: "",
    cantsubmit: true,
  },
  searchActivity() {
    this.setData({ activityList: [] });
    let self = this;
    wx.cloud.callFunction({
      name: "searchActivity",
      data: {
        searchOrdered: true,
        tags: [],
      },
      success(res) {
        console.log(res);
        var ms = [];
        for (var i = 0; i < res.result.data.length; i++) {
          let module = res.result.data[i];
          module.invoiceState = 1;
          module.invoiceText = "申请开票";
          module.refundState = 1;
          module.refundText = "申请退款";

          ms.push(module);
        }
        self.setData({ activityList: ms });
        if (res.result.data.length == 0) {
          self.setData({ tips: "没有购买过的活动订单" });
        }
        self.getOrders();
      },
      fail(err) {
        console.log(err);
      },
    });
  },

  getOrders() {
    let modules = this.data.activityList;
    let self = this;
    for (let i = 0; i < modules.length; i++) {
      let module = modules[i];
      let order = module.order;
      module.orderid = order._id;
      module.totalFee = order.price;
      module.refundState = order.refundState;

      if (module.refundState == 4) {
        module.refundText = "退款失败";
      } else if (module.refundState == 3) {
        module.refundText = "退款成功";
      } else if (module.refundState == 2) {
        module.refundText = "审核通过";
      } else if (module.refundState == 1) {
        module.refundText = "正在退款";
      } else {
        module.refundText = "申请退款";
      }
      db.collection("fapiao")
        .where({ orderid: order._id })
        .limit(1)
        .get({
          success(res2) {
            console.log(res2);
            if (res2.data.length == 0) {
              module.invoiceState = 0;
              module.invoiceText = "申请开票";
              self.setData({ activityList: self.data.activityList });
            } else {
              let invoiceState = res2.data[0].invoiceState;
              module.invoiceState = invoiceState;
              if (invoiceState == 1) {
                module.invoiceText = "正在开票";
              } else if (invoiceState == 2) {
                module.invoiceText = "已经开票";
              } else {
                module.invoiceText = "正在开票";
              }
              self.setData({ activityList: self.data.activityList });
            }
            // console.log(self.data.modules);
          },
          fail(err) {
            console.log(err);
          },
        });
    }
  },

  onLoad: function (options) {
    if (!app.globalData.openid) {
      this.login();
    } else if (!app.globalData.user) {
      this.getopeninfo();
    }

    const { platform, safeArea, model, screenHeight } = wx.getSystemInfoSync();
    let safeHeight;
    if (safeArea) {
      safeHeight = screenHeight - safeArea.bottom;
    } else {
      safeHeight = 32;
    }
    this._safeHeight = safeHeight;
    let isIOS = platform === "ios";
    this.setData({
      isIOS,
      safeHeight,
      toolBarHeight: isIOS ? safeHeight + 50 : 50,
    });
    const that = this;
    this.updatePosition(0);
    let keyboardHeight = 0;
    wx.onKeyboardHeightChange((res) => {
      if (res.height === keyboardHeight) {
        return;
      }
      const duration = res.height > 0 ? res.duration * 1000 : 0;
      keyboardHeight = res.height;
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight);
            that.editorCtx.scrollIntoView();
          },
        });
      }, duration);
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
          console.log(res);
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
  onShow: function () {
    // this.login();
    // this.getmodules();
    this.searchActivity();
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

  onShareAppMessage: function (e) {
    console.log(e);
    let aid = e.target.dataset.id;
    let activity = this.findModule(aid);
    let title = activity.shareTitle
      ? activity.shareTitle
      : "我已购买" + actvity.name;
    return {
      title: title,
      path: "pages/activity/detail/detail?activity_id=" + activity._id,
    };
  },
  onComment(e) {
    console.log(e);
    this.setData({
      showEditor: true,
      comment_aid: e.currentTarget.dataset.id,
      cantsubmit: true,
    });
  },
  onBack(e) {
    this.setData({ showEditor: false, commentText: "" });
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
  onSubmit(e) {
    let data = {
      time: new Date().getTime(),
      aid: this.data.comment_aid,
      text: this.data.commentText,
      is_delete: false,
      //_id: time,
      love: 0,
    };
    let self = this;
    db.collection("order_comment").add({
      data: data,
      success(res) {
        console.log(res);
        self.setData({ showEditor: false, commentText: "" });
        self.sendAdminMessage({
          text: "有用户发表了活动评论",
          aid: self.data.comment_aid,
          path: "pages/activity/detail/detail?activity_id=" + self.data.comment_aid,
        });
      },
      fail(err) {
        console.log(err);
      },
    });
  },
  onInput(e) {
    console.log(e);
    console.log(e.detail.text.length);
    this.setData({
      commentText: e.detail.text,
    });
    if (e.detail.text.length != 1 && e.detail.text.length != 0) {
      this.setData({
        cantsubmit: false,
      });
    } else {
      this.setData({
        cantsubmit: true,
      });
    }
  },
  onRefund(e) {
    console.log(e);
    // let mid = e.currentTarget.dataset.id;
    // wx.navigateTo({
    //   url: "../../kecheng/kecheng/kecheng?mid=" + mid,
    // });
    let oid = e.currentTarget.dataset.oid;
    let self = this;
    wx.cloud.callFunction({
      name: "refundActivity",
      data: {
        refundTime: new Date().getTime(),
        id: oid,
      },
      success(res) {
        console.log(res);
        self.sendAdminMessage({
          text: "有用户需要退款",
          aid: oid,
        });
      },
      fail(err) {
        console.log(err);
      },
      complete() {
        self.searchActivity();
      },
    });
  },
  updatePosition(keyboardHeight) {
    const toolbarHeight = 50;
    const { windowHeight, platform } = wx.getSystemInfoSync();
    let editorHeight =
      keyboardHeight > 0
        ? windowHeight - keyboardHeight - toolbarHeight
        : windowHeight;
    if (keyboardHeight === 0) {
      this.setData({
        editorHeight,
        keyboardHeight,
        toolBarHeight: this.data.isIOS ? 50 + this._safeHeight : 50,
        safeHeight: this._safeHeight,
      });
    } else {
      this.setData({
        editorHeight,
        keyboardHeight,
        toolBarHeight: 50,
        safeHeight: 0,
      });
    }
  },
  onInvoice(e) {
    console.log(e);
    // wx.chooseInvoiceTitle({
    //   success(res) {},
    // });
    // return;
    let oid = e.currentTarget.dataset.oid;
    console.log(oid);
    let actvity = this.findActivityByOrderId(oid);
    wx.navigateTo({
      url:
        "../../geren/fapiao/fapiao?type=huodong&orderid=" +
        oid +
        "&price=" +
        actvity.totalFee,
    });
    return;
  },
  findModule(id) {
    for (let i = 0; i < this.data.activityList.length; i++) {
      let module = this.data.activityList[i];
      if (module._id == id) {
        return module;
      }
    }
  },
  findActivityByOrderId(oid) {
    for (let i = 0; i < this.data.activityList.length; i++) {
      let module = this.data.activityList[i];
      if (module.orderid == oid) {
        return module;
      }
    }
  },
});
