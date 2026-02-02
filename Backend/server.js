import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let fileStore = {
  fileId: "file-1",
  content: "",
  version: 1,
};

function randomFail() {
  // return Math.random() < 0.2;
  return false;
}

app.post("/save", (req, res) => {
  try {
    if (randomFail()) {
      return res.status(500).json({ message: "Random server failure" });
    }

    const { fileId, content, version, timestamp } = req.body;

    if (!fileId || content === undefined || version === undefined) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    if (version !== fileStore.version) {
      return res.status(409).json({
        message: "Version conflict",
        serverVersion: fileStore.version,
      });
    }

    fileStore.content = content;
    fileStore.version += 1;
    fileStore.updatedAt = timestamp;

    console.log("Saved:", fileStore);

    return res.json({
      message: "Saved successfully",
      version: fileStore.version,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/file/:fileId", (req, res) => {
  const { fileId } = req.params;

  if (fileId !== fileStore.fileId) {
    return res.status(404).json({ message: "File not found" });
  }

  return res.json({
    fileId: fileStore.fileId,
    content: fileStore.content,
    version: fileStore.version,
    updatedAt: fileStore.updatedAt ?? null,
  });
});


app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
