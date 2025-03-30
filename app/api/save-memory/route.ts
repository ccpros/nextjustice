import { NextResponse } from 'next/server';
import { sanity } from '@/lib/sanity';

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, messages, tags = [] } = body;

  if (!userId || !messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Missing or invalid data' }, { status: 400 });
  }

  try {
    const res = await sanity.create({
      _type: 'chatMemory',
      userId,
      sessionId: crypto.randomUUID(),
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString(),
      })),
      tags,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, docId: res._id });
  } catch (err) {
    console.error('[SAVE MEMORY ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
