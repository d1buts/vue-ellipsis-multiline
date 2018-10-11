import Vue from 'vue'

const ellipsisMultiline = {
  bind: function (el, binding) {
    const trimText = () => {
      el.innerHTML = binding.value.text
      const configs = binding.value.config
      let currentConfig = false
      const configsKeys = Object.keys(configs)
      configsKeys.some((item) => {
        if (parseInt(item) > window.innerWidth) {
          currentConfig = configs[item]
        }
      })
      if (!currentConfig) {
        currentConfig = configs.default
      }
      const calcHeight = currentConfig.lineHeight * currentConfig.linesCount
      let text = ''
      while (el.clientHeight > calcHeight) {
        text = el.innerHTML
        text = text.split(' ')
        text.pop()
        text = text.join(' ')
        el.innerHTML = `${text}...`
      }
    }
    setTimeout(trimText, 0)
  },
  unbind: function () {
  }
}

Vue.directive('ellipsisMultiline', ellipsisMultiline)