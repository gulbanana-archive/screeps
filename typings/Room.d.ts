/**
 * An object representing the room in which your units and structures are in. It can be used to look around, find paths, etc. Every object in the room contains its linked Room instance in the room property.
 */
interface Room
{
    controller: Structure;
    energyAvailable: number;
    energyCapacityAvailable: number;
    memory: any;
    mode: string;
    name: string;
    storage: Structure;
    
    /**
     * Find all objects of the specified type in the room.
     */
    find(type: number, opts?: { filter: any }): (Creep | ConstructionSite | Source)[];    
}