import * as actor from './_actor';

export default function(creep: Creep)
{
    let target = creep.memory['travelTarget'];
    if (!target)
    {
        console.log('travel: no target');
        return;
    }
    
    if (creep.room.name != target)
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
    
        let exitPos = creep.pos.findClosestByPath<RoomPosition>(exit);
        creep.moveTo(exitPos);
    }
    else
    {
        actor.unbecome(creep);
    }
}