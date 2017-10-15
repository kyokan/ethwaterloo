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

  async crawl(address = '0x0000000000000000000000000000000000000000', list = []) {
    const { address: tokenAddress } = this.state;
    const { abi } = this.props;
    const contract = eth.contract(abi).at(tokenAddress)
    console.log({ contract })
    const result = contract.subscriptionsLL
      ? await contract.subscriptionsLL(address)
      : await contract.subscribersLL(address);

    if (result[0] === '0x0000000000000000000000000000000000000000') {
      return list;
    }

    list.push(result[0]);
    return this.crawl(result[0], list);
  }

  handleSubmit() {
    const { abi } = this.props;
    const { address: tokenAddress } = this.state;

    (async e => {
      try {
        const contract = eth.contract(abi).at(tokenAddress)
        const list = await this.crawl();
        console.log({ list })


        list.forEach(async pk => {

          if (contract.getDetailsAt) {
            const { amount, status, timestamp } = await contract.getDetailsAt(pk);
            this.setState({
              [pk]: {
                amount: amount.toString(),
                status: status.toString(),
                timestamp: timestamp.toString(),
              }
            });
          } else {
            console.log('tests ')
            const { amount, interval, lastPayment } = await contract.subscriptions(pk);
            this.setState({
              [pk]: {
                amount: amount.toString(),
                interval: interval.toString(),
                lastPayment: lastPayment.toString(),
              }
            });
          }

        })


        this.setState({
          list,
          submitted: true
        })
      } catch (e) {
        console.log(e);
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
    const { showRequestButton } = this.props;
    const { list } = this.state;

    return (
      <table className="mui-table mui-table--bordered">
        <thead>
          <tr>
            { showRequestButton && <th>Actions</th> }
            <th>Addresses</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
        {
          list.map((item, i) => {
            console.log({ showRequestButton })
            return (
              <tr key={i}>
                { showRequestButton && (
                  <td>
                    <button
                      onClick={async () => {
                        const { address: tokenAddress } = this.state;
                        const { abi } = this.props;
                        const contract = eth.contract(abi).at(tokenAddress)
                        const accounts = await eth.accounts();
                        const account = accounts[0];

                        contract.requestPayment(item, 1000000000000000, {
                          from: account,
                          amount: '0x0',
                        });
                      }}
                    >
                      Request
                    </button>
                  </td>
                )}
                <td>{ item }</td>
                <td>{ JSON.stringify(this.state[item]) }</td>
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
