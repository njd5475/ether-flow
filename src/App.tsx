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
  report: SummaryReport,
  totalEther: BigNumber,
  transactions: any[],
  url: string
}


class App extends React.Component<IAppProps, IAppState> {
  public static defaulProviderUrl = 'http://localhost:4535'
  public static defaultProps: Partial<IAppProps> = {
    providerUrl: App.defaulProviderUrl
  }
  public static defaultAggregator = new Aggregator(App.defaulProviderUrl);
  public state = {
    aggregator: App.defaultAggregator,
    aggregators: [],
    blocks: [],
    index: 0,
    mainState: 'created',
    range: {begin: 1, end: 50},
    report: new SummaryReport(App.defaultAggregator),
    totalEther: new BigNumber(0),
    transactions: [],
    url: App.defaulProviderUrl
  }
  private fromBlock: HTMLInputElement | null
  private toBlock: HTMLInputElement | null
  private delayedChange: (e: React.SyntheticEvent) => void = _.debounce(this.rangeChanged, 500)

  public constructor(props: any) {
    super(props);
    const firstAggregator = new Aggregator(props.providerUrl);
    this.state.aggregator = firstAggregator;
    if(this.props.providerUrl) {
      this.state.url = this.props.providerUrl;
    }
    this.state.report = new SummaryReport(firstAggregator);
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
      if(this.state.transactions.length > 0) {
        _.collect(this.state.transactions, (t) => {
          this.state.aggregator.getTrans(t).then((tr) => {
            this.state.report.addTransaction(tr);
            this.setState({report: this.state.report, totalEther: this.state.totalEther.add(new BigNumber(tr.value)), mainState: 'loaded'});
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
    if(this.state.mainState !== 'pending') {
      cls = 'App-logo-still';
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
    const rng = this.state.range;
    this.setState({range: {begin: rng.begin+amount, end: rng.end+amount}},
      () => {
        if(!this.toBlock || !this.fromBlock) {return;}
        this.toBlock.value = this.state.range.end.toString();
        this.fromBlock.value = this.state.range.begin.toString();
        this.refreshBlock();
      }
    );
  }

  public render() {
    const range = this.state.range;
    const index = this.state.index;
    const blocks = this.state.blocks;
    const aggregator = this.state.aggregator;
    const transactions =  this.state.transactions.length;
    const rangeLinks = _.times(6,
      (n) => {
        const skipFunc = _.debounce(() => this.skip(Math.pow(10,n)), 100);
        return <span key={n}>
          <a href="#" onClick={skipFunc}>Skip {Math.pow(10, n)}</a>&nbsp;|&nbsp;
        </span>
      });

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
              <input key="providerUrl" onBlur={providerUrlHandler} type="text" defaultValue={this.state.url}/>
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
              Loading {index} of {range.end} ({Math.floor(((index-range.begin) / (range.end-range.begin)) * 100)}%) ({transactions} transactions) ({this.state.mainState})
            </Col>
          </Row>
          <Row>
            <Tabs>
              <Tab eventKey={1} title="Blocks">
                <BlockList blocks={blocks} />
              </Tab>
              <Tab eventKey={2} title={`Senders (${Object.keys(this.state.report.sentAddresses).length})`}>
                <TransferList transfers={this.state.report.sentAddresses} />
              </Tab>
              <Tab eventKey={3} title={`Receivers (${Object.keys(this.state.report.receivedAddresses).length})`}>
                <TransferList transfers={this.state.report.receivedAddresses} />
              </Tab>
              <Tab eventKey={4} title="Transaction Summary">
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
    this.setState({report: new SummaryReport(newAggregator), url, totalEther: new BigNumber(0)});
    return newAggregator;
  }
}

export default App;
