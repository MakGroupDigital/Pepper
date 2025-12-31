# 🌶️ Peperr - Document de Référence

> **IMPORTANT** : Ce document doit être consulté avant toute modification ou développement sur le projet Peperr.

---

## 1. Vision du Produit

Peperr n'est pas qu'une plateforme de partage vidéo ; c'est un **"Social Club" numérique** conçu pour la Gen Z et Alpha. Là où TikTok privilégie la quantité et l'algorithme pur, Peperr privilégie **l'intensité de l'interaction** et **l'esthétique premium**.

### Le Nom : Pourquoi "peperr" ?
- Évoque le **piment (pepper)**, symbole de ce qui est "hot", tendance et piquant
- Le double "r" final apporte une touche moderne et graphique
- Facilite la mémorisation et le branding

### Positionnement Marché
- **Cible** : 13-25 ans, créateurs de tendances, amateurs de design et de technologie
- **Problème résolu** : La fatigue liée aux interfaces surchargées et aux interactions passives
- **Promesse** : *"Rendre chaque interaction mémorable."*

---

## 2. Les 5 Piliers d'Innovation

### 2.1 Le "Spice Meter" (Gamification du Feedback)
- **Concept** : Au lieu d'un simple bouton "Like", l'utilisateur fait glisser son doigt sur un curseur de flamme
- **Impact** : Plus tu restes appuyé, plus le "Spice Meter" monte (de "Doux" à "Extra Fort")
- **Innovation** : Les vidéos les plus "épicées" débloquent des effets visuels sur l'écran de tous ceux qui la regardent en même temps (vibrations, distorsions néon)
- **Objectif** : Créer un sentiment d'événement en direct

### 2.2 "Peperr Co-Op" (Duo Collaboratif Dynamique)
- **Concept** : Incruster un créateur dans la vidéo d'un autre via suppression de fond IA en temps réel
- **Impact** : Danser à côté de ta star préférée ou réagir comme si tu étais dans la même pièce
- **Innovation** : Création d'un "Multivers" de contenu où les vidéos s'emboîtent les unes dans les autres

### 2.3 "The Vault" (Contenu Éphémère de Groupe)
- **Concept** : Cercles de partage privés qui s'autodétruisent après 24h, mais uniquement si tout le groupe a posté
- **Impact** : Utilise la "FOMO" (peur de rater quelque chose)
- **Innovation** : Pousse à la création collective et renforce les liens entre amis proches

### 2.4 "Sound Spheres" (Audio Spatialisé et Interactif)
- **Concept** : Utilise l'accéléromètre du téléphone pour modifier le mix audio selon l'inclinaison
- **Impact** : Transforme la consommation de vidéo en une expérience physique
- **Innovation** : Easter eggs sonores, idéal pour les tendances musicales et ASMR

### 2.5 "IA Stylist" (Filtres de Style Vivants)
- **Concept** : Moteur IA qui transforme l'esthétique d'une vidéo selon le "Mood" choisi (Cyberpunk, Anime, Vintage Film)
- **Impact** : Permet à n'importe qui de produire une vidéo de qualité cinématographique
- **Innovation** : Peperr devient l'outil de création le plus puissant du marché

---

## 3. Identité Visuelle

### Style Global
- **Theme** : Dark Mode Premium / Glassmorphism
- **Formes** : "Squircles" (carrés arrondis) pour un aspect organique

### Palette de Couleurs
```
Noir Absolu    : #050505
Cyan Électrique : (accent primaire)
Fuchsia Vibrant : (accent secondaire)
```

### Contraintes de Design
- Respect strict de la charte graphique **Glassmorphism**
- **Aucun bouton standard d'OS** ; tous les composants UI sont personnalisés
- Animations fluides à **60fps**

---

## 4. Fonctionnalités MVP

### 4.1 Flux "Flow Cards"
- Affichage des vidéos sous forme de cartes avec perspective
- Système de swipe vertical pour changer de vidéo
- Auto-play intelligent avec pré-chargement (Lazy Loading)

### 4.2 Le Spice Meter (Innovation Majeure)
- Remplacement du "Like" binaire par une jauge de pression
- Effets visuels haptiques (vibrations) proportionnels au niveau de "Spice"
- Statistiques publiques basées sur le "Degré de piment" global d'une vidéo
- **Niveaux** : Doux → Moyen → Fort → Extra Fort

### 4.3 IA Stylist (Filtres Dynamiques)
- Apprentissage profond pour appliquer des styles artistiques en temps réel
- Filtres exclusifs mis à jour de façon hebdomadaire

---

## 5. Parcours Utilisateur

1. **Onboarding** : Inscription ultra-rapide (Social Auth) + sélection de 3 centres d'intérêt
2. **Découverte** : Arrivée directe sur le flux "Pour toi" avec la carte Flow
3. **Création** : Studio simplifié avec outils de montage IA

---

## 6. Stack Technologique

### Frontend (Actuel - Web)
- **Framework** : React 19 + TypeScript
- **Build Tool** : Vite
- **Icons** : Lucide React
- **IA** : Google GenAI (@google/genai)

### Frontend (Cible - Mobile)
- React Native ou Flutter (pour la fluidité des animations 60fps)
- TanStack Query pour le cache des vidéos
- Skia (via Shopify/react-native-skia) pour les effets de flou et dégradés

### Backend (Cible)
- Node.js avec microservices Go pour le traitement vidéo lourd
- PostgreSQL (données utilisateurs) + MongoDB (métadonnées vidéos)
- AWS S3 + CloudFront (CDN) + MediaConvert

### Intelligence Artificielle
- **Filtres** : TensorFlow Lite intégré on-device (faible latence)
- **Recommandation** : Algorithme hybride (Collaborative filtering + Content-based) via Python/PyTorch

### Performance & Sécurité
- **Vidéo** : Protocole HLS (HTTP Live Streaming)
- **Chiffrement** : AES-256 pour les messages privés ("The Vault")
- **Auth** : JWT avec rotation de clés

### Intégrations
- Apple Music / Spotify pour la bibliothèque sonore
- API de partage vers Instagram Stories et WhatsApp avec watermark dynamique

---

## 7. Objectifs de Performance

- Taux d'engagement par utilisateur **20% supérieur** aux standards actuels grâce au "Spice Meter"
- Interface fluide **sans temps de chargement perceptible**
- Animations à **60fps** minimum

---

## 8. Règles de Développement

1. **Toujours consulter ce document** avant de coder une nouvelle fonctionnalité
2. **Respecter le Glassmorphism** dans tous les composants UI
3. **Pas de boutons natifs** - tout est custom
4. **Dark mode par défaut** - pas de light mode
5. **Priorité au Spice Meter** - c'est l'innovation centrale
6. **Performance first** - lazy loading, pré-chargement, optimisation

---

*Document créé pour le projet Peperr - The Spicy Social Club 🌶️*
