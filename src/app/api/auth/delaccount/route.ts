import { EmailTemplate } from '@/lib/resend/deletion-email';
import { Resend } from 'resend';
import { NextRequest } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userEmail, userFirstName, userId } = body;
  if (!userEmail || !userFirstName || !userId) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `PNID.app <${process.env.NEXT_PUBLIC_SUPPORT_EMAIL_SENDER}>`,
      to: [`${process.env.NEXT_PUBLIC_SUPPORT_EMAIL!}`],
      subject: `[PNID.app] Account Deletion Request for ${userEmail}`,
      react: EmailTemplate({ userEmail, userFirstName, userId }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
