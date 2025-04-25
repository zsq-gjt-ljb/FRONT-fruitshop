<template>
  <view class="category-manage">
    <view class="header">
      <view class="title">分类管理</view>
      <view class="description">管理商品分类，修改后将同步到用户端</view>
    </view>
    
    <!-- 添加分类表单 -->
    <view class="add-category-form">
      <view class="form-title">添加新分类</view>
      <view class="form-content">
        <input 
          v-model="newCategory.name" 
          placeholder="分类名称" 
          class="category-input"
        />
        <view class="status-switch">
          <text>状态：</text>
          <switch 
            :checked="newCategory.status === 1" 
            @change="(e) => newCategory.status = e.detail.value ? 1 : 0"
            color="#4a90e2"
          />
          <text>{{ newCategory.status === 1 ? '启用' : '禁用' }}</text>
        </view>
        <button class="add-btn" @click="addCategory">添加分类</button>
      </view>
    </view>
    
    <!-- 分类列表 -->
    <view class="category-list">
      <view class="list-title">分类列表</view>
      <view class="list-header">
        <text class="col name">分类名称</text>
        <text class="col status">状态</text>
        <text class="col action">操作</text>
      </view>
      
      <view v-if="categories.length === 0" class="empty-tip">
        暂无分类数据，请添加
      </view>
      
      <view 
        v-for="(category, index) in categories" 
        :key="category.id" 
        class="category-item"
      >
        <!-- 普通显示模式 -->
        <view v-if="editingIndex !== index" class="category-row">
          <text class="col name">{{ category.name }}</text>
          <text class="col status" :class="category.status === 1 ? 'enabled' : 'disabled'">
            {{ category.status === 1 ? '启用' : '禁用' }}
          </text>
          <view class="col action">
            <button class="edit-btn" @click="startEdit(index)">编辑</button>
            <button class="delete-btn" @click="deleteCategory(category.id)">删除</button>
          </view>
        </view>
        
        <!-- 编辑模式 -->
        <view v-else class="category-row editing">
          <input v-model="editingCategory.name" class="col name edit-input" />
          <view class="col status">
            <switch 
              :checked="editingCategory.status === 1" 
              @change="(e) => editingCategory.status = e.detail.value ? 1 : 0"
              color="#4a90e2"
            />
            <text>{{ editingCategory.status === 1 ? '启用' : '禁用' }}</text>
          </view>
          <view class="col action">
            <button class="save-btn" @click="saveEdit(category.id)">保存</button>
            <button class="cancel-btn" @click="cancelEdit">取消</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'

// 分类列表
const categories = ref([])

// 新分类表单数据
const newCategory = reactive({
  name: '',
  status: 1, // 默认启用
})

// 编辑相关状态
const editingIndex = ref(-1)
const editingCategory = reactive({
  name: '',
  status: 1,
})

// 获取所有分类
const getCategories = async () => {
  try {
    const res = await request({
      url: 'https://bgnc.online/api/category/list',
      method: 'GET'
    })
    
    if (res.code === 200) {
      categories.value = res.data
      console.log('获取到的分类数据:', res.data)
    } else {
      uni.showToast({
        title: res.message || '获取分类失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取分类列表失败：', error)
    uni.showToast({
      title: '获取分类列表失败',
      icon: 'none'
    })
  }
}

// 添加新分类
const addCategory = async () => {
  if (!newCategory.name) {
    uni.showToast({
      title: '请输入分类名称',
      icon: 'none'
    })
    return
  }
  
  try {
    const res = await request({
      url: 'https://bgnc.online/api/category',
      method: 'POST',
      data: {
        name: newCategory.name,
        status: newCategory.status
      }
    })
    
    if (res.code === 200) {
      uni.showToast({
        title: '添加成功',
        icon: 'success'
      })
      
      // 重置表单
      newCategory.name = ''
      newCategory.status = 1
      
      // 刷新列表
      getCategories()
    } else {
      uni.showToast({
        title: res.message || '添加失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('添加分类失败：', error)
    uni.showToast({
      title: '添加分类失败',
      icon: 'none'
    })
  }
}

// 开始编辑分类
const startEdit = (index) => {
  const category = categories.value[index]
  editingCategory.name = category.name
  editingCategory.status = category.status
  editingIndex.value = index
}

// 取消编辑
const cancelEdit = () => {
  editingIndex.value = -1
}

// 保存编辑
const saveEdit = async (id) => {
  if (!editingCategory.name) {
    uni.showToast({
      title: '请输入分类名称',
      icon: 'none'
    })
    return
  }
  
  try {
    const res = await request({
      url: 'https://bgnc.online/api/category',
      method: 'PUT',
      data: {
        id: id,
        name: editingCategory.name,
        status: editingCategory.status
      }
    })
    
    if (res.code === 200) {
      uni.showToast({
        title: '更新成功',
        icon: 'success'
      })
      
      // 退出编辑模式
      editingIndex.value = -1
      
      // 刷新列表
      getCategories()
    } else {
      uni.showToast({
        title: res.message || '更新失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('更新分类失败：', error)
    uni.showToast({
      title: '更新分类失败',
      icon: 'none'
    })
  }
}

// 删除分类
const deleteCategory = async (id) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该分类吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const res = await request({
            url: `https://bgnc.online/api/category/${id}`,
            method: 'DELETE'
          })
          
          if (res.code === 200) {
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
            
            // 刷新列表
            getCategories()
          } else {
            uni.showToast({
              title: res.message || '删除失败',
              icon: 'none'
            })
          }
        } catch (error) {
          console.error('删除分类失败：', error)
          uni.showToast({
            title: '删除分类失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 页面加载时获取分类列表
onMounted(() => {
  getCategories()
})
</script>

<style lang="scss">
.category-manage {
  padding: 20rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
  
  .header {
    margin-bottom: 30rpx;
    
    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 10rpx;
    }
    
    .description {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .add-category-form, .category-list {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 20rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    
    .form-title, .list-title {
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 20rpx;
      padding-bottom: 20rpx;
      border-bottom: 1rpx solid #f0f0f0;
    }
    
    .form-content {
      display: flex;
      flex-direction: column;
      gap: 20rpx;
    }
    
    .category-input {
      height: 80rpx;
      border: 1rpx solid #eee;
      border-radius: 8rpx;
      padding: 0 20rpx;
      font-size: 26rpx;
    }
    
    .status-switch {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      text {
        font-size: 28rpx;
        color: #666;
        margin-right: 20rpx;
      }
    }
    
    .add-btn {
      height: 80rpx;
      background-color: #4a90e2;
      color: #fff;
      border-radius: 8rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
    }
  }
  
  .category-list {
    .list-header {
      display: flex;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      font-size: 26rpx;
      color: #999;
      font-weight: 500;
    }
    
    .empty-tip {
      padding: 40rpx 0;
      text-align: center;
      color: #999;
      font-size: 26rpx;
    }
    
    .category-item {
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    .category-row {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      
      &.editing {
        background-color: #f9f9f9;
      }
    }
    
    .col {
      &.name {
        flex: 2;
      }
      
      &.status {
        flex: 1;
        display: flex;
        align-items: center;
        
        &.enabled {
          color: #67c23a;
        }
        
        &.disabled {
          color: #999;
        }
        
        text {
          margin-left: 10rpx;
        }
      }
      
      &.action {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        gap: 10rpx;
      }
    }
    
    .edit-input {
      height: 60rpx;
      border: 1rpx solid #ddd;
      border-radius: 6rpx;
      padding: 0 10rpx;
      font-size: 24rpx;
    }
    
    .edit-btn, .delete-btn, .save-btn, .cancel-btn {
      padding: 10rpx 20rpx;
      font-size: 24rpx;
      border-radius: 6rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .edit-btn {
      background-color: #4a90e2;
      color: #fff;
    }
    
    .delete-btn {
      background-color: #ff4d4f;
      color: #fff;
    }
    
    .save-btn {
      background-color: #67c23a;
      color: #fff;
    }
    
    .cancel-btn {
      background-color: #f5f5f5;
      color: #666;
    }
  }
}
</style> 