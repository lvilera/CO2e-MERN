import './CarbonEmissionsCalculator.css';

import { useMemo, useState } from "react";
const CarbonEmissionsCalculator = () => {

 
  // -------------------- I18N --------------------
  const STRINGS = {
    en: {
      appTitle: "Carbon Emissions Calculator",
      subtitle:
        "Sustainable Success through Carbon Emissions awareness and Climate impact in your organization...",
      tabs: ["SME's", "Micro Gatherings", "Macro Gatherings", "Other Calculators"],
      langLabel: "English",
      print: "📄 Print Report / Save as PDF",
      // SME
      smeTitle: "SME Monthly/Annual CO2e Calculator",
      companyName: "Company Name: *",
      contactName: "Contact Name:",
      email: "Email:",
      phone: "Phone Number:",
      startDate: "Reporting Period (Start Date):",
      endDate: "Reporting Period (End Date):",
      industry: "Business Industry/Sector:",
      employees: "Number of Employees:",
      buildingArea: "Total Building Area (sq meters):",
      electricityKWh: "Electricity Consumption (kWh):",
      naturalGasM3: "Natural Gas Consumption (m³):",
      gasolineL: "Gasoline Consumption (Liters):",
      dieselL: "Diesel Consumption (Liters):",
      calcSme: "Calculate SME CO2e",
      // Micro
      microTitle: "Micro Gatherings & Events",
      microSub:
        "(Small Weddings, Hotel Salons, Churches, Schools, Universities, Theaters, Pools)",
      eventName: "Event Name: *",
      attendeesLT50: "Number of Attendees (<50):",
      avgTravelKm: "Avg. Travel Distance per Attendee (km round trip):",
      mealsPerAttendee: "Meals Served per Attendee:",
      durationHrs: "Event Duration (hours):",
      calcMicro: "Calculate Micro Event CO2e",
      // Macro
      macroTitle: "Macro Gatherings & Events",
      macroSub:
        "(Wedding Halls, Hotel Salons, Churches, Schools, Universities, Theaters, Pools)",
      attendeesGT50: "Number of Attendees (>50):",
      avgAttendeeTravelKm: "Avg. Attendee Travel Distance (km round trip):",
      mealsPerAttendeeMacro: "Meals Served per Attendee:",
      durationHrsMacro: "Event/Gathering Duration (hours):",
      electricityConsumed: "Electricity Consumed (kWh):",
      naturalGasConsumed: "Natural Gas Consumed (m³):",
      waterLiters: "Water Consumed (Liters):",
      landfilledKg: "Landfilled Waste (kg):",
      recycledKg: "Recycled Waste (kg):",
      compostedKg: "Composted Waste (kg):",
      calcMacro: "Calculate Macro Gathering CO2e",
      // Other
      otherFlights: "FLIGHTS:",
      otherVehicles: "VEHICLES:",
      otherVessels: "VESSELS:",
      publicTransportKm: "Public Transport (km):",
      freightTonnes: "Freight Weight (tonnes):",
      waterConsumed: "Water Consumed (Liters):",
      totalWaste: "Total Waste (kg):",
      commuteOneWayKm: "Commute (one-way, km):",
      calcFlight: "Calculate Flight CO2e",
      calcVehicle: "Calculate Vehicle CO2e",
      calcVessel: "Calculate Vessel CO2e",
      calcPublicTransport: "Public Transport CO2e",
      calcFreight: "Calculate Freight CO2e",
      calcWater: "Calculate Water CO2e",
      calcWaste: "Calculate Waste CO2e",
      calcCommute: "Commuting Travel CO2e",
      // Results
      resultPlaceholder: "Your CO2e calculation will appear here.",
      totalLabel: "Total CO2e Emissions",
    },
    fr: {
      // (You can expand French/Spanish as needed)
      ...this?.en,
    },
    es: {
      ...this?.en,
    },
  };

  // -------------------- CONSTANTS (from your file) --------------------
  // Flights (kg CO2e per km) — examples
  const FLIGHT_FACTORS = {
    recreational_aircraft: 0.25,
    commercial_aircraft: 0.09,
    amphibious_aircraft: 0.3,
    helicopter: 0.4,
  };
  // Vehicles (kg CO2e per km) — examples
  const VEHICLE_FACTORS = {
    sedan: 0.12,
    van: 0.18,
    suv_4x4: 0.22,
    truck: 0.3,
  };
  // Vessels (kg CO2e per km) — examples
  const VESSEL_FACTORS = {
    motor_boat_gasoline: 0.5,
    motor_boat_diesel: 0.6,
    electric_sail_boat: 0.01,
    yacht_gasoline: 1.5,
    yacht_diesel: 1.8,
    yacht_electric: 0.05,
  };

  // Event factors
  const FIXED_EVENT_ATTENDEE_TRAVEL_KM_FACTOR = 0.1; // kg per km per attendee
  const FIXED_EVENT_MEAL_FACTOR = 1.2; // kg per meal

  // Indoor / building factors
  const FIXED_ELECTRICITY_EMISSION_FACTOR = 0.0016; // kg per kWh
  const FIXED_NATURAL_GAS_EMISSION_FACTOR = 2.02; // kg per m³
  const FIXED_BUILDING_WATER_EMISSION_FACTOR = 0.0003; // kg per L
  const FIXED_LANDFILLED_WASTE_EMISSION_FACTOR = 0.5; // kg per kg
  const FIXED_RECYCLED_WASTE_EMISSION_FACTOR = 0.1; // kg per kg
  const FIXED_COMPOSTED_WASTE_EMISSION_FACTOR = 0.05; // kg per kg

  // SME fuels
  const FIXED_GASOLINE_EMISSION_FACTOR = 2.32; // kg per L
  const FIXED_DIESEL_EMISSION_FACTOR = 2.68; // kg per L

  // Other
  const FIXED_PUBLIC_TRANSPORT_EMISSION_FACTOR = 0.05; // kg per km
  const FIXED_FREIGHT_BLENDED_EMISSION_FACTOR_PER_TONNE = 0.5; // kg per tonne (placeholder)
  const FIXED_WATER_BLENDED_EMISSION_FACTOR = 0.0003; // kg per L
  const FIXED_WASTE_BLENDED_EMISSION_FACTOR = 0.2; // kg per kg
  const FIXED_COMMUTE_DAYS_PER_YEAR = 250;
  const FIXED_COMMUTE_BLENDED_EMISSION_FACTOR = 0.1; // kg per km per person

  // -------------------- STATE --------------------
  const [lang, setLang] = useState("en");
  const t = useMemo(() => STRINGS[lang] || STRINGS.en, [lang, STRINGS]);

  const [activeTab, setActiveTab] = useState("sme");

  const [sme, setSme] = useState({
    companyName: "",
    contact: "",
    email: "",
    phone: "",
    startDate: "",
    endDate: "",
    industry: "",
    employees: "",
    buildingArea: "",
    electricityKWh: "",
    naturalGasM3: "",
    gasolineLiters: "",
    dieselLiters: "",
  });

  const [micro, setMicro] = useState({
    eventName: "",
    contact: "",
    email: "",
    phone: "",
    attendees: "",
    avgTravelKm: "",
    mealsPerAttendee: "",
    durationHours: "",
  });

  const [macro, setMacro] = useState({
    eventName: "",
    contact: "",
    email: "",
    phone: "",
    attendees: "",
    avgTravelKm: "",
    mealsPerAttendee: "",
    durationHours: "",
    electricityKWh: "",
    naturalGasM3: "",
    waterLiters: "",
    landfilledWasteKg: "",
    recycledWasteKg: "",
    compostedWasteKg: "",
  });

  const [other, setOther] = useState({
    flightsType: "recreational_aircraft",
    flightsDistance: "",
    vehicleType: "sedan",
    vehicleDistance: "",
    vesselType: "motor_boat_gasoline",
    vesselDistance: "",
    publicTransportDistance: "",
    freightWeight: "",
    waterConsumed: "",
    totalWaste: "",
    commuteDistance: "",
  });

  const [resultSme, setResultSme] = useState("");
  const [resultMicro, setResultMicro] = useState("");
  const [resultMacro, setResultMacro] = useState("");
  const [resultOther, setResultOther] = useState("");

  // -------------------- HELPERS --------------------
  const toNum = (v) => (v === "" || isNaN(Number(v)) ? 0 : Number(v));
  const fmtKgT = (kg) =>
    `${kg.toFixed(2)} kg (${(kg / 1000).toFixed(3)} tonnes)`;

  // -------------------- CALCULATIONS --------------------
  const calculateSME = () => {
    const elec = toNum(sme.electricityKWh) * FIXED_ELECTRICITY_EMISSION_FACTOR;
    const gas = toNum(sme.naturalGasM3) * FIXED_NATURAL_GAS_EMISSION_FACTOR;
    const gasoline = toNum(sme.gasolineLiters) * FIXED_GASOLINE_EMISSION_FACTOR;
    const diesel = toNum(sme.dieselLiters) * FIXED_DIESEL_EMISSION_FACTOR;
    const total = elec + gas + gasoline + diesel;
    setResultSme(
      total > 0
        ? `${t.totalLabel}: ${fmtKgT(total)}`
        : t.resultPlaceholder
    );
  };

  const calculateMicro = () => {
    const attendees = toNum(micro.attendees);
    const travel =
      attendees * toNum(micro.avgTravelKm) * FIXED_EVENT_ATTENDEE_TRAVEL_KM_FACTOR;
    const meals = attendees * toNum(micro.mealsPerAttendee) * FIXED_EVENT_MEAL_FACTOR;
    const total = travel + meals; // Duration not used in base factors
    setResultMicro(
      total > 0
        ? `${t.totalLabel}: ${fmtKgT(total)}`
        : t.resultPlaceholder
    );
  };

  const calculateMacro = () => {
    const attendees = toNum(macro.attendees);
    const travel =
      attendees * toNum(macro.avgTravelKm) * FIXED_EVENT_ATTENDEE_TRAVEL_KM_FACTOR;
    const meals =
      attendees * toNum(macro.mealsPerAttendee) * FIXED_EVENT_MEAL_FACTOR;
    const elec = toNum(macro.electricityKWh) * FIXED_ELECTRICITY_EMISSION_FACTOR;
    const gas = toNum(macro.naturalGasM3) * FIXED_NATURAL_GAS_EMISSION_FACTOR;
    const water = toNum(macro.waterLiters) * FIXED_BUILDING_WATER_EMISSION_FACTOR;
    const landfilled =
      toNum(macro.landfilledWasteKg) * FIXED_LANDFILLED_WASTE_EMISSION_FACTOR;
    const recycled =
      toNum(macro.recycledWasteKg) * FIXED_RECYCLED_WASTE_EMISSION_FACTOR;
    const composted =
      toNum(macro.compostedWasteKg) * FIXED_COMPOSTED_WASTE_EMISSION_FACTOR;
    const total =
      travel + meals + elec + gas + water + landfilled + recycled + composted;
    setResultMacro(
      total > 0
        ? `${t.totalLabel}: ${fmtKgT(total)}`
        : t.resultPlaceholder
    );
  };

  const calculateFlights = () => {
    const factor = FLIGHT_FACTORS[other.flightsType] || 0;
    const total = toNum(other.flightsDistance) * factor;
    setResultOther(`${t.totalLabel}: ${fmtKgT(total)}`);
  };

  const calculateVehicle = () => {
    const factor = VEHICLE_FACTORS[other.vehicleType] || 0;
    const total = toNum(other.vehicleDistance) * factor;
    setResultOther(`${t.totalLabel}: ${fmtKgT(total)}`);
  };

  const calculateVessel = () => {
    const factor = VESSEL_FACTORS[other.vesselType] || 0;
    const total = toNum(other.vesselDistance) * factor;
    setResultOther(`${t.totalLabel}: ${fmtKgT(total)}`);
  };

  const calculatePublicTransport = () => {
    const total =
      toNum(other.publicTransportDistance) * FIXED_PUBLIC_TRANSPORT_EMISSION_FACTOR;
    setResultOther(`${t.totalLabel}: ${fmtKgT(total)}`);
  };

  const calculateFreight = () => {
    const total =
      toNum(other.freightWeight) * FIXED_FREIGHT_BLENDED_EMISSION_FACTOR_PER_TONNE;
    setResultOther(`${t.totalLabel}: ${fmtKgT(total)}`);
  };

  const calculateWater = () => {
    const total = toNum(other.waterConsumed) * FIXED_WATER_BLENDED_EMISSION_FACTOR;
    setResultOther(`${t.totalLabel}: ${fmtKgT(total)}`);
  };

  const calculateWaste = () => {
    const total = toNum(other.totalWaste) * FIXED_WASTE_BLENDED_EMISSION_FACTOR;
    setResultOther(`${t.totalLabel}: ${fmtKgT(total)}`);
  };

  const calculateCommuting = () => {
    const perDay = toNum(other.commuteDistance) * 2 * FIXED_COMMUTE_BLENDED_EMISSION_FACTOR;
    const total = perDay * FIXED_COMMUTE_DAYS_PER_YEAR;
    setResultOther(`${t.totalLabel}: ${fmtKgT(total)}`);
  };

  // -------------------- RENDER --------------------
  return (
    <div style={{ background: "#f7fcf8", minHeight: "100vh", padding: 20 }}>
      {/* Original CSS inlined for parity & speed */}
       

      

      <h1>{t.appTitle}</h1>
      <p className="subtitle">{t.subtitle}</p>

      {/* Language + Print */}
      <div className="button-container">
        <select
          className="language-select"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        >
          <option value="en">🇬🇧 English</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="es">🇪🇸 Español</option>
        </select>
        <button className="print-button" onClick={() => window.print()}>
          {t.print}
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-container">
        <div className="tab-navigation">
          {["sme", "micro", "macro", "other"].map((key, idx) => (
            <button
              key={key}
              className={`tab-button ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {t.tabs[idx]}
            </button>
          ))}
        </div>
      </div>

      {/* SME TAB */}
      <div id="tab-sme" className={`tab-content ${activeTab === "sme" ? "active" : ""}`}>
        <div className="calculator-container">
          <div className="calculation-section" style={{ gridColumn: "1 / -1" }}>
            <h2>{t.smeTitle}</h2>

            <label htmlFor="smeCompanyName">{t.companyName}</label>
            <input
              id="smeCompanyName"
              className="name-field"
              value={sme.companyName}
              onChange={(e) => setSme({ ...sme, companyName: e.target.value })}
              placeholder="Enter your company name"
            />

            <label htmlFor="smeContact">{t.contactName}</label>
            <input
              id="smeContact"
              value={sme.contact}
              onChange={(e) => setSme({ ...sme, contact: e.target.value })}
              placeholder="e.g., John Smith"
            />

            <label htmlFor="smeEmail">{t.email}</label>
            <input
              id="smeEmail"
              value={sme.email}
              onChange={(e) => setSme({ ...sme, email: e.target.value })}
              placeholder="e.g., contact@company.com"
            />

            <label htmlFor="smePhone">{t.phone}</label>
            <input
              id="smePhone"
              value={sme.phone}
              onChange={(e) => setSme({ ...sme, phone: e.target.value })}
              placeholder="e.g., +1 234-567-8900"
            />

            <label htmlFor="smeStartDate">{t.startDate}</label>
            <input
              id="smeStartDate"
              type="date"
              value={sme.startDate}
              onChange={(e) => setSme({ ...sme, startDate: e.target.value })}
            />

            <label htmlFor="smeEndDate">{t.endDate}</label>
            <input
              id="smeEndDate"
              type="date"
              value={sme.endDate}
              onChange={(e) => setSme({ ...sme, endDate: e.target.value })}
            />

            <label htmlFor="smeIndustry">{t.industry}</label>
            <input
              id="smeIndustry"
              value={sme.industry}
              onChange={(e) => setSme({ ...sme, industry: e.target.value })}
              placeholder="e.g., Retail, IT Services"
            />

            <label htmlFor="smeEmployees">{t.employees}</label>
            <input
              id="smeEmployees"
              type="number"
              value={sme.employees}
              onChange={(e) => setSme({ ...sme, employees: e.target.value })}
              placeholder="e.g., 25"
            />

            <label htmlFor="smeBuildingArea">{t.buildingArea}</label>
            <input
              id="smeBuildingArea"
              type="number"
              value={sme.buildingArea}
              onChange={(e) => setSme({ ...sme, buildingArea: e.target.value })}
              placeholder="e.g., 500"
            />

            <label htmlFor="smeElectricityKWh">{t.electricityKWh}</label>
            <input
              id="smeElectricityKWh"
              type="number"
              value={sme.electricityKWh}
              onChange={(e) => setSme({ ...sme, electricityKWh: e.target.value })}
              placeholder="e.g., 10000"
            />

            <label htmlFor="smeNaturalGasM3">{t.naturalGasM3}</label>
            <input
              id="smeNaturalGasM3"
              type="number"
              value={sme.naturalGasM3}
              onChange={(e) => setSme({ ...sme, naturalGasM3: e.target.value })}
              placeholder="e.g., 500"
            />

            <label htmlFor="smeGasolineLiters">{t.gasolineL}</label>
            <input
              id="smeGasolineLiters"
              type="number"
              value={sme.gasolineLiters}
              onChange={(e) => setSme({ ...sme, gasolineLiters: e.target.value })}
              placeholder="e.g., 1000"
            />

            <label htmlFor="smeDieselLiters">{t.dieselL}</label>
            <input
              id="smeDieselLiters"
              type="number"
              value={sme.dieselLiters}
              onChange={(e) => setSme({ ...sme, dieselLiters: e.target.value })}
              placeholder="e.g., 500"
            />

            <button className="calc-button" onClick={calculateSME}>
              {t.calcSme}
            </button>
          </div>

          <div id="result-sme" className="result">
            {resultSme || t.resultPlaceholder}
          </div>
        </div>
      </div>

      {/* MICRO TAB */}
      <div id="tab-micro" className={`tab-content ${activeTab === "micro" ? "active" : ""}`}>
        <div className="calculator-container">
          <div className="calculation-section" style={{ gridColumn: "1 / -1" }}>
            <h2>{t.microTitle}</h2>
            <p>{t.microSub}</p>

            <label htmlFor="microEventName">{t.eventName}</label>
            <input
              id="microEventName"
              className="name-field"
              value={micro.eventName}
              onChange={(e) => setMicro({ ...micro, eventName: e.target.value })}
              placeholder="Enter event name"
            />

            <label htmlFor="microContact">{t.contactName}</label>
            <input
              id="microContact"
              value={micro.contact}
              onChange={(e) => setMicro({ ...micro, contact: e.target.value })}
              placeholder="e.g., Jane Doe"
            />

            <label htmlFor="microEmail">{t.email}</label>
            <input
              id="microEmail"
              value={micro.email}
              onChange={(e) => setMicro({ ...micro, email: e.target.value })}
              placeholder="e.g., event@organizer.com"
            />

            <label htmlFor="microPhone">{t.phone}</label>
            <input
              id="microPhone"
              value={micro.phone}
              onChange={(e) => setMicro({ ...micro, phone: e.target.value })}
              placeholder="e.g., +1 234-567-8900"
            />

            <label htmlFor="eventAttendees">{t.attendeesLT50}</label>
            <input
              id="eventAttendees"
              type="number"
              value={micro.attendees}
              onChange={(e) => setMicro({ ...micro, attendees: e.target.value })}
              placeholder="e.g., 45"
            />

            <label htmlFor="eventAvgTravelDistance">{t.avgTravelKm}</label>
            <input
              id="eventAvgTravelDistance"
              type="number"
              value={micro.avgTravelKm}
              onChange={(e) => setMicro({ ...micro, avgTravelKm: e.target.value })}
              placeholder="e.g., 20"
            />

            <label htmlFor="eventMealsPerAttendee">{t.mealsPerAttendee}</label>
            <input
              id="eventMealsPerAttendee"
              type="number"
              value={micro.mealsPerAttendee}
              onChange={(e) =>
                setMicro({ ...micro, mealsPerAttendee: e.target.value })
              }
              placeholder="e.g., 1 (enter 0 if no meals)"
            />

            <label htmlFor="eventDurationHours">{t.durationHrs}</label>
            <input
              id="eventDurationHours"
              type="number"
              value={micro.durationHours}
              onChange={(e) =>
                setMicro({ ...micro, durationHours: e.target.value })
              }
              placeholder="e.g., 4"
            />

            <button className="calc-button" onClick={calculateMicro}>
              {t.calcMicro}
            </button>
          </div>

          <div id="result-micro" className="result">
            {resultMicro || t.resultPlaceholder}
          </div>
        </div>
      </div>

      {/* MACRO TAB */}
      <div id="tab-macro" className={`tab-content ${activeTab === "macro" ? "active" : ""}`}>
        <div className="calculator-container">
          <div className="calculation-section" style={{ gridColumn: "1 / -1" }}>
            <h2>{t.macroTitle}</h2>
            <p>{t.macroSub}</p>

            <label htmlFor="macroEventName">{t.eventName}</label>
            <input
              id="macroEventName"
              className="name-field"
              value={macro.eventName}
              onChange={(e) => setMacro({ ...macro, eventName: e.target.value })}
              placeholder="Enter event name"
            />

            <label htmlFor="macroContact">{t.contactName}</label>
            <input
              id="macroContact"
              value={macro.contact}
              onChange={(e) => setMacro({ ...macro, contact: e.target.value })}
              placeholder="e.g., Jane Doe"
            />

            <label htmlFor="macroEmail">{t.email}</label>
            <input
              id="macroEmail"
              value={macro.email}
              onChange={(e) => setMacro({ ...macro, email: e.target.value })}
              placeholder="e.g., event@organizer.com"
            />

            <label htmlFor="macroPhone">{t.phone}</label>
            <input
              id="macroPhone"
              value={macro.phone}
              onChange={(e) => setMacro({ ...macro, phone: e.target.value })}
              placeholder="e.g., +1 234-567-8900"
            />

            <label htmlFor="buildingAttendees">{t.attendeesGT50}</label>
            <input
              id="buildingAttendees"
              type="number"
              value={macro.attendees}
              onChange={(e) => setMacro({ ...macro, attendees: e.target.value })}
              placeholder="e.g., 500"
            />

            <label htmlFor="buildingAvgTravelDistance">
              {t.avgAttendeeTravelKm}
            </label>
            <input
              id="buildingAvgTravelDistance"
              type="number"
              value={macro.avgTravelKm}
              onChange={(e) => setMacro({ ...macro, avgTravelKm: e.target.value })}
              placeholder="e.g., 10"
            />

            <label htmlFor="buildingMealsPerAttendee">
              {t.mealsPerAttendeeMacro}
            </label>
            <input
              id="buildingMealsPerAttendee"
              type="number"
              value={macro.mealsPerAttendee}
              onChange={(e) =>
                setMacro({ ...macro, mealsPerAttendee: e.target.value })
              }
              placeholder="e.g., 0.5 (enter 0 if no meals)"
            />

            <label htmlFor="buildingDurationHours">{t.durationHrsMacro}</label>
            <input
              id="buildingDurationHours"
              type="number"
              value={macro.durationHours}
              onChange={(e) =>
                setMacro({ ...macro, durationHours: e.target.value })
              }
              placeholder="e.g., 2"
            />

            <hr />

            <label htmlFor="buildingElectricityKWh">{t.electricityConsumed}</label>
            <input
              id="buildingElectricityKWh"
              type="number"
              value={macro.electricityKWh}
              onChange={(e) =>
                setMacro({ ...macro, electricityKWh: e.target.value })
              }
              placeholder="e.g., 150"
            />

            <label htmlFor="buildingNaturalGasM3">{t.naturalGasConsumed}</label>
            <input
              id="buildingNaturalGasM3"
              type="number"
              value={macro.naturalGasM3}
              onChange={(e) =>
                setMacro({ ...macro, naturalGasM3: e.target.value })
              }
              placeholder="e.g., 20"
            />

            <label htmlFor="buildingWaterLiters">{t.waterLiters}</label>
            <input
              id="buildingWaterLiters"
              type="number"
              value={macro.waterLiters}
              onChange={(e) => setMacro({ ...macro, waterLiters: e.target.value })}
              placeholder="e.g., 500"
            />

            <label htmlFor="buildingLandfilledWasteKg">{t.landfilledKg}</label>
            <input
              id="buildingLandfilledWasteKg"
              type="number"
              value={macro.landfilledWasteKg}
              onChange={(e) =>
                setMacro({ ...macro, landfilledWasteKg: e.target.value })
              }
              placeholder="e.g., 10"
            />

            <label htmlFor="buildingRecycledWasteKg">{t.recycledKg}</label>
            <input
              id="buildingRecycledWasteKg"
              type="number"
              value={macro.recycledWasteKg}
              onChange={(e) =>
                setMacro({ ...macro, recycledWasteKg: e.target.value })
              }
              placeholder="e.g., 5"
            />

            <label htmlFor="buildingCompostedWasteKg">{t.compostedKg}</label>
            <input
              id="buildingCompostedWasteKg"
              type="number"
              value={macro.compostedWasteKg}
              onChange={(e) =>
                setMacro({ ...macro, compostedWasteKg: e.target.value })
              }
              placeholder="e.g., 2"
            />

            <button className="calc-button" onClick={calculateMacro}>
              {t.calcMacro}
            </button>
          </div>

          <div id="result-macro" className="result">
            {resultMacro || t.resultPlaceholder}
          </div>
        </div>
      </div>

      {/* OTHER TAB */}
      <div id="tab-other" className={`tab-content ${activeTab === "other" ? "active" : ""}`}>
        <div className="calculator-container">
          <div className="calculation-section">
            <label htmlFor="flightsType">{t.otherFlights}</label>
            <select
              id="flightsType"
              value={other.flightsType}
              onChange={(e) => setOther({ ...other, flightsType: e.target.value })}
            >
              <option value="recreational_aircraft">Recreational Aircraft</option>
              <option value="commercial_aircraft">Commercial Aircraft</option>
              <option value="amphibious_aircraft">Amphibious Aircraft</option>
              <option value="helicopter">Helicopter</option>
            </select>
            <label htmlFor="flightsDistance">Flight Distance (km):</label>
            <input
              id="flightsDistance"
              type="number"
              value={other.flightsDistance}
              onChange={(e) =>
                setOther({ ...other, flightsDistance: e.target.value })
              }
              placeholder="e.g., 500"
            />
            <button className="calc-button" onClick={calculateFlights}>
              {t.calcFlight}
            </button>
          </div>

          <div className="calculation-section">
            <label htmlFor="vehicleType">{t.otherVehicles}</label>
            <select
              id="vehicleType"
              value={other.vehicleType}
              onChange={(e) => setOther({ ...other, vehicleType: e.target.value })}
            >
              <option value="sedan">Sedan</option>
              <option value="van">Van</option>
              <option value="suv_4x4">SUV / 4x4</option>
              <option value="truck">Truck</option>
            </select>
            <label htmlFor="vehicleDistance">Distance Traveled (km):</label>
            <input
              id="vehicleDistance"
              type="number"
              value={other.vehicleDistance}
              onChange={(e) =>
                setOther({ ...other, vehicleDistance: e.target.value })
              }
              placeholder="e.g., 100"
            />
            <button className="calc-button" onClick={calculateVehicle}>
              {t.calcVehicle}
            </button>
          </div>

          <div className="calculation-section">
            <label htmlFor="vesselType">{t.otherVessels}</label>
            <select
              id="vesselType"
              value={other.vesselType}
              onChange={(e) => setOther({ ...other, vesselType: e.target.value })}
            >
              <option value="motor_boat_gasoline">Motor Boat (Gasoline)</option>
              <option value="motor_boat_diesel">Motor Boat (Diesel)</option>
              <option value="electric_sail_boat">Electric/Sail Boat</option>
              <option value="yacht_gasoline">Yacht (Gasoline)</option>
              <option value="yacht_diesel">Yacht (Diesel)</option>
              <option value="yacht_electric">Yacht (Electric)</option>
            </select>
            <label htmlFor="vesselDistance">Distance Traveled (km):</label>
            <input
              id="vesselDistance"
              type="number"
              value={other.vesselDistance}
              onChange={(e) =>
                setOther({ ...other, vesselDistance: e.target.value })
              }
              placeholder="e.g., 50"
            />
            <button className="calc-button" onClick={calculateVessel}>
              {t.calcVessel}
            </button>
          </div>

          <div className="calculation-section">
            <label htmlFor="publicTransportDistance">{t.publicTransportKm}</label>
            <input
              id="publicTransportDistance"
              type="number"
              value={other.publicTransportDistance}
              onChange={(e) =>
                setOther({ ...other, publicTransportDistance: e.target.value })
              }
              placeholder="e.g., 50"
            />
            <button className="calc-button" onClick={calculatePublicTransport}>
              {t.calcPublicTransport}
            </button>
          </div>

          <div className="calculation-section">
            <label htmlFor="freightWeight">{t.freightTonnes}</label>
            <input
              id="freightWeight"
              type="number"
              value={other.freightWeight}
              onChange={(e) =>
                setOther({ ...other, freightWeight: e.target.value })
              }
              placeholder="e.g., 10"
            />
            <button className="calc-button" onClick={calculateFreight}>
              {t.calcFreight}
            </button>
          </div>

          <div className="calculation-section">
            <label htmlFor="waterConsumed">{t.waterConsumed}</label>
            <input
              id="waterConsumed"
              type="number"
              value={other.waterConsumed}
              onChange={(e) =>
                setOther({ ...other, waterConsumed: e.target.value })
              }
              placeholder="e.g., 1000"
            />
            <button className="calc-button" onClick={calculateWater}>
              {t.calcWater}
            </button>
          </div>

          <div className="calculation-section">
            <label htmlFor="totalWaste">{t.totalWaste}</label>
            <input
              id="totalWaste"
              type="number"
              value={other.totalWaste}
              onChange={(e) =>
                setOther({ ...other, totalWaste: e.target.value })
              }
              placeholder="e.g., 50"
            />
            <button className="calc-button" onClick={calculateWaste}>
              {t.calcWaste}
            </button>
          </div>

          <div className="calculation-section">
            <label htmlFor="commuteDistance">{t.commuteOneWayKm}</label>
            <input
              id="commuteDistance"
              type="number"
              value={other.commuteDistance}
              onChange={(e) =>
                setOther({ ...other, commuteDistance: e.target.value })
              }
              placeholder="e.g., 15"
            />
            <button className="calc-button" onClick={calculateCommuting}>
              {t.calcCommute}
            </button>
          </div>

          <div id="result-other" className="result">
            {resultOther || t.resultPlaceholder}
          </div>
        </div>
      </div>
    </div>
  );
}


export default CarbonEmissionsCalculator;
