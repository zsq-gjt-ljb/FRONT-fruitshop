<template>
  <view 
    class="address-card"
    :class="{ 'is-selected': selected }"
    @tap="handleClick"
  >
    <!-- 地址信息 -->
    <view class="address-info">
      <!-- 联系人信息 -->
      <view class="contact-info">
        <text class="name">{{ address.name }}</text>
        <text class="phone">{{ address.phone }}</text>
        <text v-if="address.isDefault" class="default-tag">默认</text>
      </view>
      
      <!-- 详细地址 -->
      <view class="address-detail">
        <text v-if="address.tag" class="address-tag">{{ address.tag }}</text>
        <text class="detail">
          {{ fullAddress }}
        </text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions" @tap.stop>
      <view class="action-item edit" @tap="handleEdit">
        <text class="iconfont icon-edit"></text>
        <text>编辑</text>
      </view>
      <view class="action-item delete" @tap="handleDelete">
        <text class="iconfont icon-delete"></text>
        <text>删除</text>
      </view>
    </view>

    <!-- 选择标记 -->
    <view v-if="selectable" class="select-mark">
      <radio :checked="selected" color="var(--primary-color)" />
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

// 定义props
const props = defineProps({
  // 地址信息对象
  address: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false,
      tag: '' // 地址标签，如"家"、"公司"
    })
  },
  // 是否可选择（在选择收货地址时使用）
  selectable: {
    type: Boolean,
    default: false
  },
  // 是否被选中
  selected: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['click', 'edit', 'delete'])

// 计算完整地址
const fullAddress = computed(() => {
  const { province, city, district, detail } = props.address
  return `${province}${city}${district}${detail}`
})

// 点击整个地址卡片
const handleClick = () => {
  emit('click', props.address)
}

// 编辑地址
const handleEdit = () => {
  emit('edit', props.address)
}

// 删除地址
const handleDelete = () => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这个地址吗？',
    success: (res) => {
      if (res.confirm) {
        emit('delete', props.address)
      }
    }
  })
}
</script>

<style lang="scss">
.address-card {
  position: relative;
  background-color: #fff;
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 12rpx;
  
  &.is-selected {
    background-color: var(--secondary-color);
  }

  .address-info {
    padding-right: 80rpx; // 为选择标记预留空间
    
    .contact-info {
      margin-bottom: 16rpx;
      
      .name {
        font-size: 32rpx;
        font-weight: bold;
        margin-right: 20rpx;
      }
      
      .phone {
        font-size: 28rpx;
        color: #666;
      }
      
      .default-tag {
        display: inline-block;
        font-size: 20rpx;
        color: var(--primary-color);
        border: 1rpx solid var(--primary-color);
        padding: 2rpx 10rpx;
        border-radius: 4rpx;
        margin-left: 16rpx;
      }
    }
    
    .address-detail {
      font-size: 28rpx;
      color: #333;
      
      .address-tag {
        display: inline-block;
        font-size: 22rpx;
        color: #666;
        background-color: #f5f5f5;
        padding: 4rpx 12rpx;
        border-radius: 4rpx;
        margin-right: 12rpx;
      }
      
      .detail {
        line-height: 1.4;
      }
    }
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #eee;
    
    .action-item {
      display: flex;
      align-items: center;
      padding: 0 20rpx;
      font-size: 24rpx;
      color: #666;
      
      &.edit {
        margin-right: 30rpx;
      }
      
      .iconfont {
        font-size: 28rpx;
        margin-right: 6rpx;
      }
    }
  }

  .select-mark {
    position: absolute;
    right: 30rpx;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style> 