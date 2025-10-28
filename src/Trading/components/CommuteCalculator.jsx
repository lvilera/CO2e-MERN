import { useState } from "react";

const CommuteCalculator = ({ showResult }) => {
    const [commuteDistance, setCommuteDistance] = useState("");

    const FIXED_COMMUTE_DAYS_PER_YEAR = 250; // assuming 5 days/week * 50 weeks/year
    const FIXED_COMMUTE_BLENDED_EMISSION_FACTOR = 0.1; // kg CO2e per km per person (example for blended commute)

    const COMMUTING_SUGGESTIONS = [
        "Bike or walk to work if possible.",
        "Join a carpool or vanpool.",
        "Work from home more often."
    ];

    const handleChange = (e) => {
        setCommuteDistance(e.target.value || "");
    };

    const handleReset = () => {
        setCommuteDistance("");
    };

    const calculateCommuting = () => {
        if (commuteDistance && !isNaN(commuteDistance) && commuteDistance >= 0) {
            const co2e = commuteDistance * 2 * FIXED_COMMUTE_DAYS_PER_YEAR * FIXED_COMMUTE_BLENDED_EMISSION_FACTOR;
            showResult(co2e, COMMUTING_SUGGESTIONS, null);
        } else {
            showResult(null, null, "Please enter a valid non-negative number for commute distance.");
        }
        handleReset();
    };

    return (
        <div className="calculation-section">
            <label htmlFor="commuteDistance">Commute(one-way, km):</label>
            <input type="number" id="commuteDistance" value={commuteDistance} onChange={handleChange} placeholder="e.g., 15" />
            <button className="calc-button" onClick={calculateCommuting}>Commuting Travel CO2e</button>
        </div>
    )
};

export default CommuteCalculator;
