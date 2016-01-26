import * as actor from './_actor';

// stand on the walls, basically, and look for enemies
export default function(creep: Creep)
{    
    let enemy: Creep|Spawn|Structure = creep.pos.findClosestByRange<Creep>(FIND_HOSTILE_CREEPS);
    if (!enemy) enemy = creep.pos.findClosestByRange<Spawn>(FIND_HOSTILE_SPAWNS);
    if (!enemy) enemy = creep.pos.findClosestByRange<Structure>(FIND_HOSTILE_STRUCTURES);
    if (enemy)
    {
        let result = creep.attack(enemy);
        switch (result)
        {
            case ERR_NOT_IN_RANGE:
                creep.moveTo(enemy);
                break;
            
            case OK:
                break;
                
            default:
                console.log('fight: unexpected error ' + result);
        }
        return;
    }
    
    let rampart = creep.pos.findClosestByRange<Structure>(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_RAMPART}});
    if (rampart)
    {
        creep.moveTo(rampart);
        return;
    }
};