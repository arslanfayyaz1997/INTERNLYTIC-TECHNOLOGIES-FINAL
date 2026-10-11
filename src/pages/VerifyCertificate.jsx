import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import CertificateQR from "../components/CertificateQR.jsx";

export default function VerifyCertificate() {
  const [documentType, setDocumentType] = useState("certificate");
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const NAVY = "#051d40";
  const TEAL = "#21ae92";
  const WHITE = "#ffffff";

  async function verifyDocument(id, type = documentType) {
    const cleanId = id.trim().toUpperCase();

    if (!cleanId) {
      setResult({
        valid: false,
        message: `Please enter an ${
          type === "certificate" ? "Certificate" : "Offer Letter"
        } ID.`,
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("certificate_id", cleanId)
        .maybeSingle();

      if (error) {
        console.error("Document verification error:", error);

        setResult({
          valid: false,
          message: "Unable to verify right now. Please try again.",
        });
        return;
      }

      if (!data) {
        setResult({
          valid: false,
          message: `No record was found with this ID. Please check the ${
            type === "certificate" ? "Certificate" : "Offer Letter"
          } ID.`,
        });
        return;
      }

      const certificateStatus =
        data.certificate_status || data.status || "pending";

      const offerLetterStatus =
        data.offer_letter_status || "not issued";

      setResult({
        valid: true,
        documentType: type,
        name: data.student_name || "Not available",
        program: data.program || "Not available",
        certificateId: data.certificate_id,
        issueDate: data.issue_date || null,
        certificateStatus: certificateStatus,
        offerLetterStatus: offerLetterStatus,
      });
    } catch (error) {
      console.error("Verification error:", error);

      setResult({
        valid: false,
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrCertificateId = params.get("certificate");

    if (qrCertificateId) {
      const id = qrCertificateId.trim().toUpperCase();

      setDocumentType("certificate");
      setCertificateId(id);
      verifyDocument(id, "certificate");
    }
  }, []);

  async function handleVerify(e) {
    e.preventDefault();
    await verifyDocument(certificateId, documentType);
  }

  function changeDocumentType(type) {
    setDocumentType(type);
    setResult(null);
    setCertificateId("");
  }

  const selectedLabel =
    documentType === "certificate" ? "Certificate" : "Offer Letter";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: WHITE,
        padding: "60px 20px",
        fontFamily: "Arial, Helvetica, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: NAVY,
            color: WHITE,
            padding: "28px 20px",
            borderRadius: "16px",
            borderBottom: `5px solid ${TEAL}`,
          }}
        >
          <h1
            style={{
              fontSize: "clamp(27px, 5vw, 40px)",
              fontWeight: "800",
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            Verify Offer Letter &amp; Certificate
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              fontSize: "16px",
              color: WHITE,
              opacity: 0.85,
            }}
          >
            Internlytic Technologies Document Verification
          </p>
        </div>

        {/* Separate verification buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "28px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => changeDocumentType("certificate")}
            style={{
              flex: "1 1 220px",
              padding: "17px 12px",
              borderRadius: "10px",
              border:
                documentType === "certificate"
                  ? `2px solid ${TEAL}`
                  : "1px solid #d1d5db",
              background:
                documentType === "certificate" ? NAVY : WHITE,
              color:
                documentType === "certificate" ? WHITE : NAVY,
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ✓ Verify Certificate
          </button>

          <button
            type="button"
            onClick={() => changeDocumentType("offer")}
            style={{
              flex: "1 1 220px",
              padding: "17px 12px",
              borderRadius: "10px",
              border:
                documentType === "offer"
                  ? `2px solid ${TEAL}`
                  : "1px solid #d1d5db",
              background: documentType === "offer" ? NAVY : WHITE,
              color: documentType === "offer" ? WHITE : NAVY,
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ✓ Verify Offer Letter
          </button>
        </div>

        <p
          style={{
            marginTop: "22px",
            color: NAVY,
            fontSize: "16px",
            lineHeight: 1.6,
          }}
        >
          Enter your {selectedLabel} ID below to verify its record.
        </p>

        {/* Verification form */}
        <form
          onSubmit={handleVerify}
          style={{
            marginTop: "18px",
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
            placeholder="INT-2026-000001"
            aria-label={`${selectedLabel} ID`}
            style={{
              boxSizing: "border-box",
              width: "min(100%, 320px)",
              padding: "15px",
              border: `1px solid ${NAVY}`,
              borderRadius: "10px",
              fontSize: "16px",
              outlineColor: TEAL,
              color: NAVY,
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "15px 25px",
              border: "none",
              borderRadius: "10px",
              background: TEAL,
              color: NAVY,
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Verifying..." : `Verify ${selectedLabel}`}
          </button>
        </form>

        {/* Verification result */}
        {result && (
          <div
            style={{
              marginTop: "30px",
              padding: "24px",
              borderRadius: "16px",
              background: result.valid ? "#f4faf8" : "#fef2f2",
              border: `1px solid ${
                result.valid ? TEAL : "#fecaca"
              }`,
              textAlign: "left",
              overflowWrap: "anywhere",
            }}
          >
            {result.valid ? (
              <>
                <h2
                  style={{
                    color: NAVY,
                    fontSize: "23px",
                    fontWeight: "800",
                    marginTop: 0,
                  }}
                >
                  ✓ {result.documentType === "certificate"
                    ? "Certificate Record Found"
                    : "Offer Letter Record Found"}
                </h2>

                <p style={{ marginTop: "18px" }}>
                  <strong>Student Name:</strong> {result.name}
                </p>

                <p style={{ marginTop: "10px" }}>
                  <strong>
                    {result.documentType === "certificate"
                      ? "Certificate ID:"
                      : "Offer Letter / Intern ID:"}
                  </strong>{" "}
                  {result.certificateId}
                </p>

                <p style={{ marginTop: "10px" }}>
                  <strong>Program:</strong> {result.program}
                </p>

                {/* Date sirf Offer Letter verification mein */}
                {result.documentType === "offer" && (
                  <p style={{ marginTop: "10px" }}>
                    <strong>Issue Date:</strong>{" "}
                    {result.issueDate
                      ? result.issueDate
                      : "Not available in Supabase"}
                  </p>
                )}

                {/* Certificate status */}
                {result.documentType === "certificate" && (
                  <p
                    style={{
                      marginTop: "16px",
                      color: NAVY,
                      fontWeight: "800",
                    }}
                  >
                    CERTIFICATE STATUS:{" "}
                    {String(result.certificateStatus).toUpperCase()}
                  </p>
                )}

                {/* Offer letter status */}
                {result.documentType === "offer" && (
                  <p
                    style={{
                      marginTop: "16px",
                      color: NAVY,
                      fontWeight: "800",
                    }}
                  >
                    OFFER LETTER STATUS:{" "}
                    {String(result.offerLetterStatus).toUpperCase()}
                  </p>
                )}

                {/* QR code certificate verification par */}
                {result.documentType === "certificate" && (
                  <div
                    style={{
                      marginTop: "25px",
                      textAlign: "center",
                    }}
                  >
                    <CertificateQR
                      certificateId={result.certificateId}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <h2
                  style={{
                    color: "#b91c1c",
                    fontSize: "22px",
                    fontWeight: "800",
                    marginTop: 0,
                  }}
                >
                  ✕ Record Not Found
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

        <p
          style={{
            marginTop: "35px",
            color: NAVY,
            fontSize: "13px",
            opacity: 0.7,
          }}
        >
          © {new Date().getFullYear()} Internlytic Technologies
        </p>
      </div>
    </main>
  );
}
