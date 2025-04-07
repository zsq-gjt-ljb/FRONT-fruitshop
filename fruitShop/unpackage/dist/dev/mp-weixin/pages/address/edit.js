"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_areaData = require("../../utils/area-data.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "edit",
  setup(__props) {
    const selectedAddressId = common_vendor.ref("");
    const addressForm = common_vendor.ref({
      consignee: "",
      phone: "",
      region: "",
      detail: ""
    });
    const regionPopup = common_vendor.ref(null);
    const pickerValue = common_vendor.ref([0, 0, 0]);
    const provinces = common_vendor.ref([]);
    const cities = common_vendor.ref([]);
    const districts = common_vendor.ref([]);
    const addressList = common_vendor.ref([]);
    common_vendor.ref(false);
    const editingAddress = common_vendor.ref(null);
    const formPopup = common_vendor.ref(null);
    common_vendor.ref(null);
    const showRegionPicker = () => {
      regionPopup.value.open();
    };
    const closeRegionPicker = () => {
      regionPopup.value.close();
    };
    const confirmRegion = () => {
      const province = provinces.value[pickerValue.value[0]];
      const city = cities.value[pickerValue.value[1]];
      const district = districts.value[pickerValue[2]];
      addressForm.value.region = getFullRegion(province, city, district);
      closeRegionPicker();
    };
    const handlePickerChange = (e) => {
      const values = e.detail.value;
      pickerValue.value = values;
      updateCities(values[0]);
      updateDistricts(values[0], values[1]);
    };
    const updateCities = (provinceIndex) => {
      const province = provinces.value[provinceIndex];
      cities.value = utils_areaData.getCities(province);
      districts.value = utils_areaData.getDistricts(province, cities.value[0]);
    };
    const updateDistricts = (provinceIndex, cityIndex) => {
      const province = provinces.value[provinceIndex];
      const city = cities.value[cityIndex];
      districts.value = utils_areaData.getDistricts(province, city);
    };
    const getAddressList = async () => {
      try {
        const res = await utils_request.request({
          url: "http://82.156.12.240:8080/api/addressbook/list",
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/address/edit.vue:263", "原始响应数据:", res.data);
        if (res.code === 200 && res.data) {
          addressList.value = res.data.map((item) => ({
            ...item,
            id: item.id.toString()
            // 将数字ID转换为字符串
          }));
          common_vendor.index.__f__("log", "at pages/address/edit.vue:271", "处理后的地址列表:", addressList.value);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/address/edit.vue:274", "获取地址列表失败:", error);
        common_vendor.index.showToast({
          title: "获取地址失败",
          icon: "none"
        });
      }
    };
    const showAddressForm = () => {
      editingAddress.value = null;
      addressForm.value = {
        consignee: "",
        phone: "",
        region: "",
        detail: ""
      };
      formPopup.value.open();
    };
    const editAddress = (address) => {
      common_vendor.index.__f__("log", "at pages/address/edit.vue:296", "编辑的地址信息:", address);
      editingAddress.value = address;
      addressForm.value = {
        consignee: address.consignee,
        phone: address.phone,
        region: `${address.provinceName} ${address.cityName} ${address.districtName}`,
        detail: address.detail,
        id: address.id.toString()
        // 确保ID是字符串
      };
      common_vendor.index.__f__("log", "at pages/address/edit.vue:305", "编辑表单数据:", addressForm.value);
      formPopup.value.open();
    };
    const deleteAddress = async (id) => {
      common_vendor.index.__f__("log", "at pages/address/edit.vue:311", "要删除的地址ID:", id);
      try {
        common_vendor.index.showModal({
          title: "提示",
          content: "确定要删除这个地址吗？",
          success: async (res) => {
            if (res.confirm) {
              const res2 = await utils_request.request({
                url: `http://82.156.12.240:8080/api/addressbook/${id.toString()}`,
                // 确保传递字符串ID
                method: "DELETE"
              });
              common_vendor.index.__f__("log", "at pages/address/edit.vue:324", "删除响应:", res2);
              if (res2.code === 200) {
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                getAddressList();
              } else {
                common_vendor.index.showToast({
                  title: "删除失败",
                  icon: "none"
                });
              }
            }
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/address/edit.vue:343", "删除地址失败:", error);
        common_vendor.index.showToast({
          title: "删除失败",
          icon: "none"
        });
      }
    };
    const handleSave = async () => {
      var _a, _b;
      common_vendor.index.__f__("log", "at pages/address/edit.vue:400", "保存按钮被点击");
      try {
        const addressData = {
          consignee: addressForm.value.consignee,
          phone: addressForm.value.phone,
          provinceName: provinces.value[pickerValue.value[0]],
          cityName: cities.value[pickerValue.value[1]],
          districtName: districts.value[pickerValue.value[2]],
          detail: addressForm.value.detail,
          sex: "男",
          id: (_b = (_a = editingAddress.value) == null ? void 0 : _a.id) == null ? void 0 : _b.toString()
          // 确保ID是字符串
        };
        common_vendor.index.__f__("log", "at pages/address/edit.vue:414", "发送的请求数据:", addressData);
        const res = await utils_request.request({
          url: "http://82.156.12.240:8080/api/addressbook/",
          method: editingAddress.value ? "PUT" : "POST",
          // 修改使用PUT，新增使用POST
          data: addressData
        });
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: editingAddress.value ? "修改成功" : "保存成功",
            icon: "success"
          });
          formPopup.value.close();
          getAddressList();
        } else {
          common_vendor.index.showToast({
            title: editingAddress.value ? "修改失败" : "保存失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/address/edit.vue:439", "保存地址失败:", error);
        common_vendor.index.showToast({
          title: editingAddress.value ? "修改失败" : "保存失败",
          icon: "none"
        });
      }
    };
    const getFullRegion = (province, city, district) => {
      return `${province} ${city} ${district}`;
    };
    const closeForm = () => {
      formPopup.value.close();
    };
    const selectAddress = (address) => {
      selectedAddressId.value = address.id;
      common_vendor.index.setStorageSync("selectedAddressId", address.id.toString());
      common_vendor.index.showToast({
        title: "已选择该地址",
        icon: "success",
        duration: 1500
      });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 1500);
    };
    common_vendor.onMounted(() => {
      provinces.value = utils_areaData.getProvinces();
      common_vendor.index.__f__("log", "at pages/address/edit.vue:478", "省份数据:", provinces.value);
      cities.value = utils_areaData.getCities(provinces.value[0]);
      common_vendor.index.__f__("log", "at pages/address/edit.vue:482", "城市数据:", cities.value);
      districts.value = utils_areaData.getDistricts(provinces.value[0], cities.value[0]);
      common_vendor.index.__f__("log", "at pages/address/edit.vue:486", "区县数据:", districts.value);
      const savedAddressId = common_vendor.index.getStorageSync("selectedAddressId");
      if (savedAddressId) {
        selectedAddressId.value = savedAddressId;
      }
      getAddressList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(addressList.value, (address, k0, i0) => {
          return common_vendor.e({
            a: address.id === selectedAddressId.value
          }, address.id === selectedAddressId.value ? {
            b: "8e456dc0-0-" + i0,
            c: common_vendor.p({
              type: "checkmarkempty",
              size: "14",
              color: "#fff"
            })
          } : {}, {
            d: address.id === selectedAddressId.value ? 1 : "",
            e: common_vendor.o(($event) => selectAddress(address), address.id),
            f: common_vendor.t(address.consignee),
            g: common_vendor.t(address.phone),
            h: common_vendor.t(address.provinceName),
            i: common_vendor.t(address.cityName),
            j: common_vendor.t(address.districtName),
            k: common_vendor.t(address.detail),
            l: address.isDefault
          }, address.isDefault ? {} : {}, {
            m: common_vendor.o(($event) => deleteAddress(address.id), address.id),
            n: address.id,
            o: common_vendor.o(($event) => editAddress(address), address.id)
          });
        }),
        b: common_vendor.o(showAddressForm),
        c: common_vendor.t(editingAddress.value ? "修改地址" : "新增地址"),
        d: common_vendor.o(closeForm),
        e: addressForm.value.consignee,
        f: common_vendor.o(($event) => addressForm.value.consignee = $event.detail.value),
        g: addressForm.value.phone,
        h: common_vendor.o(($event) => addressForm.value.phone = $event.detail.value),
        i: addressForm.value.region
      }, addressForm.value.region ? {
        j: common_vendor.t(addressForm.value.region)
      } : {}, {
        k: common_vendor.o(showRegionPicker),
        l: addressForm.value.detail,
        m: common_vendor.o(($event) => addressForm.value.detail = $event.detail.value),
        n: common_vendor.t(editingAddress.value ? "修改" : "保存"),
        o: common_vendor.o(handleSave),
        p: common_vendor.sr(formPopup, "8e456dc0-1", {
          "k": "formPopup"
        }),
        q: common_vendor.p({
          type: "bottom"
        }),
        r: common_vendor.o(closeRegionPicker),
        s: common_vendor.o(confirmRegion),
        t: common_vendor.f(provinces.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index
          };
        }),
        v: common_vendor.f(cities.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index
          };
        }),
        w: common_vendor.f(districts.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index
          };
        }),
        x: _ctx.indicatorStyle,
        y: pickerValue.value,
        z: common_vendor.o(handlePickerChange),
        A: common_vendor.sr(regionPopup, "8e456dc0-2", {
          "k": "regionPopup"
        }),
        B: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/address/edit.js.map
