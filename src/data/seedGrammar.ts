import type { GrammarConcept } from '../types';

export const seedGrammar: GrammarConcept[] = [
  // ==========================================
  // CEFR A2: FOUNDATIONAL GRAMMAR (11 CONCEPTS)
  // ==========================================
  {
    id: 'g_pres_simple',
    title: 'Present Simple',
    cefrLevel: 'A2',
    category: 'Tenses',
    shortDescription: 'Used for regular habits, daily routines, permanent states, and universal scientific facts.',
    formStructure: 'Affirmative: Subject + Verb(s/es) | Negative: Subject + do/does not + Base Verb | Question: Do/Does + Subject + Base Verb?',
    explanation: 'The Present Simple expresses timeless facts, repeated actions, habits, or permanent situations. Pay special attention to the third-person singular suffix (-s / -es) in affirmative statements and the use of the auxiliary verb do/does in negatives and questions.',
    examples: [
      'She works at an international design agency in London.',
      'Water boils at 100 degrees Celsius.',
      'They do not speak Japanese during business meetings.',
      'Where does your brother live?'
    ],
    commonMistakes: [
      {
        incorrect: 'He go to the gym every Monday morning.',
        correct: 'He goes to the gym every Monday morning.',
        explanation: 'Remember the 3rd person singular -s/-es inflection for he/she/it in affirmative Present Simple.'
      },
      {
        incorrect: 'She doesn\'t likes spicy Mexican food.',
        correct: 'She doesn\'t like spicy Mexican food.',
        explanation: 'After the auxiliary "does/doesn\'t", always use the base form of the main verb without -s.'
      }
    ],
    contrast: {
      conceptId: 'g_pres_cont',
      conceptTitle: 'Present Continuous',
      distinction: 'Present Simple is for permanent routines and facts, whereas Present Continuous is for actions happening right now or temporary situations.',
      exampleA: 'I live in Madrid (permanent home).',
      exampleB: 'I am living with friends this week (temporary arrangement).'
    },
    tags: ['present simple', 'habits', 'routines', 'facts', 'tenses']
  },
  {
    id: 'g_pres_cont',
    title: 'Present Continuous',
    cefrLevel: 'A2',
    category: 'Tenses',
    shortDescription: 'Used for activities happening right now at the moment of speaking or temporary situations.',
    formStructure: 'Subject + am/is/are + Verb-ing | Negative: am/is/are + not + Verb-ing | Question: Am/Is/Are + Subject + Verb-ing?',
    explanation: 'Use the Present Continuous to describe actions taking place at the moment of speaking or around the present period. Note that stative verbs (like know, believe, want, need, understand) are rarely used in continuous forms.',
    examples: [
      'Listen! Someone is knocking on the front door.',
      'I am currently preparing for the Linguaskill exam.',
      'Are they working on the quarterly budget report today?',
      'Prices are rising rapidly this quarter.'
    ],
    commonMistakes: [
      {
        incorrect: 'I am knowing the answer to your question.',
        correct: 'I know the answer to your question.',
        explanation: 'Stative verbs describing mental states (know, understand, believe) do not take continuous forms.'
      },
      {
        incorrect: 'She studying in her bedroom right now.',
        correct: 'She is studying in her bedroom right now.',
        explanation: 'Do not omit the auxiliary verb "be" (am/is/are) in continuous tenses.'
      }
    ],
    contrast: {
      conceptId: 'g_pres_simple',
      conceptTitle: 'Present Simple',
      distinction: 'Use Present Continuous for dynamic actions in progress; use Present Simple for permanent truths and repeated habits.',
      exampleA: 'He drinks coffee every morning.',
      exampleB: 'He is drinking tea right now because he feels sick.'
    },
    tags: ['present continuous', 'actions now', 'temporary', 'stative verbs']
  },
  {
    id: 'g_past_simple',
    title: 'Past Simple',
    cefrLevel: 'A2',
    category: 'Tenses',
    shortDescription: 'Used for completed actions that took place at a definite time in the past.',
    formStructure: 'Affirmative: Subject + Verb-ed (or irregular V2) | Negative: Subject + did not + Base Verb | Question: Did + Subject + Base Verb?',
    explanation: 'The Past Simple refers to events, states, or habits completed in a finished time period (yesterday, last year, in 2018, when I was young). Irregular verbs must be memorized. In questions and negatives, the auxiliary "did" carries the past marker.',
    examples: [
      'We launched the new website three weeks ago.',
      'She did not attend the conference yesterday.',
      'Did you receive my email this morning?',
      'He wrote four novels during his twenties.'
    ],
    commonMistakes: [
      {
        incorrect: 'I didn\'t saw him at the conference yesterday.',
        correct: 'I didn\'t see him at the conference yesterday.',
        explanation: 'After the past auxiliary "did / didn\'t", use the bare infinitive (see), not the past form (saw).'
      },
      {
        incorrect: 'I have arrived in London yesterday morning.',
        correct: 'I arrived in London yesterday morning.',
        explanation: 'Finished past time markers like "yesterday", "ago", or "last week" require the Past Simple, not Present Perfect.'
      }
    ],
    contrast: {
      conceptId: 'g_pres_perf',
      conceptTitle: 'Present Perfect Simple',
      distinction: 'Past Simple links to a finished past moment; Present Perfect connects past events to the present moment without a finished time marker.',
      exampleA: 'I lost my keys yesterday (event finished in past).',
      exampleB: 'I have lost my keys (they are missing right now).'
    },
    tags: ['past simple', 'irregular verbs', 'finished time', 'tenses']
  },
  {
    id: 'g_past_cont',
    title: 'Past Continuous',
    cefrLevel: 'A2',
    category: 'Tenses',
    shortDescription: 'Used for actions that were in progress at a specific moment in the past, often interrupted by a shorter action.',
    formStructure: 'Subject + was/were + Verb-ing | Negative: was/were + not + Verb-ing | Question: Was/Were + Subject + Verb-ing?',
    explanation: 'The Past Continuous sets the background scene in narratives or describes an ongoing activity that was interrupted by a shorter action in the Past Simple (using "when" or "while").',
    examples: [
      'I was driving home when the storm suddenly started.',
      'While the director was speaking, several attendees took notes.',
      'What were you doing at 9:00 PM last night?',
      'It was raining heavily and the wind was blowing fiercely.'
    ],
    commonMistakes: [
      {
        incorrect: 'I was walk to the station when it started to snow.',
        correct: 'I was walking to the station when it started to snow.',
        explanation: 'Past continuous requires the -ing participle after was/were.'
      },
      {
        incorrect: 'When the phone rang, I cooked dinner.',
        correct: 'When the phone rang, I was cooking dinner.',
        explanation: 'The ongoing background activity in progress requires Past Continuous (was cooking).'
      }
    ],
    tags: ['past continuous', 'interrupted actions', 'background scenes', 'while when']
  },
  {
    id: 'g_future_will',
    title: 'Future with "Will"',
    cefrLevel: 'A2',
    category: 'Modals',
    shortDescription: 'Used for spontaneous decisions made at the moment of speaking, promises, offers, and general predictions.',
    formStructure: 'Subject + will (\'ll) + Base Verb | Negative: will not (won\'t) + Base Verb | Question: Will + Subject + Base Verb?',
    explanation: '"Will" expresses future intentions decided right at the moment of speaking (e.g. "I\'ll help you with that bag"), promises, offers, refusals (won\'t), and predictions based on opinion rather than visual evidence.',
    examples: [
      'The phone is ringing. I\'ll answer it!',
      'Don\'t worry, I won\'t tell anyone your secret.',
      'I think it will rain tomorrow afternoon.',
      'Will you help me carry these presentation boxes?'
    ],
    commonMistakes: [
      {
        incorrect: 'I will to send you the contract shortly.',
        correct: 'I will send you the contract shortly.',
        explanation: 'Modal verbs like "will" are followed directly by the bare infinitive without "to".'
      },
      {
        incorrect: 'Wait a moment, I am helping you.',
        correct: 'Wait a moment, I will help you.',
        explanation: 'Spontaneous decisions made at the moment of speaking require "will", not Present Continuous.'
      }
    ],
    contrast: {
      conceptId: 'g_future_going_to',
      conceptTitle: 'Future with "Be going to"',
      distinction: '"Will" is for on-the-spot decisions and opinions; "be going to" is for prior plans and predictions with present physical evidence.',
      exampleA: 'I will buy that jacket! (just decided now)',
      exampleB: 'I am going to buy that jacket next payday (already planned).'
    },
    tags: ['future', 'will', 'spontaneous decisions', 'promises', 'predictions']
  },
  {
    id: 'g_future_going_to',
    title: 'Future with "Be going to"',
    cefrLevel: 'A2',
    category: 'Tenses',
    shortDescription: 'Used for pre-existing plans and intentions, or predictions based on immediate physical evidence.',
    formStructure: 'Subject + am/is/are + going to + Base Verb',
    explanation: 'Use "be going to" when an intention or decision was already formulated before the moment of speaking, or when clear present signs/evidence indicate what is about to happen.',
    examples: [
      'Look at those dark black clouds! It is going to rain.',
      'We are going to open a second branch in Manchester next quarter.',
      'Are you going to attend the seminar tomorrow?',
      'Watch out! You are going to drop that glass.'
    ],
    commonMistakes: [
      {
        incorrect: 'Look at the sky, it will rain any second!',
        correct: 'Look at the sky, it is going to rain any second!',
        explanation: 'When making a prediction based on visible immediate physical evidence, use "be going to".'
      },
      {
        incorrect: 'She is going to visits her grandparents.',
        correct: 'She is going to visit her grandparents.',
        explanation: 'The verb following "going to" must be in the base infinitive form.'
      }
    ],
    tags: ['be going to', 'intentions', 'plans', 'predictions with evidence']
  },
  {
    id: 'g_pres_cont_future',
    title: 'Present Continuous for Future Arrangements',
    cefrLevel: 'A2',
    category: 'Tenses',
    shortDescription: 'Used for fixed personal arrangements in the near future involving other people, dates, or tickets.',
    formStructure: 'Subject + am/is/are + Verb-ing + Future Time Expression',
    explanation: 'When an event has already been scheduled with specific arrangements in place (like booked flights, agreed appointments with a doctor, or dinner dates with friends), the Present Continuous is the most natural tense.',
    examples: [
      'I am meeting the regional sales manager at 10:00 AM on Thursday.',
      'She is flying to Berlin on Friday morning; she already has her boarding pass.',
      'What are you doing this weekend?',
      'We are not having our usual team meeting tomorrow.'
    ],
    commonMistakes: [
      {
        incorrect: 'I will see the doctor at 3 PM (I have an appointment).',
        correct: 'I am seeing the doctor at 3 PM (I have an appointment).',
        explanation: 'For fixed appointments already scheduled on a calendar, use the Present Continuous rather than "will".'
      }
    ],
    tags: ['future arrangements', 'scheduled events', 'present continuous']
  },
  {
    id: 'g_comparatives',
    title: 'Comparative Adjectives & Adverbs',
    cefrLevel: 'A2',
    category: 'Comparison',
    shortDescription: 'Used to compare differences between two entities or states using -er, more, and "than".',
    formStructure: 'Short Adj: Adj-er + than | Long Adj: more + Adj + than | Irregular: better, worse, farther/further',
    explanation: 'Short 1-syllable adjectives take "-er" (cheaper, faster), 2-syllable adjectives ending in -y change to "-ier" (easier), and adjectives with 2 or more syllables use "more" (more expensive). Always introduce the second element with "than", not "that" or "as".',
    examples: [
      'This new laptop is significantly faster than my previous model.',
      'Public transport in this city is more reliable than driving.',
      'Sales in Q2 were much better than anticipated.',
      'She works harder than anyone else on our team.'
    ],
    commonMistakes: [
      {
        incorrect: 'This exam is more easy that the last one.',
        correct: 'This exam is easier than the last one.',
        explanation: 'Two-syllable adjectives ending in -y change to -ier (easier) and the comparative connector is "than", not "that".'
      },
      {
        incorrect: 'Travelling by train is more cheaper than flying.',
        correct: 'Travelling by train is cheaper than flying.',
        explanation: 'Do not double-mark comparatives: use either -er or more, never both together.'
      }
    ],
    tags: ['comparatives', 'adjectives', 'comparison', 'than']
  },
  {
    id: 'g_superlatives',
    title: 'Superlative Adjectives',
    cefrLevel: 'A2',
    category: 'Comparison',
    shortDescription: 'Used to describe an object that is at the upper or lower limit of a quality among three or more items.',
    formStructure: 'The + Adj-est | The most + Adj | Irregular: the best, the worst, the furthest',
    explanation: 'Superlatives always require the definite article "the". Short adjectives add "-est" (the fastest), adjectives ending in -y become "-iest" (the easiest), and longer adjectives take "the most" (the most effective). Use preposition "in" for places/groups (in the world, in our team), and "of" for time periods.',
    examples: [
      'Mount Everest is the highest mountain in the world.',
      'This was the most challenging project of the entire year.',
      'Who is the best candidate for the vacant managerial position?',
      'That was the worst presentation I have ever witnessed.'
    ],
    commonMistakes: [
      {
        incorrect: 'He is most experienced developer in our company.',
        correct: 'He is the most experienced developer in our company.',
        explanation: 'Superlatives must be preceded by the definite article "the".'
      },
      {
        incorrect: 'It is the most highest building of the city.',
        correct: 'It is the highest building in the city.',
        explanation: 'Avoid double superlatives (do not combine most + highest), and use preposition "in" with cities/groups.'
      }
    ],
    tags: ['superlatives', 'the most', 'adjectives', 'comparison']
  },
  {
    id: 'g_count_uncount',
    title: 'Countable & Uncountable Nouns',
    cefrLevel: 'A2',
    category: 'Nouns & Quantifiers',
    shortDescription: 'Understanding pluralization, singular agreement, and quantity determiners.',
    formStructure: 'Countable: singular (a/an) / plural (-s) | Uncountable: singular verb, no "a/an", no plural -s',
    explanation: 'Countable nouns refer to individual items that can be counted (chairs, ideas, reports). Uncountable nouns are materials, concepts, or collective masses (information, furniture, advice, equipment, water). Uncountable nouns always take a singular verb and cannot be preceded by "a/an" or made plural.',
    examples: [
      'Could you give me some advice regarding my career path?',
      'We need several new pieces of equipment for the laboratory.',
      'There is too much luggage in the boot of the car.',
      'She ordered two coffees and a bottle of mineral water.'
    ],
    commonMistakes: [
      {
        incorrect: 'He gave me many useful advices yesterday.',
        correct: 'He gave me a lot of useful advice yesterday.',
        explanation: '"Advice" is uncountable in English: it never takes a plural -s and cannot be modified directly by "many". Use "pieces of advice" or "a lot of advice".'
      },
      {
        incorrect: 'We don\'t have many informations about the client.',
        correct: 'We don\'t have much information about the client.',
        explanation: '"Information" is uncountable: use "much / a lot of" and keep the noun singular.'
      }
    ],
    tags: ['countable', 'uncountable', 'nouns', 'quantifiers', 'advice', 'information']
  },
  {
    id: 'g_modals_basic',
    title: 'Basic Modal Verbs (Can, Could, Must, Should)',
    cefrLevel: 'A2',
    category: 'Modals',
    shortDescription: 'Expressing ability, polite requests, obligation, and general advice.',
    formStructure: 'Subject + Modal + Bare Infinitive (Verb without "to")',
    explanation: 'Modal verbs do not take an "-s" in third person, do not use "do/does" in questions or negatives, and are always followed by the base form of the main verb without "to" (except ought to / have to). Can = present ability/informal permission; Could = past ability/polite request; Must = strong obligation; Should = advice/recommendation.',
    examples: [
      'Can you speak English fluently?',
      'Could you please send me the updated invoice?',
      'You must wear safety goggles inside the manufacturing plant.',
      'You should consult a doctor if the fever persists.'
    ],
    commonMistakes: [
      {
        incorrect: 'She can to play the violin beautifully.',
        correct: 'She can play the violin beautifully.',
        explanation: 'Modal auxiliaries (can, could, must, should) are followed by the bare infinitive without "to".'
      },
      {
        incorrect: 'He musts finish the assignment before midnight.',
        correct: 'He must finish the assignment before midnight.',
        explanation: 'Modals never take an "-s" suffix in the third-person singular.'
      }
    ],
    tags: ['modals', 'can', 'could', 'must', 'should', 'advice', 'ability']
  },

  // ==========================================
  // CEFR B1: INTERMEDIATE CORE (12 CONCEPTS)
  // ==========================================
  {
    id: 'g_pres_perf',
    title: 'Present Perfect Simple',
    cefrLevel: 'B1',
    category: 'Tenses',
    shortDescription: 'Connecting past experiences, accomplishments, and unfinished time periods to the present.',
    formStructure: 'Subject + have/has + Past Participle (V3)',
    explanation: 'The Present Perfect bridges the past and the present. It describes: 1) Life experiences at an unspecified time (with ever/never); 2) Actions in an unfinished time period (today, this week); 3) Recent actions with present results (with just, already, yet); 4) States continuing from the past to now (with for and since).',
    examples: [
      'I have worked at this technology company for five years.',
      'Have you ever managed a multinational project team?',
      'The delivery team has just dispatched your order.',
      'She has not finalized the contract yet.'
    ],
    commonMistakes: [
      {
        incorrect: 'I have seen him yesterday afternoon.',
        correct: 'I saw him yesterday afternoon.',
        explanation: 'Never use the Present Perfect with specific finished past time indicators (yesterday, last week, in 2020). Use Past Simple instead.'
      },
      {
        incorrect: 'I live in Barcelona since three years.',
        correct: 'I have lived in Barcelona for three years.',
        explanation: 'Use the Present Perfect with "for" to express duration from the past to now, and "since" for starting points.'
      }
    ],
    contrast: {
      conceptId: 'g_pres_perf_vs_past',
      conceptTitle: 'Present Perfect vs Past Simple',
      distinction: 'Present Perfect connects past events to present relevance without a finished time marker; Past Simple is locked to a specific finished past time.',
      exampleA: 'I have lived here for 10 years (I still live here now).',
      exampleB: 'I lived here for 10 years (I no longer live here).'
    },
    tags: ['present perfect', 'experience', 'just already yet', 'since for', 'tenses']
  },
  {
    id: 'g_pres_perf_vs_past',
    title: 'Present Perfect vs Past Simple',
    cefrLevel: 'B1',
    category: 'Tenses',
    shortDescription: 'Mastering the crucial boundary between finished past time and present relevance.',
    formStructure: 'Past Simple: Finished time + V2 | Present Perfect: Unspecified time/connection to now + have/has + V3',
    explanation: 'This is one of the most critical distinctions in Cambridge and Linguaskill exams. Use the Past Simple when the time period is finished (yesterday, in 2019, when, ago). Use the Present Perfect when the time period is open (today, this month, in my life) or when the precise time is irrelevant and the present outcome matters.',
    examples: [
      'I have visited Rome twice, but I went to Florence last summer.',
      'Did you finish the report yesterday? — Yes, I have already emailed it to the client.',
      'Shakespeare wrote dozens of plays (finished lifetime).',
      'The author has written four bestselling novels so far (author is alive).'
    ],
    commonMistakes: [
      {
        incorrect: 'Did you ever eat sushi in your life?',
        correct: 'Have you ever eaten sushi in your life?',
        explanation: 'When asking about lifetime experiences without a specific time anchor, use Present Perfect.'
      },
      {
        incorrect: 'I have finished school in 2018.',
        correct: 'I finished school in 2018.',
        explanation: 'Specific past calendar years require the Past Simple.'
      }
    ],
    tags: ['present perfect vs past simple', 'time anchors', 'tenses comparison']
  },
  {
    id: 'g_pres_perf_cont',
    title: 'Present Perfect Continuous',
    cefrLevel: 'B1',
    category: 'Tenses',
    shortDescription: 'Emphasizing the duration or ongoing process of an activity leading up to or explaining the present.',
    formStructure: 'Subject + have/has + been + Verb-ing',
    explanation: 'Use the Present Perfect Continuous to emphasize the duration of an activity that started in the past and is still ongoing, or an activity that recently stopped and whose visible evidence explains the present situation (e.g., "My hands are dirty because I have been repairing my bicycle").',
    examples: [
      'She has been studying for the Linguaskill exam for three hours without a break.',
      'How long have you been waiting here in the lobby?',
      'The pavement is wet because it has been raining.',
      'We have been developing this software feature since last November.'
    ],
    commonMistakes: [
      {
        incorrect: 'I have been knowing Sarah since high school.',
        correct: 'I have known Sarah since high school.',
        explanation: 'Stative verbs like know, understand, and own cannot be used in the continuous form; use the Present Perfect Simple.'
      },
      {
        incorrect: 'How long are you living in this apartment?',
        correct: 'How long have you been living in this apartment?',
        explanation: 'Questions asking about duration extending from the past to now require the Present Perfect Continuous.'
      }
    ],
    contrast: {
      conceptId: 'g_pres_perf',
      conceptTitle: 'Present Perfect Simple',
      distinction: 'Present Perfect Simple emphasizes completed results (how many/how much); Present Perfect Continuous emphasizes activity duration (how long).',
      exampleA: 'I have read three chapters today (completed outcome).',
      exampleB: 'I have been reading all morning (ongoing activity duration).'
    },
    tags: ['present perfect continuous', 'duration', 'ongoing process', 'for since']
  },
  {
    id: 'g_cond_first',
    title: 'First Conditional',
    cefrLevel: 'B1',
    category: 'Conditionals',
    shortDescription: 'Talking about real, likely, and probable future situations and their consequences.',
    formStructure: 'If + Present Simple, ... will / won\'t + Base Verb | or modal (can, may, should)',
    explanation: 'The First Conditional expresses real possibilities in the present or future. Even though the condition refers to the future, the "if" clause takes the Present Simple. You can invert the clause order without a comma (e.g. "I will call you if I arrive early"). You can also use "unless" (meaning "if not").',
    examples: [
      'If you pass the B2 examination, you will qualify for the promotion.',
      'We won\'t catch the connecting train unless we hurry.',
      'If the weather improves tomorrow, we might hold the workshop outdoors.',
      'What will you do if the client rejects our proposal?'
    ],
    commonMistakes: [
      {
        incorrect: 'If it will rain tomorrow, we will cancel the match.',
        correct: 'If it rains tomorrow, we will cancel the match.',
        explanation: 'Never use "will" in the conditional "if" clause of first conditional sentences.'
      },
      {
        incorrect: 'Unless you don\'t study, you will fail the test.',
        correct: 'Unless you study, you will fail the test.',
        explanation: '"Unless" already has a negative meaning ("if you do not"); do not add a double negative.'
      }
    ],
    tags: ['conditionals', 'first conditional', 'real future', 'unless', 'will']
  },
  {
    id: 'g_cond_second',
    title: 'Second Conditional',
    cefrLevel: 'B1',
    category: 'Conditionals',
    shortDescription: 'Talking about hypothetical, imaginary, or improbable present/future situations.',
    formStructure: 'If + Past Simple, ... would / wouldn\'t + Base Verb (or could/might)',
    explanation: 'Use the Second Conditional for situations that are untrue, imaginary, or highly unlikely right now or in the future. In formal English, "were" is preferred over "was" for all persons in the "if" clause (especially "If I were you...").',
    examples: [
      'If I had more free time, I would learn Spanish and Mandarin.',
      'If I were you, I would consult the legal team before signing.',
      'What would you do if you won the lottery tomorrow?',
      'If the company offered a higher salary, she might consider relocating.'
    ],
    commonMistakes: [
      {
        incorrect: 'If I would have a car, I would drive to work every day.',
        correct: 'If I had a car, I would drive to work every day.',
        explanation: 'Never use "would" in the "if" clause. Use the Past Simple in the condition clause.'
      },
      {
        incorrect: 'If I win the lottery tomorrow, I would buy an island.',
        correct: 'If I won the lottery tomorrow, I would buy an island.',
        explanation: 'To match "would buy" in the main clause, the condition must be in the Past Simple (won).'
      }
    ],
    contrast: {
      conceptId: 'g_cond_first',
      conceptTitle: 'First Conditional',
      distinction: 'First Conditional is for realistic/probable events (If I see him, I will tell him); Second Conditional is for imaginary/unlikely events (If I saw an alien, I would take a photo).',
      exampleA: 'If I have time tonight, I will watch a movie (realistic).',
      exampleB: 'If I had a million dollars, I would travel the globe (hypothetical).'
    },
    tags: ['conditionals', 'second conditional', 'hypothetical', 'if I were you', 'would']
  },
  {
    id: 'g_modals_b1',
    title: 'Modals of Obligation, Prohibition & Advice',
    cefrLevel: 'B1',
    category: 'Modals',
    shortDescription: 'Distinguishing must, have to, mustn\'t, don\'t have to, should, and ought to.',
    formStructure: 'Obligation: must / have to | Prohibition: mustn\'t | Lack of obligation: don\'t have to | Advice: should / ought to',
    explanation: 'Crucial distinction: "Mustn\'t" means something is strictly forbidden (zero tolerance), whereas "don\'t have to" means something is optional (no obligation, you can if you want). "Must" often expresses internal personal obligation, while "have to" expresses external rules or laws.',
    examples: [
      'You must not use mobile phones during the official examination (prohibition).',
      'You don\'t have to wear a suit tomorrow; business casual is acceptable (optional).',
      'All visitors have to register at the security desk upon arrival (external rule).',
      'You ought to review the grammar notes before attempting the test.'
    ],
    commonMistakes: [
      {
        incorrect: 'You mustn\'t pay for parking on Sundays; it is completely free.',
        correct: 'You don\'t have to pay for parking on Sundays; it is completely free.',
        explanation: '"Mustn\'t" implies it is forbidden. When something is not required or optional, use "don\'t have to".'
      },
      {
        incorrect: 'Yesterday I must work until 10 PM.',
        correct: 'Yesterday I had to work until 10 PM.',
        explanation: '"Must" has no past form; use "had to" for past obligation.'
      }
    ],
    tags: ['modals', 'must', 'have to', 'mustn\'t', 'don\'t have to', 'obligation', 'prohibition']
  },
  {
    id: 'g_rel_clauses_def',
    title: 'Defining Relative Clauses',
    cefrLevel: 'B1',
    category: 'Relative Clauses',
    shortDescription: 'Providing essential information to identify which person, thing, or place is being referred to.',
    formStructure: 'Noun + who/which/that/whose/where + Relative Clause (No commas!)',
    explanation: 'Defining relative clauses tell us exactly which person or thing the speaker means; without this clause, the sentence is incomplete. "Who/that" is used for people, "which/that" for things, "whose" for possession, and "where" for places. Crucially, when the relative pronoun is the object of the clause, it can be omitted.',
    examples: [
      'The consultant who analyzed our software found three major vulnerabilities.',
      'This is the laptop (that) I purchased during the winter sale.',
      'The company whose shares dropped yesterday has announced a merger.',
      'I will never forget the restaurant where we celebrated our graduation.'
    ],
    commonMistakes: [
      {
        incorrect: 'The woman, that works in reception, is my cousin.',
        correct: 'The woman who works in reception is my cousin.',
        explanation: 'Do not put commas around defining relative clauses, and use "who" or "that" without commas.'
      },
      {
        incorrect: 'The report which I read it yesterday was very informative.',
        correct: 'The report which I read yesterday was very informative.',
        explanation: 'Do not repeat the object pronoun (it) when the relative pronoun already acts as the object.'
      }
    ],
    tags: ['relative clauses', 'who', 'which', 'that', 'defining', 'pronoun omission']
  },
  {
    id: 'g_passive_basic',
    title: 'Passive Voice Basics (Present & Past)',
    cefrLevel: 'B1',
    category: 'Passive & Voice',
    shortDescription: 'Focusing on the action or receiver rather than the agent who performed it.',
    formStructure: 'Subject + be (appropriate tense) + Past Participle (V3) (+ by agent)',
    explanation: 'Use the passive voice when the agent performing the action is unknown, obvious, or less important than the action itself or the recipient. Present Passive: is/are + V3; Past Passive: was/were + V3. The agent can be included using "by".',
    examples: [
      'Over 200 million emails are sent worldwide every single minute.',
      'The architectural blueprint was approved by the board of directors last Friday.',
      'This historic cathedral was designed by Sir Christopher Wren.',
      'Are credit cards accepted at all ticket terminals?'
    ],
    commonMistakes: [
      {
        incorrect: 'The bridge built in 1985 by a local construction firm.',
        correct: 'The bridge was built in 1985 by a local construction firm.',
        explanation: 'Passive voice always requires the auxiliary verb "be" (was/were/is/are) alongside the past participle.'
      },
      {
        incorrect: 'The documents were wrote by our senior partner.',
        correct: 'The documents were written by our senior partner.',
        explanation: 'Always use the past participle (V3: written), not the past simple form (wrote).'
      }
    ],
    tags: ['passive voice', 'past participle', 'be + v3', 'formal style']
  },
  {
    id: 'g_reported_speech_basic',
    title: 'Reported Speech Basics',
    cefrLevel: 'B1',
    category: 'Clauses & Linkers',
    shortDescription: 'Reporting what someone said with standard tense backshift, pronoun shifts, and time changes.',
    formStructure: 'Reporting verb (said / told someone that) + backshifted clause',
    explanation: 'When reporting statements in the past: Present Simple shifts to Past Simple, Present Continuous shifts to Past Continuous, Past Simple shifts to Past Perfect, and "will" shifts to "would". "Say" does not require an indirect object, whereas "tell" must have a person object (e.g. "He told me that...", "He said that...").',
    examples: [
      'Direct: "I am ready." → Reported: He said that he was ready.',
      'Direct: "We will attend the meeting." → Reported: They told me that they would attend the meeting.',
      'Direct: "I lost my passport." → Reported: She explained that she had lost her passport.',
      'He asked me where I lived.'
    ],
    commonMistakes: [
      {
        incorrect: 'She said me that she was exhausted.',
        correct: 'She told me that she was exhausted.',
        explanation: '"Tell" requires a personal object (told me), while "say" cannot take a personal object directly without "to" (said to me).'
      },
      {
        incorrect: 'He asked me where did I live.',
        correct: 'He asked me where I lived.',
        explanation: 'Reported questions use statement word order (Subject + Verb) without the auxiliary "do/did".'
      }
    ],
    tags: ['reported speech', 'backshift', 'say vs tell', 'indirect questions']
  },
  {
    id: 'g_gerund_inf_patterns',
    title: 'Verb Patterns: Gerund vs Infinitive',
    cefrLevel: 'B1',
    category: 'Verb Patterns',
    shortDescription: 'Choosing between -ing and to-infinitive after specific verbs and noticing meaning shifts.',
    formStructure: 'Verb + to + Infinitive (decide, hope, promise) | Verb + -ing (enjoy, avoid, suggest, consider)',
    explanation: 'Certain verbs must be followed by a gerund (-ing): enjoy, avoid, consider, suggest, admit, mind. Other verbs must be followed by an infinitive (to + verb): decide, hope, manage, refuse, promise, afford. Crucially, verbs like "stop", "remember", and "forget" change meaning depending on the form used.',
    examples: [
      'We decided to postpone the release date until September.',
      'I always enjoy collaborating with international designers.',
      'He stopped smoking five years ago (he quit the habit).',
      'He stopped to smoke a cigarette outside the office (he paused an activity in order to smoke).'
    ],
    commonMistakes: [
      {
        incorrect: 'I suggest to schedule an urgent follow-up meeting.',
        correct: 'I suggest scheduling an urgent follow-up meeting.',
        explanation: 'The verb "suggest" is followed by a gerund (-ing) or a that-clause, never by a to-infinitive.'
      },
      {
        incorrect: 'We cannot afford taking such a financial risk.',
        correct: 'We cannot afford to take such a financial risk.',
        explanation: '"Afford" is followed by the to-infinitive.'
      }
    ],
    tags: ['gerund', 'infinitive', 'verb patterns', 'stop to vs stop -ing', 'remember']
  },
  {
    id: 'g_used_to',
    title: '"Used to" vs "Be / Get used to"',
    cefrLevel: 'B1',
    category: 'Verb Patterns',
    shortDescription: 'Expressing past terminated habits versus current familiarity or adaptation.',
    formStructure: 'Past Habit: used to + Base Verb | Familiarity: be/get used to + noun / -ing',
    explanation: '"Used to + infinitive" refers to past habits or states that are no longer true today. In contrast, "be used to + -ing/noun" expresses that something is familiar or customary, and "get used to + -ing/noun" expresses the process of becoming accustomed to something new.',
    examples: [
      'I used to commute by train every day, but now I work remotely from home.',
      'I am used to waking up at 6:00 AM, so early flights do not bother me.',
      'It took her several months to get used to living in a colder climate.',
      'Did you use to play basketball in secondary school?'
    ],
    commonMistakes: [
      {
        incorrect: 'I am used to wake up early every weekday.',
        correct: 'I am used to waking up early every weekday.',
        explanation: 'In "be used to", "to" is a preposition, so it must be followed by a gerund (-ing) or noun, not a bare verb.'
      },
      {
        incorrect: 'I didn\'t used to like coffee, but now I drink it daily.',
        correct: 'I didn\'t use to like coffee, but now I drink it daily.',
        explanation: 'In negative and question forms with "did", use "use to" (without the final -d).'
      }
    ],
    contrast: {
      conceptId: 'g_past_simple',
      conceptTitle: 'Past Simple',
      distinction: '"Used to" explicitly emphasizes that the past situation has ceased and contrasts with the present.',
      exampleA: 'I lived in Leeds (neutral past fact).',
      exampleB: 'I used to live in Leeds (emphasizes that I do not live there anymore).'
    },
    tags: ['used to', 'be used to', 'get used to', 'past habits', 'familiarity']
  },
  {
    id: 'g_too_enough',
    title: '"Too" and "Enough"',
    cefrLevel: 'B1',
    category: 'Nouns & Quantifiers',
    shortDescription: 'Modifying adjectives, adverbs, and nouns to express excess or sufficiency.',
    formStructure: 'too + Adj/Adv | Adj/Adv + enough | enough + Noun | too much/many + Noun',
    explanation: '"Too" indicates an excessive amount with a negative consequence ("too hot to drink"). "Enough" indicates sufficiency and changes word order: it comes AFTER adjectives and adverbs ("warm enough"), but BEFORE nouns ("enough money").',
    examples: [
      'The proposed solution is too expensive for our current budget.',
      'She did not run fast enough to catch the departing express train.',
      'Do we have enough information to make an informed decision?',
      'There are too many conflicting priorities on this project roadmap.'
    ],
    commonMistakes: [
      {
        incorrect: 'He is not enough experienced to manage such a complex team.',
        correct: 'He is not experienced enough to manage such a complex team.',
        explanation: '"Enough" comes AFTER adjectives and adverbs, not before them.'
      },
      {
        incorrect: 'The water was too much hot to swim in.',
        correct: 'The water was too hot to swim in.',
        explanation: 'Modify adjectives directly with "too", not "too much". Use "too much" only with uncountable nouns.'
      }
    ],
    tags: ['too', 'enough', 'adjectives', 'modifiers', 'quantifiers']
  },
  {
    id: 'g_so_such',
    title: '"So" vs "Such"',
    cefrLevel: 'B1',
    category: 'Clauses & Linkers',
    shortDescription: 'Adding emphasis and expressing cause-and-effect with that-clauses.',
    formStructure: 'so + Adj/Adv (+ that) | such + (a/an) + (Adj) + Noun (+ that)',
    explanation: '"So" directly modifies adjectives and adverbs (so delicious, so quickly). "Such" directly modifies nouns or adjective-noun phrases (such a good film, such intelligent people). Both can be combined with "that" to express a result or consequence.',
    examples: [
      'The presentation was so engaging that the audience asked questions for an hour.',
      'It was such a complicated algorithm that only two engineers understood it.',
      'They worked so diligently that the milestone was completed early.',
      'She has such great ideas during brainstorm sessions.'
    ],
    commonMistakes: [
      {
        incorrect: 'It was a so difficult problem that nobody could solve it.',
        correct: 'It was such a difficult problem that nobody could solve it.',
        explanation: 'When modifying an adjective + noun phrase, use "such (a/an)", not "so".'
      },
      {
        incorrect: 'The lecture was such interesting that I took five pages of notes.',
        correct: 'The lecture was so interesting that I took five pages of notes.',
        explanation: 'When modifying an adjective directly without a following noun, use "so".'
      }
    ],
    tags: ['so vs such', 'emphasis', 'result clauses', 'connectors']
  },

  // ==========================================
  // CEFR B2: UPPER-INTERMEDIATE ADVANCED (10 CONCEPTS)
  // ==========================================
  {
    id: 'g_cond_third',
    title: 'Third Conditional',
    cefrLevel: 'B2',
    category: 'Conditionals',
    shortDescription: 'Expressing unreal past situations, hypothetical past outcomes, and regrets.',
    formStructure: 'If + Past Perfect (had + V3), ... would have + Past Participle (V3)',
    explanation: 'The Third Conditional talks about an imaginary situation in the past that did not happen and imagines its alternative past result. It is frequently used to express regrets, relief, or historical analysis. Modals like "could have" or "might have" can replace "would have".',
    examples: [
      'If we had anticipated the market shift, we would have revised our product strategy.',
      'If you had warned me about the traffic, I could have caught the flight.',
      'She might have been offered the role if she had prepared more thoroughly.',
      'Had we known about the delay, we would not have waited at the gate.'
    ],
    commonMistakes: [
      {
        incorrect: 'If I would have known about the meeting, I would have attended.',
        correct: 'If I had known about the meeting, I would have attended.',
        explanation: 'Never use "would have" in the "if" clause. Use the Past Perfect (had known).'
      },
      {
        incorrect: 'If we had left earlier, we would caught the train.',
        correct: 'If we had left earlier, we would have caught the train.',
        explanation: 'The main clause requires "would have + past participle" (would have caught).'
      }
    ],
    contrast: {
      conceptId: 'g_cond_second',
      conceptTitle: 'Second Conditional',
      distinction: 'Second Conditional is hypothetical in the present/future; Third Conditional is hypothetical in the finished past.',
      exampleA: 'If I had money now, I would buy it (present Second Conditional).',
      exampleB: 'If I had had money last year, I would have bought it (past Third Conditional).'
    },
    tags: ['conditionals', 'third conditional', 'regret', 'past hypothetical', 'past perfect']
  },
  {
    id: 'g_cond_mixed',
    title: 'Mixed Conditionals',
    cefrLevel: 'B2',
    category: 'Conditionals',
    shortDescription: 'Connecting past causes with present results, or permanent conditions with past outcomes.',
    formStructure: 'Type A: If + Past Perfect (past action), ... would + Base Verb (present result) | Type B: If + Past Simple (present state), ... would have + V3 (past result)',
    explanation: 'Mixed conditionals blend the Second and Third Conditionals. The most common type connects a hypothetical past action (if I had studied medicine) with a present consequence (I would be a doctor today). The reverse type connects an ongoing general state (if I spoke German) with a past consequence (I would have translated the article yesterday).',
    examples: [
      'If I had accepted that job in Zurich, I would be living in Switzerland now.',
      'If she were not so terrified of flying, she would have accompanied us on the trip.',
      'If we hadn\'t missed our flight last night, we would be enjoying the beach right now.',
      'He would have won the championship if he were a more disciplined athlete.'
    ],
    commonMistakes: [
      {
        incorrect: 'If I had invested in Bitcoin early, I would have been rich today.',
        correct: 'If I had invested in Bitcoin early, I would be rich today.',
        explanation: 'Because the result refers to the present ("today"), use "would be" rather than "would have been".'
      }
    ],
    tags: ['mixed conditionals', 'conditionals', 'advanced grammar', 'hypothetical time blend']
  },
  {
    id: 'g_passive_adv',
    title: 'Advanced Passive Structures & Causatives',
    cefrLevel: 'B2',
    category: 'Passive & Voice',
    shortDescription: 'Impersonal reporting passives (it is said that) and causatives (have/get something done).',
    formStructure: 'Passive Reporting: It is said that... / Subject + is said to + Infinitive | Causative: have/get + object + Past Participle (V3)',
    explanation: 'Used extensively in formal journalism, academic writing, and Linguaskill reading texts. Causatives ("have something done") indicate arranging for someone else to perform a service. Impersonal reporting verbs (claim, report, believe, consider, expect) allow objective, neutral distance without attributing statements to specific individuals.',
    examples: [
      'The CEO is believed to have resigned following the board meeting.',
      'It is widely anticipated that inflation will decline in the third quarter.',
      'We had our company network upgraded by a cybersecurity firm last month.',
      'You should get your passport renewed before planning international travel.'
    ],
    commonMistakes: [
      {
        incorrect: 'I cut my hair yesterday at the salon (implies you cut it yourself).',
        correct: 'I had my hair cut yesterday at the salon.',
        explanation: 'Use the causative "have/get something done" when a professional performs the action for you.'
      },
      {
        incorrect: 'He is said having huge influence in the government.',
        correct: 'He is said to have huge influence in the government.',
        explanation: 'Personal passive reporting structures require a to-infinitive (to have).'
      }
    ],
    tags: ['advanced passive', 'causative', 'have something done', 'impersonal passive', 'reporting verbs']
  },
  {
    id: 'g_modals_deduction',
    title: 'Modal Deduction in Past & Present',
    cefrLevel: 'B2',
    category: 'Modals',
    shortDescription: 'Expressing degrees of certainty in present and past using must, can\'t, and might/could.',
    formStructure: 'Present: must / can\'t / might + Base Verb | Past: must / can\'t / might / could + have + Past Participle (V3)',
    explanation: 'Expresses logical deductions based on evidence. 95% Certain Positive: "must (have)". 95% Certain Negative: "can\'t / couldn\'t (have)". 50% Possibility: "might / may / could (have)". Crucially, never use "mustn\'t have" for logical deduction—use "can\'t have" instead!',
    examples: [
      'He can\'t be in the office; his computer is off and his car is gone.',
      'She must have forgotten about the appointment because she is always punctual.',
      'They might have taken an alternative route to avoid the traffic congestion.',
      'You couldn\'t have seen John in London yesterday; he was in Tokyo.'
    ],
    commonMistakes: [
      {
        incorrect: 'He mustn\'t have heard the alarm because he didn\'t wake up.',
        correct: 'He can\'t have heard the alarm because he didn\'t wake up.',
        explanation: 'For negative past deduction (it is impossible that he heard it), use "can\'t have", not "mustn\'t have".'
      },
      {
        incorrect: 'She must was very surprised when she won.',
        correct: 'She must have been very surprised when she won.',
        explanation: 'Past modal deduction requires "must have + past participle" (must have been).'
      }
    ],
    tags: ['modal deduction', 'must have', 'can\'t have', 'might have', 'speculation']
  },
  {
    id: 'g_reported_adv',
    title: 'Advanced Reporting Verbs',
    cefrLevel: 'B2',
    category: 'Clauses & Linkers',
    shortDescription: 'Replacing simple "say/tell" with nuanced reporting patterns with gerunds, infinitives, and prepositions.',
    formStructure: 'Verb + to-inf (promise, refuse) | Verb + obj + to-inf (warn, advise, persuade) | Verb + -ing (admit, deny, recommend) | Verb + prep + -ing (apologize for, insist on)',
    explanation: 'At B2 level, sophisticated English avoids repeating "he said that". Instead, choose specific reporting verbs that encapsulate the speaker\'s attitude: apologize for doing, accuse someone of doing, congratulate someone on doing, encourage someone to do, deny doing, and insist on doing.',
    examples: [
      'The director apologized for misinforming the shareholders during the webcast.',
      'She persuaded the executive board to increase the department\'s budget.',
      'The suspect denied having any connection to the cybersecurity breach.',
      'The instructor warned the students not to submit their essays late.'
    ],
    commonMistakes: [
      {
        incorrect: 'He apologized to break the office coffee machine.',
        correct: 'He apologized for breaking the office coffee machine.',
        explanation: '"Apologize" follows the pattern: apologize (to someone) for doing something (-ing).'
      },
      {
        incorrect: 'She denied to commit any financial malpractice.',
        correct: 'She denied committing any financial malpractice.',
        explanation: 'The verb "deny" is followed by a gerund (-ing) or a that-clause, never a to-infinitive.'
      }
    ],
    tags: ['reporting verbs', 'reported speech', 'apologize for', 'deny -ing', 'persuade to']
  },
  {
    id: 'g_rel_clauses_nondef',
    title: 'Non-defining Relative Clauses',
    cefrLevel: 'B2',
    category: 'Relative Clauses',
    shortDescription: 'Adding non-essential parenthetical information separated by commas.',
    formStructure: 'Main clause, who / which / whose / where + extra info, rest of sentence.',
    explanation: 'Non-defining relative clauses provide extra, non-essential details about a noun already identified. If you remove the clause, the sentence still makes complete sense. Rules: 1) Must always be enclosed in commas; 2) NEVER use "that" (use "which" for things, "who" for people); 3) The relative pronoun can NEVER be omitted; 4) "Which" can refer back to an entire previous clause.',
    examples: [
      'My elder brother, who works as a civil engineer in Vancouver, is visiting next week.',
      'The new corporate headquarters, which took three years to construct, opened yesterday.',
      'The company cancelled the bonus scheme, which angered many staff members.',
      'Our current CEO, whose contract expires in December, has decided not to renew.'
    ],
    commonMistakes: [
      {
        incorrect: 'His car, that cost over fifty thousand euros, broke down on the motorway.',
        correct: 'His car, which cost over fifty thousand euros, broke down on the motorway.',
        explanation: 'Never use "that" in non-defining relative clauses with commas; use "which" for objects.'
      },
      {
        incorrect: 'My mother who lives in Seville is a retired teacher (if you only have one mother).',
        correct: 'My mother, who lives in Seville, is a retired teacher.',
        explanation: 'Because "mother" is uniquely identified, the information is extra and must be separated by commas.'
      }
    ],
    contrast: {
      conceptId: 'g_rel_clauses_def',
      conceptTitle: 'Defining Relative Clauses',
      distinction: 'Defining clauses identify which item and have no commas; non-defining clauses provide bonus information and require commas.',
      exampleA: 'The players who were injured missed the match (only the injured players).',
      exampleB: 'The players, who were injured, missed the match (all players in the group were injured).'
    },
    tags: ['non-defining relative clauses', 'commas in clauses', 'which vs that', 'relative clauses']
  },
  {
    id: 'g_linking_adv',
    title: 'Advanced Linking & Concession',
    cefrLevel: 'B2',
    category: 'Clauses & Linkers',
    shortDescription: 'Connecting contrasting viewpoints using despite, in spite of, although, whereas, and nevertheless.',
    formStructure: 'Concession clause: Although / Even though + Clause | Prepositional: Despite / In spite of + Noun / -ing | Adverbial: Nevertheless / However, ...',
    explanation: 'Mastering connectors of contrast is vital for B2 writing and Linguaskill text comprehension. "Although / even though" are subordinating conjunctions followed by a subject and verb. "Despite / in spite of" are prepositions followed by a noun, noun phrase, gerund (-ing), or "the fact that + clause". "Nevertheless / however" connect independent sentences.',
    examples: [
      'Despite the heavy rain and cold wind, the outdoor marathon went ahead as planned.',
      'In spite of having very little formal experience, she performed exceptionally well.',
      'Although the project exceeded its original schedule, the client was highly satisfied.',
      'Profits fell sharply in Q1; nevertheless, the company maintained its expansion targets.'
    ],
    commonMistakes: [
      {
        incorrect: 'Despite of the strict regulations, several firms failed the audit.',
        correct: 'Despite the strict regulations, several firms failed the audit.',
        explanation: '"Despite" does NOT take "of". Say "despite the..." or "in spite of the...".'
      },
      {
        incorrect: 'Although of feeling exhausted, he finished the assignment.',
        correct: 'Although he felt exhausted, he finished the assignment.',
        explanation: '"Although" must be followed by a complete clause (subject + verb), not "of + -ing".'
      }
    ],
    tags: ['connectors', 'concession', 'despite', 'in spite of', 'although', 'nevertheless', 'b2 linkers']
  },
  {
    id: 'g_participle_clauses',
    title: 'Participle Clauses (-ing and -ed)',
    cefrLevel: 'B2',
    category: 'Clauses & Linkers',
    shortDescription: 'Economical clauses expressing time, reason, or condition using participles.',
    formStructure: 'Present Participle: Verb-ing, ... (Active) | Past Participle: Verb-ed (V3), ... (Passive) | Having + V3, ... (Earlier completed action)',
    explanation: 'Participle clauses allow writers to express complex ideas concisely. The subject of the participle clause must be identical to the subject of the main clause. Present participles (-ing) replace active clauses (e.g., "Feeling tired, she went to bed early"). Past participles (-ed/V3) replace passive clauses ("Built in 1890, the manor..."). Perfect participles ("Having finished...") emphasize that one action concluded before another began.',
    examples: [
      'Having passed all her medical board exams, Dr. Taylor began her hospital residency.',
      'Arriving at the hotel two hours early, we decided to leave our bags at reception.',
      'Shocked by the audit revelations, the board immediately launched an investigation.',
      'Not knowing the city well, he relied heavily on GPS navigation.'
    ],
    commonMistakes: [
      {
        incorrect: 'Walking through the park, the trees were covered in snow (dangling participle).',
        correct: 'Walking through the park, I noticed the trees were covered in snow.',
        explanation: 'The subject of the participle clause must be the one performing the action (the trees were not walking).'
      },
      {
        incorrect: 'Having finish the report, she submitted it to the manager.',
        correct: 'Having finished the report, she submitted it to the manager.',
        explanation: 'The perfect participle requires "having + past participle (V3)".'
      }
    ],
    tags: ['participle clauses', 'advanced syntax', 'having done', 'concise writing']
  },
  {
    id: 'g_inversion',
    title: 'Inversion with Negative Adverbials',
    cefrLevel: 'B2',
    category: 'Clauses & Linkers',
    shortDescription: 'Inverting subject and auxiliary for dramatic emphasis following restrictive or negative adverbs.',
    formStructure: 'Negative/Restrictive Adverb + Auxiliary Verb + Subject + Main Verb',
    explanation: 'When negative or limiting adverbs (seldom, rarely, hardly, scarcely, no sooner, not only, under no circumstances) are placed at the beginning of a sentence for emphasis or formal dramatic effect, the word order becomes inverted like a question (Auxiliary + Subject + Verb).',
    examples: [
      'Rarely have I seen such an exceptional standard of musicianship.',
      'Under no circumstances should you disclose your security credentials.',
      'No sooner had we entered the building than the power supply failed.',
      'Not only did she deliver the presentation flawlessly, but she also answered every inquiry.'
    ],
    commonMistakes: [
      {
        incorrect: 'Seldom I have encountered such poor customer service.',
        correct: 'Seldom have I encountered such poor customer service.',
        explanation: 'When a negative adverbial begins the sentence, invert the auxiliary and the subject (have I).'
      },
      {
        incorrect: 'Not only she passed the examination, but she earned top marks.',
        correct: 'Not only did she pass the examination, but she earned top marks.',
        explanation: 'Use auxiliary inversion in the past simple: "Not only did she pass...".'
      }
    ],
    tags: ['inversion', 'negative adverbials', 'formal emphasis', 'rarely', 'hardly had']
  },
  {
    id: 'g_comparison_complex',
    title: 'Complex Comparison Structures',
    cefrLevel: 'B2',
    category: 'Comparison',
    shortDescription: 'Advanced comparison using proportional pairs (the... the...) and emphatic modifiers.',
    formStructure: 'Proportional: The + comparative ..., the + comparative ... | Equative: nowhere near as ... as | Emphatic: by far the most, considerably more',
    explanation: 'At B2 level, comparisons go beyond simple -er/more. Key structures include proportional comparison: "The harder you train, the better you perform"; negative equatives: "This solution is nowhere near as efficient as expected"; and strong modifiers like "by far", "significantly", "considerably", and "nowhere near".',
    examples: [
      'The more complex the problem becomes, the more creative we need to be.',
      'This quarter\'s revenue is nowhere near as strong as last year\'s figure.',
      'She is by far the most talented graphic designer in our studio.',
      'Renewable energy is becoming considerably cheaper than fossil fuels.'
    ],
    commonMistakes: [
      {
        incorrect: 'The more you practice, the you speak better.',
        correct: 'The more you practice, the better you speak.',
        explanation: 'Both halves of the proportional structure must feature "the + comparative adjective/adverb".'
      },
      {
        incorrect: 'The new engine is not near as noisy as the old one.',
        correct: 'The new engine is nowhere near as noisy as the old one.',
        explanation: 'Use the standard idiomatic modifier "nowhere near as... as" to express a massive difference.'
      }
    ],
    tags: ['complex comparison', 'the more the more', 'nowhere near as', 'by far', 'modifiers']
  }
];
