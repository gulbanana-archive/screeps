interface Memory
{
    creeps: { [key: string]: State; };
    plan: Plan;
}