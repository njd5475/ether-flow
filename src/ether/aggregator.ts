import PriceLookup from './priceLookup';
import { JsonRpcProvider } from 'ethers/providers';
import { Block } from 'src/ether-flow';
import { formatEther } from 'ethers/utils';

export default class Aggregator {
  private provider: JsonRpcProvider;
  private price: PriceLookup;

  constructor(url: string) {
    this.provider = new JsonRpcProvider(url);
    this.price = new PriceLookup();
  }

  public async totalEther(begin: number, end: number): Promise<Block[]> {
    const blocks = [];
    for(let b = begin; b !== end; ++b) {
      const block = await this.provider.getBlock(b);
      blocks.push(block);
    };

    return blocks;
  }

  public async toDollars(wei: string): Promise<number> {
    const ether = this.toEther(wei);
    
    const price = await this.price.get();
    
    return price * ether;
  }

  public toEther(wei: string): number {
    return +formatEther(wei);
  }

  public async getLatestBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  public async getTrans(hsh: any) {
    return this.provider.getTransaction(hsh);
  }

  public async isContract(hsh: string | null | undefined): Promise<string | null> {
    if(hsh === null || hsh === undefined) {
      return null;
    }
    return await this.provider.getCode(hsh);
  }
}

export { Aggregator }
