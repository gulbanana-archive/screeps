import * as actor from './_actor';

// fill extensions and spawns with stored energy 
export default function(creep: Creep)
{    
    let spawns = creep.room.find<Structure&Energised>(FIND_MY_SPAWNS);
    let extensions = creep.room.find<Structure&Energised>(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }});
    let storage = spawns.concat(extensions).filter(s => s.energy < s.energyCapacity);
    let target = _.head(storage);
    
    if (!target)
    {
        console.log('store: no empty containers, idling');
        return;
    }
    
    let result = creep.transfer(target, RESOURCE_ENERGY);
    switch (result)
    {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            break;
            
        case ERR_NOT_ENOUGH_RESOURCES:
            actor.unbecome(creep);
            break;
            
        case ERR_FULL:
            console.log('store: target full');
            break;
            
        case ERR_INVALID_TARGET:
            console.log('store: invalid target ' + target);
            break;
            
        case OK:
            if (target.energyCapacity - target.energy >= creep.carry.energy) actor.unbecome(creep);
            break;
            
        default:
            console.log('store: unexpected error ' + result);
            break;
    } 
}
