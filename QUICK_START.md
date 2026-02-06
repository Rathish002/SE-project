# Quick Start - Local Development

## First Time Only

```powershell
# 1. Clone repo
git clone https://github.com/Rathish002/SE-project.git
cd SE-project

# 2. Setup (get Firebase credentials from team lead)
.\setup-team-member.ps1

# Follow the prompts to add your .env.local
```

---

## Every Time You Want to Develop

```powershell
.\start-dev.ps1
```

That's it! The app opens automatically on `http://localhost:3000`

---

## Options

```powershell
# Fresh install (clears cache)
.\start-dev.ps1 -Fresh

# Show help
.\start-dev.ps1 -Help
```

---

## Troubleshooting

### .env.local missing
```powershell
.\setup-team-member.ps1
```

### Dependencies error
```powershell
.\start-dev.ps1 -Fresh
```

### Port 3000 already in use
Kill the existing process:
```powershell
Stop-Process -Name "node" -Force
.\start-dev.ps1
```

### Firebase errors
- Check `.env.local` has correct values
- Ask team lead for fresh credentials

---

## What the Script Does

✅ Checks Firebase credentials
✅ Installs npm packages (if needed)
✅ Starts React dev server on localhost:3000
✅ Opens your browser automatically

That's all you need for local testing!
