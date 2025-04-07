<template>
  <view class="settings-container">
    <!-- 列表项组件 -->
    <view class="settings-list">
      <!-- 头像设置 -->
      <view class="settings-item" @tap="changeAvatar">
        <view class="item-left">
          <text class="label">头像</text>
        </view>
        <view class="item-right">
          <image class="avatar" :src="userInfo.userAvatar || '/static/images/default-avatar.png'" mode="aspectFill"/>
          <text class="iconfont icon-right"></text>
        </view>
      </view>

      <!-- 姓名设置 -->
      <view class="settings-item" @tap="showNameDialog">
        <view class="item-left">
          <text class="label">姓名</text>
        </view>
        <view class="item-right">
          <text class="value">{{ userInfo.userName || '未设置' }}</text>
          <text class="iconfont icon-right"></text>
        </view>
      </view>

      <!-- 手机号设置 -->
      <view class="settings-item" @tap="showPhoneDialog">
        <view class="item-left">
          <text class="label">手机号</text>
        </view>
        <view class="item-right">
          <text class="value">{{ userInfo.phone || '未绑定' }}</text>
          <text class="iconfont icon-right"></text>
        </view>
      </view>

      <!-- 性别设置 -->
      <view class="settings-item" @tap="showGenderPicker">
        <view class="item-left">
          <text class="label">性别</text>
        </view>
        <view class="item-right">
          <text class="value">{{ genderText }}</text>
          <text class="iconfont icon-right"></text>
        </view>
      </view>

      <!-- 生日设置 -->
      <view class="settings-item" @tap="showDatePicker">
        <view class="item-left">
          <text class="label">生日</text>
        </view>
        <view class="item-right">
          <text class="value">{{ userInfo.userBirthday || '未设置' }}</text>
          <text class="iconfont icon-right"></text>
        </view>
      </view>

      <!-- 收货地址 -->
      <view class="settings-item" @tap="navigateToAddressList">
        <view class="item-left">
          <text class="label">收货地址</text>
        </view>
        <view class="item-right">
          <text class="value">管理我的收货地址</text>
          <text class="iconfont icon-right"></text>
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-button" @tap="handleLogout">
      <text>退出登录</text>
    </view>

    <!-- 姓名修改弹窗 -->
    <uni-popup ref="nameDialog" type="dialog">
      <uni-popup-dialog
        mode="input"
        title="修改姓名"
        placeholder="请输入姓名"
        :value="userInfo.userName"
        @confirm="updateName"
      />
    </uni-popup>

    <!-- 手机号修改弹窗 -->
    <uni-popup ref="phoneDialog" type="dialog">
      <uni-popup-dialog
        mode="input"
        title="修改手机号"
        placeholder="请输入手机号"
        :value="userInfo.phone"
        @confirm="updatePhone"
      />
    </uni-popup>

    <!-- 添加日期选择器组件 -->
    <uni-popup ref="datePopup" type="bottom">
      <view class="date-picker-container">
        <view class="date-picker-header">
          <text @tap="closeDatePicker">取消</text>
          <text>选择生日</text>
          <text @tap="confirmDatePicker">确定</text>
        </view>
        <picker-view
          class="date-picker-view"
          :indicator-style="'height: 50px;'"
          :value="datePickerValue"
          @change="onDatePickerChange"
        >
          <picker-view-column>
            <view class="picker-item" v-for="(year, index) in years" :key="index">{{year}}年</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(month, index) in months" :key="index">{{month}}月</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(day, index) in days" :key="index">{{day}}日</view>
          </picker-view-column>
        </picker-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '@/utils/request'

const userInfo = ref({
  userAvatar: '',
  userName: '',
  phone: '',
  userSex: 0, // 0: 未知, 1: 男, 2: 女
  userBirthday: '',
  userRole: '',
  memberLevel: 0
})

// 性别显示文本
const genderText = computed(() => {
  const genderMap = {
    0: '未知',
    1: '男',
    2: '女'
  }
  return genderMap[userInfo.value.userSex] || '未知'
})

// 弹窗引用
const nameDialog = ref(null)
const phoneDialog = ref(null)
const datePopup = ref(null)

// 日期选择器数据
const years = ref([])
const months = ref([])
const days = ref([])
const datePickerValue = ref([0, 0, 0])
const selectedDate = ref('')

// 初始化日期选择器数据
const initDatePicker = () => {
  // 生成年份数据（1950-当前年份）
  const currentYear = new Date().getFullYear()
  years.value = Array.from({length: currentYear - 1980 + 1}, (_, i) => i + 1980)
  
  // 生成月份数据
  months.value = Array.from({length: 12}, (_, i) => i + 1)
  
  // 生成天数数据
  updateDays(1980, 1)
  
  // 如果用户已有生日，预设选择器
  if (userInfo.value.userBirthday) {
    const [year, month, day] = userInfo.value.userBirthday.split('-').map(num => parseInt(num))
    const yearIndex = years.value.findIndex(y => y === year)
    const monthIndex = months.value.findIndex(m => m === month)
    const dayIndex = days.value.findIndex(d => d === day)
    
    if (yearIndex >= 0 && monthIndex >= 0 && dayIndex >= 0) {
      datePickerValue.value = [yearIndex, monthIndex, dayIndex]
      updateDays(year, month)
    }
  }
}

// 更新天数（根据年月计算天数）
const updateDays = (year, month) => {
  const daysInMonth = new Date(year, month, 0).getDate()
  days.value = Array.from({length: daysInMonth}, (_, i) => i + 1)
}

// 日期选择器变化事件
const onDatePickerChange = (e) => {
  const values = e.detail.value
  datePickerValue.value = values
  
  const year = years.value[values[0]]
  const month = months.value[values[1]]
  
  // 更新天数
  updateDays(year, month)
  
  // 组合日期字符串
  const day = days.value[values[2]] || 1
  selectedDate.value = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await request({
      url: 'http://82.156.12.240:8080/api/user/profile',
      method: 'GET'
    })
    if (res.code === 200) { 
      console.log('res.data是', res)
     userInfo.value = res.data
    }
  } catch (error) {
    console.error('获取用户信息失败：', error)
  }
}

// 修改头像
const changeAvatar = () => {
  // 选择图片
  uni.chooseImage({
    count: 1, // 只选一张图片
    sizeType: ['compressed'], // 压缩图片
    sourceType: ['album', 'camera'], // 可以从相册或相机选择
    success: async (res) => {
      try {
        const tempFilePath = res.tempFilePaths[0]
        
        // 显示上传中提示
        uni.showLoading({
          title: '上传中...',
          mask: true
        })
        
        // 上传图片到服务器
        const uploadTask = () => {
          return new Promise((resolve, reject) => {
            uni.uploadFile({
              url: 'http://82.156.12.240:8080/api/file/upload',
              filePath: tempFilePath,
              name: 'file',
              header: {
                'Authorization': `Bearer ${uni.getStorageSync('token')}`
              },
              success: (uploadRes) => {
                console.log('上传成功, 原始响应:', uploadRes)
                try {
                  // 统一处理响应数据
                  const response = typeof uploadRes.data === 'string' 
                    ? JSON.parse(uploadRes.data) 
                    : uploadRes.data
                  
                  if (response.code === 200) {
                    resolve(response.msg) // 直接返回msg中的图片URL
                  } else {
                    reject(new Error(response.msg || '上传失败'))
                  }
                } catch (e) {
                  reject(new Error('响应解析失败'))
                }
              },
              fail: (err) => {
                console.error('上传失败:', err)
                reject(new Error('网络错误'))
              }
            })
          })
        }
        
        // 执行上传
        const imageUrl = await uploadTask()
        console.log('头像上传成功, URL:', imageUrl)
        
        // 更新用户头像信息到服务器
        const updateRes = await request({
          url: 'http://82.156.12.240:8080/api/user/profile',
          method: 'PUT',
          data: {
            userAvatar: imageUrl
          }
        })
        
        if (updateRes.code === 200) {
          // 更新本地用户信息
          userInfo.value.userAvatar = imageUrl
          
          // 更新本地存储的头像
          uni.setStorageSync('userAvatar', imageUrl)
          
          uni.showToast({
            title: '头像更新成功',
            icon: 'success'
          })
        } else {
          throw new Error(updateRes.msg || '头像更新失败')
        }
      } catch (error) {
        console.error('头像更新错误:', error)
        uni.showToast({
          title: error.message || '头像更新失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  })
}

// 显示姓名修改弹窗
const showNameDialog = () => {
  nameDialog.value.open()
}

// 更新姓名
const updateName = async (value) => {
  try {
    const res = await request({
      url: 'http://82.156.12.240:8080/api/user/profile',
      method: 'PUT',
      data: {
        userName: value
      }
    })
    
    if (res.code === 200) {
      userInfo.value.userName = value
      uni.showToast({
        title: '姓名修改成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: res.msg || '姓名修改失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('更新姓名错误:', error)
    uni.showToast({
      title: '姓名修改失败',
      icon: 'error'
    })
  }
}

// 显示性别选择器
const showGenderPicker = () => {
  uni.showActionSheet({
    itemList: ['男', '女'],
    success: async (res) => {
      const gender = res.tapIndex + 1
      try {
        const updateRes = await request({
          url: 'http://82.156.12.240:8080/api/user/profile',
          method: 'PUT',
          data: {
            userSex: gender
          }
        })
        
        if (updateRes.code === 200) {
          userInfo.value.userSex = gender
          uni.showToast({
            title: '性别修改成功',
            icon: 'success'
          })
        }
      } catch (error) {
        uni.showToast({
          title: '性别修改失败',
          icon: 'error'
        })
      }
    }
  })
}

// 显示手机号修改弹窗
const showPhoneDialog = () => {
  phoneDialog.value.open()
}

// 更新手机号
const updatePhone = async (value) => {
  // 简单的手机号验证
  if (!/^1[3-9]\d{9}$/.test(value)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }
  
  try {
    const res = await request({
      url: 'http://82.156.12.240:8080/api/user/profile',
      method: 'PUT',
      data: {
        phone: value
      }
    })
    
    if (res.code === 200) {
      userInfo.value.phone = value
      uni.showToast({
        title: '手机号修改成功',
        icon: 'success'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '手机号修改失败',
      icon: 'error'
    })
  }
}

// 修改生日选择器实现
const showDatePicker = () => {
  // 初始化日期选择器
  initDatePicker()
  // 显示日期选择器
  datePopup.value.open()
}

// 关闭日期选择器
const closeDatePicker = () => {
  datePopup.value.close()
}

// 确认日期选择
const confirmDatePicker = async () => {
  try {
    const updateRes = await request({
      url: 'http://82.156.12.240:8080/api/user/profile',
      method: 'PUT',
      data: {
        userBirthday: selectedDate.value
      }
    })
    
    if (updateRes.code === 200) {
      userInfo.value.userBirthday = selectedDate.value
      uni.showToast({
        title: '生日修改成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: updateRes.msg || '生日修改失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('更新生日出错:', error)
    uni.showToast({
      title: '生日修改失败',
      icon: 'error'
    })
  } finally {
    datePopup.value.close()
  }
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确认退出登录？',
    success: (res) => {
      if (res.confirm) {
        // 清除登录状态
        uni.clearStorageSync()
        // 跳转到登录页
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }
    }
  })
}

// 导航到收货地址列表
const navigateToAddressList = () => {
  uni.navigateTo({
    url: '/pages/address/list'
  })
}

// 页面加载时获取用户信息
onMounted(() => {
  getUserInfo()
})
</script>

<style lang="scss">
.settings-container {
  min-height: 100vh;
  background-color: #f8f9fc;
  padding: 20rpx;
  
  .settings-list {
    background: #ffffff;
    border-radius: 24rpx;
    overflow: hidden;
    
    .settings-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32rpx;
      border-bottom: 2rpx solid #f5f5f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .item-left {
        .label {
          font-size: 28rpx;
          color: #333333;
        }
      }
      
      .item-right {
        display: flex;
        align-items: center;
        
        .avatar {
          width: 80rpx;
          height: 80rpx;
          border-radius: 40rpx;
          margin-right: 16rpx;
        }
        
        .value {
          font-size: 28rpx;
          color: #666666;
          margin-right: 16rpx;
        }
        
        .icon-right {
          color: #999999;
          font-size: 24rpx;
        }
      }
    }
  }
  
  .logout-button {
    margin-top: 60rpx;
    background: #ff4d4f;
    color: #ffffff;
    height: 88rpx;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    
    &:active {
      opacity: 0.8;
    }
  }
}

/* 添加日期选择器样式 */
.date-picker-container {
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1px solid #f5f5f5;
  
  text {
    font-size: 28rpx;
    
    &:first-child {
      color: #999999;
    }
    
    &:last-child {
      color: #4a90e2;
      font-weight: 500;
    }
  }
}

.date-picker-view {
  width: 100%;
  height: 400rpx;
}

.picker-item {
  line-height: 50px;
  text-align: center;
}
</style> 