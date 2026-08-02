# DeciTrack — PRD

## Original Problem Statement
Application mobile de calcul des heures de travail avec conversion décimale pour l'administration. L'employé saisit l'heure de début, ses pauses (dont la pause déjeuner) et l'heure de fin ; l'app calcule le total quotidien en format standard (ex: "10 h 30") et en format décimal administratif (ex: "10.50 h"). Reliée à un calendrier, récapitulatif mensuel, export, et mode sombre.

Exemple de référence: 06:30 → pause 12:00/12:30 → 17:30 = 10 h 30 standard = **10.50 h** décimal.

## User Choices
- Stockage: local uniquement (aucun backend)
- Plusieurs employés
- Export CSV **et** PDF
- Plusieurs pauses possibles par jour
- Thème par défaut: sombre (toggle clair disponible)

## Architecture
- Expo Router (file-based), 3 onglets: Saisie / Récap / Équipe
- Local-only: `@/src/utils/storage` (AsyncStorage) via `StoreProvider` context
- Theme via `ThemeProvider` (dark/light persistés)
- Fonts: Barlow Condensed (chiffres) + IBM Plex Sans (texte), via expo-font
- Export: `expo-print` (PDF) + `expo-file-system` + `expo-sharing` (CSV)
- Pas de backend / MongoDB (non requis)

## Core Requirements (static)
1. Sélection de jour (bande hebdo) + navigation semaine
2. Formulaire: début matin, pauses multiples (add/remove), fin soir — calcul temps réel
3. Double affichage: standard "H h MM" + décimal admin "X.XX h" (minutes/60)
4. Gestion multi-employés (ajout, sélection, suppression avec confirmation)
5. Récap mensuel + totaux + export CSV & PDF
6. Mode sombre/clair persisté

## Implemented (2026-08-01)
- ✅ Saisie: sélecteur employé, bande 7 jours, hero double métrique, formulaire pauses multiples, sticky save, validation, toast
- ✅ Récap: chips employé, sélecteur mois, carte totaux, liste des jours, export PDF+CSV
- ✅ Équipe: liste avec total mensuel, ajout (bottom sheet), suppression (dialog de confirmation)
- ✅ Thème sombre par défaut + toggle clair
- ✅ Persistance locale (employés, entrées, thème, employé sélectionné)
- ✅ Testé par testing agent: 11/11 features PASS, calcul exact du cas d'exemple confirmé

## Implemented — later iterations
- ✅ (2026-08-01) Fix add-employee: dialogue centré keyboard-safe (le champ nom était masqué par le clavier Android)
- ✅ (2026-08-01) Fix export PDF/CSV: migration API stable SDK 54 `File`/`Paths`, garde anti-double-tap, messages d'erreur
- ✅ (2026-08-02) Fix safe-area: la barre d'onglets inclut `insets.bottom` (plus de chevauchement avec la barre de navigation Android) ; barres d'action collantes à 12px du bas
- ✅ (2026-08-02) Feature multi-entreprises : champ `Entreprise/Chantier` par entrée journalière, création de plusieurs entreprises, filtre par entreprise dans Récap, étiquette par ligne, colonne Entreprise dans exports CSV/PDF

## Backlog / Next
- P1: Restaurer plus robustement l'employé sélectionné après reload (fallback déjà présent)
- P2: Vue calendrier mensuel complet (grille) en plus de la bande hebdo
- P2: Total d'heures par entreprise (sous-totaux par employeur/chantier) dans le récap
- P2: Heures supplémentaires / seuil hebdomadaire configurable
