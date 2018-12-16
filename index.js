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
// @name         VK Like all posts in group
// @namespace    https://xaked.com/
// @version      1.0
// @description  Likes all finded wall posts on current page
// @updateURL    https://raw.githubusercontent.com/iSm1le/vk-liker/master/dist/latest.js
// @downloadURL  https://raw.githubusercontent.com/iSm1le/vk-liker/master/dist/index.js
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

class VKBot {
  constructor(debug = false, scanIntervalTime = 5000, likeInterval = 2000) {
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
    this.scanInterval = setInterval(() => {
      this.scan();
    }, this.scanIntervalTime);
  }

  scan() {
    this.getSettings();
    this.checkIsMonitored();
    this.updateModal();
    this.log(`Page monitoring: ${this.isMonitored}`);
    if (this.isMonitored && !this.liking) {
      this.getNotLikedPosts();
      this.log(this.unNodes.length);
      this.likePosts();
    }
  }

  checkIsMonitored() {
    this.log(`Current page: ${location.pathname}`);
    this.pathname = location.pathname;
    if (this.settings.indexOf(this.pathname) >= 0) {
      this.isMonitored = true;
    } else {
      this.isMonitored = false;
    }
  }

  getSettings() {
    if (GM_getValue('is_pages')) { // eslint-disable-line
      try {
        this.settings = JSON.parse(GM_getValue('is_pages')); // eslint-disable-line
        this.log(`got settings: ${this.settings}`);
      } catch (e) {
        this.log(e);
      }
    }
  }

  saveSettings() {
    GM_setValue('is_pages', JSON.stringify(this.settings)); // eslint-disable-line
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.innerHTML = 'D';
    this.modal.style.cssText = 'width: 45px; height: 45px; position: fixed; bottom: 15px; right: 15px; border-radius: 50%; cursor: pointer; background: red; text-align: center; display: flex; flex-direction: column; justify-content: center; font-size: large;';
    document.getElementsByTagName('body')[0].appendChild(this.modal);
    this.modal.onclick = () => this.togglePageMonitoring(location.pathname);
  }

  togglePageMonitoring(pathname) {
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

  updateModal() {
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

  getNotLikedPosts() {
    const nodes = document.querySelectorAll('.like_wrap:not(.lite)');
    const unNodes = [];
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].children[0].children[0].children[0].classList.length === 3 || (nodes[i].children[0].children[0].children[0].classList.length === 4 && nodes[i].children[0].children[0].children[0].classList.value.indexOf('animate') >= 0)) {
        unNodes.push(nodes[i]);
      }
    }
    this.unNodes = unNodes;
  }

  likePosts() {
    if (this.unNodes.length > 0) {
      this.liking = true;
      let postNum = 0;
      const likeInterval = setInterval(() => {
        if (postNum >= this.unNodes.length) {
          clearInterval(likeInterval);
          this.liking = false;
          this.updateModal();
        } else {
          if (!this.isMonitored) {
            clearInterval(likeInterval);
            this.liking = false;
            this.updateModal();
            return;
          }
          this.unNodes[postNum].children[0].children[0].children[0].click();
          postNum++;
          this.modal.innerHTML = `${postNum}/${this.unNodes.length}`;
        }
      }, this.likeInterval);
    }
  }

  log(msg) {
    if (this.debug) {
      console.log(`VKBot: ${msg}`);
    }
  }
}

const bot = new VKBot(false, 5000, 2000);
bot.log('started');
