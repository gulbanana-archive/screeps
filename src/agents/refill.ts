import * as actor from './Agent';

//refill stored energy and return to some other action 
export default function(creep: Creep)
{    
    if (!creep.memory['storage'])
    {
        let spawn = _.head(creep.room.find<Spawn>(FIND_MY_SPAWNS));

        if (spawn) 
        {
            creep.memory['storage'] = spawn.id;
        }
        else
        {
            console.log('refill: no spawn found');
        }
    }
    
    let storage = Game.getObjectById(creep.memory['storage']) as Positioned&Energised;
    if (storage && storage.energy < (creep.carryCapacity - creep.carry.energy) && creep.memory.age > 25)
    {
        if (_.sum(_.map(creep.room.find<Source>(FIND_SOURCES), s => s.energy)) == 0)
        {
            creep.memory.age--;
        }
        else
        {
            console.log('refill: waited too long, becoming harvester');
            actor.reset(creep, 'harvest');
        }
    }

    let result = storage.transferEnergy(creep);
    switch (result) 
    {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(storage);
            break;
            
        case ERR_FULL:
            actor.unbecome(creep);
            break;
            
        case ERR_INVALID_TARGET:
            console.log('refill: no storage found, searching...');
            creep.memory['storage'] = null;
            break;
            
        case OK:
            // can't transition here since it's too hard to predict whether we're about to get filled up
            break;		
            
        default:
            console.log('refill: unexpected error ' + result);
            break;            
    }
}