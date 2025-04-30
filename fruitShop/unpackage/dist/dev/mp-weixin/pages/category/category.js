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
  __name: "category",
  setup(__props) {
    const categories = common_vendor.ref([]);
    const currentCategory = common_vendor.ref(null);
    const currentCategoryId = common_vendor.ref("");
    const productList = common_vendor.ref([]);
    const isLoading = common_vendor.ref(false);
    const searchKeyword = common_vendor.ref("");
    const isSearchMode = common_vendor.ref(false);
    const sortType = common_vendor.ref("default");
    const priceSortAsc = common_vendor.ref(true);
    common_vendor.watch(searchKeyword, (newValue) => {
      if (!newValue && isSearchMode.value) {
        isSearchMode.value = false;
        loadCategoryProducts();
      }
    });
    const clearSearch = () => {
      searchKeyword.value = "";
      isSearchMode.value = false;
      loadCategoryProducts();
    };
    const loadCategoryProducts = () => {
      if (currentCategory.value) {
        if (currentCategory.value.id === "all") {
          getAllProducts();
        } else {
          getProductsByCategory(currentCategory.value.id);
        }
      }
    };
    const handleSearch = () => {
      if (!searchKeyword.value.trim()) {
        isSearchMode.value = false;
        loadCategoryProducts();
        return;
      }
      isSearchMode.value = true;
      searchProducts();
    };
    const searchProducts = async () => {
      try {
        isLoading.value = true;
        productList.value = [];
        const params = {
          name: searchKeyword.value
        };
        if (currentCategory.value && currentCategory.value.id !== "all") {
          params.categoryId = currentCategory.value.id;
        }
        const queryString = Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&");
        const res = await utils_request.request({
          url: `https://bgnc.online/api/product/list?${queryString}`,
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/category/category.vue:183", "搜索结果返回:", res);
        if (res.code === 200) {
          productList.value = res.data;
          productList.value = productList.value.map((product) => {
            if (product.skus && product.skus.length > 0) {
              product.price = product.skus[0].price;
            }
            return product;
          });
          applySorting();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/category/category.vue:199", "搜索商品失败：", error);
        common_vendor.index.showToast({
          title: "搜索失败",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/category/category.vue:211", "分类页面显示");
      try {
        const selectedId = common_vendor.index.getStorageSync("selectedCategoryId");
        common_vendor.index.__f__("log", "at pages/category/category.vue:215", "读取到的分类ID:", selectedId);
        if (selectedId) {
          currentCategoryId.value = String(selectedId);
          common_vendor.index.__f__("log", "at pages/category/category.vue:220", "设置当前分类ID:", currentCategoryId.value);
          if (!categories.value || categories.value.length === 0) {
            common_vendor.index.__f__("log", "at pages/category/category.vue:224", "分类列表为空，加载分类列表");
            getCategories();
            return;
          }
          const category = categories.value.find((item) => String(item.id) === String(selectedId));
          if (category) {
            common_vendor.index.__f__("log", "at pages/category/category.vue:232", "找到匹配分类:", category.name);
            selectCategory(category);
          } else {
            common_vendor.index.__f__("log", "at pages/category/category.vue:236", "未找到匹配分类，重新加载分类列表");
            getCategories();
          }
        } else if (categories.value && categories.value.length > 0) {
          selectCategory(categories.value[0]);
        } else {
          getCategories();
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/category/category.vue:248", "读取选中分类ID失败:", e);
        getCategories();
      }
    });
    const getCategories = async () => {
      try {
        isLoading.value = true;
        const res = await utils_request.request({
          url: "https://bgnc.online/api/category/list",
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/category/category.vue:263", "分类数据返回:", res);
        if (res.code === 200) {
          const allCategory = {
            id: "all",
            name: "全部商品"
          };
          categories.value = [allCategory, ...res.data];
          common_vendor.index.__f__("log", "at pages/category/category.vue:271", "分类列表加载完成，共", categories.value.length, "项");
          if (currentCategoryId.value) {
            common_vendor.index.__f__("log", "at pages/category/category.vue:275", "处理预选分类ID:", currentCategoryId.value);
            const category = categories.value.find((item) => String(item.id) === String(currentCategoryId.value));
            if (category) {
              common_vendor.index.__f__("log", "at pages/category/category.vue:281", "找到ID匹配的分类:", category.name);
              selectCategory(category);
              setTimeout(() => {
                common_vendor.index.removeStorageSync("selectedCategoryId");
                common_vendor.index.__f__("log", "at pages/category/category.vue:287", "已清除预选分类ID");
              }, 500);
              return;
            }
            if (currentCategoryId.value === "105") {
              common_vendor.index.__f__("log", "at pages/category/category.vue:294", "尝试匹配低GI食品相关分类");
              const matchedCategory = categories.value.find(
                (cat) => cat.name.includes("健康") || cat.name.includes("糖") || cat.name.includes("低") || cat.name.includes("保健")
              );
              if (matchedCategory) {
                common_vendor.index.__f__("log", "at pages/category/category.vue:304", "找到低GI食品相关分类:", matchedCategory.name);
                selectCategory(matchedCategory);
                return;
              }
            }
            common_vendor.index.__f__("log", "at pages/category/category.vue:311", "未找到匹配分类，使用默认分类");
          }
          common_vendor.index.__f__("log", "at pages/category/category.vue:315", "选择默认分类");
          selectCategory(categories.value[0]);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/category/category.vue:319", "获取分类列表失败:", error);
        common_vendor.index.showToast({
          title: "加载分类失败",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const selectCategory = (category) => {
      common_vendor.index.__f__("log", "at pages/category/category.vue:331", "选择分类:", category.name, category.id);
      currentCategory.value = category;
      currentCategoryId.value = category.id;
      searchKeyword.value = "";
      isSearchMode.value = false;
      if (category.id === "all") {
        getAllProducts();
      } else {
        getProductsByCategory(category.id);
      }
    };
    const getAllProducts = async () => {
      try {
        isLoading.value = true;
        productList.value = [];
        const res = await utils_request.request({
          url: "https://bgnc.online/api/product/list",
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/category/category.vue:356", "所有商品返回:", res);
        if (res.code === 200) {
          productList.value = res.data;
          productList.value = productList.value.map((product) => {
            if (product.skus && product.skus.length > 0) {
              product.price = product.skus[0].price;
            }
            return product;
          });
          applySorting();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/category/category.vue:372", "获取所有商品失败：", error);
        common_vendor.index.showToast({
          title: "获取商品失败",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const getProductsByCategory = async (categoryId) => {
      try {
        isLoading.value = true;
        productList.value = [];
        const res = await utils_request.request({
          url: `https://bgnc.online/api/product/list?categoryId=${categoryId}`,
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/category/category.vue:392", "分类商品返回:", res);
        if (res.code === 200) {
          productList.value = res.data;
          productList.value = productList.value.map((product) => {
            if (product.skus && product.skus.length > 0) {
              product.price = product.skus[0].price;
            }
            return product;
          });
          applySorting();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/category/category.vue:408", "获取分类商品失败：", error);
        common_vendor.index.showToast({
          title: "获取商品失败",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const goToDetail = (productId) => {
      common_vendor.index.navigateTo({
        url: `/pages/detail/detail?id=${productId}`
      });
      common_vendor.index.__f__("log", "at pages/category/category.vue:423", "跳转到商品详情:", productId);
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/category/category.vue:428", "分类页面已挂载");
      getCategories();
    });
    const setSortType = (type) => {
      if (type === sortType.value) {
        if (type === "price") {
          priceSortAsc.value = !priceSortAsc.value;
        }
      } else {
        sortType.value = type;
        if (type === "price") {
          priceSortAsc.value = true;
        }
      }
      applySorting();
    };
    const applySorting = () => {
      if (productList.value.length === 0)
        return;
      switch (sortType.value) {
        case "price":
          productList.value.sort((a, b) => {
            const priceA = parseFloat(a.price) || 0;
            const priceB = parseFloat(b.price) || 0;
            return priceSortAsc.value ? priceA - priceB : priceB - priceA;
          });
          break;
        case "sales":
          productList.value.sort((a, b) => {
            const salesA = a.sales || 0;
            const salesB = b.sales || 0;
            return salesB - salesA;
          });
          break;
      }
    };
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: common_vendor.f(categories.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: item.id,
            c: common_vendor.n(currentCategoryId.value === item.id ? "active" : ""),
            d: common_vendor.o(($event) => selectCategory(item), item.id)
          };
        }),
        b: common_vendor.t(((_a = currentCategory.value) == null ? void 0 : _a.name) || "全部商品"),
        c: common_vendor.p({
          type: "search",
          size: "18",
          color: "#4a90e2"
        }),
        d: common_vendor.o(handleSearch),
        e: searchKeyword.value,
        f: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        g: searchKeyword.value
      }, searchKeyword.value ? {
        h: common_vendor.p({
          type: "clear",
          size: "16",
          color: "#999"
        }),
        i: common_vendor.o(clearSearch)
      } : {}, {
        j: sortType.value === "default" ? 1 : "",
        k: common_vendor.o(($event) => setSortType("default")),
        l: sortType.value === "sales" ? 1 : "",
        m: common_vendor.o(($event) => setSortType("sales")),
        n: sortType.value === "price" && !priceSortAsc.value ? 1 : "",
        o: sortType.value === "price" && priceSortAsc.value ? 1 : "",
        p: sortType.value === "price" ? 1 : "",
        q: common_vendor.o(($event) => setSortType("price")),
        r: isLoading.value
      }, isLoading.value ? {} : common_vendor.e({
        s: common_vendor.f(productList.value, (product, index, i0) => {
          return {
            a: product.indexPic || "/static/images/default-product.png",
            b: common_vendor.t(product.name),
            c: common_vendor.t(product.price || "暂无价格"),
            d: product.id,
            e: common_vendor.o(($event) => goToDetail(product.id), product.id)
          };
        }),
        t: productList.value.length === 0
      }, productList.value.length === 0 ? {
        v: common_assets._imports_0$2,
        w: common_vendor.t(isSearchMode.value ? "未找到相关商品" : "该分类暂无商品，敬请期待")
      } : {}));
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/category/category.js.map
