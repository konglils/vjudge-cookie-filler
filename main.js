// ==UserScript==
// @name         Virtual Judge Cookie Filler
// @namespace    http://tampermonkey.net/
// @version      2025-05-02
// @description  Auto fill cookies for those OJ which can submit problems on VJ by using their cookies.
// @author       konglils
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @grant        GM_cookie
// @run-at       document-end
// @connect      vjudge.net
// @match        https://vjudge.net/*
// @match        https://codeforces.com/*
// @match        https://qoj.ac/*
// @match        https://onlinejudge.org/*
// @match        https://www.luogu.com.cn/*
// @match        https://www.nowcoder.com/*
// ==/UserScript==

(function() {
  'use strict';

  const OJ = {
    "CodeForces": {
      url: "https://codeforces.com/",
      cookieNames: ["JSESSIONID"],
    },
    "Gym": {
      url: "https://codeforces.com/",
      cookieNames: ["JSESSIONID"],
    },
    "QOJ": {
      url: "https://qoj.ac/",
      cookieNames: ["UOJSESSID"],
    },
    "UVA": {
      url: "https://onlinejudge.org/",
      cookieNames: ["8da11fa2dbfcbf0b9ab349d4b3eba6a3"],
    },
    "洛谷": {
      url: "https://www.luogu.com.cn/",
      cookieNames: ["__client_id", "_uid"],
    },
    "牛客": {
      url: "https://www.nowcoder.com/",
      cookieNames: ["t"],
    },
  };

  const VERIFY_REGEX = /^\/user\/verifiedAccount\?oj=([^&]+)$/;
  const CHECK_REGEX = /^\/user\/checkAccount\?oj=([^&]+)$/;

  const _originOpen = XMLHttpRequest.prototype.open;
  const _originSend = XMLHttpRequest.prototype.send;

  let loggingIn = false; // logging into OJ
  let currentOJ = "";

  window.addEventListener("focus", () => {
    if (loggingIn) {
      autoFill(currentOJ);
    }
  })

  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    this._url = url;
    return _originOpen.apply(this, arguments);
  };

  // hook
  XMLHttpRequest.prototype.send = function(body) {
    this.addEventListener("readystatechange", function() {
      if (location.hostname === "vjudge.net" && this.readyState === 4 && this.status === 200) {
        let isVerified = true;
        let oj = "";

        // verify
        const matchVerify = this._url.match(VERIFY_REGEX);
        if (matchVerify) {
          oj = decodeURI(matchVerify[1]);
          const response = JSON.parse(this.responseText);
          if (Object.keys(response).length == 0) {
            isVerified = false;
          }
        }

        // check
        const matchCheck = this._url.match(CHECK_REGEX);
        if (matchCheck) {
          oj = decodeURI(matchCheck[1]);
          const response = JSON.parse(this.responseText);
          if (Object.keys(response).length == 0) {
            isVerified = false;
          }
        }

        // not login
        if (!isVerified && oj in OJ) {
          autoFill(oj);
        }
      }
    });
    return _originSend.apply(this, arguments);
  };

  function autoFill(oj) {
    updatePendInfo("Auto filling ...")

    GM_cookie.list({ url: OJ[oj].url }, (cookies, error) => {
      if (error) {
        updateFailInfo(oj, "Failed to read cookies");
        console.error(`Failed to read ${oj} cookies: ` + error);
        return;
      }

      // filter cookies in order
      let ojCookies = [];
      for (let name of OJ[oj].cookieNames) {
        for (let cookie of cookies) {
          if (cookie.name == name && cookie.value !== "") {
            ojCookies.push({ "name": name, "value": cookie.value });
          }
        }
      }

      if (ojCookies.length !== OJ[oj].cookieNames.length) {
        loginToOJ(oj);
        return;
      }

      GM_xmlhttpRequest({ // new verify request
        method: "POST",
        url: "/user/verifyAccount",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        data: JSON.stringify({ "oj": oj, "proof": ojCookies }),
        onload(response) {
          response = JSON.parse(response.responseText);
          if (response.success) {
            updateSuccessInfo(response.accountDisplay);
          } else {
            loginToOJ(oj);
          }
        },
        onerror(error) {
          updateFailInfo(oj, "Network error");
          console.error("Network error: " + error);
        }
      });
    });
  }

  function loginToOJ(oj) {
    updateFailInfo(oj, oj + " verify failed");
    loggingIn = true;
    currentOJ = oj;
    GM_openInTab(OJ[oj].url, {
      active: true, // new tab
      insert: true, // insert right
    });
  }

  function updatePendInfo(info) {
    let accountStatus = document.getElementsByClassName("my-account-status")[0];
    let accountInfo = document.getElementsByClassName("my-account")[0];

    accountStatus.innerHTML = '<i class="fa fa-refresh fa-spin" title="Checking..." data-toggle="tooltip"></i>';
    accountInfo.innerHTML = info;
  }

  function updateSuccessInfo(info) {
    let accountStatus = document.getElementsByClassName("my-account-status")[0];
    let accountInfo = document.getElementsByClassName("my-account")[0];
    let removeAccount = document.getElementsByClassName("remove-my-account")[0];

    accountStatus.innerHTML = '<i class="fa fa-check text-success" title="" data-toggle="tooltip" data-original-title="Connected"></i>';
    accountInfo.innerHTML = info;
    removeAccount.style.display = "inline";

    loggingIn = false;
  }

  function updateFailInfo(oj, info) {
    let accountStatus = document.getElementsByClassName("my-account-status")[0];
    let accountInfo = document.getElementsByClassName("my-account")[0];

    accountStatus.innerHTML = '<i class="fa fa-exclamation-triangle text-danger" title="" data-toggle="tooltip" data-original-title="Disconnected. Please re-verify."></i>';
    accountInfo.innerHTML = `${info} <a href="javascript:void(0)" id="oj-login-retry">Retry</a> `;
    
    let fillRetry = document.getElementById("oj-login-retry");
    fillRetry.onclick = () => { autoFill(oj) };

    loggingIn = false;
  }
})();
