import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory storage
let fileStore = {
  fileId: "file-1",
  content: "",
  version: 1,
};

// Random failure (20%)
function randomFail() {
  return Math.random() < 0.2;
}

// POST /save
app.post("/save", (req, res) => {
  try {
    if (randomFail()) {
      return res.status(500).json({ message: "Random server failure" });
    }

    const { fileId, content, version, timestamp } = req.body;

    if (!fileId || content === undefined || version === undefined) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    // Version-based sync
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

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
