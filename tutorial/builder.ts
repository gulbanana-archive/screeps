export default function(creep: Creep) 
{
    if(creep.carry.energy == 0) 
    {
        let spawn = Game.spawns['Spawn1'];
        if(spawn.transferEnergy(creep) == ERR_NOT_IN_RANGE) 
        {
            creep.moveTo(spawn);				
        }
    }
    else
    {
        let sites = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (sites.length)
        {
            if (creep.build(sites[0] as ConstructionSite) == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(sites[0]);					
            }
        }
    }
}