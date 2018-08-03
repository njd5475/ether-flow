import * as React from 'react';
import './App.css';

import { Col, Grid, Row, Tab, Tabs } from 'react-bootstrap';

import { Aggregator } from './ether/aggregator';


import * as _ from 'underscore';
import * as W3 from 'web3/eth/types';

import BlockList     from './BlockList';
import SummaryReport from './ether/summaryReport';
import FlowNavbar    from './FlowNavbar';
import Summary       from './Summary';
import configStore   from './store/configurer';
import { render }    from 'react-dom';
import TransferList  from './TransferList';

const store = configStore();

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
    range: {begin: 0, end: 49},
    report: new SummaryReport(App.defaultAggregator),
    transactions: [],
    url: App.defaulProviderUrl
  }

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
            this.state.report.addTransaction(tr).then((report) => {
              this.setState({report, mainState: 'loaded'});
            })
          }).catch(() => {
            this.setState({mainState: 'failed'});
          });
        });
      }else{
        this.setState({mainState: 'no transactions'});
      }
    });
  }

  public isBusy(): boolean {
    return this.state.mainState === 'pending';
  }

  public skip(amount: number) {
    const rng = this.state.range;
    this.rangeChanged(rng.begin+amount, rng.end+amount);
  }

  public rangeChanged(begin: number, end: number) {
    const newState = {
      aggregator: this.createNewAggregator(this.state.url),
      mainState: 'rangeChanged',
      range: {begin, end}
    };
    this.setState(newState, () => this.refreshBlock())
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
    const beginChangeHandler = this.rangeChanged.bind(this);

    return render(
      <Provider store={store}>
        <FlowNavbar isBusy={this.isBusy()} begin={this.state.range.begin} end={this.state.range.end} rangeChanged={beginChangeHandler} />
        <Grid>
          <Row className="App-intro">
            <label>Provider Url:
              <input key="providerUrl" onBlur={providerUrlHandler} type="text" defaultValue={this.state.url}/>
            </label>
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
                  <Summary total={this.state.report.totalEther} blocks={this.state.blocks} aggregator={aggregator} report={this.state.report}/>
                </Row>
              </Tab>
            </Tabs>
          </Row>
        </Grid>
      </Provider>,
      document.getElementsByTagName('body')[0]
    );
  }

  private createNewAggregator(url: string): Aggregator {
    this.state.aggregator.stop();
    const newAggregator = new Aggregator(url);
    this.setState({report: new SummaryReport(newAggregator), url});
    return newAggregator;
  }
}

export default App;
