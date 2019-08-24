import * as React from 'react';
import { Table } from 'react-bootstrap';
import _ from 'underscore';
import * as T from '../ether'
import TransferReport from './TransferReport';

declare global {
  interface Window { jquery: any; }
}

export default class TransferList extends React.Component<{name: string, transfers: T.Transfers}, {}> {

  public componentDidMount() {
    if(window.jquery) {
      window.jquery(`#${this.props.name}`).dataTable();
    }
  }

  public render() {
    let i : number = 0;
    return (
      <Table name={this.props.name} striped bordered hover condensed>
        <thead>
          <tr>
            <th>Receiver Address</th>
            <th>Dollars</th>
            <th>Ether</th>
            <th>Wei</th>
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
