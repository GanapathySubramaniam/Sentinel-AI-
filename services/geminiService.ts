
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { ComplianceStandard, UserPersona, FileAttachment, ValidationResult } from "../types";

const generateSystemInstruction = (currentDate: string, persona: UserPersona, standards: ComplianceStandard[]) => `
You are the "SentinelAI-Security Assessment Engine (v2026)." You act as a Senior Security Architect and Automated Compliance Auditor.

### USER PERSONA (CRITICAL)
Your current user is a: **${persona}**.
- Adjust your vocabulary and tone to match this persona.
- The **Executive TL;DR** must be specifically written for their priorities.

### COMPLIANCE TARGETS
Perform a unified audit across ALL these standards: ${standards.join(', ')}.

### MANDATORY METADATA
Start the report with:
- **Report Generated**: ${currentDate}
- **Persona Context**: ${persona}
- **Assessment Scope**: ${standards.join(', ')}

### OPERATIONAL FRAMEWORK
1. **Executive TL;DR (Persona Specific)**:
   - Provide a 3-5 bullet point summary tailored to the **${persona}**.
2. **Discovery & Supply Chain Scan**:
   - Identify Platforms, AI/ML components, and software dependencies.
3. **Threat Modeling & Attack Path**:
   - Provide MITRE ATT&CK Matrix.
   - **MANDATORY**: Generate a Mermaid.js 'graph TD' representing the attack surface.
   - **CRITICAL VISUALIZATION RULE**: You MUST highlight threats, attackers, or vulnerable nodes by appending \`:::threat\` to the node ID. 
     - Correct: \`Attacker(Malicious Actor):::threat --> FW[Firewall]\`
     - Correct: \`SQLi(SQL Injection Vector):::threat --> DB[(Database)]\`
     - Incorrect: \`style A fill:#f00\` (Do NOT use manual styles).
4. **Multi-Standard Gap Analysis (ENHANCED)**:
   - Create a table showing how findings map across multiple standards.
   - **CRITICAL**: For every control ID, include the title and summary.
5. **Remediation & IaC**:
   - Consolidated Terraform block for all technical findings.
6. **Executive Summary**:
   - MUST use format: "**Risk Score**: [CRITICAL|HIGH|MEDIUM|LOW]"
7. **Citations & References (CRITICAL)**:
   - Throughout the report, you MUST include external authoritative links to standard documentation (e.g., NIST, ISO, CIS, OWASP).
   - Use standard markdown format: [Title](URL).
   - Ensure at least 3-5 relevant citations are present in the report.
8. **Structured Findings Data (HIDDEN BLOCK)**:
   - At the VERY END, output: \`::FINDING:: [SEVERITY] :: [CONTROL_ID] :: [TITLE] :: [DESCRIPTION] :: [REMEDIATION]\`
`;

const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const validateAssessmentInput = async (
  designInput: string,
  standards: ComplianceStandard[]
): Promise<ValidationResult> => {
  const ai = getAI();
  const prompt = `
    Audit the following architectural design input against these compliance standards: ${standards.join(', ')}.
    Determine if there is sufficient detail to provide a HIGH-FIDELITY security assessment.
    
    Look for missing critical info like:
    - Specific cloud provider/region.
    - Data sensitivity levels.
    - Authentication mechanisms (OIDC, SAML, etc.).
    - Database encryption strategies.
    - Network segmentation details.

    Input to validate:
    ${designInput}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isComplete: { type: Type.BOOLEAN, description: 'True if no critical info is missing.' },
            missingFields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'One of: text, select, boolean, number' },
                  description: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Only for type: select' }
                },
                required: ['id', 'label', 'type', 'description']
              }
            },
            reasoning: { type: Type.STRING, description: 'Summary of why the input is or isn\'t complete.' }
          },
          required: ['isComplete', 'missingFields', 'reasoning']
        }
      }
    });

    return JSON.parse(response.text || '{}') as ValidationResult;
  } catch (e) {
    console.error("Validation Error:", e);
    return { isComplete: true, missingFields: [], reasoning: "Validation bypass due to error." };
  }
};

export const analyzeSecurityPosture = async (
  designInput: string, 
  complianceTargets: ComplianceStandard[],
  persona: UserPersona,
  attachments: FileAttachment[] = []
): Promise<string> => {
  const ai = getAI();
  const currentDate = new Date().toISOString().split('T')[0];

  const parts: any[] = [
    { text: `
      Analyze this architecture:
      ${designInput}
      Audit it against: ${complianceTargets.join(', ')}.
      User Persona: ${persona}.
    `}
  ];

  attachments.forEach(file => {
    if (file.textContent) {
      parts.push({ text: `Attached Technical Context [${file.name}]:\n\n${file.textContent}` });
    } else if (file.data) {
      parts.push({
        inlineData: {
          data: file.data,
          mimeType: file.mimeType
        }
      });
    }
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: generateSystemInstruction(currentDate, persona, complianceTargets),
        thinkingConfig: { thinkingBudget: 8192 },
        temperature: 0.2,
      }
    });

    return response.text || "No analysis generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Assessment failed.");
  }
};

export const simulateAttack = async (
  vulnerabilityDescription: string,
  infrastructure: string,
  complianceTarget: string
): Promise<string> => {
  const ai = getAI();
  const systemInstruction = `
    You are the "SentinelAI Strike Simulator." You are a world-class Red Team operator and exploit researcher.
    Your goal is to demonstrate a realistic attack simulation based on the provided architecture and compliance context.
    
    ### FORMAT REQUIREMENTS
    1. **Simulation Log**: Use a technical, terminal-like tone (e.g., "[INFO] Initializing scan...").
    2. **The Kill Chain**: Break down the attack into Reconnaissance, Weaponization, Delivery, Exploitation, Installation, C2, and Actions on Objectives.
    3. **Technical PoC**: Provide a non-executable code snippet (Python, Bash, or Go) illustrating the exploit logic.
    4. **MITRE ATT&CK Mapping**: List the specific Techniques (TIDs) used.
    5. **Business Impact**: Explain what happens to the data and compliance status if this succeeds.
    6. **Remediation Priority**: How long and how much effort to fix.

    Tone: Aggressive, technical, professional, "Cyberpunk Red Team".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { 
        parts: [{ text: `
          SIMULATE ATTACK VECTOR:
          TARGET ARCHITECTURE: ${infrastructure}
          VULNERABILITY CONTEXT: ${vulnerabilityDescription}
          COMPLIANCE FOCUS: ${complianceTarget}
          
          Execute deep-thinking reasoning to find non-obvious attack paths.
        ` }]
      },
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 16384 },
        temperature: 0.7,
      }
    });
    return response.text || "Strike simulation failed to generate payload.";
  } catch (error: any) {
    throw new Error(error.message || "Simulation engine error.");
  }
};

export const createRemediationChat = (
  designInput: string,
  complianceTargets: ComplianceStandard[],
  persona: UserPersona,
  analysisResult: string
) => {
  const ai = getAI();
  // Ensure we capture as much context as possible, especially citations which might be at the end.
  const chatSystemInstruction = `
    You are "SentinelAI Copilot," an expert remediation advisor assisting a **${persona}**.
    
    ### CORE RULES:
    1. **Attachment Policy**: When a user uploads a file, treat it as primary technical context.
    2. **Text File Handling**: If the user provides a .tf, .yaml, or .json file as text, analyze it deeply for security vulnerabilities and compliance gaps against the current report.
    3. **Query Primacy**: Generate your responses strictly based on the user's query. Use the provided analysis report and any attachments as context only.
    4. **Citation Persistence (CRITICAL)**: When asked to regenerate or update the report, you MUST RETAIN all authoritative external links (e.g., NIST, ISO, CIS) from the original report. Never omit the "[Title](URL)" formatted citations.
    5. **Report Modifications**: You can discuss potential changes to the security report, but DO NOT provide a full updated report unless explicitly asked in a subsequent turn.
    6. **Confirmation Workflow**: The UI will provide a button to the user to apply changes. Your primary goal is to provide high-quality remediation advice and answer technical questions.
    7. **Tone**: Speak in a tone suitable for a ${persona}.
    
    Current Compliance Standards: ${complianceTargets.join(', ')}.
    Existing Report Context: ${analysisResult}
    Infrastructure Design: ${designInput.substring(0, 1000)}...
  `;

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction: chatSystemInstruction, temperature: 0.4 }
  });
};

export const sendMessageToChat = async (chat: Chat, message: string, attachments: FileAttachment[] = []): Promise<string> => {
  try {
    const msgParts: any[] = [{ text: message || "Please analyze the attached technical files." }];
    
    attachments.forEach(att => {
      if (att.textContent) {
        msgParts.push({ text: `REFERENCE FILE [${att.name}]:\n\n${att.textContent}` });
      } else if (att.data) {
        msgParts.push({
          inlineData: { data: att.data, mimeType: att.mimeType }
        });
      }
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message: msgParts });
    return response.text || "I couldn't generate a response.";
  } catch (error: any) {
    console.error("Chat Send Error:", error);
    return "Connection error.";
  }
};
