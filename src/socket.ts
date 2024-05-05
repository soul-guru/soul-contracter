import ws from "ws"
import path from "node:path"
import fs from "node:fs"
import {CommentJSONValue, parse} from "comment-json";
import logger from "./logger";

const PATH_APP_JSON: string = path.normalize(process.cwd() + "/app.json");

const config = parse(fs.readFileSync(PATH_APP_JSON).toString());

let webSocket: ws.Server

export default function socket() {
    logger.info("Starting socket server")

    const port = parseInt(config["wegSocket"]["port"])
    const host = String(config["wegSocket"]["host"] || '0.0.0.0')

    webSocket = new ws.Server({
        port,
        host
    })

    logger.info(`Socket server started on ${host}:${port}`)

    webSocket.on('connection', function connection(ws) {
        logger.info(`[WEBSOCKET CHANNEL] Client connected: ${ws?.upgradeReq?.connection?.remoteAddress || "localhost??"}`)
        ws.send('handshake:hello')
    })

    webSocket.on('close', function close() {
        logger.info(`[WEBSOCKET CHANNEL] Client disconnected`)
    })

    webSocket.on('error', function error(err) {
        logger.error(`[WEBSOCKET CHANNEL] Error: ${err}`)
    })
}

export function broadcast(data: any) {
    webSocket.clients.forEach(function each(client) {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(data))
        }
    })
}