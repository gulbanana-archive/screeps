//enact construction directives
enum Goal
{
    GET_ENERGY,
    BUILD_SITE
}
 
export default function(creep: Creep, energySource: Positioned&Energised) 
{    
    let sites = creep.room.find(FIND_CONSTRUCTION_SITES);
    
    if (creep.memory.goal == Goal.BUILD_SITE)
    {
        if (creep.carry.energy == 0)
        {
            creep.memory.goal = Goal.GET_ENERGY;
        }
        else
        {
            if (creep.build(sites[0] as ConstructionSite) == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(sites[0]);					
            }
        }
    }
    else
    {
        if (creep.carry.energy == creep.carryCapacity)
        {
            creep.memory.goal = Goal.BUILD_SITE;
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