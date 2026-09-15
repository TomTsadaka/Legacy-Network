using UnrealBuildTool;
using System.Collections.Generic;

public class ImpossibleBeastsTarget : TargetRules
{
	public ImpossibleBeastsTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Game;

		// V4 / Unreal5_3 are retained in every later 5.x release, so this project
		// keeps compiling if the engine is upgraded. Bump both once you settle on a version.
		DefaultBuildSettings = BuildSettingsVersion.V4;
		IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_3;

		ExtraModuleNames.Add("ImpossibleBeasts");
	}
}
