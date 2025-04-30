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
    const getUserInfo = async () => {
      try {
        const res = await utils_request.request({
          url: "https://bgnc.online/api/user/profile",
          method: "GET"
        });
        if (res.code === 200) {
          common_vendor.index.__f__("log", "at pages/user/user.vue:154", "res.data是", res.data);
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
          common_vendor.index.__f__("log", "at pages/user/user.vue:167", "处理后的用户信息:", userInfo.value);
          common_vendor.index.setStorageSync("userAvatar", res.data.userAvatar);
          common_vendor.index.setStorageSync("userName", res.data.userName);
          common_vendor.index.setStorageSync("userRole", res.data.userRole);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:174", "获取用户信息失败：", error);
      }
    };
    const navigateToOrderList = (type) => {
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
      if (item.type === "customer-service") {
        common_vendor.index.navigateTo({
          url: "/pages/user/contact",
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/user/user.vue:214", "跳转到联系客服页面失败：", err);
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
                  common_vendor.index.__f__("error", "at pages/user/user.vue:234", "跳转失败：", err);
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
          common_vendor.index.__f__("error", "at pages/user/user.vue:251", "跳转失败：", err);
          common_vendor.index.showToast({
            title: "页面跳转失败",
            icon: "none"
          });
        }
      });
    };
    const handleContact = (e) => {
      common_vendor.index.__f__("log", "at pages/user/user.vue:262", "联系客服事件触发:", e.detail);
    };
    const navigateToSettings = () => {
      common_vendor.index.navigateTo({
        url: "/pages/settings/index",
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/user/user.vue:271", "跳转到个人设置页面失败：", err);
          common_vendor.index.showToast({
            title: "页面跳转失败",
            icon: "none"
          });
        }
      });
    };
    common_vendor.onMounted(() => {
      getUserInfo();
    });
    return (_ctx, _cache) => {
      return {
        a: userInfo.value.userAvatar || "/static/images/default-avatar.png",
        b: common_vendor.t(userInfo.value.userName || "微信用户"),
        c: common_assets._imports_0$3,
        d: common_vendor.t(userInfo.value.memberLevel || 1),
        e: common_vendor.o(navigateToSettings),
        f: common_vendor.p({
          type: "right",
          size: "14",
          color: "#999"
        }),
        g: common_vendor.o(($event) => navigateToOrderList("")),
        h: common_assets._imports_1$1,
        i: common_vendor.o(($event) => navigateToOrderList("pending-payment")),
        j: common_assets._imports_2$1,
        k: common_vendor.o(($event) => navigateToOrderList("undelivered")),
        l: common_assets._imports_3,
        m: common_vendor.o(($event) => navigateToOrderList("delivered")),
        n: common_assets._imports_4,
        o: common_vendor.o(($event) => navigateToOrderList("completed")),
        p: common_assets._imports_5,
        q: common_vendor.o(($event) => navigateToOrderList("after-sale")),
        r: common_vendor.f(toolsList.value, (item, k0, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.name),
            c: item.id,
            d: common_vendor.o(($event) => handleToolClick(item), item.id)
          };
        }),
        s: common_assets._imports_0$4,
        t: common_vendor.o(handleContact)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map
