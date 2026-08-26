# HemVända – Supabase auth-e-postmallar

Branded HTML-mallar för Supabase Auth. Kopiera **ämnesrad** och **HTML-innehåll** till respektive mall i Supabase Dashboard.

## Var du klistrar in

1. Öppna [Supabase Dashboard](https://supabase.com/dashboard) → ditt projekt
2. **Authentication** → **Email Templates**
3. Välj mall (t.ex. *Magic Link*)
4. Klistra in **Subject** och **Body** från tabellen nedan
5. Spara

För säkerhetsmejl: **Authentication** → **Email Templates** → fliken **Security notifications** (aktivera de du vill skicka).

## Rekommenderade inställningar

| Inställning | Värde |
|-------------|--------|
| **Site URL** | `https://hemvanda.se` |
| **Redirect URLs** | `https://hemvanda.se/auth/confirm`, `https://hemvanda.se/auth/bekrafta`, `https://hemvanda.se/**`, `http://localhost:3000/auth/confirm`, `http://localhost:3000/auth/bekrafta` |
| **Custom SMTP** | Resend (samma avsändare som övriga mejl, t.ex. `HemVända <noreply@hemvanda.se>`) |

Med Resend som SMTP i Supabase (**Project Settings → Authentication → SMTP**) kommer auth-mejl från samma domän som bokningsbekräftelser.

## Mallar (prioritet)

| Mall i Supabase | Fil | Ämnesrad |
|-----------------|-----|----------|
| **Magic Link** ⭐ | [magic-link.html](./magic-link.html) | `Din inloggningslänk – HemVända` |
| Confirm signup | [confirm-signup.html](./confirm-signup.html) | `Bekräfta din e-post – HemVända` |
| Invite user | [invite-user.html](./invite-user.html) | `Du är inbjuden till HemVända` |
| Reset password | [reset-password.html](./reset-password.html) | `Återställ ditt lösenord – HemVända` |
| Change email address | [change-email.html](./change-email.html) | `Bekräfta ny e-postadress – HemVända` |
| Reauthentication | [reauthentication.html](./reauthentication.html) | `Din verifieringskod – HemVända` |

⭐ **Magic Link** används idag för kundinloggning (`/logga-in` → Mitt HemVända).

## Säkerhetsnotiser (valfritt)

| Mall | Fil | Ämnesrad |
|------|-----|----------|
| Password changed | [security-password-changed.html](./security-password-changed.html) | `Ditt lösenord har ändrats – HemVända` |
| Email address changed | [security-email-changed.html](./security-email-changed.html) | `Din e-postadress har ändrats – HemVända` |

## Variabler som används

Supabase fyller i automatiskt:

- `{{ .SiteURL }}` – t.ex. `https://hemvanda.se` (Authentication → URL Configuration)
- `{{ .TokenHash }}` – används i egna länkar till `/auth/bekrafta` (server-side verify)
- `{{ .Token }}` – 6-siffrig engångskod (reserv om länken strular)
- `{{ .Email }}` – mottagarens e-post
- `{{ .Data.full_name }}` – namn från `user_metadata` (sätts vid kundkonto)

## Tips

- **Magic Link / Reset** pekar till `/auth/bekrafta` med `token_hash`, inte `{{ .ConfirmationURL }}`. Då förbrukas inte OTP av e-postskanners, och session-cookien sätts på servern.
- **Efter mallbyte:** spara Magic Link + Reset password i dashboarden igen, annars fortsätter gamla ConfirmationURL-länkar.
- **Testa** med en riktig inkorg efter att SMTP och mallar sparats.
- Mallarna använder samma färger som webbplatsen: grön `#2f3a33`, guld `#c9a46a`, bakgrund `#f8f5ef`.
