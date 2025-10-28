import { useState } from "react";

const VehicleCalculator = ({ showResult }) => {
    const [vehicleType, setVehicleType] = useState("sedan");
    const [vehicleDistance, setVehicleDistance] = useState("");

    const VEHICLE_EMISSION_FACTORS = {
        sedan: 0.12, // kg CO2e per km
        van: 0.18,   // kg CO2e per km
        suv_4x4: 0.22, // kg CO2e per km
        truck: 0.30  // kg CO2e per km
    };

    const VEHICLE_SUGGESTIONS = [
        "Drive less, combine trips.",
        "Maintain your vehicle regularly.",
        "Consider carpooling or public transport.",
        "Opt for more fuel-efficient or electric vehicle models."
    ];

    const handleTypeChange = (e) => {
        setVehicleType(e.target.value);
    };

    const handleDistanceChange = (e) => {
        setVehicleDistance(e.target.value || "");
    };

    const handleReset = () => {
        setVehicleType("sedan");
        setVehicleDistance("");
    };

    const calculateVehicle = () => {
        if (vehicleDistance && !isNaN(vehicleDistance) && vehicleDistance >= 0 && VEHICLE_EMISSION_FACTORS[vehicleType]) {
            const emissionFactor = VEHICLE_EMISSION_FACTORS[vehicleType];
            const co2e = vehicleDistance * emissionFactor;
            showResult(co2e, VEHICLE_SUGGESTIONS, null);
        } else {
            showResult(null, null, "Please enter a valid non-negative number for distance driven and select a vehicle type.");
        }
        handleReset();
    };

    return (
        <div className="calculation-section">
            <label htmlFor="vehicleType">VEHICLES:</label>
            <select id="vehicleType" value={vehicleType} onChange={handleTypeChange}>
                <option value="sedan">Sedan</option>
                <option value="van">Van</option>
                <option value="suv_4x4">4x4 SUV</option>
                <option value="truck">Truck</option>
            </select>
            <label htmlFor="vehicleDistance">Distance Driven (km):</label>
            <input type="number" id="vehicleDistance" value={vehicleDistance} onChange={handleDistanceChange} placeholder="e.g., 100" />
            <button className="calc-button" onClick={calculateVehicle}>Calculate Vehicle CO2e</button>
        </div>
    )
};

export default VehicleCalculator;
