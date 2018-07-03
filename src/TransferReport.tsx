import React from         'react';
import * as T from './ether/types';

export default class TransferReport extends React.Component<T.ITransfer, {}> {

  public render() {
    return (
      <tr>
        <td>{this.props.address}</td>
        <td>{this.props.amount.toString()}</td>
        <td>{this.props.transactionCount}</td>
      </tr>
    )
  }
}
