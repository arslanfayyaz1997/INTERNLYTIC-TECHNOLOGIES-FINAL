export default function CertificateQR({ certificateId }) {
  if (!certificateId) return null;

  const verificationUrl =
    `${window.location.origin}/verify?certificate=${encodeURIComponent(
      certificateId
    )}`;

  const qrImageUrl =
    `https://quickchart.io/qr?text=${encodeURIComponent(
      verificationUrl
    )}&size=220`;

  return (
    <div style={{ textAlign: "center", marginTop: "25px" }}>
      <img
        src={qrImageUrl}
        alt="Certificate Verification QR Code"
        width="220"
        height="220"
      />

      <p style={{ marginTop: "10px", fontSize: "14px" }}>
        Scan to verify this certificate
      </p>
    </div>
  );
}
