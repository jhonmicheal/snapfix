const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

function diagnoseIssue(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes("spring")) return { issue: "Broken Torsion Spring", cost: "$120–$180" };
  if (lower.includes("track")) return { issue: "Off-Track Door", cost: "$100–$150" };
  if (lower.includes("cable")) return { issue: "Damaged Cable", cost: "$90–$130" };
  return { issue: "General Inspection Needed", cost: "$70–$100" };
}

app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const diagnosis = diagnoseIssue(req.file.originalname);
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  res.json({
    filename: req.file.originalname,
    url: fileUrl,
    ...diagnosis,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});