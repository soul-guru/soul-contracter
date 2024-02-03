#! /usr/bin/env node

const  { program } = require("commander");
const request = require("request");
const prompt = require("prompt-sync")();

const crypto = require("crypto");

const { md5 } = require("request/lib/helpers");

const _ = require("lodash")


const fs = require("node:fs");
const path = require("node:path");

const rollup = require('rollup')
const typescript = require("@rollup/plugin-typescript");
const {nodeResolve} = require("@rollup/plugin-node-resolve");
require("@rollup/plugin-commonjs");
require('@rollup/plugin-terser');

const cleanup = require('rollup-plugin-cleanup');
require("rollup-plugin-cjs-es");

const {parse} = require('comment-json')

process.removeAllListeners("warning");

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

class Constructor {
  static comment(description, documentationUrl = '') {
    return "/**\n" +
      ` * @description ${description}\n` +
      ` * @see ${documentationUrl}\n` +
      " * @since 1.0.0\n" +
      " */\n\n"
  }
}

class Built {
  static VERSION = 1.0
  static VM_CORE = 1.0
}

class Informator {
  static log(level, msg) {
    console.log(`[${(new Date()).toLocaleString()}] <${level.toUpperCase()}> (42): ${msg}`)
  }

  static error(msg) {
    console.log(`🛑 [${(new Date()).toLocaleString()}] <CRITICAL ERROR> (42): ${msg}`)
  }
}

const DEFAULT_PROJECT_FILE_CONTENT = {
  name: 'untitled',
  remote: 'https://api.souls.guru',
  createdAt: (new Date()).toLocaleString(),
  version: Built.VERSION,
  include: [
    "src/main.ts"
  ],
  vmCore: {
    compatible: Built.VM_CORE,
    ram: 32
  },
  versionControl: {
    branch: 'main'
  },
  rollup: {
    writer: {
      file: '.built.js',
      format: 'module',
      strict: true,
      minifyInternalExports: false,
    }
  }
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
    cipher.update(
      data.toString("base64"),
      "utf8", "hex") + cipher.final("hex")
  );
}

class Flow {
  /**
   * Authenticate a project by setting or updating authorization settings in the project's JSON file.
   *
   * @param {boolean} [tryForce=false] - If true, allows changing login settings even if the project is already authorized.
   * @param options
   * @returns {void}
   */
  static authProject(tryForce = false, options = {}) {
    try {
      const jsonPath = path.join(options.cwd || process.cwd(), 'project.json');

      // Check if project.json file exists
      if (!fs.existsSync(jsonPath)) {
        Informator.error("project.json file not found. Please make sure the file exists in the current directory.");
        process.exit(1); // Exit the program with an error code
      }

      // Read and parse project.json file
      const json = parse(fs.readFileSync(jsonPath).toString());

      if (tryForce && json['auth']) {
        // Check if the project is already authorized and ask for confirmation to change login settings
        const confirmation = prompt("This project has already been authorized. Are you sure you want to change your login settings? (enter: yes): ");
        if (confirmation !== 'yes') {
          Informator.error("Authorization change cancelled.");
          process.exit(0); // Exit the program
        } else {
          delete json['auth']; // Remove existing authorization
        }
      }

      if (!json['auth']) {
        // If no authorization found, prompt for BotID and HttpOverKey
        json['auth'] = {
          'botId': prompt("🪪 BotID: "),
          'httpOverKey': prompt("🔑 HttpOverKey: "),
        }

        // Write the updated JSON to the project file
        fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
        Informator.log('success', "Authorization settings saved successfully.");
      }
    } catch (error) {
      Informator.error("An error occurred:", error.message);
      process.exit(1); // Exit the program with an error code
    }
  }

  /**
   * Build the project by bundling and optimizing the source files.
   *
   * @param {function} [onBuilt=null] - Optional callback function to execute after the project is built.
   * @param options
   * @returns {void}
   */
  static buildProject(onBuilt = null, options) {
    Informator.log('debug', '🔨 Build ...')

    const jsonPath = path.join(options.cwd || process.cwd(), 'project.json');

    if (!fs.existsSync(jsonPath)) {
      Informator.error("project.json file not found. Please make sure the file exists in the current directory.");
      process.exit(1); // Exit the program with an error code
    }

    const json = parse(fs.readFileSync(jsonPath).toString());

    if (!_.get(json, 'rollup.writer')) {
      Informator.error("The 'rollup.writer' property is not found in the project.json file. Please make sure the file exists in the current directory and contains the necessary configuration.");
      process.exit(1); // Exit the program with an error code
    }

    if (!_.get(json, 'include')) {
      Informator.error("The 'include' property is not found in the project.json file. Please make sure the file exists in the current directory and contains the necessary configuration.");
      process.exit(1); // Exit the program with an error code
    }

    rollup.rollup({
      input: _.get(json, 'include', []).map(i => path.normalize(path.join(options.cwd || process.cwd(), i))),
      plugins: [
        typescript({
          compilerOptions: {
            target: 'es2018'
          }
        }),
        nodeResolve(),
        // obfuscator(),
        cleanup({
          compactComments: true,
          extensions: ['ts', 'js']
        }),
      ],
      treeshake: false,
      external: ['$foundation', 'stdout'],
    }).then(roll => {
      roll
        .write({
          ..._.get(json, 'rollup.writer'),
          file: path.join(options.cwd, _.get(json, 'rollup.writer.file'))
        })
        .then(built => {
          Informator.log('debug', `🔨 Done!`)

          for (const builtElement of built.output) {
            builtElement.moduleIds.map(i => {
              Informator.log("debug", `📦 Packaged '${path.basename(i)}'`)
            })

            const mb = Buffer.byteLength(builtElement.code, 'utf8')

            Informator.log("debug", `📟 Final size ${formatBytes(mb, 4)}`)
          }

          if (onBuilt) {
            onBuilt()
          }
        })
    })
  }

  /**
   * Validate the authentication properties in the project.json file.
   * @param {Function} onSuccess - Callback function to be executed on successful validation.
   * @param {object} options - Additional options for the validation.
   */
  static validateAuthProps(onSuccess, options) {
    const jsonPath = path.join(options.cwd || process.cwd(), 'project.json');

    // Check if project.json file exists
    if (!fs.existsSync(jsonPath)) {
      Informator.error("project.json file not found. Please make sure the file exists in the current directory.");
      process.exit(1); // Exit the program with an error code
    }

    const json = parse(fs.readFileSync(jsonPath).toString());

    // Check if 'auth' property exists in project.json
    if (!json['auth']) {
      Informator.error("Auth not found for projects");
      process.exit(1);
    }

    const message = crypto.randomBytes(64);

    request.post(
      {
        url: json['remote'] + "/contracts/pre-validate",
        json: {
          botId: json.auth.botId,
          p1: encrypt(message.toString("base64"), json.auth.httpOverKey),
          p2: message,
        },
      },
      function (error, response, body) {
        if (body && body.hasOwnProperty('challenge') && body['challenge'] === true) {
          onSuccess();
        } else if (body && body.hasOwnProperty('challenge') && body['challenge'] === false) {
          Informator.error('HttpOver key entered incorrectly, security challenge failed');
          Informator.error(JSON.stringify(body, null, 2));

          process.exit(1);
        } else {
          Informator.error('Is there something wrong. Unable to pass security check with remote host');
          Informator.error(JSON.stringify(body, null, 2));

          process.exit(1);
        }
      }
    );
  }

  /**
   * Upload the source code to the remote host.
   * @param {Function} onUploaded - Callback function to be executed on successful upload.
   * @param {object} options - Additional options for the upload.
   */
  static uploadSourceCode(onUploaded = null, options) {
    const jsonPath = path.join(options.cwd || process.cwd(), 'project.json');

    // Check if project.json file exists
    if (!fs.existsSync(jsonPath)) {
      Informator.error("project.json file not found. Please make sure the file exists in the current directory.");
      process.exit(1); // Exit the program with an error code
    }

    const json = parse(fs.readFileSync(jsonPath).toString());

    // Check if 'auth' property exists in project.json
    if (!json['auth']) {
      Informator.error("Auth not found for projects");
      process.exit(1);
    }

    const contractString = String(fs.readFileSync(path.join(options.cwd || process.cwd(), '.built.js')));

    request.post(
      {
        url: json['remote'] + "/contracts/push",
        json: {
          botId: json.auth.botId,
          data: encrypt(contractString, json.auth.httpOverKey),
          md5: md5(contractString),
        },
      },
      function (error) {
        if (error) {
          Informator.error("Upload failed");
          process.exit(1);
        }

        if (onUploaded) {
          onUploaded();
        }
      }
    );
  }
}

program
  .command("init <pathName>")
  .description("Create a project for the new virtual agent")
  .version('1.0.0')
  .action((pathName) => {
    try {
      Informator.log('info', 'Initializing the project creation process...');

      if (fs.existsSync(pathName)) {
        Informator.error('The project cannot be created because the folder already exists');
        process.exit(1);
      }

      Informator.log('info', 'Creating the project folder...');

      if (!fs.mkdirSync(pathName, {
        recursive: true,
        mode: 0o777
      })) {
        Informator.error('The folder for the project was not created');
        process.exit(1);
      }

      Informator.log('info', 'Setting necessary permissions...');

      fs.accessSync(pathName, fs.constants.W_OK);

      Informator.log('info', 'Creating project.json file...');

      fs.writeFileSync(
        path.join(pathName, "project.json"),
        JSON.stringify(DEFAULT_PROJECT_FILE_CONTENT, null, 2)
      );

      Informator.log('info', 'Creating src folder...');

      fs.mkdirSync(path.join(pathName, "src"));

      Informator.log('info', 'Creating main.ts file...');

      fs.writeFileSync(
        path.join(pathName, "src", "main.ts"),
        'import {$schedule} from "./schedule";\n' +
        'import {$worker} from "./worker";\n' +
        'import {$use} from "./use";\n' +
        '\n' +
        'const $export = {\n' +
        '\t$schedule,\n' +
        '\t$worker,\n' +
        '}\n'
      );

      Informator.log('info', 'Creating schedule.ts file...');

      fs.writeFileSync(
        path.join(pathName, "src", "schedule.ts"),
        Constructor.comment("The schedule functions will allow you to use the task scheduler in the system.") +
        'export const $schedule = {\n' +
        '\n' +
        '}'
      );

      Informator.log('info', 'Creating worker.ts file...');

      fs.writeFileSync(
        path.join(pathName, "src", "worker.ts"),
        Constructor.comment("Workers are automatically executed functions. Use worker features to make your agent more alive") +
        'export const $worker = {\n' +
        '\n' +
        '}'
      );

      Informator.log('info', 'Creating use.ts file...');

      fs.writeFileSync(
        path.join(pathName, "src", "use.ts"),
        Constructor.comment("Use $use to inherit the same logic in different parts of the code") +
        'export const $use = {\n' +
        '\n' +
        '}'
      );

      Informator.log('success', 'Project created successfully.');
    } catch (error) {
      Informator.error("An error occurred:", error.message);
      process.exit(1);
    }
  });

program
  .command('push')
  .description("Using the keys issued on the site, authorize the project to work with it")
  .option("-c, --cwd <VALUE>")
  .version('1.0.0')
  .action((options) => {
    Flow.buildProject(() => {
      Flow.validateAuthProps(() => {
        console.log(2)
        Flow.uploadSourceCode(() => {
          console.log(3)
        }, options)
      }, options)
    }, options)
  })


program
  .command('auth')
  .option("-c, --cwd <VALUE>")
  .description("Using the keys issued on the site, authorize the project to work with it")
  .version('1.0.0')
  .action((options) => {
    if (options.cwd) {
      Informator.log("info", options.cwd)
    }

    try {
      Informator.log('info', 'Starting project authorization...');

      Flow.authProject(true, {cwd: options.cwd});

      Informator.log('success', 'Project authorized successfully.');
    } catch (error) {
      Informator.error("An error occurred:", error.message);
      process.exit(1);
    }
  });

program
  .command('build')
  .option("-c, --cwd <VALUE>")
  .description("Build project")
  .version('1.0.0')
  .action((options) => {
    if (options.cwd) {
      Informator.log("info", options.cwd)
    }

    Flow.buildProject(function () {

    }, {
      cwd: options.cwd
    })
  })

program
  .command('live')
  .description("Build project")
  .option("-c, --cwd <VALUE>")
  .version('1.0.0')
  .action((options) => {
    Flow.validateAuthProps(() => {
      fs.watch(path.join(process.cwd(), "src"), {
        recursive: true
      }, (eventType, filename) => {
        if (eventType === 'change' && filename.endsWith('.ts')) {
          Informator.log('info', '[⚪ ...] Pushing...')

          Flow.buildProject(() => {
            Flow.uploadSourceCode(() => {
              Informator.log('info', '[🔴 LIVE] ')
            })
          })
        }
      })
    }, options)
  })

program.parse();
