export default function(creep: Creep) 
{
    let targets = creep.room.find(FIND_HOSTILE_CREEPS);
    if (targets.length)
    {
        if (creep.attack(targets[0] as Creep) == ERR_NOT_IN_RANGE)
        {
            creep.moveTo(targets[0]);					
        }
    }
}