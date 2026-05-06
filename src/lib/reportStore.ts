export type RiskLevel = "low" | "medium" | "high";
export type ReportType = "Blood Test" | "X-Ray" | "MRI" | "Prescription" | "ECG" | "General";

export interface KeyFinding {
  label: string;
  value: string;
  status: "normal" | "low" | "high";
}

export interface MedicalReport {
  id: string;
  name: string;
  type: ReportType;
  size: number;
  uploadedAt: number;
  risk: RiskLevel;
  findings: KeyFinding[];
  summary: string;
  suggestions: string[];
}

const KEY = "arogyaai.medical_reports";

const seed = (): MedicalReport[] => {
  const now = Date.now();
  return [
    {
      id: "rep-1",
      name: "Complete_Blood_Count_Apr2026.pdf",
      type: "Blood Test",
      size: 482000,
      uploadedAt: now - 1000 * 60 * 60 * 24 * 2,
      risk: "medium",
      summary:
        "Recent CBC indicates slightly low hemoglobin and elevated fasting glucose. Other parameters within normal range.",
      findings: [
        { label: "Hemoglobin", value: "11.2 g/dL", status: "low" },
        { label: "Fasting Sugar", value: "138 mg/dL", status: "high" },
        { label: "WBC Count", value: "7,200 /µL", status: "normal" },
        { label: "Platelets", value: "２48,000 /µL", status: "normal" },
      ],
      suggestions: [
        "Increase iron-rich foods (spinach, lentils, dates).",
        "Reduce refined sugar and processed carbs.",
        "Schedule a follow-up with your physician within 2 weeks.",
      ],
    },
    {
      id: "rep-2",
      name: "Chest_XRay_Mar2026.pdf",
      type: "X-Ray",
      size: 1240000,
      uploadedAt: now - 1000 * 60 * 60 * 24 * 12,
      risk: "low",
      summary: "Chest X-ray shows clear lung fields with no signs of infection or inflammation.",
      findings: [
        { label: "Lung Fields", value: "Clear", status: "normal" },
        { label: "Heart Size", value: "Normal", status: "normal" },
      ],
      suggestions: ["Maintain regular cardio exercise.", "Annual screening recommended."],
    },
    {
      id: "rep-3",
      name: "Lipid_Profile_Feb2026.pdf",
      type: "Blood Test",
      size: 312000,
      uploadedAt: now - 1000 * 60 * 60 * 24 * 30,
      risk: "high",
      summary: "Lipid panel reveals elevated LDL cholesterol and triglycerides — cardiovascular risk elevated.",
      findings: [
        { label: "LDL Cholesterol", value: "168 mg/dL", status: "high" },
        { label: "HDL Cholesterol", value: "38 mg/dL", status: "low" },
        { label: "Triglycerides", value: "210 mg/dL", status: "high" },
      ],
      suggestions: [
        "Adopt a low-saturated-fat diet.",
        "30 minutes of moderate exercise, 5 days a week.",
        "Consult a cardiologist for medication review.",
      ],
    },
  ];
};

export const loadReports = (): MedicalReport[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as MedicalReport[];
  } catch {
    return seed();
  }
};

export const saveReports = (reports: MedicalReport[]) => {
  localStorage.setItem(KEY, JSON.stringify(reports));
  window.dispatchEvent(new CustomEvent("arogyaai:reports"));
};

export const getReport = (id: string): MedicalReport | undefined =>
  loadReports().find((r) => r.id === id);

export const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const riskColor = (r: RiskLevel) =>
  r === "low"
    ? "bg-success/15 text-success border-success/30"
    : r === "medium"
    ? "bg-warning/15 text-warning border-warning/30"
    : "bg-destructive/15 text-destructive border-destructive/30";
