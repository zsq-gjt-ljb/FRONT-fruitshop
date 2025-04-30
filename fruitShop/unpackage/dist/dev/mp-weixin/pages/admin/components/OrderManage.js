"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_request = require("../../../utils/request.js");
const utils_excelUtils = require("../../../utils/excelUtils.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_popup2 + _easycom_uni_icons2)();
}
const _easycom_uni_popup = () => "../../../node-modules/@dcloudio/uni-ui/lib/uni-popup/uni-popup.js";
const _easycom_uni_icons = () => "../../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_popup + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "OrderManage",
  setup(__props) {
    const exporting = common_vendor.ref(false);
    const exportStatusIndex = common_vendor.ref(0);
    const showExportOptions = common_vendor.ref(false);
    const orderStatus = ["全部状态", "已失效(-1)", "待发货(1)", "待收货(2)", "已完成(3)", "退款/售后(4)"];
    const statusIndex = common_vendor.ref(0);
    const orderList = common_vendor.ref([]);
    const total = common_vendor.ref(0);
    const pageSize = common_vendor.ref(10);
    const pageNum = common_vendor.ref(1);
    const totalPages = common_vendor.computed(() => {
      return Math.ceil(total.value / pageSize.value) || 1;
    });
    const shipPopup = common_vendor.ref(null);
    const statusPopup = common_vendor.ref(null);
    const exportPopup = common_vendor.ref(null);
    const currentOrderId = common_vendor.ref("");
    const currentStatus = common_vendor.ref(0);
    const originalStatus = common_vendor.ref(0);
    const shipForm = common_vendor.ref({
      trackingNo: ""
    });
    const onStatusChange = (e) => {
      statusIndex.value = e.detail.value;
    };
    const getOrderList = async () => {
      try {
        common_vendor.index.showLoading({
          title: "加载中"
        });
        let url = `https://bgnc.online/api/order/all?pageNum=${pageNum.value}&pageSize=${pageSize.value}&orderByColumn=createTime&isAsc=desc`;
        if (statusIndex.value > 0) {
          const statusMap = {
            1: -1,
            // 已失效
            2: 1,
            // 待发货
            3: 2,
            // 待收货
            4: 3,
            // 已完成
            5: 4
            // 退款/售后
          };
          url += `&status=${statusMap[statusIndex.value]}`;
        }
        const res = await utils_request.request({
          url,
          method: "GET"
        });
        if (res.code === 200 && res.data) {
          common_vendor.index.__f__("log", "at pages/admin/components/OrderManage.vue:248", "订单数据:", res.data);
          if (res.data.rows && Array.isArray(res.data.rows)) {
            orderList.value = res.data.rows.filter((order) => order.status !== 0);
            total.value = res.data.total || 0;
          }
        } else {
          common_vendor.index.showToast({
            title: res.msg || "获取订单列表失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/OrderManage.vue:262", "获取订单列表失败", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后再试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const handleSearch = () => {
      pageNum.value = 1;
      getOrderList();
    };
    const handleReset = () => {
      statusIndex.value = 0;
      pageNum.value = 1;
      getOrderList();
    };
    const prevPage = () => {
      if (pageNum.value > 1) {
        pageNum.value--;
        getOrderList();
      }
    };
    const nextPage = () => {
      if (pageNum.value < totalPages.value) {
        pageNum.value++;
        getOrderList();
      }
    };
    const getStatusText = (status) => {
      switch (parseInt(status)) {
        case -1:
          return "已失效";
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
    const getStatusClass = (status) => {
      switch (parseInt(status)) {
        case -1:
          return "status-invalid";
        case 1:
          return "status-pending-delivery";
        case 2:
          return "status-pending-receipt";
        case 3:
          return "status-completed";
        case 4:
          return "status-after-sale";
        default:
          return "status-unknown";
      }
    };
    const viewOrderDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/order/detail?id=${id}&admin=true`
      });
    };
    const handleShip = (id) => {
      currentOrderId.value = id;
      shipForm.value = {
        trackingNo: ""
      };
      shipPopup.value.open();
    };
    const cancelShip = () => {
      shipPopup.value.close();
    };
    const confirmShip = async () => {
      if (!shipForm.value.trackingNo.trim()) {
        common_vendor.index.showToast({
          title: "请输入物流单号",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "处理中"
        });
        const res = await utils_request.request({
          url: `https://bgnc.online/api/order/`,
          method: "PUT",
          data: {
            id: currentOrderId.value,
            status: 2,
            // 更新状态为待收货
            deliverySn: shipForm.value.trackingNo
          }
        });
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "发货成功",
            icon: "success"
          });
          shipPopup.value.close();
          getOrderList();
        } else {
          common_vendor.index.showToast({
            title: res.msg || "发货失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/OrderManage.vue:397", "发货失败", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后再试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const formatDate = (dateStr) => {
      if (!dateStr)
        return "暂无";
      try {
        const date = new Date(dateStr.replace(" ", "T"));
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const hour = date.getHours().toString().padStart(2, "0");
        const minute = date.getMinutes().toString().padStart(2, "0");
        return `${year}-${month}-${day} ${hour}:${minute}`;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/admin/components/OrderManage.vue:422", "日期格式化错误:", e, dateStr);
        return dateStr;
      }
    };
    const formatPhone = (phone) => {
      if (!phone)
        return "暂无";
      return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
    };
    const formatAddress = (order) => {
      if (!order)
        return "暂无";
      return `${order.receiverProvince}${order.receiverCity}${order.receiverRegion} ${order.receiverDetailAddress}`;
    };
    const formatOrderId = (id) => {
      if (!id)
        return "暂无";
      if (id.length <= 12)
        return id;
      return id.substring(0, 6) + "..." + id.substring(id.length - 6);
    };
    const copyOrderId = (id) => {
      common_vendor.index.setClipboardData({
        data: id,
        success: () => {
          common_vendor.index.showToast({
            title: "订单号已复制",
            icon: "success"
          });
        }
      });
    };
    common_vendor.onMounted(() => {
      getOrderList();
      common_vendor.index.__f__("log", "at pages/admin/components/OrderManage.vue:463", "弹窗引用:", { shipPopup: shipPopup.value, statusPopup: statusPopup.value, exportPopup: exportPopup.value });
    });
    const handleExport = async () => {
      if (exporting.value)
        return;
      showExportOptions.value = true;
      common_vendor.nextTick$1(() => {
        if (exportPopup.value) {
          exportPopup.value.open();
        } else {
          common_vendor.index.__f__("error", "at pages/admin/components/OrderManage.vue:477", "导出弹窗组件引用不存在");
          common_vendor.index.showToast({
            title: "打开导出选项失败",
            icon: "none"
          });
        }
      });
    };
    const confirmExport = async () => {
      try {
        exporting.value = true;
        showExportOptions.value = false;
        if (exportPopup.value) {
          exportPopup.value.close();
        }
        let exportUrl = "https://bgnc.online/api/order/excel";
        if (exportStatusIndex.value > 0) {
          const statusMap = {
            1: -1,
            // 已失效
            2: 1,
            // 待发货
            3: 2,
            // 待收货
            4: 3,
            // 已完成
            5: 4
            // 退款/售后
          };
          exportUrl += `?status=${statusMap[exportStatusIndex.value]}`;
        }
        utils_excelUtils.getExcelFromApi({
          url: exportUrl,
          method: "GET",
          header: {
            "content-type": "application/vnd.ms-excel"
          },
          success: (result) => {
            common_vendor.index.__f__("log", "at pages/admin/components/OrderManage.vue:520", "Excel数据解析成功:", result);
            utils_excelUtils.exportToUserSelectedLocation({
              data: result.data,
              headers: Object.keys(result.data[0] || {}),
              fileName: `订单数据_${getOrderStatusText()}_${Date.now()}.xlsx`,
              success: () => {
                common_vendor.index.__f__("log", "at pages/admin/components/OrderManage.vue:528", "文件导出成功");
              },
              fail: (error) => {
                common_vendor.index.__f__("error", "at pages/admin/components/OrderManage.vue:531", "文件导出失败:", error);
                common_vendor.index.showToast({
                  title: "导出失败，请重试",
                  icon: "none"
                });
              }
            });
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at pages/admin/components/OrderManage.vue:540", "获取Excel数据失败:", error);
            common_vendor.index.showToast({
              title: "导出失败，请重试",
              icon: "none"
            });
          },
          complete: () => {
            exporting.value = false;
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/OrderManage.vue:551", "导出订单失败:", error);
        common_vendor.index.showToast({
          title: "导出失败，请重试",
          icon: "none"
        });
        exporting.value = false;
      }
    };
    const cancelExport = () => {
      showExportOptions.value = false;
      if (exportPopup.value) {
        exportPopup.value.close();
      }
    };
    const getOrderStatusText = () => {
      if (exportStatusIndex.value === 0)
        return "全部";
      const statusTexts = ["全部", "已失效", "待发货", "待收货", "已完成", "退款售后"];
      return statusTexts[exportStatusIndex.value];
    };
    const handleStatusChange = (id, status) => {
      currentOrderId.value = id;
      currentStatus.value = parseInt(status);
      originalStatus.value = parseInt(status);
      statusPopup.value.open();
    };
    const selectStatus = (index) => {
      currentStatus.value = index;
    };
    const cancelStatusChange = () => {
      statusPopup.value.close();
    };
    const confirmStatusChange = async () => {
      if (currentStatus.value === originalStatus.value) {
        statusPopup.value.close();
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "处理中"
        });
        const res = await utils_request.request({
          url: `https://bgnc.online/api/order/`,
          method: "PUT",
          data: {
            id: currentOrderId.value,
            status: currentStatus.value
          }
        });
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "状态修改成功",
            icon: "success"
          });
          statusPopup.value.close();
          getOrderList();
        } else {
          common_vendor.index.showToast({
            title: res.msg || "状态修改失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/OrderManage.vue:630", "状态修改失败", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后再试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(orderStatus[statusIndex.value]),
        b: orderStatus,
        c: statusIndex.value,
        d: common_vendor.o(onStatusChange),
        e: common_vendor.o(handleSearch),
        f: common_vendor.o(handleReset),
        g: common_vendor.t(exporting.value ? "导出中..." : "导出"),
        h: common_vendor.o(handleExport),
        i: exporting.value,
        j: common_vendor.f(orderList.value, (order, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(getStatusText(order.status)),
            b: common_vendor.n(getStatusClass(order.status)),
            c: common_vendor.o(($event) => handleStatusChange(order.id, order.status), order.id),
            d: common_vendor.t(formatDate(order.createTime)),
            e: order.timeToLive
          }, order.timeToLive ? {
            f: common_vendor.t(order.timeToLive)
          } : {}, {
            g: common_vendor.t(formatOrderId(order.id)),
            h: common_vendor.o(($event) => copyOrderId(order.id), order.id),
            i: common_vendor.t(order.receiverName),
            j: common_vendor.t(formatPhone(order.receiverPhone)),
            k: common_vendor.t(order.payAmount),
            l: common_vendor.t(order.freightAmount),
            m: common_vendor.t(formatAddress(order)),
            n: common_vendor.o(($event) => viewOrderDetail(order.id), order.id),
            o: order.status === 0 || order.status === 1
          }, order.status === 0 || order.status === 1 ? {
            p: common_vendor.o(($event) => handleShip(order.id), order.id)
          } : {}, {
            q: order.id
          });
        }),
        k: orderList.value.length === 0
      }, orderList.value.length === 0 ? {} : {}, {
        l: common_vendor.t(total.value),
        m: common_vendor.t(pageSize.value),
        n: pageNum.value <= 1,
        o: common_vendor.o(prevPage),
        p: common_vendor.t(pageNum.value),
        q: common_vendor.t(totalPages.value),
        r: pageNum.value >= totalPages.value,
        s: common_vendor.o(nextPage),
        t: shipForm.value.trackingNo,
        v: common_vendor.o(($event) => shipForm.value.trackingNo = $event.detail.value),
        w: common_vendor.o(cancelShip),
        x: common_vendor.o(confirmShip),
        y: common_vendor.sr(shipPopup, "2b3493e8-0", {
          "k": "shipPopup"
        }),
        z: common_vendor.p({
          type: "center"
        }),
        A: common_vendor.f(["待发货", "待收货", "已完成", "退款/售后"], (status, index, i0) => {
          return {
            a: common_vendor.n(`status-dot-${index + 1}`),
            b: common_vendor.t(status),
            c: index,
            d: common_vendor.n({
              active: currentStatus.value === index + 1
            }),
            e: common_vendor.o(($event) => selectStatus(index + 1), index)
          };
        }),
        B: common_vendor.o(cancelStatusChange),
        C: common_vendor.o(confirmStatusChange),
        D: common_vendor.sr(statusPopup, "2b3493e8-1", {
          "k": "statusPopup"
        }),
        E: common_vendor.p({
          type: "center"
        }),
        F: common_vendor.t(orderStatus[exportStatusIndex.value]),
        G: common_vendor.p({
          type: "bottom",
          size: "14",
          color: "#666"
        }),
        H: orderStatus,
        I: exportStatusIndex.value,
        J: common_vendor.o((e) => exportStatusIndex.value = e.detail.value),
        K: common_vendor.o(cancelExport),
        L: common_vendor.o(confirmExport),
        M: common_vendor.sr(exportPopup, "2b3493e8-2", {
          "k": "exportPopup"
        }),
        N: common_vendor.p({
          type: "center"
        })
      });
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/admin/components/OrderManage.js.map
