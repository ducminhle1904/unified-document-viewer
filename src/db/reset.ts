import { loadConfig } from "../config/env.js";
import { openDatabase } from "./sqlite.js";

const config = loadConfig();
const db = openDatabase(config.DATABASE_URL);
db.exec("DELETE FROM search_audits;");
db.close();
console.log("Search audit records cleared.");
