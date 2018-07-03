import BigNumber from 'bn.js';
import React from 'react';
import Aggregator from './ether/aggregator';

interface ISummaryState {
  dollars: number,
  ether: number
}

export default class Summary extends React.Component<{total: BigNumber, aggregator: Aggregator}, ISummaryState> {
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
        Total Ether: {ether} (${dollars})
      </div>
    )
  }
}
