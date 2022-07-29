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

    kechengs: [],
    orders: [],
    modules: [],
    tips: "",

    showEditor: false,
    commentText: "",
    comment_mid: "",
    cantsubmit: true,
  },
  getmodules: function () {
    this.setData({
      modules: [],
    });

    wx.showLoading({
      title: "加载课程中",
    });
    var ms = [];
    let self = this;
    // 调用云函数
    wx.cloud.callFunction({
      name: "findkechengs",
      data: {
        uid: app.globalData.openid,
      },
      success: (res) => {
        console.log("[云函数] [findkechengs] mlist: ", res.result);

        for (var i = 0; i < res.result.list.length; i++) {
          let module = res.result.list[i].mlist[0];
          module.invoiceState = 1;
          module.invoiceText = "申请开票";
          ms.push(module);
        }
        for (let i = 0; i < ms.length; i++) {
          let item = ms[i];
          if (!item.module_class) {
            item.module_class = "天文课程";
          }
          if (!item.abbr_name) {
            let name = item.module_name;
            let names = name.split("(")[0].split("（");
            item.abbr_name = names[0];
          }
        }

        self.setData({
          modules: ms,
        });
        self.getOrders();
        wx.hideLoading({
          success: (res) => {},
        });
        console.log(self.data.modules);
        if (self.data.modules.length == 0) {
          console.log(1);
          self.setData({
            tips: "暂未购买课程",
          });
        }
      },
      fail: (err) => {
        console.error("[云函数] [findkechengs] 调用失败", err);
      },
    });
  },
  test() {},
  getOrders() {
    let modules = this.data.modules;
    let self = this;
    for (let i = 0; i < modules.length; i++) {
      let module = modules[i];
      wx.cloud.callFunction({
        name: "getOrder",
        data: {
          uid: app.globalData.openid,
          mid: module._id,
        },
        success: (res) => {
          console.log("[云函数] [getOrder] mlist: ", res.result);
          if (res.result.data.length > 0) {
            let order = res.result.data[0];
            // if (order.invoiceState) {
            //   module.invoiceState = order.invoiceState;
            //   this.setData({ modules: this.data.modules });
            // }
            module.orderid = order._id;
            module.totalFee = order.totalFee;
            db.collection("fapiao")
              .where({ orderid: order._id })
              .limit(1)
              .get({
                success(res2) {
                  console.log(res2);
                  if (res2.data.length == 0) {
                    module.invoiceState = 0;
                    module.invoiceText = "申请开票";
                    self.setData({ modules: self.data.modules });
                  } else {
                    let invoiceState = res2.data[0].invoiceState;
                    module.invoiceState = invoiceState;
                    if (invoiceState == 1) {
                      module.invoiceText = "正在开票";
                    } else if (invoiceState == 2) {
                      module.invoiceText = "已开发票";
                    } else {
                      module.invoiceText = "申请开票";
                    }
                    self.setData({ modules: self.data.modules });
                  }
                  // console.log(self.data.modules);
                },
                fail(err) {
                  console.log(err);
                },
              });
          }
        },
        fail: (err) => {
          console.error("[云函数] [getOrder] 调用失败", err);
        },
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
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
    this.getmodules();
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
    let mid = e.target.dataset.id;
    let module = this.findModule(mid);
    let name = module.module_class;
    let title =
      "我已购买" +
      name +
      "，用物理学阐释宇宙，课程由天文奥赛国际赛金银牌获奖者研发";
    return {
      title: title,
      path: "pages/kecheng/kecheng/kecheng?mid=" + mid,
    };
  },
  onComment(e) {
    console.log(e);
    this.setData({
      showEditor: true,
      comment_mid: e.currentTarget.dataset.id,
      cantsubmit: true,
    });
  },
  onBack(e) {
    this.setData({ showEditor: false, commentText: "" });
  },
  // currenttime: function (d) {
  //   var str = "";
  //   //str += d.getFullYear() + '年'; //获取当前年份
  //   str += d.getMonth() + 1 + "-"; //获取当前月份（0——11）
  //   str += d.getDate() + " ";
  //   if (parseInt(d.getDate()) < 10) {
  //     str += "0" + d.getHours() + ":";
  //   } else {
  //     str += d.getHours() + ":";
  //   }
  //   if (parseInt(d.getMinutes()) < 10) {
  //     str += "0" + d.getMinutes() + "";
  //   } else {
  //     str += d.getMinutes() + "";
  //   }
  //   //str += d.getSeconds() + '秒';
  //   console.log(str);
  //   return str;
  // },
  // onEditorReady() {
  //   const that = this;
  //   wx.createSelectorQuery()
  //     .select("#editor")
  //     .context(function (res) {
  //       that.editorCtx = res.context;
  //     })
  //     .exec();
  // },
  // onStatusChange(e) {
  //   const formats = e.detail;
  //   this.setData({ formats });
  // },

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
      comment_time: new Date().getTime(),
      mid: this.data.comment_mid,
      comment_text: this.data.commentText,
      is_delete: false,
      //_id: time,
      love: 0,
    };
    let self = this;
    db.collection("comments1").add({
      data: data,
      success(res) {
        console.log(res);
        self.setData({ showEditor: false, commentText: "" });
        self.sendAdminMessage({
          text: "有用户发表了课程评论",
          aid: self.data.comment_mid,
          path: "pages/kecheng/kecheng/kecheng?mid="+self.data.comment_mid,
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
  onStudy(e) {
    console.log(e);
    let mid = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "../../kecheng/kecheng/kecheng?mid=" + mid,
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
    let mid = e.currentTarget.dataset.id;
    let module = this.findModule(mid);
    let orderid = module.orderid;
    wx.navigateTo({
      url:
        "../../geren/fapiao/fapiao?type=kecheng&orderid=" +
        orderid +
        "&price=" +
        module.totalFee,
    });
    return;
  },
  findModule(id) {
    for (let i = 0; i < this.data.modules.length; i++) {
      let module = this.data.modules[i];
      if (module._id == id) {
        return module;
      }
    }
  },
});
