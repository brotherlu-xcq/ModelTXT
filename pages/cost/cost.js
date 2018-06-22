const util = require("../../utils/util.js");
const api = require('../../config/api');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    costDate: util.formatTime(new Date()),
    costGroups: [],
    costCategories: [],
    selectCategory: 1,
    selectCostGroup: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const groupId = options.groupId;
    this.initCategory();
    this.initCostGroup(groupId);
  },
  // 初始化分类
  initCategory: function(){
    var that = this;
    util.request(api.CATEGORY).then(function (res) {
      that.setData({
        costCategories: res.data
      });
    });
  },
  initCostGroup: function(groupId){
    var that = this;
    util.request(api.COSTGROUP).then(function(res){
      var costGroups = res.data;
      // 如果有group则初始化
      if (groupId){
        var costGroup = costGroups.filter(item => item.groupId == groupId)[0];
        this.setData({
          selectCostGroup: costGroup
        });
      }
      that.setData({
        costGroups: costGroups
      });
    });
  },
  selectCostDate: function(e){
    this.setData({
      costDate: e.detail.value
    })
  },
  selectCostGroup: function(e){
    this.setData({
      selectCostGroup: this.data.costGroups[e.detail.value]
    });
  },
  selectCategory: function(e){
    this.setData({
      selectCategory: e.currentTarget.id
    });
  },
  // 创建新的消费记录
  createNewCost: function(e){
    const costMoney = e.detail.value.costMoney;
    const comment = e.detail.value.comment;
    const body = {
      cateId: this.data.selectCategory,
      costDate: this.data.costDate,
      costDesc: comment,
      costMoney: costMoney
    };
    util.request(api.ROOT_URI+'costDetail/'+this.data.selectCostGroup.groupId, body, 'PUT').then(function(){
      util.showSuccessToast('创建消费记录成功');
      wx.redirectTo({
        url:'/pages/index/index'
      })
    });
  }
})