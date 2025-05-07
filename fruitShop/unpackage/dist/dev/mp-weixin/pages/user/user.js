"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "user",
  setup(__props) {
    const userInfo = common_vendor.ref({
      userAvatar: "",
      userName: "",
      memberLevel: 1,
      userRole: ""
      // 使用后端返回的userRole字段
    });
    const isGuest = common_vendor.ref(false);
    common_vendor.ref([
      { type: "pending-payment", name: "待支付", icon: "/static/icons/payment.png", count: 0 },
      { type: "undelivered", name: "待发货", icon: "/static/icons/box.png", count: 0 },
      { type: "delivered", name: "待收货", icon: "/static/icons/truck.png", count: 0 },
      { type: "after-sale", name: "退款/售后", icon: "/static/icons/refound.png", count: 0 }
    ]);
    const toolsList = common_vendor.computed(() => {
      const baseTools = [
        {
          id: 1,
          name: "收货地址",
          icon: "/static/icons/location.png",
          path: "/pages/address/edit"
        },
        {
          id: 2,
          name: "个人设置",
          icon: "/static/icons/setting.png",
          path: "/pages/settings/index"
        },
        {
          id: 3,
          name: "联系客服",
          icon: "/static/icons/service.png",
          type: "customer-service"
        }
      ];
      if (userInfo.value.userRole === "admin") {
        baseTools.push({
          id: 4,
          name: "管理后台",
          icon: "/static/icons/admin.png",
          path: "/pages/admin/index"
        });
      }
      return baseTools;
    });
    const checkGuestMode = () => {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        isGuest.value = true;
        return true;
      }
      isGuest.value = false;
      return false;
    };
    const showLoginTip = () => {
      if (isGuest.value) {
        common_vendor.index.showModal({
          title: "需要登录",
          content: "该功能需要登录后才能使用，是否立即登录？",
          success: (res) => {
            if (res.confirm) {
              const currentPage = "/" + getCurrentPages()[getCurrentPages().length - 1].route;
              common_vendor.index.navigateTo({
                url: "/pages/login/login?redirect=" + encodeURIComponent(currentPage)
              });
            }
          }
        });
        return true;
      }
      return false;
    };
    const navigateToLogin = () => {
      const currentPage = "/" + getCurrentPages()[getCurrentPages().length - 1].route;
      common_vendor.index.navigateTo({
        url: "/pages/login/login?redirect=" + encodeURIComponent(currentPage)
      });
    };
    const getUserInfo = async () => {
      if (isGuest.value) {
        return;
      }
      try {
        const res = await utils_request.request({
          url: "https://bgnc.online/api/user/profile",
          method: "GET"
        });
        if (res.code === 200) {
          common_vendor.index.__f__("log", "at pages/user/user.vue:205", "res.data是", res.data);
          userInfo.value = {
            userAvatar: res.data.userAvatar,
            userName: res.data.userName,
            memberLevel: res.data.memberLevel || 1,
            userRole: res.data.userRole,
            id: res.data.id,
            userSex: res.data.userSex,
            userBirthday: res.data.userBirthday,
            phone: res.data.phone,
            status: res.data.status,
            openId: res.data.openId
          };
          common_vendor.index.__f__("log", "at pages/user/user.vue:218", "处理后的用户信息:", userInfo.value);
          common_vendor.index.setStorageSync("userAvatar", res.data.userAvatar);
          common_vendor.index.setStorageSync("userName", res.data.userName);
          common_vendor.index.setStorageSync("userRole", res.data.userRole);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:225", "获取用户信息失败：", error);
      }
    };
    const navigateToOrderList = (type) => {
      if (showLoginTip()) {
        return;
      }
      let status = "";
      switch (type) {
        case "pending-payment":
          status = 0;
          break;
        case "undelivered":
          status = 1;
          break;
        case "delivered":
          status = 2;
          break;
        case "completed":
          status = 3;
          break;
        case "after-sale":
          status = 4;
          break;
      }
      common_vendor.index.navigateTo({
        url: `/pages/order/list?status=${status}`
      });
    };
    const handleToolClick = (item) => {
      if (showLoginTip()) {
        return;
      }
      if (item.type === "customer-service") {
        common_vendor.index.navigateTo({
          url: "/pages/user/contact",
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/user/user.vue:275", "跳转到联系客服页面失败：", err);
            common_vendor.index.showToast({
              title: "页面跳转失败",
              icon: "none"
            });
          }
        });
        return;
      }
      if (item.name === "管理后台") {
        common_vendor.index.showModal({
          title: "提示",
          content: "确认进入管理后台？",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: item.path,
                fail: (err) => {
                  common_vendor.index.__f__("error", "at pages/user/user.vue:295", "跳转失败：", err);
                  common_vendor.index.showToast({
                    title: "页面跳转失败",
                    icon: "none"
                  });
                }
              });
            }
          }
        });
        return;
      }
      common_vendor.index.navigateTo({
        url: item.path,
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/user/user.vue:312", "跳转失败：", err);
          common_vendor.index.showToast({
            title: "页面跳转失败",
            icon: "none"
          });
        }
      });
    };
    const navigateToSettings = () => {
      if (showLoginTip()) {
        return;
      }
      common_vendor.index.navigateTo({
        url: "/pages/settings/index",
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/user/user.vue:345", "跳转到个人设置页面失败：", err);
          common_vendor.index.showToast({
            title: "页面跳转失败",
            icon: "none"
          });
        }
      });
    };
    common_vendor.onMounted(() => {
      checkGuestMode();
      if (!isGuest.value) {
        getUserInfo();
      }
    });
    common_vendor.onShow(() => {
      checkGuestMode();
      if (!isGuest.value) {
        getUserInfo();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isGuest.value ? "/static/images/default-avatar.png" : userInfo.value.userAvatar || "/static/images/default-avatar.png",
        b: common_vendor.t(isGuest.value ? "游客" : userInfo.value.userName || "微信用户"),
        c: !isGuest.value
      }, !isGuest.value ? {
        d: common_assets._imports_0$3,
        e: common_vendor.t(userInfo.value.memberLevel || 1)
      } : {}, {
        f: isGuest.value
      }, isGuest.value ? {
        g: common_vendor.o(navigateToLogin)
      } : {}, {
        h: common_vendor.o(navigateToSettings),
        i: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        j: common_vendor.o(($event) => navigateToOrderList("")),
        k: common_assets._imports_1$1,
        l: common_vendor.o(($event) => navigateToOrderList("pending-payment")),
        m: common_assets._imports_2$1,
        n: common_vendor.o(($event) => navigateToOrderList("undelivered")),
        o: common_assets._imports_3,
        p: common_vendor.o(($event) => navigateToOrderList("delivered")),
        q: common_assets._imports_4,
        r: common_vendor.o(($event) => navigateToOrderList("completed")),
        s: common_assets._imports_5,
        t: common_vendor.o(($event) => navigateToOrderList("after-sale")),
        v: common_vendor.f(toolsList.value, (item, k0, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: item.id,
            d: common_vendor.o(($event) => handleToolClick(item), item.id)
          };
        })
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map
