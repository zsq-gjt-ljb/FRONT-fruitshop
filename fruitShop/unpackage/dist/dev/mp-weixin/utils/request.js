"use strict";
const common_vendor = require("../common/vendor.js");
const request = async (options = {}) => {
  var _a;
  try {
    common_vendor.index.__f__("log", "at utils/request.js:5", "发送请求到:", options.url);
    if (options.data)
      common_vendor.index.__f__("log", "at utils/request.js:6", "请求数据:", options.data);
    const token = common_vendor.index.getStorageSync("token");
    const header = {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
      "X-Brand": "NanChaBeiGuo"
      // 改为英文或拼音
    };
    const response = await common_vendor.index.request({
      url: options.url,
      method: options.method || "GET",
      data: options.data || {},
      header: { ...header, ...options.header }
    });
    if ((_a = response.data) == null ? void 0 : _a.data) {
      response.data.data = convertIdsToString(response.data.data);
    }
    if (response.statusCode === 200) {
      return response.data;
    } else if (response.statusCode === 401) {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
      throw new Error("未授权，请重新登录");
    } else {
      common_vendor.index.showToast({
        title: response.data.message || "请求失败",
        icon: "none"
      });
      throw new Error(response.data.message || "请求失败");
    }
  } catch (error) {
    common_vendor.index.showToast({
      title: "网络错误",
      icon: "none"
    });
    throw error;
  }
};
const convertIdsToString = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => convertIdsToString(item));
  } else if (data && typeof data === "object") {
    return Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = key.toLowerCase().endsWith("id") && typeof value === "number" ? value.toString() : convertIdsToString(value);
      return acc;
    }, {});
  }
  return data;
};
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
