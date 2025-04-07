<template>
  <view class="contact-button-container">
    <button 
      open-type="contact" 
      @contact="handleContact" 
      :class="['contact-button', type]"
      :style="customStyle"
    >
      <view v-if="type === 'icon'" class="icon-only">
        <image src="/static/images/customer-service.png" mode="aspectFit" class="icon-img" />
      </view>
      <view v-else class="button-content">
        <image src="/static/images/customer-service.png" mode="aspectFit" class="icon-img" v-if="showIcon" />
        <text>{{ text }}</text>
      </view>
    </button>
  </view>
</template>

<script>
export default {
  name: 'ContactButton',
  props: {
    // 按钮类型：primary, default, icon
    type: {
      type: String,
      default: 'primary'
    },
    // 按钮文本
    text: {
      type: String,
      default: '联系客服'
    },
    // 是否显示图标
    showIcon: {
      type: Boolean,
      default: true
    },
    // 自定义样式
    customStyle: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleContact(e) {
      console.log('联系客服事件触发：', e.detail);
      this.$emit('contact', e.detail);
    }
  }
}
</script>

<style lang="scss">
.contact-button-container {
  .contact-button {
    border: none;
    background-color: transparent;
    padding: 0;
    margin: 0;
    line-height: normal;
    box-sizing: border-box;
    
    &::after {
      border: none;
    }
    
    &.primary {
      background-color: #3b78db;
      color: #fff;
      font-size: 28rpx;
      border-radius: 40rpx;
      padding: 16rpx 32rpx;
      box-shadow: 0 4rpx 10rpx rgba(59, 120, 219, 0.2);
    }
    
    &.default {
      background-color: #fff;
      color: #333;
      font-size: 28rpx;
      border-radius: 40rpx;
      padding: 14rpx 30rpx;
      border: 1rpx solid #e8e8e8;
    }
    
    &.icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background-color: #fff;
      box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    
    .button-content {
      display: flex;
      align-items: center;
      justify-content: center;
      
      .icon-img {
        width: 36rpx;
        height: 36rpx;
        margin-right: 8rpx;
      }
    }
    
    .icon-only {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      
      .icon-img {
        width: 44rpx;
        height: 44rpx;
      }
    }
  }
}
</style> 