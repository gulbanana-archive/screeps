/**
 * An energy source object. Can be harvested by creeps with a WORK body part.
 */
interface Source extends Positioned
{
    id: string;

    energy: number;
    energyCapacity: number;
    ticksToRegeneration: number;
}