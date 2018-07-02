
import * as W3 from 'web3/eth/types'

export default class SummaryReport {
  public contractAddresses: object
  public receivedAddresses: object
  public sentAddresses: object
  public totalEther: number

  public addTransaction(t: W3.Block) {
    if(!this.contractAddresses) {
      this.contractAddresses = {};
    }
  }
}
