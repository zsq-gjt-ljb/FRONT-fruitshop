<template>
  <view class="checkout-container">
    <!-- 地址信息 -->
    <view class="address-section" @tap="goToAddressList">
      <view class="address-content" v-if="selectedAddress">
        <view class="location-icon">
          <uni-icons type="location" size="22" color="#3b78db"></uni-icons>
        </view>
        <view class="address-info">
          <view class="contact-info">
            <text class="name">{{ selectedAddress.consignee }}</text>
            <text class="phone">{{ selectedAddress.phone }}</text>
          </view>
          <view class="address-detail">
            {{ selectedAddress.provinceName }}{{ selectedAddress.cityName }}{{ selectedAddress.districtName }} {{ selectedAddress.detail }}
          </view>
        </view>
        <view class="arrow-right">
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
      </view>
      <view class="no-address" v-else>
        <text>请添加收货地址</text>
        <view class="arrow-right">
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
      </view>
    </view>
    
    <!-- 店铺信息 -->
    <view class="store-section">
      <view class="store-header">
        <view class="store-icon">
          <uni-icons type="shop" size="18" color="#3b78db"></uni-icons>
        </view>
        <text class="store-name">南茶北果</text>
      </view>
      
      <!-- 商品列表 -->
      <view class="product-list">
        <view 
          class="product-item" 
          v-for="(item, index) in checkoutItems" 
          :key="index"
        >
          <image class="product-image" :src="item.productImage" mode="aspectFill"></image>
          <view class="product-info">
            <view class="product-name">{{ item.productName }}</view>
            <view class="product-spec" v-if="item.spec">{{ item.spec }}</view>
            <view class="price-qty">
              <text class="product-price">￥{{ item.price }}</text>
              <text class="product-quantity">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 配送方式 -->
    <view class="delivery-section">
      <view class="section-item">
        <text class="item-label">配送方式</text>
        <view class="item-value">
          <text>快递发货</text>
        </view>
      </view>
    </view>
    
    <!-- 价格计算 -->
    <view class="price-section">
      <view class="section-item">
        <text class="item-label">商品金额</text>
        <view class="item-value">
          <text class="price">￥{{ originalPrice.toFixed(2) }}</text>
        </view>
      </view>
      <view class="section-item">
        <text class="item-label">运费</text>
        <view class="item-value">
          <text class="price" v-if="shippingFee > 0">￥{{ shippingFee.toFixed(2) }}</text>
          <text class="free-shipping" v-else>免邮</text>
        </view>
      </view>
      <view class="section-item" v-if="discountAmount > 0">
        <text class="item-label">会员折扣<text class="discount-tag">{{ memberLevelText }}</text></text>
        <view class="item-value">
          <text class="discount">-￥{{ discountAmount.toFixed(2) }}</text>
        </view>
      </view>
    </view>
    
    <!-- 订单备注 -->
    <view class="remark-section">
      <text class="remark-label">订单备注</text>
      <input 
        class="remark-input" 
        v-model="remark" 
        placeholder="选填，请先和商家协商一致" 
        placeholder-class="placeholder"
      />
    </view>
    
    <!-- 底部提交栏 -->
    <view class="submit-bar">
      <view class="price-info">
        <text class="total-label">合计：</text>
        <text class="total-price">
          <text class="price-symbol">￥</text>
          <text class="price-value">{{ finalPrice.toFixed(2) }}</text>
        </text>
      </view>
      <view class="submit-btn" @tap="submitOrder">
        提交订单
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow, onLoad } from '@dcloudio/uni-app'
import request from '@/utils/request'

// 结算商品
const checkoutItems = ref([])
// 收货地址
const addressList = ref([])
const selectedAddress = ref(null)
// 备注
const remark = ref('')
// 运费
const shippingFee = ref(0)
// 会员等级
const memberLevel = ref('')
// 订单类型：buyNow(直接购买) 或 cart(购物车结算)
const orderType = ref('cart')

// 页面加载时获取参数
onLoad((options) => {
  console.log('结算页面参数:', options)
  if (options.type === 'buyNow') {
    orderType.value = 'buyNow'
  }
})

// 获取会员信息
const getMemberInfo = async () => {
  try {
    const result = await request({
      url: 'http://82.156.12.240:8080/api/user/profile',
      method: 'GET'
    })
    
    if (result.code === 200) {
      memberLevel.value = result.data.memberLevel || ''
      console.log('获取到的会员等级:', memberLevel.value, '类型:', typeof memberLevel.value)
    }
  } catch (error) {
    console.error('获取会员信息失败:', error)
  }
}

// 获取地址列表
const getAddressList = async () => {
  try {
    const result = await request({
      url: 'http://82.156.12.240:8080/api/addressbook/list',
      method: 'GET'
    })
    
    if (result.code === 200) {
      addressList.value = result.data || []
      console.log('获取到的地址列表:', JSON.stringify(addressList.value))
      
      // 获取用户选择的地址ID
      const selectedAddressId = uni.getStorageSync('selectedAddressId')
      console.log('已保存的选择地址ID:', selectedAddressId)
      
      if (selectedAddressId) {
        // 通过API获取地址详情
        try {
          const addressDetail = await request({
            url: `http://82.156.12.240:8080/api/addressbook/${selectedAddressId}`,
            method: 'GET'
          })
          
          if (addressDetail.code === 200 && addressDetail.data) {
            console.log('通过API获取的地址详情:', addressDetail.data)
            selectedAddress.value = addressDetail.data
            return
          } else {
            console.error('获取地址详情失败:', addressDetail.message)
          }
        } catch (error) {
          console.error('获取地址详情API错误:', error)
        }
      }
      
      // 如果有默认地址，选择默认地址
      const defaultAddress = addressList.value.find(address => address.isDefault)
      
      if (defaultAddress) {
        selectedAddress.value = defaultAddress
      } else if (addressList.value.length > 0) {
        // 没有默认地址，选择第一个
        selectedAddress.value = addressList.value[0]
      }
      
      console.log('最终选择的地址:', selectedAddress.value)
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
  }
}

// 读取结算数据
const loadCheckoutData = () => {
  try {
    const items = uni.getStorageSync('checkoutItems')
    if (items) {
      checkoutItems.value = JSON.parse(items)
    }
  } catch (error) {
    console.error('读取结算数据失败:', error)
  }
}

// 计算原始总价
const originalPrice = computed(() => {
  return checkoutItems.value.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity)
  }, 0)
})

// 计算折扣金额
const discountAmount = computed(() => {
  let discount = 0
  console.log('计算折扣时的会员等级:', memberLevel.value, '类型:', typeof memberLevel.value)
  
  switch (memberLevel.value) {
    case '1': case 1:
      discount = originalPrice.value * 0.01 // 99折 = 1%折扣
      break
    case '2': case 2:
      discount = originalPrice.value * 0.11 // 89折 = 11%折扣
      break
    case '3': case 3:
      discount = originalPrice.value * 0.14 // 86折 = 14%折扣
      break
    default:
      discount = 0
  }
  
  console.log('原始价格:', originalPrice.value, '折扣金额:', discount)
  // 确保折扣金额至少有0.01元，不然就不显示折扣区块
  if (discount > 0 && discount < 0.01) {
    discount = 0.01
  }
  
  return discount
})

// 计算最终价格
const finalPrice = computed(() => {
  // 设置固定运费8元
  shippingFee.value = 8.00;
  return originalPrice.value - discountAmount.value + shippingFee.value;
})

// 会员等级文本
const memberLevelText = computed(() => {
  const level = typeof memberLevel.value === 'string' ? memberLevel.value : String(memberLevel.value)
  
  switch (level) {
    case '1':
      return 'V1会员(99折)'
    case '2':
      return 'V2会员(89折)'
    case '3':
      return 'V3会员(86折)'
    default:
      return ''
  }
})

// 前往地址列表
const goToAddressList = () => {
  uni.navigateTo({
    url: '/pages/address/edit'
  })
}

// 提交订单
const submitOrder = async () => {
  if (!selectedAddress.value) {
    uni.showToast({
      title: '请选择收货地址',
      icon: 'none'
    })
    return
  }
  
  if (checkoutItems.value.length === 0) {
    uni.showToast({
      title: '订单中没有商品',
      icon: 'none'
    })
    return
  }
  
  try {
    uni.showLoading({
      title: '提交订单中...'
    })
    
    // 根据订单类型选择不同的API
    if (orderType.value === 'buyNow') {
      // 直接购买API
      const item = checkoutItems.value[0];
      
      // 计算会员折扣后的价格
      let price = parseFloat(item.price);
      if (discountAmount.value > 0) {
        // 应用折扣 - 计算折扣后单价
        const discountRate = 1 - (discountAmount.value / originalPrice.value);
        price = price * discountRate;
      }
      
      const buyData = {
        productId: item.productId,
        skuId: item.skuId || null,
        addressBookId: selectedAddress.value.id,
        quantity: item.quantity,
        // 将备注添加到请求中
        remark: remark.value
      }
      
      console.log('直接购买请求数据:', buyData)
      
      // 调用直接购买API
      const result = await request({
        url: 'http://82.156.12.240:8080/api/order/buyNow',
        method: 'POST',
        data: buyData
      })
      
      uni.hideLoading()
      
      if (result.code === 200) {
        handleOrderSuccess(result)
      } else {
        handleOrderFail(result)
      }
    } else {
      // 购物车结算
      // 获取购物车中选中商品的ID列表
      const cartIds = checkoutItems.value.map(item => {
        // 如果商品有originalIds(合并的购物车项)，使用第一个ID
        if (item.originalIds && item.originalIds.length > 0) {
          return item.originalIds[0];
        }
        // 否则使用商品自身的ID
        return item.id;
      });
      
      // 组装结算数据
      const settleData = {
        ids: cartIds,
        addressBookId: selectedAddress.value.id,
        remark: remark.value
      }
      
      console.log('结算请求数据:', settleData);
      
      // 发送创建订单请求
      const result = await request({
        url: 'http://82.156.12.240:8080/api/order/settle',
        method: 'POST',
        data: settleData
      })
      
      uni.hideLoading()
      
      if (result.code === 200) {
        handleOrderSuccess(result)
      } else {
        handleOrderFail(result)
      }
    }
  } catch (error) {
    uni.hideLoading()
    console.error('提交订单失败:', error)
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    })
  }
}

// 处理订单成功
const handleOrderSuccess = (result) => {
  // 清除结算数据
  uni.removeStorageSync('checkoutItems')
  
  // 提示成功
  uni.showToast({
    title: '订单提交成功',
    icon: 'success'
  })
  
  // 跳转到订单详情页或订单列表页
  setTimeout(() => {
    // 如果后端返回订单ID，跳转到订单详情
    if (result.data && result.data.orderId) {
      uni.redirectTo({
        url: `/pages/order/detail?id=${result.data.orderId}`
      })
    } else {
      // 否则跳转到订单列表
      uni.switchTab({
        url: '/pages/user/user'
      })
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/order/list'
        })
      }, 500)
    }
  }, 1500)
}

// 处理订单失败
const handleOrderFail = (result) => {
  uni.showToast({
    title: result.message || '订单提交失败',
    icon: 'none'
  })
}

// 监听页面显示
onShow(() => {
  loadCheckoutData()
  // 每次显示页面时重新获取地址列表和会员信息
  getAddressList()
  getMemberInfo()
})

// 页面加载
onMounted(() => {
  console.log('结算页面已加载')
  // 确保初始加载时也获取地址
  getAddressList()
})
</script>

<style lang="scss">
.checkout-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 120rpx;
  
  .address-section {
    background-color: #fff;
    margin-bottom: 20rpx;
    padding: 30rpx;
    
    .address-content {
      display: flex;
      align-items: flex-start;
      
      .location-icon {
        margin-right: 20rpx;
        margin-top: 6rpx;
      }
      
      .address-info {
        flex: 1;
        
        .contact-info {
          margin-bottom: 12rpx;
          
          .name {
            font-size: 32rpx;
            color: #333;
            font-weight: 500;
            margin-right: 20rpx;
          }
          
          .phone {
            font-size: 28rpx;
            color: #666;
          }
        }
        
        .address-detail {
          font-size: 28rpx;
          color: #333;
          line-height: 1.4;
        }
      }
    }
    
    .no-address {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 30rpx;
      color: #333;
    }
    
    .arrow-right {
      margin-left: 20rpx;
    }
  }
  
  .store-section {
    background-color: #fff;
    margin-bottom: 20rpx;
    
    .store-header {
      display: flex;
      align-items: center;
      padding: 24rpx 30rpx;
      border-bottom: 1rpx solid #f5f5f5;
      
      .store-icon {
        margin-right: 12rpx;
      }
      
      .store-name {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }
    }
    
    .product-list {
      .product-item {
        display: flex;
        padding: 30rpx;
        border-bottom: 1rpx solid #f5f5f5;
        
        &:last-child {
          border-bottom: none;
        }
        
        .product-image {
          width: 160rpx;
          height: 160rpx;
          border-radius: 8rpx;
          background-color: #f5f5f7;
        }
        
        .product-info {
          flex: 1;
          margin-left: 20rpx;
          display: flex;
          flex-direction: column;
          
          .product-name {
            font-size: 28rpx;
            color: #333;
            margin-bottom: 8rpx;
            line-height: 1.4;
          }
          
          .product-spec {
            font-size: 24rpx;
            color: #999;
            margin-bottom: 12rpx;
          }
          
          .price-qty {
            display: flex;
            justify-content: space-between;
            margin-top: auto;
            
            .product-price {
              font-size: 30rpx;
              color: #3b78db;
              font-weight: 500;
            }
            
            .product-quantity {
              font-size: 26rpx;
              color: #666;
            }
          }
        }
      }
    }
  }
  
  .delivery-section,
  .price-section {
    background-color: #fff;
    margin-bottom: 20rpx;
    
    .section-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1rpx solid #f5f5f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .item-label {
        font-size: 28rpx;
        color: #333;
        
        .discount-tag {
          display: inline-block;
          font-size: 22rpx;
          color: #3b78db;
          background-color: rgba(59, 120, 219, 0.1);
          padding: 2rpx 12rpx;
          border-radius: 20rpx;
          margin-left: 12rpx;
        }
      }
      
      .item-value {
        font-size: 28rpx;
        color: #333;
        
        .price {
          font-weight: 500;
        }
        
        .free-shipping {
          color: #3b78db;
        }
        
        .discount {
          color: #ff5500;
        }
      }
    }
  }
  
  .remark-section {
    background-color: #fff;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .remark-label {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 20rpx;
      display: block;
    }
    
    .remark-input {
      width: 100%;
      font-size: 28rpx;
      color: #333;
    }
    
    .placeholder {
      color: #999;
    }
  }
  
  .submit-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100rpx;
    background-color: #fff;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
    z-index: 100;
    
    .price-info {
      flex: 1;
      display: flex;
      align-items: baseline;
      
      .total-label {
        font-size: 28rpx;
        color: #666;
      }
      
      .total-price {
        color: #3b78db;
        
        .price-symbol {
          font-size: 24rpx;
        }
        
        .price-value {
          font-size: 36rpx;
          font-weight: 600;
        }
      }
    }
    
    .submit-btn {
      width: 240rpx;
      height: 76rpx;
      background: linear-gradient(to right, #3b78db, #4a90e2);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 38rpx;
      font-size: 30rpx;
      font-weight: 500;
      box-shadow: 0 6rpx 16rpx rgba(59, 120, 219, 0.25);
    }
  }
}
</style> 