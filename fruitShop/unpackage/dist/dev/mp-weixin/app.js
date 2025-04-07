"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_request = require("./utils/request.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/index/index.js";
  "./pages/category/category.js";
  "./pages/cart/cart.js";
  "./pages/user/user.js";
  "./pages/detail/detail.js";
  "./pages/admin/index.js";
  "./pages/settings/index.js";
  "./pages/address/edit.js";
  "./pages/admin/components/ProductManage.js";
  "./pages/address/list.js";
  "./pages/checkout/checkout.js";
  "./pages/order/list.js";
  "./pages/order/detail.js";
  "./pages/user/contact.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:7", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:10", "App Hide");
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
