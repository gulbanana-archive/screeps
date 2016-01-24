import * as util from './util';
import _ = require('lodash');

let actors: {[key: string]: (creep: Creep) => void} = {};

//make progress on the nearest construction site
actors['build'] = function(creep: Creep)
{    
    if (!creep.memory['buildSite'])
    {
        let site = creep.pos.findClosestByPath<ConstructionSite>(FIND_CONSTRUCTION_SITES);
        if (site)
        {
            creep.memory['buildSite']  = site.id;
        }
        else
        {
            console.log('build: no construction sites found');
        }
    }
    
    let site = Game.getObjectById(creep.memory['buildSite']) as ConstructionSite;    
    
    let result = creep.build(site); 
    switch (result)
    {                
        case ERR_NOT_IN_RANGE:
            creep.moveTo(site);
            break;
            
        case ERR_NOT_ENOUGH_RESOURCES:
            become(creep, 'refill');
            break;
            
        case ERR_INVALID_TARGET:
            if (site != null) console.log('build: invalid target ' + site);
            creep.memory['buildSite'] = null;
            break;
            
        case ERR_BUSY:
            console.log('build: still being spawned');
            break;
            
        case OK:
            if (creep.carry.energy == 0) become(creep, 'refill');
            break;
            
        default:
            console.log('build: unexpected error ' + result);
    }
};

//harvest an energy source 
actors['harvest'] = function(creep: Creep)
{
    if (!creep.memory['harvestSource'])
    {
        let newSource = creep.pos.findClosestByPath<Source>(FIND_SOURCES);
        if (!newSource)
        {
            console.log("harvest: no path to a source");
            reset(creep, 'upgrade');
        }
        else
        {
            creep.memory['harvestSource'] = newSource.id;
        }
    }
    
    let source = Game.getObjectById(creep.memory['harvestSource']) as Source;
    
    let result = creep.harvest(source);
    switch (result) 
    {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(source);
            break;
            
        case ERR_INVALID_TARGET:
            console.log('harvest: source invalid. searching...');
            creep.memory['harvestSource'] = null;
            break;
            
        case ERR_BUSY:
            console.log('harvest: still being spawned');
            break;
        
        case ERR_NOT_ENOUGH_RESOURCES:
            if (creep.carry.energy > 0) reset(creep, 'upgrade');
            break;
        
        case OK:
            if (creep.carry.energy == creep.carryCapacity) become(creep, 'store');
            break;
        
        default:
            console.log('harvest: unexpected error ' + result);
    }
}

//refill stored energy and return to some other action 
actors['refill'] = function(creep: Creep)
{    
    if (!creep.memory['storage'])
    {
        let spawn = _.head(creep.room.find<Spawn>(FIND_MY_SPAWNS));

        if (spawn) 
        {
            creep.memory['storage'] = spawn.id;
        }
        else
        {
            console.log('refill: no spawn found');
        }
    }
    
    let storage = Game.getObjectById(creep.memory['storage']) as Positioned&Energised;
    if (storage && storage.energy < (creep.carryCapacity - creep.carry.energy) && creep.memory.age > 25)
    {
        if (_.sum(_.map(creep.room.find<Source>(FIND_SOURCES), s => s.energy)) == 0)
        {
            creep.memory.age--;
        }
        else
        {
            console.log('refill: waited too long, becoming harvester');
            reset(creep, 'harvest');
        }
    }

    let result = storage.transferEnergy(creep);
    switch (result) 
    {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(storage);
            break;
            
        case ERR_FULL:
            unbecome(creep);
            break;
            
        case ERR_INVALID_TARGET:
            console.log('refill: no storage found, searching...');
            creep.memory['storage'] = null;
            break;
            
        case OK:
            // can't transition here since it's too hard to predict whether we're about to get filled up
            break;		
            
        default:
            console.log('refill: unexpected error ' + result);
            break;            
    }
}

// fill extensions and spawns with stored energy 
actors['store'] = function(creep: Creep)
{    
    let spawns = creep.room.find<Structure&Energised>(FIND_MY_SPAWNS);
    let extensions = creep.room.find<Structure&Energised>(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }});
    let storage = spawns.concat(extensions).filter(s => s.energy < s.energyCapacity);
    let target = _.head(storage);
    
    if (!target)
    {
        console.log('store: no empty containers, idling');
        return;
    }
    
    let result = creep.transfer(target, RESOURCE_ENERGY);
    switch (result)
    {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            break;
            
        case ERR_NOT_ENOUGH_RESOURCES:
            unbecome(creep);
            break;
            
        case ERR_FULL:
            console.log('store: target full');
            break;
            
        case ERR_INVALID_TARGET:
            console.log('store: invalid target ' + target);
            break;
            
        case OK:
            if (target.energyCapacity - target.energy >= creep.carry.energy) unbecome(creep);
            break;
            
        default:
            console.log('store: unexpected error ' + result);
            break;
    } 
}

//upgrade the room control level
actors['upgrade'] = function(creep: Creep)
{    
    let result = creep.upgradeController(creep.room.controller); 
    switch (result)
    {
        case ERR_NOT_ENOUGH_RESOURCES:
            become(creep, 'refill');
            break;
            
        case ERR_NOT_IN_RANGE:
            creep.moveTo(creep.room.controller);
            break;
            
        case ERR_INVALID_TARGET:
            console.log('upgrade: invalid target ' + creep.room.controller)
            break;
            
        case OK:
            if (creep.carry.energy == 0) become(creep, 'refill');
            break;
            
        default:
            console.log('upgrade: unexpected error ' + result);
    }
}

// find and fix broken structures
actors['repair'] = function(creep: Creep)
{    
    if (!creep.memory['repairTarget'])
    {
        let structures = creep.room.find<Structure>(FIND_STRUCTURES, {filter: (s: Structure) => s.hits && s.hitsMax});
        let mostDamagedStructure = _.last(_.sortBy(structures, s => util.realMax(s) - s.hits));
        if (mostDamagedStructure) 
        {
            creep.memory['repairTarget'] = mostDamagedStructure.id;
        }
        else
        {
            console.log('repair: no damaged structures found');
        }
    }
    
    let target = Game.getObjectById(creep.memory['repairTarget']) as Structure;
    if (!target)
    {
        console.log('repair: no current target, searching...');
        creep.memory['repairTarget'] = null;
        return;
    }
    
    let result = creep.repair(target); 
    switch (result)
    {                
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            break;
            
        case ERR_NOT_ENOUGH_RESOURCES:
            creep.memory['repairTarget'] = null;
            become(creep, 'refill');
            break;
            
        case ERR_INVALID_TARGET:
            console.log('repair: invalid target ' + target);
            break;
            
        case ERR_BUSY:
            console.log('repair: still being spawned');
            break;
            
        case OK:
            if (target.hits == util.realMax(target) || creep.carry.energy == 0)
            {
                creep.memory['repairTarget'] = null;
                become(creep, 'refill');
            }
            break;
            
        default:
            console.log('repair: unexpected error ' + result);
    }
};

actors['colonist'] = function(creep: Creep)
{
    if (creep.carry.energy < creep.carryCapacity)
    {
        become(creep, 'refill');
        return; 
    }
    
    let target = creep.memory['travelTarget'];
    if (creep.room.name != target)
    {
        become(creep, 'travel');
        return;
    }

    if (creep.room.controller.my)
    {
        reset(creep, 'upgrade');
    }
    
    let result = creep.claimController(creep.room.controller);
    switch (result)
    {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(creep.room.controller);
            break;
        
        case ERR_GCL_NOT_ENOUGH:
            console.log('colonist: GCL insufficient for claim');
            break;
        
        case OK:
            console.log('colonist: room claimed');
            break;
            
        default:
            console.log('colonist: unexpected error ' + result);
    }
}

actors['travel'] = function(creep: Creep)
{
    let target = creep.memory['travelTarget'];
    if (!target)
    {
        console.log('travel: no target');
        return;
    }
    
    if (creep.room.name != target)
    {    
        let exitPos = creep.memory['travelPoint'] as RoomPosition;
        if (!exitPos)
        {
            let exit = Game.map.findExit(creep.room.name, target);
            switch (exit)
            {
                case ERR_NO_PATH:
                    console.log('travel: exit not found');
                    return;
                
                case ERR_INVALID_ARGS:
                    console.log('travel: premises incorrect');
                    return;
            }
        
            exitPos = creep.pos.findClosestByPath<RoomPosition>(exit);
            creep.memory['travelPoint'] = exitPos;
        }
        
        creep.moveTo(exitPos);
    }
    else
    {
        unbecome(creep);
    }
}

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