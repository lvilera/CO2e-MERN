import { useState } from "react";

const MacroCalculator = ({ showResult }) => {
    const [formData, setFormData] = useState({
        buildingAttendees: "",
        buildingAvgTravelDistance: "",
        buildingMealsPerAttendee: "",
        buildingDurationHours: "",
        buildingElectricityKWh: "",
        buildingNaturalGasM3: "",
        buildingWaterLiters: "",
        buildingLandfilledWasteKg: "",
        buildingRecycledWasteKg: "",
        buildingCompostedWasteKg: ""
    });

    // Emission Factors for General Events/Gatherings (Existing)
    const FIXED_EVENT_ATTENDEE_TRAVEL_KM_FACTOR = 0.1; // kg CO2e per km per attendee (blended for various transport)
    const FIXED_EVENT_MEAL_FACTOR = 1.2; // kg CO2e per meal (average meal, e.g., vegetarian/meat mix)

    // Emission Factors for Indoor Gatherings (Churches, Schools, etc.)
    const FIXED_ELECTRICITY_EMISSION_FACTOR = 0.0016; // kg CO2e per kWh (Hydro-Quebec 2022 grid average, from IEA WEO 2023)
    const FIXED_NATURAL_GAS_EMISSION_FACTOR = 2.02; // kg CO2e per m³ (Natural gas combustion, from Canada's GHG Inventory 2023)
    const FIXED_BUILDING_WATER_EMISSION_FACTOR = 0.0003; // kg CO2e per Liter (similar to general water)
    const FIXED_LANDFILLED_WASTE_EMISSION_FACTOR = 0.5; // kg CO2e per kg (higher impact)
    const FIXED_RECYCLED_WASTE_EMISSION_FACTOR = 0.1; // kg CO2e per kg (lower impact)
    const FIXED_COMPOSTED_WASTE_EMISSION_FACTOR = 0.05; // kg CO2e per kg (lowest impact)

    const INDOOR_GATHERING_SUGGESTIONS = [
        "Implement energy-efficient lighting (LEDs) and HVAC systems.",
        "Conduct energy audits and optimize building insulation.",
        "Promote public transport, carpooling, and active commuting for attendees.",
        "Reduce, reuse, and recycle all waste generated; explore composting programs.",
        "Install low-flow fixtures and monitor water usage for conservation.",
        "Choose sustainable catering options with lower meat content and local sourcing."
    ];

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [id]: value }));
    };

    const handleReset = () => {
        setFormData({
            buildingAttendees: "",
            buildingAvgTravelDistance: "",
            buildingMealsPerAttendee: "",
            buildingDurationHours: "",
            buildingElectricityKWh: "",
            buildingNaturalGasM3: "",
            buildingWaterLiters: "",
            buildingLandfilledWasteKg: "",
            buildingRecycledWasteKg: "",
            buildingCompostedWasteKg: ""
        });
    };

    const calculateBuildingGathering = () => {
        const attendees = formData.buildingAttendees;
        const avgTravelDistance = formData.buildingAvgTravelDistance;
        const mealsPerAttendee = formData.buildingMealsPerAttendee;
        const durationHours = formData.buildingDurationHours;
        const electricityKWh = formData.buildingElectricityKWh;
        const naturalGasM3 = formData.buildingNaturalGasM3;
        const waterLiters = formData.buildingWaterLiters;
        const landfilledWasteKg = formData.buildingLandfilledWasteKg;
        const recycledWasteKg = formData.buildingRecycledWasteKg;
        const compostedWasteKg = formData.buildingCompostedWasteKg;

        // Validate all inputs
        if (!attendees || isNaN(attendees) || attendees < 0 ||
            !avgTravelDistance || isNaN(avgTravelDistance) || avgTravelDistance < 0 ||
            !mealsPerAttendee || isNaN(mealsPerAttendee) || mealsPerAttendee < 0 ||
            !durationHours || isNaN(durationHours) || durationHours < 0 ||
            !electricityKWh || isNaN(electricityKWh) || electricityKWh < 0 ||
            !naturalGasM3 || isNaN(naturalGasM3) || naturalGasM3 < 0 ||
            !waterLiters || isNaN(waterLiters) || waterLiters < 0 ||
            !landfilledWasteKg || isNaN(landfilledWasteKg) || landfilledWasteKg < 0 ||
            !recycledWasteKg || isNaN(recycledWasteKg) || recycledWasteKg < 0 ||
            !compostedWasteKg || isNaN(compostedWasteKg) || compostedWasteKg < 0) {
            showResult(null, null, "Please enter valid non-negative numbers for all Indoor Gathering inputs.");
            return;
        }

        // Calculate CO2e components
        const travelCO2e = attendees * avgTravelDistance * FIXED_EVENT_ATTENDEE_TRAVEL_KM_FACTOR;
        const mealsCO2e = attendees * mealsPerAttendee * FIXED_EVENT_MEAL_FACTOR;
        const electricityCO2e = electricityKWh * FIXED_ELECTRICITY_EMISSION_FACTOR;
        const naturalGasCO2e = naturalGasM3 * FIXED_NATURAL_GAS_EMISSION_FACTOR;
        const waterCO2e = waterLiters * FIXED_BUILDING_WATER_EMISSION_FACTOR;
        const landfilledCO2e = landfilledWasteKg * FIXED_LANDFILLED_WASTE_EMISSION_FACTOR;
        const recycledCO2e = recycledWasteKg * FIXED_RECYCLED_WASTE_EMISSION_FACTOR;
        const compostedCO2e = compostedWasteKg * FIXED_COMPOSTED_WASTE_EMISSION_FACTOR;

        const totalCO2e = travelCO2e + mealsCO2e + electricityCO2e + naturalGasCO2e + waterCO2e + landfilledCO2e + recycledCO2e + compostedCO2e;
        showResult(totalCO2e, INDOOR_GATHERING_SUGGESTIONS, null);
        handleReset();
    };

    return (
        <div className="calculation-section">
            <h1>Macro Gatherings & Events</h1>
            <p>(Weeding Halls,Hotel Salons, Churches, Schools, Universities, Theaters, Pools)</p>

            <label htmlFor="buildingAttendees">Number of Attendees(&gt;50):</label>
            <input type="number" value={formData.buildingAttendees} onChange={handleChange} id="buildingAttendees" placeholder="e.g., 500" />

            <label htmlFor="buildingAvgTravelDistance">Avg. Attendee Travel Distance (km round trip):</label>
            <input type="number" value={formData.buildingAvgTravelDistance} onChange={handleChange} id="buildingAvgTravelDistance" placeholder="e.g., 10" />

            <label htmlFor="buildingMealsPerAttendee">Meals Served per Attendee:</label>
            <input type="number" value={formData.buildingMealsPerAttendee} onChange={handleChange} id="buildingMealsPerAttendee" placeholder="e.g., 0.5 (enter 0 if no meals)" />

            <label htmlFor="buildingDurationHours">Event/Gathering Duration (hours):</label>
            <input type="number" value={formData.buildingDurationHours} onChange={handleChange} id="buildingDurationHours" placeholder="e.g., 2" />

            <hr /> <label htmlFor="buildingElectricityKWh">Electricity Consumed (kWh):</label>
            <input type="number" value={formData.buildingElectricityKWh} onChange={handleChange} id="buildingElectricityKWh" placeholder="e.g., 150" />

            <label htmlFor="buildingNaturalGasM3">Natural Gas Consumed (m³):</label>
            <input type="number" value={formData.buildingNaturalGasM3} onChange={handleChange} id="buildingNaturalGasM3" placeholder="e.g., 20" />

            <label htmlFor="buildingWaterLiters">Water Consumed (Liters):</label>
            <input type="number" value={formData.buildingWaterLiters} onChange={handleChange} id="buildingWaterLiters" placeholder="e.g., 500" />

            <label htmlFor="buildingLandfilledWasteKg">Landfilled Waste (kg):</label>
            <input type="number" value={formData.buildingLandfilledWasteKg} onChange={handleChange} id="buildingLandfilledWasteKg" placeholder="e.g., 10" />

            <label htmlFor="buildingRecycledWasteKg">Recycled Waste (kg):</label>
            <input type="number" value={formData.buildingRecycledWasteKg} onChange={handleChange} id="buildingRecycledWasteKg" placeholder="e.g., 5" />

            <label htmlFor="buildingCompostedWasteKg">Composted Waste (kg):</label>
            <input type="number" value={formData.buildingCompostedWasteKg} onChange={handleChange} id="buildingCompostedWasteKg" placeholder="e.g., 2" />

            <button className="calc-button" onClick={calculateBuildingGathering}>Calculate Macro Gathering
                CO2e</button>
        </div>

    )
};

export default MacroCalculator;
