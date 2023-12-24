const ftp = require("basic-ftp");
const { statSync } = require("fs");
const cliProgress = require("cli-progress");

example();

const sourceFile = "./build.zip";

// create a new progress bar instance and use shades_classic theme
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

async function example() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host: "170.130.55.120",
      user: "vftp",
      password: "DveROaHwzoWLSyQKkdZt48G12it2MaKH",
      secure: false,
    });

    bar.start();

    client.trackProgress((info) => {
      const stats = statSync(sourceFile);

      const fileSizeInBytes = stats.size;

      bar.setTotal(fileSizeInBytes);
      bar.update(info.bytes);
    });

    await client.uploadFrom(sourceFile, "/contracter.zip");

    bar.stop();
  } catch (err) {
    console.log(err);
  }

  client.close();
}
