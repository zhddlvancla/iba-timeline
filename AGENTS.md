# AGENTS.md — IBA 기록줄기(timeline-app) 작업 안내

이 저장소에서 일하는 코딩 에이전트(Codex 등)가 가장 먼저 읽는 문서다. 2026-10-30까지 Claude Code에서 진행한 작업을 그대로 이어받도록 정리했다.
세부 규칙과 지난 결정의 이유는 `docs/handoff/*.md`에 있다. 작업 주제에 해당하는 문서를 먼저 열어 보고 시작한다.

---

## 1. 프로젝트 한눈에

- **무엇:** 수업용(고등 한국사·세계사) 인터랙티브 연표 웹앱.
  - 가상의 기관 「IBA 국제기록보존기구」의 기록보관소 단말기라는 세계관 위에 실제 역사를 싣는다.
  - 화면은 1987년 CRT 단말기 느낌의 짙은 녹색 디자인이다.
- **사이트:** https://zhddlvancla.github.io/iba-timeline/ (GitHub Pages, `main` 브랜치 루트)
- **저장소:** `github.com/zhddlvancla/iba-timeline` (공개 저장소)
- **사용자:** 한국어로 지시하는 교사. 결과 보고도 **한국어**로, 무엇을 바꿨고 무엇을 확인했는지 짧게 쓴다.

## 2. 파일 구조

| 파일 | 내용 |
|---|---|
| `index.html` | 앱 전체(약 3.5만 줄). CSS, 대사·세계관 문서, `<script type="text/babel">` React 18 UMD + Babel standalone(CDN), **TIMELINE_DATA·TIMELINE_DB 사본**까지 모두 들어 있다. 빌드 단계 없음 |
| `timeline-content.js` | 데이터 전용 파일. `window.TIMELINE_DATA`(노드 목록)와 `window.TIMELINE_DB`(노드별 기록). 맨 위 주석에 스키마가 있다 |
| `audio-engine.js` | `window.DENDRO_AUDIO`. Web Audio로 효과음·앰비언트·배경음악을 합성한다(음원 파일 없음) |
| `iba-emblem.js` | 기관 인장 SVG 생성기 |
| `semantic-search.js`, `semantic-worker.js`, `search-index.js` | 검색창 Enter 의미 검색(e5-small) |
| `assets/w1/<시대>/…` | 앱이 쓰는 이미지(webp). 시대 폴더는 고대·중세·근세·근현대·기관 |
| `tools/` | 데이터·이미지 작업 도구(아래 5절) |
| `docs/handoff/` | 누적된 사용자 규칙과 결정 기록 |

- `index.html`은 매우 크다. 통째로 읽지 말고 `grep -n`으로 위치를 찾은 뒤 필요한 범위만 읽는다.
- 주요 컴포넌트:
  - `TopBar`, `SubNav`, `TimelineCanvas`, `MemoryDetail`(상세 패널), `SyncDialog`/`DocView`(기록 열람 = 스캔 문서), `Footer`, `Terminal`, `Briefing`(맹세), `App`
  - `window.VESTIGIA`(방송·안내 대사)
- **`.gitignore`는 화이트리스트다.** 새 최상위 파일이나 새 asset 폴더는 `.gitignore`에 `!/경로`를 추가해야 올라간다.
  - 교과서 원본, `vestigia-voic/`, `_removed/`, 백업은 절대 올리지 않는다(공개 저장소).

## 3. 가장 중요한 규칙 (어기면 안 됨)

1. **TIMELINE_DB·TIMELINE_DATA는 두 군데에 있다:** `timeline-content.js`와 `index.html`. 데이터를 고치면 **반드시 두 파일에 똑같이** 반영한다.
   - `tools/tl.py`·`tools/notes_edit.py`는 자동으로 두 파일을 모두 고친다.
   - 확인은 `sh tools/check.sh`로 한다.
2. **역사 내용은 지어내지 않는다.**
   - 연도와 내용은 교과서 기준이다. 교과서에 없으면 한국 사학계 주류(한국민족문화대백과, 국사편찬위원회 우리역사넷)를 따른다.
   - 정리·요약·연구원 기록·부속 자료 항목을 임의로 만들지 않는다.
   - **자료·탐구 이미지 설명:** 메인 노드와 시대(기간) 노드 모두 교과서 내용을 우선 근거로 한다. 교과서에 설명 근거가 없으면 역사적 사실을 직접 검색하고, 전문 자료와 전문가의 최신 사학계 연구를 검토해 보강한다. 논쟁적인 견해를 정설로 단정하지 않는다. 구체적인 절차는 `docs/handoff/timeline-image-description-rules.md`를 따른다.
3. **표기:**
   - 음수 연도는 `BCE`, 양수는 `CE`. `BC`·`AD`·`기원전 n년`식 숫자 표기는 데이터에 쓰지 않는다.
   - 화면에 교과서 이름이나 쪽수 같은 **출처를 표시하지 않는다**(`fileRef`·`ref` 같은 데이터 필드는 괜찮다).
   - 화면 문구에 "(EBS)" 같은 출처 꼬리표도 달지 않는다.
4. **요약 탭(`notes`) = 사용자가 직접 만든 정리본이다. 내용을 절대 빼지 않는다.**
   - 이미지·교재 내용을 보강할 때는 관련 항목의 아래나 옆에 넣거나, 원문 문장 끝에 덧붙이기만 한다.
   - 사용자의 문장을 바꿔 쓰지 않는다. 예외는 오타·연도·용어 교정뿐이다.
   - 작업 후 `python3 tools/audit_notes.py`로 원문 보존을 확인한다. 현재 기준선은 46건이고, 모두 오타·연도·용어 교정이거나 문장 중간 삽입이다.
   - 화면은 **2단계**까지만 그린다. 항목은 문자열 또는 `{t, sub:[문자열]}` 형태다.
   - `**강조**`는 강의 모드에서 빈칸이 된다.
5. **노드 이름표는 항상 전부 보여야 한다.** 겹치면 숨기거나 호버로 보여 주지 말고 재배치한다(`docs/handoff/timeline-labels-always-visible.md`).
6. **글자 크기:** 최소 12px, 기록 본문 16px 이상.
7. **화면 겹침 0:** 1280×800, 1440, 1500×960, 1920×1080에서 연구원 접속과 대응요원 접속 두 모드 모두 확인한다.
8. **세계관 용어:**
   - **LUMINA는 적(역사를 왜곡하려는 세력)의 이름이다. 작전명으로 쓰지 않는다.**
   - 「제3층」은 관리국 복원 규정의 허구 재구성 층(허구 표시 의무)이다. 왜곡과 다르다.
   - 옛 용어 지역국, DENDRO, TVA, AC는 화면에 쓰지 않는다(현재는 지부 BR-1~4, VESTIGIUM, MNEMOSYNE).
   - 화면 문구에 학번·학교 같은 현실 메타 단어를 쓰지 않는다.
   - 자세한 내용은 `docs/handoff/timeline-dendro-canon.md`에 있다.
9. **보안:**
   - 대화창에 붙여넣어진 토큰이나 비밀번호는 노출된 것으로 보고 절대 쓰지 않는다.
   - push는 macOS 키체인에 저장된 자격 증명에 맡긴다. 비밀번호를 물으면 멈추고 사용자에게 알린다.
   - 공개 저장소이므로 개인 정보(이메일 등)를 커밋하지 않는다. git 신원은 `IBA timeline <iba-timeline@local>`이다.

## 4. 실행과 확인

```sh
python3 -m http.server 5555        # 저장소 루트에서 → http://localhost:5555/
sh tools/check.sh                  # 데이터 문법 + 두 파일 TIMELINE_DATA·TIMELINE_DB 일치
python3 tools/audit_notes.py       # 정리본 원문 보존 감사
```

- 브라우저가 `index.html`을 캐시한다. 수정 후에는 강력 새로고침(⌘⇧R)이나 `fetch('/', {cache:'reload'})`를 한 뒤 다시 불러온다.
- `audio-engine.js`처럼 `?v=날짜`가 붙은 스크립트를 고치면 `index.html`의 `?v=` 값도 바꾼다.
- 진입 순서: 안내문 → 포털(배속 승인 번호 또는 「단순 열람」) → 대문 「제1보존서고 접근 주의」 → 로더 → 맹세 → 기록줄기.
- 확인할 때 보는 것:
  - 콘솔 오류
  - 해당 노드의 기록 열람 탭 7개(지도·요약·상세·자료·탐구·연결·연구원 기록)
  - 두 모드에서 글자 넘침·겹침
- 이미지 경로는 GitHub Pages에서 대소문자와 NFC를 구분한다. 새 이미지 경로가 실제 파일명과 정확히 같은지 확인한다.

## 5. 도구 (`tools/`)

| 도구 | 용도 |
|---|---|
| `dump_db.py` | `timeline-content.js`를 실행해(node가 없으면 macOS `jsc`) DB를 JSON/dict로 읽는다 |
| `check.sh` | 문법 검사, 두 파일 TIMELINE_DATA·TIMELINE_DB 일치 검사(실패 시 종료 코드 1) |
| `tl.py` | 레코드 소스 직접 편집: `put`(자료·탐구 추가), `remove_src`, `entries`, `srcs`. 두 파일 모두에 적용한다 |
| `notes_edit.py` | 요약 탭 편집: `app` / `subadd` / `after` / `before` / `add` / `newsec` / `rep` → `write()`. 바뀐 노드만 원래 서식으로 다시 쓴다 |
| `audit_notes.py` | 기준 커밋(기본 16cd53e) 대비 정리본 문장 보존 감사 |
| `phash.py` | 이미지 중복 판정 dHash(같은 노드 안에서 거리 ≤30이면 중복). Pillow 필요 |
| `image_convert.py` | 교과서 이미지 → webp. 1600 미만은 2000으로 키우고 언샤프, 2400 초과는 2400으로 줄이며 q88. NFC 파일명 |

## 6. 데이터 모델 요약 (자세히는 `timeline-content.js` 머리 주석, `docs/handoff/timeline-node-standard.md`)

- **노드 종류**(`docs/handoff/timeline-node-terminology.md`):
  - **메인 노드:** `kind:'turning'`, 기록 열람 있음.
  - **서브 노드:** `noSync:true`, 본문(`body`)만 있음.
  - **기간 노드:** `hidden:true`이고 `NODE_GROUPS`의 괄호 표시로만 보인다. 기록 열람이 있고 `syncRatio`가 필요하다.
  - **위험 노드:** `risk:{by:'LUMINA', kind, level, note, evidence}`. 대응요원 접속에서만 적색으로 보인다.
- **기록(`TIMELINE_DB[id]`):**
  - `notes`(요약 = 사용자 정리본)
  - `overview{summary, terms, timeline}`(상세. summary는 '이름 — …'으로 시작)
  - `artifacts`(자료 `{slot:'auto', src, caption, ref?, span?}`)
  - `sources`(탐구 `{kind:'탐구 자료', title, src, gloss?}`)
  - `map`, `linked`, `annex`, `research`, `lumina`
- **위험 노드의 왜곡 표기:** 지도·요약·상세에만 `{{원본|왜곡}}`을 쓴다. 대응요원이 클릭해 정정한다(`docs/handoff/timeline-doc-mode.md`).
- **연도:** 배치용 `year`와 화면용 `yearLabel`을 함께 쓴다. 같은 해 노드는 `month`로 펼친다.
- 노드를 추가하거나 크게 바꾸면 이름표 겹침을 다시 확인하고, 의미 검색 색인도 다시 만든다(`docs/handoff/timeline-semantic-search.md`).

## 7. 이미지 작업 규칙

- 교과서 이미지 원본은 사용자 Mac의 비공개 iCloud 자료 폴더에 있다. 공개 문서에는 개인 폴더 경로를 적지 않는다.
  - 클라우드 환경에서는 접근할 수 없다. 이미지 작업은 로컬에서 한다.
- 이미지마다 맞는 **메인 노드와 기간 노드 모두**에 넣는다.
  - 사진·지도·유물은 자료(`artifacts`)에, 도표·통계는 탐구(`sources`, `kind:'탐구 자료'`)에 넣는다.
- **한 노드 안에 중복 이미지는 두지 않는다**(dHash ≤30이거나 같은 주제). 다른 교과서의 비슷한 이미지가 이미 있으면 새 것을 넣지 않는다.
  - 새 이미지와 같은 내용의 `src` 없는 자리표시(「도판 결락」)는 채우거나 지운다.
- 저장 경로 예:
  - `assets/w1/<시대>/한국/미래엔/P###-<캡션>.webp`
  - `assets/w1/<시대>/세계/천재/<단원>-<캡션>-<n>.webp`
- 장 도입 삽화, 만화, 빈 지도, 음식 사진, 현대 지구촌 통계처럼 맞는 노드가 없는 이미지는 넣지 않는다.
- 기록 열람 창 안의 `<img>`는 `loading="eager"`로 둔다(lazy로 하면 이미지가 안 뜬다).

## 8. UI 규칙 요약 (자세히는 `docs/handoff/timeline-ui-conventions.md`)

- ESC는 맨 위 창만 닫는다. 창마다 `window.useEscLayer(active, close)`로 등록한다.
- 소리:
  - 배경음악과 앰비언트는 기록줄기 화면에서 자동으로 재생된다. 사용자가 끈 채널은 `sessionStorage iba.aud.*`에 저장된다.
  - 타자기 소리는 앰비언트 켜기/끄기를 따른다(`DENDRO_AUDIO.typing()`).
- `L` 키는 강의 모드(zoom 1.4, 빛 효과 끔, 소리 멈춤), `S` 키는 학습 모드(배경음악만 끔)다.
- 박스 모서리 꺽쇠 장식은 쓰지 않는다. 메인 `<style>` 끝의 `display:none` 블록에 모아 숨겨 두었다.
- 맹세 → 기록줄기 사이에는 전환 연출을 두지 않는다(사용자가 빼라고 했다).
- 연구원 ↔ 대응요원 접속 전환은 대문 「제1보존서고 접근 주의」 제목 글리치를 약하게 쓴 것이다(`.mode-glitch`, 0.5초).
  - 사용자가 거절한 연출: 섬광·주사선·도장, 조명이 꺼졌다 비상등이 켜지는 연출.
- 디자인은 세계관(1987년 기록보관소 단말기, 타자기, 형광등, 종이 문서)에 맞게, 과하지 않고 자연스럽게 한다.

## 9. 작업 흐름과 배포

1. 지시를 받으면 관련 `docs/handoff` 문서와 코드를 확인한 뒤 바로 작업한다.
   - 큰 데이터 변경은 바꿀 목록을 보여 주고 시작해도 된다.
2. 확인(4절)이 끝난 작업만 **묻지 않고 커밋한 뒤 `git push origin main`** 한다. 1~2분 뒤 사이트에 반영된다.
   - 반쯤 된 상태나 깨진 상태는 올리지 않는다.
   - 커밋 메시지는 한국어 한 줄 요약으로 쓴다.
   - 클라우드 환경이라 push 권한이 없으면 PR을 만들고 사용자에게 병합을 부탁한다.
3. 보고는 한국어로 한다. 바꾼 것, 확인한 것, 사용자가 결정할 것을 짧게 쓴다.

## 10. 지금 상태와 열린 질문 (2026-10-30)

- 최근 작업:
  - 교과서 이미지 약 1,100장을 노드에 배치했다.
  - EBS 수능특강 세계사·한국사 내용을 요약 탭 정리본에 보강했다(원문 보존).
  - 기록줄기 UI를 다듬었다: 꺽쇠 제거, 얇은 스크롤 표시, 접속 전환 글리치, 작전명 삭제.
- 사용자에게 답을 받지 못한 것:
  - 「두 간격을 좁힌다(좁히면 기록줄기 구간을 넓힌다)」가 정확히 어느 간격인지. 이름표 ↔ 모래시계 ↔ 기록줄기 시작점 간격으로 해석했는데 틀렸다고 해서 원래대로 돌려 두었다.
  - 접속자 얼굴 둘레 조준선과 대문 화면 네 귀퉁이 표시도 지울지(현재는 남겨 둠).
  - 독일 통일 노드의 정리본에 「마치니의 통일 운동」(이탈리아 인물)이 들어 있는데, 원문 보존 규칙 때문에 그대로 두었다. 고칠지 물어볼 것.
  - 1920년대 도시 문화·신여성 사진을 '문화 정치' 기간 노드에 둘지 아예 지울지.
  - 동남아시아 노드를 새로 만들지. 현재 동남아 유적 이미지는 굽타 왕조(s-gupta)에 들어 있다.
  - 1945년 이후 탈식민 메인 노드를 만들지.

## 11. 문서 목록 (`docs/handoff/`)

| 문서 | 주제 |
|---|---|
| `timeline-history-data-rules.md` | 연도·내용·표기 규칙, 트랙별 노드 구조 결정 |
| `timeline-node-standard.md` | 노드 표준 구성, 이미지 배치·요약 탭 작업 이력 |
| `timeline-node-terminology.md` | 메인·서브·기간·위험 노드 |
| `timeline-doc-mode.md` | 기록 열람(스캔 문서) 구조, 위험 노드 정정 메커니즘 |
| `timeline-ui-conventions.md` | UI·소리·강의 모드·검증 해상도 |
| `timeline-labels-always-visible.md` | 이름표 배치와 겹침 규칙 |
| `timeline-dendro-canon.md` | 세계관 정본 용어와 대사 시스템 |
| `timeline-semantic-search.md` | 의미 검색과 색인 재생성 |
| `timeline-notes-source.md` | 정리본 원본(넘버스 파일)과 추출 방법 |
| `timeline-textbook-sources.md` | 교과서 PDF 목록 |
| `timeline-github-deploy.md`, `timeline-auto-deploy.md` | 배포 |
| `timeline-dialog-images-no-lazy.md` | 대화창 이미지 eager 규칙 |
| `iba-emblem.md` | 인장 생성기 |
| `IBA_VESTIGIUM_canon.md` | 최신 총람 제16판 원문(앱 내장 문서와 일치) |
| `IBA_beyond_house_image_prompts.md` | 너머의 집 이미지 프롬프트(이미지용 제안) |
| `IBA_RS-PH_stack_phenomena.md` | 서고 현상 기록철(가상 연구원 기록) |

| `timeline-image-description-rules.md` | 자료·탐구 이미지 설명의 교과서 근거·전문자료 검색·최근 연구 검토 기준 |
