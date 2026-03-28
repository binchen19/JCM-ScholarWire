# JCM ScholarWire

A research tracker for journalism, communication, and media scholars. Auto-collects newly published articles from top journals and tracks conference deadlines and calls for papers.

**Live site:** [jcm-scholarwire.vercel.app](https://jcm-scholarwire.vercel.app) *(update with your actual URL)*

## Features

- **Article Feed** — Automatically fetches recent publications from 8 target journals via the [OpenAlex API](https://openalex.org/) (free, no key required). Search by title, author, or topic. Filter by journal and time range.
- **Journal Management** — Add or remove journals using their ISSN. Supports both print and online ISSNs for maximum coverage.
- **Conference Tracker** — Pre-loaded with 9 major conferences (ICA, AEJMC, NCA, APSA, MPSA, ICWSM, IC2S2, SM+Society, IJPP) including submission deadlines, dates, and locations. Add your own conferences anytime.
- **CFP Tracker** — Manually track special issue calls, workshop CFPs, fellowships, and other submission opportunities with deadlines.

## Default Journals

| Journal | Publisher |
|---|---|
| Journal of Communication | Oxford University Press |
| Political Communication | Taylor & Francis |
| International Journal of Press/Politics | SAGE |
| Digital Journalism | Taylor & Francis |
| New Media & Society | SAGE |
| Information, Communication & Society | Taylor & Francis |
| Journal of Computer-Mediated Communication | Oxford University Press |
| Social Media + Society | SAGE |

## Tech Stack

- **Frontend:** React + Vite
- **Data:** OpenAlex API (free, open-access scholarly metadata)
- **Hosting:** Vercel (free tier)
- **Storage:** Browser localStorage (your data stays on your device)

## Getting Started
```bash
git clone https://github.com/binchen19/JCM-ScholarWire.git
cd JCM-ScholarWire
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Updating Conference Data

Conference dates and CFP deadlines are hardcoded in `src/App.jsx` under `DEFAULT_CONFERENCES`. Update this array once per year with new dates, locations, and submission deadlines.

## Author

**Bin Chen**
Assistant Professor, School of Future Media
The University of Hong Kong
[binchen19.github.io](https://binchen19.github.io/)

## License

MIT

A research tracker for journalism, communication, and media scholars. Auto-collects newly published articles from top journals and tracks conference deadlines and calls for papers.

**Live site:** [jcm-scholarwire.vercel.app](https://jcm-scholarwire.vercel.app) *(update with your actual URL)*

## Features

- **Article Feed** — Automatically fetches recent publications from 8 target journals via the [OpenAlex API](https://openalex.org/) (free, no key required). Search by title, author, or topic. Filter by journal and time range.
- **Journal Management** — Add or remove journals using their ISSN. Supports both print and online ISSNs for maximum coverage.
- **Conference Tracker** — Pre-loaded with 9 major conferences (ICA, AEJMC, NCA, APSA, MPSA, ICWSM, IC2S2, SM+Society, IJPP) including submission deadlines, dates, and locations. Add your own conferences anytime.
- **CFP Tracker** — Manually track special issue calls, workshop CFPs, fellowships, and other submission opportunities with deadlines.

## Default Journals

| Journal | Publisher |
|---|---|
| Journal of Communication | Oxford University Press |
| Political Communication | Taylor & Francis |
| International Journal of Press/Politics | SAGE |
| Digital Journalism | Taylor & Francis |
| New Media & Society | SAGE |
| Information, Communication & Society | Taylor & Francis |
| Journal of Computer-Mediated Communication | Oxford University Press |
| Social Media + Society | SAGE |

## Tech Stack

- **Frontend:** React + Vite
- **Data:** OpenAlex API (free, open-access scholarly metadata)
- **Hosting:** Vercel (free tier)
- **Storage:** Browser localStorage (your data stays on your device)

## Getting Started
```bash
git clone https://github.com/binchen19/JCM-ScholarWire.git
cd JCM-ScholarWire
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Updating Conference Data

Conference dates and CFP deadlines are hardcoded in `src/App.jsx` under `DEFAULT_CONFERENCES`. Update this array once per year with new dates, locations, and submission deadlines.

## Author

**Bin Chen**
Assistant Professor, Journalism and Media Studies
The University of Hong Kong
[binchen19.github.io](https://binchen19.github.io/)

## License

MIT
