# Ethereum TX Address Indexer

I use this indexer to publish list of transactions sent by account on the Ethereum mainnet. The current index is constantly updated and you can find it in a dedicated github repository (**NOTE: soon the link**).

## Why?

It may seems strange, but Ethereum's clients always lacked the ability to find transactions using address as a key. This means you must scan all the ledger from the beginning by your own to get all transactions sent by a specific user.

I think this index can be very useful for many applications - or at least it is very useful for [MOM clients](https://github.com/InternetOfPeers/mom-client) - so I decided to implement it while waiting for this feature to be present in the official Ethereum clients also.

A copy of the index will be stored on GitHub and another one is available through IPFS. It is always updated and pinned at least in a couple nodes of mine and in a pinning service.

## How it works (WIP)

You can create your own index using this program, just `git clone` and `npm install` and you are ready to go. You can run the program with `npm start` but I prefer to use `pm2 start`: this let you monitor the metrics in real time, gathering logs, etc.

If you want to use `pm2`, you can install it with:

```bash
npm install -g pm2
```

Please update variables inside `.env` accordingly if you are using `npm start` or update variables inside `ecosystem.config.json` if you are using `pm2 start`.

Use `pm2 start --env production` to use the production's settings.

You can use Infura as JSONRPC_URL, but I suggest a local node for performance and security.
