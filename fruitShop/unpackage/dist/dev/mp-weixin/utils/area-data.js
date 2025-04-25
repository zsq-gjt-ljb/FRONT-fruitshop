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
const areaData = formatData();
const getProvinces = () => {
  return Object.keys(areaData).map((name) => ({
    id: areaData[name].id,
    name
  }));
};
const getCities = (province) => {
  if (!province || !province.name)
    return [];
  const provinceName = province.name;
  const provinceData = areaData[provinceName];
  if (!provinceData || !provinceData.cities)
    return [];
  return Object.keys(provinceData.cities).map((name) => ({
    id: provinceData.cities[name].id,
    name
  }));
};
const getDistricts = (province, city) => {
  if (!province || !province.name || !city || !city.name)
    return [];
  const provinceName = province.name;
  const cityName = city.name;
  if (!areaData[provinceName] || !areaData[provinceName].cities[cityName])
    return [];
  return areaData[provinceName].cities[cityName].districts || [];
};
exports.getCities = getCities;
exports.getDistricts = getDistricts;
exports.getProvinces = getProvinces;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/area-data.js.map
