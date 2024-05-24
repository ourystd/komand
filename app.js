const { Buffer } = require("node:buffer");
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const path = require("node:path");

async function createFile(filePath) {
  const normalizedPath = path.normalize(filePath);
  let fileHandle;
  try {
    fileHandle = await fsPromises.open(normalizedPath, "wx");
    await fileHandle.close();
    return console.log(`[CREATE] File created: ${filePath}`);
  } catch (err) {
    if (err.code === "EEXIST") {
      return console.log(
        `[CREATE] File ${filePath} already exists. Skipping...`
      );
    }
    console.error(err);
  }
}

async function main() {
  const CMD = { CREATE_FILE: "create a file" };
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
    const command = buff.toString();

    if (command.includes(CMD.CREATE_FILE)) {
      const filePath = command.substring(CMD.CREATE_FILE.length + 1);
      createFile(filePath);
    }
  });

  for await (const event of watcher) {
    console.log(event);
    if (event.eventType === "change") {
      cmdFileHandler.emit(event.eventType);
    }
  }
}

main();
