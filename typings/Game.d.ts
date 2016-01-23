interface Table<T>
{
    [key: string]: T;
}

interface Game
{
    creeps: Table<Creep>;
}