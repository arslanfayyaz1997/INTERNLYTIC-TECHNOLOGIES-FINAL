export default function VerifyCertificate() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        padding: "40px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "40px", fontWeight: "700" }}>
          Verify Certificate
        </h1>

        <p style={{ fontSize: "18px", marginTop: "15px" }}>
          Internlytic Technologies Certificate Verification
        </p>

        <input
          type="text"
          placeholder="Enter Certificate ID"
          style={{
            marginTop: "30px",
            padding: "14px",
            width: "300px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />

        <button
          style={{
            marginLeft: "10px",
            padding: "14px 20px",
            border: "none",
            borderRadius: "8px",
            background: "#0284c7",
            color: "white",
            cursor: "pointer",
          }}
        >
          Verify
        </button>
      </div>
    </div>
  );
}
