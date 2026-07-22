# 🔑 Credentials Setup Guide

This project needs a few credentials to run with all features. **You never paste them to me or into code** — you put them in a local `.env` file (which is git-ignored and never committed). Here's exactly what's needed, whether it's required, and how to get each one.

> ✅ **The app runs immediately with only 1 required credential** (a MongoDB connection). Everything else is optional and only unlocks extra features (email, SMS).

---

## How to provide credentials

1. Go to the `backend/` folder.
2. Copy `.env.example` to a new file named `.env`:
   ```bash
   cd backend
   cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
   ```
3. Open `.env` in a text editor and fill in the values below.
4. Save. That's it — the backend reads `.env` automatically on startup.

The frontend has its own `frontend/.env` (copy from `frontend/.env.example`), but its default value works out of the box for local dev.

---

## 1. MongoDB — **REQUIRED**

The database. Two options:

### Option A — Local MongoDB (no signup)
Install MongoDB Community Edition, then use:
```
MONGODB_URI=mongodb://localhost:27017/stayease
```
(If you use Docker: `docker compose up` already includes MongoDB — nothing to do.)

### Option B — MongoDB Atlas (free cloud DB, recommended for deployment)
1. Sign up at **https://www.mongodb.com/cloud/atlas/register**
2. Create a **free M0 cluster**.
3. **Database Access** → Add a database user (username + password) — remember these.
4. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere) for testing.
5. Click **Connect → Drivers** and copy the connection string. It looks like:
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/stayease?retryWrites=true&w=majority
   ```
   Replace `<user>` and `<password>` with the ones from step 3.

---

## 2. JWT Secret — **REQUIRED**

Used to sign login tokens. Just needs to be a long random string (≥ 64 characters). Generate one:

```bash
openssl rand -base64 64
# or
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Paste the result:
```
JWT_SECRET=the-long-random-string-you-just-generated
```

---

## 3. Email / SMTP — *Optional* (for email notifications)

Leave `MAIL_ENABLED=false` to skip. To enable (example with **Gmail**):

1. Turn on **2-Step Verification** on your Google account.
2. Go to **https://myaccount.google.com/apppasswords** and create an **App Password**.
3. Fill in:
   ```
   MAIL_ENABLED=true
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=the-16-char-app-password
   MAIL_FROM=your-email@gmail.com
   ```

> When disabled, emails are printed to the backend console instead — useful for testing password-reset tokens.

---

## 4. Twilio SMS — *Optional* (for SMS notifications)

Leave `TWILIO_ENABLED=false` to skip. To enable:

1. Sign up at **https://www.twilio.com/try-twilio** (free trial with credit).
2. From the **Twilio Console dashboard**, copy your **Account SID** and **Auth Token**.
3. Get a Twilio phone number: **Phone Numbers → Buy a number** (trial gives you one).
4. Fill in:
   ```
   TWILIO_ENABLED=true
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_FROM_NUMBER=+1XXXXXXXXXX
   ```

> On a Twilio trial you can only send SMS to **verified** numbers. When disabled, SMS messages are printed to the console.

---

## 5. GitHub — for pushing the code (see below)

To push this project to GitHub you'll authenticate with either:
- **HTTPS + Personal Access Token (PAT):** create at **https://github.com/settings/tokens** (classic, scope `repo`). Git will prompt for username + the token as password.
- **SSH key:** guide at **https://docs.github.com/en/authentication/connecting-to-github-with-ssh**.

---

## 6. Deployment platform secrets

When deploying, you'll set the same variables (`MONGODB_URI`, `JWT_SECRET`, etc.) in the hosting dashboard rather than a `.env` file:
- **Render:** service → *Environment* tab → Add Environment Variable.
- **Railway:** project → *Variables* tab.
- **Vercel/Netlify (frontend):** set `VITE_API_BASE_URL` to your deployed backend URL + `/api`.

See [`DEPLOYMENT.md`](./DEPLOYMENT.md).

---

## ✅ Minimum to get running right now

```env
MONGODB_URI=mongodb://localhost:27017/stayease
JWT_SECRET=any-long-random-64-plus-character-string-you-like
```
Everything else can stay as the defaults in `.env.example`.
