// saveService.js
import { API_URL } from "../../config/env";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRetryableStatus(status) {
  return status === 429 || (status >= 500 && status <= 599);
}

export class SaveError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "SaveError";
    this.status = status;
    this.data = data;
  }
}

export async function saveToServer(payload, options = {}) {
  const { signal, keepalive = false, maxRetries = 5 } = options;

  let attempt = 0;
  let lastErr = null;

  while (attempt <= maxRetries) {
    try {
      const res = await fetch("http://localhost:5000/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal,
        keepalive,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new SaveError(data?.message || "save failed", {
          status: res.status,
          data,
        });
      }
      return data;
    } catch (err) {
      if (err?.name === "AbortError") throw err;

      lastErr = err;
      const status = err?.status;
      const retryable = status == null || isRetryableStatus(status);

      if (!retryable || attempt === maxRetries) {
        throw lastErr;
      }

      const base = 400;
      const backoff = base * Math.pow(2, attempt);
      const jitter = Math.floor(Math.random() * 200);
      await sleep(backoff + jitter);

      attempt += 1;
    }
  }

  throw lastErr || new Error("save failed");
}
