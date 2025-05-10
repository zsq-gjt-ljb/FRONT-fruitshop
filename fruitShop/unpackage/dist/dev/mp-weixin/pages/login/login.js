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
    const isAgreed = common_vendor.ref(false);
    const redirectUrl = common_vendor.ref("");
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at pages/login/login.vue:66", "登录页面参数:", options);
      if (options.redirect) {
        redirectUrl.value = decodeURIComponent(options.redirect);
        common_vendor.index.__f__("log", "at pages/login/login.vue:69", "获取到重定向URL:", redirectUrl.value);
      }
    });
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/login/login.vue:75", "登录页面已加载完成");
      isAgreed.value = false;
    });
    const checkboxChange = (e) => {
      isAgreed.value = e.detail.value.length > 0;
    };
    const navigateToUserAgreement = () => {
      common_vendor.index.navigateTo({
        url: "/pages/agreement/user-agreement"
      });
    };
    const navigateToPrivacyPolicy = () => {
      common_vendor.index.navigateTo({
        url: "/pages/agreement/privacy-policy"
      });
    };
    const handleSuccessNavigation = () => {
      common_vendor.index.__f__("log", "at pages/login/login.vue:101", "处理导航跳转, 重定向URL:", redirectUrl.value);
      if (redirectUrl.value) {
        const tabBarPages = ["/pages/index/index", "/pages/category/category", "/pages/cart/cart", "/pages/user/user"];
        const isTabBar = tabBarPages.includes(redirectUrl.value);
        if (isTabBar) {
          common_vendor.index.__f__("log", "at pages/login/login.vue:110", "跳转到tabBar页面:", redirectUrl.value);
          common_vendor.index.switchTab({
            url: redirectUrl.value,
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/login/login.vue:114", "跳转失败:", err);
              common_vendor.index.switchTab({ url: "/pages/index/index" });
            }
          });
        } else {
          common_vendor.index.__f__("log", "at pages/login/login.vue:119", "跳转到非tabBar页面:", redirectUrl.value);
          common_vendor.index.navigateTo({
            url: redirectUrl.value,
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/login/login.vue:123", "跳转失败:", err);
              common_vendor.index.switchTab({ url: "/pages/index/index" });
            }
          });
        }
      } else {
        common_vendor.index.__f__("log", "at pages/login/login.vue:130", "无重定向URL，跳转到首页");
        try {
          common_vendor.index.switchTab({
            url: "/pages/index/index",
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/login/login.vue:135", "跳转到首页失败:", err);
              common_vendor.index.reLaunch({ url: "/pages/index/index" });
            }
          });
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/login/login.vue:140", "跳转异常:", error);
          common_vendor.index.reLaunch({ url: "/pages/index/index" });
        }
      }
    };
    const handleWechatLogin = () => {
      common_vendor.index.__f__("log", "at pages/login/login.vue:148", "点击了微信登录按钮");
      if (!isAgreed.value) {
        common_vendor.index.showToast({
          title: "请阅读并同意用户协议和隐私政策",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "登录中..."
      });
      common_vendor.index.login({
        provider: "weixin",
        success: async (loginRes) => {
          try {
            const response = await utils_request.request({
              url: "https://bgnc.online/api/auth/login",
              method: "POST",
              data: {
                xcxCode: loginRes.code,
                grantType: "xcx"
              }
            });
            common_vendor.index.hideLoading();
            if (response.code === 200) {
              common_vendor.index.setStorageSync("token", response.data.access_token);
              common_vendor.index.removeStorageSync("isGuestMode");
              try {
                const routeRes = await utils_request.request({
                  url: `https://bgnc.online/api/order/route?phoneNumber=5713&orderNumber=SF3165555559187`,
                  method: "GET"
                });
                common_vendor.index.__f__("log", "at pages/login/login.vue:196", "路由查询结果:", routeRes);
              } catch (error) {
                common_vendor.index.__f__("error", "at pages/login/login.vue:198", "路由查询失败:", error);
              }
              common_vendor.index.showToast({
                title: "登录成功",
                icon: "success",
                duration: 1500
              });
              setTimeout(() => {
                handleSuccessNavigation();
              }, 1600);
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
            common_vendor.index.__f__("error", "at pages/login/login.vue:224", "微信登录失败：", error);
          }
        },
        fail: (err) => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "微信登录失败",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at pages/login/login.vue:233", "微信登录API调用失败:", err);
        }
      });
    };
    const handleGuestLogin = () => {
      common_vendor.index.__f__("log", "at pages/login/login.vue:240", "点击了游客模式按钮");
      common_vendor.index.setStorageSync("isGuestMode", true);
      common_vendor.index.showToast({
        title: "以游客身份浏览",
        icon: "success",
        duration: 1500
      });
      setTimeout(() => {
        common_vendor.index.switchTab({
          url: "/pages/index/index",
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/login/login.vue:258", "跳转到首页失败:", err);
            common_vendor.index.reLaunch({ url: "/pages/index/index" });
          }
        });
      }, 1600);
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
      isAgreed,
      checkboxChange,
      navigateToUserAgreement,
      navigateToPrivacyPolicy,
      handleWechatLogin,
      handleGuestLogin,
      devNavigateTo
    };
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$1,
    b: $setup.isAgreed,
    c: common_vendor.o((...args) => $setup.navigateToUserAgreement && $setup.navigateToUserAgreement(...args)),
    d: common_vendor.o((...args) => $setup.navigateToPrivacyPolicy && $setup.navigateToPrivacyPolicy(...args)),
    e: common_vendor.o((...args) => $setup.checkboxChange && $setup.checkboxChange(...args)),
    f: common_vendor.o((...args) => $setup.handleWechatLogin && $setup.handleWechatLogin(...args)),
    g: common_vendor.o((...args) => $setup.handleGuestLogin && $setup.handleGuestLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
