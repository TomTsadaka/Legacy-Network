import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// POST /api/ai/generate-story - Generate memory story with AI
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event, location, feeling, details, childName } = body;

    if (!event) {
      return NextResponse.json(
        { error: 'Event description required' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    const apiKey = process.env.OPENAI_API_KEY || process.env.GOOGLE_AI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'AI not configured',
          message: 'יש להגדיר API key של OpenAI או Google AI ב-environment variables'
        },
        { status: 500 }
      );
    }

    // Build prompt
    const prompt = buildPrompt({ event, location, feeling, details, childName });

    // Call AI API
    let story: string;
    
    if (process.env.OPENAI_API_KEY) {
      story = await callOpenAI(prompt, process.env.OPENAI_API_KEY);
    } else if (process.env.GOOGLE_AI_KEY) {
      story = await callGemini(prompt, process.env.GOOGLE_AI_KEY);
    } else {
      throw new Error('No AI API key configured');
    }

    return NextResponse.json({
      success: true,
      story,
      message: 'הסיפור נוצר בהצלחה!',
    });
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate story',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Build prompt for AI
function buildPrompt(params: {
  event: string;
  location?: string;
  feeling?: string;
  details?: string;
  childName?: string;
}): string {
  const { event, location, feeling, details, childName } = params;

  let prompt = `אתה כותב זיכרונות משפחתיים מרגשים בעברית.

כתוב זיכרון משפחתי קצר, חם ומרגש (2-3 פסקאות) על האירוע הבא:

אירוע: ${event}`;

  if (childName) {
    prompt += `\nילד/ה: ${childName}`;
  }

  if (location) {
    prompt += `\nמיקום: ${location}`;
  }

  if (feeling) {
    prompt += `\nרגש: ${feeling}`;
  }

  if (details) {
    prompt += `\nפרטים נוספים: ${details}`;
  }

  prompt += `

דרישות:
- כתוב בעברית בלבד
- סגנון חם, אישי ורגשי
- השתמש במילים פשוטות ומרגשות
- 2-3 פסקאות
- התמקד ברגש והחוויה
- אל תוסיף כותרת או תאריך
- כתוב בגוף ראשון (אני/אנחנו)

הזיכרון:`;

  return prompt;
}

// Call OpenAI API
async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'אתה כותב זיכרונות משפחתיים מרגשים בעברית. כתוב בסגנון חם, אישי ופשוט.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Call Google Gemini API
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 500,
        }
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API error');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}
