//harvests an energy source and transfers its energy to some storage 
export default function(creep: Creep, source: Source, target: Creep | Spawn | Structure) 
{
    if (creep.carry.energy < creep.carryCapacity)
    {
        creep.memory.goal = 'harvest energy';
        
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) 
        {
            creep.moveTo(source);
        }
    }
    else
    {
        creep.memory.goal = 'store energy';
        
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
        {
            creep.moveTo(target);    
        }
    }
}