<template>
  <view :class="['customer-service', isFloat ? 'float' : '']" :style="customStyle">
    <button 
      open-type="contact" 
      @contact="handleContact" 
      class="service-button"
      session-from="weapp"
      hover-class="button-hover"
    >
      <view class="service-content">
        <image 
          v-if="icon" 
          :src="icon" 
          class="service-icon" 
          mode="aspectFit"
        ></image>
        <text class="service-text" v-if="type !== 'icon-only'">{{ text }}</text>
      </view>
    </button>
  </view>
</template>

<script>
export default {
  name: 'CustomerService',
  props: {
    // 客服类型：normal, primary, icon-only, custom
    type: {
      type: String,
      default: 'normal'
    },
    // 客服文本
    text: {
      type: String,
      default: '联系客服'
    },
    // 客服图标
    icon: {
      type: String,
      default: '/static/images/customer-service.png'
    },
    // 是否为悬浮按钮
    isFloat: {
      type: Boolean,
      default: false
    },
    // 自定义样式
    customStyle: {
      type: String,
      default: ''
    },
    // 企业微信ID (可选)
    corpId: {
      type: String,
      default: ''
    },
    // 客服ID (可选)
    customerId: {
      type: String,
      default: ''
    },
    // 客服名称 (可选)
    customerName: {
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
.customer-service {
  .service-button {
    background-color: transparent;
    border: none;
    margin: 0;
    padding: 0;
    line-height: 1;
    
    &::after {
      border: none;
    }
    
    &.button-hover {
      opacity: 0.8;
    }
  }
  
  .service-content {
    display: flex;
    align-items: center;
    justify-content: center;
    
    .service-icon {
      width: 40rpx;
      height: 40rpx;
      margin-right: 10rpx;
    }
    
    .service-text {
      font-size: 28rpx;
      color: #333;
    }
  }
  
  // 基础样式
  &:not(.float) {
    .service-button {
      padding: 16rpx 30rpx;
      border-radius: 8rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      // 普通样式
      &.normal {
        background-color: #F8F8F8;
        border: 1rpx solid #E0E0E0;
        
        .service-text {
          color: #333;
        }
      }
      
      // 主要样式
      &.primary {
        background-color: #3B78DB;
        
        .service-text {
          color: #FFF;
        }
      }
      
      // 仅图标
      &.icon-only {
        padding: 16rpx;
        .service-icon {
          margin-right: 0;
        }
      }
      
      // 自定义样式
      &.custom {
        // 自定义样式通过customStyle控制
      }
    }
  }
  
  // 悬浮样式
  &.float {
    position: fixed;
    right: 30rpx;
    bottom: 120rpx;
    z-index: 100;
    
    .service-button {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      background-color: #FFFFFF;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      
      .service-content {
        flex-direction: column;
        
        .service-icon {
          width: 50rpx;
          height: 50rpx;
          margin-right: 0;
          margin-bottom: 6rpx;
        }
        
        .service-text {
          font-size: 20rpx;
          line-height: 1;
        }
      }
    }
  }
}
</style> 