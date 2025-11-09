import { useState } from "react";
import './Audit.css';
import { API_BASE } from "../config";

const Audit = () => {
    const [url, setUrl] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setUrl(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setData(null);
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/api/audit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (response.ok) {
                setData(data);
            } else {
                setError(data.error || 'An unexpected error occurred during the audit.');
            }
        } catch (error) {
            console.log("Error: ", error);
            setError("Failed to connect to the audit server. Please check your network and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="audit-container">
            <header>
                <div className="logo">
                    <img src="/CO2e PORTAL_4.png" alt="CO2e PORTAL logo" />
                </div>
                <h1>Website Carbon Emissions</h1>
                <h1>&</h1>
                <h1>Performance Audit</h1>

                <p>Enter a URL to analyze its environmental impact and performance.</p>
            </header>

            <form id="audit-form" onSubmit={handleSubmit}>
                <input type="url" id="url-input" value={url} onChange={handleChange} placeholder="https://example.com" required />
                <button type="submit" disabled={loading}>Run Audit</button>
            </form>

            {loading ?
                <div id="loading" className="spinner-container">
                    <div className="spinner"></div>
                    <p>Running audit, please wait...</p>
                </div>
                : error ?
                    <div id="error-message" className="error-message">
                        {error}
                    </div>
                    : data ?
                        <div id="results" className="">
                            <h2>Audit Complete!</h2>
                            <p>View your reports below:</p>
                            <p><a href={API_BASE + data?.htmlPath} target="_blank" rel="noreferrer">View HTML Report</a></p>
                            <p><a href={API_BASE + data?.pdfPath} target="_blank" rel="noreferrer">Download PDF Report</a></p>
                        </div>
                        :
                        <></>
            }
        </div>
    )
};

export default Audit;
