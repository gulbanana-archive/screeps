import * as _ from 'lodash';
import build from './build';
import colonist from './colonist';
import fight from './fight';
import harvest from './harvest';
import refill from './refill';
import repair from './repair';
import store from './store';
import travel from './travel';
import upgrade from './upgrade';

let registry: {[key: string]: (creep: Creep) => void} = {};
registry['build'] = build;
registry['colonist'] = colonist;
registry['fight'] = fight; 
registry['harvest'] = harvest; 
registry['refill'] = refill;
registry['repair'] = repair;
registry['store'] = store;
registry['travel'] = travel;
registry['upgrade'] = upgrade;

export function act(creep: Creep)
{
    try
    {
        //behaviour overrides
        if (creep.memory['travel'] && creep.memory.act != 'travel') become(creep, 'travel'); 
        
        // main action
        registry[creep.memory.act](creep);
                
        creep.memory.age++;
    }
    catch (ex)
    {
        console.log(creep.name + ": " + ex);
    }
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

export function originalRole(c: {memory: CreepState}): string
{
    return c.memory.was.length ? c.memory.was[0] : c.memory.act
}

export function become(creep: Creep, role: string)
{
    if (_.keys(registry).indexOf(role) == -1)
    {
        console.log('no such role ' + role);
        return;
    }
    
    creep.memory.age = 0;
    creep.memory.was.push(creep.memory.act);
    creep.memory.act = role;
    
    registry[creep.memory.act](creep);
}

export function unbecome(creep: Creep)
{
    creep.memory.age = 0;
    creep.memory.act = creep.memory.was.pop();
    
    registry[creep.memory.act](creep);
}

export function reset(creep: Creep, role: string)
{
    if (creep.memory.act == role || (creep.memory.was.length && creep.memory.was[0] == role)) return;
    
    console.log(creep.memory.act + ' "' + creep.name + '" became ' + role);
    
    creep.memory.age = 0;
    creep.memory.was = [];
    creep.memory.act = role;
}