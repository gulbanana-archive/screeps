export function calculateAvailableEnergy(room: Room): number
{
    let extensions = room.find<Energised>(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }});
    return 300 + extensions.length * 50;
}

export function wasOriginally(roles: string[]): (c: Creep) => boolean
{
    return function(c: Creep)
    {
        for (let role of roles)
        {
            if ((c.memory.was && c.memory.was.length && c.memory.was[0] == role) || c.memory.act == role) return true;
        } 
        return false;
    }
}

export function originalRole(c: {memory: State}): string
{
    return c.memory.was.length ? c.memory.was[0] : c.memory.act
}