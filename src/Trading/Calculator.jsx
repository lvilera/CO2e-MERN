import { useState, useRef } from 'react';
import './Calculator.css';
import FlightCalculator from "./components/FlightCalculator";
import VehicleCalculator from './components/VehicleCalculator';
import BoatCalculator from './components/BoatCalculator';
import FuelConsumedCalculator from './components/FuelConsumedCalculator';
import PublicTransportCalculator from './components/PublicTransportCalculator';
import FreightWeightCalculator from './components/FreightWeightCalculator';
import WaterConsumedCalculator from './components/WaterConsumedCalculator';
import TotalWasteCalculator from './components/TotalWasteCalculator';
import CommuteCalculator from './components/CommuteCalculator';
import Result from './components/Result';
import SMECalculator from './components/SMECalculator';
import MicroCalculator from './components/MicroCalculator';
import MacroCalculator from './components/MacroCalculator';

const Calculator = () => {
    const [co2e, setCo2e] = useState(null);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    const showResult = (co2e_, suggestions_ = [], errorMessage = null) => {
        console.log("Data: ", co2e_, suggestions_, errorMessage);
        if (errorMessage) {
            setCo2e(null);
            setError(errorMessage);
            setSuggestions([]);
            return;
        }
        const extraSuggestions = [
            `Consider taking action to offset your ${co2e_.toFixed(2)} kg CO2e by: planting a tree, participating in Climate projects, etc.`,
            `Purchase and retire Carbon Credits to offset your ${co2e_.toFixed(2)} kg CO2e emissions.`
        ];
        const finalSuggestions = suggestions_.concat(extraSuggestions);

        setCo2e(co2e_);
        setError(errorMessage);
        setSuggestions(finalSuggestions);
    };

    return (
        <div className="calculator-container">
            <SMECalculator showResult={showResult} />
            <FlightCalculator showResult={showResult} />
            <VehicleCalculator showResult={showResult} />
            <BoatCalculator showResult={showResult} />
            <FuelConsumedCalculator showResult={showResult} />
            <PublicTransportCalculator showResult={showResult} />
            <FreightWeightCalculator showResult={showResult} />
            <WaterConsumedCalculator showResult={showResult} />
            <TotalWasteCalculator showResult={showResult} />
            <CommuteCalculator showResult={showResult} />
            <div className="event-comparison-container">
                <MicroCalculator showResult={showResult} />
                <MacroCalculator showResult={showResult} />
            </div>
            <Result co2e={co2e} error={error} suggestions={suggestions} />
        </div>
    )
};

export default Calculator;
