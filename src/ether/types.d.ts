import BigNumber from 'bn.js';

export interface ITransfer {
  address: string,
  amount: BigNumber,
  transactionCount: number
}
type Transfers = { [address: string]: ITransfer }
