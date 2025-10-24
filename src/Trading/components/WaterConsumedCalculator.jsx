import { useState } from "react";

const WaterConsumedCalculator = ({ showResult }) => {
    const [waterConsumed, setWaterConsumed] = useState("");

    const FIXED_WATER_BLENDED_EMISSION_FACTOR = 0.0003; // kg CO2e per Liter (example)

    const WATER_SUGGESTIONS = [
        "Take shorter showers.",
        "Fix leaky faucets and toilets.",
        "Use water-efficient appliances."
    ];

    const handleChange = (e) => {
        setWaterConsumed(e.target.value || "");
    };

    const handleReset = () => {
        setWaterConsumed("");
    };

    const calculateWater = () => {
        if (waterConsumed && !isNaN(waterConsumed) && waterConsumed >= 0) {
            const co2e = waterConsumed * FIXED_WATER_BLENDED_EMISSION_FACTOR;
            showResult(co2e, WATER_SUGGESTIONS, null);
        } else {
            showResult(null, null, "Please enter a valid non-negative number for water consumed.");
        }
        handleReset();
    };

    return (
        <div className="calculation-section">
            <label htmlFor="waterConsumed">Water Consumed (Liters):</label>
            <input type="number" id="waterConsumed" value={waterConsumed} onChange={handleChange} placeholder="e.g., 1000" />
            <button className="calc-button" onClick={calculateWater}>Calculate Water CO2e</button>
        </div>
    )
};

export default WaterConsumedCalculator;
