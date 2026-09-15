#include "Misc/AutomationTest.h"
#include "Creatures/CreatureFusionLibrary.h"
#include "Creatures/CreatureTypes.h"

#if WITH_DEV_AUTOMATION_TESTS

namespace
{
	/** A deliberately lopsided pair, so a blend that ignores its weights shows up immediately. */
	FCreatureStats MakeHeavyBruiser()
	{
		FCreatureStats S;
		S.MaxHealth = 400.f;
		S.MoveSpeed = 150.f;
		S.MeleeDamage = 80.f;
		S.AttacksPerSecond = 0.5f;
		S.Armor = 20.f;
		S.VisionRadius = 900.f;
		S.SizeScale = 2.f;
		return S;
	}

	FCreatureStats MakeFastSkirmisher()
	{
		FCreatureStats S;
		S.MaxHealth = 100.f;
		S.MoveSpeed = 700.f;
		S.MeleeDamage = 10.f;
		S.AttacksPerSecond = 2.f;
		S.Armor = 0.f;
		S.VisionRadius = 1500.f;
		S.SizeScale = 0.8f;
		return S;
	}
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(
	FCreatureFusionWeightsTest,
	"TheChamber.Creatures.Fusion.WeightsAreRespected",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FCreatureFusionWeightsTest::RunTest(const FString& Parameters)
{
	const FCreatureStats Front = MakeHeavyBruiser();
	const FCreatureStats Back = MakeFastSkirmisher();

	// Weight 1.0 means "take the front parent's value outright".
	FCreatureFusionWeights AllFront;
	AllFront.HealthFrontWeight = 1.f;
	AllFront.MoveSpeedFrontWeight = 1.f;
	const FCreatureStats FrontOnly = UCreatureFusionLibrary::BlendStats(Front, Back, AllFront);
	TestEqual(TEXT("Weight 1.0 takes the front parent's health"), FrontOnly.MaxHealth, 400.f);
	TestEqual(TEXT("Weight 1.0 takes the front parent's speed"), FrontOnly.MoveSpeed, 150.f);

	FCreatureFusionWeights AllBack;
	AllBack.HealthFrontWeight = 0.f;
	AllBack.MoveSpeedFrontWeight = 0.f;
	const FCreatureStats BackOnly = UCreatureFusionLibrary::BlendStats(Front, Back, AllBack);
	TestEqual(TEXT("Weight 0.0 takes the back parent's health"), BackOnly.MaxHealth, 100.f);
	TestEqual(TEXT("Weight 0.0 takes the back parent's speed"), BackOnly.MoveSpeed, 700.f);

	FCreatureFusionWeights Even;
	Even.HealthFrontWeight = 0.5f;
	const FCreatureStats Midpoint = UCreatureFusionLibrary::BlendStats(Front, Back, Even);
	TestEqual(TEXT("Weight 0.5 lands halfway"), Midpoint.MaxHealth, 250.f);

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(
	FCreatureFusionDeterminismTest,
	"TheChamber.Creatures.Fusion.IsDeterministic",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FCreatureFusionDeterminismTest::RunTest(const FString& Parameters)
{
	// Determinism is what lets a creature be stored and replicated as two asset ids
	// instead of a serialised stat block. If this ever fails, saves and multiplayer
	// both break, so it is worth asserting directly.
	const FCreatureStats Front = MakeHeavyBruiser();
	const FCreatureStats Back = MakeFastSkirmisher();
	const FCreatureFusionWeights Weights;

	const FCreatureStats First = UCreatureFusionLibrary::BlendStats(Front, Back, Weights);
	const FCreatureStats Second = UCreatureFusionLibrary::BlendStats(Front, Back, Weights);

	TestEqual(TEXT("Health is stable across calls"), First.MaxHealth, Second.MaxHealth);
	TestEqual(TEXT("Speed is stable across calls"), First.MoveSpeed, Second.MoveSpeed);
	TestEqual(TEXT("Damage is stable across calls"), First.MeleeDamage, Second.MeleeDamage);
	TestEqual(TEXT("Vision is stable across calls"), First.VisionRadius, Second.VisionRadius);

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(
	FCreatureFusionAsymmetryTest,
	"TheChamber.Creatures.Fusion.OrderMatters",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FCreatureFusionAsymmetryTest::RunTest(const FString& Parameters)
{
	// The whole design rests on bruiser-front/skirmisher-back playing differently from
	// the reverse. If these ever come out equal, the default weights have been flattened
	// and the game has lost its central choice.
	const FCreatureStats Bruiser = MakeHeavyBruiser();
	const FCreatureStats Skirmisher = MakeFastSkirmisher();
	const FCreatureFusionWeights Weights;

	const FCreatureStats BruiserFront = UCreatureFusionLibrary::BlendStats(Bruiser, Skirmisher, Weights);
	const FCreatureStats SkirmisherFront = UCreatureFusionLibrary::BlendStats(Skirmisher, Bruiser, Weights);

	TestTrue(TEXT("Bruiser in front hits harder"),
		BruiserFront.MeleeDamage > SkirmisherFront.MeleeDamage);
	TestTrue(TEXT("Skirmisher in back runs faster"),
		BruiserFront.MoveSpeed > SkirmisherFront.MoveSpeed);

	return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(
	FCreatureFusionClampTest,
	"TheChamber.Creatures.Fusion.ClampsDegenerateValues",
	EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FCreatureFusionClampTest::RunTest(const FString& Parameters)
{
	// A designer can zero any of these out in a data asset. Attack rate is a divisor
	// for the attack cooldown, and a zero size scale would collapse the collision
	// capsule, so both have to survive bad input.
	FCreatureStats Zeroed;
	Zeroed.MaxHealth = 0.f;
	Zeroed.AttacksPerSecond = 0.f;
	Zeroed.SizeScale = 0.f;

	const FCreatureStats Result = UCreatureFusionLibrary::BlendStats(Zeroed, Zeroed, FCreatureFusionWeights());

	TestTrue(TEXT("Health never reaches zero"), Result.MaxHealth >= 1.f);
	TestTrue(TEXT("Attack rate never reaches zero"), Result.AttacksPerSecond > 0.f);
	TestTrue(TEXT("Size scale never reaches zero"), Result.SizeScale > 0.f);

	return true;
}

#endif // WITH_DEV_AUTOMATION_TESTS
