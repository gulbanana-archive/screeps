export function loop() 
{
    let spawn = Game.spawns['Spawn1'];
    let sources = spawn.room.find(FIND_SOURCES);
    
    for (let creepName in Game.creeps)
    {
        let creep = Game.creeps[creepName];
        
        if (creep.carry.energy < creep.carryCapacity)
        {
            if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(sources[0]);
            }
        }
        else
        {
            if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(spawn);    
            }
        }
    }
}