import type { TopicStat, WorkanaJob } from "./types";

export type TopicKind = "stack" | "industry";

/** Technology stacks & platforms detected in listings. */
export const STACK_TOPICS = [
  "WordPress",
  "Shopify",
  "WooCommerce",
  "Webflow",
  "Wix",
  "Framer",
  "Divi",
  "Elementor",
  "SaaS",
  "CRM",
  "ERP",
  "Automation",
  "WhatsApp",
  "Chatbot",
  "AI Agent",
  "Blockchain",
  "IoT",
  "Landing Page",
  "Other Stack",
] as const;

/** Industry verticals & business niches. */
export const INDUSTRY_TOPICS = [
  "E-commerce",
  "Healthcare",
  "Health Clinic",
  "Beauty",
  "Real Estate",
  "Travel",
  "Finance",
  "Education",
  "Food & Restaurant",
  "Legal",
  "Marketing",
  "Logistics",
  "Automotive",
  "HR & Recruitment",
  "Social Media",
  "Fitness",
  "Virtual Assistance",
  "Agency Website",
  "Gaming",
  "Other Industry",
] as const;

export type StackTopic = (typeof STACK_TOPICS)[number];
export type IndustryTopic = (typeof INDUSTRY_TOPICS)[number];

/** @deprecated Use STACK_TOPICS / INDUSTRY_TOPICS */
export const PROJECT_TOPICS = [...STACK_TOPICS, ...INDUSTRY_TOPICS] as const;
export type ProjectTopic = StackTopic | IndustryTopic;

const STACK_RULES: Array<{ topic: StackTopic; patterns: RegExp[] }> = [
  { topic: "WordPress", patterns: [/wordpress|wp theme|wp plugin|gutenberg/i] },
  { topic: "Elementor", patterns: [/elementor|elementor pro|elementor widget/i] },
  { topic: "Divi", patterns: [/\bdivi\b|elegant themes|divi builder/i] },
  { topic: "WooCommerce", patterns: [/woocommerce|woo commerce|woo\b.*shop/i] },
  { topic: "Shopify", patterns: [/shopify|liquid template|shopify theme|shopify app/i] },
  { topic: "Webflow", patterns: [/webflow|web flow/i] },
  { topic: "Wix", patterns: [/\bwix\b|wix studio|velo wix|editor wix/i] },
  { topic: "Framer", patterns: [/\bframer\b|framer site/i] },
  { topic: "SaaS", patterns: [/saas|software as a service|plataforma saas|subscription platform|multi-tenant/i] },
  { topic: "CRM", patterns: [/\bcrm\b|customer relationship|gest[aã]o de clientes|sales pipeline|hubspot|pipedrive|rd station/i] },
  { topic: "ERP", patterns: [/\berp\b|enterprise resource|gest[aã]o empresarial|inventory management system/i] },
  { topic: "Automation", patterns: [/automation|automa[cç][aã]o|zapier|make\.com|\bn8n\b|integromat|power automate/i] },
  { topic: "WhatsApp", patterns: [/whatsapp|whats app|wa business api|z-api|evolution api/i] },
  { topic: "AI Agent", patterns: [/ai agent|agente de ia|agente inteligente|autonomous agent|langchain|crewai/i] },
  { topic: "Chatbot", patterns: [/chatbot|chat bot|conversational bot|manychat|dialogflow|bot de atendimento/i] },
  { topic: "Blockchain", patterns: [/blockchain|web3|nft|smart contract|solidity|defi/i] },
  { topic: "IoT", patterns: [/\biot\b|internet of things|embedded|sensor|arduino|raspberry/i] },
  { topic: "Landing Page", patterns: [/landing page|p[aá]gina de captura|one page|squeeze page|p[aá]gina institucional/i] },
];

const INDUSTRY_RULES: Array<{ topic: IndustryTopic; patterns: RegExp[] }> = [
  {
    topic: "E-commerce",
    patterns: [
      /e-?commerce|ecommerce|com[eé]rcio eletr[oô]nico|comercio electr[oó]nico|loja virtual|tienda online|marketplace|online store|loja online|magento|prestashop/i,
    ],
  },
  { topic: "Healthcare", patterns: [/healthcare|health care|sa[uú]de|salud|medical|m[eé]dico|hospital|telemedicine|telemedicina/i] },
  { topic: "Health Clinic", patterns: [/health clinic|cl[ií]nica|clinic app|consult[oó]rio|patient portal|prontu[aá]rio|cl[ií]nica m[eé]dica/i] },
  { topic: "Beauty", patterns: [/beauty|beleza|belleza|sal[oó]n|spa|cosm[eé]tico|est[eé]tica|makeup|skincare|cl[ií]nica est[eé]tica/i] },
  { topic: "Real Estate", patterns: [/real estate|im[oó]veis|inmobiliar|property|corretor|aluguel|rental platform/i] },
  { topic: "Travel", patterns: [/travel|turismo|tourism|hotel|booking|viagem|passagens|airline/i] },
  { topic: "Finance", patterns: [/finance|finan[cç]as|finanzas|banking|banco|fintech|investment|investimento|crypto wallet|pagamento/i] },
  { topic: "Education", patterns: [/education|educa[cç][aã]o|educaci[oó]n|e-learning|lms|curso online|school platform|universidade/i] },
  { topic: "Food & Restaurant", patterns: [/restaurant|restaurante|food delivery|delivery de comida|menu digital|ifood|rappi/i] },
  { topic: "Legal", patterns: [/legal|jur[ií]dico|law firm|advocacia|contrato|compliance/i] },
  { topic: "Marketing", patterns: [/marketing digital|seo|google ads|facebook ads|email marketing|lead generation/i] },
  { topic: "Logistics", patterns: [/logistics|log[ií]stica|frete|shipping|supply chain|estoque|warehouse|delivery tracking/i] },
  { topic: "Automotive", patterns: [/automotive|autom[oó]vel|car dealer|ve[ií]culo|fleet management|garage/i] },
  { topic: "HR & Recruitment", patterns: [/recruitment|recrutamento|rh\b|human resources|job board|hiring platform/i] },
  { topic: "Social Media", patterns: [/social media|redes sociais|instagram app|content platform|influencer/i] },
  { topic: "Fitness", patterns: [/fitness|gym|academia|workout|treino|exercise app|personal trainer/i] },
  { topic: "Virtual Assistance", patterns: [/virtual assistant|assistente virtual|va\b|asistente administrativo|executive assistant|data entry/i] },
  { topic: "Agency Website", patterns: [/agency website|site para ag[eê]ncia|marketing agency site|portf[oó]lio de ag[eê]ncia|creative agency/i] },
  { topic: "Gaming", patterns: [/game dev|game development|video game|jogo|unity|unreal|godot/i] },
];

function jobText(job: WorkanaJob): string {
  return `${job.title} ${job.description} ${job.skills.join(" ")}`.toLowerCase();
}

export function classifyStackTopic(job: WorkanaJob): StackTopic {
  const text = jobText(job);
  for (const { topic, patterns } of STACK_RULES) {
    if (patterns.some((p) => p.test(text))) return topic;
  }
  return "Other Stack";
}

export function classifyIndustryTopic(job: WorkanaJob): IndustryTopic {
  const text = jobText(job);
  for (const { topic, patterns } of INDUSTRY_RULES) {
    if (patterns.some((p) => p.test(text))) return topic;
  }
  return "Other Industry";
}

/** @deprecated Use classifyStackTopic or classifyIndustryTopic */
export function classifyProjectTopic(job: WorkanaJob): ProjectTopic {
  const stack = classifyStackTopic(job);
  if (stack !== "Other Stack") return stack;
  return classifyIndustryTopic(job);
}

function countByKind<T extends string>(
  jobs: WorkanaJob[],
  labels: readonly T[],
  classify: (job: WorkanaJob) => T,
  kind: TopicKind,
  includeEmpty: boolean
): TopicStat[] {
  const counts = new Map<string, number>();

  for (const job of jobs) {
    const topic = classify(job);
    counts.set(topic, (counts.get(topic) ?? 0) + 1);
  }

  const total = jobs.length || 1;
  const entries = includeEmpty
    ? labels.map((topic) => ({ topic, count: counts.get(topic) ?? 0 }))
    : Array.from(counts.entries()).map(([topic, count]) => ({ topic, count }));

  return entries
    .map(({ topic, count }) => ({
      topic,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
      kind,
    }))
    .sort((a, b) => b.count - a.count);
}

export function countStackTopics(jobs: WorkanaJob[], includeEmpty = false): TopicStat[] {
  return countByKind(jobs, STACK_TOPICS, classifyStackTopic, "stack", includeEmpty);
}

export function countIndustryTopics(jobs: WorkanaJob[], includeEmpty = false): TopicStat[] {
  return countByKind(jobs, INDUSTRY_TOPICS, classifyIndustryTopic, "industry", includeEmpty);
}

/** Combined legacy list — stack + industry counts merged by label */
export function countProjectTopics(jobs: WorkanaJob[], includeEmpty = false): TopicStat[] {
  const stack = countStackTopics(jobs, includeEmpty).filter((t) => t.topic !== "Other Stack");
  const industry = countIndustryTopics(jobs, includeEmpty).filter((t) => t.topic !== "Other Industry");
  return [...stack, ...industry].sort((a, b) => b.count - a.count);
}

export function topProjectTopics(stats: TopicStat[], limit = 12): TopicStat[] {
  return stats.filter((t) => t.count > 0).slice(0, limit);
}

export function topStackTopics(jobs: WorkanaJob[], limit = 12): TopicStat[] {
  return countStackTopics(jobs).filter((t) => t.count > 0 && t.topic !== "Other Stack").slice(0, limit);
}

export function topIndustryTopics(jobs: WorkanaJob[], limit = 12): TopicStat[] {
  return countIndustryTopics(jobs).filter((t) => t.count > 0 && t.topic !== "Other Industry").slice(0, limit);
}
