const express = require("express");
const fs = require("fs");
const app = express();
app.use(express.json());

app.post("/mark-complete", (req, res) => {
  const { id } = req.body;

  const resultData = JSON.parse(fs.readFileSync("public/result.json"));
  const completeData = JSON.existsSync("public/complete.json")
    ? JSON.parse(fs.readFileSync("public/complete.json"))
    : [];

  const itemIndex = resultData.findIndex((item) => item.id === id);
  if (itemIndex === -1) return res.status(404).json({ message: "Not found" });

  const [removedItem] = resultData.splice(itemIndex, 1);
  completeData.push(removedItem);

  fs.writeFileSync("public/result.json", JSON.stringify(resultData, null, 2));
  fs.writeFileSync("public/complete.json", JSON.stringify(completeData, null, 2));

  res.json({ message: "Marked complete" });
});

app.get("/complete", (req, res) => {
  const data = fs.existsSync("public/complete.json")
    ? JSON.parse(fs.readFileSync("public/complete.json"))
    : [];
  res.json(data);
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
