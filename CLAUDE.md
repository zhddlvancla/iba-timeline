# 국제기록보존기구 · Claude Code 인수인계

@AGENTS.md

이 저장소의 `index.html`과 함께 추적되는 파일들이 GitHub Pages에서 사용하는 사이트다. 기존 Mac에서는 이 저장소 폴더를 열고 다음 수정 요청부터 이어간다. 새 환경에서는 아래처럼 커밋 이력까지 받아 시작한다. 정리본 보존 검사가 과거 커밋을 읽으므로 일반 복제를 사용한다.

```sh
git clone https://github.com/zhddlvancla/iba-timeline.git timeline-app
cd timeline-app
git config --local user.name "IBA timeline"
git config --local user.email "iba-timeline@local"
```

**기존 Mac과 도판까지 동일하게 옮기기.** 이집트 문명 기록의 ‘오시리스를 미라로 만드는 모습’ JPG 한 장은 기존 공개 제외 목록에 들어 있다. 같은 Mac에서는 이미 해당 위치에 있다. 새 컴퓨터에서는 비공개로 전달받은 `iba-local-figure.zip`을 저장소 루트에 풀면 기존 이미지 경로가 복원된다. 이 압축 파일에는 해당 도판 한 장만 들어 있다.

## 처음 열었을 때

1. `git status --short --branch`와 `git log -1 --oneline`으로 브랜치와 로컬 작업을 확인한다. 과거 인수인계 기준 커밋은 `5dc7fee`이며, 이후 작업은 항상 현재 브랜치의 최신 코드를 사용한다.
2. 저장소 루트에서 `sh tools/check.sh`와 `python3 tools/audit_notes.py`를 실행한다. Python 3과 Node.js 또는 macOS의 JavaScriptCore(`jsc`)를 사용한다. 첫 검사는 시대·노드·기록의 두 사본이 각각 일치해야 한다. 두 번째 검사의 기존 결과는 원문과 글자가 다른 문장 46건이다. 정리본을 수정할 때는 건수와 해당 문장을 함께 비교한다.
3. `python3 -m http.server 5555 --bind 127.0.0.1`을 실행하고 [로컬 사이트](http://127.0.0.1:5555/)를 연다. 별도 빌드 없이 실행되며, 최초 로드에는 React·ReactDOM·Babel을 받기 위한 인터넷 연결이 필요하다. 지구본용 라이브러리와 경계 데이터는 저장소에 들어 있다.
4. 첫 화면의 **학습용 접속**으로 기록줄기를 바로 확인할 수 있다. **열람용 접속**은 포털과 맹세를 거친다. 화면 변경은 PC와 가로 태블릿에서 확인한다. 두 접속 경로, 음향, 화면 확대·축소 및 재시작의 기준은 [화면 동작 규칙](docs/handoff/timeline-ui-conventions.md)에 있다.

## 작업별로 이어 볼 곳

- **연표와 역사 기록**은 `timeline-content.js`와 `index.html`을 함께 수정한다. 여섯 시대의 경계와 연표의 시각적 간격은 별도로 관리한다. 중국 국가·왕조 이름표는 수(隋) 형식을 따른다. [역사 데이터 규칙](docs/handoff/timeline-history-data-rules.md) · [노드 표기](docs/handoff/timeline-node-terminology.md)
- **지구본**은 `index.html`의 `IbaGlobeDialog`, `globe.js`, `globe.css`, `iba-globe-records.js`에서 이어간다. 줄기의 ‘위치 확인’은 전체 시대를 열고, 노드의 ‘지도’는 해당 연도·기간만 연다. 녹색 네모에서 기존 기록으로 이동한다. 화면 하단에는 ‘지도 자료 출처·라이선스’ 링크 하나를 둔다. 42 Apps의 코드·화면·그래픽을 가져오지 않는다는 사용자 결정을 따른다. [지도 동작](docs/handoff/timeline-doc-mode.md) · [데이터 출처와 재생성 방법](assets/geography/ATTRIBUTION.md)
- **총람**은 [제16판 원문](docs/handoff/IBA_VESTIGIUM_canon.md)과 앱 내장 원문을 함께 유지한다. 도판의 현행 목록과 사용자가 폐기한 조직·루미나 복장 도판은 [총람 이미지 목록](assets/canon/README.md)에서 확인한다.
- **므네모시네 관내 방송 음성**은 [음성 인계 문서](docs/handoff/timeline-mnemosyne-voice.md)를 먼저 읽는다. 사용자가 고른 차갑고 절제된 여성 아나운서 톤과 큰 건물의 실내 반향을 유지한다. 음성은 V-BC 관내 방송 19개에만 쓰며, 일반 므네모시네 문형에 음성을 붙이지 않는다.
- **교과서 원본이 필요한 작업**은 권한이 있는 Mac의 비공개 자료를 사용한다. 배포용 이미지와 지도 자료만으로도 사이트를 실행할 수 있다. 교과서 원본과 개인 설정은 공개 저장소로 복사하지 않는다. [교과서 목록](docs/handoff/timeline-textbook-sources.md)

과거 대화의 결정은 `docs/handoff/`에 날짜별로 남아 있다. 이전 설명과 현재 동작이 다르면 해당 기능의 최근 결정과 구현을 대조한다. `AGENTS.md`의 열린 질문은 사용자가 다시 요청할 때 다룬다.
