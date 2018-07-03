import React from 'react';
import Aggregator from './ether/aggregator';

export default class Summary extends React.Component<{total: number, aggregator: Aggregator | null}, {dollars: number}> {

  constructor(props: any) {
    super(props);
    this.state = {
      dollars: 0
    }
    if(this.props.aggregator) {
      this.props.aggregator.toDollars(this.props.total.toString()).then((d) => {
        this.setState({dollars: d});
      })
    }
  }

  public render() {
    let dollars = "$0";
    if(this.state) {
      dollars = this.state.dollars.toString();
    }

    return (
      <div>Summary
        Total Ether: {dollars}
      </div>
    )
  }
}
