import Web3 from 'web3'
import * as Eth from 'web3/eth/types';
import PriceLookup from './priceLookup';

export default class Aggregator {
  public provider: string;
  private w3: Web3;
  private latest: number;
  private runnable: boolean;
  private price: PriceLookup;

  constructor(url: string) {
    this.w3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(url));
    this.provider = this.w3.currentProvider.constructor.name;
    this.latest = 1;
    this.runnable = true;
    this.price = new PriceLookup();
    const blockP = this.w3.eth.getBlock('latest')
    blockP.then((b) => this.latest = +b.number)
  }

  public totalEther(begin: number, end: number, callback: (b: any) => void ): Promise<Eth.Block[]> {
    const promise = new Promise<Eth.Block[]>((resolve, reject) => {
      this.nextBlock(begin, end, [], resolve, callback);
    });

    return promise;
  }

  public nextBlock(begin: number, end: number, blocks: Eth.Block[], resolve: ([]) => void, callback: (b: any) => void) {
    if(this.runnable && begin <= end) {
      this.w3.eth.getBlock(begin).then((blk) => {
        blocks.push(blk);
        callback(begin);
        if(begin <= end) {
          this.nextBlock(begin+1, end, blocks, resolve, callback);
        }else{
          this.stop();
          resolve(blocks);
        }
      });
    }else{
      resolve(blocks);
    }
  }

  public toDollars(wei: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.price.get().then((price) => {
        return price * +this.w3.utils.fromWei(wei, "ether");
      });
    })
  }

  public stop() {
    this.runnable = false
  }

  public getLatestBlock(): number {
    return this.latest;
  }

  public getTrans(hsh: any) {
    return this.w3.eth.getTransaction(hsh);
  }
}

export { Aggregator }
