"""Скачивает модели распознавания фото. Только стандартная библиотека Python.

Зовётся из Dockerfile при сборке образа. Качает по прямым ссылкам, с повторами
и докачкой: загрузчик Hugging Face в Docker на медленной сети зависал.
Уже скачанные и целые файлы не трогает.

    python scripts/download_models.py /opt/models
"""

import hashlib
import sys
import time
import urllib.request
from pathlib import Path

# Названия файлов и пути — как в app/services/recognition.py
MODELS = [
    {
        "path": "clip/open_clip_model.safetensors",
        "url": "https://huggingface.co/timm/vit_base_patch32_clip_224.openai/resolve/main/open_clip_model.safetensors",
        "size": 605143284,
        "sha256": "e6d1bd7789aa45192b3bf90570a789b478bae1b74ebcce7eddd908e83a2b7c31",
    },
    {
        "path": "u2net/u2net.onnx",
        "url": "https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx",
        "size": 175997641,
        "sha256": None,
    },
]
ATTEMPTS = 10
CHUNK = 1024 * 1024


def download(model: dict, root: Path) -> None:
    target = root / model["path"]
    if target.exists() and target.stat().st_size == model["size"] and verified(target, model["sha256"]):
        print(f"{model['path']}: уже скачан")
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    partial = target.with_suffix(target.suffix + ".part")

    for attempt in range(1, ATTEMPTS + 1):
        have = partial.stat().st_size if partial.exists() else 0
        if have >= model["size"]:
            break
        request = urllib.request.Request(model["url"], headers={"Range": f"bytes={have}-", "User-Agent": "layers"})
        try:
            with urllib.request.urlopen(request, timeout=60) as response, partial.open("ab" if have else "wb") as out:
                if have and response.status != 206:
                    # Сервер не умеет докачку — начинаем файл заново
                    out.seek(0)
                    out.truncate()
                    have = 0
                last = 0.0
                while chunk := response.read(CHUNK):
                    out.write(chunk)
                    have += len(chunk)
                    if time.time() - last > 10:
                        last = time.time()
                        print(f"{model['path']}: {have / 1e6:.0f} из {model['size'] / 1e6:.0f} МБ", flush=True)
        except OSError as error:
            print(f"{model['path']}: попытка {attempt} оборвалась ({error}), докачиваю", flush=True)
            time.sleep(min(2 * attempt, 20))

    if not partial.exists() or partial.stat().st_size != model["size"] or not verified(partial, model["sha256"]):
        partial.unlink(missing_ok=True)
        sys.exit(f"{model['path']}: не удалось скачать целиком, попробуй собрать ещё раз")
    partial.rename(target)
    print(f"{model['path']}: готово")


def verified(file: Path, sha256: str | None) -> bool:
    if sha256 is None:
        return True
    digest = hashlib.sha256()
    with file.open("rb") as data:
        while chunk := data.read(CHUNK):
            digest.update(chunk)
    return digest.hexdigest() == sha256


if __name__ == "__main__":
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "/opt/models")
    for model in MODELS:
        download(model, root)
