import { useRef, useState, useEffect } from "react";
import Editor from "./components/Editor";
import FileTitle from "./components/FileTitle";
import SaveStatus from "./components/SaveStatus";
import useAutoSave from "./hooks/useAutoSave";
import Download from "./components/Download";

export default function App() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Saved");

  const versionRef = useRef(1);

  useAutoSave({
    fileId: "file-1",
    content,
    setStatus,
    versionRef,
  });

useEffect(() => {
  async function loadFile() {
    try {
      const res = await fetch(
        "https://auto-sync-file-editor-back.onrender.com/file/file-1"
      );
      const data = await res.json();

      setContent(data.content || "");
      versionRef.current = data.version || 1;
    } catch (err) {
      console.error("Failed to load file", err);
    }
  }

  loadFile();
}, []);

  useEffect(() => {
    const savedContent = localStorage.getItem("file-content");
    const savedTitle = localStorage.getItem("file-title");

    if (savedContent) {
      setContent(savedContent);
    }

    if (savedTitle) {
      setTitle(savedTitle);
    } else {
      setTitle("Untitled File");
    }
  }, []);

  useEffect(() => {
    if (title) {
      localStorage.setItem("file-title", title);
    }
  }, [title]);

  return (
    <div className="app-container">
      <h2>Optimized Auto-Sync File Editor</h2>

      <FileTitle title={title} setTitle={setTitle} />

      <Editor content={content} onChange={setContent} />

      <SaveStatus status={status} />

      <Download title={title} content={content} />
    </div>
  );
}
