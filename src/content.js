// Make No Promises — contenu narratif.
// Tous les textes et réglages d'équilibrage sont ici : on peut réécrire
// le jeu sans toucher à la logique (game.js).
window.MNP_CONTENT = {
  // Poids hérité : le protagoniste ne part jamais de zéro.
  inheritedWeight: 6,

  // Poids ajouté par chacune des cinq réponses classiques.
  weights: {
    promise: 2,
    think: 1,
    delegate: 1.5,
    refuse: 2,
    double: 3.5,
  },
  suspendedDrift: 0.2,   // poids ajouté à chaque tour par branche restée « en suspens »
  owedBroken: 2,         // poids d'un « oui promis » non tenu
  listenRelief: 1.5,     // allègement quand on reste écouter jusqu'au bout
  freeListenThreshold: 4, // écoutes nécessaires (hors rencontre finale) pour la fin de libération
  avoidThreshold: 3,     // évitements nécessaires pour la fin « vide »

  // Sorties par évitement : pas de branche, un poids léger, une marque terne.
  avoidWeights: { silence: 0.5, flee: 0.5, deny: 0.5 },
  silenceMs: 30000,      // délai avant que le silence ne réponde à ta place
  silenceCueAt: 0.6,     // part du délai après laquelle la silhouette « attend »
  denyMinMs: 1200,       // durée minimale hors de la page pour que le regard soit détourné

  // Les cinq réponses du menu. Toutes sont des promesses.
  choices: [
    { id: 'promise',  label: '« Je te le promets. »' },
    { id: 'think',    label: '« Je vais y réfléchir. »' },
    { id: 'delegate', label: '« Va trouver un des miens. »' },
    { id: 'refuse',   label: '« Non. »' },
    { id: 'double',   label: '« Pas cette fois. Mais la prochaine, oui. »' },
  ],

  family: ['ta sœur', 'ton fils', 'ta mère', 'ton cousin', 'ta fille', 'ton frère'],

  replies: {
    promise: {
      say: 'Je te le promets.',
      out: 'Une branche s\'ouvre. {yes}',
    },
    think: {
      say: 'Je vais y réfléchir.',
      out: 'Une branche s\'ouvre et reste suspendue. Quelque part, quelqu\'un attend encore ta réponse, et l\'attendra toujours.',
    },
    delegate: {
      say: 'Va trouver {family}. On s\'en occupera en mon nom.',
      out: 'Une branche s\'ouvre, portée par {family}. Le nœud, lui, reste à ton poignet. {yes}',
    },
    refuse: {
      say: 'Non.',
      out: 'Une branche se fige. {no}',
    },
    double: {
      say: 'Pas cette fois. Mais la prochaine demande, je l\'accepterai.',
      out: 'Deux branches s\'ouvrent. {no} Et ailleurs, un oui attend déjà quelqu\'un qui n\'est pas encore venu.',
    },
  },

  ui: {
    owedReminder: 'Tu as promis d\'accepter celle-ci.',
    owedKept: 'Tu tiens parole. Elle pèse quand même.',
    owedBroken: 'Tu avais promis d\'accepter. La promesse d\'avant se fend sur celle-ci.',
    listenEnd: 'La silhouette se tait. Elle s\'en va sans rien emporter.',
    silenceCue: 'La silhouette attend.',
  },

  // Sorties hors menu autres que l'écoute. Aucune n'est nommée comme telle dans le jeu.
  avoid: {
    silence: {
      say: 'Tu ne dis rien.',
      out: 'La silhouette attend encore un peu, puis s\'en va. Elle ne saura jamais si tu l\'as entendue.',
    },
    flee: {
      out: 'Tu te lèves et tu pars sans un mot. Derrière toi, la silhouette reste seule devant un trône vide.',
      back: 'Quand tu reviens, il n\'y a plus personne. Le trône, lui, n\'a pas bougé.',
    },
    deny: {
      out: 'Quand tu regardes à nouveau, il n\'y a plus personne. Tu ne sauras pas comment elle est partie.',
    },
  },

  // Rencontre finale avec la silhouette récurrente : le menu se grippe.
  final: {
    jam: {
      promise: 'Les mots se forment, puis se défont. Il n\'y a personne à qui les donner.',
      think: 'Tu y réfléchis depuis avant le commencement.',
      delegate: 'À qui ?',
      double: 'La prochaine demande, c\'est celle-ci. Ça a toujours été celle-ci.',
    },
    refuseSay: 'Non.',
    silence: 'Le silence dure. Elle ne part pas.',
    flee: 'Tu te lèves. Le fil te retient au poignet. Tu te rassois.',
    deny: 'Quand tu regardes à nouveau, elle est toujours là. Plus près.',
    release: 'Le fil se détend. Il n\'y a plus de nœud — seulement deux mains qui l\'ont tenu.',
  },

  // Déroulé d'une partie. `recurring` marque la silhouette récurrente.
  visitors: [
    {
      id: 'champ',
      request: 'Il n\'a pas plu depuis quarante jours. Fais qu\'il pleuve sur mon champ.',
      listen: [
        'C\'était le champ de mon père. Il parlait aux nuages, lui aussi.',
        'Je ne sais pas si c\'est la pluie que je veux. Je crois que je veux qu\'il reste quelque chose de lui.',
        'C\'est drôle. Je ne l\'avais jamais dit à voix haute.',
      ],
      yes: 'Quelque part, il pleut sur un champ, et quelqu\'un pleure sans savoir pourquoi.',
      no: 'Quelque part, un champ reste sec, pour toujours.',
    },
    {
      id: 'dette',
      request: 'Je dois de l\'argent à des gens qui ne pardonnent pas. Prête-moi. Je te rembourserai, je le jure.',
      listen: [
        'J\'ai emprunté pour soigner ma fille.',
        'Elle va mieux. Personne ne me demande comment moi, je vais.',
        '… Je crois que c\'était surtout ça, la dette.',
      ],
      yes: 'Quelque part, une dette est payée, et une autre commence — envers toi.',
      no: 'Quelque part, on frappe à une porte, tard dans la nuit.',
    },
    {
      id: 'fil-1',
      recurring: 1,
      request: 'Tu avais dit qu\'on partirait. Tu te souviens ? C\'est toujours vrai ?',
      listen: [
        'Je t\'attends toujours au même endroit.',
        'J\'ai gardé le bout du fil. Je ne l\'ai pas lâché.',
        'Je ne sais plus très bien à quoi tu ressembles.',
      ],
      yes: 'Quelque part, une silhouette prend la route avec toi. Tu n\'en sauras rien.',
      no: 'Quelque part, quelqu\'un attend au bord d\'une route qui ne mène plus nulle part.',
    },
    {
      id: 'fievre',
      request: 'Mon fils brûle de fièvre depuis trois jours. Guéris-le. Je t\'en prie.',
      listen: [
        'Il a sept ans. Il a peur du noir, alors je laisse la lampe allumée.',
        'Cette nuit, j\'ai eu peur que la lampe soit la dernière chose qu\'il voie.',
        'Pardon. Il faut que je rentre. Il ne doit pas se réveiller seul.',
      ],
      yes: 'Quelque part, un enfant se réveille sans fièvre et demande à manger.',
      no: 'Quelque part, une lampe reste allumée dans une chambre vide.',
    },
    {
      id: 'poste',
      request: 'Un mot de toi et ils m\'embaucheront. Recommande-moi. Tu ne le regretteras pas.',
      listen: [
        'Ça fait deux ans que je réponds à des annonces.',
        'Au début j\'y croyais. Maintenant je récite les phrases qu\'on attend de moi.',
        'Là, je ne récite rien. Ça fait du bien.',
      ],
      yes: 'Quelque part, quelqu\'un signe un contrat avec ton nom dans la marge.',
      no: 'Quelque part, une lettre de refus de plus s\'ajoute à la pile.',
    },
    {
      id: 'toile',
      request: 'Regarde ce que j\'ai fait. Dis-moi que c\'est bien. Dis-moi que ça vaut quelque chose.',
      listen: [
        'Je l\'ai peint la nuit, pendant que tout le monde dormait.',
        'Je ne sais pas si c\'est bien. Je sais que c\'est vrai.',
        'Tu l\'as regardé. C\'est peut-être tout ce que je voulais.',
      ],
      yes: 'Quelque part, une toile est accrochée, et son auteur ne peint plus que pour toi.',
      no: 'Quelque part, une toile est retournée contre un mur.',
    },
    {
      id: 'fil-2',
      recurring: 2,
      request: 'On dit que tu as beaucoup de monde à aider. Garde-moi une place. N\'importe laquelle.',
      listen: [
        'Je t\'attends toujours au même endroit.',
        'Le fil s\'est usé. Il tient encore.',
        'Tu as changé. Moi aussi. Un peu dans ta direction.',
      ],
      yes: 'Quelque part, une place reste gardée, vide, au bout d\'une table.',
      no: 'Quelque part, quelqu\'un cesse de mettre ton couvert.',
    },
    {
      id: 'frere',
      request: 'Réconcilie-moi avec mon frère. Toi, il t\'écoutera.',
      listen: [
        'On ne s\'est pas parlé depuis l\'enterrement de notre mère.',
        'Je ne me souviens même plus de ce qu\'il a dit. Seulement que ça m\'a fait mal.',
        'Je pourrais peut-être l\'appeler moi-même. Peut-être.',
      ],
      yes: 'Quelque part, deux frères se serrent la main parce que tu l\'as exigé.',
      no: 'Quelque part, un téléphone ne sonne jamais.',
    },
    {
      id: 'tilleul',
      request: 'Je vais bientôt mourir. Dis-moi que ma vie a servi à quelque chose.',
      listen: [
        'J\'ai élevé quatre enfants. J\'ai enterré un mari. J\'ai planté un tilleul.',
        'Le tilleul est plus haut que la maison, maintenant.',
        'Je crois que je voulais juste que quelqu\'un l\'entende. Le tilleul.',
      ],
      yes: 'Quelque part, une vieille femme meurt rassurée par une phrase qui n\'est pas la sienne.',
      no: 'Quelque part, une vieille femme meurt en doutant.',
    },
    {
      id: 'village',
      request: 'Quelque chose approche de notre village. Protège-nous.',
      listen: [
        'On ne sait pas ce que c\'est. On entend seulement le bruit, la nuit.',
        'Les enfants ne dorment plus. Les adultes font semblant.',
        'Je vais rentrer leur dire que quelqu\'un a écouté. C\'est déjà ça.',
      ],
      yes: 'Quelque part, un village est protégé, et ne saura jamais de quoi.',
      no: 'Quelque part, un village éteint ses lumières et attend.',
    },
    {
      id: 'priere',
      request: 'Apprends-moi à prier. Je ne sais pas à qui m\'adresser.',
      listen: [
        'Enfant, je parlais au plafond avant de dormir.',
        'Personne ne répondait. Ça ne me dérangeait pas.',
        '… C\'était peut-être déjà ça.',
      ],
      yes: 'Quelque part, quelqu\'un récite chaque soir une prière que tu as écrite.',
      no: 'Quelque part, quelqu\'un parle au plafond, et n\'attend plus rien.',
    },
    {
      id: 'fil-3',
      recurring: 3,
      final: true,
      request: 'Promets-moi que tu seras là.',
      listen: [
        'Je t\'attends toujours au même endroit.',
        'Tu te souviens ? Tu tenais l\'autre bout.',
        'Je n\'avais pas besoin d\'une promesse. Je voulais seulement que tu sois là.',
        '…',
      ],
    },
  ],

  // Fins. {branches} est remplacé par le nombre de branches créées.
  endings: {
    free: {
      title: 'Debout',
      text: [
        'Il n\'y a plus personne devant le trône.',
        'Tu te lèves. Les chaînes ne te retiennent pas : elles n\'ont jamais été fixées qu\'à ta parole.',
        'Derrière toi, les branches continuent de pousser dans le noir. Des pluies, des refus, des attentes. Elles sont vraies pour ceux qui les vivent. Tu ne les portes plus.',
        'Tu pourrais revenir les défaire, une à une. Plus rien ne pèserait. Plus rien n\'aurait eu lieu.',
        'Tu pourrais te rasseoir, et en faire pousser d\'autres, sans fin.',
        'Tu restes debout, entre les deux.',
      ],
    },
    weight: {
      title: 'Le trône',
      text: [
        'Le fil se défait. Une seule chose, parmi toutes.',
        'Les autres tiennent. {branches} branches poussent dans le noir, chacune vraie pour quelqu\'un. Tu les sens toutes à la fois.',
        'Si tu les défaisais, tu serais libre, et {branches} mondes n\'auraient jamais existé.',
        'Si tu continues, ils continuent. Et toi, tu restes sur la pierre.',
        'On frappe. Quelqu\'un d\'autre attend déjà.',
      ],
    },
    // Évitement répété : silence, fuite, regard détourné.
    void: {
      title: 'Personne',
      text: [
        'Plus personne ne vient.',
        'Le trône ne pèse presque rien. Les marques que tu y as laissées sont creuses, grises, comme des empreintes de doigts sur une vitre.',
        'Le fil s\'est dénoué, à la fin. C\'est la seule chose que tu aies vraiment entendue.',
        'Tu es libre. Il n\'y a rien autour.',
      ],
    },
  },
};
