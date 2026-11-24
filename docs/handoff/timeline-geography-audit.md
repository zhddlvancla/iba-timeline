# timeline-geography-audit

> 지구본 역사 국경을 History of Nations 감사본으로 교정 — 교과서 적용분 제외, 기간 단축과 시기별 표시명만, 도형 확장 없음

User decision (2026-11-24): 첨부한 감사 파일(`A_History_of_Nations_Audit.xlsx`, 비공개)을 근거로 역사 내용을 고친다. **교과서 내용을 적용한 것은 절대 변경하지 않고**, 교과서 외의 내용에만 감사 파일을 근거로 한다.

**적용 범위**
- 대상은 지구본의 Cliopatria 역사 국경이다. 기록줄기(`timeline-content.js`, `index.html`의 노드·기록)는 교과서 자료이므로 바꾸지 않았다.
- 교과서 표기 통일 커밋(ec55370, e14b7ff)에서 바뀐 `names-ko.js` 명칭 118종과 `globe.js`의 `historicalNamePeriods`는 제외했다.
- 감사 파일의 '연구판' 구간(Cliopatria v0.2.1)을 사이트 자료로 보고 대조했다.

**교정 규칙** (`tools/geography_corrections.py`)
- `CLIPS`: 문헌이 모두 존속하지 않았다고 보는 해에만 표시를 지운다. 자료 간 연대가 다르면 가장 넓은 범위를 남긴다.
- `RELABELS`: 같은 영역에서 국호·지위가 바뀐 해에 표시명 `labelKo`만 바꾼다. 원자료 `name`은 그대로 둔다. `globe.js`는 교과서 기간 명칭 → `labelKo` → `names-ko.js` 순으로 이름을 정한다.
- 도형 확장·신규 도형은 만들지 않는다. 판정 유보, 자료 이견만 있는 행, 화면에 나오지 않는 위키데이터 식별자 오류는 제외했다.

**파일**
- 현재 파일에 다시 적용: `python3 tools/apply_geography_corrections.py` (여러 번 실행해도 결과가 같다)
- 원자료부터 다시 만들 때는 `build_geography.py`가 같은 교정을 자동 적용한다.
- 지도 자료를 바꾸면 `globe.js`의 `dataVersion`과 `index.html`의 `globe.js?v=`를 올린다.

**남은 공백.** 북송 도형을 1127년에서 끊어 1128~1138년 강남에는 송 표시가 없다(남송은 교과서 명칭이라 확장하지 않음). 교과서 명칭 정치체 중 감사 파일이 지적한 항목(예: 대한제국 1897년, 위(魏) 220년 시작, 사산 왕조 224~651년, 우마이야 왕조 661~750년)은 사용자 확인 전까지 그대로 둔다.

Related: [timeline-doc-mode](timeline-doc-mode.md) [ATTRIBUTION](../../assets/geography/ATTRIBUTION.md)
