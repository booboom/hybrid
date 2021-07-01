/**
 * Diamond Hybrid 解决方案
 * 固定文件，请勿擅自修改！！
 * 详见： http://team.evatlas.com:8090/pages/viewpage.action?pageId=2655843
 */

if (window.diamond) {
  // console.log('diamond is already init')
} else {

  window.diamond = Object.assign({
    _events: {},
    _eventQueue: {},
    isReady: false,
  }, window.diamond || {});

  /**
   * web 主动发起 Native事件
   */

  // window.diamond._emit = function (eventName, json, callback) {
  /**
   * Defined by native
   */
  // }

  /**
   * 触发Native 方法
   * @param {string} eventName
   * @param {object?} json
   * @param {function?} callback
   */
  window.diamond.emit = function (eventName, json = {}, callback) {
    if ((!window._diamond || !window._diamond.emit) && navigator.userAgent.indexOf('iOS Marble') < 0) {
      return;
    }

    let callbackID = ''

    /**
     * 增加callback_id 并注册到events
     */

    if (typeof callback == 'function') {
      callbackID = +new Date + '' + Math.random() + '' + Math.random() + '' + Math.random() + '';
      window.diamond._events['cb_' + callbackID] = callback
    }

    /**
     * IOS事件调起
     * UA: Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57 iOS Marble
     */
    // console.log(navigator.userAgent);
    if (navigator.userAgent.indexOf('iOS Marble') > -1) {
      try {
        window.webkit.messageHandlers[eventName].postMessage([json, callbackID])
      } catch (e) {
        // console.log(e);
        // if (process.env.NODE_ENV !== 'development') {
        //   throw e;
        // }
      }
    } else {
      /**
       * android 事件调起
       */
      console.log('_emit_ android:', json, callbackID);
      window._diamond.emit(eventName, JSON.stringify(json), callbackID);
    }

  }

  /**
   * 处理由客户端发来的事件监听，请不要使用这个函数
   */

  window.diamond._dispatch = function (eventName, json) {
    let event = window.diamond._events[eventName];

    if (!event) {
      console.warn('Event not Found: ', eventName)
    }

    event(json);
  }

  /**
   * web端增加监听事件
   */
  window.diamond.on = function (eventName, fn) {

    if (window.diamond._events[eventName]) {
      console.error('Event already exist: ', eventName)
      return;
    }

    if (typeof fn !== 'function') {
      console.error('Second Parameter should be a function')
      return;
    }

    window.diamond._events[eventName] = fn;
  }

  /**
   * web 删除监听事件
   */
  window.diamond.off = function (eventName) {
    if (!eventName) {
      console.error('missing eventName');
      return;
    }
  }

  /**
   * 删除所有监听事件
   */
  window.diamond.offAll = function () {
    window.diamond._events = {};
  }

}

export default window.diamond;