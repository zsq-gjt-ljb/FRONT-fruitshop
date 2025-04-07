<template>
  <view class="price-container">
    <!-- 现价 -->
    <text class="currency">¥</text>
    <text class="current-price">{{ price.toFixed(2) }}</text>
    
    <!-- 原价 -->
    <text v-if="originalPrice" class="original-price">
      ¥{{ originalPrice.toFixed(2) }}
    </text>
    
    <!-- 会员价 -->
    <view v-if="showMemberPrice && memberPrice" class="member-price">
      <text class="member-tag">会员价</text>
      <text class="currency">¥</text>
      <text>{{ memberPrice.toFixed(2) }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  memberPrice: {
    type: Number,
    default: 0
  },
  showMemberPrice: {
    type: Boolean,
    default: true
  }
})
</script>

<style lang="scss">
.price-container {
  display: flex;
  align-items: baseline;
  
  .currency {
    font-size: 24rpx;
    color: #ff4d4f;
  }
  
  .current-price {
    font-size: 36rpx;
    font-weight: bold;
    color: #ff4d4f;
  }
  
  .original-price {
    font-size: 24rpx;
    color: #999;
    text-decoration: line-through;
    margin-left: 12rpx;
  }
  
  .member-price {
    margin-left: 12rpx;
    display: flex;
    align-items: center;
    
    .member-tag {
      font-size: 20rpx;
      color: #ff9c00;
      background: rgba(255, 156, 0, 0.1);
      padding: 2rpx 8rpx;
      border-radius: 4rpx;
      margin-right: 4rpx;
    }
    
    .currency, text {
      font-size: 24rpx;
      color: #ff9c00;
    }
  }
}
</style>
