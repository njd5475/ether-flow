import React from         'react';
import { Col, Row } from  'react-bootstrap';
import * as W3 from       'web3/eth/types';

export default class BlockSummary extends React.Component<W3.Block, {}> {

  public render() {
    return (
      <Row>
        <Col md={12}>
          Hash: {this.props.hash}<br />
          Block Number: {this.props.number}<br />
        </Col>
      </Row>
    )
  }
}
