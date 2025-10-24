import { useState } from "react";

const MicroCalculator = ({ showResult }) => {
    const [formData, setFormData] = useState({
        eventAttendees: "",
        eventAvgTravelDistance: "",
        eventMealsPerAttendee: "",
        eventDurationHours: ""
    });

    const FIXED_EVENT_ATTENDEE_TRAVEL_KM_FACTOR = 0.1; // kg CO2e per km per attendee (blended for various transport)
    const FIXED_EVENT_MEAL_FACTOR = 1.2; // kg CO2e per meal (average meal, e.g., vegetarian/meat mix)

    const EVENT_SUGGESTIONS = [
        "Encourage attendees to use public transport or carpool.",
        "Choose a venue with good public transport links.",
        "Offer vegetarian or plant-based catering options.",
        "Minimize waste by avoiding single-use plastics and promoting recycling.",
        "Select energy-efficient venues or off-peak event times."
    ];

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [id]: value }));
    };

    const handleReset = () => {
        setFormData({
            eventAttendees: "",
            eventAvgTravelDistance: "",
            eventMealsPerAttendee: "",
            eventDurationHours: ""
        });
    };

    const calculateEvents = () => {
        const attendees = formData.eventAttendees;
        const avgTravelDistance = formData.eventAvgTravelDistance;
        const mealsPerAttendee = formData.eventMealsPerAttendee;
        const durationHours = formData.eventDurationHours;

        // Validate all inputs
        if (!attendees || isNaN(attendees) || attendees < 0 ||
            !avgTravelDistance || isNaN(avgTravelDistance) || avgTravelDistance < 0 ||
            !mealsPerAttendee || isNaN(mealsPerAttendee) || mealsPerAttendee < 0 ||
            !durationHours || isNaN(durationHours) || durationHours < 0) {
            showResult(null, null, "Please enter valid non-negative numbers for all general event inputs.");
            return;
        }

        const travelCO2e = attendees * avgTravelDistance * FIXED_EVENT_ATTENDEE_TRAVEL_KM_FACTOR;
        const mealsCO2e = attendees * mealsPerAttendee * FIXED_EVENT_MEAL_FACTOR;
        // Using a simplified general factor if duration is provided, for backwards compatibility with general event
        const energyCO2e = attendees * durationHours * 0.05;

        const totalCO2e = travelCO2e + mealsCO2e + energyCO2e;
        showResult(totalCO2e, EVENT_SUGGESTIONS, null);
        handleReset();
    };

    return (
        <div className="calculation-section">
            <h1>Micro Gatherings & Events</h1>
            <p>(Small Weedings,Hotel Salons, Churches, Schools, Universities, Theaters, Pools)</p>
            <label htmlFor="eventAttendees">Number of Attendees(&lt;50): </label>
            <input type="number" value={formData.eventAttendees} onChange={handleChange} id="eventAttendees" placeholder="e.g., 45" />

            <label htmlFor="eventAvgTravelDistance">Avg. Travel Distance per Attendee (km round trip):</label>
            <input type="number" value={formData.eventAvgTravelDistance} onChange={handleChange} id="eventAvgTravelDistance" placeholder="e.g., 20" />

            <label htmlFor="eventMealsPerAttendee">Meals Served per Attendee:</label>
            <input type="number" value={formData.eventMealsPerAttendee} onChange={handleChange} id="eventMealsPerAttendee" placeholder="e.g., 1 (enter 0 if no meals)" />

            <label htmlFor="eventDurationHours">Event Duration (hours):</label>
            <input type="number" value={formData.eventDurationHours} onChange={handleChange} id="eventDurationHours" placeholder="e.g., 4" />

            <button className="calc-button" onClick={calculateEvents}>Calculate Micro Event CO2e</button>
        </div>

    )
};

export default MicroCalculator;
