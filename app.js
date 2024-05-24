const { Buffer } = require("node:buffer");
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const path = require("node:path");

async function main() {
  const commandsFilename = "commands.txt";
  const watcher = fsPromises.watch(commandsFilename);
  const cmdFileHandler = await fsPromises.open(commandsFilename, "r");

  cmdFileHandler.on("change", async () => {
    const { size } = await cmdFileHandler.stat();
    const buff = Buffer.alloc(size);
    const offset = 0;
    const length = buff.byteLength;
    const position = 0;

    await cmdFileHandler.read({
      buffer: buff,
      offset,
      length,
      position,
    });
    console.log(buff.toString());
  });
  for await (const event of watcher) {
    console.log(event);
    if (event.eventType === "change") {
      cmdFileHandler.emit(event.eventType);
    }
  }
}

main();
