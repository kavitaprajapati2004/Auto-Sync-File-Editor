import { Fragment, useRef, useState, useEffect } from "react";
import Editor from "./components/Editor";
import FileTitle from "./components/FileTitle";
import SaveStatus from "./components/SaveStatus";
import useAutoSave from "./hooks/useAutoSave";

export default function App() {
  const [title, setTitle] = useState("Untitled File");
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
    const saved = localStorage.getItem("file-content");
    if (saved) setContent(saved);
  }, []);

  return (
    <>
      <div className="app-container">
        <h2>Optimized Auto-Sync File Editor</h2>

        <FileTitle title={title} setTitle={setTitle} />

        <Editor content={content} onChange={setContent} />

        <SaveStatus status={status} />
      </div>
    </>
  );
}
