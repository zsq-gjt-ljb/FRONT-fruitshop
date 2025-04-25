<template>
  <view class="order-manage">
    <!-- 顶部操作区 -->
    <view class="action-bar">
      <!-- 筛选条件 -->
      <view class="filter-section">
        <view class="filter-row">
          <picker mode="selector" :range="orderStatus" :value="statusIndex" @change="onStatusChange">
            <text>{{ orderStatus[statusIndex] }}</text>
          </picker>
        </view>

        <view class="button-row">
          <button class="search-btn" @tap="handleSearch">
            <text class="iconfont icon-search"></text>
            <text>查询</text>
          </button>

          <button class="reset-btn" @tap="handleReset">
            <text>重置</text>
          </button>
          
          <button class="export-btn" @tap="handleExport" :loading="exporting">
            <text class="iconfont icon-export"></text>
            <text>{{ exporting ? '导出中...' : '导出' }}</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 订单列表卡片视图 -->
    <view class="order-cards">
      <view class="order-card" v-for="order in orderList" :key="order.id">
        <view class="card-header">
          <view :class="['status-tag', getStatusClass(order.status)]" @tap="handleStatusChange(order.id, order.status)">
            {{ getStatusText(order.status) }}
            <text class="iconfont icon-down">↓</text>
          </view>
          <text class="order-time">{{ formatDate(order.createTime) }}</text>
        </view>
        
        <!-- 订单号单独一行 -->
        <view class="order-id-row">
          <text class="id-label">订单号:</text>
          <text class="id-value">{{ formatOrderId(order.id) }}</text>
          <button class="copy-btn" @tap="copyOrderId(order.id)">复制</button>
        </view>
        
        <view class="card-body">
          <view class="info-row">
            <view class="info-item">
              <text class="label">收货人:</text>
              <text class="value">{{ order.receiverName }}</text>
            </view>
            <view class="info-item">
              <text class="label">联系电话:</text>
              <text class="value">{{ formatPhone(order.receiverPhone) }}</text>
            </view>
          </view>
          
          <view class="info-row">
            <view class="info-item">
              <text class="label">订单金额:</text>
              <text class="value price">¥{{ order.payAmount }}</text>
            </view>
            <view class="info-item">
              <text class="label">运费:</text>
              <text class="value">¥{{ order.freightAmount }}</text>
            </view>
          </view>
          
          <view class="info-row address">
            <view class="info-item full">
              <text class="label">收货地址:</text>
              <text class="value">{{ formatAddress(order) }}</text>
            </view>
          </view>
        </view>
        
        <view class="card-footer">
          <button class="action-btn" @tap="viewOrderDetail(order.id)">查看详情</button>
          <button class="action-btn ship-btn" v-if="order.status === 0 || order.status === 1" @tap="handleShip(order.id)">发货</button>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-data" v-if="orderList.length === 0">
        <text class="iconfont icon-empty"></text>
        <text>暂无订单数据</text>
      </view>
    </view>

    <!-- 分页控制器 -->
    <view class="pagination">
      <view class="page-info">
        共 {{ total }} 条数据，每页 {{ pageSize }} 条
      </view>
      <view class="page-controls">
        <button class="page-btn" :disabled="pageNum <= 1" @tap="prevPage">
          <text class="iconfont icon-left">←</text>
        </button>
        <view class="page-number">{{ pageNum }}/{{ totalPages }}</view>
        <button class="page-btn" :disabled="pageNum >= totalPages" @tap="nextPage">
          <text class="iconfont icon-right">→</text>
        </button>
      </view>
    </view>

    <!-- 发货弹窗 -->
    <uni-popup ref="shipPopup" type="center">
      <view class="ship-popup">
        <view class="popup-title">订单发货</view>
        <view class="form-item">
          <text class="label">物流公司</text>
          <input type="text" v-model="shipForm.company" placeholder="请输入物流公司" />
        </view>
        <view class="form-item">
          <text class="label">物流单号</text>
          <input type="text" v-model="shipForm.trackingNo" placeholder="请输入物流单号" />
        </view>
        <view class="popup-actions">
          <button class="cancel-btn" @tap="cancelShip">取消</button>
          <button class="confirm-btn" @tap="confirmShip">确认发货</button>
        </view>
      </view>
    </uni-popup>
    
    <!-- 修改状态弹窗 -->
    <uni-popup ref="statusPopup" type="center">
      <view class="status-popup">
        <view class="popup-title">修改订单状态</view>
        <view class="status-list">
          <view 
            v-for="(status, index) in ['待支付', '待发货', '待收货', '已完成', '退款/售后']" 
            :key="index"
            :class="['status-item', { active: currentStatus === index }]"
            @tap="selectStatus(index)"
          >
            <view :class="['status-dot', `status-dot-${index}`]"></view>
            <text>{{ status }}</text>
          </view>
        </view>
        <view class="popup-actions">
          <button class="cancel-btn" @tap="cancelStatusChange">取消</button>
          <button class="confirm-btn" @tap="confirmStatusChange">确认修改</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '@/utils/request'
import { parseExcelData, exportWorkbook, getExcelFromApi, exportToUserSelectedLocation } from '@/utils/excelUtils'

// 导出状态
const exporting = ref(false)

// 订单状态筛选
const orderStatus = ['全部状态', '待支付', '待发货', '待收货', '已完成', '退款/售后']
const statusIndex = ref(0)

// 订单列表
const orderList = ref([])
const total = ref(0)
const pageSize = ref(10)
const pageNum = ref(1)

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value) || 1
})

// 发货表单
const shipPopup = ref(null)
const statusPopup = ref(null) // 状态修改弹窗
const currentOrderId = ref('')
const currentStatus = ref(0) // 当前选中的状态
const originalStatus = ref(0) // 原始状态
const shipForm = ref({
  company: '',
  trackingNo: ''
})

// 状态选择处理
const onStatusChange = (e) => {
  statusIndex.value = e.detail.value
}

// 获取订单列表
const getOrderList = async () => {
  try {
    uni.showLoading({
      title: '加载中'
    })
    
    // 构建URL查询参数
    let url = `https://bgnc.online/api/order/all?pageNum=${pageNum.value}&pageSize=${pageSize.value}&orderByColumn=createTime&isAsc=desc`
    
    // 添加筛选条件
    if (statusIndex.value > 0) url += `&status=${statusIndex.value - 1}`
    
    const res = await request({
      url: url,
      method: 'GET',
    })
    
    if (res.code === 200 && res.data) {
      // 处理返回的数据格式
      console.log('订单数据:', res.data);
      // 正确处理 rows 和 total
      if (res.data.rows && Array.isArray(res.data.rows)) {
        orderList.value = res.data.rows;
        total.value = res.data.total || 0;
      }
    } else {
      uni.showToast({
        title: res.msg || '获取订单列表失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取订单列表失败', error)
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 查询按钮
const handleSearch = () => {
  pageNum.value = 1
  getOrderList()
}

// 重置按钮
const handleReset = () => {
  statusIndex.value = 0
  pageNum.value = 1
  getOrderList()
}

// 分页导航
const prevPage = () => {
  if (pageNum.value > 1) {
    pageNum.value--
    getOrderList()
  }
}

const nextPage = () => {
  if (pageNum.value < totalPages.value) {
    pageNum.value++
    getOrderList()
  }
}

// 获取订单状态文本
const getStatusText = (status) => {
  switch (parseInt(status)) {
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

// 获取订单状态样式类
const getStatusClass = (status) => {
  switch (parseInt(status)) {
    case 0:
      return 'status-pending-payment'
    case 1:
      return 'status-pending-delivery'
    case 2:
      return 'status-pending-receipt'
    case 3:
      return 'status-completed'
    case 4:
      return 'status-after-sale'
    default:
      return 'status-unknown'
  }
}

// 查看订单详情
const viewOrderDetail = (id) => {
  uni.navigateTo({
    url: `/pages/order/detail?id=${id}&admin=true`
  })
}

// 处理发货
const handleShip = (id) => {
  currentOrderId.value = id
  shipForm.value = {
    company: '',
    trackingNo: ''
  }
  shipPopup.value.open()
}

// 取消发货
const cancelShip = () => {
  shipPopup.value.close()
}

// 确认发货
const confirmShip = async () => {
  // 表单验证
  if (!shipForm.value.company.trim()) {
    uni.showToast({
      title: '请输入物流公司',
      icon: 'none'
    })
    return
  }
  
  if (!shipForm.value.trackingNo.trim()) {
    uni.showToast({
      title: '请输入物流单号',
      icon: 'none'
    })
    return
  }
  
  try {
    uni.showLoading({
      title: '处理中'
    })
    
    const res = await request({
      url: `https://bgnc.online/api/order/ship/${currentOrderId.value}`,
      method: 'PUT',
      data: {
        deliveryCompany: shipForm.value.company,
        deliverySn: shipForm.value.trackingNo
      }
    })
    
    if (res.code === 200) {
      uni.showToast({
        title: '发货成功',
        icon: 'success'
      })
      shipPopup.value.close()
      getOrderList() // 刷新列表
    } else {
      uni.showToast({
        title: res.msg || '发货失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('发货失败', error)
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '暂无'
  
  try {
    // 处理 ISO 8601 格式的日期字符串
    const date = new Date(dateStr.replace(' ', 'T'))
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    
    return `${year}-${month}-${day} ${hour}:${minute}`
  } catch (e) {
    console.error('日期格式化错误:', e, dateStr)
    return dateStr
  }
}

// 格式化手机号，中间4位隐藏
const formatPhone = (phone) => {
  if (!phone) return '暂无';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

// 格式化地址
const formatAddress = (order) => {
  if (!order) return '暂无';
  return `${order.receiverProvince}${order.receiverCity}${order.receiverRegion} ${order.receiverDetailAddress}`;
}

// 格式化订单号，只显示前6位和后6位
const formatOrderId = (id) => {
  if (!id) return '暂无';
  if (id.length <= 12) return id;
  return id.substring(0, 6) + '...' + id.substring(id.length - 6);
}

// 复制订单号
const copyOrderId = (id) => {
  uni.setClipboardData({
    data: id,
    success: () => {
      uni.showToast({
        title: '订单号已复制',
        icon: 'success'
      });
    }
  });
}

// 页面加载时获取订单列表
onMounted(() => {
  getOrderList()
})

// 导出订单
const handleExport = async () => {
  if (exporting.value) return
  
  try {
    exporting.value = true
    
    // 方式1: 先获取数据，再让用户选择保存位置
    getExcelFromApi({
      url: 'https://bgnc.online/api/order/excel',
      method: 'GET',
      header: {
        'content-type': 'application/vnd.ms-excel'
      },
      success: (result) => {
        console.log('Excel数据解析成功:', result)
        
        // 使用新方法让用户选择保存方式
        exportToUserSelectedLocation({
          data: result.data,
          headers: Object.keys(result.data[0] || {}),
          fileName: `订单数据_${Date.now()}.xlsx`,
          success: () => {
            console.log('文件导出成功')
          },
          fail: (error) => {
            console.error('文件导出失败:', error)
            uni.showToast({
              title: '导出失败，请重试',
              icon: 'none'
            })
          }
        })
      },
      fail: (error) => {
        console.error('获取Excel数据失败:', error)
        uni.showToast({
          title: '导出失败，请重试',
          icon: 'none'
        })
      },
      complete: () => {
        exporting.value = false
      }
    })
  } catch (error) {
    console.error('导出订单失败:', error)
    uni.showToast({
      title: '导出失败，请重试',
      icon: 'none'
    })
    exporting.value = false
  }
}

// 处理状态修改
const handleStatusChange = (id, status) => {
  currentOrderId.value = id
  currentStatus.value = parseInt(status)
  originalStatus.value = parseInt(status)
  statusPopup.value.open()
}

// 选择状态
const selectStatus = (index) => {
  currentStatus.value = index
}

// 取消状态修改
const cancelStatusChange = () => {
  statusPopup.value.close()
}

// 确认状态修改
const confirmStatusChange = async () => {
  // 如果状态没有变化,直接关闭弹窗
  if (currentStatus.value === originalStatus.value) {
    statusPopup.value.close()
    return
  }
  
  try {
    uni.showLoading({
      title: '处理中'
    })
    
    const res = await request({
      url: `https://bgnc.online/api/order/status/${currentOrderId.value}`,
      method: 'PUT',
      data: {
        status: currentStatus.value
      }
    })
    
    if (res.code === 200) {
      uni.showToast({
        title: '状态修改成功',
        icon: 'success'
      })
      statusPopup.value.close()
      getOrderList() // 刷新列表
    } else {
      uni.showToast({
        title: res.msg || '状态修改失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('状态修改失败', error)
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style lang="scss">
.order-manage {
  .action-bar {
    background: #ffffff;
    padding: 30rpx;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    
    .filter-section {
      .filter-row {
        display: flex;
        gap: 20rpx;
        margin-bottom: 20rpx;
      }
      
      picker {
        background: #f5f7fa;
        padding: 12rpx 20rpx;
        border-radius: 8rpx;
        flex: 1;
        
        text {
          font-size: 26rpx;
          color: #666;
        }
      }
    }

    .button-row {
      display: flex;
      gap: 20rpx;

      .search-btn {
        display: flex;
        align-items: center;
        background: #3b78db;
        color: #ffffff;
        font-size: 26rpx;
        padding: 12rpx 32rpx;
        border-radius: 8rpx;
        border: none;
        
        .iconfont {
          margin-right: 6rpx;
        }
      }
      
      .reset-btn {
        background: #f5f7fa;
        color: #666;
        font-size: 26rpx;
        padding: 12rpx 32rpx;
        border-radius: 8rpx;
        border: none;
      }
      
      .export-btn {
        background: #67c23a;
        color: #ffffff;
        font-size: 26rpx;
        padding: 12rpx 32rpx;
        border-radius: 8rpx;
        border: none;
      }
    }
  }
  
  .order-cards {
    margin-bottom: 20rpx;
    
    .order-card {
      background: #ffffff;
      border-radius: 12rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
      overflow: hidden;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16rpx 24rpx;
        background-color: #f9fbfe;
        
        .order-time {
          font-size: 24rpx;
          color: #666;
        }
        
        .status-tag {
          display: inline-block;
          padding: 6rpx 20rpx;
          border-radius: 30rpx;
          font-size: 24rpx;
          text-align: center;
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .iconfont {
            margin-left: 4rpx;
            font-size: 20rpx;
            transform: scale(0.8);
          }
        }
      }
      
      .order-id-row {
        display: flex;
        align-items: center;
        padding: 16rpx 24rpx;
        border-bottom: 1rpx solid #f5f5f5;
        background-color: #fafcff;
        
        .id-label {
          font-size: 26rpx;
          color: #666;
          margin-right: 10rpx;
        }
        
        .id-value {
          flex: 1;
          font-size: 26rpx;
          color: #333;
          font-family: Consolas, monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .copy-btn {
          font-size: 22rpx;
          color: #3b78db;
          background-color: rgba(59, 120, 219, 0.1);
          padding: 4rpx 16rpx;
          border-radius: 30rpx;
          margin-left: 20rpx;
          border: none;
          line-height: 1.5;
          height: 44rpx;
        }
      }
      
      .card-body {
        padding: 24rpx;
        
        .info-row {
          display: flex;
          margin-bottom: 16rpx;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          &.address {
            margin-top: 8rpx;
            padding-top: 16rpx;
            border-top: 1rpx dashed #eee;
          }
          
          .info-item {
            flex: 1;
            display: flex;
            align-items: flex-start;
            
            &.full {
              flex: 2;
            }
            
            .label {
              font-size: 26rpx;
              color: #666;
              min-width: 120rpx;
            }
            
            .value {
              flex: 1;
              font-size: 26rpx;
              color: #333;
              word-break: break-all;
              
              &.price {
                color: #ff4d4f;
                font-weight: 500;
              }
            }
          }
        }
      }
      
      .card-footer {
        display: flex;
        justify-content: flex-end;
        padding: 20rpx 24rpx;
        background-color: #fafafa;
        border-top: 1rpx solid #f5f5f5;
        
        .action-btn {
          font-size: 26rpx;
          padding: 10rpx 30rpx;
          border-radius: 8rpx;
          margin-left: 16rpx;
          
          &:not(.ship-btn):not(.delete-btn) {
            background-color: #f5f7fa;
            color: #3b78db;
            border: 1rpx solid #e8e8e8;
          }
          
          &.ship-btn {
            background-color: #3b78db;
            color: #ffffff;
            border: none;
          }
          
          &.delete-btn {
            background-color: #ff4d4f;
            color: #ffffff;
            border: none;
          }
        }
      }
    }
    
    .empty-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100rpx 0;
      background-color: #fff;
      border-radius: 12rpx;
      
      .iconfont {
        font-size: 80rpx;
        color: #ddd;
        margin-bottom: 20rpx;
      }
      
      text {
        font-size: 28rpx;
        color: #999;
      }
    }
  }
  
  .pagination {
    background: #ffffff;
    border-radius: 12rpx;
    padding: 24rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .page-info {
      font-size: 26rpx;
      color: #666;
    }
    
    .page-controls {
      display: flex;
      align-items: center;
      
      .page-btn {
        width: 60rpx;
        height: 60rpx;
        border: 1rpx solid #e8e8e8;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #ffffff;
        margin: 0 10rpx;
        padding: 0;
        
        &:disabled {
          color: #ccc;
          background-color: #f5f5f5;
        }
      }
      
      .page-number {
        font-size: 26rpx;
        color: #333;
        margin: 0 20rpx;
      }
    }
  }
  
  .ship-popup {
    background-color: #fff;
    width: 600rpx;
    border-radius: 16rpx;
    padding: 40rpx;
    
    .popup-title {
      text-align: center;
      font-size: 32rpx;
      font-weight: 500;
      margin-bottom: 40rpx;
    }
    
    .form-item {
      margin-bottom: 30rpx;
      
      .label {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 16rpx;
      }
      
      input {
        width: 100%;
        height: 80rpx;
        border: 1rpx solid #e8e8e8;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        background-color: #f5f7fa;
      }
    }
    
    .popup-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20rpx;
      
      button {
        width: 45%;
        height: 80rpx;
        border-radius: 8rpx;
        font-size: 28rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .cancel-btn {
        background-color: #f5f7fa;
        color: #666;
        border: 1rpx solid #e8e8e8;
      }
      
      .confirm-btn {
        background-color: #3b78db;
        color: #fff;
        border: 1rpx solid #3b78db;
      }
    }
  }
  
  .status-popup {
    background-color: #fff;
    border-radius: 16rpx;
    width: 600rpx;
    padding: 30rpx;
    
    .popup-title {
      font-size: 32rpx;
      font-weight: 500;
      text-align: center;
      margin-bottom: 30rpx;
    }
    
    .status-list {
      .status-item {
        display: flex;
        align-items: center;
        padding: 20rpx;
        margin-bottom: 20rpx;
        border-radius: 8rpx;
        transition: all 0.3s;
        
        &:active {
          opacity: 0.8;
        }
        
        &.active {
          background-color: #f0f5ff;
        }
        
        .status-dot {
          width: 24rpx;
          height: 24rpx;
          border-radius: 50%;
          margin-right: 16rpx;
          
          &.status-dot-0 {
            background-color: #fa8c16; // 待支付 - 橙色
          }
          
          &.status-dot-1 {
            background-color: #52c41a; // 待发货 - 绿色
          }
          
          &.status-dot-2 {
            background-color: #1890ff; // 待收货 - 蓝色
          }
          
          &.status-dot-3 {
            background-color: #722ed1; // 已完成 - 紫色
          }
          
          &.status-dot-4 {
            background-color: #eb2f96; // 退款/售后 - 粉色
          }
        }
        
        text {
          font-size: 28rpx;
          color: #333;
        }
      }
    }
  }
  
  .status-tag {
    display: inline-flex;
    align-items: center;
    padding: 4rpx 16rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    
    &.status-pending-payment {
      background-color: #fff7e6;
      color: #fa8c16;
      border: 1rpx solid #ffd591;
    }
    
    &.status-pending-delivery {
      background-color: #f6ffed;
      color: #52c41a;
      border: 1rpx solid #b7eb8f;
    }
    
    &.status-pending-receipt {
      background-color: #e6f7ff;
      color: #1890ff;
      border: 1rpx solid #91d5ff;
    }
    
    &.status-completed {
      background-color: #f9f0ff;
      color: #722ed1;
      border: 1rpx solid #d3adf7;
    }
    
    &.status-after-sale {
      background-color: #fff0f6;
      color: #eb2f96;
      border: 1rpx solid #ffadd2;
    }
    
    &.status-unknown {
      background-color: #f5f5f5;
      color: #999;
      border: 1rpx solid #d9d9d9;
    }
  }
  
  .popup-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 20rpx;
    
    button {
      width: 45%;
      height: 80rpx;
      border-radius: 8rpx;
      font-size: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .cancel-btn {
      background-color: #f5f7fa;
      color: #666;
      border: 1rpx solid #e8e8e8;
    }
    
    .confirm-btn {
      background-color: #3b78db;
      color: #fff;
      border: 1rpx solid #3b78db;
    }
  }
}
</style> 