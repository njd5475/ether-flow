import * as React from 'react';
import { FormControl, FormGroup, InputGroup, Navbar } from 'react-bootstrap';

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

  public changed(e: React.FormEvent<HTMLInputElement>) {
    const difference = this.state.end - this.state.begin + 1;
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
      <Navbar.Form>
        <FormGroup>
          <InputGroup>
            <InputGroup.Addon>From</InputGroup.Addon>
            <FormControl type="text" placeholder="block#" value={this.state.begin} onChange={changeHandler} />
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <Navbar.Text>to {this.state.end}</Navbar.Text>
        </FormGroup>
        <FormGroup>
          <InputGroup>
            <InputGroup.Addon>Showing</InputGroup.Addon>
            <FormControl type="text" placeholder="showing" value={this.state.end-this.state.begin+1} onChange={changeNumShown} />
          </InputGroup>
        </FormGroup>
      </Navbar.Form>
    )
  }

  private changeShown(e: React.FormEvent<HTMLInputElement>) {
    const range = Math.abs(+e.currentTarget.value);
    this.setState({end: this.state.begin+range-1}, () => {
      if(this.props.rangeChanged) {
        this.props.rangeChanged(this.state.begin, this.state.end);
      }
    });
  }
}
