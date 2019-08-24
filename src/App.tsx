import * as React from 'react';
import './styles/App.css';

import { Col, Grid, Row, Tab, Tabs } from 'react-bootstrap';

import { Aggregator } from './ether/aggregator';

import * as _ from 'underscore';

import BlockList     from './components/BlockList';
import SummaryReport from './ether/summaryReport';
import FlowNavbar    from './components/FlowNavbar';
import Summary       from './components/Summary';
import TransferList  from './components/TransferList';

import { Block } from './ether-flow';


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
  blocks: Block[],
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
    this.setRangeToLatest();
  }

  public async setRangeToLatest() {
    const latestBlock = await this.state.aggregator.getLatestBlockNumber();
    this.rangeChanged(latestBlock - 1, latestBlock);
    this.refreshBlock();
  }

  public providerChanged(e: React.SyntheticEvent) {
    const target = e.currentTarget as HTMLInputElement
    localStorage.setItem("saved-provider", target.value.toString());
    const newAggregator = this.createNewAggregator(target.value);
    console.log("Provider changed");
    this.setState({url: target.value, aggregator: newAggregator}, () => this.refreshBlock());
  }

  public async refreshBlock() {
    if(this.state.mainState !== 'pending') {
      this.setState({mainState: 'pending'}, async () => {
        if (this.state === null || this.state.aggregator === null) { return; }

        try {
          const blocks = await this.state.aggregator.totalEther(this.state.range.begin, this.state.range.end);
            
          if (this.state === null || this.state.aggregator === null) { return; }

          const allTrans = _.collect(blocks, (blk) => blk.transactions);
          const transactions = _.flatten(allTrans);

          this.setState({blocks, transactions, mainState: 'loaded'}, () => this.refreshSummary());
        }catch(e) {
          this.setState({mainState: 'error ' + e});
        };
      });
    }else{
      this.setState({mainState: 'error you cannot make multiple request simultaneously'});
    }
  }

  public async refreshSummary() {
    this.setState({mainState: 'pending'}, async () => {
      if(this.state.transactions.length <= 0) {
        this.setState({mainState: 'no transactions'});
        return;
      }

      const pendingTransactions = _.collect(this.state.transactions, async (t) => {
        try {
          const transaction = await this.state.aggregator.getTrans(t);
          const report = await this.state.report.addTransaction(transaction);
          this.setState({report, mainState: 'loaded'});
        }catch(e) {
          this.setState({mainState: 'failed'});
        };
      });

      await Promise.all(pendingTransactions);
    });
  }

  public isBusy(): boolean {
    return this.state.mainState === 'pending';
  }

  public skip(amount: number) {
    const { begin, end } = this.state.range;
    this.rangeChanged(begin+amount, end+amount);
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
    const { begin, end } = this.state.range;
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

    return (
      <div>
        <FlowNavbar isBusy={this.isBusy()} begin={begin} end={end} rangeChanged={beginChangeHandler} />
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
              Loading {begin} of {end} ({Math.floor(((end-begin) / (end-begin)) * 100)}%) ({transactions} transactions) ({this.state.mainState})
            </Col>
          </Row>
          <Row>
            <Tabs id="Main">
              <Tab eventKey={1} title="Blocks">
                <BlockList blocks={blocks} />
              </Tab>
              <Tab eventKey={2} title={`Senders (${Object.keys(this.state.report.sentAddresses).length})`}>
                <TransferList name="senders" transfers={this.state.report.sentAddresses} />
              </Tab>
              <Tab eventKey={3} title={`Receivers (${Object.keys(this.state.report.receivedAddresses).length})`}>
                <TransferList name="receivers" transfers={this.state.report.receivedAddresses} />
              </Tab>
              <Tab eventKey={4} title="Transaction Summary">
                <Row>
                  <Summary total={this.state.report.totalEther} blocks={this.state.blocks} aggregator={aggregator} report={this.state.report}/>
                </Row>
              </Tab>
            </Tabs>
          </Row>
        </Grid>
      </div>
    );
  }

  private createNewAggregator(url: string): Aggregator {
    const newAggregator = new Aggregator(url);
    this.setState({report: new SummaryReport(newAggregator), url});
    return newAggregator;
  }
}

export default App;
