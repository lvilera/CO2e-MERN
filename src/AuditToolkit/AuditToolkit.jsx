import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DynamicHeader from "../components/DynamicHeader";
import { API_BASE_URL } from "../config";
import "./AuditToolkit.css";

const CO2ePortalAuditToolkit = () => {
  // ---------- STATE ----------
  const [activeTab, setActiveTab] = useState(0);
  const { t, i18n } = useTranslation();

  // Robust language resolution
  const rawLang = i18n.resolvedLanguage || i18n.language || "en";
  const baseLang = rawLang.split("-")[0];
  const uiLang = ["en", "fr", "es"].includes(baseLang) ? baseLang : "en";

  // Org info
  const [orgName, setOrgName] = useState("");
  const [siteAddresses, setSiteAddresses] = useState("");
  const [reportStart, setReportStart] = useState("");
  const [reportEnd, setReportEnd] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Raw inputs (existing)
  const [fuelFactor, setFuelFactor] = useState(0);
  const [fuelVol, setFuelVol] = useState(0);
  const [gridFactor, setGridFactor] = useState(0);
  const [kwh, setKwh] = useState(0);
  const [mileage, setMileage] = useState(0);
  const [waste, setWaste] = useState(0);
  const [employees, setEmployees] = useState(0);

  // NEW: HTML features (extra fields)
  const [vehicleCount, setVehicleCount] = useState(0);
  const [hasRefrigeration, setHasRefrigeration] = useState(""); // "yes" | "no" | ""
  const [topSupplierName, setTopSupplierName] = useState("");
  const [annualSpendCad, setAnnualSpendCad] = useState(0);
  const [avgCommuteKm, setAvgCommuteKm] = useState(0);

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

  // Export UX
  const [exportOk, setExportOk] = useState(false);

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

  const perEmployeeTonnes =
    employees > 0 ? Number(totalTonnes || 0) / Number(employees || 1) : null;

  // ---------- API ----------
  const payload = () => ({
    lang: uiLang, // match table expectation
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

    // NEW extras
    vehicleCount,
    hasRefrigeration,
    topSupplierName,
    annualSpendCad,
    avgCommuteKm,

    // Persist computed numbers so list remains consistent (optional but recommended)
    fuelKg,
    elecKg,
    transKg,
    wasteKg,
    scope1Tonnes,
    scope2Tonnes,
    scope3Tonnes,
    totalTonnes,
  });

  const fetchAudits = async () => {
    try {
      if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
      const { data } = await axios.get(`${API_BASE_URL}/api/audit?limit=100`, {
        withCredentials: false,
      });
      setAudits(Array.isArray(data.items) ? data.items : []);
      setErr("");
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "Failed to fetch audits");
    }
  };

  useEffect(() => {
    fetchAudits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // NEW extras
    setVehicleCount(0);
    setHasRefrigeration("");
    setTopSupplierName("");
    setAnnualSpendCad(0);
    setAvgCommuteKm(0);
  };

  const hydrateFromDoc = (doc) => {
    setOrgName(doc.orgName || "");
    setSiteAddresses(doc.siteAddresses || "");
    setReportStart(doc.reportStart ? String(doc.reportStart).slice(0, 10) : "");
    setReportEnd(doc.reportEnd ? String(doc.reportEnd).slice(0, 10) : "");
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

    // NEW extras
    setVehicleCount(Number(doc.vehicleCount || 0));
    setHasRefrigeration(doc.hasRefrigeration || "");
    setTopSupplierName(doc.topSupplierName || "");
    setAnnualSpendCad(Number(doc.annualSpendCad || 0));
    setAvgCommuteKm(Number(doc.avgCommuteKm || 0));

    // If backend returns computed values, load them too (optional)
    if (doc.totalTonnes != null) setTotalTonnes(Number(doc.totalTonnes || 0));
    if (doc.scope1Tonnes != null) setScope1Tonnes(Number(doc.scope1Tonnes || 0));
    if (doc.scope2Tonnes != null) setScope2Tonnes(Number(doc.scope2Tonnes || 0));
    if (doc.scope3Tonnes != null) setScope3Tonnes(Number(doc.scope3Tonnes || 0));
    if (doc.fuelKg != null) setFuelKg(Number(doc.fuelKg || 0));
    if (doc.elecKg != null) setElecKg(Number(doc.elecKg || 0));
    if (doc.transKg != null) setTransKg(Number(doc.transKg || 0));
    if (doc.wasteKg != null) setWasteKg(Number(doc.wasteKg || 0));
  };

  const handleSave = async () => {
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");

      if (editAuditId) {
        const { data } = await axios.put(
          `${API_BASE_URL}/api/audit/${editAuditId}`,
          payload()
        );
        hydrateFromDoc(data);
        setMsg("Audit updated successfully.");
      } else {
        const { data } = await axios.post(`${API_BASE_URL}/api/audit`, payload());
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
      await axios.delete(`${API_BASE_URL}/api/audit/${id}`);
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

  const handleLangChange = (newLang) => {
    i18n.changeLanguage(newLang);
  };

  // ---------- CSV EXPORT ----------
  const downloadCSV = (filename, rows) => {
    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const s = String(cell ?? "").replace(/"/g, '""');
            return s.includes(",") || s.includes("\n") ? `"${s}"` : s;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const today = new Date().toISOString().slice(0, 10);

    const rows = [["question_id", "category", "label_en", "answer", "unit", "timestamp"]];

    // Force English label for CSV
    const labelEn = (key, fallback) => {
      try {
        return t(key, { lng: "en" });
      } catch {
        return fallback || key;
      }
    };

    const push = (id, category, labelKey, answer, unit) => {
      const val = answer === null || answer === undefined ? "" : String(answer);
      if (val.trim() === "") return;
      rows.push([id, category, labelEn(labelKey, labelKey), val, unit, today]);
    };

    // Organization
    push("org_legal_name", "Organization", "audit.lbl1", orgName, "text");
    push("org_addresses", "Organization", "audit.lbl2", siteAddresses, "text");
    push("org_report_start", "Organization", "audit.lbl3", reportStart, "date");
    push("org_report_end", "Organization", "audit.lbl4", reportEnd, "date");
    push("org_contact_name", "Organization", "audit.lbl5", contactName, "text");
    push("org_contact_email", "Organization", "audit.lbl6", contactEmail, "email");
    push("org_contact_phone", "Organization", "audit.lbl7", contactPhone, "phone");

    // Energy Scope 1
    push("fuel_type_factor", "Energy_Scope1", "audit.lbl10", fuelFactor, "kgCO2e/unit");
    push("fuel_volume", "Energy_Scope1", "audit.lbl11", fuelVol, "unit");

    // Energy Scope 2
    push("grid_region_factor", "Energy_Scope2", "audit.lbl12", gridFactor, "kgCO2e/kWh");
    push("electricity_kwh", "Energy_Scope2", "audit.lbl13", kwh, "kWh");

    // Transport
    push("fleet_vehicles_count", "Transport", "audit.lbl20", vehicleCount, "units");
    push("total_mileage_km", "Transport", "audit.lbl21", mileage, "km");

    // Refrigerants
    push("has_refrigeration", "Refrigerants", "audit.lbl30", hasRefrigeration, "yes/no");

    // Waste
    push("annual_waste_kg", "Waste", "audit.lbl40", waste, "kg");

    // Procurement
    push("top_supplier_name", "Procurement", "audit.lbl50", topSupplierName, "text");
    push("supplier_annual_spend", "Procurement", "audit.lbl51", annualSpendCad, "CAD");

    // Travel
    push("total_employees", "Travel", "audit.lbl60", employees, "count");
    push("commute_distance_avg", "Travel", "audit.lbl61", avgCommuteKm, "km");

    // Calculated Results
    rows.push(["", "", "", "", "", ""]);
    rows.push(["Calculated Results", "", "", "", "", today]);
    rows.push(["co2_scope1", "Results", "Scope 1 Emissions", scope1Tonnes.toFixed(2), "tonnes", today]);
    rows.push(["co2_scope2", "Results", "Scope 2 Emissions", scope2Tonnes.toFixed(2), "tonnes", today]);
    rows.push(["co2_scope3", "Results", "Scope 3 Emissions", scope3Tonnes.toFixed(2), "tonnes", today]);
    rows.push(["co2_total", "Results", "Total Emissions", totalTonnes.toFixed(2), "tonnes", today]);

    downloadCSV(`CO2ePortal_Audit_${today}.csv`, rows);

    setExportOk(true);
    setTimeout(() => setExportOk(false), 3000);
  };

  // ---------- UI ----------
  const saveLabel = editAuditId ? t("audit.btn_update") : t("audit.btn_save");

  return (
    <>
      <DynamicHeader />

      {/* Tabs */}
      <div className="tabs">
        {[
          t("audit.tab_org_info"),
          t("audit.tab_energy"),
          t("audit.tab_transport"),
          t("audit.tab_refrigerants"),
          t("audit.tab_waste"),
          t("audit.tab_procurement"),
          t("audit.tab_travel"),
          t("audit.tab_summary"),
        ].map((tabLabel, i) => (
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
        {/* Header (logo + title + subtitle + caption + lang buttons) */}
        <div className="banner-header">
          <div className="banner-left">
            <img
              src="/co2portal01.png"
              alt="CO2ePortal Logo"
              className="banner-logo"
              onError={(e) => (e.target.style.display = "none")}
            />
            <div>
              <div className="banner-title">🌍 {t("audit.title")}</div>
              <div className="banner-subtitle">{t("audit.subtitle")}</div>
              <div className="banner-caption">
                {t("audit.caption") || "GHG Protocol Corporate Standard | ISO 14064 Compatible"}
              </div>
            </div>
          </div>

          <div className="lang-buttons">
            <button
              className={`lang-btn ${uiLang === "en" ? "active" : ""}`}
              onClick={() => handleLangChange("en")}
            >
              🇬🇧 EN
            </button>
            <button
              className={`lang-btn ${uiLang === "fr" ? "active" : ""}`}
              onClick={() => handleLangChange("fr")}
            >
              🇫🇷 FR
            </button>
            <button
              className={`lang-btn ${uiLang === "es" ? "active" : ""}`}
              onClick={() => handleLangChange("es")}
            >
              🇪🇸 ES
            </button>
          </div>
        </div>

        <div className="content">
          {/* TAB 0: ORG INFO */}
          <div className={`tab-content ${activeTab === 0 ? "active" : ""}`} id="content0">
            <div className="section">
              <h3 id="orgTitle">{t("audit.org_title")}</h3>

              <div className="field key">
                <label id="lbl1">{t("audit.lbl1")}</label>
                <input
                  type="text"
                  placeholder="Full legal entity name..."
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>

              <div className="field key">
                <label id="lbl2">{t("audit.lbl2")}</label>
                <textarea
                  placeholder="List all physical locations..."
                  value={siteAddresses}
                  onChange={(e) => setSiteAddresses(e.target.value)}
                />
              </div>

              <div className="grid-2">
                <div className="field key">
                  <label id="lbl3">{t("audit.lbl3")}</label>
                  <input type="date" value={reportStart} onChange={(e) => setReportStart(e.target.value)} />
                </div>
                <div className="field key">
                  <label id="lbl4">{t("audit.lbl4")}</label>
                  <input type="date" value={reportEnd} onChange={(e) => setReportEnd(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label id="lbl5">{t("audit.lbl5")}</label>
                <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </div>

              <div className="grid-2">
                <div className="field">
                  <label id="lbl6">{t("audit.lbl6")}</label>
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                </div>
                <div className="field">
                  <label id="lbl7">{t("audit.lbl7")}</label>
                  <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: ENERGY */}
          <div className={`tab-content ${activeTab === 1 ? "active" : ""}`} id="content1">
            <div className="section">
              <h3 id="energyTitle">⚡ {t("audit.energy_title")}</h3>

              <div className="field key">
                <label id="lbl10">{t("audit.lbl10")}</label>
                <select
                  id="fuelType"
                  value={fuelFactor || ""}
                  onChange={(e) => setFuelFactor(parseFloat(e.target.value) || 0)}
                >
                  <option value="">{t("audit.select_placeholder") || "-- Select --"}</option>
                  <option value="1.879">Natural Gas (m³) - 1.879 kg CO2e/m³</option>
                  <option value="2.663">Diesel (L) - 2.663 kg CO2e/L</option>
                  <option value="1.512">LPG (L) - 1.512 kg CO2e/L</option>
                  <option value="2.753">Heating Oil (L) - 2.753 kg CO2e/L</option>
                  <option value="1.505">Propane (L) - 1.505 kg CO2e/L</option>
                </select>
              </div>

              <div className="field">
                <label id="lbl11">{t("audit.lbl11")}</label>
                <input
                  type="number"
                  id="fuelVol"
                  placeholder="0.00"
                  value={fuelVol || ""}
                  onChange={(e) => setFuelVol(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="result-box">
                <strong style={{ color: "#15803d" }}>{t("audit.calc_label") || "Calculated Emissions:"}</strong>
                <div className="result-value" id="fuelResult">
                  {(fuelKg / 1000).toFixed(3)} tonnes CO2e
                </div>
                <div id="fuelDetails" style={{ color: "#047857", fontSize: "0.9rem" }}>
                  {fuelKg > 0 ? `(${fuelKg.toFixed(0)} kg CO2e)` : ""}
                </div>
              </div>
            </div>

            <div className="section">
              <h3 id="elecTitle">💡 {t("audit.elec_title")}</h3>

              <div className="field key">
                <label id="lbl12">{t("audit.lbl12")}</label>
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
                <label id="lbl13">{t("audit.lbl13")}</label>
                <input
                  type="number"
                  id="elecKwh"
                  placeholder="0.00"
                  value={kwh || ""}
                  onChange={(e) => setKwh(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="result-box">
                <strong style={{ color: "#15803d" }}>{t("audit.calc_label") || "Calculated Emissions:"}</strong>
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
              <h3 id="transTitle">🚗 {t("audit.trans_title")}</h3>

              <div className="field">
                <label id="lbl20">{t("audit.lbl20")}</label>
                <input
                  type="number"
                  placeholder="0"
                  value={vehicleCount || ""}
                  onChange={(e) => setVehicleCount(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="field">
                <label id="lbl21">{t("audit.lbl21")}</label>
                <input
                  type="number"
                  id="mileage"
                  placeholder="0"
                  value={mileage || ""}
                  onChange={(e) => setMileage(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="result-box">
                <strong style={{ color: "#15803d" }}>{t("audit.calc_label") || "Calculated Emissions:"}</strong>
                <div className="result-value" id="transResult">
                  {(transKg / 1000).toFixed(3)} tonnes CO2e
                </div>
                <div style={{ color: "#047857", fontSize: "0.9rem" }}>
                  {t("audit.trans_factor_hint") || "Using average vehicle factor: 0.192 kg CO2e/km"}
                </div>
              </div>
            </div>
          </div>

          {/* TAB 3: REFRIGERANTS */}
          <div className={`tab-content ${activeTab === 3 ? "active" : ""}`} id="content3">
            <div className="section">
              <h3 id="refTitle">❄️ {t("audit.ref_title")}</h3>

              <div className="field">
                <label id="lbl30">{t("audit.lbl30")}</label>
                <select value={hasRefrigeration} onChange={(e) => setHasRefrigeration(e.target.value)}>
                  <option value="">{t("audit.select_placeholder") || "-- Select --"}</option>
                  <option value="yes">{t("audit.yes") || "Yes"}</option>
                  <option value="no">{t("audit.no") || "No"}</option>
                </select>
              </div>
            </div>
          </div>

          {/* TAB 4: WASTE */}
          <div className={`tab-content ${activeTab === 4 ? "active" : ""}`} id="content4">
            <div className="section">
              <h3 id="wasteTitle">♻️ {t("audit.waste_title")}</h3>

              <div className="field">
                <label id="lbl40">{t("audit.lbl40")}</label>
                <input
                  type="number"
                  id="waste"
                  placeholder="0.00"
                  value={waste || ""}
                  onChange={(e) => setWaste(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="result-box">
                <strong style={{ color: "#15803d" }}>{t("audit.calc_label") || "Calculated Emissions:"}</strong>
                <div className="result-value" id="wasteResult">
                  {(wasteKg / 1000).toFixed(3)} tonnes CO2e
                </div>
                <div style={{ color: "#047857", fontSize: "0.9rem" }}>
                  {t("audit.waste_factor_hint") || "Using landfill factor: 0.456 kg CO2e/kg"}
                </div>
              </div>
            </div>
          </div>

          {/* TAB 5: PROCUREMENT */}
          <div className={`tab-content ${activeTab === 5 ? "active" : ""}`} id="content5">
            <div className="section">
              <h3 id="procTitle">📦 {t("audit.proc_title")}</h3>

              <div className="field">
                <label id="lbl50">{t("audit.lbl50")}</label>
                <input type="text" value={topSupplierName} onChange={(e) => setTopSupplierName(e.target.value)} />
              </div>

              <div className="field">
                <label id="lbl51">{t("audit.lbl51")}</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={annualSpendCad || ""}
                  onChange={(e) => setAnnualSpendCad(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* TAB 6: TRAVEL */}
          <div className={`tab-content ${activeTab === 6 ? "active" : ""}`} id="content6">
            <div className="section">
              <h3 id="travelTitle">✈️ {t("audit.travel_title")}</h3>

              <div className="field">
                <label id="lbl60">{t("audit.lbl60")}</label>
                <input
                  type="number"
                  id="employees"
                  placeholder="0"
                  value={employees || ""}
                  onChange={(e) => setEmployees(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="field">
                <label id="lbl61">{t("audit.lbl61")}</label>
                <input
                  type="number"
                  placeholder="0.0"
                  value={avgCommuteKm || ""}
                  onChange={(e) => setAvgCommuteKm(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* TAB 7: SUMMARY */}
          <div className={`tab-content ${activeTab === 7 ? "active" : ""}`} id="content7">
            <div className="section">
              <h3 id="summaryTitle">📊 {t("audit.summary_title")}</h3>

              <div className="summary-card">
                <h2 style={{ margin: 0, fontSize: "1.2rem", opacity: 0.9 }} id="totalLabel">
                  {t("audit.total_label")}
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
                  <div style={{ fontSize: "0.8rem", marginBottom: "10px" }}>
                    {t("audit.scope1_desc") || "Direct Emissions"}
                  </div>
                  <div className="scope-value" id="scope1">
                    {Number(scope1Tonnes || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: "0.9rem" }}>tonnes CO2e</div>
                </div>
                <div className="scope-box s2">
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>SCOPE 2</div>
                  <div style={{ fontSize: "0.8rem", marginBottom: "10px" }}>
                    {t("audit.scope2_desc") || "Indirect - Electricity"}
                  </div>
                  <div className="scope-value" id="scope2">
                    {Number(scope2Tonnes || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: "0.9rem" }}>tonnes CO2e</div>
                </div>
                <div className="scope-box s3">
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>SCOPE 3</div>
                  <div style={{ fontSize: "0.8rem", marginBottom: "10px" }}>
                    {t("audit.scope3_desc") || "Other Indirect"}
                  </div>
                  <div className="scope-value" id="scope3">
                    {Number(scope3Tonnes || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: "0.9rem" }}>tonnes CO2e</div>
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "25px",
                }}
              >
                <h4
                  style={{
                    marginTop: 0,
                    color: "#1f2937",
                    borderBottom: "2px solid #9333ea",
                    paddingBottom: "10px",
                  }}
                  id="catLabel"
                >
                  {t("audit.cat_label")}
                </h4>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e5e7eb" }}>
                  <span>⚡ {t("audit.cat_fuel") || "Stationary Combustion"}</span>
                  <strong id="catFuel">{(Number(fuelKg) / 1000).toFixed(2)} tonnes CO2e</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e5e7eb" }}>
                  <span>💡 {t("audit.cat_elec") || "Electricity"}</span>
                  <strong id="catElec">{(Number(elecKg) / 1000).toFixed(2)} tonnes CO2e</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e5e7eb" }}>
                  <span>🚗 {t("audit.cat_trans") || "Transport"}</span>
                  <strong id="catTrans">{(Number(transKg) / 1000).toFixed(2)} tonnes CO2e</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
                  <span>♻️ {t("audit.cat_waste") || "Waste"}</span>
                  <strong id="catWaste">{(Number(wasteKg) / 1000).toFixed(2)} tonnes CO2e</strong>
                </div>
              </div>

              {/* Intensity metrics block */}
              <div
                style={{
                  background: "#f3f4f6",
                  border: "2px solid #d1d5db",
                  borderRadius: "10px",
                  padding: "25px",
                  marginTop: "30px",
                }}
              >
                <h4 style={{ marginTop: 0, color: "#1f2937" }} id="intensityLabel">
                  {t("audit.intensity_label")}
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}>
                  <div>
                    <span style={{ color: "#6b7280", fontSize: "0.9rem" }} id="perEmpLabel">
                      {t("audit.per_emp_label")}
                    </span>
                    <div
                      id="perEmployee"
                      style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937" }}
                    >
                      {perEmployeeTonnes !== null
                        ? `${perEmployeeTonnes.toFixed(2)} tonnes CO2e`
                        : "- tonnes CO2e"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra summary info (optional) */}
              <div style={{ marginTop: 20, opacity: 0.85 }}>
                <div>
                  <strong>{t("audit.lbl20") || "Number of company vehicles"}:</strong>{" "}
                  {vehicleCount || 0}
                </div>
                <div>
                  <strong>{t("audit.lbl30") || "Refrigeration/AC equipment"}:</strong>{" "}
                  {hasRefrigeration ? hasRefrigeration.toUpperCase() : "-"}
                </div>
                <div>
                  <strong>{t("audit.lbl50") || "Top supplier name"}:</strong>{" "}
                  {topSupplierName || "-"}
                </div>
                <div>
                  <strong>{t("audit.lbl51") || "Annual spend (CAD)"}:</strong>{" "}
                  {annualSpendCad ? Number(annualSpendCad).toFixed(2) : "0.00"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="footerSec">
          <button className="btn btn-export" onClick={handleExportCSV}>
            📥 {t("audit.btn_export")}
          </button> 

          <button className="btn" onClick={handleSave} id="btnSave" disabled={loading}>
            {loading ? `${saveLabel}...` : saveLabel}
          </button>

          <button className="btn btn-secondary" onClick={handlePrint} id="btnPrint">
            🖨️ {t("audit.btn_print")}
          </button>

          {editAuditId && (
            <button className="btn btn-secondary" onClick={resetForm}>
              {t("audit.btn_cancel_edit") || "Cancel Edit"}
            </button>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="status">
        {exportOk && (
          <div className="ok" style={{ marginBottom: 10 }}>
            ✓ {t("audit.export_ok") || "CSV exported successfully"}
          </div>
        )}
        {msg && <div className="ok">{msg}</div>}
        {err && <div className="err">{err}</div>}
      </div>

      {/* Admin list */}
      <div className="admin-list no-print">
        <h3>{t("audit.list_title")}</h3>
        <table>
          <thead>
            <tr>
              <th>{t("audit.col_org") || "Org"}</th>
              <th>{t("audit.col_lang") || "Lang"}</th>
              <th>{t("audit.col_period") || "Period"}</th>
              <th>{t("audit.col_total") || "Total (tCO2e)"}</th>
              <th>{t("audit.col_updated") || "Updated"}</th>
              <th style={{ width: 190 }}>{t("audit.col_action") || "Action"}</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((a) => {
              const total = Number.isFinite(Number(a?.totalTonnes)) ? Number(a.totalTonnes) : 0;
              const updated = a?.updatedAt ? new Date(a.updatedAt).toLocaleString() : "-";
              const start = a?.reportStart ? String(a.reportStart).slice(0, 10) : "";
              const end = a?.reportEnd ? String(a.reportEnd).slice(0, 10) : "";
              return (
                <tr key={a._id}>
                  <td>{a.orgName || "-"}</td>
                  <td>{a.lang ? String(a.lang).toUpperCase() : "-"}</td>
                  <td>
                    {start} → {end}
                  </td>
                  <td>{total.toFixed(2)}</td>
                  <td>{updated}</td>
                  <td className="actions">
                    <button className="btn btn-secondary" onClick={() => handleEdit(a)}>
                      {t("audit.btn_edit") || "Edit"}
                    </button>
                    <button
                      className="btn"
                      style={{ background: "#dc2626" }}
                      onClick={() => handleDelete(a._id)}
                    >
                      {t("audit.btn_delete") || "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {audits.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                  {t("audit.no_audits") || "No audits yet."}
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
