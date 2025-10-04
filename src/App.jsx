import React, { useState } from "react";
import CaptchaWrapper from "./components/CaptchaWrapper";

export default function App() {
  const [verified, setVerified] = useState(false);
  return (
    <div style={{ fontFamily: "Arial,Helvetica,sans-serif", padding: 20 }}>
      <h1>Crazy Random Captcha - React Demo</h1>
      <CaptchaWrapper
        onVerified={(data) => {
          setVerified(true);
          alert("verified: " + JSON.stringify(data));
        }}
      />
      <div style={{ marginTop: 12 }}>
        Status: <strong>{verified ? "Verified" : "Not verified"}</strong>
      </div>
    </div>
  );
}
