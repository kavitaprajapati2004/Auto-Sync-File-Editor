import { useEffect, useRef } from "react";
import { saveToServer } from "../services/saveService";

export default function useAutoSave({
  fileId,
  content,
  setStatus,
  versionRef,
}) {
  const debounceRef = useRef(null);
  const isSaving = useRef(false);

  const contentRef = useRef(content);
  const lastSavedRef = useRef("");

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const save = async (force = false) => {
    if (isSaving.current) return;

    const latestContent = contentRef.current;

    if (!force && latestContent === lastSavedRef.current) return;

    isSaving.current = true;
    setStatus("Saving...");

    try {
      const res = await saveToServer({
        fileId,
        content: latestContent,
        version: versionRef.current,
        timestamp: Date.now(),
      });

      versionRef.current = res.version ?? versionRef.current;
      lastSavedRef.current = latestContent;

      localStorage.setItem("file-content", latestContent);
      setStatus("Saved");
    } catch (err) {
      console.error(err);
      setStatus("Save failed");
    } finally {
      isSaving.current = false;
    }
  };

  useEffect(() => {
    setStatus("Unsaved changes");

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      save(false);
    }, 3000);

    return () => clearTimeout(debounceRef.current);
  }, [content]);


  useEffect(() => {
    const id = setInterval(() => {
      save(true); // 🔥 force save
    }, 30000);

    return () => clearInterval(id);
  }, []);


  useEffect(() => {
    const handler = () => save(true);

    window.addEventListener("beforeunload", handler);
    window.addEventListener("pagehide", handler);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        handler();
      }
    });

    return () => {
      window.removeEventListener("beforeunload", handler);
      window.removeEventListener("pagehide", handler);
    };
  }, []);
}
