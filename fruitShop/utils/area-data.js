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

/**
 * 获取所有省份
 * @returns {Array} 省份列表
 */
export const getProvinces = () => {
  return regionData.map(province => ({
    code: province.value,
    name: province.label
  }))
}

/**
 * 根据省份code获取城市列表
 * @param {String} provinceCode 省份code
 * @returns {Array} 城市列表
 */
export const getCities = (provinceCode) => {
  if (!provinceCode) return []
  
  // 通过省份code查找对应省份
  const province = regionData.find(p => p.value === provinceCode)
  if (!province || !province.children) return []
  
  // 返回城市列表
  return province.children.map(city => ({
    code: city.value,
    name: city.label
  }))
}

/**
 * 根据城市code获取区县列表
 * @param {String} cityCode 城市code
 * @returns {Array} 区县列表
 */
export const getDistricts = (cityCode) => {
  if (!cityCode) return []
  
  // 遍历所有省份
  for (const province of regionData) {
    // 在省份的城市中查找
    const city = province.children.find(c => c.value === cityCode)
    
    // 如果找到对应城市
    if (city && city.children) {
      // 返回区县列表
      return city.children.map(district => ({
        code: district.value,
        name: district.label
      }))
    }
  }
  
  return []
}

/**
 * 通过code获取对应的文本名称
 * @param {String} code 区域code
 * @returns {String} 区域名称
 */
export const getNameByCode = (code) => {
  if (!code) return ''
  return codeToText[code]
}

/**
 * 通过完整地址找到对应的code
 * @param {Object} address 包含省市区名称的对象
 * @returns {Object} 包含省市区code的对象
 */
export const getCodesByAddress = (address) => {
  const { provinceName, cityName, districtName } = address
  const result = {
    provinceCode: '',
    cityCode: '',
    districtCode: ''
  }
  
  if (!provinceName) return result
  
  // 查找省份
  const province = regionData.find(p => p.label === provinceName)
  if (!province) return result
  
  result.provinceCode = province.value
  
  if (!cityName) return result
  
  // 查找城市
  const city = province.children.find(c => c.label === cityName)
  if (!city) return result
  
  result.cityCode = city.value
  
  if (!districtName) return result
  
  // 查找区县
  const district = city.children.find(d => d.label === districtName)
  if (!district) return result
  
  result.districtCode = district.value
  
  return result
}