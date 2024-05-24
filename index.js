const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const path = require("node:path");
const readline = require("node:readline");

const CMD = {
  CREATE_FILE: "create a file",
  RENAME_FILE: "rename the file",
  DELETE_FILE: "delete the file",
  ADD_CONTENT_TO_FILE: "add content to file",
};

const commands = new Set(Object.values(CMD));

const createFile = async (filename) => {
  const file = path.normalize(filename);
  if (fs.existsSync(file)) {
    console.log(`➕ [CREATE] File already exists: ${filename}; skipping...`);
    return;
  }
  await fsPromises.writeFile(file, "");
  console.log(`➕ [CREATE] File created: ${filename}`);
};

const setFileContent = async (filename, content) => {
  await fsPromises.writeFile(path.normalize(filename), content);
  console.log(`📝 [ADD CONTENT] File content set: ${filename}`);
};

const appendContentToFile = async (filename, content) => {
  await fsPromises.appendFile(path.normalize(filename), content);
  console.log(`Content added to file: ${filename}`);
};

const deleteFile = async (filename) => {
  const file = path.normalize(filename);
  if (!fs.existsSync(file)) {
    console.log(`🗑️ [DELETE] File does not exist: ${filename}; skipping...`);
    return;
  }
  await fsPromises.unlink(file);
  console.log(`🗑️ [DELETE] File deleted: ${filename}`);
};

const renameFile = async (filename, newFilename) => {
  const source = path.normalize(filename);
  const destination = path.normalize(newFilename);
  if (!fs.existsSync(source)) {
    console.log(`✍️ [RENAME] File does not exist: ${filename}; skipping...`);
    return;
  }
  if (fs.existsSync(destination)) {
    console.log(`✍️ [RENAME] File ${newFilename} already exists; skipping...`);
    return;
  }
  if (source === destination) {
    console.log(`✍️ [RENAME] No need to rename file: ${filename}; skipping...`);
    return;
  }

  await fsPromises.rename(source, destination);
  console.log(`✍️ [RENAME] File renamed: ${filename} to ${newFilename}`);
};

const commandsFilename = "commands.txt";

const extractCommandFromLine = (line) => {
  // the command is a set of words from `commands` set
  for (const command of commands) {
    if (line.startsWith(command)) {
      return { command, args: line.slice(command.length).trim().split(/\s+/) };
    }
  }

  return {};
};

async function main() {
  try {
    const watcher = fsPromises.watch(__dirname, { encoding: "utf-8" });
    let cachedContent = await fsPromises.readFile(commandsFilename, "utf-8");
    let cachedEventType = "change";

    for await (const event of watcher) {
      const newContent = await fsPromises.readFile(commandsFilename, "utf-8");
      const { filename, eventType } = event;
      // if previous event is same with same content, skip
      if (cachedEventType === eventType && cachedContent === newContent) {
        console.log(`Skipping cached event: ${eventType}`);
        continue;
      }

      cachedContent = newContent;
      cachedEventType = eventType;

      if (filename === commandsFilename && eventType === "change") {
        const lineReader = readline.createInterface({
          input: fs.createReadStream(commandsFilename),
          crlfDelay: Infinity,
        });

        lineReader.on("line", (line) => {
          const { command, args } = extractCommandFromLine(line);

          switch (command) {
            case CMD.CREATE_FILE:
              createFile(args[0]);
              break;
            case CMD.RENAME_FILE:
              renameFile(args[0], args[2]);
              break;
            case CMD.ADD_CONTENT_TO_FILE:
              const content = newContent.split("this content:")[1];
              if (typeof content === "string") {
                setFileContent(args[0], content.trim());
              } else {
                console.log(`📝 [ADD CONTENT] Invalid content: ${content}`);
              }
              break;
            case CMD.DELETE_FILE:
              deleteFile(args[0]);
              break;
            default:
              // color: red
              console.log(
                `\u001b[31m ❌ [UNKNOWN] Unknown command: ${command} \u001b[0m`
              );
              return;
          }
        });
      }
    }
  } catch (err) {
    // console.log({ err });
    if (err.name === "AbortError") return;
    // throw err;
  }
}

main();
