"use strict";
const common_vendor = require("../../../common/vendor.js");
const utils_request = require("../../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../../node-modules/@dcloudio/uni-ui/lib/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "UserManage",
  setup(__props) {
    const searchKey = common_vendor.ref("");
    const loading = common_vendor.ref(false);
    const vipLevels = ["全部等级", "VIP1", "VIP2", "VIP3", "VIP4", "VIP5"];
    const selectedLevel = common_vendor.ref(0);
    const editingLevel = common_vendor.ref(1);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const totalPages = common_vendor.ref(1);
    const total = common_vendor.ref(0);
    const currentUser = common_vendor.ref(null);
    const userList = common_vendor.ref([]);
    const confirmPopup = common_vendor.ref(null);
    const getUserList = async () => {
      loading.value = true;
      try {
        const res = await utils_request.request({
          url: "https://bgnc.online/api/user/list",
          method: "GET",
          data: {
            pageNum: currentPage.value,
            pageSize: pageSize.value
          }
        });
        if (res.code === 0 || res.code === 200) {
          common_vendor.index.__f__("log", "at pages/admin/components/UserManage.vue:163", "用户列表数据:", res.data);
          userList.value = res.data.rows || [];
          total.value = res.data.total || 0;
          totalPages.value = Math.ceil(total.value / pageSize.value) || 1;
        } else {
          common_vendor.index.showToast({
            title: res.message || "获取用户列表失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/UserManage.vue:174", "获取用户列表失败：", error);
        common_vendor.index.showToast({
          title: "获取用户列表失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const searchUsers = () => {
      currentPage.value = 1;
      getUserList();
    };
    const onLevelChange = (e) => {
      selectedLevel.value = e.detail.value;
      currentPage.value = 1;
      getUserList();
    };
    const handleEditLevelChange = (e, user) => {
      const newLevel = parseInt(e.detail.value) + 1;
      currentUser.value = user;
      editingLevel.value = newLevel;
      confirmPopup.value.open();
    };
    const cancelEdit = () => {
      confirmPopup.value.close();
    };
    const confirmEdit = async () => {
      if (!currentUser.value)
        return;
      try {
        const res = await utils_request.request({
          url: "https://bgnc.online/api/usermember/level",
          method: "PUT",
          data: {
            userId: currentUser.value.id,
            memberLevel: editingLevel.value
          }
        });
        if (res.code === 0 || res.code === 200) {
          common_vendor.index.showToast({
            title: "修改成功",
            icon: "success"
          });
          const index = userList.value.findIndex((u) => u.id === currentUser.value.id);
          if (index !== -1) {
            userList.value[index].memberLevel = editingLevel.value;
          }
          confirmPopup.value.close();
        } else {
          common_vendor.index.showToast({
            title: res.message || "修改失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/components/UserManage.vue:244", "修改用户等级失败：", error);
        common_vendor.index.showToast({
          title: "修改用户等级失败",
          icon: "none"
        });
      }
    };
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        getUserList();
      }
    };
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        getUserList();
      }
    };
    common_vendor.onMounted(() => {
      getUserList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(searchUsers),
        b: searchKey.value,
        c: common_vendor.o(($event) => searchKey.value = $event.detail.value),
        d: common_vendor.t(vipLevels[selectedLevel.value]),
        e: vipLevels,
        f: selectedLevel.value,
        g: common_vendor.o(onLevelChange),
        h: loading.value
      }, loading.value ? {
        i: common_vendor.p({
          type: "spinner-cycle",
          size: "30",
          color: "#4a90e2"
        })
      } : userList.value.length === 0 ? {} : {}, {
        j: userList.value.length === 0,
        k: common_vendor.f(userList.value, (user, k0, i0) => {
          return {
            a: user.userAvatar || "/static/images/default-avatar.png",
            b: common_vendor.t(user.userName || "未设置昵称"),
            c: common_vendor.t(user.phone || "未绑定手机"),
            d: common_vendor.t(user.memberLevel || 1),
            e: common_vendor.t(user.userSex === "1" ? "男" : user.userSex === "2" ? "女" : "未知"),
            f: common_vendor.t(user.loginDate || "未登录"),
            g: (user.memberLevel || 1) - 1,
            h: common_vendor.o((e) => handleEditLevelChange(e, user), user.id),
            i: user.id
          };
        }),
        l: vipLevels.slice(1),
        m: currentPage.value === 1 ? 1 : "",
        n: common_vendor.o(prevPage),
        o: common_vendor.t(currentPage.value),
        p: common_vendor.t(totalPages.value),
        q: currentPage.value === totalPages.value || totalPages.value === 0 ? 1 : "",
        r: common_vendor.o(nextPage),
        s: common_vendor.t(editingLevel.value),
        t: common_vendor.o(cancelEdit),
        v: common_vendor.o(confirmEdit),
        w: common_vendor.sr(confirmPopup, "0c80738b-1", {
          "k": "confirmPopup"
        }),
        x: common_vendor.p({
          type: "dialog"
        })
      });
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/admin/components/UserManage.js.map
