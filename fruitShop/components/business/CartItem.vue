<template>
  <view class="cart-item">
    <!-- 选择框 -->
    <view class="checkbox-wrapper" @tap="toggleSelect">
      <view :class="['checkbox', { 'checked': selected }]">
        <text v-if="selected" class="iconfont icon-check"></text>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="item-content">
      <!-- 商品图片 -->
      <image 
        class="goods-image" 
        :src="item.image" 
        mode="aspectFill"
        @tap="goToDetail"
      />

      <!-- 商品详情 -->
      <view class="goods-info">
        <view class="goods-name" @tap="goToDetail">{{ item.name }}</view>
        
        <!-- 商品规格 -->
        <view v-if="item.spec" class="goods-spec">
          规格：{{ item.spec }}
        </view>

        <!-- 价格和数量控制 -->
        <view class="price-quantity">
          <!-- 价格信息 -->
          <view class="price-info">
            <Price 
              :price="item.price"
              :memberPrice="item.memberPrice"
              :showMemberPrice="true"
            />
          </view>

          <!-- 数量控制器 -->
          <view class="quantity-control">
            <view 
              class="control-btn minus"
              :class="{ 'disabled': quantity <= 1 }"
              @tap="updateQuantity('decrease')"
            >-</view>
            <input 
              type="number"
              class="quantity-input"
              :value="quantity"
              @input="onQuantityInput"
              @blur="onQuantityBlur"
            />
            <view 
              class="control-btn plus"
              :class="{ 'disabled': quantity >= item.stock }"
              @tap="updateQuantity('increase')"
            >+</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import Price from '@/components/common/Price.vue'

// 定义props
const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      name: '',
      image: '',
      price: 0,
      memberPrice: 0,
      spec: '',
      stock: 999,
      quantity: 1
    })
  },
  selected: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits([
  'update:selected',    // 更新选中状态
  'update:quantity',    // 更新数量
  'delete'             // 删除商品
])

// 商品数量
const quantity = ref(props.item.quantity)

// 监听数量变化
watch(quantity, (newVal) => {
  emit('update:quantity', {
    id: props.item.id,
    quantity: newVal
  })
})

// 切换选中状态
const toggleSelect = () => {
  emit('update:selected', !props.selected)
}

// 更新数量
const updateQuantity = (type) => {
  if (type === 'decrease' && quantity.value > 1) {
    quantity.value--
  } else if (type === 'increase' && quantity.value < props.item.stock) {
    quantity.value++
  }
}

// 输入数量
const onQuantityInput = (e) => {
  let val = parseInt(e.detail.value)
  if (isNaN(val)) val = 1
  if (val < 1) val = 1
  if (val > props.item.stock) val = props.item.stock
  quantity.value = val
}

// 输入框失焦
const onQuantityBlur = () => {
  // 确保数量在有效范围内
  if (quantity.value < 1) quantity.value = 1
  if (quantity.value > props.item.stock) quantity.value = props.item.stock
}

// 跳转到商品详情
const goToDetail = () => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${props.item.id}`
  })
}
</script>

<style lang="scss">
.cart-item {
  display: flex;
  padding: 20rpx;
  background-color: #fff;
  margin-bottom: 2rpx;

  .checkbox-wrapper {
    display: flex;
    align-items: center;
    padding: 0 20rpx;

    .checkbox {
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      border: 2rpx solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;

      &.checked {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
        
        .icon-check {
          color: #fff;
          font-size: 24rpx;
        }
      }
    }
  }

  .item-content {
    flex: 1;
    display: flex;

    .goods-image {
      width: 180rpx;
      height: 180rpx;
      border-radius: 8rpx;
      margin-right: 20rpx;
    }

    .goods-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .goods-name {
        font-size: 28rpx;
        color: #333;
        line-height: 1.4;
        margin-bottom: 10rpx;
      }

      .goods-spec {
        font-size: 24rpx;
        color: #999;
        margin-bottom: 20rpx;
      }

      .price-quantity {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;

        .quantity-control {
          display: flex;
          align-items: center;
          
          .control-btn {
            width: 60rpx;
            height: 60rpx;
            border: 2rpx solid #eee;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28rpx;
            color: #333;

            &.disabled {
              color: #ccc;
              background-color: #f5f5f5;
            }

            &.minus {
              border-radius: 30rpx 0 0 30rpx;
            }

            &.plus {
              border-radius: 0 30rpx 30rpx 0;
            }
          }

          .quantity-input {
            width: 80rpx;
            height: 60rpx;
            text-align: center;
            border-top: 2rpx solid #eee;
            border-bottom: 2rpx solid #eee;
            font-size: 28rpx;
          }
        }
      }
    }
  }
}
</style> 