using UnrealBuildTool;
using System.Collections.Generic;

public class TheChamberTarget : TargetRules
{
	public TheChamberTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Game;

		// Pinned to UE 5.8. Both values are explicit rather than Latest, so an engine
		// upgrade cannot silently change build behaviour underneath the project.
		DefaultBuildSettings = BuildSettingsVersion.V7;
		IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_8;

		ExtraModuleNames.Add("TheChamber");
	}
}
