import * as actor from './_actor';

// behaviour for ALL creeps, overriding their own behaviour
export default function(creep: Creep)
{
    if (creep.memory['travel']) actor.become(creep, 'travel');
}