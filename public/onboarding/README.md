# Onboarding walkthrough screenshots

Drop the "how a day works" walkthrough screenshots in this folder using the
exact filenames below. They render, in order, inside the **Ready for Launch**
module → "How a day works — a quick walkthrough" (principle `launch_p7`).

Until a file is present, the app shows a labeled "Screenshot coming soon"
placeholder in its slot (so nothing looks broken).

| Order | Filename                     | What it should show                                                                 |
|-------|------------------------------|-------------------------------------------------------------------------------------|
| 1     | `01-open-day.png`            | Opening the day and reading the principle / daily training.                         |
| 2     | `02-analyze-property.png`    | Analyzing a property and recording it with the CDS calculator (counts toward minimum). |
| 3     | `03-add-crm-contacts.png`    | Adding agents/lenders/wholesalers/owners to the CRM and setting follow-ups.          |
| 4     | `04-log-and-complete.png`    | Logging offers and contacts to complete the day and unlock the next one.            |

Notes:
- These are served from the site root, so `01-open-day.png` here is referenced as `/onboarding/01-open-day.png`.
- PNG or JPG both work; keep the same filename (including the `.png` extension the code references) or update the `screenshots` array in `src/data/trainingModules.js` (`launch_p7`) to match.
- To add more steps, drop another image here and add an entry to that same `screenshots` array.
