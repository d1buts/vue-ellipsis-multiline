const defaultValues = {
  text: "",
  ending: "...",
  maxLines: 0
};

const showError = message =>
  console.error(`[vue-ellipsis-multi-line]: ${message}`);

const isServer = vNode =>
  typeof vNode.componentInstance !== "undefined" &&
  vNode.componentInstance.$isServer &&
  showError(`Run on client only`);

const checkValue = valueType => value => value && typeof value === valueType;
const checkNumber = checkValue("number");
const checkString = checkValue("string");

const getStyle = styleProp => el =>
  el.currentStyle
    ? el.currentStyle[styleProp]
    : document.defaultView
        .getComputedStyle(el, null)
        .getPropertyValue(styleProp);

const getLineHeightProp = getStyle("line-height");

const getLineHeightValue = el => {
  const _lh = getLineHeightProp(el);
  _lh === "normal" &&
    showError(
      `Please set value of CSS line-height property to current or parent element`
    );
  return parseInt(_lh);
};

const calcMaxHeight = ({ maxLines }, el) => {
  const lh = getLineHeightValue(el);
  return (
    (maxLines > 0 &&
      checkNumber(maxLines) &&
      checkNumber(lh) &&
      maxLines * lh) ||
    Number.POSITIVE_INFINITY
  );
};

const getNewString = (text, ending) => {
  const endingStartIndex = text.length - ending.length;
  return text.substring(endingStartIndex) === ending
    ? text.substring(0, endingStartIndex)
    : text;
};

const insertText = ({ text, ending = "..." }, el, maxHeight) => {
  el.innerHTML = text;
  if (el.clientHeight > maxHeight) {
    text = getNewString(el.innerHTML, ending);
    text = text.split(" ");
    text.pop();
    text = text.join(" ");
    insertText({ text: `${text}${ending}`, ending }, el, maxHeight);
  }
};

const validateValues = ({ text, ending, maxLines }) =>
  checkNumber(maxLines) >= 0 && checkString(text) && checkString(ending);

const prepareValues = ({ text, ending, maxLines }) => {
  ending = ending || defaultValues.ending;
  maxLines = maxLines || defaultValues.maxLines;
  ending = ending || defaultValues.ending;

  const value = { text, ending, maxLines };

  !validateValues(value) && showError(`Configuration properties are not valid`);

  return value;
};
const bind = (el, { oldValue, value }, VNode) => {
  value = prepareValues(value);

  isServer(VNode);

  setTimeout(() => {
    el.__listener = () => insertText(value, el, calcMaxHeight(value, el));
    el.__listener();
    window.addEventListener("resize", el.__listener);
  }, 0);
};

const unbind = (el, { value }, VNode) => {
  window.removeEventListener("resize", el.__listener);
};

const update = (...args) => {
  unbind(...args);
  bind(...args);
};

export default {
  bind,
  inserted: function() {},
  update,
  unbind
};
