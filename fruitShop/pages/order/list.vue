<template>
  <view class="order-list-container">
    <!-- 订单状态选项卡 -->
    <view class="order-tabs">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        :class="['tab-item', activeTab === tab.value ? 'active' : '']"
        @tap="switchTab(tab.value)"
      >
        <text>{{ tab.name }}</text>
      </view>
    </view>
    
    <!-- 订单列表 -->
    <view class="order-list" v-if="orderList.length > 0">
      <view class="order-item" v-for="order in orderList" :key="order.id" @tap="goToDetail(order.id)">
        <view class="order-header">
          <text class="order-number">订单号: {{ order.id }}</text>
          <text class="order-status">{{ getStatusText(order.status) }}</text>
        </view>
        
        <!-- 订单信息 -->
        <view class="order-info">
          <view class="info-item">
            <text class="label">收货人:</text>
            <text class="value">{{ order.receiverName }}</text>
          </view>
          <view class="info-item">
            <text class="label">联系电话:</text>
            <text class="value">{{ order.receiverPhone }}</text>
          </view>
          <view class="info-item">
            <text class="label">收货地址:</text>
            <text class="value">{{ order.receiverProvince }}{{ order.receiverCity }}{{ order.receiverRegion }} {{ order.receiverDetailAddress }}</text>
          </view>
          <view class="info-item" v-if="order.deliveryCompany">
            <text class="label">物流公司:</text>
            <text class="value">{{ order.deliveryCompany }}</text>
          </view>
        </view>
        
        <view class="order-footer">
          <view class="order-total">
            <text class="total-price">商品金额: ￥{{ order.totalAmount }}</text>
            <text class="total-price">运费: ￥{{ order.freightAmount }}</text>
            <text class="total-price">合计: ￥{{ order.payAmount }}</text>
          </view>
          
          <view class="order-actions">
            <view class="action-btn" v-if="order.status === 2" @tap.stop="confirmReceived(order.id)">
              确认收货
            </view>
            <view class="action-btn" v-if="order.status === 4" @tap.stop="goToDetail(order.id)">
              查看详情
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空订单状态 -->
    <view class="empty-order" v-else>
      <image class="empty-icon" src="/static/images/empty-order.png" mode="aspectFit"></image>
      <text class="empty-text">暂无相关订单</text>
    </view>
    
    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore && orderList.length > 0">
      <text v-if="isLoading">加载中...</text>
      <text v-else @tap="loadMore">点击加载更多</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow, onPullDownRefresh, onReachBottom, onLoad } from '@dcloudio/uni-app'
import request from '@/utils/request'

// 订单状态选项卡
const tabs = ref([
  { name: '全部', value: '' },
  { name: '待支付', value: 0 },
  { name: '待发货', value: 1 },
  { name: '待收货', value: 2 },
  { name: '已完成', value: 3 },
  { name: '退款/售后', value: 4 }
])

// 当前选中的选项卡
const activeTab = ref('')

// 订单列表
const orderList = ref([])

// 分页参数
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isLoading = ref(false)

// 切换选项卡
const switchTab = (tabValue) => {
  if (activeTab.value === tabValue) return
  
  activeTab.value = tabValue
  page.value = 1
  orderList.value = []
  hasMore.value = true
  getOrderList()
}

// 获取订单列表
const getOrderList = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    // 构建请求参数
    const params = {
      page: page.value,
      pageSize: pageSize.value
    }
    
    // 添加状态过滤参数
    if (activeTab.value !== '') {
      params.status = activeTab.value
    }
    
    const result = await request({
      url: 'http://82.156.12.240:8080/api/order/list',
      method: 'GET',
      data: params
    })
    
    if (result.code === 200) {
      // 处理返回的数据
      const orders = result.data || []
      
      if (page.value === 1) {
        orderList.value = orders
      } else {
        orderList.value = [...orderList.value, ...orders]
      }
      
      // 简单处理分页
      hasMore.value = false // API没有返回总数，假设一次性返回所有数据
      
      // 更新页码
      if (hasMore.value) {
        page.value++
      }
    } else {
      uni.showToast({
        title: result.message || '获取订单失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
    uni.stopPullDownRefresh()
  }
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    getOrderList()
  }
}

// 获取订单状态文本
const getStatusText = (status) => {
  switch (parseInt(status)) {
    case 0:
      return '待支付'
    case 1:
      return '待发货'
    case 2:
      return '待收货'
    case 3:
      return '已完成'
    case 4:
      return '退款/售后'
    default:
      return '未知状态'
  }
}

// 确认收货
const confirmReceived = async (orderId) => {
  uni.showModal({
    title: '确认收货',
    content: '确认已收到商品吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await request({
            url: `http://82.156.12.240:8080/api/order/receive/${orderId}`,
            method: 'PUT'
          })
          
          if (result.code === 200) {
            uni.showToast({
              title: '确认收货成功',
              icon: 'success'
            })
            
            // 刷新订单列表
            page.value = 1
            orderList.value = []
            getOrderList()
          } else {
            uni.showToast({
              title: result.message || '操作失败',
              icon: 'none'
            })
          }
        } catch (error) {
          console.error('确认收货失败:', error)
          uni.showToast({
            title: '网络错误，请稍后再试',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 跳转到订单详情页
const goToDetail = (orderId) => {
  uni.navigateTo({
    url: `/pages/order/detail?id=${orderId}`
  })
}

// 页面加载时获取URL参数
onLoad((options) => {
  console.log('订单列表页面参数:', options)
  
  // 如果有状态参数，设置当前选项卡
  if (options.status !== undefined) {
    const status = options.status === "" ? "" : parseInt(options.status)
    activeTab.value = status
    
    // 检查是否有效状态值，如果无效则设为默认全部
    const validTab = tabs.value.find(tab => tab.value === status)
    if (!validTab) {
      activeTab.value = ''
    }
  }
})

// 页面显示时获取订单列表
onShow(() => {
  page.value = 1
  orderList.value = []
  hasMore.value = true
  getOrderList()
})

// 下拉刷新
onPullDownRefresh(() => {
  page.value = 1
  orderList.value = []
  hasMore.value = true
  getOrderList()
})

// 上拉加载更多
onReachBottom(() => {
  loadMore()
})

// 页面加载
onMounted(() => {
  console.log('订单列表页面已加载')
})
</script>

<style lang="scss">
.order-list-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 30rpx;
  
  .order-tabs {
    display: flex;
    background-color: #fff;
    padding: 0 20rpx;
    position: sticky;
    top: 0;
    z-index: 10;
    
    .tab-item {
      flex: 1;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: #666;
      position: relative;
      
      &.active {
        color: #3b78db;
        font-weight: 500;
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 4rpx;
          background-color: #3b78db;
          border-radius: 2rpx;
        }
      }
    }
  }
  
  .order-list {
    padding: 20rpx;
    
    .order-item {
      background-color: #fff;
      border-radius: 16rpx;
      margin-bottom: 20rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
      
      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24rpx;
        border-bottom: 1rpx solid #f5f5f5;
        
        .order-number {
          font-size: 26rpx;
          color: #666;
        }
        
        .order-status {
          font-size: 26rpx;
          color: #3b78db;
          font-weight: 500;
        }
      }
      
      .order-info {
        padding: 0 24rpx;
        
        .info-item {
          padding: 24rpx 0;
          border-bottom: 1rpx solid #f5f5f5;
          display: flex;
          
          &:last-child {
            border-bottom: none;
          }
          
          .label {
            width: 160rpx;
            font-size: 26rpx;
            color: #666;
          }
          
          .value {
            flex: 1;
            font-size: 26rpx;
            color: #333;
          }
        }
      }
      
      .order-footer {
        padding: 24rpx;
        border-top: 1rpx solid #f5f5f5;
        
        .order-total {
          display: block;
          text-align: right;
          margin-bottom: 20rpx;
          
          text {
            font-size: 26rpx;
            color: #666;
            display: block;
            margin-bottom: 8rpx;
          }
          
          .total-price {
            color: #333;
            font-weight: 500;
            
            &:last-child {
              color: #3b78db;
              font-size: 30rpx;
            }
          }
        }
        
        .order-actions {
          display: flex;
          justify-content: flex-end;
          
          .action-btn {
            height: 60rpx;
            padding: 0 30rpx;
            border: 1rpx solid #ddd;
            border-radius: 30rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26rpx;
            color: #666;
            margin-left: 20rpx;
            
            &.primary {
              border-color: #3b78db;
              color: #3b78db;
            }
            
            &:active {
              opacity: 0.8;
            }
          }
        }
      }
    }
  }
  
  .empty-order {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    
    .empty-icon {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 30rpx;
    }
    
    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
  
  .load-more {
    text-align: center;
    padding: 30rpx 0;
    
    text {
      font-size: 26rpx;
      color: #999;
    }
  }
}
</style> 