import BigNumber from 'bn.js'
import * as React from 'react';
import './App.css';

import { Col, Grid, Row, Tab, Tabs } from 'react-bootstrap';

import { Aggregator } from './ether/aggregator';
import logo from './logo.svg';

import * as _ from 'underscore';
import * as W3 from 'web3/eth/types';

import BlockList from './BlockList';
import SummaryReport from './ether/summaryReport';
import Summary from './Summary';
import TransferList from './TransferList';

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
  totalEther: BigNumber,
  transactions: any[],
  url: string
}


class App extends React.Component<IAppProps, IAppState> {
  public static defaultProps: Partial<IAppProps> = {
    providerUrl: 'http://localhost:4535'
  }
  public state = {
    aggregator: new Aggregator('http://localhost:4535'),
    aggregators: [],
    blocks: [],
    index: 0,
    mainState: 'created',
    range: {begin: 1, end: 50},
    totalEther: new BigNumber(0),
    transactions: [],
    url: 'http://localhost:4535'
  }
  private fromBlock: HTMLInputElement | null
  private toBlock: HTMLInputElement | null
  private delayedChange: (e: React.SyntheticEvent) => void = this.rangeChanged
  private report: SummaryReport

  public constructor(props: any) {
    super(props);
    const firstAggregator = new Aggregator(props.providerUrl);
    this.state.aggregator = firstAggregator;
    if(this.props.providerUrl) {
      this.state.url = this.props.providerUrl;
    }
    this.report = new SummaryReport(firstAggregator);
  }

  public componentDidMount() {
    this.refreshBlock();
  }

  public providerChanged(e: React.SyntheticEvent) {
    const target = e.currentTarget as HTMLInputElement
    localStorage.setItem("saved-provider", target.value.toString());
    const newAggregator = this.createNewAggregator(target.value);
    this.setState({url: target.value, aggregator: newAggregator}, () => this.refreshBlock());
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
      if(this.state && this.state.transactions && this.state.transactions.length > 0) {
        _.collect(this.state.transactions, (t) => {
          if(!this.state) {return;}
          this.state.aggregator.getTrans(t).then((tr) => {
            if(!this.state) {return;}
            this.setState({totalEther: this.state.totalEther.add(new BigNumber(tr.value)), mainState: 'loaded'});
            this.report.addTransaction(tr);
          }).catch(() => {
            this.setState({mainState: 'failed'});
          });
        });
      }else{
        this.setState({mainState: 'no transactions'});
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
    if(this.fromBlock && this.toBlock) {
      const newState = {
        aggregator: this.createNewAggregator(this.state.url),
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
    let blocks : W3.Block[] = [];
    let aggregator = null;
    let transactions = 0;
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
      blocks = this.state.blocks;
      aggregator = this.state.aggregator;
      transactions = this.state.transactions.length;
    }
    const providerUrlHandler = this.providerChanged.bind(this);
    const blockRangeHandler = this.delayedChange.bind(this);

    return (
      <div>
        <header className="App-header" html-role="banner">
          <img src={logo} className={this.getLogoClass()} alt="logo" />
          <h1 className="App-title">Welcome to EtherFlow a simple blockchain explorer</h1>
        </header>
        <Grid>
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
          <Row className="pull-right">
            <Col md={12}>
              Loading {index} of {range.end} ({transactions} transactions) ({this.state.mainState})
            </Col>
          </Row>
          <Row>
            <Tabs>
              <Tab eventKey={1} title="Blocks">
                <BlockList blocks={blocks} />
              </Tab>
              <Tab eventKey={2} title="Senders">
                <TransferList transfers={this.report.sentAddresses} />
              </Tab>
              <Tab eventKey={3} title="Receivers">
                <TransferList transfers={this.report.receivedAddresses} />
              </Tab>
              <Tab eventKey={4} title="Transaction Details">
                <Row>
                  <Summary total={this.state.totalEther} aggregator={aggregator}/>
                </Row>
              </Tab>
            </Tabs>
          </Row>
        </Grid>
      </div>
    );
  }

  private createNewAggregator(url: string): Aggregator {
    this.state.aggregator.stop();
    const newAggregator = new Aggregator(url);
    this.report = new SummaryReport(newAggregator);
    return newAggregator;
  }
}

export default App;
