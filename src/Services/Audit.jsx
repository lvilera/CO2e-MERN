import { useMemo, useState } from "react";
import { API_BASE } from "../config";
import "./Audit.css";

const Audit = () => {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState({ pdf: false, html: false });
  const [error, setError] = useState(null);

  const hostLabel = useMemo(() => {
    try {
      const u = new URL(url.trim());
      return (u.hostname || "report").replace(/[^a-zA-Z0-9.-]/g, "_");
    } catch {
      return "report";
    }
  }, [url]);

  const handleChange = (e) => setUrl(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setData(null);
    setError(null);
    setLoading(true);

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
      console.log("Error: ", err);
      setError("Failed to connect to the audit server. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Download helper (no backend changes) ----
  const downloadFromUrl = async ({ fileUrl, fallbackName }) => {
    // fileUrl might be "/reports/xyz.pdf" or full "https://..."
    const absoluteUrl =
      typeof fileUrl === "string" && fileUrl.startsWith("http")
        ? fileUrl
        : `${API_BASE}${fileUrl}`;

    const res = await fetch(absoluteUrl, {
      method: "GET",
      // If your backend requires cookies/auth, enable the next line:
      // credentials: "include",
    });

    if (!res.ok) {
      // Try to read JSON error, otherwise generic
      let msg = `Download failed (${res.status})`;
      try {
        const t = await res.text();
        if (t) msg = t;
      } catch {}
      throw new Error(msg);
    }

    // Try to extract filename from Content-Disposition header if present
    let filename = fallbackName;
    const cd = res.headers.get("content-disposition");
    if (cd) {
      // handles: attachment; filename="report.pdf"
      const match = cd.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)/i);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1].replace(/"/g, "").trim());
      }
    }

    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename || fallbackName || "download";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(objectUrl);
  };

  const downloadPdf = async () => {
    if (!data?.pdfPath) return;
    setError(null);
    setDownloading((s) => ({ ...s, pdf: true }));
    try {
      await downloadFromUrl({
        fileUrl: data.pdfPath,
        fallbackName: `audit-${hostLabel}.pdf`,
      });
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Could not download the PDF. Your backend may be sending inline content or blocking CORS."
      );
    } finally {
      setDownloading((s) => ({ ...s, pdf: false }));
    }
  };

  const downloadHtml = async () => {
    if (!data?.htmlPath) return;
    setError(null);
    setDownloading((s) => ({ ...s, html: true }));
    try {
      await downloadFromUrl({
        fileUrl: data.htmlPath,
        fallbackName: `audit-${hostLabel}.html`,
      });
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Could not download the HTML. Your backend may be sending inline content or blocking CORS."
      );
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
          id="url-input"
          value={url}
          onChange={handleChange}
          placeholder="https://example.com"
          required
        />
        <button type="submit" disabled={loading || !url.trim()}>
          {loading ? "Running..." : "Run Audit"}
        </button>
      </form>

      {loading ? (
        <div id="loading" className="spinner-container">
          <div className="spinner"></div>
          <p>Running audit, please wait...</p>
        </div>
      ) : error ? (
        <div id="error-message" className="error-message">
          {error}
        </div>
      ) : data ? (
        <div id="results">
          <h2>Audit Complete!</h2>
          <p>Your reports are ready. Download them below:</p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="button" onClick={downloadHtml} disabled={downloading.html}>
              {downloading.html ? "Downloading HTML..." : "Download HTML Report"}
            </button>

            <button type="button" onClick={downloadPdf} disabled={downloading.pdf}>
              {downloading.pdf ? "Downloading PDF..." : "Download PDF Report"}
            </button>
          </div>

           
        </div>
      ) : null}
    </div>
  );
};

export default Audit;
