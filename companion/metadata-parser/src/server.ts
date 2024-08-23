import express, { Request, Response } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { fromBuffer } from 'pdf2pic';
import sharp from 'sharp';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';
import https from 'https';
import http from 'http';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const port = Number(process.env.PORT) || 3000;

const BlobStore = new Map<string, string>()

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error('Missing OpenAI API key');
}
const openai = new OpenAI({ apiKey: openaiApiKey });

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or API key');
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Supabase with TypeScript!');
});

app.get('/test-supabase', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('files').select('*').limit(1);
    if (error) throw error;
    res.json({ message: 'Supabase connection successful', data: data ? data.length : 'No data found' });
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    res.status(500).json({ message: 'Supabase connection failed', error: (error as Error).message });
  }
});

async function pdfBlobToImgBuffer(fileData: Blob, width: number, height: number) {
  const pdfBuffer = Buffer.from(await fileData.arrayBuffer());
  const options = {
    density: 100,
    saveFilename: "untitled",
    format: "png",
    width: Number(width),
    height: Number(height)
  };
  const convert = fromBuffer(pdfBuffer, options);
  const pageToConvertAsImage = 1;

  const imageBuffer = await convert(pageToConvertAsImage, { responseType: 'buffer' });
  return await sharp(imageBuffer.buffer)
    .resize(Number(width), Number(height), { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();
}

async function getImageDescription(openai: OpenAI, imageBuffer: Buffer, type: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      response_format: {
        type: 'json_object'
      },
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text", text: "You are an experienced chemical engineer. \
              You read and draw P&IDs every day. A junior engineer wants to ask you about elements on P&ID drawings. \
              Please help him as best as you can. However, you want to be as precise and predictable as possible. \
              Therefore, you restrict yourself to only respond in json format. \
              More precisely, you are to return a single layer json object, where each key is a string and each value is also a string.\
              You need to make sure that this json object string can be directly parsed library, so no need to output backtick characters.\
              This json object must have a field called 'name' (prefer exact text you see from the image).  \
	      But besides that, you can provide as much metadata information and engineering insights as you can. \
              Once you are done, append to the object a summary for the element, and call it a 'description'. This summary should be less than 20 words."}
          ]
        },
        {
          role: "user",
          content: [
            { type: "text", text: `This is a small part of a large P&ID drawing. How would you describe this ${type}?` },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${imageBuffer.toString('base64')}`,
              },
            },
          ],
        },
      ],
    });

    return response.choices[0]?.message?.content || "No description available.";
  } catch (error) {
    console.error('Error getting image description:', error);
    return "Failed to generate image description.";
  }
}

async function getFileData(fileId: string) {
  const cached = BlobStore.get(fileId)
  if (cached) { 
    return cached 
  }

  const { data, error } = await supabase
    .from('files')
    .select('fpath, width, height, ftype')
    .eq('short_uid', fileId)
    .single();

  if (error) throw new Error(`Database query failed: ${error.message}`);

  const { fpath, width, height, ftype } = data;
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('files')
    .download(fpath);
  if (downloadError) throw new Error(`File download failed: ${downloadError.message}`);

  let imgBuffer: Buffer;

  if (ftype === "application/pdf") {
    imgBuffer = await pdfBlobToImgBuffer(fileData, width, height)
  } else if (ftype === "image/jpeg" || ftype === "image/png") {
    const imageBuffer = Buffer.from(await fileData.arrayBuffer());
    imgBuffer = await sharp(imageBuffer).resize(width, height, { fit: 'inside' }).toBuffer();
  } else {
    throw new Error (`File is neither an image nore a pdf. Got type: ${ftype}`)
  }
  const res = imgBuffer.toString('base64')
  BlobStore.set(fileId, res)
  return res
}

app.post('/extract-image', async (req: Request, res: Response) => {
  const { file_id, pos_x: box_x, pos_y: box_y, width: box_width, height: box_height, equipment_type } = req.body;

  if (!file_id || box_x == null || box_y == null || !box_width || !box_height || !equipment_type) {
    return res.status(400).json({ error: 'Missing required parameters in request body' });
  }

  try {
    const data = await getFileData(file_id)
    const imgBuffer: Buffer = Buffer.from(data, 'base64');

    const extractedBuffer = await sharp(imgBuffer)
      .extract({ left: Number(Math.floor(box_x)), top: Number(Math.floor(box_y)), width: Number(Math.floor(box_width) + 1), height: Number(Math.floor(box_height) + 1) })
      .toBuffer();

    /* TODO: ask openai gpt4o to write a description for the image */
    const imageDescription = await getImageDescription(openai, extractedBuffer, equipment_type);

    res.setHeader('Content-Type', 'application/json');
    res.json({
      image: `data:image/png;base64,${extractedBuffer.toString('base64')}`,
      description: imageDescription
    });

  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'An error occurred while processing your request', details: (error as Error).message });
  }
});

const useHttps = process.env.USE_HTTPS === 'true';

if (useHttps) {
  // Paths to your SSL certificate and key files
  const options = {
    key: fs.readFileSync('/app/https-keys/privkey1.pem'),
    cert: fs.readFileSync('/app/https-keys/fullchain1.pem')
  };

  // Create HTTPS server
  https.createServer(options, app).listen(443, () => {
    console.log('HTTPS server running on port 443');
  });

  // Redirect HTTP to HTTPS
  http.createServer((req, res) => {
    res.writeHead(301, { 'Location': 'https://' + req.headers.host + req.url });
    res.end();
  }).listen(80, () => {
    console.log('HTTP to HTTPS redirect server running on port 80');
  });
} else {
  // Create HTTP server
  app.listen(port, '0.0.0.0', () => {
    console.log(`HTTP server running on http://localhost:${port}`);
  });
}
