import React, { Component } from 'react';
import Form from 'muicss/lib/react/form';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';
import EthJs from 'ethjs';
import BigNumber from  'bignumber.js';

const MERCHANT_ABI = [{"constant":true,"inputs":[{"name":"consumerAddress","type":"address"}],"name":"getDetailsAt","outputs":[{"name":"timestamp","type":"uint256"},{"name":"amount","type":"uint256"},{"name":"status","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"consumerAddress","type":"address"},{"name":"paymentAmount","type":"uint256"}],"name":"requestPayment","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"paymentAmount","type":"uint256"},{"name":"paymentTimestamp","type":"uint256"}],"name":"onPayment","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"},{"name":"interval","type":"uint256"},{"name":"name","type":"string"}],"name":"update","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"subscriptionName","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"payable":true,"type":"fallback"}];

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


    // console.log({ subscriptionAmountBN })
    (async () => {
      console.log('ASYNCED');
      const WEI_CONSTANT = new BigNumber('1000000000000000000')
      const subscriptionAmountBN = new BigNumber(amount).times(WEI_CONSTANT).toString()
      const contract = `
        pragma solidity ^0.4.0;
        contract MerchantContract {
          address public owner = msg.sender;
          string public subscriptionName = "${name}";
          uint subscriptionAmount = ${subscriptionAmountBN};
          uint subscriptionInterval = ${interval};
          mapping (address => Subscriber) subscribers;
          mapping (address => address) subscribersLL;
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

            return (timestamp, amount, status);
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
            consumerAddress.call(
                bytes4(sha3 ("handlePaymentRequest(uint256)") ),
                paymentAmount
            );
          }

          function requestSubscription(address consumerAddress, uint paymentAmount, uint interval) {

          }

          function onPayment(uint paymentAmount, uint paymentTimestamp) returns (bool success) payable {
            if (!verify(paymentAmount)) {
              return false;
            }

            Payment storage lastPayment = subscribers[msg.sender].lastPayment;
            lastPayment.amount = paymentAmount;
            lastPayment.timestamp = paymentTimestamp;

            subscribers[merchantAddress] = subscribers[0x0];
            subscribers[0x0] = merchantAddress;

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

          function () payable {}
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
            type="text"
            label="Subscription Cost"
            floatingLabel={true}
            onChange={e => this.setState({ amount: +e.target.value })}
            defaultValue=""
            // required
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
            onClick={e => {
              e.stopPropagation();
              this.generateContract();
            }}
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
