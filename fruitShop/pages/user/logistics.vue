<template>
  <view class="logistics-container">
    <!-- 物流基本信息 -->
    <view class="logistics-info">
      <view class="company">物流公司：{{ logisticsInfo.company }}</view>
      <view class="number">物流单号：{{ logisticsInfo.number }}</view>
    </view>

    <!-- 物流跟踪信息 -->
    <view class="logistics-timeline">
      <view 
        class="timeline-item"
        v-for="(item, index) in logisticsInfo.traces"
        :key="index"
      >
        <view class="time">{{ item.time }}</view>
        <view class="content">{{ item.content }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

const logisticsInfo = ref({
  company: '',
  number: '',
  traces: []
})

// 获取物流信息
const getLogisticsInfo = async () => {
  try {
    // 获取物流信息逻辑
  } catch (error) {
    console.error('获取物流信息失败：', error)
  }
}

onMounted(() => {
  getLogisticsInfo()
})
</script>

<style lang="scss">
.logistics-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding: 20rpx;

  .logistics-info {
    background-color: #fff;
    padding: 20rpx;
    border-radius: 10rpx;
    margin-bottom: 20rpx;
  }

  .logistics-timeline {
    background-color: #fff;
    padding: 20rpx;
    border-radius: 10rpx;

    .timeline-item {
      padding: 20rpx 0;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .time {
        font-size: 24rpx;
        color: #999;
      }

      .content {
        margin-top: 10rpx;
      }
    }
  }
}
</style> 