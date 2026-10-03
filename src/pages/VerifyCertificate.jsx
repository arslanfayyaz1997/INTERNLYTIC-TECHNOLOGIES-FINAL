import { useState } from "react";

export default function VerifyCertificate() {
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState(null);

  function handleVerify(e) {
    e.preventDefault();

    const id = certificateId.trim().toUpperCase();

    if (!id) {
      setResult({
        valid: false,
        message: "Please enter a certificate ID.",
      });
      return;
    }

    if (id === "INTL-2026-000001") {
      setResult({
        valid: true,
        name: "Test Certificate Holder",
        program: "Machine Learning & Generative AI Internship",
        certificateId: id,
        issueDate: "30 August 2026",
        status: "VALID",
      });
    } else {
      setResult({
        valid: false,
        message:
          "No certificate was found with this ID. Please check the Certificate ID.",
      });
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        padding: "80px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "#111827",
          }}
        >
          Verify Certificate
        </h1>

        <p
          style={{
            marginTop: "12px",
            fontSize: "18px",
            color: "#6b7280",
          }}
        >
          Internlytic Technologies Certificate Verification
        </p>

        <form
          onSubmit={handleVerify}
          style={{
            marginTop: "35px",
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            placeholder="INTL-2026-000001"
            style={{
              width: "320px",
              padding: "15px",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              fontSize: "16px",
              outline: "none",
            }}
          />

          <button
            type="submit"
            style={{
              padding: "15px 25px",
              border: "none",
              borderRadius: "10px",
              background: "#0284c7",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Verify
          </button>
        </form>

        {result && (
          <div
            style={{
              marginTop: "30px",
              padding: "25px",
              borderRadius: "16px",
              background: result.valid ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${
                result.valid ? "#bbf7d0" : "#fecaca"
              }`,
              textAlign: "left",
            }}
          >
            {result.valid ? (
              <>
                <h2
                  style={{
                    color: "#15803d",
                    fontSize: "24px",
                    fontWeight: "800",
                  }}
                >
                  ✓ Certificate Verified
                </h2>

                <p style={{ marginTop: "15px" }}>
                  <strong>Certificate Holder:</strong> {result.name}
                </p>

                <p style={{ marginTop: "8px" }}>
                  <strong>Certificate ID:</strong> {result.certificateId}
                </p>

                <p style={{ marginTop: "8px" }}>
                  <strong>Program:</strong> {result.program}
                </p>

                <p style={{ marginTop: "8px" }}>
                  <strong>Issue Date:</strong> {result.issueDate}
                </p>

                <p
                  style={{
                    marginTop: "15px",
                    color: "#15803d",
                    fontWeight: "800",
                  }}
                >
                  STATUS: {result.status}
                </p>
              </>
            ) : (
              <>
                <h2
                  style={{
                    color: "#b91c1c",
                    fontSize: "22px",
                    fontWeight: "800",
                  }}
                >
                  ✕ Certificate Not Found
                </h2>

                <p
                  style={{
                    marginTop: "10px",
                    color: "#b91c1c",
                  }}
                >
                  {result.message}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
