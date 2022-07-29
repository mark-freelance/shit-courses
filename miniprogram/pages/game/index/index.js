const colorLight = "rgba(0, 0, 0, .9)";
const colorDark = "rgba(255, 255, 255, .8)";

const app = getApp();
Page({
  data: {
    gameList: [],
  },
  onLoad() {
    var self = this;
    wx.cloud.callFunction({
      name: "games",
      success: (res) => {
        console.log(res.result.data);
        self.setData({ gameList: res.result.data });
      },
      fail: (err) => {
        console.error("[云函数] [games] 调用失败", err);
      },
    });
  },
  togame: function (e) {
    let url = e.currentTarget.dataset.url;
    if (url.length > 0) {
      wx.navigateTo({
        url: "../game/game?url=" + url,
      });
    }
  },
});
