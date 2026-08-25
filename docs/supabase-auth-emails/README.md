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
| **Redirect URLs** | `https://hemvanda.se/auth/confirm`, `https://hemvanda.se/**`, `http://localhost:3000/auth/confirm` |
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

- `{{ .ConfirmationURL }}` – klickbar verifieringslänk
- `{{ .Token }}` – 6-siffrig engångskod (bra om länken förbrukas av e-postfilter)
- `{{ .Email }}` – mottagarens e-post
- `{{ .Data.full_name }}` – namn från `user_metadata` (sätts vid kundkonto)

## Tips

- **Länken går ut?** Magic Link-mallen inkluderar både knapp och kod. Vissa företagsmejl skannar länkar i förväg – då fungerar koden bättre.
- **Testa** med en riktig inkorg efter att SMTP och mallar sparats.
- Mallarna använder samma färger som webbplatsen: grön `#2f3a33`, guld `#c9a46a`, bakgrund `#f8f5ef`.
