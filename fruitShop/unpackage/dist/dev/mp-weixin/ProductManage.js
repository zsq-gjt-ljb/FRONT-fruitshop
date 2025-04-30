"use strict";
const common_vendor = require("./common/vendor.js");
const utils_request = require("./utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  const _easycom_uni_forms_item2 = common_vendor.resolveComponent("uni-forms-item");
  const _easycom_uni_file_picker2 = common_vendor.resolveComponent("uni-file-picker");
  const _easycom_uni_forms2 = common_vendor.resolveComponent("uni-forms");
  (_easycom_uni_icons2 + _easycom_uni_popup2 + _easycom_uni_forms_item2 + _easycom_uni_file_picker2 + _easycom_uni_forms2)();
}
const _easycom_uni_icons = () => "./node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "./node-modules/@dcloudio/uni-ui/lib/uni-popup/uni-popup.js";
const _easycom_uni_forms_item = () => "./node-modules/@dcloudio/uni-ui/lib/uni-forms-item/uni-forms-item.js";
const _easycom_uni_file_picker = () => "./node-modules/@dcloudio/uni-ui/lib/uni-file-picker/uni-file-picker.js";
const _easycom_uni_forms = () => "./node-modules/@dcloudio/uni-ui/lib/uni-forms/uni-forms.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup + _easycom_uni_forms_item + _easycom_uni_file_picker + _easycom_uni_forms)();
}
const __default__ = {
  name: "ProductManage",
  options: {
    styleIsolation: "shared"
  }
};
const _sfc_main = /* @__PURE__ */ Object.assign(__default__, {
  setup(__props) {
    common_vendor.onLoad(() => {
      common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:359", "小程序页面加载");
      restoreDataFromStorage();
      fetchCategories();
    });
    const initEditor = () => {
      common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:372", "编辑器初始化");
    };
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:378", "小程序页面显示");
    });
    common_vendor.onReady(() => {
      common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:382", "页面渲染完成");
      setTimeout(() => {
        initEditor();
      }, 500);
    });
    const currentStep = common_vendor.ref(1);
    const formData = common_vendor.reactive({
      basic: {
        category: "",
        categoryId: "",
        name: "",
        title: "",
        status: 1,
        images: []
      },
      details: "",
      detailImages: [],
      specs: []
    });
    const previewKey = common_vendor.ref(0);
    common_vendor.watch(() => formData.details, (newVal) => {
      common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:409", "内容已更新，长度:", newVal == null ? void 0 : newVal.length);
      previewKey.value = Date.now();
    });
    const insertHtmlTag = (htmlTag) => {
      formData.details = formData.details + htmlTag;
      previewKey.value = Date.now();
    };
    const insertHtmlImage = () => {
      common_vendor.index.chooseImage({
        count: 1,
        success: async (res) => {
          try {
            if (!res.tempFilePaths || res.tempFilePaths.length === 0) {
              common_vendor.index.showToast({
                title: "没有选择图片",
                icon: "none"
              });
              return;
            }
            common_vendor.index.showLoading({ title: "上传中..." });
            const tempFilePath = res.tempFilePaths[0];
            const fs = common_vendor.index.getFileSystemManager();
            try {
              fs.accessSync(tempFilePath);
              const imageUrl = await uploadImageToServer(tempFilePath);
              const imgTag = `<img src="${imageUrl}" style="max-width:100%;" />`;
              formData.details = formData.details + imgTag;
              previewKey.value = Date.now();
              common_vendor.index.showToast({
                title: "图片插入成功",
                icon: "success"
              });
            } catch (fsError) {
              common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:460", "文件访问错误:", fsError);
              common_vendor.index.showToast({
                title: "无法访问选中的图片",
                icon: "none"
              });
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:467", "上传图片失败:", error);
            common_vendor.index.showToast({
              title: "图片上传失败",
              icon: "none"
            });
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
    };
    const uploadImageToServer = async (tempFilePath) => {
      try {
        common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:490", "开始上传图片:", tempFilePath);
        if (!tempFilePath) {
          throw new Error("临时文件路径不存在");
        }
        const uploadTask = () => {
          return new Promise((resolve, reject) => {
            try {
              const fs = common_vendor.index.getFileSystemManager();
              fs.access({
                path: tempFilePath,
                success: () => {
                  common_vendor.index.uploadFile({
                    url: "https://bgnc.online/api/file/upload",
                    filePath: tempFilePath,
                    name: "file",
                    header: {
                      "Authorization": `Bearer ${common_vendor.index.getStorageSync("token")}`
                    },
                    success: (uploadRes) => {
                      common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:516", "上传成功, 原始响应:", uploadRes);
                      try {
                        const response = typeof uploadRes.data === "string" ? JSON.parse(uploadRes.data) : uploadRes.data;
                        if (response.code === 200) {
                          resolve(response.msg);
                        } else {
                          reject(new Error(response.msg || "上传失败"));
                        }
                      } catch (e) {
                        reject(new Error("响应解析失败"));
                      }
                    },
                    fail: (err) => {
                      common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:533", "上传失败:", err);
                      reject(new Error("网络错误"));
                    }
                  });
                },
                fail: (err) => {
                  common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:539", "文件不存在:", tempFilePath, err);
                  reject(new Error("临时文件不存在或已被删除"));
                }
              });
            } catch (fsError) {
              common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:544", "文件系统错误:", fsError);
              reject(new Error("文件系统错误"));
            }
          });
        };
        const imageUrl = await uploadTask();
        common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:551", "上传成功, 图片URL:", imageUrl);
        return imageUrl;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:554", "上传图片错误:", error);
        common_vendor.index.showToast({
          title: "图片上传失败: " + (error.message || "未知错误"),
          icon: "none"
        });
        throw error;
      }
    };
    const handleImageSelect = async (e) => {
      try {
        common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:566", "选择商品图片", e);
        const { tempFilePaths, tempFiles } = e;
        if (!tempFilePaths || tempFilePaths.length === 0) {
          common_vendor.index.showToast({
            title: "没有选择图片",
            icon: "none"
          });
          return;
        }
        common_vendor.index.showLoading({
          title: "上传中...",
          mask: true
        });
        const fs = common_vendor.index.getFileSystemManager();
        const uploadPromises = tempFilePaths.map(async (path) => {
          try {
            await new Promise((resolve, reject) => {
              fs.access({
                path,
                success: resolve,
                fail: (err) => {
                  common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:594", "文件不存在:", path, err);
                  reject(new Error("临时文件不存在或已被删除"));
                }
              });
            });
            const imageUrl = await uploadImageToServer(path);
            return {
              name: path.split("/").pop(),
              url: imageUrl
            };
          } catch (err) {
            common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:607", "文件访问失败:", path, err);
            return null;
          }
        });
        const uploadedImages = (await Promise.all(uploadPromises)).filter((item) => item !== null);
        if (uploadedImages.length === 0) {
          throw new Error("所有图片上传失败");
        }
        formData.basic.images = [...formData.basic.images, ...uploadedImages];
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: `成功上传${uploadedImages.length}张图片`,
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "上传失败: " + (error.message || "未知错误"),
          icon: "none"
        });
      }
    };
    const handleImageDelete = (e) => {
      common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:638", "删除商品图片", e);
      const { index } = e;
      formData.basic.images.splice(index, 1);
    };
    const handleDetailImageSelect = async (e) => {
      try {
        common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:647", "选择详情图片", e);
        const { tempFilePaths, tempFiles } = e;
        if (!tempFilePaths || tempFilePaths.length === 0) {
          common_vendor.index.showToast({
            title: "没有选择图片",
            icon: "none"
          });
          return;
        }
        common_vendor.index.showLoading({
          title: "上传中...",
          mask: true
        });
        const fs = common_vendor.index.getFileSystemManager();
        const uploadPromises = tempFilePaths.map(async (path) => {
          try {
            await new Promise((resolve, reject) => {
              fs.access({
                path,
                success: resolve,
                fail: (err) => {
                  common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:674", "文件不存在:", path, err);
                  reject(new Error("临时文件不存在或已被删除"));
                }
              });
            });
            const imageUrl = await uploadImageToServer(path);
            return {
              name: path.split("/").pop(),
              url: imageUrl
            };
          } catch (err) {
            common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:687", "文件访问失败:", path, err);
            return null;
          }
        });
        const uploadedImages = (await Promise.all(uploadPromises)).filter((item) => item !== null);
        if (uploadedImages.length === 0) {
          throw new Error("所有图片上传失败");
        }
        formData.detailImages = [...formData.detailImages, ...uploadedImages];
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: `成功上传${uploadedImages.length}张图片`,
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "上传失败: " + (error.message || "未知错误"),
          icon: "none"
        });
      }
    };
    const handleDetailImageDelete = (e) => {
      common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:718", "删除详情图片", e);
      const { index } = e;
      formData.detailImages.splice(index, 1);
    };
    const addSpec = () => {
      formData.specs.push({
        id: null,
        // 新增规格id为null
        name: "",
        value: "",
        price: "",
        stock: "",
        productId: ""
      });
    };
    const removeSpec = (index) => {
      common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:738", "删除规格", index);
      formData.specs.splice(index, 1);
    };
    const prevStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--;
      }
    };
    const nextStep = () => {
      if (validateCurrentStep()) {
        if (currentStep.value < 3) {
          currentStep.value++;
          saveDataToStorage();
        }
      }
    };
    const validateCurrentStep = () => {
      if (currentStep.value === 1) {
        if (!formData.basic.name) {
          common_vendor.index.showToast({
            title: "请输入商品名称",
            icon: "none"
          });
          return false;
        }
        if (!formData.basic.title) {
          common_vendor.index.showToast({
            title: "请输入商品标题",
            icon: "none"
          });
          return false;
        }
      }
      return true;
    };
    const saveData = () => {
      saveDataToStorage();
      common_vendor.index.showToast({
        title: "保存成功",
        icon: "success"
      });
    };
    const saveDataToStorage = () => {
      try {
        const data = JSON.stringify(formData);
        common_vendor.index.setStorageSync("product_draft", data);
        common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:799", "数据已保存到本地存储");
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:801", "保存到本地存储失败", e);
      }
    };
    const restoreDataFromStorage = () => {
      try {
        const data = common_vendor.index.getStorageSync("product_draft");
        if (data) {
          const parsed = JSON.parse(data);
          Object.assign(formData, parsed);
          common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:812", "从本地存储恢复数据成功");
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:815", "从本地存储恢复数据失败", e);
      }
    };
    const handleSwitchChange = (e) => {
      formData.basic.status = e.detail.value ? 1 : 0;
      common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:822", "商品上架状态:", formData.basic.status);
    };
    const resetForm = () => {
      formData.basic = {
        name: "",
        title: "",
        category: "",
        categoryId: "",
        status: 1,
        images: [],
        skuid: ""
      };
      formData.details = "";
      formData.detailImages = [];
      formData.specs = [
        {
          id: null,
          name: "",
          value: "",
          price: "",
          stock: "",
          productId: ""
        }
      ];
      currentStep.value = 1;
      isEditing.value = false;
      editingProductId.value = "";
    };
    const submitProduct = async () => {
      try {
        if (!validateForm()) {
          return;
        }
        common_vendor.index.showLoading({ title: "正在提交..." });
        let indexPic = "";
        if (formData.basic.images && formData.basic.images.length > 0) {
          indexPic = formData.basic.images[0].url || formData.basic.images[0];
        }
        let albumPics = "";
        if (formData.detailImages && formData.detailImages.length > 0) {
          albumPics = formData.detailImages.map((img) => img.url || img).join(",");
        }
        const skus = formData.specs.map((spec) => {
          const skuObj = {
            stock: parseInt(spec.stock) || 0,
            price: parseFloat(spec.price) || 0,
            spData: spec.name + ":" + spec.value
          };
          if (spec.id) {
            skuObj.id = spec.id;
          }
          if (isEditing.value && editingProductId.value) {
            skuObj.productId = editingProductId.value;
          } else if (spec.productId) {
            skuObj.productId = spec.productId;
          }
          return skuObj;
        });
        const productData = {
          name: formData.basic.name,
          categoryId: formData.basic.categoryId || 0,
          status: formData.basic.status,
          description: formData.basic.title,
          detailHtml: formData.details,
          albumPics,
          indexPic,
          skus
        };
        common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:913", "提交的商品数据:", JSON.stringify(productData, null, 2));
        common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:914", "编辑模式:", isEditing.value, "商品ID:", editingProductId.value);
        let result;
        if (isEditing.value) {
          result = await utils_request.request({
            url: "https://bgnc.online/api/product",
            method: "PUT",
            data: {
              ...productData,
              id: editingProductId.value
              // 将ID放在请求体中
            }
          });
        } else {
          result = await utils_request.request({
            url: "https://bgnc.online/api/product",
            method: "POST",
            data: productData
          });
        }
        if (result.code === 200) {
          common_vendor.index.showToast({
            title: isEditing.value ? "修改成功" : "提交成功",
            icon: "success"
          });
          resetForm();
          fetchProducts();
          switchToList();
        } else {
          common_vendor.index.showToast({
            title: (result == null ? void 0 : result.message) || "提交失败，请检查数据",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:957", "提交商品出错:", error);
        common_vendor.index.showToast({
          title: "提交失败: " + (error.message || "未知错误"),
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const hasBoldText = common_vendor.computed(() => {
      return formData.details && formData.details.includes("<b>") && formData.details.includes("</b>");
    });
    const hasItalicText = common_vendor.computed(() => {
      return formData.details && formData.details.includes("<i>") && formData.details.includes("</i>");
    });
    const hasUnderlineText = common_vendor.computed(() => {
      return formData.details && formData.details.includes("<u>") && formData.details.includes("</u>");
    });
    const hasImages = common_vendor.computed(() => {
      return formData.details && formData.details.includes("<img");
    });
    const hasList = common_vendor.computed(() => {
      return formData.details && (formData.details.includes("<ul>") || formData.details.includes("<ol>"));
    });
    const extractBoldText = () => {
      if (!formData.details)
        return "";
      const regex = /<b>(.*?)<\/b>/g;
      const matches = formData.details.match(regex);
      if (!matches)
        return "无";
      return matches.map((match) => {
        return match.replace(/<b>/g, "").replace(/<\/b>/g, "");
      }).join(", ");
    };
    const extractItalicText = () => {
      if (!formData.details)
        return "";
      const regex = /<i>(.*?)<\/i>/g;
      const matches = formData.details.match(regex);
      if (!matches)
        return "无";
      return matches.map((match) => {
        return match.replace(/<i>/g, "").replace(/<\/i>/g, "");
      }).join(", ");
    };
    const extractUnderlineText = () => {
      if (!formData.details)
        return "";
      const regex = /<u>(.*?)<\/u>/g;
      const matches = formData.details.match(regex);
      if (!matches)
        return "无";
      return matches.map((match) => {
        return match.replace(/<u>/g, "").replace(/<\/u>/g, "");
      }).join(", ");
    };
    const countImages = () => {
      if (!formData.details)
        return 0;
      const regex = /<img/g;
      const matches = formData.details.match(regex);
      return matches ? matches.length : 0;
    };
    const countListItems = () => {
      if (!formData.details)
        return 0;
      const regex = /<li>(.*?)<\/li>/g;
      const matches = formData.details.match(regex);
      return matches ? matches.length : 0;
    };
    const categoryList = common_vendor.ref([]);
    const categoryLoading = common_vendor.ref(false);
    const categoryPopup = common_vendor.ref(null);
    const fetchCategories = async () => {
      categoryLoading.value = true;
      try {
        const result = await utils_request.request({
          url: "https://bgnc.online/api/category/list",
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:1067", "获取的分类数据:", result);
        if (result && result.data) {
          categoryList.value = result.data.map((item) => {
            return {
              id: item.id || item.categoryId || item._id,
              name: item.name || item.categoryName
            };
          });
          common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:1076", "处理后的分类列表:", categoryList.value);
        } else {
          categoryList.value = [];
          common_vendor.index.showToast({
            title: "获取分类失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:1085", "获取分类出错:", error);
        common_vendor.index.showToast({
          title: "获取分类失败: " + (error.message || "未知错误"),
          icon: "none"
        });
        categoryList.value = [
          { id: "1", name: "新鲜水果" },
          { id: "2", name: "时令蔬菜" },
          { id: "3", name: "北果南茶" },
          { id: "4", name: "坚果零食" },
          { id: "5", name: "冲饮茶品" }
        ];
      } finally {
        categoryLoading.value = false;
      }
    };
    const showCategoryPicker = () => {
      if (categoryPopup.value) {
        categoryPopup.value.open("bottom");
      }
      if (categoryList.value.length === 0 && !categoryLoading.value) {
        fetchCategories();
      }
    };
    const hideCategoryPicker = () => {
      if (categoryPopup.value) {
        categoryPopup.value.close();
      }
    };
    const selectCategory = (category) => {
      formData.basic.category = category.name;
      common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:1126", "选择的分类:", category);
      formData.basic.categoryId = category.id;
      common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:1128", "设置的categoryId:", formData.basic.categoryId);
      hideCategoryPicker();
    };
    const validateForm = () => {
      if (currentStep.value === 1) {
        if (!formData.basic.categoryId) {
          common_vendor.index.showToast({
            title: "请选择商品类别",
            icon: "none"
          });
          return false;
        }
        if (!formData.basic.name) {
          common_vendor.index.showToast({
            title: "请输入商品名称",
            icon: "none"
          });
          return false;
        }
        if (!formData.basic.title) {
          common_vendor.index.showToast({
            title: "请输入商品标题",
            icon: "none"
          });
          return false;
        }
      } else if (currentStep.value === 3) {
        for (let i = 0; i < formData.specs.length; i++) {
          if (!formData.specs[i].price) {
            common_vendor.index.showToast({
              title: `请为规格 ${i + 1} 设置价格`,
              icon: "none"
            });
            return false;
          }
        }
      }
      return true;
    };
    const currentView = common_vendor.ref("list");
    const isEditing = common_vendor.ref(false);
    const editingProductId = common_vendor.ref(null);
    const products = common_vendor.ref([]);
    const displayProducts = common_vendor.ref([]);
    const searchKeyword = common_vendor.ref("");
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const totalProducts = common_vendor.ref(0);
    const isLoading = common_vendor.ref(false);
    const hasMoreProducts = common_vendor.ref(true);
    const categoryFilter = common_vendor.ref("");
    common_vendor.ref("add");
    const fetchProducts = async (append = false) => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        const params = {
          pageNum: currentPage.value,
          pageSize: pageSize.value,
          orderByColumn: "createTime",
          isAsc: "desc"
        };
        if (searchKeyword.value.trim()) {
          params.name = searchKeyword.value.trim();
        }
        if (categoryFilter.value) {
          params.categoryId = categoryFilter.value;
        }
        common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:1213", "正在获取商品列表，参数:", params);
        const response = await utils_request.request({
          url: "https://bgnc.online/api/product/list",
          method: "GET",
          data: params
        });
        common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:1221", "获取到的商品列表响应:", response);
        if (response.code === 200) {
          let productData = response.data;
          if (Array.isArray(productData)) {
            if (append) {
              products.value = [...products.value, ...productData];
            } else {
              products.value = productData;
            }
          } else if (productData && productData.rows) {
            if (append) {
              products.value = [...products.value, ...productData.rows];
            } else {
              products.value = productData.rows;
            }
            totalProducts.value = productData.total || 0;
          } else {
            if (append) {
              products.value = [...products.value, ...productData || []];
            } else {
              products.value = productData || [];
            }
          }
          displayProducts.value = [...products.value];
          common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:1253", "处理后的商品列表:", displayProducts.value);
          hasMoreProducts.value = append ? products.value.length < totalProducts.value : Array.isArray(productData) ? productData.length >= pageSize.value : false;
        } else {
          common_vendor.index.showToast({
            title: response.msg || "获取商品列表失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:1266", "获取商品列表失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后再试",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const switchToList = () => {
      currentView.value = "list";
      if (products.value.length === 0) {
        fetchProducts();
      }
    };
    const switchToEdit = () => {
      currentView.value = "edit";
    };
    const addNewProduct = () => {
      resetForm();
      isEditing.value = false;
      editingProductId.value = null;
      currentStep.value = 1;
      switchToEdit();
    };
    const viewProduct = (product) => {
      common_vendor.index.showToast({
        title: "查看商品: " + product.name,
        icon: "none"
      });
    };
    const editProduct = async (product) => {
      try {
        isLoading.value = true;
        const result = await utils_request.request({
          url: `https://bgnc.online/api/product/${product.id}`,
          method: "GET"
        });
        if (result.code === 200 && result.data) {
          common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:1320", "111获取的商品数据:", result.data);
          const productData = result.data;
          common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:1322", "productData是", productData);
          common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:1323", "productData.skuList", productData.skuList);
          formData.basic.name = productData.name;
          formData.basic.title = productData.description;
          formData.basic.category = productData.categoryName;
          formData.basic.categoryId = productData.categoryId;
          formData.basic.status = productData.status;
          if (productData.indexPic) {
            formData.basic.images = [{ url: productData.indexPic }];
          }
          if (productData.albumPics) {
            formData.detailImages = productData.albumPics.split(",").map((url) => ({ url }));
          }
          formData.details = productData.detailHtml || "";
          formData.specs = [];
          common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:1347", "productData.skuList", productData.skuList);
          if (productData.skuList && productData.skuList.length > 0) {
            common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:1351", "使用skuList数据:", productData.skuList);
            productData.skuList.forEach((sku) => {
              if (sku.spData) {
                const parts = sku.spData.split(":");
                if (parts.length === 2) {
                  formData.specs.push({
                    id: sku.id,
                    // 保存原始SKU的ID
                    name: parts[0],
                    value: parts[1],
                    price: sku.price,
                    stock: sku.stock,
                    productId: sku.productId
                  });
                }
              }
            });
          } else if (productData.skus && productData.skus.length > 0) {
            common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:1370", "使用skus数据:", productData.skus);
            productData.skus.forEach((sku) => {
              if (sku.spData) {
                const parts = sku.spData.split(":");
                if (parts.length === 2) {
                  formData.specs.push({
                    id: sku.id,
                    name: parts[0],
                    value: parts[1],
                    price: sku.price,
                    stock: sku.stock,
                    productId: sku.productId || product.id
                  });
                }
              }
            });
          }
          if (formData.specs.length === 0) {
            formData.specs.push({
              id: null,
              name: "",
              value: "",
              price: "",
              stock: ""
            });
          }
          common_vendor.index.__f__("log", "at pages/admin/components/ProductManage.vue:1400", "解析后的规格数据:", formData.specs);
          isEditing.value = true;
          editingProductId.value = product.id;
          currentStep.value = 1;
          switchToEdit();
          common_vendor.index.showToast({
            title: "已加载商品数据",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: "获取商品详情失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:1419", "获取商品详情失败:", error);
        common_vendor.index.showToast({
          title: "获取商品详情失败: " + (error.message || "未知错误"),
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const confirmDelete = (product) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除商品"${product.name}"吗？此操作不可恢复。`,
        confirmColor: "#ff4d4f",
        success: (res) => {
          if (res.confirm) {
            deleteProduct(product.id);
          }
        }
      });
    };
    const deleteProduct = async (productId) => {
      try {
        isLoading.value = true;
        const result = await utils_request.request({
          url: `https://bgnc.online/api/product/${productId}`,
          method: "DELETE"
        });
        if (result.code === 200) {
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
          products.value = products.value.filter((item) => item.id !== productId);
          displayProducts.value = products.value;
        } else {
          common_vendor.index.showToast({
            title: (result == null ? void 0 : result.message) || "删除失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/ProductManage.vue:1470", "删除商品失败:", error);
        common_vendor.index.showToast({
          title: "删除失败: " + (error.message || "未知错误"),
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const loadMoreProducts = () => {
      if (hasMoreProducts.value && !isLoading.value) {
        currentPage.value++;
        fetchProducts(true);
      }
    };
    const searchProducts = debounce(() => {
      currentPage.value = 1;
      fetchProducts();
    }, 500);
    function debounce(fn, delay) {
      let timer = null;
      return function() {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          fn.apply(this, arguments);
          timer = null;
        }, delay);
      };
    }
    common_vendor.onMounted(() => {
      fetchProducts();
    });
    const getIconColor = (type) => {
      return currentView.value === type ? "#4a90e2" : "#666";
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "list",
          size: "18",
          color: getIconColor("list")
        }),
        b: common_vendor.n(currentView.value === "list" ? "active" : ""),
        c: common_vendor.o(($event) => switchToList()),
        d: common_vendor.p({
          type: "plusempty",
          size: "18",
          color: getIconColor("edit")
        }),
        e: common_vendor.t(isEditing.value ? "修改商品" : "添加商品"),
        f: common_vendor.n(currentView.value === "edit" ? "active" : ""),
        g: common_vendor.o(($event) => switchToEdit()),
        h: currentView.value === "list"
      }, currentView.value === "list" ? common_vendor.e({
        i: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        j: common_vendor.o([($event) => searchKeyword.value = $event.detail.value, (...args) => common_vendor.unref(searchProducts) && common_vendor.unref(searchProducts)(...args)]),
        k: searchKeyword.value,
        l: common_vendor.f(displayProducts.value, (product, index, i0) => {
          return {
            a: product.indexPic || "/static/images/default-product.png",
            b: common_vendor.t(product.name),
            c: common_vendor.t(product.description),
            d: common_vendor.o(($event) => viewProduct(product), product.id),
            e: "7c24ceb6-3-" + i0,
            f: common_vendor.o(($event) => editProduct(product), product.id),
            g: "7c24ceb6-4-" + i0,
            h: common_vendor.o(($event) => confirmDelete(product), product.id),
            i: product.id
          };
        }),
        m: common_vendor.p({
          type: "compose",
          size: "16",
          color: "#4a90e2"
        }),
        n: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#ff4d4f"
        }),
        o: common_vendor.p({
          type: "plusempty",
          size: "36",
          color: "#ddd"
        }),
        p: common_vendor.o(addNewProduct),
        q: products.value.length > 0 && !isLoading.value && hasMoreProducts.value
      }, products.value.length > 0 && !isLoading.value && hasMoreProducts.value ? {
        r: common_vendor.o(loadMoreProducts)
      } : {}, {
        s: isLoading.value
      }, isLoading.value ? {
        t: common_vendor.p({
          type: "spinner-cycle",
          size: "24",
          color: "#999"
        })
      } : {}, {
        v: products.value.length === 0 && !isLoading.value
      }, products.value.length === 0 && !isLoading.value ? {} : {}) : {}, {
        w: currentView.value === "edit"
      }, currentView.value === "edit" ? {
        x: common_vendor.f(3, (step, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: common_vendor.t(["基本信息", "商品详情", "规格设置"][index]),
            c: index,
            d: common_vendor.n(currentStep.value === index + 1 ? "active" : "")
          };
        })
      } : {}, {
        y: currentView.value === "edit"
      }, currentView.value === "edit" ? common_vendor.e({
        z: currentStep.value === 1
      }, currentStep.value === 1 ? common_vendor.e({
        A: formData.basic.category
      }, formData.basic.category ? {
        B: common_vendor.t(formData.basic.category)
      } : {}, {
        C: common_vendor.p({
          type: "bottom",
          size: "14",
          color: "#999"
        }),
        D: common_vendor.o(showCategoryPicker),
        E: common_vendor.p({
          type: "close",
          size: "20",
          color: "#666"
        }),
        F: common_vendor.o(hideCategoryPicker),
        G: common_vendor.f(categoryList.value, (category, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(category.name),
            b: formData.basic.category === category.name
          }, formData.basic.category === category.name ? {
            c: "7c24ceb6-12-" + i0 + ",7c24ceb6-10",
            d: common_vendor.p({
              type: "checkmarkempty",
              size: "18",
              color: "#4a90e2"
            })
          } : {}, {
            e: index,
            f: formData.basic.category === category.name ? 1 : "",
            g: common_vendor.o(($event) => selectCategory(category), index)
          });
        }),
        H: categoryLoading.value
      }, categoryLoading.value ? {} : {}, {
        I: !categoryLoading.value && categoryList.value.length === 0
      }, !categoryLoading.value && categoryList.value.length === 0 ? {} : {}, {
        J: common_vendor.sr(categoryPopup, "7c24ceb6-10,7c24ceb6-8", {
          "k": "categoryPopup"
        }),
        K: common_vendor.p({
          type: "bottom"
        }),
        L: common_vendor.p({
          label: "商品类别",
          required: true
        }),
        M: formData.basic.name,
        N: common_vendor.o(($event) => formData.basic.name = $event.detail.value),
        O: common_vendor.p({
          label: "商品名称",
          required: true
        }),
        P: formData.basic.title,
        Q: common_vendor.o(($event) => formData.basic.title = $event.detail.value),
        R: common_vendor.p({
          label: "商品标题",
          required: true
        }),
        S: formData.basic.status === 1,
        T: common_vendor.o(handleSwitchChange),
        U: common_vendor.t(formData.basic.status === 1 ? "已上架" : "未上架"),
        V: common_vendor.p({
          label: "是否上架"
        }),
        W: common_vendor.o(handleImageSelect),
        X: common_vendor.o(handleImageDelete),
        Y: common_vendor.o(($event) => formData.basic.images = $event),
        Z: common_vendor.p({
          limit: "9",
          ["file-mediatype"]: "image",
          ["return-type"]: "array",
          ["image-styles"]: {
            width: "200rpx",
            height: "200rpx"
          },
          modelValue: formData.basic.images
        }),
        aa: common_vendor.p({
          label: "商品图片"
        }),
        ab: common_vendor.p({
          modelValue: formData.basic
        })
      }) : {}, {
        ac: currentStep.value === 2
      }, currentStep.value === 2 ? common_vendor.e({
        ad: formData.details,
        ae: common_vendor.o(($event) => formData.details = $event.detail.value),
        af: common_vendor.o(($event) => insertHtmlTag("<b>粗体文本</b>")),
        ag: common_vendor.o(($event) => insertHtmlTag("<i>斜体文本</i>")),
        ah: common_vendor.o(($event) => insertHtmlTag("<u>下划线文本</u>")),
        ai: common_vendor.o(($event) => insertHtmlTag("<h3>标题文本</h3>")),
        aj: common_vendor.o(($event) => insertHtmlTag("<ul><li>列表项1</li><li>列表项2</li></ul>")),
        ak: common_vendor.o(insertHtmlImage),
        al: formData.details || "<p>暂无内容，请在上方输入内容</p>",
        am: hasBoldText.value
      }, hasBoldText.value ? {
        an: common_vendor.t(extractBoldText())
      } : {}, {
        ao: hasItalicText.value
      }, hasItalicText.value ? {
        ap: common_vendor.t(extractItalicText())
      } : {}, {
        aq: hasUnderlineText.value
      }, hasUnderlineText.value ? {
        ar: common_vendor.t(extractUnderlineText())
      } : {}, {
        as: hasImages.value
      }, hasImages.value ? {
        at: common_vendor.t(countImages())
      } : {}, {
        av: hasList.value
      }, hasList.value ? {
        aw: common_vendor.t(countListItems())
      } : {}, {
        ax: common_vendor.o(handleDetailImageSelect),
        ay: common_vendor.o(handleDetailImageDelete),
        az: common_vendor.o(($event) => formData.detailImages = $event),
        aA: common_vendor.p({
          ["file-mediatype"]: "image",
          mode: "grid",
          ["return-type"]: "array",
          limit: "20",
          modelValue: formData.detailImages
        })
      }) : {}, {
        aB: currentStep.value === 3
      }, currentStep.value === 3 ? {
        aC: common_vendor.f(formData.specs, (spec, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: "7c24ceb6-19-" + i0,
            c: common_vendor.o(($event) => removeSpec(index), index),
            d: spec.name,
            e: common_vendor.o(($event) => spec.name = $event.detail.value, index),
            f: spec.value,
            g: common_vendor.o(($event) => spec.value = $event.detail.value, index),
            h: spec.price,
            i: common_vendor.o(($event) => spec.price = $event.detail.value, index),
            j: spec.stock,
            k: common_vendor.o(($event) => spec.stock = $event.detail.value, index),
            l: index
          };
        }),
        aD: common_vendor.p({
          type: "close",
          size: "18",
          color: "#fff"
        }),
        aE: common_vendor.p({
          type: "plus",
          size: "16"
        }),
        aF: common_vendor.o(addSpec)
      } : {}) : {}, {
        aG: currentView.value === "edit"
      }, currentView.value === "edit" ? common_vendor.e({
        aH: currentStep.value > 1
      }, currentStep.value > 1 ? {
        aI: common_vendor.o(prevStep)
      } : {}, {
        aJ: common_vendor.o(saveData),
        aK: currentStep.value < 3
      }, currentStep.value < 3 ? {
        aL: common_vendor.o(nextStep)
      } : {
        aM: common_vendor.t(isEditing.value ? "保存修改" : "提交商品"),
        aN: common_vendor.o(submitProduct)
      }) : {});
    };
  }
});
exports._sfc_main = _sfc_main;
//# sourceMappingURL=../.sourcemap/mp-weixin/ProductManage.js.map
