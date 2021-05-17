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
      "1000000",
      "500"
    ],
    env: {
      "NODE_ENV": "development",
      "JSONRPC_URL": "https://mainnet.infura.io/v3/<YOUR-PROJECT-ID>",
      "IPC_PATH": "/"
    },
    env_production: {
      "NODE_ENV": "production",
      "JSONRPC_URL": "http://127.0.0.1:8545",
      "IPC_PATH": "/home/developer/.ethereum/goerli/geth.ipc"
    }
  }]
};