"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "list",
  setup(__props) {
    const tabs = common_vendor.ref([
      { name: "全部", value: "" },
      { name: "待支付", value: 0 },
      { name: "待发货", value: 1 },
      { name: "待收货", value: 2 },
      { name: "已完成", value: 3 },
      { name: "退款/售后", value: 4 },
      { name: "已失效", value: -1 }
    ]);
    const activeTab = common_vendor.ref("");
    const orderList = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const switchTab = async (tabValue) => {
      if (activeTab.value === tabValue)
        return;
      activeTab.value = tabValue;
      page.value = 1;
      orderList.value = [];
      hasMore.value = true;
      await getOrderList(tabValue, true);
    };
    const getOrderList = async (tab = activeTab.value, refresh = false) => {
      if (refresh) {
        orderList.value = [];
        page.value = 1;
        hasMore.value = true;
      }
      if (!hasMore.value && !refresh) {
        common_vendor.index.__f__("log", "at pages/order/list.vue:144", "没有更多数据了");
        return;
      }
      isLoading.value = true;
      common_vendor.index.__f__("log", "at pages/order/list.vue:149", "请求订单列表数据，页码：", page.value, "状态：", tab);
      try {
        const result = await utils_request.request({
          url: "https://bgnc.online/api/order/list",
          method: "GET",
          data: {
            pageNum: page.value,
            pageSize: pageSize.value,
            status: tab
          }
        });
        common_vendor.index.__f__("log", "at pages/order/list.vue:162", "获取订单列表结果:", JSON.stringify(result));
        if (result.code === 200 && result.data) {
          let dataList = [];
          if (Array.isArray(result.data)) {
            dataList = result.data;
          } else if (result.data.list && Array.isArray(result.data.list)) {
            dataList = result.data.list;
          } else if (typeof result.data === "object") {
            for (const key in result.data) {
              if (Array.isArray(result.data[key])) {
                dataList = result.data[key];
                break;
              }
            }
          }
          common_vendor.index.__f__("log", "at pages/order/list.vue:185", "解析后的订单数据:", JSON.stringify(dataList));
          if (dataList.length > 0) {
            const processedOrders = await Promise.all(dataList.map(async (order) => {
              const newOrder = JSON.parse(JSON.stringify(order));
              if (newOrder.status === 0) {
                let isTimeout = false;
                if (newOrder.orderItemList && newOrder.orderItemList.length > 0) {
                  for (const item of newOrder.orderItemList) {
                    if (item.timeToLive === "已超时") {
                      isTimeout = true;
                      break;
                    }
                  }
                }
                if (newOrder.timeToLive === "已超时") {
                  isTimeout = true;
                }
                if (!isTimeout && newOrder.createTime) {
                  const timeLeft = calculateTimeLeft(newOrder.createTime);
                  newOrder.timeToLive = timeLeft;
                  if (newOrder.orderItemList && newOrder.orderItemList.length > 0) {
                    for (let j = 0; j < newOrder.orderItemList.length; j++) {
                      newOrder.orderItemList[j].timeToLive = timeLeft;
                    }
                  }
                  if (timeLeft === "已超时") {
                    isTimeout = true;
                  }
                }
                if (isTimeout) {
                  try {
                    const updateResult = await utils_request.request({
                      url: `https://bgnc.online/api/order/`,
                      method: "PUT",
                      data: {
                        id: newOrder.id,
                        status: -1
                      }
                    });
                    if (updateResult.code === 200) {
                      common_vendor.index.__f__("log", "at pages/order/list.vue:244", `订单 ${newOrder.id} 更新为已失效状态`);
                      newOrder.status = -1;
                    } else {
                      common_vendor.index.__f__("error", "at pages/order/list.vue:248", `订单 ${newOrder.id} 状态更新失败:`, updateResult.msg);
                    }
                  } catch (error) {
                    common_vendor.index.__f__("error", "at pages/order/list.vue:251", `更新订单 ${newOrder.id} 状态失败:`, error);
                  }
                }
              }
              return newOrder;
            }));
            if (refresh || page.value === 1) {
              orderList.value = processedOrders;
            } else {
              orderList.value = [...orderList.value, ...processedOrders];
            }
            if (processedOrders.length < pageSize.value) {
              hasMore.value = false;
            } else {
              page.value += 1;
              hasMore.value = true;
            }
          } else {
            hasMore.value = false;
            if (refresh || page.value === 1) {
              orderList.value = [];
            }
          }
        } else {
          common_vendor.index.showToast({
            title: result.msg || "获取订单列表失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/list.vue:287", "获取订单列表失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后再试",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
        common_vendor.index.stopPullDownRefresh();
      }
    };
    const loadMore = () => {
      if (hasMore.value && !isLoading.value) {
        getOrderList();
      }
    };
    const getStatusText = (order) => {
      const displayStatus = order.displayStatus !== void 0 ? order.displayStatus : order.status;
      switch (parseInt(displayStatus)) {
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
    const confirmReceived = async (orderId) => {
      common_vendor.index.showModal({
        title: "确认收货",
        content: "确认已收到商品吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await utils_request.request({
                url: `https://bgnc.online/api/order/receive/${orderId}`,
                method: "PUT"
              });
              if (result.code === 200) {
                common_vendor.index.showToast({
                  title: "确认收货成功",
                  icon: "success"
                });
                page.value = 1;
                orderList.value = [];
                getOrderList();
              } else {
                common_vendor.index.showToast({
                  title: result.message || "操作失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/order/list.vue:359", "确认收货失败:", error);
              common_vendor.index.showToast({
                title: "网络错误，请稍后再试",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const goToDetail = (orderId) => {
      common_vendor.index.navigateTo({
        url: `/pages/order/detail?id=${orderId}`
      });
    };
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at pages/order/list.vue:379", "订单列表页面参数:", options);
      if (options.status !== void 0) {
        const status = options.status === "" ? "" : parseInt(options.status);
        activeTab.value = status;
        const validTab = tabs.value.find((tab) => tab.value === status);
        if (!validTab) {
          activeTab.value = "";
        }
      }
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/order/list.vue:396", "订单列表页面显示,刷新数据");
      page.value = 1;
      orderList.value = [];
      hasMore.value = true;
      getOrderList();
    });
    common_vendor.onPullDownRefresh(() => {
      page.value = 1;
      orderList.value = [];
      hasMore.value = true;
      getOrderList();
    });
    common_vendor.onReachBottom(() => {
      loadMore();
    });
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/order/list.vue:419", "订单列表页面已加载");
    });
    const calculateTimeLeft = (createTime) => {
      if (!createTime)
        return "";
      const createDate = new Date(createTime);
      const deadline = new Date(createDate.getTime() + 30 * 60 * 1e3);
      const now = /* @__PURE__ */ new Date();
      if (now >= deadline) {
        return "已超时";
      }
      const timeLeft = deadline.getTime() - now.getTime();
      const minutes = Math.floor(timeLeft / (1e3 * 60));
      const seconds = Math.floor(timeLeft % (1e3 * 60) / 1e3);
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };
    const checkAndUpdateOrderStatus = async () => {
      if (!orderList.value || orderList.value.length === 0)
        return;
      for (let i = 0; i < orderList.value.length; i++) {
        const order = orderList.value[i];
        if (order.status === 0) {
          const timeLeft = calculateTimeLeft(order.createTime);
          if (order.orderItemList && order.orderItemList.length > 0) {
            for (let j = 0; j < order.orderItemList.length; j++) {
              orderList.value[i].orderItemList[j].timeToLive = timeLeft;
            }
          }
          orderList.value[i].timeToLive = timeLeft;
          if (timeLeft === "已超时") {
            try {
              const result = await utils_request.request({
                url: `https://bgnc.online/api/order/`,
                method: "PUT",
                data: {
                  id: order.id,
                  status: -1
                }
              });
              if (result.code === 200) {
                common_vendor.index.__f__("log", "at pages/order/list.vue:489", `列表中订单 ${order.id} 已超时，状态更新为已失效`);
                orderList.value[i].status = -1;
                orderList.value[i].timeToLive = "";
              } else {
                common_vendor.index.__f__("error", "at pages/order/list.vue:495", `列表中订单 ${order.id} 状态更新失败:`, result.msg);
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/order/list.vue:498", `列表中更新订单 ${order.id} 状态失败:`, error);
            }
          }
        } else {
          orderList.value[i].timeToLive = "";
          if (order.orderItemList && order.orderItemList.length > 0) {
            for (let j = 0; j < order.orderItemList.length; j++) {
              orderList.value[i].orderItemList[j].timeToLive = "";
            }
          }
        }
      }
    };
    let timer = null;
    common_vendor.onMounted(() => {
      timer = setInterval(() => {
        checkAndUpdateOrderStatus();
      }, 1e3);
    });
    common_vendor.onUnmounted(() => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(tabs.value, (tab, index, i0) => {
          return {
            a: common_vendor.t(tab.name),
            b: index,
            c: common_vendor.n(activeTab.value === tab.value ? "active" : ""),
            d: common_vendor.o(($event) => switchTab(tab.value), index)
          };
        }),
        b: orderList.value.length > 0
      }, orderList.value.length > 0 ? {
        c: common_vendor.f(orderList.value, (order, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(order.id),
            b: common_vendor.t(getStatusText(order)),
            c: order.status === 0 && order.timeToLive
          }, order.status === 0 && order.timeToLive ? {
            d: common_vendor.t(order.timeToLive)
          } : {}, {
            e: common_vendor.f(order.orderItemList, (item, k1, i1) => {
              return common_vendor.e({
                a: item.productPic,
                b: common_vendor.t(item.productName),
                c: item.productAttr
              }, item.productAttr ? {
                d: common_vendor.t(item.productAttr)
              } : {}, {
                e: common_vendor.t(item.productPrice),
                f: common_vendor.t(item.productQuantity),
                g: item.id
              });
            }),
            f: common_vendor.t(order.receiverName),
            g: common_vendor.t(order.receiverPhone),
            h: common_vendor.t(order.receiverProvince),
            i: common_vendor.t(order.receiverCity),
            j: common_vendor.t(order.receiverRegion),
            k: common_vendor.t(order.receiverDetailAddress),
            l: order.deliveryCompany
          }, order.deliveryCompany ? {
            m: common_vendor.t(order.deliveryCompany)
          } : {}, {
            n: common_vendor.t(order.totalAmount),
            o: common_vendor.t(order.freightAmount),
            p: common_vendor.t(order.payAmount),
            q: order.status === 2
          }, order.status === 2 ? {
            r: common_vendor.o(($event) => confirmReceived(order.id), order.id)
          } : {}, {
            s: order.status === 4
          }, order.status === 4 ? {
            t: common_vendor.o(($event) => goToDetail(order.id), order.id)
          } : {}, {
            v: order.id,
            w: common_vendor.o(($event) => goToDetail(order.id), order.id)
          });
        })
      } : {
        d: common_assets._imports_0$6
      }, {
        e: hasMore.value && orderList.value.length > 0
      }, hasMore.value && orderList.value.length > 0 ? common_vendor.e({
        f: isLoading.value
      }, isLoading.value ? {} : {
        g: common_vendor.o(loadMore)
      }) : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/order/list.js.map
