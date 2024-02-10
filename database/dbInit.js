import { createLinksTable, createUsersTable } from "./tableInit.js";

async function dbInit() {
  await createUsersTable();
  await createLinksTable();
}

export default dbInit;
