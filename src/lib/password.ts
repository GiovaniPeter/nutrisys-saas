import crypto from "node:crypto";

const ITERATIONS = 210_000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await pbkdf2(password, salt);
  return `pbkdf2:${ITERATIONS}:${salt}:${derivedKey}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, iterationsRaw, salt, originalKey] = storedHash.split(":");

  if (algorithm !== "pbkdf2" || !iterationsRaw || !salt || !originalKey) {
    return false;
  }

  const derivedKey = await pbkdf2(password, salt, Number(iterationsRaw));
  return crypto.timingSafeEqual(Buffer.from(originalKey, "hex"), Buffer.from(derivedKey, "hex"));
}

function pbkdf2(password: string, salt: string, iterations = ITERATIONS): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, KEY_LENGTH, DIGEST, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey.toString("hex"));
    });
  });
}
