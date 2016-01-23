import harvester from './harvester';
import builder from './builder';

export function loop() 
{
    for (let name in Game.creeps)
    {
        var creep = Game.creeps[name];
        switch (creep.memory.role)
        {
            case 'harvester':
                harvester(creep);
                break;
                
            case 'builder':
                builder(creep);
                break;
        }
    }
}