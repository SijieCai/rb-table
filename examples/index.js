import React from 'react';
import ReactDOM from 'react-dom';
import RBTable from '../src/index';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

class Application extends React.Component {
  render() {
    return <div style={{ padding: 30, background: 'white' }}>
      <ResizableBox className="box" height={200} width={200} draggableOpts={{grid: [25, 25]}}>
        <RBTable style={{width: '100%', height: '100%'}}
          columns={[
            { header: () => 'header 1', cell: i => i },
            { header: 'header 2', cell: i => i },
            { header: <span>header 3</span>, cell: i => i },
            { header: 'header 4', cell: i => i },
            { header: 'header 5', cell: i => i },
            { header: 'header 6', cell: i => i },
            { header: 'header 7', cell: i => i },
            { header: 'header 8', cell: i => i },
            { header: 'header 9', cell: i => i }
          ]}
          data={[1, 2, 3, 4, 5, 6, 7]}
        />
      </ResizableBox>
    </div>;
  }
}

ReactDOM.render(<Application />, document.getElementById('app'));