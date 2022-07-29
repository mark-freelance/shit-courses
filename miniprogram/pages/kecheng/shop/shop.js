// miniprogram/pages/kecheng/shop/shop.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    module:{},
    jumptype: 0,
    body:'',
    company:''
  },

  buy: function(e){
    console.log(e)
    wx.showLoading({
      title: '支付请求中',
    })
    var jumptype = this.data.jumptype
    
    wx.cloud.callFunction({
      name: 'pay',
      data: {
        order_id: this.data.module._id.slice(20)+app.globalData.openid.slice(15)+'t',
        timestamp: e.timeStamp,
        openid: app.globalData.openid,
        price: e.currentTarget.dataset.price,
        mid:this.data.module._id,
        attach: this.data.body,
        body: this.data.body
      },
      success: res => {
        wx.hideLoading()
        console.log(res)
        const payment = res.result.payment
        console.log(payment)
        wx.requestPayment({
          ...payment,
          success (res) {
            console.log('pay success', res)
            wx.showLoading({
              title: '支付成功，正在跳转',
            })
            setTimeout(() => { wx.hideLoading(); }, 3000)
            if (jumptype == 1 )           
			{
				wx.reLaunch({
				  url: '../../geren/index/index',
				})	
			}
			else{
				wx.navigateBack();
			}
            
          },
          fail (err) {
            console.error('pay fail', err)
          }
        })
      },
      fail: console.error,
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  loadmodule:function(mid){
    wx.showLoading({
      title: '加载中',
    })
    db.collection('modules').doc(mid).get({
      success: res =>{
        this.setData({
          module:res.data,
          body:"连线课程购买"
        })
        
        wx.hideLoading()
      }
    })
  },
  
  onLoad: function (options) {
    console.log(app.globalData.company)
    this.setData({
      company:app.globalData.company
    })
    console.log(options)
    if (options.mid){
      this.loadmodule(options.mid)
    } else{
      this.loadschool()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  loadschool:function(){
    var date = new Date()
    
    this.setData({
      jumptype: 1,
      module:{
        _id: 'lian' +app.globalData.openid.slice(20)+date.getTime().toString(),
        module_price: 6000,
        module_name: '天文高阶课程，天体力学模块',
        module_image :'cloud://cloud1-0gycvki2e3212ab3.636c-cloud1-0gycvki2e3212ab3-1305395037/posterF.jpg'
      },
      body:"学校账号购买"
    })
    console.log(this.data.module)
  },
  
  togetinfos:function(){
    wx.navigateTo({
      url: '../../geren/schoolorders/schoolorder',
    })
  }
})