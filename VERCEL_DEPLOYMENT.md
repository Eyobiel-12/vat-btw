# Vercel Deployment Guide

## 🚀 Deployment naar Vercel

### Stap 1: Voorbereiding

1. **Zorg dat je code gepusht is naar GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Verifieer dat de build werkt lokaal**
   ```bash
   pnpm build
   ```

### Stap 2: Vercel Project Aanmaken

1. Ga naar [vercel.com](https://vercel.com)
2. Log in met je GitHub/GitLab/Bitbucket account
3. Klik op "Add New Project"
4. Selecteer je repository
5. Configureer het project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `pnpm build` (of `npm run build`)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `pnpm install` (of `npm install`)

### Stap 3: Environment Variables Instellen

In Vercel Dashboard → Project Settings → Environment Variables, voeg toe:

#### Verplicht:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Optioneel:
```
POSTGRES_URL=your_postgres_connection_string
POSTGRES_URL_NON_POOLING=your_postgres_connection_string_non_pooling
```

**Belangrijk:**
- Zet deze variabelen voor **alle environments** (Production, Preview, Development)
- Gebruik dezelfde waarden als in je `.env.local` bestand
- Klik op "Save" na het toevoegen van elke variabele

### Stap 4: Deploy

1. Klik op "Deploy" in Vercel
2. Wacht tot de build klaar is
3. Je krijgt een URL zoals: `https://your-project.vercel.app`

### Stap 5: Database Setup

Na de eerste deployment:

1. **Open Supabase SQL Editor**
   - Ga naar: https://supabase.com/dashboard/project/_/sql/new
   
2. **Run de setup script**
   - Kopieer de inhoud van `scripts/setup.sql`
   - Plak in SQL Editor
   - Klik "Run"

3. **Verifieer de setup**
   - Ga naar je Vercel deployment URL
   - Log in
   - Controleer of alles werkt

### Stap 6: Custom Domain (Optioneel)

1. In Vercel Dashboard → Settings → Domains
2. Voeg je custom domain toe
3. Volg de DNS instructies
4. Wacht op SSL certificaat (automatisch)

## 🔧 Troubleshooting

### Build Fails

**Probleem**: Build faalt met environment variable errors
**Oplossing**: 
- Controleer of alle environment variables zijn ingesteld in Vercel
- Zorg dat `NEXT_PUBLIC_*` variabelen correct zijn

**Probleem**: Build faalt met module not found
**Oplossing**:
- Verifieer dat `package.json` alle dependencies bevat
- Run `pnpm install` lokaal om te testen

### Runtime Errors

**Probleem**: "Could not find table in schema cache"
**Oplossing**:
- Run de database setup script in Supabase SQL Editor
- Wacht 1-2 minuten en refresh de pagina

**Probleem**: Authentication werkt niet
**Oplossing**:
- Controleer Supabase URL en keys in Vercel environment variables
- Verifieer Supabase Auth settings (redirect URLs)

## 📝 Post-Deployment Checklist

- [ ] Environment variables ingesteld
- [ ] Database setup script uitgevoerd
- [ ] Login functionaliteit getest
- [ ] Client import functionaliteit getest
- [ ] Dark mode werkt correct
- [ ] Alle pagina's laden zonder errors
- [ ] Mobile responsive design werkt
- [ ] Analytics werkt (als geconfigureerd)

## 🎨 Features na Deployment

✅ **Dark/Light Mode**: Volledig geïmplementeerd met system preference support
✅ **Client Import**: Bulk import van klanten via Excel
✅ **Responsive Design**: Werkt op alle devices
✅ **Error Handling**: Duidelijke foutmeldingen
✅ **Loading States**: Skeleton loaders voor betere UX

## 🔐 Security Notes

- **Nooit** commit `.env.local` naar Git
- Gebruik Vercel Environment Variables voor secrets
- `SUPABASE_SERVICE_ROLE_KEY` is gevoelig - bewaar veilig
- Enable RLS (Row Level Security) in Supabase voor data security

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

