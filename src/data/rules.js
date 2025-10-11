export const initialRules =  [
  {
    id: 'rule1',
    name: 'Projet externe digital avec professionnels de santé',
    conditions: [
      { question: 'q1', operator: 'equals', value: 'Externe (professionnels de santé)' },
      { question: 'q2', operator: 'not_equals', value: 'Non' }
    ],
    conditionLogic: 'all',
    teams: ['bpp', 'it', 'legal'],
    questions: {
      bpp: ['Le contenu a-t-il été validé médicalement ?', 'Les mentions légales sont-elles conformes ?'],
      it: ["Quelles sont les mesures de sécurité prévues pour l'hébergement ?", 'Un audit de sécurité est-il planifié ?'],
      legal: ['Les CGU/CGV sont-elles conformes au Code de la Santé Publique ?']
    },
    risks: [
      {
        description: 'Communication non conforme aux bonnes pratiques promotionnelles',
        level: 'Élevé',
        mitigation: 'Validation BPP avant tout déploiement'
      }
    ],
    priority: 'Critique'
  },
  {
    id: 'rule2',
    name: 'Projet avec données de santé',
    conditions: [
      { question: 'q3', operator: 'equals', value: 'Oui - Données de santé' }
    ],
    conditionLogic: 'all',
    teams: ['privacy', 'it', 'quality', 'legal'],
    questions: {
      privacy: ['Une DPIA a-t-elle été réalisée ?', 'Le registre des traitements est-il à jour ?', 'Les consentements sont-ils conformes RGPD ?'],
      it: ["L'hébergement est-il certifié HDS ?", 'Le chiffrement des données est-il implémenté ?'],
      quality: ['Les processus respectent-ils les GxP applicables ?'],
      legal: ['Les clauses contractuelles incluent-elles les garanties RGPD ?']
    },
    risks: [
      {
        description: 'Non-conformité RGPD - Données de santé sensibles',
        level: 'Élevé',
        mitigation: 'DPIA obligatoire et hébergement HDS'
      },
      {
        description: 'Violation de données personnelles',
        level: 'Élevé',
        mitigation: 'Mesures de sécurité renforcées et chiffrement'
      }
    ],
    priority: 'Critique'
  },
  {
    id: 'rule3',
    name: 'Projet avec prestataires externes',
    conditions: [
      { question: 'q4', operator: 'equals', value: 'Oui' }
    ],
    conditionLogic: 'all',
    teams: ['legal', 'quality'],
    questions: {
      legal: ['Les contrats incluent-ils les clauses de confidentialité ?', 'Les assurances sont-elles adéquates ?'],
      quality: ['Les prestataires sont-ils qualifiés selon nos standards ?', 'Un audit fournisseur est-il prévu ?']
    },
    risks: [
      {
        description: 'Risque contractuel avec prestataires',
        level: 'Moyen',
        mitigation: 'Validation juridique des contrats avant signature'
      }
    ],
    priority: 'Important'
  },
  {
    id: 'rule4',
    name: 'Projet digital externe (patients/public)',
    conditions: [
      { question: 'q1', operator: 'equals', value: 'Externe (patients/public)' },
      { question: 'q2', operator: 'not_equals', value: 'Non' }
    ],
    conditionLogic: 'all',
    teams: ['legal', 'it', 'privacy'],
    questions: {
      legal: ["Le site respecte-t-il les obligations d'information des consommateurs ?", "L'accessibilité numérique est-elle assurée ?"],
      it: ['Les standards de sécurité web sont-ils respectés ?'],
      privacy: ['Les cookies sont-ils conformes aux règles CNIL ?', 'La politique de confidentialité est-elle claire ?']
    },
    risks: [
      {
        description: 'Non-conformité accessibilité numérique',
        level: 'Moyen',
        mitigation: 'Audit accessibilité et remédiation'
      }
    ],
    priority: 'Important'
  },
  {
    id: 'rule5',
    name: 'Respect du délai de préparation projet',
    conditions: [
      {
        type: 'timing',
        startQuestion: 'q5',
        endQuestion: 'q6',
        complianceProfiles: [
          {
            id: 'standard_preparation',
            label: 'Préparation standard',
            description: 'Délai minimal recommandé pour préparer les contributions compliance.',
            requirements: {
              bpp: 6,
              it: 6,
              legal: 6,
              privacy: 7,
              quality: 8
            },
            conditionLogic: 'all'
          },
          {
            id: 'digital_public_launch',
            label: 'Projet digital grand public',
            description: 'Projets digitaux externes nécessitent davantage de coordination.',
            conditions: [
              { question: 'q1', operator: 'equals', value: 'Externe (patients/public)' },
              { question: 'q2', operator: 'not_equals', value: 'Non' }
            ],
            requirements: {
              bpp: 8,
              it: 9,
              legal: 8,
              privacy: 8,
              quality: 10
            },
            conditionLogic: 'all'
          },
          {
            id: 'health_data_launch',
            label: 'Projet avec données de santé',
            description: 'Les projets manipulant des données de santé demandent un délai renforcé.',
            conditions: [
              { question: 'q3', operator: 'equals', value: 'Oui - Données de santé' }
            ],
            requirements: {
              it: 9,
              legal: 9,
              privacy: 12,
              quality: 10
            },
            conditionLogic: 'all'
          }
        ]
      }
    ],
    conditionLogic: 'all',
    teams: ['quality'],
    questions: {
      quality: [
        'Le rétroplanning intègre-t-il toutes les validations compliance ?',
        'Le lancement tient-il compte des actions préalables obligatoires ?'
      ]
    },
    risks: [
      {
        description: 'Lancement prévu sans délai suffisant pour les revues compliance',
        level: 'Moyen',
        mitigation: 'Reprogrammer le lancement ou accélérer les jalons de validation'
      }
    ],
    priority: 'Important'
  }
];
