<template>
  <view class="order-list-container">
    <!-- 订单状态选项卡 -->
    <view class="order-tabs">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        :class="['tab-item', activeTab === tab.value ? 'active' : '']"
        @tap="switchTab(tab.value)"
      >
        <text>{{ tab.name }}</text>
      </view>
    </view>
    
    <!-- 订单列表 -->
    <view class="order-list" v-if="orderList.length > 0">
      <view class="order-item" v-for="order in orderList" :key="order.id" @tap="goToDetail(order.id)">
        <view class="order-header">
          <text class="order-number">订单号: {{ order.id }}</text>
          <view class="status-section">
            <text class="order-status">{{ getStatusText(order) }}</text>
            <text v-if="order.status === 0 && order.timeToLive" class="timeout-info">{{ order.timeToLive }}</text>
          </view>
        </view>
        
        <!-- 订单信息 -->
        <view class="order-info">
          <!-- 商品信息 -->
          <view class="product-info">
            <view class="product-item" v-for="item in order.orderItemList" :key="item.id">
              <image class="product-image" :src="item.productPic" mode="aspectFill"></image>
              <view class="product-details">
                <text class="product-name">{{ item.productName }}</text>
                <text class="product-attr" v-if="item.productAttr">{{ item.productAttr }}</text>
                <view class="product-price-qty">
                  <text class="price">￥{{ item.productPrice }}</text>
                  <text class="quantity">x{{ item.productQuantity }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <view class="info-item">
            <text class="label">收货人:</text>
            <text class="value">{{ order.receiverName }}</text>
          </view>
          <view class="info-item">
            <text class="label">联系电话:</text>
            <text class="value">{{ order.receiverPhone }}</text>
          </view>
          <view class="info-item">
            <text class="label">收货地址:</text>
            <text class="value">{{ order.receiverProvince }}{{ order.receiverCity }}{{ order.receiverRegion }} {{ order.receiverDetailAddress }}</text>
          </view>
          <view class="info-item" v-if="order.deliveryCompany">
            <text class="label">物流公司:</text>
            <text class="value">{{ order.deliveryCompany }}</text>
          </view>
        </view>
        
        <view class="order-footer">
          <view class="order-total">
            <text class="total-price">商品金额: ￥{{ order.totalAmount }}</text>
            <text class="total-price">运费: ￥{{ order.freightAmount }}</text>
            <text class="total-price">合计: ￥{{ order.payAmount }}</text>
          </view>
          
          <view class="order-actions">
            <view class="action-btn" v-if="order.status === 2" @tap.stop="confirmReceived(order.id)">
              确认收货
            </view>
            <view class="action-btn" v-if="order.status === 4" @tap.stop="goToDetail(order.id)">
              查看详情
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空订单状态 -->
    <view class="empty-order" v-else>
      <image class="empty-icon" src="/static/images/empty-order.png" mode="aspectFit"></image>
      <text class="empty-text">暂无相关订单</text>
    </view>
    
    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore && orderList.length > 0">
      <text v-if="isLoading">加载中...</text>
      <text v-else @tap="loadMore">点击加载更多</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onShow, onPullDownRefresh, onReachBottom, onLoad } from '@dcloudio/uni-app'
import request from '@/utils/request'

// 订单状态选项卡
const tabs = ref([
  { name: '全部', value: '' },
  { name: '待支付', value: 0 },
  { name: '待发货', value: 1 },
  { name: '待收货', value: 2 },
  { name: '已完成', value: 3 },
  { name: '退款/售后', value: 4 },
  { name: '已失效', value: -1 }
])

// 当前选中的选项卡
const activeTab = ref('')

// 订单列表
const orderList = ref([])

// 分页参数
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const isLoading = ref(false)

// 切换选项卡
const switchTab = async (tabValue) => {
  if (activeTab.value === tabValue) return
  
  activeTab.value = tabValue
  page.value = 1
  orderList.value = []
  hasMore.value = true
  await getOrderList(tabValue, true)
}

// 获取订单列表
const getOrderList = async (tab = activeTab.value, refresh = false) => {
  // 重置列表
  if (refresh) {
    orderList.value = []
    page.value = 1
    hasMore.value = true
  }
  
  // 如果没有更多数据，则不请求
  if (!hasMore.value && !refresh) {
    console.log('没有更多数据了')
    return
  }

  isLoading.value = true
  console.log('请求订单列表数据，页码：', page.value, '状态：', tab)
  
  try {
    const result = await request({
      url: 'https://bgnc.online/api/order/list',
      method: 'GET',
      data: {
        pageNum: page.value,
        pageSize: pageSize.value,
        status: tab
      }
    })
    
    console.log('获取订单列表结果:', JSON.stringify(result))
    
    if (result.code === 200 && result.data) {
      // 处理订单列表数据
      let dataList = [];
      
      // 确定数据源的格式并正确获取订单列表
      if (Array.isArray(result.data)) {
        // 如果返回的是数组，直接使用
        dataList = result.data;
      } else if (result.data.list && Array.isArray(result.data.list)) {
        // 如果返回的是对象且包含list属性，使用list数组
        dataList = result.data.list;
      } else if (typeof result.data === 'object') {
        // 尝试找出可能的数组属性
        for (const key in result.data) {
          if (Array.isArray(result.data[key])) {
            dataList = result.data[key];
            break;
          }
        }
      }
      
      console.log('解析后的订单数据:', JSON.stringify(dataList));
      
      if (dataList.length > 0) {
        // 处理订单列表中的数据
        const processedOrders = await Promise.all(dataList.map(async (order) => {
          // 深拷贝避免修改原始数据
          const newOrder = JSON.parse(JSON.stringify(order));
          
          // 检查待支付订单是否超时
          if (newOrder.status === 0) {
            let isTimeout = false;
            
            // 检查订单项超时状态
            if (newOrder.orderItemList && newOrder.orderItemList.length > 0) {
              for (const item of newOrder.orderItemList) {
                if (item.timeToLive === "已超时") {
                  isTimeout = true;
                  break;
                }
              }
            }
            
            // 检查订单整体超时状态
            if (newOrder.timeToLive === "已超时") {
              isTimeout = true;
            }
            
            // 计算剩余时间
            if (!isTimeout && newOrder.createTime) {
              const timeLeft = calculateTimeLeft(newOrder.createTime);
              newOrder.timeToLive = timeLeft;
              
              // 更新订单项的倒计时
              if (newOrder.orderItemList && newOrder.orderItemList.length > 0) {
                for (let j = 0; j < newOrder.orderItemList.length; j++) {
                  newOrder.orderItemList[j].timeToLive = timeLeft;
                }
              }
              
              // 检查计算后是否超时
              if (timeLeft === '已超时') {
                isTimeout = true;
              }
            }
            
            // 如果超时，更新订单状态
            if (isTimeout) {
              // 更新服务器上的订单状态
              try {
                const updateResult = await request({
                  url: `https://bgnc.online/api/order/`,
                  method: 'PUT',
                  data: {
                    id: newOrder.id,
                    status: -1
                  }
                });
                
                if (updateResult.code === 200) {
                  console.log(`订单 ${newOrder.id} 更新为已失效状态`);
                  // 更新本地订单状态
                  newOrder.status = -1;
                } else {
                  console.error(`订单 ${newOrder.id} 状态更新失败:`, updateResult.msg);
                }
              } catch (error) {
                console.error(`更新订单 ${newOrder.id} 状态失败:`, error);
              }
            }
          }
          
          return newOrder;
        }));
        
        // 更新订单列表
        if (refresh || page.value === 1) {
          orderList.value = processedOrders;
        } else {
          orderList.value = [...orderList.value, ...processedOrders];
        }
        
        // 判断是否有更多数据
        if (processedOrders.length < pageSize.value) {
          hasMore.value = false;
        } else {
          page.value += 1;
          hasMore.value = true;
        }
      } else {
        // 没有数据
        hasMore.value = false;
        if (refresh || page.value === 1) {
          orderList.value = [];
        }
      }
    } else {
      uni.showToast({
        title: result.msg || '获取订单列表失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('获取订单列表失败:', error);
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
    // 停止下拉刷新
    uni.stopPullDownRefresh();
  }
};

// 加载更多
const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    getOrderList()
  }
}

// 获取订单状态文本
const getStatusText = (order) => {
  // 使用displayStatus如果存在,否则使用status
  const displayStatus = order.displayStatus !== undefined ? order.displayStatus : order.status
  
  switch (parseInt(displayStatus)) {
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

// 确认收货
const confirmReceived = async (orderId) => {
  uni.showModal({
    title: '确认收货',
    content: '确认已收到商品吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await request({
            url: `https://bgnc.online/api/order/receive/${orderId}`,
            method: 'PUT'
          })
          
          if (result.code === 200) {
            uni.showToast({
              title: '确认收货成功',
              icon: 'success'
            })
            
            // 刷新订单列表
            page.value = 1
            orderList.value = []
            getOrderList()
          } else {
            uni.showToast({
              title: result.message || '操作失败',
              icon: 'none'
            })
          }
        } catch (error) {
          console.error('确认收货失败:', error)
          uni.showToast({
            title: '网络错误，请稍后再试',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 跳转到订单详情页
const goToDetail = (orderId) => {
  uni.navigateTo({
    url: `/pages/order/detail?id=${orderId}`
  })
}

// 页面加载时获取URL参数
onLoad((options) => {
  console.log('订单列表页面参数:', options)
  
  // 如果有状态参数，设置当前选项卡
  if (options.status !== undefined) {
    const status = options.status === "" ? "" : parseInt(options.status)
    activeTab.value = status
    
    // 检查是否有效状态值，如果无效则设为默认全部
    const validTab = tabs.value.find(tab => tab.value === status)
    if (!validTab) {
      activeTab.value = ''
    }
  }
})

// 页面显示时获取订单列表
onShow(() => {
  console.log('订单列表页面显示,刷新数据')
  // 重置分页数据
  page.value = 1
  orderList.value = []
  hasMore.value = true
  getOrderList()
})

// 下拉刷新
onPullDownRefresh(() => {
  page.value = 1
  orderList.value = []
  hasMore.value = true
  getOrderList()
})

// 上拉加载更多
onReachBottom(() => {
  loadMore()
})

// 页面加载
onMounted(() => {
  console.log('订单列表页面已加载')
})

// 计算倒计时
const calculateTimeLeft = (createTime) => {
  if (!createTime) return '';
  
  // 解析创建时间
  const createDate = new Date(createTime);
  
  // 计算截止时间（创建时间 + 30分钟）
  const deadline = new Date(createDate.getTime() + 30 * 60 * 1000);
  
  // 获取当前时间
  const now = new Date();
  
  // 如果当前时间已超过截止时间，返回已超时
  if (now >= deadline) {
    return '已超时';
  }
  
  // 计算剩余时间（毫秒）
  const timeLeft = deadline.getTime() - now.getTime();
  
  // 转换为分钟和秒
  const minutes = Math.floor(timeLeft / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  // 格式化输出
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// 检查和更新订单状态
const checkAndUpdateOrderStatus = async () => {
  // 如果当前没有订单数据，则不执行
  if (!orderList.value || orderList.value.length === 0) return;
  
  // 遍历所有待支付的订单
  for (let i = 0; i < orderList.value.length; i++) {
    const order = orderList.value[i];
    
    // 只检查待支付的订单，其他状态不显示超时信息
    if (order.status === 0) {
      // 计算订单的剩余时间
      const timeLeft = calculateTimeLeft(order.createTime);
      
      // 更新订单项的倒计时（仅内部使用，不会显示）
      if (order.orderItemList && order.orderItemList.length > 0) {
        for (let j = 0; j < order.orderItemList.length; j++) {
          orderList.value[i].orderItemList[j].timeToLive = timeLeft;
        }
      }
      
      // 更新订单的倒计时
      orderList.value[i].timeToLive = timeLeft;
      
      // 如果订单已超时，更新状态
      if (timeLeft === '已超时') {
        try {
          // 更新服务器上的订单状态
          const result = await request({
            url: `https://bgnc.online/api/order/`,
            method: 'PUT',
            data: {
              id: order.id,
              status: -1
            }
          });
          
          if (result.code === 200) {
            console.log(`列表中订单 ${order.id} 已超时，状态更新为已失效`);
            // 更新本地订单状态
            orderList.value[i].status = -1;
            // 清除超时信息
            orderList.value[i].timeToLive = '';
          } else {
            console.error(`列表中订单 ${order.id} 状态更新失败:`, result.msg);
          }
        } catch (error) {
          console.error(`列表中更新订单 ${order.id} 状态失败:`, error);
        }
      }
    } else {
      // 非待支付状态清除超时信息
      orderList.value[i].timeToLive = '';
      if (order.orderItemList && order.orderItemList.length > 0) {
        for (let j = 0; j < order.orderItemList.length; j++) {
          orderList.value[i].orderItemList[j].timeToLive = '';
        }
      }
    }
  }
};

// 开启定时器，每秒更新一次倒计时
let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    checkAndUpdateOrderStatus();
  }, 1000);
});

onUnmounted(() => {
  // 清除定时器
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<style lang="scss">
.order-list-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 30rpx;
  
  .order-tabs {
    display: flex;
    background-color: #fff;
    padding: 0 20rpx;
    position: sticky;
    top: 0;
    z-index: 10;
    
    .tab-item {
      flex: 1;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: #666;
      position: relative;
      
      &.active {
        color: #3b78db;
        font-weight: 500;
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 4rpx;
          background-color: #3b78db;
          border-radius: 2rpx;
        }
      }
    }
  }
  
  .order-list {
    padding: 20rpx;
    
    .order-item {
      background-color: #fff;
      border-radius: 16rpx;
      margin-bottom: 20rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
      
      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24rpx;
        border-bottom: 1rpx solid #f5f5f5;
        
        .order-number {
          font-size: 26rpx;
          color: #666;
        }
        
        .status-section {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          
          .order-status {
            font-size: 26rpx;
            color: #3b78db;
            font-weight: 500;
          }
          
          .timeout-info {
            font-size: 22rpx;
            color: #ff4d4f;
            margin-top: 6rpx;
            background-color: #fff1f0;
            padding: 2rpx 12rpx;
            border-radius: 20rpx;
            border: 1rpx solid #ffccc7;
          }
        }
      }
      
      .order-info {
        padding: 0 24rpx;
        
        .product-info {
          padding: 24rpx 0;
          border-bottom: 1rpx solid #f5f5f5;
          
          .product-item {
            display: flex;
            padding: 20rpx 0;
            
            .product-image {
              width: 160rpx;
              height: 160rpx;
              border-radius: 8rpx;
              margin-right: 20rpx;
              background-color: #f5f5f5;
            }
            
            .product-details {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              
              .product-name {
                font-size: 28rpx;
                color: #333;
                line-height: 1.4;
                margin-bottom: 10rpx;
              }
              
              .product-attr {
                font-size: 24rpx;
                color: #999;
                margin-bottom: 10rpx;
              }
              
              .product-price-qty {
                display: flex;
                justify-content: space-between;
                align-items: center;
                
                .price {
                  font-size: 28rpx;
                  color: #ff6b00;
                  font-weight: 500;
                }
                
                .quantity {
                  font-size: 26rpx;
                  color: #999;
                }
              }
            }
          }
        }
        
        .info-item {
          padding: 24rpx 0;
          border-bottom: 1rpx solid #f5f5f5;
          display: flex;
          
          &:last-child {
            border-bottom: none;
          }
          
          .label {
            width: 160rpx;
            font-size: 26rpx;
            color: #666;
          }
          
          .value {
            flex: 1;
            font-size: 26rpx;
            color: #333;
          }
        }
      }
      
      .order-footer {
        padding: 24rpx;
        border-top: 1rpx solid #f5f5f5;
        
        .order-total {
          display: block;
          text-align: right;
          margin-bottom: 20rpx;
          
          text {
            font-size: 26rpx;
            color: #666;
            display: block;
            margin-bottom: 8rpx;
          }
          
          .total-price {
            color: #333;
            font-weight: 500;
            
            &:last-child {
              color: #3b78db;
              font-size: 30rpx;
            }
          }
        }
        
        .order-actions {
          display: flex;
          justify-content: flex-end;
          
          .action-btn {
            height: 60rpx;
            padding: 0 30rpx;
            border: 1rpx solid #ddd;
            border-radius: 30rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26rpx;
            color: #666;
            margin-left: 20rpx;
            
            &.primary {
              border-color: #3b78db;
              color: #3b78db;
            }
            
            &:active {
              opacity: 0.8;
            }
          }
        }
      }
    }
  }
  
  .empty-order {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    
    .empty-icon {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 30rpx;
    }
    
    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
  
  .load-more {
    text-align: center;
    padding: 30rpx 0;
    
    text {
      font-size: 26rpx;
      color: #999;
    }
  }
}
</style> 