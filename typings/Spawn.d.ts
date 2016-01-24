/**
 *  Spawns are your colony centers. You can transfer energy into it and create new creeps using createCreep() method. 
 */
interface Spawn extends Structure, Energised
{
    name: string;
    memory: any;
    spawning: { name: string; needTime: number; remainingTime: number; };
    
    /**
     * Check if a creep can be created.
     */
    canCreateCreep(body: string[], name?: string): number;
    
    /**
     * Start the creep spawning process.
     */
    createCreep(body: string[], name?: string, memory?: any): number | string;
}