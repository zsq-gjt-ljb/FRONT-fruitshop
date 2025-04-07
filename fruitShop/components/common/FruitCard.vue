<template>
  <view class="fruit-card" @tap="handleClick">
    <image class="fruit-image" :src="fruit.image" mode="aspectFill" />
    <view class="fruit-info">
      <text class="fruit-name">{{ fruit.name }}</text>
      <view class="fruit-price">
        <text class="current-price">¥{{ fruit.price }}</text>
        <text v-if="fruit.originalPrice" class="original-price">¥{{ fruit.originalPrice }}</text>
      </view>
      <view v-if="showMemberPrice" class="member-price">
        会员价：¥{{ fruit.memberPrice }}
      </view>
    </view>
    <view class="action-area">
      <button class="add-cart-btn" @tap.stop="handleAddToCart">加入购物车</button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

// 定义组件属性
const props = defineProps({
  fruit: {
    type: Object,
    required: true
  },
  showMemberPrice: {
    type: Boolean,
    default: true
  }
})

// 定义事件
const emit = defineEmits(['click', 'addToCart'])

// 点击商品卡片
const handleClick = () => {
  emit('click', props.fruit)
}

// 点击加入购物车
const handleAddToCart = () => {
  emit('addToCart', props.fruit)
}
</script>

<style lang="scss">
.fruit-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin: 20rpx;
  
  .fruit-image {
    width: 100%;
    height: 300rpx;
    border-radius: 8rpx;
  }
  
  .fruit-info {
    margin-top: 16rpx;
    
    .fruit-name {
      font-size: 28rpx;
      font-weight: bold;
    }
    
    .fruit-price {
      margin-top: 12rpx;
      
      .current-price {
        color: #ff4d4f;
        font-size: 32rpx;
        font-weight: bold;
      }
      
      .original-price {
        color: #999;
        font-size: 24rpx;
        text-decoration: line-through;
        margin-left: 12rpx;
      }
    }
    
    .member-price {
      margin-top: 8rpx;
      font-size: 24rpx;
      color: #ff9c00;
    }
  }
  
  .action-area {
    margin-top: 16rpx;
    text-align: right;
    
    .add-cart-btn {
      display: inline-block;
      padding: 10rpx 30rpx;
      background: var(--primary-color);
      color: #fff;
      border-radius: 30rpx;
      font-size: 24rpx;
    }
  }
}
</style> 