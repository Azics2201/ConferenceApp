export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'a1',
    title: 'Welcome to TechConnect 2026!',
    body: 'Registration opens at 08:00 in the main lobby. See you there!',
    audience: { type: 'all' },
    timestamp: '2026-10-13T18:00:00Z',
    priority: 'normal',
  },
  {
    id: 'a2',
    title: 'Room change for "Design Systems that Scale"',
    body: 'This session has moved from Room B to Room C due to demand.',
    audience: { type: 'session', sessionId: 's3' },
    timestamp: '2026-10-14T07:30:00Z',
    priority: 'high',
  },
];
