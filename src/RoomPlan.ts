import CreepSpec from './CreepSpec';

export default class RoomPlan
{
    spawns: CreepSpec[];
    workers: string[];
    
    constructor(spawns: CreepSpec[], workers: string[])
    {
        this.spawns = spawns;
        this.workers = workers;
    }
    
    toString()
    {
        return "{\n\tspawns: " + this.spawns + "\n\tworkers: " + this.workers + "\n}"; 
    }
}