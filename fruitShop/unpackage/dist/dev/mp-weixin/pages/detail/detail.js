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
  __name: "detail",
  setup(__props) {
    const productId = common_vendor.ref("");
    const productImages = common_vendor.ref([]);
    const productInfo = common_vendor.ref({});
    const skuList = common_vendor.ref([]);
    const productSpecs = common_vendor.ref([]);
    const selectedSpecIndex = common_vendor.ref(0);
    const selectedSpec = common_vendor.ref("默认规格");
    const quantity = common_vendor.ref(1);
    const showSpecs = common_vendor.ref(false);
    const currentSku = common_vendor.ref({});
    const selectedSkuId = common_vendor.ref("");
    const isLoading = common_vendor.ref(true);
    const specMap = /* @__PURE__ */ new Map();
    const processSkuData = (skuDataList) => {
      try {
        common_vendor.index.__f__("log", "at pages/detail/detail.vue:194", "开始处理SKU数据:", skuDataList);
        productSpecs.value = [];
        specMap.clear();
        if (!skuDataList || skuDataList.length === 0) {
          productSpecs.value = [{
            name: "默认规格",
            price: productInfo.value.price,
            stock: 100,
            skuId: ""
          }];
          currentSku.value = {
            price: productInfo.value.price,
            stock: 100,
            id: ""
          };
          selectedSpec.value = "默认规格";
          return;
        }
        skuDataList.forEach((sku) => {
          common_vendor.index.__f__("log", "at pages/detail/detail.vue:219", "处理SKU项:", sku);
          if (sku.spData) {
            const specs = sku.spData.split(";");
            specs.forEach((spec) => {
              const [specId, specValue] = spec.split(":");
              const specKey = `${specId}:${specValue}`;
              if (!specMap.has(specKey)) {
                const specItem = {
                  id: specId,
                  value: specValue,
                  name: `规格${specValue}`,
                  price: sku.price,
                  stock: sku.stock,
                  skuId: sku.id
                };
                specMap.set(specKey, specItem);
                productSpecs.value.push(specItem);
              }
            });
          } else {
            const specItem = {
              name: "默认规格",
              price: sku.price,
              stock: sku.stock,
              skuId: sku.id
            };
            if (productSpecs.value.length === 0) {
              productSpecs.value.push(specItem);
            }
          }
        });
        if (productSpecs.value.length > 0) {
          selectedSpec.value = productSpecs.value[0].name;
          selectedSkuId.value = productSpecs.value[0].skuId;
          currentSku.value = {
            price: productSpecs.value[0].price,
            stock: productSpecs.value[0].stock,
            id: productSpecs.value[0].skuId
          };
        }
        common_vendor.index.__f__("log", "at pages/detail/detail.vue:269", "处理后的规格数据:", productSpecs.value);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/detail/detail.vue:271", "处理SKU数据出错:", error);
        productSpecs.value = [{ name: "默认规格", price: productInfo.value.price, stock: 100 }];
        selectedSpec.value = "默认规格";
      }
    };
    const getProductDetail = async (id) => {
      if (!id) {
        common_vendor.index.showToast({
          title: "商品ID无效",
          icon: "none"
        });
        isLoading.value = false;
        return;
      }
      isLoading.value = true;
      common_vendor.index.__f__("log", "at pages/detail/detail.vue:290", `尝试获取商品数据，ID=${id}`);
      try {
        common_vendor.index.__f__("log", "at pages/detail/detail.vue:293", "正在获取商品详情, ID:", id);
        const result = await utils_request.request({
          url: `http://82.156.12.240:8080/api/product/${id}`,
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/detail/detail.vue:300", "API返回结果:", result);
        if (result.code === 200 && result.data) {
          common_vendor.index.__f__("log", "at pages/detail/detail.vue:303", "获取到商品详情:", result.data);
          productInfo.value = result.data;
          productImages.value = [];
          if (result.data.indexPic) {
            productImages.value.push(result.data.indexPic);
          }
          if (result.data.albumPicsList && result.data.albumPicsList.length > 0) {
            result.data.albumPicsList.forEach((pic) => {
              if (pic !== result.data.indexPic) {
                productImages.value.push(pic);
              }
            });
          }
          if (productImages.value.length === 0) {
            productImages.value.push("/static/images/product-default.png");
          }
          skuList.value = result.data.skuList || [];
          processSkuData(result.data.skuList || []);
          common_vendor.index.__f__("log", "at pages/detail/detail.vue:333", "处理后的商品数据:", {
            images: productImages.value,
            info: productInfo.value,
            specs: productSpecs.value,
            currentSku: currentSku.value
          });
        } else {
          common_vendor.index.showToast({
            title: "获取商品详情失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/detail/detail.vue:346", "获取商品详情出错:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    common_vendor.onLoad((options) => {
      common_vendor.index.__f__("log", "at pages/detail/detail.vue:358", "详情页收到参数:", options);
      if (options.id) {
        productId.value = options.id;
        getProductDetail(options.id);
      } else {
        common_vendor.index.__f__("error", "at pages/detail/detail.vue:363", "没有收到有效的商品ID");
        common_vendor.index.showToast({
          title: "商品ID无效",
          icon: "none"
        });
        isLoading.value = false;
      }
    });
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const goHome = () => {
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    };
    const goToCart = () => {
      common_vendor.index.switchTab({
        url: "/pages/cart/cart"
      });
    };
    const contactService = () => {
      common_vendor.index.showToast({
        title: "客服功能暂未开放",
        icon: "none"
      });
    };
    const showSpecsPopup = () => {
      showSpecs.value = true;
    };
    const hideSpecsPopup = () => {
      showSpecs.value = false;
    };
    const selectSpec = (index) => {
      if (index < 0 || index >= productSpecs.value.length)
        return;
      selectedSpecIndex.value = index;
      selectedSpec.value = productSpecs.value[index].name;
      selectedSkuId.value = productSpecs.value[index].skuId;
      currentSku.value = {
        price: productSpecs.value[index].price,
        stock: productSpecs.value[index].stock,
        id: productSpecs.value[index].skuId
      };
      productInfo.value.price = currentSku.value.price;
      if (quantity.value > currentSku.value.stock) {
        quantity.value = currentSku.value.stock > 0 ? currentSku.value.stock : 1;
      }
    };
    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--;
      }
    };
    const increaseQuantity = () => {
      if (quantity.value < currentSku.value.stock) {
        quantity.value++;
      } else {
        common_vendor.index.showToast({
          title: "已达最大库存",
          icon: "none"
        });
      }
    };
    const validateQuantity = () => {
      const val = parseInt(quantity.value);
      if (isNaN(val) || val < 1) {
        quantity.value = 1;
      } else if (val > currentSku.value.stock) {
        quantity.value = currentSku.value.stock > 0 ? currentSku.value.stock : 1;
      } else {
        quantity.value = val;
      }
    };
    const addToCart = async () => {
      if (!selectedSkuId.value) {
        common_vendor.index.showToast({
          title: "请选择规格",
          icon: "none"
        });
        return;
      }
      try {
        const result = await utils_request.request({
          url: "http://82.156.12.240:8080/api/cart/add",
          method: "POST",
          data: {
            skuId: selectedSkuId.value,
            productId: productId.value,
            quantity: quantity.value
          }
        });
        if (result.code === 200) {
          common_vendor.index.showToast({
            title: "已加入购物车",
            icon: "success"
          });
          hideSpecsPopup();
        } else {
          common_vendor.index.showToast({
            title: result.message || "添加失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/detail/detail.vue:498", "添加购物车失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后再试",
          icon: "none"
        });
      }
    };
    const buyNow = async () => {
      var _a;
      if (!selectedSpec && productInfo.value.hasSpecs) {
        showSpecsPopup();
        return;
      }
      let memberLevel = "";
      try {
        const result = await utils_request.request({
          url: "http://82.156.12.240:8080/api/user/profile",
          method: "GET"
        });
        if (result.code === 200) {
          memberLevel = result.data.memberLevel || "";
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/detail/detail.vue:525", "获取会员信息失败:", error);
      }
      let price = parseFloat(((_a = currentSku.value) == null ? void 0 : _a.price) || productInfo.value.price);
      const checkoutItem = {
        productId: productInfo.value.id,
        productName: productInfo.value.name,
        productImage: productImages.value[0],
        price,
        quantity: quantity.value,
        skuId: selectedSkuId.value || "",
        spec: selectedSpec.value || "",
        memberLevel
        // 保存会员等级，用于结算页面计算折扣
      };
      common_vendor.index.setStorageSync("checkoutItems", JSON.stringify([checkoutItem]));
      common_vendor.index.navigateTo({
        url: "/pages/checkout/checkout?type=buyNow"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isLoading.value
      }, isLoading.value ? {} : common_vendor.e({
        b: common_vendor.p({
          type: "back",
          size: "24",
          color: "#fff"
        }),
        c: common_vendor.o(goBack),
        d: common_vendor.o(goHome),
        e: common_vendor.p({
          type: "home",
          size: "24",
          color: "#fff"
        }),
        f: common_vendor.p({
          type: "more-filled",
          size: "24",
          color: "#fff"
        }),
        g: common_vendor.f(productImages.value, (item, index, i0) => {
          return {
            a: item,
            b: index
          };
        }),
        h: common_vendor.t(productInfo.value.price),
        i: productInfo.value.originalPrice
      }, productInfo.value.originalPrice ? {
        j: common_vendor.t(productInfo.value.originalPrice)
      } : {}, {
        k: common_vendor.t(productInfo.value.sale || 0),
        l: common_vendor.t(productInfo.value.name),
        m: common_vendor.p({
          type: "redo",
          size: "18",
          color: "#999"
        }),
        n: common_vendor.t(productInfo.value.description || "暂无商品描述"),
        o: common_vendor.t(selectedSpec.value || "请选择"),
        p: common_vendor.p({
          type: "right",
          size: "16",
          color: "#ccc"
        }),
        q: common_vendor.o(showSpecsPopup),
        r: productInfo.value.detailHtml || "<p>暂无详情</p>",
        s: common_vendor.p({
          type: "home",
          size: "24",
          color: "#666"
        }),
        t: common_vendor.o(goHome),
        v: common_vendor.p({
          type: "headphones",
          size: "24",
          color: "#666"
        }),
        w: common_vendor.o(contactService),
        x: common_vendor.p({
          type: "cart",
          size: "24",
          color: "#666"
        }),
        y: common_vendor.o(goToCart),
        z: common_vendor.o(showSpecsPopup),
        A: common_vendor.o(buyNow),
        B: showSpecs.value
      }, showSpecs.value ? {
        C: common_vendor.o(hideSpecsPopup),
        D: productImages.value[0],
        E: common_vendor.t(currentSku.value.price || productInfo.value.price),
        F: common_vendor.t(currentSku.value.stock || 0),
        G: common_vendor.t(selectedSpec.value),
        H: common_vendor.p({
          type: "closeempty",
          size: "20",
          color: "#999"
        }),
        I: common_vendor.o(hideSpecsPopup),
        J: common_vendor.f(productSpecs.value, (spec, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(spec.name),
            b: spec.price
          }, spec.price ? {
            c: common_vendor.t(spec.price)
          } : {}, {
            d: spec.stock !== void 0
          }, spec.stock !== void 0 ? {
            e: common_vendor.t(spec.stock)
          } : {}, {
            f: index,
            g: common_vendor.n(selectedSpecIndex.value === index ? "active" : ""),
            h: common_vendor.o(($event) => selectSpec(index), index)
          });
        }),
        K: common_vendor.n(quantity.value <= 1 ? "disabled" : ""),
        L: common_vendor.o(decreaseQuantity),
        M: common_vendor.o(validateQuantity),
        N: quantity.value,
        O: common_vendor.o(common_vendor.m(($event) => quantity.value = $event.detail.value, {
          number: true
        })),
        P: common_vendor.n(quantity.value >= currentSku.value.stock ? "disabled" : ""),
        Q: common_vendor.o(increaseQuantity),
        R: common_vendor.o(addToCart),
        S: common_vendor.o(buyNow)
      } : {}));
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/detail/detail.js.map
