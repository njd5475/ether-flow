import * as React from 'react';
import './App.css';

import { Col, Grid, Row } from 'react-bootstrap';

import { Aggregator } from './ether/aggregator';
import logo from './logo.svg';

import * as _ from 'underscore';
import * as W3 from 'web3/eth/types';

import BlockList from './BlockList';
import SummaryReport from './ether/summaryReport';
import Summary from './Summary';

interface IAppProps {
    providerUrl?: string
}

interface IRange {
  begin: number,
  end: number
}

interface IAppState {
  aggregator: Aggregator,
  aggregators: Aggregator[],
  blocks: W3.Block[],
  index: number,
  mainState: string,
  range: IRange,
  totalEther: number,
  transactions: any[],
  url: string
}


class App extends React.Component<IAppProps, IAppState> {
  public static defaultProps: Partial<IAppProps> = {
    providerUrl: 'http://localhost:4535'
  }
  private fromBlock: HTMLInputElement | null
  private toBlock: HTMLInputElement | null
  private delayedChange: (e: React.SyntheticEvent) => void = this.rangeChanged
  private report: SummaryReport

  public constructor(props: any) {
    super(props);
    const firstAggregator = new Aggregator(props.providerUrl);
    this.state = {
      aggregator: firstAggregator,
      aggregators: [firstAggregator],
      blocks: [],
      index: 0,
      mainState: 'created',
      range: {begin: 1, end: 50},
      totalEther: 0,
      transactions: [],
      url: props.providerUrl
    };
    this.report = new SummaryReport();
  }

  public componentDidMount() {
    this.refreshBlock();
  }

  public providerChanged(e: React.SyntheticEvent) {
    const target = e.currentTarget as HTMLInputElement
    localStorage.setItem("saved-provider", target.value.toString());
    this.setState({url: target.value, aggregator: new Aggregator(target.value)}, () => this.refreshBlock());
  }

  public refreshBlock() {
    this.setState({mainState: 'pending'}, () => {
      if (this.state === null || this.state.aggregator === null) { return; }

      this.state.aggregator.totalEther(this.state.range.begin, this.state.range.end, (b) => {this.setState({index: b})})
        .then((blks: W3.Block[]) => {
          if (this.state === null || this.state.aggregator === null) { return; }

          const allTrans = _.collect(blks, (c) => c.transactions);
          const trans = _.flatten(allTrans);

          this.setState({blocks: blks, transactions: trans, mainState: 'loaded'}, () => this.refreshSummary());
        }).catch((err: any) => {
          this.setState({mainState: 'error ' + err});
        });
    });
  }

  public refreshSummary() {
    this.setState({mainState: 'pending'}, () => {
      if(this.state && this.state.transactions) {
        _.collect(this.state.transactions, (t) => {
          if(!this.state) {return;}
          this.state.aggregator.getTrans(t).then((tr) => {
            if(!this.state) {return;}
            this.setState({totalEther: this.state.totalEther + +tr.value, mainState: 'loaded'});
            this.report.addTransaction(t);
          });
        });
      }
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

  public rangeChanged() {
    if(this.state && this.state.range && this.fromBlock && this.toBlock) {
      this.state.aggregator.stop()
      const newState = {
        aggregator: new Aggregator(this.state.url),
        mainState: 'rangeChanged',
        range: {begin: +this.fromBlock.value, end: +this.toBlock.value}
      };
      this.setState(newState, () => this.refreshBlock())
    }
  }

  public skip(amount: number) {
    if(!this.state) {return;}
    const rng = this.state.range;
    this.setState({range: {begin: rng.begin+amount, end: rng.end+amount}},
      () => {
        if(!this.state || !this.toBlock || !this.fromBlock) {return;}
        this.toBlock.value = this.state.range.end.toString();
        this.fromBlock.value = this.state.range.begin.toString();
        this.refreshBlock();
      }
    );
  }

  public render() {
    let providerUrl = '';
    let range = {begin: 0, end: 0};
    let index = 0;
    let totalEther = 0;
    let blocks : W3.Block[] = [];
    let stateStr = 'no state';
    let aggregator = null;
    const rangeLinks = _.times(5,
      (n) => {
        const skipFunc = () => this.skip(Math.pow(10,n));
        return <span key={n}>
          <a href="#" onClick={skipFunc}>Skip {Math.pow(10, n)}</a>&nbsp;|&nbsp;
        </span>
      });

    if(this.state != null) {
      providerUrl = this.state.url;
      range = this.state.range;
      index = this.state.index;
      totalEther = this.state.totalEther;
      blocks = this.state.blocks;
      stateStr = this.state.mainState;
      aggregator = this.state.aggregator;
    }
    const providerUrlHandler = this.providerChanged.bind(this);
    const blockRangeHandler = this.delayedChange.bind(this);

    return (
      <Grid>
        <header className="App-header">
          <img src={logo} className={this.getLogoClass()} alt="logo" />
          <h1 className="App-title">Welcome to EtherFlow a simple blockchain explorer</h1>
        </header>
        <Row className="App-intro">
          <label>Provider Url:
            <input key="providerUrl" onBlur={providerUrlHandler} type="text" defaultValue={providerUrl}/>
          </label>
        </Row>
        <Row className="App-intro">
          <div>
            <label>From Block#</label><input name='blockFrom' onChange={blockRangeHandler} ref={(el) => this.fromBlock = el} defaultValue={range.begin.toString()} />
            <label>To</label><input name='blockTo' onChange={blockRangeHandler} ref={(el) => this.toBlock = el} defaultValue={range.end.toString()} />
          </div>
        </Row>
        <Row>
          {rangeLinks}
        </Row>
        <Row>
          <Col md={12}>
            Loading {index} of {range.end}
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            {stateStr}
          </Col>
        </Row>
        <Row>
          <Summary total={totalEther} aggregator={aggregator}/>
        </Row>
        <BlockList blocks={blocks} />
      </Grid>
    );
  }
}

export default App;
