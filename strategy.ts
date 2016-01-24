import * as util from './util';
import * as actor from './actor';

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
        return actor.originalRole(this) + '@' + this.cost;
    }
}

class CPlan implements Plan
{    
    spawns: Spec[];
    workers: string[];
    priorityRepairs: string[];
    
    constructor(spawns: Spec[], workers: string[], priorityRepairs: string[])
    {
        this.spawns = spawns;
        this.workers = workers;
        this.priorityRepairs = priorityRepairs;
    }
    
    toString()
    {
        return "{\n\tspawns: " + this.spawns + "\n\tworkers: " + this.workers +  "\n\tpriorityRepairs: " + this.priorityRepairs + "\n}"; 
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

function worker(storage: Positioned&Energised&Identified): Spec
{    
    let capacity = util.calculateAvailableEnergy(storage.room);
    
    let body = capacity >= 500 ? [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY] :
               capacity >= 400 ? [MOVE, MOVE, MOVE, WORK, WORK, CARRY] :
                                 [MOVE, MOVE, WORK, CARRY];
                                 
    let memory: State = {age: 0, act: 'refill', was: ['upgrade'], storage: storage.id};
    
    return new CSpec(body, memory);
}

function soldier(room: Room): Spec
{
    let capacity = util.calculateAvailableEnergy(room);
    
    let body = capacity >= 450 ? [MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, TOUGH] :
               capacity >= 390 ? [MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK] :
               capacity >= 320 ? [MOVE, MOVE, MOVE, ATTACK, ATTACK, TOUGH] :
                                 [MOVE, MOVE, ATTACK, ATTACK];
                                 
    let memory: State = {age: 0, act: 'fight', was: []};
    
    return new CSpec(body, memory);
}

function colonist(destination: string): Spec
{   
    let body = [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY];
                                 
    let memory: State = {age: 0, act: 'colonist', was: [], travelTarget: destination};
    
    return new CSpec(body, memory);
}

function planWorkers(room: Room): string[]
{   
    let result: string[] = [];
    
    let creeps = room.find<Creep>(FIND_MY_CREEPS);
    let workers = _.size(_.filter(creeps, actor.wasOriginally(['upgrade', 'build', 'repair'])));
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

    let brokenStructures = room.find<Structure>(FIND_STRUCTURES, {filter: (s: Structure) => (s.hits < util.realMax(s))}).length;
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
    let harvesters = _.filter(creeps, actor.wasOriginally(['harvest'])).length;
    let workers = _.filter(creeps, actor.wasOriginally(['upgrade', 'build', 'repair'])).length;
    let soldiers = _.filter(creeps, actor.wasOriginally(['fight'])).length;
        
    if (Memory.goals.colonise)
    {
        let colonists =  _.filter(creeps, actor.wasOriginally(['colonist']));
        if (colonists.length)
        {
            Memory.goals.colonise = null;
        }
        else
        {
            spawns.push(colonist(Memory.goals.colonise));
        }
    }
        
    let needHarvesters = sources.length * 3;
    while (harvesters < needHarvesters)
    {
        spawns.push(harvester(sources[0]));
        harvesters++;
    }
    
    if (harvesters > 5 && soldiers == 0)
    {
        spawns.push(soldier(room));
        soldiers++;
    }
    
    while (workers * 2 <= harvesters)
    {
        spawns.push(worker(room.find<Spawn>(FIND_MY_SPAWNS)[0]));
        workers++;
    }
    
    while (spawns.length < room.find(FIND_MY_SPAWNS).length)
    {
        spawns.push(harvester(sources[0]));
        harvesters++;
    }
    
    return spawns;
}

export function plan(room: Room): Plan
{
    let workers = planWorkers(room);
    let spawns = planSpawns(room);
    let priorityRepairs = room.find<Structure>(FIND_STRUCTURES, {filter: (s: Structure) => s.hits == 1}).map(s => s.id);
    
    return new CPlan(spawns, workers, priorityRepairs);
}