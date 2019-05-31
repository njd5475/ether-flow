
import BigNumber from 'bn.js';
import { Transaction } from 'web3-core/types';
import Aggregator from './aggregator';
import * as T from './types';

export default class SummaryReport {
  public contractAddresses: object = {}
  public receivedAddresses: T.Transfers = {}
  public sentAddresses: T.Transfers = {}
  public totalEther: BigNumber = new BigNumber(0)
  public allAddresses: object = {}

  private aggregator: Aggregator

  constructor(aggregator: Aggregator) {
    this.aggregator = aggregator;
  }

  public addTransaction(t: Transaction): Promise<SummaryReport> {
    if(t.to === null) {
      throw new Error('Transaction invalid');
    }
    return new Promise<SummaryReport>((resolve, reject) => {
      this.totalEther = this.totalEther.add(new BigNumber(t.value));
      this.checkAndAddContractAddress(t, resolve, reject);
      this.addSender(t.from, t);
      this.addReceiver(t.to, t);
      this.allAddresses[t.from] = {};
      if(t.to === null) {
        return;
      }
      this.allAddresses[t.to] = {};
    })
  }

  public getContractPercentage(): number {
    return 100.0 * (Object.keys(this.contractAddresses).length / Object.keys(this.allAddresses).length);
  }

  private addSender(from: string, t: Transaction) {
    const sent = this.sentAddresses[from] || {};
    sent.amount = sent.amount ? sent.amount.add(new BigNumber(t.value)) : new BigNumber(t.value);
    sent.transactionCount = sent.transactionCount ? sent.transactionCount + 1 : 1;
    sent.isContractAddress = sent.isContractAddress || this.contractAddresses[from] || false;
    this.aggregator.toEther(sent.amount.toString()).then((e) => sent.displayAmountEther = e.toFixed(18).toString());
    this.aggregator.toDollars(sent.amount.toString()).then((e) => sent.displayAmountDollars = e.toFixed(2).toString());
    this.sentAddresses[from] = sent;
  }

  private addReceiver(to: string | null, t: Transaction) {
    if(to === null) {
      return;
    }
    const received = this.receivedAddresses[to] || {};
    received.amount = received.amount ? received.amount.add(new BigNumber(t.value)) : new BigNumber(t.value);
    received.transactionCount = received.transactionCount ? received.transactionCount + 1 : 1;
    received.isContractAddress = received.isContractAddress || this.contractAddresses[to] || false;
    this.aggregator.toEther(received.amount.toString()).then((e) => received.displayAmountEther = e.toFixed(18).toString());
    this.aggregator.toDollars(received.amount.toString()).then((e) => received.displayAmountDollars = e.toFixed(2).toString());
    this.receivedAddresses[to] = received;
  }

  private checkAndAddContractAddress(t: Transaction, resolve: (s: SummaryReport) => void, reject: () => void) {
    this.aggregator.isContract(t.to).then((c) => {
      if(!("0x0" === c || "0x" === c)) {
        this.addContractAddress(t.to);
      }
      this.aggregator.isContract(t.from).then((ct) => {
        if(!("0x0" === ct || "0x" === ct)) {
          this.addContractAddress(t.from)
        }
        resolve(this);
      })
    })

  }

  private addContractAddress(hsh: string | null) {
    if(hsh === null) {
      return;
    }
    const addr = this.contractAddresses[hsh] = this.contractAddresses[hsh] || {};
    addr.contractCount = addr.contractCount ? addr.contractCount + 1 : 0;
  }
}
