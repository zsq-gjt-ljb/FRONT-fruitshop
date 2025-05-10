"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_request = require("./utils/request.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/login/login.js";
  "./pages/agreement/user-agreement.js";
  "./pages/agreement/privacy-policy.js";
  "./pages/category/category.js";
  "./pages/cart/cart.js";
  "./pages/user/user.js";
  "./pages/detail/detail.js";
  "./pages/admin/index.js";
  "./pages/settings/index.js";
  "./pages/address/edit.js";
  "./pages/admin/components/ProductManage.js";
  "./pages/admin/components/DiscountManage.js";
  "./pages/address/list.js";
  "./pages/checkout/checkout.js";
  "./pages/order/list.js";
  "./pages/order/detail.js";
  "./pages/user/contact.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
    const token = common_vendor.index.getStorageSync("token");
    const isGuestMode = common_vendor.index.getStorageSync("isGuestMode");
    common_vendor.index.__f__("log", "at App.vue:10", "App启动，检查登录状态: token=", token, "isGuestMode=", isGuestMode);
    if (token) {
      common_vendor.index.__f__("log", "at App.vue:14", "用户已登录，token存在");
      return;
    }
    if (!isGuestMode) {
      common_vendor.index.__f__("log", "at App.vue:20", "首次启动，自动设置为游客模式");
      common_vendor.index.setStorageSync("isGuestMode", true);
    }
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:25", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:28", "App Hide");
  },
  // 全局分享配置
  onShareAppMessage(res) {
    return {
      title: "北果南茶 - 新鲜水果，健康生活",
      path: "/pages/index/index",
      imageUrl: "/static/images/share.png"
      // 确保此图片存在
    };
  },
  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: "北果南茶 - 新鲜水果，健康生活",
      query: "",
      imageUrl: "/static/images/share.png"
      // 确保此图片存在
    };
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.config.globalProperties.$request = utils_request.request;
  app.config.globalProperties.$platform = common_vendor.index.getSystemInfoSync().platform;
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
