#include "CreatureLabSpawner.h"

#include "AnimalDataAsset.h"
#include "CreatureDefinition.h"
#include "CreatureFusionLibrary.h"
#include "CreaturePawn.h"
#include "Engine/World.h"

ACreatureLabSpawner::ACreatureLabSpawner()
{
	PrimaryActorTick.bCanEverTick = false;
}

void ACreatureLabSpawner::BeginPlay()
{
	Super::BeginPlay();

	if (bSpawnOnBeginPlay)
	{
		SpawnCreatures();
	}
}

void ACreatureLabSpawner::SpawnCreatures()
{
	UWorld* World = GetWorld();
	if (World == nullptr)
	{
		return;
	}

	if (FrontAnimal == nullptr || BackAnimal == nullptr)
	{
		UE_LOG(LogTemp, Warning, TEXT("%s: set both FrontAnimal and BackAnimal before spawning."), *GetName());
		return;
	}

	if (CreatureClass == nullptr)
	{
		UE_LOG(LogTemp, Warning, TEXT("%s: CreatureClass is empty. Assign a Blueprint subclass of ACreaturePawn ")
			TEXT("that carries the shared skeleton."), *GetName());
		return;
	}

	ClearSpawned();

	// Fuse once, spawn many. Every copy shares one definition, which also means they
	// share the cached merged mesh instead of rebuilding it per unit.
	const ACreaturePawn* Defaults = CreatureClass->GetDefaultObject<ACreaturePawn>();
	UCreatureDefinition* Definition = UCreatureFusionLibrary::FuseAnimals(
		this, FrontAnimal, BackAnimal, Defaults->FusionWeights);

	if (Definition == nullptr)
	{
		UE_LOG(LogTemp, Warning, TEXT("%s: fusion failed. Check that each animal has a mesh for the half ")
			TEXT("it was asked to supply."), *GetName());
		return;
	}

	// Lay them out in a rough square so a group of ten is readable from a top-down camera.
	const int32 PerRow = FMath::Max(1, FMath::CeilToInt(FMath::Sqrt(static_cast<float>(SpawnCount))));
	const FVector Origin = GetActorLocation();

	FActorSpawnParameters SpawnParams;
	SpawnParams.Owner = this;
	SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;

	for (int32 Index = 0; Index < SpawnCount; ++Index)
	{
		const FVector Offset(
			(Index % PerRow) * SpawnSpacing,
			(Index / PerRow) * SpawnSpacing,
			0.f);

		ACreaturePawn* Creature = World->SpawnActor<ACreaturePawn>(
			CreatureClass, Origin + Offset, GetActorRotation(), SpawnParams);

		if (Creature == nullptr)
		{
			continue;
		}

		Creature->InitializeFromDefinition(Definition);
		SpawnedCreatures.Add(Creature);
	}

	UE_LOG(LogTemp, Log, TEXT("%s: spawned %d x %s (health %.0f, speed %.0f, dps %.1f)"),
		*GetName(),
		SpawnedCreatures.Num(),
		*Definition->DisplayName.ToString(),
		Definition->Stats.MaxHealth,
		Definition->Stats.MoveSpeed,
		Definition->Stats.GetDamagePerSecond());
}

void ACreatureLabSpawner::ClearSpawned()
{
	for (ACreaturePawn* Creature : SpawnedCreatures)
	{
		if (IsValid(Creature))
		{
			Creature->Destroy();
		}
	}

	SpawnedCreatures.Reset();
}
