using UnrealBuildTool;

public class ImpossibleBeasts : ModuleRules
{
	public ImpossibleBeasts(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[]
		{
			"Core",
			"CoreUObject",
			"Engine",
			"InputCore",
			"GameplayTags",

			// Runtime skeletal mesh merging (USkeletalMergingLibrary::MergeMeshes).
			// This is the module the whole fusion system rests on.
			"SkeletalMerging"
		});

		PrivateDependencyModuleNames.AddRange(new string[]
		{
			"Slate",
			"SlateCore"
		});
	}
}
