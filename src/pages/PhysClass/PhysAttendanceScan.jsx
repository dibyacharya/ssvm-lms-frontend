import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, AlertCircle, Loader } from "lucide-react";
import api from "../../services/api";

/**
 * Physical Classroom QR Attendance Scanner
 * Students scan the QR code displayed in class; QR URL contains token as query param.
 * URL pattern: /attend?token=<token>
 */
const PhysAttendanceScan = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("idle"); // idle | verifying | success | error | already
  const [message, setMessage] = useState("");
  const [classInfo, setClassInfo] = useState(null);
  const [manualToken, setManualToken] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    setStatus("verifying");
    setMessage("");
    try {
      const { data } = await api.post("/phys-attendance/verify", { token });
      if (data.alreadyMarked) {
        setStatus("already");
      } else {
        setStatus("success");
      }
      setMessage(data.message || "Attendance marked!");
      setClassInfo({ className: data.className, courseName: data.courseName, scannedAt: data.scannedAt });
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.error || "Verification failed. Please try again.");
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualToken.trim()) {
      let token = manualToken.trim();
      try {
        const url = new URL(token);
        token = url.searchParams.get("token") || token;
      } catch {
        // Not a URL, use as-is
      }
      verifyToken(token);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Physical Class Attendance</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Scan the QR code displayed in your classroom to mark attendance.</p>

        {status === "verifying" && (
          <div className="text-center py-8">
            <Loader size={48} className="mx-auto text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Verifying your attendance...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center py-6">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">{message}</h2>
            {classInfo?.className && (
              <p className="text-gray-600">{classInfo.className}</p>
            )}
            {classInfo?.courseName && (
              <p className="text-gray-500 text-sm">{classInfo.courseName}</p>
            )}
            {classInfo?.scannedAt && (
              <p className="text-xs text-gray-400 mt-2">
                {new Date(classInfo.scannedAt).toLocaleTimeString("en-IN")}
              </p>
            )}
          </div>
        )}

        {status === "already" && (
          <div className="text-center py-6">
            <AlertCircle size={64} className="mx-auto text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Already Marked</h2>
            <p className="text-gray-600">{message}</p>
            {classInfo?.className && (
              <p className="text-gray-500 text-sm mt-1">{classInfo.className}</p>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-6">
            <XCircle size={64} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => { setStatus("idle"); setMessage(""); }}
              className="bg-blue-600 text-gray-900 px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {status === "idle" && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-blue-700 text-sm">
                Scan the QR code in your classroom with your phone camera. The attendance page will open automatically.
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-2 text-center">Or paste the token / URL manually:</p>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste QR token or URL..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-gray-900 px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  Verify
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PhysAttendanceScan;
