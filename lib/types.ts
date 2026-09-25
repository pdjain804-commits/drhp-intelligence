export type DrhpFiling = {
  id: string;
  company: string;
  date: string;
  detailUrl: string;
  pdfUrl?: string;
  source: "SEBI";
  status: "NEW" | "REVIEW" | "SHORTLIST" | "EXCLUDE";
};

export type CompanyAnalysis = {
  company: string;
  executiveSummary: string;
  sector: string;
  businessModel: string;
  ipoStructure: {
    freshIssue: string;
    ofs: string;
    useOfProceeds: string;
  };
  metrics: Array<{ label: string; value: string; period?: string; source?: string }>;
  strengths: string[];
  risks: string[];
  peerSignals: Array<{ peer: string; whyComparable: string; notes?: string }>;
  valuation: {
    status: string;
    multiples: Array<{ multiple: string; company: string; value: string; note?: string }>;
  };
  cohortFramework: {
    description: string;
    measures: string[];
  };
  analystQuestions: string[];
  citations: Array<{ title: string; page?: string; quote?: string }>;
};
