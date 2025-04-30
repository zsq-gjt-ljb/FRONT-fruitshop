<template>
  <view class="cart-container">
    <!-- 空购物车状态 -->
    <view class="empty-cart" v-if="cartList.length === 0">
      <view class="empty-icon">
        <uni-icons type="cart" size="64" color="#ddd"></uni-icons>
      </view>
      <text class="empty-text">购物车还是空的</text>
      <view class="go-shopping" @tap="goToHome">浏览商品</view>
    </view>
    
    <!-- 购物车列表 -->
    <view class="cart-content" v-else>
      <!-- 标题栏 -->
      <view class="cart-header">
        <text class="cart-title">我的购物车</text>
        <text class="cart-subtitle">{{ cartList.length }}件商品</text>
      </view>
      
      <!-- 商品列表 -->
      <view class="product-list">
        <view 
          class="product-card" 
          v-for="(item, index) in cartList" 
          :key="item.id"
        >
          <!-- 选择框 -->
          <view class="select-area" @tap="toggleSelectItem(item)">
            <view class="checkbox" :class="{'checked': item.selected}">
              <uni-icons type="checkmarkempty" size="14" color="#fff" v-if="item.selected"></uni-icons>
            </view>
          </view>
          
          <!-- 商品信息 -->
          <view class="product-content" @tap="goToDetail(item.productId)">
            <image class="product-image" :src="item.productImage || '/static/images/product-default.png'" mode="aspectFill"></image>
            
            <view class="product-info">
              <view class="product-name">{{ item.productName }}</view>
              <view class="product-spec" v-if="item.spec">{{ item.spec }}</view>
              <view class="product-price">¥{{ item.price }}</view>
              
              <!-- 数量调整 -->
              <view class="quantity-control">
                <view 
                  class="quantity-btn minus" 
                  :class="{ disabled: item.quantity <= 1 }"
                  @tap.stop="decreaseQuantity(item)"
                >
                  <uni-icons type="minus" size="12" :color="item.quantity <= 1 ? '#ccc' : '#333'"></uni-icons>
                </view>
                
                <input 
                  type="number" 
                  class="quantity-input" 
                  v-model.number="item.quantity" 
                  @blur="updateCartItem(item)"
                  @tap.stop
                />
                
                <view 
                  class="quantity-btn plus" 
                  :class="{ disabled: item.quantity >= item.stock }"
                  @tap.stop="increaseQuantity(item)"
                >
                  <uni-icons type="plus" size="12" :color="item.quantity >= item.stock ? '#ccc' : '#333'"></uni-icons>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 删除按钮 -->
          <view class="delete-btn" @tap.stop="deleteCartItem(item)">
            <uni-icons type="trash" size="18" color="#fff"></uni-icons>
          </view>
        </view>
      </view>
      
  
    </view>
    
    <!-- 底部结算栏 -->
    <view class="cart-footer" v-if="cartList.length > 0">
      <view class="select-all" @tap="toggleSelectAll">
        <view class="checkbox" :class="{'checked': isAllSelected}">
          <uni-icons type="checkmarkempty" size="14" color="#fff" v-if="isAllSelected"></uni-icons>
        </view>
        <text>全选</text>
      </view>
      
      <view class="price-section">
        <text class="price-label">合计:</text>
        <text class="price-value">¥{{ totalPrice.toFixed(2) }}</text>
      </view>
      
      <view class="checkout-btn" :class="{'active': selectedCount > 0}" @tap="handleCheckout">
        结算 <text v-if="selectedCount">({{ selectedCount }})</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad, onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import request from '@/utils/request'

// 响应式数据
const cartList = ref([])
const isLoading = ref(false)

// 计算属性
const isAllSelected = computed(() => {
  if (cartList.value.length === 0) return false
  return cartList.value.every(item => item.selected)
})

const selectedCount = computed(() => {
  return cartList.value.filter(item => item.selected).length
})

const totalPrice = computed(() => {
  return cartList.value
    .filter(item => item.selected)
    .reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity)
    }, 0)
})

// 获取整数部分
const totalPriceInteger = computed(() => {
  return Math.floor(totalPrice.value)
})

// 获取小数部分
const totalPriceDecimal = computed(() => {
  const decimal = Math.round((totalPrice.value - Math.floor(totalPrice.value)) * 100)
  return decimal < 10 ? `0${decimal}` : decimal
})

// 获取购物车数据
const getCartList = async () => {
  try {
    isLoading.value = true
    uni.showLoading({ title: '加载中' })
    
    const result = await request({
      url: 'https://bgnc.online/api/cart/list',
      method: 'GET'
    })
    
    console.log('购物车API返回:', result)
    
    if (result.code === 200) {
      // 处理返回的数据并合并相同商品
      const mergedCartMap = {}
      
      // 将数据首先转换为我们需要的格式
      const processedData = (result.data || []).map(item => ({
        id: item.id,
        productId: item.productId,
        skuId: item.skuId,
        productName: item.productName || '未命名商品',
        productImage: item.productPic || '/static/images/product-default.png',
        price: item.price || '0',
        quantity: item.quantity || 1,
        stock: item.stock || 999,
        spec: item.spec || '',
        selected: true, // 默认选中
        originalIds: [item.id] // 保存原始ID列表，用于后续更新和删除
      }))
      
      // 合并相同商品和规格的项
      processedData.forEach(item => {
        // 使用商品ID和规格ID作为唯一标识
        const key = `${item.productId}-${item.skuId}`
        
        if (mergedCartMap[key]) {
          // 如果已存在相同商品和规格，合并数量和ID列表
          mergedCartMap[key].quantity += item.quantity
          mergedCartMap[key].originalIds.push(item.id)
        } else {
          // 否则，将此项添加到Map中
          mergedCartMap[key] = item
        }
      })
      
      // 将合并后的Map转换回数组
      cartList.value = Object.values(mergedCartMap)
      
      console.log('处理后的购物车数据:', cartList.value)
    } else {
      uni.showToast({
        title: result.message || '获取购物车失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取购物车出错:', error)
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
    uni.hideLoading()
    uni.stopPullDownRefresh()
  }
}

// 切换选择状态  
const toggleSelectItem = (item) => {
  item.selected = !item.selected
}

// 全选/取消全选
const toggleSelectAll = () => {
  const newState = !isAllSelected.value
  cartList.value.forEach(item => {
    item.selected = newState
  })
}

// 减少商品数量
const decreaseQuantity = async (item) => {
  if (item.quantity <= 1) return
  
  try {
    // 先乐观更新UI
    item.quantity--
    
    // 获取第一个原始ID进行更新
    const updateId = item.originalIds[0]
    
    // 调用后端API更新数量
    const result = await request({
      url: 'https://bgnc.online/api/cart/update',
      method: 'PUT',
      data: {
        id: updateId,
        quantity: item.quantity
      }
    })
    
    if (result.code !== 200) {
      // 更新失败，恢复原数量
      item.quantity++
      uni.showToast({
        title: result.message || '更新失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('减少数量失败:', error)
    // 更新失败，恢复原数量
    item.quantity++
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    })
  }
}

// 增加商品数量
const increaseQuantity = async (item) => {
  if (item.quantity >= item.stock) {
    uni.showToast({
      title: '已达最大库存',
      icon: 'none'
    })
    return
  }
  
  try {
    // 先乐观更新UI
    item.quantity++
    
    // 获取第一个原始ID进行更新
    const updateId = item.originalIds[0]
    
    // 调用后端API更新数量
    const result = await request({
      url: 'https://bgnc.online/api/cart/update',
      method: 'PUT',
      data: {
        id: updateId,
        quantity: item.quantity
      }
    })
    
    if (result.code !== 200) {
      // 更新失败，恢复原数量
      item.quantity--
      uni.showToast({
        title: result.message || '更新失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('增加数量失败:', error)
    // 更新失败，恢复原数量
    item.quantity--
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    })
  }
}

// 修改数量更新函数
const updateCartItem = async (item) => {
  // 验证数量
  const oldQuantity = item.quantity
  
  if (isNaN(item.quantity) || item.quantity < 1) {
    item.quantity = 1
  } else if (item.quantity > item.stock) {
    item.quantity = item.stock
  }
  
  // 数量没变，不需要更新
  if (oldQuantity === item.quantity) return
  
  try {
    // 获取第一个原始ID进行更新
    const updateId = item.originalIds[0]
    
    // 调用后端API更新数量
    const result = await request({
      url: 'https://bgnc.online/api/cart/update',
      method: 'PUT',
      data: {
        id: updateId,
        quantity: item.quantity
      }
    })
    
    if (result.code !== 200) {
      uni.showToast({
        title: result.message || '更新失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('更新数量失败:', error)
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    })
  }
}

// 修改删除函数
const deleteCartItem = (item) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除此商品吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 删除第一个商品，其他的保留但数量为0
          const deleteId = item.originalIds[0]
          
          // 调用后端API删除商品
          const result = await request({
            url: `https://bgnc.online/api/cart/${deleteId}`,
            method: 'DELETE'
          })
          
          if (result.code === 200) {
            // 找到当前商品的索引
            const index = cartList.value.findIndex(cartItem => cartItem.originalIds.includes(deleteId))
            // 从数组中移除
            if (index !== -1) {
              cartList.value.splice(index, 1)
            }
            
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
          } else {
            uni.showToast({
              title: result.message || '删除失败',
              icon: 'none'
            })
          }
        } catch (error) {
          console.error('删除购物车商品失败:', error)
          uni.showToast({
            title: '网络错误，请稍后再试',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 结算
const handleCheckout = () => {
  // 检查是否有选中的商品
  const selectedItems = cartList.value.filter(item => item.selected)
  
  if (selectedItems.length === 0) {
    uni.showToast({
      title: '请选择要结算的商品',
      icon: 'none'
    })
    return
  }
  
  // 将选中的商品信息保存到本地存储
  const checkoutData = selectedItems.map(item => ({
    id: item.id,  // 保留购物车项ID，用于结算
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage,
    price: item.price,
    quantity: item.quantity,
    skuId: item.skuId || '',
    spec: item.spec || '',
    originalIds: item.originalIds || [item.id] // 保存原始ID列表
  }))
  
  uni.setStorageSync('checkoutItems', JSON.stringify(checkoutData))
  
  // 跳转到结算页面
  uni.navigateTo({
    url: '/pages/checkout/checkout'
  })
}

// 跳转到商品详情
const goToDetail = (productId) => {
  if (!productId) return
  
  uni.navigateTo({
    url: `/pages/detail/detail?id=${productId}`
  })
}

// 跳转到首页
const goToHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

// 页面显示时刷新数据
onShow(() => {
  getCartList()
})

// 下拉刷新
onPullDownRefresh(() => {
  getCartList()
})

// 页面加载
onLoad(() => {
  console.log('购物车页面加载')
})
</script>

<style lang="scss">
.cart-container {
  min-height: 80vh;
  background-color: #f8f8fa;
  padding-bottom: 140rpx; // 为底部结算栏留出空间
  
  // 空购物车状态
  .empty-cart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 30vh;
    
    .empty-icon {
      width: 200rpx;
      height: 200rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: #f0f0f3;
      margin-bottom: 40rpx;
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
    }
    
    .empty-text {
      font-size: 32rpx;
      color: #8e8e93;
      font-weight: 400;
      margin-bottom: 60rpx;
    }
    
    .go-shopping {
      width: 280rpx;
      height: 88rpx;
      background: linear-gradient(135deg, #4B91F1, #6FB1FF);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 44rpx;
      font-size: 30rpx;
      font-weight: 500;
      letter-spacing: 2rpx;
      box-shadow: 0 8rpx 20rpx rgba(75, 145, 241, 0.25);
      transition: transform 0.2s;
      
      &:active {
        transform: scale(0.96);
      }
    }
  }
  
  // 购物车内容
  .cart-content {
    padding: 24rpx;
    
    .cart-header {
      margin: 20rpx 10rpx 40rpx;
      
      .cart-title {
        font-size: 40rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 6rpx;
        display: block;
      }
      
      .cart-subtitle {
        font-size: 26rpx;
        color: #999;
      }
    }
  }
  
  // 商品列表
  .product-list {
    margin-bottom: 40rpx;
    
    .product-card {
      position: relative;
      display: flex;
      background-color: #fff;
      border-radius: 24rpx;
      margin-bottom: 24rpx;
      padding: 24rpx;
      box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.04);
      overflow: hidden;
      
      .select-area {
        display: flex;
        align-items: center;
        padding-right: 20rpx;
        
        .checkbox {
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
          border: 2rpx solid #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          
          &.checked {
            background: linear-gradient(135deg, #4B91F1, #6FB1FF);
            border-color: #4B91F1;
          }
        }
      }
      
      .product-content {
        flex: 1;
        display: flex;
        
        .product-image {
          width: 180rpx;
          height: 180rpx;
          border-radius: 16rpx;
          background-color: #f5f5f7;
          border: 1px solid rgba(0,0,0,0.03);
        }
        
        .product-info {
          flex: 1;
          padding-left: 24rpx;
          position: relative;
          
          .product-name {
            font-size: 30rpx;
            color: #333;
            font-weight: 500;
            margin-bottom: 12rpx;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            line-height: 1.4;
          }
          
          .product-spec {
            display: inline-block;
            font-size: 24rpx;
            color: #999;
            background-color: #f8f8fa;
            padding: 4rpx 12rpx;
            border-radius: 8rpx;
            margin-bottom: 16rpx;
          }
          
          .product-price {
            font-size: 34rpx;
            color: #4B91F1;
            font-weight: 600;
            margin-top: 16rpx;
          }
          
          .quantity-control {
            position: absolute;
            bottom: 0;
            right: 0;
            display: flex;
            align-items: center;
            height: 60rpx;
            background-color: #f8f8fa;
            border-radius: 30rpx;
            overflow: hidden;
            box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
            
            .quantity-btn {
              width: 60rpx;
              height: 60rpx;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: background-color 0.2s;
              
              &:active {
                background-color: #eee;
              }
              
              &.disabled {
                opacity: 0.5;
              }
            }
            
            .quantity-input {
              width: 80rpx;
              height: 60rpx;
              text-align: center;
              font-size: 28rpx;
              color: #333;
              background-color: transparent;
            }
          }
        }
      }
      
      .delete-btn {
        position: absolute;
        top: 16rpx;
        right: 16rpx;
        width: 48rpx;
        height: 48rpx;
        border-radius: 24rpx;
        background: linear-gradient(to right, #ff6b6b, #ff8787);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.2);
      }
    }
  }
  
  // 推荐部分
  .recommendations {
    background-color: #fff;
    border-radius: 24rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.04);
    
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 30rpx;
      position: relative;
      
      &::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: -10rpx;
        width: 60rpx;
        height: 6rpx;
        background: linear-gradient(135deg, #4B91F1, #6FB1FF);
        border-radius: 3rpx;
      }
    }
    
    .empty-recommends {
      height: 160rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      text {
        font-size: 28rpx;
        color: #999;
      }
    }
  }
  
  // 底部结算栏
  .cart-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 120rpx;
    background-color: #fff;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.06);
    z-index: 100;
    
    .select-all {
      display: flex;
      align-items: center;
      
      .checkbox {
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        border: 2rpx solid #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16rpx;
        transition: all 0.2s;
        
        &.checked {
          background: linear-gradient(135deg, #4B91F1, #6FB1FF);
          border-color: #4B91F1;
        }
      }
      
      text {
        font-size: 28rpx;
        color: #333;
      }
    }
    
    .price-section {
      flex: 1;
      display: flex;
      align-items: baseline;
      justify-content: flex-end;
      padding: 0 30rpx;
      
      .price-label {
        font-size: 28rpx;
        color: #666;
        margin-right: 10rpx;
      }
      
      .price-value {
        font-size: 38rpx;
        font-weight: 600;
        color: #4B91F1;
      }
    }
    
    .checkout-btn {
      min-width: 220rpx;
      height: 80rpx;
      background: linear-gradient(to right, #E0E0E0, #CCCCCC);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 40rpx;
      font-size: 30rpx;
      font-weight: 600;
      letter-spacing: 2rpx;
      transition: all 0.3s;
      
      &.active {
        background: linear-gradient(135deg, #4B91F1, #6FB1FF);
        box-shadow: 0 6rpx 16rpx rgba(75, 145, 241, 0.25);
      }
    }
  }
}
</style> 