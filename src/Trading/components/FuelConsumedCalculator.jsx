import { useState } from "react";

const FuelConsumedCalculator = ({ showResult }) => {
    const [fuelConsumed, setFuelConsumed] = useState("");

    const FIXED_FUEL_EMISSION_FACTOR = 2.3; // kg CO2e per Liter of fuel (example for petrol)

    const FUEL_SUGGESTIONS = [
        "Opt for cleaner fuel sources if available.",
        "Reduce overall fuel consumption.",
        "Explore electric vehicle options."
    ];

    const handleChange = (e) => {
        setFuelConsumed(e.target.value || "");
    };

    const handleReset = () => {
        setFuelConsumed("");
    };

    const calculateFuel = () => {
        if (fuelConsumed && !isNaN(fuelConsumed) && fuelConsumed >= 0) {
            const co2e = fuelConsumed * FIXED_FUEL_EMISSION_FACTOR;
            showResult(co2e, FUEL_SUGGESTIONS, null);
        } else {
            showResult(null, null, "Please enter a valid non-negative number for fuel consumed.");
        }
        handleReset();
    };

    return (
        <div className="calculation-section">
            <label htmlFor="fuelConsumed">Fuel Consumed (Liters):</label>
            <input type="number" id="fuelConsumed" value={fuelConsumed} onChange={handleChange} placeholder="e.g., 20" />
            <button className="calc-button" onClick={calculateFuel}>Calculate Car Fuel CO2e</button>
        </div>
    )
};

export default FuelConsumedCalculator;
