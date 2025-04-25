"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "list",
  setup(__props) {
    const searchText = common_vendor.ref("");
    const addressList = common_vendor.ref([]);
    const filteredAddresses = common_vendor.computed(() => {
      if (!searchText.value)
        return addressList.value;
      return addressList.value.filter(
        (address) => address.name.includes(searchText.value) || address.phone.includes(searchText.value)
      );
    });
    const getAddressList = async () => {
      try {
        const res = await utils_request.request({
          url: "https://bgnc.online/api/addressbook/list",
          method: "GET"
        });
        common_vendor.index.__f__("log", "at pages/address/list.vue:77", "获取地址列表响应:", res);
        if (res.code === 200 || res.code === 0) {
          addressList.value = res.data || [];
        } else {
          common_vendor.index.showToast({
            title: res.msg || "获取地址失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/address/list.vue:88", "获取地址列表失败：", error);
        common_vendor.index.showToast({
          title: "获取地址失败，请稍后再试",
          icon: "none"
        });
      }
    };
    const addNewAddress = () => {
      common_vendor.index.navigateTo({
        url: "/pages/address/edit"
      });
    };
    const editAddress = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/address/edit`
      });
    };
    const deleteAddress = (id) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除该收货地址吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await utils_request.request({
                url: `https://bgnc.online/api/addressbook/?id=${id}`,
                method: "DELETE",
                data: { id }
              });
              if (result.code === 200) {
                addressList.value = addressList.value.filter((item) => item.id !== id);
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
              } else {
                common_vendor.index.showToast({
                  title: result.msg || "删除失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.showToast({
                title: "删除失败，请稍后再试",
                icon: "none"
              });
            }
          }
        }
      });
    };
    common_vendor.onMounted(() => {
      getAddressList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: searchText.value,
        b: common_vendor.o(($event) => searchText.value = $event.detail.value),
        c: addressList.value.length > 0
      }, addressList.value.length > 0 ? {
        d: common_vendor.f(filteredAddresses.value, (address, index, i0) => {
          return {
            a: common_vendor.t(address.name),
            b: common_vendor.t(address.phone),
            c: common_vendor.t(address.province),
            d: common_vendor.t(address.city),
            e: common_vendor.t(address.district),
            f: common_vendor.t(address.detail),
            g: common_vendor.o(($event) => editAddress(address.id), address.id),
            h: common_vendor.o(($event) => _ctx.setDefaultAddress(address.id), address.id),
            i: address.isDefault ? 1 : "",
            j: common_vendor.o(($event) => deleteAddress(address.id), address.id),
            k: address.id
          };
        })
      } : {
        e: common_assets._imports_0$5
      }, {
        f: common_vendor.o(addNewAddress)
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/address/list.js.map
