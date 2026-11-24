"""Lossless GIMNET JSON save/load with validation and atomic replacement."""
import json
import os
from pathlib import Path
from tempfile import NamedTemporaryFile
from .validator import require_valid

def load_network(path):
    path=Path(path)
    try:
        with path.open('r', encoding='utf-8-sig') as f:
            data=json.load(f,parse_constant=lambda x: (_ for _ in ()).throw(ValueError(f'Illegal JSON constant {x}')))
    except json.JSONDecodeError as ex:
        raise ValueError(f'{path.name}: malformed JSON at line {ex.lineno}, column {ex.colno}: {ex.msg}') from ex
    return require_valid(data)

def save_network(data,path):
    require_valid(data)
    path=Path(path)
    path.parent.mkdir(parents=True,exist_ok=True)
    name=None
    try:
        with NamedTemporaryFile('w',encoding='utf-8',dir=path.parent,prefix=f'.{path.name}.',suffix='.tmp',delete=False) as f:
            name=f.name
            json.dump(data,f,ensure_ascii=False,indent=2,allow_nan=False)
            f.write('\n')
        os.replace(name,path)
    finally:
        if name and os.path.exists(name):
            os.unlink(name)
    return path
