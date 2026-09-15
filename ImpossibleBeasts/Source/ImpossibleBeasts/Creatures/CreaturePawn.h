#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "CreatureTypes.h"
#include "CreaturePawn.generated.h"

class UAnimalDataAsset;
class UCreatureDefinition;
class USkeleton;

/**
 * A spawned hybrid creature.
 *
 * Derives from ACharacter so navmesh movement, stepping and crowd avoidance come for free
 * during the prototype. That is the right trade now and the wrong one at scale: past a few
 * hundred units CharacterMovementComponent dominates the frame, and this class should move
 * to a lighter custom movement component. Do not pay that cost before you measure it.
 */
UCLASS()
class IMPOSSIBLEBEASTS_API ACreaturePawn : public ACharacter
{
	GENERATED_BODY()

public:
	ACreaturePawn();

	/** The project's single master skeleton. Every animal mesh must be skinned to it. */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Creature")
	TObjectPtr<USkeleton> SharedSkeleton;

	/** Balance knobs for the fusion blend. Shared by every creature unless overridden. */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Creature")
	FCreatureFusionWeights FusionWeights;

	/** Radius of the collision capsule at SizeScale 1.0. Scaled with the creature. */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Creature", meta = (ClampMin = "1.0"))
	float BaseCapsuleRadius = 34.f;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Creature", meta = (ClampMin = "1.0"))
	float BaseCapsuleHalfHeight = 88.f;

	UPROPERTY(BlueprintReadOnly, Category = "Creature")
	TObjectPtr<UCreatureDefinition> Definition;

	UPROPERTY(BlueprintReadOnly, Category = "Creature")
	float CurrentHealth = 0.f;

	/** Fuse the two parents and apply the result to this actor. The entry point the creature lab calls. */
	UFUNCTION(BlueprintCallable, Category = "Creature")
	bool InitializeFromAnimals(UAnimalDataAsset* FrontAnimal, UAnimalDataAsset* BackAnimal);

	/** Apply an already-fused definition. Use this when spawning many copies of one design. */
	UFUNCTION(BlueprintCallable, Category = "Creature")
	bool InitializeFromDefinition(UCreatureDefinition* InDefinition);

	UFUNCTION(BlueprintPure, Category = "Creature")
	FCreatureStats GetStats() const;

	/** Fires after stats and mesh are applied, so Blueprints can react without ticking. */
	UFUNCTION(BlueprintImplementableEvent, Category = "Creature")
	void OnCreatureInitialized();

protected:
	virtual void BeginPlay() override;

private:
	/** Push the definition's stats onto movement, collision and health. */
	void ApplyStats();

	/** Merge the two half meshes and hand the bone scales to the anim instance. */
	bool ApplyAppearance();
};
