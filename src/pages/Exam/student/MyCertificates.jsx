import React, { useState, useEffect } from "react";
import { FaAward, FaDownload, FaEye, FaSpinner } from "react-icons/fa";
import { getMyCertificates, getMyCertificateDetail } from "../../../services/certificate.service";

const TYPE_LABELS = {
  degree: "Degree Certificate",
  provisional: "Provisional Certificate",
  migration: "Migration Certificate",
  character: "Character Certificate",
  transcript: "Transcript",
  rank: "Rank Certificate",
};

const TYPE_COLORS = {
  degree: "from-indigo-500 to-purple-600",
  provisional: "from-blue-500 to-cyan-600",
  migration: "from-green-500 to-emerald-600",
  character: "from-amber-500 to-orange-600",
  transcript: "from-gray-500 to-gray-700",
  rank: "from-yellow-500 to-amber-600",
};

const DIVISION_LABELS = {
  first_with_distinction: "First Class with Distinction",
  first: "First Division",
  second: "Second Division",
  third: "Third Division",
  pass: "Pass",
};

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await getMyCertificates();
      setCertificates(res.data || []);
    } catch {
      setError("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await getMyCertificateDetail(id);
      setSelectedCert(res.data);
    } catch {
      setError("Failed to load certificate details");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-3xl text-green-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FaAward className="text-indigo-500" /> My Certificates
        </h1>
        <p className="text-sm text-gray-500 mt-1">View and download your issued certificates</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      {certificates.length === 0 ? (
        <div className="text-center py-16">
          <FaAward className="mx-auto text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No certificates issued yet</p>
          <p className="text-gray-400 text-sm mt-1">Your certificates will appear here once issued</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewDetail(cert._id)}
            >
              <div className={`h-2 bg-gradient-to-r ${TYPE_COLORS[cert.type] || "from-gray-400 to-gray-600"}`} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {TYPE_LABELS[cert.type] || cert.type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || cert.type}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mt-1">{cert.serialNumber}</p>
                  </div>
                  <FaEye className="text-gray-400" />
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>{cert.programName}</p>
                  {cert.cgpa > 0 && <p className="font-medium">CGPA: {cert.cgpa}</p>}
                  {cert.issueDate && (
                    <p className="text-xs">
                      Issued: {new Date(cert.issueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCert(null)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto print:max-w-none print:shadow-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Certificate Header */}
            <div className={`p-6 bg-gradient-to-r ${TYPE_COLORS[selectedCert.type] || "from-gray-400 to-gray-600"} text-white`}>
              <div className="text-center">
                <FaAward className="mx-auto text-4xl mb-2 opacity-80" />
                <h2 className="text-2xl font-bold">{TYPE_LABELS[selectedCert.type] || selectedCert.type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h2>
                <p className="text-sm opacity-80 mt-1 font-mono">{selectedCert.serialNumber}</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-lg text-gray-600 dark:text-gray-400">This is to certify that</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{selectedCert.studentName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedCert.rollNumber && (
                  <div>
                    <p className="text-gray-500">Roll Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCert.rollNumber}</p>
                  </div>
                )}
                {selectedCert.registrationNumber && (
                  <div>
                    <p className="text-gray-500">Registration Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCert.registrationNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Program</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCert.programName} ({selectedCert.programCode})</p>
                </div>
                {selectedCert.department && (
                  <div>
                    <p className="text-gray-500">Department</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCert.department}</p>
                  </div>
                )}
                {selectedCert.school && (
                  <div>
                    <p className="text-gray-500">School</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCert.school}</p>
                  </div>
                )}
                {selectedCert.cgpa > 0 && (
                  <div>
                    <p className="text-gray-500">CGPA</p>
                    <p className="text-xl font-bold text-indigo-600">{selectedCert.cgpa}</p>
                  </div>
                )}
                {selectedCert.totalCredits > 0 && (
                  <div>
                    <p className="text-gray-500">Total Credits</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedCert.totalCredits}</p>
                  </div>
                )}
                {selectedCert.division && (
                  <div>
                    <p className="text-gray-500">Division</p>
                    <p className="font-medium text-gray-900 dark:text-white">{DIVISION_LABELS[selectedCert.division]}</p>
                  </div>
                )}
                {selectedCert.issueDate && (
                  <div>
                    <p className="text-gray-500">Date of Issue</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedCert.issueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-3 pt-4 border-t dark:border-gray-700 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <FaDownload /> Print / Download
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:border-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
