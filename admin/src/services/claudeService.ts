// Claude API Service for document analysis
// Note: API key is exposed in browser - acceptable for admin-only access

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

export interface Scripture {
  reference: string;
  text: string;
}

export interface Snippet {
  id: string;
  title: string;
  subtitle: string;
  body: string; // Lock screen message, under 100 chars
  snippet: string; // The actual reading content (1-2 paragraphs)
  scripture: Scripture;
  scheduledDay?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  scheduledTime?: string; // HH:MM format
  isScheduled?: boolean;
}

export interface WeeklyContentOutput {
  weekTitle: string;
  snippets: Snippet[];
}

export interface ClaudeResponse {
  success: boolean;
  data?: WeeklyContentOutput;
  error?: string;
  rawResponse?: string;
}

export async function analyzeDocument(
  documentText: string,
  customInstructions: string
): Promise<ClaudeResponse> {
  if (!CLAUDE_API_KEY) {
    return {
      success: false,
      error: 'Claude API key not configured. Please add VITE_CLAUDE_API_KEY to your .env file.',
    };
  }

  const systemPrompt = `You are a Bible study content extractor. Your task is to break down documents into many small, digestible teaching snippets for a Bible reading app.

IMPORTANT: Do NOT summarize the document. Instead, extract MANY individual teaching points, thoughts, and takeaways - one idea per snippet. A typical document should yield 30-60+ snippets.

You MUST respond with valid JSON only - no markdown, no code blocks, just pure JSON.

The JSON structure must be:
{
  "weekTitle": "Short title for this study/series",
  "snippets": [
    {
      "id": "1",
      "title": "Short Header (3-5 words)",
      "subtitle": "Preview hint text",
      "body": "Lock screen message under 100 chars",
      "snippet": "The actual teaching content - one or two paragraphs extracted/cleaned from the document. This is the main reading the user will see when they tap the notification.",
      "scripture": {
        "reference": "John 3:16",
        "text": "For God so loved the world..."
      }
    }
  ]
}

Guidelines for each snippet:
- id: Sequential number as string ("1", "2", "3", etc.)
- title: Bold header, 3-5 words max (e.g., "Why Faith Matters", "God's Perfect Timing")
- subtitle: Short preview hint (e.g., "Understanding the foundation", "A lesson in patience")
- body: Lock screen notification message, MUST be under 100 characters, encouraging and intriguing
- snippet: 1-2 paragraphs of actual teaching content from the document. Clean it up but preserve the substance. This is what users read when they open the notification.
- scripture: A relevant Bible verse that connects to THIS specific snippet's teaching

Extract as many distinct teaching points as possible. Each snippet should:
- Be self-contained (makes sense on its own)
- Cover ONE idea, thought, or takeaway
- Include relevant scripture that supports the point
- Be encouraging and practical

Go through the ENTIRE document systematically. Don't skip sections. Extract every meaningful teaching point.`;

  const userMessage = `${customInstructions}

Here is the document to analyze and break into snippets:

---
${documentText}
---

Remember:
- Extract MANY snippets (30-60+), not just a few
- Each snippet is ONE teaching point
- Respond with valid JSON only, no markdown formatting`;

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 16384, // Increased for many snippets
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: `API error: ${response.status} - ${errorData.error?.message || response.statusText}`,
      };
    }

    const data = await response.json();
    const rawContent = data.content?.[0]?.text || '';

    // Try to parse the JSON response
    try {
      // Remove any potential markdown code blocks
      let jsonStr = rawContent.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      const parsed = JSON.parse(jsonStr) as WeeklyContentOutput;

      // Validate required fields
      if (!parsed.weekTitle || !parsed.snippets || !Array.isArray(parsed.snippets)) {
        return {
          success: false,
          error: 'Response missing required fields (weekTitle, snippets)',
          rawResponse: rawContent,
        };
      }

      // Ensure each snippet has an id
      parsed.snippets = parsed.snippets.map((s, i) => ({
        ...s,
        id: s.id || String(i + 1),
        isScheduled: false,
      }));

      return {
        success: true,
        data: parsed,
        rawResponse: rawContent,
      };
    } catch (parseError) {
      return {
        success: false,
        error: 'Failed to parse Claude response as JSON',
        rawResponse: rawContent,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
