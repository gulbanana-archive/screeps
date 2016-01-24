import * as actor from './_actor';

export default function(creep: Creep)
{
    let target = creep.memory['travel'] as RoomPosition;
    if (!target)
    {
        console.log('travel: no target');
        creep.memory['travel'] = null;
        actor.unbecome(creep);
        return;
    }
    
    if (creep.pos.roomName != target.roomName)
    {    
        let exit = Game.map.findExit(creep.pos.roomName, target.roomName);
        switch (exit)
        {
            case ERR_NO_PATH:
                console.log('travel: exit not found');
                return;
            
            case ERR_INVALID_ARGS:
                console.log('travel: premises incorrect');
                return;
        }
    
        let exitPos = creep.pos.findClosestByPath<RoomPosition>(exit);
        creep.moveTo(exitPos);
    }
    else if (creep.pos.x != target.x || creep.pos.y != target.y)
    {
        creep.moveTo(target.x, target.y);
    }
    else
    {
        creep.memory['travel'] = null;
        actor.unbecome(creep);
    }
}