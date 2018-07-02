import * as W3 from       'web3/eth/types';

import { Col, Row } from  'react-bootstrap';

import React from         'react';

export default class BlockSummary extends React.Component<W3.Block, {}> {

  public render() {
    return (
      <Row>
        <Col md={12}>
          Hash: {this.props.hash}
        </Col>
      </Row>
    )
  }
}
