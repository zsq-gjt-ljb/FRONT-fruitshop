"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_request = require("../../../utils/request.js");
const utils_excelUtils = require("../../../utils/excelUtils.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../../node-modules/@dcloudio/uni-ui/lib/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
const _sfc_main = {
  __name: "OrderManage",
  setup(__props) {
    const exporting = common_vendor.ref(false);
    const orderStatus = ["全部状态", "待支付", "待发货", "待收货", "已完成", "退款/售后"];
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
    const currentOrderId = common_vendor.ref("");
    const currentStatus = common_vendor.ref(0);
    const originalStatus = common_vendor.ref(0);
    const shipForm = common_vendor.ref({
      company: "",
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
        if (statusIndex.value > 0)
          url += `&status=${statusIndex.value - 1}`;
        const res = await utils_request.request({
          url,
          method: "GET"
        });
        if (res.code === 200 && res.data) {
          common_vendor.index.__f__("log", "at pages/admin/components/OrderManage.vue:211", "订单数据:", res.data);
          if (res.data.rows && Array.isArray(res.data.rows)) {
            orderList.value = res.data.rows;
            total.value = res.data.total || 0;
          }
        } else {
          common_vendor.index.showToast({
            title: res.msg || "获取订单列表失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/OrderManage.vue:224", "获取订单列表失败", error);
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
    const getStatusClass = (status) => {
      switch (parseInt(status)) {
        case 0:
          return "status-pending-payment";
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
        company: "",
        trackingNo: ""
      };
      shipPopup.value.open();
    };
    const cancelShip = () => {
      shipPopup.value.close();
    };
    const confirmShip = async () => {
      if (!shipForm.value.company.trim()) {
        common_vendor.index.showToast({
          title: "请输入物流公司",
          icon: "none"
        });
        return;
      }
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
          url: `https://bgnc.online/api/order/ship/${currentOrderId.value}`,
          method: "PUT",
          data: {
            deliveryCompany: shipForm.value.company,
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
        common_vendor.index.__f__("error", "at pages/admin/components/OrderManage.vue:367", "发货失败", error);
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
        common_vendor.index.__f__("error", "at pages/admin/components/OrderManage.vue:392", "日期格式化错误:", e, dateStr);
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
    });
    const handleExport = async () => {
      if (exporting.value)
        return;
      try {
        exporting.value = true;
        utils_excelUtils.getExcelFromApi({
          url: "https://bgnc.online/api/order/excel",
          method: "GET",
          header: {
            "content-type": "application/vnd.ms-excel"
          },
          success: (result) => {
            common_vendor.index.__f__("log", "at pages/admin/components/OrderManage.vue:449", "Excel数据解析成功:", result);
            utils_excelUtils.exportToUserSelectedLocation({
              data: result.data,
              headers: Object.keys(result.data[0] || {}),
              fileName: `订单数据_${Date.now()}.xlsx`,
              success: () => {
                common_vendor.index.__f__("log", "at pages/admin/components/OrderManage.vue:457", "文件导出成功");
              },
              fail: (error) => {
                common_vendor.index.__f__("error", "at pages/admin/components/OrderManage.vue:460", "文件导出失败:", error);
                common_vendor.index.showToast({
                  title: "导出失败，请重试",
                  icon: "none"
                });
              }
            });
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at pages/admin/components/OrderManage.vue:469", "获取Excel数据失败:", error);
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
        common_vendor.index.__f__("error", "at pages/admin/components/OrderManage.vue:480", "导出订单失败:", error);
        common_vendor.index.showToast({
          title: "导出失败，请重试",
          icon: "none"
        });
        exporting.value = false;
      }
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
          url: `https://bgnc.online/api/order/status/${currentOrderId.value}`,
          method: "PUT",
          data: {
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
        common_vendor.index.__f__("error", "at pages/admin/components/OrderManage.vue:542", "状态修改失败", error);
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
            e: common_vendor.t(formatOrderId(order.id)),
            f: common_vendor.o(($event) => copyOrderId(order.id), order.id),
            g: common_vendor.t(order.receiverName),
            h: common_vendor.t(formatPhone(order.receiverPhone)),
            i: common_vendor.t(order.payAmount),
            j: common_vendor.t(order.freightAmount),
            k: common_vendor.t(formatAddress(order)),
            l: common_vendor.o(($event) => viewOrderDetail(order.id), order.id),
            m: order.status === 0 || order.status === 1
          }, order.status === 0 || order.status === 1 ? {
            n: common_vendor.o(($event) => handleShip(order.id), order.id)
          } : {}, {
            o: order.id
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
        t: shipForm.value.company,
        v: common_vendor.o(($event) => shipForm.value.company = $event.detail.value),
        w: shipForm.value.trackingNo,
        x: common_vendor.o(($event) => shipForm.value.trackingNo = $event.detail.value),
        y: common_vendor.o(cancelShip),
        z: common_vendor.o(confirmShip),
        A: common_vendor.sr(shipPopup, "1ad910d5-0", {
          "k": "shipPopup"
        }),
        B: common_vendor.p({
          type: "center"
        }),
        C: common_vendor.f(["待支付", "待发货", "待收货", "已完成", "退款/售后"], (status, index, i0) => {
          return {
            a: common_vendor.n(`status-dot-${index}`),
            b: common_vendor.t(status),
            c: index,
            d: common_vendor.n({
              active: currentStatus.value === index
            }),
            e: common_vendor.o(($event) => selectStatus(index), index)
          };
        }),
        D: common_vendor.o(cancelStatusChange),
        E: common_vendor.o(confirmStatusChange),
        F: common_vendor.sr(statusPopup, "1ad910d5-1", {
          "k": "statusPopup"
        }),
        G: common_vendor.p({
          type: "center"
        })
      });
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/admin/components/OrderManage.js.map
