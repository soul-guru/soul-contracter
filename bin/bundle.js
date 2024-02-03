#! /usr/bin/env node

const  { program } = require("commander");
const request = require("request");
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require("fs");
const { color } = require("terminal-color");
const Steps = require("cli-step");

const crypto = require("crypto");

const { md5 } = require("request/lib/helpers");
const byteSize = require("byte-size");
const _ = require("lodash");
const { emojify } = require("node-emoji");
const {basename} = require("path");

process.removeAllListeners("warning");

const totalNumberOfSteps = 4;

const steps = new Steps(totalNumberOfSteps);
const step1 = steps.advance("Linting", "white_check_mark");

const step2 = steps.advance("Handshake", "handshake");
const step3 = steps.advance("Packaging your contract", "mag");
const step4 = steps.advance("Uploading your contract to SOUL Cloud", "mag");

const strings = {
  afterSetOverKey: "Great! You're ready to start working with your agent code. To create a contract file, enter\n" +
    "\n" +
    color.fg.green(`${basename(process.mainModule.filename)} wizard <file_name_without_ext>`),

  afterSetTargetHost: "A small step for a big cause has been successfully taken!\n" +
    "\n" +
    "Now you need to save your HTTP keys to upload your contracts to the cloud. You can get the keys on the website, in the \"Development\" section:\n" +
    "\n" +
    color.fg.green(`${basename(process.mainModule.filename)} setHttpOver <bot_id> <httpover_key>`),

  needAuthHttpOver: color.fg.yellow(
    "Before authorizing your agent, the command setHttpOver <botId> <secret>",
  )
}

let target = undefined;
let lint = {
  constraints: [
    "const $export",
    "const $worker",
    "async onBoot()",
    "async onMessage",
  ]
}

if (existsSync(".i2-target")) {
  target = readFileSync(".i2-target").toString("utf-8");
}

/**
 * Encrypts the provided data using the AES 256 algorithm.
 *
 * @param data - The data to be encrypted, either a string or a Buffer.
 * @param key - The encryption key used for the AES algorithm.
 * @returns The encrypted data in hexadecimal format.
 */
function encrypt(data, key) {
  const algorithm = "aes256";

  const cipher = crypto.createCipher(algorithm, key);

  return (
    cipher.update(data.toString("base64"), "utf8", "hex") + cipher.final("hex")
  );
}

function _getCallerFile() {
  var filename;

  var _pst = Error.prepareStackTrace
  Error.prepareStackTrace = function (err, stack) { return stack; };
  try {
    var err = new Error();
    var callerfile;
    var currentfile;

    currentfile = err.stack.shift().getFileName();

    while (err.stack.length) {
      callerfile = err.stack.shift().getFileName();

      if(currentfile !== callerfile) {
        filename = callerfile;
        break;
      }
    }
  } catch (err) {}
  Error.prepareStackTrace = _pst;

  return filename;
}

function lintSourceCode(data) {
  lint.constraints.map(e => {
    if (!data.includes(e)) {
      throw Error(`Required '${e}' construct not found`)
    }
  })
}

program.command("memoryUsage <botId>").action(async (botId) => {
  request.get(
    {
      url: target + "/contracts/allocated?botId=" + botId,
    },
    function (error, response, body) {
      console.log(JSON.parse(body).data);

      console.table(
        _.chain(JSON.parse(body).data.metric)
          .toPairs()
          .map((i) => [i[0], byteSize(i[1]).toString()])
          .fromPairs()
          .value(),
      );
    },
  );
});

program
  .command("setHttpOver <botId> <secret>")
  .action(async (botId, secret) => {
    mkdirSync("~/.i2-auth", { recursive: true });
    writeFileSync(`~/.i2-auth/.${botId}`, secret);

    console.log(strings.afterSetOverKey)
  });

program.command("setTargetHost <host>").action(async (host) => {
  writeFileSync(".i2-target", host);

  console.log(strings.afterSetTargetHost)
});

program.command("push <botId> <contract>").action(async (botId, contract) => {
  if (!existsSync(`~/.i2-auth/.${botId}`)) {
    return console.error(
      strings.needAuthHttpOver
    );
  }

  if (!existsSync(contract + ".js")) {
    return console.error(
      color.fg.yellow(
        `📁 The '${contract}.js' file was not found and cannot be uploaded`,
      ),
    );
  }

  const httpOver = readFileSync(`~/.i2-auth/.${botId}`);

  step1.start();

  const contractString = readFileSync(contract + ".js", "utf8");
  const message = crypto.randomBytes(64);

  try {
    lintSourceCode(contractString)
  } catch (e) {
    console.log("")
    console.error(
        color.fg.yellow(
            `👮 (${contract + ".js"}): ${e.message}`,
        ),
    );

    process.exit(0)
  }

  // const bytes = new TextEncoder().encode(contractString).length;
  // const percent = (bytes / 3.2e7) * 100;

  // console.log(byteSize(bytes) + " " + percent);

  step1.stop();
  step2.start();

  request.post(
    {
      url: target + "/contracts/pre-validate",
      json: {
        botId,
        p1: encrypt(message.toString("base64"), httpOver),
        p2: message,
      },
    },
    function (error, response, body) {
      step2.stop();

      if (body?.challenge === false) {
        return console.error(
          color.fg.red(
            "The handshake is not established, the connection is not secure. The secret (setHttpOver <botId> <secret>) was probably entered incorrectly",
          ),
        );
      }

      if (error) {
        throw error;
      }

      step3.start();

      request.post(
        {
          url: target + "/contracts/push",
          json: {
            botId,
            data: encrypt(contractString, httpOver),
            md5: md5(contractString),
          },
        },
        function (error, response, body) {
          step3.stop();

          console.log("");
          console.log(color.fg.green(emojify(":cloud: PUBLISH SUCCESSFULLY")));
          console.log(
            color.bright(
              "Your contract has been successfully published and deployed to the Soul virtual contract cloud",
            ),
          );
          console.log(
            color.bright(
              "· Please note that now all messages that users write to your agent will be processed by your contract",
            ),
          );
          console.log(
            color.bright(
              "· If you want to return to using the classic language preset, simply delete the contract.",
            ),
          );
          console.log(
            color.bright(
              "· Please also note that if your agent is posted on the marketplace and your contract frequently receives errors, your agent may be deactivated until you correct the errors",
            ),
          );
          console.log("");

          // const renderedError = pe.render(error);
          //
          // console.error(renderedError)
        },
      );
    },
  );
});

program.parse();
