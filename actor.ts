import _ = require('lodash');

let actors: {[key: string]: (creep: Creep) => void} = {};

//make progress on the nearest construction site
actors['build'] = function(creep: Creep)
{    
    let site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES) as ConstructionSite;
    
    if (!site)
    {
        console.log('build: no construction site found');
    }
    else
    {
        var result = creep.build(site); 
        switch (result)
        {                
            case ERR_NOT_IN_RANGE:
                creep.moveTo(site);
                break;
                
            case ERR_NOT_ENOUGH_RESOURCES:
                become(creep, 'refill');
                break;
                
            case ERR_INVALID_TARGET:
                console.log('build: invalid target ' + site);
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
    }
};

//harvest an energy source 
actors['harvest'] = function(creep: Creep)
{
    let source = Game.getObjectById(creep.memory['source']) as Source;
    
    let result = creep.harvest(source);
    switch (result) 
    {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(source);
            break;
            
        case ERR_INVALID_TARGET:
            console.log('harvest: source invalid. discovering new source...');
            let newSource = creep.pos.findClosestByPath(FIND_SOURCES);
            if (newSource == null)
            {
                console.log("no path to a source, suiciding");
                creep.suicide();
            }
            else
            {
                creep.memory['source'] = creep.pos.findClosestByPath(FIND_SOURCES).id;
            }
            break;
            
        case ERR_BUSY:
            console.log('harvest: still being spawned');
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
    let storage = Game.getObjectById(creep.memory['storage']) as Positioned&Energised;
    
    let result = storage.transferEnergy(creep);
    switch (result) 
    {
        case ERR_NOT_IN_RANGE:
            creep.moveTo(storage);
            break;
            
        case ERR_FULL:
            unbecome(creep);
            break;
            
        case OK:
            if (creep.carry.energy == creep.carryCapacity) unbecome(creep);
            break;		
            
        default:
            console.log('refill: unexpected error ' + result);
            break;            
    }
}

// fill extensions and spawns with stored energy 
actors['store'] = function(creep: Creep)
{    
    let spawns = creep.room.find(FIND_MY_SPAWNS);
    let extensions = creep.room.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTENSION }});
    let storage = spawns.concat(extensions).filter(s => s.energy < s.energyCapacity);
    let target = _.head(storage);
    
    if (!target)
    {
        console.log('store: no targets');
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
            
        case OK:
            if (creep.carry.energy == 0) become(creep, 'refill');
            break;
            
        default:
            console.log('upgrade: unexpected error ' + result);
    }
}

export function work(creep: Creep)
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
}

export function unbecome(creep: Creep)
{
    creep.memory.age = 0;
    creep.memory.act = creep.memory.was.pop();
}