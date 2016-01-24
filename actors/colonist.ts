import * as actor from './_actor';

export default function(creep: Creep)
{
    // stock up before leaving
    if (creep.carry.energy < creep.carryCapacity)
    {
        actor.become(creep, 'refill');
        return; 
    }
    
    // travel to the new world
    let target = creep.memory['travelTarget'];
    if (creep.room.name != target)
    {
        actor.become(creep, 'travel');
        return;
    }

    // success
    if (creep.room.controller.my)
    {
        actor.reset(creep, 'upgrade');
    }
    
    let result = creep.claimController(creep.room.controller);
    switch (result)
    {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(creep.room.controller);
            break;
        
        case ERR_GCL_NOT_ENOUGH:
            console.log('colonist: GCL insufficient for claim');
            break;
        
        case OK:
            console.log('colonist: room claimed');
            break;
            
        default:
            console.log('colonist: unexpected error ' + result);
    }
}
