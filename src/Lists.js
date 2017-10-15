import React, { Component } from 'react';
import { CONSUMER_ABI } from './Consumer';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';

import EthJs from 'ethjs';

let eth;

if (typeof window.web3 !== 'undefined') {
  eth = new EthJs(window.web3.currentProvider);
}

class Lists extends Component {
  constructor(args) {
    super(args);

    this.state = {
      address: '',
      list: [],
      submitted: false
    };
  }

  handleSubmit() {
    const { address } = this.state;
    const { abi } = this.props;

    (async e => {
      try {
        const tokenAddress = address;
        const token = eth.contract(abi).at(tokenAddress)
        console.log(token);
        // const name = await token.name();
        // const symbol = await token.symbol();
        // const decimals = await token.decimals();
        // const totalSupply = await token.totalSupply();
        this.setState({
          list: ['a', 'b', 'c'],
          submitted: true
        })
      } catch (e) {
        console.error('Invalid Token Address');
        this.setState({ list: [] })
      }
    })();
  }

  renderForm() {
    return (
      <div>
        <Input
          type="text"
          label="Contract Address"
          floatingLabel={true}
          onChange={e => this.setState({ address: e.target.value })}
          value={this.state.address}
        />
        <Button
          variant="raised"
          color="primary"
          onClick={() => this.handleSubmit()}
        >
          Submit
        </Button>
      </div>
    );
  }

  renderList() {
    const { list } = this.state;

    return (
      <table className="mui-table mui-table--bordered">
        <thead>
          <tr>
            <th>Addresses</th>
          </tr>
        </thead>
        <tbody>
        {
          list.map((item, i) => {
            return (
              <tr key={i}>
                <td>{ item }</td>
              </tr>
            )
          })
        }
        </tbody>
      </table>
    );
  }

  render() {
    const { submitted } = this.state;
    const { header } = this.props;

    return (
      <div className="lists">
        <div className="lists-list">
          <h1 className="lists-form__title">
            { header }
          </h1>
          {
            !submitted
              ? this.renderForm()
              : this.renderList()
          }
        </div>
      </div>
    );
  }
}

export default Lists;
