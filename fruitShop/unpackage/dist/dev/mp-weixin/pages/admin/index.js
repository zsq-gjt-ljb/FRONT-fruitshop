"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_icons + ProductManage + CategoryManage + HomeManage + OrderManage + UserManage)();
}
const ProductManage = () => "./components/ProductManage2.js";
const CategoryManage = () => "./components/CategoryManage.js";
const HomeManage = () => "./components/HomeManage.js";
const OrderManage = () => "./components/OrderManage.js";
const UserManage = () => "./components/UserManage.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const activeMenu = common_vendor.ref("product");
    const adminInfo = common_vendor.ref({
      avatar: common_vendor.index.getStorageSync("userAvatar") || "/static/images/default-avatar.png",
      name: common_vendor.index.getStorageSync("userName") || "Admin"
    });
    const menuItems = common_vendor.ref([
      { id: "product", name: "商品管理", icon: "shop" },
      { id: "category", name: "分类管理", icon: "list" },
      { id: "home", name: "首页管理", icon: "home" },
      { id: "order", name: "订单管理", icon: "cart" },
      { id: "user", name: "用户管理", icon: "person" }
    ]);
    const switchMenu = (menuId) => {
      activeMenu.value = menuId;
      common_vendor.index.__f__("log", "at pages/admin/index.vue:73", "切换到菜单:", menuId);
    };
    common_vendor.onMounted(() => {
      common_vendor.index.__f__("log", "at pages/admin/index.vue:78", "管理员页面已加载");
      common_vendor.index.__f__("log", "at pages/admin/index.vue:79", "当前激活的菜单:", activeMenu.value);
      common_vendor.index.__f__("log", "at pages/admin/index.vue:80", "管理员信息:", adminInfo.value);
      common_vendor.index.__f__("log", "at pages/admin/index.vue:81", "组件是否已注册:", !!ProductManage, !!CategoryManage, !!HomeManage, !!OrderManage, !!UserManage);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: adminInfo.value.avatar,
        b: common_vendor.t(adminInfo.value.name),
        c: common_vendor.f(menuItems.value, (item, index, i0) => {
          return {
            a: "596ec987-0-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "20",
              color: activeMenu.value === item.id ? "#4a90e2" : "#666"
            }),
            c: common_vendor.t(item.name),
            d: item.id,
            e: common_vendor.n(activeMenu.value === item.id ? "active" : ""),
            f: common_vendor.o(($event) => switchMenu(item.id), item.id)
          };
        }),
        d: common_vendor.t(activeMenu.value),
        e: common_vendor.t(activeMenu.value === "product" ? "应显示商品管理" : activeMenu.value === "category" ? "应显示分类管理" : activeMenu.value === "home" ? "应显示首页管理" : activeMenu.value === "order" ? "应显示订单管理" : activeMenu.value === "user" ? "应显示用户管理" : "未知"),
        f: activeMenu.value === "product"
      }, activeMenu.value === "product" ? {} : {}, {
        g: activeMenu.value === "category"
      }, activeMenu.value === "category" ? {} : {}, {
        h: activeMenu.value === "home"
      }, activeMenu.value === "home" ? {} : {}, {
        i: activeMenu.value === "order"
      }, activeMenu.value === "order" ? {} : {}, {
        j: activeMenu.value === "user"
      }, activeMenu.value === "user" ? {} : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/index.js.map
