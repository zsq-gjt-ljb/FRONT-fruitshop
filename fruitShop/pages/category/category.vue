<template>
  <view class="category-container">
    <view class="category-sidebar">
      <!-- 左侧分类菜单 -->
      <scroll-view scroll-y class="sidebar-scroll">
        <view 
          v-for="(item, index) in categories" 
          :key="item.id"
          :class="['sidebar-item', currentCategoryId === item.id ? 'active' : '']"
          @tap="selectCategory(item)"
        >
          <text class="category-name">{{ item.name }}</text>
        </view>
      </scroll-view>
    </view>
    <view class="category-content">
      <!-- 右侧商品列表 -->
      <!-- <view class="header">
        <view class="title">南茶北果分类</view>
        <view class="description">发现更多优质商品</view>
      </view> -->
      
      <view class="content-header">
        <text class="current-category">{{ currentCategory?.name || '全部商品' }}</text>
      </view>
      
      <!-- 添加搜索框 -->
      <view class="search-box">
        <uni-icons type="search" size="18" color="#4a90e2"></uni-icons>
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="在当前分类中搜索" 
          confirm-type="search"
          @confirm="handleSearch"
          class="search-input"
        />
        <view v-if="searchKeyword" class="clear-icon" @tap="clearSearch">
          <uni-icons type="clear" size="16" color="#999"></uni-icons>
        </view>
      </view>
      
      <!-- 添加排序选项栏 -->
      <view class="sort-bar">
        <view 
          class="sort-item" 
          :class="{ active: sortType === 'default' }"
          @tap="setSortType('default')"
        >
          <text>综合</text>
        </view>
        <view 
          class="sort-item" 
          :class="{ active: sortType === 'sales' }"
          @tap="setSortType('sales')"
        >
          <text>销量</text>
        </view>
        <view 
          class="sort-item price-sort" 
          :class="{ active: sortType === 'price' }"
          @tap="setSortType('price')"
        >
          <text>价格</text>
          <view class="price-arrows">
            <view class="arrow up" :class="{ active: sortType === 'price' && !priceSortAsc }"></view>
            <view class="arrow down" :class="{ active: sortType === 'price' && priceSortAsc }"></view>
          </view>
        </view>
      </view>
      
      <!-- 添加加载状态显示 -->
      <view class="loading-container" v-if="isLoading">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <view class="product-grid" v-else>
        <view 
          v-for="(product, index) in productList" 
          :key="product.id"
          class="product-item"
          @tap="goToDetail(product.id)"
        >
          <image :src="product.indexPic || '/static/images/default-product.png'" mode="aspectFill" class="product-image"></image>
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-price">{{ product.price || '暂无价格' }}</text>
          </view>
        </view>
        
        <view v-if="productList.length === 0" class="empty-tip">
          <image src="/static/images/empty-cart.png" mode="aspectFit" class="empty-image"></image>
          <text class="empty-text">{{ isSearchMode ? '未找到相关商品' : '该分类暂无商品，敬请期待' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import request from '@/utils/request'

// 响应式数据
const categories = ref([])
const currentCategory = ref(null)
const currentCategoryId = ref('')
const productList = ref([])
const isLoading = ref(false)
const searchKeyword = ref('')
const isSearchMode = ref(false)
const sortType = ref('default')
const priceSortAsc = ref(true)

// 监听搜索关键词变化
watch(searchKeyword, (newValue) => {
  if (!newValue && isSearchMode.value) {
    // 如果清空了搜索关键词且当前是搜索模式，恢复原来的分类商品列表
    isSearchMode.value = false
    loadCategoryProducts()
  }
})

// 清空搜索关键词
const clearSearch = () => {
  searchKeyword.value = ''
  isSearchMode.value = false
  loadCategoryProducts()
}

// 加载当前分类的商品
const loadCategoryProducts = () => {
  if (currentCategory.value) {
    if (currentCategory.value.id === 'all') {
      getAllProducts()
    } else {
      getProductsByCategory(currentCategory.value.id)
    }
  }
}

// 处理搜索请求
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    // 如果搜索关键词为空，返回正常分类显示
    isSearchMode.value = false
    loadCategoryProducts()
    return
  }
  
  isSearchMode.value = true
  searchProducts()
}

// 搜索商品
const searchProducts = async () => {
  try {
    isLoading.value = true
    productList.value = [] // 清空之前的商品列表
    
    // 构建请求参数
    const params = {
      name: searchKeyword.value
    }
    
    // 如果不是"全部"分类，添加分类ID参数
    if (currentCategory.value && currentCategory.value.id !== 'all') {
      params.categoryId = currentCategory.value.id
    }
    
    // 构建查询字符串
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
    
    const res = await request({
      url: `https://bgnc.online/api/product/list?${queryString}`,
      method: 'GET'
    })
    
    console.log('搜索结果返回:', res)
    if (res.code === 200) {
      productList.value = res.data
      
      // 处理商品价格 - 从SKUs中提取第一个价格作为显示价格
      productList.value = productList.value.map(product => {
        if (product.skus && product.skus.length > 0) {
          product.price = product.skus[0].price
        }
        return product
      })
      
      // 应用排序
      applySorting()
    }
  } catch (error) {
    console.error('搜索商品失败：', error)
    uni.showToast({
      title: '搜索失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 我们需要确保onShow钩子在uni-app环境中正确运行
onShow(() => {
  console.log('分类页面显示');
  try {
    // 检查是否有从首页传来的选中分类ID
    const selectedId = uni.getStorageSync('selectedCategoryId');
    console.log('读取到的分类ID:', selectedId);
    
    // 检查是否需要强制选中分类
    const forceSelect = uni.getStorageSync('forceSelectCategory');
    console.log('是否强制选中分类:', forceSelect);
    
    if (selectedId) {
      // 将ID转为字符串确保比较一致
      currentCategoryId.value = String(selectedId);
      console.log('设置当前分类ID:', currentCategoryId.value);
      
      // 如果已经加载了分类列表
      if (categories.value && categories.value.length > 0) {
        console.log('查找匹配分类...');
        // 查找匹配的分类
        const category = categories.value.find(item => String(item.id) === String(selectedId));
        if (category) {
          console.log('找到匹配分类:', category.name);
          // 选中该分类
          selectCategory(category);
          
          // 如果存在强制选中标记，清除它
          if (forceSelect) {
            uni.removeStorageSync('forceSelectCategory');
          }
        } else {
          console.log('未找到匹配分类');
          // 重新加载分类列表
          getCategories();
        }
      } else {
        console.log('分类列表为空，开始加载分类');
        // 如果分类尚未加载，加载分类列表
        getCategories();
      }
    }
  } catch (e) {
    console.error('读取选中分类ID失败:', e);
  }
});

// 根据分类名称进行模糊匹配查找
const searchCategoryByName = (categoryName) => {
  if (!categoryName || !categories.value || categories.value.length === 0) {
    return null;
  }
  
  console.log('尝试通过名称匹配分类:', categoryName);
  
  // 预定义的名称映射表 - 将自定义分类名映射到可能的实际分类
  const nameMap = {
    '胶东鲜果': ['水果', '新鲜水果', '水果类', '鲜果'],
    '闽南茶点': ['茶点', '茶叶', '点心', '零食', '茶品'],
    '闽西特产': ['特产', '特色', '地方特产', '零食'],
    '海鲜冻品': ['海鲜', '冻品', '水产', '水产品', '海产'],
    '低GI食品': ['低糖', '健康食品', '低热量', '保健食品'],
    '会员好礼': ['礼品', '礼盒', '会员', '套装', '礼物']
  };
  
  // 查找匹配的分类名
  let possibleNames = nameMap[categoryName] || [categoryName];
  
  // 尝试查找包含这些可能名称的分类
  for (const name of possibleNames) {
    for (const category of categories.value) {
      if (category.name.includes(name) || name.includes(category.name)) {
        console.log('找到名称匹配的分类:', category.name);
        return category;
      }
    }
  }
  
  console.log('未找到匹配的分类');
  return null;
};

// 获取分类列表
const getCategories = async () => {
  try {
    isLoading.value = true
    const res = await request({
      url: 'https://bgnc.online/api/category/list',
      method: 'GET'
    })
    
    console.log('分类数据返回:', res)
    if (res.code === 200) {
      // 添加"全部"分类
      const allCategory = {
        id: 'all',
        name: '全部商品'
      }
      categories.value = [allCategory, ...res.data]
      console.log('categories.value', categories.value)
      
      // 检查是否有预选分类ID
      if (currentCategoryId.value) {
        console.log('处理预选分类ID:', currentCategoryId.value);
        // 将两个ID都转为字符串进行比较
        const category = categories.value.find(item => String(item.id) === String(currentCategoryId.value));
        
        if (category) {
          console.log('找到匹配的分类:', category.name);
          selectCategory(category);
          
          // 检查是否强制选中分类
          const forceSelect = uni.getStorageSync('forceSelectCategory');
          if (forceSelect) {
            // 清除标记
            uni.removeStorageSync('forceSelectCategory');
          } else {
            // 非强制选中时，使用后清除分类ID
            setTimeout(() => {
              uni.removeStorageSync('selectedCategoryId');
              console.log('已清除预选分类ID');
            }, 500);
          }
          return;
        } else {
          console.log('未找到匹配的分类ID, 尝试通过名称匹配');
          
          // 检查是否有传递的分类名称
          const categoryName = uni.getStorageSync('categoryName');
          if (categoryName) {
            // 尝试通过名称匹配
            const matchedCategory = searchCategoryByName(categoryName);
            if (matchedCategory) {
              selectCategory(matchedCategory);
              
              // 清除缓存
              uni.removeStorageSync('categoryName');
              uni.removeStorageSync('selectedCategoryId');
              if (uni.getStorageSync('forceSelectCategory')) {
                uni.removeStorageSync('forceSelectCategory');
              }
              return;
            }
          }
          
          console.log('未找到匹配的分类');
        }
      }
      
      // 默认选中第一个分类(全部)
      if (categories.value.length > 0) {
        selectCategory(categories.value[0])
      }
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 选择分类
const selectCategory = (category) => {
  console.log('选择分类:', category.name, category.id);
  currentCategory.value = category
  currentCategoryId.value = category.id
  
  // 重置搜索
  searchKeyword.value = ''
  isSearchMode.value = false
  
  if (category.id === 'all') {
    getAllProducts()
  } else {
    getProductsByCategory(category.id)
  }
}

// 获取所有商品
const getAllProducts = async () => {
  try {
    isLoading.value = true
    productList.value = [] // 清空之前的商品列表
    const res = await request({
      url: 'https://bgnc.online/api/product/list',
      method: 'GET'
    })
    
    console.log('所有商品返回:', res)
    if (res.code === 200) {
      productList.value = res.data
      
      // 处理商品价格 - 从SKUs中提取第一个价格作为显示价格
      productList.value = productList.value.map(product => {
        if (product.skus && product.skus.length > 0) {
          product.price = product.skus[0].price
        }
        return product
      })
      
      // 应用排序
      applySorting()
    }
  } catch (error) {
    console.error('获取所有商品失败：', error)
    uni.showToast({
      title: '获取商品失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 根据分类获取商品
const getProductsByCategory = async (categoryId) => {
  try {
    isLoading.value = true
    productList.value = [] // 清空之前的商品列表
    const res = await request({
      url: `https://bgnc.online/api/product/list?categoryId=${categoryId}`,
      method: 'GET'
    })
    
    console.log('分类商品返回:', res)
    if (res.code === 200) {
      productList.value = res.data
      
      // 处理商品价格 - 从SKUs中提取第一个价格作为显示价格
      productList.value = productList.value.map(product => {
        if (product.skus && product.skus.length > 0) {
          product.price = product.skus[0].price
        }
        return product
      })
      
      // 应用排序
      applySorting()
    }
  } catch (error) {
    console.error('获取分类商品失败：', error)
    uni.showToast({
      title: '获取商品失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 跳转到商品详情
const goToDetail = (productId) => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${productId}`
  })
  console.log('跳转到商品详情:', productId)
}

// 在组件挂载时加载分类数据
onMounted(() => {
  console.log('分类页面已挂载')
  getCategories()
})

// 设置排序类型
const setSortType = (type) => {
  // 如果点击的是当前排序方式
  if (type === sortType.value) {
    // 如果是价格排序，则切换升降序
    if (type === 'price') {
      priceSortAsc.value = !priceSortAsc.value
    }
  } else {
    // 切换到新的排序方式
    sortType.value = type
    // 价格排序默认从低到高
    if (type === 'price') {
      priceSortAsc.value = true
    }
  }
  
  // 应用排序
  applySorting()
}

// 应用排序逻辑
const applySorting = () => {
  if (productList.value.length === 0) return
  
  switch (sortType.value) {
    case 'price':
      // 价格排序
      productList.value.sort((a, b) => {
        const priceA = parseFloat(a.price) || 0
        const priceB = parseFloat(b.price) || 0
        return priceSortAsc.value ? priceA - priceB : priceB - priceA
      })
      break
    case 'sales':
      // 销量排序（如果有销量字段，例如sales）
      productList.value.sort((a, b) => {
        const salesA = a.sales || 0
        const salesB = b.sales || 0
        return salesB - salesA // 销量默认从高到低
      })
      break
    case 'default':
    default:
      // 综合排序（这里可以根据权重、推荐值等进行排序）
      // 目前保持原有顺序，因为默认可能已经是综合排序
      break
  }
}
</script>

<style lang="scss">
.category-container {
  display: flex;
  min-height: 100vh;
  
  .category-sidebar {
    width: 200rpx;
    background-color: #f5f7fa;
    
    .sidebar-scroll {
      height: 100vh;
    }
    
    .sidebar-item {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 30rpx 0;
      border-bottom: 1rpx solid #eee;
      position: relative;
      transition: all 0.3s ease;
      
      &.active {
        background-color: #fff;
        color: #4a90e2;
        font-weight: 500;
        
        &::after {
          content: '';
          position: absolute;
          left: 0;
          top: 30%;
          height: 40%;
          width: 6rpx;
          background-color: #4a90e2;
          border-radius: 0 3rpx 3rpx 0;
        }
      }
      
      .category-name {
        font-size: 28rpx;
        padding: 0 10rpx;
        text-align: center;
        transition: transform 0.2s ease;
        
        &:active {
          transform: scale(0.95);
        }
      }
    }
  }
  
  .category-content {
    flex: 1;
    background-color: #fff;
    padding: 20rpx;
    
    .header {
      padding-bottom: 20rpx;
      border-bottom: 1rpx solid #f0f0f0;
      margin-bottom: 20rpx;
      
      .title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
      }
      
      .description {
        font-size: 28rpx;
        color: #999;
        margin-top: 6rpx;
      }
    }
    
    .content-header {
      padding-bottom: 20rpx;
      border-bottom: 1rpx solid #f0f0f0;
      margin-bottom: 20rpx;
      
      .current-category {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
        position: relative;
        padding-left: 24rpx;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 8rpx;
          height: 28rpx;
          background-color: #4a90e2;
          border-radius: 4rpx;
        }
      }
    }
    
    /* 搜索框样式 */
    .search-box {
      display: flex;
      align-items: center;
      background-color: #f5f7fa;
      border-radius: 30rpx;
      padding: 12rpx 20rpx;
      margin-bottom: 20rpx;
      
      .uni-icons {
        margin-right: 10rpx;
      }
      
      .search-input {
        flex: 1;
        height: 60rpx;
        font-size: 28rpx;
        color: #333;
      }
      
      .clear-icon {
        padding: 10rpx;
      }
    }
    
    .sort-bar {
      display: flex;
      justify-content: space-around;
      padding: 10rpx;
      border-bottom: 1rpx solid #f0f0f0;
      margin-bottom: 20rpx;
      
      .sort-item {
        padding: 10rpx 20rpx;
        border-radius: 30rpx;
        background-color: #f5f7fa;
        transition: all 0.3s ease;
        
        &.active {
          background-color: #fff;
          color: #4a90e2;
          font-weight: 500;
        }
        
        &:active {
          transform: translateY(2rpx);
          box-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.03);
        }
      }
      
      .price-sort {
        position: relative;
        display: flex;
        align-items: center;
        
        .price-arrows {
          position: relative;
          display: flex;
          flex-direction: column;
          margin-left: 6rpx;
          height: 30rpx;
          
          .arrow {
            width: 0;
            height: 0;
            border-left: 6rpx solid transparent;
            border-right: 6rpx solid transparent;
            
            &.up {
              border-bottom: 8rpx solid #999;
              margin-bottom: 4rpx;
              
              &.active {
                border-bottom-color: #4a90e2;
              }
            }
            
            &.down {
              border-top: 8rpx solid #999;
              
              &.active {
                border-top-color: #4a90e2;
              }
            }
          }
        }
      }
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100rpx 0;
      
      .loading-spinner {
        width: 60rpx;
        height: 60rpx;
        border: 4rpx solid #f3f3f3;
        border-top: 4rpx solid #4a90e2;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20rpx;
      }
      
      .loading-text {
        font-size: 28rpx;
        color: #999;
      }
    }
    
    .product-grid {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -10rpx;
      
      .product-item {
        width: calc(50% - 20rpx);
        margin-bottom: 20rpx;
        background-color: #fff;
        border-radius: 12rpx;
        overflow: hidden;
        margin: 0 10rpx 20rpx;
        box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        
        &:active {
          transform: translateY(2rpx);
          box-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.03);
        }
        
        .product-image {
          width: 100%;
          height: 320rpx;
          object-fit: cover;
          background-color: #f9f9f9; /* 图片加载前的背景色 */
        }
        
        .product-info {
          padding: 16rpx;
          
          .product-name {
            font-size: 28rpx;
            color: #333;
            margin-bottom: 10rpx;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            line-height: 1.4;
            height: 78rpx;
          }
          
          .product-price {
            font-size: 32rpx;
            color: #ff6b00;
            font-weight: bold;
            display: flex;
            align-items: center;
            
            &::before {
              content: '¥';
              font-size: 24rpx;
              margin-right: 2rpx;
              font-weight: normal;
            }
          }
        }
      }
      
      .empty-tip {
        width: 100%;
        padding: 100rpx 0;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .empty-image {
          width: 200rpx;
          height: 200rpx;
          margin-bottom: 20rpx;
          opacity: 0.5;
        }
        
        .empty-text {
          font-size: 28rpx;
          color: #999;
        }
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 