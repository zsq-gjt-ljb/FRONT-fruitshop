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
  __name: "cart",
  setup(__props) {
    const cartList = common_vendor.ref([]);
    const isLoading = common_vendor.ref(false);
    const isAllSelected = common_vendor.computed(() => {
      if (cartList.value.length === 0)
        return false;
      return cartList.value.every((item) => item.selected);
    });
    const selectedCount = common_vendor.computed(() => {
      return cartList.value.filter((item) => item.selected).length;
    });
    const totalPrice = common_vendor.computed(() => {
      return cartList.value.filter((item) => item.selected).reduce((total, item) => {
        return total + parseFloat(item.price) * item.quantity;
      }, 0);
    });
    common_vendor.computed(() => {
      return Math.floor(totalPrice.value);
    });
    common_vendor.computed(() => {
      const decimal = Math.round((totalPrice.value - Math.floor(totalPrice.value)) * 100);
      return decimal < 10 ? `0${decimal}` : decimal;
    });
    const getCartList = async () => {
      try {
        isLoading.value = true;
        common_vendor.index.showLoading({ title: "加载中" });
        const result = await utils_request.request({
          url: "https://bgnc.online/api/cart/list",
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/cart/cart.vue:152", "购物车API返回:", result);
        if (result.code === 200) {
          const mergedCartMap = {};
          const processedData = (result.data || []).map((item) => ({
            id: item.id,
            productId: item.productId,
            skuId: item.skuId,
            productName: item.productName || "未命名商品",
            productImage: item.productPic || "/static/images/product-default.png",
            price: item.price || "0",
            quantity: item.quantity || 1,
            stock: item.stock || 999,
            spec: item.spec || "",
            selected: true,
            // 默认选中
            originalIds: [item.id]
            // 保存原始ID列表，用于后续更新和删除
          }));
          processedData.forEach((item) => {
            const key = `${item.productId}-${item.skuId}`;
            if (mergedCartMap[key]) {
              mergedCartMap[key].quantity += item.quantity;
              mergedCartMap[key].originalIds.push(item.id);
            } else {
              mergedCartMap[key] = item;
            }
          });
          cartList.value = Object.values(mergedCartMap);
          common_vendor.index.__f__("log", "at pages/cart/cart.vue:191", "处理后的购物车数据:", cartList.value);
        } else {
          common_vendor.index.showToast({
            title: result.message || "获取购物车失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/cart/cart.vue:199", "获取购物车出错:", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后再试",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
        common_vendor.index.hideLoading();
        common_vendor.index.stopPullDownRefresh();
      }
    };
    const toggleSelectItem = (item) => {
      item.selected = !item.selected;
    };
    const toggleSelectAll = () => {
      const newState = !isAllSelected.value;
      cartList.value.forEach((item) => {
        item.selected = newState;
      });
    };
    const decreaseQuantity = async (item) => {
      if (item.quantity <= 1)
        return;
      try {
        item.quantity--;
        const updateId = item.originalIds[0];
        const result = await utils_request.request({
          url: "https://bgnc.online/api/cart/update",
          method: "PUT",
          data: {
            id: updateId,
            quantity: item.quantity
          }
        });
        if (result.code !== 200) {
          item.quantity++;
          common_vendor.index.showToast({
            title: result.message || "更新失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/cart/cart.vue:254", "减少数量失败:", error);
        item.quantity++;
        common_vendor.index.showToast({
          title: "网络错误，请稍后再试",
          icon: "none"
        });
      }
    };
    const increaseQuantity = async (item) => {
      if (item.quantity >= item.stock) {
        common_vendor.index.showToast({
          title: "已达最大库存",
          icon: "none"
        });
        return;
      }
      try {
        item.quantity++;
        const updateId = item.originalIds[0];
        const result = await utils_request.request({
          url: "https://bgnc.online/api/cart/update",
          method: "PUT",
          data: {
            id: updateId,
            quantity: item.quantity
          }
        });
        if (result.code !== 200) {
          item.quantity--;
          common_vendor.index.showToast({
            title: result.message || "更新失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/cart/cart.vue:300", "增加数量失败:", error);
        item.quantity--;
        common_vendor.index.showToast({
          title: "网络错误，请稍后再试",
          icon: "none"
        });
      }
    };
    const updateCartItem = async (item) => {
      const oldQuantity = item.quantity;
      if (isNaN(item.quantity) || item.quantity < 1) {
        item.quantity = 1;
      } else if (item.quantity > item.stock) {
        item.quantity = item.stock;
      }
      if (oldQuantity === item.quantity)
        return;
      try {
        const updateId = item.originalIds[0];
        const result = await utils_request.request({
          url: "https://bgnc.online/api/cart/update",
          method: "PUT",
          data: {
            id: updateId,
            quantity: item.quantity
          }
        });
        if (result.code !== 200) {
          common_vendor.index.showToast({
            title: result.message || "更新失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/cart/cart.vue:345", "更新数量失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后再试",
          icon: "none"
        });
      }
    };
    const deleteCartItem = (item) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除此商品吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const deleteId = item.originalIds[0];
              const result = await utils_request.request({
                url: `https://bgnc.online/api/cart/${deleteId}`,
                method: "DELETE"
              });
              if (result.code === 200) {
                const index = cartList.value.findIndex((cartItem) => cartItem.originalIds.includes(deleteId));
                if (index !== -1) {
                  cartList.value.splice(index, 1);
                }
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
              } else {
                common_vendor.index.showToast({
                  title: result.message || "删除失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/cart/cart.vue:389", "删除购物车商品失败:", error);
              common_vendor.index.showToast({
                title: "网络错误，请稍后再试",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const handleCheckout = () => {
      if (checkGuestMode()) {
        return;
      }
      const selectedItems = cartList.value.filter((item) => item.selected);
      if (selectedItems.length === 0) {
        common_vendor.index.showToast({
          title: "请选择要结算的商品",
          icon: "none"
        });
        return;
      }
      const checkoutData = selectedItems.map((item) => ({
        id: item.id,
        // 保留购物车项ID，用于结算
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        price: item.price,
        quantity: item.quantity,
        skuId: item.skuId || "",
        spec: item.spec || "",
        originalIds: item.originalIds || [item.id]
        // 保存原始ID列表
      }));
      common_vendor.index.setStorageSync("checkoutItems", JSON.stringify(checkoutData));
      common_vendor.index.navigateTo({
        url: "/pages/checkout/checkout"
      });
    };
    const goToDetail = (productId) => {
      if (!productId)
        return;
      common_vendor.index.navigateTo({
        url: `/pages/detail/detail?id=${productId}`
      });
    };
    const goToHome = () => {
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    };
    common_vendor.onShow(() => {
      if (checkGuestMode()) {
        return;
      }
      getCartList();
    });
    common_vendor.onPullDownRefresh(() => {
      if (checkGuestMode()) {
        common_vendor.index.stopPullDownRefresh();
        return;
      }
      getCartList();
    });
    common_vendor.onLoad(() => {
      common_vendor.index.__f__("log", "at pages/cart/cart.vue:478", "购物车页面加载");
      checkGuestMode();
    });
    const checkGuestMode = () => {
      const isGuestMode = common_vendor.index.getStorageSync("isGuestMode");
      const token = common_vendor.index.getStorageSync("token");
      if (isGuestMode && !token) {
        common_vendor.index.showModal({
          title: "需要登录",
          content: "查看购物车需要登录，是否立即登录？",
          success: (res) => {
            if (res.confirm) {
              const currentPage = "/" + getCurrentPages()[getCurrentPages().length - 1].route;
              common_vendor.index.navigateTo({
                url: "/pages/login/login?redirect=" + encodeURIComponent(currentPage)
              });
            } else {
              common_vendor.index.switchTab({
                url: "/pages/index/index"
              });
            }
          }
        });
        return true;
      }
      return false;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: cartList.value.length === 0
      }, cartList.value.length === 0 ? {
        b: common_vendor.p({
          type: "cart",
          size: "64",
          color: "#ddd"
        }),
        c: common_vendor.o(goToHome)
      } : {
        d: common_vendor.t(cartList.value.length),
        e: common_vendor.f(cartList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.selected
          }, item.selected ? {
            b: "702118b1-1-" + i0,
            c: common_vendor.p({
              type: "checkmarkempty",
              size: "14",
              color: "#fff"
            })
          } : {}, {
            d: item.selected ? 1 : "",
            e: common_vendor.o(($event) => toggleSelectItem(item), item.id),
            f: item.productImage || "/static/images/product-default.png",
            g: common_vendor.t(item.productName),
            h: item.spec
          }, item.spec ? {
            i: common_vendor.t(item.spec)
          } : {}, {
            j: common_vendor.t(item.price),
            k: "702118b1-2-" + i0,
            l: common_vendor.p({
              type: "minus",
              size: "12",
              color: item.quantity <= 1 ? "#ccc" : "#333"
            }),
            m: item.quantity <= 1 ? 1 : "",
            n: common_vendor.o(($event) => decreaseQuantity(item), item.id),
            o: common_vendor.o(($event) => updateCartItem(item), item.id),
            p: common_vendor.o(() => {
            }, item.id),
            q: item.quantity,
            r: common_vendor.o(common_vendor.m(($event) => item.quantity = $event.detail.value, {
              number: true
            }), item.id),
            s: "702118b1-3-" + i0,
            t: common_vendor.p({
              type: "plus",
              size: "12",
              color: item.quantity >= item.stock ? "#ccc" : "#333"
            }),
            v: item.quantity >= item.stock ? 1 : "",
            w: common_vendor.o(($event) => increaseQuantity(item), item.id),
            x: common_vendor.o(($event) => goToDetail(item.productId), item.id),
            y: "702118b1-4-" + i0,
            z: common_vendor.o(($event) => deleteCartItem(item), item.id),
            A: item.id
          });
        }),
        f: common_vendor.p({
          type: "trash",
          size: "18",
          color: "#fff"
        })
      }, {
        g: cartList.value.length > 0
      }, cartList.value.length > 0 ? common_vendor.e({
        h: isAllSelected.value
      }, isAllSelected.value ? {
        i: common_vendor.p({
          type: "checkmarkempty",
          size: "14",
          color: "#fff"
        })
      } : {}, {
        j: isAllSelected.value ? 1 : "",
        k: common_vendor.o(toggleSelectAll),
        l: common_vendor.t(totalPrice.value.toFixed(2)),
        m: selectedCount.value
      }, selectedCount.value ? {
        n: common_vendor.t(selectedCount.value)
      } : {}, {
        o: selectedCount.value > 0 ? 1 : "",
        p: common_vendor.o(handleCheckout)
      }) : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/cart/cart.js.map
