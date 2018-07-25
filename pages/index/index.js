/**
 * @auther mosesc
 * @date 2018-06-21
 */
const app = getApp()
const api = require('../../config/api.js');
const util = require('../../utils/util.js');
const QRCode = require('../../utils/weapp-qrcode.js');

Page({
  data: {
    userInfo: app.globalData.userInfo,
    hasUserInfo: app.globalData.hasUserInfo,
    costGroups: [],
    groupDetail: null,
    selectCostGroup: null,
    showSmall: true,
    showQrCodeModal: false,
    hiddenMenu: true,
    menu: [{ index: -1, name: '关于我们', method: "toAboutMe" },{ index: 0, name: '帮助手册', method: "showHelpDoc" }],
    hiddenHelpDoc: true
  },
  onLoad: function (options) {
    const defualtCostGroup = wx.getStorageSync("selectCostGroup");
    this.setData({
      selectCostGroup: defualtCostGroup
    });
    console.log(options)
    if (options.from){
      util.showLoading();
      this.initUserInfo();
      this.initGroupInfo();
    } else{
      util.showLoading('登录中');
      var that = this;
      app.login().then(function () {
        util.showLoading();
        that.initUserInfo();
        util.showLoading();
        that.initGroupInfo();
      }, function(){
        that.setData({
          menu: that.data.menu.reverse()
        });
      });
    }
  },
  // 初始化用户基本信息
  initUserInfo: function () {
    var that = this;
    util.request(api.CURRENT_USER).then(function (res) {
      app.globalData.userInfo =res.data;
      app.globalData.hasUserInfo = true;
      that.setData({
        userInfo: res.data,
        hasUserInfo: true,
      });
      var menu = that.data.menu;
      if(menu.length < 4){
        menu = menu.concat([{ index: 1, name: '创建新的账单', method: "toCreateCostGroup" }, { index: 2, name: '扫码加入账单', method: "toJoinCostGroup" }]);
        that.setData({
          menu: menu
        });
      }
    });
  },
  // 初始化所有账单
  initGroupInfo: function () {
    var that = this;
    util.request(api.COSTGROUP).then(function (res) {
      const costGroups = res.data;
      console.log("costGroups",res.data)
      that.setData({
        costGroups: costGroups
      });
      if (costGroups.length > 0){
        // 判断是否存在默认的组
        var selectCostGroup = that.data.selectCostGroup;
        console.log(selectCostGroup)
        selectCostGroup = selectCostGroup ? selectCostGroup : {};
        const temp = costGroups.filter(item => item.groupNo == selectCostGroup.groupNo);
        if (temp.length == 0){
          selectCostGroup = costGroups[0];
        } else{
          selectCostGroup = temp[0];
        }
        that.setData({
          selectCostGroup: selectCostGroup
        });
        wx.setStorageSync("selectCostGroup", selectCostGroup);
        that.initGroupDetail(selectCostGroup.groupNo);
        // 添加菜单 添加新的消费
        var menu = that.data.menu;
        if (menu.length < 5){
          const menuItem = { index: 3, name: "添加消费记录", method: "toCreateCostDetail" };
          menu.push(menuItem);
          that.setData({
            menu: menu.reverse()
          });
        }
      } else {
        wx.setStorageSync("selectCostGroup", null);
      }
    });
  },
  // 初始化某一账单信息
  initGroupDetail: function(groupNo){
    console.log("groupNo", groupNo);
    var that = this;
    util.request(api.ROOT_URI+"costGroup/"+groupNo+"/overview").then(function(res){
      console.log(res.data)
      that.setData({
        groupDetail: res.data
      });
    });
  },
  // 下拉刷新页面
  onPullDownRefresh: function () {
    util.showLoading();
    this.initUserInfo();
    this.initGroupInfo();
    wx.stopPullDownRefresh();
  },
  // 分享页面
  onShareAppMessage: function (res) {
    console.log(res)
    if (res.from == 'button') {
      const groupCode = res.target.id;
      const userName = this.data.userInfo.nickName;
      const costGroups = this.data.costGroups.filter(item => item.groupCode == groupCode);
      return {
        title: userName + '邀请你加入账单' + costGroups[0].groupName,
        path: 'pages/approval/approval?groupCode=' + groupCode
      }
    } else {
      return {
        title: userName + '邀请你使用AAB制，让你的生活更便捷',
        path: 'pages/index/index'
      }
    }
  },
  getUserInfo: function (e) {
    util.showLoading('登录中');
    var that = this;
    this.loginByButton(e).then(function () {
      that.initUserInfo();
      that.initGroupInfo();
      that.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      });
    }, function(){
      util.showMessage("登录失败");
    });
  },
  loginByButton: function (e) {
    return new Promise(function (resolve, reject) {
      wx.login({
        success: res => {
          const wxCode = res.code;
          var that = this;
          wx.request({
            url: api.LOGIN,
            method: 'POST',
            data: {
              wxCode: wxCode,
              iv: e.detail.iv,
              encryptedData: e.detail.encryptedData
            },
            success: function (res) {
              console.log("OK");
              if (res.statusCode == 200) {
                var cookie = "JSESSIONID=" + res.data.data;
                wx.setStorageSync('cookie', cookie);
                resolve();
              } else {
                reject(res.data.message);
              }
              wx.hideLoading();
            },fail: function(res){
              wx.hideLoading();
              reject(res);
            }
          });
        }
      });
    });
  },
  // open more action
  openMore: function () {
    const selectGroup = this.data.selectCostGroup;
    const groupId = selectGroup.groupNo;
    var that = this;
    var itemList = ['设置', '退出', '结算', "历史结算记录"];
    if (this.data.groupDetail.myRole == 'admin') {
      itemList = itemList.concat(['删除']);
    }
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        // 退出消费者警告
        switch (res.tapIndex) {
          // 修改账单设置页面
          case 0:
            wx.navigateTo({
              url: '/pages/group/group?groupId=' + groupId,
            })
            break;
          // 退出账单操作
          case 1:
            wx.showModal({
              title: '温馨提示',
              content: '确定要退出该账单吗？',
              confirmText: "确定",
              cancelText: "取消",
              success: function (res) {
                if (res.confirm){
                  const url = api.ROOT_URI+'costGroup/'+groupId+'/leave';
                  util.request(url, {}, 'DELETE').then(function () {
                    // 从当前数据中删除改组
                    var newCostGroups = that.data.costGroups.filter(item => item.groupNo != groupId);
                    that.setData({
                      costGroups: newCostGroups
                    });
                    util.showLoading();
                    that.initGroupInfo();
                  });
                }
              }
            });
            break
          // 结算页面
          case 2:
            wx.navigateTo({
              url: '/pages/settleDetail/settleDetail?groupId=' + groupId+"&type=view",
            })
            break;
          // 历史结算页面
          case 3:
            wx.navigateTo({
              url: '/pages/settlement/settlement?groupId='+groupId,
            })
            break;
          // 删除账单页面
          case 4:
            wx.showModal({
              title: '温馨提示',
              content: '确定要删除该账单吗？',
              confirmText: "确定",
              cancelText: "取消",
              success: function (res) {
                if (res.confirm) {
                  util.request(api.DELETE_GROUP + groupId, {}, 'DELETE').then(function () {
                    var costGroups = that.data.costGroups;
                    costGroups = costGroups.filter(item => item.groupNo != groupId);
                    that.setData({
                      costGroups: costGroups
                    });
                    util.showLoading();
                    that.initGroupInfo();
                  });
                }
              }
            });
            break;
          default:
            break;
        }

      }
    })
  },
  // 打开添加按钮
  openMenu: function(e){
    this.setData({
      hiddenMenu: false
    });
  },
  // 选择默认的账单
  selectCostGroup: function(e){
    util.showLoading();
    const selectCostGroup = this.data.costGroups[e.detail.value];
    this.setData({
      selectCostGroup: selectCostGroup
    });
    wx.setStorageSync("selectCostGroup", selectCostGroup);
    this.initGroupDetail(selectCostGroup.groupNo);
  },
  openQrCodeModal: function(){
    this.setData({
      showQrCodeModal: true
    });
    const selectGroupCode = this.data.selectCostGroup.groupCode;
    var qrcode = new QRCode('canvas', {
      // usingIn: this,
      text: selectGroupCode,
      width: 150,
      height: 150,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  },
  closeQrCodeModal: function(){
    this.setData({
      showQrCodeModal: false
    });
  },
  // 影藏菜单
  menuChange: function(e){
    this.setData({
      hiddenMenu: true
    });
  },
  toCreateCostGroup: function(){
    wx.navigateTo({
      url: '/pages/group/group',
    });
    this.menuChange();
  },
  toCreateCostDetail: function(){
    const selectCostGroup = this.data.selectCostGroup;
    var url = "/pages/cost/cost";
    if (selectCostGroup) {
      url = url.concat("?groupId=" + selectCostGroup.groupNo);
    }
    wx.navigateTo({
      url: url
    });
    this.menuChange();
  },
  toJoinCostGroup: function(){
    wx.scanCode({
      success: function (res) {
        const groupCode = res.result;;
        console.log(groupCode.length)
        if (groupCode != null && groupCode.length == 16) {
          wx.navigateTo({
            url: '/pages/approval/approval?from=inside&groupCode=' + groupCode,
          })
        } else {
          util.showMessage("未识别二维码");
        }
      }
    });
    this.menuChange();
  },
  showHelpDoc: function(){
    this.menuChange();
    this.setData({
      hiddenHelpDoc: false
    });
  },
  toAboutMe: function(){
    wx.navigateTo({
      url: '/pages/aboutMe/aboutMe',
    })
  },
  closeHelpDoc: function(){
    this.setData({
      hiddenHelpDoc: true
    });
  }
})
