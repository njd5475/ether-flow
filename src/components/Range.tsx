import * as React from 'react';
import { FormControl, FormGroup, InputGroup, Button, Navbar } from 'react-bootstrap';

interface IRangeProps {
  begin?: number,
  end?: number,
  rangeChanged?: (begin: number, end: number) => void
}

interface IRangeState {
  begin: number,
  end: number
}

export default class Range extends React.Component<IRangeProps, IRangeState> {
  public state = {
    begin: 0,
    end: 49
  }

  public constructor(props: IRangeProps) {
    super(props)
  }

  public componentWillReceiveProps(props: IRangeProps) {
    if(props.begin) {
      this.state.begin = props.begin
    }
    if(props.end) {
      this.state.end = props.end
    }
  }

  public changedBegin(e: React.FormEvent<HTMLInputElement>) {
    this.setState({begin: +e.currentTarget.value});
  }

  public changedEnd(e: React.FormEvent<HTMLInputElement>) {
    this.setState({end: +e.currentTarget.value});
  }

  public async apply() {
    if(this.props.rangeChanged) {
      this.props.rangeChanged(this.state.begin, this.state.end);
    }
  }

  public render() {
    const changeBeginHandler = this.changedBegin.bind(this);
    const changeEndHandler = this.changedEnd.bind(this);
    const applyHandler = this.apply.bind(this);

    return (
      <Navbar.Form>
        <FormGroup>
          <InputGroup>
            <InputGroup.Addon>From</InputGroup.Addon>
            <FormControl type="text" placeholder="block#" value={this.state.begin} onChange={changeBeginHandler} />
          </InputGroup>
        </FormGroup>
        
        <FormGroup>
          <InputGroup>
            -
          </InputGroup>
        </FormGroup>

        <FormGroup>
          <InputGroup>
            <InputGroup.Addon>To</InputGroup.Addon>
            <FormControl type="text" placeholder="block#" value={this.state.end} onChange={changeEndHandler} />
          </InputGroup>
        </FormGroup>

        <FormGroup>
          <Navbar.Text>Showing {this.state.end - this.state.begin} block</Navbar.Text>
        </FormGroup>
        
        <Button onClick={applyHandler}>Apply</Button>
      </Navbar.Form>
    )
  }
}