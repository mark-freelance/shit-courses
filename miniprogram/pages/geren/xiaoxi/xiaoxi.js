// miniprogram/pages/geren/xiaoxi/xiaoxi.js
const app = getApp();
const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    asks2: [],
    asks1: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadtixing();
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
  currenttime: function (d) {
    var str = "";
    //str += d.getFullYear() + '年'; //获取当前年份
    str += d.getMonth() + 1 + "-"; //获取当前月份（0——11）
    str += d.getDate() + " ";
    if (parseInt(d.getDate()) < 10) {
      str += "0" + d.getHours() + ":";
    } else {
      str += d.getHours() + ":";
    }
    if (parseInt(d.getMinutes()) < 10) {
      str += "0" + d.getMinutes() + "";
    } else {
      str += d.getMinutes() + "";
    }
    //str += d.getSeconds() + '秒';
    console.log(str);
    return str;
  },
  loadtixing: function () {
    wx.cloud.callFunction({
      name: "findtixing",
      data: {
        uid: app.globalData.openid,
      },
      success: (res) => {
        console.log("[云函数] [findasks]", res);
        
        if(!res.result) return; // suppress bug of `ask2 of null`
        
        if (res.result.asks2 && res.result.asks2.length > 0) {
          let asks2 = res.result.asks2;
          for (let i = 0; i < asks2.length; i++) {
            asks2[i].create_time = this.currenttime(
              new Date(asks2[i].create_time)
            );
          }
          this.setData({
            asks2: asks2,
          });
        }
        if (res.result.asks1 && res.result.asks1.length > 0) {
          let asks1 = res.result.asks1;
          for (let i = 0; i < asks1.length; i++) {
            asks1[i].create_time = this.currenttime(
              new Date(asks1[i].create_time)
            );
          }
          this.setData({
            asks1: asks1,
          });
        }
        console.log(this.data.asks2);
        console.log(this.data.asks1);
      },
      fail: (err) => {
        console.error("[云函数] [findasks] 调用失败", err);
      },
    });
  },
  toreply(e) {
    if (e.currentTarget.dataset.item.mid) {
      app.globalData.mid = e.currentTarget.dataset.item.mid;
      let kid = e.currentTarget.dataset.item.kecheng_id;
      // wx.redirectTo({
      //   url: "../../kecheng/kecheng/kecheng?mid=" + app.globalData.mid,
      // });
      app.globalData.askItem = e.currentTarget.dataset.item;
      wx.navigateTo({
        url:
          "../../kecheng/kechengplay/kechengplay?kid=" +
          kid +
          "&mid=" +
          app.globalData.mid +
          "&type=13&showAsk=true",
      });
    }
  },
});
