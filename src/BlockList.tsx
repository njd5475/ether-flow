import * as React from 'react';
import { Table } from 'react-bootstrap';
import _ from 'underscore';
import * as W3 from 'web3/eth/types';
import BlockSummary from './BlockSummary';

export default class BlockList extends React.Component<{blocks: W3.Block[]}, {}> {

  public render() {
    return (
      <Table>
        <thead>
          <tr>
            <th>Block Hash</th>
            <th>Number</th>
            <th>Transaction Count</th>
            <th>Uncles</th>
          </tr>
        </thead>
        <tbody>
          {_.collect(this.props.blocks, (b) => <BlockSummary key={b.number} {...b} />)}
        </tbody>
      </Table>
    )
  }
}
