# VA — three-language presentation site · test build · 2026-10-25

SOURCE: site-081125-main.zip + user-confirmed updated Ukrainian home page.

## Deliverables
- `site/`: complete isolated test copy, including untouched original business logic, admin, data and Ukrainian images.
- `patch/`: files to ADD or REPLACE in GitHub after acceptance. Do not deploy before review.
- New public information pages `/en/` and `/ru/`: homepage, platform overview, 14 module pages, about and contacts.
- Ukrainian presentation URLs, booking URLs, datasets and image paths remain unchanged.
- Localized PNG illustrations: `/images/platform/en/VA-site2.png`, `/images/platform/ru/VA-site2.png`, plus `/images/platform/en/va-system-map.png`, `/images/platform/ru/va-system-map.png`. All contain separately typeset RU/EN text. Original Ukrainian PNGs are untouched.
- A `UA/RU/EN` menu is inserted in the existing site's presentation header by `/scripts/va-lang-switch.js`.
- The previously approved Ukrainian six audiences and three usage options are included in `index.html`.

## Scope disclosure
EN/RU **marketing presentation adaptations** preserve the content and purpose of each original module but are intentionally more concise than long Ukrainian technical descriptions. They are not yet a line-by-line legal/technical translation.
Original screenshots inside the module articles depict the running Ukrainian interface. Their embedded labels are NOT translated.
DEMO links still open the original Ukrainian application; this is marked on the translated pages. Payment, checkout, admin and legal policies are NOT localized and are not presented as ready for international commercial use.

## Test locally
1. Unpack complete `site` folder to a local directory.
2. In that folder run: `python -m http.server 8000`
3. Open `http://localhost:8000/`, `/en/`, `/ru/`, `/platform/`, `/en/platform/`, `/ru/platform/`.
4. Use UA/RU/EN controls and check same-page module transitions.
5. Demo, legal pages and payment processing are NOT part of international readiness.

## Publication
Do not upload this entire testing copy as an overwrite of live production. Use the `patch` folder only after testing it against the live GitHub branch, and keep a backup commit.
The UA index.html is changed to include the already-approved third support model and restaurant reservation audience item. Existing SVG/PNG paths under `/images/` are unchanged.
