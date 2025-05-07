<template>
  <view class="agreement-container">
    <view class="agreement-content">
      <view class="agreement-title">用户协议</view>
      <view class="agreement-text">
        <text>欢迎使用北果南茶！</text>
        <view class="section">
          1. 协议的范围
          本协议是您与北果南茶之间关于使用本平台服务所订立的协议。
        </view>
        <view class="section">
          2. 服务内容
          北果南茶为用户提供水果、茶叶等农产品的在线购买服务。
        </view>
        <view class="section">
          3. 用户义务
          3.1 您应当遵守中华人民共和国相关法律法规。
          3.2 您应当妥善保管账号信息。
        </view>
        <view class="section">
          4. 隐私保护
          我们重视您的隐私保护，具体隐私政策请参见《隐私政策》。
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'UserAgreement',
  data() {
    return {}
  }
}
</script>

<style lang="scss">
.agreement-container {
  padding: 30rpx;
  background-color: #fff;
  min-height: 100vh;

  .agreement-content {
    .agreement-title {
      font-size: 36rpx;
      font-weight: bold;
      text-align: center;
      margin-bottom: 40rpx;
      color: #333;
    }

    .agreement-text {
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