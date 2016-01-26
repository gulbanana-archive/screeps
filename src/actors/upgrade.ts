import * as actor from './_actor';

//upgrade the room control level
export default function(creep: Creep)
{    
    let result = creep.upgradeController(creep.room.controller); 
    switch (result)
    {
        case ERR_NOT_ENOUGH_RESOURCES:
            actor.become(creep, 'refill');
            break;
            
        case ERR_NOT_IN_RANGE:
            creep.moveTo(creep.room.controller);
            break;
            
        case ERR_INVALID_TARGET:
            console.log('upgrade: invalid target ' + creep.room.controller)
            break;
            
        case OK:
            if (creep.carry.energy == 0) actor.become(creep, 'refill');
            break;
            
        default:
            console.log('upgrade: unexpected error ' + result);
    }
}