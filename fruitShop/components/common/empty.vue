<template>
  <view class="empty">
    <image :src="image" mode="aspectFit" />
    <text>{{ text }}</text>
  </view>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '暂无数据'
  },
  image: {
    type: String,
    default: '/static/images/empty.png'
  }
})
</script>
