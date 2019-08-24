import React from         'react';
import Aggregator from    '../ether/aggregator';
import SummaryReport from '../ether/summaryReport';

import { Block, BigNumber } from 'src/ether-flow';

interface ISummaryState {
  dollars: number,
  ether: number
}

export default class Summary extends React.Component<{total: BigNumber, aggregator: Aggregator, report: SummaryReport, blocks: Block[]}, ISummaryState> {
  public state = {
    dollars: 0,
    ether: 0
  }

  public async componentWillReceiveProps(nextProps: any) {
    if(nextProps.total !== this.props.total) {
      const ether = this.props.aggregator.toEther(nextProps.total.toString());
      const dollars = await this.props.aggregator.toDollars(nextProps.total.toString());
      
      this.setState({dollars, ether});
    }
  }

  public render() {
    const dollars = this.state.dollars.toFixed(2).toString();
    const ether = this.state.ether.toString() + " ETH";

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
