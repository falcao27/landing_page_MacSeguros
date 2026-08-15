import { createServer } from "node:http";

import worker from "../dist/server/index.js";

const port = Number(process.env.PORT ?? 8787);
const hostname = process.env.HOST ?? "127.0.0.1";

const server = createServer(async (incomingRequest, outgoingResponse) => {
  try {
    const requestUrl = new URL(incomingRequest.url ?? "/", `http://${incomingRequest.headers.host ?? `${hostname}:${port}`}`);
    const request = new Request(requestUrl, {
      method: incomingRequest.method,
      headers: incomingRequest.headers,
    });
    const response = await worker.fetch(request, {}, {});

    outgoingResponse.writeHead(response.status, Object.fromEntries(response.headers));
    outgoingResponse.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    outgoingResponse.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    outgoingResponse.end("Internal server error");
  }
});

server.listen(port, hostname, () => {
  console.log(`MacSeguros disponível em http://${hostname}:${port}`);
});

