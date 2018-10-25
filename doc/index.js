import React from 'react';
import ReactDOM from 'react-dom';
import RBTable from '../src/index';
import { ResizableBox } from 'react-resizable';
import HashRouter from 'react-router-dom/HashRouter';
import { NavLink, Switch, Route, Redirect } from 'react-router-dom';
import Height from './height';
import './style.css';

const columns = [
  { header: () => 'header 1', cell: i => i, fixed: 'left' },
  { header: 'header 2', cell: i => i },
  { header: <span>header 3</span>, cell: i => i },
  { header: 'header 4', cell: i => i },
  { header: 'header 5', cell: i => i },
  { header: 'header 6', cell: i => i },
  { header: 'header 7', cell: i => i },
  { header: 'header 8', cell: i => i },
  { header: 'header 9', cell: i => i, fixed: 'right' }
]
const data = Array(10).fill().map((a, b) => b);
class Application extends React.Component {

  render() {
    return <div style={{ padding: 30, background: 'white' }}>
      <div>
        <NavLink to="/height"> Specify table height</NavLink>
        <NavLink to="/no-height"> Specify table height</NavLink>
      </div>
      <Switch>
        <Route path="/height" component={Height}/>
        <Route path="/no-height">
          <ResizableBox className="box" height={400} width={600} draggableOpts={{ grid: [25, 25] }}>
            <div style={{ height: '100%', overflow: 'auto' }}>
              <RBTable
                columns={columns}
                data={data}
              />
            </div>
          </ResizableBox>
        </Route>
        <Redirect to="/height" />
      </Switch>
    </div>;
  }
}

ReactDOM.render(<HashRouter><Application /></HashRouter>, document.getElementById('app'));