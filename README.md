# EMSI — Activité Pratique N°3 – Angular Framework

Application client/serveur de catalogue de produits : frontend Angular 19 et backend Spring Boot REST.

> Intitulé de travail : « Angular Framework ». Les formulations exactes du support Classroom non consultables ici ne sont pas affirmées comme titre officiel.

**Dépôt GitHub cible :** `emsi-tp03-angular-framework`

---

## Description technique

Projet universitaire **indépendant** de TP02 Microservices. Architecture classique navigateur ↔ API REST :

- Frontend Angular 19 Standalone (port 4200)
- Backend Spring Boot 3.3.5 + JPA + H2 (port 8083)
- Bootstrap 5 et Bootstrap Icons

## Objectif pédagogique

- Architecture Standalone Angular (sans NgModule)
- Routing (`RouterLink`, `RouterOutlet`)
- Syntaxe moderne `@if` / `@for` / `@else`
- Services et injection de dépendances
- HttpClient + Observables RxJS
- API REST Spring Boot et CORS
- CRUD partiel : GET, POST, PATCH selected, DELETE
- Filtrage côté Angular
- Validation minimale des données

## Technologies

| Composant | Version |
|-----------|---------|
| Angular | 19.2.25 |
| Angular CLI | 19.2.27 |
| TypeScript | 5.7.3 |
| Bootstrap | 5.3.9 |
| Bootstrap Icons | 1.13.2 |
| Spring Boot | 3.3.5 |
| Java | 17 |
| Maven | 3.9.x (recommandé) |
| H2 | en mémoire |

Versions vérifiées dans `inset-app/package.json` et `product-backend/pom.xml`.

## Fonctionnalités

- Accueil + navigation Bootstrap
- Catalogue avec badges `selected`
- Ajout de produit (formulaire)
- Toggle `selected` (PATCH)
- Suppression avec confirmation
- Filtre : Tous / Sélectionnés / Non sélectionnés (Angular)
- Messages succès / erreur
- Responsive (`table-responsive`)

## Architecture

```text
tp3/
├── inset-app/          # Angular 19 (port 4200)
├── product-backend/    # Spring Boot 3.3.5 (port 8083)
└── README.md

Flux : Angular (4200) → HttpClient → Spring Boot REST (8083) → H2 mémoire
```

Le dossier `.tools/` (JDK/Maven portables) peut exister en local pour le poste de développement ; il est **exclu** du dépôt public via `.gitignore`.

## Structure des dossiers

```text
tp3/
├── inset-app/                 # Frontend Angular
│   ├── package.json
│   ├── angular.json
│   └── src/
├── product-backend/           # Backend Spring Boot
│   ├── pom.xml
│   └── src/main/java/...
├── .gitignore
└── README.md
```

## Prérequis

- Node.js / npm (voir matrice Angular 19 : Node 18 / 20 / 22 recommandés)
- Navigateur moderne
- Java 17 et Maven 3.9+ pour le backend

## Installation

```powershell
# Backend
cd product-backend
mvn -DskipTests package

# Frontend
cd ..\inset-app
npm install
```

## Démarrage

### Backend Spring Boot

```powershell
cd product-backend
mvn spring-boot:run
```

API : `http://localhost:8083`

Si Java 17 n’est pas le JDK par défaut de la session, définir temporairement `JAVA_HOME` vers un JDK 17 installé sur la machine (sans modifier les variables système permanentes si ce n’est pas nécessaire).

### Frontend Angular

```powershell
cd inset-app
npm start
# ou
npx ng serve --port 4200 --host 127.0.0.1
```

UI : `http://127.0.0.1:4200` ou `http://localhost:4200`

## Ports

| Service | Port |
|---------|------|
| Angular | 4200 |
| Spring Boot | 8083 |

## Endpoints REST

| Méthode | URL | Description | Codes |
|---------|-----|-------------|-------|
| GET | `/products` | Liste des produits | 200 |
| POST | `/products` | Création (name, price, selected) | 201 / 400 |
| PATCH | `/products/{id}/selected` | Inverse `selected` | 200 / 404 |
| DELETE | `/products/{id}` | Suppression | 204 / 404 |
| OPTIONS | `/products...` | Preflight CORS | 200 |

Contrat POST : un éventuel `id` fourni par le client est **ignoré** ; l’ID est généré côté serveur.

## Exemples d’utilisation

```http
GET  http://localhost:8083/products
POST http://localhost:8083/products
Content-Type: application/json

{
  "name": "Clavier",
  "price": 199.99,
  "selected": false
}
```

## Tests

```powershell
# Backend
cd product-backend
mvn test

# Frontend
cd ..\inset-app
npm run build
npx ng test --watch=false --browsers=ChromeHeadless
```

## Limites connues

- H2 en mémoire : données perdues au redémarrage du backend
- Pas d’authentification
- Pas de base externe / Docker / Gateway / Eureka
- Pas de proxy Angular (CORS direct 4200 → 8083)
- Node.js 24 n’est pas dans la matrice officielle Angular 19 (warning CLI possible)

## CORS

Ce TP autorise uniquement :

- `http://localhost:4200`
- `http://127.0.0.1:4200`

Méthodes : `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`
Credentials : désactivés

## Avertissements CSS Bootstrap

Le build Angular peut signaler un budget initial dépassé (CSS Bootstrap) et quelques sélecteurs non supportés par le bundler. Warnings connus, non bloquants.

## Références pédagogiques

- EMSI — Activité Pratique Angular Framework
- Documentation Angular 19 (standalone, control flow)
- Documentation Spring Boot Web / Data JPA
