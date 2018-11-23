/*
 * @File:          index.js
 * @Project:       vk-liker
 * @File Created:  Saturday, 24th November 2018 1:35:30 am
 * @Author:        Mikhail K. (iSm1le) <ism1le@xaked.com>
 * -----
 * @Last Modified: Saturday, 24th November 2018 1:39:33 am
 * @Modified By:   Mikhail K. (iSm1le) <ism1le@xaked.com>
 * -----
 * Copyright 2018 Mikhail K. (iSm1le)
 * Licensed under the Apache License, Version 2.0 (https://www.apache.org/licenses/LICENSE-2.0)
 */

// ==UserScript==
// @name         VK Like all posts in group
// @namespace    https://xaked.com/
// @version      0.0.2
// @description  Likes all finded wall posts on current page
// @updateURL    https://raw.githubusercontent.com/iSm1le/vk-liker/master/latest.js
// @downloadURL  https://raw.githubusercontent.com/iSm1le/vk-liker/master/index.js
// @icon         https://raw.githubusercontent.com/iSm1le/vk-liker/master/logo-48x48.png
// @icon64       https://raw.githubusercontent.com/iSm1le/vk-liker/master/logo-64x64.png
// @author       iSm1le
// @copyright    2018 iSm1le
// @match        *://vk.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @license      Apache-2.0
// @run-at       document-end
// ==/UserScript==

function getSettings() {
  let settings = [];
  if (GM_getValue('is_groups')) { // eslint-disable-line no-undef, new-cap
    try {
      settings = JSON.parse(GM_getValue('is_groups')); // eslint-disable-line no-undef, new-cap
    } catch (e) {
      console.error(e);
    }
  }
  return settings;
}

function setSettings(settings) {
  return GM_setValue('is_groups', JSON.stringify(settings)); // eslint-disable-line no-undef, new-cap
}

function getGroupId(doc) {
  try {
    const pageWallSearch = doc.getElementsByClassName('ui_tab_plain ui_tab_search')[0].href;
    let groupId;
    if (pageWallSearch) {
      groupId = pageWallSearch.match(/\d{5,10}/g);
    }
    return groupId[0];
  } catch (e) {
    return null;
  }
}

function toggleMonitoring(currentGroupId, modal) {
  let settings = getSettings(); // eslint-disable-line prefer-const
  if (settings.indexOf(currentGroupId) >= 0) {
    settings.splice(settings.indexOf(currentGroupId), 1);
    modal.style.background = 'red';
  } else {
    settings.push(currentGroupId);
    modal.style.background = 'green';
  }
  setSettings(settings);
  location.reload();
  return true;
}

function showModal(doc, currentGroupId, monitoring) {
  const body = doc.getElementsByTagName('body')[0];
  const likeWindow = doc.createElement('div');
  const likeWindowText = doc.createElement('div');
  likeWindowText.innerHTML = monitoring ? 'E' : 'D';
  const likeWindowTextStyle = 'position: relative; text-align: center; align-content: center; margin-top: 14px; font-size: 1rem; cursor: pointer;';
  const likeWindowStyle = 'width: 45px; height: 45px; position: fixed; bottom: 15px; right: 15px; border-radius: 50%; cursor: pointer;';
  body.appendChild(likeWindow);
  likeWindow.appendChild(likeWindowText);
  likeWindow.style.cssText = likeWindowStyle;
  likeWindowText.style.cssText = likeWindowTextStyle;
  likeWindow.style.background = monitoring ? 'green' : 'red';
  likeWindow.onclick = () => toggleMonitoring(currentGroupId, likeWindow);
  return likeWindow;
}

function getNotLikedPosts(doc) {
  let nodes = doc.querySelectorAll('.like_wrap:not(.lite)'); // eslint-disable-line prefer-const
  let unNodes = []; // eslint-disable-line prefer-const
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].children[0].children[0].children[0].classList.length === 3 || (nodes[i].children[0].children[0].children[0].classList.length === 4 && nodes[i].children[0].children[0].children[0].classList.value.indexOf('animate') >= 0)) {
      unNodes.push(nodes[i]);
    }
  }
  return unNodes;
}

function likePosts(doc, modal, likeTime = 2000) {
  let posts = getNotLikedPosts(doc); // eslint-disable-line prefer-const
  const modalText = modal.children[0];
  if (posts.length > 0) {
    let postNum = 0;
    modalText.innerHTML = `${postNum}/${posts.length}`;
    const likeInterval = setInterval(() => {
      if (postNum >= posts.length) {
        modalText.innerHTML = 'E';
        clearInterval(likeInterval);
      } else {
        posts[postNum].children[0].children[0].children[0].click();
        postNum++;
        modalText.innerHTML = `${postNum}/${posts.length}`;
      }
    }, likeTime);
  } else {
    setTimeout(() => { modalText.innerHTML = 'E'; }, 1000);
  }
  return true;
}

function init(document, pathname) {
  let settings = getSettings();
  if (!settings) {
    setSettings([]);
    settings = getSettings();
  }
  let currentGroupId = getGroupId(document);
  let monitoring = settings.indexOf(currentGroupId) >= 0 ? true : false; // eslint-disable-line prefer-const
  const modal = showModal(document, currentGroupId, monitoring);
  if (!currentGroupId) {
    modal.parentNode.removeChild(modal);
  }
  if (monitoring) {
    const interval = setInterval(() => {
      if (location.pathname !== pathname) {
        modal.parentNode.removeChild(modal);
        clearInterval(interval);
      }
      if (modal.children[0].innerHTML === 'E') {
        currentGroupId = getGroupId(document);
        if (currentGroupId) {
          modal.children[0].innerHTML = 'S';
          likePosts(document, modal, 2000);
        } else {
          modal.parentNode.removeChild(modal);
          clearInterval(interval);
        }
      }
    }, 5 * 1000);
  }
}

/* eslint-disable func-names */

(function() {
  if (window.top !== window.self) {
    return;
  }
  let pathname = location.pathname;
  init(document, pathname);
  const pageCheck = setInterval(() => { // eslint-disable-line no-unused-vars
    if (location.pathname !== pathname) {
      pathname = location.pathname;
      init(document, pathname);
    }
  }, 500);
})();

/* eslint-enable func-names */
