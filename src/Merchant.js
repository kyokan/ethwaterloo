import React, { Component } from 'react';
import Form from 'muicss/lib/react/form';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';
import EthJs from 'ethjs';

class Merchant extends Component {
  constructor(args) {
    super(args);

    this.state = {
      name: undefined,
      interval: undefined,
      amount: undefined
    }
  }

  generateContract() {
    const { name, interval = 0, amount = 0 } = this.state;

    let eth;

    if (typeof window.web3 !== 'undefined') {
      eth = new EthJs(window.web3.currentProvider);
    }

    (async () => {
      console.log('ASYNCED');
      const contract = `
        pragma solidity ^0.4.0;
        contract MerchantContract {
          address public owner = msg.sender;
          string public subscriptionName = "${name}";
          uint subscriptionAmount = ${amount};
          uint subscriptionInterval = ${interval};
          mapping (address => Subscriber) subscribers;
          enum Statuses { SUBSCRIBED, UNSUBSCRIBED }

          struct Payment {
            uint timestamp;
            uint amount;
          }

          struct Subscriber {
            Payment lastPayment;
          }

          function getDetailsAt(address consumerAddress) constant returns (uint timestamp, uint amount, Statuses status) {
            Payment storage lastPayment = subscribers[consumerAddress].lastPayment;
            timestamp = lastPayment.timestamp;
            amount = lastPayment.amount;
            if (block.timestamp - subscriptionInterval > timestamp) {
              status = Statuses.UNSUBSCRIBED;
            } else {
              status = Statuses.SUBSCRIBED;
            }

            return timestamp, amount, status;
          }

          function update(uint amount, uint interval, string name) {
            if (amount >= 0) {
              subscriptionAmount = amount;
            }

            if (interval >= 0) {
              subscriptionInterval = interval;
            }

            if (bytes(name).length > 0) {
              subscriptionName = name;
            }
          }

          function requestPayment(address consumerAddress, uint paymentAmount) returns (bool success) {
            // consumerAddress.requestPayment(paymentAmount)
            // return true
          }

          function onPayment(address consumerAddress, uint paymentAmount) returns (bool success) {
            if (!verify(paymentAmount)) {
              return false;
            }

            Payment storage lastPayment = subscribers[consumerAddress].lastPayment;
            lastPayment.amount = paymentAmount;
            lastPayment.timestamp = block.timestamp;
            return true;
          }

          function verify(uint paymentAmount) private returns (bool verified) {
            if (paymentAmount < subscriptionAmount) {
              verified = false;
            } else {
              verified = true;
            }

            return verified;
          }
        }
        `

        window.BrowserSolc.loadVersion("soljson-v0.4.6+commit.2dabbdf0.js", async compiler => {
          const optimize = 1;
          const result = compiler.compile(contract, optimize);
          console.log(result);
          const bytecode = result.contracts.MerchantContract.bytecode;
          const abi = JSON.parse(result.contracts.MerchantContract.interface);
          const output = eth.contract(abi);
          console.log(JSON.stringify(abi))
          const account = await eth.accounts()

          const data = {
            data: '0x' + bytecode,
            from: account[0],
            gas: 0
          };

          const gas = await eth.estimateGas(data)

          const contractInstance = output.new({ ...data, gas }, (err, res) => {
              if (err) {
                  console.log(err);
                  return;
              }

              console.log('RES', res);
              // Log the tx, you can explore status with eth.getTransaction()
              console.log(res.transactionHash);

              // If we have an address property, the contract was deployed
              if (res.address) {
                  console.log('Contract address: ' + res.address);
              }
          });
        });
    })();
  }

  handleClick() {
    this.generateContract();
  }

  disableSubmitButton() {
    const { name, interval, amount } = this.state;
    return typeof name === 'undefined' ||
      typeof interval === 'undefined' ||
      typeof amount === 'undefined';
  }

  render() {
    const isDisabled = this.disableSubmitButton();
    return (
      <div className="merchant">
        <div className="merchant-form">
          <h1 className="merchant-form__title">
            Create New Subscription
          </h1>
          <Input
            type="text"
            label="Subscription Name"
            floatingLabel={true}
            onChange={e => this.setState({ name: e.target.value })}
            defaultValue=""
            required
          />
          <Input
            type="number"
            label="Subscription Cost"
            floatingLabel={true}
            onChange={e => this.setState({ amount: +e.target.value })}
            defaultValue=""
            required
          />
          <Input
            type="number"
            label="Subscription Interval (in days)"
            floatingLabel={true}
            onChange={e => this.setState({ interval: +e.target.value * 86400 })}
            defaultValue=""
            required
          />
          <Button
            variant="raised"
            color="primary"
            onClick={() => this.generateContract()}
            disabled={isDisabled}
          >
            Submit
          </Button>
        </div>
      </div>
    );
  }
}

export default Merchant;
