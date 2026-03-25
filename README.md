# POAP — Proof of Attendance Protocol

A web app for minting on-chain attendance badges on Solana. Admins create events and display a rotating QR code. Attendees scan it to instantly mint a Metaplex Core NFT to their wallet — no crypto knowledge required.

---

## How it works

1. **Admin creates an event** — sets a name, image, and time window. A unique ed25519 keypair is generated for that event.
2. **Admin shares a QR display link** — the rotating QR refreshes every 10 seconds, signed with a 30-second expiring token.
3. **Attendee scans** — opens the app on their phone, goes to Scan, and points the camera at the QR. An NFT is minted to their Solana wallet automatically.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TailwindCSS, Framer Motion, Zustand |
| Auth | Supabase (Google OAuth) |
| Database | Supabase Postgres |
| Storage | Supabase Storage (event images + metadata) |
| Backend | Supabase Edge Functions (Deno) |
| Blockchain | Solana devnet — Metaplex Core NFTs |
| QR signing | @noble/ed25519 |

---

## Edge Functions

| Function | Purpose |
|---|---|
| `wallet` | Creates or fetches a user's Solana wallet (AES-256 encrypted at rest) |
| `qr-issue` | Issues a short-lived signed QR token (30s expiry) |
| `mint` | Verifies QR signature, checks idempotency, mints NFT on-chain |
| `events-create` | Creates an event and generates its ed25519 keypair |
| `events-delete` | Deletes an event and all associated data |
| `admin-request` | Handles admin access requests and approvals |

---

## Security

- QR tokens expire in 30 seconds and include a random nonce — replay attacks are blocked
- Duplicate minting is prevented by a unique DB constraint on `(event_id, wallet_pubkey)` with an atomic reservation before the on-chain call
- Wallet secret keys are encrypted with AES-256-GCM before being stored in the database
- Rate limiting on mint: max 10 mints per user per 60 seconds
- Admin approval is owner-gated — only the owner email can approve admin requests

---

## Environment variables

### Frontend (`.env`)
```
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
```

### Supabase secrets
```
project_url
product_anon_key
rpc_url
server_mint_secret_b64
WALLET_ENCRYPTION_KEY
RESEND_API_KEY          # optional — enables email alerts
```

---

## Local development

```bash
npm install
npm start
```

Deploy edge functions:
```bash
supabase functions deploy <function-name>
```

---

## Database tables

- `events` — event metadata (name, image, times, metadata URI)
- `qr_keys` — ed25519 keypair per event (secret stored as base64)
- `wallets` — user wallet (public key + encrypted secret key)
- `passes` — minted badge records (one per event+wallet)
- `admins` — approved admin emails
- `admin_requests` — access request queue with status

---

## Acknowledgements

Built with [Supabase](https://supabase.com), [Solana](https://solana.com), and [Metaplex](https://metaplex.com).
