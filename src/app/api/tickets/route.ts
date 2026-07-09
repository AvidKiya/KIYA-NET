import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { nanoid } from "nanoid";

interface Ticket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

let tickets: Ticket[] = [];

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userTickets = tickets.filter(t => t.userId === user.id);
  return NextResponse.json({ tickets: userTickets });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, message } = await req.json();

  const ticket: Ticket = {
    id: nanoid(10),
    userId: user.id,
    subject,
    message,
    status: "OPEN",
    createdAt: new Date().toISOString(),
  };

  tickets.push(ticket);
  return NextResponse.json(ticket);
}