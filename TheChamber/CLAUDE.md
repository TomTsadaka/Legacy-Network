# The Chamber — context for Claude Code

Read this before doing anything in this directory.

## What this is

A 3D RTS prototype in Unreal Engine 5.8. Two animals fuse into one hybrid
creature at runtime — front half of one, back half of another. Inspired by
Impossible Creatures (2003), but no assets, names or creature designs are taken
from it.

This directory is a **self-contained Unreal project inside an unrelated
repository**. The repo root is a Next.js social network app. Do not mix them.
Long term this project belongs in its own repo; the folder is movable as-is.

## Current state

Stages 1 and 2 of the roadmap are written: project skeleton and the creature
fusion system.

**The C++ has never been compiled.** It was written in a cloud Linux container
with no Unreal installation and checked only structurally (brace balance,
`.generated.h` include order, `GENERATED_BODY` presence, UHT-hostile `const`
removed). Expect first-compile errors and fix them; that is the top priority.

## Toolchain — get this right before debugging anything

macOS 26.5 with UE 5.8. Not a combination Epic tests against.

- **Xcode 26.1.1 specifically.** Epic documents 26.4 as incompatible with
  Unreal, and 26.5 is reported to crash UE 5.8. Verify with `xcodebuild -version`.
- **Metal Toolchain must be downloaded separately.** Since Xcode 16 Apple ships
  it outside `Xcode.app`. Unreal compiles Metal shaders during the build, so
  without it the build fails with a Metal compiler error that reads like an
  engine bug. `xcodebuild -downloadComponent MetalToolchain`
- `Tools/setup-mac-toolchain.sh` does all of this and is safe to re-run; it
  skips whatever is already done.
- The `xcodes` **CLI** cannot be installed here — Homebrew builds it from source
  and that build needs a full Xcode already present (XcodesOrg/xcodes#176).
  Use the prebuilt `xcodes-app` cask instead. The script already does.

Interactive steps that need the user: Apple ID sign-in for the Xcode download,
and the sudo password. Ask rather than trying to work around them.

## Architecture — the one rule

**Every animal shares a single canonical master skeleton.** Identical bone names,
identical hierarchy. Animals differ by mesh and per-bone scale, never by rig.

This is what makes runtime fusion possible at all, and what keeps adding animal
number 40 an art task rather than an engineering task. `UAnimalDataAsset`'s
editor validation enforces it. Never work around this rule to accommodate a
mesh — fix the mesh.

Bone scales are applied in the **anim graph**, not once at spawn: animation
overwrites bone transforms every frame, so a scale set at spawn time is erased.

## Layout

    Source/TheChamber/Creatures/
      CreatureTypes.h          FCreatureStats, FCreatureFusionWeights
      AnimalDataAsset.*        one source animal
      CreatureFusionLibrary.*  the heart — stat blending + skeletal mesh merge
      CreatureDefinition.*     the fused result
      CreatureMeshCache.*      merged meshes cached per combo key
      CreaturePawn.*           the spawned hybrid
      CreatureAnimInstance.*   holds bone scales for the anim graph
      CreatureLabSpawner.*     stage 2 test harness
    Source/TheChamber/Tests/
      CreatureFusionTests.cpp  four tests, no art assets needed

`FCreatureFusionWeights` defaults encode the design rule: the front half owns
offence and vision, the back half owns locomotion. Those weights are the game's
central balance knob — changing them changes how the whole game feels.

## Still needed in the editor (cannot be generated from code)

1. Master skeleton plus an animation set (idle / walk / run / attack / death).
2. An Anim Blueprint deriving from `UCreatureAnimInstance`, with a
   Transform (Modify) Bone node per scaled bone reading `GetBoneScale()`.
3. Two `UAnimalDataAsset` instances under `/Game/Creatures/Animals`.

Two animals is enough to prove the mechanic. The stage 2 milestone is: pick two
halves, a creature spawns and walks. If fiddling with combinations is not
interesting at that point, the design needs rethinking before the RTS layer is
built.

## Roadmap

Fusion → combat → RTS shell → AI opponent → content. The temptation is to build
the RTS first; that produces another RTS skeleton with no game in it.

See `README.md` (Hebrew) for setup steps and a first-compile troubleshooting
table. The user speaks Hebrew and prefers replies in Hebrew.
