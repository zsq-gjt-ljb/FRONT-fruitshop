<template>
    <view class="address-edit-container">
      <!-- 已保存的地址卡片列表 -->
      <view class="saved-address" v-for="address in addressList" :key="address.id" @tap="editAddress(address)">
        <view class="address-select" @tap.stop="selectAddress(address)">
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
            <text>默认地址</text>
          </view>
          <text class="delete-btn" @tap.stop="deleteAddress(address.id)">删除</text>
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
                />
              </view>
    
              <!-- 选择地区 -->
              <view class="form-item" @tap="showRegionPicker">
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
            <text class="cancel" @tap="closeRegionPicker">取消</text>
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
                {{item}}
              </view>
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="(item, index) in cities" :key="index">
                {{item}}
              </view>
            </picker-view-column>
            <picker-view-column>
              <view class="picker-item" v-for="(item, index) in districts" :key="index">
                {{item}}
              </view>
            </picker-view-column>
          </picker-view>
        </view>
      </uni-popup>
    </view>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
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
  
  // 显示地区选择器
  const showRegionPicker = () => {
    regionPopup.value.open()
  }
  
  // 关闭地区选择器
  const closeRegionPicker = () => {
    regionPopup.value.close()
  }
  
  // 确认地区选择
  const confirmRegion = () => {
    const province = provinces.value[pickerValue.value[0]]
    const city = cities.value[pickerValue.value[1]]
    const district = districts.value[pickerValue[2]]
    addressForm.value.region = getFullRegion(province, city, district)
    closeRegionPicker()
  }
  
  // 处理选择器变化
  const handlePickerChange = (e) => {
    const values = e.detail.value
    pickerValue.value = values
    // 更新城市和区县数据
    updateCities(values[0])
    updateDistricts(values[0], values[1])
  }
  
  // 更新城市数据
  const updateCities = (provinceIndex) => {
    const province = provinces.value[provinceIndex]
    cities.value = getCities(province)
    districts.value = getDistricts(province, cities.value[0])
  }
  
  // 更新区县数据
  const updateDistricts = (provinceIndex, cityIndex) => {
    const province = provinces.value[provinceIndex]
    const city = cities.value[cityIndex]
    districts.value = getDistricts(province, city)
  }
  
  // 获取地址列表
  const getAddressList = async () => {
    try {
      const res = await request({
        url: 'http://82.156.12.240:8080/api/addressbook/list',
        method: 'GET'
      })
      
      console.log('原始响应数据:', res.data)
      
      if (res.code === 200 && res.data) {
        // 将ID转换为字符串
        addressList.value = res.data.map(item => ({
          ...item,
          id: item.id.toString() // 将数字ID转换为字符串
        }))
        console.log('处理后的地址列表:', addressList.value)
      }
    } catch (error) {
      console.error('获取地址列表失败:', error)
      uni.showToast({
        title: '获取地址失败',
        icon: 'none'
      })
    }
  }
  
  // 显示地址表单
  const showAddressForm = () => {
    editingAddress.value = null
    addressForm.value = {
      consignee: '',
      phone: '',
      region: '',
      detail: ''
    }
    formPopup.value.open()
  }
  
  // 编辑地址
  const editAddress = (address) => {
    console.log('编辑的地址信息:', address)
    editingAddress.value = address
    addressForm.value = {
      consignee: address.consignee,
      phone: address.phone,
      region: `${address.provinceName} ${address.cityName} ${address.districtName}`,
      detail: address.detail,
      id: address.id.toString() // 确保ID是字符串
    }
    console.log('编辑表单数据:', addressForm.value)
    formPopup.value.open()
  }
  
  // 删除地址
  const deleteAddress = async (id) => {
    console.log('要删除的地址ID:', id)
    try {
      // 显示确认弹窗
      uni.showModal({
        title: '提示',
        content: '确定要删除这个地址吗？',
        success: async (res) => {
          if (res.confirm) {
            const res = await request({
              url: `http://82.156.12.240:8080/api/addressbook/${id.toString()}`, // 确保传递字符串ID
              method: 'DELETE'
            })
            
            console.log('删除响应:', res)
            
            if (res.code === 200) {
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
              // 重新获取地址列表
              getAddressList()
            } else {
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    } catch (error) {
      console.error('删除地址失败:', error)
      uni.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  }
  
  // 表单验证
  const validateForm = () => {
    console.log('验证表单:', addressForm.value)
    
    if (!addressForm.value.consignee) {
      uni.showToast({
        title: '请输入收货人姓名',
        icon: 'none'
      })
      return false
    }
    
    if (!addressForm.value.phone) {
      uni.showToast({
        title: '请输入手机号码',
        icon: 'none'
      })
      return false
    }
    
    if (!/^1\d{10}$/.test(addressForm.value.phone)) {
      uni.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      })
      return false
    }
    
    if (!addressForm.value.region) {
      uni.showToast({
        title: '请选择所在地区',
        icon: 'none'
      })
      return false
    }
    
    if (!addressForm.value.detail) {
      uni.showToast({
        title: '请输入详细地址',
        icon: 'none'
      })
      return false
    }
    
    return true
  }
  
  // 保存地址
  const handleSave = async () => {
    console.log('保存按钮被点击')
    
    try {
      const addressData = {
        consignee: addressForm.value.consignee,
        phone: addressForm.value.phone,
        provinceName: provinces.value[pickerValue.value[0]],
        cityName: cities.value[pickerValue.value[1]],
        districtName: districts.value[pickerValue.value[2]],
        detail: addressForm.value.detail,
        sex:'男',
        id: editingAddress.value?.id?.toString() // 确保ID是字符串
      }
      
      console.log('发送的请求数据:', addressData)
      
      const res = await request({
        url: 'http://82.156.12.240:8080/api/addressbook/',
        method: editingAddress.value ? 'PUT' : 'POST',  // 修改使用PUT，新增使用POST
        data: addressData
      })
      
      if (res.code === 200) {
        uni.showToast({
          title: editingAddress.value ? '修改成功' : '保存成功',
          icon: 'success'
        })
        
        // 关闭表单
        formPopup.value.close()
        // 重新获取地址列表
        getAddressList()
      } else {
        uni.showToast({
          title: editingAddress.value ? '修改失败' : '保存失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('保存地址失败:', error)
      uni.showToast({
        title: editingAddress.value ? '修改失败' : '保存失败',
        icon: 'none'
      })
    }
  }
  
  // 获取完整地区编码
  const getFullRegion = (province, city, district) => {
    return `${province} ${city} ${district}`
  }
  
  // 关闭表单
  const closeForm = () => {
    formPopup.value.close()
  }
  
  // 选择地址
  const selectAddress = (address) => {
    selectedAddressId.value = address.id
    // 将选中的地址保存到本地存储
    uni.setStorageSync('selectedAddressId', address.id.toString())
    uni.showToast({
      title: '已选择该地址',
      icon: 'success',
      duration: 1500
    })
    
    // 选择后返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
  
  // 初始化数据
  onMounted(() => {
    // 初始化省份数据
    provinces.value = getProvinces()
    console.log('省份数据:', provinces.value)
    
    // 初始化城市数据
    cities.value = getCities(provinces.value[0])
    console.log('城市数据:', cities.value)
    
    // 初始化区县数据
    districts.value = getDistricts(provinces.value[0], cities.value[0])
    console.log('区县数据:', districts.value)
    
    // 获取已保存的选中地址ID
    const savedAddressId = uni.getStorageSync('selectedAddressId')
    if (savedAddressId) {
      selectedAddressId.value = savedAddressId
    }
    
    // 获取已保存的地址
    getAddressList()
  })
  </script>
  
<style lang="scss">
  .address-edit-container {
    min-height: 100vh;
    background-color: #f8f9fc;
    padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
    
    .saved-address {
      margin: 24rpx;
      background: #ffffff;
      border-radius: 24rpx;
      padding: 32rpx;
      display: flex;
      
      .address-select {
        margin-right: 20rpx;
        display: flex;
        align-items: flex-start;
        padding-top: 8rpx;
        
        .select-circle {
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
          border: 2rpx solid #d1d1d6;
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
        margin-bottom: 20rpx;
        
        .user-info {
          margin-bottom: 16rpx;
          
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
        padding-top: 20rpx;
        border-top: 1rpx solid #f5f5f5;
        
        .default-tag {
          display: flex;
          align-items: center;
          color: #ff9500;
          font-size: 28rpx;
          
          .tag-icon {
            margin-right: 8rpx;
          }
        }
        
        .delete-btn {
          color: #ff4d4f;
          font-size: 28rpx;
        }
      }
    }
    
    .add-address {
      margin: 24rpx;
      height: 88rpx;
      background: #ff9500;
      border-radius: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 32rpx;
      
      &:active {
        opacity: 0.9;
      }
    }
    
    .form-popup {
      background: #ffffff;
      border-radius: 24rpx 24rpx 0 0;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      
      .popup-header {
        padding: 24rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        border-bottom: 1rpx solid #f5f5f5;
        
        .title {
          font-size: 32rpx;
          font-weight: 500;
          color: #333;
        }
        
        .close-btn {
          position: absolute;
          right: 24rpx;
          font-size: 40rpx;
          color: #999;
          line-height: 1;
        }
      }
      
      .form-content {
        flex: 1;
        max-height: calc(80vh - 180rpx);
      }
      
      .form-group {
        padding: 0 32rpx;
        
        .form-item {
          padding: 32rpx 0;
          border-bottom: 2rpx solid #f5f5f5;
          
          &:last-child {
            border-bottom: none;
          }
          
          .label {
            font-size: 28rpx;
            color: #333333;
            margin-bottom: 16rpx;
            display: block;
          }
          
          input {
            font-size: 28rpx;
            color: #333333;
          }
          
          textarea {
            width: 100%;
            font-size: 28rpx;
            color: #333333;
            line-height: 1.5;
          }
          
          .region-picker {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .value {
              flex: 1;
              font-size: 28rpx;
              color: #333333;
            }
            
            .icon-right {
              color: #999999;
              font-size: 24rpx;
            }
          }
        }
      }
      
      .popup-footer {
        padding: 24rpx;
        border-top: 1rpx solid #f5f5f5;
        
        .save-button {
          height: 88rpx;
          background: #ff9500;
          border-radius: 44rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          
          text {
            color: #ffffff;
            font-size: 32rpx;
            font-weight: 500;
          }
          
          &:active {
            opacity: 0.9;
          }
        }
      }
    }
    
    .placeholder {
      color: #999999;
    }
    
    .region-popup {
      background: #ffffff;
      border-radius: 24rpx 24rpx 0 0;
      
      .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24rpx 32rpx;
        border-bottom: 2rpx solid #f5f5f5;
        
        .cancel {
          color: #999999;
          font-size: 28rpx;
        }
        
        .title {
          font-size: 32rpx;
          font-weight: 500;
          color: #333333;
        }
        
        .confirm {
          color: #4a90e2;
          font-size: 28rpx;
        }
      }
      
      .picker-view {
        width: 100%;
        height: 480rpx;
        
        .picker-item {
          line-height: 80rpx;
          text-align: center;
          font-size: 28rpx;
          color: #333333;
        }
      }
    }
  }
</style>