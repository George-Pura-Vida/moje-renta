# Moje renta – autentizace (PHP)

## Pozor před nasazením

Po aktualizaci se kalkulačka zobrazuje **až po přihlášení**. Na Webkitty musí fungovat PHP **8.1+**, rozšíření `PDO SQLite`, relace `session_start()`, Apache `.htaccess` a odesílání zpráv `mail()`. V jedné doméně aplikace poběží jen na PHP hostingu, nikoli na GitHub Pages.

Nasazujte jen do dokumentového kořene `moje-renta.jirijanousek.cz`. Po klonování z GitHubu zkontrolujte, že běží `index.php`, nikoli původní statický `index.html`. Pokud hostování neumí PHP nebo `.htaccess`, aplikaci nelze bezpečně zabezpečit tímto způsobem.

## Jak to funguje

- `index.php` vyžaduje ověřeného a povoleného uživatele a potom vykreslí `app.view.php`. Tento soubor je přímo nepřístupný.
- `account.php` nabízí registraci, přihlášení, ověření e-mailu, reset hesla, úpravu profilu a odhlášení.
- Ověřovací odkaz pro registraci platí 24 hodin; reset hesla platí 30 minut. Hesla jsou uložená jako jednosměrné hashe.
- `admin.php` umožní správci vidět účty, omezit přístup a odstranit účet. Správcem se stane jen ověřený účet s předem definovaným e-mailem v `auth/bootstrap.php`. Neexistuje žádné výchozí heslo.
- Jde o **samostatné účty Moje renta**, oddělené od Můj DIP. Uživatel se musí zaregistrovat znovu; hesla ani databáze se mezi weby nesdílejí.
- Účty se automaticky aktivují po ověření e-mailu, stejně jako aktuální Můj DIP; správce může přístup později omezit nebo zrušit.
- Databáze a tokeny jsou v privátním adresáři `var/moje-renta-accounts` **mimo Document Root**. Nikdy je nepřidávejte do GitHubu. Zálohujte je zabezpečeně a s přístupem jen pro provozovatele.
- Kalkulace jsou klientské, bez serverové synchronizace portfolia.

## Provozní kontrola

1. Ověřte, že u nepřihlášeného návštěvníka `/` a `/index.html` vedou na přihlášení; `/app.view.php` musí vracet 403.
2. Registrujte testovací účet, ověřte doručení e-mailu (včetně SPF/DKIM), ověření odkazem do 24 h a přesměrování do kalkulačky.
3. Otestujte neplatné heslo, reset hesla, odhlášení a vypršení session; přímý návrat zpět nesmí otevřít data po odhlášení.
4. Pod správcem otestujte blokaci a revokaci session.
5. Ověřte, že `/auth/bootstrap.php` nelze číst přímo, privátní databáze neleží pod Document Root a hosting má HTTPS certifikát.
6. Potvrďte politiku uchování údajů a právní informace. Přenos do produkce je podmíněn funkčním e-mailovým doručováním.

## Limitace

Samotné zdrojové kódy a modelové výpočty jsou z veřejného GitHubu nadále čitelné; přihlášení nefunguje jako DRM ani jako serverový trezor pro uživatelské modely. Uživatelé neposílají hesla do chatu.
