import React from         'react';
import * as T from './ether/types';

export default class TransferReport extends React.Component<T.ITransfer, {}> {

  public render() {
    let contract = "";
    if(this.props.isContractAddress) {
      contract = " (contract)";
    }

    return (
      <tr>
        <td>{this.props.address}{contract}</td>
        <td>${this.props.displayAmountDollars} | {this.props.displayAmountEther} ETH | {this.props.amount.toString()} wei</td>
        <td>{this.props.transactionCount}</td>
      </tr>
    )
  }
}
