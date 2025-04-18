"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  name: "Login",
  setup() {
    const isDev = true;
    const form = common_vendor.ref({
      phone: "",
      password: ""
    });
    const handleWechatLogin = () => {
      common_vendor.index.showLoading({
        title: "登录中..."
      });
      common_vendor.index.login({
        provider: "weixin",
        success: async (loginRes) => {
          try {
            const response = await utils_request.request({
              url: "http://82.156.12.240:8080/api/auth/login",
              method: "POST",
              data: {
                xcxCode: loginRes.code,
                grantType: "xcx"
              }
            });
            common_vendor.index.hideLoading();
            if (response.code === 200) {
              common_vendor.index.setStorageSync("token", response.data.access_token);
              try {
                const routeRes = await utils_request.request({
                  url: `http://82.156.12.240:8080/api/order/route?phoneNumber=5713&orderNumber=SF3165555559187`,
                  method: "GET"
                });
                common_vendor.index.__f__("log", "at pages/login/login.vue:84", "路由查询结果:", routeRes);
              } catch (error) {
                common_vendor.index.__f__("error", "at pages/login/login.vue:86", "路由查询失败:", error);
              }
              common_vendor.index.showToast({
                title: "登录成功",
                icon: "success",
                duration: 1500
              });
              try {
                const pages = getCurrentPages();
                if (pages.length >= 10) {
                  common_vendor.index.reLaunch({
                    url: "/pages/index/index"
                  });
                } else {
                  common_vendor.index.switchTab({
                    url: "/pages/index/index",
                    fail: (err) => {
                      common_vendor.index.__f__("error", "at pages/login/login.vue:107", "跳转失败:", err);
                      common_vendor.index.reLaunch({ url: "/pages/index/index" });
                    }
                  });
                }
              } catch (error) {
                common_vendor.index.reLaunch({ url: "/pages/index/index" });
              }
            } else {
              common_vendor.index.showToast({
                title: response.message || "登录失败",
                icon: "none"
              });
            }
          } catch (error) {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "登录失败，请稍后再试",
              icon: "none"
            });
            common_vendor.index.__f__("error", "at pages/login/login.vue:127", "微信登录失败：", error);
          }
        },
        fail: () => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "微信登录失败",
            icon: "none"
          });
        }
      });
    };
    const devNavigateTo = (url) => {
      common_vendor.index.setStorageSync("token", "dev_token");
      common_vendor.index.setStorageSync("userInfo", {
        level: 1
        // 其他测试数据
      });
      common_vendor.index.switchTab({
        url
      });
    };
    return {
      isDev,
      form,
      handleWechatLogin,
      devNavigateTo
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0,
    b: common_vendor.o((...args) => $setup.handleWechatLogin && $setup.handleWechatLogin(...args)),
    c: $setup.isDev
  }, $setup.isDev ? {
    d: common_vendor.o(($event) => $setup.devNavigateTo("/pages/index/index")),
    e: common_vendor.o(($event) => $setup.devNavigateTo("/pages/category/category")),
    f: common_vendor.o(($event) => $setup.devNavigateTo("/pages/cart/cart")),
    g: common_vendor.o(($event) => $setup.devNavigateTo("/pages/user/user"))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
