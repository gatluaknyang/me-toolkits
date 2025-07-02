import React, { useState } from 'react';
import './styles.css';

// Sector-based forms
const SECTOR_FORMS = {
  health: {
    title: "Health Monitoring Form",
    fields: [
      { label: "Facility Name", name: "facility", type: "text" },
      { label: "Date", name: "date", type: "date" },
      { label: "Type of Facility", name: "type", type: "select", options: ["PHCU", "PHCC", "Hospital"] },
      { label: "Services Offered", name: "services", type: "textarea" },
      { label: "Officer in Charge", name: "officer", type: "text" }
    ]
  },
  wash: {
    title: "WASH Assessment Form",
    fields: [
      { label: "Location", name: "location", type: "text" },
      { label: "Water Source Type", name: "waterSource", type: "select", options: ["Borehole", "Well", "River"] },
      { label: "Sanitation Facilities", name: "sanitation", type: "checkbox", options: ["Toilet", "Handwashing", "Shower"] },
      { label: "Hygiene Promotion Activities", name: "hygiene", type: "textarea" },
      { label: "Date of Last Maintenance", name: "maintenanceDate", type: "date" }
    ]
  },
  gbv: {
    title: "Gender-Based Violence Reporting",
    fields: [
      { label: "Incident Location", name: "incidentLocation", type: "text" },
      { label: "Type of Incident", name: "incidentType", type: "select", options: ["Physical", "Sexual", "Psychological"] },
      { label: "Victim Age Group", name: "ageGroup", type: "select", options: ["Child", "Youth", "Adult", "Elderly"] },
      { label: "Support Services Provided", name: "support", type: "textarea" },
      { label: "Referral Made", name: "referral", type: "checkbox", options: ["Medical", "Legal", "Psychosocial"] }
    ]
  }
};

function App() {
  const [view, setView] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState({});

  // Simulated login
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin@guukstudio.com" && password === "guuk") {
      localStorage.setItem("mne_user", JSON.stringify({ role: "admin" }));
      setView("dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  // Submit form to Google Apps Script
  const submitForm = () => {
    const payload = {
      sector: view.replace("form-", ""),
      formData,
      timestamp: new Date().toISOString()
    };

    if (!navigator.onLine) {
      const offlineData = JSON.parse(localStorage.getItem("offlineForms")) || [];
      localStorage.setItem("offlineForms", JSON.stringify([...offlineData, payload]));
      alert("Saved locally. Will sync when online.");
      return;
    }

    fetch("https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec ", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      alert("Submitted successfully!");
      setFormData({});
    })
    .catch(err => {
      alert("Error submitting form. Saving locally...");
      const offlineData = JSON.parse(localStorage.getItem("offlineForms")) || [];
      localStorage.setItem("offlineForms", JSON.stringify([...offlineData, payload]));
    });
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <header className="app-header">
        <h1>Guuk Studio M&E Toolkit</h1>
        <p>For South Sudan Humanitarian Use</p>
      </header>

      {view === "login" && (
        <div className="login-form" style={{ maxWidth: "400px", margin: "auto" }}>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <label>Email:</label>
            <input type="email" onChange={(e) => setUsername(e.target.value)} required />

            <label>Password:</label>
            <input type="password" onChange={(e) => setPassword(e.target.value)} required />

            <button type="submit">Login</button>
          </form>
        </div>
      )}

      {view === "dashboard" && (
        <div className="dashboard" style={{ maxWidth: "600px", margin: "auto" }}>
          <h2>Welcome to M&E Toolkit Dashboard</h2>
          <p>Select a sector form below:</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {Object.keys(SECTOR_FORMS).map(sector => (
              <button 
                key={sector} 
                onClick={() => setView(`form-${sector}`)}
                style={{ background: "#007BFF", color: "white", border: "none", padding: "12px", borderRadius: "4px" }}
              >
                {SECTOR_FORMS[sector].title}
              </button>
            ))}
          </div>
        </div>
      )}

      {view.startsWith("form-") && (
        <div className="form-renderer" style={{ maxWidth: "600px", margin: "auto", background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h2>{SECTOR_FORMS[view.replace("form-", "")]?.title}</h2>
          <form onSubmit={(e) => { e.preventDefault(); submitForm(); }}>
            {SECTOR_FORMS[view.replace("form-", "")]?.fields.map(field => (
              <div key={field.name} style={{ marginBottom: "1rem" }}>
                <label style={{ fontWeight: "bold", display: "block" }}>{field.label}</label>
                
                {field.type === "text" && (
                  <input name={field.name} onChange={handleChange} />
                )}
                {field.type === "date" && (
                  <input type="date" name={field.name} onChange={handleChange} />
                )}
                {field.type === "textarea" && (
                  <textarea name={field.name} onChange={handleChange}></textarea>
                )}
                {field.type === "select" && (
                  <select name={field.name} onChange={handleChange}>
                    <option value="">Select an option</option>
                    {field.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                {field.type === "checkbox" && field.options.map(opt => (
                  <div key={opt} style={{ marginTop: "8px" }}>
                    <input type="checkbox" name={field.name} value={opt} onChange={handleChange} />
                    <label style={{ marginLeft: "8px" }}>{opt}</label>
                  </div>
                ))}
              </div>
            ))}

            <button type="submit">Submit</button>
            <button type="button" onClick={() => setView("dashboard")}>Back</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;