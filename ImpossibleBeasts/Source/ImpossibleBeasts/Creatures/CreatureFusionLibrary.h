#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "CreatureTypes.h"
#include "CreatureFusionLibrary.generated.h"

class UAnimalDataAsset;
class UCreatureDefinition;
class USkeletalMesh;
class USkeleton;

/**
 * The fusion system. This is the game.
 *
 * Every function here is deterministic: identical inputs always produce identical output,
 * with no randomness and no frame-dependent state. That property is what makes creatures
 * safe to store as two asset ids, to replicate as two asset ids, and to compare in tests.
 */
UCLASS()
class IMPOSSIBLEBEASTS_API UCreatureFusionLibrary : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	/**
	 * Blend two animals into one creature definition.
	 * Returns nullptr if either parent is missing the mesh for the half it was asked to supply.
	 */
	UFUNCTION(BlueprintCallable, Category = "Creature|Fusion", meta = (DefaultToSelf = "Outer"))
	static UCreatureDefinition* FuseAnimals(
		UObject* Outer,
		UAnimalDataAsset* FrontAnimal,
		UAnimalDataAsset* BackAnimal,
		const FCreatureFusionWeights& Weights);

	/** Per-stat weighted blend. Exposed on its own so balance passes can be tested without spawning anything. */
	UFUNCTION(BlueprintPure, Category = "Creature|Fusion")
	static FCreatureStats BlendStats(
		const FCreatureStats& FrontStats,
		const FCreatureStats& BackStats,
		const FCreatureFusionWeights& Weights);

	/**
	 * Build one skeletal mesh out of a front half and a back half.
	 *
	 * Both meshes MUST share SharedSkeleton. Returns a transient mesh owned by Outer,
	 * or nullptr on failure -- callers are expected to cache the result per combo key,
	 * since there is no reason to rebuild the same hybrid twice.
	 */
	UFUNCTION(BlueprintCallable, Category = "Creature|Fusion")
	static USkeletalMesh* BuildFusedMesh(
		USkeleton* SharedSkeleton,
		USkeletalMesh* FrontMesh,
		USkeletalMesh* BackMesh);

	/** Front parent's bone scales win for bones it defines; the back parent fills in the rest. */
	static TMap<FName, FVector> BlendBoneScales(
		UAnimalDataAsset* FrontAnimal,
		UAnimalDataAsset* BackAnimal);

private:
	static float Blend(float FrontValue, float BackValue, float FrontWeight);
};
