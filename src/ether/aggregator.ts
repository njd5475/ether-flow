import Web3 from 'web3'

import * as Web3Types from 'web3/types';

class Aggregator {
  public provider: string;
  private w3: Web3;
  private latest: number;

  constructor(url: string) {
    this.w3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(url));
    this.provider = this.w3.currentProvider.constructor.name;
    this.latest = 1;
    this.w3.eth.getBlock('latest').then((b) => this.latest = +b.number)
  }

  public totalEther(begin: number, end: number, callback: (b: any) => void ): Promise<Web3Types.Block[]> {
    const promise = new Promise<Web3Types.Block[]>((resolve, reject) => {
      this.nextBlock(begin, end, [], resolve, callback);
    });

    return promise;
  }

  public nextBlock(begin: number, end: number, blocks: Web3Types.Block[], resolve: ([]) => void, callback: (b: any) => void) {
    this.w3.eth.getBlock(begin).then((blk) => {
      blocks.push(blk);
      callback(begin);
      if(begin === end) {
        resolve(blocks);
      }else{
        this.nextBlock(begin+1, end, blocks, resolve, callback);
      }
    });
  }

  public getLatestBlock(): number {
    return this.latest;
  }

  public getTrans(hsh: any) {
    return this.w3.eth.getTransaction(hsh);
  }
}

export { Aggregator }
