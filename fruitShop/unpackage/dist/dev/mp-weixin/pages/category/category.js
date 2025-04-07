"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "category",
  setup(__props) {
    const categories = common_vendor.ref([]);
    const currentCategory = common_vendor.ref(null);
    const currentCategoryId = common_vendor.ref("");
    const productList = common_vendor.ref([]);
    const isLoading = common_vendor.ref(false);
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/category/category.vue:70", "分类页面显示");
      try {
        const selectedId = common_vendor.index.getStorageSync("selectedCategoryId");
        common_vendor.index.__f__("log", "at pages/category/category.vue:74", "读取到的分类ID:", selectedId);
        if (selectedId) {
          currentCategoryId.value = String(selectedId);
          common_vendor.index.__f__("log", "at pages/category/category.vue:79", "设置当前分类ID:", currentCategoryId.value);
          if (categories.value && categories.value.length > 0) {
            common_vendor.index.__f__("log", "at pages/category/category.vue:83", "查找匹配分类...");
            const category = categories.value.find((item) => String(item.id) === String(selectedId));
            if (category) {
              common_vendor.index.__f__("log", "at pages/category/category.vue:87", "找到匹配分类:", category.name);
              selectCategory(category);
            } else {
              common_vendor.index.__f__("log", "at pages/category/category.vue:91", "未找到匹配分类");
              getCategories();
            }
          } else {
            common_vendor.index.__f__("log", "at pages/category/category.vue:96", "分类列表为空，开始加载分类");
            getCategories();
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/category/category.vue:102", "读取选中分类ID失败:", e);
      }
    });
    const getCategories = async () => {
      try {
        isLoading.value = true;
        const res = await utils_request.request({
          url: "http://82.156.12.240:8080/api/category/list",
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/category/category.vue:115", "分类数据返回:", res);
        if (res.code === 200) {
          categories.value = res.data;
          common_vendor.index.__f__("log", "at pages/category/category.vue:118", "categories.value", categories.value);
          if (currentCategoryId.value) {
            common_vendor.index.__f__("log", "at pages/category/category.vue:122", "处理预选分类ID:", currentCategoryId.value);
            const category = categories.value.find((item) => String(item.id) === String(currentCategoryId.value));
            if (category) {
              common_vendor.index.__f__("log", "at pages/category/category.vue:126", "找到匹配的分类:", category.name);
              selectCategory(category);
              setTimeout(() => {
                common_vendor.index.removeStorageSync("selectedCategoryId");
                common_vendor.index.__f__("log", "at pages/category/category.vue:131", "已清除预选分类ID");
              }, 500);
              return;
            } else {
              common_vendor.index.__f__("log", "at pages/category/category.vue:135", "未找到匹配的分类");
            }
          }
          if (categories.value.length > 0) {
            selectCategory(categories.value[0]);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/category/category.vue:145", "获取分类列表失败:", error);
      } finally {
        isLoading.value = false;
      }
    };
    const selectCategory = (category) => {
      common_vendor.index.__f__("log", "at pages/category/category.vue:153", "选择分类:", category.name, category.id);
      currentCategory.value = category;
      currentCategoryId.value = category.id;
      getProductsByCategory(category.id);
    };
    const getProductsByCategory = async (categoryId) => {
      try {
        isLoading.value = true;
        productList.value = [];
        const res = await utils_request.request({
          url: `http://82.156.12.240:8080/api/product/list?categoryId=${categoryId}`,
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/category/category.vue:169", "分类商品返回:", res);
        if (res.code === 200) {
          productList.value = res.data;
          productList.value = productList.value.map((product) => {
            if (product.skus && product.skus.length > 0) {
              product.price = product.skus[0].price;
            }
            return product;
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/category/category.vue:182", "获取分类商品失败：", error);
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
      common_vendor.index.__f__("log", "at pages/category/category.vue:197", "跳转到商品详情:", productId);
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/category/category.vue:202", "分类页面已挂载");
      getCategories();
    });
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
        c: isLoading.value
      }, isLoading.value ? {} : common_vendor.e({
        d: common_vendor.f(productList.value, (product, index, i0) => {
          return {
            a: product.indexPic || "/static/images/default-product.png",
            b: common_vendor.t(product.name),
            c: common_vendor.t(product.price || "暂无价格"),
            d: product.id,
            e: common_vendor.o(($event) => goToDetail(product.id), product.id)
          };
        }),
        e: productList.value.length === 0
      }, productList.value.length === 0 ? {
        f: common_assets._imports_0$1
      } : {}));
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/category/category.js.map
