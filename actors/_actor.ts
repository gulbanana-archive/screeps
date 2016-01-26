import * as _ from 'lodash';

export let actors: {[key: string]: (creep: Creep) => void} = {};

export function become(creep: Creep, role: string)
{
    if (_.keys(actors).indexOf(role) == -1)
    {
        console.log('no such role ' + role);
        return;
    }
    
    creep.memory.age = 0;
    creep.memory.was.push(creep.memory.act);
    creep.memory.act = role;
    
    actors[creep.memory.act](creep);
}

export function unbecome(creep: Creep)
{
    creep.memory.age = 0;
    creep.memory.act = creep.memory.was.pop();
    
    actors[creep.memory.act](creep);
}

export function reset(creep: Creep, role: string)
{
    if (creep.memory.act == role || (creep.memory.was.length && creep.memory.was[0] == role)) return;
    
    console.log(creep.memory.act + ' "' + creep.name + '" became ' + role);
    
    creep.memory.age = 0;
    creep.memory.was = [];
    creep.memory.act = role;
}