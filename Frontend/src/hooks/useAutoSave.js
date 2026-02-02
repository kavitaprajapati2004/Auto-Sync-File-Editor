// useAutoSave.js

import { useEffect, useRef } from "react";
import { saveToServer, SaveError } from "../services/saveService";

function hashString(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

export default function useAutoSave({
  fileId,
  content,
  setStatus,
  versionRef,
}) {
  const debounceRef = useRef(null);

  const contentRef = useRef(content);
  const lastSavedHashRef = useRef(hashString(""));
  const lastSentHashRef = useRef(null);

  const inFlightRef = useRef(false);
  const pendingRef = useRef(false);

  const abortRef = useRef(null);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  async function doSave({ force, reason }) {
    const latestContent = contentRef.current;
    const latestHash = hashString(latestContent);

    if (!force && latestHash === lastSavedHashRef.current) return;

    if (
      inFlightRef.current &&
      lastSentHashRef.current === latestHash &&
      !force
    ) {
      return;
    }

    if (inFlightRef.current) {
      pendingRef.current = true; // queue latest content
      return;
    }

    inFlightRef.current = true;
    lastSentHashRef.current = latestHash;

    abortRef.current = new AbortController();

    setStatus("Saving...");

    const payload = {
      fileId,
      content: latestContent,
      version: versionRef.current,
      timestamp: Date.now(),
    };

    try {
      const res = await saveToServer(payload, {
        signal: abortRef.current.signal,
        keepalive: reason === "lifecycle",
        maxRetries: 5,
      });

      versionRef.current = res.version ?? versionRef.current;
      lastSavedHashRef.current = latestHash;

      localStorage.setItem("file-content", latestContent);
      setStatus("Saved");
    } catch (err) {
      if (err?.name === "AbortError") {
        return;
      }

      if (err instanceof SaveError && err.status === 409) {
        const serverVersion = err.data?.serverVersion;
        if (typeof serverVersion === "number") {
          versionRef.current = serverVersion;

          const retryPayload = {
            fileId,
            content: contentRef.current,
            version: versionRef.current,
            timestamp: Date.now(),
          };

          const retryRes = await saveToServer(retryPayload, { maxRetries: 2 });
          versionRef.current = retryRes.version ?? versionRef.current;
          lastSavedHashRef.current = hashString(retryPayload.content);
          localStorage.setItem("file-content", retryPayload.content);
          setStatus("Saved");
          return;
        }
      }
      console.error(err);
      setStatus("Save failed");
    } finally {
      inFlightRef.current = false;
      abortRef.current = null;

      if (pendingRef.current) {
        pendingRef.current = false;
        doSave({ force: false, reason: "queued" });
      }
    }
  }

  useEffect(() => {
    setStatus("Unsaved changes");

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSave({ force: false, reason: "debounce" });
    }, 3000);

    return () => clearTimeout(debounceRef.current);
  }, [content]);

  useEffect(() => {
    const id = setInterval(() => {
      doSave({ force: true, reason: "interval" });
    }, 30000);
    return () => clearInterval(id);
  }, [fileId, versionRef, setStatus]);

  useEffect(() => {
    const handler = () => {
      doSave({ force: true, reason: "lifecycle" });
    };

    window.addEventListener("beforeunload", handler);
    window.addEventListener("pagehide", handler);

    const visHandler = () => {
      if (document.visibilityState === "hidden") handler();
    };
    document.addEventListener("visibilitychange", visHandler);

    return () => {
      window.removeEventListener("beforeunload", handler);
      window.removeEventListener("pagehide", handler);
      document.removeEventListener("visibilitychange", visHandler);
    };
  }, []);
}
