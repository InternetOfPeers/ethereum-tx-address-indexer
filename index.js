const ethers = require("ethers");
const io = require('@pm2/io');
const fs = require('fs');

// External parameters
const JSONRPC_URL = process.env.JSONRPC_URL;
const IPC_PATH = process.env.IPC_PATH;
const BLOCKS_DATA_DIR = "./blocks-data"
const INDEX_DATA_DIR = "./index-data"

const ARGV = process.argv.slice(2);
const FROM_BLOCK = parseInt(ARGV[0]);
const TO_BLOCK = parseInt(ARGV[1]);
const BATCH_SIZE = parseInt(ARGV[2]);

if (!areValidParameters(FROM_BLOCK, TO_BLOCK, BATCH_SIZE)) {
    process.exit();
}

// Metrics
var currentBlockNumber = io.metric({
    name: 'Reading block #'
});

var blockCounter = io.counter({
    name: 'Analyzed blocks'
});

var blocksSpeed = io.meter({
    name: 'Indexing blocks/min',
    samples: 60,
    timeframe: 300
});

// Let's go
console.log("====== INDEXING STARTED =======")
console.log("= Parameters:")
console.log("= FROM_BLOCK", FROM_BLOCK)
console.log("= TO_BLOCK", TO_BLOCK)
console.log("= BATCH_SIZE", BATCH_SIZE)
console.log("= JSONRPC_URL", JSONRPC_URL)
console.log("= IPC_PATH", IPC_PATH)
console.log("===============================")

//const provider = new ethers.providers.JsonRpcProvider(JSONRPC_URL);
const provider = new ethers.providers.IpcProvider(IPC_PATH);

async function getTransactionsByBlock(blockIdentifier) {
    return await provider.getBlockWithTransactions(blockIdentifier).then(result => result.transactions);
}

async function getIndexDataByBlock(blockIdentifier) {
    currentBlockNumber.set(blockIdentifier);
    let result = [];
    (await getTransactionsByBlock(blockIdentifier)).forEach(function (tx) {
        result.push([tx.from, tx.nonce, tx.hash, tx.to, blockIdentifier]);
    })
    blocksSpeed.mark();
    return result;
}

async function getIndexDataByRange(blockNumberFrom, blockNumberTo) {
    let result = [];
    for (let index = blockNumberFrom; index <= blockNumberTo; index++) {
        (await getIndexDataByBlock(index)).forEach(indexData => result.push(indexData));
        blockCounter.inc();
    }
    return result;
}

async function writeData(data, fromBlock, toBlock) {
    /*
    File data structure:

        from-address,nonce,tx-hash,to-address,blockNumber
        ...
        ...

    Example:

        0x8c1e1e5b47980D214965f3bd8ea34C413E120ae4,62,0x26b5b86d64c9c9213646a994ad448d74ca4ba6670ab95bdb88f37178cba6f83a,0xF9185E440c442beEC153F4F318ADe850b1ECb50b,24060
        ...
        ...

    Notes:
        - `to-address` can be void if the tx is a transaction to deploy a smart contract
        - from-address can (and it will) be duplicated inside the same file. The unique key is `from-address`+`nonce`
    */
    var file = fs.createWriteStream(BLOCKS_DATA_DIR + '/' + 'blocks-' + fromBlock + "-" + toBlock + ".csv");
    file.on('error', function (err) {
        /* error handling */
        console.error("> Error", err);
    });
    data.forEach(function (value) {
        file.write(value.join(',') + '\n');
    });
    file.end();
}

function areValidParameters(blockNumberFrom, blockNumberTo, blocksBatch) {
    if (blockNumberFrom == undefined || blockNumberTo == undefined || blocksBatch == undefined) {
        console.error("missing parameters");
        return false;
    }
    if (Number.isNaN(blockNumberFrom) || Number.isNaN(blockNumberTo) || Number.isNaN(blocksBatch)) {
        console.error("parameters must be numbers");
        return false;
    }
    if (blocksBatch <= 0) {
        console.error("blocksBatch must be > 0");
        return false;
    }
    if (blockNumberFrom > blockNumberTo) {
        console.error("blockNumberFrom must be > of blockNumberFrom");
        return false;
    }
    return true;
}

async function writeIndexDataByRangeWithBatch(blockNumberFrom, blockNumberTo, blocksBatch) {
    if (areValidParameters(blockNumberFrom, blockNumberTo, blocksBatch)) {
        if (blockNumberFrom + blocksBatch > blockNumberTo) {
            console.log("> Writing a single batch of", blockNumberTo - blockNumberFrom + 1, "blocks. Please wait.")
            await getIndexDataByRange(blockNumberFrom, blockNumberTo).then(function (data) {
                writeData(data, blockNumberFrom, blockNumberTo);
            });
        } else {
            console.log("> Writing batches of", blocksBatch, "blocks. Please wait.")
            let current = blockNumberFrom;
            while (current < blockNumberTo) {
                console.log("> Current block:", current);
                let to = current + blocksBatch - 1;
                if (to > blockNumberTo) to = blockNumberTo;
                await getIndexDataByRange(current, to).then(async function (data) {
                    await writeData(data, current, to);
                });
                current = to + 1;
            }
        }
    }
    console.log("====== INDEXING FINISHED ======")
}

writeIndexDataByRangeWithBatch(FROM_BLOCK, TO_BLOCK, BATCH_SIZE)