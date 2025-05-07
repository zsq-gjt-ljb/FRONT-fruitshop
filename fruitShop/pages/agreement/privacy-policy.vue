<template>
  <view class="privacy-container">
    <view class="privacy-content">
      <view class="privacy-title">隐私政策</view>
      <view class="privacy-text">
        <text>感谢您信任并使用北果南茶！</text>
        <view class="section">
          1. 信息收集
          我们可能收集的信息包括：
          - 账号信息（如手机号码）
          - 订单信息
          - 设备信息
        </view>
        <view class="section">
          2. 信息使用
          我们收集的信息将用于：
          - 提供商品和服务
          - 订单处理和物流配送
          - 客户服务和支持
        </view>
        <view class="section">
          3. 信息保护
          我们采取严格的数据安全措施，保护您的个人信息安全。
        </view>
        <view class="section">
          4. 信息共享
          除法律法规规定或经您同意外，我们不会向第三方分享您的个人信息。
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PrivacyPolicy',
  data() {
    return {}
  }
}
</script>

<style lang="scss">
.privacy-container {
  padding: 30rpx;
  background-color: #fff;
  min-height: 100vh;

  .privacy-content {
    .privacy-title {
      font-size: 36rpx;
      font-weight: bold;
      text-align: center;
      margin-bottom: 40rpx;
      color: #333;
    }

    .privacy-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.8;

      .section {
        margin-top: 30rpx;
      }
    }
  }
}
</style> 