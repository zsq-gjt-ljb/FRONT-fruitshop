<template>
  <view class="floating-contact" :style="{ bottom: bottom + 'rpx', right: right + 'rpx' }">
    <button 
      open-type="contact" 
      hover-class="btn-hover" 
      @contact="handleContact" 
      class="contact-btn"
    >
      <view class="contact-icon">
        <image src="/static/icons/service.png" mode="aspectFit" class="icon-image" />
      </view>
      <text class="contact-text" v-if="showText">{{ text }}</text>
    </button>
  </view>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FloatingContact',
  props: {
    // 底部距离
    bottom: {
      type: Number,
      default: 150
    },
    // 右侧距离
    right: {
      type: Number,
      default: 30
    },
    // 显示文本
    showText: {
      type: Boolean,
      default: false
    },
    // 按钮文本
    text: {
      type: String,
      default: '客服'
    }
  },
  methods: {
    handleContact(e) {
      console.log('联系客服事件触发：', e.detail);
      this.$emit('contact', e.detail);
    }
  }
})
</script>

<style lang="scss">
.floating-contact {
  position: fixed;
  z-index: 999;
  
  .contact-btn {
    background-color: #FFFFFF;
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
    line-height: 1;
    
    &::after {
      border: none;
    }
    
    &.btn-hover {
      opacity: 0.8;
      transform: scale(0.95);
    }
    
    .contact-icon {
      margin-bottom: 6rpx;
      
      .icon-image {
        width: 44rpx;
        height: 44rpx;
      }
    }
    
    .contact-text {
      font-size: 20rpx;
      color: #666;
      line-height: 1;
    }
  }
}
</style> 