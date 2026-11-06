// Presentation taxonomy for library filtering. Keep saved source metadata intact:
// historical model output contains both scenario aliases and non-scenario labels.
export const scenarioOptions = [
  { value: "workplace", label: "Work" },
  { value: "daily_life", label: "Everyday" },
  { value: "discussion", label: "Discussions" },
  { value: "presentation", label: "Presentations" },
  { value: "interview", label: "Interviews" },
  { value: "storytelling", label: "Storytelling" },
  { value: "writing", label: "Writing" },
  { value: "unknown", label: "Other" },
] as const;

type Scenario = typeof scenarioOptions[number]["value"];
const aliases: Record<Exclude<Scenario, "unknown">, readonly string[]> = {
  workplace: [
    "work", "workplace", "business", "office", "meetings", "meeting", "team meeting",
    "business discussion", "leadership", "职场", "工作", "工作场景", "工作交流", "商务",
    "商业讨论", "商务讨论", "商业竞争", "商业领导力", "创新讨论", "团队协作", "会议",
  ],
  daily_life: [
    "daily life", "everyday", "everyday life", "small talk", "casual conversation",
    "日常", "日常生活", "日常口语", "日常交流", "闲聊", "寒暄", "日常对话",
  ],
  discussion: [
    "discussion", "discussions", "explanation", "explaining", "negotiation", "negotiations",
    "disagreement", "debate", "academic discussion", "解释", "解释说明", "讨论", "谈判",
    "协商", "分歧", "表达不同意见", "辩论", "学术交流", "评论", "新闻评论", "正式讨论", "正式追问",
  ],
  presentation: [
    "presentation", "presentations", "public speaking", "speech", "speeches", "pitch",
    "演讲", "演示", "展示", "公开演讲", "商业演讲", "商务演讲", "正式演讲", "开场白",
  ],
  interview: [
    "interview", "interviews", "job interview", "business interview", "访谈", "采访",
    "访谈场景", "商务访谈", "商业访谈", "面试",
  ],
  storytelling: ["storytelling", "story telling", "narration", "narrative", "讲故事", "故事讲述", "叙事"],
  writing: ["writing", "email", "emails", "written communication", "business writing", "写作", "邮件", "电子邮件", "商务邮件", "书面沟通"],
};

const normalize = (value: string) => value.normalize("NFKC").trim().toLowerCase().replace(/[_–—-]+/g, " ").replace(/\s+/g, " ");
const scenarioByAlias = new Map<string, Scenario>(
  Object.entries(aliases).flatMap(([group, values]) => values.map(value => [normalize(value), group as Scenario] as const)),
);

export function scenarioGroups(tags: readonly string[] | undefined): Scenario[] {
  const groups = new Set<Scenario>();
  for (const tag of tags ?? []) {
    const group = scenarioByAlias.get(normalize(tag));
    if (group) groups.add(group);
  }
  // Register, rhetorical function and unknown tags cannot reliably imply a setting.
  // Keep such records reachable via Other without inventing a scenario.
  return groups.size ? [...groups] : ["unknown"];
}
