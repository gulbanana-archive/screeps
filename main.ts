import controller from './role-controller';

let spawn = Game.spawns['home'];

export function loop() 
{
    respawn();
    work();
}

function respawn()
{
    if (spawn.spawning == null)
    {
        if (countCreeps('controller') < 1)
        {
            spawn.createCreep([MOVE, WORK, CARRY], undefined, {role: 'controller'});
        }
    }
}

function work()
{  
    for (let name in Game.creeps)
    {
        var creep = Game.creeps[name];
        
        switch (creep.memory.role)
        {
            case 'controller':
                controller(creep);
                break;
            
            default:
                console.log('unknown role ' + creep.memory.role);
                break;
        }
    }
}

function countCreeps(role: string): number
{
    let i = 0;
    for (let name in Game.creeps)
    {
        if (Game.creeps[name].memory.role === role) i++;
    }
    
    return i;
}