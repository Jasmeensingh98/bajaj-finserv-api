# BFHL API

## Endpoints

- `GET /health`

Response:
```json
{
  "is_success": true,
  "official_email": "YOUR_CHITKARA_EMAIL"
}
```

- `POST /bfhl`

Request rules:
- Body must contain exactly one key.
- Allowed keys: `fibonacci`, `prime`, `lcm`, `hcf`, `AI`.

Success response:
```json
{
  "is_success": true,
  "official_email": "YOUR_CHITKARA_EMAIL",
  "data": "RESULT"
}
```

Error response (HTTP 400):
```json
{
  "is_success": false,
  "official_email": "YOUR_CHITKARA_EMAIL",
  "error": "Invalid request"
}
```

## Setup

```bash
npm install
npm run start
```

Copy `.env.example` to `.env` and set values as needed.

## AI Setup

Set `OPENAI_API_KEY` in your `.env` (never commit this key).

Example:
```
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
```

The `/bfhl` endpoint with `{"AI": "your question"}` returns a single-word answer.

## Deployment (Render)

1) Push the repo to a public GitHub repository.
2) Create a new Render Web Service linked to your repo.
3) Build command: `npm install`
4) Start command: `npm start`
5) Add environment variables:
  - `OFFICIAL_EMAIL`
  - `OPENAI_API_KEY` (optional for AI tests)
  - `OPENAI_MODEL` (optional)
6) Deploy, then verify:
  - `GET /health`
  - `POST /bfhl`

## Examples

```bash
curl -s http://localhost:3000/health
```

```bash
curl -s http://localhost:3000/bfhl \
  -H "Content-Type: application/json" \
  -d '{"fibonacci": 7}'
```

```bash
curl -s http://localhost:3000/bfhl \
  -H "Content-Type: application/json" \
  -d '{"prime": [2, 3, 4, 5, 9, 11]}'
```

```bash
curl -s http://localhost:3000/bfhl \
  -H "Content-Type: application/json" \
  -d '{"lcm": [4, 6, 8]}'
```

```bash
curl -s http://localhost:3000/bfhl \
  -H "Content-Type: application/json" \
  -d '{"hcf": [12, 18, 24]}'
```

```bash
curl -s http://localhost:3000/bfhl \
  -H "Content-Type: application/json" \
  -d '{"AI": "Capital of Maharashtra"}'
```

Error cases (HTTP 400):

```bash
curl -s http://localhost:3000/bfhl \
  -H "Content-Type: application/json" \
  -d '{}' 
```

```bash
curl -s http://localhost:3000/bfhl \
  -H "Content-Type: application/json" \
  -d '{"fibonacci": 5, "prime": [2, 3]}'
```
