export function loop() 
{
    var spawn = Game.spawns['Spawn1'];
    var creep = Game.creeps['Worker1'];
	var sources = creep.room.find(FIND_SOURCES);
    
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