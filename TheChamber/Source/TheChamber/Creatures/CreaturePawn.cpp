#include "CreaturePawn.h"

#include "AnimalDataAsset.h"
#include "CreatureAnimInstance.h"
#include "CreatureDefinition.h"
#include "CreatureFusionLibrary.h"
#include "CreatureMeshCache.h"
#include "Components/CapsuleComponent.h"
#include "Components/SkeletalMeshComponent.h"
#include "Engine/GameInstance.h"
#include "Engine/SkeletalMesh.h"
#include "GameFramework/CharacterMovementComponent.h"

ACreaturePawn::ACreaturePawn()
{
	// Creatures are driven by orders and animation, not by per-frame actor logic.
	// Anything that needs a tick can opt in for itself.
	PrimaryActorTick.bCanEverTick = false;

	GetCapsuleComponent()->InitCapsuleSize(BaseCapsuleRadius, BaseCapsuleHalfHeight);

	if (USkeletalMeshComponent* MeshComp = GetMesh())
	{
		// Standard ACharacter offset: drop the mesh so its feet sit at the capsule base.
		MeshComp->SetRelativeLocation(FVector(0.f, 0.f, -BaseCapsuleHalfHeight));
		MeshComp->SetRelativeRotation(FRotator(0.f, -90.f, 0.f));
	}

	if (UCharacterMovementComponent* Movement = GetCharacterMovement())
	{
		Movement->bOrientRotationToMovement = true;
		Movement->RotationRate = FRotator(0.f, 540.f, 0.f);
		Movement->bUseControllerDesiredRotation = false;
	}

	bUseControllerRotationYaw = false;
}

void ACreaturePawn::BeginPlay()
{
	Super::BeginPlay();

	// A creature spawned straight into the level with a definition already set (for example
	// by a placed-in-editor test actor) still needs its stats and mesh applied.
	if (Definition != nullptr && CurrentHealth <= 0.f)
	{
		ApplyStats();
		ApplyAppearance();
		OnCreatureInitialized();
	}
}

FCreatureStats ACreaturePawn::GetStats() const
{
	return Definition != nullptr ? Definition->Stats : FCreatureStats();
}

bool ACreaturePawn::InitializeFromAnimals(UAnimalDataAsset* FrontAnimal, UAnimalDataAsset* BackAnimal)
{
	UCreatureDefinition* NewDefinition =
		UCreatureFusionLibrary::FuseAnimals(this, FrontAnimal, BackAnimal, FusionWeights);

	return InitializeFromDefinition(NewDefinition);
}

bool ACreaturePawn::InitializeFromDefinition(UCreatureDefinition* InDefinition)
{
	if (InDefinition == nullptr || !InDefinition->IsValidCombo())
	{
		UE_LOG(LogTemp, Warning, TEXT("%s: refusing to initialize from an invalid creature definition."), *GetName());
		return false;
	}

	Definition = InDefinition;

	ApplyStats();

	const bool bAppearanceApplied = ApplyAppearance();

	OnCreatureInitialized();

	return bAppearanceApplied;
}

void ACreaturePawn::ApplyStats()
{
	const FCreatureStats& Stats = Definition->Stats;

	CurrentHealth = Stats.MaxHealth;

	if (UCharacterMovementComponent* Movement = GetCharacterMovement())
	{
		Movement->MaxWalkSpeed = Stats.MoveSpeed;
	}

	// Collision has to track visual size, otherwise a mammoth-sized hybrid walks through
	// gaps a mouse-sized one fits, and formations pack wrong.
	GetCapsuleComponent()->SetCapsuleSize(
		BaseCapsuleRadius * Stats.SizeScale,
		BaseCapsuleHalfHeight * Stats.SizeScale);

	if (USkeletalMeshComponent* MeshComp = GetMesh())
	{
		MeshComp->SetRelativeLocation(FVector(0.f, 0.f, -BaseCapsuleHalfHeight * Stats.SizeScale));
		MeshComp->SetRelativeScale3D(FVector(Stats.SizeScale));
	}
}

bool ACreaturePawn::ApplyAppearance()
{
	USkeletalMeshComponent* MeshComp = GetMesh();
	if (MeshComp == nullptr || SharedSkeleton == nullptr)
	{
		UE_LOG(LogTemp, Error, TEXT("%s: SharedSkeleton is not set; cannot build a fused mesh."), *GetName());
		return false;
	}

	USkeletalMesh* FusedMesh = nullptr;

	// Route through the cache so repeat spawns of the same design skip the merge entirely.
	if (const UGameInstance* GameInstance = GetGameInstance())
	{
		if (UCreatureMeshCache* Cache = GameInstance->GetSubsystem<UCreatureMeshCache>())
		{
			FusedMesh = Cache->GetOrBuildFusedMesh(SharedSkeleton, Definition->FrontAnimal, Definition->BackAnimal);
		}
	}

	if (FusedMesh == nullptr)
	{
		return false;
	}

	MeshComp->SetSkeletalMeshAsset(FusedMesh);

	// Bone scales must reach the anim instance: the anim graph re-applies them after every
	// pose evaluation, because animation would otherwise overwrite them each frame.
	if (UCreatureAnimInstance* AnimInstance = Cast<UCreatureAnimInstance>(MeshComp->GetAnimInstance()))
	{
		AnimInstance->BoneScales = Definition->BoneScales;
	}

	return true;
}
