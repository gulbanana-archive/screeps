export default function(creep: Creep) 
{
    let sources = creep.room.find(FIND_SOURCES);
    
    if (creep.carry.energy < creep.carryCapacity)
    {
        if (creep.harvest(sources[0] as Source) == ERR_NOT_IN_RANGE) 
        {
            creep.moveTo(sources[0]);
        }
    }
    else
    {
        if (creep.transfer(creep.room.controller, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
        {
            creep.moveTo(creep.room.controller);    
        }
    }
}