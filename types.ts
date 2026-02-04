
export enum ComplianceStandard {
  // AI & Emerging Tech (NEW)
  NIST_AI_RMF = 'NIST AI RMF 1.0 (Generative AI)',
  ISO_42001 = 'ISO/IEC 42001:2023 (AI Management)',
  EU_AI_ACT = 'EU AI Act (High-Risk Categories)',
  OWASP_LLM = 'OWASP Top 10 for LLMs',

  // General & Cloud Security
  SOC2 = 'SOC2 Type II (2024)',
  ISO_27001 = 'ISO/IEC 27001:2022',
  CIS_V8 = 'CIS Critical Security Controls v8',
  CIS_BENCHMARKS = 'CIS Benchmarks (Platform Specific)',
  CSA_CCM = 'CSA Cloud Controls Matrix v4',
  
  // NIST & Government (US)
  NIST_CSF = 'NIST CSF 2.0',
  NIST_800_53 = 'NIST SP 800-53 r5',
  NIST_800_171 = 'NIST SP 800-171 r2',
  FEDRAMP_MOD = 'FedRAMP Moderate',
  FEDRAMP_HIGH = 'FedRAMP High',
  CMMC_L2 = 'CMMC 2.0 (Level 2)',
  DOD_IL5 = 'DoD Impact Level 5 (SRG)',
  
  // Finance & Payments
  PCI_DSS = 'PCI-DSS v4.0.1',
  FINRA = 'FINRA Cybersecurity Checklists',
  GLBA = 'GLBA (Safeguards Rule)',
  SOX = 'Sarbanes-Oxley (SOX)',
  NYDFS_500 = 'NYDFS 23 NYCRR 500',
  SWIFT_CSCF = 'SWIFT CSCF v2024',

  // Healthcare & Pharma
  HIPAA = 'HIPAA Security Rule',
  HITRUST = 'HITRUST CSF v11',
  GxP = 'GxP (FDA 21 CFR Part 11)',
  HDS = 'HDS (France Healthcare)',

  // Privacy & Global
  GDPR = 'GDPR (EU)',
  CCPA = 'CCPA/CPRA (California)',
  LGPD = 'LGPD (Brazil)',
  PIPL = 'PIPL (China)',
  
  // Critical Infrastructure & Specialized
  NERC_CIP = 'NERC CIP-013 (Supply Chain)',
  TISAX = 'TISAX (Automotive)',
  IEC_62443 = 'IEC_62443 (Industrial/SCADA)',
  FERPA = 'FERPA (Education)',
  CUSTOM = 'Custom / Best Practice Assessment'
}

export enum Region {
  ALL = 'All Regions',
  US = 'United States',
  EU = 'Europe (EU)',
  GLOBAL = 'Global / International',
  APAC = 'Asia Pacific',
  LATAM = 'Latin America'
}

export enum UserPersona {
  CISO = 'CISO (Business Risk Focus)',
  DEVSECOPS = 'DevSecOps (Automation & Code Focus)',
  AUDITOR = 'Compliance Auditor (Regulatory Focus)',
  DEVELOPER = 'Software Developer (Actionable Fixes Focus)'
}

export interface FileAttachment {
  name: string;
  mimeType: string;
  data: string; // base64 for images/pdfs
  size: number;
  textContent?: string; // Raw text for .tf, .yaml, .json
}

export interface SecurityFinding {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  controlId: string;
  title: string;
  description: string;
  remediation: string;
}

export interface ReportHistoryEntry {
  id: string;
  timestamp: Date;
  content: string;
  reason: string; // The prompt or action that created this version
}

export interface MissingField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'boolean' | 'number';
  description: string;
  options?: string[];
}

export interface ValidationResult {
  isComplete: boolean;
  missingFields: MissingField[];
  reasoning: string;
}

export const REGION_MAPPING: Record<Region, ComplianceStandard[]> = {
  [Region.ALL]: Object.values(ComplianceStandard),
  [Region.US]: [
    ComplianceStandard.NIST_CSF, ComplianceStandard.NIST_800_53, ComplianceStandard.NIST_800_171,
    ComplianceStandard.FEDRAMP_MOD, ComplianceStandard.FEDRAMP_HIGH, ComplianceStandard.CMMC_L2,
    ComplianceStandard.DOD_IL5, ComplianceStandard.HIPAA, ComplianceStandard.FINRA,
    ComplianceStandard.GLBA, ComplianceStandard.SOX, ComplianceStandard.NYDFS_500,
    ComplianceStandard.CCPA, ComplianceStandard.NERC_CIP, ComplianceStandard.FERPA,
    ComplianceStandard.NIST_AI_RMF, ComplianceStandard.SOC2, ComplianceStandard.HITRUST,
    ComplianceStandard.CIS_V8
  ],
  [Region.EU]: [
    ComplianceStandard.GDPR, ComplianceStandard.EU_AI_ACT, ComplianceStandard.TISAX,
    ComplianceStandard.HDS, ComplianceStandard.ISO_27001, ComplianceStandard.ISO_42001,
    ComplianceStandard.IEC_62443
  ],
  [Region.GLOBAL]: [
    ComplianceStandard.ISO_27001, ComplianceStandard.SOC2, ComplianceStandard.PCI_DSS,
    ComplianceStandard.CIS_V8, ComplianceStandard.CIS_BENCHMARKS, ComplianceStandard.CSA_CCM,
    ComplianceStandard.ISO_42001, ComplianceStandard.NIST_AI_RMF, ComplianceStandard.OWASP_LLM,
    ComplianceStandard.SWIFT_CSCF, ComplianceStandard.IEC_62443, ComplianceStandard.GxP,
    ComplianceStandard.CUSTOM
  ],
  [Region.APAC]: [
    ComplianceStandard.PIPL, ComplianceStandard.ISO_27001, ComplianceStandard.PCI_DSS,
    ComplianceStandard.CIS_V8
  ],
  [Region.LATAM]: [
    ComplianceStandard.LGPD, ComplianceStandard.ISO_27001, ComplianceStandard.PCI_DSS
  ]
};

export interface SecurityAssessmentRequest {
  designInput: string;
  complianceTargets: ComplianceStandard[];
  persona: UserPersona;
  attachments?: FileAttachment[];
}

export interface AssessmentState {
  isLoading: boolean;
  result: string | null;
  error: string | null;
  currentStage?: string;
  originalDesign?: string; 
  complianceTargets?: ComplianceStandard[];
  persona?: UserPersona;
  attachments?: FileAttachment[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export const STAGES = [
  "Discovery (Stack/Hypervisor/AI/CVEs)",
  "Supply Chain & Dependency Analysis",
  "Identity & Unmanaged Account Analysis",
  "Threat Modeling (STRIDE/MITRE)",
  "Compliance Gaps & Authoritative Mapping",
  "Technical Mitigation Guide (Code)",
  "Executive Summary & Risk Score"
];
