#pragma once

#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "GameplayTagContainer.h"
#include "CreatureTypes.h"
#include "CreatureDefinition.generated.h"

class UAnimalDataAsset;

/**
 * The result of fusing two animals: everything the game needs to spawn one hybrid.
 *
 * Built at runtime by UCreatureFusionLibrary::FuseAnimals, never authored by hand.
 * Fusion is a pure function of its two parents, so this object is fully reproducible
 * from (FrontAnimal, BackAnimal, Weights) -- which is what lets a save game store a
 * creature as two asset ids instead of a serialised blob.
 */
UCLASS(BlueprintType)
class IMPOSSIBLEBEASTS_API UCreatureDefinition : public UObject
{
	GENERATED_BODY()

public:
	UPROPERTY(BlueprintReadOnly, Category = "Creature")
	TObjectPtr<UAnimalDataAsset> FrontAnimal;

	UPROPERTY(BlueprintReadOnly, Category = "Creature")
	TObjectPtr<UAnimalDataAsset> BackAnimal;

	UPROPERTY(BlueprintReadOnly, Category = "Creature")
	FCreatureStats Stats;

	/** Union of the front animal's front abilities and the back animal's back abilities. */
	UPROPERTY(BlueprintReadOnly, Category = "Creature")
	FGameplayTagContainer Abilities;

	/** Blended silhouette: front bones from the front parent, back bones from the back parent. */
	UPROPERTY(BlueprintReadOnly, Category = "Creature")
	TMap<FName, FVector> BoneScales;

	/** Generated name, e.g. "Elephant-Cheetah". */
	UPROPERTY(BlueprintReadOnly, Category = "Creature")
	FText DisplayName;

	UFUNCTION(BlueprintPure, Category = "Creature")
	bool IsValidCombo() const;

	/** Stable key for this pairing, usable as a cache key for the merged mesh. */
	UFUNCTION(BlueprintPure, Category = "Creature")
	FName GetComboKey() const;
};
