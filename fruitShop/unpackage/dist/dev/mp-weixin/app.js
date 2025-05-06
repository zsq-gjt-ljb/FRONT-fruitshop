"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_request = require("./utils/request.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/agreement/user-agreement.js";
  "./pages/agreement/privacy-policy.js";
  "./pages/index/index.js";
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
    if (!token && !isGuestMode) {
      common_vendor.index.__f__("log", "at App.vue:14", "未登录状态，导航到登录页面");
      setTimeout(() => {
        common_vendor.index.reLaunch({
          url: "/pages/login/login",
          success: () => {
            common_vendor.index.__f__("log", "at App.vue:19", "成功导航到登录页面");
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at App.vue:22", "导航到登录页面失败:", err);
          }
        });
      }, 100);
    } else {
      common_vendor.index.__f__("log", "at App.vue:27", "已有登录状态或游客模式，不跳转");
    }
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:31", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:34", "App Hide");
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
