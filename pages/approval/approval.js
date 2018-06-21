const api = require('../../config/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    showTopTip: false,
    errorMsg: '',
    groupCode: null,
    costGroup: null
  },
  onLoad: function (options) {
    const groupCode = options.groupCode;
    const cookie = wx.getStorageSync('cookie');
    this.setData({
      groupCode: groupCode
    });
    var that = this;
    // 获取账单
    util.request(api.GET_GROUP_BY_CODE + groupCode).then(function(res){
      if (res.data == null && res.status == 200) {
        wx.redirectTo({
          url: '/pages/index/index',
        })
      } else{
        that.setData({
          costGroup: res.data
        });
      }
    });
  },
  requestJoin: function(e){
    const comment = e.detail.value.comment;
    if (comment == null || comment.trim() == ""){
      this.setData({
        showTopTip: true,
        errorMsg: '验证消息不能为空'
      });
      var that = this;
      setTimeout(function () {
        that.setData({
          showTopTip: false
        });
      }, 2000);
      return;
    }
    const body = {comment: comment,groupCode: this.data.groupCode};
    util.request(api.APPROVAL, body, 'PUT').then(function(res){
      wx.showToast({
        title: '申请已提交，等待管理员审核',
        icon: 'success'
      });
      wx.redirectTo({
        url: '/pages/index/index',
      })
    });
  }
})