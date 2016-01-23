import harvester from './harvester';
import builder from './builder';
import guard from './guard';

var roles: { [key: string]: (creep: Creep) => void; } = {
    'harvester': harvester,
    'builder': builder,
    'guard': guard
}

export function loop() 
{
    for (let name in Game.creeps)
    {
        var creep = Game.creeps[name];
        roles[creep.memory.role](creep);
    }
}