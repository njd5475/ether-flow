This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

Simple Ethereum Blockchain Explorer (based on the [web3 api]())
===

A simple GUI that will allow you to enter a provider URL for Web3 to access the Ethereum RPC protocol.

You may enter a range of block numbers which will be shown 

Running from Source
===

Clone the repo

```bash
$ git clone git@github.com:njd5475/ether-flow.git
```

Install the dependencies

```bash
$ npm install
```

Delete the web3 type bindings, ~since they are broken~

```bash
$ rm node_modules/web3/*.d.ts
```

Start it up

```bash
$ npm start
```
