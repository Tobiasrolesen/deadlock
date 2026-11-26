---
sessionId: session-261126-095033-117j
---

# Requirements

### Mål
Gør de dele af `src/public/index.html`, der repræsenterer konkrete side- eller indholdssektioner, mere semantiske end generiske `div`-elementer.

### Afgrænsning
- Bevar sidens udseende, tekst, `id`-værdier, CSS-klasser og JavaScript-adfærd.
- Brug semantiske HTML-elementer dér, hvor indholdets rolle gør valget klart; behold `div` til rene layoutgrupper og `details-list`-rækker, hvor den allerede bruges som gruppering.
- Dette er et forslag til godkendelse. Ingen implementering foretages, før ændringen er godkendt.

# Technical Design

### Nuværende struktur
`src/public/index.html` har allerede semantiske hovedområder som `header`, `nav`, `main`, `section`, `article`, `aside` og `dialog`. Nogle navngivne indholdsoverskrifter (`.section-heading`, `.panel-heading`, `.match-history-dialog-heading` og `.banner-copy`) er stadig `div`-elementer. Den dynamiske profil er indrammet af `div#profile-content`. CSS målretter de relevante klasser, og `src/test/frontend.test.js` kontrollerer sidens IDs og frontend-assets.

### Foreslået ændring
- Brug `header` for wrappers, der fungerer som overskrift/intro for en side-, panel- eller dialogsektion; behold deres eksisterende klasser.
- Brug en navngivet `section` for `#profile-content`, der samler den valgte spillers profilindhold.
- Behold ID'er og klasser uændrede, så `src/public/public.js` og CSS fortsat finder de samme elementer og bevarer layoutet.
- Lad rene layout-wrappers og `div`-grupperingerne inde i beskrivelseslister blive, hvor et andet HTML-element ikke giver tydeligere semantik.

# Testing

### Validering
- Opdatér eller tilføj en regressionstest i `src/test/frontend.test.js`, der kontrollerer de valgte semantiske elementer og fortsat bekræfter nødvendige element-ID'er.
- Kør frontend-testene og kontrollér, at CSS-klasser, HTML-ID'er og eksisterende funktionalitet fortsat er til stede.

# Delivery Steps

### ✓ Step 1: Semantisér indholdsoverskrifterne i index.html
Indholdsoverskrifter og introduktioner bruger passende semantiske `header`-elementer.
- Erstat `div`-wrappers for `.section-heading`, `.panel-heading`, `.match-history-dialog-heading` og `.banner-copy` med `header` i `src/public/index.html`.
- Bevar samtlige klasser, IDs, indhold og knapper, så layout og JavaScript-hooks ikke ændres.

### ✓ Step 2: Gør spillerprofilens container semantisk og verificér ændringen
Den dynamiske profil er markeret som en navngiven sektion, og de relevante frontend-tests bekræfter den semantiske struktur.
- Erstat `div#profile-content` med en `section` med et tilgængeligt navn i `src/public/index.html`.
- Behold layout-only `div`-elementer og beskrivelseslistens grupperinger, hvor de fortsat er passende.
- Opdatér og kør frontend-testene i `src/test/frontend.test.js` for at kontrollere semantikken samt bevarede ID'er og CSS-klasser.