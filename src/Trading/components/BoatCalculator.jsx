import { useState } from "react";

const BoatCalculator = ({ showResult }) => {
    const [vesselType, setVesselType] = useState("motor_boat_gasoline");
    const [vesselDistance, setVesselDistance] = useState("");

    const VESSEL_EMISSION_FACTORS = {
        motor_boat_gasoline: 0.5, // kg CO2e per km (example)
        motor_boat_diesel: 0.6,   // kg CO2e per km (example)
        electric_sail_boat: 0.01, // kg CO2e per km (very low for electric)
        yacht_gasoline: 1.5,      // kg CO2e per km (example)
        yacht_diesel: 1.8,        // kg CO2e per km (example)
        yacht_electric: 0.05      // kg CO2e per km (low for electric)
    };

    const VESSEL_SUGGESTIONS = [
        "Choose more fuel-efficient or electric vessel types.",
        "Reduce speed to conserve fuel.",
        "Consider sailing or hybrid options where possible."
    ];

    const handleTypeChange = (e) => {
        setVesselType(e.target.value);
    };

    const handleDistanceChange = (e) => {
        setVesselDistance(e.target.value || "");
    };

    const handleReset = () => {
        setVesselType("motor_boat_gasoline");
        setVesselDistance("");
    };

    const calculateVessel = () => {
        if (vesselDistance && !isNaN(vesselDistance) && vesselDistance >= 0 && VESSEL_EMISSION_FACTORS[vesselType]) {
            const emissionFactor = VESSEL_EMISSION_FACTORS[vesselType];
            const co2e = vesselDistance * emissionFactor;
            showResult(co2e, VESSEL_SUGGESTIONS, null);
        } else {
            showResult(null, null, "Please enter a valid non-negative number for distance traveled and select a vessel type.");
        }
        handleReset();
    };

    return (
        <div className="calculation-section">
            <label htmlFor="vesselType">BOATS:</label>
            <select id="vesselType" value={vesselType} onChange={handleTypeChange}>
                <option value="motor_boat_gasoline">Motor Boat (Gasoline)</option>
                <option value="motor_boat_diesel">Motor Boat (Diesel)</option>
                <option value="electric_sail_boat">Electric Sail Boat</option>
                <option value="yacht_gasoline">Yacht (Gasoline)</option>
                <option value="yacht_diesel">Yacht (Diesel)</option>
                <option value="yacht_electric">Yacht (Electric)</option>
            </select>
            <label htmlFor="vesselDistance">Distance Traveled (km):</label>
            <input type="number" id="vesselDistance" value={vesselDistance} onChange={handleDistanceChange} placeholder="e.g., 50" />
            <button className="calc-button" onClick={calculateVessel}>Calculate Vessel CO2e</button>
        </div>
    )
};

export default BoatCalculator;
