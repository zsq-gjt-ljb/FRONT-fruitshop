<template>
  <view class="contact-page">
    <view class="header">
      <text class="title">联系客服</text>
      <text class="subtitle">有问题？我们随时为您服务</text>
    </view>
    
    <view class="card">
      <view class="card-title">
        <uni-icons type="staff" size="24" color="#3b78db"></uni-icons>
        <text>在线客服</text>
      </view>
      <view class="card-content">
        <text class="desc">点击下方按钮，立即联系在线客服</text>
        <button open-type="contact" bindcontact="handleContact" class="contact-btn">
          <text class="btn-text">开始对话</text>
        </button>
      </view>
    </view>
    
    <view class="tips">
      <text class="tips-title">温馨提示：</text>
      <text class="tips-content">1. 客服服务时间：9:00-18:00</text>
      <text class="tips-content">2. 非工作时间留言，我们会在上班后第一时间回复</text>
      <text class="tips-content">3. 如有紧急问题，请拨打电话：18159890621</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    handleContact(e) {
      console.log('联系客服事件触发：', e.detail);
      // 可以在这里添加与客服联系的相关统计或处理逻辑
    }
  }
};
</script>

<style lang="scss">
.contact-page {
  padding: 30rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
  
  .header {
    margin-bottom: 40rpx;
    text-align: center;
    
    .title {
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 10rpx;
      display: block;
    }
    
    .subtitle {
      font-size: 28rpx;
      color: #666;
      display: block;
    }
  }
  
  .card {
    background-color: #ffffff;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 40rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    
    .card-title {
      display: flex;
      align-items: center;
      margin-bottom: 30rpx;
      
      text {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
        margin-left: 10rpx;
      }
    }
    
    .card-content {
      text-align: center;
      
      .desc {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 30rpx;
        display: block;
      }
      
      .contact-btn {
        background-color: #3b78db;
        color: #ffffff;
        border-radius: 40rpx;
        font-size: 30rpx;
        height: 80rpx;
        line-height: 80rpx;
        width: 60%;
        margin: 0 auto;
        letter-spacing: 2rpx;
        
        &::after {
          border: none;
        }
      }
    }
  }
  
  .tips {
    background-color: #ffffff;
    border-radius: 12rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    
    .tips-title {
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 20rpx;
      display: block;
    }
    
    .tips-content {
      font-size: 26rpx;
      color: #666;
      line-height: 1.8;
      display: block;
    }
  }
}
</style> 