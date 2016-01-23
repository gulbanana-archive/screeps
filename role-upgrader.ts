//transfers energy from a source to the room controller
enum Goal
{
    GET_ENERGY,
    UPGRADE_CONTROLLER
}
 
export default function(creep: Creep, energySource: Positioned&Energised) 
{
    if (creep.memory.goal == Goal.UPGRADE_CONTROLLER)
    {
        if (creep.carry.energy == 0)
        {
            creep.memory.goal = Goal.GET_ENERGY;
        }
        else
        {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(creep.room.controller);    
            }
        }
    }
    else
    {
        if (creep.carry.energy == creep.carryCapacity)
        {
            creep.memory.goal = Goal.UPGRADE_CONTROLLER;
        }
        else
        {
            if(energySource.transferEnergy(creep) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(energySource);				
            }
        }
    }
}