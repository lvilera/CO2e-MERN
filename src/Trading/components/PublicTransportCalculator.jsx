import { useState } from "react";

const PublicTransportCalculator = ({ showResult }) => {
    const [distanceTraveled, setDistanceTraveled] = useState("");

    const FIXED_PUBLIC_TRANSPORT_EMISSION_FACTOR = 0.05; // kg CO2e per km (example)

    const PUBLIC_TRANSPORT_SUGGESTIONS = [
        "Walk or cycle for short distances.",
        "Utilize public transport more frequently.",
        "Advocate for more efficient public transport systems."
    ];

    const handleChange = (e) => {
        setDistanceTraveled(e.target.value || "");
    };

    const handleReset = () => {
        setDistanceTraveled("");
    };

    const calculatePublicTransport = () => {
        if (distanceTraveled && !isNaN(distanceTraveled) && distanceTraveled >= 0) {
            const co2e = distanceTraveled * FIXED_PUBLIC_TRANSPORT_EMISSION_FACTOR;
            showResult(co2e, PUBLIC_TRANSPORT_SUGGESTIONS, null);
        } else {
            showResult(null, null, "Please enter a valid non-negative number for distance traveled.");
        }
        handleReset();
    };

    return (
        <div className="calculation-section">
            <label htmlFor="publicTransportDistance">Public Transport (km):</label>
            <input type="number" id="publicTransportDistance" value={distanceTraveled} onChange={handleChange} placeholder="e.g., 50" />
            <button className="calc-button" onClick={calculatePublicTransport}>Public Transport CO2e</button>
        </div>

    )
};

export default PublicTransportCalculator;
