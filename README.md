# Bidding Platform

An eBay-style online auction and bidding platform.

## Structure
- `backend/`: API server (auctions, bids, users, payments)
- `frontend/`: web client
- `docs/`: design notes

## Setup
1. Copy `.env.example` to `.env` and fill in the values.
2. `docker compose up -d` starts the local services (Postgres, Redis).

## OpenAI connection check

Set `OPENAI_API_KEY` in `.env` (or export it in your shell), then run:

```sh
node backend/check-openai.mjs
```

The check sends a short prompt to the OpenAI Responses API and prints the model's answer. The default model is `gpt-4.1-mini`; set `OPENAI_MODEL` to use another available model. API usage may incur charges.
