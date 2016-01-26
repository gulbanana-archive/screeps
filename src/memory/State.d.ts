interface State
{
    creeps: { [key: string]: CreepState; };
    flags: { [key: string]: FlagState; };
    rooms: { [key: string]: RoomState; };
    spawns: { [key: string]: SpawnState; };
    params: Params;
}