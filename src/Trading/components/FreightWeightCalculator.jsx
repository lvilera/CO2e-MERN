import { useState } from "react";

const FreightWeightCalculator = ({ showResult }) => {
    const [freightWeight, setFreightWeight] = useState("");

    const FIXED_FREIGHT_BLENDED_EMISSION_FACTOR_PER_TONNE = 0.5; // kg CO2e per tonne (example)

    const FREIGHT_SUGGESTIONS = [
        "Choose slower, more fuel-efficient shipping options (e.g., sea over air).",
        "Optimize freight routes to reduce distance.",
        "Consolidate shipments to reduce trips."
    ];

    const handleChange = (e) => {
        setFreightWeight(e.target.value || "");
    };

    const handleReset = () => {
        setFreightWeight("");
    };

    const calculateFreight = () => {
        if (freightWeight && !isNaN(freightWeight) && freightWeight >= 0) {
            const co2e = freightWeight * FIXED_FREIGHT_BLENDED_EMISSION_FACTOR_PER_TONNE;
            showResult(co2e, FREIGHT_SUGGESTIONS, null);
        } else {
            showResult(null, null, "Please enter a valid non-negative number for freight weight.");
        }
        handleReset();
    };

    return (
        <div className="calculation-section">
            <label htmlFor="freightWeight">Freight Weight (tonnes):</label>
            <input type="number" id="freightWeight" value={freightWeight} onChange={handleChange} placeholder="e.g., 10" />
            <button className="calc-button" onClick={calculateFreight}>Calculate Freight CO2e</button>
        </div>
    )
};

export default FreightWeightCalculator;
