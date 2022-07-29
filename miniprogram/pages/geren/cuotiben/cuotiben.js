// miniprogram/pages/geren/cuotiben/cuotiben.js
const app = getApp();
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    cuotis: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadcuoti();
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

  loadcuoti: function () {
    wx.cloud.callFunction({
      name: "findcuoti",
      data: {
        uid: app.globalData.openid,
      },
      success: (res) => {
        console.log("[云函数] [findasks]", res);
        this.setData({
          cuotis: res.result.cuoti,
        });
        console.log(this.data.cuotis);
      },
      fail: (err) => {
        console.error("[云函数] [findasks] 调用失败", err);
      },
    });
  },

  todelete: function (e) {
    console.log(e);
    db.collection("cuotiben")
      .doc(e.currentTarget.dataset.q._id)
      .remove()
      .then(console.log)
      .catch(console.error);

    var cuotis = this.data.cuotis;
    var index = cuotis.findIndex(
      (i) => i._id === e.currentTarget.dataset.q._id
    );
    cuotis.splice(index, 1);
    this.setData({
      cuotis: cuotis,
    });
  },
  tolearn(e) {
    if (e.currentTarget.dataset.q.mid) {
      app.globalData.mid = e.currentTarget.dataset.q.mid;
      wx.redirectTo({
        url: "../../kecheng/kecheng/kecheng?mid=" + app.globalData.mid,
      });
    }
  },
});
