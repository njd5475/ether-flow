import BlockSummary from './BlockSummary';
import { Col, Grid, Row } from 'react-bootstrap';
import * as React from 'react';
import _ from 'underscore';
import * as W3 from 'web3/eth/types';

export default class BlockList extends React.Component<{blocks: W3.Block[]}, {}> {

  public render() {
    return (
      <Row>
        <Col md={12}>
          <Grid>
            {_.collect(this.props.blocks, (b) => <BlockSummary {...b} />)}
          </Grid>
        </Col>
      </Row>
    )
  }
}
