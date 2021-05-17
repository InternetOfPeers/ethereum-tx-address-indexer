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
      "300",
      "310",
      "4"
    ],
    env: {
      "JSONRPC_URL": "https://mainnet.infura.io/v3/7c5f3fc0248844869d448e51394ce26e",
      "NODE_ENV": "development"
    },
    env_production: {
      "JSONRPC_URL": "https://mainnet.infura.io/v3/7c5f3fc0248844869d448e51394ce26e",
      "NODE_ENV": "production",
    }
  }]
};