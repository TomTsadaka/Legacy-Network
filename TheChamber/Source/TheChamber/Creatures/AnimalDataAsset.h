#pragma once

#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "GameplayTagContainer.h"
#include "CreatureTypes.h"
#if WITH_EDITOR
#include "Misc/DataValidation.h"
#endif

#include "AnimalDataAsset.generated.h"

class USkeletalMesh;

/**
 * One source animal.
 *
 * THE CONTRACT THAT MAKES THE WHOLE PROJECT WORK:
 * FrontHalfMesh and BackHalfMesh must both be skinned to the project's single shared
 * master skeleton -- identical bone names, identical hierarchy. Proportions are expressed
 * through BoneScales, never through a different rig. Break this rule for one animal and
 * that animal can no longer fuse with anything.
 *
 * Adding animal number 40 should be an art task, not an engineering task. This asset is
 * what keeps it that way.
 */
UCLASS(BlueprintType)
class THECHAMBER_API UAnimalDataAsset : public UPrimaryDataAsset
{
	GENERATED_BODY()

public:
	/** Stable id used in save games and combo keys. Must be unique and must never change once shipped. */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Identity")
	FName AnimalId;

	/** Player-facing name, e.g. "Elephant". */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Identity")
	FText DisplayName;

	/** Head, torso and forelimbs. Skinned to the shared master skeleton. */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Meshes")
	TSoftObjectPtr<USkeletalMesh> FrontHalfMesh;

	/** Hindquarters, hind limbs and tail. Skinned to the shared master skeleton. */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Meshes")
	TSoftObjectPtr<USkeletalMesh> BackHalfMesh;

	/** What this animal would be if it were the entire creature. Fusion blends two of these. */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Stats")
	FCreatureStats BaseStats;

	/** Abilities this animal contributes when it supplies the FRONT half (bite, spit, gore...). */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Abilities")
	FGameplayTagContainer FrontHalfAbilities;

	/** Abilities this animal contributes when it supplies the BACK half (swim, climb, burrow, pounce...). */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Abilities")
	FGameplayTagContainer BackHalfAbilities;

	/**
	 * Per-bone scale that turns the shared skeleton into THIS animal's silhouette.
	 * Only list bones that actually differ from the reference pose.
	 */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Proportions")
	TMap<FName, FVector> BoneScales;

	UFUNCTION(BlueprintPure, Category = "Animal")
	USkeletalMesh* GetHalfMesh(ECreatureHalf Half) const;

	UFUNCTION(BlueprintPure, Category = "Animal")
	FGameplayTagContainer GetHalfAbilities(ECreatureHalf Half) const;

	/** True if this animal can take part in fusion at all. */
	UFUNCTION(BlueprintPure, Category = "Animal")
	bool IsUsableForHalf(ECreatureHalf Half) const;

	virtual FPrimaryAssetId GetPrimaryAssetId() const override;

#if WITH_EDITOR
	virtual EDataValidationResult IsDataValid(class FDataValidationContext& Context) const override;
#endif
};
