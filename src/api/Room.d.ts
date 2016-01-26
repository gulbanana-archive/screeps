/**
 * An object representing the room in which your units and structures are in. It can be used to look around, find paths, etc. Every object in the room contains its linked Room instance in the room property.
 */
interface Room
{
    controller: Structure;
    energyAvailable: number;
    energyCapacityAvailable: number;
    memory: RoomState;
    mode: string;
    name: string;
    storage: Structure & Energised;
    
    /**
     * Find all objects of the specified type in the room.
     */
    find<T>(type: number, opts?: { filter: any }): T[];    
}