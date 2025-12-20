import { useMemo, useRef, useState } from "react";
import { API_BASE } from "../config";
import "./Audit.css";

const Audit = () => {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState({ pdf: false, html: false });
  const [error, setError] = useState(null);

  // Freeze timestamp per audit run
  const timestampRef = useRef(null);

  const hostLabel = useMemo(() => {
    try {
      return new URL(url).hostname.replace(/[^a-zA-Z0-9.-]/g, "_");
    } catch {
      return "report";
    }
  }, [url]);

  const buildTimestamp = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");

    return (
      `${d.getFullYear()}-` +
      `${pad(d.getMonth() + 1)}-` +
      `${pad(d.getDate())}_` +
      `${pad(d.getHours())}-` +
      `${pad(d.getMinutes())}-` +
      `${pad(d.getSeconds())}`
    );
  };

  const handleChange = (e) => setUrl(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setData(null);
    setError(null);
    setLoading(true);

    timestampRef.current = buildTimestamp();

    try {
      const response = await fetch(`${API_BASE}/api/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const json = await response.json();

      if (response.ok) {
        setData(json);
      } else {
        setError(json.error || "An unexpected error occurred during the audit.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the audit server. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadFromUrl = async ({ fileUrl, fallbackName }) => {
    const absoluteUrl =
      fileUrl.startsWith("http") ? fileUrl : `${API_BASE}${fileUrl}`;

    const res = await fetch(absoluteUrl);
    if (!res.ok) throw new Error(`Download failed (${res.status})`);

    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = fallbackName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(objectUrl);
  };

  const downloadPdf = async () => {
    if (!data?.pdfPath) return;
    setDownloading((s) => ({ ...s, pdf: true }));
    try {
      await downloadFromUrl({
        fileUrl: data.pdfPath,
        fallbackName: `audit-${hostLabel}-${timestampRef.current}.pdf`,
      });
    } catch (err) {
      console.error(err);
      setError("PDF download failed.");
    } finally {
      setDownloading((s) => ({ ...s, pdf: false }));
    }
  };

  const downloadHtml = async () => {
    if (!data?.htmlPath) return;
    setDownloading((s) => ({ ...s, html: true }));
    try {
      await downloadFromUrl({
        fileUrl: data.htmlPath,
        fallbackName: `audit-${hostLabel}-${timestampRef.current}.html`,
      });
    } catch (err) {
      console.error(err);
      setError("HTML download failed.");
    } finally {
      setDownloading((s) => ({ ...s, html: false }));
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
        <input
          type="url"
          value={url}
          onChange={handleChange}
          placeholder="https://example.com"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Running..." : "Run Audit"}
        </button>
      </form>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Running audit, please wait...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : data ? (
        <div id="results">
          <h2>Audit Complete!</h2>
          <p>Download your reports:</p>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={downloadHtml} disabled={downloading.html}>
              {downloading.html ? "Downloading HTML..." : "Download HTML"}
            </button>

            <button onClick={downloadPdf} disabled={downloading.pdf}>
              {downloading.pdf ? "Downloading PDF..." : "Download PDF"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Audit;
