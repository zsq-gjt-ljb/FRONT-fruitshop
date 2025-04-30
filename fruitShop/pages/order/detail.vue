<template>
  <view class="order-detail-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="title">订单详情</text>
      <text class="order-id">订单编号: {{ orderId }}</text>
      <view class="order-status" v-if="orderStatus != null">
        <image v-if="orderStatus === 0" class="status-icon" src="/static/icons/wallet.png" mode="aspectFit"></image>
        <text>{{ getStatusText(orderStatus) }}</text>
      </view>
      <view class="order-time-info">
        <text class="create-time">创建时间: {{ formatCreateTime }}</text>
        <text class="timeout-status" v-if="orderStatus === 0 && isTimeoutOrder">{{ timeToLive }}</text>
      </view>
    </view>
    
   
    
    <!-- 商品信息 -->
    <view class="info-card">
      <view class="card-title">
        <uni-icons type="shop" size="18" color="#3b78db"></uni-icons>
        <text>商品信息</text>
      </view>
      <view class="products-list">
        <view class="product-item" v-for="(item, index) in orderItems" :key="index">
          <image class="product-image" :src="item.productPic || '/static/images/default-product.png'" mode="aspectFill"></image>
          <view class="product-info">
            <text class="product-name">{{ item.productName }}</text>
            <text class="product-attr" v-if="item.productAttr">{{ item.productAttr }}</text>
            <view class="product-price-qty">
              <text class="product-price">￥{{ item.productPrice }}</text>
              <text class="product-qty">x{{ item.productQuantity }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 商品总计 -->
      <view class="order-summary">
        <view class="summary-item">
          <text class="label">商品总数:</text>
          <text class="value">{{ getTotalQuantity() }}件</text>
        </view>
        <view class="summary-item">
          <text class="label">商品总额:</text>
          <text class="value price">￥{{ getTotalPrice() }}</text>
        </view>
      </view>
    </view>
 
    
    <!-- 订单时间信息 -->
    <view class="info-card time-card">
      <view class="time-item">
        <text class="label">下单时间</text>
        <text class="value">{{ orderCreateTime || '暂无' }}</text>
      </view>
      <view class="time-item" v-if="orderPayTime">
        <text class="label">支付时间</text>
        <text class="value">{{ orderPayTime }}</text>
      </view>
      <view class="time-item" v-if="orderStatus === 0 && orderTimeLeft && !isOrderExpired">
        <text class="label">剩余支付时间</text>
        <text class="value warning">{{ orderTimeLeft }}</text>
      </view>
      <view class="time-item" v-if="orderStatus === 0 && isOrderExpired">
        <text class="label">订单状态</text>
        <text class="value error">订单已超时</text>
      </view>
    </view>
    
    <!-- 物流信息 - 仅待收货时显示 -->
    <view class="info-card logistics-card" v-if="orderStatus === 2&&deliverySn ">
      <view class="card-title">
        <uni-icons type="truck" size="18" color="#3b78db"></uni-icons>
        <text>物流信息</text>
      </view>
      
      <view class="logistics-info">
        <view class="logistics-header">
          <view>
            <text class="logistics-company">{{ deliveryCompany || '顺丰速运' }}</text>
            <text class="logistics-number">运单号: {{ deliverySn }}</text>
          </view>
          <view class="refresh-btn" @tap="queryLogistics">
            <uni-icons type="refresh" size="14" color="#3b78db"></uni-icons>
            <text>刷新</text>
          </view>
        </view>
        
        <view class="logistics-status" v-if="logisticsData.length > 0">
          <view class="status-timeline">
            <view 
              v-for="(item, index) in logisticsData" 
              :key="index" 
              class="timeline-item"
              :class="{'first-item': index === 0}"
            >
              <view class="timeline-dot"></view>
              <view class="timeline-content">
                <view class="timeline-status">{{ item.firstStatusName || '运输中' }}</view>
                <view class="timeline-time">{{ item.acceptTime }}</view>
                <view class="timeline-address">{{ item.acceptAddress }}</view>
                <view class="timeline-remark" v-if="item.remark">{{ item.remark }}</view>
              </view>
            </view>
          </view>
        </view>
        
        <view class="logistics-empty" v-else-if="logisticsLoading">
          <view class="loading-icon">
            <uni-icons type="spinner-cycle" size="24" color="#ccc"></uni-icons>
          </view>
          <text>正在查询物流信息...</text>
        </view>
        
        <view class="logistics-empty" v-else>
          <text>暂无物流信息，请稍后再试</text>
        </view>
      </view>
    </view>
    
    <!-- 底部操作按钮 -->
    <view class="action-bar">
      <view class="action-btn" @tap="goBack">返回上一页</view>
      <view class="payment-section" v-if="showPayButton">
        <view class="payment-info">
          <text class="payment-label">还需支付</text>
          <text class="payment-amount">￥{{ getTotalPrice() }}</text>
        </view>
        <view class="pay-btn" @tap="handlePay" :class="{'loading': payLoading}">
          去支付
        </view>
      </view>
      <button open-type="contact" class="action-btn contact-btn" @contact="handleContact">联系客服</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from '@/utils/request'

// 订单商品
const orderItems = ref([])
const orderId = ref('')
const orderStatus = ref(null)
const orderCreateTime = ref(null)
const orderPayTime = ref(null)
// 支付按钮加载状态
const payLoading = ref(false)
// 订单剩余支付时间
const orderTimeLeft = ref('')
// 订单是否已过期
const isOrderExpired = ref(false)
// 订单超时定时器
let orderTimer = null
// 添加新的响应式变量
const timeToLive = ref('')
const isTimeoutOrder = ref(false)

// 物流信息相关
const deliverySn = ref('') // 快递单号
const deliveryCompany = ref('') // 快递公司
const receiverPhone = ref('') // 收货人手机号
const logisticsData = ref([]) // 物流数据
const logisticsLoading = ref(false) // 物流查询加载状态

// 添加计算属性处理创建时间格式
const formatCreateTime = computed(() => {
  if (!orderCreateTime.value) return '暂无'
  return orderCreateTime.value
})

// 获取订单详情
const getOrderDetail = async () => {
  if (!orderId.value) return
  
  try {
    uni.showLoading({
      title: '加载中...'
    })
    
    const result = await request({
      url: `https://bgnc.online/api/order/${orderId.value}`,
      method: 'GET'
    })
    
    console.log('获取订单详情结果:', JSON.stringify(result))
    
    if (result.code === 200) {
      // 处理返回的数据
      if (result.data) {
        // 检查订单是否已超时
        let isTimeout = false;
        
        // 检查主体是否有超时信息
        if (result.data.timeToLive === "已超时") {
          isTimeout = true;
          timeToLive.value = "已超时";
          isTimeoutOrder.value = true;
        } else if (result.data.orderItemList && result.data.orderItemList[0] && 
                  result.data.orderItemList[0].timeToLive === "已超时") {
          // 检查订单项是否有超时信息
          isTimeout = true;
          timeToLive.value = "已超时";
          isTimeoutOrder.value = true;
        }
        
        // 如果订单已超时但状态仍为待支付(0),则更新为已失效(-1)
        if (isTimeout && result.data.status === 0) {
          // 重要修复:明确等待更新完成再继续
          const updateResult = await updateOrderStatus(-1);
          if (!updateResult) {
            console.error('订单状态更新失败,重试一次');
            // 再尝试一次
            await updateOrderStatus(-1);
          }
          // 更新本地状态
          orderStatus.value = -1;
          // 返回上一页并刷新列表
          setTimeout(() => {
            uni.showToast({
              title: '订单已超时自动取消',
              icon: 'none',
              duration: 2000
            });
            // 延迟1秒返回,确保用户能看到提示
            setTimeout(() => {
              navigateBack();
            }, 1000);
          }, 500);
          return;
        } else {
          // 设置订单状态
          orderStatus.value = result.data.status;
          
          // 重要修复:仅为待支付订单启动倒计时
          if (result.data.status === 0 && !isTimeout) {
            // 设置创建时间
            if (result.data.createTime) {
              orderCreateTime.value = result.data.createTime;
              // 启动倒计时
              startOrderTimer();
            }
          }
        }
        
        // 设置订单商品列表
        if (result.data.orderItemList && Array.isArray(result.data.orderItemList)) {
          orderItems.value = result.data.orderItemList;
        }
        
        // 设置创建时间
        if (result.data.createTime) {
          orderCreateTime.value = result.data.createTime;
        }
        
        // 如果有支付时间
        if (result.data.payTime) {
          orderPayTime.value = formatDate(new Date(result.data.payTime));
        }
        
        // 处理物流信息
        if (result.data.deliverySn) {
          deliverySn.value = result.data.deliverySn;
          deliveryCompany.value = result.data.deliveryCompany || '顺丰速运';
          // 处理收货人电话号码，获取后四位
          if (result.data.receiverPhone) {
            receiverPhone.value = result.data.receiverPhone.slice(-4);
            // 如果订单状态为待收货，自动查询物流信息
            if (result.data.status === 2) {
              queryLogistics();
            }
          }
        }
      }
    } else {
      uni.showToast({
        title: result.msg || '获取订单详情失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 计算商品总数量
const getTotalQuantity = () => {
  return orderItems.value.reduce((total, item) => {
    return total + (parseInt(item.productQuantity) || 0)
  }, 0)
}

// 计算商品总价
const getTotalPrice = () => {
  // 商品价格已经包含了数量的计算，不需要再乘以数量
  const total = orderItems.value.reduce((sum, item) => {
    return sum + (parseFloat(item.productPrice) || 0)
  }, 0)
  return total.toFixed(2)
}

// 返回上一页并刷新数据
const navigateBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    // 获取上一页实例
    const prevPage = pages[pages.length - 2];
    
    // 如果上一页是订单列表,尝试刷新数据
    if (prevPage && prevPage.route === 'pages/order/list') {
      // 强制刷新列表页数据
      if (typeof prevPage.$vm.getOrderList === 'function') {
        // 通知上一个页面刷新数据
        prevPage.$vm.pageNum = 1;
        prevPage.$vm.orderList = [];
        prevPage.$vm.getOrderList();
      }
    }
  }
  
  // 返回上一页
  uni.navigateBack();
}

// 处理联系客服事件
const handleContact = (e) => {
  console.log('联系客服事件触发:', e.detail)
}

// 获取订单状态文本
const getStatusText = (status) => {
  switch (parseInt(status)) {
    case -1:
      return '已失效'
    case 0:
      return '待支付'
    case 1:
      return '待发货'
    case 2:
      return '待收货'
    case 3:
      return '已完成'
    case 4:
      return '退款/售后'
    default:
      return '未知状态'
  }
}

// 处理支付
const handlePay = async () => {
  if (payLoading.value) return; // 防止重复点击
  
  try {
    payLoading.value = true;
    uni.showLoading({
      title: '正在获取支付信息...'
    })
    
    // 1. 获取微信登录code
    const loginResult = await uni.login();
    
    if (!loginResult.code) {
      throw new Error('获取微信登录code失败');
    }
    
    console.log('获取到微信登录code:', loginResult.code);
    
    // 2. 请求支付参数
    const paymentResult = await request({
      url: 'https://bgnc.online/api/notify/payment',
      method: 'POST',
      data: {
        orderId: orderId.value,
        code: loginResult.code
      }
    });
    
    console.log('获取到支付参数:', paymentResult);
    
    if (paymentResult.code !== 200 || !paymentResult.data) {
      throw new Error(paymentResult.message || '获取支付参数失败');
    }
    
    // 3. 调用微信支付
    uni.showLoading({ title: '正在拉起支付...' });
    
    await new Promise((resolve, reject) => {
      uni.requestPayment({
        provider: 'wxpay',
        timeStamp: paymentResult.data.timeStamp,
        nonceStr: paymentResult.data.nonceStr,
        package: paymentResult.data.packageVal,
        signType: paymentResult.data.signType,
        paySign: paymentResult.data.paySign,
        success: (res) => {
          console.log('支付成功', res);
          resolve(res);
        },
        fail: (err) => {
          console.log('支付失败', err);
          reject(err);
        }
      });
    });
    
    // 支付成功处理
    uni.showToast({
      title: '支付成功',
      icon: 'success'
    });
    
    // 支付成功后更新订单状态为待发货(状态码1)
    try {
      await request({
        url: `https://bgnc.online/api/order`,
        method: 'PUT',
        data: {
          id: orderId.value,
          status: 1  // 待发货状态
        }
      });
      console.log('订单状态已更新为待发货');
    } catch (updateError) {
      console.error('更新订单状态失败:', updateError);
    }
    
    // 刷新订单状态
    setTimeout(() => {
      getOrderDetail();
    }, 1000);
    
  } catch (error) {
    console.error('支付过程发生错误:', error);
    uni.hideLoading();
    
    if (error.errMsg && error.errMsg.includes('cancel')) {
      uni.showToast({
        title: '用户取消支付',
        icon: 'none'
      });
    } else {
      uni.showToast({
        title: error.message || '支付失败',
        icon: 'none'
      });
    }
  } finally {
    uni.hideLoading();
    payLoading.value = false;
  }
}

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

// 判断是否显示支付按钮
const showPayButton = computed(() => {
  console.log('计算是否显示支付按钮, 当前状态:', orderStatus.value)
  // 只有订单状态明确为0(待支付)并且未过期时才显示支付按钮
  return orderStatus.value === 0 && !isOrderExpired.value && !isTimeoutOrder.value
})

// 计算订单剩余支付时间
const calculateOrderTimeLeft = () => {
  if (!orderCreateTime.value) return
  
  // 解析订单创建时间
  const createTime = new Date(orderCreateTime.value.replace(/-/g, '/'))
  // 设置超时时间为10分钟
  const expireTime = new Date(createTime.getTime() + 10 * 60 * 1000)
  const now = new Date()
  
  // 如果当前时间已经超过了过期时间
  if (now >= expireTime) {
    orderTimeLeft.value = '00:00'
    isOrderExpired.value = true
    clearInterval(orderTimer)
    handleOrderExpired()
    return
  }
  
  // 计算剩余时间
  const diffMs = expireTime - now
  const diffMin = Math.floor(diffMs / 60000)
  const diffSec = Math.floor((diffMs % 60000) / 1000)
  
  orderTimeLeft.value = `${String(diffMin).padStart(2, '0')}:${String(diffSec).padStart(2, '0')}`
}

// 处理订单超时
const handleOrderExpired = async () => {
  console.log('订单已超时，准备更新订单状态')
  
  try {
    // 只有订单状态为0(待支付)时才需要更新为已失效
    if (orderStatus.value !== 0) {
      console.log('订单状态不是待支付,无需更新')
      return;
    }
    
    // 更新订单状态为已失效(-1)
    const result = await request({
      url: `https://bgnc.online/api/order/`,
      method: 'PUT',
      data: {
        id: orderId.value,
        status: -1
      }
    })
    
    if (result.code === 200) {
      console.log('订单状态更新为已失效')
      orderStatus.value = -1
      isOrderExpired.value = true
      uni.showToast({
        title: '订单已超时自动取消',
        icon: 'none',
        duration: 2000
      })
      
      // 重要修复:刷新上一页数据
      setTimeout(() => {
        navigateBack();
      }, 2000);
    } else {
      console.error('更新订单状态失败:', result.msg)
      // 失败重试一次
      setTimeout(async () => {
        await updateOrderStatus(-1);
      }, 1000);
    }
  } catch (error) {
    console.error('更新订单状态失败:', error)
    // 失败重试一次
    setTimeout(async () => {
      await updateOrderStatus(-1);
    }, 1000);
  }
}

// 启动订单倒计时定时器
const startOrderTimer = () => {
  // 清除之前的定时器
  if (orderTimer) {
    clearInterval(orderTimer)
  }
  
  // 立即计算一次
  calculateOrderTimeLeft()
  
  // 设置定时器，每秒更新一次
  orderTimer = setInterval(() => {
    calculateOrderTimeLeft()
  }, 1000)
}

// 更新订单状态
const updateOrderStatus = async (status) => {
  try {
    console.log(`更新订单状态为: ${status}`)
    
    const res = await request({
      url: `https://bgnc.online/api/order/`,
      method: 'PUT',
      data: {
        id: orderId.value,
        status: status
      }
    })
    
    if (res.code === 200) {
      console.log('订单状态更新成功')
      orderStatus.value = status
      return true;
    } else {
      console.error('订单状态更新失败:', res.msg)
      return false;
    }
  } catch (error) {
    console.error('更新订单状态失败:', error)
    return false;
  }
}

// 查询物流信息
const queryLogistics = async () => {
  if (!deliverySn.value || !receiverPhone.value) {
    uni.showToast({
      title: '缺少物流信息',
      icon: 'none'
    });
    return;
  }
  
  logisticsLoading.value = true;
  logisticsData.value = [];
  
  try {
    // 登录成功后查询路由信息
    const routeRes = await request({
      url: `https://bgnc.online/api/order/route?phoneNumber=${receiverPhone.value}&orderNumber=${deliverySn.value}`,
      method: 'GET'
    });
    
    console.log('路由查询结果:', routeRes);
    
    if (routeRes.code === 200) {
      if (routeRes.data && Array.isArray(routeRes.data)) {
        logisticsData.value = routeRes.data;
      } else {
        console.error('路由查询失败:', routeRes.msg);
      }
    } else {
      console.error('路由查询失败:', routeRes.msg);
    }
  } catch (error) {
    console.error('路由查询失败:', error);
  } finally {
    logisticsLoading.value = false;
  }
}

// 页面加载
onLoad((options) => {
  console.log('订单详情页面参数:', options)
  
  if (options.id) {
    orderId.value = options.id
    getOrderDetail()
  } else {
    uni.showToast({
      title: '订单ID不存在',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

// 页面卸载
onUnmounted(() => {
  // 清除定时器
  if (orderTimer) {
    clearInterval(orderTimer)
    orderTimer = null
  }
})

// 返回上一页
const goBack = () => {
  navigateBack()
}
</script>

<style lang="scss">
.order-detail-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20rpx;
  padding-bottom: 120rpx;
  
  .page-header {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 10rpx;
      display: block;
    }
    
    .order-id {
      font-size: 24rpx;
      color: #999;
      display: block;
      margin-bottom: 10rpx;
    }
    
    .order-status {
      display: flex;
      align-items: center;
      margin-top: 10rpx;
      
      .status-icon {
        width: 40rpx;
        height: 40rpx;
        margin-right: 10rpx;
      }
      
      text {
        font-size: 28rpx;
        color: #3b78db;
        font-weight: 500;
      }
    }
    
    .order-time-info {
      display: flex;
      align-items: center;
      gap: 20rpx;
      margin-top: 10rpx;
      
      .create-time {
        font-size: 24rpx;
        color: #666;
      }
      
      .timeout-status {
        font-size: 22rpx;
        color: #f50;
        background-color: #fff1f0;
        padding: 2rpx 12rpx;
        border-radius: 20rpx;
        border: 1rpx solid #ffccc7;
      }
    }
  }
  
  .info-card {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .products-list {
      .product-item {
        display: flex;
        padding: 20rpx 0;
        border-bottom: 1rpx solid #f5f5f5;
        
        &:last-child {
          border-bottom: none;
        }
        
        .product-image {
          width: 120rpx;
          height: 120rpx;
          border-radius: 8rpx;
          background-color: #f5f5f5;
        }
        
        .product-info {
          flex: 1;
          padding-left: 20rpx;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          
          .product-name {
            font-size: 28rpx;
            color: #333;
            margin-bottom: 8rpx;
          }
          
          .product-attr {
            font-size: 24rpx;
            color: #999;
            margin-bottom: 8rpx;
          }
          
          .product-price-qty {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .product-price {
              font-size: 26rpx;
              color: #f50;
            }
            
            .product-qty {
              font-size: 26rpx;
              color: #999;
            }
          }
        }
      }
      
      margin-bottom: 20rpx;
    }
    
    .order-summary {
      border-top: 1rpx dashed #eee;
      padding-top: 20rpx;
      
      .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          font-size: 26rpx;
          color: #666;
        }
        
        .value {
          font-size: 26rpx;
          color: #333;
          
          &.price {
            color: #f50;
            font-weight: 500;
            font-size: 30rpx;
          }
        }
      }
    }
    
    .card-title {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      text {
        font-size: 30rpx;
        font-weight: 500;
        margin-left: 10rpx;
      }
    }
    
    &.recommend-card {
      .recommend-list {
        min-height: 200rpx;
        
        .empty-recommend {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 50rpx 0;
          
          text {
            font-size: 26rpx;
            color: #999;
            margin-top: 20rpx;
          }
        }
      }
    }
    
    &.time-card {
      .time-item {
        display: flex;
        justify-content: space-between;
        padding: 20rpx 0;
        
        .label {
          font-size: 26rpx;
          color: #666;
        }
        
        .value {
          font-size: 26rpx;
          color: #333;
        }
      }
    }
    
    .info-content {
      .info-row {
        display: flex;
        margin-bottom: 16rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .info-label {
          width: 160rpx;
          font-size: 26rpx;
          color: #666;
        }
        
        .info-value {
          flex: 1;
          font-size: 26rpx;
          color: #333;
        }
        
        .copy-btn {
          font-size: 24rpx;
          color: #3b78db;
          background-color: #f0f5ff;
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
          margin-left: 20rpx;
        }
        
        &.total-row {
          margin-top: 20rpx;
          padding-top: 20rpx;
          border-top: 1rpx dashed #eee;
        }
        
        .total-price {
          font-size: 32rpx;
          color: #f50;
          font-weight: 500;
        }
      }
    }
  }
  
  .action-bar {
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
    
    .action-btn {
      height: 70rpx;
      border-radius: 35rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      margin-right: 20rpx;
      padding: 0 30rpx;
      background-color: #f5f5f5;
      color: #666;
      
      &.contact-btn {
        background-color: #f5f7fa;
        color: #333;
        border: 1rpx solid #e8e8e8;
        line-height: 70rpx;
        padding: 0 30rpx;
      }
    }
    
    .payment-section {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-right: 20rpx;
      
      .payment-info {
        display: flex;
        flex-direction: column;
        
        .payment-label {
          font-size: 24rpx;
          color: #666;
        }
        
        .payment-amount {
          font-size: 32rpx;
          color: #f50;
          font-weight: bold;
        }
      }
      
      .pay-btn {
        height: 70rpx;
        padding: 0 40rpx;
        background-color: #f50;
        color: #fff;
        border-radius: 35rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        font-weight: 500;
        
        &.loading {
          opacity: 0.8;
        }
        
        &:active {
          opacity: 0.9;
        }
      }
    }
  }
  
  .debug-info {
    background-color: #fff7e6;
    padding: 10rpx 20rpx;
    margin-bottom: 20rpx;
    border-radius: 10rpx;
    font-size: 24rpx;
    color: #666;
  }
  
  .time-card {
    .time-item {
      .value {
        &.warning {
          color: #ff9800;
          font-weight: 500;
        }
        
        &.error {
          color: #ff5252;
          font-weight: 500;
        }
      }
    }
  }
  
  .logistics-card {
    .logistics-info {
      .logistics-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 20rpx;
        border-bottom: 1rpx solid #f5f5f5;
        
        .logistics-company {
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
          margin-right: 20rpx;
        }
        
        .logistics-number {
          font-size: 24rpx;
          color: #666;
        }
        
        .refresh-btn {
          display: flex;
          align-items: center;
          padding: 6rpx 16rpx;
          background-color: #f0f5ff;
          border-radius: 20rpx;
          
          text {
            font-size: 24rpx;
            color: #3b78db;
            margin-left: 6rpx;
          }
        }
      }
      
      .logistics-status {
        padding: 20rpx 0;
        
        .status-timeline {
          position: relative;
          
          &:before {
            content: '';
            position: absolute;
            top: 30rpx;
            left: 16rpx;
            width: 2rpx;
            height: calc(100% - 30rpx);
            background-color: #f0f0f0;
          }
          
          .timeline-item {
            display: flex;
            padding: 20rpx 0;
            position: relative;
            
            &.first-item {
              .timeline-dot {
                background-color: #3b78db;
                border: none;
              }
              
              .timeline-status, .timeline-time {
                color: #3b78db;
                font-weight: 500;
              }
            }
            
            .timeline-dot {
              width: 18rpx;
              height: 18rpx;
              border-radius: 50%;
              background-color: #fff;
              border: 2rpx solid #ddd;
              margin-right: 30rpx;
              margin-top: 10rpx;
              z-index: 1;
              flex-shrink: 0;
            }
            
            .timeline-content {
              flex: 1;
              
              .timeline-status {
                font-size: 28rpx;
                color: #333;
                margin-bottom: 6rpx;
              }
              
              .timeline-time {
                font-size: 24rpx;
                color: #666;
                margin-bottom: 6rpx;
              }
              
              .timeline-address {
                font-size: 24rpx;
                color: #999;
                margin-bottom: 6rpx;
              }
              
              .timeline-remark {
                font-size: 24rpx;
                color: #ff9800;
                background-color: rgba(255, 152, 0, 0.1);
                padding: 6rpx 12rpx;
                border-radius: 6rpx;
                margin-top: 6rpx;
              }
            }
          }
        }
      }
      
      .logistics-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40rpx 0;
        
        .loading-icon {
          margin-bottom: 20rpx;
          
          uni-icons {
            animation: rotate 1s linear infinite;
          }
        }
        
        text {
          font-size: 26rpx;
          color: #999;
        }
      }
    }
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 