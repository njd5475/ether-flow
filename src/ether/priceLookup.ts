import _ from 'underscore';

export default class PriceLookup {
  private static listing : string = "https://api.coinmarketcap.com/v2/listings/"
  private static ticker : string = "https://api.coinmarketcap.com/v2/ticker/"
  private static defaultTicketId: number = 1027
  private static refreshDelay : number = 1 * 60 * 1000; //

  private id: number = PriceLookup.defaultTicketId;
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
        this.getTickerId().then((id) => {
          fetch(`${PriceLookup.ticker}${id}`)
            .then((response) => response.json())
            .then((tickerObj) => {
                if(tickerObj.quotes && tickerObj.quotes.USD) {
                  resolve(+tickerObj.body.quotes.USD.price);
                }else{
                  reject("Improper body response " + JSON.stringify(tickerObj));
                }
            });
        })
    });
  }

  private getTickerId() {
    return new Promise<number>((resolve, reject) => {
      if(!this.id) {
        this.fetchIdFromListing().then((id) => {
          this.id=id;
          resolve(id);
        }).catch(reject);
      }else{
        resolve(this.id);
      }
    });
  }

  private fetchIdFromListing() {
    return fetch(PriceLookup.listing)
      .then((response) => response.json())
      .then((response) => {
        if(response.data && response.data.length > 0) {
          const found : any = _.find(response.data, (d: any) => d.name ? d.name === "Ethereum" : false)
          return found ? found.id : null;
        }
    });
  }

}
