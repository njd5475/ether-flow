import React from         'react';
import * as T from '../ether';

export default class TransferReport extends React.Component<T.ITransfer, {}> {

  public render() {
    let contract = "";
    if(this.props.isContractAddress) {
      contract = " (contract)";
    }

    const { address, amount: wei } = this.props;
    let { displayAmountDollars: dollars, displayAmountEther: ether } = this.props;

    if(dollars.length === 0) {
      dollars = '';
    }else{
      dollars = `$${dollars}`;
    }

    if(ether.length === 0) {
      ether = '';
    }else{
      ether = `${ether} ETH`;
    }

    let weiDisplay = wei.toString();
    if(wei.lte(0)) {
      weiDisplay = '';
    }else{
      weiDisplay = `${wei.toString()} wei`;
    }

    return (
      <tr>
        <td>{address}{contract}</td>
        <td>{dollars}</td>
        <td>{ether}</td>
        <td>{weiDisplay}</td>
        <td>{this.props.transactionCount}</td>
      </tr>
    )
  }
}
