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
    this.refreshBlock();
  }

  public providerChanged(e: React.SyntheticEvent) {
    const target = e.currentTarget as HTMLInputElement
    this.setState({url: target.value, aggregator: new Aggregator(target.value)}, () => {this.refreshBlock()});
  }

  public refreshBlock() {
    if (this.state === null || this.state.aggregator === null) { return; }
    this.state.aggregator.totalEther()
    .then((block) => {
      if (this.state === null || this.state.aggregator === null) { return; }
      const blockStr = JSON.stringify(block, null, 2);
      if(block.transactions.length > 0) {
        for(const trn of block.transactions) {
            this.state.aggregator.getTrans(trn).then((trans)=> {
              const trnStr = JSON.stringify(trans, null, 2);
              this.setState({block: trnStr});
            })
        }
      }
      this.setState({block: blockStr});
    }).catch((err) => {
      this.setState({block: "error"});
    });
  }

  public render() {
    let blk = "no block found";
    if(this.state != null) {
      blk = this.state.block;
    }
    const providerUrlHandler = this.providerChanged.bind(this);

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          <label>Provider Url:
            <input key="providerUrl" onBlur={providerUrlHandler} type="text" />
          </label>
        </p>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <pre style={{textAlign: "left"}}>
          {blk}
        </pre>
      </div>
    );
  }
}

export default App;
