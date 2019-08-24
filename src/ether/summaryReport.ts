
import Aggregator from './aggregator';
import * as T from '.';
import { BigNumber, Transaction } from 'ethers/utils';

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

  public async addTransaction(t: Transaction): Promise<SummaryReport> {
    if(t.to === null || t.to === undefined || t.from === null || t.from === undefined) {
      throw new Error('Transaction invalid');
    }
    this.totalEther = this.totalEther.add(new BigNumber(t.value));
    
    await this.addSender(t.from, t);
    await this.addReceiver(t.to, t);
    this.allAddresses[t.from] = {};
    this.allAddresses[t.to] = {};

    return await this.checkAndAddContractAddress(t);
  }

  public getContractPercentage(): number {
    return 100.0 * (Object.keys(this.contractAddresses).length / Object.keys(this.allAddresses).length);
  }

  private async addSender(from: string | undefined, t: Transaction) {
    if(from === undefined) {
      return;
    }
    const sent = this.sentAddresses[from] || {};
  
    sent.amount = sent.amount ? sent.amount.add(new BigNumber(t.value)) : new BigNumber(t.value);
    sent.transactionCount = sent.transactionCount ? sent.transactionCount + 1 : 1;
    sent.isContractAddress = sent.isContractAddress || this.contractAddresses[from] || false;
  
    const ether = this.aggregator.toEther(sent.amount.toString()); 
    sent.displayAmountEther = ether.toFixed(18).toString();
    if(ether <= 0) {
      sent.displayAmountEther = '';
    }

    const dollars = await this.aggregator.toDollars(sent.amount.toString());

    sent.displayAmountDollars = dollars.toFixed(2).toString();
    if(dollars <= 0) {
      sent.displayAmountDollars = '';
    }

    this.sentAddresses[from] = sent;
  }

  private async addReceiver(to: string | null, t: Transaction) {
    if(to === null) {
      return;
    }
    const received = this.receivedAddresses[to] || {};
    
    received.amount = received.amount ? received.amount.add(new BigNumber(t.value)) : new BigNumber(t.value);
    received.transactionCount = received.transactionCount ? received.transactionCount + 1 : 1;
    received.isContractAddress = received.isContractAddress || this.contractAddresses[to] || false;
    
    const ether = this.aggregator.toEther(received.amount.toString());
    received.displayAmountEther = ether.toFixed(18).toString();
    if(ether <= 0) {
      received.displayAmountEther = '';
    }

    const dollars = await this.aggregator.toDollars(received.amount.toString());
    received.displayAmountDollars = dollars.toFixed(2).toString();
    if(dollars <= 0) {
      received.displayAmountDollars = '';
    }

    this.receivedAddresses[to] = received;
  }

  private async checkAndAddContractAddress(t: Transaction) : Promise<SummaryReport> {
    const c = await this.aggregator.isContract(t.to);
    
    if(!("0x0" === c || "0x" === c)) {
      this.addContractAddress(t.to);
    }
    const ct = await this.aggregator.isContract(t.from);
    if(!("0x0" === ct || "0x" === ct)) {
      this.addContractAddress(t.from)
    }
    return this;
  }

  private addContractAddress(hsh: string | null | undefined) {
    if(hsh === null || hsh === undefined) {
      return;
    }
    const addr = this.contractAddresses[hsh] = this.contractAddresses[hsh] || {};
    addr.contractCount = addr.contractCount ? addr.contractCount + 1 : 0;
  }
}
