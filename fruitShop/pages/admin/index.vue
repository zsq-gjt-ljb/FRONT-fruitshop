<template>
  <view class="admin-container">
    <!-- 侧边栏 -->
    <view class="sidebar">
      <view class="admin-info">
        <image class="avatar" :src="adminInfo.avatar" mode="aspectFill"></image>
        <text class="name">{{ adminInfo.name }}</text>
      </view>
      
      <view class="menu">
        <view 
          v-for="(item, index) in menuItems" 
          :key="item.id"
          :class="['menu-item', activeMenu === item.id ? 'active' : '']"
          @tap="switchMenu(item.id)"
        >
          <uni-icons :type="item.icon" size="20" :color="activeMenu === item.id ? '#4a90e2' : '#666'"></uni-icons>
          <text class="menu-text">{{ item.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content">
      <view class="debug-info">
        <text>当前菜单: {{ activeMenu }}</text>
        <text>组件状态: {{ activeMenu === 'product' ? '应显示商品管理' : 
                         activeMenu === 'category' ? '应显示分类管理' : 
                         activeMenu === 'home' ? '应显示首页管理' : 
                         activeMenu === 'order' ? '应显示订单管理' : 
                         activeMenu === 'user' ? '应显示用户管理' : '未知' }}</text>
      </view>
      
      <!-- 根据选中的菜单显示不同的管理组件 -->
      <product-manage v-if="activeMenu === 'product'"></product-manage>
      <category-manage v-if="activeMenu === 'category'"></category-manage>
      <home-manage v-if="activeMenu === 'home'"></home-manage>
      <order-manage v-if="activeMenu === 'order'"></order-manage>
      <user-manage v-if="activeMenu === 'user'"></user-manage>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ProductManage from './components/ProductManage.vue'
import CategoryManage from './components/CategoryManage.vue'
import HomeManage from './components/HomeManage.vue'
import OrderManage from './components/OrderManage.vue'
import UserManage from './components/UserManage.vue'

// 当前选中的菜单
const activeMenu = ref('product')

// 管理员信息
const adminInfo = ref({
  avatar: uni.getStorageSync('userAvatar') || '/static/images/default-avatar.png',
  name: uni.getStorageSync('userName') || 'Admin'
})

// 菜单项
const menuItems = ref([
  { id: 'product', name: '商品管理', icon: 'shop' },
  { id: 'category', name: '分类管理', icon: 'list' },
  { id: 'home', name: '首页管理', icon: 'home' },
  { id: 'order', name: '订单管理', icon: 'cart' },
  { id: 'user', name: '用户管理', icon: 'person' }
])

// 切换菜单
const switchMenu = (menuId) => {
  activeMenu.value = menuId
  console.log('切换到菜单:', menuId)
}

// 添加生命周期钩子，检查组件是否正确加载
onMounted(() => {
  console.log('管理员页面已加载')
  console.log('当前激活的菜单:', activeMenu.value)
  console.log('管理员信息:', adminInfo.value)
  console.log('组件是否已注册:', !!ProductManage, !!CategoryManage, !!HomeManage, !!OrderManage, !!UserManage)
})
</script>

<style lang="scss">
.admin-container {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
  
  .debug-info {
    padding: 20rpx;
    background-color: #ffe58f;
    margin-bottom: 20rpx;
    font-size: 24rpx;
    
    text {
      display: block;
      margin-bottom: 10rpx;
    }
  }
  
  .sidebar {
    width: 220rpx;
    background-color: #fff;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    
    .admin-info {
      padding: 30rpx 20rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      border-bottom: 1rpx solid #eee;
      
      .avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
        margin-bottom: 16rpx;
      }
      
      .name {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }
    }
    
    .menu {
      flex: 1;
      padding: 20rpx 0;
      
      .menu-item {
        height: 90rpx;
        display: flex;
        align-items: center;
        padding: 0 20rpx;
        margin-bottom: 10rpx;
        
        .menu-text {
          margin-left: 16rpx;
          font-size: 28rpx;
          color: #666;
        }
        
        &.active {
          background-color: rgba(74, 144, 226, 0.1);
          border-left: 6rpx solid #4a90e2;
          
          .menu-text {
            color: #4a90e2;
            font-weight: 500;
          }
        }
      }
    }
  }
  
  .content {
    flex: 1;
    padding: 30rpx;
    overflow-y: auto;
  }
}
</style> 