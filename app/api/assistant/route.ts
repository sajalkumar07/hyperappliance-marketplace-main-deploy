import { NextResponse } from 'next/server';

// Minimal assistant proxy that strictly targets the OpenAI Responses API with the
// new reasoning models (o4-mini, o3, etc.).  No fallbacks – we want to surface
// real errors so they can be fixed rather than silently switching models.

export async function POST(request: Request) {
  try {
    const { prompt, effort = 'medium' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 });
    }

    const knowledgeContext = `You are Hyper-T, an AI support assistant for the HyperAppliance AIMs Marketplace (a Next.js dApp).  
Key facts you should know when answering users:
- HyperCycle is a Layer-1 blockchain that enables a decentralized "Internet of AI" where AI micro-services communicate with sub-second finality.
- HyperAppliance provides plug-and-play edge hardware ("HyperAI Box" / "Neuron") that runs HyperCycle nodes and AI modules at home.
- The Marketplace lets users upload, buy, and deploy AI Modules (AIMs) onto HyperBoxes.
- Users can deploy by selecting an AIM, choosing an available HyperBox, opening a USDC payment channel, then clicking Deploy (mock deployments when DEMO_DEPLOY=true).
- Supported currencies: ETH and USDC (Base chain coming soon).
- Site-wide chat drawer provides messaging; Hyper-T appears as a built-in conversation.
- Backend stack: Next.js + TypeScript, Chakra UI, Redis, PostgreSQL, Prisma.
- Common troubleshooting tips:
  • If Redis errors occur, ensure Redis server is running and REDIS_URL is set.  
  • For Response-API errors, verify OPENAI_API_KEY and beta access.  
  • Mock deployments need DEMO_DEPLOY=true.
- Home page highlights three core user actions:
  • "Buy AI Modules" – browse marketplace for cutting-edge AIMs.
  • "Sell Your AI" – creators list modules via the Create Listing wizard.
  • "Run on HyperAppliance" – deploy purchased AIMs to a HyperAI Box through the Deploy Wizard.
`;

    // Call the beta Responses API.
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        // Required beta header per OpenAI docs
        'OpenAI-Beta': 'responses=v1',
      },
      body: JSON.stringify({
        model: 'o4-mini',
        reasoning: { effort },
        input: [
          { role: 'system', content: knowledgeContext },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          error: `Responses API failed (${res.status}): ${text}`,
        },
        { status: 500 },
      );
    }

    const data = await res.json();

    let replyText: string | undefined = data.output_text; // older format
    if (!replyText && Array.isArray(data.output)) {
      // Newer Responses API schema: find message item then its content text
      const msgItem = data.output.find((item: any) => item.type === 'message');
      if (msgItem && Array.isArray(msgItem.content)) {
        const textPart = msgItem.content.find((c: any) => c.type === 'output_text');
        if (textPart?.text) replyText = textPart.text;
      }
    }

    if (!replyText) {
      return NextResponse.json({ error: 'Assistant response missing' }, { status: 500 });
    }

    return NextResponse.json({ reply: replyText });
  } catch (err: any) {
    console.error('Assistant API error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 