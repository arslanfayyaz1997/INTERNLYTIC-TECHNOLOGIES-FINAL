import { useState } from "react";
import { BadgeCheck, Search, ShieldCheck } from "lucide-react";

export default function VerifyCertificate() {
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState(null);

  const handleVerify = (e) => {
    e.preventDefault();

    const id = certificateId.trim().toUpperCase();

    if (!id) {
      setResult({
        valid: false,
        message: "Please enter a certificate ID.",
      });
      return;
    }

    // Temporary test record.
    // Later this will be replaced with Supabase verification.
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
          "No certificate was found with this ID. Please check the ID and try again.",
      });
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <ShieldCheck size={34} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Verify Certificate
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Enter an Internlytic Technologies certificate ID to verify
            certificate authenticity.
          </p>
        </div>

        <form
          onSubmit={handleVerify}
          className="mx-auto mt-10 max-w-2xl rounded-3xl border border-gray-200 bg-white p-5 shadow-lg sm:p-7"
        >
          <label
            htmlFor="certificateId"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            Certificate ID
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="certificateId"
              type="text"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder="e.g. INTL-2026-000001"
              className="min-h-12 flex-1 rounded-xl border border-gray-300 px-4 text-gray-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />

            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 font-semibold text-white transition hover:bg-sky-700"
            >
              <Search size={18} />
              Verify
            </button>
          </div>
        </form>

        {result && (
          <div className="mx-auto mt-8 max-w-2xl">
            {result.valid ? (
              <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="text-green-600" size={30} />

                  <div>
                    <h2 className="text-xl font-bold text-green-800">
                      Certificate Verified
                    </h2>

                    <p className="text-sm text-green-700">
                      This certificate is valid in Internlytic Technologies
                      records.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Certificate Holder
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {result.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Certificate ID
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {result.certificateId}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Program
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {result.program}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Issue Date
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {result.issueDate}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Status
                  </p>

                  <p className="mt-1 font-bold text-green-600">
                    ✓ {result.status}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
                <h2 className="font-bold text-red-800">
                  Certificate Not Found
                </h2>

                <p className="mt-2 text-sm text-red-700">
                  {result.message}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}