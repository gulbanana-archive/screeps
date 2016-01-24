import _ = require('lodash');
import * as util from './util';
import { actors } from './actors/_actor';
export { reset } from './actors/_actor'; // XXX
import build from './actors/build';
import colonist from './actors/colonist';
import harvest from './actors/harvest';
import refill from './actors/refill';
import repair from './actors/repair';
import store from './actors/store';
import travel from './actors/travel';
import upgrade from './actors/upgrade';

actors['build'] = build;
actors['colonist'] = colonist;
actors['harvest'] = harvest; 
actors['refill'] = refill;
actors['repair'] = repair;
actors['store'] = store;
actors['travel'] = travel;
actors['upgrade'] = upgrade;

export function act(creep: Creep)
{
    try
    {
        actors[creep.memory.act](creep);
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

export function originalRole(c: {memory: State}): string
{
    return c.memory.was.length ? c.memory.was[0] : c.memory.act
}