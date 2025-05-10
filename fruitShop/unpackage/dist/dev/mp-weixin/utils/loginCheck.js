"use strict";
const common_vendor = require("../common/vendor.js");
const checkLogin = (options = {}) => {
  const defaultOptions = {
    showModal: true,
    autoNavigate: false,
    redirectUrl: ""
  };
  const finalOptions = { ...defaultOptions, ...options };
  const token = common_vendor.index.getStorageSync("token");
  if (token) {
    return true;
  }
  let redirectPage = finalOptions.redirectUrl;
  if (!redirectPage) {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    redirectPage = "/" + currentPage.route;
  }
  if (finalOptions.showModal) {
    common_vendor.index.showModal({
      title: "需要登录",
      content: "该功能需要登录后才能使用，是否前往登录？",
      success: (res) => {
        if (res.confirm) {
          common_vendor.index.navigateTo({
            url: "/pages/login/login?redirect=" + encodeURIComponent(redirectPage)
          });
        }
      }
    });
  } else if (finalOptions.autoNavigate) {
    common_vendor.index.navigateTo({
      url: "/pages/login/login?redirect=" + encodeURIComponent(redirectPage)
    });
  }
  return false;
};
const logout = () => {
  common_vendor.index.removeStorageSync("token");
  common_vendor.index.setStorageSync("isGuestMode", true);
  common_vendor.index.switchTab({
    url: "/pages/index/index"
  });
  common_vendor.index.showToast({
    title: "已退出登录",
    icon: "success"
  });
};
const loginCheck = {
  checkLogin,
  logout
};
exports.loginCheck = loginCheck;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/loginCheck.js.map
