interface Memory
{
    creeps: { [key: string]: State; };
    plans: { [key: string]: Plan };
}