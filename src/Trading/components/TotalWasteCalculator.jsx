import { useState } from "react";

const TotalWasteCalculator = ({ showResult }) => {
    const [totalWaste, setTotalWaste] = useState("");

    const FIXED_WASTE_BLENDED_EMISSION_FACTOR = 0.2; // kg CO2e per kg of waste (example)

    const WASTE_SUGGESTIONS = [
        "Reduce, Reuse, Recycle.",
        "Compost organic waste.",
        "Buy products with minimal packaging."
    ];

    const handleChange = (e) => {
        setTotalWaste(e.target.value || "");
    };

    const handleReset = () => {
        setTotalWaste("");
    };

    const calculateWaste = () => {
        if (totalWaste && !isNaN(totalWaste) && totalWaste >= 0) {
            const co2e = totalWaste * FIXED_WASTE_BLENDED_EMISSION_FACTOR;
            showResult(co2e, WASTE_SUGGESTIONS, null);
        } else {
            showResult(null, null, "Please enter a valid non-negative number for total waste generated.");
        }
        handleReset();
    };

    return (
        <div className="calculation-section">
            <label htmlFor="totalWaste">Total Waste (kg):</label>
            <input type="number" id="totalWaste" value={totalWaste} onChange={handleChange} placeholder="e.g., 50" />
            <button className="calc-button" onClick={calculateWaste}>Calculate Waste CO2e</button>
        </div>
    )
};

export default TotalWasteCalculator;
