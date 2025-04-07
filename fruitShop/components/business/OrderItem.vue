<template>
  <view class="order-item">
    <!-- 订单头部 -->
    <view class="order-header">
      <text class="order-no">订单号：{{ order.orderNo }}</text>
      <text class="order-status">{{ orderStatusText }}</text>
    </view>

    <!-- 订单商品列表 -->
    <view class="order-goods">
      <view 
        class="goods-item"
        v-for="item in order.goods"
        :key="item.id"
      >
        <image :src="item.image" mode="aspectFill" />
        <view class="goods-info">
          <text class="goods-name">{{ item.name }}</text>
          <text class="goods-quantity">x{{ item.quantity }}</text>
          <Price :price="item.price" />
        </view>
      </view>
    </view>

    <!-- 订单金额信息 -->
    <view class="order-amount">
      <text>共{{ totalQuantity }}件商品</text>
      <text>实付款：</text>
      <Price :price="order.totalAmount" />
    </view>

    <!-- 订单操作按钮 -->
    <view class="order-actions">
      <button 
        v-for="(action, index) in getActions"
        :key="index"
        :class="['action-btn', action.type]"
        @tap="handleAction(action.type)"
      >
        {{ action.text }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import Price from '@/components/common/Price.vue'

// 定义订单状态枚举
const ORDER_STATUS = {
  UNKNOWN: -1,
  PENDING_PAYMENT: 0,
  PENDING_DELIVERY: 1,
  PENDING_RECEIPT: 2,
  COMPLETED: 3,
  AFTER_SALE: 4
}

// 定义订单状态文案
const STATUS_TEXT = {
  [ORDER_STATUS.UNKNOWN]: '未知状态',
  [ORDER_STATUS.PENDING_PAYMENT]: '待支付',
  [ORDER_STATUS.PENDING_DELIVERY]: '待发货',
  [ORDER_STATUS.PENDING_RECEIPT]: '待收货',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.AFTER_SALE]: '退款/售后'
}

// 组件属性定义
const props = defineProps({
  order: {
    type: Object,
    required: true,
    // 订单对象结构
    default: () => ({
      orderNo: '',
      status: '',
      goods: [],
      totalAmount: 0,
      createTime: ''
    })
  }
})

// 组件事件定义
const emit = defineEmits([
  'pay',           // 支付
  'cancel',        // 取消订单
  'confirm',       // 确认收货
  'delete',        // 删除订单
  'viewLogistics', // 查看物流
  'viewDetail'     // 查看详情
])

// 计算订单状态文案
const orderStatusText = computed(() => {
  return STATUS_TEXT[parseInt(props.order.status)] || '未知状态'
})

// 计算商品总数量
const totalQuantity = computed(() => {
  return props.order.goods.reduce((total, item) => total + item.quantity, 0)
})

// 根据订单状态获取可用操作按钮
const getActions = computed(() => {
  const actions = []
  switch (parseInt(props.order.status)) {
    case ORDER_STATUS.PENDING_PAYMENT:
      actions.push(
        { type: 'primary', text: '立即支付' },
        { type: 'default', text: '取消订单' }
      )
      break
    case ORDER_STATUS.PENDING_DELIVERY:
      actions.push(
        { type: 'default', text: '查看物流' }
      )
      break
    case ORDER_STATUS.PENDING_RECEIPT:
      actions.push(
        { type: 'primary', text: '确认收货' },
        { type: 'default', text: '查看物流' }
      )
      break
    case ORDER_STATUS.AFTER_SALE:
      actions.push(
        { type: 'default', text: '查看详情' }
      )
      break
    case ORDER_STATUS.COMPLETED:
      actions.push(
        { type: 'default', text: '删除订单' }
      )
      break
  }
  return actions
})

// 处理按钮点击事件
const handleAction = (type) => {
  switch (type) {
    case 'primary':
      if (parseInt(props.order.status) === ORDER_STATUS.PENDING_PAYMENT) {
        emit('pay', props.order)
      } else if (parseInt(props.order.status) === ORDER_STATUS.PENDING_RECEIPT) {
        emit('confirm', props.order)
      }
      break
    case 'default':
      if (parseInt(props.order.status) === ORDER_STATUS.PENDING_PAYMENT) {
        emit('cancel', props.order)
      } else if (parseInt(props.order.status) === ORDER_STATUS.COMPLETED) {
        emit('delete', props.order)
      } else if (parseInt(props.order.status) === ORDER_STATUS.AFTER_SALE) {
        emit('viewDetail', props.order)
      } else {
        emit('viewLogistics', props.order)
      }
      break
  }
}
</script>

<style lang="scss">
.order-item {
  background-color: #fff;
  border-radius: 12rpx;
  margin: 20rpx;
  padding: 20rpx;

  .order-header {
    display: flex;
    justify-content: space-between;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #eee;
    
    .order-no {
      font-size: 24rpx;
      color: #666;
    }
    
    .order-status {
      font-size: 24rpx;
      color: var(--primary-color);
    }
  }

  .order-goods {
    padding: 20rpx 0;
    
    .goods-item {
      display: flex;
      margin-bottom: 20rpx;
      
      image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 8rpx;
      }
      
      .goods-info {
        flex: 1;
        margin-left: 20rpx;
        
        .goods-name {
          font-size: 28rpx;
          color: #333;
        }
        
        .goods-quantity {
          font-size: 24rpx;
          color: #999;
          margin: 10rpx 0;
        }
      }
    }
  }

  .order-amount {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 20rpx 0;
    border-top: 1rpx solid #eee;
    
    text {
      font-size: 24rpx;
      color: #666;
      margin-right: 10rpx;
    }
  }

  .order-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20rpx;
    
    .action-btn {
      margin-left: 20rpx;
      padding: 0 30rpx;
      height: 60rpx;
      line-height: 60rpx;
      font-size: 24rpx;
      border-radius: 30rpx;
      
      &.primary {
        background-color: var(--primary-color);
        color: #fff;
      }
      
      &.default {
        background-color: #fff;
        color: #666;
        border: 1rpx solid #ddd;
      }
    }
  }
}
</style> 