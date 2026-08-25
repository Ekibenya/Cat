#!/usr/bin/env python3
"""Build the visual-novel image index from the checked-in image library."""

from __future__ import annotations

import difflib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
IMAGE_ROOT = ROOT / "image"
ERA_PATH = ROOT / "core/res/data/felinia/eras.json"
OUT_PATH = ROOT / "core/res/data/felinia/vn-images.json"
ASSIGNMENTS_PATH = Path(__file__).with_name("portrait-assignments.json")


def image_kind(relative: Path) -> tuple[str, str]:
    category = relative.parts[-2]
    name = relative.stem
    species = "cat" if "猫娘" in name else "human" if "人类" in name else "scene"
    if category == "背景图":
        return "background", species
    if category == "单角色立绘":
        return "single", species
    if category == "组合立绘":
        return "group", species
    if category == "原始绿幕":
        return "chroma", species
    raise ValueError(f"unrecognised image category: {relative}")


def clean_folder_title(name: str) -> str:
    return re.sub(r"^\d+_(?:图\d+_|卷首图版[^_]+_)", "", name)


def main() -> None:
    eras = json.loads(ERA_PATH.read_text(encoding="utf-8"))
    assignments = json.loads(ASSIGNMENTS_PATH.read_text(encoding="utf-8"))
    result = []
    all_assets = []
    source_only = []
    portrait_coverage = {"roster": 0, "exact": 0, "missing": []}

    folders = sorted(p for p in IMAGE_ROOT.iterdir() if p.is_dir() and re.match(r"^\d\d_", p.name))
    for folder in folders:
        title = clean_folder_title(folder.name)
        ranked = sorted(
            [(
                difflib.SequenceMatcher(None, title, f"{era['t']}：{era['s']}").ratio(),
                era,
            ) for era in eras],
            key=lambda item: item[0],
        )
        score, era = ranked[-1]
        if score < 0.78:
            raise RuntimeError(f"cannot match image folder to era: {folder.name}")

        assets = []
        for path in sorted(folder.rglob("*.png")):
            relative = path.relative_to(ROOT)
            kind, species = image_kind(relative)
            asset = {
                "src": "/" + relative.as_posix(),
                "kind": kind,
                "species": species,
                "label": path.stem,
            }
            named = re.match(r"^角色_(?:猫娘|人类)_(.+)$", path.stem)
            if named:
                asset["character"] = named.group(1)
            else:
                for character, assigned_src in assignments.get(str(era["i"]), {}).items():
                    if assigned_src == asset["src"]:
                        asset["character"] = character
                        break
            if kind == "chroma":
                source_only.append(asset["src"])
            else:
                assets.append(asset)
                all_assets.append(asset["src"])

        by_kind = {
            kind: [a for a in assets if a["kind"] == kind]
            for kind in ("background", "single", "group")
        }
        location_count = max(1, len(era.get("locs", [])))
        background_count = len(by_kind["background"])
        reachable_backgrounds = {
            (location + sky * location_count) % background_count
            for location in range(location_count)
            for sky in range(5)
        }
        if len(reachable_backgrounds) != background_count:
            raise RuntimeError(f"not every background has a scene trigger: {folder.name}")
        roster = {figure["n"]: figure["sp"] for figure in era.get("figs", [])}
        portrait_coverage["roster"] += len(roster)
        claimed = set()
        for asset in by_kind["single"]:
            character = asset.get("character")
            if not character:
                continue
            if character not in roster:
                raise RuntimeError(f"portrait names a character outside this era: {character} in {folder.name}")
            if roster[character] != asset["species"]:
                raise RuntimeError(f"portrait species mismatch: {character} in {folder.name}")
            if character in claimed:
                raise RuntimeError(f"character has repeated portraits: {character} in {folder.name}")
            claimed.add(character)
        portrait_coverage["exact"] += len(claimed)
        portrait_coverage["missing"].extend(
            {"eraIndex": era["i"], "character": character}
            for character in sorted(set(roster) - claimed)
        )
        for species in ("cat", "human"):
            known = sum(1 for figure in era.get("figs", []) if figure["sp"] == species)
            groups = sum(1 for asset in by_kind["group"] if asset["species"] == species)
            if groups and known < 2:
                raise RuntimeError(f"group image has no ensemble trigger: {folder.name}")
        result.append(
            {
                "folderId": int(folder.name[:2]),
                "folder": folder.name,
                "eraIndex": era["i"],
                "year": era["y"],
                "yearLabel": era["yl"],
                "title": era["t"],
                "subtitle": era["s"],
                "search": [era["t"], era["s"], era["yl"], era["ys"], folder.name],
                "locations": [loc["cn"] for loc in era.get("locs", [])],
                "characters": [
                    {"name": figure["n"], "species": figure["sp"], "role": figure["ti"]}
                    for figure in era.get("figs", [])
                ],
                "assets": by_kind,
                "assetCount": len(assets),
            }
        )

    pngs = sorted(
        "/" + p.relative_to(ROOT).as_posix()
        for p in IMAGE_ROOT.rglob("*.png")
        if p.parent.name != "原始绿幕"
    )
    if sorted(all_assets) != pngs:
        missing = sorted(set(pngs) - set(all_assets))
        repeated = sorted(src for src in set(all_assets) if all_assets.count(src) > 1)
        raise RuntimeError(f"coverage mismatch; missing={missing}, repeated={repeated}")

    payload = {
        "version": 1,
        "total": len(all_assets),
        "counts": {
            kind: sum(1 for era in result for asset in era["assets"][kind])
            for kind in ("background", "single", "group")
        },
        "portraitCoverage": portrait_coverage,
        "eras": sorted(result, key=lambda item: item["eraIndex"]),
        "all": all_assets,
        "sourceOnly": sorted(source_only),
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{OUT_PATH.relative_to(ROOT)}: {payload['total']} images across {len(result)} eras")


if __name__ == "__main__":
    main()
