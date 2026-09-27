# Make No Promises — prototype 3

## Jouer

Ouvrir **`index.html`** (à la racine) dans un navigateur : Chrome, Firefox, Edge ou Safari récents. C'est un fichier autonome, qui fonctionne même copié seul, hors ligne, sans installation.

1. Cliquer sur **S'asseoir**. Une silhouette approche et formule sa demande.
2. Répondre avec l'un des cinq boutons (ou les touches 1 à 5). Cliquer sur le texte, ou appuyer sur Espace, fait avancer.
3. Le reste est à découvrir. Le détail est plus bas, mais il vaut mieux jouer une première partie sans le lire.

Une partie dure une quinzaine de minutes (12 visiteurs). Elle est sauvegardée automatiquement, et le bouton **Reprendre** apparaît au retour. Le son démarre au premier clic. Le bouton « son », en haut à droite, le coupe.

Si rien ne se passe au clic : le fichier ouvert est sans doute `src/index.html` séparé de ses voisins, ou un aperçu qui n'exécute pas JavaScript (aperçu de fichiers du téléphone, vue GitHub). Il faut ouvrir le `index.html` de la racine dans un vrai navigateur.

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
- **Fissures animées** : chaque avancée d'une fissure s'éclaire le long du segment qui se fend, fait tomber de la poussière et, si elle est forte, fait trembler le trône. Sous un poids lourd, les fissures rougeoient comme des braises. Quand elles reculent, un éclat froid les parcourt. D'autres ramifications apparaissent quand le poids augmente.
- **Ambiance sonore** : entièrement synthétisée (Web Audio, aucun fichier). Un bourdon grave porte le poids : une seconde mineure frotte de plus en plus fort à mesure que les promesses s'accumulent, et le son s'étouffe avec l'évitement. Chaque geste a son son :
  - promesse : cloche claire ;
  - réflexion : deux notes suspendues qui ne se résolvent pas ;
  - délégation : cloche et son écho ;
  - refus : coup sourd ;
  - pierre qui se fend : crépitements ;
  - chaîne qui se tend : cliquetis ;
  - écoute : le bourdon s'efface ;
  - fuite : pas qui s'éloignent ;
  - regard détourné : souffle ;
  - menu grippé : grésillement.

  Chaque fin a sa propre couleur sonore.
- **Sauvegarde** : `localStorage`, reprise au début du tour en cours. Chaque partie terminée laisse une marque sur la marche du trône : un trait pâle pour une libération, un bloc sombre pour le poids, un cercle creux pour l'évitement.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | **Le jeu, en un seul fichier.** Généré : ne pas le modifier directement. |
| `src/content.js` | Tous les textes et réglages d'équilibrage (poids, seuils). À éditer pour réécrire le jeu. |
| `src/game.js` | État, rendu, déroulé des tours. |
| `src/audio.js` | Ambiance sonore synthétisée. |
| `src/style.css` | Mise en page et animations. |
| `src/index.html` | Scène SVG et interface. Jouable aussi directement, tant que les fichiers de `src/` restent ensemble. |
| `build.js` | Assemble `src/` en `index.html` : `node build.js` après chaque modification. |

## Outils de test

Les paramètres suivants s'ajoutent à l'URL, par exemple `index.html?debug&silence=3000` :

- `index.html?debug` affiche l'état (poids, compteurs, reconnaissance de la silhouette récurrente).
- `index.html?reset` efface la sauvegarde et l'historique des parties.
- `index.html?silence=3000` raccourcit le délai du silence (en ms).
- `window.MNP.state` dans la console.

## Pistes pour la suite

- Réglage des délais : la durée du silence et le seuil du regard détourné sont dans `src/content.js`.
