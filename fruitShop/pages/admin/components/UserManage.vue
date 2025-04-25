<template>
  <view class="user-manage">
    <!-- 搜索和筛选区 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="iconfont icon-search"></text>
        <input 
          type="text" 
          v-model="searchKey" 
          placeholder="搜索用户昵称/手机号"
          @confirm="searchUsers"
        />
      </view>
      
      <view class="filter-options">
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
        <text class="col">注册时间</text>
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

        <!-- 注册时间 -->
        <view class="col login-date">
          <text>{{ user.loginDate || '未登录' }}</text>
        </view>

        <!-- 操作按钮 -->
        <view class="col actions">
          <button 
            class="action-btn"
            @tap="handleEditLevel(user)"
          >修改等级</button>
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

    <!-- 修改等级弹窗 -->
    <uni-popup ref="levelPopup" type="dialog">
      <view class="level-dialog">
        <text class="dialog-title">修改会员等级</text>
        <picker 
          mode="selector" 
          :range="vipLevels.slice(1)" 
          :value="editingLevel - 1"
          @change="onEditLevelChange"
        >
          <text>{{ vipLevels[editingLevel] }}</text>
        </picker>
        <view class="dialog-buttons">
          <button @tap="cancelEdit">取消</button>
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
const levelPopup = ref(null)

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
       
      }
    })
    
    if (res.code === 0 || res.code === 200) {
      console.log('用户列表数据:', res.data)
      userList.value = res.data.rows || []
      total.value = res.data.total || 0
      totalPages.value = Math.ceil(total.value / pageSize.value) || 1
    } else {
      uni.showToast({
        title: res.message || '获取用户列表失败',
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

// 修改用户等级
const handleEditLevel = (user) => {
  currentUser.value = user
  editingLevel.value = user.memberLevel || 1
  levelPopup.value.open()
}

// 修改编辑中的等级
const onEditLevelChange = (e) => {
  editingLevel.value = parseInt(e.detail.value) + 1
}

// 取消编辑
const cancelEdit = () => {
  levelPopup.value.close()
}

// 确认修改等级
const confirmEdit = async () => {
  if (!currentUser.value) return
  
  try {
    const res = await request({
      url: 'https://bgnc.online/api/user/updateLevel',
      method: 'PUT',
      data: {
        id: currentUser.value.id,
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
      
      levelPopup.value.close()
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
    padding: 20rpx;
    border-radius: 12rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .search-input {
      flex: 1;
      display: flex;
      align-items: center;
      background: #f5f7fa;
      padding: 12rpx 20rpx;
      border-radius: 8rpx;
      
      input {
        flex: 1;
        font-size: 28rpx;
        margin-left: 12rpx;
      }
    }
    
    .filter-options {
      margin-left: 20rpx;
    }
  }

  .user-list {
    background: #ffffff;
    border-radius: 12rpx;
    padding: 20rpx;
    
    .list-header {
      display: flex;
      padding: 20rpx 0;
      border-bottom: 2rpx solid #f5f7fa;
      font-size: 28rpx;
      color: #999;
      
      .col {
        flex: 1;
        text-align: center;
        
        &:first-child {
          flex: 2;
          text-align: left;
        }
      }
    }
    
    .loading-tip, .empty-tip {
      padding: 60rpx 0;
      text-align: center;
      color: #999;
      font-size: 28rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      text {
        margin-top: 20rpx;
      }
    }
    
    .user-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 2rpx solid #f5f7fa;
      
      .col {
        flex: 1;
        text-align: center;
        
        &.user-info {
          flex: 2;
          display: flex;
          align-items: center;
          text-align: left;
          
          .avatar {
            width: 80rpx;
            height: 80rpx;
            border-radius: 40rpx;
            margin-right: 16rpx;
          }
          
          .info {
            .nickname {
              font-size: 28rpx;
              color: #333;
              margin-bottom: 8rpx;
            }
            
            .phone {
              font-size: 24rpx;
              color: #999;
            }
          }
        }
      }
      
      .action-btn {
        font-size: 24rpx;
        padding: 8rpx 20rpx;
        background: #4a90e2;
        color: #ffffff;
        border-radius: 6rpx;
        border: none;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40rpx;
    
    .page-btn {
      padding: 12rpx 24rpx;
      font-size: 26rpx;
      color: #4a90e2;
      
      &.disabled {
        color: #999;
      }
    }
    
    .page-number {
      margin: 0 20rpx;
      font-size: 26rpx;
      color: #666;
    }
  }
}

.level-dialog {
  padding: 40rpx;
  
  .dialog-title {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 30rpx;
    text-align: center;
  }
  
  .dialog-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 40rpx;
    
    button {
      flex: 1;
      margin: 0 10rpx;
      
      &.confirm-btn {
        background: #4a90e2;
        color: #ffffff;
      }
    }
  }
}
</style> 