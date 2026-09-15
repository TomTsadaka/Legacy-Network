#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "CreatureMeshCache.generated.h"

class UAnimalDataAsset;
class USkeletalMesh;
class USkeleton;

/**
 * Caches merged skeletal meshes by combo key.
 *
 * Merging is far too expensive to run per spawned unit. An RTS army is dozens of copies
 * of a handful of designs, so the first lion-front/zebra-back pays the merge cost and
 * every later one reuses the result. The cache also keeps the transient meshes rooted --
 * without a UPROPERTY holding them, they would be garbage collected out from under
 * live creatures.
 */
UCLASS()
class THECHAMBER_API UCreatureMeshCache : public UGameInstanceSubsystem
{
	GENERATED_BODY()

public:
	/** Returns the merged mesh for this pairing, building and caching it on first request. */
	UFUNCTION(BlueprintCallable, Category = "Creature|Fusion")
	USkeletalMesh* GetOrBuildFusedMesh(
		USkeleton* SharedSkeleton,
		UAnimalDataAsset* FrontAnimal,
		UAnimalDataAsset* BackAnimal);

	/** Drops every cached mesh. Call between matches, not during one. */
	UFUNCTION(BlueprintCallable, Category = "Creature|Fusion")
	void ClearCache();

	UFUNCTION(BlueprintPure, Category = "Creature|Fusion")
	int32 GetCachedMeshCount() const { return CachedMeshes.Num(); }

private:
	UPROPERTY(Transient)
	TMap<FName, TObjectPtr<USkeletalMesh>> CachedMeshes;
};
