import * as React from 'react';
import './App.css';

import { Aggregator } from './ether/aggregator';
import logo from './logo.svg';

class App extends React.Component<{}, {block: any, url: string, aggregator: Aggregator}> {
  public constructor(props: any) {
    super(props);
    this.state = {
      aggregator: new Aggregator(""),
      block: "initial block state",
      url: "https://localhost/"
    };
  }

  public componentDidMount() {
    if (this.state === null || this.state.aggregator === null) { return; }
    this.state.aggregator.totalEther().then((block) => {
      const blockStr = JSON.stringify(block, null, 2);
      this.setState({
        block: blockStr
      });
    }).catch((err) => {
      this.setState({
        block: "error"
      });
    });
  }

  public render() {
    let blk = "no block found";
    if(this.state != null) {
      blk = this.state.block;
    }
    let provider = "";
    if(this.state && this.state.aggregator) {
      provider = this.state.aggregator.constructor.name;
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <input type="text" />
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
          <br/>
          Ether Provider: {provider}
        </p>
        <pre style={{textAlign: "left"}}>
          {blk}
        </pre>
      </div>
    );
  }
}

export default App;
