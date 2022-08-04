// miniprogram/pages/kecheng/kecheng/kecheng.js
const app = getApp();
const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    if_buy: false,  // todo: 已付费或兔费
    is_free: false, // 这个字段真的有用吗
    kechengs: [],
    module: {},
    logged: false,
    user: {},
    schoolUser: {},
    watchType: 0,
    mid: "",
    canShow: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  tobuy: function () {
    var mid = this.data.module._id;
    wx.navigateTo({
      url: "../shop/shop?mid=" + mid,
    });
  },

  // todo: 在这里算（但是mid并没有用）
  getWatchType(mid, cid) {
    console.log(this.data)
    // debugger;
    const user = this.data.user;
    if (user.isBanned) {
      return 1; //被禁用
    } else if (user.identityType != "teacher") {
      const schoolUser = this.data.schoolUser;
      if (schoolUser.isSchoolUser) {
        let nDate = new Date().getTime();
        let iDate = new Date(schoolUser.invalid_date).getTime();
        if (iDate < nDate) {
          return 2; //学校账户已过期
        } else if (schoolUser.isTrialUser) {
          if (this.data.module.new_release) {
            return 15;  // 新课试听用户
          } else {
            return 5;   // 新用户不能听老课
          }
        } else {
          if (this.data.module.new_release) {
            return 4;   // 老用户不能听新课
          } else {
            return 11; //学校账户未过期
          }
        }
      } else {
        if (!this.data.if_buy) {
          let exp_index = this.data.module.exp_index;
          let tryId = this.data.kechengs[exp_index - 1]._id;
          // let tryId = wx.getStorageSync(mid);
          //if (tryId) {
          if (tryId == cid) {
            return 12; //个人试看
          } else {
            return 3; //个人未付费
          }
          // } else {
          //   wx.setStorageSync(mid, cid);
          //   return 12; //个人试看
          // }
        } else {
          return 13; //个人已付费
        }
      }
    } else {
      return 14; //老师，管理员
    }
  },
  towatch: function (e) {
    // debugger;
    if (this.data.logged == false || !this.data.user._openid) {
      this.getUserProfile();
    } else {
      var kid = e.currentTarget.dataset.kid;
      let type = this.getWatchType(this.data.module._id, kid);
      this.setData({
        watchType: type,
      });
      console.log("watchType:" + type);
      if (type < 10) {
        if (type == 1) {
          wx.showToast({
            title: "已被禁，请联系管理员",
            icon: "none",
          });
        } else if (type == 2) {
          wx.showToast({
            title: "学校账号已过期",
            icon: "none",
          });
        } else if (type == 3) {
          wx.showToast({
            title: app.globalData.not_buy_text,
            icon: "none",
          });
        }
        return;
      }

      // todo: 这个绝对是田！！！！！！在这里换个上帝type就畅通无阻了
      wx.navigateTo({
        url:
          "../kechengplay/kechengplay?kid=" +
          kid +
          "&mid=" +
          this.data.module._id +
          "&type=" +
          type +
          "&is_audio=" +
          this.data.module.is_audio,
      });
    }
    // if (this.data.logged == false) {
    //   wx.getUserProfile({
    //     desc: "用于完善会员资料", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    //     success: (res) => {
    //       // this.setData({
    //       //   user: res.userInfo,
    //       //   hasUserInfo: true,
    //       //   avatarUrl: res.userInfo.avatarUrl,
    //       //   logged: true,
    //       // });
    //       wx.cloud.callFunction({
    //         name: "add_user",
    //         data: {
    //           nickName: res.userInfo.nickName,
    //           avatarUrl: res.userInfo.avatarUrl,
    //         },
    //         success: (res2) => {
    //           // debugger;
    //           this.setData({
    //             user: res2.result.data[0],
    //             hasUserInfo: true,
    //             // avatarUrl: res2.userInfo.avatarUrl,
    //             logged: true,
    //           });
    //           this.getSchoolUser();
    //           wx.navigateTo({
    //             url:
    //               "../kechengplay/kechengplay?kid=" +
    //               kid +
    //               "&mid=" +
    //               this.data.module._id +
    //               "&type=" +
    //               type,
    //           });
    //         },
    //         fail: (err) => {
    //           console.error("[云函数] [add_user] 调用失败", err);
    //         },
    //       });
    //       // db.collection("users").add({
    //       //   // data 字段表示需新增的 JSON 数据
    //       //   data: {
    //       //     nickName: res.userInfo.nickName,
    //       //     avatarUrl: res.userInfo.avatarUrl,
    //       //     identityType: "student",
    //       //     isBanned: false,
    //       //   },
    //       //   success: function (res) {},
    //       // });
    //     },
    //   });
    // } else {

    // }
  },

  loadmodule: function (mid) {
    wx.showLoading({
      title: "加载中",
    });
    //db.collection("modules")
    db.collection("super_modules")
      .doc(mid)
      .get({
        success: (res) => {
          //res.data.module_suggestion = JSON.parse(res.data.module_suggestion);
          this.setData({
            module: res.data,
          });
          if (res.data.module_price <= 0) { 
            this.setData({
              if_buy: true,
              is_free: true,
            })
          }
          wx.setNavigationBarTitle({
            title: res.data.module_name + "模块",
          });
          wx.hideLoading();
        },
      });
      
  },

  loadkecheng: function (mid) {
    wx.showLoading({
      title: "加载中",
    });
    db.collection("kechengs")
      .where({
        mid: mid,
      })
      .orderBy("o_id", "asc")
      .get({
        success: (res) => {
          this.setData({
            kechengs: res.data,
          });
          wx.hideLoading();
        },
      });
  },

  loadorder: function (mid, openid) {
    console.log(mid);
    wx.showLoading({
      title: "加载中",
    });
    db.collection("orders")
      .where({
        mid: mid,
        openid: openid,
      })
      .get({
        success: (res) => {
          console.log("loadorder");
          console.log(res);
          if (res.data.length != 0) {
            this.setData({
              if_buy: true,
            });
          }
          wx.hideLoading();
        },
      });
  },

  // todo (不算todo，就是看懂了给个注释)
  // mid = module id
  // cid = kid = kecheng (course?) id
  // 这两个加载的时候就能读出来，然后传到getWatchType里计算权限type（前端校验肯定是田）
  // 最后再把mid kid type全传到kechengplay.js里，只要把type换一下就解锁了

  onLoad: function (options) {
    this.setData({
      mid: options.mid,
      canShow: !app.globalData.is_ios,
    });
    this.loadmodule(options.mid);
    this.loadkecheng(options.mid);
    //setTimeout(this.loadorder, 1000, options.mid, app.globalData.openid);
    if (!app.globalData.openid) {
      this.login();
    } else if (!app.globalData.user) {
      this.getopeninfo();
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
    setTimeout(this.loadorder, 1000, this.data.mid, app.globalData.openid);
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

  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: "用于完善会员资料", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        wx.cloud.callFunction({
          name: "add_user",
          data: {
            nickName: res.userInfo.nickName,
            avatarUrl: res.userInfo.avatarUrl,
          },
          success: (res2) => {
            app.globalData.user = res2.result.data[0];
            this.setData({
              user: res2.result.data[0],
              hasUserInfo: true,
              // avatarUrl: res2.userInfo.avatarUrl,
              logged: true,
            });
          },
          fail: (err) => {
            console.error("[云函数] [add_user] 调用失败", err);
          },
        });
      },
    });
  },

  getSchoolUser() {
    console.log("id openid");
    console.log(this.data.user._id);
    console.log(this.data.user._openid);
    if (!this.data.user._openid) {
      return;
    }
    db.collection("school")
      .where({
        bind_openid: this.data.user._openid,
      })
      .get({
        success: (res2) => {
          console.log("schoolUser:");
          console.log(res2);
          let sData = {};
          if (res2.data.length == 0) {
            sData.isSchoolUser = false;
          } else {
            sData.isSchoolUser = true;
            sData.invalid_date = res2.data[0].invalid_date;
            sData.isTrialUser = res2.data[0].is_trial;
          }
          this.setData({
            schoolUser: sData,
          });
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
            console.log(232);
            this.setData({
              logged: false,
            });
          } else {
            console.log(2222);
            this.setData({
              logged: true,
              user: res.data[0],
            });
            this.getSchoolUser();
          }
        },
      });
  },

  toshiting: function () {
    if (this.data.logged == false || !this.data.user._openid) {
      this.getUserProfile();
    } else {
      // var kid = wx.getStorageSync(this.data.module._id);
      // console.log("try mid:" + this.data.module._id);
      // console.log("try kid:" + kid);
      // if (!kid || kid.trim().length == 0) {
      //   if (this.data.module._id == "b00064a760f067ea27a24ad27e1758f6") {
      //     kid = this.data.kechengs[1]._id;
      //   } else {
      //     kid = this.data.kechengs[0]._id;
      //   }
      //   wx.setStorageSync(this.data.module._id, kid);
      // }
      let exp_index = this.data.module.exp_index;
      let kid = this.data.kechengs[exp_index - 1]._id;
      let type = this.getWatchType(this.data.module._id, kid);
      this.setData({
        watchType: type,
      });
      console.log("watchType:" + type);
      if (type < 10) {
        if (type == 1) {
          wx.showToast({
            title: "已被禁，请联系管理员",
            icon: "none",
          });
        } else if (type == 2) {
          wx.showToast({
            title: "学校账号已过期",
            icon: "none",
          });
        } else if (type == 4) {
          wx.showToast({
            title: "新课程暂未解锁",
            icon: "none",
          });
        } else if (type == 5) {
          wx.showToast({
            title: "老课程暂未开放",
            icon: "none",
          });
        } else {
          return;
        }
      }
      wx.navigateTo({
        url:
          "../kechengplay/kechengplay?kid=" +
          kid +
          "&mid=" +
          this.data.module._id +
          "&type=" +
          type,
      });
    }
    // if (this.data.logged == false) {
    //   wx.getUserProfile({
    //     desc: "用于完善会员资料", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    //     success: (res) => {
    //       wx.cloud.callFunction({
    //         name: "add_user",
    //         data: {
    //           nickName: res.userInfo.nickName,
    //           avatarUrl: res.userInfo.avatarUrl,
    //         },
    //         success: (res2) => {
    //           this.setData({
    //             user: res2.result.data[0],
    //             hasUserInfo: true,
    //             // avatarUrl: res2.userInfo.avatarUrl,
    //             logged: true,
    //           });
    //           this.getSchoolUser();
    //           console.log(res);
    //           wx.navigateTo({
    //             url:
    //               "../kechengplay/kechengplay?kid=" +
    //               kid +
    //               "&mid=" +
    //               this.data.module._id +
    //               "&type=" +
    //               type,
    //           });
    //         },
    //         fail: (err) => {
    //           console.error("[云函数] [add_user] 调用失败", err);
    //         },
    //       });
    //     },
    //   });
    // }
  },
  toshuati1: function (e) {
    console.log("toshuati1");
    console.log(e);
    var mname = this.data.module.module_name;
    wx.navigateTo({
      // url: "../../tianwen/shuati/shuati",
      url: "../../tianwen/shuati/shuati?type=" + mname + "&order=0",
    });
  },

  toshuati2: function (e) {
    var mname = this.data.module.module_name;

    const user = this.data.user;
    if (user.isBanned) {
      wx.showToast({
        title: "已被禁，请联系管理员",
        icon: "none",
      });
      return;
    } else if (user.identityType != "teacher") {
      const schoolUser = this.data.schoolUser;
      if (schoolUser.isSchoolUser) {
        let nDate = new Date().getTime();
        let iDate = new Date(schoolUser.invalid_date).getTime();
        if (iDate < nDate) {
          wx.showToast({
            title: "学校账号已过期",
            icon: "none",
          });
          return;
        }
      } else {
        if (!this.data.if_buy) {
          wx.showToast({
            title: app.globalData.not_buy_text,
            icon: "none",
          });
          return;
        }
      }
    }

    console.log("toshuati2");
    console.log(e);
    wx.navigateTo({
      url: "../../tianwen/shuati/shuati?type=" + mname + "&order=1",
    });
  },
});
