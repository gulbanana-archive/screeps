import * as actor from './actor';

let segmentCosts: {[key: string]: number} = {};
segmentCosts[MOVE] = 50;
segmentCosts[WORK] = 100;
segmentCosts[CARRY] = 50;
segmentCosts[ATTACK] = 80;
segmentCosts[RANGED_ATTACK] = 150;
segmentCosts[HEAL] = 250;
segmentCosts[TOUGH] = 10;

export default class CreepSpec
{
    body: string[];
    memory: CreepState;
    cost: number;
    
    constructor(b: string[], m: CreepState)
    {
        this.body = b;
        this.memory = m;
        this.cost = 0;
        for (let segment of this.body)
        {
            this.cost += segmentCosts[segment];
        }
    }

    toString()
    {
        return actor.originalRole(this) + '@' + this.cost; // XXX shouldn't be speccing things as unoriginal
    }
}