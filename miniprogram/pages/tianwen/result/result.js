// miniprogram/pages/tianwen/result/result.js
const app = getApp();
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    toptypes: [],
    type: "success",
    title: "",
    tip: "",
    wrong_num: 0,
    right_num: 0,
    rate: 100,
    grade: 0,
    all_garde: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //
    console.log(app.globalData.wrong_question_array);
    console.log(app.globalData.sorttype);
    this.setData({
      wrong_array: app.globalData.wrong_question_array,
      grade: app.globalData.kou_num,
      all_garde: app.globalData.all_num,
    });
    app.globalData.sorttype.splice(3);
    var toptypes = app.globalData.sorttype;
    if (toptypes[2].num == 0) {
      toptypes.splice(2);
    }
    if (toptypes[1].num == 0) {
      toptypes.splice(1);
    }
    if (toptypes[0].num == 0) {
      toptypes = [];
    }

    this.setData({
      toptypes: toptypes,
    });
  },

  onReturn: function () {
    wx.navigateBack({
      delta: 1,
    });
  },

  onNewtest: function () {
    //清空wrong array
    app.globalData.wrong_question_array = [];
    //跳转
    wx.redirectTo({
      url: "../shuati/shuati",
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
  onUnload: function () {
    app.globalData.wrong_question_array = [];
  },

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

  tocuotiben: function (e) {
    var cuos = app.globalData.wrong_question_array;
    var index = cuos.findIndex(
      (index) => index._id === e.currentTarget.dataset.q._id
    );
    cuos[index].download = true;
    this.setData({
      wrong_array: cuos,
    });
    wx.showToast({
      title: "添加成功",
    });

    let time = new Date().getTime().toString();
    db.collection("cuotiben").add({
      data: {
        _id:
          e.currentTarget.dataset.q._id.slice(25) +
          app.globalData.openid.slice(20), // +
        //   time.slice(6),
        mid: app.globalData.mid,
        // _openid: app.globalData.openid,
        wrong_answer: e.currentTarget.dataset.q,
      },
      success: (res) => {},
    });
  },

  tobuy: function () {
    console.log(app.globalData.mid);
    wx.redirectTo({
      url: "../../kecheng/kecheng/kecheng?mid=" + app.globalData.mid,
    });
  },
});
