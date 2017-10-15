import React, { Component } from 'react';
import Form from 'muicss/lib/react/form';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';
import EthJs from 'ethjs';
import BigNumber from  'bignumber.js';

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
                subscriptionsLL[0x0] = 0x0;
            }

            function getSubscription (address merchantAddress) returns (uint, uint, uint) {
                Subscription subToGet = subscriptions[merchantAddress];
                return (subToGet.amount, subToGet.interval, subToGet.lastPayment);
            }
            
            // Do we need current time for initially setting lastPayment?
            function subscribe (address merchantAddress, uint amount, uint interval) {
                merchantAddress.transfer(amount);
                
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
                delete subscriptionsLL[msg.sender];
                delete subscriptionsLL[msg.sender];
            }
            
            function updateSubscription (address merchantAddress, uint amount, uint interval) {
                subscriptions[merchantAddress].amount = amount;
                subscriptions[merchantAddress].interval = interval;
            }
            
            function handlePaymentRequest () {
                Subscription requestedSub = subscriptions[msg.sender];
                bool timeToPay = now >= requestedSub.lastPayment + requestedSub.interval;
                // Do we need to estimate gas or have an estimate passed and then prevent call if insufficient
                
                if (requestedSub.lastPayment != 0 && timeToPay) {
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
