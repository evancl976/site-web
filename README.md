# 🌐 Site Web de l'Oral d'Evan Colo

Site web créé pour **Evan Colo** à l'occasion de son **oral de Bac 2026**.
Fait par **Evan Colo** et **Enzo Adam Maltese**.

> Ce site web a été amélioré pour aider les nouveaux élèves à pouvoir, à leur tour, créer un site web pour leur oral. Il sert de support de présentation orale et de modèle pédagogique pour tous ceux qui doivent préparer un oral de Bac avec un site web.

---

## 📖 Présentation

Ce projet est un **site web statique** (HTML / CSS / JavaScript) conçu pour l'oral de Evan Colo.
Il présente les spécialités culinaires des **îles et territoires d'Outre-Mer** :

- 🇾🇹 Mayotte
- 🇬🇫 Guyane
- 🇬🇵 Guadeloupe
- 🇲🇶 Martinique
- 🇷🇪 La Réunion

Chaque île dispose de sa propre page avec ses recettes traditionnelles, et un globe interactif permet de voyager visuellement entre les territoires.

Le site a été retravaillé pour être **clair, lisible et facilement réutilisable** afin d'aider les élèves à comprendre comment construire leur propre site pour leur oral.

---

## 🎬 Tutoriel vidéo — Comment télécharger et avoir le site

Une vidéo explique comment récupérer et lancer le site sur votre ordinateur :

▶️ **Lien YouTube :** https://youtu.be/G7WfCrGu0-U

Dans cette vidéo, vous verrez étape par étape comment obtenir le site web et le lancer chez vous.

---

## 📥 Télécharger le site web (depuis GitHub)

Le code source du site est disponible publiquement sur GitHub :

🔗 **Dépôt GitHub :** https://github.com/evancl976/site-web

### Méthode 1 — Téléchargement direct (zip)
1. Ouvrez le lien GitHub ci-dessus.
2. Cliquez sur le bouton vert **« Code »** puis sur **« Download ZIP »**.
3. Décompressez le fichier sur votre ordinateur.
4. Ouvrez le dossier obtenu.

### Méthode 2 — Git (en ligne de commande)
```bash
git clone https://github.com/evancl976/site-web.git
cd site-web
```

---

## 🚀 Lancer le site web en local

Le site est 100 % statique : **aucune installation de logiciel n'est nécessaire**.

### Option A — Double-clic (le plus simple)
Ouvrez le fichier **`index.html`** situé à la racine du dossier avec votre navigateur (Chrome, Edge, Firefox…).
Le site s'ouvre directement.

### Option B — Serveur local (recommandé pour le bon fonctionnement de toutes les pages)
Depuis un terminal, placez-vous dans le dossier du site puis lancez :

```bash
python -m http.server 8099
```

Puis ouvrez dans votre navigateur :

```
http://localhost:8099/index.html
```

> 💡 Le serveur local est conseillé car certaines fonctionnalités (ouverture des pages depuis le globe, recherche) fonctionnent mieux ainsi.

---

## 🖼️ Logo du site web

Le logo du site se trouve dans le dossier `images/` :

- `images/logo.png`

Il est affiché en haut à gauche de la barre de navigation sur toutes les pages.

---

## 📁 Structure du projet

```
site-web/
├── index.html              # Page d'accueil (globe, plats, recettes préférées)
├── Css/
│   └── main.css            # Toute la mise en forme (thème jour / nuit)
├── Script/
│   ├── globe.js            # Globe interactif et navigation vers les îles
│   ├── theme.js            # Bascule du thème clair / sombre
│   └── dish.js             # Interactions des pages recettes
├── Page/                   # Pages des îles et pages annexes
│   ├── Mayotte.html
│   ├── Guyane.html
│   ├── Guadeloupe.html
│   ├── Martinique.html
│   ├── La-reunion.html
│   ├── Apprendre.html      # Page « Apprendre »
│   ├── Info.html           # Fiche technique
│   ├── recherche.html      # Recherche
│   ├── mayotte/            # Recettes de Mayotte
│   ├── guyane/             # Recettes de Guyane
│   ├── guadeloupe/         # Recettes de Guadeloupe
│   ├── martinique/         # Recettes de Martinique
│   └── la-reunion/         # Recettes de La Réunion
└── images/                 # Images, drapeaux, logo, photos des plats
```

---

## ✨ Fonctionnalités

- **Globe interactif** : une vraie Terre qui tourne, avec un bouton par île (drapeau + halo aux couleurs du drapeau).
- **Navigation par îles** : chaque page île affiche la section active dans la barre de navigation.
- **Thème jour / nuit** : confort visuel pour présenter l'oral.
- **Catégories de plats** : Entrées, Plats, Desserts, Boissons, Accompaniements.
- **Recettes préférées** : cartes cliquables vers les recettes.
- **Recherche** intégrée.
- **Pages manquantes** : une fenêtre indique proprement quand une page n'est pas encore disponible.
- **Images de remplacement** : `no-photo.jpg` (image cassée) et `no-image.jpg` (image à venir).

---

## 👥 Auteurs

- **Evan Colo**
- **Enzo Adam Maltese**

Site web créé pour l'oral de Evan Colo — puis amélioré pour aider les nouveaux élèves à créer, eux aussi, leur site web pour leur oral.

---

## 📝 Licence

Projet réalisé dans un cadre scolaire (présentation orale de Bac).
Librement réutilisable comme modèle pédagogique.
