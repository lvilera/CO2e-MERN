import axios from "axios";
import { useEffect, useState } from "react";
import DynamicHeader from "./components/DynamicHeader";
import { API_BASE_URL } from "./config";

const CO2ePortalAuditToolkit = () => {
  // ---------- STATE ----------
  const [lang, setLang] = useState("en");
  const [activeTab, setActiveTab] = useState(0);

  // Org info
  const [orgName, setOrgName] = useState("");
  const [siteAddresses, setSiteAddresses] = useState("");
  const [reportStart, setReportStart] = useState("");
  const [reportEnd, setReportEnd] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Raw inputs
  const [fuelFactor, setFuelFactor] = useState(0);
  const [fuelVol, setFuelVol] = useState(0);
  const [gridFactor, setGridFactor] = useState(0);
  const [kwh, setKwh] = useState(0);
  const [mileage, setMileage] = useState(0);
  const [waste, setWaste] = useState(0);
  const [employees, setEmployees] = useState(0);

  // Calculated (client preview)
  const [fuelKg, setFuelKg] = useState(0);
  const [elecKg, setElecKg] = useState(0);
  const [transKg, setTransKg] = useState(0);
  const [wasteKg, setWasteKg] = useState(0);
  const [scope1Tonnes, setScope1Tonnes] = useState(0);
  const [scope2Tonnes, setScope2Tonnes] = useState(0);
  const [scope3Tonnes, setScope3Tonnes] = useState(0);
  const [totalTonnes, setTotalTonnes] = useState(0);

  // Admin list
  const [audits, setAudits] = useState([]);
  const [editAuditId, setEditAuditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // ---------- I18N ----------
  const text = {
    en: {
      title: "CO2ePortal Audit Toolkit",
      subtitle: "Master Questionnaire",
      tabs: [
        "Org Info",
        "Energy",
        "Transport",
        "Refrigerants",
        "Waste",
        "Procurement",
        "Travel",
        "Summary",
      ],
      orgTitle: "Section A: Organization Context",
      energyTitle: "Stationary Combustion (Scope 1)",
      elecTitle: "Purchased Electricity (Scope 2)",
      transTitle: "Company Fleet & Business Travel",
      refTitle: "Refrigerants & Process Emissions",
      wasteTitle: "Waste & Water",
      procTitle: "Procurement",
      travelTitle: "Travel & Commuting",
      summaryTitle: "Summary & Results",
      totalLabel: "Total GHG Emissions",
      catLabel: "Emissions by Category",
      intensityLabel: "Intensity Metrics",
      perEmpLabel: "Emissions per Employee",
      btnSave: editAuditId ? "Update Audit" : "Save Progress",
      btnPrint: "Print / Save as PDF",
      lbl1: "Legal name and subsidiaries 🔑",
      lbl2: "All site addresses 🔑",
      lbl3: "Reporting year start 🔑",
      lbl4: "Reporting year end 🔑",
      lbl5: "Primary contact - Name",
      lbl6: "Contact - Email",
      lbl7: "Contact - Phone",
      lbl10: "Fuel Type 🔑",
      lbl11: "Annual Volume",
      lbl12: "Grid Region 🔑",
      lbl13: "Annual Electricity (kWh) 🔑",
      lbl20: "Number of company vehicles",
      lbl21: "Total annual mileage (km)",
      lbl30: "Do you have refrigeration/AC equipment?",
      lbl40: "Annual waste (kg)",
      lbl50: "Top supplier name",
      lbl51: "Annual spend (CAD)",
      lbl60: "Number of employees",
      lbl61: "Average commute distance (km)",
      listTitle: "Saved Audits",
    },
    fr: {},
    es: {},
  };
  const t = text[lang] || text.en;

  // ---------- CALCULATION ----------
  useEffect(() => {
    const fuelValKg = (fuelFactor || 0) * (fuelVol || 0);
    const elecValKg = (gridFactor || 0) * (kwh || 0);
    const transValKg = (mileage || 0) * 0.192;
    const wasteValKg = (waste || 0) * 0.456;

    setFuelKg(fuelValKg);
    setElecKg(elecValKg);
    setTransKg(transValKg);
    setWasteKg(wasteValKg);

    const s1 = fuelValKg + transValKg;
    const s2 = elecValKg;
    const s3 = wasteValKg;
    const totalAll = s1 + s2 + s3;

    setScope1Tonnes(s1 / 1000);
    setScope2Tonnes(s2 / 1000);
    setScope3Tonnes(s3 / 1000);
    setTotalTonnes(totalAll / 1000);
  }, [fuelFactor, fuelVol, gridFactor, kwh, mileage, waste, employees]);

  // ---------- API ----------
  const payload = () => ({
    lang,
    orgName,
    siteAddresses,
    reportStart: reportStart || null,
    reportEnd: reportEnd || null,
    contactName,
    contactEmail,
    contactPhone,
    fuelFactor,
    fuelVol,
    gridFactor,
    kwh,
    mileage,
    waste,
    employees,
  });

  const fetchAudits = async () => {
    try {
      if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
      const { data } = await axios.get(
        `${API_BASE_URL}/api/audits?limit=100`,
        { withCredentials: false }
      );
      setAudits(Array.isArray(data.items) ? data.items : []);
      setErr("");
    } catch (e) {
      console.error(e);
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to fetch audits"
      );
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const resetForm = () => {
    setEditAuditId(null);
    setMsg("");
    setErr("");
    setOrgName("");
    setSiteAddresses("");
    setReportStart("");
    setReportEnd("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setFuelFactor(0);
    setFuelVol(0);
    setGridFactor(0);
    setKwh(0);
    setMileage(0);
    setWaste(0);
    setEmployees(0);
  };

  const hydrateFromDoc = (doc) => {
    setLang(doc.lang || "en");
    setOrgName(doc.orgName || "");
    setSiteAddresses(doc.siteAddresses || "");
    setReportStart(doc.reportStart ? doc.reportStart.slice(0, 10) : "");
    setReportEnd(doc.reportEnd ? doc.reportEnd.slice(0, 10) : "");
    setContactName(doc.contactName || "");
    setContactEmail(doc.contactEmail || "");
    setContactPhone(doc.contactPhone || "");
    setFuelFactor(Number(doc.fuelFactor || 0));
    setFuelVol(Number(doc.fuelVol || 0));
    setGridFactor(Number(doc.gridFactor || 0));
    setKwh(Number(doc.kwh || 0));
    setMileage(Number(doc.mileage || 0));
    setWaste(Number(doc.waste || 0));
    setEmployees(Number(doc.employees || 0));
  };

  const handleSave = async () => {
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
      if (editAuditId) {
        const { data } = await axios.put(
          `${API_BASE_URL}/api/audits/${editAuditId}`,
          payload()
        );
        hydrateFromDoc(data);
        setMsg("Audit updated successfully.");
      } else {
        const { data } = await axios.post(
          `${API_BASE_URL}/api/audits`,
          payload()
        );
        setEditAuditId(data._id);
        hydrateFromDoc(data);
        setMsg("Audit saved successfully.");
      }
      await fetchAudits();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doc) => {
    setEditAuditId(doc._id);
    hydrateFromDoc(doc);
    setActiveTab(0);
    setMsg("");
    setErr("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this audit?") === false) return;
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
      await axios.delete(`${API_BASE_URL}/api/audits/${id}`);
      if (editAuditId === id) resetForm();
      setMsg("Audit deleted.");
      await fetchAudits();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  // ---------- UI ----------
  return (
    <>
      <style>{`
        .tabs { margin-top:225px; display:flex; background:#f3f4f6; border-bottom:2px solid #e5e7eb; overflow-x:auto; }
        .tab { padding:20px 30px; border:none; background:transparent; cursor:pointer; font-weight:600; color:#6b7280; border-bottom:4px solid transparent; white-space:nowrap; }
        .tab.active { background:#fff; color:#9333ea; border-bottom-color:#9333ea; }
        .content { padding:40px; min-height:500px; }
        .tab-content { display:none; }
        .tab-content.active { display:block; }
        .section { margin-bottom:40px; }
        .section h3 { font-size:1.8rem; color:#1f2937; margin-bottom:20px; border-bottom:2px solid #9333ea; padding-bottom:10px; }
        .field { margin-bottom:20px; padding:15px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; }
        .field.key { background:#fef3c7; border:2px solid #fbbf24; }
        .field label { display:block; font-weight:600; margin-bottom:8px; color:#1f2937; }
        .field input, .field select, .field textarea { width:100%; padding:12px; border:2px solid #d1d5db; border-radius:6px; font-family:inherit; }
        .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        .result-box { background:#dcfce7; border:2px solid #16a34a; border-radius:8px; padding:20px; margin:20px 0; }
        .result-value { font-size:1.5rem; font-weight:bold; color:#15803d; margin:10px 0; }
        .summary-card { background:linear-gradient(135deg,#9333ea 0%,#7e22ce 100%); color:#fff; padding:30px; border-radius:12px; text-align:center; margin-bottom:30px; }
        .summary-total { font-size:3rem; font-weight:bold; margin:10px 0; }
        .scope-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-bottom:30px; }
        .scope-box { padding:20px; border-radius:10px; text-align:center; }
        .scope-box.s1 { background:#fef3c7; border:2px solid #f59e0b; color:#92400e; }
        .scope-box.s2 { background:#dbeafe; border:2px solid #3b82f6; color:#1e40af; }
        .scope-box.s3 { background:#d1fae5; border:2px solid #10b981; color:#065f46; }
        .scope-value { font-size:2rem; font-weight:bold; margin:10px 0; }
        .footerSec { display:flex; justify-content:center; gap:12px; padding:24px; }
        .btn { background:#9333ea; color:#fff; padding:15px 40px; border:none; border-radius:8px; font-weight:700; cursor:pointer; box-shadow:0 4px 6px rgba(0,0,0,0.1); }
        .btn:hover { background:#7e22ce; }
        .btn-secondary { background:#4b5563; }
        .btn-secondary:hover { background:#374151; }
        .banner { max-width:1200px; margin:0 auto; background:#fff; border-radius:12px; box-shadow:0 20px 60px rgba(0,0,0,0.1); overflow:hidden; position:relative; }
        .admin-list { max-width:1200px; margin:1.5rem auto 3rem; background:#fff; border-radius:12px; box-shadow:0 2px 8px #eee; padding:20px; }
        table { width:100%; border-collapse:collapse; }
        th, td { padding:10px; border:1px solid #e5e7eb; text-align:left; }
        thead tr { background:#f9fafb; }
        .actions { display:flex; gap:8px; }
        .pill { padding:2px 8px; border-radius:999px; background:#f1f5f9; font-size:.8rem; }
        .status { margin:12px auto; max-width:1200px; }
        .status .ok { color:#16a34a; }
        .status .err { color:#dc2626; }
        @media (max-width: 768px) { .grid-2 { grid-template-columns:1fr; } }
      `}</style>

      <DynamicHeader />

      {/* Tabs */}
      <div className="tabs">
        {t.tabs.map((tabLabel, i) => (
          <button
            key={i}
            className={`tab ${activeTab === i ? "active" : ""}`}
            onClick={() => setActiveTab(i)}
          >
            {i === 0 && (
              <>
                <span style={{ fontSize: "1.2rem" }}>📋</span>
                <br />
              </>
            )}
            {i === 1 && (
              <>
                <span style={{ fontSize: "1.2rem" }}>⚡</span>
                <br />
              </>
            )}
            {i === 2 && (
              <>
                <span style={{ fontSize: "1.2rem" }}>🚗</span>
                <br />
              </>
            )}
            {i === 3 && (
              <>
                <span style={{ fontSize: "1.2rem" }}>❄️</span>
                <br />
              </>
            )}
            {i === 4 && (
              <>
                <span style={{ fontSize: "1.2rem" }}>♻️</span>
                <br />
              </>
            )}
            {i === 5 && (
              <>
                <span style={{ fontSize: "1.2rem" }}>📦</span>
                <br />
              </>
            )}
            {i === 6 && (
              <>
                <span style={{ fontSize: "1.2rem" }}>✈️</span>
                <br />
              </>
            )}
            {i === 7 && (
              <>
                <span style={{ fontSize: "1.2rem" }}>📊</span>
                <br />
              </>
            )}
            <span>{tabLabel}</span>
          </button>
        ))}
      </div>

      <div className="banner">
        <div className="content">
          {/* TAB 0: ORG INFO */}
          <div className={`tab-content ${activeTab === 0 ? "active" : ""}`} id="content0">
            <div className="section">
              <h3 id="orgTitle">{t.orgTitle}</h3>

              <div className="field key">
                <label id="lbl1">{t.lbl1}</label>
                <input
                  type="text"
                  placeholder="Full legal entity name..."
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>

              <div className="field key">
                <label id="lbl2">{t.lbl2}</label>
                <textarea
                  placeholder="List all physical locations..."
                  value={siteAddresses}
                  onChange={(e) => setSiteAddresses(e.target.value)}
                />
              </div>

              <div className="grid-2">
                <div className="field key">
                  <label id="lbl3">{t.lbl3}</label>
                  <input
                    type="date"
                    value={reportStart}
                    onChange={(e) => setReportStart(e.target.value)}
                  />
                </div>
                <div className="field key">
                  <label id="lbl4">{t.lbl4}</label>
                  <input
                    type="date"
                    value={reportEnd}
                    onChange={(e) => setReportEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label id="lbl5">{t.lbl5}</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>

              <div className="grid-2">
                <div className="field">
                  <label id="lbl6">{t.lbl6}</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label id="lbl7">{t.lbl7}</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: ENERGY */}
          <div className={`tab-content ${activeTab === 1 ? "active" : ""}`} id="content1">
            <div className="section">
              <h3 id="energyTitle">⚡ {t.energyTitle}</h3>

              <div className="field key">
                <label id="lbl10">{t.lbl10}</label>
                <select
                  id="fuelType"
                  value={fuelFactor || ""}
                  onChange={(e) => setFuelFactor(parseFloat(e.target.value) || 0)}
                >
                  <option value="">-- Select --</option>
                  <option value="1.879">Natural Gas (m³) - 1.879 kg CO2e/m³</option>
                  <option value="2.663">Diesel (L) - 2.663 kg CO2e/L</option>
                  <option value="1.512">LPG (L) - 1.512 kg CO2e/L</option>
                  <option value="2.753">Heating Oil (L) - 2.753 kg CO2e/L</option>
                  <option value="1.505">Propane (L) - 1.505 kg CO2e/L</option>
                </select>
              </div>

              <div className="field">
                <label id="lbl11">{t.lbl11}</label>
                <input
                  type="number"
                  id="fuelVol"
                  placeholder="0.00"
                  value={fuelVol || ""}
                  onChange={(e) => setFuelVol(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="result-box">
                <strong style={{ color: "#15803d" }}>Calculated Emissions:</strong>
                <div className="result-value" id="fuelResult">
                  {(fuelKg / 1000).toFixed(3)} tonnes CO2e
                </div>
                <div id="fuelDetails" style={{ color: "#047857", fontSize: "0.9rem" }}>
                  {fuelKg > 0 ? `(${fuelKg.toFixed(0)} kg CO2e)` : ""}
                </div>
              </div>
            </div>

            <div className="section">
              <h3 id="elecTitle">💡 {t.elecTitle}</h3>

              <div className="field key">
                <label id="lbl12">{t.lbl12}</label>
                <select
                  id="grid"
                  value={gridFactor || ""}
                  onChange={(e) => setGridFactor(parseFloat(e.target.value) || 0)}
                >
                  <option value="0.120">🇨🇦 Canada Average - 0.120 kg/kWh</option>
                  <option value="0.0014">🇨🇦 Quebec (Hydro) - 0.0014 kg/kWh</option>
                  <option value="0.029">🇨🇦 Ontario - 0.029 kg/kWh</option>
                  <option value="0.600">🇨🇦 Alberta - 0.600 kg/kWh</option>
                  <option value="0.011">🇨🇦 British Columbia - 0.011 kg/kWh</option>
                  <option value="0.417">🇺🇸 USA - 0.417 kg/kWh</option>
                </select>
              </div>

              <div className="field key">
                <label id="lbl13">{t.lbl13}</label>
                <input
                  type="number"
                  id="elecKwh"
                  placeholder="0.00"
                  value={kwh || ""}
                  onChange={(e) => setKwh(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="result-box">
                <strong style={{ color: "#15803d" }}>Calculated Emissions:</strong>
                <div className="result-value" id="elecResult">
                  {(elecKg / 1000).toFixed(3)} tonnes CO2e
                </div>
                <div id="elecDetails" style={{ color: "#047857", fontSize: "0.9rem" }}>
                  {elecKg > 0 ? `(${elecKg.toFixed(0)} kg CO2e)` : ""}
                </div>
              </div>
            </div>
          </div>

          {/* TAB 2: TRANSPORT */}
          <div className={`tab-content ${activeTab === 2 ? "active" : ""}`} id="content2">
            <div className="section">
              <h3 id="transTitle">🚗 {t.transTitle}</h3>

              <div className="field">
                <label id="lbl20">{t.lbl20}</label>
                <input type="number" placeholder="0" />
              </div>

              <div className="field">
                <label id="lbl21">{t.lbl21}</label>
                <input
                  type="number"
                  id="mileage"
                  placeholder="0"
                  value={mileage || ""}
                  onChange={(e) => setMileage(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="result-box">
                <strong style={{ color: "#15803d" }}>Calculated Emissions:</strong>
                <div className="result-value" id="transResult">
                  {(transKg / 1000).toFixed(3)} tonnes CO2e
                </div>
                <div style={{ color: "#047857", fontSize: "0.9rem" }}>
                  Using average vehicle factor: 0.192 kg CO2e/km
                </div>
              </div>
            </div>
          </div>

          {/* TAB 3: REFRIGERANTS */}
          <div className={`tab-content ${activeTab === 3 ? "active" : ""}`} id="content3">
            <div className="section">
              <h3 id="refTitle">❄️ {t.refTitle}</h3>
              <div className="field">
                <label id="lbl30">{t.lbl30}</label>
                <select>
                  <option>-- Select --</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
            </div>
          </div>

          {/* TAB 4: WASTE */}
          <div className={`tab-content ${activeTab === 4 ? "active" : ""}`} id="content4">
            <div className="section">
              <h3 id="wasteTitle">♻️ {t.wasteTitle}</h3>
              <div className="field">
                <label id="lbl40">{t.lbl40}</label>
                <input
                  type="number"
                  id="waste"
                  placeholder="0.00"
                  value={waste || ""}
                  onChange={(e) => setWaste(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="result-box">
                <strong style={{ color: "#15803d" }}>Calculated Emissions:</strong>
                <div className="result-value" id="wasteResult">
                  {(wasteKg / 1000).toFixed(3)} tonnes CO2e
                </div>
                <div style={{ color: "#047857", fontSize: "0.9rem" }}>
                  Using landfill factor: 0.456 kg CO2e/kg
                </div>
              </div>
            </div>
          </div>

          {/* TAB 5: PROCUREMENT */}
          <div className={`tab-content ${activeTab === 5 ? "active" : ""}`} id="content5">
            <div className="section">
              <h3 id="procTitle">📦 {t.procTitle}</h3>
              <div className="field">
                <label id="lbl50">{t.lbl50}</label>
                <input type="text" />
              </div>
              <div className="field">
                <label id="lbl51">{t.lbl51}</label>
                <input type="number" placeholder="0.00" />
              </div>
            </div>
          </div>

          {/* TAB 6: TRAVEL */}
          <div className={`tab-content ${activeTab === 6 ? "active" : ""}`} id="content6">
            <div className="section">
              <h3 id="travelTitle">✈️ {t.travelTitle}</h3>
              <div className="field">
                <label id="lbl60">{t.lbl60}</label>
                <input
                  type="number"
                  id="employees"
                  placeholder="0"
                  value={employees || ""}
                  onChange={(e) => setEmployees(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="field">
                <label id="lbl61">{t.lbl61}</label>
                <input type="number" placeholder="0.0" />
              </div>
            </div>
          </div>

          {/* TAB 7: SUMMARY */}
          <div className={`tab-content ${activeTab === 7 ? "active" : ""}`} id="content7">
            <div className="section">
              <h3 id="summaryTitle">📊 {t.summaryTitle}</h3>

              <div className="summary-card">
                <h2 style={{ margin: 0, fontSize: "1.2rem", opacity: 0.9 }} id="totalLabel">
                  {t.totalLabel}
                </h2>
                <div className="summary-total" id="totalEmissions">
                  {Number(totalTonnes || 0).toFixed(2)}
                </div>
                <div style={{ opacity: 0.9 }}>tonnes CO2e</div>
                {editAuditId && <div className="pill">Editing: {editAuditId}</div>}
              </div>

              <div className="scope-grid">
                <div className="scope-box s1">
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>SCOPE 1</div>
                  <div style={{ fontSize: "0.8rem", marginBottom: "10px" }}>Direct Emissions</div>
                  <div className="scope-value" id="scope1">
                    {Number(scope1Tonnes || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: "0.9rem" }}>tonnes CO2e</div>
                </div>
                <div className="scope-box s2">
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>SCOPE 2</div>
                  <div style={{ fontSize: "0.8rem", marginBottom: "10px" }}>Indirect - Electricity</div>
                  <div className="scope-value" id="scope2">
                    {Number(scope2Tonnes || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: "0.9rem" }}>tonnes CO2e</div>
                </div>
                <div className="scope-box s3">
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>SCOPE 3</div>
                  <div style={{ fontSize: "0.8rem", marginBottom: "10px" }}>Other Indirect</div>
                  <div className="scope-value" id="scope3">
                    {Number(scope3Tonnes || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: "0.9rem" }}>tonnes CO2e</div>
                </div>
              </div>

              <div style={{ background: "white", border: "2px solid #e5e7eb", borderRadius: "10px", padding: "25px" }}>
                <h4 style={{ marginTop: 0, color: "#1f2937", borderBottom: "2px solid #9333ea", paddingBottom: "10px" }} id="catLabel">
                  {t.catLabel}
                </h4>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e5e7eb" }}>
                  <span>⚡ Stationary Combustion</span>
                  <strong id="catFuel">{(Number(fuelKg) / 1000).toFixed(2)} tonnes CO2e</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e5e7eb" }}>
                  <span>💡 Electricity</span>
                  <strong id="catElec">{(Number(elecKg) / 1000).toFixed(2)} tonnes CO2e</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e5e7eb" }}>
                  <span>🚗 Transport</span>
                  <strong id="catTrans">{(Number(transKg) / 1000).toFixed(2)} tonnes CO2e</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
                  <span>♻️ Waste</span>
                  <strong id="catWaste">{(Number(wasteKg) / 1000).toFixed(2)} tonnes CO2e</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="footerSec">
          <button className="btn" onClick={handleSave} id="btnSave" disabled={loading}>
            {loading ? (editAuditId ? "Updating…" : "Saving…") : (editAuditId ? "Update Audit" : "Save Progress")}
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} id="btnPrint">
            🖨️ {t.btnPrint}
          </button>
          {editAuditId && (
            <button className="btn btn-secondary" onClick={resetForm}>Cancel Edit</button>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="status">
        {msg && <div className="ok">{msg}</div>}
        {err && <div className="err">{err}</div>}
      </div>

      {/* Admin list */}
      <div className="admin-list">
        <h3>{t.listTitle}</h3>
        <table>
          <thead>
            <tr>
              <th>Org</th>
              <th>Lang</th>
              <th>Period</th>
              <th>Total (tCO2e)</th>
              <th>Updated</th>
              <th style={{ width: 190 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((a) => {
              const total = Number(a?.totalTonnes ?? 0);
              const updated = a?.updatedAt
                ? new Date(a.updatedAt).toLocaleString()
                : "-";
              const start = a?.reportStart ? String(a.reportStart).slice(0, 10) : "";
              const end = a?.reportEnd ? String(a.reportEnd).slice(0, 10) : "";
              return (
                <tr key={a._id}>
                  <td>{a.orgName || "-"}</td>
                  <td>{a.lang ? String(a.lang).toUpperCase() : "-"}</td>
                  <td>{start} → {end}</td>
                  <td>{Number.isFinite(total) ? total.toFixed(2) : "0.00"}</td>
                  <td>{updated}</td>
                  <td className="actions">
                    <button className="btn btn-secondary" onClick={() => handleEdit(a)}>Edit</button>
                    <button className="btn" style={{ background: "#dc2626" }} onClick={() => handleDelete(a._id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {audits.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                  No audits yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CO2ePortalAuditToolkit;
