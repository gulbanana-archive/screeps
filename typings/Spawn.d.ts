/**
 *  Spawns are your colony centers. You can transfer energy into it and create new creeps using createCreep() method. 
 */
interface Spawn extends Owned
{
    id: string;
    
    room: Room;
    pos: RoomPosition;
    
    energy: number;
    energyCapacity: number;
    hits: number;
    hitsMax: number;
    memory: any;
    name: string;
    structureType: string;
    spawning: { name: string; needTime: number; remainingTime: number; };
    
    /**
     * Transfer the energy from the spawn to a creep.
     */
    transferEnergy(target: Creep, amount?: number): number;
}