import React, { Component, } from 'react';
import './App.css';
import Authenticated from './Authenticated';
import Unauthenticated from './Unauthenticated';
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

if (typeof window.web3 !== 'undefined') {
  eth = new EthJs(window.web3.currentProvider);
}

class App extends Component {
  constructor(args) {
    super(args);

    this.state = {
      authenticated: false,
      token: null
    };
  }

  handleLogin() {
    function toHex(s) {
      var hex = '';
      for(var i=0;i<s.length;i++) { hex += '' + s.charCodeAt(i).toString(16); }
      return `0x${hex}`;
    }

    const web3 = window.web3;
    console.log('WEB3', web3);
    var data = toHex('Please verify');
    web3.currentProvider
      .sendAsync({ id: 1, method: 'personal_sign', params: [web3.eth.accounts[0], data] },
        (err, result) => {
          const sig = result.result;
          console.log('SIG', sig)
          if (!err && sig) {
            return axios.post('/authenticate', { sig })
              .then(({ data: { token } }) => {
                this.setState({ token })
              });
          }
        }
      );
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
      <div className="App">
        {
          authenticated
            ? <Authenticated />
            : <Unauthenticated
                onSubscribe={() => this.setState({ authenticated: true })}
                onLogin={() => this.handleLogin()}
              />
        }
      </div>
    )
  }
}

export default App;
