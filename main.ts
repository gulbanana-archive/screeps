import _ = require('lodash');
import * as util from './util';
import * as actor from './actor';
import * as strategy from './strategy';

class CPlans
{
    toString()
    {
        let result = "";
        for (let key in this)
        {
            if (key != 'toString')
            {
                result += key;
                result += ': ';
                result += (this as {[key: string]: Plan;})[key] + "\n";
            }
        }
        return result;
    }
}

function assignWorkers(room: Room, assignments: string[])
{
    let workers = _.filter(room.find<Creep>(FIND_MY_CREEPS), actor.wasOriginally(['upgrade', 'build', 'repair']))
    let existingAssignments = workers.map(actor.originalRole).sort();
    
    if (_.isEqual(assignments.sort(), existingAssignments.sort())) return;
 
    let counts = _.countBy(assignments);   
    let existingCounts = _.countBy(existingAssignments);
    
    let grow = ['upgrade', 'build', 'repair'].filter(r => (counts[r] && !existingCounts[r]) || (counts[r] > existingCounts[r]));
    let shrink = ['upgrade', 'build', 'repair'].filter(r => (existingCounts[r] && !counts[r]) || (existingCounts[r] > counts[r]));
    
    for (let g of grow)
    {
        for (let i = 0; i < (counts[g] - (existingCounts[g] ? existingCounts[g] : 0)); i++)
        {
            let candidate = _.filter(workers, actor.wasOriginally(shrink))[0];
            _.remove(workers, candidate);
            actor.reset(candidate, g);
        }
    }
}

function spawnCreep(spawner: Spawn, spec: Spec)
{
    let result = spawner.createCreep(spec.body, undefined, spec.memory);
            
    if (_.isString(result))
    {
        console.log("spawn: creating " + actor.originalRole(spec) + ' "' + result + '"');
    }
    else
    {
        switch (result)
        {
            case ERR_NOT_ENOUGH_ENERGY:
                console.log('spawn: not enough energy');
                break;

            case ERR_BUSY:
                console.log('spawn: already busy');
                break;

            default:
                console.log('spawn: unexpected error ' + result);
        }              
    }
}

function spawnCreeps(room: Room, specs: Spec[])
{
    let spawners = room.find<Spawn>(FIND_MY_SPAWNS);
    let availableEnergy = util.calculateAvailableEnergy(room);
    
    while (specs[0].cost > availableEnergy)
    {
        console.log('spawn cost too high: ' + specs.pop());
    }
    
    for (let s of spawners)
    {
        if (_.size(specs) > 0 && !s.spawning && s.canCreateCreep(specs[0].body) == OK)
        { 
            spawnCreep(s, specs.shift());
        }
    }
}

function performRoles()
{
    for (let name in Game.creeps)
    {
        let creep = Game.creeps[name];
        if (!creep.spawning) actor.act(creep);
    }
}

export function loop() 
{
    if (!Memory.goals) Memory.goals = { colonise: null, wallCap: 10000 };
    
    Memory.plans = new CPlans() as {[key: string]: Plan;};
    
    for (let home of [Game.spawns['Spawn1']])
    {
        let roomPlan = strategy.plan(home.room);
        Memory.plans[home.room.name] = roomPlan; 
        assignWorkers(home.room, roomPlan.workers);
        spawnCreeps(home.room, roomPlan.spawns);
    }

    performRoles();
}