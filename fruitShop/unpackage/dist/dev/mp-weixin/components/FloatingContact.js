"use strict";
const common_vendor = require("../common/vendor.js");
const common_assets = require("../common/assets.js");
const _sfc_main = common_vendor.defineComponent({
  name: "FloatingContact",
  props: {
    // 底部距离
    bottom: {
      type: Number,
      default: 150
    },
    // 右侧距离
    right: {
      type: Number,
      default: 30
    },
    // 显示文本
    showText: {
      type: Boolean,
      default: false
    },
    // 按钮文本
    text: {
      type: String,
      default: "客服"
    }
  },
  methods: {
    handleContact(e) {
      common_vendor.index.__f__("log", "at components/FloatingContact.vue:46", "联系客服事件触发：", e.detail);
      this.$emit("contact", e.detail);
    }
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$7,
    b: _ctx.showText
  }, _ctx.showText ? {
    c: common_vendor.t(_ctx.text)
  } : {}, {
    d: common_vendor.o((...args) => _ctx.handleContact && _ctx.handleContact(...args)),
    e: _ctx.bottom + "rpx",
    f: _ctx.right + "rpx"
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/FloatingContact.js.map
