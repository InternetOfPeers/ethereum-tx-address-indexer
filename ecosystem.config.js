module.exports = {
  apps: [{
      name: "extract-data",
      script: "./src/data-extractor.js",
      cwd: ".",
      watch: false,
      autorestart: false,
      node_args: [],
      exec_mode: "fork",
      args: [
        "0",
        "1000000",
        "10000"
      ],
      env: {
        "NODE_ENV": "development",
        "JSONRPC_URL": "https://mainnet.infura.io/v3/<YOUR-PROJECT-ID>",
        "IPC_PATH": "/home/developer/.ethereum/goerli/geth.ipc"
      },
      env_production: {
        "NODE_ENV": "production",
        "JSONRPC_URL": "http://127.0.0.1:8545",
        "IPC_PATH": "/home/developer/.ethereum/goerli/geth.ipc"
      }
    },
    {
      name: "create-index",
      script: "./src/index-creator.js",
      cwd: ".",
      watch: false,
      autorestart: false,
      node_args: [],
      exec_mode: "fork",
      args: [],
      env: {
        "NODE_ENV": "development"
      },
      env_production: {
        "NODE_ENV": "production"
      }
    }
  ]
};