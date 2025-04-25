import { regionData, codeToText } from 'element-china-area-data'

// 转换数据格式
const formatData = () => {
  const provinces = {}
  
  regionData.forEach(province => {
    const provinceName = province.label
    provinces[provinceName] = {
      id: province.value,
      cities: {}
    }
    
    province.children.forEach(city => {
      const cityName = city.label
      provinces[provinceName].cities[cityName] = {
        id: city.value,
        districts: city.children.map(area => ({
          id: area.value,
          name: area.label
        }))
      }
    })
  })
  
  return provinces
}

export const areaData = formatData()

// 获取所有省份
export const getProvinces = () => {
  return Object.keys(areaData).map(name => ({
    id: areaData[name].id,
    name: name
  }))
}

// 获取某省的所有城市
export const getCities = (province) => {
  if (!province || !province.name) return []
  
  const provinceName = province.name
  const provinceData = areaData[provinceName]
  
  if (!provinceData || !provinceData.cities) return []
  
  return Object.keys(provinceData.cities).map(name => ({
    id: provinceData.cities[name].id,
    name: name
  }))
}

// 获取某市的所有区县
export const getDistricts = (province, city) => {
  if (!province || !province.name || !city || !city.name) return []
  
  const provinceName = province.name
  const cityName = city.name
  
  if (!areaData[provinceName] || !areaData[provinceName].cities[cityName]) return []
  
  return areaData[provinceName].cities[cityName].districts || []
}