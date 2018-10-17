import React from 'react'
import './style.less'
import normalizeMouseWheel from './normalize-mousewheel'
import PropTypes from 'prop-types'
import { addResizeListener, removeResizeListener } from './element-resize'
var containerWidth = 0;

function renderSomething(item, ...props) {
  if (!item) return;
  if (typeof (item) === 'string' || typeof (item) === 'number') return item;
  if (typeof (item) === 'function') return item(...props);
  if (React.isValidElement(item)) return React.cloneElement(item, { tableContext: props });
}

export default class extends React.Component {
  static propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
      header: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.func,
        PropTypes.element
      ]).isRequired,
      cell: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.func,
        PropTypes.element
      ]).isRequired,
      width: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]),
      fixed: PropTypes.oneOf(['left', 'right']),
      className: PropTypes.string
    })),
    data: PropTypes.array.isRequired,
    prefixCls: PropTypes.string.isRequired,
  }

  static defaultProps = {
    prefixCls: 'rb-table',
    data: []
  }

  componentWillUnmount() {
    removeResizeListener(this.table, this.handleResize);
    window.removeEventListener('mouseup', this.handleWindowMouseUp);
    window.removeEventListener('mousemove', this.handleWindowMouseMove);
  }

  componentDidMount() {


    window.addEventListener('mouseup', this.handleWindowMouseUp);
    window.addEventListener('mousemove', this.handleWindowMouseMove);
    // 子元素或者兄弟元素可能在之后加载导致当前元素的高度变化，setTimeout hack 这个情况
    setTimeout(() => {
      this.reflow();
    });
  }

  setTableRef = (table) => {
    if (table) {
      if (this.table) {
        removeResizeListener(this.table, this.handleResize);
      }
      this.table = table;
      addResizeListener(table, this.handleResize);
    }
  }

  componentDidUpdate() {
    this.reflow();
  }

  handleResize = () => {
    this.forceUpdate();
  }

  reflow() {
    this.alignTable();
    this.scrollByOffset(0, 0);
  }

  getTableWidthHeight() {
    const { bodyMiddleContent, bodyLeftContent, bodyRightContent } = this.refs;
    if (!bodyMiddleContent) return;

    const columnWs = [], rowHs = [];

    // 获取列宽
    const columns = bodyMiddleContent.children[0];
    if (columns && columns.children) {
      for (var i = 0; i < columns.children.length; i++) {
        columnWs.push(columns.children[i].offsetWidth);
      }
    }

    const list = [bodyMiddleContent, bodyLeftContent, bodyRightContent].filter(i => i);

    // 获取最大的行高

    list.forEach(({ children }) => {
      for (var i = 0; i < children.length; i++) {
        rowHs[i] = Math.max(rowHs[i] || 0, children[i].offsetHeight);
      }
    });
    return { columnWs, rowHs };
  }

  handleScroll = (e) => {
    var { pixelY, pixelX } = normalizeMouseWheel(e);
    pixelY = Math.round(pixelY * .5);
    pixelX = Math.round(pixelX * .5);
    const { hasOffset } = this.scrollByOffset(pixelX, pixelY);
    if (hasOffset) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  handleClickRow = (item, i) => {
    this.props.onClickRow && this.props.onClickRow(item, i)
  }

  setLocation(clientX, clientY) {
    this.x = clientX;
    this.y = clientY;
  }

  handleWindowMouseUp = () => {
    this.mouseIsDownRight = false;
    this.mouseIsDownBottom = false;
  }

  handleWindowMouseMove = ({ clientX, clientY }) => {
    if (this.mouseIsDownBottom) {
      this.throttleMouseMove(clientX, 0);
    } else if (this.mouseIsDownRight) {
      this.throttleMouseMove(0, clientY);
    }
  }

  hScrollPanelMouseDown = (e) => {
    e.preventDefault();
    let x = e.clientX - this.refs.hScrollBar.getBoundingClientRect().left;
    this.scrollByOffset(x, 0);
  }

  vScrollPanelMouseDown = (e) => {
    e.preventDefault();
    let y = e.clientY - this.refs.vScrollBar.getBoundingClientRect().top;
    this.scrollByOffset(0, y);
  }

  hScrollBarMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.mouseIsDownBottom = true;
    this.setLocation(e);
  }

  vScrollBarMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.mouseIsDownRight = true;
    this.setLocation(e);
  }

  throttleMouseMove = (...args) => this.handleMouseMove(...args)

  handleMouseMove = (clientX, clientY) => {
    const offsetX = clientX - this.x;
    var offsetY = clientY - this.y;
    this.setLocation(clientX, clientY);
    this.scrollByOffset(offsetX, offsetY);
  }

  scrollByOffset(offsetX, offsetY) {
    if (!this.table) return;
    var { headerMiddle, bodyMiddle, bodyLeft, bodyRight,
      hScrollBar, hScrollPanel,
      vScrollBar, vScrollPanel } = this.refs;
    if (!bodyMiddle) return;
    const bodyWidth = bodyMiddle.parentElement.offsetWidth;
    const bodyHeight = bodyMiddle.parentElement.offsetHeight;
    const contentWidth = bodyMiddle.offsetWidth;
    const contentHeight = bodyMiddle.offsetHeight;

    var hOffsetRatio = 1, vOffsetRatio = 1;

    if (contentHeight <= bodyHeight) {
      vScrollPanel.style.visibility = 'hidden';
      vScrollBar = null;
      vScrollPanel = null;
    }
    if (contentWidth <= bodyWidth) {
      hScrollPanel.style.visibility = 'hidden';
      hScrollBar = null;
      hScrollPanel = null;
    }

    if (hScrollBar) {
      var hScrollPanelWidth = hScrollPanel.offsetWidth;
      var hScrollBarWidth = hScrollPanelWidth * bodyWidth / contentWidth;
      hOffsetRatio = (contentWidth - bodyWidth) / (hScrollPanelWidth - hScrollBarWidth);
    }

    if (vScrollBar) {
      var vScrollPanelHeight = vScrollPanel.offsetHeight;
      var vScrollBarHeight = vScrollPanelHeight * bodyHeight / contentHeight;
      vOffsetRatio = (contentHeight - bodyHeight) / (vScrollPanelHeight - vScrollBarHeight);
    }

    offsetX = offsetX * hOffsetRatio;
    offsetY = offsetY * vOffsetRatio;

    const contentRect = bodyMiddle.getBoundingClientRect();
    const bodyRect = bodyMiddle.parentElement.getBoundingClientRect();
    var left = Math.round(contentRect.left - bodyRect.left - offsetX);
    var top = Math.round(contentRect.top - bodyRect.top - offsetY);
    // hasOffset 用来判断 wheel 已经滑到边缘，这样可以不用 preventDefault 和 stopPropagation wheel 的事件，让外层的滚动元素起作用
    var hasOffset = true;
    if (left < -contentWidth + bodyWidth) {
      left = -contentWidth + bodyWidth;
      hasOffset = false;
    }
    if (left > 0) {
      left = 0;
      hasOffset = false;
    }
    if (top < -contentHeight + bodyHeight) {
      top = -contentHeight + bodyHeight;
      hasOffset = false;
    }
    if (top > 0) {
      top = 0;
      hasOffset = false;
    }
    headerMiddle.style.transform = `translateX(${left}px)`;
    bodyMiddle.style.transform = `translate(${left}px,${top}px)`;
    bodyLeft && (bodyLeft.style.transform = `translateY(${top}px)`);
    bodyRight && (bodyRight.style.transform = `translateY(${top}px)`);
    // 宽度是一个百分比
    if (hScrollBar) {
      hScrollPanel.style.visibility = 'visible';
      hScrollBar.style.width = `${Math.round(hScrollBarWidth)}px`;
      hScrollBar.style.transform = `translateX(${Math.round(-left / hOffsetRatio)}px)`;
    }

    if (vScrollBar) {
      vScrollPanel.style.visibility = 'visible';
      vScrollBar.style.height = `${Math.round(vScrollBarHeight)}px`;
      vScrollBar.style.transform = `translateY(${Math.round(-top / vOffsetRatio)}px)`;
    }
    return { hasOffset }
  }

  calcColumnsWidth(columns) {
    var regx = /\d+px$/;
    return columns.reduce((sum, item) => {
      var width = item.minWidth || 0;
      if (typeof (item.width) === 'number') {
        width = item.width;
      } else if (typeof (item.width) === 'string' && regx.test(item.width)) {
        width = parseInt(item.width);
      }
      return sum + width;
    }, 0);
  }

  handleRowEnter = (i) => {
    const { bodyMiddleContent, bodyLeftContent, bodyRightContent } = this.refs;
    const { prefixCls } = this.props
    !this.props.onClickRow
      ? [bodyMiddleContent, bodyLeftContent, bodyRightContent].filter(i => i).forEach(ele => ele.children[i].className += ` ${prefixCls}-cell--hover`)
      : [bodyMiddleContent, bodyLeftContent, bodyRightContent].filter(i => i).forEach(ele => ele.children[i].className += ` ${prefixCls}-cell--hover ${prefixCls}-cell--hover-pointer`)
  }

  handleRowLeave = i => {
    const { bodyMiddleContent, bodyLeftContent, bodyRightContent } = this.refs;
    const { prefixCls } = this.props
    !this.props.onClickRow
      ? [bodyMiddleContent, bodyLeftContent, bodyRightContent].filter(i => i).forEach(ele => ele.children[i].className = ele.children[i].className.replace(` ${prefixCls}-cell--hover`, ''))
      : [bodyMiddleContent, bodyLeftContent, bodyRightContent].filter(i => i).forEach(ele => ele.children[i].className = ele.children[i].className.replace(` ${prefixCls}-cell--hover ${prefixCls}-cell--hover-pointer`, ''))
  }

  getWrapperStyle(sideL, params) {
    var style;
    if (sideL !== 'middle') {
      style = { width: params[sideL + 'Width'], top: 0, [sideL]: 0, bottom: 0 }
    } else {
      style = { top: 0, bottom: 0, left: params.leftWidth, right: params.rightWidth };
    }
    return style;
  }
  // 对齐表格的，主要是表头固定，左右两列也是固定，都是手动通过代码进行固定
  alignTable = () => {
    const { headerColgroupMiddle, bodyMiddleContent, bodyLeftContent, bodyRightContent,
      headerLeftContent, headerMiddleContent, headerRightContent,
      headerLeft, headerMiddle, headerRight } = this.refs;
    if (!bodyMiddleContent) return;

    function setHeight(parent, setter) {
      for (var i = 0; i < parent.children.length; i++) {
        parent.children[i].style.height = setter(i)
      }
    }
    let headerBodylist = [headerLeftContent, headerMiddleContent, headerRightContent].filter(i => i);
    let headerlist = [headerLeft, headerMiddle, headerRight].filter(i => i);
    let bodyList = [bodyMiddleContent, bodyLeftContent, bodyRightContent].filter(i => i);


    // 清空之前的计算，用于处理行高变化的情况
    headerBodylist.forEach(i => i.style.height = '')
    headerlist.forEach(i => i.parentElement.parentElement.style.height = '')
    this.refs.header.style.height = ''
    bodyList.forEach(i => setHeight(i, () => ''));

    // 先获取 body 行高和列宽，再进行设置，减少渲染提高性能
    const { columnWs, rowHs } = this.getTableWidthHeight()
    // 获取 header 行高
    const maxHeaderBodyHeight = Math.max(...headerBodylist.map(i => i.clientHeight))
    // 获取 header 高
    const maxHeaderHeight = Math.max(...headerlist.map(i => i.offsetHeight))
    // 获取 table 高度 
    const tableClientHeight = this.table.clientHeight;


    // 对齐 header 行高
    headerBodylist.forEach(i => i.style.height = maxHeaderBodyHeight + 'px')
    headerlist.forEach(i => i.parentElement.parentElement.style.height = maxHeaderHeight + 'px')
    this.refs.header.style.height = maxHeaderHeight + 'px'
    columnWs.forEach((w, i) => headerColgroupMiddle.children[i].style.width = w + 'px');
    bodyList.forEach(ele => setHeight(ele, i => rowHs[i] + 'px'));

    // 设置高度，形成一个上下布局，上部固定高度，底部（body）占满
    this.refs.body.style.height = (tableClientHeight - maxHeaderHeight) + 'px'
  }

  // 获取父亲容器的宽度，用于动态计算是否需要让左右的column 固定显示，
  // 因为如果宽度足够，就不需要左右滚动
  getContainerWidth = () => {
    var tableContainer = this.table
    if (tableContainer) {
      this.containerWidth = tableContainer.clientWidth;
      containerWidth = this.containerWidth;
    } else {
      this.containerWidth = containerWidth;
    }
    console.log(this.containerWidth)
    return this.containerWidth || 0;
  }

  getWidthStyle(r) {
    if (r.width) {
      return { width: r.width, minWidth: r.width }
    } if (r.minWidth) {
      return { minWidth: r.minWidth }
    }
    return null
  }

  renderHeaderSideOf({ side, ...params }) {
    const sideL = side.toLowerCase()
    const columns = params[sideL + 'Columns']
    if (columns.length === 0) return null;

    var style = this.getWrapperStyle(sideL, params)
    const { prefixCls } = this.props
    return (
      <div className={`${prefixCls}__header__wrapper ${prefixCls}__header__wrapper--${sideL}`} style={style}>
        <table ref={`header${side}`}>
          <colgroup ref={`headerColgroup${side}`}>
            {columns.map((r, i) =>
              <col key={i} style={this.getWidthStyle(r)} />
            )}
          </colgroup>
          <thead>
            <tr ref={`header${side}Content`}>
              {columns.map((column, i) =>
                <td key={column.dataIndex || i} className={`${prefixCls}-cell ${prefixCls}-cell--header`} style={column.headerStyle}>
                  {renderSomething(column.header, params.data, column)}
                </td>
              )}
            </tr>
          </thead>
        </table>
      </div>);
  }

  renderBodySideOf({ side, data, ...params }) {
    const sideL = side.toLowerCase();
    const columns = params[sideL + 'Columns']
    if (columns.length === 0) return null;

    const { prefixCls } = this.props
    var style = this.getWrapperStyle(sideL, params);
    return (
      <div className={`${prefixCls}__body__wrapper ${prefixCls}__body__wrapper--${sideL}`} style={style}>
        <table ref={`body${side}`}>
          <colgroup>
            {columns.map((r, i) =>
              <col key={i} style={this.getWidthStyle(r)} />
            )}
          </colgroup>
          <tbody ref={`body${side}Content`}>
            {data.map((item, i) =>
              <tr key={i}
                className={`${prefixCls}-row`}
                onMouseEnter={() => this.handleRowEnter(i)}
                onMouseLeave={() => this.handleRowLeave(i)}
                onClick={() => this.handleClickRow(item, i)}
              >
                {columns.map((column, j) =>
                  <td key={j}
                    style={column.cellStyle}
                    className={`${prefixCls}-cell ${prefixCls}-cell--body ${column.cellClassName || ''}`}
                  >{renderSomething(column.cell, item, data, column)}</td>
                )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  canTableFitInContainer(columns = this.props.columns) {
    const containerWidth = this.getContainerWidth();
    const totalWidth = this.calcColumnsWidth(columns);
    const canFitIn = totalWidth <= containerWidth;
    return canFitIn;
  }

  render() {
    const { data, columns, prefixCls, style, className } = this.props;

    const canFitIn = this.canTableFitInContainer(columns);
    var leftColumns = [];
    var rightColumns = [];
    var middleColumns = columns, leftWidth = 0, rightWidth = 0;
    if (!canFitIn) {
      leftColumns = columns.filter(i => i.fixed === 'left');
      leftWidth = this.calcColumnsWidth(leftColumns);
      rightColumns = columns.filter(i => i.fixed === 'right');
      rightWidth = this.calcColumnsWidth(rightColumns);
      middleColumns = columns.filter(i => !i.fixed);
    }
    const getParams = side => ({ side, columns, leftColumns, rightColumns, leftWidth, rightWidth, middleColumns, data });
    return (
      <div className={`${prefixCls} ${className || ''}`}
        key="rb-table"
        ref={this.setTableRef}
        onWheel={this.handleScroll}
        style={style}
      >
        <div className={`${prefixCls}__header`} ref="header" >
          {this.renderHeaderSideOf(getParams('Left'))}
          {this.renderHeaderSideOf(getParams('Middle'))}
          {this.renderHeaderSideOf(getParams('Right'))}
        </div>
        <div className={`${prefixCls}__body`} ref="body">
          {this.renderBodySideOf(getParams('Left'))}
          {this.renderBodySideOf(getParams('Middle'))}
          {this.renderBodySideOf(getParams('Right'))}
        </div>
        <div className={`${prefixCls}__vscroll`}
          ref="vScrollPanel"
          onMouseDown={this.vScrollPanelMouseDown}
        >
          <div ref="vScrollBar" onMouseDown={this.vScrollBarMouseDown} className={`${prefixCls}__vscroll__bar`} />
        </div>

        <div className={`${prefixCls}__hscroll`}
          ref="hScrollPanel"
          onMouseDown={this.hScrollPanelMouseDown}
        >
          <div ref="hScrollBar" onMouseDown={this.hScrollBarMouseDown} className={`${prefixCls}__hscroll__bar`} />
        </div>
        {this.props.children}
      </div>
    )
  }
}
