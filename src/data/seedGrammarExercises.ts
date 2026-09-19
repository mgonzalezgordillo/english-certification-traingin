import type { GrammarExercise } from '../types';

export const seedGrammarExercises: GrammarExercise[] = [
  // ==========================================
  // A2 EXERCISES
  // ==========================================
  // g_pres_simple
  {
    id: 'ge_ps_1',
    conceptId: 'g_pres_simple',
    type: 'choose_form',
    cefrLevel: 'A2',
    prompt: 'Choose the correct form of the verb to complete the routine statement.',
    sentenceContext: 'Every Tuesday, Marcus _____ the marketing metrics to the regional director.',
    options: ['present', 'presents', 'is presenting', 'presented'],
    correctAnswer: 'presents',
    hints: [
      'Look at the subject: Marcus is third-person singular (he).',
      'Present Simple with he/she/it takes the -s or -es inflection.'
    ],
    explanation: 'Marcus is a 3rd person singular subject ("he"), so the verb requires the -s suffix ("presents") for a recurring weekly habit.',
    tags: ['tense_misuse', 'present simple', 'subject-verb agreement']
  },
  {
    id: 'ge_ps_2',
    conceptId: 'g_pres_simple',
    type: 'fill_in_the_blank',
    cefrLevel: 'A2',
    prompt: 'Fill in the blank with the correct negative form of the verb in brackets.',
    sentenceContext: 'Our office manager _____ (not / work) on Saturday mornings.',
    correctAnswer: "doesn't work",
    acceptedAnswers: ['does not work', "doesn't work"],
    hints: [
      'Use the 3rd person singular auxiliary "does not" or "doesn\'t".',
      'Follow the auxiliary with the base infinitive form of "work".'
    ],
    explanation: 'In negative Present Simple sentences with a 3rd person singular subject ("our office manager" = he/she), use "does not work" or "doesn\'t work".',
    tags: ['auxiliary_error', 'present simple', 'negation']
  },
  {
    id: 'ge_ps_3',
    conceptId: 'g_pres_simple',
    type: 'error_correction',
    cefrLevel: 'A2',
    prompt: 'Identify the error in the sentence and write ONLY the corrected word.',
    originalSentence: 'She don\'t like drinking espresso in the late evening.',
    errorTarget: "don't",
    correctAnswer: "doesn't",
    acceptedAnswers: ["doesn't", "does not"],
    hints: [
      'Examine the negative auxiliary verb used with "she".',
      'For third-person singular (he/she/it), the correct auxiliary is "doesn\'t", not "don\'t".'
    ],
    explanation: 'The auxiliary "don\'t" is incorrect with the third-person singular pronoun "she". The correct form is "doesn\'t".',
    tags: ['auxiliary_error', 'present simple']
  },

  // g_pres_cont
  {
    id: 'ge_pc_1',
    conceptId: 'g_pres_cont',
    type: 'multiple_choice',
    cefrLevel: 'A2',
    prompt: 'Select the best verb form to describe the situation happening right now.',
    sentenceContext: 'Please speak quietly; the technical director _____ an important client call.',
    options: ['takes', 'is taking', 'took', 'has take'],
    correctAnswer: 'is taking',
    hints: [
      'The imperative "Please speak quietly" signals that the action is happening at this very moment.',
      'Actions occurring right now take the Present Continuous (be + -ing).'
    ],
    explanation: 'The context "right now" indicated by "Please speak quietly" requires Present Continuous: "is taking".',
    tags: ['tense_misuse', 'present continuous']
  },
  {
    id: 'ge_pc_2',
    conceptId: 'g_pres_cont',
    type: 'fill_in_the_blank',
    cefrLevel: 'A2',
    prompt: 'Complete the sentence with the correct continuous form of "prepare".',
    sentenceContext: 'Right now, our software developers _____ (prepare) the next platform update.',
    correctAnswer: 'are preparing',
    acceptedAnswers: ['are preparing'],
    hints: [
      'The subject "developers" is plural (they).',
      'Use the plural auxiliary "are" followed by the -ing form of "prepare".'
    ],
    explanation: 'Plural subject "developers" requires "are preparing" for actions happening "right now".',
    tags: ['auxiliary_error', 'present continuous']
  },
  {
    id: 'ge_pc_3',
    conceptId: 'g_pres_cont',
    type: 'contrast_choice',
    cefrLevel: 'A2',
    prompt: 'Which sentence correctly avoids using a stative verb in the continuous form?',
    options: [
      'I am knowing exactly what you mean.',
      'I know exactly what you mean.',
      'I am currently knowing what you mean.',
      'I was knowing what you mean.'
    ],
    correctAnswer: 'I know exactly what you mean.',
    hints: [
      'Verbs of cognition and mental state (know, understand, believe) are stative.',
      'Stative verbs are not used in continuous (-ing) tenses.'
    ],
    explanation: '"Know" is a stative verb describing a mental state; it should be used in the simple form "I know".',
    tags: ['verb_pattern', 'stative verbs']
  },

  // g_past_simple
  {
    id: 'ge_past_1',
    conceptId: 'g_past_simple',
    type: 'choose_form',
    cefrLevel: 'A2',
    prompt: 'Select the correct past form of the irregular verb.',
    sentenceContext: 'Two days ago, our department head _____ a formal letter of recommendation.',
    options: ['writed', 'wrote', 'written', 'was wrote'],
    correctAnswer: 'wrote',
    hints: [
      '"Two days ago" specifies a finished past time anchor.',
      'The past simple form of the irregular verb "write" is "wrote".'
    ],
    explanation: '"Write" is an irregular verb whose past simple form is "wrote" (never "writed").',
    tags: ['tense_misuse', 'past simple', 'irregular verbs']
  },
  {
    id: 'ge_past_2',
    conceptId: 'g_past_simple',
    type: 'fill_in_the_blank',
    cefrLevel: 'A2',
    prompt: 'Complete the negative sentence using the verb in brackets.',
    sentenceContext: 'We _____ (not / receive) your invoice yesterday afternoon.',
    correctAnswer: "didn't receive",
    acceptedAnswers: ['did not receive', "didn't receive"],
    hints: [
      'In past simple negatives, use the auxiliary "did not" or "didn\'t".',
      'Always follow "didn\'t" with the base infinitive form.'
    ],
    explanation: 'In the past simple, negative statements use "did not / didn\'t" + bare infinitive ("receive").',
    tags: ['auxiliary_error', 'past simple']
  },
  {
    id: 'ge_past_3',
    conceptId: 'g_past_simple',
    type: 'error_correction',
    cefrLevel: 'A2',
    prompt: 'Find the mistake in the question and write ONLY the corrected word.',
    originalSentence: 'Did you saw the news announcement yesterday?',
    errorTarget: 'saw',
    correctAnswer: 'see',
    hints: [
      'The auxiliary "Did" already marks the sentence for past tense.',
      'After "Did + subject", the main verb must be in its base form.'
    ],
    explanation: 'After the auxiliary "Did", the main verb must return to its bare infinitive form "see" ("Did you see...").',
    tags: ['auxiliary_error', 'past simple']
  },

  // g_past_cont
  {
    id: 'ge_pcont_1',
    conceptId: 'g_past_cont',
    type: 'multiple_choice',
    cefrLevel: 'A2',
    prompt: 'Choose the correct combination of past tenses to describe an interrupted action.',
    sentenceContext: 'While he _____ to the airport, his tire suddenly punctured.',
    options: ['drove', 'was driving', 'is driving', 'had driven'],
    correctAnswer: 'was driving',
    hints: [
      'The longer ongoing background action takes the Past Continuous after "While".',
      'The shorter interrupting action is in the Past Simple (punctured).'
    ],
    explanation: '"While" introduces the ongoing background action in progress in the past: "was driving".',
    tags: ['tense_misuse', 'past continuous']
  },
  {
    id: 'ge_pcont_2',
    conceptId: 'g_past_cont',
    type: 'fill_in_the_blank',
    cefrLevel: 'A2',
    prompt: 'Complete the sentence with the past continuous form of "work".',
    sentenceContext: 'At 8:00 PM yesterday, the whole engineering crew _____ (work) overtime.',
    correctAnswer: 'was working',
    acceptedAnswers: ['was working', 'were working'],
    hints: [
      'Use was/were + working to describe an activity in progress at a specific past point in time.',
      'The crew was in the middle of working.'
    ],
    explanation: 'Describes an action in progress at a specific past moment ("At 8:00 PM yesterday").',
    tags: ['tense_misuse', 'past continuous']
  },

  // g_future_will
  {
    id: 'ge_will_1',
    conceptId: 'g_future_will',
    type: 'choose_form',
    cefrLevel: 'A2',
    prompt: 'Choose the most natural future expression for a spontaneous offer.',
    sentenceContext: '"Those presentation boxes look very heavy." — "Wait, I _____ you carry them upstairs."',
    options: ['will help', 'am helping', 'help', 'helped'],
    correctAnswer: 'will help',
    hints: [
      'The speaker makes an instant decision to help at the moment of speaking.',
      'Spontaneous offers and on-the-spot decisions use "will".'
    ],
    explanation: 'A spontaneous offer made right at the moment of speaking requires "will" ("I will help you").',
    tags: ['modal_misuse', 'future will']
  },
  {
    id: 'ge_will_2',
    conceptId: 'g_future_will',
    type: 'error_correction',
    cefrLevel: 'A2',
    prompt: 'Correct the mistake by writing the correct verb phrase.',
    originalSentence: 'I promise that I will to call you as soon as I land.',
    errorTarget: 'will to call',
    correctAnswer: 'will call',
    hints: [
      'Modal verbs like "will" are followed by the bare infinitive.',
      'Remove the unnecessary preposition "to".'
    ],
    explanation: 'The modal auxiliary "will" must be followed directly by the bare infinitive: "will call".',
    tags: ['modal_misuse', 'bare infinitive']
  },

  // g_future_going_to
  {
    id: 'ge_gt_1',
    conceptId: 'g_future_going_to',
    type: 'multiple_choice',
    cefrLevel: 'A2',
    prompt: 'Choose the correct form based on present physical evidence.',
    sentenceContext: 'Look at those dark storm clouds! It _____ rain in a few minutes.',
    options: ['will', 'is going to', 'shall', 'is raining to'],
    correctAnswer: 'is going to',
    hints: [
      'There is clear, visible evidence in the present (dark storm clouds).',
      'Predictions based on visible signs use "be going to".'
    ],
    explanation: 'When a prediction is based on observable present evidence (the clouds), English prefers "is going to".',
    tags: ['tense_misuse', 'be going to']
  },
  {
    id: 'ge_gt_2',
    conceptId: 'g_future_going_to',
    type: 'fill_in_the_blank',
    cefrLevel: 'A2',
    prompt: 'Complete with the correct form of "be going to" + "launch".',
    sentenceContext: 'Our marketing department _____ (launch) the social media campaign next week; everything is planned.',
    correctAnswer: 'is going to launch',
    acceptedAnswers: ['is going to launch'],
    hints: [
      '"Our marketing department" is singular (it).',
      'Use is + going to + launch.'
    ],
    explanation: 'Pre-arranged plans and intentions use "be going to": "is going to launch".',
    tags: ['tense_misuse', 'be going to']
  },

  // g_pres_cont_future
  {
    id: 'ge_pcf_1',
    conceptId: 'g_pres_cont_future',
    type: 'choose_form',
    cefrLevel: 'A2',
    prompt: 'Select the most natural form for an already scheduled personal appointment.',
    sentenceContext: 'I can\'t attend the lunch meeting because I _____ the dentist at 1:30 PM.',
    options: ['am seeing', 'will see', 'see', 'saw'],
    correctAnswer: 'am seeing',
    hints: [
      'This is a fixed personal arrangement already on the calendar.',
      'Present Continuous is the most natural form for diary appointments.'
    ],
    explanation: 'Fixed calendar arrangements with appointments use the Present Continuous: "am seeing".',
    tags: ['tense_misuse', 'future arrangements']
  },

  // g_comparatives
  {
    id: 'ge_comp_1',
    conceptId: 'g_comparatives',
    type: 'fill_in_the_blank',
    cefrLevel: 'A2',
    prompt: 'Complete the sentence with the comparative form of the adjective in brackets.',
    sentenceContext: 'Public transport in Vienna is much _____ (cheap) than in London.',
    correctAnswer: 'cheaper',
    acceptedAnswers: ['cheaper'],
    hints: [
      '"Cheap" is a one-syllable adjective.',
      'Add the suffix "-er" to one-syllable adjectives.'
    ],
    explanation: 'Short 1-syllable adjectives take the -er suffix: "cheaper".',
    tags: ['quantifier', 'comparatives']
  },
  {
    id: 'ge_comp_2',
    conceptId: 'g_comparatives',
    type: 'error_correction',
    cefrLevel: 'A2',
    prompt: 'Correct the connector error by writing ONLY the correct replacement word.',
    originalSentence: 'Travelling by electric car is more sustainable that using diesel.',
    errorTarget: 'that',
    correctAnswer: 'than',
    hints: [
      'In comparative structures, which word links the two compared items?',
      'Do not confuse "that" with "than".'
    ],
    explanation: 'Comparative adjectives are followed by "than", never "that".',
    tags: ['connector', 'comparatives']
  },

  // g_superlatives
  {
    id: 'ge_sup_1',
    conceptId: 'g_superlatives',
    type: 'choose_form',
    cefrLevel: 'A2',
    prompt: 'Choose the correct superlative form.',
    sentenceContext: 'This cybersecurity breach is _____ incident our firm has ever faced.',
    options: ['the most serious', 'more serious', 'most serious', 'the seriousest'],
    correctAnswer: 'the most serious',
    hints: [
      '"Serious" has three syllables.',
      'Long adjectives use "the most + adjective" in the superlative.'
    ],
    explanation: 'Multi-syllable adjectives form the superlative with "the most": "the most serious".',
    tags: ['quantifier', 'superlatives']
  },
  {
    id: 'ge_sup_2',
    conceptId: 'g_superlatives',
    type: 'error_correction',
    cefrLevel: 'A2',
    prompt: 'Correct the double superlative by writing ONLY the corrected adjective.',
    originalSentence: 'Tokyo is one of the most largest metropolitan areas on Earth.',
    errorTarget: 'most largest',
    correctAnswer: 'largest',
    hints: [
      'Do not combine "most" with an adjective that already has "-est".',
      'The superlative of "large" is simply "largest".'
    ],
    explanation: 'Double superlatives are incorrect. Use "largest" without "most".',
    tags: ['quantifier', 'superlatives']
  },

  // g_count_uncount
  {
    id: 'ge_cu_1',
    conceptId: 'g_count_uncount',
    type: 'choose_form',
    cefrLevel: 'A2',
    prompt: 'Select the correct quantifier for the uncountable noun "information".',
    sentenceContext: 'We do not have _____ information about the prospective investor yet.',
    options: ['many', 'much', 'a lot', 'several'],
    correctAnswer: 'much',
    hints: [
      '"Information" is an uncountable noun.',
      'In negative sentences, uncountable nouns take "much", while countable nouns take "many".'
    ],
    explanation: '"Information" is uncountable, so in negative statements we use "much" ("not much information").',
    tags: ['quantifier', 'uncountable nouns']
  },
  {
    id: 'ge_cu_2',
    conceptId: 'g_count_uncount',
    type: 'error_correction',
    cefrLevel: 'A2',
    prompt: 'Correct the pluralization error for the uncountable noun.',
    originalSentence: 'The career advisor gave me several useful advices.',
    errorTarget: 'advices',
    correctAnswer: 'pieces of advice',
    acceptedAnswers: ['advice', 'pieces of advice'],
    hints: [
      '"Advice" cannot be pluralized with an "-s".',
      'You can say "useful advice" or "pieces of advice".'
    ],
    explanation: '"Advice" is uncountable in English; it cannot take an "-s". Use "advice" or "pieces of advice".',
    tags: ['quantifier', 'uncountable nouns']
  },

  // g_modals_basic
  {
    id: 'ge_mb_1',
    conceptId: 'g_modals_basic',
    type: 'multiple_choice',
    cefrLevel: 'A2',
    prompt: 'Choose the correct modal verb for polite requests.',
    sentenceContext: '_____ you please forward me the quarterly spreadsheet when you finish?',
    options: ['Could', 'Must', 'Should', 'May'],
    correctAnswer: 'Could',
    hints: [
      'This is a polite request directed at another person.',
      '"Could you please..." is the standard polite formula.'
    ],
    explanation: '"Could you please..." is the polite standard formula for making requests.',
    tags: ['modal_misuse', 'polite requests']
  },

  // ==========================================
  // B1 EXERCISES
  // ==========================================
  // g_pres_perf
  {
    id: 'ge_pp_1',
    conceptId: 'g_pres_perf',
    type: 'fill_in_the_blank',
    cefrLevel: 'B1',
    prompt: 'Complete the sentence with the Present Perfect form of "visit".',
    sentenceContext: 'Dr. Evans _____ (visit) our laboratory three times this year.',
    correctAnswer: 'has visited',
    acceptedAnswers: ['has visited'],
    hints: [
      'The subject "Dr. Evans" is 3rd person singular (he/she).',
      'Use has + past participle (visited).'
    ],
    explanation: '"This year" is an unfinished time period; with 3rd person singular, use "has visited".',
    tags: ['tense_misuse', 'present perfect']
  },
  {
    id: 'ge_pp_2',
    conceptId: 'g_pres_perf',
    type: 'sentence_transformation',
    cefrLevel: 'B1',
    prompt: 'Complete the second sentence so it has a similar meaning to the first, using the word given.',
    originalSentence: 'I started working at this software agency three years ago.',
    keyWord: 'FOR',
    sentenceContext: 'I have worked at this software agency _____ .',
    correctAnswer: 'for three years',
    hints: [
      'Use "for" to express duration from a past starting point to the present.',
      'Combine "for" with the time period "three years".'
    ],
    explanation: 'Present Perfect + "for three years" denotes an action beginning in the past and continuing up to the present.',
    tags: ['tense_misuse', 'present perfect', 'sentence transformation']
  },
  {
    id: 'ge_pp_3',
    conceptId: 'g_pres_perf',
    type: 'choose_form',
    cefrLevel: 'B1',
    prompt: 'Choose the correct particle for an action completed moments ago.',
    sentenceContext: 'The courier has _____ delivered the signed contract to our reception desk.',
    options: ['just', 'yet', 'still', 'ever'],
    correctAnswer: 'just',
    hints: [
      'Which adverb indicates that an event occurred very recently, moments ago?',
      'Place it between the auxiliary "has" and the past participle.'
    ],
    explanation: '"Just" with Present Perfect signifies that an action happened a very short time ago.',
    tags: ['tense_misuse', 'adverbs', 'just already yet']
  },

  // g_pres_perf_vs_past
  {
    id: 'ge_pp_vs_past_1',
    conceptId: 'g_pres_perf_vs_past',
    type: 'contrast_choice',
    cefrLevel: 'B1',
    prompt: 'Select the sentence that is grammatically correct regarding time anchors.',
    options: [
      'I have seen that documentary yesterday evening.',
      'I saw that documentary yesterday evening.',
      'I have saw that documentary yesterday evening.',
      'I was seen that documentary yesterday evening.'
    ],
    correctAnswer: 'I saw that documentary yesterday evening.',
    hints: [
      '"Yesterday evening" is a specific finished past time marker.',
      'Finished time markers require the Past Simple, never the Present Perfect.'
    ],
    explanation: 'Specific finished time expressions ("yesterday evening") require the Past Simple "saw".',
    tags: ['tense_misuse', 'past simple vs present perfect']
  },
  {
    id: 'ge_pp_vs_past_2',
    conceptId: 'g_pres_perf_vs_past',
    type: 'choose_form',
    cefrLevel: 'B1',
    prompt: 'Choose the correct tense based on the lifetime context.',
    sentenceContext: 'Agatha Christie _____ over 60 detective novels during her lifetime.',
    options: ['wrote', 'has written', 'had wrote', 'writes'],
    correctAnswer: 'wrote',
    hints: [
      'Agatha Christie is deceased; her lifetime is a finished past period.',
      'Actions in a finished lifetime require the Past Simple.'
    ],
    explanation: 'Because Agatha Christie is dead, her lifetime is finished, requiring Past Simple "wrote" rather than Present Perfect.',
    tags: ['tense_misuse', 'lifetime finished period']
  },

  // g_pres_perf_cont
  {
    id: 'ge_ppc_1',
    conceptId: 'g_pres_perf_cont',
    type: 'fill_in_the_blank',
    cefrLevel: 'B1',
    prompt: 'Complete with the Present Perfect Continuous of "study".',
    sentenceContext: 'She is exhausted because she _____ (study) since early this morning.',
    correctAnswer: 'has been studying',
    acceptedAnswers: ['has been studying'],
    hints: [
      'Use has + been + verb-ing.',
      'Subject is "she" (3rd person singular).'
    ],
    explanation: 'The present result (exhaustion) is explained by the continuous past activity: "has been studying".',
    tags: ['tense_misuse', 'present perfect continuous']
  },
  {
    id: 'ge_ppc_2',
    conceptId: 'g_pres_perf_cont',
    type: 'choose_form',
    cefrLevel: 'B1',
    prompt: 'Choose the correct form to ask about duration.',
    sentenceContext: 'How long _____ for the bus to arrive?',
    options: [
      'have you been waiting',
      'are you waiting',
      'do you wait',
      'had you waited'
    ],
    correctAnswer: 'have you been waiting',
    hints: [
      '"How long" asks about duration extending up to the present moment.',
      'Use Present Perfect Continuous for actions that started in the past and are still ongoing.'
    ],
    explanation: 'To inquire about duration continuing into the present, use "How long have you been waiting?".',
    tags: ['tense_misuse', 'how long', 'duration']
  },

  // g_cond_first
  {
    id: 'ge_cf_1',
    conceptId: 'g_cond_first',
    type: 'choose_form',
    cefrLevel: 'B1',
    prompt: 'Choose the correct verb form for the conditional clause.',
    sentenceContext: 'If the weather _____ favorable tomorrow, we will conduct the outdoor site survey.',
    options: ['is', 'will be', 'would be', 'was'],
    correctAnswer: 'is',
    hints: [
      'In first conditional sentences, which tense goes in the "if" clause?',
      'Even though it refers to the future, use the Present Simple after "if".'
    ],
    explanation: 'The "if" clause of a first conditional takes the Present Simple ("is"), never "will be".',
    tags: ['conditional_structure', 'first conditional']
  },
  {
    id: 'ge_cf_2',
    conceptId: 'g_cond_first',
    type: 'sentence_transformation',
    cefrLevel: 'B1',
    prompt: 'Rewrite using UNLESS without changing the meaning.',
    originalSentence: 'If you do not register before Friday, you cannot attend the conference.',
    keyWord: 'UNLESS',
    sentenceContext: 'You cannot attend the conference _____ before Friday.',
    correctAnswer: 'unless you register',
    hints: [
      '"Unless" means "if not".',
      'Do not include the negative auxiliary "do not" after "unless".'
    ],
    explanation: '"Unless you register" replaces "if you do not register" without double negation.',
    tags: ['conditional_structure', 'unless', 'sentence transformation']
  },

  // g_cond_second
  {
    id: 'ge_cs_1',
    conceptId: 'g_cond_second',
    type: 'choose_form',
    cefrLevel: 'B1',
    prompt: 'Select the correct hypothetical verb form.',
    sentenceContext: 'If I _____ more fluent in German, I would apply for the Munich branch transfer.',
    options: ['were', 'would be', 'am', 'will be'],
    correctAnswer: 'were',
    hints: [
      'The main clause has "would apply", indicating a Second Conditional.',
      'The "if" clause requires the Past Simple; formal English uses "were" for all persons.'
    ],
    explanation: 'The Second Conditional condition clause uses the Past Simple: "were" (or was) in hypothetical situations.',
    tags: ['conditional_structure', 'second conditional']
  },
  {
    id: 'ge_cs_2',
    conceptId: 'g_cond_second',
    type: 'fill_in_the_blank',
    cefrLevel: 'B1',
    prompt: 'Complete the main clause of this second conditional sentence.',
    sentenceContext: 'If we had a larger marketing budget, we _____ (hire) an external agency.',
    correctAnswer: 'would hire',
    acceptedAnswers: ['would hire', 'could hire'],
    hints: [
      'The "if" clause is in the Past Simple ("If we had...").',
      'The hypothetical result clause takes would + bare infinitive.'
    ],
    explanation: 'In the Second Conditional, the consequence clause uses "would + base verb" ("would hire").',
    tags: ['conditional_structure', 'second conditional']
  },

  // g_modals_b1
  {
    id: 'ge_mb1_1',
    conceptId: 'g_modals_b1',
    type: 'choose_form',
    cefrLevel: 'B1',
    prompt: 'Choose the correct modal to express lack of obligation (optional activity).',
    sentenceContext: 'You _____ print the ticket; showing the QR code on your phone is sufficient.',
    options: ["don't have to", "mustn't", "shouldn't", "can't"],
    correctAnswer: "don't have to",
    hints: [
      'Printing the ticket is optional, not forbidden.',
      '"Mustn\'t" means forbidden; "don\'t have to" means not necessary.'
    ],
    explanation: '"Don\'t have to" expresses that something is not necessary (optional). "Mustn\'t" would mean prohibited.',
    tags: ['modal_misuse', 'lack of obligation']
  },
  {
    id: 'ge_mb1_2',
    conceptId: 'g_modals_b1',
    type: 'error_correction',
    cefrLevel: 'B1',
    prompt: 'Correct the past obligation modal error.',
    originalSentence: 'Yesterday I must visit three clients in three different cities.',
    errorTarget: 'must',
    correctAnswer: 'had to',
    hints: [
      '"Must" does not have a past tense form.',
      'Use the past form of "have to" to express past obligation.'
    ],
    explanation: '"Must" cannot be used for past obligations. The past form of obligation is "had to".',
    tags: ['modal_misuse', 'past obligation']
  },

  // g_rel_clauses_def
  {
    id: 'ge_rcd_1',
    conceptId: 'g_rel_clauses_def',
    type: 'choose_form',
    cefrLevel: 'B1',
    prompt: 'Select the correct relative pronoun referring to possession.',
    sentenceContext: 'We interviewed the candidate _____ portfolio demonstrated the greatest design innovation.',
    options: ['whose', 'who', 'which', 'that'],
    correctAnswer: 'whose',
    hints: [
      'The sentence refers to the portfolio belonging to the candidate.',
      'Use "whose" to indicate possession for people.'
    ],
    explanation: '"Whose" is the relative pronoun indicating possession ("the candidate whose portfolio").',
    tags: ['relative_clause', 'whose']
  },
  {
    id: 'ge_rcd_2',
    conceptId: 'g_rel_clauses_def',
    type: 'error_correction',
    cefrLevel: 'B1',
    prompt: 'Identify the unnecessary repeated pronoun in the relative clause.',
    originalSentence: 'The software update which the engineers deployed it broke the login system.',
    errorTarget: 'it',
    correctAnswer: '',
    acceptedAnswers: ['it', 'delete it'],
    hints: [
      '"Which" already serves as the object of the relative clause.',
      'Remove the redundant pronoun "it".'
    ],
    explanation: 'In a relative clause, do not repeat the object pronoun ("it") because the relative pronoun ("which") already represents the object.',
    tags: ['relative_clause', 'redundant pronoun']
  },

  // g_passive_basic
  {
    id: 'ge_pb_1',
    conceptId: 'g_passive_basic',
    type: 'sentence_transformation',
    cefrLevel: 'B1',
    prompt: 'Transform the active sentence into the passive voice.',
    originalSentence: 'A famous Japanese architect designed this building in 1995.',
    keyWord: 'WAS',
    sentenceContext: 'This building _____ by a famous Japanese architect in 1995.',
    correctAnswer: 'was designed',
    hints: [
      'Past simple passive uses was/were + past participle.',
      '"This building" is singular.'
    ],
    explanation: 'The past simple passive of "designed" for a singular subject is "was designed".',
    tags: ['passive_voice', 'sentence transformation']
  },
  {
    id: 'ge_pb_2',
    conceptId: 'g_passive_basic',
    type: 'choose_form',
    cefrLevel: 'B1',
    prompt: 'Choose the correct passive verb form.',
    sentenceContext: 'Every morning, millions of commercial emails _____ by spam filters.',
    options: ['are blocked', 'blocked', 'are blocking', 'is blocked'],
    correctAnswer: 'are blocked',
    hints: [
      'The subject "millions of commercial emails" is plural.',
      'Present simple passive requires are + past participle.'
    ],
    explanation: 'Plural subject "millions of emails" requires "are blocked" in the present passive.',
    tags: ['passive_voice', 'present passive']
  },

  // g_reported_speech_basic
  {
    id: 'ge_rsb_1',
    conceptId: 'g_reported_speech_basic',
    type: 'sentence_transformation',
    cefrLevel: 'B1',
    prompt: 'Rewrite the direct quote as reported speech with appropriate backshift.',
    originalSentence: '"I will email the proposal tomorrow," Julian said.',
    keyWord: 'WOULD',
    sentenceContext: 'Julian said that he _____ the proposal the following day.',
    correctAnswer: 'would email',
    hints: [
      'In reported speech with a past reporting verb, "will" shifts to "would".',
      'Follow "would" with the bare infinitive "email".'
    ],
    explanation: '"Will" shifts back to "would" in reported speech when the reporting verb is in the past ("said").',
    tags: ['tense_misuse', 'reported speech', 'backshift']
  },
  {
    id: 'ge_rsb_2',
    conceptId: 'g_reported_speech_basic',
    type: 'error_correction',
    cefrLevel: 'B1',
    prompt: 'Correct the reporting verb error.',
    originalSentence: 'She said me that the conference had been postponed.',
    errorTarget: 'said me',
    correctAnswer: 'told me',
    hints: [
      'Which verb takes a direct personal object without "to": say or tell?',
      'Use the past tense form of "tell".'
    ],
    explanation: '"Tell" takes a direct personal object ("told me"), whereas "say" requires "to" ("said to me").',
    tags: ['verb_pattern', 'say vs tell']
  },

  // g_gerund_inf_patterns
  {
    id: 'ge_gip_1',
    conceptId: 'g_gerund_inf_patterns',
    type: 'choose_form',
    cefrLevel: 'B1',
    prompt: 'Choose the correct verb pattern following "decided".',
    sentenceContext: 'After extensive market research, the executive board decided _____ the product rollout.',
    options: ['to delay', 'delaying', 'delay', 'for delaying'],
    correctAnswer: 'to delay',
    hints: [
      'Does "decide" take a gerund (-ing) or an infinitive (to + verb)?',
      '"Decide" is followed by the to-infinitive.'
    ],
    explanation: 'The verb "decide" is followed by the to-infinitive: "decided to delay".',
    tags: ['verb_pattern', 'gerund vs infinitive']
  },
  {
    id: 'ge_gip_2',
    conceptId: 'g_gerund_inf_patterns',
    type: 'contrast_choice',
    cefrLevel: 'B1',
    prompt: 'Which sentence means that someone terminated a habit?',
    options: [
      'He stopped to drink coffee on his way to work.',
      'He stopped drinking coffee because it disrupted his sleep.',
      'He stopped for drinking coffee.',
      'He was stopped to drink coffee.'
    ],
    correctAnswer: 'He stopped drinking coffee because it disrupted his sleep.',
    hints: [
      '"Stop + -ing" means quitting or ending a habit.',
      '"Stop + to-infinitive" means interrupting an activity in order to do something else.'
    ],
    explanation: '"Stop drinking" means quitting the habit entirely, whereas "stop to drink" means pausing another activity in order to have coffee.',
    tags: ['verb_pattern', 'stop -ing vs stop to']
  },

  // g_used_to
  {
    id: 'ge_ut_1',
    conceptId: 'g_used_to',
    type: 'choose_form',
    cefrLevel: 'B1',
    prompt: 'Select the correct structure for becoming accustomed to something.',
    sentenceContext: 'Living in London was difficult at first, but I gradually got used _____ on the left.',
    options: ['to driving', 'to drive', 'driving', 'drive'],
    correctAnswer: 'to driving',
    hints: [
      'In "get used to", "to" is a preposition.',
      'Prepositions must be followed by a gerund (-ing) or a noun.'
    ],
    explanation: 'In "be/get used to", "to" is a preposition and must be followed by the gerund form "driving".',
    tags: ['verb_pattern', 'be used to']
  },
  {
    id: 'ge_ut_2',
    conceptId: 'g_used_to',
    type: 'error_correction',
    cefrLevel: 'B1',
    prompt: 'Correct the negative past habit error.',
    originalSentence: 'I didn\'t used to like sushi when I was a child.',
    errorTarget: 'didn\'t used to',
    correctAnswer: "didn't use to",
    hints: [
      'After the past auxiliary "didn\'t", the verb drops the "-d".',
      'The base form is "use to".'
    ],
    explanation: 'In negative and question forms with "did", the form is "didn\'t use to" without the final "d".',
    tags: ['auxiliary_error', 'used to']
  },

  // g_too_enough
  {
    id: 'ge_te_1',
    conceptId: 'g_too_enough',
    type: 'sentence_transformation',
    cefrLevel: 'B1',
    prompt: 'Complete the second sentence using ENOUGH so that it means the same.',
    originalSentence: 'The room was too noisy for us to concentrate properly.',
    keyWord: 'ENOUGH',
    sentenceContext: 'The room was not _____ for us to concentrate properly.',
    correctAnswer: 'quiet enough',
    hints: [
      'What is the opposite of "noisy"?',
      'Remember word order: Adjective + enough.'
    ],
    explanation: '"Too noisy" equates to "not quiet enough". "Enough" follows the adjective: "quiet enough".',
    tags: ['word_order', 'too enough', 'sentence transformation']
  },
  {
    id: 'ge_te_2',
    conceptId: 'g_too_enough',
    type: 'choose_form',
    cefrLevel: 'B1',
    prompt: 'Choose the correct position and modifier.',
    sentenceContext: 'Do we have _____ to finance the new expansion project?',
    options: ['enough capital', 'capital enough', 'too much capital', 'so capital'],
    correctAnswer: 'enough capital',
    hints: [
      'Where does "enough" go when modifying a noun (capital)?',
      '"Enough" precedes nouns: enough + noun.'
    ],
    explanation: '"Enough" precedes nouns ("enough capital"), but follows adjectives ("rich enough").',
    tags: ['word_order', 'enough']
  },

  // g_so_such
  {
    id: 'ge_ss_1',
    conceptId: 'g_so_such',
    type: 'choose_form',
    cefrLevel: 'B1',
    prompt: 'Select "so" or "such" for an adjective-noun phrase.',
    sentenceContext: 'It was _____ an extraordinary achievement that the entire team received bonuses.',
    options: ['such', 'so', 'too', 'as'],
    correctAnswer: 'such',
    hints: [
      'The phrase contains an article, adjective, and noun: "an extraordinary achievement".',
      'Use "such" before (a/an) + adjective + noun.'
    ],
    explanation: 'Before "(a/an) + adjective + noun", use "such": "such an extraordinary achievement".',
    tags: ['connector', 'so vs such']
  },
  {
    id: 'ge_ss_2',
    conceptId: 'g_so_such',
    type: 'sentence_transformation',
    cefrLevel: 'B1',
    prompt: 'Rewrite the sentence using SO.',
    originalSentence: 'It was such a hot day that we decided to stay inside.',
    keyWord: 'SO',
    sentenceContext: 'The day was _____ that we decided to stay inside.',
    correctAnswer: 'so hot',
    hints: [
      '"So" directly modifies the adjective without the noun.',
      'Combine "so" + "hot".'
    ],
    explanation: '"Such a hot day" transforms into "The day was so hot that...".',
    tags: ['connector', 'so vs such', 'sentence transformation']
  },

  // ==========================================
  // B2 EXERCISES
  // ==========================================
  // g_cond_third
  {
    id: 'ge_ct_1',
    conceptId: 'g_cond_third',
    type: 'choose_form',
    cefrLevel: 'B2',
    prompt: 'Choose the correct form for an unreal past condition and result.',
    sentenceContext: 'If we _____ the warning signs earlier, we would have averted the PR crisis.',
    options: ['had spotted', 'would have spotted', 'spotted', 'have spotted'],
    correctAnswer: 'had spotted',
    hints: [
      'The consequence clause is "would have averted" (Third Conditional).',
      'The "if" clause in the Third Conditional requires the Past Perfect (had + V3).'
    ],
    explanation: 'In the Third Conditional, the "if" clause takes the Past Perfect ("had spotted"), never "would have".',
    tags: ['conditional_structure', 'third conditional']
  },
  {
    id: 'ge_ct_2',
    conceptId: 'g_cond_third',
    type: 'sentence_transformation',
    cefrLevel: 'B2',
    prompt: 'Rewrite using Third Conditional without changing meaning.',
    originalSentence: 'I missed the flight because my alarm clock did not go off.',
    keyWord: 'OFF',
    sentenceContext: 'If my alarm clock had gone _____ , I would not have missed the flight.',
    correctAnswer: 'off',
    hints: [
      'The phrasal verb is "go off" (past participle: "gone off").',
      'The sentence requires completing the particle "off".'
    ],
    explanation: 'Third conditional: "If my alarm clock had gone off, I would not have missed the flight."',
    tags: ['conditional_structure', 'third conditional', 'sentence transformation']
  },

  // g_cond_mixed
  {
    id: 'ge_cm_1',
    conceptId: 'g_cond_mixed',
    type: 'multiple_choice',
    cefrLevel: 'B2',
    prompt: 'Select the verb form that connects a past action with a present consequence.',
    sentenceContext: 'If he had accepted the university scholarship last year, he _____ in Boston right now.',
    options: ['would be living', 'would have lived', 'will live', 'lived'],
    correctAnswer: 'would be living',
    hints: [
      'Notice the time marker in the result clause: "right now".',
      'A past hypothetical condition with a present result uses would + base verb / continuous form.'
    ],
    explanation: 'Mixed conditional: past condition ("had accepted") leading to a present continuous state ("would be living right now").',
    tags: ['conditional_structure', 'mixed conditionals']
  },

  // g_passive_adv
  {
    id: 'ge_pa_1',
    conceptId: 'g_passive_adv',
    type: 'choose_form',
    cefrLevel: 'B2',
    prompt: 'Select the correct personal passive reporting structure.',
    sentenceContext: 'The former chief executive is believed _____ the country under an assumed identity.',
    options: ['to have fled', 'having fled', 'to flee', 'fled'],
    correctAnswer: 'to have fled',
    hints: [
      'The action (fleeing) occurred BEFORE the present belief.',
      'To indicate an earlier past action with a passive reporting verb, use the perfect infinitive (to have + V3).'
    ],
    explanation: 'Personal passive reporting structures referring to a prior action use "to have + past participle": "is believed to have fled".',
    tags: ['passive_voice', 'advanced passive', 'impersonal reporting']
  },
  {
    id: 'ge_pa_2',
    conceptId: 'g_passive_adv',
    type: 'sentence_transformation',
    cefrLevel: 'B2',
    prompt: 'Rewrite using a causative structure with HAD.',
    originalSentence: 'A professional technician repaired my damaged laptop yesterday.',
    keyWord: 'HAD',
    sentenceContext: 'I _____ repaired by a professional technician yesterday.',
    correctAnswer: 'had my damaged laptop',
    acceptedAnswers: ['had my damaged laptop', 'had my laptop'],
    hints: [
      'Causative structure: have + object + past participle.',
      'Place "my damaged laptop" between "had" and "repaired".'
    ],
    explanation: 'The causative formula "had + object + past participle" produces "I had my damaged laptop repaired".',
    tags: ['passive_voice', 'causative', 'sentence transformation']
  },

  // g_modals_deduction
  {
    id: 'ge_md_1',
    conceptId: 'g_modals_deduction',
    type: 'choose_form',
    cefrLevel: 'B2',
    prompt: 'Select the modal deduction for high negative certainty in the past.',
    sentenceContext: 'David _____ committed the security violation; he was on annual leave abroad all week.',
    options: ["can't have", "mustn't have", "shouldn't have", "might not"],
    correctAnswer: "can't have",
    hints: [
      'It is logically impossible that he did it based on clear alibi evidence.',
      'For negative past deduction (impossible), use "can\'t have", never "mustn\'t have".'
    ],
    explanation: 'In logical deduction, negative certainty in the past is expressed with "can\'t have + V3". "Mustn\'t have" is incorrect.',
    tags: ['modal_misuse', 'modal deduction', 'negative deduction']
  },
  {
    id: 'ge_md_2',
    conceptId: 'g_modals_deduction',
    type: 'fill_in_the_blank',
    cefrLevel: 'B2',
    prompt: 'Complete with the past deduction form of "forget" indicating 95% positive certainty.',
    sentenceContext: 'The lights are still off; she _____ (must / forget) about our early morning briefing.',
    correctAnswer: 'must have forgotten',
    acceptedAnswers: ['must have forgotten'],
    hints: [
      'Use must + have + past participle.',
      'The past participle of "forget" is "forgotten".'
    ],
    explanation: 'Positive past deduction based on strong evidence uses "must have + past participle" ("must have forgotten").',
    tags: ['modal_misuse', 'modal deduction', 'must have']
  },

  // g_reported_adv
  {
    id: 'ge_ra_1',
    conceptId: 'g_reported_adv',
    type: 'choose_form',
    cefrLevel: 'B2',
    prompt: 'Choose the correct preposition and form following "apologized".',
    sentenceContext: 'The airline representative apologized _____ the flight delay without prior notice.',
    options: ['for causing', 'to cause', 'of causing', 'by causing'],
    correctAnswer: 'for causing',
    hints: [
      'What preposition follows the verb "apologize"?',
      'The pattern is: apologize for + -ing.'
    ],
    explanation: 'The reporting verb "apologize" requires the preposition "for" followed by a gerund: "apologized for causing".',
    tags: ['verb_pattern', 'reporting verbs', 'preposition']
  },
  {
    id: 'ge_ra_2',
    conceptId: 'g_reported_adv',
    type: 'sentence_transformation',
    cefrLevel: 'B2',
    prompt: 'Rewrite the sentence using the verb DENIED.',
    originalSentence: '"I did not leak the confidential financial forecast," the analyst stated.',
    keyWord: 'DENIED',
    sentenceContext: 'The analyst _____ the confidential financial forecast.',
    correctAnswer: 'denied leaking',
    acceptedAnswers: ['denied leaking', 'denied having leaked'],
    hints: [
      'The verb "deny" is followed by a gerund (-ing) or perfect gerund (having leaked).',
      'Combine "denied" with "leaking".'
    ],
    explanation: '"Deny" takes a gerund (-ing): "denied leaking" or "denied having leaked".',
    tags: ['verb_pattern', 'reporting verbs', 'sentence transformation']
  },

  // g_rel_clauses_nondef
  {
    id: 'ge_rcn_1',
    conceptId: 'g_rel_clauses_nondef',
    type: 'choose_form',
    cefrLevel: 'B2',
    prompt: 'Choose the correct relative pronoun for a non-defining clause enclosed in commas.',
    sentenceContext: 'Our primary data center, _____ was upgraded in March, guarantees 99.9% uptime.',
    options: ['which', 'that', 'what', 'who'],
    correctAnswer: 'which',
    hints: [
      'The clause is non-defining (surrounded by commas).',
      'Never use "that" in a non-defining relative clause with commas.'
    ],
    explanation: 'In non-defining relative clauses set off by commas, "which" must be used for objects, never "that".',
    tags: ['relative_clause', 'non-defining', 'which vs that']
  },
  {
    id: 'ge_rcn_2',
    conceptId: 'g_rel_clauses_nondef',
    type: 'error_correction',
    cefrLevel: 'B2',
    prompt: 'Correct the pronoun error in this non-defining relative clause.',
    originalSentence: 'The conference keynote speaker, that arrived from Seoul, gave an inspiring talk.',
    errorTarget: 'that',
    correctAnswer: 'who',
    hints: [
      'The clause is set off by commas and refers to a human keynote speaker.',
      'Do not use "that" after commas; use "who" for persons.'
    ],
    explanation: 'In non-defining relative clauses referring to people, use "who" instead of "that".',
    tags: ['relative_clause', 'non-defining']
  },

  // g_linking_adv
  {
    id: 'ge_la_1',
    conceptId: 'g_linking_adv',
    type: 'choose_form',
    cefrLevel: 'B2',
    prompt: 'Select the correct prepositional linker of concession.',
    sentenceContext: '_____ having limited coding experience, she built an automated customer dashboard.',
    options: ['Despite', 'Although', 'Even though', 'Whereas'],
    correctAnswer: 'Despite',
    hints: [
      'Notice what follows the linker: "having limited coding experience" is a gerund phrase.',
      '"Although" requires a subject and finite verb; "Despite" takes a gerund or noun.'
    ],
    explanation: '"Despite" (or "in spite of") is a preposition followed by a gerund (-ing) or noun phrase.',
    tags: ['connector', 'concession', 'despite']
  },
  {
    id: 'ge_la_2',
    conceptId: 'g_linking_adv',
    type: 'error_correction',
    cefrLevel: 'B2',
    prompt: 'Correct the common prepositional linker error.',
    originalSentence: 'Despite of the severe market volatility, our portfolio performed robustly.',
    errorTarget: 'Despite of',
    correctAnswer: 'Despite',
    acceptedAnswers: ['Despite', 'In spite of'],
    hints: [
      '"Despite" never takes the preposition "of".',
      'You can write "Despite" or "In spite of".'
    ],
    explanation: '"Despite" does not take "of". Say "Despite the severe market volatility" or "In spite of".',
    tags: ['connector', 'preposition', 'despite']
  },

  // g_participle_clauses
  {
    id: 'ge_pc_adv_1',
    conceptId: 'g_participle_clauses',
    type: 'choose_form',
    cefrLevel: 'B2',
    prompt: 'Choose the correct participle form to show an action completed prior to another.',
    sentenceContext: '_____ all the regulatory approvals, the pharmaceutical company began mass production.',
    options: ['Having secured', 'Securing', 'Secured', 'Have secured'],
    correctAnswer: 'Having secured',
    hints: [
      'The action of securing approvals was completed BEFORE production began.',
      'Use the perfect participle (Having + past participle) to show prior completion.'
    ],
    explanation: 'The perfect participle "Having secured" indicates that the action was finished before the main action occurred.',
    tags: ['verb_pattern', 'participle clauses', 'perfect participle']
  },
  {
    id: 'ge_pc_adv_2',
    conceptId: 'g_participle_clauses',
    type: 'sentence_transformation',
    cefrLevel: 'B2',
    prompt: 'Shorten the relative clause into a participle phrase.',
    originalSentence: 'The passengers who were injured in the derailment were transported to nearby clinics.',
    keyWord: 'INJURED',
    sentenceContext: 'The passengers _____ in the derailment were transported to nearby clinics.',
    correctAnswer: 'injured',
    hints: [
      'Omit the relative pronoun and the auxiliary verb "who were".',
      'Retain the past participle "injured".'
    ],
    explanation: 'A passive relative clause ("who were injured") reduces cleanly to a past participle clause: "The passengers injured in the derailment...".',
    tags: ['verb_pattern', 'participle clauses', 'reduction']
  },

  // g_inversion
  {
    id: 'ge_inv_1',
    conceptId: 'g_inversion',
    type: 'choose_form',
    cefrLevel: 'B2',
    prompt: 'Choose the correct inverted word order following the negative adverbial.',
    sentenceContext: 'Rarely _____ such exceptional dedication from an interim project contractor.',
    options: ['have I witnessed', 'I have witnessed', 'have witnessed I', 'did I witnessed'],
    correctAnswer: 'have I witnessed',
    hints: [
      'The sentence starts with the restrictive adverb "Rarely".',
      'Invert auxiliary + subject: have + I.'
    ],
    explanation: 'Negative adverbs at the start of a sentence trigger inversion: "Rarely have I witnessed...".',
    tags: ['word_order', 'inversion', 'negative adverbials']
  },
  {
    id: 'ge_inv_2',
    conceptId: 'g_inversion',
    type: 'sentence_transformation',
    cefrLevel: 'B2',
    prompt: 'Rewrite using negative inversion with HARDLY.',
    originalSentence: 'As soon as we sat down to lunch, the emergency alarm sounded.',
    keyWord: 'HARDLY',
    sentenceContext: 'Hardly _____ to lunch when the emergency alarm sounded.',
    correctAnswer: 'had we sat down',
    hints: [
      'After "Hardly", invert the past perfect auxiliary: had + subject + past participle.',
      'Combine "had we sat down".'
    ],
    explanation: 'Inversion with "hardly... when": "Hardly had we sat down to lunch when...".',
    tags: ['word_order', 'inversion', 'hardly had']
  },

  // g_comparison_complex
  {
    id: 'ge_cc_1',
    conceptId: 'g_comparison_complex',
    type: 'choose_form',
    cefrLevel: 'B2',
    prompt: 'Choose the correct proportional comparison clause.',
    sentenceContext: 'The more diligently you rehearse the presentation, _____ you will feel on stage.',
    options: ['the more confident', 'more confident', 'the most confident', 'as confident'],
    correctAnswer: 'the more confident',
    hints: [
      'Both halves of a proportional comparison must follow the structure: "The + comparative..., the + comparative...".',
      'Match "The more diligently..." with "the more confident...".'
    ],
    explanation: 'Proportional comparisons use "the + comparative ..., the + comparative ...": "the more confident you will feel".',
    tags: ['quantifier', 'complex comparison', 'proportional']
  },
  {
    id: 'ge_cc_2',
    conceptId: 'g_comparison_complex',
    type: 'sentence_transformation',
    cefrLevel: 'B2',
    prompt: 'Rewrite using NOWHERE to express an extreme difference.',
    originalSentence: 'The old interface is not nearly as intuitive as the revised layout.',
    keyWord: 'NOWHERE',
    sentenceContext: 'The old interface is _____ intuitive as the revised layout.',
    correctAnswer: 'nowhere near as',
    hints: [
      'Use the standard idiom: "nowhere near as + adjective + as".',
      'Complete with "nowhere near as".'
    ],
    explanation: '"Not nearly as... as" transforms idiomatically to "nowhere near as... as".',
    tags: ['quantifier', 'complex comparison', 'nowhere near as']
  }
];
