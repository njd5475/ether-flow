import * as React from 'react';

import { ControlLabel, FormControl, FormGroup, Navbar } from 'react-bootstrap';

interface IRangeProps {
  begin?: number,
  end?: number,
  beginChanged?: (b:number) => void,
  endChanged?: (b:number) => void
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
    const newNum = +e.currentTarget.value
    this.setState({begin: newNum}, () => {
      if(this.props.beginChanged) {
        this.props.beginChanged(newNum);
      }
    });
  }

  public render() {
    const changeHandler = this.changed.bind(this);

    return (
      <FormGroup>
        <FormGroup>
          <Navbar.Text>
            <ControlLabel>From</ControlLabel>
          </Navbar.Text>
          <FormControl type="text" placeholder="block#, range(#-##)" value={this.state.begin} onChange={changeHandler} />
        </FormGroup>
        <FormGroup>
          <Navbar.Text>
            to {this.state.end}
          </Navbar.Text>
        </FormGroup>
      </FormGroup>
    )
  }
}
