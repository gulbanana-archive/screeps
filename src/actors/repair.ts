import * as util from '../util';
import * as actor from './_actor';

// find and fix broken structures
export default function(creep: Creep)
{    
    let retarget = creep.room.memory.priorityRepairs.pop();
    if (retarget)
    {
        creep.memory['repairTarget'] = retarget;
    }
    
    if (!creep.memory['repairTarget'])
    {
        let structures = creep.room.find<Structure>(FIND_STRUCTURES, {filter: (s: Structure) => s.hits && s.hitsMax});
        let mostDamagedStructure = _.last(_.sortBy(structures, s => util.realMax(s) - s.hits));
        if (mostDamagedStructure) 
        {
            creep.memory['repairTarget'] = mostDamagedStructure.id;
        }
        else
        {
            console.log('repair: no damaged structures found');
        }
    }
    
    let target = Game.getObjectById(creep.memory['repairTarget']) as Structure;
    if (!target)
    {
        console.log('repair: no current target, searching...');
        creep.memory['repairTarget'] = null;
        return;
    }
    
    let result = creep.repair(target); 
    switch (result)
    {                
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            break;
            
        case ERR_NOT_ENOUGH_RESOURCES:
            creep.memory['repairTarget'] = null;
            actor.become(creep, 'refill');
            break;
            
        case ERR_INVALID_TARGET:
            console.log('repair: invalid target ' + target);
            break;
            
        case ERR_BUSY:
            console.log('repair: still being spawned');
            break;
            
        case OK:
            if (target.hits == util.realMax(target) || creep.carry.energy == 0)
            {
                creep.memory['repairTarget'] = null;
                actor.become(creep, 'refill');
            }
            break;
            
        default:
            console.log('repair: unexpected error ' + result);
    }
};