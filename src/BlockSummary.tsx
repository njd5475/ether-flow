import React from         'react';
import * as W3 from       'web3/eth/types';

export default class BlockSummary extends React.Component<W3.Block, {}> {

  public render() {
    return (
      <tr>
        <td>{this.props.hash}</td>
        <td>{this.props.number}</td>
        <td>{this.props.transactions.length}</td>
      </tr>
    )
  }
}
