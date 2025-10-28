import { useEffect, useRef } from "react";

const Result = ({ co2e, suggestions, error }) => {
    const resultRef = useRef(null);

    useEffect(() => {
        if ((co2e || error) && resultRef?.current) {
            const header = document.getElementById('hhw');
            const headerHeight = header ? header.getBoundingClientRect().height + 10 : 0;

            const elementPosition = resultRef.current.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - headerHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    }, [co2e, error, resultRef]);

    return (
        <div ref={resultRef} className={`result ${error ? 'error' : ''}`}>
            {error ?
                <div>{error}</div>
                :
                co2e ?
                    <div>
                        <p><strong>Estimated CO2e: {co2e.toFixed(2)} kg CO2e</strong></p>
                        <p>Suggestions to reduce and offset this CO2e:</p>
                        <ul>
                            {suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                        </ul>
                    </div>
                    :
                    <div className="">Your CO2e calculation will appear here.</div>
            }
        </div>
    )
};

export default Result;
