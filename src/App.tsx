import * as React from 'react';
import './App.css';

import { Aggregator } from './ether/aggregator';
import logo from './logo.svg';

import * as Web3Types from 'web3/types';

import * as _ from 'underscore';

interface IAppProps {
    providerUrl?: string
}

interface IAppState {
  aggregator: Aggregator,
  block: any,
  index: number,
  mainState: string,
  transactions: any[],
  url: string
}

class App extends React.Component<IAppProps, IAppState> {
  public static defaultProps: Partial<IAppProps> = {
    providerUrl: 'http://localhost:4535'
  }
  private fromBlock: HTMLInputElement | null
  private toBlock: HTMLInputElement | null

  public constructor(props: any) {
    super(props);
    this.state = {
      aggregator: new Aggregator(props.providerUrl),
      block: "initial block state",
      index: 0,
      mainState: 'created',
      transactions: [],
      url: props.providerUrl
    };
  }

  public componentDidMount() {
    this.refreshBlock();
  }

  public providerChanged(e: React.SyntheticEvent) {
    const target = e.currentTarget as HTMLInputElement
    localStorage.setItem("saved-provider", target.value.toString());
    this.setState({url: target.value, aggregator: new Aggregator(target.value)}, () => {this.refreshBlock()});
  }

  public refreshBlock() {
    this.setState({mainState: 'pending'})
    if (this.state === null || this.state.aggregator === null || this.fromBlock === null || this.toBlock === null) { return; }

    let fromBlockNum = this.state.aggregator.getLatestBlock()
    if(this.fromBlock) {
        fromBlockNum = +this.fromBlock.value;
    }

    this.state.aggregator.totalEther(fromBlockNum-50, fromBlockNum, (b) => {this.setState({index: b})})
      .then((block: Web3Types.Block[]) => {
        if (this.state === null || this.state.aggregator === null) { return; }

        const blockStr = JSON.stringify(block, null, 2);
        const allTrans = _.collect(block, (c) => c.transactions);
        const trans = _.flatten(allTrans);

        this.setState({block: blockStr, transactions: trans, mainState: 'loaded'});
      }).catch((err: any) => {
        this.setState({block: "error", mainState: 'error'});
      });
  }

  public getLogoClass(): string {
    let cls = 'App-logo';
    if(this.state) {
      if(this.state.mainState !== 'pending') {
        cls = 'App-logo-still';
      }
    }
    return cls
  }

  public render() {
    let blk = "no block found";
    let providerUrl = '';
    let latest = 0;
    let index = 0;

    if(this.state != null) {
      blk = this.state.block;
      providerUrl = this.state.url;
      latest = this.state.aggregator.getLatestBlock()
      index = this.state.index
    }
    const providerUrlHandler = this.providerChanged.bind(this);
    const blockRangeHandler = this.refreshBlock.bind(this);

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className={this.getLogoClass()} alt="logo" />
          <h1 className="App-title">Welcome to EtherFlow a simple blockchain explorer</h1>
        </header>
        <p className="App-intro">
          <label>Provider Url:
            <input key="providerUrl" onBlur={providerUrlHandler} type="text" value={providerUrl}/>
          </label>
        </p>
        <p className="App-intro">
          <div>
            <label>From Block#</label><input onChange={blockRangeHandler} ref={(el) => this.fromBlock = el} />
            <label>To</label><input onChange={blockRangeHandler} ref={(el) => this.toBlock = el} />
            Loading {index} of {latest}
          </div>
        </p>
        <pre style={{textAlign: "left"}}>
          {blk}
        </pre>
      </div>
    );
  }
}

export default App;
