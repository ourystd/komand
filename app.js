const { Buffer } = require("node:buffer");
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const path = require("node:path");

async function main() {
  const commandsFilename = "commands.txt";
  const watcher = fsPromises.watch(commandsFilename);
  const cmdFileHandler = await fsPromises.open(commandsFilename, "r");

  for await (const event of watcher) {
    console.log(event);
    const { size } = await cmdFileHandler.stat();
    const buff = Buffer.alloc(fileSize);
    const offset = 0;
    const length = buff.byteLength;
    const position = 0;

    const content = await cmdFileHandler.read({
      buffer: buff,
      offset,
      length,
      position,
    });
    console.log(content, { fileSize });
  }
}

main();
