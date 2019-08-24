import React from         'react';
import { Block } from '../ether-flow';

export default class BlockSummary extends React.Component<Block, {}> {

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
