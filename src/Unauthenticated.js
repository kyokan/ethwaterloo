import React, { Component } from 'react';
import Button from 'muicss/lib/react/button';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

class Unauthenticated extends Component {
  render() {
    const { onSubscribe, onLogin } = this.props;
    return (
      <div className="unauthenticated">
        <h1 className="unauthenticated__title">Please subscribe to view content</h1>
        <div className="unauthenticated__buttons">
          <Button
            color="primary"
            onClick={() => onSubscribe()}
          >
            subscribe
          </Button>
          <Button
            color="primary"
            onClick={() => onLogin()}
          >
            login
          </Button>
        </div>
      </div>
    )
  }
}

export default Unauthenticated;
