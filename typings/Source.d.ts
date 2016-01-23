/**
 * An energy source object. Can be harvested by creeps with a WORK body part.
 */
interface Source
{
    id: string;

    room: Room;
    pos: RoomPosition;

    energy: number;
    energyCapacity: number;
    ticksToRegeneration: number;
}