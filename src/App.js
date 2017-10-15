import React, { Component, } from 'react';
import './App.css';
import Authenticated from './Authenticated';
import Unauthenticated from './Unauthenticated';
import SubscribeNow from './SubscribeNow';
import Merchant, { MERCHANT_ABI } from './Merchant';
import Consumer, { CONSUMER_ABI } from './Consumer';
import Lists from './Lists';
import Button from 'muicss/lib/react/button';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  withRouter
} from 'react-router-dom'
import axios from 'axios';
import EthJs from 'ethjs';

let eth;

class App extends Component {
  constructor(args) {
    super(args);

    this.state = {
      authenticated: false,
      token: null
    };
  }

  checkWeb3() {
    if (typeof window.web3 !== 'undefined') {
      eth = new EthJs(window.web3.currentProvider);
      this.setState({ token: null })
    } else {
      setTimeout(() => this.checkWeb3(), 200);
    }
  }

  componentWillMount() {
    this.checkWeb3();
  }

  render() {
    const { authenticated } = this.state;

    if (!eth) {
      return (
        <div className="App">
          <div className="unauthenticated">
            <div className="unauthenticated__title">
              <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en">
                <h1>Please install Metamask</h1>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Router>
        <div className="app">
          <Route path="/login" component={Unauthenticated} />
          <Route path="/subscribe" component={SubscribeNow} />
          <Route
            path="/merchant"
            component={Merchant}
          />
          <Route
            path="/consumer"
            component={Consumer}
          />
          <Route
            path="/subscribers"
            component={() => <Lists header="Subscribers" abi={MERCHANT_ABI} showRequestButton />}
          />
          <Route
            path="/subscriptions"
            component={() => <Lists header="Subscriptions" abi={CONSUMER_ABI} />}
          />
          <Route
            exact
            path="/"
            render={props => (
              localStorage.getItem('jwt')
                ? <Authenticated {...props} />
                : (
                  <Redirect
                    to={{
                      pathname: '/login',
                      state: { from: props.location}
                    }}
                  />
                )
            )}
          />
        </div>
      </Router>
    )
  }
}

export default App;
