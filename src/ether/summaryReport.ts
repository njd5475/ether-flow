
import BigNumber from 'bn.js'
import * as W3 from 'web3/eth/types'
import Aggregator from './aggregator'
import * as T from './types'

export default class SummaryReport {
  public contractAddresses: object = {}
  public receivedAddresses: T.Transfers = {}
  public sentAddresses: T.Transfers = {}
  public totalEther: number = 0

  private aggregator: Aggregator

  constructor(aggregator: Aggregator) {
    this.aggregator = aggregator;
  }

  public addTransaction(t: W3.Transaction) {
    this.checkAndAddContractAddress(t);
    this.addSender(t.from, t);
    this.addReceiver(t.to, t);
  }

  private addSender(from: string, t: W3.Transaction) {
    const sent = this.sentAddresses[from] || {};
    sent.amount = sent.amount ? sent.amount.add(new BigNumber(t.value)) : new BigNumber(t.value);
    sent.transactionCount = sent.transactionCount ? sent.transactionCount + 1 : 1;
    sent.isContractAddress = sent.isContractAddress || this.contractAddresses[from] || false;
    this.aggregator.toEther(sent.amount.toString()).then((e) => sent.displayAmountEther = e.toFixed(18).toString());
    this.aggregator.toDollars(sent.amount.toString()).then((e) => sent.displayAmountDollars = e.toFixed(2).toString());
    this.sentAddresses[from] = sent;
  }

  private addReceiver(to: string, t: W3.Transaction) {
    const received = this.receivedAddresses[to] || {};
    received.amount = received.amount ? received.amount.add(new BigNumber(t.value)) : new BigNumber(t.value);
    received.transactionCount = received.transactionCount ? received.transactionCount + 1 : 1;
    received.isContractAddress = received.isContractAddress || this.contractAddresses[to] || false;
    this.aggregator.toEther(received.amount.toString()).then((e) => received.displayAmountEther = e.toFixed(18).toString());
    this.aggregator.toDollars(received.amount.toString()).then((e) => received.displayAmountDollars = e.toFixed(2).toString());
    this.receivedAddresses[to] = received;
  }

  private checkAndAddContractAddress(t: W3.Transaction) {
    this.aggregator.isContract(t.to).then((c) => {
      if("0x0" !== c) {
        this.addContractAddress(t.to);
      }
    })
    this.aggregator.isContract(t.from).then((c) => {
      if("0x0" !== c) {
        this.addContractAddress(t.from)
      }
    })
  }

  private addContractAddress(hsh: string) {
    const addr = this.contractAddresses[hsh] = this.contractAddresses[hsh] || {};
    addr.contractCount = addr.contractCount ? addr.contractCount + 1 : 0;
  }
}
