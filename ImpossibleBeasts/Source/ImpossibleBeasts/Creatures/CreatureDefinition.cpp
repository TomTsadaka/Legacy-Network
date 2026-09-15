#include "CreatureDefinition.h"
#include "AnimalDataAsset.h"

bool UCreatureDefinition::IsValidCombo() const
{
	return FrontAnimal != nullptr
		&& BackAnimal != nullptr
		&& FrontAnimal->IsUsableForHalf(ECreatureHalf::Front)
		&& BackAnimal->IsUsableForHalf(ECreatureHalf::Back);
}

FName UCreatureDefinition::GetComboKey() const
{
	if (FrontAnimal == nullptr || BackAnimal == nullptr)
	{
		return NAME_None;
	}

	// Order matters: lion-front/zebra-back is a different creature from zebra-front/lion-back.
	return FName(*FString::Printf(TEXT("%s__%s"),
		*FrontAnimal->AnimalId.ToString(),
		*BackAnimal->AnimalId.ToString()));
}
