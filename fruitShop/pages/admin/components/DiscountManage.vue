<template>
  <view class="discount-manage">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="title">会员折扣管理</text>
      <text class="subtitle">设置不同会员等级的折扣率</text>
    </view>
    
    <!-- 折扣卡片 -->
    <view class="discount-cards">
      <view class="discount-card" v-for="(discount, index) in discountList" :key="index">
        <view class="card-header">
          <view class="level-tag" :class="`level-${discount.memberLevel}`">
            <text>VIP {{ discount.memberLevel }}</text>
          </view>
          <text class="level-name">{{ getMemberLevelName(discount.memberLevel) }}</text>
        </view>
        
        <view class="card-body">
          <view class="input-group">
            <text class="label">折扣率设置</text>
            <view class="discount-input">
              <input 
                type="digit" 
                v-model="discount.inputValue" 
                placeholder="0-10之间" 
                maxlength="3"
                @input="validateInput(discount)"
                @blur="handleInputBlur(discount)"
              />
              <text class="suffix">折</text>
            </view>
          </view>
          
          <view class="discount-preview">
            <text class="preview-text">当前折扣: </text>
            <text class="discount-value">{{ discount.discount }}折</text>
          </view>
        </view>
        
        <!-- 每个卡片单独的保存按钮 -->
        <view class="card-footer">
          <button 
            class="save-btn" 
            @tap="saveSingleDiscount(discount)" 
            :disabled="discount.saving || !discount.changed"
            :loading="discount.saving"
          >
            {{ discount.saving ? '保存中...' : '更新' }}
          </button>
        </view>
      </view>
    </view>
    
    <!-- 说明 -->
    <view class="discount-tips">
      <view class="tips-title">说明：</view>
      <view class="tips-content">
        <text>· 折扣率范围为0-10，例如设置为8.5表示8.5折</text>
        <text>· 设置为0表示不享受折扣</text>
        <text>· 设置为10表示不打折（原价）</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

// 折扣数据
const discountList = ref([])

// 会员等级名称
const memberLevelNames = {
  1: '普通会员',
  2: '白银会员',
  3: '黄金会员',
  4: '钻石会员'
}

// 获取会员等级名称
const getMemberLevelName = (level) => {
  return memberLevelNames[level] || `未知等级`
}

// 获取折扣数据
const fetchDiscounts = async () => {
  try {
    const res = await request({
      url: 'https://bgnc.online/api/discount/',
      method: 'GET'
    })
    
    if (res.code === 200 && res.data) {
      console.log('获取到的折扣数据:', res.data)
      
      // 处理返回的数据 - 将"1.00"格式转换为10.0(十折)
      discountList.value = res.data.map(item => ({
        ...item,
        discount: parseFloat(item.discount) * 10, // 转换为折扣值
        inputValue: (parseFloat(item.discount) * 10).toString(), // 用于输入框显示
        originalDiscount: parseFloat(item.discount) * 10, // 保存原始值用于比较
        saving: false, // 保存状态
        changed: false // 是否修改过
      }))
    } else {
      uni.showToast({
        title: res.msg || '获取折扣数据失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取折扣数据失败:', error)
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    })
  }
}

// 验证输入，保证在0-10之间
const validateInput = (discount) => {
  let value = discount.inputValue
  
  // 移除非数字和小数点字符
  value = value.replace(/[^\d.]/g, '')
  
  // 确保只有一个小数点
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }
  
  // 限制为一位小数
  if (parts.length === 2 && parts[1].length > 1) {
    value = parts[0] + '.' + parts[1].substring(0, 1)
  }
  
  // 限制数值范围0-10
  let numValue = parseFloat(value)
  if (!isNaN(numValue)) {
    if (numValue > 10) value = '10'
    if (numValue < 0) value = '0'
  }
  
  discount.inputValue = value
  
  // 直接更新discount值和changed状态
  const newValue = parseFloat(value) || 0
  discount.discount = newValue
  discount.changed = newValue !== discount.originalDiscount
}

// 处理输入框失去焦点事件
const handleInputBlur = (discount) => {
  if (discount.inputValue === '') {
    discount.inputValue = '0'
    discount.discount = 0
    discount.changed = 0 !== discount.originalDiscount
  }
}

// 保存单个折扣设置
const saveSingleDiscount = async (discount) => {
  discount.saving = true
  const originalValue = discount.discount // 保存原始值
  
  try {
    // 将折扣值转换为字符串格式
    const discountValue = (parseFloat(discount.discount) / 10).toFixed(2).toString()
    
    uni.showLoading({
      title: '保存中'
    })
    
    const res = await request({
      url: `https://bgnc.online/api/discount/?memberLevel=${parseInt(discount.memberLevel)}&discount=${discountValue}`,
      method: 'PUT'
    })
    
    if (res.code === 200) {
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      // 成功后重新获取所有折扣数据以确保界面显示最新数据
      await fetchDiscounts()
    } else {
      // 恢复原始值
      discount.discount = originalValue
      discount.inputValue = originalValue.toString()
      uni.showToast({
        title: res.msg || '保存失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('保存折扣设置失败:', error)
    // 恢复原始值
    discount.discount = originalValue
    discount.inputValue = originalValue.toString()
    uni.showToast({
      title: '网络错误，请稍后再试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
    discount.saving = false
  }
}

// 页面加载
onMounted(() => {
  fetchDiscounts()
})
</script>

<style lang="scss">
.discount-manage {
  padding: 30rpx;
  
  .page-header {
    margin-bottom: 40rpx;
    
    .title {
      font-size: 40rpx;
      font-weight: 600;
      color: #333;
      display: block;
    }
    
    .subtitle {
      font-size: 28rpx;
      color: #666;
      margin-top: 10rpx;
      display: block;
    }
  }
  
  .discount-cards {
    margin-bottom: 40rpx;
    
    .discount-card {
      background-color: #fff;
      border-radius: 16rpx;
      padding: 30rpx;
      margin-bottom: 30rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
      
      .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 30rpx;
        
        .level-tag {
          padding: 8rpx 20rpx;
          border-radius: 30rpx;
          margin-right: 20rpx;
          
          text {
            color: #fff;
            font-size: 24rpx;
            font-weight: 500;
          }
          
          &.level-1 {
            background-color: #52c41a;
          }
          
          &.level-2 {
            background-color: #1890ff;
          }
          
          &.level-3 {
            background-color: #722ed1;
          }
          
          &.level-4 {
            background-color: #eb2f96;
          }
        }
        
        .level-name {
          font-size: 32rpx;
          color: #333;
          font-weight: 500;
        }
      }
      
      .card-body {
        .input-group {
          margin-bottom: 20rpx;
          
          .label {
            font-size: 28rpx;
            color: #666;
            margin-bottom: 16rpx;
            display: block;
          }
          
          .discount-input {
            display: flex;
            align-items: center;
            background-color: #f5f7fa;
            padding: 0 20rpx;
            border-radius: 8rpx;
            height: 80rpx;
            
            input {
              flex: 1;
              height: 80rpx;
              font-size: 32rpx;
              color: #333;
            }
            
            .suffix {
              font-size: 32rpx;
              color: #333;
              margin-left: 10rpx;
            }
          }
        }
        
        .discount-preview {
          display: flex;
          align-items: center;
          
          .preview-text {
            font-size: 28rpx;
            color: #666;
          }
          
          .discount-value {
            font-size: 36rpx;
            color: #ff6b00;
            font-weight: bold;
          }
        }
      }
      
      .card-footer {
        margin-top: 30rpx;
        display: flex;
        justify-content: flex-end;
        
        .save-btn {
          padding: 0 40rpx;
          height: 70rpx;
          line-height: 70rpx;
          font-size: 28rpx;
          background-color: #4a90e2;
          color: #fff;
          border-radius: 35rpx;
          
          &:disabled {
            opacity: 0.6;
            background-color: #ccc;
          }
        }
      }
    }
  }
  
  .discount-tips {
    background-color: #f6f9fe;
    padding: 20rpx;
    border-radius: 8rpx;
    
    .tips-title {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
      margin-bottom: 10rpx;
    }
    
    .tips-content {
      text {
        font-size: 26rpx;
        color: #666;
        display: block;
        margin-bottom: 8rpx;
        line-height: 1.5;
      }
    }
  }
}
</style>