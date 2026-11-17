import { useState } from "react";

import "./calculate.scss";

export default function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("");

  const calculateBmi = (e) => {
    e.preventDefault();

    if (!height || !weight) {
      setColor("text-danger");
      setMessage("Fill in the Height and Weight");

      setTimeout(() => setMessage(""), 114000);

      return;
    }

    const cm = height / 100;
    const kg = weight;
    const bmi = Math.round(kg / (cm * cm));

    if (bmi < 18.5) {
      setColor("text-primary");
      setMessage(`Your BMI is ${bmi} and you are skinny`);
    } else if (bmi < 25) {
      setColor("text-success");
      setMessage(`Your BMI is ${bmi} and you are healthy`);
    } else {
      setColor("text-warning");
      setMessage(`Your BMI is ${bmi} and you are overweight`);
    }

    setHeight("");
    setWeight("");

    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <form
      onSubmit={calculateBmi}
      className="calculator-bmi-wrapper"
    >
      <div className="calculate-header">
        <h3
          className="calculate-title"
          data-title="BMI Calculator"
        >
          Calculate your BMI
        </h3>

        <p className="calculate-description">
          The body mass index (BMI) calculator calculates body mass index
          from your weight and height.
        </p>
      </div>

      <div className="calculate-fields">
        <div className="calculate-info">
          <label className="calculate-label">
            Height
            <span>cm</span>
          </label>

          <input
            type="number"
            placeholder="170"
            className="calculate-input"
            value={height}
            min="0"
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>

        <div className="calculate-info">
          <label className="calculate-label">
            Weight
            <span>kg</span>
          </label>

          <input
            type="number"
            placeholder="70"
            className="calculate-input"
            value={weight}
            min="0"
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        <div className="calculate-info calculate-action">
          <button
            type="submit"
            className="calculate-btn"
          >
            Calculate
          </button>
        </div>
      </div>

      {message && (
        <p
          className={`calculate-message ${color}`}
          id="calculate-message"
        >
          {message}
        </p>
      )}
    </form>
  );
}