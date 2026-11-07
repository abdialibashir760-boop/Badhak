from __future__ import annotations

from typing import Mapping

from ..http import Http
from .archives import Commons, InternetArchive, LibraryOfCongress, Smithsonian
from .base import Source
from .manual import Mixkit, Noaa
from .science import Nasa, Usgs
from .stock import Coverr, Pexels, Pixabay, Unsplash

ALL = (Pixabay, Pexels, Mixkit, Coverr, Commons, LibraryOfCongress, InternetArchive, Nasa, Usgs, Noaa, Unsplash, Smithsonian)


def build_sources(http: Http, env: Mapping[str, str] | None = None) -> dict[str, Source]:
    return {cls.name: cls(http, env) for cls in ALL}
