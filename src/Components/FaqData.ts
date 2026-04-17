export type FAQ = {
  patterns: string[];
  answer: string;
};

export const FAQS: FAQ[] = [
  {
    patterns: [
      "what is vaastu",
      "project vaastu",
      "about vaastu",
      "vaastu ante enti",
      "vaastu enti",
      "vastu enti",
      "vaastu gurinchi",
      "project vastu",
    ],
    answer:
      "Project VAASTU stands for Virtual Automated Approvals & Satellite Tracking Utility. It is an AI-enabled GIS governance platform for rural infrastructure that combines automated approvals, satellite monitoring, and revenue enforcement.",
  },
  {
    patterns: [
      "full form",
      "stands for",
      "vaastu full form",
      "vaa stu full form",
      "vastu full form",
    ],
    answer:
      "VAASTU stands for Virtual Automated Approvals & Satellite Tracking Utility.",
  },
  {
    patterns: [
      "vision",
      "goal",
      "objective of vaastu",
      "project vision",
      "aim of vaastu",
      "vaastu purpose",
    ],
    answer:
      "The vision of VAASTU is to transform Gram Panchayats into Smart Planning Units by giving Panchayat Secretaries digital technical support for approvals, compliance, and monitoring.",
  },
  {
    patterns: [
      "problem",
      "problems",
      "challenges",
      "governance gaps",
      "what problem does vaastu solve",
      "enduku",
      "why vaastu",
    ],
    answer:
      "VAASTU solves three major governance gaps: technical deficit in plan scrutiny, hidden unauthorized construction and sprawl, and revenue leakage from under-assessed fees or misuse.",
  },
  {
    patterns: [
      "three engines",
      "modules",
      "core modules",
      "engines",
      "main modules",
      "three modules",
    ],
    answer:
      "VAASTU has three core engines: Smart Scrutiny for approvals, Satellite Sentinel for construction monitoring, and Revenue Radar for fee and tax enforcement.",
  },
  {
    patterns: [
      "smart scrutiny",
      "approval engine",
      "module 1",
      "automated approvals",
      "smart scrunity",
      "smart scrutiny work",
      "approval process",
    ],
    answer:
      "Smart Scrutiny is the approval engine. It checks geo-tagged CAD or intelligent PDF plans against DTCP bylaws, master plans, geo-coordinates, setbacks, road width, and FSI, then gives a pass or fail result.",
  },
  {
    patterns: [
      "satellite sentinel",
      "eye in the sky",
      "satellite monitoring",
      "module 2",
      "satellite monitor",
      "satelite monitoring",
      "how satellite works",
    ],
    answer:
      "Satellite Sentinel is the monitoring engine. It compares previous and current satellite imagery to detect new construction activity and then checks whether the location has a valid permit.",
  },
  {
    patterns: [
      "revenue radar",
      "fiscal engine",
      "module 3",
      "revenue",
      "fees",
      "tax",
      "revenue module",
    ],
    answer:
      "Revenue Radar is the fiscal engine. It connects approval data with fee collection and post-construction checks to ensure correct fees, betterment charges, labor cess, and tax compliance.",
  },
  {
    patterns: [
      "geo fence",
      "geo-fence",
      "geofence",
      "rule engine",
      "how smart scrutiny works",
      "auto dcr",
      "auto-dcr",
    ],
    answer:
      "Smart Scrutiny first performs a geo-fence check against the State GIS Master Plan. Then the rule engine validates setbacks, road width, and FSI from the submitted plan.",
  },
  {
    patterns: [
      "agricultural land",
      "agriculture land",
      "agri land",
      "auto reject",
      "land conversion",
      "agriculture plot",
    ],
    answer:
      "If the land is agricultural, the system auto-rejects the application unless land conversion documents are uploaded.",
  },
  {
    patterns: [
      "prohibited zone",
      "water body",
      "heritage zone",
      "restricted area",
      "forbidden zone",
    ],
    answer:
      "The geo-fence check also verifies whether the plot falls in a prohibited zone, such as a water body buffer or heritage zone.",
  },
  {
    patterns: [
      "green channel",
      "provisional approval",
      "compliant plans",
      "green approval",
    ],
    answer:
      "Compliant plans go through the Green Channel and receive a Provisional Approval Certificate instantly along with a payment link.",
  },
  {
    patterns: [
      "red channel",
      "non compliant",
      "non-compliant",
      "violation report",
      "error report",
      "rejected plan",
    ],
    answer:
      "Non-compliant plans go to the Red Channel and are returned with a specific error report, such as insufficient setback or rule violation details.",
  },
  {
    patterns: [
      "change detection",
      "temporal change detection",
      "how satellite monitoring works",
      "image t1",
      "image t2",
    ],
    answer:
      "The monitoring module uses temporal change detection. It compares earlier and current images to identify new construction, then overlays permit data to determine whether the activity is authorized.",
  },
  {
    patterns: [
      "unauthorized construction",
      "unauthorized anomaly",
      "red flag",
      "illegal construction",
      "layout detection",
    ],
    answer:
      "If new construction is detected and no active permit exists for that geo-location, the system marks it as an Unauthorized Anomaly and raises a red-flag alert on the dashboard.",
  },
  {
    patterns: [
      "7 days",
      "escalation",
      "dpo",
      "district panchayat officer",
      "7 day rule",
      "alert not closed",
    ],
    answer:
      "If the Panchayat Secretary does not close the alert within 7 days by uploading proof or taking action, the case escalates to the District Panchayat Officer.",
  },
  {
    patterns: [
      "fee calculator",
      "permit fee",
      "betterment charges",
      "labor cess",
      "fee calculation",
    ],
    answer:
      "The fee calculator automatically computes building permit fees, betterment charges, and labor cess based on verified square footage, reducing manual under-assessment.",
  },
  {
    patterns: [
      "occupancy check",
      "property tax",
      "evasion alert",
      "tax alert",
      "roof detected",
    ],
    answer:
      "After construction, the system supports property tax collection. If satellite data shows a completed roof but no property tax is being paid, it raises an Evasion Alert.",
  },
  {
    patterns: [
      "gps lock",
      "field officer app",
      "site inspection",
      "officer app",
      "inspection report",
    ],
    answer:
      "The field officer app uses GPS lock. It allows a site inspection report to be submitted only when the officer is physically within 50 meters of the alert location.",
  },
  {
    patterns: [
      "technology",
      "technical architecture",
      "tech stack",
      "stack",
      "what technologies",
      "frontend backend",
    ],
    answer:
      "The platform uses PostGIS and GeoServer for GIS, TensorFlow or PyTorch for AI, React.js for the official dashboard, and Flutter for the field officer mobile app.",
  },
  {
    patterns: [
      "security",
      "rbac",
      "role based access",
      "role-based access",
      "data sovereignty",
      "roles",
    ],
    answer:
      "Security includes India-hosted MeitY-empaneled cloud servers and role-based access. Secretaries see village data, DPOs see district data, and commissioners get a state-wide view.",
  },
  {
    patterns: [
      "workflow",
      "operational workflow",
      "stages",
      "process flow",
      "how it works overall",
    ],
    answer:
      "The workflow is: citizen uploads plan and documents, AI runs Smart Scrutiny, fees are paid online, a digitally signed permit is generated, construction is monitored, and violations trigger enforcement.",
  },
  {
    patterns: [
      "stop work order",
      "enforcement",
      "extra floor",
      "deviation",
      "violation action",
    ],
    answer:
      "If a deviation like an extra floor is detected, the field officer receives an alert, visits the site, and can issue a Stop Work Order through the app.",
  },
  {
    patterns: [
      "roadmap",
      "implementation roadmap",
      "phases",
      "implementation plan",
      "rollout",
    ],
    answer:
      "The roadmap has three phases: Phase 1 pilot in one district and two mandals during months 1 to 3, Phase 2 expansion to 13 districts during months 4 to 9, and Phase 3 full state rollout from month 10 onward.",
  },
  {
    patterns: [
      "pilot",
      "proof of concept",
      "phase 1",
      "poc",
      "first phase",
    ],
    answer:
      "The pilot phase covers one selected district, such as Krishna, across 2 mandals and about 40 Gram Panchayats. One key success metric is 90% accuracy in automated plan scrutiny.",
  },
  {
    patterns: [
      "impact",
      "roi",
      "benefits",
      "outcomes",
      "advantages",
      "results",
    ],
    answer:
      "Expected outcomes include approval timelines reduced from weeks to minutes for compliant cases, detection of more than 90% of unauthorized layouts within 30 days of ground-breaking, and stronger revenue realization.",
  },
  {
    patterns: [
      "revenue increase",
      "financial impact",
      "20%",
      "15-20%",
      "income increase",
    ],
    answer:
      "The proposal projects a 15 to 20 percent increase in permit fee collections through accurate assessment and penalties, and also mentions a 20 percent increase in PR&RD revenue in Year 1.",
  },
  {
    patterns: [
      "social impact",
      "citizen convenience",
      "planned growth",
      "public benefit",
    ],
    answer:
      "The social impact includes planned growth in rural-urban fringe areas and better citizen convenience through transparent, time-bound approvals without repeated Panchayat office visits.",
  },
  {
    patterns: [
      "risks",
      "risk management",
      "cloud cover",
      "adoption resistance",
      "data accuracy",
      "mitigation",
    ],
    answer:
      "Key risks include cloud cover affecting imagery, staff adoption resistance, and GIS boundary accuracy. Mitigations include SAR or drones, digital-only workflows, and integration with resurvey data.",
  },
  {
    patterns: [
      "conclusion",
      "why it matters",
      "importance",
      "final summary",
    ],
    answer:
      "Project VAASTU is presented as a shift from manual, reactive governance to spatial intelligence and proactive governance for rural development.",
  },
];