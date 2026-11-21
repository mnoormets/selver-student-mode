import type { DemoRoster } from './types';

const morningSlotId = 'morning';

export const demoRoster: DemoRoster = {
  eventName: 'Riverside Community Fair',
  slots: [{ id: morningSlotId, label: '10:00–11:00' }],
  volunteers: [
    {
      id: 'ava',
      name: 'Ava Chen',
      qualifiedRoles: ['check-in'],
      availableSlotIds: [morningSlotId],
    },
    {
      id: 'jordan',
      name: 'Jordan Lee',
      qualifiedRoles: ['check-in', 'welcome'],
      availableSlotIds: [morningSlotId],
    },
    {
      id: 'riley',
      name: 'Riley Brooks',
      qualifiedRoles: ['supplies'],
      availableSlotIds: [morningSlotId],
    },
    {
      id: 'maya',
      name: 'Maya Patel',
      qualifiedRoles: ['check-in'],
      availableSlotIds: [morningSlotId],
    },
    {
      id: 'quinn',
      name: 'Quinn Rivera',
      qualifiedRoles: ['check-in'],
      availableSlotIds: [],
    },
    {
      id: 'sam',
      name: 'Sam Morgan',
      qualifiedRoles: ['welcome'],
      availableSlotIds: [morningSlotId],
    },
  ],
  shifts: [
    {
      id: 'check-in-morning',
      station: 'Check-in',
      role: 'check-in',
      slotId: morningSlotId,
      initialVolunteerId: 'ava',
    },
    {
      id: 'welcome-morning',
      station: 'Welcome Desk',
      role: 'welcome',
      slotId: morningSlotId,
      initialVolunteerId: 'jordan',
    },
    {
      id: 'supplies-morning',
      station: 'Supply Table',
      role: 'supplies',
      slotId: morningSlotId,
      initialVolunteerId: 'riley',
    },
  ],
}
