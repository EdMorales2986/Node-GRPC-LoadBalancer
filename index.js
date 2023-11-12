import express from "express";
import os from "os";
import cluster from "cluster";

import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cpuCount = os.cpus().length;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (cluster.isPrimary) {
  console.log(`Primary is running`);

  for (let i = 0; i < 3; i++) {
    cluster.fork();
  }

  // cluster.on("online", (worker) => {
  //   console.log(`worker ${worker.process.pid} is online`);
  // });

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${cluster.worker.id} died`);
    cluster.fork();
  });
} else if (cluster.isWorker) {
  console.log(`Worker ${cluster.worker.id} started`);

  app.get("/", (req, res) => {
    res.send(`Response from worker ${cluster.worker.id}`);
  });

  app.listen(port);
}
