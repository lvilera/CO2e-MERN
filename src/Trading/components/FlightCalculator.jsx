import { useState } from "react";

const FlightCalculator = ({ showResult }) => {
    const [flightType, setFlightType] = useState("recreational_aircraft");
    const [flightDistance, setFlightDistance] = useState("");

    const FLIGHT_EMISSION_FACTORS = {
        recreational_aircraft: 0.25, // kg CO2e per km
        commercial_aircraft: 0.09,   // kg CO2e per km
        amphibious_aircraft: 0.30,   // kg CO2e per km
        helicopter: 0.40             // kg CO2e per km
    };

    const FLIGHT_SUGGESTIONS = [
        "Choose direct flights.",
        "Consider train travel for shorter distances.",
        "Support carbon offset programs for flights."
    ];

    const handleTypeChange = (e) => {
        setFlightType(e.target.value);
    };

    const handleDistanceChange = (e) => {
        setFlightDistance(e.target.value || "");
    };

    const handleReset = () => {
        setFlightType("recreational_aircraft");
        setFlightDistance("");
    };

    const calculateFlight = () => {
        if (flightDistance && !isNaN(flightDistance) && flightDistance >= 0 && FLIGHT_EMISSION_FACTORS[flightType]) {
            const co2e = flightDistance * FLIGHT_EMISSION_FACTORS[flightType];
            showResult(co2e, FLIGHT_SUGGESTIONS, null);
        } else {
            showResult(null, null, "Please enter a valid non-negative number for flight distance and select an aircraft type.");
        }
        handleReset();
    };

    return (
        <div className="calculation-section">
            <label htmlFor="flightType">FLIGHTS:</label>
            <select id="flightType" value={flightType} onChange={handleTypeChange}>
                <option value="recreational_aircraft">Recreational Aircraft</option>
                <option value="commercial_aircraft">Commercial Aircraft</option>
                <option value="amphibious_aircraft">Amphibious Aircraft</option>
                <option value="helicopter">Helicopter</option>
            </select>
            <label htmlFor="flightDistance">Flight Distance (km):</label>
            <input type="number" id="flightDistance" value={flightDistance} onChange={handleDistanceChange} placeholder="e.g., 500" />
            <button className="calc-button" onClick={calculateFlight}>Calculate Flight CO2e</button>
        </div>
    )
};

export default FlightCalculator;
