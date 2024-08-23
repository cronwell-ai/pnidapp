# PDF Export

## Build and run

```bash
docker build --no-cache -t pdf-export .
docker run -e USE_HTTPS=false -p 6123:5000 pdf-export # to run on local port 6123
```