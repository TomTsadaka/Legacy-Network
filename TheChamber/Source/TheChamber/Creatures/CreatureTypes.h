#pragma once

#include "CoreMinimal.h"
#include "CreatureTypes.generated.h"

/** Which half of an animal a mesh / stat block / ability set belongs to. */
UENUM(BlueprintType)
enum class ECreatureHalf : uint8
{
	Front UMETA(DisplayName = "Front Half"),
	Back  UMETA(DisplayName = "Back Half")
};

/**
 * The complete combat/movement profile of a creature.
 *
 * Every animal declares one of these as its "if this animal were the whole creature"
 * baseline. Fusion blends two of them into the profile the spawned creature actually uses.
 */
USTRUCT(BlueprintType)
struct THECHAMBER_API FCreatureStats
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats", meta = (ClampMin = "1.0"))
	float MaxHealth = 100.f;

	/** Centimetres per second. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats", meta = (ClampMin = "0.0"))
	float MoveSpeed = 300.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats", meta = (ClampMin = "0.0"))
	float MeleeDamage = 10.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats", meta = (ClampMin = "0.01"))
	float AttacksPerSecond = 1.f;

	/** Flat damage reduction applied before health is subtracted. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats", meta = (ClampMin = "0.0"))
	float Armor = 0.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats", meta = (ClampMin = "0.0"))
	float VisionRadius = 1200.f;

	/** Uniform actor scale. Drives how physically large the fused creature reads on screen. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats", meta = (ClampMin = "0.05"))
	float SizeScale = 1.f;

	/** Population/supply cost this creature occupies. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats", meta = (ClampMin = "0.0"))
	float PopulationCost = 1.f;

	float GetDamagePerSecond() const { return MeleeDamage * AttacksPerSecond; }
};

/**
 * How much each parent contributes to each stat, per stat.
 *
 * Each value is the FRONT animal's weight, in [0..1]; the back animal gets the remainder.
 * The defaults encode the design rule the original game used: the front half is the
 * business end (head, jaws, eyes, forelimbs) so it owns offence and vision, while the
 * back half is the engine (hindquarters, tail) so it owns locomotion.
 *
 * Tuning these numbers is tuning the whole game's feel. Treat this struct as a design knob,
 * not as plumbing.
 */
USTRUCT(BlueprintType)
struct THECHAMBER_API FCreatureFusionWeights
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Fusion", meta = (ClampMin = "0.0", ClampMax = "1.0"))
	float HealthFrontWeight = 0.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Fusion", meta = (ClampMin = "0.0", ClampMax = "1.0"))
	float MoveSpeedFrontWeight = 0.25f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Fusion", meta = (ClampMin = "0.0", ClampMax = "1.0"))
	float MeleeDamageFrontWeight = 0.8f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Fusion", meta = (ClampMin = "0.0", ClampMax = "1.0"))
	float AttackRateFrontWeight = 0.8f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Fusion", meta = (ClampMin = "0.0", ClampMax = "1.0"))
	float ArmorFrontWeight = 0.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Fusion", meta = (ClampMin = "0.0", ClampMax = "1.0"))
	float VisionFrontWeight = 0.9f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Fusion", meta = (ClampMin = "0.0", ClampMax = "1.0"))
	float SizeFrontWeight = 0.5f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Fusion", meta = (ClampMin = "0.0", ClampMax = "1.0"))
	float PopulationCostFrontWeight = 0.5f;
};
