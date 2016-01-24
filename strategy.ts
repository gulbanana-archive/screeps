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

function iterateCreeps(): Creep[]
{
    let creeps: Creep[] = [];
    for (let name in Game.creeps)
    {
        let creep = Game.creeps[name];
        creeps.push(creep);
    }
    return creeps;
}

function harvester(source: Source) : Spec
{    
    let capacity = util.calculateAvailableEnergy(source.room);
    
    let body = capacity >= 500 ? [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY] :
               capacity >= 350 ? [MOVE, MOVE, MOVE, WORK, CARRY, CARRY] :
                                 [MOVE, MOVE, WORK, CARRY];
                                 
    let memory: State = {age: 0, act: 'harvest', was: [], source: source.id};
    
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
    
    if (workers > 0)
    {
        result.push('upgrade');
    }
    
    if (workers > 1)
    {
        result.push('repair');
    }
    
    let constructionSites = room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);
    for (let i = 2; i < workers; i++)
    {
        if (constructionSites.length)
        {
            result.push('build');
        }
        else
        {
            result.push('upgrade');
        }
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
    
    while (workers * 2 < harvesters)
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
    
    let plan = new CPlan(spawns, workers);
    Memory.plan = plan;
    return plan;
}
