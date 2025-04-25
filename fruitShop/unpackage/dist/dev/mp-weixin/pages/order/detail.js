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
  __name: "detail",
  setup(__props) {
    const orderItems = common_vendor.ref([]);
    const orderId = common_vendor.ref("");
    const orderStatus = common_vendor.ref(null);
    const getOrderDetail = async () => {
      if (!orderId.value)
        return;
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const result = await utils_request.request({
          url: `https://bgnc.online/api/order/${orderId.value}`,
          method: "GET"
        });
        if (result.code === 200) {
          if (result.data && Array.isArray(result.data)) {
            orderItems.value = result.data;
            common_vendor.index.__f__("log", "at pages/order/detail.vue:108", "订单商品:", orderItems.value);
          } else if (result.data && typeof result.data === "object") {
            orderItems.value = result.data.orderItems || [];
            orderStatus.value = result.data.status;
            common_vendor.index.__f__("log", "at pages/order/detail.vue:113", "订单状态:", orderStatus.value);
          }
        } else {
          common_vendor.index.showToast({
            title: result.message || "获取订单详情失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/detail.vue:122", "获取订单详情失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后再试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const getTotalQuantity = () => {
      return orderItems.value.reduce((total, item) => {
        return total + (parseInt(item.productQuantity) || 0);
      }, 0);
    };
    const getTotalPrice = () => {
      const total = orderItems.value.reduce((sum, item) => {
        return sum + (parseFloat(item.productPrice) || 0) * (parseInt(item.productQuantity) || 0);
      }, 0);
      return total.toFixed(2);
    };
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hour = date.getHours().toString().padStart(2, "0");
      const minute = date.getMinutes().toString().padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}`;
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const handleContact = (e) => {
      common_vendor.index.__f__("log", "at pages/order/detail.vue:164", "联系客服事件触发:", e.detail);
    };
    const getStatusText = (status) => {
      switch (parseInt(status)) {
        case 0:
          return "待支付";
        case 1:
          return "待发货";
        case 2:
          return "待收货";
        case 3:
          return "已完成";
        case 4:
          return "退款/售后";
        default:
          return "未知状态";
      }
    };
    const handlePay = () => {
      common_vendor.index.showToast({
        title: "正在跳转到支付...",
        icon: "none"
      });
      setTimeout(() => {
        common_vendor.index.showToast({
          title: "支付成功",
          icon: "success"
        });
        getOrderDetail();
      }, 1500);
    };
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at pages/order/detail.vue:206", "订单详情页面参数:", options);
      if (options.id) {
        orderId.value = options.id;
        getOrderDetail();
      } else {
        common_vendor.index.showToast({
          title: "订单ID不存在",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(orderId.value),
        b: orderStatus.value
      }, orderStatus.value ? common_vendor.e({
        c: orderStatus.value === 0
      }, orderStatus.value === 0 ? {
        d: common_assets._imports_0$3
      } : {}, {
        e: common_vendor.t(getStatusText(orderStatus.value))
      }) : {}, {
        f: common_vendor.p({
          type: "shop",
          size: "18",
          color: "#3b78db"
        }),
        g: common_vendor.f(orderItems.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.productPic || "/static/images/default-product.png",
            b: common_vendor.t(item.productName),
            c: item.productAttr
          }, item.productAttr ? {
            d: common_vendor.t(item.productAttr)
          } : {}, {
            e: common_vendor.t(item.productPrice),
            f: common_vendor.t(item.productQuantity),
            g: index
          });
        }),
        h: common_vendor.t(getTotalQuantity()),
        i: common_vendor.t(getTotalPrice()),
        j: common_vendor.p({
          type: "star",
          size: "18",
          color: "#3b78db"
        }),
        k: common_vendor.p({
          type: "shop",
          size: "50",
          color: "#ddd"
        }),
        l: common_vendor.t(formatDate(/* @__PURE__ */ new Date())),
        m: common_vendor.o(goBack),
        n: orderStatus.value === 0
      }, orderStatus.value === 0 ? {
        o: common_assets._imports_0$3,
        p: common_vendor.o(handlePay)
      } : {}, {
        q: common_vendor.o(handleContact)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/detail.js.map
