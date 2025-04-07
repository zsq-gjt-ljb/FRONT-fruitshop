<template>
    <view class="loading" v-if="show">
      <view class="loading-spinner"></view>
      <text class="loading-text">{{ text }}</text>
    </view>
  </template>
  
  <script setup>
  defineProps({
    show: Boolean,
    text: {
      type: String,
      default: '加载中...'
    }
  })
  </script>