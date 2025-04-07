<template>
  <view class="member-info">
    <!-- 会员等级信息 -->
    <view class="member-header">
      <view class="level-info">
        <image class="avatar" :src="memberInfo.avatar" mode="aspectFill" />
        <view class="info">
          <text class="nickname">{{ memberInfo.nickname }}</text>
          <view class="level">
            <text class="level-tag">V{{ memberInfo.level }}</text>
            <text class="level-name">{{ levelName }}</text>
          </view>
        </view>
      </view>
      <view class="discount-info">
        <text class="discount">{{ memberInfo.discount }}折</text>
        <text class="label">会员折扣</text>
      </view>
    </view>

    <!-- 会员权益 -->
    <view class="member-benefits">
      <view class="benefit-title">会员权益</view>
      <view class="benefit-list">
        <view 
          class="benefit-item"
          v-for="(benefit, index) in benefits"
          :key="index"
        >
          <image :src="benefit.icon" mode="aspectFit" />
          <text>{{ benefit.name }}</text>
        </view>
      </view>
    </view>

    <!-- 会员进度 -->
    <view class="level-progress" v-if="showProgress">
      <view class="progress-info">
        <text>当前成长值</text>
        <text>{{ memberInfo.points }}/{{ nextLevelPoints }}</text>
      </view>
      <progress 
        :percent="progressPercent"
        stroke-width="4"
        color="var(--primary-color)"
        backgroundColor="#eee"
      />
      <text class="progress-tip">
        还差{{ remainingPoints }}成长值升级到V{{ memberInfo.level + 1 }}
      </text>
    </view>

    <!-- 会员卡片背景 -->
    <image class="card-bg" src="/static/images/member-card-bg.png" mode="aspectFill" />
  </view>
</template>

<script setup>
import { computed } from 'vue'

// 会员等级配置
const MEMBER_LEVELS = {
  1: { name: '普通会员', nextLevelPoints: 1000 },
  2: { name: '白银会员', nextLevelPoints: 3000 },
  3: { name: '黄金会员', nextLevelPoints: null }
}

// 定义props
const props = defineProps({
  memberInfo: {
    type: Object,
    required: true,
    default: () => ({
      nickname: '',
      avatar: '',
      level: 1,
      points: 0,
      discount: 1
    })
  }
})

// 会员等级名称
const levelName = computed(() => {
  return MEMBER_LEVELS[props.memberInfo.level]?.name || '普通会员'
})

// 是否显示进度条（最高等级不显示）
const showProgress = computed(() => {
  return MEMBER_LEVELS[props.memberInfo.level]?.nextLevelPoints !== null
})

// 下一级所需积分
const nextLevelPoints = computed(() => {
  return MEMBER_LEVELS[props.memberInfo.level]?.nextLevelPoints || 0
})

// 距离下一级还需要的积分
const remainingPoints = computed(() => {
  if (!showProgress.value) return 0
  return nextLevelPoints.value - props.memberInfo.points
})

// 进度条百分比
const progressPercent = computed(() => {
  if (!showProgress.value) return 100
  return (props.memberInfo.points / nextLevelPoints.value) * 100
})

// 会员权益列表
const benefits = [
  {
    icon: '/static/images/benefit-discount.png',
    name: '专属折扣'
  },
  {
    icon: '/static/images/benefit-birthday.png',
    name: '生日特权'
  },
  {
    icon: '/static/images/benefit-points.png',
    name: '积分加倍'
  },
  {
    icon: '/static/images/benefit-priority.png',
    name: '优先发货'
  }
]
</script>

<style lang="scss">
.member-info {
  position: relative;
  background: linear-gradient(135deg, #4a90e2 0%, #2c5282 100%);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin: 20rpx;
  color: #fff;
  overflow: hidden;

  .member-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;
    position: relative;
    z-index: 1;

    .level-info {
      display: flex;
      align-items: center;

      .avatar {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
        border: 4rpx solid rgba(255, 255, 255, 0.3);
      }

      .info {
        margin-left: 20rpx;

        .nickname {
          font-size: 32rpx;
          font-weight: bold;
          margin-bottom: 8rpx;
        }

        .level {
          display: flex;
          align-items: center;

          .level-tag {
            background: rgba(255, 255, 255, 0.2);
            padding: 4rpx 12rpx;
            border-radius: 20rpx;
            font-size: 20rpx;
            margin-right: 10rpx;
          }

          .level-name {
            font-size: 24rpx;
          }
        }
      }
    }

    .discount-info {
      text-align: right;

      .discount {
        font-size: 48rpx;
        font-weight: bold;
      }

      .label {
        font-size: 24rpx;
        opacity: 0.8;
      }
    }
  }

  .member-benefits {
    position: relative;
    z-index: 1;

    .benefit-title {
      font-size: 28rpx;
      margin-bottom: 20rpx;
    }

    .benefit-list {
      display: flex;
      justify-content: space-between;

      .benefit-item {
        text-align: center;

        image {
          width: 60rpx;
          height: 60rpx;
          margin-bottom: 10rpx;
        }

        text {
          font-size: 24rpx;
          opacity: 0.9;
        }
      }
    }
  }

  .level-progress {
    margin-top: 40rpx;
    position: relative;
    z-index: 1;

    .progress-info {
      display: flex;
      justify-content: space-between;
      font-size: 24rpx;
      margin-bottom: 10rpx;
    }

    progress {
      width: 100%;
      border-radius: 4rpx;
    }

    .progress-tip {
      font-size: 22rpx;
      opacity: 0.8;
      margin-top: 10rpx;
    }
  }

  .card-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    opacity: 0.1;
  }
}
</style> 