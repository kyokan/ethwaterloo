import React, { Component } from 'react';
import Form from 'muicss/lib/react/form';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';
import EthJs from 'ethjs';
import BigNumber from  'bignumber.js';

const CONSUMER_ABI = [{"constant":false,"inputs":[{"name":"merchantAddress","type":"address"}],"name":"getSubscription","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"merchantAddress","type":"address"},{"name":"amount","type":"uint256"},{"name":"interval","type":"uint256"}],"name":"subscribe","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"subscriptionsLL","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"requestedAmount","type":"uint256"}],"name":"handlePaymentRequest","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"merchantAddress","type":"address"}],"name":"unsubscribe","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"merchantAddress","type":"address"},{"name":"amount","type":"uint256"},{"name":"interval","type":"uint256"}],"name":"updateSubscription","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"subscriptions","outputs":[{"name":"amount","type":"uint256"},{"name":"interval","type":"uint256"},{"name":"lastPayment","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}];

class Consumer extends Component {
  constructor(args) {
    super(args);

    this.state = {
      initialDeposit: undefined,
    }
  }

  generateContract() {
    const { initialDeposit = 0 } = this.state;

    let eth;

    if (typeof window.web3 !== 'undefined') {
      eth = new EthJs(window.web3.currentProvider);
    }

    (async () => {
      console.log('ASYNCED');
      const contract = `
        pragma solidity ^0.4.17;

        contract ConsumerSubscriptions {
            address owner;
            mapping(address => Subscription) public subscriptions;
            mapping(address => address) public subscriptionsLL;
            
            struct Subscription {
                uint amount;
                uint interval;
                uint lastPayment;
            }
            
            function() payable { }
            
            function ConsumerSubscriptions () public payable {
                owner = msg.sender;
            }

            function getSubscription (address merchantAddress) constant returns (uint, uint, uint) {
                return (
                  subscriptions[merchantAddress].amount,
                  subscriptions[merchantAddress].interval,
                  subscriptions[merchantAddress].lastPayment
                );
            }
            
            // Do we need current time for initially setting lastPayment?
            function subscribe (address merchantAddress, uint amount, uint interval) {
                merchantAddress.call.value(amount)(
                    bytes4(sha3 ("onPayment(uint256,uint256)") ),
                    amount,
                    now
                );
                
                subscriptions[merchantAddress] = Subscription(
                    amount,
                    interval,
                    now
                );
                subscriptionsLL[merchantAddress] = subscriptionsLL[0x0];
                subscriptionsLL[0x0] = merchantAddress;
            }
            
            function unsubscribe (address merchantAddress) {
                address nextAddress = subscriptionsLL[0x0];
                while (nextAddress != msg.sender) {
                    nextAddress = subscriptionsLL[nextAddress];
                }
                nextAddress = subscriptionsLL[msg.sender];
                delete subscriptions[msg.sender];
                delete subscriptionsLL[msg.sender];
            }
            
            function updateSubscription (address merchantAddress, uint amount, uint interval) {
                subscriptions[merchantAddress].amount = amount;
                subscriptions[merchantAddress].interval = interval;
            }
            
            function handlePaymentRequest (uint requestedAmount) {
                Subscription requestedSub = subscriptions[msg.sender];
                bool timeToPay = now >= requestedSub.lastPayment + requestedSub.interval;
                bool requestAmountMatch = requestedAmount == requestedSub.amount;
                // Do we need to estimate gas or have an estimate passed and then prevent call if insufficient
                
                if (requestedSub.lastPayment != 0 && timeToPay && requestAmountMatch) {
                    msg.sender.call(
                        bytes4(sha3 ("onPayment(uint256,uint256)") ),
                        requestedSub.amount,
                        now
                    );
                }
            }
        }
        `

        window.BrowserSolc.loadVersion("soljson-v0.4.17+commit.bdeb9e52.js", async compiler => {
          const optimize = 1;
          const result = compiler.compile(contract, optimize);
          console.log(result);
          const bytecode = result.contracts[':ConsumerSubscriptions'].bytecode;
          const abi = JSON.parse(result.contracts[':ConsumerSubscriptions'].interface);
          const output = eth.contract(abi);
          console.log(JSON.stringify(abi))
          const account = await eth.accounts()

          const WEI_CONSTANT = new BigNumber('1000000000000000000')
          const initialDepositToBigNumber = new BigNumber(initialDeposit).times(WEI_CONSTANT)

          const data = {
            data: '0x' + bytecode,
            from: account[0],
            gas: 0,
            value: '0x' + initialDepositToBigNumber.toString(16),
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
    const { initialDeposit } = this.state;
    return typeof initialDeposit === 'undefined'
  }

  render() {
    const isDisabled = this.disableSubmitButton();
    return (
      <div className="merchant">
        <div className="merchant-form">
          <h1 className="merchant-form__title">
            Create Account
          </h1>
          <Input
            type="text"
            label="Initial Deposit"
            floatingLabel={true}
            onChange={e => this.setState({ initialDeposit: e.target.value })}
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

export default Consumer;
