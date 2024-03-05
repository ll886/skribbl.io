import { db } from "./server.js";

let tokenStorage: { [key: string]: number } = {};

function getUserIdByToken(token: string) {
  return tokenStorage[token];
}

async function getUserByToken(token: string) {
  const userId = getUserIdByToken(token);
  if (userId !== undefined) {
    return await db.get("SELECT * FROM users WHERE id = ?", [userId]);
  } else {
    return undefined
  }
}

export { tokenStorage, getUserByToken };
