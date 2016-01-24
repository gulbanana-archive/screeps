import * as util from './util';

let segmentCosts: {[key: string]: number} = {};
segmentCosts[MOVE] = 50;
segmentCosts[WORK] = 100;
segmentCosts[CARRY] = 50;
segmentCosts[ATTACK] = 80;
segmentCosts[RANGED_ATTACK] = 150;
segmentCosts[HEAL] = 250;
segmentCosts[TOUGH] = 10;

class CSpec implements Spec
{
    body: string[];
    memory: State;
    cost: number;
    
    constructor(b: string[], m: State)
    {
        this.body = b;
        this.memory = m;
        this.cost = 0;
        for (let segment of this.body)
        {
            this.cost += segmentCosts[segment];
        }
    }

    toString()
    {
        return this.memory.act + '@' + this.cost;
    }
}

class CPlan implements Plan
{    
    spawns: Spec[];
    workers: string[]
    
    constructor(spawns: Spec[], workers: string[])
    {
        this.spawns = spawns;
        this.workers = workers;
    }
    
    toString()
    {
        return "{\n\tspawns: " + this.spawns + "\n\tworkers: " + this.workers + "\n}"; 
    }
}

function harvester(source: Source) : Spec
{    
    let capacity = util.calculateAvailableEnergy(source.room);
    
    let body = capacity >= 500 ? [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY] :
               capacity >= 350 ? [MOVE, MOVE, MOVE, WORK, CARRY, CARRY] :
                                 [MOVE, MOVE, WORK, CARRY];
                                 
    let memory: State = {age: 0, act: 'harvest', was: [], harvestSource: source.id};
    
    return new CSpec(body, memory);
}

function worker(storage: Positioned&Energised&Identified) : Spec
{    
    let capacity = util.calculateAvailableEnergy(storage.room);
    
    let body = capacity >= 500 ? [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY] :
               capacity >= 400 ? [MOVE, MOVE, MOVE, WORK, WORK, CARRY] :
                                 [MOVE, MOVE, WORK, CARRY];
                                 
    let memory = {age: 0, act: 'refill', was: ['upgrade'], storage: storage.id};
    
    return new CSpec(body, memory);
}

function planWorkers(room: Room): string[]
{   
    let result: string[] = [];
    
    let creeps = room.find<Creep>(FIND_MY_CREEPS);
    let workers = _.size(_.filter(creeps, util.wasOriginally(['upgrade', 'build', 'repair'])));
    let constructionSites = room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES).length;
    
    if (workers > 0)
    {
        result.push('upgrade');
        workers--;
    }
    
    if (workers > 0)
    {
        result.push('repair');
        workers--;
    }
    
    if (workers > 0 && constructionSites > 0)
    {
        result.push('build');
        workers--;
    }

    let brokenStructures = room.find<Structure>(FIND_STRUCTURES, {filter: (s: Structure) => (s.hits < s.hitsMax) && !(s.structureType == STRUCTURE_WALL && s.hits >= Memory.goals.wallCap)}).length;
    let extraRepair = Math.floor(brokenStructures/50);
    while (workers > 0)
    {
        if (extraRepair > 0)
        {
            result.push('repair');
            extraRepair--;
        }
        else if (constructionSites > 0)
        {
            result.push('build');
        }
        else
        {
            result.push('upgrade');    
        }
        
        workers--;
    }
    
    return result;
}

function planSpawns(room: Room): Spec[]
{
    let spawns: Spec[] = [];
    
    let creeps = room.find<Creep>(FIND_MY_CREEPS);
    let sources = room.find<Source>(FIND_SOURCES); 
    let harvesters = _.filter(creeps, util.wasOriginally(['harvest'])).length;
    let workers = _.filter(creeps, util.wasOriginally(['upgrade', 'build', 'repair'])).length;
        
    let needHarvesters = sources.length * 3;
        
    while (harvesters < needHarvesters)
    {
        spawns.push(harvester(sources[0]));
        harvesters++;
    }
    
    while (workers * 2 <= harvesters)
    {
        spawns.push(worker(room.find<Spawn>(FIND_MY_SPAWNS)[0]));
        workers++;
    }
    
    while (spawns.length < room.find(FIND_MY_SPAWNS).length)
    {
        spawns.push(harvester(sources[0]));
    }
    
    return spawns;
}

export function plan(room: Room): Plan
{
    let workers = planWorkers(room);
    let spawns = planSpawns(room);
    
    return new CPlan(spawns, workers);
}
