# 🎴 AlexRoll — Soirée Jeux

> PWA de jeux de cartes et de dés pour jouer entre amis, directement depuis le téléphone.

🔗 **[alexroll.io → https://a-rech.github.io/AlexRoll](https://a-rech.github.io/AlexRoll)**

---

## Présentation

AlexRoll est une application web progressive (PWA) pensée pour les soirées. Elle regroupe des jeux de cartes et de dés classiques : chaque jeu dispose de sa fiche de règles complète et, selon le jeu, d'un mode de jeu intégré directement dans l'application (lanceur de dés, pioche de cartes, tableau de score).

L'application fonctionne **hors ligne** une fois installée, et s'ajoute à l'écran d'accueil du téléphone comme une app native.

---

## Fonctionnalités

- **Catalogue** de jeux avec filtres par type (dés / cartes)
- **Fiches règles** détaillées pour chaque jeu
- **Gestion des joueurs** : création, noms et avatars personnalisables
- **Tableaux de score** automatiques selon le jeu
- **Mode clair / sombre** et **5 thèmes de couleur** (Or, Jade, Rubis, Indigo, Feu)
- **Persistance** des préférences en localStorage
- **PWA** : installable, fonctionne hors ligne

---

## Jeux disponibles

### 🎲 Dés

| Jeu | Joueurs | Description |
|-----|---------|-------------|
| **Yams** | 2–6 | Grille de score complète, 3 relances, bonus, suggestions de score |
| **4-2-1** | 2–8 | Gestion des jetons, hiérarchie des mains, pot central |

### 🃏 Cartes

| Jeu | Joueurs | Description |
|-----|---------|-------------|
| **Bataille** | 2–4 | Deck 52 cartes, gestion des batailles, compteur de cartes |

---

## Structure du projet

```
AlexRoll/
├── index.html          # Application complète (noyau, UI, navigation, moteur de score)
├── manifest.json       # Manifeste PWA
├── games/
│   ├── yams.js         # Module Yams — logique et configuration de score
│   ├── 421.js          # Module 4-2-1 — logique jetons et mains
│   └── bataille.js     # Module Bataille — logique deck et plis
└── assets/             # Icônes PWA
```

### Architecture modulaire

Chaque jeu est un **module JS indépendant** qui déclare sa configuration au noyau :

```js
export default {
  id, nom, emoji, type,           // Identité
  joueursMin, joueursMax,         // Contraintes
  description, regles,            // Contenu fiche
  scoreConfig,                    // Config tableau de score (null si pas de score)
  init(joueurs),                  // Initialise l'état du jeu
  // ... méthodes propres au jeu
}
```

Le noyau (`index.html`) prend en charge : navigation, gestion des joueurs, affichage du tableau de score, thèmes. **Ajouter un jeu = créer un fichier dans `games/` et l'enregistrer dans le catalogue.**

---

## Lancer en local

```bash
# Cloner le dépôt
git clone https://github.com/a-rech/AlexRoll.git
cd AlexRoll

# Serveur local (les imports ES modules nécessitent HTTP)
python -m http.server 8080
# ou
npx serve .
```

Ouvrir ensuite `http://localhost:8080`.

> ⚠️ Ne pas ouvrir `index.html` directement depuis le système de fichiers — les imports dynamiques nécessitent un serveur HTTP.

---

## Déploiement GitHub Pages

```bash
git add .
git commit -m "feat: ajout jeu X"
git push origin main
```

GitHub Pages déploie automatiquement depuis la branche `main`. L'application est accessible à l'adresse :
`https://a-rech.github.io/AlexRoll`

---

## Roadmap

- [ ] Belote (enchères, atouts, plis, calcul belote/rebelote)
- [ ] Bizkit et jeux de soirée (règles festives, timer, mode plein écran)
- [ ] Zanzibar
- [ ] Scores sauvegardés entre parties
- [ ] Sélection "soirée" — choisir ses jeux du soir
- [ ] Partage de score par QR code
- [ ] Jeux personnalisés (règles maison)

---

## Stack technique

- Vanilla JS (ES Modules, import() dynamique)
- HTML/CSS pur — zéro dépendance, zéro framework
- PWA : Service Worker + Web App Manifest
- localStorage pour la persistance
- Google Fonts (Playfair Display + DM Sans)
- Hébergement : GitHub Pages

---

*Projet personnel — fait pour jouer, pas pour se prendre la tête.*
