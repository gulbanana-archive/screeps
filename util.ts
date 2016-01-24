export function calculateAvailableEnergy(room: Room): number
{
    let extensions = room.find<Energised>(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }});
    return 300 + extensions.length * 50;
}

export function realMax(s: Structure)
{
    if (s.structureType == STRUCTURE_WALL)
        return Math.min(s.hitsMax, Memory.goals.wallCap);
    else
        return s.hitsMax; 
}