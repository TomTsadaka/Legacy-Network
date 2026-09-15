#include "CreatureMeshCache.h"

#include "AnimalDataAsset.h"
#include "CreatureFusionLibrary.h"
#include "CreatureTypes.h"
#include "Animation/Skeleton.h"
#include "Engine/SkeletalMesh.h"

USkeletalMesh* UCreatureMeshCache::GetOrBuildFusedMesh(
	USkeleton* SharedSkeleton,
	UAnimalDataAsset* FrontAnimal,
	UAnimalDataAsset* BackAnimal)
{
	if (SharedSkeleton == nullptr || FrontAnimal == nullptr || BackAnimal == nullptr)
	{
		return nullptr;
	}

	const FName ComboKey(*FString::Printf(TEXT("%s__%s"),
		*FrontAnimal->AnimalId.ToString(),
		*BackAnimal->AnimalId.ToString()));

	if (TObjectPtr<USkeletalMesh>* Existing = CachedMeshes.Find(ComboKey))
	{
		if (*Existing != nullptr)
		{
			return *Existing;
		}
	}

	USkeletalMesh* FrontMesh = FrontAnimal->GetHalfMesh(ECreatureHalf::Front);
	USkeletalMesh* BackMesh  = BackAnimal->GetHalfMesh(ECreatureHalf::Back);

	USkeletalMesh* Merged = UCreatureFusionLibrary::BuildFusedMesh(SharedSkeleton, FrontMesh, BackMesh);

	if (Merged != nullptr)
	{
		CachedMeshes.Add(ComboKey, Merged);
	}

	return Merged;
}

void UCreatureMeshCache::ClearCache()
{
	CachedMeshes.Empty();
}
