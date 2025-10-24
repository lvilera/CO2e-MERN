import { useState } from "react";

const SMECalculator = ({ showResult }) => {
    const [formData, setFormData] = useState({
        smeStartDate: "",
        smeEndDate: "",
        smeIndustry: "",
        smeEmployees: "",
        smeBuildingArea: "",
        smeElectricityKWh: "",
        smeNaturalGasM3: "",
        smeGasolineLiters: "",
        smeDieselLiters: ""
    });

    // Emission Factors for Indoor Gatherings (Churches, Schools, etc.)
    const FIXED_ELECTRICITY_EMISSION_FACTOR = 0.0016; // kg CO2e per kWh (Hydro-Quebec 2022 grid average, from IEA WEO 2023)
    const FIXED_NATURAL_GAS_EMISSION_FACTOR = 2.02; // kg CO2e per m³ (Natural gas combustion, from Canada's GHG Inventory 2023)

    // New Emission Factors for SME Calculator (Vehicle Fuels)
    const FIXED_GASOLINE_EMISSION_FACTOR = 2.32; // kg CO2e per Liter (for gasoline combustion, from Environment and Climate Change Canada)
    const FIXED_DIESEL_EMISSION_FACTOR = 2.68; // kg CO2e per Liter (for diesel and Climate Change Canada)

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [id]: value }));
    };

    const handleReset = () => {
        setFormData({
            smeStartDate: "",
            smeEndDate: "",
            smeIndustry: "",
            smeEmployees: "",
            smeBuildingArea: "",
            smeElectricityKWh: "",
            smeNaturalGasM3: "",
            smeGasolineLiters: "",
            smeDieselLiters: ""
        });
    };

    const calculateSME = () => {
        const startDate = formData.smeStartDate;
        const endDate = formData.smeEndDate;
        const industry = formData.smeIndustry;
        const employees = formData.smeEmployees;
        const buildingArea = formData.smeBuildingArea;
        const electricityKWh = formData.smeElectricityKWh;
        const naturalGasM3 = formData.smeNaturalGasM3;
        const gasolineLiters = formData.smeGasolineLiters;
        const dieselLiters = formData.smeDieselLiters;

        // Basic validation for numbers
        if (
            !employees || isNaN(employees) || employees < 0 ||
            !buildingArea || isNaN(buildingArea) || buildingArea < 0 ||
            !electricityKWh || isNaN(electricityKWh) || electricityKWh < 0 ||
            !naturalGasM3 || isNaN(naturalGasM3) || naturalGasM3 < 0 ||
            !gasolineLiters || isNaN(gasolineLiters) || gasolineLiters < 0 ||
            !dieselLiters || isNaN(dieselLiters) || dieselLiters < 0
        ) {
            showResult(null, null, "Please enter valid non-negative numbers for all SME calculation inputs.");
            return;
        }

        let totalCO2e = 0;

        // Calculate Scope 2: Purchased Electricity
        const electricityCO2e = electricityKWh * FIXED_ELECTRICITY_EMISSION_FACTOR;
        totalCO2e += electricityCO2e;

        // Calculate Scope 1: Natural Gas Combustion
        const naturalGasCO2e = naturalGasM3 * FIXED_NATURAL_GAS_EMISSION_FACTOR;
        totalCO2e += naturalGasCO2e;

        // Calculate Scope 1: Vehicle Fuel Combustion
        const gasolineCO2e = gasolineLiters * FIXED_GASOLINE_EMISSION_FACTOR;
        totalCO2e += gasolineCO2e;

        const dieselCO2e = dieselLiters * FIXED_DIESEL_EMISSION_FACTOR;
        totalCO2e += dieselCO2e;

        const smeSuggestions = [
            "Your total CO2e for the period is: " + totalCO2e.toFixed(2) + " kg CO2e.",
            "Primary emission sources identified: Electricity, Natural Gas, Vehicle Fuels.",
            "To reduce your electricity emissions, explore Hydro-Québec's Efficient Solutions Program for financial assistance with electricity-saving measures like LED lighting or heat pumps.",
            "If you use natural gas, investigate Énergir's programs or ÉcoPerformance for grants related to heating system upgrades or dual-energy conversions.",
            "For your vehicle fleet, consider transitioning to electric vehicles (EVs) and apply for the Quebec Roulez vert program rebates for vehicles and charging stations.",
            "Implement a waste reduction and recycling program for your office/business operations."
        ];

        showResult(totalCO2e, smeSuggestions, null);
        handleReset();
    };

    return (
        <div className="calculation-section" style={{ gridColumn: "1 / -1" }}>
            <h2>SME Monthly/Annual CO2e Calculator</h2>
            <label htmlFor="smeStartDate">Reporting Period (Start Date):</label>
            <input type="date" value={formData.smeStartDate} onChange={handleChange} id="smeStartDate" />

            <label htmlFor="smeEndDate">Reporting Period (End Date):</label>
            <input type="date" value={formData.smeEndDate} onChange={handleChange} id="smeEndDate" />

            <label htmlFor="smeIndustry">Business Industry/Sector:</label>
            <input type="text" value={formData.smeIndustry} onChange={handleChange} id="smeIndustry" placeholder="e.g., Retail, IT Services" />

            <label htmlFor="smeEmployees">Number of Employees:</label>
            <input type="number" value={formData.smeEmployees} onChange={handleChange} id="smeEmployees" placeholder="e.g., 25" />

            <label htmlFor="smeBuildingArea">Total Building Area (sq meters):</label>
            <input type="number" value={formData.smeBuildingArea} onChange={handleChange} id="smeBuildingArea" placeholder="e.g., 500" />

            <label htmlFor="smeElectricityKWh">Electricity Consumption (kWh):</label>
            <input type="number" value={formData.smeElectricityKWh} onChange={handleChange} id="smeElectricityKWh" placeholder="e.g., 10000" />

            <label htmlFor="smeNaturalGasM3">Natural Gas Consumption (m³):</label>
            <input type="number" value={formData.smeNaturalGasM3} onChange={handleChange} id="smeNaturalGasM3" placeholder="e.g., 500" />

            <label htmlFor="smeGasolineLiters">Gasoline Consumption (Liters):</label>
            <input type="number" value={formData.smeGasolineLiters} onChange={handleChange} id="smeGasolineLiters" placeholder="e.g., 1000" />

            <label htmlFor="smeDieselLiters">Diesel Consumption (Liters):</label>
            <input type="number" value={formData.smeDieselLiters} onChange={handleChange} id="smeDieselLiters" placeholder="e.g., 500" />

            <button className="calc-button" onClick={calculateSME}>Calculate SME CO2e</button>
        </div>
    )
};

export default SMECalculator;
