export const initialQuestions =  [
  {
    id: 'projectName',
    type: 'text',
    question: "Quel est le nom du projet ou de l'offre ?",
    options: [],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: "Nommer clairement l'initiative pour qu'elle soit mémorisée dès les premières secondes.",
      details: "Le nom affiché dans la vitrine marketing sert de repère pour toutes les équipes qui contribuent au pitch.",
      tips: [
        'Renseignez le nom officiel ou celui que vous souhaitez tester auprès des parties prenantes.',
        'Si un nom de code interne existe, ajoutez-le entre parenthèses pour faciliter le suivi.'
      ]
    },
    showcase: {
      sections: ['hero'],
      usage: 'Titre principal affiché dans la vitrine marketing.'
    }
  },
  {
    id: 'projectSlogan',
    type: 'text',
    question: 'Quel slogan ou promesse courte souhaitez-vous mettre en avant ?',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: "Résumer l'accroche en moins de 10 mots pour capter l'attention immédiatement.",
      details: "Le slogan apparaît dans la hero section et doit être simple, mémorable et orienté bénéfice.",
      tips: [
        'Utilisez un verbe d’action qui évoque le résultat attendu.',
        'Préférez un ton conversationnel : adressez-vous directement à votre audience.'
      ]
    },
    showcase: {
      sections: ['hero'],
      usage: 'Promesse courte située sous le nom du projet.'
    }
  },
  {
    id: 'valueProposition',
    type: 'long_text',
    question: 'Formulez votre proposition de valeur en une ou deux phrases.',
    options: [],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Clarifier ce que le projet apporte, pour qui et en quoi il est différent.',
      details: "Cette proposition de valeur structure toute la narration : elle sera reprise dans la hero section et les sections suivantes.",
      tips: [
        'Précisez le public cible, le bénéfice clé et l’impact mesurable.',
        'Évitez le jargon technique : privilégiez un langage accessible.'
      ]
    },
    showcase: {
      sections: ['hero'],
      usage: 'Résumé principal repris dans le paragraphe d’introduction.'
    }
  },
  {
    id: 'targetAudience',
    type: 'multi_choice',
    question: 'Quelles audiences doivent être convaincues en priorité ?',
    options: [
      'Grand public / clients finaux',
      'Professionnels ou experts métiers',
      'Décideurs internes / sponsors',
      'Investisseurs',
      'Partenaires ou prescripteurs'
    ],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: "Identifier les personae principaux pour adapter la narration et les preuves d'impact.",
      details: 'Chaque audience attend un angle différent : lister les cibles permet de personnaliser les sections du pitch.',
      tips: [
        'Sélectionnez plusieurs options si votre pitch est multicanal.',
        'Ajoutez des précisions dans vos notes internes si certains personae doivent recevoir un message dédié.'
      ]
    },
    showcase: {
      sections: ['hero'],
      usage: 'Badge « Audience principale » dans le bandeau de la vitrine.'
    }
  },
  {
    id: 'problemInsight',
    type: 'text',
    question: 'Quel chiffre fort ou constat illustre le problème que vous résolvez ?',
    options: [],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Ancrer le récit dans un fait marquant qui crée de la tension dramatique.',
      details: 'Cette statistique ou observation sert d’accroche dans la section “Problème”.',
      tips: [
        'Précisez la source (étude, observation terrain, retour client).',
        'Formulez la donnée sous forme de phrase courte et percutante.'
      ]
    },
    showcase: {
      sections: ['problem'],
      usage: 'Phrase introductive en surbrillance dans la section problème.'
    }
  },
  {
    id: 'problemPainPoints',
    type: 'long_text',
    question: 'Listez 2 à 3 pain points concrets vécus par vos utilisateurs.',
    options: [],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Montrer que vous comprenez la réalité terrain de votre audience.',
      details: 'Chaque pain point s’affichera comme un bullet point pour renforcer l’empathie.',
      tips: [
        'Utilisez une ligne par pain point pour faciliter la lecture.',
        'Décrivez la situation vécue plutôt que la solution souhaitée.'
      ]
    },
    showcase: {
      sections: ['problem'],
      usage: 'Liste des irritants principaux affichée dans la colonne de gauche.'
    }
  },
  {
    id: 'problemTestimonial',
    type: 'long_text',
    question: 'Partagez un témoignage utilisateur ou une mini mise en situation.',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Humaniser le problème grâce à une voix ou un scénario concret.',
      details: 'Ce témoignage sera présenté dans un encart pour créer une connexion émotionnelle.',
      tips: [
        'Privilégiez un format court (2-3 phrases) centré sur une émotion ou un obstacle.',
        'Si vous n’avez pas encore de témoignage, décrivez une scène type “avant projet”.'
      ]
    },
    showcase: {
      sections: ['problem'],
      usage: 'Encart témoignage situé à droite de la section problème.'
    }
  },
  {
    id: 'solutionDescription',
    type: 'long_text',
    question: 'Décrivez en quoi consiste votre solution ou votre service.',
    options: [],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Clarifier l’expérience proposée avant de détailler les bénéfices.',
      details: 'Cette description introduit la section “Solution” et doit rester simple à comprendre.',
      tips: [
        'Structurez en 2-3 phrases : quoi, pour qui, comment.',
        'Évitez le vocabulaire interne : imaginez que vous présentez le concept à un prospect.'
      ]
    },
    showcase: {
      sections: ['solution'],
      usage: 'Bloc « Expérience proposée » dans la partie solution.'
    }
  },
  {
    id: 'solutionBenefits',
    type: 'long_text',
    question: 'Quels bénéfices tangibles votre solution apporte-t-elle ?',
    options: [],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Mettre en avant les résultats obtenus plutôt que les fonctionnalités.',
      details: 'Chaque ligne sera transformée en bénéfice clé dans la vitrine.',
      tips: [
        'Rédigez une phrase par bénéfice, orientée résultat (“Gain de 2h par semaine”).',
        'Priorisez les bénéfices les plus différenciants pour votre audience.'
      ]
    },
    showcase: {
      sections: ['solution'],
      usage: 'Liste des bénéfices clés dans la section solution.'
    }
  },
  {
    id: 'solutionExperience',
    type: 'text',
    question: 'Quel visuel, maquette ou démonstration illustre le mieux votre solution ?',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Donner un aperçu concret de l’expérience proposée.',
      details: 'Cette information permet de suggérer un visuel ou un format immersif dans la vitrine.',
      tips: [
        'Mentionnez le support disponible (mockup, capture, vidéo, prototype).',
        'Précisez le moment du parcours où cette preuve visuelle sera présentée.'
      ]
    },
    showcase: {
      sections: ['solution'],
      usage: 'Bloc « Preuve immersive » mettant en avant le support visuel.'
    }
  },
  {
    id: 'solutionComparison',
    type: 'long_text',
    question: 'En quoi votre approche se distingue-t-elle des alternatives actuelles ?',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Souligner la différenciation sans dénigrer la concurrence.',
      details: 'Cette réponse apparaît dans la section “Solution” comme une comparaison subtile.',
      tips: [
        'Comparez-vous à un comportement ou à une solution existante plutôt qu’à un concurrent direct.',
        'Appuyez-vous sur un bénéfice mesurable ou une expérience utilisateur plus fluide.'
      ]
    },
    showcase: {
      sections: ['solution'],
      usage: 'Bloc « Pourquoi c’est différent » dans la section solution.'
    }
  },
  {
    id: 'innovationSecret',
    type: 'long_text',
    question: 'Quelle est votre “secret sauce” ou élément différenciant clé ?',
    options: [],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Expliquer en quoi votre approche dépasse les standards du marché.',
      details: 'Ce contenu nourrit la section “Innovation” et crédibilise votre avance.',
      tips: [
        'Insistez sur la méthode, la technologie ou l’insight qui change tout.',
        'Reliez cet élément différenciant à une preuve utilisateur ou métier.'
      ]
    },
    showcase: {
      sections: ['innovation'],
      usage: 'Paragraphe principal de la section innovation.'
    }
  },
  {
    id: 'innovationProcess',
    type: 'long_text',
    question: 'Comment votre équipe transforme cette innovation en expérience fluide ?',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Décrire le process ou l’architecture qui garantit une exécution sans friction.',
      details: 'Cette réponse est mise en scène comme un mini schéma narratif.',
      tips: [
        'Décrivez 3 étapes clés maximum pour garder la lecture fluide.',
        'Mentionnez les outils, rituels ou partenaires qui rendent le parcours intuitif.'
      ]
    },
    showcase: {
      sections: ['innovation'],
      usage: 'Encart explicatif sur le fonctionnement de l’innovation.'
    }
  },
  {
    id: 'marketSize',
    type: 'text',
    question: 'Quel chiffre illustre le potentiel de marché ou la traction attendue ?',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Ancrer la vision dans des données marché ou business.',
      details: 'Cette information sera mise en avant dans la section “Potentiel & impact”.',
      tips: [
        'Utilisez un indicateur simple : taille de marché, croissance, revenu projeté, etc.',
        'Précisez si possible la source ou la période de référence.'
      ]
    },
    showcase: {
      sections: ['hero', 'impact'],
      usage: 'Chiffre clé utilisé dans les encadrés « Potentiel de marché ».'
    }
  },
  {
    id: 'tractionSignals',
    type: 'long_text',
    question: 'Quelles preuves ou signaux de traction pouvez-vous mettre en avant ?',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Rassurer votre audience avec des éléments concrets (chiffres, retours, partenaires).',
      details: 'Chaque ligne sera affichée comme une preuve dans la section “Potentiel & impact”.',
      tips: [
        'Listez des chiffres clés, logos partenaires, mentions presse ou résultats de pilote.',
        'Associez chaque preuve à une courte description pour contextualiser.'
      ]
    },
    showcase: {
      sections: ['impact'],
      usage: 'Liste des signaux de traction mise en évidence dans la vitrine.'
    }
  },
  {
    id: 'visionStatement',
    type: 'long_text',
    question: 'Quelle vision inspirante souhaitez-vous partager pour conclure la narration ?',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Projeter votre audience sur le futur souhaité grâce au projet.',
      details: 'Cette phrase finale apporte une touche émotionnelle dans la section “Potentiel & impact”.',
      tips: [
        'Employez le futur ou le conditionnel pour ouvrir sur la suite.',
        'Reliez la vision à l’impact sociétal, business ou humain que vous visez.'
      ]
    },
    showcase: {
      sections: ['impact'],
      usage: 'Citation de conclusion dans la section impact.'
    }
  },
  {
    id: 'campaignKickoffDate',
    type: 'date',
    question: 'Quand débutez-vous la préparation active de la campagne ?',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Poser le point de départ du run marketing.',
      details: 'Cette date permet de calculer le runway entre préparation et lancement.',
      tips: [
        'Indiquez la date à laquelle vous souhaitez lancer la production des supports.',
        'Mettez à jour la date si la préparation démarre plus tôt ou plus tard que prévu.'
      ]
    },
    showcase: {
      sections: ['timeline'],
      usage: 'Point de départ utilisé pour calculer le runway et les prochaines étapes.'
    }
  },
  {
    id: 'launchDate',
    type: 'date',
    question: 'Quelle est la date de lancement ou de reveal souhaitée ?',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Aligner toutes les parties prenantes sur la cible de lancement.',
      details: 'Associée à la date de kick-off, cette information permet de vérifier la faisabilité du planning.',
      tips: [
        'Renseignez la première date de mise en avant (événement, publication, annonce).',
        'Si la date n’est pas figée, indiquez l’hypothèse la plus réaliste pour planifier les ressources.'
      ]
    },
    showcase: {
      sections: ['timeline'],
      usage: 'Date cible utilisée pour le calcul du runway et du calendrier.'
    }
  },
  {
    id: 'teamLead',
    type: 'text',
    question: 'Qui porte la narration et coordonne le projet ?',
    options: [],
    required: true,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Identifier la personne qui centralise les retours et valide les contenus.',
      details: "Ce contact sera mentionné dans la vitrine pour renforcer la crédibilité de l'équipe.",
      tips: [
        'Indiquez prénom, nom et rôle.',
        'Ajoutez si besoin un canal de contact (LinkedIn, e-mail) dans vos notes internes.'
      ]
    },
    showcase: {
      sections: ['team'],
      usage: 'Bloc « Lead du projet » dans la section équipe.'
    }
  },
  {
    id: 'teamCoreMembers',
    type: 'long_text',
    question: 'Quels sont les membres clés qui incarnent le projet ?',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Mettre en avant la complémentarité de l’équipe.',
      details: 'Chaque ligne sera affichée comme un membre du “collectif moteur”.',
      tips: [
        'Mentionnez pour chaque personne le rôle ou l’expertise apportée.',
        'Incluez éventuellement les partenaires ou experts externes essentiels.'
      ]
    },
    showcase: {
      sections: ['team'],
      usage: 'Liste « Collectif moteur » dans la section équipe.'
    }
  },
  {
    id: 'teamValues',
    type: 'long_text',
    question: 'Quelles valeurs ou principes guident votre équipe ?',
    options: [],
    required: false,
    conditions: [],
    conditionLogic: 'all',
    guidance: {
      objective: 'Rassurer sur la posture de l’équipe face aux parties prenantes.',
      details: 'Chaque valeur sera transformée en badge pour renforcer la signature du projet.',
      tips: [
        'Listez 3 valeurs maximum pour rester mémorable.',
        'Formulez-les de manière positive (“Transparence proactive”, “Sens du terrain”, etc.).'
      ]
    },
    showcase: {
      sections: ['team'],
      usage: 'Badges de valeurs dans la section équipe.'
    }
  }
];
