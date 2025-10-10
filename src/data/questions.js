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
    guidance: {
      objective: 'Projeter la fenêtre de lancement afin de vérifier la faisabilité du planning.',
      details: 'Le moteur calcule l\'écart entre soumission et lancement et le compare aux délais minimaux recommandés pour chaque équipe compliance.',
      tips: [
        'Indiquez la première date de mise en service ou de diffusion prévue.',
        'Si le planning n\'est pas figé, fournissez l\'estimation la plus réaliste pour sécuriser les ressources.'
      ]
    }
  }
];
