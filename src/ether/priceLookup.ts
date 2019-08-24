
export default class PriceLookup {
  private static ticker : string = "https://min-api.cryptocompare.com/data/price"
  private static refreshDelay : number = 1 * 60 * 1000; //

  private price: Promise<number>;

  public constructor() {
    this.price = PriceLookup.fetchTickerPrice();
    setTimeout(this.refresh, PriceLookup.refreshDelay);
  }

  public async get(): Promise<number> {
    return await this.price;
  }
  
  private refresh() {
    this.price = PriceLookup.fetchTickerPrice();
  }

  private static async fetchTickerPrice(): Promise<number> {
    const response = await fetch(`${PriceLookup.ticker}?fsym=ETH&tsyms=USD`);
    const json: any = await response.json();

    return json.USD;
  }
  
}
