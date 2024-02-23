const express = require("express");
const { makePrediction } = require("./predict_co2"); // 确保路径正确
const app = express();

app.use(express.json());

app.post("/predict", async (req, res) => {
  try {
    console.log('Received request:', req.query); // 打印接收到的查询参数
    // 使用 req.query来获取查询参数
    const { make, vehicleType } = req.query;
    const prediction = await makePrediction(make, vehicleType);
    console.log('Sending prediction:', prediction); // 打印发送的预测值
    res.json({ prediction });
  } catch (error) {
    console.error('Error in /predict endpoint:', error); // 打印错误信息
    res.status(500).send(error.message);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
