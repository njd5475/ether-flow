import * as React from 'react';
import { Table } from 'react-bootstrap';
import _ from 'underscore';
import * as T from './ether/types'
import TransferReport from './TransferReport';

export default class ReceiversList extends React.Component<{transfers: T.Transfers}, {}> {

  public render() {
    let i : number = 0;
    return (
      <Table>
        <thead>
          <tr>
            <th>Receiver Address</th>
            <th>Total Received</th>
            <th>Transaction Count</th>
          </tr>
        </thead>
        <tbody>
          {_.map(this.props.transfers, (v, k) => <TransferReport key={++i} address={k} {...v} />)}
        </tbody>
      </Table>
    )
  }
}
