export default function CertificateQR({ certificateId }) {
  if (!certificateId) return null;

  const verificationUrl =
    `${window.location.origin}/verify?certificate=` +
    encodeURIComponent(certificateId);

  return (
    <div
      style={{
        marginTop: "25px",
        textAlign: "center",
      }}
    >
      <a
        href={verificationUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          padding: "14px 20px",
          background: "#0284c7",
          color: "#ffffff",
          borderRadius: "10px",
          textDecoration: "none",
          fontWeight: "700",
        }}
      >
        Open Certificate Verification
      </a>

      <p
        style={{
          marginTop: "10px",
          fontSize: "14px",
          color: "#6b7280",
        }}
      >
        Certificate ID: {certificateId}
      </p>
    </div>
  );
}
