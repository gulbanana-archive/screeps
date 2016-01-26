import * as actor from './Agent';

// harvest an energy source
export default function(creep: Creep)
{
    if (!creep.memory['harvestSource'])
    {
        let newSource = creep.pos.findClosestByPath<Source>(FIND_SOURCES);
        if (!newSource)
        {
            console.log("harvest: no path to a source");
            actor.reset(creep, 'upgrade');
        }
        else
        {
            creep.memory['harvestSource'] = newSource.id;
        }
    }
    
    let source = Game.getObjectById(creep.memory['harvestSource']) as Source;
    
    let result = creep.harvest(source);
    switch (result) 
    {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(source);
            break;
            
        case ERR_INVALID_TARGET:
            console.log('harvest: source invalid. searching...');
            creep.memory['harvestSource'] = null;
            break;
            
        case ERR_BUSY:
            console.log('harvest: still being spawned');
            break;
        
        case ERR_NOT_ENOUGH_RESOURCES:
            if (creep.carry.energy > 0) actor.reset(creep, 'upgrade');
            break;
        
        case OK:
            if (creep.carry.energy == creep.carryCapacity) actor.become(creep, 'store');
            break;
        
        default:
            console.log('harvest: unexpected error ' + result);
    }
}