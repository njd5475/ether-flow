import React from 'react';

export default class Summary extends React.Component<{total: number}, {}> {

  public render() {
    return (
      <div>Summary
        Total Ether: {this.props.total}
      </div>
    )
  }
}
