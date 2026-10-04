import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function VerifyCertificate() {
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function verifyCertificate(id) {
    const cleanId = id.trim().toUpperCase();

    if (!cleanId) {
      setResult({
        valid: false,
        message: "Please enter a certificate ID.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("certificate_id", cleanId)
      .maybeSingle();

    setLoading(false);

    if (error) {
      console.error("Certificate verification error:", error);

      setResult({
        valid: false,
        message: "Unable to verify certificate right now. Please try again.",
      });

      return;
    }

    if (!data) {
      setResult({
        valid: false,
        message:
          "No certificate was found with this ID. Please check the Certificate ID.",
      });

      return;
    }

    setResult({
      valid: true,
      name: data.student_name,
      program: data.program,
      certificateId: data.certificate_id,
      issueDate: data.issue_date,
      status: data.status || "VALID",
    });
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrCertificateId = params.get("certificate");

    if (qrCertificateId) {
      const id = qrCertificateId.trim().toUpperCase();

      setCertificateId(id);
      verifyCertificate(id);
    }
  }, []);

  async function handleVerify(e) {
    e.preventDefault();
    await verifyCertificate(certificateId);
  }

  const verificationUrl =
    result?.valid && typeof window !== "undefined"
      ? `${window.location.origin}/verify?certificate=${encodeURIComponent(
          result.certificateId
        )}`
      : "";

  const qrUrl = verificationUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        verificationUrl
      )}`
    : "";

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
            disabled={loading}
            style={{
              padding: "15px 25px",
              border: "none",
              borderRadius: "10px",
              background: "#0284c7",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Verifying..." : "Verify"}
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
                  <strong>Certificate ID:</
