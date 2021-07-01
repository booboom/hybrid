/**
 * 移动端桥和h5路由地址
 * 统一处理微信 & App 之间的公用操作
 *
 * method 名称需要与 APP 提供的注册事件保持一致
 * 注册分享内容
 * @method registerShareData
 */

import wechart from "./wechart";
import diamond from "./diamond";
import Cookies from "cookies-js";
import {
  setUrlParam
} from "./urlUtil";

export default {
  /**
   * 注册分享内容
   * @param {title, desc, link, imgUrl} info
   * @param {function} cb
   */
  registerShareData(info = {}, cb = function () { }) {
    let descMeta = document.querySelector('meta[name="description"]');
    //try to fix share image bug
    if (
      info.imgUrl &&
      info.imgUrl.substring &&
      info.imgUrl.substring(0, 2) === "//"
    ) {
      info.imgUrl = "https:" + info.imgUrl;
    }

    let link = window.location.href
    if (info?.link) {
      link = info.link
    }
    info = Object.assign({
      title: document.title,
      desc: (descMeta && descMeta.getAttribute("content")) || "",
      link,
      imgUrl: ""
    },
      info
    );
    if (window.isWebview) {
      diamond.emit("registerShareData", info, cb);
    } else {
      wechart.setShareInfo(info);
    }
  },
  /**
   * load finish
   */
  loadFinish() {
    diamond.emit("loadFinish");
  },
  /**
   * window title
   */
  title(info = {}) {
    diamond.emit("title", info);
  },
  /**
   * 跳转登录
   */
  login() {
    return new Promise((resolve, reject) => {
      diamond.emit(
        "login", {
        needCallBack: true
      },
        (str) => {
          try {
            let result = JSON.parse(str);
            let { isLoginSucess, bearer, userInfo } = result;
            if (bearer) {
              Cookies.set("bearer", bearer, { domain: '__ALLHISTORY_COOKIE_HOSTNAME__' })
            }
            window.clientData.userInfo = userInfo;
            resolve(isLoginSucess);
          } catch (e) {
            reject(e);
          }
        }
      );
    })
  },

  /**
   * toast
   */
  toast(
    info = {
      content: "网络请求失败，请稍后重试~"
    }
  ) {
    diamond.emit("toast", info);
  },

  /**
   * 暂无内容页面
   */
  noContent() {
    diamond.emit("noContent");
  },
  /**
   * 超时重试页面
   */
  timeOut(callback) {
    diamond.emit("pageError", {}, callback);
  },

  /**
   * 打开站外h5页面
   */
  systemBrowserOpenLink(url) {
    diamond.emit('systemBrowserOpenLink', {
      url
    })
  },

  /**
   * 打开新web页面
   */
  openWeb(url, content) {
    diamond.emit("openWeb", {
      url,
      content
    })
  },

  /**
   * 打开本地页面
   */
  openNative(url) {
    diamond.emit("openNative", {
      url
    }, (str) => {
    })
  },
  /**
   * 打开图片和视频页面
   */
  openMediaList(id) {
    this.openNative(`wmactivity:///medialist?mainId=${id}`)
  },

  /**
   * 
   */
  openNativeWithJson(type, content, title) {
    this.openNative((`wmactivity:///nativewithjson?type=${type}&jsonString=${encodeURIComponent(content)}&title=${encodeURIComponent(title)}`))
  },

  /**
   * 查看大图
   */
  showImage(url) {
    diamond.emit('imageShow', {
      url
    })
  },
  /**
   * 查看视频
   */
  showVideo(url) {
    diamond.emit('videoShow', {
      url
    })
  },
  /**
   * 获取手机状态栏高度
   */
  getStatusBarHeight(callback) {
    diamond.emit('getStatusBarHeight', {

    }, callback)
  },
  /**
   * 获取用户信息
   */
  getUserInfo() {
    return new Promise((resolve, reject) => {
      diamond.emit(
        'getUserInfo', {},
        (str) => {
          try {
            let result = JSON.parse(str);
            let { isLogin, userID, bearer, userInfo } = result;
            if (bearer) {
              Cookies.set("bearer", bearer, { domain: '__ALLHISTORY_COOKIE_HOSTNAME__' })
              // TODO: 测试用
              // Cookies.set("bearer", bearer)
            }
            window.clientData.userInfo = userInfo;
            resolve(isLogin);
          } catch (e) {
            reject(e);
          }
        }
      )
    })
  },
  /**
   * web获取临时内容
   */
  getContent(callback) {
    diamond.emit('getContent', {}, callback)
  },
  /**
   * 分享图片h
   */
  sharePic(imgUrl) {
    diamond.emit('sharePic', {
      imgUrl
    })
  },
  /**
   * 媒体预览
   */
  mediumPreview(selectedIndex, mediumlist) {
    diamond.emit('mediumPreview', {
      selectedIndex,
      mediumlist
    })
  },
  /**
   * 详情页数据
   */
  getDetailData(content) {
    diamond.emit('getDetailData', {
      content
    })
  },
  /**
   * 详情页特殊操作
   * 在h5上关注、评论、点赞等后调用
   */
  detailSpecialAction(type, jsonString) {
    diamond.emit('detailSpecialAction', {
      type,
      jsonString
    })
  },
  /**
   * 网页属性，告诉移动端整个h5页面的高度
   */
  websiteProperty(height) {
    // console.log('websiteProperty ===================>', height)
    diamond.emit('websiteProperty', {
      height
    })
  },
  /**
   * 底部弹窗
   */
  showActionDialog(type, rawData, extraData, callback) {
    diamond.emit('showActionDialog', {
      type,
      rawData,
      param: extraData
    }, callback)
  },
  /**
   * 埋点上报
   */
  trace(obj) {
    if (!obj || !obj.pageName || !obj.actionType) return;
    console.log(obj.params ? obj.params : {})
    diamond.emit('trace', {
      pageName: obj.pageName,
      actionType: obj.actionType,
      params: JSON.stringify(obj.params ? obj.params : {})
    })
  },
  /**
   * 展示缺省页
   */
  showEmptyView(str = '内容不存在') {
    diamond.emit('showEmptyView', {
      emptyString: str
    })
  },
  /**
   * 提醒相关事件
   */
  dealRemind(data = {
    type: 'add',
    kindID: '',
    position: '',
    content: '',
  }) {
    return new Promise((resolve, reject) => {
      diamond.emit('dealRemind', data, (res) => {
        try {
          let result = JSON.parse(res)
          let { flag } = result
          if (flag == '0') {
            reject(result)
          } else if (flag == '1') {
            resolve(result)
          } else {
            reject(result)
          }
        } catch (e) {
          reject(e)
        }
      })
    })
  },

  /**
   * webview关闭窗口
   */
  closeWindow() {
    diamond.emit('close')
  },

  /**
   * webview点击分享按钮
   */
  showMore() {
    diamond.emit('more')
  },
  /**
   * 状态栏颜色变化
   */
  changeStatusBarColor(color = 'white') {
    diamond.emit('changeStatusBarColor', { color }, () => { })
  },
  /**
   * 安排列表
   */
  planListAction() {
    return new Promise((resolve, reject) => {
      diamond.emit('planListAction', {}, (res) => {
        try {
          let result = JSON.parse(res)
          resolve(result)
        } catch (e) {
          reject(e)
        }
      })
    })
  },
  /**
   * 安排列表
   */
  planListActionCallBack(callback) {
    diamond.emit('planListAction', {}, callback)
  },

  /**
   *  打电话
   */
  callPhone(params) {
    // params { phones: [] }
    diamond.emit('tel', params)
  },

  /**
   *  想去
   * 
   * params = {
   *  id: 活动id
   *  flag: 1 - 想去/感兴趣; 0 - 不想去/不感兴趣
   * }
   */
  interested(params, cb) {
    diamond.emit('interested', params, cb)
  },

  /**
   *  报名
   * 
   * params = {
   *  activityId: 活动id
   *  registrationFormId: 报名表id
   * }
   */
  signUp(params, cb) {
    diamond.emit('signUp', params, cb)
  },

  /**
   *  地图
   * 
   * params = {
   *  title: String,
   *  desc: String,
   *  latitude: String,
   *  longitude: String
   * }
   */
  openMap(params) {
    diamond.emit('map', params)
  },
  /**
   *  聊天
   * 
   * params = {
   *  sessionType: single - 单聊; group - 群聊;
   *  sessionId: 单聊id or 群聊id
   * }
   */
  openSession(params) {
    diamond.emit('session', params)
  },
  /**
   * 跳转到详情页
   * 
   * params = {
   *  id: 活动id;
   *  signUpFlag: 1 - 报名; 0 或不传 - 非报名
   * }
   */
  navigateToDetail(params) {
    const { id, signUpFlag = 1 } = params;
    this.openNative((`wmactivity:///activityDetail?id=${ String(id) }&signUpFlag=${ String(signUpFlag) }`))
    // diamond.emit(`wmactivity:///activityDetail?id=${ id }&signUpFlag=${ signUpFlag }`)
  },
};
