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
    const orderCreateTime = common_vendor.ref(null);
    const orderPayTime = common_vendor.ref(null);
    const payLoading = common_vendor.ref(false);
    const orderTimeLeft = common_vendor.ref("");
    const isOrderExpired = common_vendor.ref(false);
    let orderTimer = null;
    const timeToLive = common_vendor.ref("");
    const isTimeoutOrder = common_vendor.ref(false);
    const freightAmount = common_vendor.ref("");
    const payAmount = common_vendor.ref("");
    const deliverySn = common_vendor.ref("");
    const deliveryCompany = common_vendor.ref("");
    const receiverPhone = common_vendor.ref("");
    const logisticsData = common_vendor.ref([]);
    const logisticsLoading = common_vendor.ref(false);
    const formatCreateTime = common_vendor.computed(() => {
      if (!orderCreateTime.value)
        return "暂无";
      return orderCreateTime.value;
    });
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
        common_vendor.index.__f__("log", "at pages/order/detail.vue:202", "获取订单详情结果:", JSON.stringify(result));
        if (result.code === 200) {
          if (result.data) {
            freightAmount.value = result.data.freightAmount || "0.00";
            payAmount.value = result.data.payAmount || "";
            if (!payAmount.value) {
              const totalProductPrice = getTotalPrice();
              const freight = parseFloat(freightAmount.value) || 0;
              const total = parseFloat(totalProductPrice) + freight;
              payAmount.value = total.toFixed(2);
            }
            let isTimeout = false;
            if (result.data.timeToLive === "已超时") {
              isTimeout = true;
              timeToLive.value = "已超时";
              isTimeoutOrder.value = true;
            } else if (result.data.orderItemList && result.data.orderItemList[0] && result.data.orderItemList[0].timeToLive === "已超时") {
              isTimeout = true;
              timeToLive.value = "已超时";
              isTimeoutOrder.value = true;
            } else if (result.data.timeToLive) {
              timeToLive.value = result.data.timeToLive;
            }
            if (isTimeout && result.data.status === 0) {
              const updateResult = await updateOrderStatus(-1);
              if (!updateResult) {
                common_vendor.index.__f__("error", "at pages/order/detail.vue:243", "订单状态更新失败,重试一次");
                await updateOrderStatus(-1);
              }
              orderStatus.value = -1;
              setTimeout(() => {
                common_vendor.index.showToast({
                  title: "订单已超时自动取消",
                  icon: "none",
                  duration: 2e3
                });
                setTimeout(() => {
                  navigateBack();
                }, 1e3);
              }, 500);
              return;
            } else {
              orderStatus.value = result.data.status;
              if (result.data.status === 0 && !isTimeout) {
                if (result.data.createTime) {
                  orderCreateTime.value = result.data.createTime;
                  startOrderTimer();
                }
              }
            }
            if (result.data.orderItemList && Array.isArray(result.data.orderItemList)) {
              orderItems.value = result.data.orderItemList;
            }
            if (result.data.createTime) {
              orderCreateTime.value = result.data.createTime;
            }
            if (result.data.payTime) {
              orderPayTime.value = formatDate(new Date(result.data.payTime));
            }
            if (result.data.deliverySn) {
              deliverySn.value = result.data.deliverySn;
              deliveryCompany.value = result.data.deliveryCompany || "顺丰速运";
              if (result.data.receiverPhone) {
                receiverPhone.value = result.data.receiverPhone.slice(-4);
                if (result.data.status === 2) {
                  queryLogistics();
                }
              }
            }
          }
        } else {
          common_vendor.index.showToast({
            title: result.msg || "获取订单详情失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/detail.vue:313", "获取订单详情失败:", error);
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
      let total = 0;
      if (orderItems.value && orderItems.value.length > 0) {
        total = orderItems.value.reduce((sum, item) => {
          return sum + (parseFloat(item.productPrice) || 0);
        }, 0);
      }
      return total.toFixed(2);
    };
    const navigateBack = () => {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        const prevPage = pages[pages.length - 2];
        if (prevPage && prevPage.route === "pages/order/list") {
          if (typeof prevPage.$vm.getOrderList === "function") {
            prevPage.$vm.pageNum = 1;
            prevPage.$vm.orderList = [];
            prevPage.$vm.getOrderList();
          }
        }
      }
      common_vendor.index.navigateBack();
    };
    const handleContact = (e) => {
      common_vendor.index.__f__("log", "at pages/order/detail.vue:370", "联系客服事件触发:", e.detail);
    };
    const getStatusText = (status) => {
      switch (parseInt(status)) {
        case -1:
          return "已失效";
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
    const handlePay = async () => {
      if (payLoading.value)
        return;
      try {
        payLoading.value = true;
        common_vendor.index.showLoading({
          title: "正在获取支付信息..."
        });
        const loginResult = await common_vendor.index.login();
        if (!loginResult.code) {
          throw new Error("获取微信登录code失败");
        }
        common_vendor.index.__f__("log", "at pages/order/detail.vue:410", "获取到微信登录code:", loginResult.code);
        const paymentResult = await utils_request.request({
          url: "https://bgnc.online/api/notify/payment",
          method: "POST",
          data: {
            orderId: orderId.value,
            code: loginResult.code
          }
        });
        common_vendor.index.__f__("log", "at pages/order/detail.vue:422", "获取到支付参数:", paymentResult);
        if (paymentResult.code !== 200 || !paymentResult.data) {
          throw new Error(paymentResult.message || "获取支付参数失败");
        }
        common_vendor.index.showLoading({ title: "正在拉起支付..." });
        await new Promise((resolve, reject) => {
          common_vendor.index.requestPayment({
            provider: "wxpay",
            timeStamp: paymentResult.data.timeStamp,
            nonceStr: paymentResult.data.nonceStr,
            package: paymentResult.data.packageVal,
            signType: paymentResult.data.signType,
            paySign: paymentResult.data.paySign,
            success: (res) => {
              common_vendor.index.__f__("log", "at pages/order/detail.vue:440", "支付成功", res);
              resolve(res);
            },
            fail: (err) => {
              common_vendor.index.__f__("log", "at pages/order/detail.vue:444", "支付失败", err);
              reject(err);
            }
          });
        });
        common_vendor.index.showToast({
          title: "支付成功",
          icon: "success"
        });
        try {
          await utils_request.request({
            url: `https://bgnc.online/api/order/`,
            method: "PUT",
            data: {
              id: orderId.value,
              status: 1
              // 待发货状态
            }
          });
          common_vendor.index.__f__("log", "at pages/order/detail.vue:466", "订单状态已更新为待发货");
        } catch (updateError) {
          common_vendor.index.__f__("error", "at pages/order/detail.vue:468", "更新订单状态失败:", updateError);
        }
        setTimeout(() => {
          getOrderDetail();
        }, 1e3);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/detail.vue:477", "支付过程发生错误:", error);
        common_vendor.index.hideLoading();
        if (error.errMsg && error.errMsg.includes("cancel")) {
          common_vendor.index.showToast({
            title: "用户取消支付",
            icon: "none"
          });
        } else {
          common_vendor.index.showToast({
            title: error.message || "支付失败",
            icon: "none"
          });
        }
      } finally {
        common_vendor.index.hideLoading();
        payLoading.value = false;
      }
    };
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hour = date.getHours().toString().padStart(2, "0");
      const minute = date.getMinutes().toString().padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}`;
    };
    const showPayButton = common_vendor.computed(() => {
      common_vendor.index.__f__("log", "at pages/order/detail.vue:509", "计算是否显示支付按钮, 当前状态:", orderStatus.value);
      return orderStatus.value === 0 && !isOrderExpired.value && !isTimeoutOrder.value;
    });
    const calculateOrderTimeLeft = () => {
      if (!orderCreateTime.value)
        return;
      const createTime = new Date(orderCreateTime.value.replace(/-/g, "/"));
      const expireTime = new Date(createTime.getTime() + 15 * 60 * 1e3);
      const now = /* @__PURE__ */ new Date();
      if (now >= expireTime) {
        orderTimeLeft.value = "00:00";
        isOrderExpired.value = true;
        clearInterval(orderTimer);
        handleOrderExpired();
        return;
      }
      const diffMs = expireTime - now;
      const diffMin = Math.floor(diffMs / 6e4);
      const diffSec = Math.floor(diffMs % 6e4 / 1e3);
      orderTimeLeft.value = `${String(diffMin).padStart(2, "0")}:${String(diffSec).padStart(2, "0")}`;
    };
    const handleOrderExpired = async () => {
      common_vendor.index.__f__("log", "at pages/order/detail.vue:543", "订单已超时，准备更新订单状态");
      try {
        if (orderStatus.value !== 0) {
          common_vendor.index.__f__("log", "at pages/order/detail.vue:548", "订单状态不是待支付,无需更新");
          return;
        }
        const result = await utils_request.request({
          url: `https://bgnc.online/api/order/`,
          method: "PUT",
          data: {
            id: orderId.value,
            status: -1
          }
        });
        if (result.code === 200) {
          common_vendor.index.__f__("log", "at pages/order/detail.vue:563", "订单状态更新为已失效");
          orderStatus.value = -1;
          isOrderExpired.value = true;
          common_vendor.index.showToast({
            title: "订单已超时自动取消",
            icon: "none",
            duration: 2e3
          });
          setTimeout(() => {
            navigateBack();
          }, 2e3);
        } else {
          common_vendor.index.__f__("error", "at pages/order/detail.vue:577", "更新订单状态失败:", result.msg);
          setTimeout(async () => {
            await updateOrderStatus(-1);
          }, 1e3);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/detail.vue:584", "更新订单状态失败:", error);
        setTimeout(async () => {
          await updateOrderStatus(-1);
        }, 1e3);
      }
    };
    const startOrderTimer = () => {
      if (orderTimer) {
        clearInterval(orderTimer);
      }
      calculateOrderTimeLeft();
      orderTimer = setInterval(() => {
        calculateOrderTimeLeft();
      }, 1e3);
    };
    const updateOrderStatus = async (status) => {
      try {
        common_vendor.index.__f__("log", "at pages/order/detail.vue:611", `更新订单状态为: ${status}`);
        const res = await utils_request.request({
          url: `https://bgnc.online/api/order/`,
          method: "PUT",
          data: {
            id: orderId.value,
            status
          }
        });
        if (res.code === 200) {
          common_vendor.index.__f__("log", "at pages/order/detail.vue:623", "订单状态更新成功");
          orderStatus.value = status;
          return true;
        } else {
          common_vendor.index.__f__("error", "at pages/order/detail.vue:627", "订单状态更新失败:", res.msg);
          return false;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/detail.vue:631", "更新订单状态失败:", error);
        return false;
      }
    };
    const queryLogistics = async () => {
      if (!deliverySn.value || !receiverPhone.value) {
        common_vendor.index.showToast({
          title: "缺少物流信息",
          icon: "none"
        });
        return;
      }
      logisticsLoading.value = true;
      logisticsData.value = [];
      try {
        const routeRes = await utils_request.request({
          url: `https://bgnc.online/api/order/route?phoneNumber=${receiverPhone.value}&orderNumber=${deliverySn.value}`,
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/order/detail.vue:656", "路由查询结果:", routeRes);
        if (routeRes.code === 200) {
          if (routeRes.data && Array.isArray(routeRes.data)) {
            logisticsData.value = routeRes.data;
          } else {
            common_vendor.index.__f__("error", "at pages/order/detail.vue:662", "路由查询失败:", routeRes.msg);
          }
        } else {
          common_vendor.index.__f__("error", "at pages/order/detail.vue:665", "路由查询失败:", routeRes.msg);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/detail.vue:668", "路由查询失败:", error);
      } finally {
        logisticsLoading.value = false;
      }
    };
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at pages/order/detail.vue:676", "订单详情页面参数:", options);
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
    common_vendor.onUnmounted(() => {
      if (orderTimer) {
        clearInterval(orderTimer);
        orderTimer = null;
      }
    });
    const goBack = () => {
      navigateBack();
    };
    const formatAmount = (amount) => {
      if (!amount && amount !== 0)
        return "0.00";
      return parseFloat(amount).toFixed(2);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(orderId.value),
        b: orderStatus.value != null
      }, orderStatus.value != null ? common_vendor.e({
        c: orderStatus.value === 0
      }, orderStatus.value === 0 ? {
        d: common_assets._imports_0$6
      } : {}, {
        e: common_vendor.t(getStatusText(orderStatus.value))
      }) : {}, {
        f: common_vendor.t(formatCreateTime.value),
        g: orderStatus.value === 0 && isTimeoutOrder.value
      }, orderStatus.value === 0 && isTimeoutOrder.value ? {
        h: common_vendor.t(timeToLive.value)
      } : {}, {
        i: common_vendor.p({
          type: "shop",
          size: "18",
          color: "#3b78db"
        }),
        j: common_vendor.f(orderItems.value, (item, index, i0) => {
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
        k: common_vendor.t(getTotalQuantity()),
        l: common_vendor.t(getTotalPrice()),
        m: common_vendor.t(formatAmount(freightAmount.value)),
        n: common_vendor.t(formatAmount(payAmount.value)),
        o: common_vendor.t(orderCreateTime.value || "暂无"),
        p: orderPayTime.value
      }, orderPayTime.value ? {
        q: common_vendor.t(orderPayTime.value)
      } : {}, {
        r: orderStatus.value === 0 && orderTimeLeft.value && !isOrderExpired.value
      }, orderStatus.value === 0 && orderTimeLeft.value && !isOrderExpired.value ? {
        s: common_vendor.t(orderTimeLeft.value)
      } : {}, {
        t: orderStatus.value === 0 && isOrderExpired.value
      }, orderStatus.value === 0 && isOrderExpired.value ? {} : {}, {
        v: orderStatus.value === 2 && deliverySn.value
      }, orderStatus.value === 2 && deliverySn.value ? common_vendor.e({
        w: common_vendor.p({
          type: "truck",
          size: "18",
          color: "#3b78db"
        }),
        x: common_vendor.t(deliveryCompany.value || "顺丰速运"),
        y: common_vendor.t(deliverySn.value),
        z: common_vendor.p({
          type: "refresh",
          size: "14",
          color: "#3b78db"
        }),
        A: common_vendor.o(queryLogistics),
        B: logisticsData.value.length > 0
      }, logisticsData.value.length > 0 ? {
        C: common_vendor.f(logisticsData.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.firstStatusName || "运输中"),
            b: common_vendor.t(item.acceptTime),
            c: common_vendor.t(item.acceptAddress),
            d: item.remark
          }, item.remark ? {
            e: common_vendor.t(item.remark)
          } : {}, {
            f: index,
            g: index === 0 ? 1 : ""
          });
        })
      } : logisticsLoading.value ? {
        E: common_vendor.p({
          type: "spinner-cycle",
          size: "24",
          color: "#ccc"
        })
      } : {}, {
        D: logisticsLoading.value
      }) : {}, {
        F: common_vendor.o(goBack),
        G: showPayButton.value
      }, showPayButton.value ? {
        H: common_vendor.t(formatAmount(payAmount.value)),
        I: common_vendor.o(handlePay),
        J: payLoading.value ? 1 : ""
      } : {}, {
        K: common_vendor.o(handleContact)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/detail.js.map
