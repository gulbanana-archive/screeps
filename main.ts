import * as strategy from './strategy';
import * as actor from './actor';
import * as util from './util';
import _ = require('lodash');

function assignWorkers(room: Room, assignments: string[])
{
    let counts = _.countBy(assignments);
    
    let workers = _.filter(room.find<Creep>(FIND_MY_CREEPS), util.wasOriginally(['upgrade', 'build', 'repair']))
    let existingAssignments = workers.map(util.originalRole);
    let existingCounts = _.countBy(existingAssignments);
    
    let grow = ['upgrade', 'build', 'repair'].filter(r => (counts[r] && !existingCounts[r]) || (counts[r] > existingCounts[r]));
    let shrink = ['upgrade', 'build', 'repair'].filter(r => (existingCounts[r] && !counts[r]) || (existingCounts[r] > counts[r]));
    
    for (let g of grow)
    {
        for (let i = 0; i < (counts[g] - (existingCounts[g] ? existingCounts[g] : 0)); i++)
        {
            let candidate = _.filter(workers, util.wasOriginally(shrink))[0];
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
        console.log("spawn: creating " + util.originalRole(spec) + ' "' + result + '"');
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
            spawnCreep(s, specs.pop());
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
    
    if (!Memory.plans) Memory.plans = {};
    
    if (Memory.goals.colonise)
    {
        Game.spawns['Spawn1'].createCreep([MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY], 'Dora', {age: 0, act: 'colonist', was: [], travelTarget: Memory.goals.colonise});
        if (Game.creeps['Dora'])
        {
            Memory.goals.colonise = null;
        }
    }
    
    for (let home of [Game.spawns['Spawn1']])
    {
        let roomPlan = strategy.plan(home.room);
        Memory.plans[home.room.name] = roomPlan; 
        assignWorkers(home.room, roomPlan.workers);
        if (!Memory.goals.colonise) spawnCreeps(home.room, roomPlan.spawns);
    }

    performRoles();
}