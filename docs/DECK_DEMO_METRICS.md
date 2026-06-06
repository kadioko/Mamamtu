# Deck Demo Metrics

Use these exact demo-environment numbers in the pitch deck:

| Metric | Value | Deck caption |
| --- | ---: | --- |
| Mothers Registered | 48 | Demo environment data |
| ANC Visits Recorded | 124 | Demo environment data |
| Follow-Ups Scheduled | 31 | Demo environment data |
| Active Pregnancies | 22 | Demo environment data |

Definitions:

- Mothers Registered: active female patient records.
- ANC Visits Recorded: all antenatal visit records.
- Follow-Ups Scheduled: future scheduled or confirmed appointments with type `FOLLOW_UP`.
- Active Pregnancies: pregnancy episodes with status `ACTIVE`.

Refresh the demo database before recording or presenting:

```bash
npm run seed:deck-demo
```

The script removes only prior `DECK-DEMO-*` records that it created, then tops up the current demo environment to the target numbers without deleting existing non-deck clinical records.

Connected demo data seeded for click-throughs:

| Area | Seeded connection |
| --- | --- |
| Medical Records | Deck-demo mothers have recent clinical records with diagnoses, treatments, facilities, and some attachments. |
| Vitals | Those medical records include vitals JSON, so `/dashboard/vitals` shows real BP, pulse, temperature, oxygen, and weight values. |
| Newborns | Ten newborn records are linked back to deck-demo mother records and pregnancy episodes. |
| Immunizations | Newborn records include BCG, OPV, and Hepatitis B immunizations with next due dates. |
| Reports | Reports aggregate the same pregnancy, newborn, immunization, appointment, and clinical-record data. The admin export history also includes deck-demo export rows. |

After the latest refresh, the connected deck records were:

| Connected dataset | Count |
| --- | ---: |
| Deck medical records | 41 |
| Deck records with vitals | 41 |
| Deck newborn records | 10 |
| Deck immunizations | 24 |
| Deck immunizations due soon | 20 |
| Deck export history rows | 3 |
