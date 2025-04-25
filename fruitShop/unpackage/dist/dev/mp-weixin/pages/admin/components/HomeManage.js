"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_request = require("../../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "HomeManage",
  setup(__props) {
    const banners = common_vendor.ref([]);
    const allProducts = common_vendor.ref([]);
    const selectedProducts = common_vendor.ref([]);
    const searchKeyword = common_vendor.ref("");
    const isLoading = common_vendor.ref(false);
    let autoCheckTimer = null;
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:137", "HomeManage组件已加载");
      fetchProducts().then(() => {
        common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:140", "产品列表加载完成，开始加载轮播图和首页商品");
        refreshData(true);
      });
      startAutoCheck();
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:150", "HomeManage页面显示");
      refreshData(true);
      startAutoCheck();
    });
    common_vendor.onHide(() => {
      common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:160", "HomeManage页面隐藏");
      clearAutoCheck();
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:167", "HomeManage组件卸载");
      clearAutoCheck();
    });
    const startAutoCheck = () => {
      clearAutoCheck();
      autoCheckTimer = setInterval(() => {
        common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:178", "执行自动检查...");
        fetchProducts().then(() => {
          if (allProducts.value.length > 0) {
            const validProductIds = new Set(allProducts.value.map((product) => String(product.id)));
            checkAndCleanInvalidProducts(validProductIds);
          }
        });
      }, 3 * 60 * 1e3);
    };
    const clearAutoCheck = () => {
      if (autoCheckTimer) {
        clearInterval(autoCheckTimer);
        autoCheckTimer = null;
      }
    };
    const fetchProducts = async () => {
      try {
        isLoading.value = true;
        const result = await utils_request.request({
          url: "https://bgnc.online/api/product/list",
          method: "GET"
        });
        if (result.code === 200) {
          common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:209", "result是", result);
          allProducts.value = result.data || [];
          const validProductIds = new Set(allProducts.value.map((product) => String(product.id)));
          common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:214", "有效商品ID列表:", validProductIds);
          checkAndCleanInvalidProducts(validProductIds);
        } else {
          allProducts.value = [];
          common_vendor.index.showToast({
            title: result.message || "获取商品失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/HomeManage.vue:226", "获取商品列表失败:", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const checkAndCleanInvalidProducts = async (validProductIds) => {
      const invalidBanners = banners.value.filter((banner) => !validProductIds.has(String(banner.productId)));
      const invalidHomeProducts = selectedProducts.value.filter((product) => !validProductIds.has(String(product.productId)));
      common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:243", "无效轮播图数量:", invalidBanners.length, "无效首页商品数量:", invalidHomeProducts.length);
      if (invalidBanners.length > 0 || invalidHomeProducts.length > 0) {
        try {
          for (const banner of invalidBanners) {
            common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:250", "清理无效轮播图:", banner.id, banner.name);
            await deleteBanner(banner.id, true);
          }
          for (const product of invalidHomeProducts) {
            common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:256", "清理无效首页商品:", product.id, product.name);
            await deleteHomeProduct(product.id, true);
          }
          await refreshData();
          if (invalidBanners.length > 0 || invalidHomeProducts.length > 0) {
            common_vendor.index.showToast({
              title: `已清理${invalidBanners.length + invalidHomeProducts.length}个无效商品`,
              icon: "none",
              duration: 2e3
            });
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/admin/components/HomeManage.vue:272", "清理无效商品失败:", error);
        }
      }
    };
    const searchProducts = () => {
      if (!searchKeyword.value) {
        fetchProducts();
        return;
      }
      const keyword = searchKeyword.value.toLowerCase();
      allProducts.value = allProducts.value.filter(
        (item) => item.name.toLowerCase().includes(keyword)
      );
    };
    const isBanner = (id) => {
      const pid = String(id);
      return banners.value.some((banner) => String(banner.productId) === pid);
    };
    const isHomeProduct = (id) => {
      const pid = String(id);
      return selectedProducts.value.some((product) => String(product.productId) === pid);
    };
    const loadBanners = async () => {
      try {
        const result = await utils_request.request({
          url: "https://bgnc.online/api/productmarket/list/1",
          method: "GET"
        });
        if (result.code === 200) {
          common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:314", "原始轮播数据:", result.data);
          banners.value = (result.data || []).map((item) => ({
            id: item.id,
            productId: item.productId,
            // 确保保留productId用于比较
            name: item.name || "",
            indexPic: item.imgUrl || ""
          }));
          common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:321", "处理后的轮播数据:", banners.value);
        } else {
          banners.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/HomeManage.vue:326", "加载轮播图失败:", error);
        banners.value = [];
      }
    };
    const loadHomeProducts = async () => {
      try {
        common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:334", "开始加载首页商品数据");
        const result = await utils_request.request({
          url: "https://bgnc.online/api/productmarket/list/0",
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:340", "首页商品接口返回:", result);
        if (result.code === 200) {
          selectedProducts.value = (result.data || []).map((item) => ({
            id: item.id,
            productId: item.productId,
            // 确保保留productId用于比较
            name: item.name || "",
            indexPic: item.imgUrl || "",
            price: item.price
          }));
          common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:351", "处理后的首页商品数据:", selectedProducts.value);
        } else {
          common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:353", "首页商品接口返回异常:", result.code, result.message);
          selectedProducts.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/HomeManage.vue:357", "加载首页商品失败:", error);
        selectedProducts.value = [];
      }
    };
    const refreshData = async (isInitialLoad = false) => {
      common_vendor.index.showLoading({ title: "刷新中..." });
      try {
        await Promise.all([loadBanners(), loadHomeProducts()]);
        if (isInitialLoad && allProducts.value.length > 0) {
          const validProductIds = new Set(allProducts.value.map((product) => String(product.id)));
          await checkAndCleanInvalidProducts(validProductIds);
        } else {
          common_vendor.index.showToast({
            title: "数据已刷新",
            icon: "success"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/HomeManage.vue:381", "刷新数据失败:", error);
        common_vendor.index.showToast({
          title: "刷新失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const addToBanner = async (product) => {
      if (isBanner(product.id)) {
        common_vendor.index.showToast({
          title: "该商品已在轮播图中",
          icon: "none"
        });
        return;
      }
      const existsInProducts = allProducts.value.some((p) => String(p.id) === String(product.id));
      if (!existsInProducts) {
        common_vendor.index.showToast({
          title: "该商品已被删除，请刷新列表",
          icon: "none"
        });
        await fetchProducts();
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "添加中..." });
        const result = await utils_request.request({
          url: "https://bgnc.online/api/productmarket",
          method: "POST",
          data: {
            productId: product.id,
            status: 1,
            // 1表示轮播图
            productName: product.name,
            imgUrl: product.indexPic
          }
        });
        if (result.code === 200) {
          await loadBanners();
          common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:432", "轮播图添加成功，刷新后数量:", banners.value.length);
          common_vendor.index.showToast({
            title: "添加轮播图成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: result.message || "添加失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/HomeManage.vue:445", "添加轮播图失败:", error);
        common_vendor.index.showToast({
          title: "添加失败: " + (error.message || "未知错误"),
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const addToHome = async (product) => {
      if (isHomeProduct(product.id)) {
        common_vendor.index.showToast({
          title: "该商品已在首页中",
          icon: "none"
        });
        return;
      }
      const existsInProducts = allProducts.value.some((p) => String(p.id) === String(product.id));
      if (!existsInProducts) {
        common_vendor.index.showToast({
          title: "该商品已被删除，请刷新列表",
          icon: "none"
        });
        await fetchProducts();
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "添加中..." });
        const result = await utils_request.request({
          url: "https://bgnc.online/api/productmarket",
          method: "POST",
          data: {
            productId: product.id,
            status: 0,
            // 0表示首页商品
            productName: product.name,
            imgUrl: product.indexPic
          }
        });
        if (result.code === 200) {
          await loadHomeProducts();
          common_vendor.index.__f__("log", "at pages/admin/components/HomeManage.vue:496", "首页商品添加成功，刷新后数量:", selectedProducts.value.length);
          common_vendor.index.showToast({
            title: "添加首页商品成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: result.message || "添加失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/HomeManage.vue:509", "添加首页商品失败:", error);
        common_vendor.index.showToast({
          title: "添加失败: " + (error.message || "未知错误"),
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const deleteBanner = async (id, silent = false) => {
      try {
        if (!silent) {
          common_vendor.index.showLoading({ title: "删除中..." });
        }
        const result = await utils_request.request({
          url: `https://bgnc.online/api/productmarket/${id}`,
          method: "DELETE"
        });
        if (result.code === 200) {
          await loadBanners();
          if (!silent) {
            common_vendor.index.showToast({
              title: "已从轮播图移除",
              icon: "success"
            });
          }
        } else {
          if (!silent) {
            common_vendor.index.showToast({
              title: result.message || "删除失败",
              icon: "none"
            });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/HomeManage.vue:551", "删除轮播图失败:", error);
        if (!silent) {
          common_vendor.index.showToast({
            title: "删除失败: " + (error.message || "未知错误"),
            icon: "none"
          });
        }
      } finally {
        if (!silent) {
          common_vendor.index.hideLoading();
        }
      }
    };
    const deleteHomeProduct = async (id, silent = false) => {
      try {
        if (!silent) {
          common_vendor.index.showLoading({ title: "删除中..." });
        }
        const result = await utils_request.request({
          url: `https://bgnc.online/api/productmarket/${id}`,
          method: "DELETE"
        });
        if (result.code === 200) {
          await loadHomeProducts();
          if (!silent) {
            common_vendor.index.showToast({
              title: "已从首页移除",
              icon: "success"
            });
          }
        } else {
          if (!silent) {
            common_vendor.index.showToast({
              title: result.message || "删除失败",
              icon: "none"
            });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/HomeManage.vue:597", "删除首页商品失败:", error);
        if (!silent) {
          common_vendor.index.showToast({
            title: "删除失败: " + (error.message || "未知错误"),
            icon: "none"
          });
        }
      } finally {
        if (!silent) {
          common_vendor.index.hideLoading();
        }
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "reload",
          size: "16",
          color: "#4a90e2"
        }),
        b: common_vendor.o(refreshData),
        c: common_vendor.f(banners.value, (banner, index, i0) => {
          return {
            a: banner.indexPic || "/static/images/default-product.png",
            b: common_vendor.t(banner.name),
            c: "2a9a35dc-1-" + i0,
            d: common_vendor.o(($event) => deleteBanner(banner.id), index),
            e: index
          };
        }),
        d: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ff4d4f"
        }),
        e: banners.value.length === 0
      }, banners.value.length === 0 ? {} : {}, {
        f: common_vendor.f(selectedProducts.value, (product, index, i0) => {
          return {
            a: product.indexPic || "/static/images/default-product.png",
            b: common_vendor.t(product.name),
            c: "2a9a35dc-2-" + i0,
            d: common_vendor.o(($event) => deleteHomeProduct(product.id), index),
            e: index
          };
        }),
        g: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ff4d4f"
        }),
        h: selectedProducts.value.length === 0
      }, selectedProducts.value.length === 0 ? {} : {}, {
        i: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        j: common_vendor.o([($event) => searchKeyword.value = $event.detail.value, searchProducts]),
        k: searchKeyword.value,
        l: common_vendor.o(fetchProducts),
        m: common_vendor.f(allProducts.value, (product, index, i0) => {
          return {
            a: product.indexPic || "/static/images/default-product.png",
            b: common_vendor.t(product.name),
            c: common_vendor.t(product.price),
            d: common_vendor.t(isBanner(product.id) ? "已是轮播" : "添加轮播"),
            e: common_vendor.o(($event) => addToBanner(product), product.id),
            f: isBanner(product.id),
            g: common_vendor.t(isHomeProduct(product.id) ? "已在首页" : "添加首页"),
            h: common_vendor.o(($event) => addToHome(product), product.id),
            i: isHomeProduct(product.id),
            j: product.id
          };
        }),
        n: allProducts.value.length === 0
      }, allProducts.value.length === 0 ? {} : {});
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/admin/components/HomeManage.js.map
