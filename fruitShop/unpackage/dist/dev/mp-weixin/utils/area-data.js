"use strict";
const common_vendor = require("../common/vendor.js");
const formatData = () => {
  const provinces = {};
  common_vendor.s.forEach((province) => {
    const provinceName = province.label;
    provinces[provinceName] = {
      id: province.value,
      cities: {}
    };
    province.children.forEach((city) => {
      const cityName = city.label;
      provinces[provinceName].cities[cityName] = {
        id: city.value,
        districts: city.children.map((area) => ({
          id: area.value,
          name: area.label
        }))
      };
    });
  });
  return provinces;
};
formatData();
const getProvinces = () => {
  return common_vendor.s.map((province) => ({
    code: province.value,
    name: province.label
  }));
};
const getCities = (provinceCode) => {
  if (!provinceCode)
    return [];
  const province = common_vendor.s.find((p) => p.value === provinceCode);
  if (!province || !province.children)
    return [];
  return province.children.map((city) => ({
    code: city.value,
    name: city.label
  }));
};
const getDistricts = (cityCode) => {
  if (!cityCode)
    return [];
  for (const province of common_vendor.s) {
    const city = province.children.find((c) => c.value === cityCode);
    if (city && city.children) {
      return city.children.map((district) => ({
        code: district.value,
        name: district.label
      }));
    }
  }
  return [];
};
exports.getCities = getCities;
exports.getDistricts = getDistricts;
exports.getProvinces = getProvinces;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/area-data.js.map
