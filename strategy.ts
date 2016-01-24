import * as actor from './actor';

export interface Spec
{
    body: string[];
    memory: State;
    cost: number;
}

let segmentCosts: {[key: string]: number} = {};
segmentCosts[MOVE] = 50;
segmentCosts[WORK] = 100;
segmentCosts[CARRY] = 50;
segmentCosts[ATTACK] = 80;
segmentCosts[RANGED_ATTACK] = 150;
segmentCosts[HEAL] = 250;
segmentCosts[TOUGH] = 10;

function getCost(body: string[]): number
{
    let cost = 0;
    for (let segment of body)
    {
        cost += segmentCosts[segment];
    }
    return cost;
}

function countCreeps(role: string): number
{
    let i = 0;
    for (let name in Game.creeps)
    {
        let creep = Game.creeps[name];
        if (creep.memory.act == role || creep.memory.was == role) i++;
    }
    
    return i;
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
    let capacity = calculateAvailableEnergy(source.room);
    let body = capacity >= 350 ? [MOVE, MOVE, MOVE, WORK, CARRY, CARRY] :
                                 [MOVE, MOVE, WORK, CARRY];
    let memory = {age: 0, act: 'harvest', source: source.id};
    return { body, memory, cost: getCost(body) };
}

function worker(storage: Positioned&Energised&Identified) : Spec
{    
    let capacity = calculateAvailableEnergy(storage.room);
    
    let body = capacity >= 400 ? [MOVE, MOVE, MOVE, WORK, WORK, CARRY] :
                                 [MOVE, MOVE, WORK, CARRY];
    let memory = {age: 0, act: 'refill', was: 'upgrade', storage: storage.id};
    return { body, memory, cost: getCost(body) };
}

function modifyRoles(room: Room, creeps: Creep[])
{   
    let workersWaitingForRefills = _.filter(creeps, c => c.memory.act == 'refill' && c.memory.age > 25);
    
    if (workersWaitingForRefills.length)
    {
        console.log("refill: waited for too long, converting to harvester");
        actor.become(workersWaitingForRefills[0], 'harvest');
    }
    
    let builders = _.filter(creeps, c => c.memory.act == 'build');
    let upgraders = _.filter(creeps, c => c.memory.act == 'upgrade');
    
    // keep at least one upgrader
    if (builders.length && !upgraders.length)
    {
        let worker = builders.pop();
        actor.become(worker, 'upgrade');
        upgraders.push(worker);
    }
    
    // convert most upgraders to builders
    let constructionSites = room.find(FIND_CONSTRUCTION_SITES);
    if (constructionSites.length)
    {
        for (let worker of _.drop(upgraders, 1))
        {
            actor.become(worker, 'build');
        }
    }
    
    //nothing to build? back to upgrading
    else
    {
        for (let worker of builders)
        {
            actor.become(worker, 'upgrade');
        }
    }
}

export function plan(home: Spawn): Spec[]
{
    let creeps = iterateCreeps();
    
    modifyRoles(home.room, creeps);
    
    let sources = home.room.find(FIND_SOURCES) as Source[]; 
    let spawns: Spec[] = [];
    
    let harvesters = _.filter(creeps, c => c.memory.act == 'harvest' || c.memory.act == 'store').length;
    let workers = _.filter(creeps, c => c.memory.act == 'build' || c.memory.act == 'upgrade' || c.memory.act == 'refill').length;
        
    let needHarvesters = sources.length * 3;
        
    while (harvesters < needHarvesters)
    {
        spawns.push(harvester(sources[0], home));
        harvesters++;
    }
    
    while (workers * 2 < harvesters)
    {
        spawns.push(worker(home));
        workers++;
    }
    
    if (!spawns.length) spawns.push(harvester(sources[0], home));

    let knownCreeps = _.map(creeps, c => c.memory.act);
    let plannedSpawns = _.map(spawns, s => (s.memory.was ? s.memory.was : s.memory.act) + '@' + s.cost);
    Memory.plan = {creeps: knownCreeps, spawns: plannedSpawns};

    return spawns;
}

export function calculateAvailableEnergy(room: Room): number
{
    let extensions = room.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }}) as Energised[];
    return 300 + extensions.length * 50;
}