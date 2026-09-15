#pragma once

#include "CoreMinimal.h"
#include "Animation/AnimInstance.h"
#include "CreatureAnimInstance.generated.h"

/**
 * Base class for the creature Anim Blueprint.
 *
 * WHY BONE SCALES LIVE HERE AND NOT ON THE COMPONENT:
 * animation overwrites the component's bone transforms every frame, so scaling a bone
 * once at spawn time does nothing. The scales have to be re-applied after the pose is
 * evaluated. In practice that means a Transform (Modify) Bone node per scaled bone,
 * running in the anim graph and reading GetBoneScale(). Derive your AnimBP from this
 * class and wire those nodes up once; every animal then reshapes the same rig for free.
 */
UCLASS()
class THECHAMBER_API UCreatureAnimInstance : public UAnimInstance
{
	GENERATED_BODY()

public:
	/** Horizontal speed, for the locomotion blend space. */
	UPROPERTY(BlueprintReadOnly, Category = "Creature|Locomotion")
	float GroundSpeed = 0.f;

	UPROPERTY(BlueprintReadOnly, Category = "Creature|Locomotion")
	bool bIsMoving = false;

	/** Populated from the creature definition at spawn time. */
	UPROPERTY(BlueprintReadWrite, Category = "Creature|Proportions")
	TMap<FName, FVector> BoneScales;

	/** Returns the authored scale for a bone, or unit scale when the bone was not customised. */
	UFUNCTION(BlueprintPure, Category = "Creature|Proportions")
	FVector GetBoneScale(FName BoneName) const;

	virtual void NativeUpdateAnimation(float DeltaSeconds) override;
};
