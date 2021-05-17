module.exports = {
  apps: [{
    name: "tx-address-indexer",
    script: "./index.js",
    cwd: ".",
    watch: false,
    autorestart: false,
    node_args: [],
    exec_mode: "fork",
    args: [
      "0",
      "4805355",
      "500"
    ],
    env: {
      "JSONRPC_URL": "https://mainnet.infura.io/v3/7c5f3fc0248844869d448e51394ce26e",
      "NODE_ENV": "development"
    },
    env_production: {
      "JSONRPC_URL": "http://127.0.0.1:8545",
      "NODE_ENV": "production",
    }
  }]
};