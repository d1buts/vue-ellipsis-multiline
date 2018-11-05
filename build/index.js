"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var defaultValues = {
  text: "",
  ending: "...",
  maxLines: 0
};

var showError = function showError(message) {
  return console.error("[vue-ellipsis-multi-line]: " + message);
};

var isServer = function isServer(vNode) {
  return typeof vNode.componentInstance !== "undefined" && vNode.componentInstance.$isServer && showError("Run on client only");
};

var checkValue = function checkValue(valueType) {
  return function (value) {
    return value && (typeof value === "undefined" ? "undefined" : _typeof(value)) === valueType;
  };
};
var checkNumber = checkValue("number");
var checkString = checkValue("string");

var getStyle = function getStyle(styleProp) {
  return function (el) {
    return el.currentStyle ? el.currentStyle[styleProp] : document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
  };
};

var getLineHeightProp = getStyle("line-height");

var getLineHeightValue = function getLineHeightValue(el) {
  var _lh = getLineHeightProp(el);
  _lh === "normal" && showError("Please set value of CSS line-height property to current or parent element");
  return parseInt(_lh);
};

var calcMaxHeight = function calcMaxHeight(_ref, el) {
  var maxLines = _ref.maxLines;

  var lh = getLineHeightValue(el);
  return maxLines > 0 && checkNumber(maxLines) && checkNumber(lh) && maxLines * lh || Number.POSITIVE_INFINITY;
};

var getNewString = function getNewString(text, ending) {
  var endingStartIndex = text.length - ending.length;
  return text.substring(endingStartIndex) === ending ? text.substring(0, endingStartIndex) : text;
};

var insertText = function insertText(_ref2, el, maxHeight) {
  var text = _ref2.text,
      _ref2$ending = _ref2.ending,
      ending = _ref2$ending === undefined ? "..." : _ref2$ending;

  el.innerHTML = text;
  if (el.clientHeight > maxHeight) {
    text = getNewString(el.innerHTML, ending);
    text = text.split(" ");
    text.pop();
    text = text.join(" ");
    insertText({ text: "" + text + ending, ending: ending }, el, maxHeight);
  }
};

var validateValues = function validateValues(_ref3) {
  var text = _ref3.text,
      ending = _ref3.ending,
      maxLines = _ref3.maxLines;
  return checkNumber(maxLines) >= 0 && checkString(text) && checkString(ending);
};

var prepareValues = function prepareValues(_ref4) {
  var text = _ref4.text,
      ending = _ref4.ending,
      maxLines = _ref4.maxLines;

  ending = ending || defaultValues.ending;
  maxLines = maxLines || defaultValues.maxLines;
  ending = ending || defaultValues.ending;

  var value = { text: text, ending: ending, maxLines: maxLines };

  !validateValues(value) && showError("Configuration properties are not valid");

  return value;
};
var bind = function bind(el, _ref5, VNode) {
  var oldValue = _ref5.oldValue,
      value = _ref5.value;

  value = prepareValues(value);

  isServer(VNode);

  setTimeout(function () {
    el.__listener = function () {
      return insertText(value, el, calcMaxHeight(value, el));
    };
    el.__listener();
    window.addEventListener("resize", el.__listener);
  }, 0);
};

var unbind = function unbind(el, _ref6, VNode) {
  var value = _ref6.value;

  window.removeEventListener("resize", el.__listener);
};

var update = function update() {
  unbind.apply(undefined, arguments);
  bind.apply(undefined, arguments);
};

exports.default = {
  bind: bind,
  inserted: function inserted() {},
  update: update,
  unbind: unbind
};