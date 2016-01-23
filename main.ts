import * as strategy from './strategy';
import * as actor from './actor';
import _ = require('lodash');

function executeSpawns(specs: strategy.Spec[])
{
    let spawners = [Game.spawns['Spawn1']];
    let usedSpawners: Spawn[] = [];
    
    _.forEach(specs, spec =>
    {
        let eligibleSpawners = _.filter(spawners, s => s.energyCapacity >= spec.cost);

        if (!eligibleSpawners.length) 
        {
            console.log('spawn goal cost too high');
        }
        
        let spawner = _.head(_.filter(eligibleSpawners, s => _.indexOf(usedSpawners, s)==-1 && s.spawning == null && s.energy >= spec.cost));
        if (spawner)
        {
            let result = spawner.createCreep(spec.body, undefined, spec.memory);
            if (typeof(result) == 'string')
            {
                usedSpawners.push(spawner);
                console.log('spawning ' + result);
            }
            else
            {
                console.log('spawn error');
            }
        }
    });
}

export function loop() 
{
    var plan = strategy.planSpawns();
    
    executeSpawns(plan);
    
    for (let name in Game.creeps)
    {
        let creep = Game.creeps[name];
        actor.work(creep);
    }
}