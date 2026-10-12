
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import CertificateQR from "../components/CertificateQR.jsx";

export default function VerifyCertificate() {
  const [documentType, setDocumentType] = useState("certificate");
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const NAVY = "#073B3A";
  const TEAL = "#079879";
  const MINT = "#DDF8EC";
  const PALE = "#F0FBF5";
  const WHITE = "#FFFFFF";
  const TEXT = "#45645F";

  async function verifyDocument(id, type = documentType) {
    const cleanId = id.trim().toUpperCase();

    if (!cleanId) {
      setResult({
        valid: false,
        message: `Please enter a ${
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
        console.error("Verification error:", error);
        setResult({
          valid: false,
          message: "Unable to verify right now. Please try again.",
        });
        return;
      }

      if (!data) {
        setResult({
          valid: false,
          message: `No record found. Please check your ${
            type === "certificate" ? "Certificate" : "Offer Letter"
          } ID.`,
        });
        return;
      }

      const certificateStatus =
        data.certificate_status || data.status || "pending";

      const offerLetterStatus =
        data.offer_letter_status || "not issued";

      const issueDate =
        type === "offer"
          ? data.offer_letter_issue_date || null
          : data.certificate_issue_date || null;

      setResult({
        valid: true,
        documentType: type,
        name: data.student_name || "Intern",
        program:
          data.program || data.internship_program || "Internship Program",
        certificateId: data.certificate_id,
        issueDate,
        certificateStatus,
        offerLetterStatus,
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
    const qrId = params.get("certificate");

    if (qrId) {
      const id = qrId.trim().toUpperCase();
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
    setCertificateId("");
    setResult(null);
  }

  function formatDate(value) {
    if (!value) return "Not available in Supabase";

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

    return match
      ? `${match[3]}-${match[2]}-${match[1]}`
      : String(value);
  }

  const isCertificateIssued = (status) =>
    ["issued", "completed", "approved"].includes(
      String(status || "").trim().toLowerCase()
    );

  const isIssued =
    result?.valid &&
    result.documentType === "certificate" &&
    isCertificateIssued(result.certificateStatus);

  const selectedLabel =
    documentType === "certificate" ? "Certificate" : "Offer Letter";

  const cardStyle = {
    background: WHITE,
    border: "1px solid #D5EEE3",
    borderRadius: 20,
    padding: 22,
    boxShadow: "0 8px 28px rgba(7,59,58,0.06)",
  };

  const buttonStyle = {
    padding: "15px 18px",
    borderRadius: 12,
    border: "none",
    background: TEAL,
    color: WHITE,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${MINT} 0%, ${PALE} 420px, #FFFFFF 100%)`,
        padding: "30px 16px 45px",
        boxSizing: "border-box",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: NAVY,
      }}
    >
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Page heading */}
        <header
          style={{
            textAlign: "center",
            padding: "28px 18px",
            borderRadius: 22,
            background: WHITE,
            border: "1px solid #D5EEE3",
            boxShadow: "0 8px 28px rgba(7,59,58,0.06)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "7px 13px",
              borderRadius: 30,
              background: MINT,
              color: TEAL,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            INTERNLYTIC TECHNOLOGIES
          </div>

          <h1
            style={{
              fontSize: "clamp(27px, 6vw, 38px)",
              lineHeight: 1.2,
              margin: "18px 0 10px",
              fontWeight: 800,
              color: NAVY,
            }}
          >
            Document Verification
          </h1>

          <p style={{ color: TEXT, lineHeight: 1.7, margin: 0 }}>
            Verify your internship record and celebrate your journey with us.
          </p>
        </header>

        {/* Document selection */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 22,
            flexWrap: "wrap",
          }}
        >
          {[
            ["certificate", "Verify Certificate"],
            ["offer", "Verify Offer Letter"],
          ].map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => changeDocumentType(type)}
              style={{
                ...buttonStyle,
                flex: "1 1 210px",
                background: documentType === type ? TEAL : WHITE,
                color: documentType === type ? WHITE : NAVY,
                border:
                  documentType === type
                    ? `2px solid ${TEAL}`
                    : "1px solid #CBE6DA",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <section style={{ ...cardStyle, marginTop: 16 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>
            Find Your Record
          </h2>
          <p style={{ color: TEXT, lineHeight: 1.6, marginTop: 0 }}>
            Enter your {selectedLabel} ID to view your details and status.
          </p>

          <form
            onSubmit={handleVerify}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <input
              type="text"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder={`Enter ${selectedLabel} ID`}
              aria-label={`${selectedLabel} ID`}
              style={{
                flex: "1 1 220px",
                minWidth: 0,
                boxSizing: "border-box",
                padding: 15,
                borderRadius: 12,
                border: "1px solid #CBE6DA",
                fontSize: 15,
                color: NAVY,
                outlineColor: TEAL,
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                opacity: loading ? 0.65 : 1,
              }}
            >
              {loading ? "Verifying..." : "Verify Now →"}
            </button>
          </form>
        </section>

        {/* Result */}
        {result && (
          <section
            aria-live="polite"
            style={{
              ...cardStyle,
              marginTop: 20,
              background: result.valid ? WHITE : "#FFF8F7",
              borderColor: result.valid ? "#BFE8D7" : "#F2CECA",
            }}
          >
            {result.valid ? (
              <>
                <div
                  style={{
                    background: MINT,
                    borderRadius: 15,
                    padding: 18,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 7px",
                      color: TEAL,
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: 1,
                    }}
                  >
                    ✓ RECORD FOUND
                  </p>

                  <h2 style={{ margin: "0 0 16px", fontSize: 25 }}>
                    {result.documentType === "certificate"
                      ? "Certificate Record"
                      : "Offer Letter Record"}
                  </h2>

                  <Detail label="Student Name" value={result.name} />
                  <Detail
                    label={
                      result.documentType === "certificate"
                        ? "Certificate ID"
                        : "Offer Letter / Intern ID"
                    }
                    value={result.certificateId}
                  />
                  <Detail label="Program" value={result.program} />
                  <Detail
                    label={
                      result.documentType === "offer"
                        ? "Offer Letter Issue Date"
                        : "Certificate Issue Date"
                    }
                    value={formatDate(result.issueDate)}
                  />

                  <Detail
                    label={
                      result.documentType === "offer"
                        ? "Offer Letter Status"
                        : "Certificate Status"
                    }
                    value={
                      result.documentType === "offer"
                        ? result.offerLetterStatus
                        : result.certificateStatus
                    }
                  />
                </div>

                {/* Personalized welcome */}
                <div style={{ marginTop: 24, textAlign: "center" }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>✦</div>
                  <p
                    style={{
                      color: TEAL,
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: 1.4,
                      margin: "0 0 8px",
                    }}
                  >
                    A PERSONAL WELCOME
                  </p>

                  <h2
                    style={{
                      fontSize: "clamp(24px, 5vw, 32px)",
                      lineHeight: 1.25,
                      margin: "0 0 14px",
                      color: NAVY,
                    }}
                  >
                    Welcome, {result.name}! 🎉
                  </h2>

                  <p
                    style={{
                      color: TEXT,
                      lineHeight: 1.9,
                      fontSize: 15,
                      margin: 0,
                    }}
                  >
                    We're delighted to welcome you to the Internlytic
                    Technologies family. Your internship is an opportunity
                    to develop practical skills, explore new ideas, and take
                    meaningful steps towards your professional goals.
                    Stay curious, work consistently, and make the most of
                    every learning opportunity. We're here to encourage
                    your growth throughout this journey.
                  </p>
                </div>

                {/* Certificate guidance */}
                {result.documentType === "certificate" && (
                  <div
                    style={{
                      marginTop: 24,
                      padding: 20,
                      borderRadius: 17,
                      background: isIssued ? MINT : "#F0FBF7",
                      border: "1px solid #CBEBDD",
                    }}
                  >
                    <h3 style={{ margin: "0 0 10px", fontSize: 19 }}>
                      {isIssued
                        ? "Congratulations on Your Achievement! 🎉"
                        : "Your Achievement Starts Here 🚀"}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: TEXT,
                        lineHeight: 1.8,
                        fontSize: 14,
                      }}
                    >
                      {isIssued
                        ? "Congratulations on reaching this milestone! Thank you for being part of Internlytic Technologies. We hope your internship experience helps you move forward with confidence and continue building your skills."
                        : "Complete all your assigned internship tasks, submit your work for review, and meet the internship requirements. Once you have successfully completed the required tasks and your completion has been confirmed, you will be eligible to receive your internship certificate. Keep learning, improving, and moving forward!"}
                    </p>

                    <button
                      type="button"
                      disabled
                      title="The certificate PDF will be connected after it is issued."
                      style={{
                        ...buttonStyle,
                        width: "100%",
                        marginTop: 18,
                        background: "#DCEBE5",
                        color: "#52766B",
                        cursor: "not-allowed",
                      }}
                    >
                      ↓ Download Certificate — Coming Soon
                    </button>

                    <p
                      style={{
                        fontSize: 12,
                        color: TEXT,
                        lineHeight: 1.6,
                        marginBottom: 0,
                        textAlign: "center",
                      }}
                    >
                      Your download will be available when your certificate
                      has been issued and its PDF is connected.
                    </p>
                  </div>
                )}

                {/* CEO card */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginTop: 22,
                    padding: 16,
                    borderRadius: 17,
                    background: NAVY,
                    color: WHITE,
                  }}
                >
                  <img
                    src="/arslan-fayyaz.jpg"
                    alt="Arslan Fayyaz, Founder and CEO"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    style={{
                      width: 82,
                      height: 82,
                      flexShrink: 0,
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: "3px solid #6AD8B3",
                    }}
                  />

                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: "0 0 6px",
                        color: "#79E0B8",
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 1,
                      }}
                    >
                      WARM REGARDS
                    </p>
                    <h3 style={{ margin: "0 0 5px", fontSize: 20 }}>
                      Arslan Fayyaz
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "#D8F4E8",
                        fontSize: 13,
                        lineHeight: 1.6,
                      }}
                    >
                      CEO & Founder
                      <br />
                      Internlytic Technologies
                    </p>
                  </div>
                </div>

                {/* QR */}
                {result.documentType === "certificate" && (
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: 24,
                      paddingTop: 20,
                      borderTop: "1px solid #D5EEE3",
                    }}
                  >
                    <h3 style={{ margin: "0 0 14px" }}>
                      Certificate Verification QR
                    </h3>
                    <CertificateQR
                      certificateId={result.certificateId}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 style={{ color: "#B42318", marginTop: 0 }}>
                  Record Not Found
                </h2>
                <p style={{ color: "#B42318", lineHeight: 1.7 }}>
                  {result.message}
                </p>
              </>
            )}
          </section>
        )}

        <footer
          style={{
            textAlign: "center",
            marginTop: 30,
            color: TEXT,
            fontSize: 12,
            lineHeight: 1.8,
          }}
        >
          <strong>INTERNLYTIC TECHNOLOGIES</strong>
          <br />
          Learn • Build • Grow
          <br />© {new Date().getFullYear()} Internlytic Technologies
        </footer>
      </div>
    </main>
  );
}

function Detail({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 6,
        padding: "11px 0",
        borderBottom: "1px solid #D5EEE3",
      }}
    >
      <span style={{ color: "#45645F", fontSize: 14 }}>{label}</span>
      <strong
        style={{
          color: "#073B3A",
          fontSize: 14,
          overflowWrap: "anywhere",
          textAlign: "right",
        }}
      >
        {value}
      </strong>
    </div>
  );
}
