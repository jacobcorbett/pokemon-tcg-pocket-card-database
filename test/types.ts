import { en, database, Card, Print, GameplayCard, SetMetadata } from '..';
const legacy: Card = en.geneticApex[0];
const print: Print | undefined = database.findById(legacy.id);
const gameplay: GameplayCard = database.gameplay[0];
const set: SetMetadata = database.sets[0];
print?.alternatePrintIds.map((id) => database.findById(id));
gameplay.printIds.map((id) => database.findById(id));
set.verification.unresolvedDifferences.map((difference) => difference.field);
// @ts-expect-error energy strings must be known values
const invalid: Card['element'] = 'Electric';
void invalid;
