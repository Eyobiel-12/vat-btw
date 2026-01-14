# BTW Assist - Nederlandse BTW Automatisering

Een professionele webapplicatie voor Nederlandse boekhouders om BTW-aangiftes te beheren, grootboekrekeningen te organiseren en klantenadministratie te automatiseren.

## 🚀 Features

- **Klantenbeheer**: Volledig klantenbeheersysteem met bulk import functionaliteit
- **Grootboek Schema**: Beheer van grootboekrekeningen met BTW-codes
- **Boekingsregels**: Transactiebeheer met handmatige invoer en Excel import
- **BTW Berekening**: Automatische BTW-berekening per kwartaal/maand/jaar
- **Excel Import/Export**: Import en export van data in Excel formaat
- **OCR Functionaliteit**: Automatische factuurverwerking met OCR
- **Dark Mode**: Volledige dark/light mode ondersteuning
- **Responsive Design**: Werkt perfect op desktop, tablet en mobiel

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Shadcn UI
- **Excel Processing**: xlsx
- **OCR**: Tesseract.js

## 📋 Vereisten

- Node.js 18+ 
- pnpm (of npm/yarn)
- Supabase account

## 🔧 Installatie

1. **Clone de repository**
   ```bash
   git clone https://github.com/Eyobiel-12/vat-btw.git
   cd vat-btw
   ```

2. **Installeer dependencies**
   ```bash
   pnpm install
   ```

3. **Configureer environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Vul in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Je Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Je Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Je Supabase service role key

4. **Setup database**
   - Open Supabase SQL Editor
   - Kopieer en run `scripts/setup.sql`

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📦 Deployment naar Vercel

Zie [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) voor gedetailleerde instructies.

**Quick steps:**
1. Push code naar GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

## 📖 Documentatie

- [Complete Workflow](./COMPLETE_WORKFLOW.md) - Volledige workflow uitleg
- [Hoe Werkt Het](./HOE_WERKT_HET.md) - Systeem uitleg
- [Excel Import Guide](./EXCEL_IMPORT_GUIDE.md) - Excel import instructies
- [Vercel Deployment](./VERCEL_DEPLOYMENT.md) - Deployment guide

## 🎯 Gebruik

### Klanten Toevoegen

1. **Handmatig**: Dashboard → "Nieuwe Klant"
2. **Bulk Import**: Dashboard → "Importeer Klanten" → Upload Excel bestand

### Data Uploaden

1. Ga naar klant detail pagina
2. Klik op "Upload Data"
3. Kies upload type:
   - **Grootboek Schema**: Upload grootboekrekeningen
   - **Boekingsregels**: Upload transacties
   - **Facturen**: Upload facturen voor OCR verwerking

### BTW Aangifte Maken

1. Ga naar klant detail pagina
2. Klik op "BTW Aangifte" tab
3. Selecteer periode (kwartaal/maand/jaar)
4. Bekijk automatische berekening
5. Exporteer naar Excel of markeer als "Definitief"

## 🔐 Security

- Row Level Security (RLS) enabled in Supabase
- Environment variables voor sensitive data
- Server-side validation voor alle inputs

## 📝 License

Dit project is privé eigendom.

## 👥 Contributing

Dit is een privé project. Voor vragen of suggesties, neem contact op.

## 🆘 Support

Voor problemen of vragen:
1. Check de documentatie bestanden
2. Controleer database setup
3. Verifieer environment variables

---

**Gemaakt met ❤️ voor Nederlandse boekhouders**
