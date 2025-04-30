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
const indicatorStyle = "height: 80rpx;";
const _sfc_main = {
  __name: "edit",
  setup(__props) {
    const selectedAddressId = common_vendor.ref("");
    const addressForm = common_vendor.ref({
      consignee: "",
      phone: "",
      region: "",
      detail: "",
      isDefault: false
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
    const phoneError = common_vendor.ref("");
    let previousPickerValue = [];
    const validatePhone = () => {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!addressForm.value.phone) {
        phoneError.value = "请输入手机号码";
        return false;
      } else if (!phoneRegex.test(addressForm.value.phone)) {
        phoneError.value = "请输入正确的手机号码";
        return false;
      } else {
        phoneError.value = "";
        return true;
      }
    };
    const openRegionPicker = () => {
      previousPickerValue = [...pickerValue.value];
      common_vendor.index.__f__("log", "at pages/address/edit.vue:256", "打开地区选择器，当前值:", pickerValue.value);
      regionPopup.value.open();
    };
    const cancelRegion = () => {
      pickerValue.value = previousPickerValue;
      common_vendor.index.__f__("log", "at pages/address/edit.vue:264", "取消地区选择，恢复值:", pickerValue.value);
      regionPopup.value.close();
    };
    const confirmRegion = () => {
      if (pickerValue.value.length !== 3) {
        common_vendor.index.showToast({
          title: "请选择完整的地区信息",
          icon: "none"
        });
        return;
      }
      const province = provinces.value[pickerValue.value[0]];
      const city = cities.value[pickerValue.value[1]];
      const district = districts.value[pickerValue.value[2]];
      if (!province || !city || !district) {
        common_vendor.index.showToast({
          title: "请选择完整的地区信息",
          icon: "none"
        });
        return;
      }
      addressForm.value.region = `${province.name}${city.name}${district.name}`;
      addressForm.value.provinceCode = province.code;
      addressForm.value.provinceName = province.name;
      addressForm.value.cityCode = city.code;
      addressForm.value.cityName = city.name;
      addressForm.value.districtCode = district.code;
      addressForm.value.districtName = district.name;
      common_vendor.index.__f__("log", "at pages/address/edit.vue:299", "确认选择地区:", addressForm.value.region);
      regionPopup.value.close();
    };
    const handleSave = async () => {
      if (!addressForm.value.consignee) {
        common_vendor.index.showToast({
          title: "请输入收货人姓名",
          icon: "none"
        });
        return;
      }
      if (!validatePhone()) {
        return;
      }
      if (!addressForm.value.region) {
        common_vendor.index.showToast({
          title: "请选择所在地区",
          icon: "none"
        });
        return;
      }
      if (!addressForm.value.detail) {
        common_vendor.index.showToast({
          title: "请输入详细地址",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "保存中..."
      });
      try {
        const data = {
          consignee: addressForm.value.consignee,
          phone: addressForm.value.phone,
          provinceCode: addressForm.value.provinceCode,
          provinceName: addressForm.value.provinceName,
          cityCode: addressForm.value.cityCode,
          cityName: addressForm.value.cityName,
          districtCode: addressForm.value.districtCode,
          districtName: addressForm.value.districtName,
          detail: addressForm.value.detail,
          isDefault: addressForm.value.isDefault ? 1 : 0
        };
        if (editingAddress.value) {
          data.id = editingAddress.value.id;
          const result = await utils_request.request({
            url: "https://bgnc.online/api/addressbook/",
            method: "PUT",
            data
          });
          if (result.code === 200) {
            common_vendor.index.showToast({
              title: "修改成功",
              icon: "success"
            });
            formPopup.value.close();
            getAddressList();
          } else {
            common_vendor.index.showToast({
              title: result.msg || "修改失败",
              icon: "none"
            });
          }
        } else {
          const result = await utils_request.request({
            url: "https://bgnc.online/api/addressbook/",
            method: "POST",
            data
          });
          if (result.code === 200) {
            common_vendor.index.showToast({
              title: "添加成功",
              icon: "success"
            });
            formPopup.value.close();
            getAddressList();
          } else {
            common_vendor.index.showToast({
              title: result.msg || "添加失败",
              icon: "none"
            });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/address/edit.vue:401", "保存地址失败：", error);
        common_vendor.index.showToast({
          title: "保存失败，请稍后再试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const getAddressList = async () => {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const res = await utils_request.request({
          url: "https://bgnc.online/api/addressbook/list",
          method: "GET"
        });
        if (res.code === 200) {
          addressList.value = res.data || [];
          const defaultAddress = addressList.value.find((item) => item.isDefault);
          if (defaultAddress) {
            selectedAddressId.value = defaultAddress.id;
            common_vendor.index.setStorageSync("selectedAddressId", defaultAddress.id);
          } else if (addressList.value.length > 0) {
            selectedAddressId.value = addressList.value[0].id;
            common_vendor.index.setStorageSync("selectedAddressId", addressList.value[0].id);
          }
        } else {
          common_vendor.index.showToast({
            title: res.msg || "获取地址列表失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/address/edit.vue:445", "获取地址列表失败：", error);
        common_vendor.index.showToast({
          title: "获取地址列表失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const selectAddress = (address) => {
      selectedAddressId.value = address.id;
      common_vendor.index.setStorageSync("selectedAddressId", address.id);
      common_vendor.index.showToast({
        title: "已选择该地址",
        icon: "success",
        duration: 1500
      });
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage && prevPage.route.includes("checkout")) {
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1e3);
      }
    };
    const deleteAddress = (id) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除该地址吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({
                title: "删除中..."
              });
              const result = await utils_request.request({
                url: `https://bgnc.online/api/addressbook/${id}`,
                method: "DELETE"
              });
              if (result.code === 200) {
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                if (selectedAddressId.value === id) {
                  selectedAddressId.value = "";
                  common_vendor.index.removeStorageSync("selectedAddressId");
                }
                getAddressList();
              } else {
                common_vendor.index.showToast({
                  title: result.msg || "删除失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/address/edit.vue:515", "删除地址失败：", error);
              common_vendor.index.showToast({
                title: "删除失败，请稍后再试",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const editAddress = (address) => {
      editingAddress.value = address;
      addressForm.value = {
        consignee: address.consignee,
        phone: address.phone,
        region: `${address.provinceName}${address.cityName}${address.districtName}`,
        detail: address.detail,
        provinceCode: address.provinceCode,
        provinceName: address.provinceName,
        cityCode: address.cityCode,
        cityName: address.cityName,
        districtCode: address.districtCode,
        districtName: address.districtName,
        isDefault: address.isDefault === 1
      };
      const findProvinceIndex = provinces.value.findIndex((p) => p.code === address.provinceCode);
      if (findProvinceIndex !== -1) {
        cities.value = utils_areaData.getCities(address.provinceCode);
        const findCityIndex = cities.value.findIndex((c) => c.code === address.cityCode);
        if (findCityIndex !== -1) {
          districts.value = utils_areaData.getDistricts(address.cityCode);
          const findDistrictIndex = districts.value.findIndex((d) => d.code === address.districtCode);
          pickerValue.value = [
            findProvinceIndex,
            findCityIndex,
            findDistrictIndex !== -1 ? findDistrictIndex : 0
          ];
          previousPickerValue = [...pickerValue.value];
        }
      }
      common_vendor.nextTick$1(() => {
        formPopup.value.open();
      });
    };
    const showAddressForm = () => {
      editingAddress.value = null;
      addressForm.value = {
        consignee: "",
        phone: "",
        region: "",
        detail: "",
        isDefault: false
      };
      formPopup.value.open();
    };
    const closeForm = () => {
      formPopup.value.close();
    };
    const handlePickerChange = (e) => {
      const values = e.detail.value;
      pickerValue.value = values;
      if (values[0] !== previousPickerValue[0]) {
        const selectedProvince = provinces.value[values[0]];
        if (selectedProvince) {
          cities.value = utils_areaData.getCities(selectedProvince.code);
          if (cities.value.length > 0) {
            districts.value = utils_areaData.getDistricts(cities.value[0].code);
          } else {
            districts.value = [];
          }
          pickerValue.value = [values[0], 0, 0];
        }
      } else if (values[1] !== previousPickerValue[1]) {
        const selectedCity = cities.value[values[1]];
        if (selectedCity) {
          districts.value = utils_areaData.getDistricts(selectedCity.code);
          pickerValue.value = [values[0], values[1], 0];
        }
      }
      previousPickerValue = [...pickerValue.value];
    };
    common_vendor.onMounted(() => {
      provinces.value = utils_areaData.getProvinces();
      common_vendor.index.__f__("log", "at pages/address/edit.vue:638", "初始化省份数据:", provinces.value);
      if (provinces.value.length > 0) {
        cities.value = utils_areaData.getCities(provinces.value[0].code);
        common_vendor.index.__f__("log", "at pages/address/edit.vue:643", "初始化城市数据:", cities.value);
        if (cities.value.length > 0) {
          districts.value = utils_areaData.getDistricts(cities.value[0].code);
          common_vendor.index.__f__("log", "at pages/address/edit.vue:648", "初始化区县数据:", districts.value);
        }
      }
      getAddressList();
      const storedAddressId = common_vendor.index.getStorageSync("selectedAddressId");
      if (storedAddressId) {
        selectedAddressId.value = storedAddressId;
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(addressList.value, (address, k0, i0) => {
          return common_vendor.e({
            a: address.id === selectedAddressId.value
          }, address.id === selectedAddressId.value ? {
            b: "10615b9a-0-" + i0,
            c: common_vendor.p({
              type: "checkmarkempty",
              size: "14",
              color: "#fff"
            })
          } : {}, {
            d: address.id === selectedAddressId.value ? 1 : "",
            e: common_vendor.t(address.consignee),
            f: common_vendor.t(address.phone),
            g: common_vendor.t(address.provinceName),
            h: common_vendor.t(address.cityName),
            i: common_vendor.t(address.districtName),
            j: common_vendor.t(address.detail),
            k: address.isDefault
          }, address.isDefault ? {} : {}, {
            l: common_vendor.o(($event) => editAddress(address), address.id),
            m: common_vendor.o(($event) => deleteAddress(address.id), address.id),
            n: address.id,
            o: common_vendor.o(($event) => selectAddress(address), address.id)
          });
        }),
        b: common_vendor.o(showAddressForm),
        c: common_vendor.t(editingAddress.value ? "修改地址" : "新增地址"),
        d: common_vendor.o(closeForm),
        e: addressForm.value.consignee,
        f: common_vendor.o(($event) => addressForm.value.consignee = $event.detail.value),
        g: common_vendor.o(validatePhone),
        h: addressForm.value.phone,
        i: common_vendor.o(($event) => addressForm.value.phone = $event.detail.value),
        j: phoneError.value
      }, phoneError.value ? {
        k: common_vendor.t(phoneError.value)
      } : {}, {
        l: addressForm.value.region
      }, addressForm.value.region ? {
        m: common_vendor.t(addressForm.value.region)
      } : {}, {
        n: common_vendor.o(openRegionPicker),
        o: addressForm.value.detail,
        p: common_vendor.o(($event) => addressForm.value.detail = $event.detail.value),
        q: addressForm.value.isDefault,
        r: common_vendor.o((e) => addressForm.value.isDefault = e.detail.value),
        s: common_vendor.t(editingAddress.value ? "修改" : "保存"),
        t: common_vendor.o(handleSave),
        v: common_vendor.sr(formPopup, "10615b9a-1", {
          "k": "formPopup"
        }),
        w: common_vendor.p({
          type: "bottom"
        }),
        x: common_vendor.o(cancelRegion),
        y: common_vendor.o(confirmRegion),
        z: common_vendor.f(provinces.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: index
          };
        }),
        A: common_vendor.f(cities.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: index
          };
        }),
        B: common_vendor.f(districts.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.name),
            b: index
          };
        }),
        C: indicatorStyle,
        D: pickerValue.value,
        E: common_vendor.o(handlePickerChange),
        F: common_vendor.sr(regionPopup, "10615b9a-2", {
          "k": "regionPopup"
        }),
        G: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/address/edit.js.map
