// not part of the real model- a construct imposed for the benefit of actors
interface State
{
    age: number;
    act: string;
    was: string[];
    [key: string]: any;
}
