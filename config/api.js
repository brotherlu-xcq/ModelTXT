const rootUri = 'https://www.modutxt.xin/public/api/';
// const rootUri = 'https://192.168.31.213/public/api/';
module.exports = {
  ROOT_URI: rootUri,
  LOGIN: rootUri + 'login',
  CURRENT_USER: rootUri + 'user/current',
  APPLICATIONS: rootUri + '/approval/list/',
  MYGROUPS_OVERVIEW: rootUri + 'costGroup/mine/overview',
  CREATE_GROUP: rootUri + 'costGroup',
  DELETE_GROUP: rootUri + 'costGroup/',
  UPDATE_GROUP: rootUri + 'costGroup/',
  GET_GROUP_BY_CODE: rootUri + 'costGroup/byCode/',
  REMARK_NAME: rootUri + 'remarkName',
  APPROVAL: rootUri +'approval',
  CATEGORY: rootUri +'category/list',
  COSTGROUP: rootUri +'costGroup/listMine',
  COSTGROUP_BY_ID: rootUri+'costGroup/',
  DELETE_DETAIL: rootUri + 'costDetail/detail/',
  CLEAN_HISTORY: rootUri + 'costClean/costGroup/',
  UNCLEAN_DETAIL: rootUri +'costClean/unClean/costGroup/'
}