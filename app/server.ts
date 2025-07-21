// server.ts
import { createServer } from "http";
import next from "next";
import { initSocket } from "@/lib/socket";


const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handler(req, res);
  });

  initSocket(server); 

  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
  });
});
