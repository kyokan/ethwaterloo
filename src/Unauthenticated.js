import React, { Component } from 'react';
import Button from 'muicss/lib/react/button';
import axios from 'axios';

class Unauthenticated extends Component {

  requestSignMessage() {
    function toHex(s) {
      var hex = '';
      for(var i=0;i<s.length;i++) { hex += '' + s.charCodeAt(i).toString(16); }
      return `0x${hex}`;
    }

    const web3 = window.web3;
    const message = toHex(`Login Attempt to I B RickRollin'`);
    const payload = {
      id: 1,
      method: 'personal_sign',
      params: [ web3.eth.accounts[0], message ],
    };

    return new Promise((resolve, reject) => {
      web3.currentProvider
        .sendAsync(payload, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
    })
  }

  async handleLogin() {
    try {
      const { result: sig } = await this.requestSignMessage();
      const { data: { token } } = await axios.post('/authenticate', { sig })

      if (!token) throw new Error('No Token');

      localStorage.setItem('jwt', token);
      window.location = this.props.location.state.from.pathname;
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    const { onSubscribe } = this.props;

    return (
      <div className="unauthenticated">
        <div className="unauthenticated__buttons">
          <Button
            color="primary"
            onClick={() => this.handleLogin()}
          >
            login
          </Button>
        </div>
      </div>
    )
  }
}

export default Unauthenticated;
