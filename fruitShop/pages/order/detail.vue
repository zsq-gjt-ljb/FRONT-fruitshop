<template>
  <view class="order-detail-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="title">订单详情</text>
      <text class="order-id">订单编号: {{ orderId }}</text>
      <view class="order-status" v-if="orderStatus">
        <image v-if="orderStatus === 0" class="status-icon" src="/static/icons/alipay.png" mode="aspectFit"></image>
        <text>{{ getStatusText(orderStatus) }}</text>
      </view>
    </view>
    
    <!-- 商品信息 -->
    <view class="info-card">
      <view class="card-title">
        <uni-icons type="shop" size="18" color="#3b78db"></uni-icons>
        <text>商品信息</text>
      </view>
      <view class="products-list">
        <view class="product-item" v-for="(item, index) in orderItems" :key="index">
          <image class="product-image" :src="item.productPic || '/static/images/default-product.png'" mode="aspectFill"></image>
          <view class="product-info">
            <text class="product-name">{{ item.productName }}</text>
            <text class="product-attr" v-if="item.productAttr">{{ item.productAttr }}</text>
            <view class="product-price-qty">
              <text class="product-price">￥{{ item.productPrice }}</text>
              <text class="product-qty">x{{ item.productQuantity }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 商品总计 -->
      <view class="order-summary">
        <view class="summary-item">
          <text class="label">商品总数:</text>
          <text class="value">{{ getTotalQuantity() }}件</text>
        </view>
        <view class="summary-item">
          <text class="label">商品总额:</text>
          <text class="value price">￥{{ getTotalPrice() }}</text>
        </view>
      </view>
    </view>
    
    <!-- 推荐商品 -->
    <view class="info-card recommend-card">
      <view class="card-title">
        <uni-icons type="star" size="18" color="#3b78db"></uni-icons>
        <text>猜你喜欢</text>
      </view>
      <view class="recommend-list">
        <view class="empty-recommend">
          <uni-icons type="shop" size="50" color="#ddd"></uni-icons>
          <text>更多好货，敬请期待</text>
        </view>
      </view>
    </view>
    
    <!-- 订单时间信息 -->
    <view class="info-card time-card">
      <view class="time-item">
        <text class="label">下单时间</text>
        <text class="value">{{ formatDate(new Date()) }}</text>
      </view>
    </view>
    
    <!-- 底部操作按钮 -->
    <view class="action-bar">
      <view class="action-btn" @tap="goBack">返回上一页</view>
      <view class="action-btn primary" v-if="orderStatus === 0" @tap="handlePay">
        <image class="pay-icon" src="/static/icons/alipay.png" mode="aspectFit"></image>
        <text>立即支付</text>
      </view>
      <button open-type="contact" class="action-btn primary" @contact="handleContact">联系客服</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from '@/utils/request'

// 订单商品
const orderItems = ref([])
const orderId = ref('')
const orderStatus = ref(null)

// 获取订单详情
const getOrderDetail = async () => {
  if (!orderId.value) return
  
  try {
    uni.showLoading({
      title: '加载中...'
    })
    
    const result = await request({
      url: `http://82.156.12.240:8080/api/order/${orderId.value}`,
      method: 'GET'
    })
    
    if (result.code === 200) {
      // 处理返回的数据
      if (result.data && Array.isArray(result.data)) {
        orderItems.value = result.data
        console.log('订单商品:', orderItems.value)
      } else if (result.data && typeof result.data === 'object') {
        // 如果返回的是订单对象
        orderItems.value = result.data.orderItems || []
        orderStatus.value = result.data.status
        console.log('订单状态:', orderStatus.value)
      }
    } else {
      uni.showToast({
        title: result.message || '获取订单详情失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 计算商品总数量
const getTotalQuantity = () => {
  return orderItems.value.reduce((total, item) => {
    return total + (parseInt(item.productQuantity) || 0)
  }, 0)
}

// 计算商品总价
const getTotalPrice = () => {
  const total = orderItems.value.reduce((sum, item) => {
    return sum + (parseFloat(item.productPrice) || 0) * (parseInt(item.productQuantity) || 0)
  }, 0)
  return total.toFixed(2)
}

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 处理联系客服事件
const handleContact = (e) => {
  console.log('联系客服事件触发:', e.detail)
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

// 处理支付
const handlePay = () => {
  uni.showToast({
    title: '正在跳转到支付...',
    icon: 'none'
  })
  
  // 这里可以添加实际的支付逻辑
  setTimeout(() => {
    uni.showToast({
      title: '支付成功',
      icon: 'success'
    })
    
    // 刷新订单状态
    getOrderDetail()
  }, 1500)
}

// 页面加载
onLoad((options) => {
  console.log('订单详情页面参数:', options)
  
  if (options.id) {
    orderId.value = options.id
    getOrderDetail()
  } else {
    uni.showToast({
      title: '订单ID不存在',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})
</script>

<style lang="scss">
.order-detail-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20rpx;
  padding-bottom: 120rpx;
  
  .page-header {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 10rpx;
      display: block;
    }
    
    .order-id {
      font-size: 24rpx;
      color: #999;
      display: block;
      margin-bottom: 10rpx;
    }
    
    .order-status {
      display: flex;
      align-items: center;
      margin-top: 10rpx;
      
      .status-icon {
        width: 40rpx;
        height: 40rpx;
        margin-right: 10rpx;
      }
      
      text {
        font-size: 28rpx;
        color: #3b78db;
        font-weight: 500;
      }
    }
  }
  
  .info-card {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .products-list {
      .product-item {
        display: flex;
        padding: 20rpx 0;
        border-bottom: 1rpx solid #f5f5f5;
        
        &:last-child {
          border-bottom: none;
        }
        
        .product-image {
          width: 120rpx;
          height: 120rpx;
          border-radius: 8rpx;
          background-color: #f5f5f5;
        }
        
        .product-info {
          flex: 1;
          padding-left: 20rpx;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          
          .product-name {
            font-size: 28rpx;
            color: #333;
            margin-bottom: 8rpx;
          }
          
          .product-attr {
            font-size: 24rpx;
            color: #999;
            margin-bottom: 8rpx;
          }
          
          .product-price-qty {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .product-price {
              font-size: 26rpx;
              color: #ff4d4f;
            }
            
            .product-qty {
              font-size: 26rpx;
              color: #999;
            }
          }
        }
      }
      
      margin-bottom: 20rpx;
    }
    
    .order-summary {
      border-top: 1rpx dashed #eee;
      padding-top: 20rpx;
      
      .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          font-size: 26rpx;
          color: #666;
        }
        
        .value {
          font-size: 26rpx;
          color: #333;
          
          &.price {
            color: #ff4d4f;
            font-weight: 500;
            font-size: 30rpx;
          }
        }
      }
    }
    
    .card-title {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      text {
        font-size: 30rpx;
        font-weight: 500;
        margin-left: 10rpx;
      }
    }
    
    &.recommend-card {
      .recommend-list {
        min-height: 200rpx;
        
        .empty-recommend {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 50rpx 0;
          
          text {
            font-size: 26rpx;
            color: #999;
            margin-top: 20rpx;
          }
        }
      }
    }
    
    &.time-card {
      .time-item {
        display: flex;
        justify-content: space-between;
        padding: 20rpx 0;
        
        .label {
          font-size: 26rpx;
          color: #666;
        }
        
        .value {
          font-size: 26rpx;
          color: #333;
        }
      }
    }
    
    .info-content {
      .info-row {
        display: flex;
        margin-bottom: 16rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .info-label {
          width: 160rpx;
          font-size: 26rpx;
          color: #666;
        }
        
        .info-value {
          flex: 1;
          font-size: 26rpx;
          color: #333;
        }
        
        .copy-btn {
          font-size: 24rpx;
          color: #3b78db;
          background-color: #f0f5ff;
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
          margin-left: 20rpx;
        }
        
        &.total-row {
          margin-top: 20rpx;
          padding-top: 20rpx;
          border-top: 1rpx dashed #eee;
        }
        
        .total-price {
          font-size: 32rpx;
          color: #ff4d4f;
          font-weight: 500;
        }
      }
    }
  }
  
  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100rpx;
    background-color: #fff;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
    z-index: 100;
    
    .action-btn {
      height: 70rpx;
      border-radius: 35rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      margin-right: 20rpx;
      padding: 0 30rpx;
      background-color: #f5f5f5;
      color: #666;
      
      &.primary {
        background: linear-gradient(to right, #3b78db, #4a90e2);
        color: #fff;
        
        .pay-icon {
          width: 32rpx;
          height: 32rpx;
          margin-right: 10rpx;
        }
      }
    }
  }
}
</style> 