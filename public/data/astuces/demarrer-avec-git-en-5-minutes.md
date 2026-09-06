## Pourquoi Git ?

Git garde l'historique de votre projet : chaque sauvegarde (*commit*) est un point de retour. Fini les `projet_final_v3_VRAIMENT_final.zip`.

## Installation

```bash
# Debian / Ubuntu
sudo apt install git

# Vérifier
git --version
```

## Les 5 commandes essentielles

```bash
git init                  # démarrer un dépôt dans le dossier courant
git add .                 # préparer les fichiers modifiés
git commit -m "Premier commit"  # sauvegarder avec un message
git log --oneline         # voir l'historique compact
git checkout -b ma-branche      # créer et basculer sur une branche
```

## Configurer son identité (une seule fois)

```bash
git config --global user.name "Votre nom"
git config --global user.email "vous@exemple.fr"
```

## Envoyer sur GitHub

```bash
git remote add origin https://github.com/votre-compte/votre-depot.git
git push -u origin main
```

> 💡 Astuce : `git status` est votre meilleur ami — en cas de doute, exécutez-le.

[icon:git]
