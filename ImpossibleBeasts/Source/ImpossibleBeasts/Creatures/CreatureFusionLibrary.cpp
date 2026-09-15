#include "CreatureFusionLibrary.h"

#include "AnimalDataAsset.h"
#include "CreatureDefinition.h"
#include "Animation/Skeleton.h"
#include "Engine/SkeletalMesh.h"
#include "SkeletalMergingLibrary.h"

float UCreatureFusionLibrary::Blend(float FrontValue, float BackValue, float FrontWeight)
{
	const float W = FMath::Clamp(FrontWeight, 0.f, 1.f);
	return FrontValue * W + BackValue * (1.f - W);
}

FCreatureStats UCreatureFusionLibrary::BlendStats(
	const FCreatureStats& FrontStats,
	const FCreatureStats& BackStats,
	const FCreatureFusionWeights& Weights)
{
	FCreatureStats Out;

	Out.MaxHealth        = Blend(FrontStats.MaxHealth,        BackStats.MaxHealth,        Weights.HealthFrontWeight);
	Out.MoveSpeed        = Blend(FrontStats.MoveSpeed,        BackStats.MoveSpeed,        Weights.MoveSpeedFrontWeight);
	Out.MeleeDamage      = Blend(FrontStats.MeleeDamage,      BackStats.MeleeDamage,      Weights.MeleeDamageFrontWeight);
	Out.AttacksPerSecond = Blend(FrontStats.AttacksPerSecond, BackStats.AttacksPerSecond, Weights.AttackRateFrontWeight);
	Out.Armor            = Blend(FrontStats.Armor,            BackStats.Armor,            Weights.ArmorFrontWeight);
	Out.VisionRadius     = Blend(FrontStats.VisionRadius,     BackStats.VisionRadius,     Weights.VisionFrontWeight);
	Out.SizeScale        = Blend(FrontStats.SizeScale,        BackStats.SizeScale,        Weights.SizeFrontWeight);
	Out.PopulationCost   = Blend(FrontStats.PopulationCost,   BackStats.PopulationCost,   Weights.PopulationCostFrontWeight);

	// Guard the divisors and anything a designer could zero out by accident.
	Out.MaxHealth        = FMath::Max(Out.MaxHealth, 1.f);
	Out.AttacksPerSecond = FMath::Max(Out.AttacksPerSecond, 0.01f);
	Out.SizeScale        = FMath::Max(Out.SizeScale, 0.05f);

	return Out;
}

TMap<FName, FVector> UCreatureFusionLibrary::BlendBoneScales(
	UAnimalDataAsset* FrontAnimal,
	UAnimalDataAsset* BackAnimal)
{
	TMap<FName, FVector> Out;

	if (BackAnimal != nullptr)
	{
		Out = BackAnimal->BoneScales;
	}

	// Front parent overrides shared bones. Spine bones appear in both maps, and the head
	// end of the creature is what the player reads first, so the front parent wins there.
	if (FrontAnimal != nullptr)
	{
		for (const TPair<FName, FVector>& Pair : FrontAnimal->BoneScales)
		{
			Out.Add(Pair.Key, Pair.Value);
		}
	}

	return Out;
}

USkeletalMesh* UCreatureFusionLibrary::BuildFusedMesh(
	USkeleton* SharedSkeleton,
	USkeletalMesh* FrontMesh,
	USkeletalMesh* BackMesh)
{
	if (SharedSkeleton == nullptr || FrontMesh == nullptr || BackMesh == nullptr)
	{
		UE_LOG(LogTemp, Warning, TEXT("BuildFusedMesh: missing skeleton or half mesh."));
		return nullptr;
	}

	// The single hard requirement of the whole art pipeline. If this fires, the offending
	// animal was rigged to its own skeleton instead of the project's master skeleton, and
	// no amount of code will fuse it.
	if (FrontMesh->GetSkeleton() != SharedSkeleton || BackMesh->GetSkeleton() != SharedSkeleton)
	{
		UE_LOG(LogTemp, Error,
			TEXT("BuildFusedMesh: '%s' and '%s' must both be skinned to the shared master skeleton '%s'."),
			*FrontMesh->GetName(), *BackMesh->GetName(), *SharedSkeleton->GetName());
		return nullptr;
	}

	FSkeletalMeshMergeParams Params;
	Params.MeshesToMerge.Add(FrontMesh);
	Params.MeshesToMerge.Add(BackMesh);
	Params.Skeleton = SharedSkeleton;
	Params.bSkeletonBefore = false;
	Params.bNeedsCpuAccess = false;
	Params.StripTopLODS = 0;

	USkeletalMesh* Merged = USkeletalMergingLibrary::MergeMeshes(Params);

	if (Merged == nullptr)
	{
		UE_LOG(LogTemp, Error, TEXT("BuildFusedMesh: MergeMeshes failed for '%s' + '%s'."),
			*FrontMesh->GetName(), *BackMesh->GetName());
	}

	return Merged;
}

UCreatureDefinition* UCreatureFusionLibrary::FuseAnimals(
	UObject* Outer,
	UAnimalDataAsset* FrontAnimal,
	UAnimalDataAsset* BackAnimal,
	const FCreatureFusionWeights& Weights)
{
	if (FrontAnimal == nullptr || BackAnimal == nullptr)
	{
		return nullptr;
	}

	if (!FrontAnimal->IsUsableForHalf(ECreatureHalf::Front) || !BackAnimal->IsUsableForHalf(ECreatureHalf::Back))
	{
		UE_LOG(LogTemp, Warning, TEXT("FuseAnimals: '%s' + '%s' is not a usable combination."),
			*FrontAnimal->AnimalId.ToString(), *BackAnimal->AnimalId.ToString());
		return nullptr;
	}

	UCreatureDefinition* Def = NewObject<UCreatureDefinition>(Outer != nullptr ? Outer : GetTransientPackage());

	Def->FrontAnimal = FrontAnimal;
	Def->BackAnimal  = BackAnimal;
	Def->Stats       = BlendStats(FrontAnimal->BaseStats, BackAnimal->BaseStats, Weights);
	Def->BoneScales  = BlendBoneScales(FrontAnimal, BackAnimal);

	// A creature gets the front parent's front-half abilities and the back parent's
	// back-half abilities -- never the halves that were left on the cutting-room floor.
	Def->Abilities.AppendTags(FrontAnimal->GetHalfAbilities(ECreatureHalf::Front));
	Def->Abilities.AppendTags(BackAnimal->GetHalfAbilities(ECreatureHalf::Back));

	Def->DisplayName = FText::Format(
		NSLOCTEXT("ImpossibleBeasts", "HybridName", "{0}-{1}"),
		FrontAnimal->DisplayName,
		BackAnimal->DisplayName);

	return Def;
}
