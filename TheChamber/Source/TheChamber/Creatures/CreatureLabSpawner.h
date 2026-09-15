#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "CreatureTypes.h"
#include "CreatureLabSpawner.generated.h"

class UAnimalDataAsset;
class ACreaturePawn;

/**
 * The stage 2 test harness: drop one of these in a level, pick two animals, press play.
 *
 * This exists so the fusion system can be exercised before any of the RTS layer is
 * built. Spawn a creature, watch it stand there, swap the halves, spawn again. If
 * fiddling with the combinations is not interesting at this stage, no amount of
 * base building will rescue it later.
 */
UCLASS()
class THECHAMBER_API ACreatureLabSpawner : public AActor
{
	GENERATED_BODY()

public:
	ACreatureLabSpawner();

	/** Supplies the head, torso and forelimbs. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creature Lab")
	TObjectPtr<UAnimalDataAsset> FrontAnimal;

	/** Supplies the hindquarters, hind limbs and tail. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creature Lab")
	TObjectPtr<UAnimalDataAsset> BackAnimal;

	/** Blueprint subclass of ACreaturePawn carrying the shared skeleton and anim class. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creature Lab")
	TSubclassOf<ACreaturePawn> CreatureClass;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creature Lab")
	bool bSpawnOnBeginPlay = true;

	/** Spawn several copies to eyeball how a design reads as a group rather than alone. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creature Lab", meta = (ClampMin = "1", ClampMax = "50"))
	int32 SpawnCount = 1;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Creature Lab", meta = (ClampMin = "50.0"))
	float SpawnSpacing = 200.f;

	/** Also available as a button on this actor's Details panel. */
	UFUNCTION(BlueprintCallable, CallInEditor, Category = "Creature Lab")
	void SpawnCreatures();

	/** Remove everything this spawner produced, so combinations can be compared quickly. */
	UFUNCTION(BlueprintCallable, CallInEditor, Category = "Creature Lab")
	void ClearSpawned();

protected:
	virtual void BeginPlay() override;

private:
	UPROPERTY(Transient)
	TArray<TObjectPtr<ACreaturePawn>> SpawnedCreatures;
};
