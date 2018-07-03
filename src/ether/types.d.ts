import BigNumber from 'bn.js';

export interface ITransfer {
  address: string,
  amount: BigNumber,
  displayAmountEther: string,
  displayAmountDollars: string,
  transactionCount: number,
  isContractAddress: boolean
}
type Transfers = { [address: string]: ITransfer }
