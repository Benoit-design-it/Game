# Make No Promises — prototype 2

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
- **Trois sorties par évitement** (hors menu, jamais nommées) :
  - *Silence* : ne rien faire. Au bout de 30 s, la silhouette part. Un indice « La silhouette attend. » apparaît aux 60 % du délai. Écouter ou jouer remet la minuterie à zéro.
  - *Fuite* : cliquer sur le trône ou sur le protagoniste, ou appuyer sur Échap. Le protagoniste se lève et part, la silhouette reste seule devant le trône vide, puis le protagoniste revient. Le fil reste noué au poignet pendant la fuite.
  - *Regard détourné* : changer d'onglet ou réduire la fenêtre (`visibilitychange`) pendant plus de 1,2 s. Au retour, la silhouette a disparu.

  Aucune ne crée de branche. Chacune ajoute un poids léger (0,5) et laisse au sol une marque terne et creuse propre à son type : cercle en pointillés pour le silence, empreintes vides pour la fuite, paupière close pour le regard détourné. Le monde se désature peu à peu à mesure que les évitements s'accumulent. Écouter, au contraire, allège le poids sans laisser de marque.
- **Silhouettes** : informes au début, elles se précisent (contours, yeux) à mesure que les promesses s'accumulent.
- **Silhouette récurrente** (tours 3, 7 et 12) : elle tient l'autre bout du fil et répète « Je t'attends toujours au même endroit ». Son contour glisse vers celui du protagoniste, en miroir, en fonction du poids (`state.recurring.recognition`).
- **Rencontre finale** : le menu se grippe. Promettre, réfléchir, déléguer et « la prochaine » échouent et s'éteignent. Refuser tourne en boucle. Les évitements échouent aussi : le silence dure, le fil retient la fuite, et la silhouette est toujours là quand on revient, plus près. Seule l'écoute permet d'avancer. Le fil se dénoue alors.
- **Fins** :
  - *Debout* : libération (évaluée après *Personne*), si au moins 4 écoutes ont été menées jusqu'au bout avant la rencontre finale ;
  - *Le trône* : le poids reste ;
  - *Personne* : évitement répété, s'il y a au moins 3 évitements et qu'ils dépassent le nombre d'écoutes et de promesses.

  Aucune fin ne tranche le dilemme entre défaire les branches et continuer à en créer.
- **Sauvegarde** : `localStorage`, reprise au début du tour en cours. Chaque partie terminée laisse une marque sur la marche du trône : un trait pâle pour une libération, un bloc sombre pour le poids, un cercle creux pour l'évitement.

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
- `index.html?silence=3000` raccourcit le délai du silence (en ms).
- `window.MNP.state` dans la console.

## Pistes pour la suite

- Fissures animées, ambiance sonore.
- Réglage des délais : la durée du silence et le seuil du regard détourné sont dans `content.js`.
