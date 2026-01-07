# Secret Management Guide

## 🔐 Why .env.local Stays on Your Computer

**`.env.local` contains ALL your sensitive secrets and credentials. It MUST NEVER be committed to git.**

### Security Reasons:

1. **Git History is Permanent**
   - Once committed, secrets are in git history forever
   - Even if you delete them later, they remain in git history
   - Anyone with access to the repository can see them

2. **Public Repository Risk**
   - If your repo is public, secrets are immediately exposed
   - Bots scan GitHub for exposed secrets
   - Your credentials could be stolen within minutes

3. **Team Collaboration**
   - Different team members may use different credentials
   - Production vs development environments need different secrets
   - Sharing secrets via git is insecure

4. **Compliance & Best Practices**
   - Industry standard: secrets never in version control
   - Required for security audits
   - Protects against accidental exposure

## 📁 File Structure

```
exam-manager/
├── .env.local          ← YOUR SECRETS (never commit)
├── .env.example        ← Template (safe to commit)
└── .gitignore          ← Protects .env.local
```

## ✅ What Goes in .env.local

**ALL sensitive information:**
- Database connection strings
- API keys and tokens
- Encryption keys
- Passwords
- SMTP credentials
- JWT secrets
- Any configuration with sensitive data

## ❌ What NEVER Goes in Code

**Never hardcode secrets in:**
- Source code files (`.ts`, `.js`, `.tsx`, `.jsx`)
- Configuration files (unless they're in `.gitignore`)
- Comments or documentation (unless using placeholders)
- Commit messages

## 🛡️ How .gitignore Protects You

The `.gitignore` file tells git to **ignore** `.env.local`:

```gitignore
.env.local          # This file is ignored
.env*.local         # All .env*.local files are ignored
```

**Result:**
- Git will never see `.env.local`
- It cannot be accidentally committed
- It won't appear in `git status`
- It's safe on your local machine only

## 📝 Setup Instructions

### 1. Create Your .env.local File

```bash
# Copy the example template
cp .env.example .env.local

# Or create it manually
touch .env.local
```

### 2. Add Your Secrets

Edit `.env.local` and replace ALL placeholder values:

```env
DATABASE_URL="file:./prisma/dev.db"
ENCRYPTION_KEY="your-actual-32-char-key-here"
JWT_SECRET="your-actual-jwt-secret-here"
# ... etc
```

### 3. Verify It's Ignored

```bash
# Check git status - .env.local should NOT appear
git status

# If it appears, check .gitignore
cat .gitignore | grep .env.local
```

## 🔑 Generating Secure Keys

### Encryption Key (32 bytes)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### JWT/Session Secret (64 bytes)
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚨 If You Accidentally Committed Secrets

**If you accidentally committed `.env.local`:**

1. **Immediately rotate all secrets** (change passwords, regenerate keys)
2. **Remove from git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** (coordinate with team first!)
4. **Consider the secrets compromised** - change them all

## 📋 Environment Variables Used in This Project

### Required Variables:
- `DATABASE_URL` - Database connection string
- `ENCRYPTION_KEY` - AES-256 encryption key
- `JWT_SECRET` - JWT token signing secret
- `SESSION_SECRET` - Session encryption secret

### Email Configuration:
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username/email
- `SMTP_PASSWORD` - SMTP password/app password
- `SMTP_FROM` - From email address

### Application:
- `NEXT_PUBLIC_APP_URL` - Public application URL
- `NODE_ENV` - Environment (development/production)

## 🔄 Sharing Secrets with Team

**Never share via:**
- ❌ Git commits
- ❌ Email
- ❌ Chat messages
- ❌ Screenshots

**Use secure methods:**
- ✅ Password managers (1Password, LastPass, Bitwarden)
- ✅ Encrypted sharing (Keybase, Signal)
- ✅ Secret management tools (Vault, AWS Secrets Manager)
- ✅ Secure team documentation (with access controls)

## 🌐 Production Deployment

For production (Vercel, AWS, etc.):

1. **Set environment variables in the platform's dashboard**
2. **Never commit production secrets to git**
3. **Use different secrets for each environment**
4. **Rotate secrets regularly**

### Vercel Example:
```bash
vercel env add DATABASE_URL
vercel env add ENCRYPTION_KEY
# ... etc
```

## ✅ Checklist

- [ ] `.env.local` exists in project root
- [ ] All placeholder values replaced with real secrets
- [ ] `.env.local` is in `.gitignore`
- [ ] Verified `git status` doesn't show `.env.local`
- [ ] Generated secure random keys (not predictable values)
- [ ] Team members have their own `.env.local` files
- [ ] Production secrets are set in deployment platform
- [ ] Never committed secrets to git

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [OWASP Secret Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

**Remember: If it's a secret, it goes in `.env.local` and NOWHERE ELSE!** 🔐
