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
  (_easycom_uni_icons + FloatingContact)();
}
const FloatingContact = () => "../../components/FloatingContact.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const bannerList = common_vendor.ref([]);
    const categories = common_vendor.ref([]);
    const homeProducts = common_vendor.ref([]);
    const isLoading = common_vendor.ref(false);
    const loadBanners = async () => {
      try {
        common_vendor.index.__f__("log", "at pages/index/index.vue:263", "开始加载轮播图数据");
        const result = await utils_request.request({
          url: "https://bgnc.online/api/product/market/1",
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/index/index.vue:269", "轮播图API返回结果:", result);
        if (result.code === 200) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:271", "轮播图数据:", result.data);
          bannerList.value = (result.data || []).map((item) => ({
            id: item.id,
            productId: item.id,
            name: item.productName || "",
            indexPic: item.indexPic || ""
          }));
          common_vendor.index.__f__("log", "at pages/index/index.vue:278", "处理后的轮播图数据:", bannerList.value);
        } else {
          common_vendor.index.__f__("error", "at pages/index/index.vue:280", "获取轮播图失败:", result.message);
          bannerList.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:284", "加载轮播图出错:", error);
        bannerList.value = [];
      }
    };
    const loadCategories = async () => {
      try {
        common_vendor.index.__f__("log", "at pages/index/index.vue:292", "开始加载分类数据");
        const result = await utils_request.request({
          url: "https://bgnc.online/api/category/list",
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/index/index.vue:298", "分类API返回结果:", result);
        if (result.code === 200) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:300", "分类数据:", result.data);
          categories.value = result.data || [];
          const categoryIcons = [
            "/static/images/category-leaf.png",
            "/static/images/category-tea.png",
            "/static/images/category-snack.png",
            "/static/images/category-dried.png",
            "/static/images/category-fruit.png",
            "/static/images/category-gift.png"
          ];
          categories.value = categories.value.map((cat, index) => ({
            ...cat,
            image: categoryIcons[index % categoryIcons.length]
          }));
          common_vendor.index.__f__("log", "at pages/index/index.vue:320", "处理后的分类数据:", categories.value);
        } else {
          common_vendor.index.__f__("error", "at pages/index/index.vue:322", "获取分类失败:", result.message);
          categories.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:326", "加载分类出错:", error);
        categories.value = [];
      }
    };
    const loadHomeProducts = async () => {
      try {
        common_vendor.index.__f__("log", "at pages/index/index.vue:334", "开始加载首页推荐商品");
        const result = await utils_request.request({
          url: "https://bgnc.online/api/product/market/0",
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/index/index.vue:340", "首页商品API返回结果:", result);
        if (result.code === 200) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:342", "首页商品数据:", result.data);
          homeProducts.value = (result.data || []).map((item) => ({
            id: item.id,
            productId: item.id,
            name: item.name || "",
            indexPic: item.indexPic || "",
            price: item.price || "暂无价格"
          }));
          common_vendor.index.__f__("log", "at pages/index/index.vue:350", "处理后的首页商品数据:", homeProducts.value);
        } else {
          common_vendor.index.__f__("error", "at pages/index/index.vue:352", "获取首页商品失败:", result.message);
          homeProducts.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:356", "加载首页商品出错:", error);
        homeProducts.value = [];
      }
    };
    const initData = async () => {
      isLoading.value = true;
      try {
        common_vendor.index.__f__("log", "at pages/index/index.vue:365", "开始初始化首页数据");
        await loadBanners();
        await loadCategories();
        await loadHomeProducts();
        common_vendor.index.__f__("log", "at pages/index/index.vue:371", "首页数据加载完成");
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:373", "初始化数据失败:", error);
        common_vendor.index.showToast({
          title: "加载数据失败",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const goToDetail = (productId) => {
      if (!productId) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:386", "无效的商品ID");
        return;
      }
      common_vendor.index.__f__("log", "at pages/index/index.vue:390", "首页跳转到商品详情，ID:", productId);
      const id = typeof productId === "object" ? productId.id : productId;
      common_vendor.index.navigateTo({
        url: `/pages/detail/detail?id=${id}`,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:396", "跳转成功:", res);
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:399", "跳转失败:", err);
          common_vendor.index.navigateTo({
            url: "/pages/detail/detail",
            success: function(res) {
              res.eventChannel.emit("acceptDataFromOpener", { id });
            }
          });
        }
      });
    };
    const navigateToCategoryById = (categoryId, categoryName) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:412", "跳转到分类页面:", categoryId, categoryName);
      common_vendor.index.setStorageSync("selectedCategoryId", categoryId);
      common_vendor.index.switchTab({
        url: "/pages/category/category"
      });
    };
    const navigateToCategory = (category) => {
      navigateToCategoryById(category.id, category.name);
    };
    const navigateToAllCategories = () => {
      common_vendor.index.removeStorageSync("selectedCategoryId");
      common_vendor.index.switchTab({
        url: "/pages/category/category"
      });
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:453", "首页组件已挂载");
      initData();
    });
    const showSpecs = common_vendor.ref(false);
    const currentProduct = common_vendor.ref({});
    const selectedSpecIndex = common_vendor.ref(0);
    const quantity = common_vendor.ref(1);
    const selectedSpec = common_vendor.computed(() => {
      if (currentProduct.value.specs && currentProduct.value.specs.length > 0) {
        return currentProduct.value.specs[selectedSpecIndex.value].name;
      }
      return "默认规格";
    });
    const showSpecsPopup = (product) => {
      currentProduct.value = product;
      selectedSpecIndex.value = 0;
      quantity.value = 1;
      showSpecs.value = true;
    };
    const hideSpecsPopup = () => {
      showSpecs.value = false;
    };
    const selectSpec = (index) => {
      selectedSpecIndex.value = index;
      if (productSpecs.value[index]) {
        selectedSpec.value = productSpecs.value[index].name;
        if (productSkuList.value.length > 0) {
          const selectedSku = productSkuList.value.find(
            (sku) => sku.spData.includes(productSpecs.value[index].id + ":" + productSpecs.value[index].value)
          );
          if (selectedSku) {
            quickBuyProduct.value.price = selectedSku.price;
            quickBuyProduct.value.stock = selectedSku.stock;
            selectedSkuId.value = selectedSku.id;
            if (quantity.value > selectedSku.stock) {
              quantity.value = selectedSku.stock > 0 ? selectedSku.stock : 1;
            }
          }
        }
      }
    };
    const increaseQuantity = () => {
      if (quantity.value < (currentProduct.value.stock || 999)) {
        quantity.value++;
      }
    };
    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--;
      }
    };
    const validateQuantity = () => {
      const stock = currentProduct.value.stock || 999;
      if (isNaN(quantity.value) || quantity.value < 1) {
        quantity.value = 1;
      } else if (quantity.value > stock) {
        quantity.value = stock;
      }
    };
    const addToCartWithSpec = async () => {
      if (!selectedSkuId.value) {
        common_vendor.index.showToast({
          title: "请选择有效的规格",
          icon: "none"
        });
        return;
      }
      try {
        const cartData = {
          skuId: selectedSkuId.value,
          productId: quickBuyProduct.value.id,
          quantity: quantity.value
        };
        common_vendor.index.__f__("log", "at pages/index/index.vue:562", "添加到购物车数据:", cartData);
        const result = await utils_request.request({
          url: "https://bgnc.online/api/cart/add",
          method: "POST",
          data: cartData
        });
        if (result.code === 200) {
          common_vendor.index.showToast({
            title: "已添加到购物车",
            icon: "success"
          });
          hideQuickBuyPopup();
        } else {
          common_vendor.index.showToast({
            title: result.message || "添加失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:587", "添加到购物车出错:", error);
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      }
    };
    const buyNow = () => {
      if (!selectedSpec) {
        showSpecsPopup();
        return;
      }
      const checkoutItem = {
        productId: quickBuyProduct.value.id,
        productName: quickBuyProduct.value.name,
        productImage: quickBuyProduct.value.indexPic,
        price: quickBuyProduct.value.price,
        quantity: quantity.value,
        skuId: selectedSkuId.value || "",
        spec: selectedSpec.value || ""
      };
      common_vendor.index.setStorageSync("checkoutItems", JSON.stringify([checkoutItem]));
      common_vendor.index.navigateTo({
        url: "/pages/checkout/checkout?type=buyNow"
      });
    };
    const showQuickBuyPopup = common_vendor.ref(false);
    const quickBuyProduct = common_vendor.ref({});
    const productSpecs = common_vendor.ref([]);
    const productSkuList = common_vendor.ref([]);
    const selectedSkuId = common_vendor.ref("");
    const showQuickBuy = async (product) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:631", "显示快速购买弹窗:", product);
      quickBuyProduct.value = {
        ...product,
        stock: 0
        // 默认设置为0，后续从SKU中获取
      };
      selectedSpecIndex.value = 0;
      quantity.value = 1;
      productSpecs.value = [];
      productSkuList.value = [];
      selectedSkuId.value = "";
      try {
        const result = await utils_request.request({
          url: `https://bgnc.online/api/product/${product.id}`,
          method: "GET"
        });
        if (result.code === 200 && result.data) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:655", "获取到商品详情:", result.data);
          if (result.data.skuList && result.data.skuList.length > 0) {
            productSkuList.value = result.data.skuList;
            const specMap = /* @__PURE__ */ new Map();
            result.data.skuList.forEach((sku) => {
              if (sku.spData) {
                const specs = sku.spData.split(";");
                specs.forEach((spec) => {
                  const [specId, specValue] = spec.split(":");
                  if (!specMap.has(specValue)) {
                    specMap.set(specValue, {
                      id: specId,
                      value: specValue,
                      name: `规格${specValue}`,
                      // 可根据需要修改规格名称
                      price: sku.price,
                      stock: sku.stock,
                      skuId: sku.id
                      // 存储SKU ID
                    });
                  }
                });
              }
            });
            productSpecs.value = Array.from(specMap.values());
            if (productSpecs.value.length > 0) {
              selectedSpec.value = productSpecs.value[0].name;
              const defaultSku = productSkuList.value.find(
                (sku) => sku.spData.includes(productSpecs.value[0].id + ":" + productSpecs.value[0].value)
              );
              if (defaultSku) {
                quickBuyProduct.value.stock = defaultSku.stock;
                quickBuyProduct.value.price = defaultSku.price;
                selectedSkuId.value = defaultSku.id;
              }
            } else {
              if (productSkuList.value[0]) {
                quickBuyProduct.value.stock = productSkuList.value[0].stock;
                quickBuyProduct.value.price = productSkuList.value[0].price;
                selectedSkuId.value = productSkuList.value[0].id;
                selectedSpec.value = "默认规格";
              }
            }
          } else {
            productSpecs.value = [{ name: "默认规格", price: product.price, stock: 100 }];
            selectedSpec.value = "默认规格";
            quickBuyProduct.value.stock = 100;
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:720", "获取商品详情失败:", error);
        productSpecs.value = [{ name: "默认规格", price: product.price, stock: 100 }];
        selectedSpec.value = "默认规格";
        quickBuyProduct.value.stock = 100;
      }
      showQuickBuyPopup.value = true;
    };
    const hideQuickBuyPopup = () => {
      showQuickBuyPopup.value = false;
    };
    const handleContactEvent = () => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:738", "联系客服事件被触发");
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(bannerList.value, (banner, index, i0) => {
          return {
            a: banner.indexPic,
            b: common_vendor.t(banner.name),
            c: banner.id,
            d: common_vendor.o(($event) => goToDetail(banner.productId), banner.id)
          };
        }),
        b: common_assets._imports_0$1,
        c: common_assets._imports_1,
        d: common_assets._imports_2,
        e: common_vendor.o(navigateToAllCategories),
        f: common_vendor.f(categories.value.slice(0, 6), (category, index, i0) => {
          return {
            a: category.image || "/static/images/category-default.png",
            b: common_vendor.t(category.name),
            c: category.id,
            d: common_vendor.o(($event) => navigateToCategory(category), category.id)
          };
        }),
        g: common_vendor.f(homeProducts.value, (product, index, i0) => {
          return common_vendor.e({
            a: product.indexPic,
            b: index < 2
          }, index < 2 ? {} : {}, {
            c: common_vendor.t(product.name),
            d: common_vendor.t(product.price || "暂无价格"),
            e: "2d1fa052-0-" + i0,
            f: common_vendor.o(($event) => showQuickBuy(product), product.id),
            g: product.id,
            h: common_vendor.o(($event) => goToDetail(product.productId), product.id)
          });
        }),
        h: common_vendor.p({
          type: "cart",
          size: "16",
          color: "#fff"
        }),
        i: common_vendor.o(handleContactEvent),
        j: common_vendor.p({
          bottom: 150,
          right: 30
        }),
        k: showSpecs.value
      }, showSpecs.value ? common_vendor.e({
        l: common_vendor.o(hideSpecsPopup),
        m: currentProduct.value.image,
        n: common_vendor.t(currentProduct.value.price),
        o: currentProduct.value.originalPrice
      }, currentProduct.value.originalPrice ? {
        p: common_vendor.t(currentProduct.value.originalPrice)
      } : {}, {
        q: common_vendor.t(currentProduct.value.stock || 0),
        r: common_vendor.t(selectedSpec.value),
        s: common_vendor.p({
          type: "closeempty",
          size: "20",
          color: "#999"
        }),
        t: common_vendor.o(hideSpecsPopup),
        v: common_vendor.f(currentProduct.value.specs, (spec, index, i0) => {
          return {
            a: common_vendor.t(spec.name),
            b: index,
            c: common_vendor.n(selectedSpecIndex.value === index ? "active" : ""),
            d: common_vendor.o(($event) => selectSpec(index), index)
          };
        }),
        w: common_vendor.n(quantity.value <= 1 ? "disabled" : ""),
        x: common_vendor.o(decreaseQuantity),
        y: common_vendor.o(validateQuantity),
        z: quantity.value,
        A: common_vendor.o(common_vendor.m(($event) => quantity.value = $event.detail.value, {
          number: true
        })),
        B: common_vendor.n(quantity.value >= currentProduct.value.stock ? "disabled" : ""),
        C: common_vendor.o(increaseQuantity),
        D: common_vendor.o(addToCartWithSpec),
        E: common_vendor.o(buyNow)
      }) : {}, {
        F: showQuickBuyPopup.value
      }, showQuickBuyPopup.value ? {
        G: common_vendor.o(hideQuickBuyPopup),
        H: quickBuyProduct.value.indexPic,
        I: common_vendor.t(quickBuyProduct.value.price),
        J: common_vendor.t(quickBuyProduct.value.stock || 1e3),
        K: common_vendor.t(selectedSpec.value),
        L: common_vendor.p({
          type: "close",
          size: "16",
          color: "#666"
        }),
        M: common_vendor.o(hideQuickBuyPopup),
        N: common_vendor.f(productSpecs.value, (spec, index, i0) => {
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
        O: common_vendor.o(decreaseQuantity),
        P: common_vendor.o(validateQuantity),
        Q: quantity.value,
        R: common_vendor.o(common_vendor.m(($event) => quantity.value = $event.detail.value, {
          number: true
        })),
        S: common_vendor.o(increaseQuantity),
        T: common_vendor.o(addToCartWithSpec),
        U: common_vendor.o(buyNow)
      } : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
