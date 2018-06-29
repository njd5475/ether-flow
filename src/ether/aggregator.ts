import Web3 from 'web3'


class Aggregator {
  public provider: string;
  private w3: Web3;
  constructor(url: string) {
    this.w3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(url));
    this.provider = this.w3.currentProvider.constructor.name;
  }

  public totalEther() {
    return this.w3.eth.getBlock(1000000);
  }
}

export { Aggregator }
