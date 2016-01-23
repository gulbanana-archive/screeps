import harvester from './role-harvester';
import upgrader from './role-upgrader';
import builder from './role-builder';

let home = Game.spawns['Spawn1'];

export function loop() 
{
    respawn(home);
    work();
}

function respawn(spawn: Spawn)
{
    let spec: {body: string[], role: string, cost?: number};
        
    if (countCreeps('harvester') < 1)
    {
        spec = {body: [MOVE, MOVE, WORK, CARRY, CARRY], role: 'harvester'};    
    } 
    else if (countCreeps('upgrader') < 1)
    {
        spec = {body: [MOVE, MOVE, WORK, CARRY, CARRY], role: 'upgrader'};    
    }
    else if (countCreeps('builder') < 1)
    {
        spec = {body: [MOVE, WORK, WORK, CARRY], role: 'builder'};    
    }
    
    spawn.memory.goal = spec;
    
    if (spec != null)
    {
        spec.cost = calculateCost(spec.body);
        
        if (spawn.energyCapacity < spec.cost)
        {
            console.log('cost too high for ' + spec.role);
        }
    
        if (spawn.spawning == null && spawn.energy >= spec.cost)
        {
            let result = spawn.createCreep(spec.body, undefined, {role: spec.role});
            if (typeof(result) == 'string')
            {
                console.log('spawning ' + spec.role + ' ' + result);
            }
            else
            {
                assert(result as number);
            }
        }
    }
}

function work()
{  
    let sources = home.room.find(FIND_SOURCES);
    
    for (let name in Game.creeps)
    {
        let creep = Game.creeps[name];
        
        switch (creep.memory.role)
        {
            case 'harvester':
                harvester(creep, sources[0] as Source, home);
                break;
                
            case 'upgrader':
                upgrader(creep, home);
                break;
                
            case 'builder':
                builder(creep, home);
                break;
            
            default:
                console.log('found unknown creep ' + creep.memory.role + ', suiciding');
                creep.suicide();
                break;
        }
    }
}

function countCreeps(role: string): number
{
    let i = 0;
    for (let name in Game.creeps)
    {
        if (Game.creeps[name].memory.role === role) i++;
    }
    
    return i;
}

let segmentCosts: {[key: string]: number} = {};
segmentCosts[MOVE] = 50;
segmentCosts[WORK] = 100;
segmentCosts[CARRY] = 50;
segmentCosts[ATTACK] = 80;
segmentCosts[RANGED_ATTACK] = 150;
segmentCosts[HEAL] = 250;
segmentCosts[TOUGH] = 10;

function calculateCost(body: string[]): number
{
    let cost = 0;
    for (let segment of body)
    {
        cost += segmentCosts[segment];
    }
    return cost;
}

function assert(errorCode: number, cause?: string)
{   
    if (cause == null)
    {
        cause = '';
    }
    else
    {
        cause = cause + ': ';
    }
    
    switch (errorCode)
    {
        case OK:
            return;
            
        case ERR_NOT_OWNER:
            console.log(cause + 'ERR_NOT_OWNER');
            
        case ERR_NOT_ENOUGH_ENERGY:
            console.log(cause + 'ERR_NOT_ENOUGH_ENERGY');
            break;
        
        default:
            console.log(cause + 'unknown error code ' + errorCode);
    }
}