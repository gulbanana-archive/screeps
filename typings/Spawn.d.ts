/**
 *  Spawns are your colony centers. You can transfer energy into it and create new creeps using createCreep() method. 
 */
interface Spawn extends Owned, Positioned
{
    id: string;
    
    energy: number;
    energyCapacity: number;
    hits: number;
    hitsMax: number;
    memory: any;
    name: string;
    structureType: string;
    spawning: { name: string; needTime: number; remainingTime: number; };
    
    /**
     * Start the creep spawning process.
     */
    createCreep(body: string[], name?: string, memory?: any): number;
    
    /**
     * Transfer the energy from the spawn to a creep.
     */
    transferEnergy(target: Creep, amount?: number): number;
}