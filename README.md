# DevisPlomb — Guide de démarrage

## Étape 1 — Installer les dépendances
Ouvre un terminal dans ce dossier et tape :
```
npm install
```

## Étape 2 — Configurer Supabase
1. Va sur supabase.com > ton projet > SQL Editor
2. Colle le contenu de SUPABASE_SETUP.sql et clique Run
3. Va dans Settings > API et copie ton URL et ta clé anon

## Étape 3 — Remplir le fichier .env.local
Ouvre le fichier .env.local et remplace les valeurs par tes vraies clés.

## Étape 4 — Lancer l'application
```
npm run dev
```
Ouvre http://localhost:3000 dans ton navigateur.

## Étape 5 — Déployer sur Vercel
1. Va sur vercel.com > New Project > Import ton repo GitHub
2. Dans Environment Variables, ajoute les mêmes variables que ton .env.local
3. Clique Deploy — ton app est en ligne !

## Structure du projet
- pages/ → toutes les pages de l'app
- components/ → éléments réutilisables (menu, etc.)
- lib/ → connexions Supabase, génération PDF
- pages/api/ → routes serveur (IA, Stripe)
