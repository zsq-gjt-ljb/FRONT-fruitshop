"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_request = require("../../../utils/request.js");
const _sfc_main = {
  __name: "CategoryManage",
  setup(__props) {
    const categories = common_vendor.ref([]);
    const newCategory = common_vendor.reactive({
      name: "",
      status: 1
      // 默认启用
    });
    const editingIndex = common_vendor.ref(-1);
    const editingCategory = common_vendor.reactive({
      name: "",
      status: 1
    });
    const getCategories = async () => {
      try {
        const res = await utils_request.request({
          url: "http://82.156.12.240:8080/api/category/list",
          method: "GET"
        });
        if (res.code === 200) {
          categories.value = res.data;
          common_vendor.index.__f__("log", "at pages/admin/components/CategoryManage.vue:111", "获取到的分类数据:", res.data);
        } else {
          common_vendor.index.showToast({
            title: res.message || "获取分类失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/CategoryManage.vue:119", "获取分类列表失败：", error);
        common_vendor.index.showToast({
          title: "获取分类列表失败",
          icon: "none"
        });
      }
    };
    const addCategory = async () => {
      if (!newCategory.name) {
        common_vendor.index.showToast({
          title: "请输入分类名称",
          icon: "none"
        });
        return;
      }
      try {
        const res = await utils_request.request({
          url: "http://82.156.12.240:8080/api/category",
          method: "POST",
          data: {
            name: newCategory.name,
            status: newCategory.status
          }
        });
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "添加成功",
            icon: "success"
          });
          newCategory.name = "";
          newCategory.status = 1;
          getCategories();
        } else {
          common_vendor.index.showToast({
            title: res.message || "添加失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/CategoryManage.vue:166", "添加分类失败：", error);
        common_vendor.index.showToast({
          title: "添加分类失败",
          icon: "none"
        });
      }
    };
    const startEdit = (index) => {
      const category = categories.value[index];
      editingCategory.name = category.name;
      editingCategory.status = category.status;
      editingIndex.value = index;
    };
    const cancelEdit = () => {
      editingIndex.value = -1;
    };
    const saveEdit = async (id) => {
      if (!editingCategory.name) {
        common_vendor.index.showToast({
          title: "请输入分类名称",
          icon: "none"
        });
        return;
      }
      try {
        const res = await utils_request.request({
          url: "http://82.156.12.240:8080/api/category",
          method: "PUT",
          data: {
            id,
            name: editingCategory.name,
            status: editingCategory.status
          }
        });
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "更新成功",
            icon: "success"
          });
          editingIndex.value = -1;
          getCategories();
        } else {
          common_vendor.index.showToast({
            title: res.message || "更新失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/CategoryManage.vue:226", "更新分类失败：", error);
        common_vendor.index.showToast({
          title: "更新分类失败",
          icon: "none"
        });
      }
    };
    const deleteCategory = async (id) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除该分类吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const res2 = await utils_request.request({
                url: `http://82.156.12.240:8080/api/category/${id}`,
                method: "DELETE"
              });
              if (res2.code === 200) {
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                getCategories();
              } else {
                common_vendor.index.showToast({
                  title: res2.message || "删除失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/admin/components/CategoryManage.vue:262", "删除分类失败：", error);
              common_vendor.index.showToast({
                title: "删除分类失败",
                icon: "none"
              });
            }
          }
        }
      });
    };
    common_vendor.onMounted(() => {
      getCategories();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: newCategory.name,
        b: common_vendor.o(($event) => newCategory.name = $event.detail.value),
        c: newCategory.status === 1,
        d: common_vendor.o((e) => newCategory.status = e.detail.value ? 1 : 0),
        e: common_vendor.t(newCategory.status === 1 ? "启用" : "禁用"),
        f: common_vendor.o(addCategory),
        g: categories.value.length === 0
      }, categories.value.length === 0 ? {} : {}, {
        h: common_vendor.f(categories.value, (category, index, i0) => {
          return common_vendor.e({
            a: editingIndex.value !== index
          }, editingIndex.value !== index ? {
            b: common_vendor.t(category.name),
            c: common_vendor.t(category.status === 1 ? "启用" : "禁用"),
            d: common_vendor.n(category.status === 1 ? "enabled" : "disabled"),
            e: common_vendor.o(($event) => startEdit(index), category.id),
            f: common_vendor.o(($event) => deleteCategory(category.id), category.id)
          } : {
            g: editingCategory.name,
            h: common_vendor.o(($event) => editingCategory.name = $event.detail.value, category.id),
            i: editingCategory.status === 1,
            j: common_vendor.o((e) => editingCategory.status = e.detail.value ? 1 : 0, category.id),
            k: common_vendor.t(editingCategory.status === 1 ? "启用" : "禁用"),
            l: common_vendor.o(($event) => saveEdit(category.id), category.id),
            m: common_vendor.o(cancelEdit, category.id)
          }, {
            n: category.id
          });
        })
      });
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/admin/components/CategoryManage.js.map
