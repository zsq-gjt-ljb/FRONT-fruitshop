<template>
  <view class="order-container">
    <!-- 订单状态标签 -->
    <view class="order-tabs">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        :class="['tab-item', { active: currentTab === index }]"
        @tap="switchTab(index)"
      >
        {{ tab }}
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list">
      <view class="order-item" v-for="(order, index) in orderList" :key="index">
        <view class="order-header">
          <text>订单号：{{ order.orderNo }}</text>
          <text>{{ order.status }}</text>
        </view>
        <view class="order-content">
          <!-- 订单商品列表 -->
        </view>
        <view class="order-footer">
          <text>合计：¥{{ order.totalAmount }}</text>
          <view class="order-actions">
            <!-- 订单操作按钮 -->
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const tabs = ['全部', '待付款', '待发货', '待收货', '已完成']
const currentTab = ref(0)
const orderList = ref([])

// 切换标签
const switchTab = (index) => {
  currentTab.value = index
  getOrderList()
}

// 获取订单列表
const getOrderList = async () => {
  try {
    // 获取订单列表逻辑
  } catch (error) {
    console.error('获取订单列表失败：', error)
  }
}

onMounted(() => {
  getOrderList()
})
</script>

<style lang="scss">
.order-container {
  min-height: 100vh;
  background-color: #f8f8f8;

  .order-tabs {
    display: flex;
    background-color: #fff;
    padding: 20rpx 0;
    
    .tab-item {
      flex: 1;
      text-align: center;
      font-size: 28rpx;
      
      &.active {
        color: var(--primary-color);
      }
    }
  }

  .order-list {
    padding: 20rpx;
    
    .order-item {
      background-color: #fff;
      border-radius: 10rpx;
      margin-bottom: 20rpx;
      padding: 20rpx;
    }
  }
}
</style> 