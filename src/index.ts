import express from "express";
import { join } from "node:path";

import "dotenv/config";

const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(join(process.cwd(), "index.html"));
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log("Server started on port " + PORT);
});
