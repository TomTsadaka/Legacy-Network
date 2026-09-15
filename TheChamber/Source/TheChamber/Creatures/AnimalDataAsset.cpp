#include "AnimalDataAsset.h"
#include "Engine/SkeletalMesh.h"

#if WITH_EDITOR
#include "Misc/DataValidation.h"
#endif

USkeletalMesh* UAnimalDataAsset::GetHalfMesh(ECreatureHalf Half) const
{
	const TSoftObjectPtr<USkeletalMesh>& Soft = (Half == ECreatureHalf::Front) ? FrontHalfMesh : BackHalfMesh;

	// Synchronous load is acceptable here: the creature lab resolves a handful of meshes on
	// a user click. If this ever runs inside a unit-spawn hot path, preload through the
	// asset manager instead.
	return Soft.IsNull() ? nullptr : Soft.LoadSynchronous();
}

FGameplayTagContainer UAnimalDataAsset::GetHalfAbilities(ECreatureHalf Half) const
{
	return (Half == ECreatureHalf::Front) ? FrontHalfAbilities : BackHalfAbilities;
}

bool UAnimalDataAsset::IsUsableForHalf(ECreatureHalf Half) const
{
	return !((Half == ECreatureHalf::Front) ? FrontHalfMesh : BackHalfMesh).IsNull();
}

FPrimaryAssetId UAnimalDataAsset::GetPrimaryAssetId() const
{
	return FPrimaryAssetId(TEXT("Animal"), AnimalId.IsNone() ? GetFName() : AnimalId);
}

#if WITH_EDITOR
EDataValidationResult UAnimalDataAsset::IsDataValid(FDataValidationContext& Context) const
{
	EDataValidationResult Result = Super::IsDataValid(Context);

	if (AnimalId.IsNone())
	{
		Context.AddError(NSLOCTEXT("TheChamber", "NoAnimalId", "AnimalId is required and must be unique."));
		Result = EDataValidationResult::Invalid;
	}

	if (FrontHalfMesh.IsNull() && BackHalfMesh.IsNull())
	{
		Context.AddError(NSLOCTEXT("TheChamber", "NoHalfMesh", "An animal needs at least one half mesh to be usable in fusion."));
		Result = EDataValidationResult::Invalid;
	}

	return Result;
}
#endif
