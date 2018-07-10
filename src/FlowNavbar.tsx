import * as React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import './FlowNavbar.css';
import logo from './logo.svg';
import Range      from './Range';

interface IFlowBarProps {
  isBusy: boolean,
  begin?: number,
  end?: number,
  rangeChanged?: (begin: number, end: number) => void
}

export default class FlowNavbar extends React.Component<IFlowBarProps, {}> {

  public logoClasses() {
    return this.props.isBusy ? 'App-logo' : 'App-logo-still';
  }

   public render() {
     return (
       <Navbar inverse={true} collapseOnSelect={true} >
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#brand">
              <img src={logo} className={this.logoClasses()} alt="logo" />
              &nbsp;&nbsp;EtherFlow
            </a>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav pullRight={true}>
          <Navbar.Form>
            {this.props.begin && this.props.end && this.props.rangeChanged ? <Range rangeChanged={this.props.rangeChanged} begin={this.props.begin} end={this.props.end}/> : <Range />}
          </Navbar.Form>
        </Nav>
       </Navbar>
     );
   }
}
