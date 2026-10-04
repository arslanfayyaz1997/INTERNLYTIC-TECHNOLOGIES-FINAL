export default function CertificateQR({ certificateId }) {
  if (!certificateId) return null;

  const verificationUrl = `${window.location.origin}/verify?certificate=${encodeURIComponent(
    certificateId
  )}`;

  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    verificationUrl
  )}&size=220`;

  return (
    <div
      style={{
        marginTop: "25px",
        textAlign: "center",
      }}
    >
      <img
        src={qrUrl}
        alt={`QR Code for certificate ${certificateId}`}
        width="220"
        height="220"
        style={{
          display: "block",
          margin: "0 auto",
          background: "#ffffff",
          padding: "10px",
          borderRadius: "12px",
        }}
      />

      <p
        style={{
          marginTop: "10px",
          fontSize: "14px",
          color: "#6b7280",
        }}
      >
        Scan this QR code to verify this certificate
      </p>
    </div>
  );
}
