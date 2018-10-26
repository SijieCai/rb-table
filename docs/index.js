import React from 'react';
import ReactDOM from 'react-dom';
import RBTable from '../src/index';
import { ResizableBox } from 'react-resizable';
import './style.css';

class Application extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const { header1Width, header2Width, header3Width, fixedHeader, bump1000, bump5000, noHeight } = this.state;
    return (
      <div>
        <div className="block">

          <h1>rb-table Playground</h1>
          <div>
            <label><input checked={!!header1Width} onChange={() => this.setState({ header1Width: !header1Width })} type="checkbox" /> Set header1 minWidth: 100 and maxWidth: 120, it fit one line so minWidth is used at first.</label><br />

            <label><input checked={!!header2Width} onChange={() => this.setState({ header2Width: !header2Width })} type="checkbox" /> Set header2 minWidth: 200 and maxWidth: 300, use maxWidth to fit in one line AMAP.</label><br />

            <label><input checked={!!header3Width} onChange={() => this.setState({ header3Width: !header3Width })} type="checkbox" /> Set header3 width to 100</label><br />


            <label><input checked={!!fixedHeader} onChange={() => this.setState({ fixedHeader: !fixedHeader })} type="checkbox" /> Fix header1 and header6 to left and right, try scroll it everywhere!</label><br />

            <label><input checked={!!bump1000} onChange={() => this.setState({ bump1000: !bump1000 })} type="checkbox" /> Bump 1000 rows!</label>


            <label><input checked={!!bump5000} onChange={() => this.setState({ bump5000: !bump5000 })} type="checkbox" /> Try 5000 rows!</label><br />


            <label><input checked={!!noHeight} onChange={() => this.setState({ noHeight: !noHeight })} type="checkbox" /> No specify height</label><br />
          </div>

          <ResizableBox className="box" height={250} width={800} draggableOpts={{ grid: [25, 25] }}>
            <div className="wrapper">
              <RBTable key={noHeight + ''} style={{ height: noHeight ? undefined : '100%' }}
                columns={[
                  {
                    header: () => 'header1', cell: i => i,
                    fixed: fixedHeader ? 'left' : undefined,
                    minWidth: header1Width ? 100 : null,
                    maxWidth: header1Width ? 120 : null
                  }, {
                    header: 'header2',
                    cell: i => (i === 1 ? 'this cell content is used to demo how minWidth and maxWidth behaved.' : i),
                    minWidth: header2Width ? 200 : null,
                    maxWidth: header2Width ? 300 : null
                  },
                  {
                    header: 'header3', cell: i => i,
                    width: header3Width ? 100 : null,
                  },
                  { header: <span>header3</span>, cell: i => i },
                  { header: 'header4', cell: i => i },

                  { header: 'header5', cell: i => i },
                  { header: 'header6', cell: i => i, fixed: fixedHeader ? 'right' : undefined }
                ]}
                data={Array(bump5000 ? 5000 : (bump1000 ? 1000 : 10)).fill().map((a, b) => b)}
              />
            </div>
          </ResizableBox>


          <p><b>Try resize the table see how it works, drag the red block!</b></p>
          <p><b>Use Ctrl + F to search and locate content.</b></p>
          <p><a href="https://github.com/sijiecai/rb-table/blob/master/docs/index.js"> see code example.</a></p>
          <h2>Layout Design</h2>
          <p>
            The column layout strategy of rb-table simply try to make content in one line as much as possible. If columns total width exceeds container width, it display a horizontal scrollbar.
        </p>
          <p>
            The height layout strategy depends on if .rb-table has a specified height, if it does a vertical scrollbar will display when table total height is exceeded. otherwise it just takes as height as it should be just like normal table. You can specify height using css style or to make it into a column flexbox and set "flex: 1 0 0". 
          </p>

          <h2>Comparison with existing Library</h2>

          <p>Compare with <a href="https://bvaughn.github.io/react-virtualized/#/components/Table">react-virtualize</a> and <a href="https://github.com/schrodinger/fixed-data-table-2">fixed-data-table-2</a></p>
          <ul>
            <li><b>rb-table pros:</b> you can use <i>Crtl + F</i> to search and auto scroll to matched content.</li>
            <li><b>react-virtualize or fixed-data-table-2 pros:</b> Handles large amount of data. fixed-data-table-2 is feature rich but the scrolling experience is not so good.</li>
          </ul>

          <p>Compare with antd <a href="https://ant.design/components/table-cn/">rc-table</a></p>
          <ul>
            <li><b>rb-table pro:</b> You are able to scroll the table anywhere, even on top of fixed columns/header. Better performance.</li>
            <li><b>rc-table pro:</b> Much more features provided, bundle with antd is a big plus.</li>
          </ul>

          <p>Unique of rb-table</p>
          <p>A special designed table layout are provided which makes table layout so much easier in a lot scenes. </p>

        </div>
      </div>);
  }
}

ReactDOM.render(<Application />, document.getElementById('app'));