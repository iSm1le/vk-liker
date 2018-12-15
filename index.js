var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @File:          index.js
 * @Project:       vk-liker
 * @File Created:  Wednesday, 12th December 2018 10:27:42 pm
 * @Author:        Mikhail K. (iSm1le) <ism1le@xaked.com>
 * -----
 * @Last Modified: Sunday, 16th December 2018 1:11:05 am
 * @Modified By:   Mikhail K. (iSm1le) <ism1le@xaked.com>>
 * -----
 * Copyright 2018 Mikhail K. (iSm1le)
 * Licensed under the Apache License, Version 2.0 (https://www.apache.org/licenses/LICENSE-2.0)
 */

// ==UserScript==
// @name         VK Like all posts in group [d]
// @namespace    https://xaked.com/
// @version      1.0
// @description  Likes all finded wall posts on current page
// @updateURL    https://raw.githubusercontent.com/iSm1le/vk-liker/master/latest.js
// @downloadURL  https://raw.githubusercontent.com/iSm1le/vk-liker/master/index.js
// @supportURL   https://github.com/iSm1le/vk-liker/issues
// @icon         https://raw.githubusercontent.com/iSm1le/vk-liker/master/logo-48x48.png
// @icon64       https://raw.githubusercontent.com/iSm1le/vk-liker/master/logo-64x64.png
// @author       iSm1le
// @copyright    2018 iSm1le
// @match        *://vk.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @license      Apache-2.0
// @run-at       document-end
// @noframes
// ==/UserScript==

var VKBot = function () {
  function VKBot() {
    var debug = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var _this = this;

    var scanIntervalTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5000;
    var likeInterval = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2000;

    _classCallCheck(this, VKBot);

    this.debug = debug;
    this.pathname = location.pathname;
    this.isMonitored = false; // page is need to monitor?
    this.settings = [];
    this.modal = null;
    this.createModal();
    this.scanIntervalTime = scanIntervalTime;
    this.unNodes = false;
    this.likeInterval = likeInterval;
    this.liking = false;
    this.scanInterval = setInterval(function () {
      _this.scan();
    }, this.scanIntervalTime);
  }

  _createClass(VKBot, [{
    key: 'scan',
    value: function scan() {
      this.getSettings();
      this.checkIsMonitored();
      this.updateModal();
      this.log('Page monitoring: ' + this.isMonitored);
      if (this.isMonitored && !this.liking) {
        this.getNotLikedPosts();
        this.log(this.unNodes.length);
        this.likePosts();
      }
    }
  }, {
    key: 'checkIsMonitored',
    value: function checkIsMonitored() {
      this.log('Current page: ' + location.pathname);
      this.pathname = location.pathname;
      if (this.settings.indexOf(this.pathname) >= 0) {
        this.isMonitored = true;
      } else {
        this.isMonitored = false;
      }
    }
  }, {
    key: 'getSettings',
    value: function getSettings() {
      if (GM_getValue('is_pages')) {
        // eslint-disable-line
        try {
          this.settings = JSON.parse(GM_getValue('is_pages')); // eslint-disable-line
          this.log('got settings: ' + this.settings);
        } catch (e) {
          this.log(e);
        }
      }
    }
  }, {
    key: 'saveSettings',
    value: function saveSettings() {
      GM_setValue('is_pages', JSON.stringify(this.settings)); // eslint-disable-line
    }
  }, {
    key: 'createModal',
    value: function createModal() {
      var _this2 = this;

      this.modal = document.createElement('div');
      this.modal.innerHTML = 'D';
      this.modal.style.cssText = 'width: 45px; height: 45px; position: fixed; bottom: 15px; right: 15px; border-radius: 50%; cursor: pointer; background: red; text-align: center; display: flex; flex-direction: column; justify-content: center; font-size: large;';
      document.getElementsByTagName('body')[0].appendChild(this.modal);
      this.modal.onclick = function () {
        return _this2.togglePageMonitoring(location.pathname);
      };
    }
  }, {
    key: 'togglePageMonitoring',
    value: function togglePageMonitoring(pathname) {
      this.getSettings();
      if (this.settings.indexOf(pathname) >= 0) {
        this.isMonitored = false;
        this.liking = false;
        this.settings.splice(this.settings.indexOf(pathname), 1);
      } else {
        this.isMonitored = true;
        this.settings.push(pathname);
      }
      this.saveSettings();
      this.updateModal();
    }
  }, {
    key: 'updateModal',
    value: function updateModal() {
      if (this.isMonitored) {
        this.modal.style.background = 'green';
        if (!this.liking) {
          this.modal.innerHTML = 'E';
        }
      } else {
        this.modal.style.background = 'red';
        this.modal.innerHTML = 'D';
      }
    }
  }, {
    key: 'getNotLikedPosts',
    value: function getNotLikedPosts() {
      var nodes = document.querySelectorAll('.like_wrap:not(.lite)');
      var unNodes = [];
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].children[0].children[0].children[0].classList.length === 3 || nodes[i].children[0].children[0].children[0].classList.length === 4 && nodes[i].children[0].children[0].children[0].classList.value.indexOf('animate') >= 0) {
          unNodes.push(nodes[i]);
        }
      }
      this.unNodes = unNodes;
    }
  }, {
    key: 'likePosts',
    value: function likePosts() {
      var _this3 = this;

      if (this.unNodes.length > 0) {
        this.liking = true;
        var postNum = 0;
        var likeInterval = setInterval(function () {
          if (postNum >= _this3.unNodes.length) {
            clearInterval(likeInterval);
            _this3.liking = false;
            _this3.updateModal();
          } else {
            if (!_this3.isMonitored) {
              clearInterval(likeInterval);
              _this3.liking = false;
              _this3.updateModal();
              return;
            }
            _this3.unNodes[postNum].children[0].children[0].children[0].click();
            postNum++;
            _this3.modal.innerHTML = postNum + '/' + _this3.unNodes.length;
          }
        }, this.likeInterval);
      }
    }
  }, {
    key: 'log',
    value: function log(msg) {
      if (this.debug) {
        console.log('VKBot: ' + msg);
      }
    }
  }]);

  return VKBot;
}();

var bot = new VKBot(false, 5000, 2000);
bot.log('started');
