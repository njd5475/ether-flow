
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
    this.addSender(t.from, t);
    this.addReceiver(t.to, t);
    this.checkAndAddContractAddress(t);
  }

  private addSender(from: string, t: W3.Transaction) {
    const sent = this.sentAddresses[from] || {};
    sent.amount = sent.amount ? sent.amount.add(new BigNumber(t.value)) : new BigNumber(t.value);
    sent.transactionCount = sent.transactionCount ? sent.transactionCount + 1 : 1;
    this.sentAddresses[from] = sent;
  }

  private addReceiver(to: string, t: W3.Transaction) {
    const received = this.receivedAddresses[to] || {};
    received.amount = received.amount ? received.amount.add(new BigNumber(t.value)) : new BigNumber(t.value);
    received.transactionCount = received.transactionCount ? received.transactionCount + 1 : 1;
    this.receivedAddresses[to] = received;
  }

  private checkAndAddContractAddress(t: W3.Transaction) {
    this.aggregator.isContract(t.to).then((c) => {
      if("0x0" !== c) {
        const addr = this.contractAddresses[t.to] = this.contractAddresses[t.to] || {};
        addr.contractCount = addr.contractCount ? addr.contractCount + 1 : 0;
      }
    })
    this.aggregator.isContract(t.from)
  }
}
