// miniprogram/pages/kecheng/us/us.js
const app = getApp();
const db = wx.cloud.database();
const citySelector = requirePlugin("citySelector");
const selectCityText = "点击选择";
const checkedColor = "#a5c3dd";
const uncheckColor = "#c0c0c0";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    hasLocation: true,
    selectorVisible: false,
    city: { name: selectCityText },
    // filter: {
    //   tongcheng: { bgColor: uncheckColor },
    //   kuasheng: { bgColor: uncheckColor },
    //   guanxing: { bgColor: uncheckColor },
    //   paixing: { bgColor: uncheckColor },
    //   taizhan: { bgColor: uncheckColor },
    //   bantian: { bgColor: uncheckColor },
    //   zhoumo: { bgColor: uncheckColor },
    //   duotian: { bgColor: uncheckColor },
    //   rumen: { bgColor: uncheckColor },
    //   tigao: { bgColor: uncheckColor },
    //   zhuanye: { bgColor: uncheckColor },
    // },
    swiperList: [],
    activityList: [],
    // tag1: [],
    // tag2: [],
    // tag3: [],
    // tag4: [],
    tags: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.getLocation();
    let savedCity = wx.getStorageSync("city");
    console.log(savedCity);
    if (savedCity) {
      this.setData({ city: JSON.parse(savedCity) });
    }
    if (!app.globalData.openid) {
      this.login();
    }
    this.getTags();
    this.getSwiperList();
    this.searchActivity();
  },
  getTags() {
    let self = this;
    db.collection("tags").get({
      success: (res) => {
        console.log(res);
        let tags = res.data[0];
        for (let i = 0; i < tags.tag1.length; i++) {
          let item = tags.tag1[i];
          item.checked = false;
          item.bgColor = uncheckColor;
        }
        for (let i = 0; i < tags.tag2.length; i++) {
          let item = tags.tag2[i];
          item.checked = false;
          item.bgColor = uncheckColor;
        }
        for (let i = 0; i < tags.tag3.length; i++) {
          let item = tags.tag3[i];
          item.checked = false;
          item.bgColor = uncheckColor;
        }
        for (let i = 0; i < tags.tag4.length; i++) {
          let item = tags.tag4[i];
          item.checked = false;
          item.bgColor = uncheckColor;
        }
        self.setData({ tags: res.data[0] });
      },
      fail: (err) => {
        console.log(err);
      },
    });
  },
  getSwiperList() {
    let self = this;
    db.collection("swipers")
      .where({ is_delete: false })
      .orderBy("show_order", "asc")
      .get({
        success: (res) => {
          console.log(res);
          self.setData({ swiperList: res.data });
        },
        fail: (err) => {
          console.log(err);
        },
      });
  },
  searchActivity() {
    let self = this;
    wx.cloud.callFunction({
      name: "searchActivity",
      data: {
        aid: "",
        tags: self.data.tags,
        city: self.data.city,
      },
      success(res) {
        console.log(res);
        self.setData({ activityList: res.result.data });
      },
      fail(err) {
        console.log(err);
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
    console.log(citySelector);
    const selectedCity = citySelector.getCity();
    console.log(selectedCity);
    if (selectedCity) {
      this.saveCity(selectedCity);
    }
    let tagList = this.data.tags.tag1;
    if (tagList) {
      for (let i = 0; i < tagList.length; i++) {
        let item = tagList[i];
        if (item.checked && item.needLocation) {
          this.searchActivity();
        }
      }
    }
    console.log(this.data.address);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    citySelector.clearCity();
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
  getLocation() {
    return;
    // let self = this;
    // wx.getLocation({
    //   type: "wgs84",
    //   success(res) {
    //     const latitude = res.latitude;
    //     const longitude = res.longitude;
    //     const speed = res.speed;
    //     const accuracy = res.accuracy;
    //     console.log(res);
    //     self.setData({
    //       hasLocation: true,
    //     });
    //     self.getActivity();
    //   },
    //   fail(error) {
    //     console.log(error);
    //     self.setData({
    //       hasLocation: false,
    //     });
    //     self.getActivity();
    //   },
    // });
  },
  getTag(tagList, name) {
    for (let i = 0; i < tagList.length; i++) {
      let item = tagList[i];
      if (item.text == name) {
        return item;
      }
    }
  },
  getTagByName(name) {
    let tags = this.data.tags;
    let tag = null;
    if (tags.tag1) {
      tag = this.getTag(tags.tag1, name);
    }
    if (tag) {
      return tag;
    }
    if (tags.tag2) {
      tag = this.getTag(tags.tag2, name);
    }
    if (tag) {
      return tag;
    }
    if (tags.tag3) {
      tag = this.getTag(tags.tag3, name);
    }
    if (tag) {
      return tag;
    }
    if (tags.tag4) {
      tag = this.getTag(tags.tag4, name);
    }
    if (tag) {
      return tag;
    }
    return tag;
  },
  onFilter(e) {
    let filterName = e.currentTarget.dataset.filter;
    let tag = this.getTagByName(filterName);
    if (tag.needLocation && this.data.city == selectCityText) {
      wx.showToast({
        icon: "none",
        title: "未定位到您的城市信息",
      });
      return;
    }

    if (tag) {
      if (tag.checked) {
        tag.checked = false;
        tag.bgColor = uncheckColor;
      } else {
        tag.checked = true;
        tag.bgColor = checkedColor;
      }
    }
    this.setData({
      tags: this.data.tags,
    });
    this.searchActivity();
  },
  saveCity(city) {
    wx.setStorageSync("city", JSON.stringify(city));
    // wx.setStorageSync("city", null);
    this.setData({ city: city });
  },

  onSwiperClick(e) {
    console.log(e.currentTarget.dataset.id);
    let id = e.currentTarget.dataset.url;
    if(id)
    {
      wx.navigateTo({
        url: "../detail/detail?activity_id=" + id,
      });
    }
  },
  onOpenSetting(e) {
    console.log(e);
    let self = this;
    if (e.detail.authSetting["scope.userLocation"]) {
      // self.getLocation();
      this.setData({ selectorVisible: true });
    }
  },
  onSelectCity(e) {
    const key = "LTMBZ-GN6WW-JT2RZ-OXT6R-4YIOO-3RFDK"; // 使用在腾讯位置服务申请的key
    const referer = "天文连线"; // 调用插件的app的名称
    const hotCitys = ""; // 用户自定义的的热门城市

    wx.navigateTo({
      url: `plugin://citySelector/index?key=${key}&referer=${referer}&hotCitys=${hotCitys}`,
    });
  },
  onActivityDetail(e) {
    let id = e.currentTarget.dataset.id;
    console.log(id);
    wx.navigateTo({
      url: "../detail/detail?activity_id=" + id,
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
      },
      fail: (err) => {
        console.error("[云函数] [login] 调用失败", err);
      },
    });
  },
});
