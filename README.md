# Moje renta

Samostatná statická webová aplikace pro web `https://moje-renta.jirijanousek.cz/`.

## Obsah

- `index.html` – responzivní kalkulačka diverzifikace portfolia, scénáře výnosů a inflace, vstupní poplatky, měsíční renta a doba čerpání.
- `CNAME` – informativní údaj o cílové doméně. Pro hosting Webkitty **není** GitHub Pages ani soubor CNAME potřeba, doménu přiřaďte v administraci hostingu.

## Nasazení na Webkitty

1. V technické zóně https://my.webkitty.eu/ otevřete hosting pro `jirijanousek.cz`.
2. Vytvořte subdoménu `moje-renta.jirijanousek.cz` a poznamenejte si její **kořenový adresář** (document root).
3. Otevřete **Web Files → Git Version Control**.
4. Klikněte **Create Repository → Clone a Repository** a vyplňte:
   - Clone URL: `https://github.com/George-Pura-Vida/moje-renta.git`
   - Repository Path: přesný kořenový adresář vytvořené subdomény (nikoli adresář hlavního webu).
   - Repository Name: `moje-renta`.
5. Vyberte deployment branch `main`, potvrďte **Update**.
6. Pro aktualizace z GitHubu použijte **Options → Manage → Deploy**.
7. Ověřte dostupnost HTTPS stránky včetně platného SSL certifikátu.

**Pozor:** Podle oficiálního návodu Webkitty musí být pro tento způsob propojení GitHub repozitář veřejný. Je-li soukromý, nejdříve prověřte, že neobsahuje citlivé údaje, a teprve potom změňte viditelnost v nastavení GitHubu. Soubory v tomto repozitáři nemají obsahovat hesla, privátní klíče ani osobní klientská data.

Oficiální návody:
- https://webkitty.cz/propojeni-github-s-hostingem/
- https://webkitty.cz/deploy-z-github/

## Model a upozornění

Všechny částky v korunách. Historické ceny kovů a Bitcoinu jsou přepočítány historickými průměrnými ročními kurzy USD/CZK pro orientační porovnání. Pro přesné ocenění konkrétního nákupu je potřebný denní kurz stejného dne. Výnosy nejsou zaručené; rentový model předpokládá konstantní roční výnos a nezahrnuje sekvenci tržních propadů, transakční náklady při čerpání ani daně.
