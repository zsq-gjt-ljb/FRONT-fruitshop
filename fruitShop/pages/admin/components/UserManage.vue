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
    <view class="user-list">
      <view class="list-header">
        <text class="col">用户信息</text>
        <text class="col">会员等级</text>
        <text class="col">性别</text>
        <text class="col">年度消费</text>
        <text class="col">操作</text>
      </view>

      <view v-if="loading" class="loading-tip">
        <uni-icons type="spinner-cycle" size="30" color="#4a90e2"></uni-icons>
        <text>加载中...</text>
      </view>

      <view v-else-if="userList.length === 0" class="empty-tip">
        暂无用户数据
      </view>

      <view 
        class="user-item" 
        v-for="user in userList" 
        :key="user.id"
      >
        <!-- 用户基本信息 -->
        <view class="col user-info">
          <image :src="user.userAvatar || '/static/images/default-avatar.png'" mode="aspectFill" class="avatar" />
          <view class="info">
            <text class="nickname">{{ user.userName || '未设置昵称' }}</text>
            <text class="phone">{{ user.phone || '未绑定手机' }}</text>
          </view>
        </view>

        <!-- VIP等级 -->
        <view class="col vip-level">
          <text>VIP {{ user.memberLevel || 1 }}</text>
        </view>

        <!-- 性别 -->
        <view class="col user-sex">
          <text>{{ user.userSex === '1' ? '男' : user.userSex === '2' ? '女' : '未知' }}</text>
        </view>

        <!-- 年度消费 -->
        <view class="col consume-quota">
          <text>¥{{ user.consumeQuota || '0.00' }}</text>
        </view>

        <!-- 操作按钮 -->
        <view class="col actions">
          <picker 
            mode="selector" 
            :range="vipLevels.slice(1)" 
            :value="(user.memberLevel || 1) - 1"
            @change="(e) => handleEditLevelChange(e, user)"
          >
            <view class="action-btn">修改等级</view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 分页器 -->
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
import request from '@/utils/request'

// 搜索关键词
const searchKey = ref('')

// 加载状态
const loading = ref(false)

// VIP等级选项
const vipLevels = ['全部等级', 'VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5']
const selectedLevel = ref(0)
const editingLevel = ref(1)

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
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
  .search-bar {
    background: #ffffff;
    padding: 16rpx;
    border-radius: 8rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    
    .search-input {
      flex: 1;
      display: flex;
      align-items: center;
      background: #f5f7fa;
      padding: 10rpx 16rpx;
      border-radius: 6rpx;
      
      input {
        flex: 1;
        font-size: 24rpx;
        margin-left: 10rpx;
      }
    }
    
    .filter-options {
      margin-left: 16rpx;
      display: flex;
      align-items: center;
      gap: 16rpx;
      
      .year-picker {
        background-color: #f5f7fa;
        padding: 8rpx 16rpx;
        border-radius: 6rpx;
        font-size: 24rpx;
        color: #666;
      }
      
      .query-btn {
        background-color: #4a90e2;
        color: #ffffff;
        font-size: 24rpx;
        padding: 8rpx 20rpx;
        border-radius: 6rpx;
        margin: 0;
        line-height: 1.5;
      }
      
      text {
        font-size: 24rpx;
        color: #666;
        background-color: #f5f7fa;
        padding: 8rpx 16rpx;
        border-radius: 6rpx;
      }
    }
  }

  .user-list {
    background: #ffffff;
    border-radius: 8rpx;
    padding: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    
    .list-header {
      display: flex;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f2f5;
      font-size: 22rpx;
      color: #999;
      
      .col {
        flex: 1;
        text-align: center;
        
        &:first-child {
          flex: 2;
          text-align: left;
          padding-left: 16rpx;
        }
      }
    }
    
    .loading-tip, .empty-tip {
      padding: 40rpx 0;
      text-align: center;
      color: #999;
      font-size: 24rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      text {
        margin-top: 16rpx;
      }
    }
    
    .user-item {
      display: flex;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f2f5;
      
      .col {
        flex: 1;
        text-align: center;
        font-size: 24rpx;
        color: #333;
        
        &.user-info {
          flex: 2;
          display: flex;
          align-items: center;
          text-align: left;
          padding-left: 16rpx;
          
          .avatar {
            width: 70rpx;
            height: 70rpx;
            border-radius: 35rpx;
            margin-right: 12rpx;
          }
          
          .info {
            .nickname {
              font-size: 24rpx;
              color: #333;
              margin-bottom: 6rpx;
              display: block;
            }
            
            .phone {
              font-size: 22rpx;
              color: #999;
              display: block;
            }
          }
        }
        
        &.vip-level {
          text {
            background-color: rgba(74, 144, 226, 0.1);
            color: #4a90e2;
            padding: 4rpx 12rpx;
            border-radius: 4rpx;
            font-size: 22rpx;
          }
        }
        
        &.user-sex, &.consume-quota {
          font-size: 22rpx;
          color: #666;
        }
      }
      
      .action-btn {
        font-size: 22rpx;
        padding: 6rpx 16rpx;
        background: #4a90e2;
        color: #ffffff;
        border-radius: 4rpx;
        display: inline-block;
        text-align: center;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 24rpx;
    
    .page-btn {
      padding: 8rpx 20rpx;
      font-size: 24rpx;
      color: #4a90e2;
      
      &.disabled {
        color: #ccc;
      }
    }
    
    .page-number {
      margin: 0 16rpx;
      font-size: 24rpx;
      color: #666;
    }
  }
}

.confirm-dialog {
  padding: 40rpx;
  width: 80%;
  background-color: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  
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
      border: none;
      
      &.cancel-btn {
        background: #f5f7fa;
        color: #666;
      }
      
      &.confirm-btn {
        background: #4a90e2;
        color: #ffffff;
      }
    }
  }
}

.consume-quota {
  font-size: 24rpx;
  color: #ff6b00;
  font-weight: bold;
}
</style> 