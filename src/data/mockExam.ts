import type { ExamDefinition } from '../types';

export const mockMiniExam: ExamDefinition = {
  id: 'mini-mock-01',
  title: 'Linguaskill Mini Mock (Practice)',
  version: '1.0.0',
  sections: [
    {
      id: 'section-reading-listening',
      type: 'reading_listening',
      title: 'Reading & Listening',
      skill: 'Integrated',
      isAdaptive: true,
      timeLimitMs: 15 * 60 * 1000, // 15 mins for mini mock
      tasks: [
        {
          id: 'task-r-1',
          type: 'multiple_choice',
          instructions: 'Read the text and choose the correct option.',
          questions: [
            {
              id: 'q-r-1',
              taskType: 'multiple_choice',
              prompt: 'What is the main purpose of the notice?',
              context: 'NOTICE: Please ensure all doors are locked after 6 PM. The security guard will check the premises at 6:30 PM.',
              options: [
                'To remind staff about security procedures.',
                'To announce a change in working hours.',
                'To introduce the new security guard.'
              ],
              correctAnswer: 'To remind staff about security procedures.',
              difficultyEstimate: 20, // A2 level
              cefrLevel: 'A2',
              skill: 'Reading'
            },
            {
              id: 'q-r-2',
              taskType: 'multiple_choice',
              prompt: 'What does the email imply about the meeting?',
              context: 'Email: Hi Sarah, Just a heads-up that tomorrow\'s project sync might run slightly over time due to the additional agenda items. We should probably hold off on scheduling anything immediately after.',
              options: [
                'The meeting will be shorter than usual.',
                'Attendees should keep their post-meeting schedule clear.',
                'The meeting has been rescheduled to tomorrow.'
              ],
              correctAnswer: 'Attendees should keep their post-meeting schedule clear.',
              difficultyEstimate: 60, // B1/B2 level
              cefrLevel: 'B2',
              skill: 'Reading'
            },
            {
              id: 'q-r-3',
              taskType: 'multiple_choice',
              prompt: 'Listen and choose what the speaker wants the listener to do.',
              options: ['Send the figures before lunch.', 'Cancel the afternoon meeting.', 'Rewrite the full report.'],
              correctAnswer: 'Send the figures before lunch.',
              difficultyEstimate: 80, // B2+ level
              cefrLevel: 'B2',
              skill: 'Listening',
              audioScript: 'Could you send me the updated sales figures before lunch? I need to include them in the report for our meeting this afternoon.'
            },
            {
              id: 'q-r-4',
              taskType: 'multiple_choice',
              prompt: 'Listen and identify the reason for the change.',
              options: ['The main room is being repaired.', 'More people registered than expected.', 'The speaker requested new equipment.'],
              correctAnswer: 'More people registered than expected.',
              difficultyEstimate: 10, // A1/A2 level
              cefrLevel: 'A2',
              skill: 'Listening',
              audioScript: 'Tomorrow’s workshop has moved from room twelve to the main hall. Registration was much higher than we expected, so the original room is no longer large enough.'
            }
          ]
        }
      ]
    }
  ]
};
