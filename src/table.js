import React from 'react'
import PropTypes from 'prop-types'
import normalizeWheel from 'normalize-wheel'
import { addResizeListener, removeResizeListener } from './resize-detect';

function renderSomething(item, ...props) {
  if (!item) return;
  if (typeof (item) === 'string' || typeof (item) === 'number') return item;
  if (typeof (item) === 'function') return item(...props);
  if (React.isValidElement(item)) return React.cloneElement(item, { tableContext: props });
}
function getWidthStyle(r) {
  if (r.width) {
    return { width: r.width }
  }
  return null
}
function px(value) {
  if (!value) return value;
  return value + 'px';
}
function setWidth(ele, value) {
  ele.style.width = value;
}
function setHeight(ele, value) {
  ele.style.height = value;
}
// 遍历 
function forEachChildren(parent, cb) {
  for (var i = 0; i < parent.children.length; i++) {
    cb(parent.children[i], i);
  }
}
function minMaxWidthType(props, propName, componentName) {
  if (props.width && props[propName]) {
    return new Error(
      `${componentName}.column.${propName} will not take effect when column.width is set.`
    );
  }
  if (propName === 'maxWidth' && props.maxWidth < props.minWidth) {
    return new Error(
      `${componentName}.column.maxWidth is smaller then column.minWidth`
    );
  }
}
export default class RBTable extends React.Component {

  constructor(props) {
    super(props);
    this.setTableRef = this.setTableRef.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleClickRow = this.handleClickRow.bind(this);
    this.handleWindowMouseUp = this.handleWindowMouseUp.bind(this);
    this.handleWindowMouseMove = this.handleWindowMouseMove.bind(this);
    this.hScrollPanelMouseDown = this.hScrollPanelMouseDown.bind(this);
    this.vScrollPanelMouseDown = this.vScrollPanelMouseDown.bind(this);
    this.hScrollBarMouseDown = this.hScrollBarMouseDown.bind(this);
    this.vScrollBarMouseDown = this.vScrollBarMouseDown.bind(this);
  }

  componentWillUnmount() {
    addResizeListener(this.table, this.handleResize);
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

  setTableRef(table) {
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

  handleResize() {
    this.reflow();
  }

  reflow() {
    this.alignTable();
    this.scrollByOffset(0, 0);
  }

  handleScroll(e) {
    var { pixelY, pixelX } = normalizeWheel(e);
    pixelY = Math.round(pixelY * .5);
    pixelX = Math.round(pixelX * .5);
    const { hasOffset } = this.scrollByOffset(pixelX, pixelY);
    e.preventDefault();
    if (hasOffset) {
      e.stopPropagation();
    }
  }

  handleClickRow(item, i) {
    this.props.onRowClick && this.props.onRowClick(item, i)
  }

  setLocation(clientX, clientY) {
    this.x = clientX;
    this.y = clientY;
  }

  handleWindowMouseUp() {
    this.mouseIsDownRight = false;
    this.mouseIsDownBottom = false;
  }

  handleWindowMouseMove({ clientX, clientY }) {
    if (this.mouseIsDownBottom) {
      this.handleMouseMove(clientX, 0);
    } else if (this.mouseIsDownRight) {
      this.handleMouseMove(0, clientY);
    }
  }

  hScrollPanelMouseDown(e) {
    e.preventDefault();
    let x = e.clientX - this.refs.hScrollBar.getBoundingClientRect().left;
    this.scrollByOffset(x, 0);
  }

  vScrollPanelMouseDown(e) {
    e.preventDefault();
    let y = e.clientY - this.refs.vScrollBar.getBoundingClientRect().top;
    this.scrollByOffset(0, y);
  }

  hScrollBarMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    this.mouseIsDownBottom = true;
    this.setLocation(e);
  }

  vScrollBarMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    this.mouseIsDownRight = true;
    this.setLocation(e);
  }

  handleMouseMove(clientX, clientY) {
    const offsetX = clientX - this.x;
    var offsetY = clientY - this.y;
    this.setLocation(clientX, clientY);
    this.scrollByOffset(offsetX, offsetY);
  }

  getHoverClass() {
    const { prefixCls } = this.props
    var cls = ` ${prefixCls}-row--hover`
    if (this.props.onRowClick) {
      cls += `${prefixCls}-row--clickable`
    }
    return cls;
  }

  bodies() {
    const { bodyMiddleContent, bodyLeftContent, bodyRightContent } = this.refs;
    return [bodyMiddleContent, bodyLeftContent, bodyRightContent].filter(i => !!i);
  }


  handleRowEnter(i) {
    this.bodies().forEach(body => body.children[i].className += this.getHoverClass())
  }

  handleRowLeave(i) {
    this.bodies().forEach(body => body.children[i].className = body.children[i].className.replace(this.getHoverClass(), ''))
  }

  // 表格宽高布局
  getTableWidthHeight() {
    const { virtualTable } = this.refs;

    const columnWs = [];
    const rowHs = [];

    const headerRow = virtualTable.querySelector('thead > tr');
    const colgroup = virtualTable.querySelector('colgroup');

    // 初始化列宽，用来翻页，resize 等情况
    this.props.columns.forEach((c, i) => {
      colgroup.children[i].style.width = px(c.width || '');
    })

    // 获取列宽
    function getColumnWs() {
      for (let i = 0; i < headerRow.children.length; i++) {
        // add 1 for firfox -mox-max-content use decimal, when offsetWidth is floor will cause column break into 2 lines.
        columnWs[i] = headerRow.children[i].offsetWidth + 1;
      }
    }
    getColumnWs();

    // 如果有 maxWidth 和 minWidth，如果有需要重新 layout table
    this.props.columns.forEach(({ width, minWidth, maxWidth }, i) => {
      if (maxWidth || minWidth) {
        width = columnWs[i];
        width = Math.min(maxWidth || width, width);
        width = Math.max(minWidth || width, width);
        colgroup.children[i].style.width = px(width);
      }
    })
    getColumnWs();

    // 获取行高
    virtualTable.querySelectorAll('tbody > tr').forEach((tr, i) => {
      rowHs[i] = tr.offsetHeight;
    });
    return { columnWs, rowHs };
  }

  // 对齐表格的，主要是表头固定，左右两列也是固定，都是手动通过代码进行固定
  alignTable() {
    const { headerLeft, headerRight, body } = this.refs;
    const { columns } = this.props;

    const fixedHeaders = [headerLeft, headerRight].filter(i => !!i);

    // 清空左右fixed header 之前计算的高度，用于处理行高变化的情况
    fixedHeaders.forEach(i => {
      setHeight(i.querySelector('tr'), '');
    });

    // 获取 body 行高和列宽，再进行设置，减少渲染提高性能
    const { columnWs, rowHs } = this.getTableWidthHeight()
    // 获取 header 行高
    const headerBodyHeight = this.refs.virtualTable.querySelector('thead > tr').clientHeight;
    // 获取 table 高度 
    const tableClientHeight = this.table.clientHeight;
    // 获取 hscrollbar 高度
    const hScrollbarHeight = this.refs.hScrollPanel.offsetHeight;


    const bodyColgroupMiddle = this.refs.bodyMiddle.querySelector('colgroup');
    const headerColgroupMiddle = this.refs.headerMiddle.querySelector('colgroup');
    // 设置 列宽 并计算总宽度
    let totalWidth = 0;
    let rightColumnIndex = 0;
    columnWs.forEach((w, i) => {
      let wpx = px(w);
      totalWidth += w;
      bodyColgroupMiddle.children[i].style.width = wpx;
      headerColgroupMiddle.children[i].style.width = wpx;
      if (!columns[i].width) {
        if (columns[i].fixed === 'left') {
          headerLeft.querySelector('colgroup').children[i].style.width = wpx;
          this.refs.bodyLeft.querySelector('colgroup').children[i].style.width = wpx;
        }
        else if (columns[i].fixed === 'right') {
          headerRight.querySelector('colgroup').children[rightColumnIndex].style.width = wpx;
          this.refs.bodyRight.querySelector('colgroup').children[rightColumnIndex].style.width = wpx;
          rightColumnIndex++;
        }
      }
    });
    totalWidth = Math.max(totalWidth, this.refs.scrollX.clientWidth);
    // 设置 header 宽度 = totalWidth
    setWidth(this.refs.header, px(totalWidth))
    // 设置 body 宽度，用来隐藏滚动条  
    body.style.width = px(this.refs.header.clientWidth + 300 + body.offsetWidth - body.clientWidth);

    let headerHeight = this.refs.header.offsetHeight;
    // 设置 header 行高
    fixedHeaders.forEach(i => {
      setHeight(i.querySelector('tr'), px(headerBodyHeight));
      setHeight(i.parentElement, px(headerHeight));
    });
    // 设置 body 行高
    this.bodies().forEach(body => {
      forEachChildren(body, (tr, i) => setHeight(tr, px(rowHs[i])));
    });

    // 设置高度，形成一个上下布局，上部固定高度，底部（body）占满
    this.refs.body.style.height = px(tableClientHeight - headerHeight - hScrollbarHeight)

  }

  scrollByOffset(offsetX, offsetY) {
    if (!this.table) return;
    var { bodyMiddle,
      hScrollBar, hScrollPanel,
      vScrollBar, vScrollPanel } = this.refs;
    if (!bodyMiddle) return;
    const bodyWidth = this.refs.scrollX.offsetWidth;
    // body 内容高度，不包含 header
    const bodyHeight = this.refs.body.clientHeight;
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

    var left = Math.round(this.refs.scrollX.scrollLeft + offsetX);
    var top = Math.round(this.refs.body.scrollTop + offsetY);
    // hasOffset 用来判断 wheel 已经滑到边缘，这样可以不用 preventDefault 和 stopPropagation wheel 的事件，让外层的滚动元素起作用
    var hasOffset = true;
    if (left > contentWidth - bodyWidth) {
      left = contentWidth - bodyWidth;
      hasOffset = false;
    }
    if (left < 0) {
      left = 0;
      hasOffset = false;
    }
    if (top > contentHeight - bodyHeight) {
      top = contentHeight - bodyHeight;
      hasOffset = false;
    }
    if (top < 0) {
      top = 0;
      hasOffset = false;
    }
    this.refs.body.scrollTop = top;
    this.refs.scrollX.scrollLeft = left;
    // 宽度是一个百分比
    if (hScrollBar) {
      hScrollPanel.style.visibility = 'visible';
      hScrollBar.style.width = `${Math.round(hScrollBarWidth)}px`;

      let x = Math.round(left / hOffsetRatio);
      hScrollBar.style.transform = 'translateX(' + x + 'px)';
    }

    function handleFixedBlock(ele, value) {
      if (!ele) return;
      if (value === 0 && ele) {
        ele.parentElement.parentElement.style.display = 'none';
      } else {
        ele.parentElement.parentElement.style.display = 'block';
        ele.style.transform = 'translateY(' + (-top) + 'px)';
      }
    }
    handleFixedBlock(this.refs.bodyLeft, left);
    handleFixedBlock(this.refs.bodyRight, left - contentWidth + bodyWidth);

    if (vScrollBar) {
      let y = Math.round(top / vOffsetRatio);
      vScrollPanel.style.visibility = 'visible';
      vScrollBar.style.height = `${Math.round(vScrollBarHeight)}px`;
      vScrollBar.style.transform = 'translateY(' + y + 'px)';
    }
    return { hasOffset }
  }

  renderHeaderSideOf({ side, ...params }) {
    const sideL = side.toLowerCase()
    const columns = params[sideL + 'Columns']
    if (columns.length === 0) return null;

    const { prefixCls } = this.props
    return (
      <table ref={`header${side}`}>
        <colgroup>
          {columns.map((r, i) =>
            <col key={i} style={getWidthStyle(r)} />
          )}
        </colgroup>
        <thead>
          <tr className={`${prefixCls}-row ${prefixCls}-row--header`}>
            {columns.map((column, i) =>
              <td key={column.dataIndex || i} className={`${prefixCls}-cell ${prefixCls}-cell--header`} style={column.headerStyle}>
                {renderSomething(column.header, params.data, column)}
              </td>
            )}
          </tr>
        </thead>
      </table>
    );
  }

  renderBodySideOf({ side, data, ...params }) {
    const sideL = side.toLowerCase();
    const columns = params[sideL + 'Columns']
    if (columns.length === 0) return null;

    const { prefixCls } = this.props
    return (
      <table ref={`body${side}`}>
        <colgroup>
          {columns.map((r, i) =>
            <col key={i} style={getWidthStyle(r)} />
          )}
        </colgroup>
        <tbody ref={`body${side}Content`}>
          {data.map((item, i) =>
            <tr key={i}
              className={`${prefixCls}-row ${prefixCls}-row--body`}
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
    );
  }

  renderVirtualTable(params) {
    const { data, columns } = params;
    const { prefixCls } = this.props
    return (
      <table className={`${prefixCls}-hidden-layout`} ref="virtualTable">
        <colgroup>
          {columns.map((r, i) =>
            <col key={i} style={getWidthStyle(r)} />
          )}
        </colgroup>
        <thead>
          <tr className={`${prefixCls}-row ${prefixCls}-row--header`}>
            {columns.map((column, i) =>
              <td key={column.dataIndex || i} className={`${prefixCls}-cell ${prefixCls}-cell--header`} style={column.headerStyle}>
                {renderSomething(column.header, params.data, column)}
              </td>
            )}
          </tr>
        </thead>
        <tbody ref="virtualTableBody">
          {data.map((item, i) =>
            <tr key={i} className={`${prefixCls}-row ${prefixCls}-row--body`} >
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
    );
  }
  render() {
    const { data, columns, prefixCls, style, className } = this.props;

    var middleColumns = columns.slice();
    const leftColumns = columns.filter(i => i.fixed === 'left');
    const rightColumns = columns.filter(i => i.fixed === 'right');

    const getParams = side => ({ side, columns, leftColumns, rightColumns, middleColumns, data });
    return (
      <div className={`${prefixCls} ${className || ''}`}
        key="rb-table"
        ref={this.setTableRef}
        onWheel={this.handleScroll}
        style={style}
      >
        <div ref="scrollX" className={`${prefixCls}-scrollx`} onScroll={() => this.scrollByOffset(0, 0)} >
          <div className={`${prefixCls}__header`} ref="header" >
            {this.renderHeaderSideOf(getParams('Middle'))}
          </div>
          <div className={`${prefixCls}__body`} ref="body" onScroll={() => this.scrollByOffset(0, 0)}>
            {this.renderBodySideOf(getParams('Middle'))}
            {this.renderVirtualTable(getParams('virtual'))}
          </div>
        </div>
        {leftColumns.length &&
          <div className={`${prefixCls}-fixed ${prefixCls}-fixed--left`}>
            <div className={`${prefixCls}-fixed__header`}>
              {this.renderHeaderSideOf(getParams('Left'))}
            </div>
            <div className={`${prefixCls}-fixed__body`}>
              {this.renderBodySideOf(getParams('Left'))}
            </div>
          </div>
        }
        {rightColumns.length &&
          <div className={`${prefixCls}-fixed ${prefixCls}-fixed--right`}>
            <div className={`${prefixCls}-fixed__header`}>
              {this.renderHeaderSideOf(getParams('Right'))}
            </div>
            <div className={`${prefixCls}-fixed__body`}>
              {this.renderBodySideOf(getParams('Right'))}
            </div>
          </div>
        }
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

RBTable.propTypes = {
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
    width: PropTypes.number,
    minWidth: minMaxWidthType,
    maxWidth: minMaxWidthType,
    fixed: PropTypes.oneOf(['left', 'right']),
    className: PropTypes.string,
    onRowClick: PropTypes.func
  })),
  data: PropTypes.array.isRequired,
  prefixCls: PropTypes.string.isRequired,
}

RBTable.defaultProps = {
  prefixCls: 'rb-table',
  data: []
}