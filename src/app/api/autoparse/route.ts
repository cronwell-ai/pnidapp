import sentryHelper from '@/lib/sentry';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { file_id, pos_x, pos_y, width, height, equipment_type } = await request.json();

    const response = await fetch(`${process.env.METADATA_PARSER_ADDR!}/extract-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_id,
        pos_x,
        pos_y,
        width,
        height,
        equipment_type,
      }),
    });

    if (!response.ok) {
      throw new Error('Invalid Network Response');
    }

    const responseData = await response.json();
    const image = responseData.image;
    const desc = JSON.parse(responseData.description);

    return NextResponse.json({ image, desc });
  } catch (error: any) {
    sentryHelper.logError(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}