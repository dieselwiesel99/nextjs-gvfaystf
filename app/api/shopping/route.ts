import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  const items = await kv.get('shopping_list');
  return NextResponse.json(items || []);
}

export async function POST(request: Request) {
  const body = await request.json();
  await kv.set('shopping_list', body);
  return NextResponse.json({ success: true });
}