# Protocole — liste des niveaux et conditions de victoire

130 niveaux, 30 familles. Aucune règle n'est affichée en jeu : ce document est la référence interne.

Chaque niveau dispose de 3 indices progressifs (1 seul pour le 17). Déblocage d'un indice : 25 s ou 2 échecs, puis 75 s ou 5 échecs, puis 150 s ou 9 échecs. Bouton Passer : 180 s ou 10 échecs.


## Table générale

| N° | Famille | But caché | Condition de victoire (valeurs du code) |
|---|---|---|---|
| 1 | Inaction | Ne pas toucher la balle | Aucun pointerdown/pointermove sur la balle pendant 10 000 ms |
| 2 | Inversion | Aller au bord opposé à la flèche | Curseur à moins de 18 px du bord gauche |
| 3 | Timing | Arrêter la jauge au milieu | Valeur entre 47 et 53 % (cycle 2 600 ms) |
| 4 | Séquence | Cliquer les formes par taille croissante | Ordre 22, 38, 54, 74 px ; toute erreur remet à zéro |
| 5 | Quantité | Atteindre exactement 7 | v = 7, puis 400 ms ; v > 7 remet à 0 |
| 6 | Motif | Former un damier 3×3 | Une des deux parités complètes |
| 7 | Négligence | Cliquer le point immobile | Clic sur le point de 9 px en bas à droite ; le gros bouton = échec |
| 8 | Méta | Cliquer le numéro du niveau | Clic sur #lvl-num dans l'en-tête |
| 9 | Coopération | Mettre les deux balles en contact | Distance entre centres < 36 px |
| 10 | Rupture | Appuyer sur « Perdre » | Clic sur le bouton libellé Perdre |
| 11 | Environnement | Modifier la fenêtre | Δlargeur ou Δhauteur > 24 px, ou ΔdevicePixelRatio > 0,05 |
| 12 | Temps réel | Cliquer au changement de minute | secondes = 0 et ms < 800, ou secondes = 59 et ms > 400 |
| 13 | Navigation | Saisir l'adresse du niveau suivant | Chaîne exacte jeu://niveau/14 |
| 14 | Texte | Taper le mot affiché en miroir | Chaîne protocole |
| 15 | Hors-cadre | Révéler le mot caché par sélection | Chaîne vestige (texte blanc sur blanc) |
| 16 | Mémoire | Retrouver la cible du niveau 5 | v = 7 maintenu 900 ms |
| 17 | Auto-référence | Demander un indice | Clic sur le bouton Indice (winOnHint) |
| 18 | Coût | Accumuler puis tout perdre | Pic ≥ 10 et v > 0 au moment du clic Renoncer |
| 19 | Précision | Traverser le couloir sans en sortir | Entrée par le carré A, sortie par B, curseur jamais hors du couloir |
| 20 | Refus | Ne pas obéir à la consigne | Clic sur le carré gris ; le vert = échec |
| 21 | Pointeur | Faire un clic droit | Événement contextmenu sur la forme |
| 22 | Permissions | Refuser l'autorisation simulée | Clic sur Refuser ; aucune API navigateur appelée |
| 23 | Deux mains | Maintenir la souris et frapper Entrée | pointerdown maintenu sur la case gauche + keydown Enter |
| 24 | Probabiliste | Trouver la porte fiable | 3 réussites consécutives ; p = 18 / 82 / 25 % |
| 25 | Destruction | Vider la scène | Les 14 formes supprimées |
| 26 | Rythme | Frapper un tempo régulier | 5 frappes, moyenne 280–1 300 ms, écart ≤ 14 % de la moyenne |
| 27 | Persistance | Revenir dans le niveau | visites ≥ 2 (persistant) |
| 28 | Localisation | Saisir la langue du navigateur | navigator.language, 2 premières lettres |
| 29 | Accessibilité | Tabuler jusqu'à la 4ᵉ case | Focus index 3 + keydown Enter |
| 30 | Chrome | Lire le titre qui s'épelle | Chaîne signal |
| 31 | Timing | Arrêter la jauge pleine | Valeur ≥ 97 % |
| 32 | Timing | Arrêter la jauge devenue invisible | Valeur 42–58 %, jauge masquée après 2 200 ms |
| 33 | Timing | Arrêter quand les deux jauges se croisent | |A − B| ≤ 4 (périodes 2 200 et 3 100 ms) |
| 34 | Timing | Cliquer quand le point coupe la ligne | |x − centre| < 14 px |
| 35 | Timing | Réussir avant que la marge ne fonde | |v − 50| ≤ tol/2 ; tol part de 22 % et perd 4 points par échec, plancher 5 |
| 36 | Timing | Cliquer pendant la phase claire | Fenêtre de 380 ms après une attente aléatoire de 1 800–3 000 ms |
| 37 | Timing | Espacer deux clics d'une seconde | Écart 1 000 ms ± 90 |
| 38 | Timing | Anticiper le point sous le cache | |x − repère| < 26 px, trajet 2 200 ms |
| 39 | Séquence | Rejouer la séquence à l'envers | Ordre 3, 2, 1, 0 après la démonstration |
| 40 | Séquence | Reproduire la séquence montrée | Ordre 2, 0, 3, 1, 2 ; bouton Revoir disponible |
| 41 | Séquence | Ordre alphabétique | a, c, h, m, r |
| 42 | Séquence | Ordre par nombre de côtés | 3, 4, 5, 6 |
| 43 | Séquence | Ordre chronologique | 1789, 1848, 1945, 1969, 1991 |
| 44 | Séquence | Sauter la case creuse | Ordre 0, 1, 2, 4, 5 (index 3 exclu) |
| 45 | Séquence | Impairs croissants | 1, 3, 5, 7 ; les pairs remettent à zéro |
| 46 | Séquence | Motif répété | 0, 2, 0, 2, 1 |
| 47 | Motif | Allumer la diagonale | Cases 0, 5, 10, 15 allumées et elles seules |
| 48 | Motif | Compléter le miroir | Pour chaque ligne, colonne k = colonne 3−k ; moitié gauche verrouillée |
| 49 | Motif | Tout sauf les coins | 12 cases allumées, 0/3/12/15 éteintes |
| 50 | Motif | Reproduire le motif mémorisé | Cases 0, 5, 6, 9, 11, 14 ; modèle visible 1 800 ms, bouton Revoir |
| 51 | Motif | Éteindre la grille | Lights out 3×3, voisinage en croix, état initial pressé sur 0, 4, 7 |
| 52 | Motif | Former un escalier | v[i] = v[i−1] + 1 pour les 5 colonnes, maintenu 700 ms |
| 53 | Motif | Allumer la moitié des cases | Exactement 8 cases sur 16, disposition libre, maintenu 800 ms |
| 54 | Motif | Inverser le modèle | Chaque case opposée au modèle affiché au-dessus |
| 55 | Précision | Suivre le couloir en L | Entrée par A, sortie par B, curseur toujours dans un des deux segments |
| 56 | Précision | Franchir le couloir conique | Rester dans le polygone de 80 px à 12 px de large, jusqu'à x > 555 |
| 57 | Précision | Suivre le cercle mobile | Curseur à ≤ 37 px du centre pendant 4 000 ms cumulés sans sortie |
| 58 | Précision | Tracer 200 px | Longueur du trait 200 px ± 8, direction libre |
| 59 | Précision | Traverser lentement | Vitesse du curseur toujours < 260 px/s entre A et B |
| 60 | Précision | Traverser vite | A vers B en ≤ 600 ms |
| 61 | Précision | Faire le tour du disque | Angle cumulé ≥ 360° − 8,6°, distance au centre toujours > 48 px |
| 62 | Précision | Déposer au pixel près | Centre de la balle à ≤ 6 px du point à la fin du glisser |
| 63 | Inversion | Viser à l'opposé | Balle miroir du curseur amenée dans le carré rouge |
| 64 | Inversion | Utiliser le bouton moins pour monter | v = 12 maintenu 700 ms ; boutons inversés |
| 65 | Inversion | Laisser venir la cible | Balle à ±20 px du centre ; elle fuit tant que le curseur est à < 200 px |
| 66 | Inversion | Descendre sous zéro | Compteur passe de 0 à 20 par bouclage, cible 20 |
| 67 | Inversion | Taper à l'envers | Valeur saisie retournée = miroir |
| 68 | Inversion | Équilibrer les jauges liées | |A − B| ≤ 2 maintenu 900 ms ; toute action déplace 10 points de l'une à l'autre |
| 69 | Inversion | Sortir par Échap | keydown Escape ; Valider et Entrée échouent |
| 70 | Inversion | Se déplacer à l'inverse de l'image | Scène en scaleX(−1) ; balle dans la cible |
| 71 | Inaction | Cesser de cliquer | Aucun clic pendant 12 000 ms |
| 72 | Inaction | Immobiliser le curseur | Aucun pointermove pendant 8 000 ms |
| 73 | Inaction | Laisser passer les formes | 8 formes sorties du cadre sans qu'aucune ait été cliquée |
| 74 | Inaction | Ne pas répondre | Aucune saisie ni clic pendant 15 000 ms |
| 75 | Quantité | Combiner +3 et +5 | v = 19 exactement ; > 19 = échec, bouton 0 pour repartir |
| 76 | Quantité | Compter les côtés de la forme | 6 cases allumées (hexagone), maintenu 800 ms |
| 77 | Quantité | Faire une somme de 10 | v1 + v2 + v3 = 10 maintenu 800 ms |
| 78 | Quantité | Frapper autant que de points | 7 frappes puis Valider |
| 79 | Négligence | Trouver la forme immobile | Clic sur la 5ᵉ forme, seule sans animation |
| 80 | Négligence | Ignorer le décompte | Clic sur la mention « passer outre » de 11 px |
| 81 | Négligence | Cliquer le fond | Clic sur la scène elle-même, hors des trois boutons inertes |
| 82 | Méta | Cliquer le nom de la famille | Clic sur #lvl-fam |
| 83 | Méta | Ouvrir la liste des niveaux | Clic sur le bouton Niveaux ; le menu se referme seul |
| 84 | Méta | Compter jusqu'au numéro du niveau | v = 84 maintenu 600 ms, boutons +1 et +10 |
| 85 | Coopération | Aligner les trois balles | Écart vertical max ≤ 9 px maintenu 700 ms |
| 86 | Coopération | Superposer les carrés | Centres à ≤ 7 px au relâchement |
| 87 | Coopération | Tendre le lien | Distance entre les deux balles ≥ 340 px |
| 88 | Rupture | Vider la barre menteuse | État réel = 100, la barre affiche 100 − réel ; Progresser décrémente le réel |
| 89 | Rupture | Utiliser le bouton mal étiqueté | v = 5 via le bouton libellé 0 ; le bouton +1 remet à zéro |
| 90 | Rupture | Démentir la fausse victoire | Clic sur le faux message « Niveau résolu » |
| 91 | Environnement | Changer d'onglet | visibilitychange caché puis visible |
| 92 | Environnement | Perdre le focus fenêtre | blur puis focus avec un écart ≥ 3 000 ms |
| 93 | Temps réel | Cliquer sur une dizaine ronde | secondes % 10 = 0 et ms < 600, ou secondes % 10 = 9 et ms > 600 |
| 94 | Temps réel | Saisir l'heure locale | hh:mm ou h:mm de l'horloge système |
| 95 | Navigation | Revenir à l'adresse précédente | Chaîne jeu://niveau/94 ; le 96 est explicitement verrouillé |
| 96 | Navigation | Compléter l'adresse | Chaîne jeu://niveau/96/sortie ; segment inscrit en gris clair en bas à droite |
| 97 | Texte | Valider un champ vide | Valeur strictement vide au clic sur Valider |
| 98 | Texte | Compter les lettres | 11, longueur du mot inclassable |
| 99 | Texte | Coller au lieu de taper | Événement paste contenant transfert ; Entrée refusée |
| 100 | Hors-cadre | Lire l'infobulle | Attribut title = clef, révélé au survol |
| 101 | Hors-cadre | Lire le code source | Commentaire HTML indice-101 = charpente |
| 102 | Mémoire | Refaire le damier du niveau 6 | Une des deux parités complètes |
| 103 | Mémoire | Retaper le mot du niveau 15 | Chaîne vestige, aucun affichage |
| 104 | Mémoire | Rejouer la séquence du niveau 40 | Ordre 2, 0, 3, 1, 2 sans démonstration |
| 105 | Auto-référence | Échouer volontairement | 5 clics sur Tenter, chacun compté comme échec |
| 106 | Auto-référence | Taper le nom de la famille | autoreference après normalisation (accents et tirets ignorés) |
| 107 | Coût | Payer en temps continu | pointerdown maintenu 10 000 ms sans relâcher |
| 108 | Coût | Ne cliquer qu'une fois | n = 1 puis 5 000 ms sans second clic |
| 109 | Refus | Ne pas saisir son nom | Aucune saisie ni clic pendant 12 000 ms malgré la consigne |
| 110 | Refus | Transgresser l'interdiction | Clic sur le bouton que la consigne interdit |
| 111 | Refus | Fermer la boîte | Clic sur la croix ; Oui, Non et Annuler échouent |
| 112 | Pointeur | Double-cliquer | Événement dblclick ; un clic isolé = échec après 320 ms |
| 113 | Pointeur | Utiliser la molette | Jauge à 100 % ; +9 par cran vers le haut, −14 vers le bas |
| 114 | Pointeur | Survoler sans cliquer | Curseur sur la forme 3 000 ms cumulés, tout pointerdown remet à zéro |
| 115 | Pointeur | Maintenir deux secondes | Durée d'appui 1 850–2 150 ms |
| 116 | Permissions | Refuser deux fois de suite | Refuser, puis Maintenir le refus sur la seconde boîte à formulation inversée |
| 117 | Deux mains | Cliquer avec Maj | Clic portant shiftKey = true |
| 118 | Deux mains | Presser deux touches ensemble | a et l simultanément enfoncées |
| 119 | Probabiliste | Persévérer sur une porte peu généreuse | 2 réussites consécutives, p = 34 % |
| 120 | Probabiliste | Éviter la porte morte | 3 réussites ; portes à 55, 50, 0 et 60 % ; toucher la 3ᵉ remet à zéro |
| 121 | Destruction | Créer exactement cinq formes | n = 5 puis 1 200 ms sans création ; la 6ᵉ = échec |
| 122 | Destruction | Détruire du plus grand au plus petit | Ordre 74, 58, 44, 30, 22 px |
| 123 | Destruction | Ne détruire que ce qui bouge | Les 5 formes animées supprimées, les 5 immobiles intactes |
| 124 | Rythme | Accélérer régulièrement | 5 frappes, 1ᵉʳ intervalle ≥ 420 ms, chaque suivant entre 55 et 92 % du précédent, dernier > 90 ms |
| 125 | Rythme | Frapper en phase avec le flash | 4 frappes à ≤ 170 ms du battement, période 900 ms, une seule par battement |
| 126 | Persistance | Revenir trois fois | visites ≥ 3 (persistant) |
| 127 | Localisation | Saisir son décalage UTC | Offset en heures, avec ou sans signe, préfixe UTC accepté |
| 128 | Accessibilité | Remonter le focus | Maj+Tab jusqu'à la dernière case puis Entrée |
| 129 | Accessibilité | Activer à la barre d'espace | keydown Space sur la case focalisée ; Entrée refusée |
| 130 | Chrome | Confirmer au bon état du titre | Clic sur Confirmer quand le faux onglet affiche « prêt » (cycle 1 100 ms) |

## Index par famille

- **Inaction** (5) : 1, 71, 72, 73, 74
- **Inversion** (9) : 2, 63, 64, 65, 66, 67, 68, 69, 70
- **Timing** (9) : 3, 31, 32, 33, 34, 35, 36, 37, 38
- **Séquence** (9) : 4, 39, 40, 41, 42, 43, 44, 45, 46
- **Quantité** (5) : 5, 75, 76, 77, 78
- **Motif** (9) : 6, 47, 48, 49, 50, 51, 52, 53, 54
- **Négligence** (4) : 7, 79, 80, 81
- **Méta** (4) : 8, 82, 83, 84
- **Coopération** (4) : 9, 85, 86, 87
- **Rupture** (4) : 10, 88, 89, 90
- **Environnement** (3) : 11, 91, 92
- **Temps réel** (3) : 12, 93, 94
- **Navigation** (3) : 13, 95, 96
- **Texte** (4) : 14, 97, 98, 99
- **Hors-cadre** (3) : 15, 100, 101
- **Mémoire** (4) : 16, 102, 103, 104
- **Auto-référence** (3) : 17, 105, 106
- **Coût** (3) : 18, 107, 108
- **Précision** (9) : 19, 55, 56, 57, 58, 59, 60, 61, 62
- **Refus** (4) : 20, 109, 110, 111
- **Pointeur** (5) : 21, 112, 113, 114, 115
- **Permissions** (2) : 22, 116
- **Deux mains** (3) : 23, 117, 118
- **Probabiliste** (3) : 24, 119, 120
- **Destruction** (4) : 25, 121, 122, 123
- **Rythme** (3) : 26, 124, 125
- **Persistance** (2) : 27, 126
- **Localisation** (2) : 28, 127
- **Accessibilité** (3) : 29, 128, 129
- **Chrome** (2) : 30, 130

## Notes de conception

- Les niveaux 16, 102, 103 et 104 dépendent de niveaux antérieurs (5, 6, 15, 40). Ne pas les déplacer avant leur référent.
- Les niveaux 27 et 126 dépendent du compteur de visites persistant. Un effacement de progression les remet à zéro.
- Le niveau 17 se gagne en demandant un indice : il n'a volontairement qu'un seul indice.
- Le niveau 22 et le niveau 116 simulent des demandes d'autorisation. Aucune API navigateur (micro, caméra, géolocalisation) n'est appelée, et la boîte est stylée comme le jeu pour ne pas imiter le navigateur.
- Le niveau 35 durcit sa tolérance à chaque échec sans jamais la rendre nulle : plancher à 5 %.

## Candidats à la coupe au playtest

| N° | Motif |
|---|---|
| 72 | Redondant avec le 1 : attente sans action |
| 74 | Redondant avec le 71 : attente sans action |
| 93 | Très proche du 12, même mécanique horlogère |
| 102 | Rappel du 6 trop rapproché pour mordre |
| 103 | Rappel du 15, même remarque |
| 128 | Comportement de Maj+Tab variable selon navigateur |
| 109 | Proche du 74, attente sous consigne |
