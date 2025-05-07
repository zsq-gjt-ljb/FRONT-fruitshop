<template>
  <view class="user-container">
    <!-- 用户信息区域 -->
    <view class="user-header" @tap="navigateToSettings">
      <view class="blur-background"></view>
      <view class="user-info">
        <image class="avatar" :src="isGuest ? '/static/images/default-avatar.png' : (userInfo.userAvatar || '/static/images/default-avatar.png')" mode="aspectFill" />
        <view class="info">
          <text class="nickname">{{ isGuest ? '游客' : (userInfo.userName || '微信用户') }}</text>
          <view class="level-tag" v-if="!isGuest">
            <image class="vip-icon" src="/static/icons/vip.png" mode="aspectFit" />
            <text>VIP {{ userInfo.memberLevel || 1 }}</text>
          </view>
          <view class="login-btn" v-if="isGuest" @tap.stop="navigateToLogin">
            <text>点击登录</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单区域 -->
    <view class="card-section order-section">
      <view class="section-header" @tap="navigateToOrderList('')">
        <text class="title">我的订单</text>
        <view class="more">
          <text>查看全部</text>
          <uni-icons type="right" size="14" color="#999"></uni-icons>
        </view>
      </view>
      
      <view class="order-types">
        <view class="type-item" @tap="navigateToOrderList('pending-payment')">
          <view class="icon-wrapper">
            <image class="icon" src="/static/icons/payment.png" mode="aspectFit" />
          </view>
          <text class="name">待支付</text>
        </view>
        <view class="type-item" @tap="navigateToOrderList('undelivered')">
          <view class="icon-wrapper">
            <image class="icon" src="/static/icons/box.png" mode="aspectFit" />
          </view>
          <text class="name">待发货</text>
        </view>
        <view class="type-item" @tap="navigateToOrderList('delivered')">
          <view class="icon-wrapper">
            <image class="icon" src="/static/icons/truck.png" mode="aspectFit" />
          </view>
          <text class="name">待收货</text>
        </view>
        <view class="type-item" @tap="navigateToOrderList('completed')">
          <view class="icon-wrapper">
            <image class="icon" src="/static/icons/check.png" mode="aspectFit" />
          </view>
          <text class="name">已完成</text>
        </view>
        <view class="type-item" @tap="navigateToOrderList('after-sale')">
          <view class="icon-wrapper">
            <image class="icon" src="/static/icons/refound.png" mode="aspectFit" />
          </view>
          <text class="name">退款/售后</text>
        </view>
      </view>
    </view>

    <!-- 常用工具 -->
    <view class="card-section tools-section">
      <view class="section-header">
        <text class="title">常用工具</text>
      </view>
      <view class="tools-grid">
        <view 
          class="tool-item" 
          v-for="item in toolsList" 
          :key="item.id"
          @tap="handleToolClick(item)"
        >
          <image class="icon" :src="item.icon" mode="aspectFill" />
          <text class="name">{{ item.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- 官方客服按钮，添加在页面底部 -->
   
  </view>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import request from '@/utils/request'
import CustomerService from '@/components/business/CustomerService.vue'

// 用户信息
const userInfo = ref({
  userAvatar: '',
  userName: '',
  memberLevel: 1,
  userRole: ''  // 使用后端返回的userRole字段
})

// 是否为游客模式
const isGuest = ref(false)

// 订单类型
const orderTypes = ref([
  { type: 'pending-payment', name: '待支付', icon: '/static/icons/payment.png', count: 0 },
  { type: 'undelivered', name: '待发货', icon: '/static/icons/box.png', count: 0 },
  { type: 'delivered', name: '待收货', icon: '/static/icons/truck.png', count: 0 },
  { type: 'after-sale', name: '退款/售后', icon: '/static/icons/refound.png', count: 0 }
])

// 
const toolsList = computed(() => {
  const baseTools = [
    { 
      id: 1, 
      name: '收货地址', 
      icon: '/static/icons/location.png', 
      path: '/pages/address/edit' 
    },
    { 
      id: 2, 
      name: '个人设置', 
      icon: '/static/icons/setting.png', 
      path: '/pages/settings/index'  
    },
    { 
      id: 3, 
      name: '联系客服', 
      icon: '/static/icons/service.png', 
      type: 'customer-service'  
    }
  ]
  
  // 如果是管理员，添加管理员入口
  if (userInfo.value.userRole === 'admin') {
    baseTools.push({
      id: 4,
      name: '管理后台',
      icon: '/static/icons/admin.png',
      path: '/pages/admin/index'
    })
  }
  
  return baseTools
})

// 检查是否为游客模式
const checkGuestMode = () => {
  const token = uni.getStorageSync('token');
  
  // 如果没有token，设置为游客模式
  if (!token) {
    isGuest.value = true;
    return true;
  }
  
  // 不是游客模式，重置状态
  isGuest.value = false;
  return false;
}

// 提示需要登录
const showLoginTip = () => {
  if (isGuest.value) {
    uni.showModal({
      title: '需要登录',
      content: '该功能需要登录后才能使用，是否立即登录？',
      success: (res) => {
        if (res.confirm) {
          // 记录当前页面路径，以便登录后返回
          const currentPage = '/' + getCurrentPages()[getCurrentPages().length - 1].route;
          uni.navigateTo({
            url: '/pages/login/login?redirect=' + encodeURIComponent(currentPage)
          });
        }
      }
    });
    return true;
  }
  return false;
}

// 直接跳转到登录页面
const navigateToLogin = () => {
  const currentPage = '/' + getCurrentPages()[getCurrentPages().length - 1].route;
  uni.navigateTo({
    url: '/pages/login/login?redirect=' + encodeURIComponent(currentPage)
  });
}

// 获取用户信息
const getUserInfo = async () => {
  // 如果是游客模式，不请求用户信息
  if (isGuest.value) {
    return;
  }
  
  try {
    const res = await request({
      url: 'https://bgnc.online/api/user/profile',
      method: 'GET'
    })
    if (res.code === 200) {
      console.log('res.data是', res.data)
      userInfo.value = {
        userAvatar: res.data.userAvatar,
        userName: res.data.userName,
        memberLevel: res.data.memberLevel || 1,
        userRole: res.data.userRole,
        id: res.data.id,
        userSex: res.data.userSex,
        userBirthday: res.data.userBirthday,
        phone: res.data.phone,
        status: res.data.status,
        openId: res.data.openId
      }
      console.log('处理后的用户信息:', userInfo.value)
      // 保存用户信息到本地存储
      uni.setStorageSync('userAvatar', res.data.userAvatar)
      uni.setStorageSync('userName', res.data.userName)
      uni.setStorageSync('userRole', res.data.userRole)
    }
  } catch (error) {
    console.error('获取用户信息失败：', error)
  }
}

// 跳转到订单列表
const navigateToOrderList = (type) => {
  // 检查是否为游客模式，如果是则显示登录提示
  if (showLoginTip()) {
    return;
  }
  
  // 将订单类型映射到状态值
  let status = ''; // 默认全部
  
  switch(type) {
    case 'pending-payment':
      status = 0; // 待支付
      break;
    case 'undelivered':
      status = 1; // 待发货
      break;
    case 'delivered':
      status = 2; // 待收货
      break;
    case 'completed':
      status = 3; // 已完成
      break;
    case 'after-sale':
      status = 4; // 退款/售后
      break;
  }
  
  uni.navigateTo({
    url: `/pages/order/list?status=${status}`
  })
}

// 工具点击处理
const handleToolClick = (item) => {
  // 检查是否为游客模式，如果是则显示登录提示
  if (showLoginTip()) {
    return;
  }
  
  // 如果是客服功能,直接导航到联系客服页面
  if (item.type === 'customer-service') {
    // 不再只是打印日志，而是跳转到联系客服页面
    uni.navigateTo({
      url: '/pages/user/contact',
      fail: (err) => {
        console.error('跳转到联系客服页面失败：', err)
        uni.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
    return
  }
  
  // 如果是管理后台，先进行权限二次确认
  if (item.name === '管理后台') {
    uni.showModal({
      title: '提示',
      content: '确认进入管理后台？',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: item.path,
            fail: (err) => {
              console.error('跳转失败：', err)
              uni.showToast({
                title: '页面跳转失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
    return
  }
  
  // 其他工具正常跳转
  uni.navigateTo({
    url: item.path,
    fail: (err) => {
      console.error('跳转失败：', err)
      uni.showToast({
        title: '页面跳转失败',
        icon: 'none'
      })
    }
  })
}

// 客服按钮点击事件处理
const handleContact = (e) => {
  console.log('联系客服事件触发:', e.detail)
  // 可以在这里添加统计或其他处理逻辑
}

// 客服按钮点击前处理
const handleServiceClick = () => {
  // 检查是否为游客模式，如果是则显示登录提示
  if (showLoginTip()) {
    return;
  }
}

// 跳转到个人设置页面
const navigateToSettings = () => {
  // 检查是否为游客模式，如果是则显示登录提示
  if (showLoginTip()) {
    return;
  }
  
  uni.navigateTo({
    url: '/pages/settings/index',
    fail: (err) => {
      console.error('跳转到个人设置页面失败：', err)
      uni.showToast({
        title: '页面跳转失败',
        icon: 'none'
      })
    }
  })
}

onMounted(() => {
  // 检查是否游客模式
  checkGuestMode();
  
  // 如果不是游客模式，获取用户信息
  if (!isGuest.value) {
    getUserInfo();
  }
})

onShow(() => {
  // 每次页面显示时检查游客模式
  checkGuestMode();
  
  // 如果不是游客模式，获取用户信息
  if (!isGuest.value) {
    getUserInfo();
  }
})
</script>

<style lang="scss">
.user-container {
  min-height: 100vh;
  background-color: #f8f9fc;
  padding-bottom: env(safe-area-inset-bottom);
  
  .user-header {
    position: relative;
    height: 400rpx;
    padding: 40rpx;
    overflow: hidden;
    
    &:active {
      opacity: 0.9;
    }
    
    .blur-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #4a90e2 0%, #6eb4f7 100%);
      opacity: 0.9;
    }
    
    .user-info {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: flex-start;
      padding-top: 60rpx;
      
      .avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
        border: 4rpx solid rgba(255, 255, 255, 0.2);
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      .info {
        margin-left: 24rpx;
        display: flex;
        flex-direction: column;
        
        .nickname {
          font-size: 36rpx;
          color: #ffffff;
          font-weight: 500;
          margin-bottom: 16rpx;
        }
        
        .level-tag {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 26rpx;
          padding: 8rpx 20rpx;
          backdrop-filter: blur(10px);
          
          .vip-icon {
            width: 28rpx;
            height: 28rpx;
            margin-right: 8rpx;
          }
          
          text {
            font-size: 24rpx;
            color: #ffffff;
            font-weight: 400;
            letter-spacing: 1rpx;
          }
        }
        
        .login-btn {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 26rpx;
          padding: 8rpx 20rpx;
          backdrop-filter: blur(10px);
          
          text {
            font-size: 24rpx;
            color: #ffffff;
            font-weight: 500;
            letter-spacing: 1rpx;
          }
        }
      }
    }
  }
  
  .card-section {
    margin: 24rpx;
    background: #ffffff;
    border-radius: 24rpx;
    padding: 32rpx;
    box-shadow: 0 4rpx 16rpx rgba(74, 144, 226, 0.06);
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32rpx;
      
      .title {
        font-size: 32rpx;
        color: #333333;
        font-weight: 600;
      }
      
      .more {
        display: flex;
        align-items: center;
        color: #999999;
        font-size: 28rpx;
        
        .iconfont {
          margin-left: 8rpx;
        }
      }
    }
  }
  
  .order-section {
    margin-top: 20rpx;
    
    .order-types {
      display: flex;
      justify-content: space-around;
      padding: 30rpx 0;
      
      .type-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        
        .icon-wrapper {
          width: 80rpx;
          height: 80rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10rpx;
          
          .icon {
            width: 50rpx;
            height: 50rpx;
          }
        }
        
        .name {
          font-size: 24rpx;
          color: #666;
        }
        
        .badge {
          position: absolute;
          top: -6rpx;
          right: 0;
          min-width: 32rpx;
          height: 32rpx;
          padding: 0 6rpx;
          background-color: #ff4d4f;
          border-radius: 16rpx;
          color: #fff;
          font-size: 20rpx;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
  
  .tools-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32rpx;
    
    .tool-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .icon {
        width: 48rpx;
        height: 48rpx;
        margin-bottom: 12rpx;
      }
      
      .name {
        font-size: 24rpx;
        color: #666666;
      }
      
      // 管理后台特殊样式
      &.admin-tool {
        .icon-image {
          // 可以给管理后台图标添加特殊效果
          filter: drop-shadow(0 2rpx 8rpx rgba(74, 144, 226, 0.3));
        }
        
        .name {
          color: #4a90e2; // 使用主题色突出显示
          font-weight: 500;
        }
      }
    }
  }
  
  .customer-service-section {
    padding: 30rpx 0;
    display: flex;
    justify-content: center;
    
    .official-service-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      color: #4a90e2;
      font-size: 28rpx;
      padding: 0;
      line-height: normal;
      
      &::after {
        display: none;
      }
      
      .icon {
        width: 36rpx;
        height: 36rpx;
        margin-right: 10rpx;
      }
    }
  }
}
</style> 