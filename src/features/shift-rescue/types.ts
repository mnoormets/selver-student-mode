export type Role = 'check-in' | 'welcome' | 'supplies';

export interface Slot {
  readonly id: string;
  readonly label: string;
}

export interface Volunteer {
  readonly id: string;
  readonly name: string;
  readonly qualifiedRoles: readonly Role[];
  readonly availableSlotIds: readonly string[];
}

export interface Shift {
  readonly id: string;
  readonly station: string;
  readonly role: Role;
  readonly slotId: string;
  readonly initialVolunteerId: string;
}

export interface DemoRoster {
  readonly eventName: string;
  readonly slots: readonly Slot[];
  readonly volunteers: readonly Volunteer[];
  readonly shifts: readonly Shift[];
}
