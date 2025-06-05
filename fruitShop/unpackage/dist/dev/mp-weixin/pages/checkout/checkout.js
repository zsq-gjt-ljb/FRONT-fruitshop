"use strict";
const common_vendor = require("../../common/vendor.js");
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
  __name: "checkout",
  setup(__props) {
    const checkoutItems = common_vendor.ref([]);
    const addressList = common_vendor.ref([]);
    const selectedAddress = common_vendor.ref(null);
    const remark = common_vendor.ref("");
    const shippingFee = common_vendor.ref(0);
    const memberLevel = common_vendor.ref("");
    const orderType = common_vendor.ref("cart");
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:143", "结算页面参数:", options);
      if (options.type === "buyNow") {
        orderType.value = "buyNow";
      }
      checkGuestMode();
    });
    const checkGuestMode = () => {
      const isGuestMode = common_vendor.index.getStorageSync("isGuestMode");
      const token = common_vendor.index.getStorageSync("token");
      if (isGuestMode && !token) {
        const currentPage = "/" + getCurrentPages()[getCurrentPages().length - 1].route;
        common_vendor.index.navigateTo({
          url: "/pages/login/login?redirect=" + encodeURIComponent(currentPage),
          success: () => {
            common_vendor.index.showToast({
              title: "请先登录后再结算",
              icon: "none",
              duration: 2e3
            });
          }
        });
        return true;
      }
      return false;
    };
    const getMemberInfo = async () => {
      try {
        const result = await utils_request.request({
          url: "https://bgnc.online/api/user/profile",
          method: "GET"
        });
        if (result.code === 200) {
          memberLevel.value = result.data.memberLevel || "";
          common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:187", "获取到的会员等级:", memberLevel.value, "类型:", typeof memberLevel.value);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/checkout/checkout.vue:190", "获取会员信息失败:", error);
      }
    };
    const getAddressList = async () => {
      try {
        const result = await utils_request.request({
          url: "https://bgnc.online/api/addressbook/list",
          method: "GET"
        });
        if (result.code === 200) {
          addressList.value = result.data || [];
          common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:204", "获取到的地址列表:", JSON.stringify(addressList.value));
          const selectedAddressId = common_vendor.index.getStorageSync("selectedAddressId");
          common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:208", "已保存的选择地址ID:", selectedAddressId);
          if (selectedAddressId) {
            try {
              const addressDetail = await utils_request.request({
                url: `https://bgnc.online/api/addressbook/${selectedAddressId}`,
                method: "GET"
              });
              if (addressDetail.code === 200 && addressDetail.data) {
                common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:219", "通过API获取的地址详情:", addressDetail.data);
                selectedAddress.value = addressDetail.data;
                return;
              } else {
                common_vendor.index.__f__("error", "at pages/checkout/checkout.vue:223", "获取地址详情失败:", addressDetail.message);
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/checkout/checkout.vue:226", "获取地址详情API错误:", error);
            }
          }
          const defaultAddress = addressList.value.find((address) => address.isDefault);
          if (defaultAddress) {
            selectedAddress.value = defaultAddress;
          } else if (addressList.value.length > 0) {
            selectedAddress.value = addressList.value[0];
          }
          common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:240", "最终选择的地址:", selectedAddress.value);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/checkout/checkout.vue:243", "获取地址列表失败:", error);
      }
    };
    const loadCheckoutData = () => {
      try {
        const items = common_vendor.index.getStorageSync("checkoutItems");
        if (items) {
          checkoutItems.value = JSON.parse(items);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/checkout/checkout.vue:255", "读取结算数据失败:", error);
      }
    };
    const originalPrice = common_vendor.computed(() => {
      return checkoutItems.value.reduce((total, item) => {
        return total + parseFloat(item.price) * item.quantity;
      }, 0);
    });
    const updateDiscountFromApi = async () => {
      try {
        const res = await utils_request.request({
          url: "https://bgnc.online/api/discount/",
          method: "GET"
        });
        if (res.code === 200 && res.data) {
          const discountData = res.data.map((item) => ({
            ...item,
            // 转换为前端使用的折扣值: API的0.99 => 显示为9.9折
            discount: parseFloat(item.discount) * 10
          }));
          discountInfo.value = discountData;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/checkout/checkout.vue:286", "获取折扣率失败:", error);
      }
    };
    const discountInfo = common_vendor.ref([]);
    const userDiscount = common_vendor.computed(() => {
      if (!memberLevel.value || discountInfo.value.length === 0)
        return 10;
      const userDiscountInfo = discountInfo.value.find(
        (item) => item.memberLevel === Number(memberLevel.value)
      );
      return userDiscountInfo ? userDiscountInfo.discount : 10;
    });
    const discountAmount = common_vendor.computed(() => {
      if (userDiscount.value >= 10)
        return 0;
      const discountRate = (10 - userDiscount.value) / 10;
      const discount = originalPrice.value * discountRate;
      common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:315", "原始价格:", originalPrice.value, "折扣率:", discountRate, "折扣金额:", discount);
      if (discount > 0 && discount < 0.01) {
        return 0.01;
      }
      return discount;
    });
    const memberLevelText = common_vendor.computed(() => {
      const level = typeof memberLevel.value === "string" ? memberLevel.value : String(memberLevel.value);
      if (discountInfo.value.length > 0) {
        const userDiscountInfo = discountInfo.value.find(
          (item) => item.memberLevel === Number(level)
        );
        if (userDiscountInfo) {
          const discountDisplay = userDiscountInfo.discount.toFixed(1);
          return userDiscountInfo.discount >= 10 ? `V${level}会员(无折扣)` : `V${level}会员(${discountDisplay}折)`;
        }
      }
      return `V${level}会员`;
    });
    const finalPrice = common_vendor.computed(() => {
      if (originalPrice.value >= 88) {
        shippingFee.value = 0;
      } else {
        shippingFee.value = 8;
      }
      return originalPrice.value - discountAmount.value + shippingFee.value;
    });
    const goToAddressList = () => {
      common_vendor.index.navigateTo({
        url: "/pages/address/edit"
      });
    };
    function debounce(fn, delay = 800) {
      let timer = null;
      return function(...args) {
        if (timer)
          clearTimeout(timer);
        timer = setTimeout(() => {
          fn.apply(this, args);
        }, delay);
      };
    }
    const submitOrder = async () => {
      if (checkGuestMode()) {
        return;
      }
      if (!selectedAddress.value) {
        common_vendor.index.showToast({
          title: "请选择收货地址",
          icon: "none"
        });
        return;
      }
      if (checkoutItems.value.length === 0) {
        common_vendor.index.showToast({
          title: "订单中没有商品",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "提交订单中..."
        });
        if (orderType.value === "buyNow") {
          const item = checkoutItems.value[0];
          let price = parseFloat(item.price);
          if (discountAmount.value > 0) {
            const discountRate = 1 - discountAmount.value / originalPrice.value;
            price = price * discountRate;
          }
          const buyData = {
            productId: item.productId,
            skuId: item.skuId || null,
            addressBookId: selectedAddress.value.id,
            quantity: item.quantity,
            // 将备注添加到请求中
            phoneNumber: selectedAddress.value.phone
            // 添加收货人电话号码
          };
          common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:429", "直接购买请求数据:", buyData);
          const result = await utils_request.request({
            url: "https://bgnc.online/api/order/buyNow",
            method: "POST",
            data: buyData
          });
          common_vendor.index.hideLoading();
          if (result.code === 200) {
            common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:441", "result是", result.data);
            handleOrderSuccess(result);
          } else {
            handleOrderFail(result);
          }
        } else {
          const cartIds = checkoutItems.value.map((item) => {
            if (item.originalIds && item.originalIds.length > 0) {
              return item.originalIds[0];
            }
            return item.id;
          });
          const settleData = {
            ids: cartIds,
            addressBookId: selectedAddress.value.id,
            phoneNumber: selectedAddress.value.phone
            // 添加收货人电话号码
          };
          common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:465", "结算请求数据:", settleData);
          const result = await utils_request.request({
            url: "https://bgnc.online/api/order/settle",
            method: "POST",
            data: settleData
          });
          common_vendor.index.hideLoading();
          if (result.code === 200) {
            common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:477", "结算成功:", result);
            handleOrderSuccess(result);
          } else {
            handleOrderFail(result);
          }
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/checkout/checkout.vue:485", "提交订单失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后再试",
          icon: "none"
        });
      }
    };
    const submitOrderDebounced = debounce(submitOrder, 800);
    const handleOrderSuccess = async (result) => {
      try {
        common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:499", "订单创建成功，准备支付:", result);
        const orderId = result.data;
        if (!orderId) {
          throw new Error("未获取到订单ID");
        }
        const loginResult = await common_vendor.index.login();
        if (!loginResult.code) {
          throw new Error("获取微信登录code失败");
        }
        common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:513", "获取到微信登录code:", loginResult.code);
        const paymentResult = await utils_request.request({
          url: "https://bgnc.online/api/notify/payment",
          method: "POST",
          data: {
            orderId,
            code: loginResult.code
          }
        });
        common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:525", "获取到支付参数:", paymentResult);
        if (paymentResult.code !== 200 || !paymentResult.data) {
          throw new Error(paymentResult.message || "获取支付参数失败");
        }
        common_vendor.index.showLoading({ title: "正在拉起支付..." });
        try {
          await wxPay(paymentResult.data);
          common_vendor.index.showToast({
            title: "支付成功",
            icon: "success"
          });
          try {
            await utils_request.request({
              url: `https://bgnc.online/api/order/`,
              method: "PUT",
              data: {
                id: orderId,
                status: 1
                // 待发货状态
              }
            });
            common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:553", "订单状态已更新为待发货");
          } catch (updateError) {
            common_vendor.index.__f__("error", "at pages/checkout/checkout.vue:555", "更新订单状态失败:", updateError);
          }
          setTimeout(() => {
            common_vendor.index.redirectTo({
              url: `/pages/order/detail?id=${orderId}`
            });
          }, 1500);
        } catch (payError) {
          common_vendor.index.__f__("error", "at pages/checkout/checkout.vue:566", "支付过程发生错误:", payError);
          if (payError.errMsg && payError.errMsg.includes("cancel")) {
            common_vendor.index.showToast({
              title: "用户取消支付",
              icon: "none"
            });
          } else {
            common_vendor.index.showToast({
              title: "支付失败",
              icon: "none"
            });
          }
          setTimeout(() => {
            common_vendor.index.redirectTo({
              url: `/pages/order/detail?id=${orderId}`
            });
          }, 1500);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/checkout/checkout.vue:588", "支付流程出错:", error);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: error.message || "支付流程出错",
          icon: "none"
        });
        common_vendor.index.removeStorageSync("checkoutItems");
        setTimeout(() => {
          common_vendor.index.switchTab({
            url: "/pages/user/user"
          });
          setTimeout(() => {
            common_vendor.index.navigateTo({
              url: "/pages/order/list"
            });
          }, 500);
        }, 1500);
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const wxPay = (payParams) => {
      return new Promise((resolve, reject) => {
        common_vendor.index.requestPayment({
          provider: "wxpay",
          timeStamp: payParams.timeStamp,
          nonceStr: payParams.nonceStr,
          package: payParams.packageVal,
          signType: payParams.signType,
          paySign: payParams.paySign,
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:626", "支付成功", res);
            resolve(res);
          },
          fail: (err) => {
            common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:630", "支付失败", err);
            reject(err);
          }
        });
      });
    };
    const handleOrderFail = (result) => {
      common_vendor.index.showToast({
        title: result.message || "订单提交失败",
        icon: "none"
      });
    };
    common_vendor.onShow(() => {
      loadCheckoutData();
      getAddressList();
      getMemberInfo();
    });
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/checkout/checkout.vue:655", "结算页面已加载");
      getAddressList();
      updateDiscountFromApi();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: selectedAddress.value
      }, selectedAddress.value ? {
        b: common_vendor.p({
          type: "location",
          size: "22",
          color: "#3b78db"
        }),
        c: common_vendor.t(selectedAddress.value.consignee),
        d: common_vendor.t(selectedAddress.value.phone),
        e: common_vendor.t(selectedAddress.value.provinceName),
        f: common_vendor.t(selectedAddress.value.cityName),
        g: common_vendor.t(selectedAddress.value.districtName),
        h: common_vendor.t(selectedAddress.value.detail),
        i: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        })
      } : {
        j: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        })
      }, {
        k: common_vendor.o(goToAddressList),
        l: common_vendor.p({
          type: "shop",
          size: "18",
          color: "#3b78db"
        }),
        m: common_vendor.f(checkoutItems.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.productImage,
            b: common_vendor.t(item.productName),
            c: item.spec
          }, item.spec ? {
            d: common_vendor.t(item.spec)
          } : {}, {
            e: common_vendor.t(item.price),
            f: common_vendor.t(item.quantity),
            g: index
          });
        }),
        n: originalPrice.value < 88
      }, originalPrice.value < 88 ? {
        o: common_vendor.t((88 - originalPrice.value).toFixed(2))
      } : {}, {
        p: common_vendor.t(originalPrice.value.toFixed(2)),
        q: shippingFee.value > 0
      }, shippingFee.value > 0 ? {
        r: common_vendor.t(shippingFee.value.toFixed(2))
      } : {}, {
        s: discountAmount.value > 0
      }, discountAmount.value > 0 ? {
        t: common_vendor.t(memberLevelText.value),
        v: common_vendor.t(discountAmount.value.toFixed(2))
      } : {}, {
        w: remark.value,
        x: common_vendor.o(($event) => remark.value = $event.detail.value),
        y: common_vendor.t(finalPrice.value.toFixed(2)),
        z: common_vendor.o((...args) => common_vendor.unref(submitOrderDebounced) && common_vendor.unref(submitOrderDebounced)(...args))
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/checkout/checkout.js.map
