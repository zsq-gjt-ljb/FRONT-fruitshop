<template>
  <view class="customer-service-container">
    <!-- 常规客服按钮-使用微信内置客服功能 -->
    <button 
      v-if="type === 'official'" 
      open-type="contact" 
      class="customer-service-btn"
      :class="[position, {'float-btn': isFloat}]"
      show-message-card="true"
      :send-message-title="title"
      :send-message-path="path"
      :send-message-img="img"
    >
      <image class="icon" :src="icon || '/static/icons/customer-service.png'" mode="aspectFit" />
      <text v-if="showText" class="text">{{ text || '联系客服' }}</text>
    </button>
    
    <!-- 自定义客服按钮-跳转到指定的微信号 -->
    <view 
      v-else 
      class="customer-service-btn"
      :class="[position, {'float-btn': isFloat}]"
      @tap="openCustomerChat"
    >
      <image class="icon" :src="icon || '/static/icons/customer-service.png'" mode="aspectFit" />
      <text v-if="showText" class="text">{{ text || '联系客服' }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue'

// 定义组件属性
const props = defineProps({
  // 客服类型: official(官方客服) 或 custom(自定义客服)
  type: {
    type: String,
    default: 'official'
  },
  // 自定义微信客服的CORPID (企业ID)
  corpId: {
    type: String,
    default: ''
  },
  // 客服微信号
  customerId: {
    type: String,
    default: ''
  },
  // 客服名字
  customerName: {
    type: String,
    default: '客服'
  },
  // 图标路径
  icon: {
    type: String,
    default: ''
  },
  // 显示文本
  text: {
    type: String,
    default: '联系客服'
  },
  // 是否显示文本
  showText: {
    type: Boolean,
    default: true
  },
  // 位置: center, left, right
  position: {
    type: String,
    default: 'center'
  },
  // 是否为悬浮按钮
  isFloat: {
    type: Boolean,
    default: false
  },
  // 消息卡片标题 (官方客服时使用)
  title: {
    type: String,
    default: '水果商店 - 在线客服'
  },
  // 消息卡片跳转小程序路径 (官方客服时使用)
  path: {
    type: String,
    default: '/pages/index/index'
  },
  // 消息卡片图片 (官方客服时使用)
  img: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['success', 'error'])

// 打开自定义客服聊天
const openCustomerChat = () => {
  if (props.type !== 'custom') return
  
  if (!props.corpId || !props.customerId) {
    console.error('缺少必要的客服信息: corpId 或 customerId')
    uni.showToast({
      title: '客服信息配置错误',
      icon: 'none'
    })
    emit('error', { message: '缺少必要的客服信息' })
    return
  }
  
  // 调用微信API打开客服会话窗口
  uni.openCustomerServiceChat({
    extInfo: { url: '' },
    corpId: props.corpId,
    customerId: props.customerId,
    success(res) {
      console.log('打开客服会话成功', res)
      emit('success', res)
    },
    fail(err) {
      console.error('打开客服会话失败', err)
      // 失败时尝试复制微信号
      uni.setClipboardData({
        data: props.customerId,
        success: () => {
          uni.showModal({
            title: '提示',
            content: `客服微信号(${props.customerId})已复制到剪贴板，请打开微信添加`,
            showCancel: false
          })
        }
      })
      emit('error', err)
    }
  })
}
</script>

<style lang="scss">
.customer-service-container {
  .customer-service-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent; // 去掉按钮默认样式
    padding: 0;
    margin: 0;
    border: none;
    outline: none;
    border-radius: 0;
    line-height: normal;
    
    &::after {
      display: none; // 去掉按钮默认边框
    }
    
    &.center {
      justify-content: center;
    }
    
    &.left {
      justify-content: flex-start;
    }
    
    &.right {
      justify-content: flex-end;
    }
    
    &.float-btn {
      position: fixed;
      right: 20rpx;
      bottom: 200rpx;
      z-index: 99;
      background-color: #ffffff;
      border-radius: 50%;
      width: 100rpx;
      height: 100rpx;
      box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.1);
      flex-direction: column;
      
      .icon {
        width: 50rpx;
        height: 50rpx;
      }
      
      .text {
        font-size: 20rpx;
        margin-top: 6rpx;
      }
    }
    
    .icon {
      width: 40rpx;
      height: 40rpx;
      margin-right: 10rpx;
    }
    
    .text {
      font-size: 28rpx;
      color: #333333;
    }
  }
}
</style> 