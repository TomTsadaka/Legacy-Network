#include "CreatureAnimInstance.h"
#include "GameFramework/Pawn.h"

FVector UCreatureAnimInstance::GetBoneScale(FName BoneName) const
{
	if (const FVector* Found = BoneScales.Find(BoneName))
	{
		return *Found;
	}

	return FVector::OneVector;
}

void UCreatureAnimInstance::NativeUpdateAnimation(float DeltaSeconds)
{
	Super::NativeUpdateAnimation(DeltaSeconds);

	if (const APawn* OwningPawn = TryGetPawnOwner())
	{
		const FVector Velocity = OwningPawn->GetVelocity();
		GroundSpeed = FVector(Velocity.X, Velocity.Y, 0.f).Size();
		bIsMoving = GroundSpeed > 3.f;
	}
}
