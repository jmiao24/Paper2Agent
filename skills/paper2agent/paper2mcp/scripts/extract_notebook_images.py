#!/usr/bin/env python3
"""Extract embedded notebook images and record their cell and file provenance.

Keep image-manifest.json alongside the generated figure_N files. Reruns for the
same notebook replace or remove only unchanged files owned by that manifest.
Other files (including plot_*.png) remain untouched. Untracked figure_N files,
modified owned files, and invalid manifests cause an error before any writes;
use a new or empty extraction directory in that case and retain prior evidence.
Run only one extractor at a time per output directory. The manifest covers
embedded outputs only; separately saved plots require their own provenance.
"""

import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import sys
from tempfile import TemporaryDirectory


MANIFEST_NAME = "image-manifest.json"
GENERATOR = "paper2agent.extract_notebook_images"
FIGURE_NAME = re.compile(r"figure_[1-9][0-9]*\.(?:png|jpg|svg)")
SHA256 = re.compile(r"[0-9a-f]{64}")


def _conflict(reason):
    return ValueError(
        f"{reason}. Use a new or empty extraction directory to avoid stale reference "
        "figures; retain existing files and their manifest as prior evidence."
    )


def _owned_files(target, source):
    """Validate ownership before allowing any replacements or stale-file cleanup."""
    if not target.exists():
        if target.is_symlink():
            raise _conflict("Output directory is a dangling symlink")
        return set()
    if not target.is_dir():
        raise _conflict("Output path is not a directory")
    manifest_path = target / MANIFEST_NAME
    owned = set()
    if manifest_path.exists() or manifest_path.is_symlink():
        if manifest_path.is_symlink() or not manifest_path.is_file() or manifest_path.stat().st_nlink != 1:
            raise _conflict("Image manifest must be a regular, unlinked file")
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            raise _conflict("Cannot read the existing image manifest") from exc
        if (not isinstance(manifest, dict) or manifest.get("schema_version") != 1
                or manifest.get("generator") != GENERATOR
                or manifest.get("notebook") != str(source.resolve())
                or not isinstance(manifest.get("notebook_sha256"), str)
                or not SHA256.fullmatch(manifest["notebook_sha256"])
                or not isinstance(manifest.get("images"), list)):
            raise _conflict("Image manifest is invalid or belongs to another notebook")
        for entry in manifest["images"]:
            if (not isinstance(entry, dict) or not isinstance(entry.get("path"), str)
                    or not FIGURE_NAME.fullmatch(entry["path"])
                    or entry["path"] in owned or not isinstance(entry.get("sha256"), str)
                    or not SHA256.fullmatch(entry["sha256"])):
                raise _conflict("Image manifest contains invalid or duplicate file ownership")
            name = entry["path"]
            owned.add(name)
            path = target / name
            if path.is_symlink():
                raise _conflict(f"Owned image {name} is a symlink")
            if path.exists():
                if (not path.is_file() or path.stat().st_nlink != 1
                        or hashlib.sha256(path.read_bytes()).hexdigest() != entry["sha256"]):
                    raise _conflict(f"Owned image {name} was modified or is not a regular, unlinked file")
    for path in target.iterdir():
        if FIGURE_NAME.fullmatch(path.name) and path.name not in owned:
            raise _conflict(f"Untracked image name {path.name} may contain prior or user figures")
    return owned


def extract_images_from_notebook(notebook_path, output_dir):
    """Save one preferred PNG, JPEG, or SVG rendition per notebook output.

    Both string and list-valued MIME payloads are supported. Image filenames
    retain the original figure_1.png/figure_2.jpg convention. All payloads and
    prior ownership are checked before changing existing output files.
    """
    source, target = Path(notebook_path), Path(output_dir)
    raw = source.read_bytes()
    notebook = json.loads(raw)
    images = []
    for cell_index, cell in enumerate(notebook.get("cells", [])):
        if cell.get("cell_type") != "code":
            continue
        for output_index, output in enumerate(cell.get("outputs", [])):
            data = output.get("data", {})
            for mime, extension in (("image/png", "png"), ("image/jpeg", "jpg"), ("image/svg+xml", "svg")):
                if mime not in data:
                    continue
                value = data[mime]
                if isinstance(value, list) and all(isinstance(part, str) for part in value):
                    value = "".join(value)
                if not isinstance(value, str):
                    raise ValueError(f"Cell {cell_index}, output {output_index}: {mime} must be a string or list of strings")
                try:
                    payload = (value.encode("utf-8") if extension == "svg"
                               else base64.b64decode("".join(value.split()), validate=True))
                except ValueError as exc:
                    raise ValueError(f"Cell {cell_index}, output {output_index}: invalid {mime} payload") from exc
                name = f"figure_{len(images) + 1}.{extension}"
                entry = {"path": name, "cell_index": cell_index, "cell_id": cell.get("id"),
                         "output_index": output_index, "mime_type": mime,
                         "sha256": hashlib.sha256(payload).hexdigest()}
                images.append((entry, payload))
                break

    owned = _owned_files(target, source)
    manifest = {"schema_version": 1, "generator": GENERATOR,
                "notebook": str(source.resolve()), "notebook_sha256": hashlib.sha256(raw).hexdigest(),
                "images": [entry for entry, _ in images]}
    target.mkdir(parents=True, exist_ok=True)
    # Stage complete files before replacing prior outputs. Publishing the manifest
    # last makes interrupted updates detectable by checking its recorded hashes.
    with TemporaryDirectory(prefix=".notebook-images-", dir=target) as staging_dir:
        staging = Path(staging_dir)
        for entry, payload in images:
            (staging / entry["path"]).write_bytes(payload)
        (staging / MANIFEST_NAME).write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        for entry, _ in images:
            os.replace(staging / entry["path"], target / entry["path"])
        for name in sorted(owned - {entry["path"] for entry, _ in images}):
            (target / name).unlink(missing_ok=True)
        os.replace(staging / MANIFEST_NAME, target / MANIFEST_NAME)

    for entry, _ in images:
        print(f"Extracted: {entry['path']}")
    print(f"\nTotal images extracted: {len(images)}" if images else "No images found in notebook.")
    print(f"Image manifest saved to {target / MANIFEST_NAME}")
    return len(images)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("notebook_path", help="Path to the full executed .ipynb notebook")
    parser.add_argument("output_dir", help="Directory for extracted images and image-manifest.json")
    args = parser.parse_args()
    try:
        extract_images_from_notebook(args.notebook_path, args.output_dir)
    except (OSError, ValueError, TypeError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
