import * as util from './util';
import * as actor from './actor';
import CreepSpec from './CreepSpec';
import RoomPlan from './RoomPlan';

function harvester(source: Source) : CreepSpec
{    
    let capacity = util.calculateAvailableEnergy(source.room);
    
    let body = capacity >= 500 ? [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY] :
               capacity >= 350 ? [MOVE, MOVE, MOVE, WORK, CARRY, CARRY] :
                                 [MOVE, MOVE, WORK, CARRY];
                                 
    let memory: CreepState = {age: 0, act: 'harvest', was: [], harvestSource: source.id};
    
    return new CreepSpec(body, memory);
}

function worker(storage: Positioned&Energised&Identified): CreepSpec
{    
    let capacity = util.calculateAvailableEnergy(storage.room);
    
    let body = capacity >= 500 ? [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY] :
               capacity >= 400 ? [MOVE, MOVE, MOVE, WORK, WORK, CARRY] :
                                 [MOVE, MOVE, WORK, CARRY];
                                 
    let memory: CreepState = {age: 0, act: 'refill', was: ['upgrade'], storage: storage.id};
    
    return new CreepSpec(body, memory);
}

function soldier(rampart: Structure): CreepSpec
{
    let capacity = util.calculateAvailableEnergy(rampart.room);
    
    let body = capacity >= 450 ? [TOUGH, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK] :
               capacity >= 390 ? [MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK] :
               capacity >= 320 ? [TOUGH, MOVE, MOVE, MOVE, ATTACK, ATTACK] :
                                 [MOVE, MOVE, ATTACK, ATTACK];
                                 
    let memory: CreepState = {age: 0, act: 'fight', was: [], travel: rampart.pos};
    
    return new CreepSpec(body, memory);
}

function colonist(destination: string): CreepSpec
{   
    let body = [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY];
                                 
    let memory: CreepState = {age: 0, act: 'colonist', was: [], travelTarget: destination};
    
    return new CreepSpec(body, memory);
}

function planWorkers(room: Room): string[]
{   
    let result: string[] = [];
    
    let creeps = room.find<Creep>(FIND_MY_CREEPS);
    let workers = _.size(_.filter(creeps, actor.wasOriginally(['upgrade', 'build', 'repair'])));
    let constructionSites = room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES).length;
    
    if (workers > 0)
    {
        result.push('upgrade');
        workers--;
    }
    
    if (workers > 0)
    {
        result.push('repair');
        workers--;
    }
    
    if (workers > 0 && constructionSites > 0)
    {
        result.push('build');
        workers--;
    }

    let brokenStructures = room.find<Structure>(FIND_STRUCTURES, {filter: (s: Structure) => (s.hits < util.realMax(s))}).length;
    let extraRepair = Math.floor(brokenStructures/50);
    while (workers > 0)
    {
        if (extraRepair > 0)
        {
            result.push('repair');
            extraRepair--;
        }
        else if (constructionSites > 0)
        {
            result.push('build');
        }
        else
        {
            result.push('upgrade');    
        }
        
        workers--;
    }
    
    return result;
}

function planSpawns(room: Room): CreepSpec[]
{
    let spawns: CreepSpec[] = [];
    
    let creeps = room.find<Creep>(FIND_MY_CREEPS);
    let sources = room.find<Source>(FIND_SOURCES); 
    let harvesters = _.filter(creeps, actor.wasOriginally(['harvest'])).length;
    let workers = _.filter(creeps, actor.wasOriginally(['upgrade', 'build', 'repair'])).length;
    let soldiers = _.filter(creeps, actor.wasOriginally(['fight']));
        
    if (Memory.params.colonise)
    {
        let colonists =  _.filter(creeps, actor.wasOriginally(['colonist']));
        if (colonists.length)
        {
            Memory.params.colonise = null;
        }
        else
        {
            spawns.push(colonist(Memory.params.colonise));
        }
    }
        
    let needHarvesters = sources.length * 3;
    while (harvesters < needHarvesters)
    {
        spawns.push(harvester(sources[0]));
        harvesters++;
    }
    
    let ramparts = room.find<Structure>(FIND_MY_STRUCTURES, {filter:{structureType: STRUCTURE_RAMPART}});
    for (let rampart of ramparts)
    {
        let patrolled = false;
        for (let soldier of soldiers)
        {
            if (soldier.pos.getRangeTo(rampart) < 4) patrolled = true;
        }
        
        if (!patrolled)
        {
            spawns.push(soldier(rampart));
        }
    }
    
    while (workers * 2 <= harvesters)
    {
        spawns.push(worker(room.find<Spawn>(FIND_MY_SPAWNS)[0]));
        workers++;
    }
    
    while (spawns.length < room.find(FIND_MY_SPAWNS).length)
    {
        spawns.push(harvester(sources[0]));
        harvesters++;
    }
    
    return spawns;
}

export function plan(room: Room): RoomPlan
{
    let workers = planWorkers(room);
    let spawns = planSpawns(room);
    
    room.memory.priorityRepairs = room.find<Structure>(FIND_STRUCTURES, {filter: (s: Structure) => s.hits == 1}).map(s => s.id);
    
    return new RoomPlan(spawns, workers);
}