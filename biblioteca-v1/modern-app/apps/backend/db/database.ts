import { DatabaseSync } from "node:sqlite";
import path from "path";

const DB_PATH = path.join(__dirname, "database.db");

const db = new DatabaseSync(DB_PATH);

// Performance & integrity pragmas
db.exec("PRAGMA foreign_keys = ON");
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA synchronous = NORMAL");
db.exec("PRAGMA cache_size = -64000");

export default db;
