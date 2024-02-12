import {
  createLinksTable,
  createRedirectTable,
  createUsersTable,
} from "./tableInit.js";

export default async function dbInit() {
  await createUsersTable();
  await createLinksTable();
  await createRedirectTable();
}
