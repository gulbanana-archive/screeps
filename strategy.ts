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

function findCreeps(role: string): Creep[]
{
    let creeps: Creep[] = [];
    
    for (let name in Game.creeps)
    {
        let creep = Game.creeps[name];
        if (creep.memory.act == role || creep.memory.was == role) creeps.push(creep);
    }
    
    return creeps;
}

//enacts construction directives
function builder(storage: Positioned&Energised&Identified) : Spec
{    
    let body = [MOVE, WORK, CARRY];
    let memory = {age: 0, act: 'refill', was: 'build', storage: storage.id};
    return { body, memory, cost: getCost(body) };
}

//harvests an energy source and transfers its energy to some storage 
function harvester(source: Source, storage: Creep | Spawn | Structure) : Spec
{    
    let body = [MOVE, WORK, CARRY];
    let memory = {age: 0, act: 'harvest', source: source.id, storage: storage.id};
    return { body, memory, cost: getCost(body) };
}

//transfers energy from a source to the room controller
function upgrader(storage: Positioned&Energised&Identified) : Spec
{    
    let body = [MOVE, WORK, CARRY];
    let memory = {age: 0, act: 'refill', was: 'upgrade', storage: storage.id};
    return { body, memory, cost: getCost(body) };
}

export function modifyOrders()
{
    let waitingForRefills = findCreeps('refill');
    
    if (waitingForRefills.length > 2)
    {
        console.log("too many refills waiting, converting to harvester");
        actor.become(waitingForRefills[0], 'harvest');
    }
}

export function planSpawns(): Spec[]
{
    let home = Game.spawns['Spawn1'];
    let mine = home.room.find(FIND_SOURCES)[0] as Source;
    let spawns: Spec[] = [];
    
    let harvesters = countCreeps('harvest');
    let upgraders = countCreeps('upgrade');
    let builders = countCreeps('build');
        
    console.log("current creeps: " + harvesters + " harvest, " + upgraders + " upgrade, " + builders + " build");
    
    while (harvesters < 3)
    {
        spawns.push(harvester(mine, home));
        harvesters++;
    }
        
    while (upgraders < 1)
    {
        spawns.push(upgrader(home));
        upgraders++;
    }
    
    while (harvesters < 3)
    {
        spawns.push(harvester(mine, home));
        harvesters++;
    }
    
    while (builders < 1)
    {
        spawns.push(builder(home));
        builders++;
    }
     
    while (upgraders < 3)
    {
        spawns.push(upgrader(home));
        upgraders++;
    }
        
    while (builders < 3)
    {
        spawns.push(builder(home));
        builders++;
    }

    console.log("planned spawns: " + _.map(spawns, s => (s.memory.was ? s.memory.was : s.memory.act) + '@' + s.cost + ' '));

    return spawns;
}