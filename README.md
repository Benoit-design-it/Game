# Make No Promises — prototype 5

## Jouer

Ouvrir **`index.html`** (à la racine) dans un navigateur : Chrome, Firefox, Edge ou Safari récents. C'est un fichier autonome, qui fonctionne même copié seul, hors ligne, sans installation.

1. Cliquer sur **S'asseoir**. Une silhouette approche et formule sa demande.
2. Répondre avec l'un des cinq boutons (ou les touches 1 à 5). Cliquer sur le texte, ou appuyer sur Espace, fait avancer.
3. Le reste est à découvrir. Le détail est plus bas, mais il vaut mieux jouer une première partie sans le lire.

Une partie dure une quinzaine de minutes (12 visiteurs). Elle est sauvegardée automatiquement, et le bouton **Reprendre** apparaît au retour. Le son démarre au premier clic. Le bouton « son », en haut à droite, le coupe. Le bouton « encre vive », à côté, repasse au rendu simple si l'appareil peine.

Si rien ne se passe au clic : le fichier ouvert est sans doute `src/index.html` séparé de ses voisins, ou un aperçu qui n'exécute pas JavaScript (aperçu de fichiers du téléphone, vue GitHub). Il faut ouvrir le `index.html` de la racine dans un vrai navigateur.

## Contenu du prototype

- **Direction visuelle « Lavis »** : encre sur papier. Le trône est peint au pinceau et au lavis. Les silhouettes sont des taches d'encre diluée qui bavent dans le papier, puis leur trait sèche et se précise à mesure que les promesses s'accumulent. Chaque vérité potentielle est un sceau apposé sur le rouleau :
  - promesse : sceau vermillon ;
  - réflexion : sceau jamais appuyé, en pointillés ;
  - délégation : sceau rond d'un proche ;
  - refus : sceau à l'encre noire ;
  - oui promis pour la suite : cercle pointillé ;
  - promesse brisée : sceau fendu.

  Le fil est indigo. L'évitement enlève le lavis et laisse le papier nu, et le rouleau se délave. Typographies : Zen Old Mincho pour les titres, Spectral pour le texte.
- **Encre vive** (PixiJS, WebGL 2) : les silhouettes sont peintes par une simulation. Chaque silhouette est une goutte posée sur le papier : l'eau se répand le long des fibres, n'entre dans le papier sec que par les fibres les plus absorbantes (d'où les filaments), emporte le pigment vers les bords (d'où l'auréole sombre), puis s'évapore et fixe l'encre. Moins il y a eu de promesses, plus la goutte est humide et s'étale ; la silhouette récurrente finit sèche, au contour exact du protagoniste. Sans WebGL 2 ou sans rendu en virgule flottante, le jeu garde automatiquement le rendu SVG.
- **Scène du trône** (SVG) : fissures, chaînes et assombrissement des bords suivent une variable de poids. Le poids hérité (6) est visible dès l'ouverture : fissures, deux chaînes et le fil noué au poignet, sans explication.
- **Les cinq réponses** du menu (touches 1 à 5, numérotées 一 à 五 sur les sceaux). Chacune ajoute du poids et appose un ou plusieurs sceaux. « J'y réfléchis » continue de peser à chaque tour. « Refuser mais promettre la suivante » crée une dette : si la demande suivante n'est pas acceptée, la promesse se brise (poids supplémentaire, sceau fendu).
- **Rester et écouter** (hors menu) : cliquer sur la silhouette au lieu du menu (ou la sélectionner au clavier avec Tab puis Entrée). Chaque clic fait parler la silhouette un peu plus. Si on l'écoute jusqu'au bout sans rien choisir, elle part sans rien emporter et le poids diminue. Rien dans le jeu ne l'indique.
- **Trois sorties par évitement** (hors menu, jamais nommées) :
  - *Silence* : ne rien faire. Au bout de 30 s, la silhouette part. Un indice « La silhouette attend. » apparaît aux 60 % du délai. Écouter ou jouer remet la minuterie à zéro.
  - *Fuite* : cliquer sur le trône ou sur le protagoniste, ou appuyer sur Échap. Le protagoniste se lève et part, la silhouette reste seule devant le trône vide, puis le protagoniste revient. Le fil reste noué au poignet pendant la fuite.
  - *Regard détourné* : changer d'onglet ou réduire la fenêtre (`visibilitychange`) pendant plus de 1,2 s. Au retour, la silhouette a disparu.

  Aucune n'appose de sceau. Chacune ajoute un poids léger (0,5) et laisse au sol une tache où le lavis a été enlevé, jusqu'au papier nu, en forme propre à son type : tache ronde pour le silence, deux empreintes pour la fuite, paupière close pour le regard détourné. Le rouleau se délave peu à peu à mesure que les évitements s'accumulent. Écouter, au contraire, allège le poids sans laisser de marque.
- **Silhouettes** : informes au début, elles se précisent (contours, yeux) à mesure que les promesses s'accumulent.
- **Silhouette récurrente** (tours 3, 7 et 12) : elle tient l'autre bout du fil et répète « Je t'attends toujours au même endroit ». Son contour glisse vers celui du protagoniste, en miroir, en fonction du poids (`state.recurring.recognition`).
- **Rencontre finale** : le menu se grippe. Promettre, réfléchir, déléguer et « la prochaine » échouent et s'éteignent. Refuser tourne en boucle. Les évitements échouent aussi : le silence dure, le fil retient la fuite, et la silhouette est toujours là quand on revient, plus près. Seule l'écoute permet d'avancer. Le fil se dénoue alors.
- **Fins** :
  - *Debout* : libération (évaluée après *Personne*), si au moins 4 écoutes ont été menées jusqu'au bout avant la rencontre finale ;
  - *Le trône* : le poids reste ;
  - *Personne* : évitement répété, s'il y a au moins 3 évitements et qu'ils dépassent le nombre d'écoutes et de promesses.

  Aucune fin ne tranche le dilemme entre défaire les branches et continuer à en créer.
- **Fissures animées** : chaque avancée d'une fissure laisse une trace d'encre fraîche, fait tomber de la poussière et, si elle est forte, fait trembler le trône. Sous un poids lourd, le vermillon des sceaux suinte dans les fissures. Quand elles reculent, le papier se relève le long du trait. D'autres ramifications apparaissent quand le poids augmente.
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
- **Sauvegarde** : `localStorage`, reprise au début du tour en cours. Chaque partie terminée laisse une marque sur la marche du trône : un trait d'encre pour une libération, un petit sceau vermillon pour le poids, une tache de papier nu pour l'évitement.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | **Le jeu, en un seul fichier** (environ 540 Ko, dont 456 Ko de PixiJS). Généré : ne pas le modifier directement. |
| `src/content.js` | Tous les textes et réglages d'équilibrage (poids, seuils). À éditer pour réécrire le jeu. |
| `src/game.js` | État, rendu, déroulé des tours. |
| `src/audio.js` | Ambiance sonore synthétisée. |
| `src/ink.js` | Encre vive : simulation de l'encre des silhouettes (PixiJS). |
| `src/vendor/pixi.min.js` | PixiJS 7.4.2, licence MIT (`src/vendor/LICENSE-pixi.txt`). |
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
