import { NextResponse } from 'next/server';
import { sanity } from '@/lib/sanity';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const { userId, sessionId, messages } = await req.json();

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
  }

  try {
    const timestamp = new Date().toISOString();

    const formattedMessages = messages.map((msg: any) => ({
      _key: uuidv4(),
      role: msg.role,
      content: msg.content,
      timestamp,
    }));

    await sanity.create({
      _type: 'chatMemory',
      _id: `chat-${uuidv4()}`,
      userId,
      sessionId,
      messages: formattedMessages,
      createdAt: timestamp,
      lastUpdated: timestamp,
      archived: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving memory:', error);
    return NextResponse.json({ error: 'Failed to save memory.' }, { status: 500 });
  }
}
