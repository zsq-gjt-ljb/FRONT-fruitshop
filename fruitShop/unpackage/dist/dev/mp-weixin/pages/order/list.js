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
      { name: "退款/售后", value: 4 }
    ]);
    const activeTab = common_vendor.ref("");
    const orderList = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const switchTab = (tabValue) => {
      if (activeTab.value === tabValue)
        return;
      activeTab.value = tabValue;
      page.value = 1;
      orderList.value = [];
      hasMore.value = true;
      getOrderList();
    };
    const getOrderList = async () => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        const params = {
          page: page.value,
          pageSize: pageSize.value
        };
        if (activeTab.value !== "") {
          params.status = activeTab.value;
        }
        const result = await utils_request.request({
          url: "http://82.156.12.240:8080/api/order/list",
          method: "GET",
          data: params
        });
        if (result.code === 200) {
          const orders = result.data || [];
          if (page.value === 1) {
            orderList.value = orders;
          } else {
            orderList.value = [...orderList.value, ...orders];
          }
          hasMore.value = false;
          if (hasMore.value) {
            page.value++;
          }
        } else {
          common_vendor.index.showToast({
            title: result.message || "获取订单失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/order/list.vue:162", "获取订单列表失败:", error);
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
    const confirmReceived = async (orderId) => {
      common_vendor.index.showModal({
        title: "确认收货",
        content: "确认已收到商品吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await utils_request.request({
                url: `http://82.156.12.240:8080/api/order/receive/${orderId}`,
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
              common_vendor.index.__f__("error", "at pages/order/list.vue:228", "确认收货失败:", error);
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
      common_vendor.index.__f__("log", "at pages/order/list.vue:248", "订单列表页面参数:", options);
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
      common_vendor.index.__f__("log", "at pages/order/list.vue:286", "订单列表页面已加载");
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
            b: common_vendor.t(getStatusText(order.status)),
            c: common_vendor.t(order.receiverName),
            d: common_vendor.t(order.receiverPhone),
            e: common_vendor.t(order.receiverProvince),
            f: common_vendor.t(order.receiverCity),
            g: common_vendor.t(order.receiverRegion),
            h: common_vendor.t(order.receiverDetailAddress),
            i: order.deliveryCompany
          }, order.deliveryCompany ? {
            j: common_vendor.t(order.deliveryCompany)
          } : {}, {
            k: common_vendor.t(order.totalAmount),
            l: common_vendor.t(order.freightAmount),
            m: common_vendor.t(order.payAmount),
            n: order.status === 2
          }, order.status === 2 ? {
            o: common_vendor.o(($event) => confirmReceived(order.id), order.id)
          } : {}, {
            p: order.status === 4
          }, order.status === 4 ? {
            q: common_vendor.o(($event) => goToDetail(order.id), order.id)
          } : {}, {
            r: order.id,
            s: common_vendor.o(($event) => goToDetail(order.id), order.id)
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
