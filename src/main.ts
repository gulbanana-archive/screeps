import * as _ from 'lodash';
import * as util from './util';
import * as strategy from './strategy';
import CreepSpec from './CreepSpec';
import Agent from './agents/Agent';
import Traveller from './agents/Agent';

function assignWorkers(room: Room, assignments: string[])
{
    let workers = _.filter(room.find<Creep>(FIND_MY_CREEPS), Agent.wasOriginally(['upgrade', 'build', 'repair']))
    let existingAssignments = workers.map(w => (w.memory.was.length ? w.memory.was[0] : w.memory.act)).sort();
    
    if (_.isEqual(assignments.sort(), existingAssignments.sort())) return;
 
    let counts = _.countBy(assignments);   
    let existingCounts = _.countBy(existingAssignments);
    
    let grow = ['upgrade', 'build', 'repair'].filter(r => (counts[r] && !existingCounts[r]) || (counts[r] > existingCounts[r]));
    let shrink = ['upgrade', 'build', 'repair'].filter(r => (existingCounts[r] && !counts[r]) || (existingCounts[r] > counts[r]));
    
    for (let g of grow)
    {
        for (let i = 0; i < (counts[g] - (existingCounts[g] ? existingCounts[g] : 0)); i++)
        {
            let candidate = _.filter(workers, Agent.wasOriginally(shrink))[0];
            _.remove(workers, candidate);
            candidate.memory.act = g;
        }
    }
}

function spawnCreep(spawner: Spawn, spec: CreepSpec)
{
    let result = spawner.createCreep(spec.body, undefined, spec.memory);
            
    if (_.isString(result))
    {
        console.log("spawn: creating " + spec + ' "' + result + '"');
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

function spawnCreeps(room: Room, specs: CreepSpec[])
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
        
        if (creep.spawning) continue;
        
        if (creep.memory['travel'] && creep.memory.act != 'travel') Agent.become(creep, Traveller);
        
        try
        {            
            let agent = Agent.wrap(creep);
            agent.act();
            creep.memory.age++;
        }
        catch (ex)
        {
            console.log(creep.name + ": " + ex);
        }
    }
}

export function loop() 
{
    if (!Memory.params)
    Memory.params = {colonise: null, wallCap: 10000};
    
    for (let home of [Game.spawns['Spawn1']])
    {
        let roomPlan = strategy.plan(home.room);
        assignWorkers(home.room, roomPlan.workers);
        spawnCreeps(home.room, roomPlan.spawns);
    }

    performRoles();
}

console.log('main: reparsed');