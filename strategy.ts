export interface Spec
{
    body: string[];
    memory: {become: string};
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
        if (creep.memory.become == role || creep.memory.then == role) i++;
    }
    
    return i;
}

//enacts construction directives
function builder(storage: Positioned&Energised&Identified) : Spec
{    
    let body = [MOVE, WORK, WORK, CARRY];
    let memory = {become: 'refill', then: 'build', storage: storage.id};
    return { body, memory, cost: getCost(body) };
}

//harvests an energy source and transfers its energy to some storage 
function harvester(source: Source, storage: Creep | Spawn | Structure) : Spec
{    
    let body = [MOVE, MOVE, WORK, CARRY, CARRY];
    let memory = {become: 'harvest', source: source.id, storage: storage.id};
    return { body, memory, cost: getCost(body) };
}

//transfers energy from a source to the room controller
function upgrader(storage: Positioned&Energised&Identified) : Spec
{    
    let body = [MOVE, WORK, WORK, CARRY];
    let memory = {become: 'refill', then: 'upgrade', storage: storage.id};
    return { body, memory, cost: getCost(body) };
}

export function planSpawns(): Spec[]
{
    let home = Game.spawns['Spawn1'];
    let mine = home.room.find(FIND_SOURCES)[0] as Source;
    let spawns: Spec[] = [];
    
    let harvesters = countCreeps('harvest');
    while (harvesters < 4)
    {
        spawns.push(harvester(mine, home));
        harvesters++;
    }
        
    let upgraders = countCreeps('upgrade');
    while (upgraders < 2)
    {
        spawns.push(upgrader(home));
        upgraders++;
    }
        
    let builders = countCreeps('build');
    while (builders < 2)
    {
        spawns.push(builder(home));
        builders++;
    }

    return spawns;
}