import * as React from 'react';
import { ControlLabel, FormControl, FormGroup, Navbar } from 'react-bootstrap';

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
    begin: 1,
    end: 50
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

  public changed(e: React.FormEvent<HTMLInputElement>) {
    const difference = this.state.end - this.state.begin;
    const newNum = +e.currentTarget.value
    this.setState({begin: newNum, end: newNum+difference}, () => {
      if(this.props.rangeChanged) {
        this.props.rangeChanged(newNum, newNum+difference);
      }
    });
  }

  public render() {
    const changeHandler = this.changed.bind(this);
    const changeNumShown = this.changeShown.bind(this);

    return (
      <FormGroup>
        <FormGroup>
          <Navbar.Text>
            <ControlLabel>From</ControlLabel>
          </Navbar.Text>
          <FormControl type="text" placeholder="block#" value={this.state.begin} onChange={changeHandler} />
        </FormGroup>
        <FormGroup>
          <Navbar.Text>to {this.state.end}</Navbar.Text>
        </FormGroup>
        <FormGroup>
          <FormControl type="text" placeholder="showing" value={this.state.end-this.state.begin} onChange={changeNumShown} />
        </FormGroup>
      </FormGroup>
    )
  }

  private changeShown(e: React.FormEvent<HTMLInputElement>) {
    const range = Math.abs(+e.currentTarget.value);
    this.setState({end: this.state.begin+range}, () => {
      if(this.props.rangeChanged) {
        this.props.rangeChanged(this.state.begin, this.state.end);
      }
    });
  }
}
