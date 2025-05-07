<template>
  <view class="user-manage">
    <!-- 搜索和筛选区 -->
    <view class="search-bar">
      <view class="filter-options">
        <!-- 年份选择器 -->
        <picker 
          mode="selector" 
          :range="yearOptions" 
          :value="selectedYearIndex"
          @change="onYearChange"
          class="year-picker"
        >
          <text>{{ yearOptions[selectedYearIndex] }}</text>
        </picker>
        
        <button class="query-btn" @tap="queryConsume">查询</button>
        
        <picker 
          mode="selector" 
          :range="vipLevels" 
          :value="selectedLevel"
          @change="onLevelChange"
        >
          <text>{{ vipLevels[selectedLevel] }}</text>
        </picker>
      </view>
    </view>

    <!-- 用户列表 -->
    <view class="user-list-container">
      <!-- 用户列表内容 -->
      <view class="user-list">
        <!-- 表头 -->
        <view class="list-header">
          <view class="header-cell user-info">用户信息</view>
          <view class="header-cell vip">会员等级</view>
          <view class="header-cell gender">性别</view>
          <view class="header-cell consume">消费</view>
          <view class="header-cell operate">操作</view>
        </view>

        <!-- 加载中状态 -->
        <view v-if="loading" class="loading-tip">
          <uni-icons type="spinner-cycle" size="30" color="#4a90e2"></uni-icons>
          <text>加载中...</text>
        </view>

        <!-- 空数据状态 -->
        <view v-else-if="userList.length === 0" class="empty-tip">
          暂无用户数据
        </view>

        <!-- 用户数据列表 -->
        <block v-else>
          <view class="user-row" v-for="user in userList" :key="user.id">
            <!-- 用户信息 -->
            <view class="cell user-info">
              <image :src="user.userAvatar || '/static/images/default-avatar.png'" class="avatar"></image>
              <view class="user-details">
                <text class="username">{{ user.userName || '未设置昵称' }}</text>
                <text class="phone">{{ user.phone || '未绑定手机' }}</text>
              </view>
            </view>
            
            <!-- 会员等级 -->
            <view class="cell vip">
              <text class="vip-badge">VIP {{ user.memberLevel || 1 }}</text>
            </view>
            
            <!-- 性别 -->
            <view class="cell gender">
              <text>{{ user.userSex === '1' ? '男' : user.userSex === '2' ? '女' : '未知' }}</text>
            </view>
            
            <!-- 消费金额 -->
            <view class="cell consume">
              <text class="amount">¥{{ user.consumeQuota || '0.00' }}</text>
            </view>
            
            <!-- 操作按钮 -->
            <view class="cell operate">
              <picker 
                mode="selector" 
                :range="vipLevels.slice(1)" 
                :value="(user.memberLevel || 1) - 1"
                @change="(e) => handleEditLevelChange(e, user)"
              >
                <button class="edit-btn">修改</button>
              </picker>
            </view>
          </view>
        </block>
      </view>

      <!-- 分页控制 -->
      <view class="pagination">
        <text 
          class="page-btn" 
          :class="{ disabled: currentPage === 1 }"
          @tap="prevPage"
        >上一页</text>
        <text class="page-number">{{ currentPage }}/{{ totalPages }}</text>
        <text 
          class="page-btn"
          :class="{ disabled: currentPage === totalPages || totalPages === 0 }"
          @tap="nextPage"
        >下一页</text>
      </view>
    </view>

    <!-- 修改等级确认弹窗 -->
    <uni-popup ref="confirmPopup" type="dialog">
      <view class="confirm-dialog">
        <text class="dialog-title">修改会员等级</text>
        <text class="dialog-content">确认将该用户等级修改为 VIP{{ editingLevel }}?</text>
        <view class="dialog-buttons">
          <button @tap="cancelEdit" class="cancel-btn">取消</button>
          <button @tap="confirmEdit" class="confirm-btn">确认</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from '@/utils/request'

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development'

// 搜索关键词
const searchKey = ref('')

// 加载状态
const loading = ref(false)

// VIP等级选项
const vipLevels = ['全部等级', 'VIP1', 'VIP2', 'VIP3']
const selectedLevel = ref(0)
const editingLevel = ref(1)

// 分页数据
const currentPage = ref(1)
const pageSize = ref(5)
const totalPages = ref(1)
const total = ref(0)

// 当前编辑的用户
const currentUser = ref(null)

// 用户列表数据
const userList = ref([])

// 弹窗引用
const confirmPopup = ref(null)

// 年份选择
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({length: 10}, (_, i) => (currentYear - i).toString())
const selectedYearIndex = ref(0)

// 年份变更处理
const onYearChange = (e) => {
  selectedYearIndex.value = e.detail.value
}

// 查询用户消费
const queryConsume = async () => {
  const year = yearOptions[selectedYearIndex.value]
  try {
    const res = await request({
      url: 'https://bgnc.online/api/user/list',
      method: 'GET',
      data: {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        year: year
      }
    })
    
    if (res.code === 200 && res.data) {
      userList.value = res.data.rows || []
      total.value = res.data.total || 0
      totalPages.value = Math.ceil(total.value / pageSize.value) || 1
    } else {
      uni.showToast({
        title: res.msg || '获取数据失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('查询用户消费失败：', error)
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    })
  }
}

// 获取用户列表
const getUserList = async () => {
  loading.value = true
  try {
    const res = await request({
      url: 'https://bgnc.online/api/user/list',
      method: 'GET',
      data: {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        year: yearOptions[selectedYearIndex.value]
      }
    })
    
    if (res.code === 200 && res.data) {
      console.log('用户列表数据:', res.data)
      userList.value = res.data.rows || []
      total.value = res.data.total || 0
      totalPages.value = Math.ceil(total.value / pageSize.value) || 1
    } else {
      uni.showToast({
        title: res.msg || '获取用户列表失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取用户列表失败：', error)
    uni.showToast({
      title: '获取用户列表失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 搜索用户
const searchUsers = () => {
  currentPage.value = 1
  getUserList()
}

// 等级筛选
const onLevelChange = (e) => {
  selectedLevel.value = e.detail.value
  currentPage.value = 1
  getUserList()
}

// 直接从下拉框修改用户等级
const handleEditLevelChange = (e, user) => {
  const newLevel = parseInt(e.detail.value) + 1
  currentUser.value = user
  editingLevel.value = newLevel
  confirmPopup.value.open()
}

// 取消编辑
const cancelEdit = () => {
  confirmPopup.value.close()
}

// 确认修改等级
const confirmEdit = async () => {
  if (!currentUser.value) return
  
  try {
    const res = await request({
      url: 'https://bgnc.online/api/usermember/level',
      method: 'PUT',
      data: {
        userId: currentUser.value.id,
        memberLevel: editingLevel.value
      }
    })
    
    if (res.code === 0 || res.code === 200) {
      uni.showToast({
        title: '修改成功',
        icon: 'success'
      })
      
      // 更新本地数据
      const index = userList.value.findIndex(u => u.id === currentUser.value.id)
      if (index !== -1) {
        userList.value[index].memberLevel = editingLevel.value
      }
      
      confirmPopup.value.close()
    } else {
      uni.showToast({
        title: res.message || '修改失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('修改用户等级失败：', error)
    uni.showToast({
      title: '修改用户等级失败',
      icon: 'none'
    })
  }
}

// 分页操作
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    getUserList()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    getUserList()
  }
}

// 初始化
onMounted(() => {
  getUserList()
})
</script>

<style lang="scss">
.user-manage {
  padding: 20rpx;
  
  /* 搜索和筛选区域 */
  .search-bar {
    background: #fff;
    padding: 20rpx;
    border-radius: 8rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    
    .filter-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .year-picker {
        background: #f5f7fa;
        padding: 12rpx 20rpx;
        border-radius: 6rpx;
        font-size: 24rpx;
        color: #666;
      }
      
      .query-btn {
        background: #4a90e2;
        color: #fff;
        font-size: 24rpx;
        padding: 12rpx 30rpx;
        border-radius: 6rpx;
        margin: 0;
        line-height: 1.5;
      }
      
      text {
        background: #f5f7fa;
        padding: 12rpx 20rpx;
        border-radius: 6rpx;
        font-size: 24rpx;
        color: #666;
      }
    }
  }
  
  /* 用户列表容器 */
  .user-list-container {
    background: #fff;
    border-radius: 8rpx;
    padding: 0;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    overflow: hidden;
    
    /* 用户列表 */
    .user-list {
      padding: 0;
      
      /* 表头 */
      .list-header {
        display: flex;
        align-items: center;
        background: #f8f9fa;
        padding: 16rpx 0;
        font-size: 24rpx;
        color: #666;
        border-bottom: 1rpx solid #eee;
        
        .header-cell {
          text-align: center;
          padding: 0 6rpx;
          box-sizing: border-box;
          
          &.user-info {
            flex: 3;
            text-align: left;
            padding-left: 20rpx;
          }
          
          &.vip {
            flex: 1.2;
          }
          
          &.gender {
            flex: 0.8;
          }
          
          &.consume {
            flex: 1;
          }
          
          &.operate {
            flex: 1.5;
          }
        }
      }
      
      /* 用户行 */
      .user-row {
        display: flex;
        align-items: center;
        padding: 16rpx 0;
        border-bottom: 1rpx solid #eee;
        
        &:last-child {
          border-bottom: none;
        }
        
        /* 单元格通用样式 */
        .cell {
          text-align: center;
          padding: 0 6rpx;
          font-size: 24rpx;
          box-sizing: border-box;
          
          &.user-info {
            flex: 3;
            display: flex;
            align-items: center;
            text-align: left;
            padding-left: 20rpx;
            
            .avatar {
              width: 60rpx;
              height: 60rpx;
              border-radius: 50%;
              background: #f0f2f5;
              margin-right: 12rpx;
              flex-shrink: 0;
            }
            
            .user-details {
              flex: 1;
              overflow: hidden;
              
              .username {
                display: block;
                font-size: 22rpx;
                color: #333;
                margin-bottom: 4rpx;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              
              .phone {
                display: block;
                font-size: 20rpx;
                color: #999;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }
          
          &.vip {
            flex: 1.2;
            
            .vip-badge {
              display: inline-block;
              padding: 2rpx 8rpx;
              background: rgba(74, 144, 226, 0.1);
              color: #4a90e2;
              border-radius: 4rpx;
              font-size: 20rpx;
            }
          }
          
          &.gender {
            flex: 0.8;
            font-size: 22rpx;
          }
          
          &.consume {
            flex: 1;
            
            .amount {
              color: #ff6b00;
              font-weight: 500;
              font-size: 22rpx;
            }
          }
          
          &.operate {
            flex: 1.5;
            
            .edit-btn {
              display: inline-block;
              background: #4a90e2;
              color: #fff;
              font-size: 15rpx;
              height: 50rpx;
              line-height: 50rpx;
              border-radius: 6rpx;
              padding: 0 16rpx;
              margin: 0;
              border: none;
            }
          }
        }
      }
      
      /* 加载和空状态 */
      .loading-tip, .empty-tip {
        padding: 40rpx 0;
        text-align: center;
        color: #999;
        font-size: 24rpx;
      }
    }
    
    /* 分页区域 */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 30rpx 0;
      border-top: 1rpx solid #eee;
      
      .page-btn {
        padding: 10rpx 24rpx;
        font-size: 24rpx;
        color: #4a90e2;
        
        &.disabled {
          color: #ccc;
        }
      }
      
      .page-number {
        margin: 0 24rpx;
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

/* 弹窗样式 */
.confirm-dialog {
  padding: 40rpx;
  width: 80%;
  background: #fff;
  border-radius: 12rpx;
  
  .dialog-title {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 30rpx;
    text-align: center;
    font-weight: 500;
  }
  
  .dialog-content {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 40rpx;
    text-align: center;
    line-height: 1.5;
  }
  
  .dialog-buttons {
    display: flex;
    justify-content: space-between;
    
    button {
      flex: 1;
      margin: 0 15rpx;
      font-size: 28rpx;
      padding: 16rpx 0;
      border-radius: 8rpx;
      
      &.cancel-btn {
        background: #f5f7fa;
        color: #666;
      }
      
      &.confirm-btn {
        background: #4a90e2;
        color: #fff;
      }
    }
  }
}
</style> 