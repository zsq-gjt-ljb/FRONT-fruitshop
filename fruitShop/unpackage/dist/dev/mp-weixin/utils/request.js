"use strict";
const common_vendor = require("../common/vendor.js");
const request = async (options = {}) => {
  var _a;
  try {
    common_vendor.index.__f__("log", "at utils/request.js:5", "发送请求到:", options.url);
    if (options.data)
      common_vendor.index.__f__("log", "at utils/request.js:6", "请求数据:", options.data);
    const token = common_vendor.index.getStorageSync("token");
    const isGuestMode = common_vendor.index.getStorageSync("isGuestMode");
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
      const requiresAuth = checkIfRequiresAuth(options.url);
      if (isGuestMode && requiresAuth) {
        const currentPage = getCurrentPageUrl();
        common_vendor.index.navigateTo({
          url: "/pages/login/login?redirect=" + encodeURIComponent(currentPage)
        });
        throw new Error("游客模式无法访问，请登录");
      } else {
        common_vendor.index.navigateTo({
          url: "/pages/login/login"
        });
        throw new Error("未授权，请重新登录");
      }
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
const getCurrentPageUrl = () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const url = `/${currentPage.route}`;
  const query = currentPage.options;
  if (Object.keys(query).length > 0) {
    const queryStr = Object.keys(query).map((key) => `${key}=${query[key]}`).join("&");
    return `${url}?${queryStr}`;
  }
  return url;
};
const checkIfRequiresAuth = (url) => {
  const requiresAuthPaths = [
    "/api/user/profile",
    "/api/addressbook",
    "/api/order",
    "/api/user",
    "/api/cart"
  ];
  return requiresAuthPaths.some((path) => url.includes(path));
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
