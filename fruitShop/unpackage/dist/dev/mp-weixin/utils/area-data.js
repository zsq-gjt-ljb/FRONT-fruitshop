"use strict";
const common_vendor = require("../common/vendor.js");
const formatData = () => {
  const provinces = {};
  common_vendor.s.forEach((province) => {
    const provinceName = province.label;
    provinces[provinceName] = {};
    province.children.forEach((city) => {
      const cityName = city.label;
      provinces[provinceName][cityName] = city.children.map((area) => area.label);
    });
  });
  return provinces;
};
const areaData = formatData();
const getProvinces = () => {
  return Object.keys(areaData);
};
const getCities = (province) => {
  return Object.keys(areaData[province] || {});
};
const getDistricts = (province, city) => {
  var _a;
  return ((_a = areaData[province]) == null ? void 0 : _a[city]) || [];
};
exports.getCities = getCities;
exports.getDistricts = getDistricts;
exports.getProvinces = getProvinces;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/area-data.js.map
