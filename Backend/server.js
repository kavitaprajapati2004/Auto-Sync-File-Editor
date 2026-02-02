import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory store (resets on Render restart – expected)
let fileStore = {
  fileId: "file-1",
  content: "",
  version: 1,
  updatedAt: null,
};

// SAVE FILE
app.post("/save", (req, res) => {
  try {
    const { fileId, content, version, timestamp } = req.body;

    if (!fileId || content === undefined || version === undefined) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    // 🔥 FIX: auto-resolve version conflict
    if (version !== fileStore.version) {
      fileStore.content = content;
      fileStore.version += 1;
      fileStore.updatedAt = timestamp;

      return res.json({
        message: "Saved after resolving conflict",
        version: fileStore.version,
      });
    }

    fileStore.content = content;
    fileStore.version += 1;
    fileStore.updatedAt = timestamp;

    return res.json({
      message: "Saved successfully",
      version: fileStore.version,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// LOAD FILE (IMPORTANT)
app.get("/file/:fileId", (req, res) => {
  const { fileId } = req.params;

  if (fileId !== fileStore.fileId) {
    return res.status(404).json({ message: "File not found" });
  }

  return res.json({
    fileId: fileStore.fileId,
    content: fileStore.content,
    version: fileStore.version,
    updatedAt: fileStore.updatedAt,
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
