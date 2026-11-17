# 기록줄기 지구본의 출처와 라이선스

## 역사 국경

**Cliopatria v0.2.1**, Ed Chalstrey, James Bennett 및 Seshat Global History Databank 기여자. [공식 데이터 릴리스](https://doi.org/10.5281/zenodo.23128623) · [버전별 소스](https://github.com/Seshat-Global-History-Databank/cliopatria/releases/tag/v0.2.1) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) · [원본 라이선스 고지](Cliopatria-LICENSE.md)

데이터 설명은 James S. Bennett, Erin Mutch, Andrew Tollefson, Ed Chalstrey 외, *Cliopatria - A geospatial database of world-wide political entities from 3400BCE to 2024CE*, Scientific Data 12, 247 (2025)를 참고한다. [논문](https://doi.org/10.1038/s41597-025-04516-9)

**IBA 가공 내역.** 공식 릴리스의 정치체(`POLITY`) 행을 사용하고 관계 도형(`RELATION`)은 제외했다. 표시에 필요한 속성만 남겼다. 웹용으로 도형을 위상 보존 방식으로 단순화(0.055°)하고, 구면 렌더러에 맞게 테두리 방향을 통일했으며, 좌표는 소수점 이하 네 자리로 줄였다. 축소 시 사라지는 미세 윤곽은 더 높은 정밀도로 남겼다. 여러 조각으로 된 도형에서 0.005 제곱도보다 작은 부속 조각은 제외했다. 원자료의 정치체 이름과 시작·종료 연도는 그대로 썼으며 양 끝 연도를 포함한다.

파일은 연도 구간별로 나누어 gzip으로 압축하고 Base64로 인코딩했다. 역사 경계와 Natural Earth 데이터는 로컬 HTML에서도 읽을 수 있는 스크립트 파일에 담았다. 앱은 선택한 연도의 구간만 불러와 원자료의 시작·종료 연도에 따라 표시한다. 압축 해제에는 브라우저의 `DecompressionStream`이 필요하다. 역사 경계의 제공 범위는 3400 BCE ~ 2024 CE이며 개별 정치체와 지역의 기록 밀도는 서로 다르다.

## 지도 한글 명칭

`names-ko.js`는 Cliopatria 정치체 명칭 1,587종을 한글 표시명과 연결한다. 초기 표기 가운데 995종은 원자료에 연결된 위키데이터 항목의 한국어 이름을 받아 사용했고, 나머지 592종은 한국어 이름이 없거나 원자료 명칭과 연결 항목이 어긋나는 경우 등을 검토해 번역·음역했다. 현대 국경의 기본 명칭은 Natural Earth의 `NAME_KO` 필드에 따른다. [위키데이터 데이터 이용 방법](https://www.wikidata.org/wiki/Wikidata:Data_access) · [위키데이터 사용 조건](https://www.wikidata.org/wiki/Wikidata:Licensing) · [CC0](https://creativecommons.org/publicdomain/zero/1.0/)

기록줄기의 근거 교과서와 같은 대상을 확인한 국가·지역은 기록줄기에서 쓰는 명칭으로 맞췄다. 같은 원자료 이름이 여러 정치체나 시기를 아우르면 해당 명칭의 적용 연도를 제한한다. 교과서에서 확인되지 않는 이름은 기존 표기를 쓴다. 이 규칙은 화면에 표시되는 이름에 적용된다. [기록줄기 교과서 목록](../../docs/handoff/timeline-textbook-sources.md)

## 현재 국경과 육지

**Natural Earth 1:110m**의 Admin 0 Countries 및 Land, Tom Patterson, Nathaniel Vaughn Kelso 및 기여자. [Admin 0 Countries](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/) · [Land](https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/) · [공식 배포 태그 v5.1.2](https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2) · [퍼블릭 도메인 이용 조건](https://www.naturalearthdata.com/about/terms-of-use/)

**IBA 가공 내역.** 원자료의 좌표는 유지하고 표시용 속성만 골라 JSON 크기를 줄였다. 현재 국경은 Natural Earth의 사실상 통치 경계에 따른다. 육지는 시기와 관계없이 위치 탐색용 바탕으로 사용한다.

## IBA 기록 탐색 위치

IBA 기존 기록의 지명과 지역 설명을 바탕으로 탐색용 대표 위치를 지정했다. 도시 위치 일부는 Natural Earth 1:10m Populated Places v5.1.2의 퍼블릭 도메인 좌표를 대조하고 단순화했다. 점은 연결 기록을 찾기 위한 대략적인 위치를 나타낸다. [Populated Places](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/) · [퍼블릭 도메인 이용 조건](https://www.naturalearthdata.com/about/terms-of-use/)

## 지구본 라이브러리

**Globe.gl v2.46.2**, Copyright (c) 2019 Vasco Asturiano, MIT. npm 공식 UMD 배포 파일 `dist/globe.gl.min.js`를 그대로 사용한다. [프로젝트](https://github.com/vasturiano/globe.gl) · [공식 npm 배포 파일](https://registry.npmjs.org/globe.gl/-/globe.gl-2.46.2.tgz) · [MIT 전문](Globe.gl-LICENSE.txt) · [번들 의존성 고지](Globe.gl-THIRD-PARTY-NOTICES.txt)

## 지도 파일 재생성

다음 원자료를 별도의 작업 폴더에 내려받는다.

- [Cliopatria v0.2.1](https://raw.githubusercontent.com/Seshat-Global-History-Databank/cliopatria/v0.2.1/cliopatria.geojson.zip) → `cliopatria.zip`
- [Natural Earth Admin 0 Countries](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_admin_0_countries.geojson) → `countries.geojson`
- [Natural Earth Land](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_land.geojson) → `land.geojson`

`Shapely 2.0.7`이 설치된 Python에서 `python tools/build_geography.py <원자료 폴더>`를 실행한다.
