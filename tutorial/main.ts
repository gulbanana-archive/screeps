import harvester from './harvester';

export function loop() 
{
    for (let creepName in Game.creeps)
    {
        harvester(Game.creeps[creepName]);
    }
}