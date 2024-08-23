# Metadata Parser

## Build and run

First populate `.env` file to have:
```sh
USE_HTTPS=false
PORT=7123

SUPABASE_URL=http://...     # Required
SUPABASE_SERVICE_KEY=ey...  # Required
OPENAI_API_KEY=sk_...       # Required
```

Then run docker build and docker run:
```bash
docker build --no-cache -t metadata-parser .
docker docker run -p 7123:7123 metadata-parser 
```