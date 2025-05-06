"use strict";
const common_vendor = require("./common/vendor.js");
const utils_request = require("./utils/request.js");
const _sfc_main = {
  __name: "DiscountManage",
  setup(__props) {
    const discountList = common_vendor.ref([]);
    const memberLevelNames = {
      1: "普通会员",
      2: "白银会员",
      3: "黄金会员",
      4: "钻石会员"
    };
    const getMemberLevelName = (level) => {
      return memberLevelNames[level] || `未知等级`;
    };
    const fetchDiscounts = async () => {
      try {
        const res = await utils_request.request({
          url: "https://bgnc.online/api/discount/",
          method: "GET"
        });
        if (res.code === 200 && res.data) {
          common_vendor.index.__f__("log", "at pages/admin/components/DiscountManage.vue:96", "获取到的折扣数据:", res.data);
          discountList.value = res.data.map((item) => ({
            ...item,
            discount: parseFloat(item.discount) * 10,
            // 转换为折扣值
            inputValue: (parseFloat(item.discount) * 10).toString(),
            // 用于输入框显示
            originalDiscount: parseFloat(item.discount) * 10,
            // 保存原始值用于比较
            saving: false,
            // 保存状态
            changed: false
            // 是否修改过
          }));
        } else {
          common_vendor.index.showToast({
            title: res.msg || "获取折扣数据失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/DiscountManage.vue:114", "获取折扣数据失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请稍后再试",
          icon: "none"
        });
      }
    };
    const validateInput = (discount) => {
      let value = discount.inputValue;
      value = value.replace(/[^\d.]/g, "");
      const parts = value.split(".");
      if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
      }
      if (parts.length === 2 && parts[1].length > 1) {
        value = parts[0] + "." + parts[1].substring(0, 1);
      }
      let numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        if (numValue > 10)
          value = "10";
        if (numValue < 0)
          value = "0";
      }
      discount.inputValue = value;
      const newValue = parseFloat(value) || 0;
      discount.discount = newValue;
      discount.changed = newValue !== discount.originalDiscount;
    };
    const handleInputBlur = (discount) => {
      if (discount.inputValue === "") {
        discount.inputValue = "0";
        discount.discount = 0;
        discount.changed = 0 !== discount.originalDiscount;
      }
    };
    const saveSingleDiscount = async (discount) => {
      discount.saving = true;
      const originalValue = discount.discount;
      try {
        const discountValue = (parseFloat(discount.discount) / 10).toFixed(2).toString();
        common_vendor.index.showLoading({
          title: "保存中"
        });
        const res = await utils_request.request({
          url: `https://bgnc.online/api/discount/?memberLevel=${parseInt(discount.memberLevel)}&discount=${discountValue}`,
          method: "PUT"
        });
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "保存成功",
            icon: "success"
          });
          await fetchDiscounts();
        } else {
          discount.discount = originalValue;
          discount.inputValue = originalValue.toString();
          common_vendor.index.showToast({
            title: res.msg || "保存失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/DiscountManage.vue:200", "保存折扣设置失败:", error);
        discount.discount = originalValue;
        discount.inputValue = originalValue.toString();
        common_vendor.index.showToast({
          title: "网络错误，请稍后再试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
        discount.saving = false;
      }
    };
    common_vendor.onMounted(() => {
      fetchDiscounts();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(discountList.value, (discount, index, i0) => {
          return {
            a: common_vendor.t(discount.memberLevel),
            b: common_vendor.n(`level-${discount.memberLevel}`),
            c: common_vendor.t(getMemberLevelName(discount.memberLevel)),
            d: common_vendor.o([($event) => discount.inputValue = $event.detail.value, index, ($event) => validateInput(discount), index], index),
            e: common_vendor.o(($event) => handleInputBlur(discount), index),
            f: discount.inputValue,
            g: common_vendor.t(discount.discount),
            h: common_vendor.t(discount.saving ? "保存中..." : "更新"),
            i: common_vendor.o(($event) => saveSingleDiscount(discount), index),
            j: discount.saving || !discount.changed,
            k: discount.saving,
            l: index
          };
        })
      };
    };
  }
};
exports._sfc_main = _sfc_main;
//# sourceMappingURL=../.sourcemap/mp-weixin/DiscountManage.js.map
