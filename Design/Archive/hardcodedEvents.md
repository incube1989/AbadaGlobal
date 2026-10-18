# Hardcoded Events — normalized seed data

Normalized version of the original raw event list.

## Conventions

- Dates: `YYYY-MM-DD`, inclusive ranges. `TBD` where the source gives no exact dates.
- Places: standardized English names.
- `Type` uses the vocabulary from `calendar.md`: competition | festival | batizado | camp | coach only.
- `Scope` uses the vocabulary from `calendar.md`: world | Russia | region | local.
- Values marked with an asterisk (*) are **inferred** from context and must be
  confirmed before the data is used as a seed.

## Changes made vs. the original

- Fixed year attribution: Zumbimba was listed under the 2026 header but dated
  November 2027 — moved to 2027.
- Portuguese month names converted to ISO dates (`Out` → October, `Dez` →
  December, `Fevereiro` → February, `Março` → March, `Abril` → April,
  `Maio` → May, `Junho` → June, `Julho` → July, `Agosto` → August).
- City names standardized: Voronej → Voronezh, São Petersburgo → Saint
  Petersburg, Ecaterimburgo → Yekaterinburg, Região de Moscou / Подмосковье →
  Moscow Region.
- "CapoWeeked" → "CapoWeekend".
- Added `Type` / `Scope` columns; values not present in the source are marked
  with * or TBD.
- Review corrections applied: Festival Cultural → Saint Petersburg; Zumbimba →
  full month of November, Rio de Janeiro.

## 2026

| Start | End | Place | Event | Type | Scope |
| ----- | --- | ----- | ----- | ---- | ----- |
| 2026-10-23 | 2026-10-25 | Samara | Capoeira na Beira do Volga | festival * | local * |
| 2026-12-04 | 2026-12-06 | Voronezh | Competition | competition | Russia * |
| 2026-12-11 | 2026-12-13 | Saint Petersburg | Competition (Grds Magrinha, Soldado e equipe) | competition | Russia * |
| 2026-12-19 | 2026-12-20 | Saint Petersburg | Festival Cultural (Prof. Tuka e equipe) | festival | TBD |

Notes:

- "Capoeira na Beira do Volga": the raw entry says only "Out Samara". Type/scope
  inferred from the event name — confirm.
- Festival Cultural place confirmed by team: Saint Petersburg.

## 2027

| Start | End | Place | Event | Type | Scope |
| ----- | --- | ----- | ----- | ---- | ----- |
| 2027-02-20 | 2027-02-22 | Samara | Open competition | competition | Russia * |
| 2027-03-12 | 2027-03-14 | Moscow Region | Batizado Integrado | batizado | region * |
| 2027-03-25 | 2027-03-29 | Luxembourg | Jogos Europeus (European Games) | competition | world |
| 2027-04-02 | 2027-04-04 | Saint Petersburg | Batizado (Grds Magrinha, Soldado e equipe) | batizado | region * |
| 2027-04-23 | 2027-04-25 | Voronezh | Batizado | batizado | region * |
| 2027-04-30 | 2027-05-02 | Saint Petersburg | Batizado (Prof. Tuka e equipe) | batizado | region * |
| 2027-05-14 | 2027-05-16 | Samara | Batizado | batizado | region * |
| 2027-05-28 | 2027-05-30 | Yekaterinburg | Batizado | batizado | region * |
| 2027-06-05 | 2027-06-06 | Moscow | Competition | competition | Russia * |
| 2027-11-01 | 2027-11-30 | Rio de Janeiro | Zumbimba | batizado * | world * |

Notes:

- Zumbimba runs for the whole month of November every year, in Rio de Janeiro.

### Camps and CapoWeekends (2027)

| Start | End | Place | Event | Type | Scope |
| ----- | --- | ----- | ----- | ---- | ----- |
| 2027-06-24 | 2027-06-27 | Moscow Region | CapoWeekend 14+ and adults (Prof. Falcão, Grds Narrador e Cegonha) | camp | region * |
| 2027-07-10 | 2027-07-24 | TBD | Kids camp 7–13 y.o. (Prof. Falcão, Grds Narrador, Cegonha) | camp | region * |
| 2027-08 | TBD | TBD | Jogos Mundiais (World Games 2027) | competition | world |

Notes:

- Kids camp place is not stated; the CapoWeekend line above says Moscow Region
  (Podmoskovye) — confirm whether the kids' camp is at the same venue.
- World Games 2027: month-level date only (August) — confirm exact dates and city.