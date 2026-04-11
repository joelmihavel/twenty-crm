import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const ROOM_AVAILABILITY_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Room Availabilities',
  labelSingular: 'Room Availability',
  namePlural: 'roomAvailabilities',
  nameSingular: 'roomAvailability',
  icon: 'IconCalendarCheck',
  description: 'Availability status and current occupant for rooms',
  skipNameField: true,
};
