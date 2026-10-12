
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import CertificateQR from "../components/CertificateQR.jsx";

export default function VerifyCertificate() {
  const [documentType, setDocumentType] = useState("offer");
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [welcomeSlide, setWelcomeSlide] = useState(0);

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

    // Keep the animated waiting screen visible for at least 2.5 seconds.
    const waitForAnimation = new Promise((resolve) =>
      setTimeout(resolve, 2500)
    );

    try {
      const [response] = await Promise.all([
        supabase
          .from("certificates")
          .select("*")
          .eq("certificate_id", cleanId)
          .maybeSingle(),
        waitForAnimation,
      ]);

      const { data, error } = response;

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

      setWelcomeSlide(0);

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

  useEffect(() => {
    if (!result?.valid) return;

    const interval = setInterval(() => {
      setWelcomeSlide((current) => (current + 1) % 3);
    }, 4500);

    return () => clearInterval(interval);
  }, [result?.valid, result?.certificateId]);

  async function handleVerify(e) {
    e.preventDefault();
    await verifyDocument(certificateId, documentType);
  }

  function changeDocumentType(type) {
    setDocumentType(type);
    setCertificateId("");
    setResult(null);
    setWelcomeSlide(0);
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
    transition: "all .2s ease",
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
      <style>{`
        @keyframes welcomeSlideIn {
          from { opacity: 0; transform: translateX(28px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes waitingSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes waitingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: .4; }
          30% { transform: translateY(-8px); opacity: 1; }
        }

        @keyframes softGlow {
          0%, 100% { box-shadow: 0 8px 28px rgba(7,152,121,.08); }
          50% { box-shadow: 0 12px 34px rgba(7,152,121,.2); }
        }

        .welcome-slide {
          animation: welcomeSlideIn .65s ease both;
        }

        .waiting-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #DDF8EC;
          border-top-color: #079879;
          border-radius: 50%;
          margin: 0 auto 18px;
          animation: waitingSpin .8s linear infinite;
        }

        .waiting-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 18px;
        }

        .waiting-dots span {
          width: 8px;
          height: 8px;
          background: #079879;
          border-radius: 50%;
          animation: waitingBounce 1s infinite;
        }

        .waiting-dots span:nth-child(2) { animation-delay: .15s; }
        .waiting-dots span:nth-child(3) { animation-delay: .3s; }

        .ceo-card {
          animation: softGlow 4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .welcome-slide, .waiting-spinner, .waiting-dots span, .ceo-card {
            animation: none !important;
          }
        }
      `}</style>

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

        {/* Offer Letter first, Certificate second */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 22,
            flexWrap: "wrap",
          }}
        >
          {[
            ["offer", "Verify Offer Letter"],
            ["certificate", "Verify Certificate"],
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
              {documentType === type ? "✓ " : ""}
              {label}
            </button>
          ))}
        </div>

        {/* Search form */}
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
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Please wait..." : "Verify Now →"}
            </button>
          </form>
        </section>

        {/* Animated waiting screen */}
        {loading && (
          <section
            className="waiting-card"
            role="status"
            aria-live="polite"
            style={{
              ...cardStyle,
              marginTop: 20,
              textAlign: "center",
              padding: "34px 20px",
            }}
          >
            <div className="waiting-spinner" />
            <h2 style={{ margin: "0 0 8px", fontSize: 23 }}>
              Please Wait...
            </h2>
            <p style={{ color: TEXT, lineHeight: 1.7, margin: 0 }}>
              We're securely finding your record.
              <br />
              Your internship journey matters to us.
            </p>
            <div className="waiting-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </section>
        )}

        {/* Verification result */}
        {!loading && result && (
          <section
            key={`${result.valid}-${result.certificateId || result.message}`}
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
                {/* Record details */}
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

                {/* Automatically sliding welcome messages */}
                <div
                  style={{
                    marginTop: 24,
                    padding: "24px 18px",
                    borderRadius: 18,
                    background: `linear-gradient(140deg, ${PALE}, ${WHITE})`,
                    border: "1px solid #D5EEE3",
                    textAlign: "center",
                    overflow: "hidden",
                  }}
                >
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

                  <div
                    key={welcomeSlide}
                    className="welcome-slide"
                    style={{
                      minHeight: 190,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    {welcomeSlide === 0 && (
                      <>
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
                        <p style={slideTextStyle}>
                          We're delighted to welcome you to the Internlytic
                          Technologies family. Your internship is an
                          opportunity to develop practical skills, explore
                          new ideas, and take meaningful steps towards your
                          professional goals.
                        </p>
                      </>
                    )}

                    {welcomeSlide === 1 && (
                      <>
                        <h2 style={slideHeadingStyle}>
                          Your Growth Starts Here 🚀
                        </h2>
                        <p style={slideTextStyle}>
                          Every task is a chance to learn something new.
                          Stay consistent, submit your best work, and use
                          feedback to strengthen your skills. Keep learning,
                          improving, and moving forward.
                        </p>
                      </>
                    )}

                    {welcomeSlide === 2 && (
                      <>
                        <h2 style={slideHeadingStyle}>
                          A Message from Your CEO 💚
                        </h2>
                        <p style={slideTextStyle}>
                          I'm Arslan Fayyaz, CEO & Founder of Internlytic
                          Technologies. We're happy to have you with us.
                          Approach every challenge with curiosity and make
                          the most of this learning experience.
                        </p>
                        <strong
                          style={{
                            display: "block",
                            marginTop: 12,
                            fontSize: 18,
                            color: NAVY,
                          }}
                        >
                          Arslan Fayyaz
                        </strong>
                        <span style={{ color: TEAL, fontSize: 13 }}>
                          CEO & Founder | Internlytic Technologies
                        </span>
                      </>
                    )}
                  </div>

                  {/* Slide indicators */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    {[0, 1, 2].map((slide) => (
                      <button
                        key={slide}
                        type="button"
                        aria-label={`Show welcome slide ${slide + 1}`}
                        onClick={() => setWelcomeSlide(slide)}
                        style={{
                          width: welcomeSlide === slide ? 24 : 8,
                          height: 8,
                          border: "none",
                          borderRadius: 10,
                          padding: 0,
                          background:
                            welcomeSlide === slide ? TEAL : "#B8DCCF",
                          cursor: "pointer",
                          transition: "all .3s ease",
                        }}
                      />
                    ))}
                  </div>
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
                