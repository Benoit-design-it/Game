# Make No Promises — prototype 1

Ouvrir `index.html` dans un navigateur. Aucune installation.

## Contenu du prototype

- **Scène du trône** (SVG) : fissures, chaînes et vignettage suivent une variable de poids. Le poids hérité (6) est visible dès l'ouverture : fissures, deux chaînes et le fil noué au poignet, sans explication.
- **Les cinq réponses** du menu (touches 1 à 5). Chacune ajoute du poids et fait pousser une ou plusieurs branches dans le fond :
  - promettre → branche dorée ;
  - y réfléchir → branche en pointillés, qui continue de peser à chaque tour ;
  - confier à un proche → branche avec un nœud (le proche qui porte la promesse) ;
  - refuser → branche anguleuse, figée ;
  - refuser mais promettre la suivante → deux branches, et une dette : si la demande suivante n'est pas acceptée, la promesse se brise (poids supplémentaire, branche cassée).
- **Rester et écouter** (hors menu) : cliquer sur la silhouette au lieu du menu (ou la sélectionner au clavier avec Tab puis Entrée). Chaque clic fait parler la silhouette un peu plus. Si on l'écoute jusqu'au bout sans rien choisir, elle part sans rien emporter et le poids diminue. Rien dans le jeu ne l'indique.
- **Silhouettes** : informes au début, elles se précisent (contours, yeux) à mesure que les promesses s'accumulent.
- **Silhouette récurrente** (tours 3, 7 et 12) : elle tient l'autre bout du fil et répète « Je t'attends toujours au même endroit ». Son contour glisse vers celui du protagoniste, en miroir, en fonction du poids (`state.recurring.recognition`).
- **Rencontre finale** : le menu se grippe. Promettre, réfléchir, déléguer et « la prochaine » échouent et s'éteignent. Refuser tourne en boucle. Seule l'écoute permet d'avancer. Le fil se dénoue alors.
- **Fins** :
  - *Debout* : libération, si au moins 4 écoutes ont été menées jusqu'au bout avant la rencontre finale ;
  - *Le trône* : le poids reste ;
  - *Personne* : fin d'évitement, déjà écrite, atteignable en v2.

  Aucune fin ne tranche le dilemme entre défaire les branches et continuer à en créer.
- **Sauvegarde** : `localStorage`, reprise au début du tour en cours. Chaque partie terminée laisse une marque sur la marche du trône : un trait pâle pour une libération, un bloc sombre pour le poids, un cercle creux pour l'évitement (v2).

## Fichiers

| Fichier | Rôle |
|---|---|
| `content.js` | Tous les textes et réglages d'équilibrage (poids, seuils). À éditer pour réécrire le jeu. |
| `game.js` | État, rendu, déroulé des tours. |
| `style.css` | Mise en page et animations. |
| `index.html` | Scène SVG et interface. |

## Outils de test

- `index.html?debug` affiche l'état (poids, compteurs, reconnaissance de la silhouette récurrente).
- `index.html?reset` efface la sauvegarde et l'historique des parties.
- `window.MNP.state` dans la console.

## Pour la v2

La structure est prête pour ces ajouts : `avoidCount`, `avoidMarks` et le rendu des marques creuses existent déjà, ainsi que la fin *Personne*.

- Silence : `setTimeout` qui résout le tour sans choix.
- Quitter le trône.
- Détourner le regard : `document.visibilitychange`.
- Fissures animées, ambiance sonore.
