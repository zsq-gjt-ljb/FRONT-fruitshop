<template>
  <view class="address-list-container">
    <!-- 搜索框 -->
    <view class="search-box">
      <view class="search-input">
        <text class="iconfont icon-search"></text>
        <input type="text" placeholder="输入姓名/手机号搜索" v-model="searchText" />
      </view>
    </view>
    
    <!-- 地址列表 -->
    <view class="address-list" v-if="addressList.length > 0">
      <view class="address-item" v-for="(address, index) in filteredAddresses" :key="address.id">
        <view class="address-content" @tap="editAddress(address.id)">
          <view class="user-info">
            <text class="name">{{address.name}}</text>
            <text class="phone">{{address.phone}}</text>
          </view>
          <view class="address-detail">
            <text>{{address.province}}{{address.city}}{{address.district}} {{address.detail}}</text>
          </view>
        </view>
        
        <view class="address-actions">
          <view class="default-tag" @tap="setDefaultAddress(address.id)" :class="{active: address.isDefault}">
            <text class="tag-icon">●</text>
            <text>默认地址</text>
          </view>
          <view class="delete-btn" @tap="deleteAddress(address.id)">
            <text>删除</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <image src="/static/images/empty-address.png" mode="aspectFit"></image>
      <text>您还没有添加收货地址</text>
    </view>
    
    <!-- 添加地址按钮 -->
    <view class="add-address-btn" @tap="addNewAddress">
      <text>+ 添加地址</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '@/utils/request'

// 搜索文本
const searchText = ref('')

// 地址列表
const addressList = ref([])

// 过滤后的地址列表
const filteredAddresses = computed(() => {
  if (!searchText.value) return addressList.value
  
  return addressList.value.filter(address => 
    address.name.includes(searchText.value) || 
    address.phone.includes(searchText.value)
  )
})

// 获取地址列表
const getAddressList = async () => {
  try {
    const res = await request({
      url: 'http://82.156.12.240:8080/api/addressbook/list',
      method: 'GET'
    })
    
    console.log('获取地址列表响应:', res)
    
    if (res.code === 200 || res.code === 0) {
      addressList.value = res.data || []
    } else {
      uni.showToast({
        title: res.msg || '获取地址失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取地址列表失败：', error)
    uni.showToast({
      title: '获取地址失败，请稍后再试',
      icon: 'none'
    })
  }
}

// 添加新地址
const addNewAddress = () => {
  uni.navigateTo({
    url: '/pages/address/edit'
  })
}

// 编辑地址
const editAddress = (id) => {
  uni.navigateTo({
    url: `/pages/address/edit`
  })
}




// 删除地址
const deleteAddress = (id) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该收货地址吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await request({
            url: `http://82.156.12.240:8080/api/addressbook/?id=${id}`,
            method: 'DELETE',
            data: { id }
          })
          
          if (result.code === 200 ) {
            // 移除本地数据
            addressList.value = addressList.value.filter(item => item.id !== id)
            
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
          } else {
            uni.showToast({
              title: result.msg || '删除失败',
              icon: 'none'
            })
          }
        } catch (error) {
          uni.showToast({
            title: '删除失败，请稍后再试',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 页面显示时获取最新地址数据
onMounted (() => {
  getAddressList()
})
</script>

<style lang="scss">
.address-list-container {
  min-height: 100vh;
  background-color: #f8f9fc;
  padding-bottom: 140rpx; // 为底部按钮留出空间
  
  .search-box {
    padding: 20rpx;
    background: #ffffff;
    
    .search-input {
      height: 72rpx;
      background: #f5f5f5;
      border-radius: 36rpx;
      display: flex;
      align-items: center;
      padding: 0 30rpx;
      
      .icon-search {
        font-size: 28rpx;
        color: #999999;
        margin-right: 16rpx;
      }
      
      input {
        flex: 1;
        height: 100%;
        font-size: 28rpx;
      }
    }
  }
  
  .address-list {
    padding: 20rpx;
    
    .address-item {
      background: #ffffff;
      border-radius: 16rpx;
      padding: 30rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
      
      .address-content {
        border-bottom: 1px solid #f5f5f5;
        padding-bottom: 20rpx;
        
        .user-info {
          margin-bottom: 10rpx;
          
          .name {
            font-size: 32rpx;
            font-weight: 500;
            margin-right: 20rpx;
          }
          
          .phone {
            font-size: 28rpx;
            color: #666666;
          }
        }
        
        .address-detail {
          font-size: 28rpx;
          color: #333333;
          line-height: 1.4;
        }
      }
      
      .address-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 20rpx;
        
        .default-tag {
          display: flex;
          align-items: center;
          font-size: 28rpx;
          color: #999999;
          
          &.active {
            color: #FF9500;
            
            .tag-icon {
              color: #FF9500;
            }
          }
          
          .tag-icon {
            font-size: 32rpx;
            margin-right: 8rpx;
            color: #CCCCCC;
          }
        }
        
        .delete-btn {
          font-size: 28rpx;
          color: #FF4D4F;
        }
      }
    }
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;
    
    image {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 30rpx;
    }
    
    text {
      font-size: 28rpx;
      color: #999999;
    }
  }
  
  .add-address-btn {
    position: fixed;
    bottom: 40rpx;
    left: 40rpx;
    right: 40rpx;
    height: 90rpx;
    background: #FF9500;
    color: #FFFFFF;
    border-radius: 45rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    
    &:active {
      opacity: 0.9;
    }
  }
}
</style> 