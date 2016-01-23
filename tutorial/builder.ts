export default function(creep: Creep) 
{
    let spawn = Game.spawns['Spawn1'];
    let sites = creep.room.find(FIND_CONSTRUCTION_SITES);
    
    if(creep.carry.energy == 0) 
    {
        if(spawn.transferEnergy(creep) == ERR_NOT_IN_RANGE) 
        {
            creep.moveTo(spawn);				
        }
    }
    else
    {
        let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length)
        {
            if (creep.build(targets[0] as ConstructionSite) == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(targets[0]);					
            }
        }
    }
}