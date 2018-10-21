function isServer(vNode) {
  return typeof vNode.componentInstance !== 'undefined' && vNode.componentInstance.$isServer
}

const checkValue = valueType => value => value && typeof value === valueType

const checkNumber = checkValue('number')

const getStyle = styleProp => el => el.currentStyle ? el.currentStyle[styleProp] : document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp)

const getLineHeightProp = getStyle('line-height')

const getLineHeightValue = el => {
  const _lh = getLineHeightProp(el)
  if (_lh === 'normal') {
    console.error('[vue-ellipsis-multi-line:] Please set value of CSS line-height property to current or parent element')
  }
  return parseInt(_lh)
}

const calcMaxHeight = ({ maxLines }, el) => {
  const lh = getLineHeightValue(el)
  return checkNumber(maxLines) && checkNumber(lh) && maxLines * lh
}

const insertText = ({ text }, el, maxHeight) => {
  el.innerHTML = text
  while (el.clientHeight > maxHeight) {
    text = el.innerHTML
    text = text.split(' ')
    text.pop()
    text = text.join(' ')
    el.innerHTML = `${text}...`
  }
}

export default {
  bind: function (el, { oldValue, value }, VNode) {
    if (isServer(VNode)) {
      console.error('[vue-ellipsis-multi-line:] Run on client only')
    }
    setTimeout(()=> {
      const maxHeight = calcMaxHeight(value, el)
      insertText(value, el, maxHeight)
    }, 0)
    console.log({el, oldValue, value, VNode}, ' bind')
  },
  update: function (el, {oldValue, value}, VNode) {
    setTimeout(()=> {
      const maxHeight = calcMaxHeight(value, el)
      insertText(value, el, maxHeight)
    }, 0)
    console.log({el, oldValue, value, VNode}, 'update')
  },
  unbind: function (el, { value }, VNode) {
    console.log({el, value, VNode}, 'unbind')
  }
}