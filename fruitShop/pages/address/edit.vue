<template>
    <view class="address-edit-container">
      <!-- 已保存的地址卡片列表 -->
      <view class="saved-address" v-for="address in addressList" :key="address.id" @tap="selectAddress(address)">
        <view class="address-select">
          <view class="select-circle" :class="{'selected': address.id === selectedAddressId}">
            <uni-icons v-if="address.id === selectedAddressId" type="checkmarkempty" size="14" color="#fff"></uni-icons>
          </view>
        </view>
        <view class="address-info">
          <view class="user-info">
            <text class="name">{{address.consignee}}</text>
            <text class="phone">{{address.phone}}</text>
          </view>
          <view class="address-detail">
            {{address.provinceName}}{{address.cityName}}{{address.districtName}} {{address.detail}}
          </view>
        </view>
        <view class="address-actions">
          <view class="default-tag" v-if="address.isDefault">
            <text class="tag-icon">●</text>
            <text>默认</text>
          </view>
          <view class="action-buttons">
            <text class="edit-btn" @tap.stop="editAddress(address)">编辑</text>
            <text class="delete-btn" @tap.stop="deleteAddress(address.id)">删除</text>
          </view>
        </view>
      </view>
  
      <!-- 添加新地址按钮 -->
      <view class="add-address" @tap="showAddressForm">
        <text>+ 新增收货地址</text>
      </view>
  
      <!-- 地址编辑表单弹窗 -->
      <uni-popup ref="formPopup" type="bottom">
        <view class="form-popup">
          <view class="popup-header">
            <text class="title">{{editingAddress ? '修改地址' : '新增地址'}}</text>
            <text class="close-btn" @tap="closeForm">×</text>
          </view>
          <scroll-view scroll-y class="form-content">
            <view class="form-group">
              <!-- 姓名输入 -->
              <view class="form-item">
                <text class="label">收货人</text>
                <input 
                  type="text"
                  v-model="addressForm.consignee"
                  placeholder="请输入收货人姓名"
                  placeholder-class="placeholder"
                />
              </view>
    
              <!-- 手机号输入 -->
              <view class="form-item">
                <text class="label">手机号码</text>
                <input 
                  type="number"
                  v-model="addressForm.phone"
                  placeholder="请输入手机号码"
                  placeholder-class="placeholder"
                  maxlength="11"
                  @blur="validatePhone"
                />
                <text class="error-tip" v-if="phoneError">{{phoneError}}</text>
              </view>
    
              <!-- 选择地区 -->
              <view class="form-item" @tap="openRegionPicker">
                <text class="label">所在地区</text>
                <view class="region-picker">
                  <text v-if="addressForm.region" class="value">{{ addressForm.region }}</text>
                  <text v-else class="placeholder">请选择省市区</text>
                  <text class="iconfont icon-right"></text>
                </view>
              </view>
    
              <!-- 详细地址 -->
              <view class="form-item">
                <text class="label">详细地址</text>
                <textarea
                  v-model="addressForm.detail"
                  placeholder="请输入详细地址信息，如道路、门牌号、小区、楼栋号、单元等"
                  placeholder-class="placeholder"
                  :auto-height="true"
                />
              </view>
              
              <!-- 设为默认地址 -->
              <view class="form-item default-address">
                <text class="label">设为默认地址</text>
                <switch 
                  :checked="addressForm.isDefault" 
                  @change="(e) => addressForm.isDefault = e.detail.value"
                  color="#3b78db"
                />
              </view>
            </view>
          </scroll-view>
          <!-- 添加保存按钮 -->
          <view class="popup-footer">
            <view class="save-button" @tap="handleSave">
              <text>{{ editingAddress ? '修改' : '保存' }}</text>
            </view>
          </view>
        </view>
      </uni-popup>
  
      <!-- 省市区选择器 -->
      <uni-popup ref="regionPopup" type="bottom">
        <view class="region-popup">
          <view class="popup-header">
            <text class="cancel" @tap="cancelRegion">取消</text>
            <text class="title">选择地区</text>
            <text class="confirm" @tap="confirmRegion">确定</text>
          </view>
          <picker-view
            :indicator-style="indicatorStyle"
            :value="pickerValue"
            @change="handlePickerChange"
            class="picker-view"
          >
            <picker-view-column>
              <view class="picker-item" v-for="(item, index) in provinces" :key="index">
                {{item.name}}
              </view>
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="(item, index) in cities" :key="index">
                {{item.name}}
              </view>
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="(item, index) in districts" :key="index">
                {{item.name}}
              </view>
            </picker-view-column>
          </picker-view>
        </view>
      </uni-popup>
    </view>
  </template>
  
  <script setup>
  import { ref, onMounted, nextTick } from 'vue'
  import request from '@/utils/request'
  import { getProvinces, getCities, getDistricts } from '@/utils/area-data'
  import { regionData } from 'element-china-area-data'
  
  // 当前选中的地址ID
  const selectedAddressId = ref('')
  
  const addressForm = ref({
    consignee: '',
    phone: '',
    region: '',
    detail: '',
    isDefault: false
  })
  
  const regionPopup = ref(null)
  const pickerValue = ref([0, 0, 0])
  const provinces = ref([])
  const cities = ref([])
  const districts = ref([])
  const addressList = ref([])
  const showForm = ref(false)
  const editingAddress = ref(null)
  const formPopup = ref(null)
  const id = ref(null)
  const phoneError = ref('')
  
  // 设置选择器样式
  const indicatorStyle = 'height: 80rpx;'
  
  // 保存打开选择器前的选择值
  let previousPickerValue = []
  
  // 校验手机号
  const validatePhone = () => {
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!addressForm.value.phone) {
      phoneError.value = '请输入手机号码'
      return false
    } else if (!phoneRegex.test(addressForm.value.phone)) {
      phoneError.value = '请输入正确的手机号码'
      return false
    } else {
      phoneError.value = ''
      return true
    }
  }
  
  // 选择微信收货地址
  const chooseWxAddress = () => {
    // 先检查是否授权
    uni.getSetting({
      success: (res) => {
        if (res.authSetting['scope.address']) {
          uni.chooseAddress({
            success: (res) => {
              addressForm.value.name = res.userName
              addressForm.value.phone = res.telNumber
              addressForm.value.region = `${res.provinceName} ${res.cityName} ${res.countyName}`
              addressForm.value.detail = res.detailInfo
            },
            fail: (err) => {
              if (err.errMsg.includes('auth deny')) {
                uni.showModal({
                  title: '权限提示',
                  content: '需要您授权使用收货地址功能',
                  success: (res) => {
                    if (res.confirm) {
                      uni.openSetting()
                    }
                  }
                })
              } else {
                uni.showToast({
                  title: '获取地址失败',
                  icon: 'none'
                })
              }
            }
          })
        } else {
          uni.authorize({
            scope: 'scope.address',
            success: () => {
              // 授权成功再次调用
              chooseWxAddress()
            },
            fail: () => {
              uni.showModal({
                title: '权限提示',
                content: '需要您授权使用收货地址功能',
                success: (res) => {
                  if (res.confirm) {
                    uni.openSetting()
                  }
                }
              })
            }
          })
        }
      }
    })
  }
  
  // 打开地区选择器
  const openRegionPicker = () => {
    // 保存当前选择器值，以便取消时恢复
    previousPickerValue = [...pickerValue.value]
    console.log('打开地区选择器，当前值:', pickerValue.value)
    regionPopup.value.open()
  }
  
  // 取消地区选择
  const cancelRegion = () => {
    // 恢复到打开选择器前的值
    pickerValue.value = previousPickerValue
    console.log('取消地区选择，恢复值:', pickerValue.value)
    regionPopup.value.close()
  }
  
  // 确认地区选择
  const confirmRegion = () => {
    if (pickerValue.value.length !== 3) {
      uni.showToast({
        title: '请选择完整的地区信息',
        icon: 'none'
      })
      return
    }
    
    const province = provinces.value[pickerValue.value[0]]
    const city = cities.value[pickerValue.value[1]]
    const district = districts.value[pickerValue.value[2]]
    
    if (!province || !city || !district) {
      uni.showToast({
        title: '请选择完整的地区信息',
        icon: 'none'
      })
      return
    }
    
    // 更新地址表单的地区信息
    addressForm.value.region = `${province.name}${city.name}${district.name}`
    addressForm.value.provinceCode = province.code
    addressForm.value.provinceName = province.name
    addressForm.value.cityCode = city.code
    addressForm.value.cityName = city.name
    addressForm.value.districtCode = district.code
    addressForm.value.districtName = district.name
    
    console.log('确认选择地区:', addressForm.value.region)
    
    regionPopup.value.close()
  }
  
  // 保存地址
  const handleSave = async () => {
    // 表单验证
    if (!addressForm.value.consignee) {
      uni.showToast({
        title: '请输入收货人姓名',
        icon: 'none'
      })
      return
    }
    
    if (!validatePhone()) {
      return
    }
    
    if (!addressForm.value.region) {
      uni.showToast({
        title: '请选择所在地区',
        icon: 'none'
      })
      return
    }
    
    if (!addressForm.value.detail) {
      uni.showToast({
        title: '请输入详细地址',
        icon: 'none'
      })
      return
    }
    
    uni.showLoading({
      title: '保存中...'
    })
    
    try {
      // 构建请求数据
      const data = {
        consignee: addressForm.value.consignee,
        phone: addressForm.value.phone,
        provinceCode: addressForm.value.provinceCode,
        provinceName: addressForm.value.provinceName,
        cityCode: addressForm.value.cityCode,
        cityName: addressForm.value.cityName,
        districtCode: addressForm.value.districtCode,
        districtName: addressForm.value.districtName,
        detail: addressForm.value.detail,
        isDefault: addressForm.value.isDefault ? 1 : 0
      }
      
      if (editingAddress.value) {
        // 修改地址
        data.id = editingAddress.value.id
        const result = await request({
          url: 'https://bgnc.online/api/addressbook/',
          method: 'PUT',
          data
        })
        
        if (result.code === 200) {
          uni.showToast({
            title: '修改成功',
            icon: 'success'
          })
          formPopup.value.close()
          // 更新地址列表
          getAddressList()
        } else {
          uni.showToast({
            title: result.msg || '修改失败',
            icon: 'none'
          })
        }
      } else {
        // 新增地址
        const result = await request({
          url: 'https://bgnc.online/api/addressbook/',
          method: 'POST',
          data
        })
        
        if (result.code === 200) {
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          })
          formPopup.value.close()
          // 更新地址列表
          getAddressList()
        } else {
          uni.showToast({
            title: result.msg || '添加失败',
            icon: 'none'
          })
        }
      }
    } catch (error) {
      console.error('保存地址失败：', error)
      uni.showToast({
        title: '保存失败，请稍后再试',
        icon: 'none'
      })
    } finally {
      uni.hideLoading()
    }
  }
  
  // 获取地址列表
  const getAddressList = async () => {
    try {
      uni.showLoading({
        title: '加载中...'
      })
      
      const res = await request({
        url: 'https://bgnc.online/api/addressbook/list',
        method: 'GET'
      })
      
      if (res.code === 200) {
        addressList.value = res.data || []
        
        // 如果有默认地址，自动选中
        const defaultAddress = addressList.value.find(item => item.isDefault)
        if (defaultAddress) {
          selectedAddressId.value = defaultAddress.id
          // 将选中的地址ID存储到本地
          uni.setStorageSync('selectedAddressId', defaultAddress.id)
        } else if (addressList.value.length > 0) {
          // 如果没有默认地址，选中第一个
          selectedAddressId.value = addressList.value[0].id
          // 将选中的地址ID存储到本地
          uni.setStorageSync('selectedAddressId', addressList.value[0].id)
        }
      } else {
        uni.showToast({
          title: res.msg || '获取地址列表失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('获取地址列表失败：', error)
      uni.showToast({
        title: '获取地址列表失败',
        icon: 'none'
      })
    } finally {
      uni.hideLoading()
    }
  }
  
  // 选择地址
  const selectAddress = (address) => {
    selectedAddressId.value = address.id
    // 将选中的地址ID存储到本地
    uni.setStorageSync('selectedAddressId', address.id)
    uni.showToast({
      title: '已选择该地址',
      icon: 'success',
      duration: 1500
    })
    
    // 如果是从结算页面跳转来的，选择后返回
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage && prevPage.route.includes('checkout')) {
      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    }
  }
  
  // 删除地址
  const deleteAddress = (id) => {
    uni.showModal({
      title: '提示',
      content: '确定要删除该地址吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            uni.showLoading({
              title: '删除中...'
            })
            
            const result = await request({
              url: `https://bgnc.online/api/addressbook/${id}`,
              method: 'DELETE',
              
            })
            
            if (result.code === 200) {
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
              
              // 如果删除的是当前选中的地址，清空选中状态
              if (selectedAddressId.value === id) {
                selectedAddressId.value = ''
                uni.removeStorageSync('selectedAddressId')
              }
              
              // 更新地址列表
              getAddressList()
            } else {
              uni.showToast({
                title: result.msg || '删除失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('删除地址失败：', error)
            uni.showToast({
              title: '删除失败，请稍后再试',
              icon: 'none'
            })
          } finally {
            uni.hideLoading()
          }
        }
      }
    })
  }
  
  // 编辑地址
  const editAddress = (address) => {
    editingAddress.value = address
    
    // 重置表单
    addressForm.value = {
      consignee: address.consignee,
      phone: address.phone,
      region: `${address.provinceName}${address.cityName}${address.districtName}`,
      detail: address.detail,
      provinceCode: address.provinceCode,
      provinceName: address.provinceName,
      cityCode: address.cityCode,
      cityName: address.cityName,
      districtCode: address.districtCode,
      districtName: address.districtName,
      isDefault: address.isDefault === 1
    }
    
    // 找到省市区对应的索引以设置选择器的初始值
    const findProvinceIndex = provinces.value.findIndex(p => p.code === address.provinceCode)
    if (findProvinceIndex !== -1) {
      // 更新城市列表
      cities.value = getCities(address.provinceCode)
      
      const findCityIndex = cities.value.findIndex(c => c.code === address.cityCode)
      if (findCityIndex !== -1) {
        // 更新区县列表
        districts.value = getDistricts(address.cityCode)
        
        const findDistrictIndex = districts.value.findIndex(d => d.code === address.districtCode)
        
        // 设置选择器的值
        pickerValue.value = [
          findProvinceIndex,
          findCityIndex,
          findDistrictIndex !== -1 ? findDistrictIndex : 0
        ]
        
        previousPickerValue = [...pickerValue.value]
      }
    }
    
    // 打开表单弹窗
    nextTick(() => {
      formPopup.value.open()
    })
  }
  
  // 显示地址表单
  const showAddressForm = () => {
    editingAddress.value = null
    
    // 重置表单
    addressForm.value = {
      consignee: '',
      phone: '',
      region: '',
      detail: '',
      isDefault: false
    }
    
    // 打开表单弹窗
    formPopup.value.open()
  }
  
  // 关闭表单
  const closeForm = () => {
    formPopup.value.close()
  }
  
  // 处理选择器变化
  const handlePickerChange = (e) => {
    const values = e.detail.value
    pickerValue.value = values
    
    // 如果省份发生变化，重新获取城市列表
    if (values[0] !== previousPickerValue[0]) {
      const selectedProvince = provinces.value[values[0]]
      if (selectedProvince) {
        // 直接使用code属性，而不是通过对象传递
        cities.value = getCities(selectedProvince.code)
        // 默认选择第一个城市的区县
        if (cities.value.length > 0) {
          districts.value = getDistricts(cities.value[0].code)
        } else {
          districts.value = []
        }
        pickerValue.value = [values[0], 0, 0]
      }
    }
    
    // 如果城市发生变化，重新获取区县列表
    else if (values[1] !== previousPickerValue[1]) {
      const selectedCity = cities.value[values[1]]
      if (selectedCity) {
        // 直接使用code属性
        districts.value = getDistricts(selectedCity.code)
        pickerValue.value = [values[0], values[1], 0]
      }
    }
    
    // 更新previousPickerValue
    previousPickerValue = [...pickerValue.value]
  }
  
  // 初始化页面数据
  onMounted(() => {
    // 初始化省份数据
    provinces.value = getProvinces()
    console.log('初始化省份数据:', provinces.value)
    
    // 默认选择第一个省份的城市
    if (provinces.value.length > 0) {
      cities.value = getCities(provinces.value[0].code)
      console.log('初始化城市数据:', cities.value)
      
      // 默认选择第一个城市的区县
      if (cities.value.length > 0) {
        districts.value = getDistricts(cities.value[0].code)
        console.log('初始化区县数据:', districts.value)
      }
    }
    
    // 获取已保存的地址列表
    getAddressList()
    
    // 获取本地存储的选中地址ID
    const storedAddressId = uni.getStorageSync('selectedAddressId')
    if (storedAddressId) {
      selectedAddressId.value = storedAddressId
    }
  })
  </script>
  
<style lang="scss">
  .address-edit-container {
    min-height: 100vh;
    background-color: #f8f9fc;
    padding-bottom: 180rpx; // 为底部按钮留出空间
    display: flex;
    flex-direction: column;
    
    .saved-address {
      background: #ffffff;
      margin: 20rpx;
      border-radius: 16rpx;
      padding: 30rpx;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: flex-start;
      position: relative;
      
      .address-select {
        margin-right: 20rpx;
        padding-top: 6rpx;
        
        .select-circle {
          width: 36rpx;
          height: 36rpx;
          border-radius: 50%;
          border: 2rpx solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &.selected {
            background-color: #3b78db;
            border-color: #3b78db;
          }
        }
      }
      
      .address-info {
        flex: 1;
        
        .user-info {
          margin-bottom: 10rpx;
          
          .name {
            font-size: 32rpx;
            font-weight: 500;
            margin-right: 20rpx;
          }
          
          .phone {
            font-size: 28rpx;
            color: #666;
          }
        }
        
        .address-detail {
          font-size: 28rpx;
          color: #333;
          line-height: 1.4;
        }
      }
      
      .address-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-top: 20rpx;
        padding-top: 20rpx;
        border-top: 1px solid #f0f0f0;
        
        .default-tag {
          display: flex;
          align-items: center;
          font-size: 24rpx;
          color: #ff9500;
          
          .tag-icon {
            font-size: 24rpx;
            margin-right: 4rpx;
          }
        }
        
        .action-buttons {
          display: flex;
          align-items: center;
          
          .edit-btn, .delete-btn {
            font-size: 26rpx;
            padding: 6rpx 16rpx;
            border-radius: 30rpx;
            margin-left: 16rpx;
          }
          
          .edit-btn {
            color: #3b78db;
            background-color: rgba(59, 120, 219, 0.1);
          }
          
          .delete-btn {
            color: #ff5a5f;
            background-color: rgba(255, 90, 95, 0.1);
          }
        }
      }
    }
    
    .add-address {
      margin: 40rpx 20rpx;
      height: 88rpx;
      background: #3b78db;
      border-radius: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 30rpx;
      box-shadow: 0 6rpx 16rpx rgba(59, 120, 219, 0.2);
    }
    
    .form-popup {
      background-color: #fff;
      border-radius: 24rpx 24rpx 0 0;
      overflow: hidden;
      padding-bottom: env(safe-area-inset-bottom);
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      
      .popup-header {
        padding: 30rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        border-bottom: 1px solid #f0f0f0;
        
        .title {
          font-size: 32rpx;
          font-weight: 500;
        }
        
        .close-btn {
          position: absolute;
          right: 30rpx;
          top: 30rpx;
          font-size: 40rpx;
          color: #999;
        }
      }
      
      .form-content {
        padding: 30rpx;
        flex: 1;
        overflow-y: auto;
        max-height: 65vh;
        
        .form-group {
          .form-item {
            margin-bottom: 36rpx;
            
            .label {
              display: block;
              font-size: 28rpx;
              color: #333;
              margin-bottom: 16rpx;
              font-weight: 500;
            }
            
            input, textarea, .region-picker {
              width: 100%;
              height: 80rpx;
              background-color: #f8f9fc;
              border-radius: 8rpx;
              padding: 0 20rpx;
              font-size: 28rpx;
              color: #333;
              box-sizing: border-box;
            }
            
            textarea {
              height: auto;
              min-height: 160rpx;
              padding: 20rpx;
              line-height: 1.5;
            }
            
            .region-picker {
              display: flex;
              align-items: center;
              justify-content: space-between;
              position: relative;
              
              .value {
                color: #333;
              }
              
              .placeholder {
                color: #999;
              }
              
              .icon-right {
                font-size: 24rpx;
                color: #999;
              }
            }
            
            .error-tip {
              display: block;
              font-size: 24rpx;
              color: #ff5a5f;
              margin-top: 8rpx;
            }
            
            &.default-address {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
          }
        }
      }
      
      .popup-footer {
        padding: 20rpx 30rpx;
        border-top: 1px solid #f0f0f0;
        
        .save-button {
          height: 88rpx;
          background: #3b78db;
          border-radius: 44rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 30rpx;
          font-weight: 500;
        }
      }
    }
    
    .region-popup {
      background-color: #fff;
      border-radius: 24rpx 24rpx 0 0;
      padding-bottom: env(safe-area-inset-bottom);
      
      .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx;
        border-bottom: 1px solid #f0f0f0;
        
        .title {
          font-size: 32rpx;
          font-weight: 500;
        }
        
        .cancel, .confirm {
          font-size: 28rpx;
          color: #999;
        }
        
        .confirm {
          color: #3b78db;
          font-weight: 500;
        }
      }
      
      .picker-view {
        width: 100%;
        height: 480rpx;
        
        .picker-item {
          line-height: 80rpx;
          font-size: 28rpx;
          text-align: center;
          color: #333;
        }
      }
    }
    
    .placeholder {
      color: #999;
    }
  }
</style>