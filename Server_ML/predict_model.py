import sys
from joblib import load

def predict(engine_size, mileage, model_path):
    """
    Make a prediction using the specified model.
    :param engine_size: Engine size
    :param mileage: Mileage
    :param model_path: Path to the model file
    :return: Prediction result
    """
    try:
        # Load the model
        model = load(model_path)
    except Exception as e:
        # If the model fails to load, print the error and return None
        print(f"Model loading failed: {e}")
        return None

    try:
        # Make prediction based on engine size and mileage
        prediction = model.predict([[engine_size, mileage]])
        return prediction[0]
    except Exception as e:
        # If an error occurs during prediction, print the error and return None
        print(f"Prediction failed: {e}")
        return None

if __name__ == "__main__":
    # Check if the correct number of arguments is provided
    if len(sys.argv) != 4:
        print("Incorrect number of arguments. Engine size, mileage, and model path are required.")
        sys.exit(1)

    try:
        # Attempt to convert arguments to appropriate data types
        engine_size = float(sys.argv[1])
        mileage = float(sys.argv[2])
    except ValueError as e:
        # If conversion fails, print the error and exit
        print(f"Argument conversion error: {e}")
        sys.exit(1)

    # Get the model file path
    model_path = sys.argv[3]

    # Perform the prediction
    result = predict(engine_size, mileage, model_path)

    # Print the prediction result or error message
    if result is not None:
        # Process the result: divide by 1000 and round to three decimal places
        processed_result = round(result / 1000, 3)
        print(processed_result)
        # print(predict(2,11,model_path))
    else:
        print("An error occurred during prediction")
