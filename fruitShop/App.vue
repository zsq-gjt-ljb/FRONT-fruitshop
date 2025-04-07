<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/* 全局样式 */
	page {
		background-color: #f8f9fc; /* 设置淡蓝色背景 */
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
			Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
			sans-serif;
	}

	/* 主题色变量 */
	:root {
		--primary-color: #4a90e2;
		--secondary-color: #f0f7ff;
		--text-color: #333333;
		--border-color: #e5e5e5;
	}
</style>
