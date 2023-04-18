// pages/userProfile.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const app = getApp();
// const db = wx.cloud.database();


Page({
  data: {
    avatarUrl: defaultAvatarUrl,
    permanentAvatarUrl: defaultAvatarUrl,
    nickName: "天文连线用户",
    hideSubmit: true,
    avatarReady: false,
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl: avatarUrl,
      hideSubmit: true,
      avatarReady: false
    })
    // avatarUrl是临时地址，要传到云存储
    let cloudPath = 'avatars/' + app.globalData.openid + '.jpg';
    wx.showLoading({
      title: "头像上传中……",
    });
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: avatarUrl, // 文件路径
      success: res => {
        console.log('野猪拉屎了！')
        wx.hideLoading();
        this.setData({
          permanentAvatarUrl: 'cloud://cloud1-0gycvki2e3212ab3.636c-cloud1-0gycvki2e3212ab3-1305395037/' + cloudPath,
          hideSubmit: (this.data.nickName=="天文连线用户" || this.data.nickName==""),
          avatarReady: true,
        })
      },
      fail: err => {
        wx.hideLoading();
        this.setData({
          hideSubmit: (this.data.nickName=="天文连线用户" || this.data.nickName==""),
          avatarReady: true,
        })
      }
    })
    
  },

  getInputValue(e){
    this.setData({
      nickName: e.detail.value,
    })
    this.setData({
      hideSubmit: (this.data.nickName=="天文连线用户" || this.data.nickName=="") || (!this.data.avatarReady)
    })
  },

  updateUser(){
    wx.cloud.callFunction({
      name: "add_user",
      data: {
        nickName: this.data.nickName,
        avatarUrl: this.data.permanentAvatarUrl,
      },
      success: (res) => {
        // 设置上一页儿的内容
        var pages = getCurrentPages()    //获取加载的页面( 页面栈 )
        // var currentPage = pages[pages.length - 1]  // 获取当前页面
        var prevPage = pages[pages.length - 2]    //获取上一个页面
        // 设置上一个页面的数据（可以修改，也可以新增）
        console.log(res.result.data[0]);
        prevPage.setData({
          logged: true,
          user: res.result.data[0]
        });
        wx.navigateBack();
      },
      fail: (err) => {
        wx.navigateBack();
      },
    });
  }
})