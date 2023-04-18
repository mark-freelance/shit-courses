// miniprogram/pages/geren/bags/bags.js
const app = getApp();
const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // editorHeight: 300,
    // keyboardHeight: 0,
    // isIOS: false,
    // safeHeight: 0,
    // toolBarHeight: 50,
    activityList: [],
    // kechengs: [],
    // orders: [],
    // modules: [],
    tips: "",

    // showEditor: false,
    // commentText: "",
    // comment_mid: "",
    // cantsubmit: true,
  },
  onLoad: function (options) {
    if (!app.globalData.openid) {
      this.login();
    } else if (!app.globalData.user) {
      this.getopeninfo();
    }
    this.searchActivity();
  },

  onActivityDetail(e) {
    let id = e.currentTarget.dataset.id;
    console.log(id);
    wx.navigateTo({
      url: "../../activity/detail/detail?activity_id=" + id,
    });
  },
  onLongPress: function (e) { 
    let id = e.currentTarget.dataset.id;
    let self = this;
    wx.showModal({ //使用模态框提示用户进行操作
      title:'警告',
      content:'确定删除这个活动吗？',
      success:function(res){
        if(res.confirm){ //判断用户是否点击了确定
          /*
          db.collection("saved_activity").where({ _openid: app.globalData.user._openid, aid: id}).update({
            data: { isDelete: true }, success: function (res) { 
              console.log("success");
              self.searchActivity();
          }})
          */
          db.collection("saved_activity").where({ _openid: app.globalData.user._openid, aid: id}).remove({
            success: function(res){
              self.searchActivity();
            }
          });
        }
      }
    })
  },
  /*
  searchActivity() {
    let self = this;
    wx.cloud.callFunction({
      name: "searchActivity",
      data: {
        searchSaved: true,
        tags: [],
      },
      success(res) {
        console.log(res);
        self.setData({ activityList: res.result.data });
        if (res.result.data.length == 0) {
          self.setData({ tips: "没有收藏的活动" });
        }
      },
      fail(err) {
        console.log(err);
      },
    });
  },
  */
  searchActivity() {
    let self = this;
    db.collection("saved_activity")
      .where({ _openid: app.globalData.openid})
      .get({
        success(res) {
          let aid_list = Array();
          for(var a in res.data){
            aid_list.push(res.data[a].aid);
          }
          //console.log(aid_list);
          db.collection("activity")
            .where({_id:db.command.in(aid_list) })
            .get({
              success(res_act){
                //console.log(res_act.data);
                self.setData({ activityList: res_act.data });
                if (res_act.data.length == 0) {
                  self.setData({ tips: "没有收藏的活动" });
                }
              }
            })
        },
        fail(err) {
          console.log(err);
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

  onShareAppMessage: function (e) { },
});
