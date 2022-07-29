// pages/userConsole/userConsole.js
Page({
  data: {
    openid: '',
    userInfo: {}
  },
  onLoad: function (options) {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                userInfo: res.userInfo,
                openid: getApp().globalData.openid
              })
            }
          })
        }
      }
    })
  }
})
