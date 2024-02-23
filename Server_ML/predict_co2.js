const { spawn } = require("child_process");

function makePrediction(make, vehicleType) {
  return new Promise((resolve, reject) => {
    try {
      const engineSize = getEngineSize(make, vehicleType);
      const mileage = getMileage(make, vehicleType);

      console.log(engineSize, mileage);

      if (engineSize === null || mileage === null) {
        reject(new Error("Invalid make or vehicle type"));
        return;
      }

      console.log(engineSize, mileage);
      // 调用 Python 脚本进行预测
      const pythonProcess = spawn("python", [
        "predict_model.py",
        engineSize,
        mileage,
        "final_joblib1.joblib",
      ]);

      //处理子进程的输出
      pythonProcess.stdout.on("data", (data) => {
        console.log("Received data from Python script:", data.toString());
        resolve(data.toString());
      });

      //处理子进程的错误输出
      // pythonProcess.stderr.on('data', data => {
      //   console.log('Received wrong data from Python script:', data.toString());
      //   reject(data.toString());
      // });
    } catch (error) {
      //错误处理
      reject(error);
    }
  });
}

function getEngineSize(make, vehicleType) {
  // Convert make and vehicleType to uppercase for case-insensitive comparisons
  const makeUpper = make;
  const vehicleTypeUpper = vehicleType;
  // Define engine size mapping based on make and vehicle type
  const engineSizeMapping = {
    Honda: { Hatchback: 2, Sedan: 2, Suv: 2 },
    Mazda: { Hatchback: 2, Sedan: 2.5, Suv: 2.5 },
    Mitsubishi: { Hatchback: 2, Sedan: 1.8, Suv: 1.8 },
    Hyundai: { Hatchback: 1.6, Sedan: 2, Suv: 2 },
    Kia: { Hatchback: 1.6, Sedan: 2, Suv: 2 },
    Toyota: { Hatchback: 1.6, Sedan: 2, Suv: 2 },
    Nissan: { Hatchback: 1.6, Sedan: 1.8, Suv: 1.8 },

    Audi: { Hatchback: 2, Sedan: 3, Suv: 3 },
    Mercedes_Benz: { Hatchback: 2, Sedan: 3, Suv: 3 },
    Porsche: { Hatchback: 0, Sedan: 0, Suv: 3.5 },
    Audi: { Hatchback: 2, Sedan: 3, Suv: 3 },
    Jeep: { Hatchback: 0, Sedan: 0, Suv: 2.4 },
    Volkswagen: { Hatchback: 2, Sedan: 2, Suv: 2 },
    Volvo: { Hatchback: 2, Sedan: 2, Suv: 2.1 },
    Others: { Hatchback: 1.6, Sedan: 2, Suv: 2 },
  };

  // Check if the make is in the mapping
  if (makeUpper in engineSizeMapping) {
    // Check if the vehicle type is in the mapping for the given make
    if (vehicleTypeUpper in engineSizeMapping[makeUpper]) {
      return engineSizeMapping[makeUpper][vehicleTypeUpper];
    }
  }

  // Default engine size if no match is found
  return null;
}

function getMileage(make, vehicleType) {
  // Convert make and vehicleType to uppercase for case-insensitive comparisons
  const makeUpper = make;
  const vehicleTypeUpper = vehicleType;

  // Define mileage mapping based on make and vehicle type
  const mileageMapping = {
    Honda: { Hatchback: 11, Sedan: 7.5, Suv: 11 },
    Mazda: { Hatchback: 8.6, Sedan: 8, Suv: 8.8 },
    Mitsubishi: { Hatchback: 9, Sedan: 0, Suv: 9.1 },
    Hyundai: { Hatchback: 10.1, Sedan: 8, Suv: 10 },
    Kia: { Hatchback: 10.5, Sedan: 8, Suv: 10.5 },
    Toyota: { Hatchback: 10.1, Sedan: 9, Suv: 10 },
    Nissan: { Hatchback: 11, Sedan: 8, Suv: 11 },

    Audi: { Hatchback: 10.3, Sedan: 10.5, Suv: 10 },
    Mercedes_Benz: { Hatchback: 11.7, Sedan: 10.5, Suv: 10 },
    Porsche: { Hatchback: 0, Sedan: 0, Suv: 12.3 },
    Jeep: { Hatchback: 0, Sedan: 0, Suv: 10 },
    Volkswagen: { Hatchback: 8.5, Sedan: 8.1, Suv: 10.7 },
    Volvo: { Hatchback: 9.4, Sedan: 9.4, Suv: 10 },
    Others: { Hatchback: 10, Sedan: 9, Suv: 9 },
  };

  // Check if the make is in the mapping
  if (makeUpper in mileageMapping) {
    // Check if the vehicle type is in the mapping for the given make
    if (vehicleTypeUpper in mileageMapping[makeUpper]) {
      return mileageMapping[makeUpper][vehicleTypeUpper];
    }
  }

  return null;
}

// 用这个替换原有的 ES6 export 语句
module.exports = { makePrediction };
