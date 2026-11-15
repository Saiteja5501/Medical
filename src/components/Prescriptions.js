
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback
} from "react";
import API from "../api";

function Prescriptions({ patientId }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const id =
    patientId ||
    sessionStorage.getItem("patientId") ||
    sessionStorage.getItem("userId");

  /* ================= PARSE MEDICINES ================= */

  const parseMedicineString = useCallback((medicineText) => {
    const parts = medicineText
      .split("|")
      .map((part) => part.trim());

    return {
      name: parts[0] || "",
      dosage: parts[1] || "",
      frequency: parts[2] || "",
      duration: parts[3] || ""
    };
  }, []);

  const parseStoredMedicines = useCallback((storedMedicines) => {
    if (!storedMedicines) return [];

    // Already an array
    if (Array.isArray(storedMedicines)) {
      return storedMedicines.map((med) => {
        if (typeof med === "string") {
          return parseMedicineString(med);
        }

        return {
          name: med.name || med.medicine_name || "",
          dosage: med.dosage || "",
          frequency: med.frequency || "",
          duration: med.duration || ""
        };
      });
    }

    if (typeof storedMedicines !== "string") {
      return [];
    }

    // Try JSON format first
    try {
      const parsed = JSON.parse(storedMedicines);

      if (Array.isArray(parsed)) {
        return parsed.map((med) => {
          if (typeof med === "string") {
            return parseMedicineString(med);
          }

          return {
            name: med.name || med.medicine_name || "",
            dosage: med.dosage || "",
            frequency: med.frequency || "",
            duration: med.duration || ""
          };
        });
      }
    } catch (err) {
      // Continue with delimiter format
    }

    // Support: name|dosage|frequency|duration;...
    return storedMedicines
      .split(";")
      .filter((med) => med.trim())
      .map(parseMedicineString);
  }, [parseMedicineString]);

  /* ================= FETCH PRESCRIPTIONS ================= */

  useEffect(() => {
    let active = true;

    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error(
            "Patient login information not found. Please log in again."
          );
        }

        const response = await API.get(
          `/prescriptions/patient/${id}`
        );

        if (!active) return;

        const data = response.data;

        const records = Array.isArray(data)
          ? data
          : Array.isArray(data.prescriptions)
          ? data.prescriptions
          : [];

        setPrescriptions(records);
      } catch (err) {
        if (!active) return;

        console.error(
          "Failed to fetch prescriptions:",
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to load prescriptions"
        );

        setPrescriptions([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPrescriptions();

    return () => {
      active = false;
    };
  }, [id]);

  /* ================= FORMAT DATE ================= */

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  /* ================= SEARCH ================= */

  const filteredPrescriptions = useMemo(() => {
    const searchText = search.toLowerCase();

    return prescriptions.filter((item) => {
      const medicines = parseStoredMedicines(
        item.medicines ?? item.medicine
      );

      const medicineText = medicines
        .map((med) =>
          `${med.name} ${med.dosage} ${med.frequency} ${med.duration}`
        )
        .join(" ");

      return (
        String(item.doctor_name || "")
          .toLowerCase()
          .includes(searchText) ||
        String(item.instructions || "")
          .toLowerCase()
          .includes(searchText) ||
        medicineText.toLowerCase().includes(searchText) ||
        String(item.date || "").toLowerCase().includes(searchText)
      );
    });
  }, [prescriptions, search, parseStoredMedicines]);

  /* ================= TOTAL MEDICINES ================= */

  const totalMedicines = prescriptions.reduce((total, item) => {
    return (
      total +
      parseStoredMedicines(item.medicines ?? item.medicine).length
    );
  }, 0);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.message}>
          <div style={styles.loader}></div>
          Loading prescriptions...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* PAGE HEADER */}

      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>PATIENT RECORDS</div>

          <h1 style={styles.title}>My Prescriptions</h1>

          <p style={styles.subtitle}>
            View your prescribed medicines, dosage and doctor's instructions.
          </p>
        </div>

        <div style={styles.recordBadge}>
          <span style={styles.dot}></span>
          Prescription records
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>▤</div>

          <div>
            <div style={styles.summaryLabel}>
              Total Prescriptions
            </div>

            <div style={styles.summaryValue}>
              {prescriptions.length}
            </div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>✚</div>

          <div>
            <div style={styles.summaryLabel}>
              Total Medicines
            </div>

            <div style={styles.summaryValue}>
              {totalMedicines}
            </div>
          </div>
        </div>
      </div>

      {/* PRESCRIPTION RECORDS */}

      <section style={styles.card}>

        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>
              Your Prescriptions
            </h2>

            <p style={styles.cardSubtitle}>
              Medicines and instructions provided by your doctor
            </p>
          </div>

          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>⌕</span>

            <input
              type="text"
              placeholder="Search medicines or doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        {/* EMPTY STATE */}

        {!error && prescriptions.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>▤</div>

            <h3 style={styles.emptyTitle}>
              No prescriptions found
            </h3>

            <p style={styles.emptyText}>
              Your prescriptions will appear here when your doctor adds them.
            </p>
          </div>
        )}

        {/* SEARCH EMPTY STATE */}

        {!error &&
          prescriptions.length > 0 &&
          filteredPrescriptions.length === 0 && (
            <div style={styles.emptyState}>
              <h3 style={styles.emptyTitle}>
                No matching prescriptions
              </h3>

              <p style={styles.emptyText}>
                Try searching with another medicine name or doctor's name.
              </p>
            </div>
          )}

        {/* PRESCRIPTION CARDS */}

        {!error && filteredPrescriptions.length > 0 && (
          <div style={styles.prescriptionList}>

            {filteredPrescriptions.map((item, index) => {
              const medicineList = parseStoredMedicines(
                item.medicines ?? item.medicine
              );

              return (
                <div
                  key={item.id || index}
                  style={styles.prescriptionCard}
                >

                  {/* PRESCRIPTION HEADER */}

                  <div style={styles.prescriptionHeader}>
                    <div>
                      <div style={styles.prescriptionLabel}>
                        PRESCRIPTION #{item.id || index + 1}
                      </div>

                      <h3 style={styles.doctorName}>
                        Dr. {String(item.doctor_name || "Not available").replace(/^Dr\.\s*/i, "")}
                      </h3>
                    </div>

                    <span style={styles.dateBadge}>
                      {formatDate(item.date)}
                    </span>
                  </div>

                  {/* MEDICINES */}

                  <div style={styles.medicinesSection}>
                    <h4 style={styles.sectionTitle}>
                      Prescribed Medicines ({medicineList.length})
                    </h4>

                    {medicineList.length === 0 ? (
                      <p style={styles.noMedicine}>
                        No medicine details available.
                      </p>
                    ) : (
                      <div style={styles.medicineGrid}>
                        {medicineList.map((med, idx) => (
                          <div
                            key={idx}
                            style={styles.medicineItem}
                          >
                            <div style={styles.medicineTop}>
                              <div style={styles.medicineIcon}>
                                ✚
                              </div>

                              <div style={styles.medicineName}>
                                {med.name || "Medicine not specified"}
                              </div>
                            </div>

                            <div style={styles.medicineDetails}>
                              <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>
                                  Dosage
                                </span>

                                <span style={styles.detailValue}>
                                  {med.dosage || "Not specified"}
                                </span>
                              </div>

                              <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>
                                  Frequency
                                </span>

                                <span style={styles.detailValue}>
                                  {med.frequency || "Not specified"}
                                </span>
                              </div>

                              <div style={styles.detailItem}>
                                <span style={styles.detailLabel}>
                                  Duration
                                </span>

                                <span style={styles.detailValue}>
                                  {med.duration || "Not specified"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* DOCTOR INSTRUCTIONS */}

                  <div style={styles.instructionsSection}>
                    <div style={styles.instructionIcon}>ℹ</div>

                    <div>
                      <h4 style={styles.instructionTitle}>
                        Doctor's Instructions
                      </h4>

                      <p style={styles.instructionsText}>
                        {item.instructions || "No additional instructions provided."}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        )}

        {!error && prescriptions.length > 0 && (
          <div style={styles.tableFooter}>
            Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
          </div>
        )}
      </section>

      {/* INFORMATION PANEL */}

      <div style={styles.infoPanel}>
        <div style={styles.infoIcon}>✚</div>

        <div>
          <h3 style={styles.infoTitle}>
            Follow your doctor's instructions
          </h3>

          <p style={styles.infoText}>
            Review your prescription details carefully. Contact your doctor
            or pharmacist if you have questions about your medicines.
            Do not change your prescribed dosage without medical advice.
          </p>
        </div>
      </div>

    </div>
  );
}

/* =========================================
   INLINE STYLES - HEALTHWAVE DARK DESIGN
========================================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0B0D0E",
    color: "#F3F4F6",
    padding: "32px",
    boxSizing: "border-box",
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "30px"
  },

  eyebrow: {
    color: "#20DCC0",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1.8px",
    marginBottom: "10px"
  },

  title: {
    fontSize: "29px",
    fontWeight: "700",
    margin: "0 0 9px"
  },

  subtitle: {
    fontSize: "13px",
    color: "#899497",
    margin: 0,
    lineHeight: "1.7"
  },

  recordBadge: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    background: "#131C1A",
    border: "1px solid #293432",
    borderRadius: "7px",
    padding: "11px 15px",
    color: "#A4B5B0",
    fontSize: "11px"
  },

  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#20DCC0"
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "25px"
  },

  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "22px",
    background: "#181C1D",
    border: "1px solid #2A3031",
    borderRadius: "10px"
  },

  summaryIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "9px",
    background: "#203A34",
    color: "#20DCC0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0
  },

  summaryLabel: {
    color: "#899497",
    fontSize: "11px",
    marginBottom: "7px"
  },

  summaryValue: {
    color: "#F3F4F6",
    fontSize: "23px",
    fontWeight: "700"
  },

  card: {
    background: "#15191A",
    border: "1px solid #2A3031",
    borderRadius: "11px",
    overflow: "hidden"
  },

  cardHeader: {
    padding: "23px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "18px",
    borderBottom: "1px solid #292F30"
  },

  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    margin: "0 0 7px"
  },

  cardSubtitle: {
    color: "#899497",
    fontSize: "11px",
    margin: 0
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "#1B2021",
    border: "1px solid #303738",
    borderRadius: "7px",
    padding: "0 12px",
    width: "280px",
    maxWidth: "100%"
  },

  searchIcon: {
    color: "#899497",
    fontSize: "22px"
  },

  searchInput: {
    width: "100%",
    padding: "11px",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#F3F4F6",
    fontSize: "12px"
  },

  prescriptionList: {
    padding: "22px"
  },

  prescriptionCard: {
    background: "#181F20",
    border: "1px solid #303A3A",
    borderRadius: "10px",
    padding: "21px",
    marginBottom: "18px"
  },

  prescriptionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    paddingBottom: "17px",
    borderBottom: "1px solid #303838",
    marginBottom: "20px"
  },

  prescriptionLabel: {
    color: "#20DCC0",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1.2px",
    marginBottom: "8px"
  },

  doctorName: {
    color: "#F3F4F6",
    fontSize: "16px",
    margin: 0
  },

  dateBadge: {
    color: "#AAB6B4",
    background: "#202727",
    border: "1px solid #303B39",
    borderRadius: "6px",
    padding: "8px 11px",
    display: "inline-block",
    fontSize: "11px"
  },

  medicinesSection: {
    marginBottom: "20px"
  },

  sectionTitle: {
    color: "#DCE5E3",
    fontSize: "13px",
    margin: "0 0 14px"
  },

  medicineGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "12px"
  },

  medicineItem: {
    background: "#11191A",
    border: "1px solid #2D3938",
    borderRadius: "8px",
    padding: "15px"
  },

  medicineTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px"
  },

  medicineIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "7px",
    background: "#203A34",
    color: "#20DCC0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },

  medicineName: {
    color: "#20DCC0",
    fontSize: "14px",
    fontWeight: "700"
  },

  medicineDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px"
  },

  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: 0
  },

  detailLabel: {
    color: "#849391",
    fontSize: "10px"
  },

  detailValue: {
    color: "#DCE5E3",
    fontSize: "11px",
    overflowWrap: "anywhere"
  },

  noMedicine: {
    color: "#899497",
    fontSize: "12px"
  },

  instructionsSection: {
    display: "flex",
    gap: "12px",
    background: "#1D2927",
    border: "1px solid #34433E",
    borderRadius: "8px",
    padding: "15px"
  },

  instructionIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "7px",
    background: "#29453C",
    color: "#20DCC0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontWeight: "700"
  },

  instructionTitle: {
    color: "#20DCC0",
    fontSize: "12px",
    margin: "0 0 7px"
  },

  instructionsText: {
    color: "#B3BFBA",
    fontSize: "12px",
    lineHeight: "1.7",
    margin: 0
  },

  message: {
    minHeight: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    color: "#899497",
    fontSize: "13px"
  },

  loader: {
    width: "18px",
    height: "18px",
    border: "2px solid #35413F",
    borderTop: "2px solid #20DCC0",
    borderRadius: "50%"
  },

  errorMessage: {
    padding: "35px",
    color: "#FF9292",
    textAlign: "center",
    fontSize: "13px"
  },

  emptyState: {
    padding: "55px 20px",
    textAlign: "center"
  },

  emptyIcon: {
    fontSize: "38px",
    color: "#20DCC0",
    marginBottom: "15px"
  },

  emptyTitle: {
    color: "#F3F4F6",
    fontSize: "16px",
    margin: "0 0 9px"
  },

  emptyText: {
    color: "#899497",
    fontSize: "12px",
    lineHeight: "1.7",
    margin: 0
  },

  tableFooter: {
    padding: "16px 22px",
    color: "#899497",
    fontSize: "11px",
    borderTop: "1px solid #292F30"
  },

  infoPanel: {
    marginTop: "25px",
    padding: "22px",
    background: "#161B1C",
    border: "1px solid #293031",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "17px"
  },

  infoIcon: {
    width: "45px",
    height: "45px",
    background: "#203A34",
    color: "#20DCC0",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0
  },

  infoTitle: {
    fontSize: "13px",
    margin: "0 0 7px"
  },

  infoText: {
    color: "#899497",
    fontSize: "11px",
    lineHeight: "1.7",
    margin: 0
  }
};

export default Prescriptions;
