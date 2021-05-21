const readline = require('readline');
const fs = require('fs');
const chokidar = require('chokidar');
const {
      SSL_OP_EPHEMERAL_RSA
} = require('constants');

// External parameters
const BLOCKS_DATA_DIR = "./blocks-data";
const INDEX_DATA_DIR = "./index-data";

// Let's go
console.log("> INDEXING STARTED =============================================")
console.log("> BLOCKS_DATA_DIR:", BLOCKS_DATA_DIR)
console.log("> INDEX_DATA_DIR :", INDEX_DATA_DIR)
console.log("> ==============================================================")

// Create the index files

// Watch folder for new files...
// Initialize watcher.
const watcher = chokidar.watch(BLOCKS_DATA_DIR, {
      ignored: BLOCKS_DATA_DIR + "/.gitkeep",
      persistent: true
});

// Add event listeners.
watcher.on("add", addFile)

let fileList = [];
let thereAreFilesInQueue = false;
let workingOnFile = false;

function addFile(fileToRead) {
      fileList.push(fileToRead);
      thereAreFilesInQueue = true;
}

function examineFile(fileToRead) {
      console.log("> Examining file", fileToRead);
      var fileInterface = readline.createInterface({
            input: fs.createReadStream(fileToRead)
      });
      fileInterface.on("line", function (line) {
            // Read data in this format:
            //    - from-address,nonce,tx-hash,to-address,blockNumber
            var params = line.split(",");
            var address = params[0];
            var file = fs.createWriteStream(INDEX_DATA_DIR + "/" + address + ".csv", {
                  'flags': 'a'
            });
            file.on('error', function (err) {
                  console.error("> Error", err);
            });
            file.write(params[1] + "," + params[2] + "\n");
            file.end();
      });
      fileInterface.on("close", function () {
            console.log("> Examining file", fileToRead, "finished");
            workingOnFile = false;
      });
}

function sleep(ms) {
      return new Promise((resolve) => {
            setTimeout(resolve, ms);
      });
}

async function createIndex() {
      while (true) {
            if (thereAreFilesInQueue && !workingOnFile) {
                  workingOnFile = true;
                  let filename = fileList.shift();
                  thereAreFilesInQueue = fileList.length > 0;
                  examineFile(filename);
            }
            await sleep(100);
      }
}

createIndex();