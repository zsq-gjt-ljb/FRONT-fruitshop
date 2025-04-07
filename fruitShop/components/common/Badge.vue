<template>
  <view class="badge-wrapper">
    <slot></slot>
    <view 
      v-if="show"
      :class="['badge', type, { 'is-dot': isDot }]"
    >
      <text v-if="!isDot">{{ content }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: [String, Number],
    default: ''
  },
  max: {
    type: Number,
    default: 99
  },
  isDot: {
    type: Boolean,
    default: false
  },
  hidden: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'danger',
    validator: (value) => {
      return ['primary', 'success', 'warning', 'danger'].includes(value)
    }
  }
})

// 计算是否显示徽标
const show = computed(() => {
  return !props.hidden && (props.value || props.isDot)
})

// 计算显示的内容
const content = computed(() => {
  if (props.isDot) return ''
  
  const value = Number(props.value)
  if (isNaN(value)) return props.value
  
  return value > props.max ? `${props.max}+` : value
})
</script>

<style lang="scss">
.badge-wrapper {
  position: relative;
  display: inline-block;
  
  .badge {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    transform: translateX(50%);
    height: 32rpx;
    padding: 0 10rpx;
    color: #fff;
    font-size: 20rpx;
    line-height: 32rpx;
    text-align: center;
    border-radius: 16rpx;
    white-space: nowrap;
    z-index: 10;
    
    &.is-dot {
      width: 16rpx;
      height: 16rpx;
      padding: 0;
      right: -4rpx;
      border-radius: 50%;
    }
    
    &.primary {
      background-color: var(--primary-color);
    }
    
    &.success {
      background-color: #67c23a;
    }
    
    &.warning {
      background-color: #e6a23c;
    }
    
    &.danger {
      background-color: #ff4d4f;
    }
  }
}
</style> 