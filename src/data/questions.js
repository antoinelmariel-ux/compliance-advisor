export const initialQuestions =  [
  {
    id: 'q1',
    type: 'choice',
    question: 'Quel est le périmètre de votre projet ?',
    options: [
      'Interne uniquement',
      'Externe (patients/public)',
      'Externe (professionnels de santé)',
      'Mixte'
    ],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Identifier l\'exposition du projet pour adapter le parcours compliance.',
      details: 'Selon le public ciblé, différentes règles de communication, de consentement et de sécurité s\'appliquent. Cette information permet d\'activer les bons contrôles dès le départ.',
      tips: [
        'Sélectionnez la réponse correspondant au public final le plus exposé.',
        'Si plusieurs cibles sont prévues, choisissez "Mixte" et précisez les nuances dans vos notes de projet.'
      ]
    }
  },
  {
    id: 'q2',
    type: 'choice',
    question: 'Le projet implique-t-il du digital ?',
    options: [
      'Oui - Application mobile',
      'Oui - Site web',
      'Oui - Plateforme en ligne',
      'Non'
    ],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Confirmer la présence d\'un canal digital nécessitant des validations techniques et réglementaires.',
      details: 'Les supports digitaux déclenchent l\'intervention des équipes IT, Juridique et BPP pour vérifier sécurité, mentions légales et conformité marketing.',
      tips: [
        'Choisissez le support principal si plusieurs dispositifs digitaux sont envisagés.',
        'En cas de doute, optez pour l\'option la plus proche et précisez vos intentions dans le dossier.'
      ]
    }
  },
  {
    id: 'q3',
    type: 'choice',
    question: 'Des données personnelles seront-elles collectées ?',
    options: [
      'Oui - Données de santé',
      'Oui - Données personnelles standard',
      'Non'
    ],
    required: true,
    conditions: [
      { question: 'q2', operator: 'not_equals', value: 'Non' }
    ],
    conditionLogic: 'all',
    guidance: {
      objective: 'Qualifier la nature des données personnelles manipulées.',
      details: 'Les données de santé impliquent une analyse d\'impact renforcée (DPIA), un hébergement certifié HDS et des clauses contractuelles spécifiques.',
      tips: [
        'Identifiez la catégorie la plus sensible de données que vous collecterez.',
        'Si la collecte est incertaine, retenez l\'hypothèse la plus protectrice pour planifier les validations.'
      ]
    }
  },
  {
    id: 'q4',
    type: 'choice',
    question: 'Le projet implique-t-il des prestataires externes ?',
    options: [
      'Oui',
      'Non',
      'Pas encore décidé'
    ],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Anticiper l\'implication de prestataires externes et les contrôles associés.',
      details: 'Les partenariats imposent une revue juridique des contrats, la vérification des assurances et parfois un audit qualité des fournisseurs.',
      tips: [
        'Sélectionnez "Pas encore décidé" si un appel d\'offres est en cours.',
        'Notez les prestataires pressentis pour faciliter la revue par les équipes concernées.'
      ]
    }
  },
  {
    id: 'q5',
    type: 'date',
    question: 'Quelle est la date de soumission du projet ?',
    options: [],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Caler le point de départ du calendrier compliance.',
      details: 'Cette date sert de référence pour estimer le temps disponible afin de mobiliser les experts et réaliser les validations obligatoires.',
      tips: [
        'Renseignez la date à laquelle le dossier complet sera transmis pour revue.',
        'Mettez à jour cette information si la soumission est décalée.'
      ]
    }
  },
  {
    id: 'q6',
    type: 'date',
    question: 'Quelle est la date de lancement souhaitée ?',
    options: [],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Projeter la fenêtre de lancement afin de vérifier la faisabilité du planning.',
      details: 'Le moteur calcule l\'écart entre soumission et lancement et le compare aux délais minimaux recommandés pour chaque équipe compliance.',
      tips: [
        'Indiquez la première date de mise en service ou de diffusion prévue.',
        'Si le planning n\'est pas figé, fournissez l\'estimation la plus réaliste pour sécuriser les ressources.'
      ]
    }
  },
  {
    id: 'q7',
    type: 'text',
    question: 'Qui est le chef de projet référent ?',
    options: [],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Identifier l\'interlocuteur principal pour les échanges compliance.',
      details: 'Cette information permet aux équipes expertes de contacter la bonne personne pour clarifier les éléments du dossier.',
      tips: [
        'Renseignez le prénom et le nom du chef de projet.',
        'Ajoutez si besoin un alias ou une précision entre parenthèses.'
      ]
    }
  },
  {
    id: 'q8',
    type: 'long_text',
    question: 'Décrivez brièvement le besoin ou le concept proposé.',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Offrir une vision synthétique du projet pour faciliter la lecture des réponses.',
      details: 'Utilisez ce bloc pour résumer le contexte, les objectifs principaux et les points d\'attention connus à date.',
      tips: [
        'Structurez votre réponse en 2 à 3 phrases clés.',
        'Mentionnez les éléments distinctifs ou contraintes majeures.'
      ]
    }
  },
  {
    id: 'q9',
    type: 'text',
    question: 'Quelle est la proposition de valeur principale à mettre en avant lors du pitch ?',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Mettre en lumière l\'angle principal qui donnera envie d\'écouter ou de soutenir le projet.',
      details: 'Une formulation claire de la proposition de valeur permet de bâtir l\'argumentaire du pitch et d\'aligner les équipes sur le bénéfice clé.',
      tips: [
        'Résumez en une phrase l\'impact différenciant du projet.',
        'Utilisez un vocabulaire orienté bénéfice plutôt que description technique.'
      ]
    }
  },
  {
    id: 'q10',
    type: 'multi_choice',
    question: 'Quels publics clés doivent être convaincus ?',
    options: [
      'Direction / sponsors internes',
      'Équipes métiers',
      'Partenaires externes',
      'Clients / utilisateurs finaux',
      'Autre (préciser dans vos notes)'
    ],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Identifier les audiences prioritaires pour adapter le message du pitch.',
      details: 'Connaitre les cibles permet d\'adapter le ton, les preuves et les arguments à mettre en avant pour chaque interlocuteur.',
      tips: [
        'Sélectionnez toutes les audiences concernées pour préparer des messages différenciés.',
        'Précisez dans vos notes les personae spécifiques si nécessaire.'
      ]
    }
  },
  {
    id: 'q11',
    type: 'long_text',
    question: 'Quels résultats mesurables ou preuves souhaitez-vous valoriser ?',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Recenser les indicateurs de succès à intégrer dans l\'argumentaire.',
      details: 'Les chiffres clés, retours utilisateurs ou faits marquants structurent la partie "preuves" du pitch et renforcent la crédibilité.',
      tips: [
        'Mentionnez des données quantitatives (KPI, ROI, nombre d\'utilisateurs) ou qualitatives (témoignages).',
        'Indiquez la source et la période de référence quand c\'est possible.'
      ]
    }
  },
  {
    id: 'q12',
    type: 'text',
    question: 'Quel appel à l\'action souhaitez-vous formuler à l\'issue du pitch ?',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Clarifier l\'attente principale vis-à-vis de l\'audience une fois le pitch terminé.',
      details: 'Savoir quelle décision, quel soutien ou quelle action est attendue aide à structurer la conclusion et les prochaines étapes.',
      tips: [
        'Soyez explicite sur la décision attendue (validation, budget, ressources, lancement pilote, etc.).',
        'Si plusieurs actions sont nécessaires, hiérarchisez-les pour guider votre audience.'
      ]
    }
  },
  {
    id: 'q13',
    type: 'multi_choice',
    question: 'Quels supports ou formats de présentation envisagez-vous ?',
    options: [
      'Pitch deck (slides)',
      'Démonstration produit / prototype',
      'Note de synthèse ou one-pager',
      'Vidéo courte',
      'Autre support (préciser dans vos notes)'
    ],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Anticiper les supports nécessaires pour préparer le pitch dans le bon format.',
      details: 'Le choix des formats influe sur la structure du pitch, les ressources de design et les délais de production.',
      tips: [
        'Sélectionnez plusieurs options si vous prévoyez un parcours multicanal (ex : réunion + support envoyé).',
        'Précisez les contraintes de durée ou de format pour chaque support si elles sont connues.'
      ]
    }
  }
];
