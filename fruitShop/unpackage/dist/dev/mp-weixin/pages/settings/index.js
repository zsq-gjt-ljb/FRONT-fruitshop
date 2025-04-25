"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_popup_dialog2 + _easycom_uni_popup2)();
}
const _easycom_uni_popup_dialog = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_popup_dialog + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const userInfo = common_vendor.ref({
      userAvatar: "",
      userName: "",
      phone: "",
      userSex: 0,
      // 0: 未知, 1: 男, 2: 女
      userBirthday: "",
      userRole: "",
      memberLevel: 0
    });
    const genderText = common_vendor.computed(() => {
      const genderMap = {
        0: "未知",
        1: "男",
        2: "女"
      };
      return genderMap[userInfo.value.userSex] || "未知";
    });
    const nameDialog = common_vendor.ref(null);
    const phoneDialog = common_vendor.ref(null);
    const datePopup = common_vendor.ref(null);
    const years = common_vendor.ref([]);
    const months = common_vendor.ref([]);
    const days = common_vendor.ref([]);
    const datePickerValue = common_vendor.ref([0, 0, 0]);
    const selectedDate = common_vendor.ref("");
    const initDatePicker = () => {
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      years.value = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => i + 1980);
      months.value = Array.from({ length: 12 }, (_, i) => i + 1);
      updateDays(1980, 1);
      if (userInfo.value.userBirthday) {
        const [year, month, day] = userInfo.value.userBirthday.split("-").map((num) => parseInt(num));
        const yearIndex = years.value.findIndex((y) => y === year);
        const monthIndex = months.value.findIndex((m) => m === month);
        const dayIndex = days.value.findIndex((d) => d === day);
        if (yearIndex >= 0 && monthIndex >= 0 && dayIndex >= 0) {
          datePickerValue.value = [yearIndex, monthIndex, dayIndex];
          updateDays(year, month);
        }
      }
    };
    const updateDays = (year, month) => {
      const daysInMonth = new Date(year, month, 0).getDate();
      days.value = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };
    const onDatePickerChange = (e) => {
      const values = e.detail.value;
      datePickerValue.value = values;
      const year = years.value[values[0]];
      const month = months.value[values[1]];
      updateDays(year, month);
      const day = days.value[values[2]] || 1;
      selectedDate.value = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    };
    const getUserInfo = async () => {
      try {
        const res = await utils_request.request({
          url: "https://bgnc.online/api/user/profile",
          method: "GET"
        });
        if (res.code === 200) {
          common_vendor.index.__f__("log", "at pages/settings/index.vue:220", "res.data是", res);
          userInfo.value = res.data;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/settings/index.vue:224", "获取用户信息失败：", error);
      }
    };
    const changeAvatar = () => {
      common_vendor.index.chooseImage({
        count: 1,
        // 只选一张图片
        sizeType: ["compressed"],
        // 压缩图片
        sourceType: ["album", "camera"],
        // 可以从相册或相机选择
        success: async (res) => {
          try {
            const tempFilePath = res.tempFilePaths[0];
            common_vendor.index.showLoading({
              title: "上传中...",
              mask: true
            });
            const uploadTask = () => {
              return new Promise((resolve, reject) => {
                common_vendor.index.uploadFile({
                  url: "https://bgnc.online/api/file/upload",
                  filePath: tempFilePath,
                  name: "file",
                  header: {
                    "Authorization": `Bearer ${common_vendor.index.getStorageSync("token")}`
                  },
                  success: (uploadRes) => {
                    common_vendor.index.__f__("log", "at pages/settings/index.vue:256", "上传成功, 原始响应:", uploadRes);
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
                    common_vendor.index.__f__("error", "at pages/settings/index.vue:273", "上传失败:", err);
                    reject(new Error("网络错误"));
                  }
                });
              });
            };
            const imageUrl = await uploadTask();
            common_vendor.index.__f__("log", "at pages/settings/index.vue:282", "头像上传成功, URL:", imageUrl);
            const updateRes = await utils_request.request({
              url: "https://bgnc.online/api/user/profile",
              method: "PUT",
              data: {
                userAvatar: imageUrl
              }
            });
            if (updateRes.code === 200) {
              userInfo.value.userAvatar = imageUrl;
              common_vendor.index.setStorageSync("userAvatar", imageUrl);
              common_vendor.index.showToast({
                title: "头像更新成功",
                icon: "success"
              });
            } else {
              throw new Error(updateRes.msg || "头像更新失败");
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/settings/index.vue:308", "头像更新错误:", error);
            common_vendor.index.showToast({
              title: error.message || "头像更新失败",
              icon: "none"
            });
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
    };
    const showNameDialog = () => {
      nameDialog.value.open();
    };
    const updateName = async (value) => {
      try {
        const res = await utils_request.request({
          url: "https://bgnc.online/api/user/profile",
          method: "PUT",
          data: {
            userName: value
          }
        });
        if (res.code === 200) {
          userInfo.value.userName = value;
          common_vendor.index.showToast({
            title: "姓名修改成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: res.msg || "姓名修改失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/settings/index.vue:349", "更新姓名错误:", error);
        common_vendor.index.showToast({
          title: "姓名修改失败",
          icon: "error"
        });
      }
    };
    const showGenderPicker = () => {
      common_vendor.index.showActionSheet({
        itemList: ["男", "女"],
        success: async (res) => {
          const gender = res.tapIndex + 1;
          try {
            const updateRes = await utils_request.request({
              url: "https://bgnc.online/api/user/profile",
              method: "PUT",
              data: {
                userSex: gender
              }
            });
            if (updateRes.code === 200) {
              userInfo.value.userSex = gender;
              common_vendor.index.showToast({
                title: "性别修改成功",
                icon: "success"
              });
            }
          } catch (error) {
            common_vendor.index.showToast({
              title: "性别修改失败",
              icon: "error"
            });
          }
        }
      });
    };
    const showPhoneDialog = () => {
      phoneDialog.value.open();
    };
    const updatePhone = async (value) => {
      if (!/^1[3-9]\d{9}$/.test(value)) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号",
          icon: "none"
        });
        return;
      }
      try {
        const res = await utils_request.request({
          url: "https://bgnc.online/api/user/profile",
          method: "PUT",
          data: {
            phone: value
          }
        });
        if (res.code === 200) {
          userInfo.value.phone = value;
          common_vendor.index.showToast({
            title: "手机号修改成功",
            icon: "success"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "手机号修改失败",
          icon: "error"
        });
      }
    };
    const showDatePicker = () => {
      initDatePicker();
      datePopup.value.open();
    };
    const closeDatePicker = () => {
      datePopup.value.close();
    };
    const confirmDatePicker = async () => {
      try {
        const updateRes = await utils_request.request({
          url: "https://bgnc.online/api/user/profile",
          method: "PUT",
          data: {
            userBirthday: selectedDate.value
          }
        });
        if (updateRes.code === 200) {
          userInfo.value.userBirthday = selectedDate.value;
          common_vendor.index.showToast({
            title: "生日修改成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: updateRes.msg || "生日修改失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/settings/index.vue:466", "更新生日出错:", error);
        common_vendor.index.showToast({
          title: "生日修改失败",
          icon: "error"
        });
      } finally {
        datePopup.value.close();
      }
    };
    const handleLogout = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确认退出登录？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.clearStorageSync();
            common_vendor.index.reLaunch({
              url: "/pages/login/login"
            });
          }
        }
      });
    };
    const navigateToAddressList = () => {
      common_vendor.index.navigateTo({
        url: "/pages/address/list"
      });
    };
    common_vendor.onMounted(() => {
      getUserInfo();
    });
    return (_ctx, _cache) => {
      return {
        a: userInfo.value.userAvatar || "/static/images/default-avatar.png",
        b: common_vendor.o(changeAvatar),
        c: common_vendor.t(userInfo.value.userName || "未设置"),
        d: common_vendor.o(showNameDialog),
        e: common_vendor.t(userInfo.value.phone || "未绑定"),
        f: common_vendor.o(showPhoneDialog),
        g: common_vendor.t(genderText.value),
        h: common_vendor.o(showGenderPicker),
        i: common_vendor.t(userInfo.value.userBirthday || "未设置"),
        j: common_vendor.o(showDatePicker),
        k: common_vendor.o(navigateToAddressList),
        l: common_vendor.o(handleLogout),
        m: common_vendor.o(updateName),
        n: common_vendor.p({
          mode: "input",
          title: "修改姓名",
          placeholder: "请输入姓名",
          value: userInfo.value.userName
        }),
        o: common_vendor.sr(nameDialog, "6a74f481-0", {
          "k": "nameDialog"
        }),
        p: common_vendor.p({
          type: "dialog"
        }),
        q: common_vendor.o(updatePhone),
        r: common_vendor.p({
          mode: "input",
          title: "修改手机号",
          placeholder: "请输入手机号",
          value: userInfo.value.phone
        }),
        s: common_vendor.sr(phoneDialog, "6a74f481-2", {
          "k": "phoneDialog"
        }),
        t: common_vendor.p({
          type: "dialog"
        }),
        v: common_vendor.o(closeDatePicker),
        w: common_vendor.o(confirmDatePicker),
        x: common_vendor.f(years.value, (year, index, i0) => {
          return {
            a: common_vendor.t(year),
            b: index
          };
        }),
        y: common_vendor.f(months.value, (month, index, i0) => {
          return {
            a: common_vendor.t(month),
            b: index
          };
        }),
        z: common_vendor.f(days.value, (day, index, i0) => {
          return {
            a: common_vendor.t(day),
            b: index
          };
        }),
        A: datePickerValue.value,
        B: common_vendor.o(onDatePickerChange),
        C: common_vendor.sr(datePopup, "6a74f481-4", {
          "k": "datePopup"
        }),
        D: common_vendor.p({
          type: "bottom"
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/index.js.map
