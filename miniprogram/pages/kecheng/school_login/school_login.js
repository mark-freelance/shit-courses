// miniprogram/pages/kecheng/school_login/school_login.js
const app = getApp();
const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tips: "",
    username: "",
    password: "",
    logged: false,
    disabled: false,
    canShowBuy: true,
  },

  loadorders: function () {
    /*
    db.collection('orders').where({
      type:"学校账号",
      openid: app.globalData.openid
    }).get({
      success: res  =>{
        if(res.data.length == 0){
          this.setData({
            logged:false
          })
        } else{
          this.setData({
            logged:true,
            tips: "您已登陆",
            disabled: true
          })
        }
      }
    })*/
    db.collection("school")
      .where({
        bind_openid: app.globalData.openid,
      })
      .get({
        success: (res) => {
          if (res.data.length > 0) {
            this.setData({
              logged: true,
              tips: "您已绑定",
              disabled: true,
            });
          } else {
            this.setData({
              logged: false,
              disabled: false,
            });
          }
        },
      });
  },

  addorders: function (e) {
    /*
    console.log(this.data.username)
    console.log(this.data.password)
    db.collection('order_detail').where({
      username: this.data.username, 
      password: this.data.password
    }).get({
      success: res =>{
        console.log(res)
        if (res.data.length == 0){
          this.setData({
            tips:'账号或密码错误'
          })
        } else {
          if (res.data[0].checked){
            this.setData({
              tips: '该账号已被其他人绑定'
            })
          } else{
            this.setData({
              tips : '认证成功，正在跳转',
            })

            db.collection('order_detail').doc(res.data[0]._id).update({
              data :{
                checked :true,
                
              },
              success :res =>{
                console.log(res)
              }
            })

            db.collection('orders').add({
              data: {
                mid: '28ee4e3e6072feb50ee72ab166ee72c6',
                openid: app.globalData.openid,
                totalFee: 498,
                type:'学校账号',
              },
              success :res =>{
                
                wx.reLaunch({
                  url: '../index/index',
                })
              }
            })
          }
        }
      }
    })
	*/
    db.collection("school")
      .where({
        account: this.data.username,
        password: this.data.password,
      })
      .get({
        success: (res) => {
          if (res.data.length == 0) {
            this.setData({
              tips: "账号或密码错误",
            });
          } else if (
            res.data[0].bind_openid &&
            res.data[0].bind_openid.trim().length > 0
          ) {
            this.setData({
              tips: "该账号已被其他人绑定",
            });
          } else {
            db.collection("school")
              .doc(res.data[0]._id)
              .update({
                data: {
                  bind_openid: app.globalData.openid,
                },
                success: (res2) => {
                  this.setData({
                    tips: "绑定成功",
                    disabled: true,
                  });
                },
              });
          }
        },
      });
  },

  bindinputU: function (e) {
    this.setData({
      username: e.detail.value,
    });
  },

  bindinputP: function (e) {
    this.setData({
      password: e.detail.value,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadorders();
    this.setData({
      canShowBuy: !app.globalData.is_ios,
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
});
