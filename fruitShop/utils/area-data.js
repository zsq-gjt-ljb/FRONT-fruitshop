import { regionData, codeToText } from 'element-china-area-data'

// 转换数据格式
const formatData = () => {
  const provinces = {}
  
  regionData.forEach(province => {
    const provinceName = province.label
    provinces[provinceName] = {}
    
    province.children.forEach(city => {
      const cityName = city.label
      provinces[provinceName][cityName] = city.children.map(area => area.label)
    })
  })
  
  return provinces
}

export const areaData = formatData()

// 获取所有省份
export const getProvinces = () => {
  return Object.keys(areaData)
}

// 获取某省的所有城市
export const getCities = (province) => {
  return Object.keys(areaData[province] || {})
}

// 获取某市的所有区县
export const getDistricts = (province, city) => {
  return areaData[province]?.[city] || []
}