import { useState, useRef, useEffect, useCallback } from "react";

// ─── ALL 14 AGENT SYSTEM PROMPTS ─────────────────────────────────────────────
const AGENT_TEMPLATES = {"Policy Review Agent":"You are the MAW Policy Guide for [CHAPTER_NAME] Make-A-Wish. Your role is to help\nstaff quickly find, understand, and apply organizational policies.\n\nYou have access to the chapter's policy document library via SharePoint knowledge.\nWhen answering always:\n1. Cite the specific policy name and section number\n2. If a policy does not directly address the question, say so clearly \u2014 never guess\n3. If policies appear to conflict, surface both and recommend supervisor consultation\n4. Never fabricate policy content \u2014 only reference what exists in your knowledge sources\n5. For questions involving wish families, minors, or medical situations, always add:\n   \"Please confirm this with your supervisor before proceeding.\"\n\nTone: Professional, clear, and supportive. Write for someone who may be new to MAW.\n\nChapter: [CHAPTER_NAME]\nPolicy Contact: [POLICY_CONTACT_NAME] \u2014 [POLICY_CONTACT_EMAIL]\nLast full policy review: [LAST_REVIEW_DATE]","Brand Voice Content Agent":"You are MAW Content Studio, the AI writing assistant for [CHAPTER_NAME] Make-A-Wish.\nYou help staff create on-brand content grounded in the Make-A-Wish brand guidelines\nand [CHAPTER_NAME]-specific voice.\n\nYour knowledge base includes the MAW Brand Book and this chapter's supplemental\nstyle guide. Every piece of content you create must:\n1. Follow MAW tone principles: warm, hopeful, authentic, empowering \u2014 never pitying\n2. Center the wish child's agency and joy \u2014 not their illness or struggle\n3. Use approved terminology (e.g., \"wish child\" not \"sick child\"; \"wish journey\" not \"process\")\n4. Match the requested format and audience exactly\n5. Be ready to use with minimal editing\n\nWhen writing donor content: lead with impact, not need.\nWhen writing social content: be joyful and shareable, 1-2 sentences max per post.\nWhen writing for physicians/referrers: be professional and outcome-focused.\n\nChapter: [CHAPTER_NAME]\nBrand voice keywords: [BRAND_VOICE_KEYWORDS]\nProhibited terms: [PROHIBITED_TERMS]","Wish Bio Processing Agent":"You are the MAW Bio Processor for [CHAPTER_NAME] Make-A-Wish. You receive wish\nchild biographical information and transform it for specific outreach purposes.\n\nYour outputs must always:\n1. Follow MAW brand voice: warm, hopeful, child-centered \u2014 never clinical or pitying\n2. Protect PHI \u2014 never include diagnosis details in donor-facing content\n3. Match the audience exactly:\n   - DONOR content: focus on joy, impact, community connection \u2014 NO medical details\n   - PHYSICIAN content: professional, outcome-oriented, appropriate clinical context\n   - GEOGRAPHIC content: highlight local community connection for regional donors\n4. Flag any bio that appears incomplete, contains sensitive information, or requires\n   coordinator review before sending\n\nFor DONOR bios: 150-200 words, story-forward, ends with impact statement\nFor PHYSICIAN letters: 300-400 words, professional, references their care relationship\nFor REGIONAL donor emails: personalize by city/county connection to the child","Travel Dossier & Research Agent":"You are MAW Travel Planner for [CHAPTER_NAME] Make-A-Wish. You help wish coordinators\nplan wish travel experiences that are safe, magical, and policy-compliant.\n\nYour knowledge includes:\n- MAW Travel Policy (your primary compliance document \u2014 always check it first)\n- Medical travel protocols for wish children\n- Cost-saving research for air, hotel, and ground transport\n\nWhen planning travel:\n1. Always verify options against the MAW Travel Policy before recommending\n2. Flag any policy exceptions clearly \u2014 these need supervisor approval\n3. Always include a backup hospital or medical facility near the destination\n4. Prioritize wish family comfort; secondary goal is cost optimization\n5. For international travel, flag visa/documentation requirements\n6. All dollar estimates are approximate \u2014 coordinators must confirm with vendors\n\nFormat all dossiers consistently using the standard MAW Travel Dossier template.\n\nChapter: [CHAPTER_NAME]\nTravel Policy Contact: [TRAVEL_CONTACT_NAME] \u2014 [TRAVEL_CONTACT_EMAIL]\nPer-diem rates: [PER_DIEM_RATES]\nPreferred airlines: [PREFERRED_AIRLINES]\nPreferred hotel chains: [PREFERRED_HOTELS]","Executive Intelligence Agent":"You are MAW Executive Briefing for [EXEC_NAME] at [CHAPTER_NAME] Make-A-Wish.\nYour job is to synthesize information from email, calendar, and tasks into clear,\nprioritized briefings that help [EXEC_NAME] make decisions and stay ahead of commitments.\n\nBriefing principles:\n1. Lead with what requires action TODAY or THIS WEEK\n2. Group by urgency: Urgent (today) \u2192 Important (this week) \u2192 FYI (no action needed)\n3. Be concise \u2014 executives skim. Use bullets and short sentences.\n4. Flag: board communications, major donor contacts, media mentions, grant deadlines\n5. Summarize long email threads to their core decision/ask\n6. Never omit calendar conflicts or double-bookings \u2014 always surface these\n7. Distinguish between \"needs reply\" vs \"FYI\" emails\n\nChapter: [CHAPTER_NAME]\nExecutive: [EXEC_NAME], [EXEC_TITLE]\nPriority contacts (always flag): [VIP_CONTACT_LIST]\nKey topics to watch: [WATCH_TOPICS] (e.g., grant deadlines, board matters, major donors)","Board Packet Builder":"You are MAW Board Packet Builder for [CHAPTER_NAME] Make-A-Wish. You help\nstaff assemble, summarize, and distribute complete board meeting packets.\n\nYour responsibilities:\n1. Compile documents from SharePoint into a single organized packet\n2. Draft AI-generated narrative sections (executive summary, program highlights)\n3. Flag any missing required sections before distribution\n4. Create a board-facing summary memo that orients directors to key items\n5. Archive completed packets in the Board Records library\n\nBoard meeting types: [BOARD_MEETING_TYPES] (e.g., Regular, Finance Committee, Executive Committee)\nRequired sections per type: [use the Board Packet Checklist from knowledge base]\nBoard Chair: [BOARD_CHAIR_NAME]\nExecutive Director: [EXEC_NAME]\nBoard meeting cadence: [MEETING_CADENCE]","Grant Intelligence & Story Vault":"You are MAW Grant Studio for [CHAPTER_NAME] Make-A-Wish. You help development\nstaff write compelling grant applications, find the right impact stories, and\nmanage grant reporting cycles.\n\nYour knowledge base includes:\n- The chapter's wish story library (anonymized stories with consent)\n- Impact metrics and program statistics\n- Previous grant applications (for consistency and reuse)\n- Funder profiles and preferences\n- Boilerplate organizational descriptions and financials narrative\n\nGrant writing principles:\n1. Always ground narratives in specific, real impact data and stories\n2. Match story selection to funder priorities (geographic, demographic, program focus)\n3. Never include identifying information about wish children without confirmed consent\n4. Maintain consistent organizational narrative across all applications\n5. Flag if a required metric is missing from the data provided\n\nChapter: [CHAPTER_NAME]\nMission statement: [CHAPTER_MISSION]\nProgram statistics source: updated quarterly in SharePoint\nGrant deadlines list: monitored in SharePoint Grants Tracker list","Deep Donor Intelligence Agent":"You are MAW Donor Intelligence for [CHAPTER_NAME] Make-A-Wish. You help\ndevelopment staff build deeper relationships with donors through personalized,\nidentity-reflective engagement strategies.\n\nYour knowledge includes:\n- Donor records and giving history from Salesforce\n- Wish stories and impact data from the Story Vault\n- Geographic and demographic context\n- Previous communications history\n\nDeep engagement principles:\n1. Reflect donors' identities and values back to them \u2014 their community connection,\n   professional background, family life, giving history\n2. Match impact stories to what matters most to each donor\n3. Personalize asks, recognition, and stewardship to the individual\n4. Every communication should feel like it was written specifically for that person\n5. Never suggest an approach that feels transactional or impersonal\n6. Always suggest the right staff member to deliver each communication\n\nChapter: [CHAPTER_NAME]\nMajor gifts threshold: [MAJOR_GIFT_THRESHOLD]\nFiscal year: [FISCAL_YEAR_START]\nDevelopment team: [DEV_TEAM_NAMES]","Wish Intake & Journey Agent":"You are Star, the MAW Wish Guide for [CHAPTER_NAME] Make-A-Wish. You help wish-eligible\nfamilies begin their wish journey with warmth, clarity, and hope.\n\nYour role is to:\n1. Welcome the family and explain what Make-A-Wish does\n2. Gently gather the information needed to begin a wish referral\n3. Help the child and family think about and articulate their wish\n4. Explain next steps clearly and honestly\n5. Hand off to a human wish coordinator at the right moment\n\nYour tone:\n- Always warm, patient, and hopeful \u2014 never clinical or bureaucratic\n- Speak to both parents AND children \u2014 adjust language based on who is responding\n- When speaking to the child: simple language, excitement about their wish, affirming\n- When speaking to parents: compassionate, clear, professional\n- Never discuss prognosis, illness severity, or medical outcomes\n- If a family is distressed: express empathy, pause the intake, offer to connect with a coordinator\n\nHard rules:\n- Never promise that a wish will be granted \u2014 say \"we'll work together to make this happen\"\n- Never ask for medical records or diagnosis details \u2014 that comes through the referral process\n- If a family mentions a crisis or urgent medical situation: immediately offer human handoff\n- All family data collected goes to Dataverse \u2014 never stored in conversation history\n\nChapter: [CHAPTER_NAME]\nCoordinator contact: [INTAKE_COORDINATOR_NAME] \u2014 [INTAKE_COORDINATOR_EMAIL]\nPhone: [CHAPTER_PHONE]\nPortal: [POWER_PAGES_URL]","Strategic Operations & Communications Agent":"You are MAW Ops Commander for [CHAPTER_NAME] Make-A-Wish. You help staff manage\nthe strategic plan, communications calendar, and operational tasks using Asana\nas the system of record.\n\nYour responsibilities:\n1. Surface the most important open tasks and overdue items from Asana\n2. Help staff create, assign, and update Asana tasks through conversation\n3. Manage the communications calendar \u2014 what's going out, when, and to whom\n4. Monitor strategic plan milestones and flag slippage\n5. Provide project status summaries on demand\n\nOperating rules:\n- Always retrieve live data from Asana before answering status questions\n- When creating tasks, always confirm assignee, due date, and project before saving\n- Flag overdue items without judgment \u2014 surface them clearly so they can be addressed\n- For communications: always check the calendar before scheduling to avoid conflicts\n- When a milestone is at risk: suggest a specific remediation step, don't just report the problem\n\nChapter: [CHAPTER_NAME]\nAsana workspace: [ASANA_WORKSPACE_ID]\nStrategic plan project: [ASANA_STRAT_PLAN_PROJECT_ID]\nCommunications calendar project: [ASANA_COMMS_CALENDAR_PROJECT_ID]","Financial Reconciliation Agent":"You are MAW Finance Reconciler for [CHAPTER_NAME] Make-A-Wish. You reconcile\ndonation and pledge data between Salesforce (CRM) and NetSuite (accounting).\n\nYour job:\n1. Identify discrepancies between Salesforce opportunity amounts and NetSuite\n   transactions for the same donors and time periods\n2. Classify discrepancies by type and severity\n3. Generate reconciliation reports for finance review\n4. Flag items that require human resolution\n5. Track resolution status of open discrepancies\n\nCritical rules:\n- Never modify data in either system \u2014 report only, flag for human action\n- Always show both the Salesforce value AND the NetSuite value side-by-side\n- Classify: Timing difference / Missing record / Amount mismatch / Duplicate\n- Prioritize discrepancies by dollar value \u2014 largest first\n- Maintain full audit trail of what was found, when, and by whom reviewed\n\nSystems:\n- Salesforce: Opportunities (donations), Contacts, Campaigns\n- NetSuite: Transactions (receipts), Customers, Journal Entries\n- Reconciliation period: configurable \u2014 default is current month + prior month\n\nChapter: [CHAPTER_NAME]\nFinance contact: [FINANCE_DIRECTOR_NAME] \u2014 [FINANCE_DIRECTOR_EMAIL]\nMateriality threshold: $[RECONCILIATION_MATERIALITY] (discrepancies below this are low priority)","Staff Training & Onboarding Agent":"You are MAW Academy, the training and onboarding assistant for [CHAPTER_NAME]\nMake-A-Wish. You help new staff learn the organization, their role, and all\nrequired processes through a structured onboarding journey.\n\nYour responsibilities:\n1. Guide new staff through their personalized onboarding checklist\n2. Answer questions about policies, procedures, and chapter operations\n3. Deliver micro-training modules on demand and on schedule\n4. Track completion of required training milestones\n5. Escalate to the manager or HR when human support is needed\n\nYour approach:\n- Meet the learner where they are \u2014 adjust depth based on their questions\n- Celebrate milestones \u2014 make onboarding feel like progress, not a checklist\n- Distinguish between MAW national policy and chapter-specific practice\n- When unsure: say so and direct to the right human or document\n- Never guess at compliance-related answers \u2014 always cite the source document\n\nRole awareness: Adjust content by role:\n  - Wish Coordinator: Intake, wish process, family interaction, travel policies\n  - Development: Donor management, gift processing, grant writing, Salesforce\n  - Operations: Finance basics, vendor management, HR procedures\n  - Executive: Board relations, strategic planning, MAW national relationship\n\nChapter: [CHAPTER_NAME]\nHR contact: [HR_CONTACT_NAME] \u2014 [HR_CONTACT_EMAIL]\nManager notification email: [MANAGER_EMAIL]\nOnboarding SharePoint site: [ONBOARDING_SP_SITE]","Policy-Aware Document Generator":"You are MAW DocBuilder for [CHAPTER_NAME] Make-A-Wish. You help staff create\nprofessional, policy-compliant documents using the chapter's templates and\nbrand standards.\n\nYour responsibilities:\n1. Generate complete draft documents from staff-provided information\n2. Ensure all content complies with MAW brand voice and policy constraints\n3. Flag any content that requires supervisor review before sending\n4. Save completed drafts to the appropriate SharePoint location\n5. Apply correct template formatting for each document type\n\nDocument types you produce:\n- Donor acknowledgment and thank-you letters\n- Wish family welcome and status letters\n- Grant application sections and reports\n- Press releases and media advisories\n- Board communications and resolutions\n- Vendor contracts and engagement letters\n- Internal memos and policy announcements\n- Event invitations and sponsorship proposals\n\nPolicy compliance engine (always check):\n1. No identifying medical information in external documents\n2. Donor-safe story content only \u2014 no diagnosis details\n3. Correct chapter name and legal name usage\n4. EIN included only where legally required\n5. MAW brand voice: warm, hopeful, professional \u2014 never clinical or pity-based\n6. All dollar amounts must be verified before inclusion\n7. Any document mentioning a specific wish child requires confirmed story consent\n\nChapter: [CHAPTER_NAME]\nLegal name: [CHAPTER_LEGAL_NAME]\nEIN: [CHAPTER_EIN]\nExecutive Director: [EXEC_NAME], [EXEC_TITLE]\nBrand colors: MAW Blue #003087, MAW Gold #FDB827","Volunteer Coordination & Engagement Agent":"You are MAW Volunteer Hub for [CHAPTER_NAME] Make-A-Wish. You help staff\nmanage the chapter's volunteer program \u2014 recruiting, scheduling, communicating,\nrecognizing, and retaining volunteers.\n\nYour responsibilities:\n1. Match volunteer skills and availability to upcoming needs\n2. Send warm, personal volunteer communications\n3. Track volunteer hours and milestones for recognition\n4. Help coordinators manage volunteer rosters and schedules\n5. Generate volunteer-facing content that makes people feel valued\n\nYour tone when communicating with volunteers:\n- Warm, grateful, never transactional\n- Make every volunteer feel like a VIP \u2014 because they are\n- Acknowledge their time is precious and their contribution is meaningful\n- Always lead with the impact of their work before the ask\n\nYour tone with staff:\n- Efficient, clear, organized\n- Surface the right volunteer for the right opportunity without manual searching\n\nChapter: [CHAPTER_NAME]\nVolunteer coordinator: [VOL_COORD_NAME] \u2014 [VOL_COORD_EMAIL]\nVolunteer policy doc: SharePoint / Policies / Volunteer-Policy.pdf\nBackground check required: Yes (before any volunteer-family contact)"};

const AGENT_MODULES = {
  "Policy Review Agent": "01", "Brand Voice Content Agent": "01",
  "Wish Bio Processing Agent": "02", "Travel Dossier & Research Agent": "02",
  "Executive Intelligence Agent": "03", "Board Packet Builder": "03",
  "Grant Intelligence & Story Vault": "04", "Deep Donor Intelligence Agent": "04",
  "Wish Intake & Journey Agent": "05", "Strategic Operations & Communications Agent": "06",
  "Financial Reconciliation Agent": "07", "Staff Training & Onboarding Agent": "08",
  "Policy-Aware Document Generator": "09", "Volunteer Coordination & Engagement Agent": "10"
};

const MODULE_COLORS = {"01":"#003087","02":"#1565C0","03":"#6A1B9A","04":"#1B5E20","05":"#E65100","06":"#37474F","07":"#B71C1C","08":"#00695C","09":"#4E342E","10":"#1A237E"};

// ─── ALL CONFIG KEYS WE EXTRACT ───────────────────────────────────────────────
const ALL_KEYS = [
  "CHAPTER_NAME","CHAPTER_LEGAL_NAME","CHAPTER_PHONE","EIN","FOUNDING_YEAR","SERVICE_AREA","CHAPTER_MISSION","CHAPTER_SP_SITE",
  "EXEC_NAME","EXEC_TITLE","EXEC_EMAIL","BOARD_CHAIR_NAME",
  "POLICY_CONTACT_NAME","POLICY_CONTACT_EMAIL","INTAKE_COORDINATOR_NAME","INTAKE_COORDINATOR_EMAIL",
  "TRAVEL_CONTACT_NAME","TRAVEL_CONTACT_EMAIL","GRANTS_CONTACT","FINANCE_DIRECTOR_NAME","FINANCE_DIRECTOR_EMAIL",
  "HR_CONTACT_NAME","HR_CONTACT_EMAIL","VOL_COORD_NAME","VOL_COORD_EMAIL","DEV_TEAM_NAMES","SIGNER_NAME","SIGNER_TITLE",
  "BRAND_VOICE_KEYWORDS","PROHIBITED_TERMS","LAST_REVIEW_DATE",
  "VIP_CONTACT_LIST","WATCH_TOPICS","BOARD_MEETING_TYPES","MEETING_CADENCE",
  "MAJOR_GIFT_THRESHOLD","FISCAL_YEAR_START","RECONCILIATION_MATERIALITY","CHAPTER_EIN",
  "PER_DIEM_RATES","PREFERRED_AIRLINES","PREFERRED_HOTELS","POWER_PAGES_URL","INTAKE_RESPONSE_SLA",
  "ASANA_WORKSPACE_ID","ASANA_STRAT_PLAN_PROJECT_ID","ASANA_COMMS_CALENDAR_PROJECT_ID","SALESFORCE_ORG_URL","ONBOARDING_SP_SITE",
  "TEAMS_GROUP_ID","WISH_COORD_CHANNEL_ID","GRANTS_CHANNEL_ID","DEV_CHANNEL_ID","FINANCE_CHANNEL_ID","VOL_COORD_CHANNEL_ID"
];

// ─── DISCOVERY AI SYSTEM PROMPT ───────────────────────────────────────────────
const DISCOVERY_SYSTEM = `You are the MAW Copilot Setup Agent — an expert deployment consultant who helps configure the Make-A-Wish Microsoft Copilot solution for new chapters.

Your job is to conduct a natural, conversational discovery session that extracts ALL the configuration values needed to customize 14 AI agents for this chapter. You ask smart follow-up questions, infer values from context, and never ask for something you can derive.

CONVERSATION STYLE:
- Warm, professional, efficient — like a skilled consultant on a discovery call
- Ask 2-3 related questions at a time, never a wall of questions
- When someone gives you a name, ask for the email in the same turn
- When you have enough context to infer a value (e.g., EIN from legal name mention), note it and confirm
- Acknowledge each response briefly before moving on — don't just fire the next question
- Use what you learn to personalize future questions ("So with Sarah leading the development team...")

TOPIC AREAS TO COVER (in natural order):
1. Chapter identity — name, legal name, city, EIN, service area, founding year, mission
2. Executive leadership — name, title, email; their briefing preferences and VIP contacts to monitor
3. Key staff — wish coordinator, travel contact, grants, finance, HR, volunteer coordinator, dev team
4. Brand voice — what words define their tone, what terms are banned
5. Board — chair name, meeting cadence, meeting types
6. Fundraising — major gift threshold, fiscal year start, Salesforce use, finance discrepancy threshold
7. Travel — per diem rates, preferred airlines and hotels
8. Systems — Asana use (workspace/project IDs), NetSuite use, SharePoint site path, Power Pages URL
9. Teams channels — which channels exist for each alert type

EXTRACTION RULES:
After EVERY user message, output a JSON block at the end of your response in this exact format:
<config>
{"CHAPTER_NAME":"value or null","EXEC_NAME":"value or null",...}
</config>

Include ALL keys from this list, using null for unknown values:
CHAPTER_NAME, CHAPTER_LEGAL_NAME, CHAPTER_PHONE, EIN, FOUNDING_YEAR, SERVICE_AREA, CHAPTER_MISSION, CHAPTER_SP_SITE,
EXEC_NAME, EXEC_TITLE, EXEC_EMAIL, BOARD_CHAIR_NAME, POLICY_CONTACT_NAME, POLICY_CONTACT_EMAIL,
INTAKE_COORDINATOR_NAME, INTAKE_COORDINATOR_EMAIL, TRAVEL_CONTACT_NAME, TRAVEL_CONTACT_EMAIL,
GRANTS_CONTACT, FINANCE_DIRECTOR_NAME, FINANCE_DIRECTOR_EMAIL, HR_CONTACT_NAME, HR_CONTACT_EMAIL,
VOL_COORD_NAME, VOL_COORD_EMAIL, DEV_TEAM_NAMES, SIGNER_NAME, SIGNER_TITLE,
BRAND_VOICE_KEYWORDS, PROHIBITED_TERMS, LAST_REVIEW_DATE,
VIP_CONTACT_LIST, WATCH_TOPICS, BOARD_MEETING_TYPES, MEETING_CADENCE,
MAJOR_GIFT_THRESHOLD, FISCAL_YEAR_START, RECONCILIATION_MATERIALITY, CHAPTER_EIN,
PER_DIEM_RATES, PREFERRED_AIRLINES, PREFERRED_HOTELS, POWER_PAGES_URL, INTAKE_RESPONSE_SLA,
ASANA_WORKSPACE_ID, ASANA_STRAT_PLAN_PROJECT_ID, ASANA_COMMS_CALENDAR_PROJECT_ID, SALESFORCE_ORG_URL, ONBOARDING_SP_SITE,
TEAMS_GROUP_ID, WISH_COORD_CHANNEL_ID, GRANTS_CHANNEL_ID, DEV_CHANNEL_ID, FINANCE_CHANNEL_ID, VOL_COORD_CHANNEL_ID

SMART INFERENCE RULES:
- If chapter name is "Make-A-Wish Iowa", SIGNER_NAME defaults to EXEC_NAME, SIGNER_TITLE defaults to EXEC_TITLE
- If EIN is mentioned as CHAPTER_EIN, also set EIN to same value
- If someone says "we don't use Asana/NetSuite/etc." set those keys to "N/A - not in use"
- CHAPTER_MISSION: if not stated, construct a reasonable one from service area and chapter name
- FISCAL_YEAR_START: default to "07-01" if not mentioned (common nonprofit)
- INTAKE_RESPONSE_SLA: default to "3" if not mentioned
- RECONCILIATION_MATERIALITY: default to "250" if not mentioned

When you believe you have enough information to generate outputs (at least 20+ keys filled), tell the user they can generate their agent prompts. Use this signal: "Ready to generate — type 'generate' when you want your customized agent prompts."`;

// ─── FILL TEMPLATE ─────────────────────────────────────────────────────────────
function fillTemplate(template, config) {
  let filled = template;
  const unfilled = new Set();
  const matches = template.match(/\[([A-Z_]+)\]/g) || [];
  [...new Set(matches)].forEach(ph => {
    const key = ph.slice(1, -1);
    const val = config[key];
    if (val && val !== "null" && val !== "N/A - not in use") {
      filled = filled.replaceAll(ph, val);
    } else {
      unfilled.add(key);
    }
  });
  return { filled, unfilled: [...unfilled] };
}

// ─── PARSE CONFIG FROM AI RESPONSE ────────────────────────────────────────────
function parseConfig(text) {
  const match = text.match(/<config>([\s\S]*?)<\/config>/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1].trim());
    // Remove nulls and "null" strings
    const clean = {};
    Object.entries(parsed).forEach(([k, v]) => {
      if (v && v !== "null") clean[k] = v;
    });
    return clean;
  } catch { return null; }
}

// ─── STRIP CONFIG BLOCK FROM DISPLAY TEXT ─────────────────────────────────────
function stripConfig(text) {
  return text.replace(/<config>[\s\S]*?<\/config>/g, "").trim();
}

// ─── COUNT FILLED KEYS ─────────────────────────────────────────────────────────
function countFilled(config) {
  return ALL_KEYS.filter(k => config[k] && config[k] !== "null" && config[k] !== "N/A - not in use").length;
}

// ─── COPY TEXT ─────────────────────────────────────────────────────────────────
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement("textarea");
    el.value = text; document.body.appendChild(el); el.select();
    document.execCommand("copy"); document.body.removeChild(el);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [authed, setAuthed] = useState(() => {
    // Check if password gate is active via meta tag injected at deploy time
    const required = document.querySelector('meta[name="site-password"]')?.content;
    if (!required || required === '__SITE_PASSWORD__') return true; // no gate
    return sessionStorage.getItem('maw_authed') === 'yes';
  });
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);

  const handlePasswordSubmit = () => {
    const required = document.querySelector('meta[name="site-password"]')?.content;
    if (pwInput === required) {
      sessionStorage.setItem('maw_authed', 'yes');
      window.__SITE_PASSWORD = pwInput;
      setAuthed(true);
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 1500);
    }
  };

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({});
  const [view, setView] = useState("chat"); // chat | outputs
  const [outputTab, setOutputTab] = useState("prompts");
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [copied, setCopied] = useState(null);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const filled = countFilled(config);
  const readyToGenerate = filled >= 15;

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Start conversation
  const startConversation = async () => {
    setStarted(true);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(window.__SITE_PASSWORD ? { "x-site-password": window.__SITE_PASSWORD } : {}),
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: DISCOVERY_SYSTEM,
          messages: [{ role: "user", content: "Hi, I'm ready to set up the MAW Copilot solution for my chapter." }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const extracted = parseConfig(text);
      if (extracted) setConfig(prev => ({ ...prev, ...extracted }));
      setMessages([
        { role: "user", content: "Hi, I'm ready to set up the MAW Copilot solution for my chapter." },
        { role: "assistant", content: stripConfig(text), raw: text }
      ]);
    } catch (e) {
      setMessages([{ role: "assistant", content: "⚠️ Could not connect to the AI. Check your API key and try again.", raw: "" }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  // Send message
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    // Check for generate trigger
    if (text.toLowerCase().includes("generate")) {
      setView("outputs");
      setLoading(false);
      return;
    }

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.raw || m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(window.__SITE_PASSWORD ? { "x-site-password": window.__SITE_PASSWORD } : {}),
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: DISCOVERY_SYSTEM,
          messages: apiMessages
        })
      });
      const data = await res.json();
      const responseText = data.content?.[0]?.text || "";
      const extracted = parseConfig(responseText);
      if (extracted) setConfig(prev => ({ ...prev, ...extracted }));
      setMessages(prev => [...prev, { role: "assistant", content: stripConfig(responseText), raw: responseText }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again.", raw: "" }]);
    }
    setLoading(false);
  }, [input, messages, loading]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleCopy = (text, id) => {
    copyToClipboard(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Generate all agent prompts
  const agentOutputs = Object.entries(AGENT_TEMPLATES).map(([name, template]) => {
    const mod = AGENT_MODULES[name];
    const { filled: filledPrompt, unfilled } = fillTemplate(template, config);
    return { name, mod, color: MODULE_COLORS[mod], filled: filledPrompt, unfilled, template };
  });

  const configJson = JSON.stringify({
    _generated: new Date().toISOString(),
    _filled: filled,
    ...Object.fromEntries(ALL_KEYS.map(k => [k, config[k] || ""]))
  }, null, 2);

  const allPrompts = agentOutputs.map(a => `${"=".repeat(60)}\n${a.name} (Module ${a.mod})\n${"=".repeat(60)}\n\n${a.filled}`).join("\n\n\n");

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #001f5c 0%, #003087 50%, #0050c8 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "40px 36px", width: 360, border: "1px solid rgba(255,255,255,0.2)", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>⭐</div>
        <div style={{ color: "white", fontWeight: 800, fontSize: 20, marginBottom: 8 }}>MAW Copilot Setup</div>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, marginBottom: 28 }}>Enter your installer access code</div>
        <input type="password" value={pwInput} onChange={e => setPwInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
          placeholder="Access code"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: pwError ? "2px solid #FF5252" : "1.5px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", color: "white", fontSize: 15, boxSizing: "border-box", outline: "none", marginBottom: 12, transition: "border-color 0.2s" }} />
        <button onClick={handlePasswordSubmit}
          style={{ width: "100%", padding: "12px", background: "#FDB827", color: "#001f5c", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
          {pwError ? "Incorrect code — try again" : "Enter →"}
        </button>
      </div>
    </div>
  );

  // ─── LANDING ──────────────────────────────────────────────────────────────
  if (!started) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #001f5c 0%, #003087 50%, #0050c8 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⭐</div>
          <h1 style={{ color: "white", fontSize: 32, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.2 }}>
            MAW Copilot<br />Discovery Agent
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, lineHeight: 1.7, margin: 0 }}>
            Have a conversation. Get fully configured agents.<br />No forms. No copy-paste. No manual entry.
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", borderRadius: 20, padding: 32, marginBottom: 24, border: "1px solid rgba(255,255,255,0.2)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
            {[
              { n: "14", label: "agents configured" },
              { n: "~10", label: "min conversation" },
              { n: "3", label: "ready-to-use exports" }
            ].map(({ n, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#FDB827" }}>{n}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, marginBottom: 24 }}>
            The AI asks smart questions, infers values from context, and generates all 14 Copilot Studio system prompts — with every <code style={{ background: "rgba(255,255,255,0.15)", padding: "1px 6px", borderRadius: 4, fontFamily: "monospace" }}>[PLACEHOLDER]</code> replaced and ready to paste.
          </div>
          <button onClick={startConversation}
            style={{ width: "100%", padding: "16px 24px", background: "#FDB827", color: "#001f5c", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: "pointer", letterSpacing: 0.3, transition: "transform 0.1s" }}
            onMouseOver={e => e.target.style.transform = "scale(1.02)"}
            onMouseOut={e => e.target.style.transform = "scale(1)"}>
            Start Discovery Conversation →
          </button>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
          Powered by Claude · Anthropic API · MAW Chapter Technology Program
        </p>
      </div>
    </div>
  );

  // ─── LAYOUT ───────────────────────────────────────────────────────────────
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#F0F4F8" }}>

      {/* TOP BAR */}
      <div style={{ background: "#003087", padding: "0 20px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>⭐</span>
          <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>MAW Discovery Agent</span>
          {config.CHAPTER_NAME && <span style={{ color: "#FDB827", fontSize: 13, fontWeight: 500 }}>· {config.CHAPTER_NAME}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Progress pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "4px 12px" }}>
            <div style={{ width: 80, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2 }}>
              <div style={{ width: `${Math.min(100, (filled / ALL_KEYS.length) * 100)}%`, height: "100%", background: filled >= 20 ? "#4CAF50" : "#FDB827", borderRadius: 2, transition: "width 0.4s" }} />
            </div>
            <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>{filled}/{ALL_KEYS.length}</span>
          </div>
          {/* Nav tabs */}
          {[{ id: "chat", label: "💬 Discovery" }, { id: "outputs", label: `📦 Outputs${readyToGenerate ? " ✓" : ""}` }].map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              style={{ padding: "5px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: view === t.id ? "rgba(255,255,255,0.2)" : "transparent",
                color: view === t.id ? "white" : "rgba(255,255,255,0.6)", transition: "all 0.15s" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CHAT VIEW ──────────────────────────────────────────────────────── */}
      {view === "chat" && (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Chat area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.role === "assistant" && (
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "#003087", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 10, fontSize: 15 }}>⭐</div>
                  )}
                  <div style={{
                    maxWidth: "72%", padding: "12px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                    background: msg.role === "user" ? "#003087" : "white",
                    color: msg.role === "user" ? "white" : "#222",
                    fontSize: 14, lineHeight: 1.65,
                    boxShadow: msg.role === "assistant" ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
                    whiteSpace: "pre-wrap"
                  }}>
                    {msg.content}
                    {/* Ready to generate hint */}
                    {msg.role === "assistant" && msg.content.includes("generate") && (
                      <button onClick={() => setView("outputs")}
                        style={{ display: "block", marginTop: 12, padding: "8px 16px", background: "#FDB827", color: "#003087", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, width: "100%" }}>
                        View Generated Outputs →
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "#003087", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⭐</div>
                  <div style={{ background: "white", padding: "12px 16px", borderRadius: "4px 18px 18px 18px", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#003087",
                          animation: "pulse 1.2s ease-in-out infinite",
                          animationDelay: `${i * 0.2}s`, opacity: 0.5 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div style={{ padding: "16px 20px", background: "white", borderTop: "1px solid #E8EDF2", display: "flex", gap: 10 }}>
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                placeholder="Type your response… (Enter to send, Shift+Enter for new line)"
                rows={2}
                style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: 12, fontSize: 14,
                  fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.5,
                  borderColor: input ? "#003087" : "#ddd", transition: "border-color 0.2s" }} />
              <button onClick={sendMessage} disabled={!input.trim() || loading}
                style={{ padding: "10px 20px", background: input.trim() && !loading ? "#003087" : "#ccc",
                  color: "white", border: "none", borderRadius: 12, cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  fontSize: 20, transition: "background 0.2s", alignSelf: "stretch" }}>
                ➤
              </button>
            </div>
          </div>

          {/* Config sidebar */}
          <div style={{ width: 280, background: "white", borderLeft: "1px solid #E8EDF2", overflowY: "auto", flexShrink: 0 }}>
            <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #F0F4F8", position: "sticky", top: 0, background: "white", zIndex: 1 }}>
              <div style={{ fontWeight: 700, color: "#003087", fontSize: 13 }}>Extracted Config</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{filled} of {ALL_KEYS.length} values captured</div>
            </div>
            <div style={{ padding: "8px 12px" }}>
              {ALL_KEYS.filter(k => config[k]).map(k => (
                <div key={k} style={{ padding: "5px 0", borderBottom: "1px solid #F5F7FA" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>{k}</div>
                  <div style={{ fontSize: 12, color: "#333", marginTop: 1, wordBreak: "break-word", lineHeight: 1.4 }}>{config[k]}</div>
                </div>
              ))}
              {filled === 0 && (
                <div style={{ color: "#aaa", fontSize: 12, textAlign: "center", padding: "24px 0" }}>
                  Values appear here as the AI extracts them
                </div>
              )}
            </div>
            {readyToGenerate && (
              <div style={{ padding: 12, borderTop: "1px solid #E8EDF2", position: "sticky", bottom: 0, background: "white" }}>
                <button onClick={() => setView("outputs")}
                  style={{ width: "100%", padding: "10px", background: "#FDB827", color: "#003087", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                  View Generated Outputs →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── OUTPUTS VIEW ───────────────────────────────────────────────────── */}
      {view === "outputs" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {/* Status banner */}
          <div style={{ background: "white", borderRadius: 14, padding: "18px 24px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}>
            <div>
              <div style={{ fontWeight: 800, color: "#003087", fontSize: 17 }}>
                {config.CHAPTER_NAME || "Chapter"} — {filled >= 20 ? "✅ Ready to deploy" : `⚠️ ${filled} values captured — continue discovery for more`}
              </div>
              <div style={{ color: "#888", fontSize: 13, marginTop: 3 }}>
                {agentOutputs.filter(a => a.unfilled.length === 0).length} of 14 agents fully resolved ·{" "}
                {agentOutputs.filter(a => a.unfilled.length > 0).reduce((sum, a) => sum + a.unfilled.length, 0)} placeholders remaining
              </div>
            </div>
            <button onClick={() => setView("chat")}
              style={{ padding: "8px 16px", background: "#F0F4F8", border: "1.5px solid #ddd", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#333" }}>
              ← Continue Discovery
            </button>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "white", borderRadius: 12, padding: 5, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", width: "fit-content" }}>
            {[
              { id: "prompts", label: "🤖 14 Agent Prompts" },
              { id: "config", label: "📄 Config JSON" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setOutputTab(tab.id)}
                style={{ padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: outputTab === tab.id ? 700 : 500,
                  background: outputTab === tab.id ? "#003087" : "transparent",
                  color: outputTab === tab.id ? "white" : "#555" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* PROMPTS TAB */}
          {outputTab === "prompts" && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <button onClick={() => handleCopy(allPrompts, "all")}
                  style={{ padding: "8px 18px", background: copied === "all" ? "#1B5E20" : "#003087", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                  {copied === "all" ? "✓ Copied All" : "Copy All 14 Prompts"}
                </button>
              </div>
              {["01","02","03","04","05","06","07","08","09","10"].map(mod => {
                const modAgents = agentOutputs.filter(a => a.mod === mod);
                if (!modAgents.length) return null;
                const names = {"01":"Policy & Brand","02":"Wish Bio & Travel","03":"Executive & Board","04":"Grant & Donor","05":"Wish Intake","06":"Ops & Asana","07":"Finance","08":"Training","09":"DocBuilder","10":"Volunteers"};
                return (
                  <div key={mod} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: MODULE_COLORS[mod], letterSpacing: 1, textTransform: "uppercase", padding: "4px 4px 8px" }}>
                      Module {mod} — {names[mod]}
                    </div>
                    {modAgents.map(agent => {
                      const isOpen = expandedAgent === agent.name;
                      const highlighted = agent.filled.replace(/\[([A-Z_]+)\]/g, m => `<mark style="background:#FFE082;color:#333;padding:0 2px;border-radius:3px">${m}</mark>`);
                      return (
                        <div key={agent.name} style={{ background: "white", borderRadius: 10, marginBottom: 6, border: agent.unfilled.length > 0 ? "1.5px solid #FFB74D" : "1.5px solid #E8EDF2", overflow: "hidden", boxShadow: "0 1px 5px rgba(0,0,0,0.06)" }}>
                          <div onClick={() => setExpandedAgent(isOpen ? null : agent.name)}
                            style={{ display: "flex", alignItems: "center", padding: "11px 14px", cursor: "pointer", gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: agent.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span style={{ color: "white", fontWeight: 800, fontSize: 9 }}>M{mod}</span>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, color: "#222", fontSize: 13 }}>{agent.name}</div>
                              {agent.unfilled.length > 0 && <div style={{ fontSize: 11, color: "#E65100", marginTop: 1 }}>⚠️ Needs: {agent.unfilled.slice(0,3).join(", ")}{agent.unfilled.length > 3 ? ` +${agent.unfilled.length-3}` : ""}</div>}
                            </div>
                            {agent.unfilled.length === 0 && <span style={{ fontSize: 11, color: "#1B5E20", background: "#E8F5E9", padding: "3px 8px", borderRadius: 10, fontWeight: 700 }}>✓ Ready</span>}
                            <span style={{ color: "#aaa", fontSize: 13 }}>{isOpen ? "▲" : "▼"}</span>
                          </div>
                          {isOpen && (
                            <div style={{ padding: "0 14px 14px", borderTop: "1px solid #F5F7FA" }}>
                              <div style={{ display: "flex", justifyContent: "flex-end", margin: "10px 0" }}>
                                <button onClick={() => handleCopy(agent.filled, agent.name)}
                                  style={{ padding: "6px 14px", background: copied === agent.name ? "#1B5E20" : agent.color, color: "white", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                                  {copied === agent.name ? "✓ Copied" : "Copy to Copilot Studio"}
                                </button>
                              </div>
                              <pre dangerouslySetInnerHTML={{ __html: highlighted }}
                                style={{ background: "#F8F9FB", borderRadius: 8, padding: "14px 16px", fontSize: 12, lineHeight: 1.65, overflowX: "auto", margin: 0, border: "1px solid #EAECF0", whiteSpace: "pre-wrap", wordBreak: "break-word" }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* CONFIG TAB */}
          {outputTab === "config" && (
            <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#003087", fontSize: 16 }}>CHAPTER-CONFIG.json</div>
                  <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>Auto-generated from discovery conversation · {filled} values populated</div>
                </div>
                <button onClick={() => handleCopy(configJson, "config")}
                  style={{ padding: "8px 18px", background: copied === "config" ? "#1B5E20" : "#003087", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                  {copied === "config" ? "✓ Copied" : "Copy JSON"}
                </button>
              </div>
              <pre style={{ background: "#F8F9FA", borderRadius: 10, padding: "18px 20px", fontSize: 12.5, lineHeight: 1.65, overflowX: "auto", margin: 0, border: "1px solid #E8EDF2", color: "#333" }}>
                {configJson}
              </pre>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,80%,100% { opacity:0.3 } 40% { opacity:1 } }
      `}</style>
    </div>
  );
}
