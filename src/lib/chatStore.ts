export type ChatRole = "user" | "ai";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  ts: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

const KEY = "arogyaai.conversations";

const seed = (): Conversation[] => {
  const now = Date.now();
  return [
    {
      id: crypto.randomUUID(),
      title: "Headache & fatigue check-in",
      createdAt: now - 1000 * 60 * 60 * 24,
      updatedAt: now - 1000 * 60 * 60 * 23,
      messages: [
        { id: crypto.randomUUID(), role: "ai", text: "Hi Aarav! How are you feeling today? Describe any symptoms.", ts: now - 1000 * 60 * 60 * 24 },
        { id: crypto.randomUUID(), role: "user", text: "I've had a mild headache and feel tired since morning.", ts: now - 1000 * 60 * 60 * 23.9 },
        { id: crypto.randomUUID(), role: "ai", text: "Got it. Could be dehydration or low sleep. Drink water and rest. I'll monitor your vitals.", ts: now - 1000 * 60 * 60 * 23.8 },
      ],
    },
    {
      id: crypto.randomUUID(),
      title: "Sleep quality discussion",
      createdAt: now - 1000 * 60 * 60 * 48,
      updatedAt: now - 1000 * 60 * 60 * 47,
      messages: [
        { id: crypto.randomUUID(), role: "user", text: "I've been sleeping only 5 hours.", ts: now - 1000 * 60 * 60 * 48 },
        { id: crypto.randomUUID(), role: "ai", text: "That's below the recommended 7–8 hours. Try a consistent bedtime routine.", ts: now - 1000 * 60 * 60 * 47.9 },
      ],
    },
  ];
};

export const loadConversations = (): Conversation[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as Conversation[];
  } catch {
    return seed();
  }
};

export const saveConversations = (convs: Conversation[]) => {
  localStorage.setItem(KEY, JSON.stringify(convs));
  window.dispatchEvent(new CustomEvent("arogyaai:conversations"));
};

export const newConversation = (): Conversation => ({
  id: crypto.randomUUID(),
  title: "New chat",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [
    { id: crypto.randomUUID(), role: "ai", text: "Hi! I'm your AI Health Assistant. How can I help today?", ts: Date.now() },
  ],
});

const aiReplies = [
  "Thanks for sharing. Based on your vitals everything looks within range.",
  "I'd recommend hydrating well and getting at least 7 hours of sleep.",
  "Could you tell me more about when this started?",
  "Noted. I'll add this to your health timeline for tracking.",
  "Consider a short walk — light activity often helps with that symptom.",
];

export const generateAiReply = (_userText: string) =>
  aiReplies[Math.floor(Math.random() * aiReplies.length)];
