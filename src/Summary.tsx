import BigNumber from 'bn.js';
import React from 'react';
import Aggregator from './ether/aggregator';

interface ISummaryState {
  dollars: number,
  ether: number
}

export default class Summary extends React.Component<{total: BigNumber, aggregator: Aggregator | null}, ISummaryState> {
  public state = {
    dollars: 0,
    ether: 0
  }

  public componentWillReceiveProps(nextProps: any) {
    if(!this.state) {return;}

    if(nextProps.total !== this.props.total && this.props.aggregator) {
      this.props.aggregator.toDollars(this.props.total.toString()).then((d) => {
        this.setState({dollars: d});
      })
      this.props.aggregator.toEther(this.props.total.toString()).then((e) => {
        this.setState({ether: e});
      })
    }
  }

  public render() {
    let dollars = "$0";
    let ether = "0";
    if(this.state) {
      dollars = this.state.dollars.toString();
      ether = this.state.ether.toString();
    }

    return (
      <div><h3>Summary</h3>
        Total wei {this.props.total.toString()}<br />
        Total Ether: {ether} (${dollars})
      </div>
    )
  }
}
