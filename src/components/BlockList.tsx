import * as React from 'react';
import { Table } from 'react-bootstrap';
import _ from 'underscore';
import BlockSummary from './BlockSummary';
import { Block } from '../ether-flow';

export default class BlockList extends React.Component<{blocks: Block[]}, {}> {

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
          {_.collect(this.props.blocks, (b) => {
            const blockNumber = b.number || 0;
            return <BlockSummary key={blockNumber} {...b} />
          })}
        </tbody>
      </Table>
    )
  }
}
