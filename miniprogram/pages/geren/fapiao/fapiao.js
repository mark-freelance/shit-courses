// miniprogram/pages/geren/fapiao/fapiao.js
const app = getApp();
const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    fapiao: {},
    taitou: "",
    shuihao: "",
    jine: "",
    youxiang: "",
    dianhua: "",
    disabled: false,
    orderid: "",
    type: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    if (options.orderid) {
      this.setData({ orderid: options.orderid });
    }
    if (options.price) {
      this.setData({ jine: options.price });
    }
    if (options.type) {
      this.setData({ type: options.type });
    }
  },

  togetfapiao: function () {
    let that = this;
    wx.getSetting({
      success(res) {
        if (res.authSetting["scope.invoiceTitle"]) {
          wx.chooseInvoiceTitle({
            success(res) {
              if (res) {
                let getCode = res.type;
                if (getCode == 1) {
                  //个人
                  that.setData({
                    fapiao: res,
                    personName: res.title,
                    isPeople: true,
                    isCompany: false,
                    isActive: 0,
                    shuihao: res.taxNumber,

                    taitou: res.title,
                  });
                } else if (getCode == 0) {
                  //单位

                  that.setData({
                    fapiao: res,
                    companyAdress: res.companyAddress,

                    shuihao: res.taxNumber,

                    taitou: res.title,

                    companyBank: res.bankName,

                    companyBankaccount: res.bankAccount,

                    isPeople: false,

                    isCompany: true,
                  });
                }
              }
            },
          });
          console.log(that.data.fapiao);
        } else {
          if (res.authSetting["scope.invoiceTitle"] == false) {
            wx.openSetting({
              success(res) {
                console.log(res.authSetting);
              },
            });
          } else {
            wx.chooseInvoiceTitle({
              success(res) {
                if (res) {
                  let getCode = res.type;

                  if (getCode == 1) {
                    //个人

                    that.setData({
                      personName: res.title,

                      isPeople: true,
                      fapiao: res,
                      isCompany: false,
                      shuihao: res.taxNumber,

                      taitou: res.title,
                    });
                  } else if (getCode == 0) {
                    //单位

                    that.setData({
                      companyAdress: res.companyAddress,

                      companyCode: res.taxNumber,

                      companyName: res.title,
                      fapiao: res,
                      companyBank: res.bankName,
                      shuihao: res.taxNumber,

                      taitou: res.title,
                      companyBankaccount: res.bankAccount,

                      isPeople: false,

                      isCompany: true,
                    });
                  }
                }
              },

              fail: function () {
                wx.showToast({
                  title: "请打开发票抬头权限后重试",

                  icon: "none",

                  duration: 2000,
                });
              },
            });
          }
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

  bindinputA: function (e) {
    this.setData({
      taitou: e.detail.value,
    });
  },
  bindinputB: function (e) {
    this.setData({
      shuihao: e.detail.value,
    });
  },
  bindinputC: function (e) {
    this.setData({
      jine: e.detail.value,
    });
  },
  bindinputD: function (e) {
    this.setData({
      youxiang: e.detail.value,
    });
  },
  bindblurD: function (e) {
    // var email = this.data.youxiang;
    // var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    // if (reg.test(email)) {
    //   wx.showToast({
    //     title: "邮箱格式错误",
    //     icon: "error",
    //   });
    // } else {
    // }
  },
  bindinputE: function (e) {
    this.setData({
      dianhua: e.detail.value,
    });
  },

  submit: function (e) {
    let shuihao = this.data.shuihao;
    let taitou = this.data.taitou;
    let dianhua = this.data.dianhua;
    let youxiang = this.data.youxiang;
    let orderid = this.data.orderid;
    let phoneReg = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
    let emailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    let errMsg = "";
    if (!orderid || orderid.length == 0) {
      errMsg = "查询订单失败";
    } else if (!taitou || taitou.length == 0) {
      errMsg = "请输入抬头";
    } else if (!shuihao || shuihao.length == 0) {
      errMsg = "请输入税号";
    } else if (!youxiang || !emailReg.test(youxiang)) {
      errMsg = "邮箱格式不正确";
    } else if (!dianhua || !phoneReg.test(dianhua)) {
      errMsg = "手机号不正确";
    }
    if (errMsg.length > 0) {
      wx.showToast({
        icon: "none",
        title: errMsg,
      });
      return;
    }

    this.setData({
      disabled: true,
    });

    wx.cloud.callFunction({
      name: "requestInvoice",
      data: {
        //_openid: app.globalData.openid,
        orderid: orderid,
        taitou: taitou,
        shuihao: shuihao,
        jine: this.data.jine,
        youxiang: youxiang,
        dianhua: dianhua,
        invoiceState: 1,
        type: this.data.type,
      },
      success: (res) => {
        console.log(res);
        wx.showToast({
          icon: "none",
          title: "申请成功,正在跳转",
          duration: 3000,
        });
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
          });
        }, 3000);
      },
      fail: (err) => {
        console.log(err);
        this.setData({
          disabled: false,
        });
      },
    });
    // var date = new Date();

    // db.collection("fapiao").add({
    //   data: {
    //     //_openid: app.globalData.openid,
    //     orderid: orderid,
    //     taitou: taitou,
    //     shuihao: shuihao,
    //     jine: this.data.jine,
    //     youxiang: youxiang,
    //     dianhua: dianhua,
    //     invoiceState: 1,
    //     type: this.data.type,
    //   },
    //   success: (res) => {
    //     console.log(res);
    //     wx.showToast({
    //       icon: "none",
    //       title: "申请成功,正在跳转",
    //       duration: 3000,
    //     });
    //     setTimeout(() => {
    //       wx.navigateBack({
    //         delta: 1,
    //       });
    //     }, 3000);
    //   },
    //   fail: (err) => {
    //     this.setData({
    //       disabled: false,
    //     });
    //   },
    // });
  },

  loadorders: function (e) {
    db.collection("orders")
      .where({
        openid: app.globalData.openid,
      })
      .get({});
  },
});
