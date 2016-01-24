import * as strategy from './strategy';
import * as actor from './actor';
import _ = require('lodash');

let home = Game.spawns['Spawn1'];

function executeSpawns(specs: strategy.Spec[])
{
    let spawners = [home];
    let usedSpawners: Spawn[] = [];
    
    _.forEach(specs, spec =>
    {
        let availableEnergy = strategy.calculateAvailableEnergy(home.room);
        if (spec.cost > availableEnergy) 
        {
            console.log('spawn goal cost too high');
        }
        
        let spawner = _.head(_.filter(spawners, s => _.indexOf(usedSpawners, s)==-1 && s.canCreateCreep(spec.body) == OK));
        if (spawner)
        {
            let result = spawner.createCreep(spec.body, undefined, spec.memory);
            
            if (_.isString(result))
            {
                usedSpawners.push(spawner);
                console.log("spawn: creating '" + spec.memory.act + "' " + result);
            }
            else
            {
                switch (result)
                {
                    case ERR_NOT_ENOUGH_ENERGY:
                        console.log('spawn: not enough energy');
                        break;
                    
                    case ERR_BUSY:
                        console.log('spawn: already busy');
                        break;
                    
                    default:
                        console.log('spawn: unexpected error ' + result);
                }              
            }
        }
    });
}

export function loop() 
{
    executeSpawns(strategy.plan(home));
    
    for (let name in Game.creeps)
    {
        let creep = Game.creeps[name];
        if (!creep.spawning) actor.work(creep);
    }
}