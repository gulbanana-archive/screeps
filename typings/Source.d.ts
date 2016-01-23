/**
 * An energy source object. Can be harvested by creeps with a WORK body part.
 */
interface Source
{
    id: string;
    energy: number;
    energyCapacity: number;
    ticksToRegeneration: number;
    pos: RoomPosition;
    room: Room;
}