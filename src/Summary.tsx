import BigNumber from     'bn.js';
import React from         'react';
import * as W3 from       'web3/eth/types';
import Aggregator from    './ether/aggregator';
import SummaryReport from './ether/summaryReport';

interface ISummaryState {
  dollars: number,
  ether: number
}

export default class Summary extends React.Component<{total: BigNumber, aggregator: Aggregator, report: SummaryReport, blocks: W3.Block[]}, ISummaryState> {
  public state = {
    dollars: 0,
    ether: 0
  }

  public componentWillReceiveProps(nextProps: any) {
    if(nextProps.total !== this.props.total) {
      this.props.aggregator.toDollars(nextProps.total.toString()).then((d) => {
        this.props.aggregator.toEther(nextProps.total.toString()).then((e) => {
          this.setState({dollars: d, ether: e});
        });
      })
    }
  }

  public render() {
    const dollars = this.state.dollars.toString();
    const ether = this.state.ether.toString() + "ETH";

    return (
      <div><h3>Summary</h3>
        Total wei {this.props.total.toString()}<br />
        Total Ether: {ether} (${dollars})<br/>
        {this.props.report.getContractPercentage().toFixed(2)}% were contract addresses<br/>
        {Object.keys(this.props.report.contractAddresses).length} contracts<br/>
        {this.props.blocks.length} Blocks
      </div>
    )
  }
}
