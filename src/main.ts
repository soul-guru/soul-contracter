import winston from "winston";
import * as http from "http";
import VM from "../vm/vm";
import { Contracts } from "./models/contracts";
import { connection } from "./mongo";
import _ from "lodash";
import EventEmitter from "node:events";
import logger from "./logger";
import { bigint } from "zod";
import { ClickHouse } from "./clickhouse";
import moment from "moment";

const express = require("express");
const app = express();
const crypto = require("crypto");
const bodyParser = require("body-parser");
const { md5 } = require("request/lib/helpers");

app.set("port", process.env.PORT || 911);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

void connection;

ClickHouse.bootstrap().then(() => {
  Contracts.getAll().then((out) => {
    out.forEach((agent) => {
      vme.emit("up", agent.botId);
    });
  });
});

class VMEmitter extends EventEmitter {}

const vme = new VMEmitter();

vme.on("up", async (botId) => {
  const contract = await Contracts.getSource(botId);

  if (contract != null) {
    const actual = contract.branches.find((i) => i.name == contract.mainBranch);

    if (actual) {
      const virtualMachine = new VM(contract.id, contract.botId, 32);

      virtualMachine
        .compile(actual.source)
        .then(() => {
          logger.info(`vm '${contract.botId}' now up`);

          virtualMachine.bootstrap();
          virtualMachine.emitter.on("log", function (...args) {
            ClickHouse.insertContractStdout(
              args.join(" "),
              contract.botId,
              contract.id,
            );
          });

          virtualMachine.signal("boot");

          vm[contract.botId] = virtualMachine;
        })
        .catch((error: Error) => {
          ClickHouse.insertContractError(
            error,
            contract.botId,
            contract.id,
            "UP",
          );
        });
    }
  }
});

const vm: { [key: string]: VM } = {};

vme.on("signal", async (botId, signalId, signalProps, contractId) => {
  _.get(vm, botId, null)
    ?.signal(signalId, signalProps)
    ?.then(() => {})
    ?.catch((error) => {
      ClickHouse.insertContractError(error, botId, contractId, "UP");
    });
});

ClickHouse.selectContractErrors("").then(async (i) => {
  console.log(await i.json());
});

app.get("/contracts/runtime/stdout", async function (req, res) {
  if (req.query.owner == null) {
    return;
  }

  const contracts = await Contracts.getAllByOwner(req.query.owner);

  let stdout = [];

  for (const contract of contracts) {
    const out = await ClickHouse.selectContractStdout(contract.id);
    const data = await out.json();

    stdout.push(data);
  }

  res.json({
    data: stdout,
  });
});

app.get("/contracts/runtime/errors", async function (req, res) {
  if (req.query.owner == null) {
    return;
  }

  const contracts = await Contracts.getAllByOwner(req.query.owner);

  let errors = [];

  for (const contract of contracts) {
    const out = await ClickHouse.selectContractErrors(contract.id);
    const data = await out.json();

    errors.push(data);
  }

  res.json({
    data: errors,
  });
});

app.get("/contracts/all", async function (req, res) {
  if (req.query.owner == null) {
    return;
  }

  const contracts = await Contracts.getAllByOwner(req.query.owner);

  const results = contracts.map((contract) => ({
    id: contract.id,
    botId: contract.botId,
    mainBranch: contract.mainBranch,
  }));

  res.json({
    data: results,
  });
});

app.get("/contracts/allocated", async function (req, res) {
  const metric = await vm[req.query.botId].metric();
  const workTimeInSeconds: BigInt = await vm[req.query.botId].workTime();

  res.header("Content-Type", "application/json").json({
    data: { metric, workTimeInSeconds: workTimeInSeconds.toString() },
  });
});

app.post("/contracts/create", async function (req, res) {
  const botId = req.body.botId || null;
  const owner = req.body.owner || null;

  if (!botId) {
    return res.status(400).json({
      data: "botId is empty",
    });
  }

  if ((await Contracts.count(botId)) > 0) {
    return res.status(400).json({
      data: "There can be only 1 contract per agent. Please delete the existing contract to create a new one.",
    });
  }

  res.json({
    data: await Contracts.create(botId, owner),
  });
});

app.post("/contracts/signal", async function (req, res) {
  const signalId = req.body.signalId || "pass";
  const signalProps = req.body.signalProps || {};
  const botId = req.body.botId || null;

  if (!["message"].includes(signalId)) {
    return res.status(400).json({
      data: "Unauthorized signal sent",
    });
  }

  Contracts.getSource(botId).then((contract) => {
    vme.emit("signal", botId, signalId, signalProps, contract.id);

    res.json({
      data: "Signal emitted",
    });
  });
});

app.post("/contracts/push", async function (req, res) {
  const decrypted = await Contracts.decryptInputForContract(
    req.body.botId,
    req.body.data,
  );

  if (md5(decrypted) == req.body.md5) {
    await Contracts.pushContractSource("main", decrypted, req.body.botId);

    if (typeof vm[req.body.botId] != "undefined") {
      await vm[req.body.botId].stop();
    }

    vme.emit("up", req.body.botId);

    return res.json({
      validMd5: md5(decrypted) == req.body.md5,
      vmRestarted: 0,
    });
  }
});

app.post("/contracts/pre-validate", async function (req, res) {
  const botId = req.body.botId;

  const buffer = new Buffer(req.body.p2);
  const decrypted = await Contracts.decryptInputForContract(botId, req.body.p1);

  res.json({
    challenge: decrypted == buffer.toString("base64"),
  });
});

http.createServer(app).listen(app.get("port"), function () {
  console.log("Express server listening on port " + app.get("port"));
});
