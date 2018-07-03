
export default class PriceLookup {
  private static ticker : string = "https://min-api.cryptocompare.com/data/price"
  private static refreshDelay : number = 1 * 60 * 1000; //

  private price: number | null;
  private nextCache: number | null;

  public get(): Promise<number> {
    return this.priceCache();
  }

  private priceCache(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      if(!this.nextCache) {this.nextCache = -1}
      if(!this.price || (new Date()).getTime() > this.nextCache) {
        this.fetchTickerPrice().then((price) => {
          this.nextCache = (new Date()).getTime() + PriceLookup.refreshDelay;
          this.price = price;
          resolve(this.price);
        })
      }else{
        resolve(this.price);
      }
    })
  }

  private fetchTickerPrice() {
    return new Promise<number>(
      (resolve, reject) => {
        fetch(`${PriceLookup.ticker}?fsym=ETH&tsyms=USD`)
          .then((response) => response.json())
          .then((tickerObj) => {
              if(tickerObj.USD) {
                resolve(+tickerObj.USD);
              }else{
                reject("Improper body response " + JSON.stringify(tickerObj));
              }
          });
    });
  }

}
