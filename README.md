# Firebase Tracker App

Et lite Firebase-basert tracker-prosjekt for filmer, TV-serier, biler, bøker og delt oversikt.

## Struktur

```text
firebas-app/
  firebase.json
  .firebaserc
  .gitignore
  src/
    index.html
    app.html
    movies.html
    tvshows.html
    cars.html
    books.html
    share.html
    app.js
    auth.js
    share.js
    style.css
    service-worker.js
    ...
```

## Viktig

- Firebase Hosting peker til `src/` via `firebase.json`.
- `index.html` brukes til innlogging.
- `app.html` er dashboardet.
- De andre HTML-filene er egne sider for hver seksjon.
- `share.html` brukes til deling av oversikt.

## GitHub

Denne mappen er laget for å kunne brukes som eget GitHub-repo.

Typiske steg etterpå:

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <din-github-url>
git push -u origin main
```

## Firebase deploy

```bash
firebase deploy
```
