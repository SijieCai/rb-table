import React from 'react';
import ReactDOM from 'react-dom';
import RBTable from '../src/index';

class Application extends React.Component {
  render() {
    return <div style={{padding: 30, background: 'white'}}>
      <h1>Hello, rb-table</h1>
      <RBTable 
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
          data={[1,2,3,4,5,6,7]}
      />
    </div>;
  }
}

ReactDOM.render(<Application />, document.getElementById('app'));