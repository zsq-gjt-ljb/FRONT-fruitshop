<template>
  <view class="home-container">
    <!-- 顶部搜索栏 - 全新蓝色主题 -->
    <view class="header-section">
      <view class="brand-wrapper">
        <view class="brand-logo"></view>
        <view class="brand-name">南茶北果</view>
      </view>
      <view class="search-box" @tap="navigateToSearch">
        <uni-icons type="search" size="16" color="#4B91F1"></uni-icons>
        <text class="search-placeholder">搜索优质好物</text>
      </view>
    </view>
    
    <!-- 轮播图区 - 升级版蓝色主题 -->
    <view class="banner-wrapper">
      <view class="banner-bg-decorator"></view>
      <swiper 
        class="banner-swiper" 
        indicator-dots
        autoplay 
        circular
        :interval="3000" 
        :duration="500"
        :indicator-color="'rgba(255,255,255,0.5)'"
        :indicator-active-color="'#4B91F1'"
      >
        <swiper-item v-for="(banner, index) in bannerList" :key="banner.id" @tap="goToDetail(banner.productId)">
          <image :src="banner.indexPic" mode="aspectFill" class="banner-image"></image>
          <view class="banner-content">
            <view class="banner-info">
              <text class="banner-name">{{ banner.name }}</text>
              <view class="banner-btn">
                <text>查看</text>
                <uni-icons type="arrowright" size="12" color="#fff"></uni-icons>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>
    
    <!-- 品牌承诺部分 - 蓝色主题 -->
    <view class="promise-section">
      <view class="promise-item">
        <view class="promise-icon-bg">
          <uni-icons type="medal" size="18" color="#4B91F1"></uni-icons>
        </view>
        <text>品质保障</text>
      </view>
      <view class="divider"></view>
      <view class="promise-item">
        <view class="promise-icon-bg">
          <uni-icons type="refreshempty" size="18" color="#4B91F1"></uni-icons>
        </view>
        <text>无忧退换</text>
      </view>
      <view class="divider"></view>
      <view class="promise-item">
        <view class="promise-icon-bg">
          <uni-icons type="cart" size="18" color="#4B91F1"></uni-icons>
        </view>
        <text>品质甄选</text>
      </view>
    </view>
    
    <!-- 分类部分 - 蓝色主题设计 -->
    <view class="section-card category-section">
      <view class="section-header">
        <view class="title-wrapper">
          <view class="title-decorator"></view>
          <text class="section-title">商品分类</text>
        </view>
        <text class="view-more" @tap="navigateToAllCategories">全部分类 ></text>
      </view>
      
      <scroll-view class="category-scroll" scroll-x show-scrollbar="false">
        <view class="category-list">
          <view 
            v-for="(category, index) in categories" 
            :key="category.id"
            class="category-item"
            @tap="navigateToCategory(category)"
          >
            <view class="category-icon-wrapper">
              <image :src="category.image || '/static/images/category-default.png'" mode="aspectFill" class="category-image"></image>
            </view>
            <text class="category-name">{{ category.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 首页推荐商品 - 蓝色主题设计 -->
    <view class="section-card featured-section">
      <view class="section-header">
        <view class="title-wrapper">
          <view class="title-decorator"></view>
          <text class="section-title">精品推荐</text>
        </view>
        <text class="view-more">精选好物 ></text>
      </view>
      
      <view class="product-grid">
        <view 
          v-for="(product, index) in homeProducts" 
          :key="product.id"
          class="product-item"
          @tap="goToDetail(product.productId)"
        >
          <view class="product-image-wrapper">
            <image :src="product.indexPic" mode="aspectFill" class="product-image"></image>
            <view class="product-tag" v-if="index < 2">精选</view>
          </view>
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <view class="product-meta">
              <text class="product-price">{{ product.price || '暂无价格' }}</text>
              <view class="price-btn-group">
                
                <view class="cart-btn" @tap.stop="showQuickBuy(product)">
                  <uni-icons type="cart" size="16" color="#fff"></uni-icons>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 添加悬浮客服按钮 -->
    <FloatingContact 
      :bottom="150"
      :right="30"
      @contact="handleContactEvent"
    />
    
    <!-- 底部品牌 - 蓝色主题 -->
    <view class="footer">
      <view class="footer-logo">
        <text class="logo-text">南茶北果</text>
      </view>
      <view class="footer-slogan">品质生活 自然美味</view>
      <view class="footer-copyright">© 2023 南茶北果 All Rights Reserved</view>
    </view>
    
    <!-- 规格选择弹窗 - 高级设计 -->
    <view class="specs-popup" v-if="showSpecs">
      <view class="popup-mask" @tap="hideSpecsPopup"></view>
      <view class="popup-content">
        <!-- 弹窗头部 -->
        <view class="popup-header">
          <view class="product-brief">
            <image :src="currentProduct.image" mode="aspectFill" class="popup-image"></image>
            <view class="brief-info">
              <view class="popup-price">¥{{ currentProduct.price }} <text class="popup-original-price" v-if="currentProduct.originalPrice">¥{{ currentProduct.originalPrice }}</text></view>
              <view class="popup-stock">库存 · {{ currentProduct.stock || 0 }}</view>
              <view class="popup-selected">已选 · {{ selectedSpec }}</view>
            </view>
          </view>
          <view class="close-btn" @tap="hideSpecsPopup">
            <uni-icons type="closeempty" size="20" color="#999"></uni-icons>
          </view>
        </view>
        
        <!-- 规格选择区域 -->
        <view class="specs-section">
          <view class="specs-title">规格</view>
          <view class="specs-options">
            <view 
              v-for="(spec, index) in currentProduct.specs" 
              :key="index"
              :class="['spec-option', selectedSpecIndex === index ? 'active' : '']"
              @tap="selectSpec(index)"
            >
              {{ spec.name }}
            </view>
          </view>
        </view>
        
        <!-- 数量调整区域 -->
        <view class="quantity-section">
          <view class="quantity-title">数量</view>
          <view class="quantity-adjuster">
            <view 
              :class="['quantity-btn', 'minus', quantity <= 1 ? 'disabled' : '']" 
              @tap="decreaseQuantity"
            >-</view>
            <input 
              type="number" 
              v-model.number="quantity" 
              class="quantity-input"
              @blur="validateQuantity"
            />
            <view 
              :class="['quantity-btn', 'plus', quantity >= currentProduct.stock ? 'disabled' : '']" 
              @tap="increaseQuantity"
            >+</view>
          </view>
        </view>
        
        <!-- 弹窗底部操作按钮 -->
        <view class="popup-actions">
          <view class="action-btn add-to-cart" @tap="addToCartWithSpec">加入购物车</view>
          <view class="action-btn buy-now" @tap="buyNow">立即购买</view>
        </view>
      </view>
    </view>

    <!-- 添加快速购买弹窗 -->
    <view class="quick-buy-popup" v-if="showQuickBuyPopup">
      <view class="popup-mask" @tap="hideQuickBuyPopup"></view>
      <view class="popup-content">
        <!-- 弹窗头部 - 商品信息 -->
        <view class="popup-header">
          <image :src="quickBuyProduct.indexPic" mode="aspectFill" class="product-thumb"></image>
          <view class="header-right">
            <view class="popup-price">¥ {{ quickBuyProduct.price }}</view>
            <view class="popup-stock">库存：{{ quickBuyProduct.stock || 1000 }}</view>
            <view class="popup-selected">已选规格：{{ selectedSpec }}</view>
          </view>
          <view class="close-btn" @tap="hideQuickBuyPopup">
            <uni-icons type="close" size="16" color="#666"></uni-icons>
          </view>
        </view>
        
        <!-- 规格选择区 -->
        <view class="popup-section">
          <view class="section-title">规格</view>
          <view class="specs-list">
            <view 
              v-for="(spec, index) in productSpecs" 
              :key="index" 
              :class="['spec-item', selectedSpecIndex === index ? 'active' : '']"
              @tap="selectSpec(index)"
            >
              {{ spec.name }} 
              <text class="spec-price" v-if="spec.price">¥{{ spec.price }}</text>
              <text class="spec-stock" v-if="spec.stock !== undefined">(库存:{{ spec.stock }})</text>
            </view>
          </view>
        </view>
        
        <!-- 数量选择区 -->
        <view class="popup-section">
          <view class="section-title">购买数量：</view>
          <view class="quantity-control">
            <view class="quantity-btn minus" @tap="decreaseQuantity">−</view>
            <input type="number" class="quantity-input" v-model.number="quantity" @blur="validateQuantity" />
            <view class="quantity-btn plus" @tap="increaseQuantity">+</view>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="action-buttons">
          <view class="action-btn cart-btn" @tap="addToCartWithSpec">加入购物车</view>
          <view class="action-btn buy-btn" @tap="buyNow">立即购买</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import request from '@/utils/request'
import FloatingContact from '@/components/FloatingContact.vue'

// 状态数据
const bannerList = ref([])      // 轮播图数据
const categories = ref([])      // 分类数据
const homeProducts = ref([])    // 首页推荐商品数据
const isLoading = ref(false)    // 加载状态

// 加载轮播图数据
const loadBanners = async () => {
  try {
    console.log('开始加载轮播图数据')
    const result = await request({
      url: 'http://82.156.12.240:8080/api/product/market/1',
      method: 'GET'
    })
    
    console.log('轮播图API返回结果:', result)
    if (result.code === 200) {
      console.log('轮播图数据:', result.data)
      bannerList.value = (result.data || []).map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.productName || '',
        indexPic: item.indexPic || ''
      }))
      console.log('处理后的轮播图数据:', bannerList.value)
    } else {
      console.error('获取轮播图失败:', result.message)
      bannerList.value = []
    }
  } catch (error) {
    console.error('加载轮播图出错:', error)
    bannerList.value = []
  }
}

// 加载分类数据
const loadCategories = async () => {
  try {
    console.log('开始加载分类数据')
    const result = await request({
      url: 'http://82.156.12.240:8080/api/category/list',
      method: 'GET'
    })
    
    console.log('分类API返回结果:', result)
    if (result.code === 200) {
      console.log('分类数据:', result.data)
      categories.value = result.data || []
      
      // 为分类添加默认图片 - 使用自定义图标
      const categoryIcons = [
        '/static/images/category-fruit.png',
        '/static/images/category-tea.png',
        '/static/images/category-snack.png',
        '/static/images/category-dried.png'
      ]
      
      categories.value = categories.value.map((cat, index) => ({
        ...cat,
        image: categoryIcons[index % categoryIcons.length]
      }))
      
      console.log('处理后的分类数据:', categories.value)
    } else {
      console.error('获取分类失败:', result.message)
      categories.value = []
    }
  } catch (error) {
    console.error('加载分类出错:', error)
    categories.value = []
  }
}

// 加载首页推荐商品
const loadHomeProducts = async () => {
  try {
    console.log('开始加载首页推荐商品')
    const result = await request({
      url: 'http://82.156.12.240:8080/api/product/market/0',
      method: 'GET'
    })
    
    console.log('首页商品API返回结果:', result)
    if (result.code === 200) {
      console.log('首页商品数据:', result.data)
      homeProducts.value = (result.data || []).map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name || '',
        indexPic: item.indexPic || '',
        price: item.price || '暂无价格'
      }))
      console.log('处理后的首页商品数据:', homeProducts.value)
    } else {
      console.error('获取首页商品失败:', result.message)
      homeProducts.value = []
    }
  } catch (error) {
    console.error('加载首页商品出错:', error)
    homeProducts.value = []
  }
}

// 初始化加载所有数据
const initData = async () => {
  isLoading.value = true
  try {
    console.log('开始初始化首页数据')
    // 依次加载数据，确保每个请求都能正确执行
    await loadBanners()
    await loadCategories()
    await loadHomeProducts()
    
    console.log('首页数据加载完成')
  } catch (error) {
    console.error('初始化数据失败:', error)
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 导航到商品详情页
const goToDetail = (productId) => {
  if (!productId) {
    console.error('无效的商品ID')
    return
  }
  
  console.log('首页跳转到商品详情，ID:', productId)
  uni.navigateTo({
    url: `/pages/detail/detail?id=${productId}`
  })
}

// 导航到分类页面
const navigateToCategory = (category) => {
  // 存储选中的分类ID，以便分类页面加载后能读取
  try {
    uni.setStorageSync('selectedCategoryId', category.id);
    console.log('保存选中的分类ID:', category.id, category.name);
    
    // 添加调试信息
    setTimeout(() => {
      const savedId = uni.getStorageSync('selectedCategoryId');
      console.log('存储后检查ID:', savedId);
    }, 100);
  } catch (e) {
    console.error('保存分类ID失败:', e);
  }
  
  // 跳转到分类页面
  uni.switchTab({
    url: '/pages/category/category',
    success: () => {
      console.log('成功跳转到分类页面');
    },
    fail: (error) => {
      console.error('跳转到分类页面失败:', error);
      
      // 跳转失败时尝试使用navigateTo
      uni.navigateTo({
        url: '/pages/category/category'
      });
    }
  });
}

// 跳转到全部分类
const navigateToAllCategories = () => {
  // 清除选中的分类ID，显示全部分类
  uni.removeStorageSync('selectedCategoryId');
  uni.switchTab({
    url: '/pages/category/category'
  });
}

// 导航到搜索页面
const navigateToSearch = () => {
  uni.navigateTo({
    url: '/pages/search/search'
  })
}

// 添加到购物车
const addToCart = (product) => {
  // 显示规格选择弹窗
  showQuickBuy(product)
}

// 生命周期钩子 - 组件挂载时加载数据
onMounted(() => {
  console.log('首页组件已挂载')
  initData()
})

// 在页面显示时刷新数据 - 使用uni-app的页面生命周期函数
// 在setup中使用生命周期钩子时，不需要导入，直接赋值给同名变量
const onShow = () => {
  console.log('首页显示，刷新数据')
  initData()
}

// 规格选择弹窗相关逻辑
const showSpecs = ref(false)
const currentProduct = ref({})
const selectedSpecIndex = ref(0)
const quantity = ref(1)

// 选中的规格名称
const selectedSpec = computed(() => {
  if (currentProduct.value.specs && currentProduct.value.specs.length > 0) {
    return currentProduct.value.specs[selectedSpecIndex.value].name
  }
  return '默认规格'
})

// 显示规格选择弹窗
const showSpecsPopup = (product) => {
  currentProduct.value = product
  selectedSpecIndex.value = 0
  quantity.value = 1
  showSpecs.value = true
}

// 隐藏规格选择弹窗
const hideSpecsPopup = () => {
  showSpecs.value = false
}

// 选择规格
const selectSpec = (index) => {
  selectedSpecIndex.value = index
  
  // 更新选中的规格名称
  if (productSpecs.value[index]) {
    selectedSpec.value = productSpecs.value[index].name
    
    // 找到对应的SKU，更新价格和库存以及SKU ID
    if (productSkuList.value.length > 0) {
      const selectedSku = productSkuList.value.find(sku => 
        sku.spData.includes(productSpecs.value[index].id + ':' + productSpecs.value[index].value)
      )
      
      if (selectedSku) {
        quickBuyProduct.value.price = selectedSku.price
        quickBuyProduct.value.stock = selectedSku.stock
        selectedSkuId.value = selectedSku.id // 更新选中的SKU ID
        
        // 检查数量是否超过库存
        if (quantity.value > selectedSku.stock) {
          quantity.value = selectedSku.stock > 0 ? selectedSku.stock : 1
        }
      }
    }
  }
}

// 增加数量
const increaseQuantity = () => {
  if (quantity.value < (currentProduct.value.stock || 999)) {
    quantity.value++
  }
}

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// 验证数量是否有效
const validateQuantity = () => {
  const stock = currentProduct.value.stock || 999
  if (isNaN(quantity.value) || quantity.value < 1) {
    quantity.value = 1
  } else if (quantity.value > stock) {
    quantity.value = stock
  }
}

// 添加到购物车（带规格）
const addToCartWithSpec = async () => {
  // 检查是否选择了有效的SKU
  if (!selectedSkuId.value) {
    uni.showToast({
      title: '请选择有效的规格',
      icon: 'none'
    })
    return
  }
  
  try {
    // 准备要提交的数据
    const cartData = {
      skuId: selectedSkuId.value,
      productId: quickBuyProduct.value.id,
      quantity: quantity.value
    }
    
    console.log('添加到购物车数据:', cartData)
    
    // 发送请求添加到购物车
    const result = await request({
      url: 'http://82.156.12.240:8080/api/cart/add',
      method: 'POST',
      data: cartData
    })
    
    if (result.code === 200) {
      // 添加成功
      uni.showToast({
        title: '已添加到购物车',
        icon: 'success'
      })
      
      // 关闭弹窗
      hideQuickBuyPopup()
    } else {
      uni.showToast({
        title: result.message || '添加失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('添加到购物车出错:', error)
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    })
  }
}

// 立即购买
const buyNow = () => {
  if (!selectedSpec ) {
    showSpecsPopup()
    return
  }
  
  // 创建结算项
  const checkoutItem = {
    productId: quickBuyProduct.value.id,
    productName: quickBuyProduct.value.name,
    productImage: quickBuyProduct.value.indexPic,
    price: quickBuyProduct.value.price,
    quantity: quantity.value,
    skuId: selectedSkuId.value || '',
    spec: selectedSpec.value || ''
  }
  
  // 保存到本地存储
  uni.setStorageSync('checkoutItems', JSON.stringify([checkoutItem]))
  
  // 跳转到结算页面
  uni.navigateTo({
    url: '/pages/checkout/checkout?type=buyNow'
  })
}

// 快速购买弹窗相关状态
const showQuickBuyPopup = ref(false)
const quickBuyProduct = ref({})
const productSpecs = ref([])
const productSkuList = ref([]) // 存储商品的SKU列表
const selectedSkuId = ref('') // 存储选中的SKU ID

// 显示快速购买弹窗
const showQuickBuy = async (product) => {
  console.log('显示快速购买弹窗:', product)
  
  // 设置初始商品信息
  quickBuyProduct.value = {
    ...product,
    stock: 0 // 默认设置为0，后续从SKU中获取
  }
  
  // 重置选择的规格和数量
  selectedSpecIndex.value = 0
  quantity.value = 1
  productSpecs.value = []
  productSkuList.value = []
  selectedSkuId.value = '' // 重置选中的SKU ID
  
  // 获取商品详情和规格数据
  try {
    const result = await request({
      url: `http://82.156.12.240:8080/api/product/${product.id}`,
      method: 'GET'
    })
    
    if (result.code === 200 && result.data) {
      // 更新商品详情
      console.log('获取到商品详情:', result.data)
      
      // 处理SKU列表数据
      if (result.data.skuList && result.data.skuList.length > 0) {
        productSkuList.value = result.data.skuList
        
        // 提取规格信息
        const specMap = new Map()
        
        // 解析规格数据并去重
        result.data.skuList.forEach(sku => {
          if (sku.spData) {
            // 假设spData格式为"规格ID:规格值"
            const specs = sku.spData.split(';') // 处理可能的多规格情况
            
            specs.forEach(spec => {
              const [specId, specValue] = spec.split(':')
              if (!specMap.has(specValue)) {
                specMap.set(specValue, {
                  id: specId,
                  value: specValue,
                  name: `规格${specValue}`, // 可根据需要修改规格名称
                  price: sku.price,
                  stock: sku.stock,
                  skuId: sku.id // 存储SKU ID
                })
              }
            })
          }
        })
        
        // 转换为数组
        productSpecs.value = Array.from(specMap.values())
        
        // 如果有规格，设置默认选中第一个规格
        if (productSpecs.value.length > 0) {
          selectedSpec.value = productSpecs.value[0].name
          
          // 设置对应规格的库存和价格
          const defaultSku = productSkuList.value.find(sku => 
            sku.spData.includes(productSpecs.value[0].id + ':' + productSpecs.value[0].value)
          )
          
          if (defaultSku) {
            quickBuyProduct.value.stock = defaultSku.stock
            quickBuyProduct.value.price = defaultSku.price
            selectedSkuId.value = defaultSku.id // 存储选中的SKU ID
          }
        } else {
          // 如果没有规格数据，使用第一个SKU的信息
          if (productSkuList.value[0]) {
            quickBuyProduct.value.stock = productSkuList.value[0].stock
            quickBuyProduct.value.price = productSkuList.value[0].price
            selectedSkuId.value = productSkuList.value[0].id // 存储第一个SKU ID
            selectedSpec.value = '默认规格'
          }
        }
      } else {
        // 没有SKU数据时的处理
        productSpecs.value = [{ name: '默认规格', price: product.price, stock: 100 }]
        selectedSpec.value = '默认规格'
        quickBuyProduct.value.stock = 100 // 默认库存
      }
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    // 出错时设置默认规格
    productSpecs.value = [{ name: '默认规格', price: product.price, stock: 100 }]
    selectedSpec.value = '默认规格'
    quickBuyProduct.value.stock = 100 // 默认库存
  }
  
  // 显示弹窗
  showQuickBuyPopup.value = true
}

// 隐藏快速购买弹窗
const hideQuickBuyPopup = () => {
  showQuickBuyPopup.value = false
}

// 处理联系客服事件
const handleContactEvent = () => {
  console.log('联系客服事件被触发')
  // 在这里可以添加联系客服的逻辑
}
</script>

<style lang="scss">
.home-container {
  min-height: 100vh;
  background-color: #F0F7FF;
  padding-bottom: 20rpx;
  
  // 顶部搜索栏 - 全新蓝色主题
  .header-section {
    background: linear-gradient(180deg, #4B91F1 0%, #83B4FF 100%);
    padding: 40rpx 30rpx 50rpx;
    position: relative;
    
    .brand-wrapper {
      display: flex;
      align-items: center;
      margin-bottom: 30rpx;
      
      .brand-logo {
        width: 40rpx;
        height: 40rpx;
        background: #fff;
        border-radius: 20rpx;
        margin-right: 12rpx;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
      }
    }
    
    .brand-name {
      color: #fff;
      font-size: 36rpx;
      font-weight: 600;
      letter-spacing: 2rpx;
    }
    
    .search-box {
      height: 80rpx;
      background-color: rgba(255, 255, 255, 0.92);
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      padding: 0 30rpx;
      color: #999;
      font-size: 28rpx;
      box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.08);
      
      .search-placeholder {
        margin-left: 20rpx;
        color: #999;
      }
    }
  }
  
  // 轮播图区 - 升级版蓝色主题
  .banner-wrapper {
    margin: -30rpx 20rpx 20rpx;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 30rpx rgba(75, 145, 241, 0.08);
    position: relative;
    z-index: 2;
    
    .banner-bg-decorator {
      position: absolute;
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      background: linear-gradient(135deg, #4B91F1, #83B4FF);
      right: -40rpx;
      top: -40rpx;
      opacity: 0.2;
      z-index: 1;
    }
    
    .banner-swiper {
      height: 300rpx;
      border-radius: 20rpx;
      overflow: hidden;
      
      .banner-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .banner-content {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
        padding: 60rpx 30rpx 30rpx;
        display: flex;
        align-items: flex-end;
        
        .banner-info {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .banner-name {
          color: #ffffff;
          font-size: 32rpx;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          max-width: 70%;
        }
        
        .banner-btn {
          background: linear-gradient(to right, #4B91F1, #83B4FF);
          color: #fff;
          font-size: 24rpx;
          padding: 10rpx 20rpx;
          border-radius: 40rpx;
          font-weight: 500;
          box-shadow: 0 4rpx 12rpx rgba(75, 145, 241, 0.3);
          display: flex;
          align-items: center;
          
          text {
            margin-right: 6rpx;
          }
        }
      }
    }
  }
  
  // 品牌承诺部分 - 蓝色主题
  .promise-section {
    margin: 0 20rpx 20rpx;
    background-color: #fff;
    border-radius: 16rpx;
    padding: 18rpx 0;
    display: flex;
    align-items: center;
    justify-content: space-around;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
    
    .promise-item {
      display: flex;
      align-items: center;
      color: #444;
      font-size: 26rpx;
      
      .promise-icon-bg {
        width: 36rpx;
        height: 36rpx;
        border-radius: 50%;
        background-color: rgba(75, 145, 241, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10rpx;
      }
      
      text {
        margin-left: 10rpx;
      }
    }
    
    .divider {
      width: 2rpx;
      height: 30rpx;
      background-color: #eee;
    }
  }
  
  // 统一的卡片样式 - 蓝色主题
  .section-card {
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 20rpx;
    margin: 0 30rpx 30rpx;
    padding: 30rpx;
    box-shadow: 0 6rpx 16rpx rgba(75, 145, 241, 0.08);
    backdrop-filter: blur(10rpx);
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30rpx;
      
      .title-wrapper {
        display: flex;
        align-items: center;
        
        .title-decorator {
          width: 8rpx;
          height: 32rpx;
          background: linear-gradient(180deg, #4B91F1 0%, #83B4FF 100%);
          border-radius: 4rpx;
          margin-right: 12rpx;
        }
      }
      
      .section-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }
      
      .view-more {
        font-size: 24rpx;
        color: #4B91F1;
      }
      
      .sub-title {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  // 分类区域 - 蓝色主题
  .category-section {
    margin: 0 20rpx 20rpx;
    background-color: #fff;
    border-radius: 16rpx;
    padding: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
    
    .category-scroll {
      white-space: nowrap;
    }
    
    .category-list {
      display: flex;
      padding: 10rpx 0;
      
      .category-item {
        display: inline-block;
        width: 140rpx;
        margin-right: 20rpx;
        text-align: center;
        flex-shrink: 0;
        
        .category-icon-wrapper {
          width: 90rpx;
          height: 90rpx;
          margin: 0 auto 10rpx;
          background: linear-gradient(135deg, rgba(75, 145, 241, 0.1), rgba(131, 180, 255, 0.1));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5rpx;
          box-shadow: 0 4rpx 10rpx rgba(75, 145, 241, 0.05);
          border: 1rpx solid rgba(75, 145, 241, 0.1);
          
          .category-image {
            width: 60%;
            height: 60%;
            object-fit: contain;
          }
        }
        
        .category-name {
          font-size: 24rpx;
          color: #333;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
  
  // 商品部分 - 蓝色主题
  .featured-section {
    margin: 0 20rpx 20rpx;
    background-color: #fff;
    border-radius: 16rpx;
    padding: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
    
    .product-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      padding: 10rpx 0;
      
      .product-item {
        width: 48%; /* 确保一行两个，留一点间距 */
        margin-bottom: 20rpx;
        background-color: #fff;
        border-radius: 16rpx;
        overflow: hidden;
        box-shadow: 0 6rpx 20rpx rgba(75, 145, 241, 0.08);
        transition: all 0.3s ease;
        border: 1rpx solid rgba(75, 145, 241, 0.1);
        
        .product-image-wrapper {
          width: 100%;
          height: 240rpx;
          position: relative;
          overflow: hidden;
          
          .product-tag {
            position: absolute;
            top: 16rpx;
            right: 16rpx;
            background: linear-gradient(to right, #4B91F1, #83B4FF);
            color: #fff;
            font-size: 22rpx;
            padding: 6rpx 16rpx;
            border-radius: 20rpx;
            font-weight: 500;
            box-shadow: 0 4rpx 12rpx rgba(75, 145, 241, 0.2);
          }
          
          .product-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.4s ease;
          }
          
          &:hover .product-image {
            transform: scale(1.05);
          }
        }
        
        .product-info {
          padding: 16rpx;
          
          .product-name {
            font-size: 28rpx;
            color: #333;
            line-height: 1.4;
            margin-bottom: 12rpx;
            height: 76rpx;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .product-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .product-price {
              font-size: 32rpx;
              color: #4B91F1;
              font-weight: 500;
              
              &::before {
                content: '¥';
                font-size: 24rpx;
                margin-right: 2rpx;
                font-weight: normal;
              }
            }
            
            .price-btn-group {
              display: flex;
              align-items: center;
              
              .original-price {
                font-size: 22rpx;
                color: #999;
                text-decoration: line-through;
                margin-right: 10rpx;
                
                &::before {
                  content: '¥';
                  font-size: 20rpx;
                }
              }
            }
            
            .cart-btn {
              width: 48rpx;
              height: 48rpx;
              background: linear-gradient(135deg, #4B91F1, #83B4FF);
              border-radius: 24rpx;
              display: flex;
              justify-content: center;
              align-items: center;
              box-shadow: 0 6rpx 16rpx rgba(75, 145, 241, 0.2);
              transition: transform 0.15s ease;
              
              &:active {
                transform: scale(0.92);
              }
            }
          }
        }
      }
    }
  }
  
  // 底部区域 - 蓝色主题
  .footer {
    text-align: center;
    padding: 40rpx 0 60rpx;
    margin-top: 20rpx;
    
    .footer-logo {
      margin-bottom: 20rpx;
      
      .logo-text {
        font-size: 36rpx;
        font-weight: 600;
        color: #4B91F1;
        letter-spacing: 2rpx;
      }
    }
    
    .footer-slogan {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 16rpx;
    }
    
    .footer-copyright {
      font-size: 22rpx;
      color: #999;
    }
  }
}

// 弹窗样式 - 蓝色主题化
.specs-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  
  .popup-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.7);
    backdrop-filter: blur(4rpx);
  }
  
  .popup-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    border-radius: 30rpx 30rpx 0 0;
    padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
    box-shadow: 0 -10rpx 30rpx rgba(0,0,0,0.1);
    
    .popup-header {
      padding: 30rpx;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1rpx solid #f0f0f0;
      
      .product-brief {
        display: flex;
        
        .popup-image {
          width: 160rpx;
          height: 160rpx;
          border-radius: 12rpx;
          box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
        }
        
        .brief-info {
          margin-left: 20rpx;
          
          .popup-price {
            font-size: 36rpx;
            font-weight: bold;
            color: #4B91F1 !important;
            margin-bottom: 10rpx;
            
            .popup-original-price {
              font-size: 24rpx;
              color: #999;
              text-decoration: line-through;
              font-weight: normal;
              margin-left: 10rpx;
            }
          }
          
          .popup-stock, .popup-selected {
            font-size: 24rpx;
            color: #666;
            margin-top: 10rpx;
          }
        }
      }
      
      .close-btn {
        width: 48rpx;
        height: 48rpx;
        background-color: rgba(0,0,0,0.05);
        border-radius: 24rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    .specs-section, .quantity-section {
      padding: 30rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      .specs-title, .quantity-title {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 20rpx;
        font-weight: 500;
      }
      
      .specs-options {
        display: flex;
        flex-wrap: wrap;
        
        .spec-option {
          padding: 12rpx 24rpx;
          border-radius: 8rpx;
          background-color: #f5f7fa;
          margin-right: 20rpx;
          margin-bottom: 20rpx;
          font-size: 24rpx;
          color: #333;
          border: 1rpx solid transparent;
          transition: all 0.2s;
          
          &:active {
            opacity: 0.8;
          }
          
          &.active {
            background-color: rgba(75, 145, 241, 0.1);
            color: #4B91F1;
            border: 1rpx solid #4B91F1;
          }
        }
      }
      
      .quantity-adjuster {
        display: flex;
        align-items: center;
        
        .quantity-btn {
          width: 60rpx;
          height: 60rpx;
          border: 1rpx solid #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28rpx;
          color: #333;
          background-color: #f5f7fa;
          transition: all 0.2s;
          
          &.minus {
            border-radius: 8rpx 0 0 8rpx;
          }
          
          &.plus {
            border-radius: 0 8rpx 8rpx 0;
          }
          
          &.disabled {
            color: #ccc;
            pointer-events: none;
          }
          
          &:active {
            background-color: #e8e9eb;
          }
        }
        
        .quantity-input {
          width: 80rpx;
          height: 60rpx;
          border-top: 1rpx solid #eee;
          border-bottom: 1rpx solid #eee;
          text-align: center;
          font-size: 28rpx;
          color: #333;
        }
      }
    }
    
    .popup-actions {
      display: flex;
      padding: 30rpx;
      
      .action-btn {
        flex: 1;
        height: 80rpx;
        border-radius: 40rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        font-weight: 500;
        transition: transform 0.2s;
        
        &:active {
          transform: scale(0.98);
        }
        
        &.add-to-cart {
          background-color: #000;
          color: #fff;
          margin-right: 15rpx;
          letter-spacing: 1rpx;
        }
        
        &.buy-now {
          background: linear-gradient(to right, #4B91F1, #83B4FF);
          color: #fff;
          margin-left: 15rpx;
          letter-spacing: 1rpx;
          box-shadow: 0 6rpx 16rpx rgba(75, 145, 241, 0.2);
        }
      }
    }
  }
}

// 快速购买弹窗样式
.quick-buy-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  
  .popup-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
  }
  
  .popup-content {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    border-radius: 24rpx 24rpx 0 0;
    padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
    
    .popup-header {
      display: flex;
      padding: 30rpx;
      position: relative;
      border-bottom: 1rpx solid #f5f5f5;
      
      .product-thumb {
        width: 160rpx;
        height: 160rpx;
        border-radius: 12rpx;
        margin-top: -50rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
        border: 4rpx solid #fff;
      }
      
      .header-right {
        flex: 1;
        padding-left: 20rpx;
        
        .popup-price {
          font-size: 40rpx;
          color: #4B91F1;
          font-weight: 500;
          margin-bottom: 12rpx;
        }
        
        .popup-stock, .popup-selected {
          font-size: 24rpx;
          color: #666;
          margin-top: 8rpx;
        }
      }
      
      .close-btn {
        position: absolute;
        top: 20rpx;
        right: 20rpx;
        width: 50rpx;
        height: 50rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    .popup-section {
      padding: 20rpx 30rpx;
      border-bottom: 1rpx solid #f5f5f5;
      
      .section-title {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 20rpx;
      }
      
      .specs-list {
        display: flex;
        flex-wrap: wrap;
        
        .spec-item {
          padding: 12rpx 24rpx;
          background-color: #f5f5f5;
          color: #333;
          font-size: 26rpx;
          margin-right: 20rpx;
          margin-bottom: 16rpx;
          border-radius: 8rpx;
          border: 1rpx solid transparent;
          
          .spec-price {
            margin-left: 10rpx;
            color: #4B91F1;
            font-weight: 500;
          }
          
          .spec-stock {
            margin-left: 6rpx;
            font-size: 22rpx;
            color: #999;
          }
          
          &.active {
            background-color: rgba(75, 145, 241, 0.1);
            color: #4B91F1;
            border-color: #4B91F1;
          }
        }
      }
      
      .quantity-control {
        display: flex;
        align-items: center;
        
        .quantity-btn {
          width: 60rpx;
          height: 60rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f5f5;
          font-size: 28rpx;
          
          &.minus {
            border-radius: 8rpx 0 0 8rpx;
          }
          
          &.plus {
            border-radius: 0 8rpx 8rpx 0;
          }
        }
        
        .quantity-input {
          width: 80rpx;
          height: 60rpx;
          text-align: center;
          border-top: 1rpx solid #eee;
          border-bottom: 1rpx solid #eee;
          font-size: 28rpx;
        }
      }
    }
    
    .action-buttons {
      display: flex;
      padding: 30rpx;
      
      .action-btn {
        flex: 1;
        height: 80rpx;
        border-radius: 40rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        font-weight: 500;
        
        &.cart-btn {
          background-color: #000;
          color: #fff;
          margin-right: 10rpx;
        }
        
        &.buy-btn {
          background: linear-gradient(to right, #4B91F1, #83B4FF);
          color: #fff;
          margin-left: 10rpx;
          box-shadow: 0 6rpx 16rpx rgba(75, 145, 241, 0.2);
        }
      }
    }
  }
}
</style>