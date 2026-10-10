/* ============================================================================
 * TIMELINE CONTENT — 기록줄기 전체 노드 내용 (디자인 무관 데이터 전용 파일)
 * ============================================================================
 * timeline-app/index.html 에서 UI 코드를 전부 걷어내고 "내용"만 뽑은 파일입니다.
 * 이 파일 하나만 옮기면 어떤 디자인에서도 동일한 노드 내용을 그대로 쓸 수 있습니다.
 *
 * 들어 있는 것 —
 *   TIMELINE_DATA : 기록줄기 마커(노드 목록). 어떤 노드가 어느 트랙 · 어느 연도에 있는지
 *   TIMELINE_DB   : 노드별 상세 내용(도시에). 정리/개요/탐구/자료/지도/연결
 *
 * ----------------------------------------------------------------------------
 * TIMELINE_DATA 스키마
 * ----------------------------------------------------------------------------
 *   range   : { start, end }            전체 연도 범위
 *   markers : [{ year, label, en }]     상단 기준 눈금
 *   themes  : [{ id, en }]              주제 분류
 *   tracks  : [{ id, ko, en, ... }]     기록줄기(트랙) 정의
 *   events  : [{                        ← 노드 본체
 *       id,        고유 id (TIMELINE_DB 의 키와 동일)
 *       track,     소속 트랙 id
 *       year,      연도 (음수 = BCE)
 *       yearLabel, (선택) 화면 표시용 교과서 범위 — 예: '약 70만 년 전 ~'. 있으면 year는 배치에만 쓰인다
 *       label, en, 국문/영문 이름
 *       state,     국가·왕조
 *       theme,     주제 (정치/경제/사회/문화/종교/군사/외교)
 *       kind,      'turning' = 메인 노드(다이아몬드) | 'event' = 일반
 *       body,      우측 패널에 뜨는 짧은 설명
 *
 *       // 선택 필드 — 노드 종류를 결정
 *       noSync,    true = 서브 노드 (기록 열람 없음, 세로 틱 마커)
 *       hidden,    true = 주제 노드 (트랙에 마커 없음, 묶음 브래킷으로만 노출)
 *       linkTo,    다른 노드 id (원줄기 연결 버튼)
 *       sub,       서브 레인 번호 (트랙 내 갈래 표시용)
 *       branch,    true = 갈래 시작점
 *   }]
 *
 * ----------------------------------------------------------------------------
 * TIMELINE_DB 스키마 — 키는 노드 id
 * ----------------------------------------------------------------------------
 *   syncRatio : 0~1                                    (구 헤더 게이지 — 지금은 쓰지 않는다. 헤더는 「기록 두께」)
 *   annex     : [{ id?, type, author_code, year, reply_to?, body }]   부속 자료 (기록 열람 머리의 「부속 자료 열람」 버튼 → 가운데 창 · DENDRO P3-4)
 *   research  : [{ 같은 모양 }]   연구원 기록 (RESEARCH 탭 — 연결 탭 오른쪽)
 *               type = 주해 | 증언 | 분기 | 복원 | 결손 신고 · author_code 예 RS-26-20301-SIT
 *               reply_to = 반박 대상 항목의 id(또는 배열 순번) — 대상 오른쪽 아래로 한 단 들여 표시
 *               화면 입력은 없다. 여기에 추가한다. 건수가 「기록 두께」 게이지에 반영된다
 *   redacted  : [{ field: 'body'|'summary'|'sources', text, kind: 1|2 }]   말소 구간 (DENDRO P3-6)
 *               text 와 같은 구간을 검은 사각으로 가린다. 1 = 제1종(annex 가 한 건이라도 등재되면 걷힘) · 2 = 제2종(걷히지 않음)
 *               위치·종류는 여기서만 정한다 — 자동 생성하지 않는다
 *   fileRef   : 출처 표기 문자열
 *   notes     : { summary?, sections:[{ head, body?, list:[] }] }   → 정리 탭
 *   overview  : { summary, terms:[{ label, def }],
 *                 timeline:[{ y | yl, label }] }                   → 개요 탭 (yl = 연도 대신 표시할 범위 문자열)
 *   sources   : [{ kind, title, src?, body?, citation }]            → 탐구 탭 (글·사료)
 *   artifacts : [{ slot, src?, caption, ref }]                     → 자료 탭 (사진·지도)
 *   map       : { title, bounds:{w,h}, regions:[{d,label}],
 *                 pins:[{x,y,label,sub,amber}], arrows:[] }        → 지도 탭
 *   linked    : [노드 id, ...]                                      → 연결 탭
 *   docMode   : true → 기록 열람을 스캔 문서로 연출 (탭: 지도·요약·상세·자료·탐구, 연결 탭 없음)
 *   docNo     : 문서 번호 (예: 'KR-0698-BH')
 *   map.notes : ['조사 소견 문단', ...] · map.cite
 *   artifacts[].note : 도판 설명
 *   inquiry   : { title, src, cite, question, findings:[{ who, src, text }], conclusion }
 *                                                                  → 탐구 탭 (문서 연출)
 *   lumina    : { detected, route, accessor, method, claims:[], evidence:[], cite }
 *                                                                  → 대응반 전용 LUMINA 접근·왜곡 보고 탭
 *   {{원본|왜곡}} : 위험 노드에서 LUMINA가 바꿔 쓴 문장 (지도·요약·상세에만). 연구원 접속은 원본, 대응반 접속은 왜곡(빨간 글씨)이 보이고
 *               찾아 누르면 왜곡에 줄을 긋고 원본을 옆에 적는다(정정).
 *               모두 정정하면 봉인된 자료·탐구 탭이 열린다. 다른 화면에서 쓸 때는 {{원본|왜곡}} → 원본. ████ = 접근 흔적(판독 불가)
 *
 * ----------------------------------------------------------------------------
 * 쓰는 법
 * ----------------------------------------------------------------------------
 *   HTML 에서 외부 파일로 불러오기 (권장):
 *     script 태그의 src 에 이 파일 경로를 지정
 *   → window.TIMELINE_DATA / window.TIMELINE_DB 로 접근
 *
 *   번들러/ESM 환경이면 파일 맨 아래 export 문의 주석을 해제하세요.
 *
 *   이미지 경로(src)는 assets/ 기준 상대 경로입니다.
 *   assets 폴더를 함께 옮기거나, 경로 앞부분만 일괄 치환해서 쓰세요.
 * ============================================================================ */

// ============================================================
// 시대 구분 — 기록줄기 전체를 고대부터 현대까지 한 화면에서 다룬다 (한국사 기준)
//   고대: ~ 통일신라·발해 / 중세: 고려 / 근세: 조선 전기(~양 난)
//   근대 태동기: 조선 후기(양 난 이후 ~ 개항 전) / 근대: 개항(1876)부터 / 현대: 광복(1945)부터
// ============================================================
window.TIMELINE_ERAS = [
  { key: 'prehistory',   ko: '선사',        en: 'PREHISTORY',   sub: '구석기·신석기',        start: -4498050, end: -4000 },
  { key: 'ancient',      ko: '고대',        en: 'ANCIENT',      sub: '~ 통일신라·발해',      start: -4000, end: 918  },
  { key: 'medieval',     ko: '중세',        en: 'MEDIEVAL',     sub: '고려',                 start: 918,   end: 1392 },
  { key: 'earlymodern',  ko: '근세',        en: 'EARLY MODERN', sub: '조선 전기',            start: 1392,  end: 1637 },
  { key: 'protomodern',  ko: '근대 태동기', en: 'PRE-MODERN',   sub: '조선 후기',            start: 1637,  end: 1876 },
  { key: 'modern',       ko: '근대',        en: 'MODERN',       sub: '개항(1876) 이후',      start: 1876,  end: 1945 },
  { key: 'contemporary', ko: '현대',        en: 'CONTEMPORARY', sub: '광복(1945) 이후',      start: 1945,  end: 2030 }
];
window.eraOfYear = (y) => window.TIMELINE_ERAS.find(e => y < e.end) || window.TIMELINE_ERAS[window.TIMELINE_ERAS.length - 1];

window.TIMELINE_DATA = {
  range: { start: -4498050, end: 2030 },   // 약 450만 년 전(선사) ~ 현대

  markers: [
    { year: -2333, label: '고조선 건국',             en: 'Gojoseon (traditional)' },
    { year: 476,   label: '서로마 멸망',           en: 'Fall of West Rome' },
    { year: 676,   label: '신라 삼국통일',           en: 'Silla Unifies' }
  ],

  themes: [
    { id: '정치', en: 'Politics' },
    { id: '경제', en: 'Economy'  },
    { id: '사회', en: 'Society'  },
    { id: '문화', en: 'Culture'  },
    { id: '종교', en: 'Religion' },
    { id: '군사', en: 'Military' },
    { id: '외교', en: 'Diplomacy'}
  ],

  tracks: [
    { id: 'korea',    ko: '한국',           en: 'KOREA',         sub: '구석기 · 신석기 · 청동기 · 고조선 · 철기 · 부여 · 삼국 · 가야 · 통일신라' },
    { id: 'eastasia', ko: '동아시아',        en: 'EAST ASIA',     sub: '하 · 상 · 주 · 진 · 한 · 위진 · 수당 · 송 · 원 · 명 · 청 · 일본 · 베트남 · 중화민국 · 중화 인민 공화국' },
    { id: 'west',     ko: '유럽·미주',       en: 'EUROPE & AMERICAS', sub: '그리스 · 헬레니즘 · 로마 · 프랑크 · 중세 유럽 · 신항로 개척 · 시민 혁명 · 산업 혁명 · 세계 대전 · 냉전' },
    { id: 'westasia', ko: '서아시아·인도',   en: 'WEST ASIA · INDIA', sub: '메소포타미아 · 페르시아 · 마우리아 · 굽타 · 이슬람 · 셀주크 · 델리 술탄 · 오스만 · 사파비 · 무굴 · 튀르키예' }
  ],

  events: [

    // ============================================================
    // 한국사 KOREA — 15개 주제 (연도순 정렬)
    // 구석기 · 신석기 · 청동기 · 고조선 · 철기 · 부여 · 고구려 ·
    // 옥저 · 동예 · 삼한 · 고구려 · 백제 · 신라 · 가야 · 통일신라
    //
    // sub-lane: 한국 트랙 포커스 시 백제 이후 기록줄기가 3갈래로 나뉨:
    //   sub: 0 → 고구려 (기존 lane)
    //   sub: 1 → 백제   (아래로 1)
    //   sub: 2 → 신라   (아래로 2)
    // ============================================================

    // ---------- 선사시대 ----------
    { id: 'k-paleo', track: 'korea', year: -698050, yearLabel: '약 70만 년 전 ~', label: '구석기 시대', en: 'Paleolithic',
      state: '구석기', theme: '사회', kind: 'turning',
      body: '약 70만 년 전부터 한반도에 인류가 거주. 단양 금굴·공주 석장리·연천 전곡리 유적에서 뗀석기와 동굴 거주 흔적이 발견된다. 채집·사냥·이동 생활.' },
    { id: 'k-neolithic', track: 'korea', year: -8000, yearLabel: '8000 BCE 무렵 ~', label: '신석기 시대', en: 'Neolithic',
      state: '신석기', theme: '사회', kind: 'turning',
      body: '기원전 8000년 무렵부터 빗살무늬토기·간석기를 사용. 농경과 정착 생활이 시작되며 강가·바닷가에 마을을 이루고 평등한 부족 사회를 형성. 서울 암사동·부산 동삼동 유적이 대표적.' },
    { id: 'k-gojoseon', track: 'korea', year: -2333, label: '고조선', en: 'Gojoseon',
      state: '고조선', theme: '정치', kind: 'turning',
      // 위험 노드 — 동북 공정
      risk: {
        by: 'LUMINA', kind: '동북 공정', level: 'HIGH',
        note: 'LUMINA가 동북 공정의 논리를 앞세워 고조선을 ‘중국사’로 편입하려는 기록 변조를 시도하고 있다.',
        evidence: '중국은 2002년부터 동북 공정을 추진하며 고조선·고구려·발해 등 한국의 역사를 중국사로 바꾸려 하였다. 원본 기록: 고조선은 비파형 동검·탁자식 고인돌로 대표되는 독자적 청동기 문화를 바탕으로 성립한 우리 역사 최초의 국가이다.'
      },
      body: '단군왕검이 청동기 문화를 바탕으로 우리 역사 최초의 국가 고조선을 건국. 8조법으로 사회 질서를 유지하였다. 주요 사건: 고조선 멸망(BCE 108).' },
    { id: 'k-bronze', track: 'korea', year: -2000, yearLabel: '20~15세기 BCE 무렵', label: '청동기 시대', en: 'Bronze Age',
      state: '청동기', theme: '사회', kind: 'turning',
      body: '비파형 동검·고인돌·민무늬토기로 대표되는 청동기 문화. 계급 사회와 군장 국가 형성의 물질적 기반이 마련된다.' },
    { id: 'k-iron', track: 'korea', year: -450, yearLabel: '5세기 BCE경', label: '철기 시대', en: 'Iron Age',
      state: '철기', theme: '경제', kind: 'turning',
      body: '중국 전국시대의 영향으로 철기가 한반도에 보급. 농업 생산력이 크게 증가하고 여러 나라가 등장하기 시작.' },
    { id: 'k-buyeo', track: 'korea', year: -200, yearLabel: '2세기 BCE경', label: '부여', en: 'Buyeo',
      state: '부여', theme: '정치', kind: 'turning',
      body: '만주 송화강 유역에 부여가 성립. 왕 아래 마가·우가·저가·구가 등 제가가 사출도를 다스린 연맹 왕국. 영고(迎鼓) 제천 행사와 순장·1책 12법 풍속.' },
    { id: 'k-wiman', track: 'korea', year: -190, yearLabel: '2세기 BCE 무렵', label: '위만 집권', en: 'Wiman Takes the Throne',
      state: '고조선', theme: '정치', kind: 'event', noSync: true,
      body: '중국에서 건너온 위만이 준왕을 몰아내고 고조선의 왕이 되었다. 이후 고조선은 철기 문화를 더욱 발전시켜 주변 지역을 정복하고, 한과 한반도 여러 나라 사이의 중계 무역을 장악하였다.' },
    { id: 'k-okjeo', track: 'korea', year: -130, yearLabel: '2세기 BCE경', label: '옥저', en: 'Okjeo',
      state: '옥저', theme: '정치', kind: 'turning',
      body: '함경도 동해안 일대에 옥저가 성립. 해산물과 소금이 풍부하였으나 고구려에 복속됨. 민며느리제와 골장제(가족 공동묘) 풍속.' },
    { id: 'k-dongye', track: 'korea', year: -120, yearLabel: '2세기 BCE경', label: '동예', en: 'Dongye',
      state: '동예', theme: '정치', kind: 'turning',
      body: '강원도 북부 동해안 일대에 동예가 성립. 단궁·과하마·반어피가 특산. 책화(責禍)와 족외혼 풍속, 무천(舞天) 제천 행사.' },
    { id: 'k-samhan', track: 'korea', year: -110, yearLabel: '2세기 BCE 말', label: '삼한', en: 'Samhan',
      state: '삼한', theme: '정치', kind: 'turning',
      body: '한반도 남부에 마한 54국·진한 12국·변한 12국의 삼한이 성립. 정치적 지도자 신지·읍차, 제사장 천군과 신성 구역 소도(蘇塗)를 두었다.' },
    { id: 'k-gojoseon-fall', track: 'korea', year: -108, label: '고조선 멸망', en: 'Fall of Gojoseon',
      state: '고조선', theme: '군사', kind: 'event', noSync: true,
      body: '한의 공격에 1년여 동안 맞서 싸웠으나 수도 왕검성이 함락되며 고조선이 멸망하였다. 한은 옛 고조선과 주변 지역에 낙랑군 등 군현을 설치하였다.' },
    { id: 'k-silla', track: 'korea', year: -57, label: '신라', en: 'Silla',
      state: '신라', theme: '정치', kind: 'turning',
      body: '박혁거세가 사로국(신라)을 건국. 6촌 촌장이 알에서 태어난 혁거세를 추대했다는 건국 신화가 전한다. 신라는 갈래 없이 원줄기로 이어진다. 주요 사건: 삼국시대 성립(1세기 BCE).' },
    { id: 'k-goguryeo', track: 'korea', year: -37, label: '고구려', en: 'Goguryeo',
      state: '고구려', theme: '정치', kind: 'turning', sub: 0,
      // 위험 노드 — 동북 공정
      risk: {
        by: 'LUMINA', kind: '동북 공정', level: 'HIGH',
        note: 'LUMINA가 동북 공정의 논리를 앞세워 고구려를 중국의 지방 정권으로 기록을 바꾸려 하고 있다.',
        evidence: '고구려는 독자적인 연호(광개토 대왕의 ‘영락’)를 쓰고 수·당의 침략에 맞서 싸운 독립 국가였다. 발해와 고려는 모두 고구려 계승을 내세웠다.'
      },
      body: '주몽(동명성왕)이 졸본에 고구려를 건국. 부여계 유이민과 압록강 유역 토착민이 결합한 정복 국가. 주요 사건: 고구려 멸망(668).' },
    { id: 'k-baekje', track: 'korea', year: -18, label: '백제', en: 'Baekje',
      state: '백제', theme: '정치', kind: 'turning', sub: 1,
      body: '고구려에서 내려온 부여·고구려계 유이민(온조)과 한강 유역의 토착 세력이 결합하여 위례성에서 백제를 건국. 주요 사건: 백제 멸망(660).' },
    { id: 'k-gaya', track: 'korea', year: 42, label: '가야', en: 'Gaya',
      state: '가야', theme: '정치', kind: 'turning', sub: 3,
      body: '낙동강 하류 김해 일대에 여러 소국이 가야 연맹을 이루었고, 초기에는 김수로왕의 금관가야가 연맹을 이끌었다. 풍부한 철 생산과 해상 교역으로 번성. 주요 사건: 가야 멸망(562).' },
    { id: 'k-okjeo-fall', track: 'korea', year: 80, yearLabel: '1세기 후반 CE', label: '옥저 멸망', en: 'Fall of Okjeo',
      state: '옥저', theme: '정치', kind: 'event', noSync: true,
      body: '고구려 태조왕이 옥저를 복속시켰다.' },
    { id: 'k-dongye-sub', track: 'korea', year: 175, yearLabel: '2세기 후반 CE', label: '동예 복속', en: 'Subjugation of Dongye',
      state: '동예', theme: '정치', kind: 'event', noSync: true,
      body: '동예가 고구려에 복속되었다. 동예는 고구려의 간섭으로 정치적으로 크게 성장하지 못하였다.' },
    { id: 'k-buyeo-fall', track: 'korea', year: 494, label: '부여 멸망', en: 'Fall of Buyeo',
      state: '부여', theme: '정치', kind: 'event', noSync: true,
      body: '부여 왕실이 고구려에 투항하면서 부여가 소멸하였다(494, 고구려 문자명왕 때).' },
    // 삼국 시대 — 한국 줄기 포커스에서만 보이는 왕·사건 노드 (focusOnly). 갈래 sub: 0 고구려 · 1 백제 · 없음 신라 · 3 가야
    { id: 'k-taejo', track: 'korea', year: 53, yearLabel: '53~146 CE', label: '태조왕', en: 'King Taejo',
      state: '고구려', theme: '정치', kind: 'turning', sub: 0, focusOnly: true,
      body: '1세기 후반 옥저를 복속시키고 한 군현을 공격하면서 왕권을 강화하였다.' },
    { id: 'k-gogukcheon', track: 'korea', year: 179, yearLabel: '179~197 CE', label: '고국천왕', en: 'King Gogukcheon',
      state: '고구려', theme: '사회', kind: 'turning', sub: 0, focusOnly: true,
      body: '진대법을 실시하여(194) 봄에 곡식을 빌려주고 수확한 뒤 갚게 하였다.' },
    { id: 'k-gaya-early', track: 'korea', year: 200, yearLabel: '2~4세기 CE', label: '전기 가야 연맹', en: 'Early Gaya Confederacy',
      state: '가야', theme: '정치', kind: 'turning', sub: 3, focusOnly: true,
      body: '김해의 금관가야가 연맹을 이끌었다. 질 좋은 철을 생산·수출하며 주변 지역과 활발히 교류하였다.' },
    { id: 'k-goi', track: 'korea', year: 234, yearLabel: '234~286 CE', label: '고이왕', en: 'King Goi',
      state: '백제', theme: '정치', kind: 'turning', sub: 1, focusOnly: true,
      body: '관등제를 정비하고 등급별로 관복의 색깔을 정하였으며, 마한을 이끌던 목지국을 병합하여 한강 유역 대부분을 차지하였다.' },
    { id: 'k-micheon', track: 'korea', year: 300, yearLabel: '300~331 CE', label: '미천왕', en: 'King Micheon',
      state: '고구려', theme: '군사', kind: 'turning', sub: 0, focusOnly: true,
      body: '낙랑군을 공격하여 한반도에서 몰아냈다(313).' },
    { id: 'k-gogugwon', track: 'korea', year: 331, yearLabel: '331~371 CE', label: '고국원왕', en: 'King Gogugwon',
      state: '고구려', theme: '군사', kind: 'turning', sub: 0, focusOnly: true,
      body: '전연의 침입으로 국내성이 함락되었고, 백제 근초고왕의 평양성 공격으로 전사하였다(371).' },
    { id: 'k-geunchogo', track: 'korea', year: 346, yearLabel: '346~375 CE', label: '근초고왕', en: 'King Geunchogo',
      state: '백제', theme: '군사', kind: 'turning', sub: 1, focusOnly: true,
      body: '마한의 남은 세력을 공격하고 가야에 영향력을 행사하였으며, 고구려의 평양성을 공격하여 고국원왕을 전사시켰다. 동진·왜와 교류하였다.' },
    { id: 'k-naemul', track: 'korea', year: 356, yearLabel: '356~402 CE', label: '내물왕', en: 'King Naemul',
      state: '신라', theme: '정치', kind: 'turning', focusOnly: true,
      body: '김씨의 왕위 세습을 확립하고 왕의 칭호로 ‘마립간’을 사용하였다. 왜와 가야의 침입을 물리치려 광개토 대왕의 도움을 받았다.' },
    { id: 'k-sosurim', track: 'korea', year: 371, yearLabel: '371~384 CE', label: '소수림왕', en: 'King Sosurim',
      state: '고구려', theme: '정치', kind: 'turning', sub: 0, focusOnly: true,
      body: '불교를 받아들이고 태학을 세웠으며, 율령을 반포하여 국가 체제를 정비하였다.' },
    { id: 'k-chimnyu', track: 'korea', year: 384, yearLabel: '384~385 CE', label: '침류왕', en: 'King Chimnyu',
      state: '백제', theme: '종교', kind: 'turning', sub: 1, focusOnly: true,
      body: '동진에서 불교를 받아들였다.' },
    { id: 'k-gwanggaeto', track: 'korea', year: 391, yearLabel: '391~412 CE', label: '광개토 대왕', en: 'King Gwanggaeto the Great',
      state: '고구려', theme: '군사', kind: 'turning', sub: 0, focusOnly: true,
      body: '백제를 공격하여 한강 이북을 점령하고 만주 대부분을 차지하였으며, 신라에 침입한 왜를 물리쳤다(400).' },
    { id: 'k-jangsu', track: 'korea', year: 412, yearLabel: '412~491 CE', label: '장수왕', en: 'King Jangsu',
      state: '고구려', theme: '군사', kind: 'turning', sub: 0, focusOnly: true,
      body: '평양으로 수도를 옮기고(427) 남진 정책을 펼쳐 백제의 한성을 함락하고 한강 유역 전체를 차지하였다.' },
    { id: 'k-gaero', track: 'korea', year: 455, yearLabel: '455~475 CE', label: '개로왕', en: 'King Gaero',
      state: '백제', theme: '군사', kind: 'turning', sub: 1, focusOnly: true,
      body: '북위에 고구려를 칠 군대를 요청하였으나 거절당하였고, 장수왕의 공격으로 한성이 함락될 때 사로잡혀 죽었다(475).' },
    { id: 'k-gaya-late', track: 'korea', year: 470, yearLabel: '5세기 후반 CE', label: '후기 가야 연맹', en: 'Late Gaya Confederacy',
      state: '가야', theme: '정치', kind: 'turning', sub: 3, focusOnly: true,
      body: '금관가야가 약해진 뒤 고령의 대가야가 가야를 주도하는 세력으로 성장하였다. 대가야는 신라 진흥왕에게 정복되었다(562).' },
    { id: 'k-geumgwan-merge', track: 'korea', year: 532, label: '금관가야 병합', en: 'Annexation of Geumgwan Gaya',
      state: '가야', theme: '군사', kind: 'event', noSync: true, sub: 3, focusOnly: true,
      body: '신라 법흥왕이 금관가야를 병합하였다(532).' },
    { id: 'k-daegaya-fall', track: 'korea', year: 562, label: '대가야 정복', en: 'Conquest of Daegaya',
      state: '가야', theme: '군사', kind: 'event', noSync: true, sub: 3, focusOnly: true,
      body: '신라 진흥왕이 고령의 대가야를 정복하였다(562).' },
    { id: 'k-munju', track: 'korea', year: 475, yearLabel: '475~477 CE', label: '문주왕', en: 'King Munju',
      state: '백제', theme: '정치', kind: 'turning', sub: 1, focusOnly: true,
      body: '고구려에 한성을 빼앗긴 뒤 웅진(공주)으로 수도를 옮겼다(475).' },
    { id: 'k-jijeung', track: 'korea', year: 500, yearLabel: '500~514 CE', label: '지증왕', en: 'King Jijeung',
      state: '신라', theme: '정치', kind: 'turning', focusOnly: true,
      body: '나라 이름을 ‘신라’로 정하고 ‘국왕’ 칭호를 사용하였으며, 우산국을 복속시켰다(512).' },
    { id: 'k-muryeong', track: 'korea', year: 501, yearLabel: '501~523 CE', label: '무령왕', en: 'King Muryeong',
      state: '백제', theme: '정치', kind: 'turning', sub: 1, focusOnly: true,
      body: '웅진으로 수도를 옮긴 뒤 무령왕을 거치면서 백제가 국력을 회복하였다.' },
    { id: 'k-beopheung', track: 'korea', year: 514, yearLabel: '514~540 CE', label: '법흥왕', en: 'King Beopheung',
      state: '신라', theme: '정치', kind: 'turning', focusOnly: true,
      body: '율령을 반포하고 불교를 공인하여 중앙 집권 체제를 확립하였다. 독자적 연호 ‘건원’을 사용하고 금관가야를 병합하였다(532).' },
    { id: 'k-seong', track: 'korea', year: 523, yearLabel: '523~554 CE', label: '성왕', en: 'King Seong',
      state: '백제', theme: '정치', kind: 'turning', sub: 1, focusOnly: true,
      body: '사비(부여)로 수도를 옮기고 신라와 연합하여 한강 하류 지역을 일시적으로 되찾았으나 신라에 다시 빼앗겼다. 신라와 싸우다 전사하였다(554).' },
    { id: 'k-jinheung', track: 'korea', year: 540, yearLabel: '540~576 CE', label: '진흥왕', en: 'King Jinheung',
      state: '신라', theme: '군사', kind: 'turning', focusOnly: true,
      body: '화랑도를 국가적 조직으로 개편하고, 한강 상류와 하류 지역을 차지하였으며, 대가야를 정복하였다(562).' },
    { id: 'k-goguryeo-sui', track: 'korea', year: 598, yearLabel: '598~614 CE', label: '고구려-수 전쟁', en: 'Goguryeo–Sui Wars',
      state: '고구려', theme: '군사', kind: 'turning', sub: 0, focusOnly: true,
      body: '중국을 통일한 수가 여러 차례 고구려를 공격하였으나 모두 물리쳤다. 612년 을지문덕이 살수에서 수의 대군을 크게 물리쳤다(살수 대첩).' },
    { id: 'k-goguryeo-tang', track: 'korea', year: 645, label: '고구려-당 전쟁', en: 'Goguryeo–Tang War',
      state: '고구려', theme: '군사', kind: 'turning', sub: 0, focusOnly: true,
      body: '수를 이어 중국을 통일한 당이 여러 차례 고구려를 침입하였으나, 고구려는 안시성 전투(645) 등에서 당의 군대를 물리쳤다.' },
    { id: 'k-baekje-fall', track: 'korea', year: 660, label: '백제 멸망', en: 'Fall of Baekje',
      state: '백제', theme: '군사', kind: 'event', noSync: true, sub: 1, focusOnly: true,
      body: '나당 연합군이 지배층의 분열로 혼란한 백제를 공격하여 멸망시켰다(660).' },
    { id: 'k-goguryeo-fall', track: 'korea', year: 668, label: '고구려 멸망', en: 'Fall of Goguryeo',
      state: '고구려', theme: '군사', kind: 'event', noSync: true, sub: 0, focusOnly: true,
      body: '연개소문이 죽은 뒤 내분으로 혼란하던 고구려를 나당 연합군이 공격하여 멸망시켰다(668).' },
    { id: 'k-nadang', track: 'korea', year: 670, yearLabel: '670~676 CE', label: '나당 전쟁', en: 'Silla–Tang War',
      state: '신라', theme: '군사', kind: 'turning', focusOnly: true,
      body: '한반도 전체를 장악하려는 당에 맞서 신라가 전쟁에 나서 매소성·기벌포 전투에서 이기고 당군을 몰아내어 삼국을 통일하였다(676).' },
    { id: 'k-era-samguk', track: 'korea', year: 300, yearLabel: '57 BCE~676 CE', label: '삼국 시대', en: 'Three Kingdoms Period',
      state: '삼국', theme: '정치', kind: 'event', hidden: true,
      body: '고구려·백제·신라가 가야와 함께 성장하여 중앙 집권적 고대 국가로 발전하고, 한강 유역을 두고 경쟁한 시대. 신라가 나당 전쟁에서 이겨 삼국을 통일하면서(676) 끝났다.' },
    { id: 'k-unify', track: 'korea', year: 676, label: '통일신라', en: 'Unified Silla',
      state: '통일신라', theme: '정치', kind: 'turning',
      body: '문무왕이 매소성·기벌포 전투에서 당군을 축출하고 대동강 이남을 통일. 통일신라 시대 개막. 주요 사건: 신라 멸망(935).' },
    { id: 'k-balhae', track: 'korea', year: 698, label: '발해', en: 'Balhae',
      state: '발해', theme: '정치', kind: 'turning',
      // 위험 노드 — 대응반 접속 시 적색으로 노출. 역사를 왜곡하려는 세력 LUMINA의 표적
      risk: {
        by: 'LUMINA', kind: '동북 공정', level: 'HIGH',
        note: 'LUMINA가 동북 공정의 논리를 앞세워 발해를 한국사에서 떼어내 중국의 지방 정권으로 기록을 바꾸려는 왜곡 시도가 탐지되었다.',
        evidence: '고구려 계승 의식 — 무왕의 국서(「고구려의 옛 땅을 회복하고 부여의 풍속을 이었다」), 문왕이 일본에 보낸 국서의 「고려국왕」 칭호, 굴식 돌방무덤·모줄임천장(정혜공주 묘)과 온돌.'
      },
      body: '고구려 장수 출신 대조영이 고구려 유민과 말갈인을 이끌고 동모산에서 건국. 고구려 계승을 내세웠고, 선왕 때 「해동성국」이라 불렸다. 926년 거란에 멸망.' },
    // ── 중세 · 고려 (918 ~ 1392) — 동아출판 한국사1 단원 도입 연표 ──
    { id: 'k-goryeo', track: 'korea', year: 918, label: '고려', en: 'Goryeo',
      state: '고려', theme: '정치', kind: 'turning',
      body: '송악(개성)의 호족 출신 왕건이 신하들의 추대로 왕위에 올랐다. 고구려를 계승한다는 뜻으로 나라 이름을 ‘고려’라 하였다. 주요 사건: 후삼국 통일(936) · 노비안검법(956) · 과거제 실시(958) · 12목 설치(983) · 거란의 1차 침입(993) · 귀주 대첩(1019) · 이자겸의 난(1126) · 묘청의 난(1135) · 무신 정변(1170) · 만적의 난(1198) · 몽골의 침입(1231) · 강화 천도(1232) · 팔만대장경 완성(1251) · 개경 환도·삼별초 항쟁(1270) · 공민왕의 반원 개혁(1356) · 위화도 회군(1388).' },
    { id: 'k-balhae-fall', track: 'korea', year: 926, label: '발해 멸망', en: 'Fall of Balhae',
      state: '발해', theme: '군사', kind: 'event', noSync: true,
      body: '발해가 거란에 멸망하였다(926). 고려는 발해 유민을 적극적으로 받아들였다.' },
    { id: 'k-silla-fall', track: 'korea', year: 935, label: '신라 멸망', en: 'Fall of Silla',
      state: '신라', theme: '정치', kind: 'event', noSync: true,
      body: '고려에 맞서기 어렵다고 판단한 신라의 경순왕이 고려에 항복하였다(935).' },
    // 고려 — 한국 줄기 포커스에서만 보이는 왕·사건 노드 (focusOnly)
    { id: 'k-gr-taejo', track: 'korea', year: 918, yearLabel: '918~943 CE', label: '태조', en: 'Taejo of Goryeo',
      state: '고려', theme: '정치', kind: 'turning', focusOnly: true,
      body: '호족 포섭(혼인·왕씨 성 하사)과 기인 제도·사심관으로 호족을 견제하고, 고구려 계승을 내세워 북진 정책을 펼쳤다. 후삼국을 통일하였다(936).' },
    { id: 'k-gr-gwangjong', track: 'korea', year: 949, yearLabel: '949~975 CE', label: '광종', en: 'Gwangjong',
      state: '고려', theme: '정치', kind: 'turning', focusOnly: true,
      body: '노비안검법과 과거제를 실시하고 공신과 호족을 숙청하여 왕권을 강화하였다. ‘광덕’·‘준풍’ 독자적 연호를 사용하였다.' },
    { id: 'k-gr-seongjong', track: 'korea', year: 981, yearLabel: '981~997 CE', label: '성종', en: 'Seongjong of Goryeo',
      state: '고려', theme: '정치', kind: 'turning', focusOnly: true,
      body: '최승로의 시무 28조를 받아들여 유교를 바탕으로 통치 체제를 정비하였다. 2성 6부, 12목 설치.' },
    { id: 'k-gr-khitan', track: 'korea', year: 993, yearLabel: '993~1019 CE', label: '고려-거란 전쟁', en: 'Goryeo–Khitan Wars',
      state: '고려', theme: '군사', kind: 'turning', focusOnly: true,
      body: '거란이 세 차례 침입하였다. 서희의 외교 담판으로 강동 6주를 확보하였고(993), 강감찬이 귀주 대첩에서 거란군을 격파하였다(1019).' },
    { id: 'k-gr-jurchen', track: 'korea', year: 1107, yearLabel: '12세기 CE', label: '여진의 침략', en: 'Jurchen Incursions',
      state: '고려', theme: '군사', kind: 'turning', focusOnly: true,
      body: '12세기 여진과 자주 충돌하자 윤관의 건의로 별무반을 편성하고 동북 9성을 쌓았으나 돌려주었다. 이후 금이 군신 관계를 요구하자 이자겸 등이 받아들였다.' },
    { id: 'k-gr-yijagyeom', track: 'korea', year: 1126, label: '이자겸의 난', en: 'Rebellion of Yi Ja-gyeom',
      state: '고려', theme: '정치', kind: 'turning', focusOnly: true,
      body: '예종과 인종에게 딸을 시집보내 권력을 독점한 이자겸이 인종의 제거 시도에 맞서 반란을 일으켰다(1126).' },
    { id: 'k-gr-myocheong', track: 'korea', year: 1135, label: '묘청의 서경 천도 운동', en: 'Myocheong\'s Movement to Move the Capital',
      state: '고려', theme: '정치', kind: 'turning', focusOnly: true,
      body: '묘청 등 서경 세력이 풍수지리설을 내세워 서경 천도를 주장하다 무산되자 서경에서 반란을 일으켰다(1135). 김부식이 이끄는 관군이 진압하였다.' },
    { id: 'k-gr-musin', track: 'korea', year: 1170, label: '무신 정변', en: 'Military Coup of 1170',
      state: '고려', theme: '정치', kind: 'turning', focusOnly: true,
      body: '문신 중심 정치와 차별에 불만을 품은 이의방, 정중부 등이 정변을 일으켜 정권을 잡았다(1170). 이후 최씨 정권이 4대 60여 년간 이어졌다.' },
    { id: 'k-gr-mongol', track: 'korea', year: 1231, yearLabel: '1231~1270 CE', label: '고려-몽골 전쟁', en: 'Goryeo–Mongol War',
      state: '고려', theme: '군사', kind: 'turning', focusOnly: true,
      body: '몽골이 침입하자(1231) 강화도로 수도를 옮겨 항전하였다(1232). 처인성·충주성 등에서 하층민까지 저항하였으나, 강화 후 개경으로 환도하였다(1270).' },
    { id: 'k-gr-yuan', track: 'korea', year: 1270, yearLabel: '1270~1356 CE', label: '원 간섭기', en: 'Period of Yuan Interference',
      state: '고려', theme: '외교', kind: 'turning', focusOnly: true,
      body: '강화 이후 원의 간섭을 받았다. 정동행성을 통한 내정 간섭, 공물·공녀 요구, 쌍성총관부 설치가 이어졌고, 권문세족이 등장하였다.' },
    { id: 'k-gr-gongmin', track: 'korea', year: 1351, yearLabel: '1351~1374 CE', label: '공민왕', en: 'Gongmin of Goryeo',
      state: '고려', theme: '정치', kind: 'turning', focusOnly: true,
      body: '원이 쇠퇴하자 반원 개혁을 추진하였다. 기철 등 친원 세력 제거, 쌍성총관부 수복(1356), 신돈 등용과 전민변정도감 설치(1366).' },
    { id: 'k-gr-decline', track: 'korea', year: 1380, yearLabel: '14세기 후반 CE', label: '고려의 쇠퇴', en: 'Decline of Goryeo',
      state: '고려', theme: '정치', kind: 'turning', focusOnly: true,
      body: '공민왕의 개혁은 홍건적과 왜구의 침입, 권문세족의 반발로 중단되었다. 신진 사대부와 이성계 등 신흥 무인 세력이 성장하였다.' },
    // ── 근세 · 조선 전기 (1392 ~ 양 난) ──
    { id: 'k-joseon', track: 'korea', year: 1392, label: '조선', en: 'Joseon',
      state: '조선', theme: '정치', kind: 'turning',
      // 위험 노드 — 식민 사관 (대동법·숙종 환국 노드에서 옮김, 2026-10-06)
      risk: {
        by: 'LUMINA',
        kind: '식민 사관',
        level: 'MID',
        note: 'LUMINA가 조선 후기 사회를 정체성론(발전하지 못하고 정체되어 있었다)과 당파성론(늘 분열하여 당파를 만들고 싸웠다)으로 바꾸려 하고 있다.',
        evidence: '대동법 실시로 공인이 등장하고 상품 화폐 경제가 발달하였으며 상평통보가 널리 쓰였다. 백남운 등 사회경제 사학자는 한국사가 세계사적 보편성에 따라 발전하였다고 주장하여 정체성론을 반박하였다. 당파성론은 일제가 식민 통치를 정당화하려고 만든 식민 사관이다. 붕당 정치는 여러 붕당이 서로 비판하고 견제하며 정치를 운영한 방식이었고, 영조와 정조는 탕평책으로 그 변질을 바로잡으려 하였다.'
      },
      body: '이성계가 신진 사대부와 함께 조선을 건국하였다. 과전법(1391)으로 경제 기반을 마련하고 한양으로 천도하였다(1394). 주요 사건: 호패법 실시(1413) · 훈민정음 창제(1443) · 직전법 실시(1466) · 『경국대전』 반포(1485) · 백운동 서원 건립(1543) · 임진왜란(1592) · 대동법 실시(1608) · 인조반정(1623) · 병자호란(1636) · 숙종 즉위·환국(1674) · 백두산정계비(1712) · 영조 즉위·탕평책(1724) · 균역법 실시(1750) · 정조 즉위(1776) · 공노비 해방(1801) · 홍경래의 난(1811).' },
    { id: 'k-goryeo-fall', track: 'korea', year: 1392, label: '고려 멸망', en: 'Fall of Goryeo',
      state: '고려', theme: '정치', kind: 'event', noSync: true,
      body: '급진 개혁파 신진 사대부가 이성계를 왕으로 추대하여 새 왕조를 세우면서 고려가 멸망하였다(1392).' },
    // 조선 — 한국 줄기 포커스에서만 보이는 왕·사건 노드 (focusOnly)
    { id: 'k-js-taejo', track: 'korea', year: 1392, yearLabel: '1392~1398 CE', label: '태조', en: 'Taejo of Joseon',
      state: '조선', theme: '정치', kind: 'turning', focusOnly: true,
      body: '이성계가 신진 사대부의 추대로 조선을 세우고 한양으로 수도를 옮겼다(1394). 정도전이 성리학 이념으로 통치 체제를 정비하였다.' },
    { id: 'k-js-taejong', track: 'korea', year: 1400, yearLabel: '1400~1418 CE', label: '태종', en: 'Taejong',
      state: '조선', theme: '정치', kind: 'turning', focusOnly: true,
      body: '이방원(태종)은 정도전을 제거하고 왕위에 오른 뒤 6조 직계제를 실시하여 왕을 중심으로 통치 체제를 정비하였다.' },
    { id: 'k-js-sejong', track: 'korea', year: 1418, yearLabel: '1418~1450 CE', label: '세종', en: 'Sejong the Great',
      state: '조선', theme: '문화', kind: 'turning', focusOnly: true,
      body: '의정부 서사제로 왕권과 신권의 조화를 꾀하고, 집현전을 두어 유교 정치를 실현하려 하였다. 훈민정음을 창제하였다(1443).' },
    { id: 'k-js-sejo', track: 'korea', year: 1455, yearLabel: '1455~1468 CE', label: '세조', en: 'Sejo',
      state: '조선', theme: '정치', kind: 'turning', focusOnly: true,
      body: '단종의 왕위를 빼앗고 즉위하였다. 『경국대전』 편찬을 시작하였고, 현직 관리에게만 수조권을 주는 직전법을 실시하였다(1466).' },
    { id: 'k-js-seongjong', track: 'korea', year: 1469, yearLabel: '1469~1494 CE', label: '성종', en: 'Seongjong of Joseon',
      state: '조선', theme: '정치', kind: 'turning', focusOnly: true,
      body: '『경국대전』을 반포하여(1485) 성문법에 바탕을 둔 통치 체제를 확립하였다. 김종직 등 사림을 등용하여 훈구를 견제하였다.' },
    { id: 'k-js-hungu-sarim', track: 'korea', year: 1480, yearLabel: '15세기 후반 CE', label: '훈구와 사림의 대립', en: 'Hungu–Sarim Conflict',
      state: '조선', theme: '정치', kind: 'turning', focusOnly: true,
      body: '15세기 중엽 정치권력을 장악한 훈구를 견제하려 성종이 사림을 등용하였다. 사림은 3사에서 훈구의 부정과 비리를 비판하였다.' },
    { id: 'k-js-muo', track: 'korea', year: 1498, label: '무오사화', en: 'Literati Purge of 1498',
      state: '조선', theme: '정치', kind: 'turning', focusOnly: true,
      body: '김일손이 사초에 스승 김종직의 「조의제문」을 실은 것을 구실로 훈구가 사림을 공격하였다(1498).' },
    { id: 'k-js-gapja', track: 'korea', year: 1504, label: '갑자사화', en: 'Literati Purge of 1504',
      state: '조선', theme: '정치', kind: 'turning', focusOnly: true,
      body: '연산군 때 두 번째 사화가 일어나 사림이 큰 피해를 입었다(1504). 이후 중종반정으로 연산군이 쫓겨났다(1506).' },
    { id: 'k-js-gimyo', track: 'korea', year: 1519, label: '기묘사화', en: 'Literati Purge of 1519',
      state: '조선', theme: '정치', kind: 'turning', focusOnly: true,
      body: '현량과 실시·공신 칭호 박탈 등 조광조의 급격한 개혁에 공신들이 반발하여 조광조 등 사림이 제거되었다(1519).' },
    { id: 'k-js-eulsa', track: 'korea', year: 1545, label: '을사사화', en: 'Literati Purge of 1545',
      state: '조선', theme: '정치', kind: 'turning', focusOnly: true,
      body: '명종 때 외척 사이의 다툼에 휘말려 사림이 피해를 입었다(1545).' },
    { id: 'k-js-imjin', track: 'korea', year: 1592, label: '임진왜란', en: 'Imjin War',
      state: '조선', theme: '군사', kind: 'turning', focusOnly: true,
      body: '일본을 통일한 도요토미 히데요시가 조선을 침략하였다(1592). 이순신의 수군과 의병, 명의 지원군이 일본군에 맞섰다.' },
    { id: 'k-js-jeongyu', track: 'korea', year: 1597, label: '정유재란', en: 'Second Japanese Invasion',
      state: '조선', theme: '군사', kind: 'turning', focusOnly: true,
      body: '3년에 걸친 휴전 협상이 결렬되자 일본군이 다시 침입하였다(1597). 도요토미 히데요시가 죽자 일본군이 물러나 7년 전쟁이 끝났다(1598).' },
    { id: 'k-js-gwanghae', track: 'korea', year: 1608, yearLabel: '1608~1623 CE', label: '광해군', en: 'Gwanghaegun',
      state: '조선', theme: '외교', kind: 'turning', focusOnly: true,
      body: '왜란의 피해를 극복하려 토지 대장과 호적을 정비하고 국방을 강화하였다. 명과 후금 사이에서 중립 외교를 펼쳤으나 인조반정으로 쫓겨났다(1623).' },
    { id: 'k-js-jeongmyo', track: 'korea', year: 1627, label: '정묘호란', en: 'First Manchu Invasion',
      state: '조선', theme: '군사', kind: 'turning', focusOnly: true,
      body: '명과 가까이하는 조선을 후금이 침략하였다(1627). 인조는 강화도로 피란하였고, 후금은 형제 관계를 맺고 돌아갔다.' },
    { id: 'k-js-byeongja', track: 'korea', year: 1636, label: '병자호란', en: 'Second Manchu Invasion',
      state: '조선', theme: '군사', kind: 'turning', focusOnly: true,
      body: '청이 군신 관계를 강요하였고, 척화론이 우세한 조선이 거부하자 청이 침략하였다(1636). 인조는 남한산성에서 맞섰으나 청에 굴복하였다.' },
    { id: 'k-js-yesong', track: 'korea', year: 1659, yearLabel: '1659·1674 CE', label: '예송', en: 'Rites Controversies',
      state: '조선', theme: '정치', kind: 'turning', focusOnly: true,
      body: '현종 때 효종과 효종 왕비의 상에 효종의 새어머니가 상복을 얼마 동안 입느냐를 두고 두 차례 논쟁이 일어났다. 붕당 정치가 변질되기 시작하였다.' },
    { id: 'k-js-hwanguk', track: 'korea', year: 1680, yearLabel: '1674~1720 CE', label: '환국', en: 'Hwanguk (Changes of Ruling Faction)',
      state: '조선', theme: '정치', kind: 'turning', focusOnly: true,
      body: '숙종은 붕당을 누르고 왕권을 강화하려 집권 붕당을 바꾸는 환국을 여러 차례 일으켰다. 붕당 정치의 공존 원칙이 무너졌다.' },
    { id: 'k-js-yeongjo', track: 'korea', year: 1724, yearLabel: '1724~1776 CE', label: '영조', en: 'Yeongjo',
      state: '조선', theme: '정치', kind: 'turning', focusOnly: true,
      body: '탕평책에 따르는 사람들을 중심으로 정치를 운영하고 탕평비를 세웠다. 산림의 존재를 부정하고 서원의 수를 줄였다.' },
    { id: 'k-js-jeongjo', track: 'korea', year: 1776, yearLabel: '1776~1800 CE', label: '정조', en: 'Jeongjo',
      state: '조선', theme: '정치', kind: 'turning', focusOnly: true,
      body: '노론뿐 아니라 남인과 소론을 포용하는 적극적인 탕평책을 펼쳤다. 규장각 확대, 초계문신제, 장용영 설치, 수원 화성 건설.' },
    { id: 'k-js-sedo', track: 'korea', year: 1800, yearLabel: '1800~1863 CE', label: '세도 정치 시기', en: 'Sedo Politics',
      state: '조선', theme: '정치', kind: 'turning', focusOnly: true,
      body: '순조가 어린 나이로 즉위한 뒤 안동 김씨 등 소수 가문이 철종 때까지 60여 년간 권력을 독점하였다. 삼정이 문란해지고 농민 봉기가 잇따랐다.' },
    // ── 근대 태동기 · 조선 후기 (양 난 이후 ~ 개항 전) ──
    { id: 'k-donghak', track: 'korea', year: 1860, label: '동학 창시', en: 'Founding of Donghak',
      state: '조선', theme: '종교', kind: 'event', noSync: true,
      body: '최제우가 동학을 창시하였다. ‘시천주’ 사상으로 모든 사람이 평등하다고 주장하여 농민층에 널리 퍼졌다.' },
    { id: 'k-imsul', track: 'korea', year: 1862, label: '임술 농민 봉기', en: 'Imsul Peasant Uprising',
      state: '조선', theme: '사회', kind: 'turning',
      body: '삼정의 문란에 맞서 단성·진주를 시작으로 전국에서 농민이 봉기하였다. 정부는 삼정이정청을 설치하였다.' },
    { id: 'k-daewongun', track: 'korea', year: 1863, label: '흥선 대원군 집권', en: 'Heungseon Daewongun',
      state: '조선', theme: '정치', kind: 'turning',
      body: '고종이 즉위하고 흥선 대원군이 집권하여 경복궁 중건, 호포제 실시, 서원 철폐 등 왕권 강화 정책을 폈다.' },
    { id: 'k-sinmi', track: 'korea', year: 1871, label: '신미양요', en: 'Sinmiyangyo',
      state: '조선', theme: '군사', kind: 'turning',
      body: '제너럴 셔먼호 사건을 구실로 미국 군대가 강화도를 침략하였다. 이후 흥선 대원군은 척화비를 세웠다.' },
    // ── 근대 · 개항(1876) 이후 — 동아출판 한국사1 Ⅲ단원 · 한국사2 Ⅰ단원 ──
    { id: 'k-ganghwa-treaty', track: 'korea', year: 1876, label: '강화도 조약', en: 'Treaty of Ganghwa',
      state: '조선', theme: '외교', kind: 'turning',
      body: '운요호 사건 이후 일본과 강화도 조약(조·일 수호 조규)을 맺고 개항하였다. 조선이 맺은 최초의 근대적 조약이자 불평등 조약이었다.' },
    { id: 'k-imo', track: 'korea', year: 1882, label: '임오군란', en: 'Imo Incident',
      state: '조선', theme: '정치', kind: 'turning',
      body: '구식 군인들이 차별 대우에 반발하여 봉기하였다. 청은 군대를 보내 진압한 뒤 조선의 내정과 외교에 간섭하였다.' },
    { id: 'k-gapsin', track: 'korea', year: 1884, label: '갑신정변', en: 'Gapsin Coup',
      state: '조선', theme: '정치', kind: 'turning',
      body: '급진 개화파가 우정총국 개국 축하연에서 정변을 일으켰으나 청군의 개입으로 삼일천하로 끝났다.' },
    { id: 'k-donghak-rev', track: 'korea', year: 1894, label: '동학 농민 운동', en: 'Donghak Peasant Revolution',
      state: '조선', theme: '사회', kind: 'turning',
      body: '전봉준 등이 ‘제폭구민’, ‘보국안민’을 내세우며 봉기하였다. 농민군의 폐정 개혁 요구는 갑오개혁에 일부 반영되었다.' },
    { id: 'k-gabo', track: 'korea', year: 1894, label: '갑오개혁', en: 'Gabo Reform',
      state: '조선', theme: '정치', kind: 'turning',
      body: '군국기무처를 설치하고 정치·경제·사회 전반에 걸친 근대적 개혁을 추진하였다.' },
    { id: 'k-agwan', track: 'korea', year: 1896, label: '아관 파천', en: 'Royal Refuge at the Russian Legation',
      state: '조선', theme: '외교', kind: 'turning',
      body: '을미사변 이후 고종이 러시아 공사관으로 거처를 옮겼다.' },
    { id: 'k-korean-empire', track: 'korea', year: 1897, label: '대한 제국 수립', en: 'Korean Empire',
      state: '대한 제국', theme: '정치', kind: 'turning',
      body: '경운궁으로 돌아온 고종이 연호를 ‘광무’로 정하고 황제로 즉위하여 대한 제국 수립을 선포하였다.' },
    { id: 'k-russo-japan', track: 'korea', year: 1904, label: '러·일 전쟁', en: 'Russo-Japanese War',
      state: '대한 제국', theme: '외교', kind: 'event', noSync: true,
      // 위험 노드 — 일본의 역사 왜곡
      risk: {
        by: 'LUMINA', kind: '일본의 역사 왜곡', level: 'HIGH',
        note: 'LUMINA가 러·일 전쟁 중 일본의 독도 불법 편입을 정당한 영토 편입으로 기록을 바꾸려 하고 있다.',
        evidence: '대한 제국은 칙령 제41호(1900)로 울릉도와 독도의 관할을 분명히 하였다. 광복 이후 연합국 최고 사령관 각서 제677호(1946)는 독도를 일본의 통치 범위에서 제외하였다.'
      },
      body: '한반도와 만주를 둘러싸고 러시아와 일본이 전쟁을 벌였다. 일본은 전쟁 중에 독도를 불법으로 편입하였다.' },
    { id: 'k-eulsa', track: 'korea', year: 1905, label: '을사늑약', en: 'Eulsa Treaty',
      state: '대한 제국', theme: '외교', kind: 'turning',
      body: '일본이 을사5적을 앞세워 을사늑약을 강요하였다. 대한 제국은 외교권을 빼앗기고 통감부가 설치되었다.' },
    { id: 'k-gukchae', track: 'korea', year: 1907, label: '국채 보상 운동', en: 'National Debt Repayment Movement',
      state: '대한 제국', theme: '경제', kind: 'turning',
      body: '일본에 진 빚을 국민의 힘으로 갚아 경제 자립을 이루자는 운동이 대구에서 시작되어 전국으로 퍼졌다.' },
    { id: 'k-annexation', track: 'korea', year: 1910, label: '국권 피탈', en: 'Japanese Annexation',
      state: '일제 강점기', theme: '정치', kind: 'turning',
      // 위험 노드 — 식민 사관
      risk: {
        by: 'LUMINA', kind: '식민 사관', level: 'HIGH',
        note: 'LUMINA가 한국사는 외세의 간섭으로만 이루어졌다는 타율성론을 앞세워 국권 피탈과 식민 통치를 정당화하려 하고 있다.',
        evidence: '일제는 식민 통치를 정당화하기 위해 우리 역사를 왜곡하였다(식민 사관). 을사늑약은 을사5적을 앞세워 일방적으로 강요되었으며, 신채호·박은식 등 민족주의 사학자는 민족정신을 강조하며 식민 사관에 맞섰다.'
      },
      body: '일제가 대한 제국의 국권을 강제로 빼앗고 조선 총독부를 설치하여 식민 통치를 시작하였다.' },
    { id: 'k-company-law', track: 'korea', year: 1910, label: '회사령', en: 'Company Act',
      state: '일제 강점기', theme: '경제', kind: 'turning',
      body: '회사를 설립할 때 조선 총독의 허가를 받도록 한 법령. 한국인의 자본 축적을 차단하려 하였다.' },
    { id: 'k-sinheung', track: 'korea', year: 1911, label: '신흥 강습소 설립', en: 'Sinheung Military School',
      state: '일제 강점기', theme: '군사', kind: 'turning',
      body: '이회영 형제 등 신민회 회원들이 서간도 삼원보에 세운 독립군 양성 기관. 이후 신흥 무관 학교로 개편되었다.' },
    { id: 'k-land-survey', track: 'korea', year: 1912, label: '토지 조사 사업', en: 'Land Survey Project',
      state: '일제 강점기', theme: '경제', kind: 'turning',
      body: '1912년 토지 조사령을 공포하여 전국적으로 실시. 소유권이 불분명한 토지는 조선 총독부의 소유가 되었다.' },
    { id: 'k-flogging', track: 'korea', year: 1912, label: '조선 태형령', en: 'Flogging Ordinance',
      state: '일제 강점기', theme: '사회', kind: 'turning',
      body: '1912년 일제가 제정하여 한국인에게만 적용한 법령. 태형은 헌병 경찰의 주관적 판단에 따라 집행되었다.' },
    { id: 'k-uigunbu', track: 'korea', year: 1912, label: '독립 의군부', en: 'Independence Righteous Army',
      state: '일제 강점기', theme: '정치', kind: 'turning',
      body: '임병찬이 고종의 비밀 지시를 받고 각지의 유생을 모아 조직. 복벽주의의 입장에서 의병 전쟁을 계획하였다.' },
    { id: 'k-gwangbokhoe', track: 'korea', year: 1915, label: '대한 광복회', en: 'Korean Restoration Association',
      state: '일제 강점기', theme: '정치', kind: 'turning',
      body: '박상진 등이 대구에서 조직. 국권을 회복한 뒤 공화제 정부를 세우려 하였다.' },
    { id: 'k-28', track: 'korea', year: 1919, label: '2·8 독립 선언', en: 'February 8 Declaration of Independence',
      state: '일제 강점기', theme: '정치', kind: 'turning',
      body: '1919년 2월 8일 일본에서 유학생들이 중심이 되어 독립 선언서를 발표하였다.' },
    { id: 'k-samil', track: 'korea', year: 1919, label: '3·1 운동', en: 'March 1st Movement',
      state: '일제 강점기', theme: '정치', kind: 'turning',
      body: '1919년 3월 1일 전국에서 독립 만세 운동이 일어났다. 이를 계기로 대한민국 임시 정부가 수립되고 공화주의가 독립운동의 중심 사상이 되었다.' },
    { id: 'k-provisional', track: 'korea', year: 1919, label: '대한민국 임시 정부', en: 'Provisional Government of the Republic of Korea',
      state: '일제 강점기', theme: '정치', kind: 'turning',
      body: '3·1 운동을 계기로 수립된 우리 역사 최초의 민주 공화제 정부. 여러 임시 정부를 통합하고 상하이에 위치하였다.' },
    { id: 'k-uiyeoldan', track: 'korea', year: 1919, label: '의열단', en: 'Heroic Corps',
      state: '일제 강점기', theme: '군사', kind: 'turning',
      body: '1919년 11월 김원봉, 윤세주 등이 만주에서 결성. 신채호의 조선 혁명 선언을 활동 지침으로 삼았다.' },
    { id: 'k-bongodong', track: 'korea', year: 1920, label: '봉오동 전투', en: 'Battle of Fengwudong',
      state: '일제 강점기', theme: '군사', kind: 'turning',
      body: '1920년 6월 홍범도의 대한 독립군 등 독립군 연합 부대가 봉오동 일대에서 일본군을 기습하여 크게 승리하였다.' },
    { id: 'k-cheongsanri', track: 'korea', year: 1920, label: '청산리 대첩', en: 'Battle of Qingshanli',
      state: '일제 강점기', theme: '군사', kind: 'turning',
      body: '1920년 10월 김좌진의 북로 군정서, 홍범도의 대한 독립군 등 독립군 연합 부대가 청산리 일대에서 큰 승리를 거두었다.' },
    { id: 'k-gando', track: 'korea', year: 1920, label: '간도 참변', en: 'Gando Massacre',
      state: '일제 강점기', theme: '사회', kind: 'turning',
      body: '청산리 대첩을 전후하여 일제가 간도 지역의 한국인을 학살하고 마을을 불사른 사건. 경신참변이라고도 한다.' },
    { id: 'k-sanmi', track: 'korea', year: 1920, label: '산미 증식 계획', en: 'Rice Production Plan',
      state: '일제 강점기', theme: '경제', kind: 'turning',
      // 위험 노드 — 일본의 역사 왜곡
      risk: {
        by: 'LUMINA', kind: '일본의 역사 왜곡', level: 'MID',
        note: 'LUMINA가 산미 증식 계획을 ‘한국 농업의 개발’로 미화하여 식민지 수탈을 지우려 하고 있다.',
        evidence: '산미 증식 계획으로 늘어난 생산량보다 더 많은 쌀이 일본으로 반출되어 한국 농민의 식량 사정이 나빠졌고, 비료 대금·수리 조합비 등의 부담이 커져 몰락하는 농민이 늘었다.'
      },
      body: '일제가 본국의 부족한 식량을 한국에서 확보하려고 1920년부터 실시. 한국인의 쌀 소비량은 오히려 줄어들었다.' },
    { id: 'k-mulsan', track: 'korea', year: 1920, label: '물산 장려 운동', en: 'Native Products Promotion Movement',
      state: '일제 강점기', theme: '경제', kind: 'turning',
      body: '조만식 등 민족주의 계열 인사들이 1920년 평양에서 조선 물산 장려회를 조직하고 토산품 애용 운동을 펼쳤다.' },
    { id: 'k-jayusi', track: 'korea', year: 1921, label: '자유시 참변', en: 'Free City Incident',
      state: '일제 강점기', theme: '군사', kind: 'turning',
      body: '1921년 6월 자유시로 이동한 독립군이 지휘권 다툼 속에 러시아 적군에게 강제로 무장 해제를 당하며 피해를 입었다.' },
    { id: 'k-minrip', track: 'korea', year: 1922, label: '민립 대학 설립 운동', en: 'Movement to Found a People’s University',
      state: '일제 강점기', theme: '사회', kind: 'turning',
      body: '1922년 이상재를 중심으로 조선 민립 대학 기성회를 조직하고 전국적으로 모금 운동을 펼쳤으나 실패하였다.' },
    { id: 'k-national-rep', track: 'korea', year: 1923, label: '국민 대표 회의', en: 'National Representatives Conference',
      state: '일제 강점기', theme: '정치', kind: 'turning',
      body: '1923년 독립운동의 새로운 길을 찾기 위해 열렸으나 개조파와 창조파의 대립으로 결렬되었다.' },
    { id: 'k-hyeongpyeong', track: 'korea', year: 1923, label: '형평 운동', en: 'Hyeongpyeong Movement',
      state: '일제 강점기', theme: '사회', kind: 'turning',
      body: '1923년 경남 진주에서 조선 형평사가 조직되어 백정에 대한 사회적 차별을 없애려는 형평 운동을 펼쳤다.' },
    { id: 'k-amtae', track: 'korea', year: 1923, label: '암태도 소작 쟁의', en: 'Amtae Island Tenant Dispute',
      state: '일제 강점기', theme: '사회', kind: 'turning',
      body: '1923년 전라도 암태도의 소작인들이 지주와 일본 경찰의 탄압에 맞서 소작료를 낮추는 성과를 거두었다.' },
    { id: 'k-kanto', track: 'korea', year: 1923, label: '관동 대지진', en: 'Great Kanto Earthquake',
      state: '일제 강점기', theme: '사회', kind: 'turning',
      body: '1923년 9월 1일 일본 관동 지방의 대지진 혼란 속에서 유언비어가 퍼져 많은 한국인이 학살당하였다.' },
    { id: 'k-peace-law', track: 'korea', year: 1925, label: '치안 유지법', en: 'Peace Preservation Law',
      state: '일제 강점기', theme: '정치', kind: 'turning',
      body: '1925년 일제가 제정하여 사회주의 운동과 민족 운동을 억압하는 데 이용한 법.' },
    { id: 'k-mitsuya', track: 'korea', year: 1925, label: '미쓰야 협정', en: 'Mitsuya Agreement',
      state: '일제 강점기', theme: '외교', kind: 'turning',
      body: '1925년 일제가 만주 지역 독립군을 탄압하고 국내 진공을 막기 위해 만주 펑톈성의 군벌과 맺은 협정.' },
    { id: 'k-610', track: 'korea', year: 1926, label: '6·10 만세 운동', en: 'June 10th Movement',
      state: '일제 강점기', theme: '정치', kind: 'turning',
      body: '1926년 순종의 장례일에 학생들이 격문을 뿌리며 서울 곳곳에서 만세 시위를 벌였다.' },
    { id: 'k-singanhoe', track: 'korea', year: 1927, label: '신간회 결성', en: 'Singanhoe',
      state: '일제 강점기', theme: '정치', kind: 'turning',
      body: '비타협적 민족주의자와 사회주의자가 손을 잡고 민족 유일당 운동으로 신간회를 결성하였다.' },
    { id: 'k-geunuhoe', track: 'korea', year: 1927, label: '근우회', en: 'Geunuhoe',
      state: '일제 강점기', theme: '사회', kind: 'turning',
      body: '1927년 신간회 결성에 자극을 받아 창립된 일제 강점기 최대의 여성 단체.' },
    { id: 'k-wonsan', track: 'korea', year: 1929, label: '원산 총파업', en: 'Wonsan General Strike',
      state: '일제 강점기', theme: '사회', kind: 'turning',
      body: '1929년 원산 지역 노동자가 벌인 총파업. 일제 강점기 노동 운동의 절정을 이루었으나 일제의 탄압으로 실패하였다.' },
    { id: 'k-gwangju-student', track: 'korea', year: 1929, label: '광주 학생 항일 운동', en: 'Gwangju Student Movement',
      state: '일제 강점기', theme: '사회', kind: 'turning',
      body: '광주에서 한·일 학생 간의 충돌을 계기로 일어난 학생 항일 운동이 전국으로 확산되었다.' },
    { id: 'k-vnarod', track: 'korea', year: 1931, label: '브나로드 운동', en: 'V Narod Movement',
      state: '일제 강점기', theme: '문화', kind: 'turning',
      body: '1930년대 초 『동아일보』가 ‘배우자, 가르치자, 다 함께 브나로드’라는 구호 아래 벌인 농촌 계몽 운동.' },
    { id: 'k-hanin', track: 'korea', year: 1932, label: '이봉창·윤봉길 의거', en: 'Yi Bong-chang and Yun Bong-gil',
      state: '일제 강점기', theme: '군사', kind: 'turning',
      body: '한인 애국단의 이봉창이 도쿄에서 일왕의 마차 행렬에 폭탄을 던졌고(1932. 1.), 윤봉길이 상하이 훙커우 공원에서 폭탄을 던졌다(1932. 4.).' },
    { id: 'k-minhyeok', track: 'korea', year: 1935, label: '조선 민족 혁명당', en: 'Korean National Revolutionary Party',
      state: '일제 강점기', theme: '정치', kind: 'turning',
      body: '1935년 난징에서 의열단, 조선 혁명당, 한국 독립당 등이 결성한 중국 관내 최대 규모의 민족 통일 전선 정당.' },
    { id: 'k-oath', track: 'korea', year: 1937, label: '황국 신민 서사', en: 'Oath of Imperial Subjects',
      state: '일제 강점기', theme: '사회', kind: 'turning',
      body: '일제가 한국인을 일왕에 충성하는 백성으로 만들기 위해 억지로 외우게 한 충성 맹세문.' },
    { id: 'k-mobilization', track: 'korea', year: 1938, label: '국가 총동원법', en: 'National Mobilization Law',
      state: '일제 강점기', theme: '정치', kind: 'turning',
      // 위험 노드 — 일본의 역사 왜곡
      risk: {
        by: 'LUMINA', kind: '일본의 역사 왜곡', level: 'HIGH',
        note: 'LUMINA가 강제 동원과 일본군 ‘위안부’ 동원의 강제성을 기록에서 지우려 하고 있다.',
        evidence: '일본은 침략 전쟁 과정에서 많은 한국인을 군인·노동자·일본군 ‘위안부’로 강제 동원하였다. 김학순의 공개 증언(1991)과 일본 정부의 고노 담화(1993)가 있었으나, 일본 교과서 검정 과정에서 강제 동원 서술이 삭제·축소되고 있다.'
      },
      body: '중·일 전쟁 이후 일제가 국가 총동원법을 제정하여 인력과 물자를 전쟁에 강제로 동원하였다.' },
    { id: 'k-uiyongdae', track: 'korea', year: 1938, label: '조선 의용대', en: 'Korean Volunteer Corps',
      state: '일제 강점기', theme: '군사', kind: 'turning',
      body: '1938년 조선 민족 전선 연맹 아래에 창설된, 중국 관내에서 결성한 최초의 한국인 무장 단체.' },
    { id: 'k-gwangbokgun', track: 'korea', year: 1940, label: '한국광복군 창설', en: 'Korean Liberation Army',
      state: '일제 강점기', theme: '군사', kind: 'turning',
      body: '대한민국 임시 정부가 충칭에서 정규군인 한국광복군을 창설하였다.' },
    { id: 'k-soshi', track: 'korea', year: 1940, label: '일본식 성명 강요', en: 'Forced Japanese Names',
      state: '일제 강점기', theme: '사회', kind: 'turning',
      body: '일제가 한국인의 성과 이름을 일본식으로 바꿀 것을 강요하였다. 거부한 사람은 배급에서 제외되었다.' },
    { id: 'k-founding-plan', track: 'korea', year: 1941, label: '대한민국 건국 강령', en: 'Founding Principles of the Republic of Korea',
      state: '일제 강점기', theme: '정치', kind: 'turning',
      body: '1941년 대한민국 임시 정부가 조소앙의 삼균주의에 기초하여 발표한 건국 강령.' },
    { id: 'k-joseoneo', track: 'korea', year: 1942, label: '조선어 학회 사건', en: 'Korean Language Society Incident',
      state: '일제 강점기', theme: '문화', kind: 'turning',
      body: '1942년 일제가 조선어 학회 사건을 조작하여 회원들을 체포·투옥하고 학회를 강제로 해산하였다.' },
    { id: 'k-hwabuk', track: 'korea', year: 1942, label: '화북 조선 독립 동맹', en: 'North China Korean Independence League',
      state: '일제 강점기', theme: '정치', kind: 'turning',
      body: '1942년 중국 화북 지역에서 한국인 사회주의자들이 중심이 되어 결성. 조선 의용군을 군사 조직으로 삼았다.' },
    { id: 'k-geonguk', track: 'korea', year: 1944, label: '조선 건국 동맹', en: 'Korean Founding League',
      state: '일제 강점기', theme: '정치', kind: 'turning',
      body: '1944년 국내에서 여운형이 중심이 되어 결성. 광복 이후 조선 건국 준비 위원회로 개편되었다.' },
    // 일제 강점기 통치 방식 묶음 노드 (hidden) — 묶음 이름을 누르면 기록 열람
    { id: 'k-era-mudan', track: 'korea', year: 1914, yearLabel: '1910~1919 CE', label: '무단 통치', en: 'Military Rule',
      state: '일제 강점기', theme: '정치', kind: 'event', hidden: true,
      body: '1910년대 일제의 식민 통치. 조선 총독부와 헌병 경찰을 앞세워 한국인을 억압하였다.' },
    { id: 'k-era-munhwa', track: 'korea', year: 1924, yearLabel: '1920~1929 CE', label: '‘문화 정치’', en: '“Cultural Rule”',
      state: '일제 강점기', theme: '정치', kind: 'event', hidden: true,
      body: '3·1 운동 이후 일제의 식민 통치. 보통 경찰제와 자문 기관 설치 등을 내세웠으나 실제로는 민족 분열 통치였다.' },
    { id: 'k-era-malsal', track: 'korea', year: 1937, yearLabel: '1930~1945 CE', label: '민족 말살 정책', en: 'Assimilation Policy',
      state: '일제 강점기', theme: '정치', kind: 'event', hidden: true,
      body: '중·일 전쟁 이후 침략 전쟁에 한국인을 동원하기 위해 한국인을 일본인으로 동화시키려 한 정책.' },
    // ── 현대 · 광복(1945) 이후 — 동아출판 한국사2 Ⅱ·Ⅲ단원 ──
    { id: 'k-liberation', track: 'korea', year: 1945, month: 8, label: '8·15 광복', en: 'Liberation',
      state: '광복 이후', theme: '정치', kind: 'turning',
      body: '1945년 8월 15일 일제가 무조건 항복하면서 한국은 광복을 맞이하였다. 그러나 38도선을 경계로 미·소 군정이 시작되었다.' },
    // ── 광복 ~ 정부 수립 (1945~1948) — 동아출판 한국사2 Ⅱ-1 ──
    { id: 'k-geonjun', track: 'korea', year: 1945, month: 8, label: '조선 건국 준비 위원회', en: 'Committee for the Preparation of Korean Independence',
      state: '광복 이후', theme: '정치', kind: 'turning',
      body: '광복 직후 여운형이 조선 건국 동맹을 중심으로 좌익과 우익을 아울러 조직하였다(건준). 전국에 지부와 치안대를 조직하고 조선 인민 공화국 수립을 선포하였다.' },
    { id: 'k-moscow', track: 'korea', year: 1945, month: 12, label: '모스크바 3국 외상 회의', en: 'Moscow Conference of Foreign Ministers',
      state: '광복 이후', theme: '외교', kind: 'turning',
      body: '1945년 12월 미국·영국·소련의 외무 장관이 모스크바에 모여 한반도에 민주주의 임시 정부를 수립하고 최대 5년간 신탁 통치를 실시하기로 결정하였다.' },
    { id: 'k-jointcomm1', track: 'korea', year: 1946, month: 3, label: '제1차 미·소 공동 위원회', en: 'First US–Soviet Joint Commission',
      state: '광복 이후', theme: '외교', kind: 'turning',
      body: '1946년 3월 서울 덕수궁에서 열렸으나, 민주주의 임시 정부 수립에 참여할 정당과 사회단체의 범위를 놓고 미국과 소련이 대립하여 휴회되었다.' },
    { id: 'k-jeongeup', track: 'korea', year: 1946, month: 6, label: '이승만의 정읍 발언', en: 'Syngman Rhee\'s Jeongeup Speech',
      state: '광복 이후', theme: '정치', kind: 'event', noSync: true,
      body: '1946년 6월 이승만이 정읍에서 통일 정부 수립이 어렵다면 남한만이라도 임시 정부를 수립할 것을 주장하였다.' },
    { id: 'k-jwau', track: 'korea', year: 1946, month: 7, label: '좌우 합작 운동', en: 'Left–Right Coalition Movement',
      state: '광복 이후', theme: '정치', kind: 'turning',
      body: '여운형과 김규식 등 중도 세력이 좌우 합작 위원회를 구성하여 통일 정부 수립 운동을 펼치고, 좌우 합작 7원칙(1946)을 발표하였다.' },
    { id: 'k-jointcomm2', track: 'korea', year: 1947, month: 5, label: '제2차 미·소 공동 위원회', en: 'Second US–Soviet Joint Commission',
      state: '광복 이후', theme: '외교', kind: 'turning',
      body: '1947년 5월에 열렸으나 아무런 성과를 거두지 못하였다. 이에 미국은 한반도 문제를 유엔 총회에 넘겼다.' },
    { id: 'k-un-ga', track: 'korea', year: 1947, month: 11, label: '유엔 총회', en: 'UN General Assembly',
      state: '광복 이후', theme: '외교', kind: 'turning',
      body: '1947년 11월 유엔 총회는 유엔 감시하에 인구 비례에 따른 남북한 총선거를 실시하여 한반도에 정부를 세울 것을 결정하였다.' },
    { id: 'k-un-little', track: 'korea', year: 1948, month: 2, label: '유엔 소총회', en: 'UN Interim Committee',
      state: '광복 이후', theme: '외교', kind: 'turning',
      body: '소련이 유엔 한국 임시 위원단의 38도선 이북 방문을 거부하자, 1948년 2월 유엔은 소총회를 열어 선거 감시가 가능한 지역에서만 선거를 치르기로 결정하였다.' },
    { id: 'k-samcheonman', track: 'korea', year: 1948, month: 2, label: '김구의 삼천만 동포에게 읍고함', en: 'Kim Ku\'s Appeal to Thirty Million Compatriots',
      state: '광복 이후', theme: '정치', kind: 'event', noSync: true,
      body: '1948년 2월 김구가 남한만의 단독 정부 수립에 반대하며 발표한 성명. 38선을 베고 쓰러질지언정 단독 정부를 세우는 데는 협력하지 않겠다고 밝혔다.' },
    { id: 'k-jeju43', track: 'korea', year: 1948, month: 4, label: '제주 4·3 사건', en: 'Jeju April 3 Incident',
      state: '광복 이후', theme: '사회', kind: 'turning',
      body: '1948년 4월 3일 제주도의 좌익 세력이 단독 선거 반대, 통일 정부 수립을 내세우며 무장봉기를 일으켰다. 이를 진압하는 과정에서 제주도의 수많은 민간인이 희생되었다.' },
    { id: 'k-nambuk', track: 'korea', year: 1948, month: 4, label: '남북 협상', en: 'North–South Negotiations',
      state: '광복 이후', theme: '정치', kind: 'turning',
      body: '남한만의 단독 선거가 결정되자 1948년 4월 김구와 김규식이 38도선을 넘어 평양에서 북한 지도부와 남북 협상을 가졌다.' },
    { id: 'k-510', track: 'korea', year: 1948, month: 5, label: '5·10 총선거', en: 'May 10 General Election',
      state: '광복 이후', theme: '정치', kind: 'turning',
      body: '1948년 5월 10일 유엔 한국 임시 위원단의 감시 아래 남한에서 실시된 국회의원 총선거. 우리 역사 최초의 민주 선거였다.' },
    { id: 'k-constitution', track: 'korea', year: 1948, month: 7, label: '제헌 헌법 공포', en: 'Promulgation of the Constitution',
      state: '광복 이후', theme: '정치', kind: 'event', noSync: true,
      body: '1948년 7월 17일 제헌 국회가 제헌 헌법을 공포하였다. 대한민국이 대한민국 임시 정부의 법통을 계승한 민주 공화국임을 밝혔다.' },
    { id: 'k-rok', track: 'korea', year: 1948, month: 8, label: '대한민국 정부 수립', en: 'Establishment of the Republic of Korea',
      state: '대한민국', theme: '정치', kind: 'turning',
      body: '5·10 총선거로 구성된 제헌 국회가 헌법을 제정하고, 1948년 8월 15일 대한민국 정부 수립을 선포하였다.' },
    { id: 'k-yeosun', track: 'korea', year: 1948, month: 10, label: '여수·순천 10·19 사건', en: 'Yeosu–Suncheon October 19 Incident',
      state: '대한민국', theme: '군사', kind: 'turning',
      body: '1948년 10월 제주 4·3 사건 진압을 위해 출동하게 된 여수 주둔 부대 내 좌익 세력 등이 제주도 출동 반대, 통일 정부 수립 등을 내세우며 여수·순천 지역을 점령하였다.' },
    // ---------- 대한민국 정부 수립 이후 — 대통령 집권기 (사건은 각 정부 노드에) ----------
    { id: 'k-gov-rhee', track: 'korea', year: 1948, month: 8, label: '이승만 정부', en: 'Syngman Rhee Government',
      state: '대한민국', theme: '정치', kind: 'turning',
      body: '5·10 총선거로 구성된 제헌 국회가 이승만을 대통령으로 선출하여 정부가 수립되었다. 주요 사건: 6·25 전쟁(1950) · 4·19 혁명(1960).' },
    { id: 'k-625', track: 'korea', year: 1950, month: 6, label: '6·25 전쟁', en: 'Korean War',
      state: '대한민국', theme: '군사', kind: 'turning',
      body: '1950년 6월 25일 북한군이 38도선을 넘어 기습적으로 남침하였다. 유엔군이 참전하였고, 1953년 7월 27일 정전 협정이 체결되었다.' },
    // ── 현대 서브 노드 (개헌·민주화 운동·남북 관계·경제) — 동아출판 한국사2. month로 그 해 안에서 월 순서 ──
    { id: 'k-amend1', track: 'korea', year: 1952, month: 7, label: '제1차 개헌', en: '1st Constitutional Amendment',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '발췌 개헌. 6·25 전쟁 중 이승만 정부가 계엄령을 선포하고 야당 의원들을 연행하는 등 공포 분위기를 조성한 가운데, 대통령 선출 방식을 직선제로 바꾸었다.' },
    { id: 'k-amend2', track: 'korea', year: 1954, month: 11, label: '제2차 개헌', en: '2nd Constitutional Amendment',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '사사오입 개헌. 개헌 당시 대통령에 한해 중임 제한을 없애는 개헌안이 1표가 부족하여 부결되었으나, 자유당은 사사오입(반올림)의 논리를 내세워 통과시켰다.' },
    { id: 'k-jinbo', track: 'korea', year: 1958, month: 1, label: '진보당 사건', en: 'Progressive Party Incident',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '조봉암이 평화 통일을 주장하며 진보당을 창당하자, 이승만 정부가 진보당을 해체하고 조봉암에게 간첩 혐의 등을 씌워 사형에 처하게 하였다.' },
    { id: 'k-315', track: 'korea', year: 1960, month: 3, label: '3·15 부정 선거', en: 'March 15 Election Fraud',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '1960년 제4대 대통령 선거에서 이승만과 자유당 정권이 이기붕을 부통령에 당선시키려고 저지른 부정 선거.' },
    { id: 'k-419', track: 'korea', year: 1960, month: 4, label: '4·19 혁명', en: 'April 19 Revolution',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '3·15 부정 선거에 맞서 학생과 시민이 일으킨 민주 혁명. 이승만 대통령이 물러났다.' },
    { id: 'k-amend3', track: 'korea', year: 1960, month: 6, label: '제3차 개헌', en: '3rd Constitutional Amendment',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '4·19 혁명 이후 내각 책임제와 양원제(민의원, 참의원) 국회를 채택하였다.' },
    { id: 'k-amend4', track: 'korea', year: 1960, month: 11, label: '제4차 개헌', en: '4th Constitutional Amendment',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '3·15 부정 선거 관련자 등 반민주 행위자 처벌 규정을 신설하여 제3차 개헌을 보완하였다.' },
    { id: 'k-516', track: 'korea', year: 1961, month: 5, label: '5·16 군사 정변', en: 'May 16 Military Coup',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '박정희 등 군부 세력이 군사 정변을 일으켜 정권을 장악하고 국가 재건 최고 회의를 설치하였다.' },
    { id: 'k-kj-talks', track: 'korea', year: 1962, month: 11, label: '한·일 회담', en: 'Korea–Japan Talks',
      state: '대한민국', theme: '외교', kind: 'event', noSync: true,
      body: '1951년부터 진행된 한·일 회담은 이견으로 진전이 없었으나, 1962년 김종필·오히라 비밀 회담으로 청구권 자금 등에 합의하였다.' },
    { id: 'k-amend5', track: 'korea', year: 1962, month: 12, label: '제5차 개헌', en: '5th Constitutional Amendment',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '대통령 중심제와 단원제 국회를 채택하고 대통령 임기를 4년, 중임제로 하였다. 헌법에 ‘4·19 혁명’을 처음으로 명시하였다.' },
    { id: 'k-63', track: 'korea', year: 1964, month: 6, label: '6·3 시위', en: 'June 3 Protests',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '식민 지배에 대한 배상과 사과 없이 진행된 한·일 회담에 반대하여 학생과 시민이 벌인 시위. 박정희 정부는 계엄을 선포하여 시위를 억눌렀다.' },
    { id: 'k-kj-treaty', track: 'korea', year: 1965, month: 6, label: '한·일 협정', en: 'Korea–Japan Treaty',
      state: '대한민국', theme: '외교', kind: 'event', noSync: true,
      body: '박정희 정부가 한·일 협정을 체결하여 일본과 국교를 맺었다.' },
    { id: 'k-bluehouse', track: 'korea', year: 1968, month: 1.2, label: '청와대 습격 사건', en: 'Blue House Raid',
      state: '대한민국', theme: '군사', kind: 'event', noSync: true,
      body: '1968년 북한 특수 부대가 청와대를 습격한 사건(1·21 사태). 박정희 정부는 이를 계기로 반공 정책을 강화하였다.' },
    { id: 'k-pueblo', track: 'korea', year: 1968, month: 1.8, label: '푸에블로호 나포 사건', en: 'Pueblo Incident',
      state: '대한민국', theme: '군사', kind: 'event', noSync: true,
      body: '1968년 북한이 미국 첩보함 푸에블로호를 동해에서 나포한 사건.' },
    { id: 'k-amend6', track: 'korea', year: 1969, month: 10, label: '제6차 개헌', en: '6th Constitutional Amendment',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '3선 개헌. 대통령의 3선 연임을 허용하였다. 여당 의원들이 농성 중인 야당 의원들 몰래 편법으로 통과시켰다.' },
    { id: 'k-saemaeul', track: 'korea', year: 1970, month: 4, label: '새마을 운동', en: 'Saemaul Movement',
      state: '대한민국', theme: '경제', kind: 'event', noSync: true,
      body: '박정희 정부가 1970년부터 농가 소득을 높이고 도시와 농촌을 균형 있게 발전시키려고 실시하였다. 근면, 자조, 협동을 내세웠다.' },
    { id: 'k-gyeongbu', track: 'korea', year: 1970, month: 7, label: '경부 고속 도로 개통', en: 'Opening of the Gyeongbu Expressway',
      state: '대한민국', theme: '경제', kind: 'event', noSync: true,
      body: '1968년에 착공하여 1970년에 완공하였다. 한국 경제 성장의 견인차 역할을 하였다.' },
    { id: 'k-jeontaeil', track: 'korea', year: 1970, month: 11, label: '전태일 분신', en: 'Self-immolation of Jeon Tae-il',
      state: '대한민국', theme: '사회', kind: 'event', noSync: true,
      body: '1970년 11월 재단사 전태일이 근로 기준법 준수를 외치며 분신하였다. 노동자의 현실을 세상에 알리고 노동 운동이 확산되는 계기가 되었다.' },
    { id: 'k-74', track: 'korea', year: 1972, month: 7, label: '7·4 남북 공동 성명', en: 'July 4 South–North Joint Statement',
      state: '대한민국', theme: '외교', kind: 'event', noSync: true,
      body: '남북이 자주·평화·민족 대단결의 통일 3대 원칙에 합의하고 남북 조절 위원회를 설치하였다.' },
    { id: 'k-amend7', track: 'korea', year: 1972, month: 12, label: '제7차 개헌(유신 헌법)', en: '7th Amendment (Yushin Constitution)',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '통일 주체 국민회의에서 간접 선거로 대통령을 뽑고, 대통령 임기를 6년으로 하며 중임 횟수 제한을 없앴다.' },
    { id: 'k-oil1', track: 'korea', year: 1973, month: 10, label: '제1차 석유 파동', en: 'First Oil Shock',
      state: '대한민국', theme: '경제', kind: 'event', noSync: true,
      body: '제4차 중동 전쟁으로 촉발되었다. 중동 지역에 진출한 기업과 노동자들이 벌어들인 외화로 극복하였다.' },
    { id: 'k-31-decl', track: 'korea', year: 1976, month: 3, label: '3·1 민주 구국 선언', en: 'March 1 Declaration for Democracy and National Salvation',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '1976년 3월 1일 민주화 인사들이 유신 체제를 비판하며 발표한 선언.' },
    { id: 'k-oil2', track: 'korea', year: 1978, month: 12, label: '제2차 석유 파동', en: 'Second Oil Shock',
      state: '대한민국', theme: '경제', kind: 'event', noSync: true,
      body: '이란의 이슬람 혁명으로 촉발되었다. 중화학 공업에 대한 과잉 투자와 부가 가치세 도입에 따른 물가 상승까지 겹치며 한국 경제를 크게 위협하였다.' },
    { id: 'k-yh', track: 'korea', year: 1979, month: 8, label: 'YH 사건', en: 'YH Incident',
      state: '대한민국', theme: '사회', kind: 'event', noSync: true,
      body: 'YH 무역 노동자들이 부당한 공장 폐쇄에 맞서 야당인 신민당 당사에서 시위를 벌였으나 강제로 진압되었다. 이에 항의하던 신민당 총재 김영삼이 국회의원에서 제명되었다.' },
    { id: 'k-buma', track: 'korea', year: 1979, month: 10.5, label: '부·마 민주 항쟁', en: 'Bu-Ma Democratic Protests',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '부산과 마산(창원) 지역에서 대학생을 중심으로 ‘유신 철폐’, ‘독재 타도’를 외치며 일어난 시위. 유신 체제의 몰락을 알리는 신호탄이 되었다.' },
    { id: 'k-1026', track: 'korea', year: 1979, month: 10.85, label: '10·26 사태', en: 'October 26 Incident',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '부·마 민주 항쟁의 수습 방안을 놓고 정권 내부에서 갈등이 일어나는 가운데, 박정희 대통령이 중앙정보부장 김재규에게 피살되었다.' },
    { id: 'k-1212', track: 'korea', year: 1979, month: 12.3, label: '12·12 군사 반란', en: 'December 12 Military Mutiny',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '10·26 사태 이후 전두환을 중심으로 한 신군부가 반란을 일으켜 권력을 장악하였다.' },
    { id: 'k-seoul-spring', track: 'korea', year: 1980, month: 3, label: '서울의 봄', en: 'Seoul Spring',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '10·26 사태부터 1980년 5월 17일 비상계엄 확대 선포까지 민주화에 대한 기대가 높아졌던 시기.' },
    { id: 'k-518', track: 'korea', year: 1980, month: 5, label: '5·18 민주화 운동', en: 'May 18 Democratic Uprising',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '신군부의 비상계엄 확대와 계엄군의 폭력 진압에 맞서 광주 시민들이 일으킨 민주화 운동.' },
    { id: 'k-amend8', track: 'korea', year: 1980, month: 10, label: '제8차 개헌', en: '8th Constitutional Amendment',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '국가 보위 비상 대책 위원회에서 개헌안을 마련하였다. 대통령 간선제, 대통령 임기 7년 단임제를 채택하였다.' },
    { id: 'k-413', track: 'korea', year: 1987, month: 4, label: '4·13 호헌 조치', en: 'April 13 Measure to Protect the Constitution',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '전두환 대통령이 시민들의 개헌 요구를 무시하고 기존 헌법에 따라 간접 선거로 다음 대통령을 뽑겠다고 발표하였다.' },
    { id: 'k-june-uprising', track: 'korea', year: 1987, month: 6.3, label: '6월 민주 항쟁', en: 'June Democratic Struggle',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '박종철 고문치사 사건과 4·13 호헌 조치에 맞서 ‘호헌 철폐, 독재 타도’를 외치며 전국에서 일어난 민주화 운동.' },
    { id: 'k-629', track: 'korea', year: 1987, month: 6.9, label: '6·29 선언', en: 'June 29 Declaration',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '대통령 직선제 개헌 등 6월 민주 항쟁 당시 국민의 요구를 받아들이겠다는 내용을 담은 성명.' },
    { id: 'k-amend9', track: 'korea', year: 1987, month: 10, label: '제9차 개헌', en: '9th Constitutional Amendment',
      state: '대한민국', theme: '정치', kind: 'event', noSync: true,
      body: '대통령 직선제와 대통령 임기 5년 단임제를 채택하였다.' },
    { id: 'k-olympic', track: 'korea', year: 1988, month: 9, label: '서울 올림픽 대회 개최', en: 'Seoul Olympic Games',
      state: '대한민국', theme: '사회', kind: 'event', noSync: true,
      body: '1988년 서울에서 올림픽 대회가 열렸다.' },
    { id: 'k-highlevel', track: 'korea', year: 1990, month: 9, label: '남북 고위급 회담 개최', en: 'Inter-Korean High-Level Talks',
      state: '대한민국', theme: '외교', kind: 'event', noSync: true,
      body: '1990년 남북 고위급 회담이 열리기 시작하였다. 이 회담을 거쳐 남북 기본 합의서가 채택되었다.' },
    { id: 'k-un-join', track: 'korea', year: 1991, month: 9, label: '남북한 유엔 동시 가입', en: 'Simultaneous UN Admission of the Two Koreas',
      state: '대한민국', theme: '외교', kind: 'event', noSync: true,
      body: '1991년 남한과 북한이 유엔에 동시에 가입하였다.' },
    { id: 'k-basic-agree', track: 'korea', year: 1991, month: 12, label: '남북 기본 합의서 채택', en: 'Inter-Korean Basic Agreement',
      state: '대한민국', theme: '외교', kind: 'event', noSync: true,
      body: '남북이 서로의 체제를 인정하고 상호 불가침에 합의하였으며, 남북 관계를 잠정적 특수 관계로 규정하였다.' },
    { id: 'k-denuke', track: 'korea', year: 1992, month: 1, label: '한반도 비핵화 공동 선언', en: 'Joint Declaration on Denuclearization',
      state: '대한민국', theme: '외교', kind: 'event', noSync: true,
      body: '남북한이 한반도의 비핵화에 합의한 선언.' },
    { id: 'k-uruguay', track: 'korea', year: 1993, month: 12, label: '우루과이 라운드 타결', en: 'Conclusion of the Uruguay Round',
      state: '대한민국', theme: '경제', kind: 'event', noSync: true,
      body: '1993년 우루과이 라운드가 타결되고 1995년 세계 무역 기구(WTO)가 출범하는 등 자유 무역이 확대되었다.' },
    { id: 'k-imf', track: 'korea', year: 1997, month: 12, label: '외환 위기', en: 'Asian Financial Crisis in Korea',
      state: '대한민국', theme: '경제', kind: 'event', noSync: true,
      body: '외환 부족으로 위기를 맞은 김영삼 정부가 1997년 12월 국제 통화 기금(IMF)과 구제 금융 협약을 체결하였다.' },
    { id: 'k-615', track: 'korea', year: 2000, month: 6, label: '6·15 남북 공동 선언', en: 'June 15 South–North Joint Declaration',
      state: '대한민국', theme: '외교', kind: 'event', noSync: true,
      body: '2000년 평양에서 분단 이후 최초로 남북 정상 회담이 열려 채택되었다.' },
    // 경제 개발 5개년 계획 묶음 노드 (hidden) — 묶음 이름을 누르면 기록 열람
    { id: 'k-era-econ12', track: 'korea', year: 1966, yearLabel: '1962~1971 CE', label: '제1·2차 경제 개발 5개년 계획', en: '1st & 2nd Five-Year Economic Development Plans',
      state: '대한민국', theme: '경제', kind: 'event', hidden: true,
      body: '1960년대 박정희 정부가 섬유·가발·식료품 등 노동 집약적인 경공업을 중심으로 수출 규모를 키워 나간 국가 주도의 경제 개발 계획.' },
    { id: 'k-era-econ34', track: 'korea', year: 1976, yearLabel: '1972~1981 CE', label: '제3·4차 경제 개발 5개년 계획', en: '3rd & 4th Five-Year Economic Development Plans',
      state: '대한민국', theme: '경제', kind: 'event', hidden: true,
      body: '1970년대 박정희 정부가 철강·화학·기계·조선 등 중화학 공업을 집중 육성한 경제 개발 계획.' },
    { id: 'k-gov-chang', track: 'korea', year: 1960, month: 8, label: '장면 내각', en: 'Chang Myon Cabinet',
      state: '대한민국', theme: '정치', kind: 'turning',
      body: '4·19 혁명 이후 내각 책임제 아래 대통령 윤보선, 국무총리 장면이 이끈 정부.' },
    { id: 'k-gov-park', track: 'korea', year: 1963, month: 12, label: '박정희 정부', en: 'Park Chung-hee Government',
      state: '대한민국', theme: '정치', kind: 'turning',
      body: '5·16 군사 정변(1961)으로 정권을 잡은 박정희가 1963년 대통령에 당선되어 출범하였다. 주요 사건: 5·16 군사 정변(1961) · 경제 개발 5개년 계획(1962) · 한·일 협정(1965) · 유신 체제(1972).' },
    { id: 'k-gov-choi', track: 'korea', year: 1979, month: 12.7, label: '최규하 정부', en: 'Choi Kyu-hah Government',
      state: '대한민국', theme: '정치', kind: 'turning',
      body: '10·26 사태 이후 국무총리였던 최규하가 대통령을 승계하였다.' },
    { id: 'k-gov-chun', track: 'korea', year: 1980, month: 9, label: '전두환 정부', en: 'Chun Doo-hwan Government',
      state: '대한민국', theme: '정치', kind: 'turning',
      body: '12·12 사태로 군권을 잡은 신군부의 전두환이 1980년 대통령이 되었다. 주요 사건: 5·18 민주화 운동(1980) · 6월 민주 항쟁(1987).' },
    { id: 'k-gov-roh', track: 'korea', year: 1988, month: 2, label: '노태우 정부', en: 'Roh Tae-woo Government',
      state: '대한민국', theme: '정치', kind: 'turning',
      body: '6월 민주 항쟁 이후 직선제로 당선된 노태우가 1988년 취임하였다. 주요 사건: 남북한 유엔 동시 가입(1991).' },
    { id: 'k-gov-kys', track: 'korea', year: 1993, month: 2, label: '김영삼 정부', en: 'Kim Young-sam Government',
      state: '대한민국', theme: '정치', kind: 'turning',
      body: '1993년 김영삼 대통령이 취임하였다. 주요 사건: 외환 위기(1997).' },
    { id: 'k-gov-kdj', track: 'korea', year: 1998, month: 2, label: '김대중 정부', en: 'Kim Dae-jung Government',
      state: '대한민국', theme: '정치', kind: 'turning',
      body: '선거에 의한 여야 간 첫 평화적 정권 교체로 1998년 김대중 대통령이 취임하였다. 주요 사건: 6·15 남북 공동 선언(2000).' },
    { id: 'k-gov-rmh', track: 'korea', year: 2003, label: '노무현 정부', en: 'Roh Moo-hyun Government',
      state: '대한민국', theme: '정치', kind: 'turning',
      body: '2003년 노무현 대통령이 취임하였다.' },
    { id: 'k-gov-lmb', track: 'korea', year: 2008, label: '이명박 정부', en: 'Lee Myung-bak Government',
      state: '대한민국', theme: '정치', kind: 'turning',
      body: '2008년 이명박 대통령이 취임하면서 10년 만에 다시 정권이 교체되었다.' },
    { id: 'k-gov-pgh', track: 'korea', year: 2013, label: '박근혜 정부', en: 'Park Geun-hye Government',
      state: '대한민국', theme: '정치', kind: 'turning',
      body: '2013년 박근혜 대통령이 취임하였다.' },
    { id: 'k-gov-moon', track: 'korea', year: 2017, label: '문재인 정부', en: 'Moon Jae-in Government',
      state: '대한민국', theme: '정치', kind: 'turning',
      body: '박근혜 대통령 탄핵 이후 2017년 문재인 대통령이 취임하였다. 주요 사건: 판문점 선언(2018).' },
    { id: 'k-gov-yoon', track: 'korea', year: 2022, label: '윤석열 정부', en: 'Yoon Suk-yeol Government',
      state: '대한민국', theme: '정치', kind: 'turning',
      body: '2022년 3월 선거에서 당선되어 다시 정권이 교체되었다.' },

    // ============================================================
    // 동아시아사 EAST ASIA  (~2000 BCE – 918 CE)
    // ============================================================
    // ---------- 선사시대 ----------
    { id: 'e-paleo', track: 'eastasia', year: -2098050, yearLabel: '약 210만 년 전 ~', label: '구석기 시대', en: 'Paleolithic',
      state: '구석기', theme: '사회', kind: 'turning',
      body: '동아시아의 구석기 시대 — 중국 상천(上陳) 유적의 석기(약 210만 년 전)가 동아시아에서 가장 오래된 인류의 흔적이다. 뗀석기, 채집·수렵·어로, 이동 생활. 중국 베이징원인(주구점) 유적 등 호모 에렉투스 단계 화석이 발견되었다.' },
    { id: 'e-neolithic', track: 'eastasia', year: -8050, yearLabel: '약 1만 년 전 ~', label: '신석기 시대', en: 'Neolithic',
      state: '신석기', theme: '사회', kind: 'turning',
      body: '동아시아의 신석기 시대 — 황허강 유역 양사오 문화(채도), 룽산 문화(흑도). 농경·목축의 시작, 정착 생활, 토기·간석기 사용.' },
    // ---------- 일본 갈래 시작 ----------
    { id: 'e-jomon', track: 'eastasia', year: -8050, yearLabel: '약 1만 년 전 ~ 3세기 BCE', label: '조몬(縄文) 시대', en: 'Jōmon',
      state: '일본 열도', theme: '사회', kind: 'turning', sub: 1,
      body: '일본 열도의 신석기 시대. 약 1만 년 전부터 BCE 3세기경까지. 새끼줄 무늬(縄文) 토기, 정착 채집·수렵·어로 생활. 일본 역사의 시작점.' },
    // ---------- 청동기 ----------
    { id: 'e-bronze', track: 'eastasia', year: -2500, yearLabel: '2500 BCE 무렵 ~', label: '청동기 시대', en: 'Bronze Age',
      state: '청동기', theme: '경제', kind: 'turning',
      body: '동아시아의 청동기 시대 — 황허강 유역에서 BCE 2500년경 청동기 사용. 농업 생산력 증대와 함께 계급 사회 형성, 도시 국가·초기 왕조(하·상)의 물질적 기반이 됨. 한반도는 비파형 동검·고인돌, 일본은 야요이 시대의 청동기·철기 동시 유입.' },
    // ---------- 중국 문명 형성 (하·상·주) ----------
    { id: 'e-xia', track: 'eastasia', year: -2000, yearLabel: '2000 BCE경', label: '하(夏)', en: 'Xia',
      state: '하(夏)', theme: '정치', kind: 'turning',
      body: '우(禹)임금이 세웠다고 전하는 중국 최초의 왕조. 얼리터우 유적이 그 실체로 추정.' },
    { id: 'e-shang', track: 'eastasia', year: -1600, label: '상(商)', en: 'Shang',
      state: '상(商)', theme: '정치', kind: 'turning',
      body: '탕왕이 하를 멸하고 건국. 갑골문·청동기·신정정치. 은(殷)이라고도 부른다.' },
    { id: 'e-zhou', track: 'eastasia', year: -1046, label: '주(周)', en: 'Zhou',
      state: '주(周)', theme: '정치', kind: 'turning',
      body: '무왕이 목야 전투에서 상을 멸함. 종법(宗法)에 기반한 봉건제 시행. 봉건제·종법제·천명사상이 뒷받침.' },
    { id: 'e-chunqiu', track: 'eastasia', year: -770, label: '춘추 시대', en: 'Spring & Autumn',
      state: '춘추', theme: '정치', kind: 'event', noSync: true,
      body: '주가 호경에서 낙읍(낙양)으로 천도(BCE 770)하면서 시작. 춘추 5패(제 환공·진 문공·초 장왕·오왕 합려·월왕 구천)가 패권을 다툼.' },
    { id: 'e-zhanguo', track: 'eastasia', year: -403, label: '전국 시대', en: 'Warring States',
      state: '전국', theme: '정치', kind: 'event', noSync: true,
      body: '전국 7웅(진·초·제·연·조·위·한)의 쟁패. 철기·우경 확대로 생산력 비약, 제자백가의 사상이 꽃피움. BCE 221 진의 통일.' },
    { id: 'e-chunqiu-zhanguo', track: 'eastasia', year: -495, yearLabel: '770~221 BCE', label: '춘추·전국 시대', en: 'Spring & Autumn · Warring States',
      state: '춘추·전국 시대', theme: '정치', kind: 'event', hidden: true,
      body: '주가 호경에서 낙읍(낙양)으로 천도(BCE 770)하면서 시작된 약 550년의 분열기. 춘추 시대(BCE 770~403)는 춘추 5패가 패권을 다투었고, 전국 시대(BCE 403~221)는 7웅(秦·楚·齊·燕·趙·魏·韓)이 쟁패하였다. 철제 농기구·우경 보급으로 생산력이 비약적으로 발전하였고, 유가·도가·법가·묵가 등 제자백가의 사상이 꽃피었다.' },
    { id: 'e-qin', track: 'eastasia', year: -221, label: '진(秦)', en: 'Qin',
      state: '진(秦)', theme: '정치', kind: 'turning',
      body: '시황제가 6국을 평정하고 중국 최초의 통일 제국을 건설. 군현제 시행, 문자·도량형·화폐 통일, 만리장성 축조.' },
    { id: 'e-han-founded', track: 'eastasia', year: -202, label: '전한(前漢)', en: 'Former Han',
      state: '전한', theme: '정치', kind: 'turning',
      body: '유방(고조)이 항우를 해하에서 격파하고 한을 건국, 장안에 도읍. 군국제 통치 후 무제 때 중앙집권 강화, 유교 관학화, 비단길 개척. 외척 왕망의 찬탈로 신(新)에 멸망.' },
    { id: 'e-han-gaozu', track: 'eastasia', year: -202, label: '고조', en: 'Emperor Gaozu',
      state: '한', theme: '정치', kind: 'event', noSync: true, noMarker: true,
      body: '유방(고조)이 항우를 해하 전투에서 격파하고 한(漢)을 건국, 장안에 도읍 (BCE 202). 군국제 시행.' },
    { id: 'e-wudi', track: 'eastasia', year: -141, label: '무제', en: 'Emperor Wu',
      state: '한', theme: '정치', kind: 'event', noSync: true,
      body: '한 무제(BCE 141~87) 즉위. 중앙집권 강화, 유교 국교화(BCE 136), 흉노 정벌, 장건의 서역 파견, 고조선·남월 정복.' },
    { id: 'e-wang', track: 'eastasia', year: 8, label: '신(新)', en: 'Xin',
      state: '신', theme: '정치', kind: 'event', noSync: true,
      body: '왕망이 한을 찬탈하고 신(新)을 건국. 토지 국유화 등 급진 개혁을 시도했으나 15년 만에 멸망.' },
    { id: 'e-later-han', track: 'eastasia', year: 25, label: '후한(後漢)', en: 'Later Han',
      state: '후한', theme: '정치', kind: 'turning',
      body: '광무제(유수)가 한을 재건. 낙양에 도읍. 호족 세력에 기반한 정권. 반초의 서역 경영, 채륜의 종이 개량(105), 황건적의 난(184).' },
    { id: 'e-han-end', track: 'eastasia', year: 220, label: '한 멸망', en: 'Fall of Han',
      state: '한', theme: '정치', kind: 'event', noSync: true,
      body: '조비가 한 헌제로부터 선양받아 위(魏)를 건국 (220). 약 400년의 한(漢) 왕조 멸망. 삼국 시대 개막.' },
    // 일본 — 야요이
    { id: 'e-yayoi', track: 'eastasia', year: -300, yearLabel: '3세기 BCE경 ~', label: '야요이 시대', en: 'Yayoi Period',
      state: '일본 열도', theme: '사회', kind: 'turning', sub: 1,
      body: '한반도로부터 벼농사·청동기·철기가 일본 열도로 전해짐. 농경 사회와 소국 분립이 시작.' },
    // 위·진·남북조 시대 묶음 라벨 노드 (hidden) — 기록 열람으로 통합 내용 확인
    { id: 'e-wei-jin-nbc', track: 'eastasia', year: 400, yearLabel: '220~589 CE', label: '위·진·남북조 시대', en: 'Wei · Jin · Northern & Southern Dynasties',
      state: '위·진·남북조', theme: '정치', kind: 'event', hidden: true,
      body: '약 370년의 분열기(220~589). 위·촉·오 삼국, 서진의 일시 통일, 5호 16국·동진, 북위의 화북 통일, 남북조의 대립. 호한 융합, 균전제·삼장제, 불교의 융성과 석굴 사원, 강남 개발 등 동아시아 문명사의 큰 전환기.' },
    { id: 'e-3kingdoms', track: 'eastasia', year: 220, label: '위(魏)', en: 'Wei',
      state: '위', theme: '정치', kind: 'turning',
      body: '조비가 한 헌제로부터 선양받아 위(魏)를 건국(220). 화북을 기반으로 촉(蜀)·오(吳)와 정립(鼎立)하며 삼국 시대 개막. 9품중정제(구품관인법)으로 인재 등용 — 후일 문벌 귀족 사회의 토대. 263년 촉을 멸하나 265년 사마염에게 선양되어 서진(西晉)으로 이어짐.' },
    { id: 'e-jin', track: 'eastasia', year: 280, label: '서진(西晉)', en: 'Western Jin',
      state: '서진(西晉)', theme: '정치', kind: 'turning',
      body: '사마염(무제)의 서진이 오를 멸하고 60년 분열을 통일. 그러나 8왕의 난(291~)으로 곧 쇠퇴.' },
    { id: 'e-wuhu', track: 'eastasia', year: 304, label: '5호 16국(五胡十六國)', en: 'Sixteen Kingdoms',
      state: '5호 16국(五胡十六國)', theme: '정치', kind: 'turning',
      body: '흉노·선비·갈·저·강(5호)이 화북에 16개 왕조를 세움. 한족은 남쪽 동진(東晋)으로 피난.' },
    { id: 'e-beiwei', track: 'eastasia', year: 386, label: '북위(北魏)', en: 'Northern Wei',
      state: '북위(北魏)', theme: '정치', kind: 'turning',
      body: '선비족 탁발규(도무제)가 386년 건국. 439년 태무제가 화북 통일 — 5호 16국 분열 종식. 효문제(471~499)의 한화 정책(낙양 천도·호한 혼인·중국식 성씨·호복 금지)과 균전제·삼장제 시행으로 호한 융합의 모범 정권. 후일 수·당 율령 체제의 직접적 토대.' },
    { id: 'e-dongjin', track: 'eastasia', year: 317, label: '동진(東晉)', en: 'Eastern Jin',
      state: '동진(東晉)', theme: '정치', kind: 'turning',
      body: '서진 멸망(316) 후 사마예가 강남 건강(建康, 현 난징)으로 피난·즉위(317)하여 동진 건국. 한족 사대부와 강남 호족의 연합 정권 — 강남 개발 본격화, 양쯔강 유역이 새로운 농경·문화 중심지로 부상. 청담 사상, 도연명·왕희지·고개지 등 한족 문화의 정수. 420년 유유(劉裕)가 동진을 폐하고 송(宋)을 세우면서 남북조 시대로 이행.' },
    // 일본 — 야마토 정권 (고분 시대 통합)
    { id: 'e-yamato', track: 'eastasia', year: 350, yearLabel: '4세기 CE경', label: '야마토(大和) 정권', en: 'Yamato Polity',
      state: '일본', theme: '정치', kind: 'turning', sub: 1,
      body: '3세기 말~7세기 초 일본 열도에 거대한 전방후원분(前方後圓墳)이 축조된 고분 시대. 긴키(畿內) 지방을 중심으로 호족 연합체가 점차 통합되어 야마토 정권으로 성장. 5세기 「왜 5왕」이 중국 남조에 사신을 보내 책봉을 받음. 한반도(특히 백제·가야)로부터 도래인(渡來人)을 통해 철기·도자기·한자·유교·불교 등 선진 문물 전래. 천황가의 기원.' },
    { id: 'e-sui', track: 'eastasia', year: 589, label: '수(隋)', en: 'Sui',
      state: '수(隋)', theme: '정치', kind: 'event', noSync: true,
      body: '문제 양견이 약 370년의 위진남북조 분열을 종식. 균전·과거·3성 6부 등 율령 체제 정비. 양제의 대운하 건설과 고구려 원정 실패로 단명.' },
    { id: 'e-asuka', track: 'eastasia', year: 538, label: '아스카(飛鳥) 시대', en: 'Asuka',
      state: '일본', theme: '정치', kind: 'turning', sub: 1,
      body: '538~710. 538년 백제로부터 불교 전래로 시작. 쇼토쿠 태자(593~622)가 중앙집권과 불교 진흥 — 호류사 건립, 17조 헌법, 관위 12계. 645년 나카노오에 황자와 나카토미노 가마타리가 소가씨를 제거하고 다이카 개신(大化改新) — 당의 율령 체제 도입, 국호 「일본」·「천황」 칭호 사용.' },
    { id: 'e-tang', track: 'eastasia', year: 618, label: '당(唐)', en: 'Tang',
      state: '당(唐)', theme: '정치', kind: 'event', noSync: true,
      body: '이연(고조)이 당을 건국. 정관의 치(태종, 627~649)로 율령 체제 완성. 장안은 100만 인구의 국제도시. 균전·조용조·부병제 시행, 과거제 정착. 안사의 난 이후 쇠퇴하여 907년 멸망하고 5대 10국 시대가 이어졌다.' },
    { id: 'e-ansa', track: 'eastasia', year: 755, label: '안사의 난', en: 'An Lushan Rebellion',
      state: '당', theme: '사회', kind: 'event', noSync: true,
      body: '안녹산·사사명의 반란(755~763). 균전제 붕괴, 절도사 발호. 당 쇠퇴의 결정적 계기.' },
    // 일본 — 나라 시대
    { id: 'e-nara', track: 'eastasia', year: 710, label: '나라(奈良) 시대', en: 'Nara Period',
      state: '일본', theme: '정치', kind: 'event', sub: 1, noSync: true,
      body: '겐메이 천황이 헤이조쿄(나라)로 천도(710)하면서 시작. 당의 율령제를 본격 수용한 율령 국가 체제 정착. 도다이지 대불(752) 조영, 『고지키』(712)·『니혼쇼키』(720)·『만요슈』 편찬. 794년 헤이안 천도로 종결.' },
    // 일본 — 헤이안 시대
    { id: 'e-heian', track: 'eastasia', year: 794, label: '헤이안(平安) 시대', en: 'Heian Period',
      state: '일본', theme: '정치', kind: 'event', sub: 1, noSync: true,
      body: '간무 천황이 헤이조쿄(나라)에서 헤이안쿄(교토)로 천도하면서 시작(794~1185). 후지와라씨의 섭관 정치. 가나 문자 발명, 『겐지 이야기』·『마쿠라노소시』 등 국풍 문화의 황금기. 후기에는 무사 계급 대두.' },
    // ============================================================
    // 동아시아 EAST ASIA — 중세 ~ 현대 (10세기 ~)
    //   중세·근세는 국가·왕조만 노드로 두고 그 시기 사건은 해당 국가 본문에 담는다 (사용자 지시 2026-10-02)
    // ============================================================
    { id: 'e-liao', track: 'eastasia', year: 916, label: '거란(요)', en: 'Khitan (Liao)',
      state: '거란(요)', theme: '정치', kind: 'turning',
      body: '거란족이 916년 나라를 세웠다. 936년 만리장성 이남의 연운 16주를 차지하고 송과 대립하였다. 1125년 여진의 금에 멸망하였다.' },
    { id: 'e-song', track: 'eastasia', year: 960, label: '송(宋)', en: 'Song',
      state: '송', theme: '정치', kind: 'turning',
      body: '당 멸망(907) 후 5대 10국의 혼란 속에서 절도사 조광윤(태조)이 960년 건국하고 카이펑을 도읍으로 삼았다. 제2대 태종 때 5대 10국 시대를 끝냈다. 절도사의 권한을 줄이고 과거제를 정비하여 문치주의를 펼쳤다. 1127년 금에게 화북을 빼앗긴 뒤 남송으로 이어졌다.' },
    { id: 'e-jin-jurchen', track: 'eastasia', year: 1115, label: '금(金)', en: 'Jin',
      state: '금', theme: '정치', kind: 'turning',
      body: '여진의 아구다가 1115년 건국하였다. 맹안·모극제로 여진족을 조직하였다. 1125년 거란(요)을 정복하고 곧이어 송을 공격하여 화북 지역을 차지하였다. 이후 몽골 제국의 침입으로 멸망하였다.' },
    { id: 'e-nansong', track: 'eastasia', year: 1127, label: '남송(南宋)', en: 'Southern Song',
      state: '남송', theme: '정치', kind: 'turning',
      body: '금에 화북 지역을 빼앗긴 송이 1127년 왕조를 다시 세우고 임안(항저우)을 도읍으로 삼았다. 몽골군이 1276년 항저우를 함락하였고, 1279년 원에 멸망하였다.' },
    { id: 'e-kamakura', track: 'eastasia', year: 1192, label: '가마쿠라(鎌倉) 막부', en: 'Kamakura Shogunate',
      state: '일본', theme: '정치', kind: 'turning', sub: 1,
      body: '헤이안 시대 후반 율령 체제가 흔들리는 가운데, 무사단의 우두머리 미나모토노 요리토모가 다이라씨를 몰아내고 1192년 무사 정권인 막부를 열었다. 몽골·고려 연합군의 두 차례 일본 원정은 일본군의 저항과 태풍으로 실패하였다.' },
    { id: 'e-mongol', track: 'eastasia', year: 1206, label: '몽골 제국', en: 'Mongol Empire',
      state: '몽골', theme: '정치', kind: 'turning',
      body: '테무친이 몽골 부족을 통일하고 1206년 칭기즈 칸으로 추대되었다. 천호제로 유목민을 군사·행정 조직으로 편제하였다. 1219년부터 대대적인 정복 전쟁을 벌여 유라시아에 걸친 대제국을 세웠다. 역참을 설치하여 동서 교류가 활발해졌다.' },
    { id: 'e-yuan', track: 'eastasia', year: 1271, label: '원(元)', en: 'Yuan',
      state: '원', theme: '정치', kind: 'turning',
      body: '칭기즈 칸의 손자 쿠빌라이 칸이 1271년 국호를 원으로 정하고 대도(베이징)를 수도로 삼았다. 1279년 남송을 멸망시켜 중국 전역을 지배하였다. 몽골인을 우대하고 색목인을 재정 관리에 등용한 반면 한인과 남인을 차별하였다. 14세기 중엽 홍건적의 반란 끝에 명에 쫓겨 북쪽으로 물러났다.' },
    { id: 'e-muromachi', track: 'eastasia', year: 1336, label: '무로마치(室町) 막부', en: 'Muromachi Shogunate',
      state: '일본', theme: '정치', kind: 'turning', sub: 1,
      body: '아시카가 다카우지가 교토에 무로마치 막부(1336~1573)를 열었다. 명과 감합 무역을 하였다. 15세기 후반 내분으로 막부가 쇠퇴하면서 센고쿠 시대가 시작되었다.' },
    { id: 'e-ming', track: 'eastasia', year: 1368, label: '명(明)', en: 'Ming',
      state: '명', theme: '정치', kind: 'turning',
      body: '원이 쇠퇴하자 홍건적 출신 주원장(홍무제)이 난징에 도읍을 정하고 1368년 명을 건국하였다. 대외 무역을 통제하고 조공 무역만 허용하였다. 영락제(1402 즉위)는 자금성을 건설하고 베이징으로 천도하였으며, 정화에게 대규모 함대를 이끌고 인도양으로 항해하게 하였다(1405~). 1581년 일조편법을 확대 시행하였다.' },
    { id: 'e-sengoku', track: 'eastasia', year: 1467, label: '센고쿠(戰國) 시대', en: 'Sengoku Period',
      state: '일본', theme: '정치', kind: 'turning', sub: 1,
      body: '무로마치 막부가 쇠퇴하면서 각 지역의 다이묘가 패권을 놓고 다투던 시대(1467~1590). 16세기 후반 도요토미 히데요시가 100여 년에 걸친 혼란을 수습하고 일본을 통일한 뒤 조선을 침략하였다(임진 전쟁, 1592).' },
    { id: 'e-edo', track: 'eastasia', year: 1603, label: '에도(江戶) 막부', en: 'Edo Shogunate',
      state: '일본', theme: '정치', kind: 'turning', sub: 1,
      body: '도쿠가와 이에야스가 1603년 에도 막부를 열었다. 쇼군이 다이묘의 지위를 인정하는 막번 체제를 갖추고, 산킨코타이 제도로 지방의 다이묘를 통제하였다.' },
    { id: 'e-houjin', track: 'eastasia', year: 1616, label: '후금(後金)', en: 'Later Jin',
      state: '후금', theme: '정치', kind: 'turning',
      body: '누르하치가 여진 부족을 통합하고 1616년 후금을 건국하였다. 이후 명과 대립하였다.' },
    { id: 'e-qing', track: 'eastasia', year: 1636, label: '청(淸)', en: 'Qing',
      state: '청', theme: '정치', kind: 'turning',
      body: '홍타이지(태종)가 1636년 국호를 청으로 바꾸고 (내)몽골과 조선을 공격하였다(병자 전쟁). 1644년 명이 멸망하자 베이징으로 들어가 중국 전역을 지배하였다.' },
    { id: 'e-ming-fall', track: 'eastasia', year: 1644, label: '명 멸망', en: 'Fall of the Ming',
      state: '명', theme: '정치', kind: 'turning',
      body: '명 말기 농민 반란이 이어지는 가운데 이자성의 농민군이 베이징을 점령하면서 명이 멸망하였다. 이후 청이 베이징에 들어갔다.' },
    { id: 'e-nguyen', track: 'eastasia', year: 1802, label: '응우옌 왕조', en: 'Nguyễn Dynasty',
      state: '베트남', theme: '정치', kind: 'turning',
      body: '1802년부터 1945년까지 베트남을 통치한 왕조.' },
    { id: 'e-opium', track: 'eastasia', year: 1840, label: '아편 전쟁', en: 'Opium War',
      state: '청', theme: '외교', kind: 'turning',
      body: '영국이 청에 아편을 밀수출하자 청이 아편을 단속하였고, 영국은 이를 빌미로 제1차 아편 전쟁(1840~1842)을 일으켰다. 근대식 화포로 무장한 영국군에 패한 청은 난징 조약을 맺었다. 1856년 제2차 아편 전쟁이 일어나 청은 톈진 조약과 베이징 조약을 맺었다.' },
    { id: 'e-nanjing', track: 'eastasia', year: 1842, label: '난징 조약', en: 'Treaty of Nanjing',
      state: '청', theme: '외교', kind: 'turning',
      body: '제1차 아편 전쟁에서 패한 청이 영국과 맺은 조약. 상하이 등 5개 항구를 개항하고 홍콩을 영국에 넘겼다.' },
    { id: 'e-taiping', track: 'eastasia', year: 1851, label: '태평천국 운동', en: 'Taiping Movement',
      state: '청', theme: '사회', kind: 'turning',
      body: '크리스트교의 영향을 받은 홍수전이 일으킨 운동(1851~1864). 토지를 사람 수에 따라 나누어 준다는 천조전무 제도를 내세워 농민의 지지를 얻었다.' },
    { id: 'e-perry', track: 'eastasia', year: 1854, label: '미일 화친 조약', en: 'Convention of Kanagawa',
      state: '일본', theme: '외교', kind: 'turning', sub: 1,
      body: '미국 페리 함대의 무력시위에 굴복한 에도 막부가 1854년 미일 화친 조약을 맺어 2개 항구를 개항하였다. 1858년에는 미일 수호 통상 조약을 맺었다.' },
    { id: 'e-yangwu', track: 'eastasia', year: 1861, label: '양무운동', en: 'Self-Strengthening Movement',
      state: '청', theme: '정치', kind: 'turning',
      body: '청의 관료들이 중국의 전통 제도는 지키면서 서양의 기술을 받아들이자는 중체서용론에 따라 추진한 근대화 운동.' },
    { id: 'e-meiji', track: 'eastasia', year: 1868, label: '메이지 유신', en: 'Meiji Restoration',
      state: '일본', theme: '정치', kind: 'turning', sub: 1,
      body: '에도 막부가 무너지고 1868년 메이지 정부가 수립되었다. 천황 중심의 근대 국가를 세우기 위해 폐번치현 등 서양식 개혁을 추진하였다.' },
    { id: 'e-meiji-const', track: 'eastasia', year: 1889, label: '일본 제국 헌법', en: 'Meiji Constitution',
      state: '일본', theme: '정치', kind: 'turning', sub: 1,
      body: '정부의 전제 정치를 비판하며 입헌 제도를 요구하는 자유 민권 운동이 일어나는 가운데, 1889년 천황에게 전쟁 선포·조약 체결 등 많은 권한을 부여한 일본 제국 헌법이 공포되었다.' },
    { id: 'e-sino-jp', track: 'eastasia', year: 1894, label: '청일 전쟁', en: 'First Sino-Japanese War',
      state: '청', theme: '군사', kind: 'turning',
      body: '조선을 두고 청과 대립하던 일본이 일으킨 전쟁. 승리한 일본은 시모노세키 조약(1895)으로 청이 조선에 대한 권리를 포기하게 하고 랴오둥반도와 타이완을 넘겨받았다.' },
    { id: 'e-wuxu', track: 'eastasia', year: 1898, label: '무술변법', en: 'Hundred Days Reform',
      state: '청', theme: '정치', kind: 'turning',
      body: '청일 전쟁 패배 이후 캉유웨이와 량치차오 등이 광서제의 신임을 받아 입헌 군주제 도입 등 근대적 개혁을 추진하였으나, 서태후 등 보수 세력의 반발로 실패하였다.' },
    { id: 'e-xinchou', track: 'eastasia', year: 1901, label: '신축조약', en: 'Boxer Protocol',
      state: '청', theme: '외교', kind: 'turning',
      body: '‘청 왕조를 도와 서양 세력을 몰아내자.’라고 주장하는 의화단 운동이 산둥에서 일어났으나 8개국 연합군에게 진압되었다. 청은 1901년 열강과 신축조약을 체결하였다.' },
    { id: 'e-xinhai', track: 'eastasia', year: 1911, label: '신해혁명', en: 'Xinhai Revolution',
      state: '중화민국', theme: '정치', kind: 'turning',
      body: '쑨원의 삼민주의를 지도 이념으로 삼은 혁명 세력이 성장하는 가운데, 1911년 우창에서 신식 군대를 중심으로 봉기가 일어나고 각 성이 호응하였다. 쑨원이 임시 대총통으로 추대되어 1912년 중화민국이 수립되었다.' },
    { id: 'e-may4', track: 'eastasia', year: 1919, label: '5·4 운동', en: 'May Fourth Movement',
      state: '중화민국', theme: '사회', kind: 'turning',
      body: '파리 강화 회의에서 산둥반도의 독일 이권이 일본에 넘어가자 베이징의 학생들이 시위를 일으켰고, 거국적인 항일 구국 운동으로 발전하였다.' },
    { id: 'e-kmt-ccp', track: 'eastasia', year: 1924, label: '제1차 국공 합작', en: 'First United Front',
      state: '중화민국', theme: '정치', kind: 'turning',
      body: '중국 국민당과 중국 공산당이 군벌과 제국주의 세력에 맞서 손을 잡았다(1924~1927). 1926년 북벌을 시작하였다.' },
    { id: 'e-manchuria', track: 'eastasia', year: 1931, label: '만주 사변', en: 'Mukden Incident',
      state: '일본', theme: '군사', kind: 'turning',
      body: '대공황으로 경제가 침체하자 일본은 대외 침략으로 위기를 벗어나려 하였다. 1931년 류탸오후 사건을 일으켜 만주 지역을 점령하고 만주국을 세웠다.' },
    { id: 'e-sino-jp-war', track: 'eastasia', year: 1937, label: '중일 전쟁', en: 'Second Sino-Japanese War',
      state: '중화민국', theme: '군사', kind: 'turning',
      body: '일본이 루거우차오 사건을 빌미로 일으킨 전쟁. 일본군은 수도 난징을 점령하고 대학살을 저질렀다. 국민당과 공산당은 제2차 국공 합작으로 맞섰다.' },
    { id: 'e-pacific', track: 'eastasia', year: 1941, label: '아시아·태평양 전쟁', en: 'Asia-Pacific War',
      state: '일본', theme: '군사', kind: 'turning',
      body: '일본이 미국의 진주만을 기습하면서 시작된 전쟁. 일본은 동남아시아와 태평양 일대로 전선을 넓혔으나 1945년 무조건 항복하였다.' },
    { id: 'e-dr-vietnam', track: 'eastasia', year: 1945, label: '베트남 민주 공화국', en: 'Democratic Republic of Vietnam',
      state: '베트남', theme: '정치', kind: 'turning',
      body: '일본이 패망하자 호찌민이 베트남 민주 공화국 수립을 선포하였다. 이후 프랑스와 전쟁을 벌였다.' },
    { id: 'e-civilwar', track: 'eastasia', year: 1946, label: '국공 내전', en: 'Chinese Civil War',
      state: '중국', theme: '정치', kind: 'turning',
      body: '일본 패망 후 국민당과 공산당이 다시 충돌하여 1946년 내전이 본격화하였다. 공산당이 승리하였고 국민당 정부는 타이완으로 옮겨 갔다.' },
    { id: 'e-prc', track: 'eastasia', year: 1949, label: '중화 인민 공화국', en: 'People\'s Republic of China',
      state: '중국', theme: '정치', kind: 'turning',
      body: '국공 내전에서 승리한 중국 공산당의 마오쩌둥이 1949년 10월 1일 톈안먼 광장에서 중화 인민 공화국 수립을 선포하였다. 수도는 베이징.' },
    { id: 'e-sf', track: 'eastasia', year: 1951, label: '샌프란시스코 강화 조약', en: 'Treaty of San Francisco',
      state: '일본', theme: '외교', kind: 'turning', sub: 1,
      body: '일본과 연합국이 맺은 강화 조약. 일본은 이 조약으로 주권을 회복하였다.' },
    { id: 'e-cultural', track: 'eastasia', year: 1966, label: '문화 대혁명', en: 'Cultural Revolution',
      state: '중국', theme: '정치', kind: 'turning',
      body: '정치적 위기에 빠진 마오쩌둥이 홍위병을 동원하여 반대 세력을 제거한 정치·권력 투쟁(1966~1976).' },
    { id: 'e-nixon', track: 'eastasia', year: 1972, label: '닉슨 중국 방문', en: 'Nixon in China',
      state: '중국', theme: '외교', kind: 'turning',
      body: '미국 대통령 닉슨이 중국을 방문하여 미중 관계 개선의 길을 열었다.' },
    { id: 'e-vietwar-end', track: 'eastasia', year: 1975, label: '베트남 전쟁 종식', en: 'End of the Vietnam War',
      state: '베트남', theme: '군사', kind: 'turning',
      body: '미국의 개입으로 확대된 베트남 전쟁이 1975년 끝나고 베트남은 통일되었다.' },
    { id: 'e-reform', track: 'eastasia', year: 1978, label: '개혁·개방', en: 'Reform and Opening-up',
      state: '중국', theme: '경제', kind: 'turning',
      body: '마오쩌둥 사후 실권을 잡은 덩샤오핑이 개혁·개방 정책을 추진하였다. 중국은 급속한 경제 성장을 이루었으나 관료들의 부정부패도 심해졌다.' },
    { id: 'e-tiananmen', track: 'eastasia', year: 1989, label: '톈안먼 사건', en: 'Tiananmen Square Incident',
      state: '중국', theme: '사회', kind: 'turning',
      body: '1989년 톈안먼 광장에서 정치 민주화를 요구하던 시위를 정부가 무력으로 진압하였다.' },

    // ============================================================
    // 서양사 WEST  (~3000 BCE – 476 CE)
    // ============================================================
    // ---------- 선사시대 ----------
    { id: 'w-paleo', track: 'west', year: -1198050, yearLabel: '약 120만 년 전 ~', label: '구석기 시대', en: 'Paleolithic',
      state: '구석기', theme: '사회', kind: 'turning',
      body: '유럽의 구석기 시대 — 스페인 아타푸에르카의 시마 델 엘레판테 유적(약 140만~110만 년 전)에서 서유럽에서 가장 오래된 인류 화석이 발견되었다. 뗀석기, 동굴·바위 그늘 거주, 이동 생활. 프랑스 쇼베·라스코, 스페인 알타미라 동굴 벽화와 오스트리아 빌렌도르프 비너스 등 예술 활동의 흔적이 남아 있다.' },
    { id: 'w-neolithic', track: 'west', year: -8050, yearLabel: '약 1만 년 전 ~', label: '신석기 시대', en: 'Neolithic',
      state: '신석기', theme: '사회', kind: 'turning',
      body: '유럽의 신석기 시대 — 빙하기 종료 후 농경·목축 시작. 간석기·토기 사용. 영국 스톤헨지 등 거석 문화 유적이 후기에 출현하였다.' },
    { id: 'w-bronze', track: 'west', year: -3000, yearLabel: '3000 BCE 무렵 ~', label: '청동기 시대', en: 'Bronze Age',
      state: '청동기', theme: '경제', kind: 'turning',
      body: '유럽의 청동기 시대 — BCE 3000년경부터 동지중해(에게해)와 발칸·중부 유럽에서 청동기 보급. 크레타(미노스)·미케네 등 에게 문명이 대표적. 청동제 무기·장식과 거석 문화 발달, 사회 계급 분화와 도시·궁전 사회 형성.' },
    // ---------- 문명 형성 ----------
    { id: 'w-egypt-civ', track: 'westasia', year: -3000, label: '이집트 문명', en: 'Egyptian Civilization',
      state: '이집트 문명', theme: '문화', kind: 'turning',
      body: '나일강 유역에서 성립한 이집트 문명. 파라오 신정 정치, 태양력, 상형 문자(신성 문자·신관 문자·민용 문자), 피라미드·미라 등 사후 세계 신앙이 발달.' },
    { id: 'w-aegean', track: 'west', year: -3000, yearLabel: '3000 BCE 무렵 ~', label: '에게 문명', en: 'Aegean Civilization',
      state: '에게 문명', theme: '문화', kind: 'turning',
      body: '에게해 일대의 청동기 문명 — 크레타의 미노아 문명(크노소스 궁전·선형 문자 A)과 그리스 본토의 미케네 문명(사자문·선형 문자 B)을 통칭. 해상 무역으로 번성했으며, 후일 그리스 폴리스 문명의 기반이 되었다.' },
    { id: 'w-america', track: 'west', year: -3000, yearLabel: '3000~2000 BCE 무렵', label: '아메리카 문명', en: 'Mesoamerican Civilizations',
      state: '아메리카 문명', theme: '문화', kind: 'turning',
      body: '아메리카 대륙의 독자적 고대 문명 — 마야(BCE 3000~2000년 무렵 형성 추정, 0의 개념·20진법·천문학), 멕시코만 일대의 올멕(BCE 1500년 무렵 형성 추정), 후일 아스테카·잉카까지 이어진다. 옥수수 농경 기반 도시 문명.' },
    { id: 'w-polis', track: 'west', year: -1000, yearLabel: '10세기 BCE 무렵', label: '폴리스 성립', en: 'Greek Polis',
      state: '그리스', theme: '정치', kind: 'turning',
      body: '암흑기 종료 후 그리스 각지에 폴리스(도시 국가)가 형성. 아크로폴리스(성채)와 아고라(광장)를 중심으로 시민 공동체 발달. 아테네·스파르타·테베·코린토스 등 1,000여 개 폴리스. 호메로스 서사시(『일리아스』·『오디세이아』) 정착, 페니키아 알파벳 수용. 올림피아 제전(BCE 776~) 등 범그리스 축제로 동질감 유지.' },
    { id: 'w-sparta', track: 'west', year: -800, yearLabel: '800 BCE경', label: '스파르타', en: 'Sparta',
      state: '스파르타', theme: '정치', kind: 'turning',
      body: '펠로폰네소스 반도의 군국주의 폴리스. 두 왕·5인 감독관(에포로스)·30인 원로회·민회 체제. 리쿠르고스 법전과 엄격한 군사 교육(아고게). 다수 헤일로타이(예속 농민) 위에 군림한 소수 시민군.' },
    { id: 'w-athens', track: 'west', year: -750, yearLabel: '8세기 BCE', label: '아테네', en: 'Athens',
      state: '아테네', theme: '정치', kind: 'turning',
      body: '아티카 반도의 폴리스. 솔론(BCE 594)·클레이스테네스(BCE 508)의 개혁을 거쳐 페리클레스 시대(BCE 461~429)에 직접 민주정 황금기. 파르테논 신전 등 고전기 그리스 문화의 중심.' },
    // 그리스 문화 묶음 라벨 노드 (hidden) — 폴리스·스파르타·아테네를 묶어 기록 열람으로 통합 내용 확인
    { id: 'w-greek-culture', track: 'west', year: -800, label: '그리스 문화', en: 'Greek Culture',
      state: '그리스', theme: '문화', kind: 'event', hidden: true,
      body: '폴리스를 무대로 꽃핀 고대 그리스의 문화. 인간 중심적이고 합리적인 성격을 띠어 신화·서사시(호메로스), 비극, 자연 철학과 소피스트·소크라테스의 철학, 헤로도토스·투키디데스의 역사 서술, 파르테논 신전으로 대표되는 조화와 균형의 건축·조각이 발달하였다. 헬레니즘 시대를 거쳐 로마로 이어지며 서양 문화의 뿌리가 되었다.' },
    { id: 'w-rome-found', track: 'west', year: -753, label: '로마', en: 'Rome',
      state: '로마', theme: '정치', kind: 'turning',
      body: '이탈리아 중부 라티움 지방의 도시 국가에서 출발하여 공화정·제정을 거쳐 지중해 일대를 통일한 고대 제국. 로물루스 건국(BCE 753 전승) → 공화정(BCE 509) → 옥타비아누스 제정 시작(BCE 27) → 5현제 시대 · Pax Romana → 4세기 분리 → 서로마 멸망(476). 12표법·만민법·콜로세움·도로망 등 보편 문명의 기틀을 남겼다.' },
    { id: 'w-rome-rep', track: 'west', year: -509, label: '로마 공화정', en: 'Roman Republic',
      state: '로마', theme: '정치', kind: 'turning',
      body: '에트루리아 왕 타르퀴니우스를 추방하고 공화정 수립. 집정관 2인·원로원·민회의 혼합 정체.' },
    { id: 'w-greco-persian', track: 'west', year: -492, label: '그리스·페르시아 전쟁', en: 'Greco-Persian Wars',
      state: '그리스', theme: '군사', kind: 'turning',
      body: 'BCE 492~479 페르시아의 3차 침공에 맞선 그리스 폴리스 연합의 항쟁. 마라톤 전투(BCE 490)·살라미스 해전(BCE 480)·플라타이아이 전투(BCE 479)를 거쳐 그리스 승리. 이후 칼리아스 평화(BCE 448)로 공식 종전. 아테네 해상 패권(델로스 동맹) 확립.' },
    { id: 'w-peloponnesian', track: 'west', year: -431, label: '펠로폰네소스 전쟁', en: 'Peloponnesian War',
      state: '그리스', theme: '군사', kind: 'turning',
      body: 'BCE 431~404 아테네 중심 델로스 동맹 vs 스파르타 중심 펠로폰네소스 동맹의 27년 전쟁. BCE 404 아테네 항복으로 종결. 스파르타 패권으로 이어지지만 폴리스 문명 전체가 쇠퇴.' },
    { id: 'w-alexander-empire', track: 'west', year: -336, label: '알렉산드로스 제국', en: 'Empire of Alexander',
      state: '마케도니아', theme: '정치', kind: 'turning',
      body: 'BCE 336 알렉산드로스 즉위. 그리스 폴리스 통합 후 동방원정(BCE 334~)으로 페르시아·이집트·인더스에 이르는 대제국 건설. 그리스 문화와 동방 문화가 융합된 헬레니즘 문화 형성.' },
    { id: 'w-punic', track: 'west', year: -264, label: '로마·카르타고 전쟁', en: 'Rome–Carthage (Punic) Wars',
      state: '로마', theme: '군사', kind: 'event', noSync: true,
      body: '로마와 카르타고의 3차에 걸친 전쟁(BCE 264~146). 한니발의 알프스 횡단, 카르타고 멸망.' },
    { id: 'w-rome-emp', track: 'west', year: -27, label: '로마 제정', en: 'Roman Empire',
      state: '로마', theme: '정치', kind: 'turning',
      body: '악티움 해전(BCE 31) 승리로 지배권을 장악한 옥타비아누스가 원로원으로부터 아우구스투스 칭호를 받으며 제정 개막(BCE 27). 프린켑스(제1시민)를 자처하며 사실상 황제로 군림. 5현제 시대까지 약 200년의 팍스 로마나 → 군인 황제 시대의 혼란 → 디오클레티아누스·콘스탄티누스의 중흥 → 395년 동·서 분리.' },
    { id: 'w-jesus', track: 'west', year: 30, label: '크리스트교의 성립과 확산', en: 'Rise and Spread of Christianity',
      state: '크리스트교', theme: '종교', kind: 'turning',
      body: '팔레스타인의 예수(BCE 4?~CE 30?)가 사랑과 평등을 설파하며 활동, 십자가형으로 순교. 사도 바울 등이 이방인에게 전파하여 로마 제국 전역으로 확산. 313년 밀라노 칙령으로 공인, 392년 로마 국교로 채택.' },
    { id: 'w-edict', track: 'west', year: 313, label: '밀라노 칙령', en: 'Edict of Milan',
      state: '로마', theme: '종교', kind: 'event', noSync: true,
      body: '콘스탄티누스 대제가 크리스트교 공인. 박해받던 종교에서 후일 제국 종교(테오도시우스, 392)로.' },
    { id: 'w-split', track: 'west', year: 395, label: '로마 동·서 분열', en: 'Empire Split',
      state: '로마', theme: '정치', kind: 'event', noSync: true,
      body: '테오도시우스 황제 사후 제국이 동로마(수도 콘스탄티노폴리스)와 서로마로 분리.' },
    { id: 'w-fall', track: 'west', year: 476, label: '서로마 멸망', en: 'Fall of the Western Roman Empire',
      state: '로마', theme: '정치', kind: 'event', noSync: true,
      body: '게르만 용병대장 오도아케르가 서로마의 마지막 황제 로물루스 아우구스툴루스를 폐위(CE 476). 서로마 제국 멸망. 고대의 종말. 동로마(비잔티움 제국)는 1453년까지 지속.' },
    // ============================================================
    // 유럽·미주 EUROPE & AMERICAS — 중세 ~ 현대 (9세기 ~)
    //   교과서(세계사·동아시아 역사 기행) 연도 기준 (2026-10-02)
    // ============================================================
    { id: 'w-charlemagne', track: 'west', year: 800, label: '카롤루스 대제 대관', en: 'Coronation of Charlemagne',
      state: '프랑크 왕국', theme: '정치', kind: 'turning',
      body: '서로마 제국 멸망 후 게르만족이 세운 프랑크 왕국은 클로비스 때 로마 가톨릭교로 개종하며 성장하였다. 카롤루스 대제가 서유럽 대부분을 통합하자 교황은 800년 그를 서로마 황제로 대관하였다.' },
    { id: 'w-verdun', track: 'west', year: 843, label: '베르됭 조약', en: 'Treaty of Verdun',
      state: '프랑크 왕국', theme: '정치', kind: 'turning',
      body: '카롤루스 대제 사후 내분에 빠진 프랑크 왕국은 베르됭 조약(843)과 메르센 조약(870)으로 서프랑크·중프랑크·동프랑크로 나뉘었다. 이는 각각 프랑스·이탈리아·독일의 기원이 되었다.' },
    { id: 'w-schism', track: 'west', year: 1054, label: '동서 교회 분열', en: 'East–West Schism',
      state: '크리스트교', theme: '종교', kind: 'turning',
      body: '성상 숭배 논쟁 등으로 대립하던 크리스트교가 1054년 로마 교황을 중심으로 한 로마 가톨릭교회와 비잔티움 황제가 통제하는 그리스 정교회로 분열되었다.' },
    { id: 'w-canossa', track: 'west', year: 1077, label: '카노사의 굴욕', en: 'Walk to Canossa',
      state: '신성 로마 제국', theme: '종교', kind: 'turning',
      body: '교황 그레고리우스 7세가 성직자 서임권을 둘러싸고 신성 로마 제국 황제 하인리히 4세와 대립하였다. 파문당한 황제는 카노사에서 교황에게 용서를 구하였다. 이후 보름스 협약(1122)으로 교황이 서임권을 차지하였다.' },
    { id: 'w-crusade', track: 'west', year: 1096, label: '십자군 전쟁', en: 'Crusades',
      state: '크리스트교', theme: '군사', kind: 'turning',
      body: '셀주크 튀르크가 비잔티움 제국을 위협하자 비잔티움 황제가 교황에게 도움을 요청하였다. 교황 우르바누스 2세가 클레르몽 공의회(1095)에서 성지 회복을 호소하면서 1096년 십자군 전쟁이 시작되었다. 제4차 십자군(1202)까지 이어진 원정이 실패하면서 교황권이 약해지고 동방과의 교역이 활발해졌다.' },
    { id: 'w-avignon', track: 'west', year: 1309, label: '아비뇽 유수', en: 'Avignon Papacy',
      state: '크리스트교', theme: '종교', kind: 'turning',
      body: '프랑스 왕 필리프 4세와 교황 보니파키우스 8세가 대립한 끝에 교황청이 1309년부터 1377년까지 프랑스 아비뇽으로 옮겨져 프랑스 왕의 영향력 아래 놓였다.' },
    { id: 'w-hundred', track: 'west', year: 1337, label: '백년 전쟁', en: 'Hundred Years\' War',
      state: '영국·프랑스', theme: '군사', kind: 'turning',
      body: '프랑스 왕위 계승권 등을 두고 영국과 프랑스가 벌인 전쟁(1337~1453). 잔 다르크 등의 활약으로 프랑스가 승리하였고, 두 나라는 중앙 집권 국가로 나아갔다.' },
    { id: 'w-columbus', track: 'west', year: 1492, label: '신항로 개척', en: 'Age of Exploration',
      state: '에스파냐', theme: '경제', kind: 'turning',
      body: '에스파냐의 후원을 받은 콜럼버스가 1492년 아메리카 대륙의 서인도 제도에 도착하였다. 이후 유럽인들이 아메리카와 아시아로 가는 새로운 바닷길을 열면서 세계적인 교역망이 형성되었다.' },
    { id: 'w-gama', track: 'west', year: 1498, label: '바스쿠 다 가마 인도 도착', en: 'Vasco da Gama',
      state: '포르투갈', theme: '경제', kind: 'turning',
      body: '포르투갈의 바스쿠 다 가마가 아프리카 남쪽 끝을 돌아 인도 캘리컷에 도착하여 인도 항로를 열었다.' },
    { id: 'w-luther', track: 'west', year: 1517, label: '종교 개혁', en: 'Reformation',
      state: '크리스트교', theme: '종교', kind: 'turning',
      body: '교황이 면벌부를 판매하자 루터가 1517년 「95개조 반박문」을 발표하였다. 아우크스부르크 화의(1555)로 루터파가 공인되었고, 칼뱅의 개혁과 영국 헨리 8세의 수장법(1534) 등으로 확산되었다.' },
    { id: 'w-magellan', track: 'west', year: 1519, label: '마젤란 세계 일주', en: 'Magellan Expedition',
      state: '에스파냐', theme: '경제', kind: 'turning',
      body: '마젤란 일행이 1519년부터 1522년까지 처음으로 세계 일주 항해를 하였다.' },
    { id: 'w-aztec', track: 'west', year: 1521, label: '아스테카 제국 멸망', en: 'Fall of the Aztec Empire',
      state: '아메리카', theme: '정치', kind: 'turning',
      body: '에스파냐의 코르테스가 화포로 무장한 병력을 이끌고 아스테카 제국을 정복하였다.' },
    { id: 'w-inca', track: 'west', year: 1533, label: '잉카 제국 멸망', en: 'Fall of the Inca Empire',
      state: '아메리카', theme: '정치', kind: 'turning',
      body: '에스파냐의 피사로가 잉카 제국을 정복하였다. 이후 아메리카 문명은 철저히 파괴되었다.' },
    { id: 'w-armada', track: 'west', year: 1588, label: '무적함대 격파', en: 'Defeat of the Armada',
      state: '영국', theme: '군사', kind: 'turning',
      body: '엘리자베스 1세 시기 영국이 에스파냐의 무적함대를 격파하였다. 영국은 해외 시장을 개척하며 해상 강국으로 성장하였다.' },
    { id: 'w-louis14', track: 'west', year: 1643, label: '루이 14세 즉위', en: 'Accession of Louis XIV',
      state: '프랑스', theme: '정치', kind: 'turning',
      body: '루이 14세가 즉위하여 프랑스 절대 왕정의 전성기를 이루었다. 베르사유 궁전을 지어 강력한 왕권을 과시하였다.' },
    { id: 'w-westphalia', track: 'west', year: 1648, label: '베스트팔렌 조약', en: 'Peace of Westphalia',
      state: '신성 로마 제국', theme: '외교', kind: 'turning',
      body: '종교 문제로 1618년 시작된 30년 전쟁을 끝낸 조약. 네덜란드의 독립이 승인되고 칼뱅파가 인정되었다.' },
    { id: 'w-glorious', track: 'west', year: 1688, label: '명예혁명', en: 'Glorious Revolution',
      state: '영국', theme: '정치', kind: 'turning',
      body: '의회가 제임스 2세의 전제 정치에 맞서 그의 딸 메리와 남편 윌리엄을 공동 왕으로 추대하였다. 유혈 사태 없이 이루어져 명예혁명이라 한다. 이듬해 의회가 제출한 권리 장전을 왕이 승인하였다.' },
    { id: 'w-industrial', track: 'west', year: 1770, yearLabel: '18세기 후반', label: '산업 혁명', en: 'Industrial Revolution',
      state: '영국', theme: '경제', kind: 'turning',
      body: '18세기 후반 영국에서 기계 발명과 동력 혁명으로 생산 방식이 크게 바뀌었다. 공장제 기계 공업이 발달하고 증기 기관차 등 교통이 혁신되었으며, 도시와 노동자 계층이 성장하였다.' },
    { id: 'w-us-indep', track: 'west', year: 1776, label: '미국 독립 선언', en: 'Declaration of Independence',
      state: '미국', theme: '정치', kind: 'turning',
      body: '영국의 과세에 반발한 13개 식민지는 보스턴 차 사건(1773)과 대륙 회의(1774)를 거쳐 1776년 독립 선언문을 발표하였다. 독립 전쟁에서 승리하여 파리 조약(1783)으로 독립을 인정받았다.' },
    { id: 'w-french-rev', track: 'west', year: 1789, label: '프랑스 혁명', en: 'French Revolution',
      state: '프랑스', theme: '정치', kind: 'turning',
      body: '1789년 제3 신분 대표들이 국민 의회를 세우면서 혁명이 시작되었다. 이후 입법 의회(1791), 국민 공회(1792), 총재 정부(1795)를 거쳐 1799년 나폴레옹의 통령 정부가 수립되었다.' },
    { id: 'w-napoleon', track: 'west', year: 1804, label: '나폴레옹 황제 즉위', en: 'Napoleon Crowned Emperor',
      state: '프랑스', theme: '정치', kind: 'turning',
      body: '국민의 지지를 얻은 나폴레옹이 국민 투표로 황제에 즉위하였다(제1 제정). 유럽 대부분을 장악하고 대륙 봉쇄령을 내렸으나 러시아 원정에 실패한 뒤 몰락하였다.' },
    { id: 'w-haiti', track: 'west', year: 1804, label: '아이티 독립', en: 'Haitian Independence',
      state: '라틴 아메리카', theme: '정치', kind: 'turning',
      body: '생도맹그라고 불리던 섬의 주민들이 독립하여 라틴 아메리카 최초의 독립 국가 아이티를 세웠다. 이후 볼리바르와 산마르틴 등의 활약으로 라틴 아메리카 각국이 독립하였다.' },
    { id: 'w-vienna', track: 'west', year: 1814, label: '빈 회의', en: 'Congress of Vienna',
      state: '유럽', theme: '외교', kind: 'turning',
      body: '나폴레옹 몰락 후 유럽 각국의 대표가 모여 전후 처리를 협의한 회의(1814~1815). 혁명 이전의 질서로 되돌리려는 빈 체제가 성립하였다.' },
    { id: 'w-july', track: 'west', year: 1830, label: '7월 혁명', en: 'July Revolution',
      state: '프랑스', theme: '정치', kind: 'turning',
      body: '샤를 10세가 의회를 해산하고 선거권을 제한하는 등 전제 정치를 펼치자 파리 시민이 봉기하였다. 루이 필리프를 왕으로 추대하여 7월 왕정을 수립하였다.' },
    { id: 'w-feb', track: 'west', year: 1848, label: '2월 혁명', en: 'February Revolution',
      state: '프랑스', theme: '정치', kind: 'turning',
      body: '선거권 확대를 요구하는 시민들이 7월 왕정을 무너뜨리고 제2공화정을 수립하였다. 그 영향으로 유럽 각지에서 혁명이 일어나 빈 체제가 무너졌다.' },
    { id: 'w-italy', track: 'west', year: 1861, label: '이탈리아 왕국', en: 'Kingdom of Italy',
      state: '이탈리아', theme: '정치', kind: 'turning',
      body: '사르데냐 왕국을 중심으로 통일 운동이 전개되었다. 가리발디가 남부의 시칠리아와 나폴리를 점령하여 사르데냐 왕국에 바치면서 1861년 이탈리아 왕국이 수립되었다. 이후 베네치아를 병합하고 교황령을 점령하여 통일을 완성하였다.' },
    { id: 'w-civilwar', track: 'west', year: 1861, label: '남북 전쟁', en: 'American Civil War',
      state: '미국', theme: '정치', kind: 'turning',
      body: '노예제를 둘러싸고 남부와 북부가 대립하다 일어난 전쟁. 링컨이 노예 해방 선언(1863)을 발표하였고 북부가 승리하였다.' },
    { id: 'w-germany', track: 'west', year: 1871, label: '독일 제국', en: 'German Empire',
      state: '독일', theme: '정치', kind: 'turning',
      body: '프로이센이 통일을 주도하여 1871년 빌헬름 1세가 황제로 즉위하고 독일 제국의 성립을 선포하였다.' },
    { id: 'w-ww1', track: 'west', year: 1914, label: '제1차 세계 대전', en: 'World War I',
      state: '유럽', theme: '군사', kind: 'turning',
      body: '사라예보 사건을 계기로 1914년 시작된 전쟁. 동맹국과 협상국이 총력전을 벌였으며, 1918년 독일이 항복하였다.' },
    { id: 'w-russia', track: 'west', year: 1917, label: '러시아 혁명', en: 'Russian Revolution',
      state: '러시아', theme: '정치', kind: 'turning',
      body: '전쟁으로 고통받던 러시아에서 혁명이 일어나 황제가 물러났다. 이어 레닌이 이끄는 볼셰비키가 정권을 잡고 사회주의 정부를 세웠다. 레닌은 민족 자결의 원칙을 내세워 식민지 민족 해방 운동을 지원하겠다고 약속하였다.' },
    { id: 'w-paris', track: 'west', year: 1919, label: '파리 강화 회의', en: 'Paris Peace Conference',
      state: '유럽', theme: '외교', kind: 'turning',
      body: '제1차 세계 대전의 전후 처리를 위해 열린 회의(1919~1920). 미국 대통령 윌슨이 민족 자결주의를 담은 14개조 평화 원칙을 제시하였다. 1920년 국제 연맹이 창설되었다.' },
    { id: 'w-depression', track: 'west', year: 1929, label: '대공황', en: 'Great Depression',
      state: '미국', theme: '경제', kind: 'turning',
      body: '1929년 미국에서 시작된 경제 대공황이 전 세계로 확산되었다. 미국은 뉴딜 정책을 펼쳤고, 영국과 프랑스는 블록 경제를 형성하였다. 독일·이탈리아·일본에서는 전체주의가 대두하였다.' },
    { id: 'w-ww2', track: 'west', year: 1939, label: '제2차 세계 대전', en: 'World War II',
      state: '유럽', theme: '군사', kind: 'turning',
      body: '1939년 독일의 폴란드 침공으로 시작된 전쟁. 나치 독일은 수백만 명의 유대인을 학살하였다. 노르망디 상륙 작전(1944) 이후 연합국이 반격하였고, 1945년 일본의 항복으로 끝났다.' },
    { id: 'w-un', track: 'west', year: 1945, label: '국제 연합 창설', en: 'Founding of the United Nations',
      state: '국제', theme: '외교', kind: 'turning',
      body: '제2차 세계 대전 이후 국제 평화를 지키기 위해 1945년 51개국이 참여한 국제 연합(UN)이 창설되었다.' },
    // 한반도 문제를 다룬 국제 회의 — 한국 줄기 노드와 같은 기록
    { id: 'w-moscow', track: 'west', year: 1945, month: 12, label: '모스크바 3국 외상 회의', en: 'Moscow Conference of Foreign Ministers',
      state: '국제', theme: '외교', kind: 'turning',
      body: '1945년 12월 미국·영국·소련의 외무 장관이 모스크바에 모여 한반도에 민주주의 임시 정부를 수립하고 최대 5년간 신탁 통치를 실시하기로 결정하였다.' },
    { id: 'w-jointcomm1', track: 'west', year: 1946, month: 3, label: '제1차 미·소 공동 위원회', en: 'First US–Soviet Joint Commission',
      state: '국제', theme: '외교', kind: 'turning',
      body: '1946년 3월 서울 덕수궁에서 열렸으나, 민주주의 임시 정부 수립에 참여할 정당과 사회단체의 범위를 놓고 미국과 소련이 대립하여 휴회되었다.' },
    { id: 'w-coldwar', track: 'west', year: 1947, label: '냉전', en: 'Cold War',
      state: '국제', theme: '정치', kind: 'turning',
      body: '미국이 트루먼 독트린(1947)을 발표하여 공산주의 확산을 막겠다고 선언하면서, 미국 중심의 자본주의 진영과 소련 중심의 공산주의 진영이 대립하는 냉전이 본격화하였다.' },
    { id: 'w-jointcomm2', track: 'west', year: 1947, month: 5, label: '제2차 미·소 공동 위원회', en: 'Second US–Soviet Joint Commission',
      state: '국제', theme: '외교', kind: 'turning',
      body: '1947년 5월에 열렸으나 아무런 성과를 거두지 못하였다. 이에 미국은 한반도 문제를 유엔 총회에 넘겼다.' },
    { id: 'w-un-ga', track: 'west', year: 1947, month: 11, label: '유엔 총회', en: 'UN General Assembly',
      state: '국제', theme: '외교', kind: 'turning',
      body: '1947년 11월 유엔 총회는 유엔 감시하에 인구 비례에 따른 남북한 총선거를 실시하여 한반도에 정부를 세울 것을 결정하였다.' },
    { id: 'w-un-little', track: 'west', year: 1948, month: 2, label: '유엔 소총회', en: 'UN Interim Committee',
      state: '국제', theme: '외교', kind: 'turning',
      body: '소련이 유엔 한국 임시 위원단의 38도선 이북 방문을 거부하자, 1948년 2월 유엔은 소총회를 열어 선거 감시가 가능한 지역에서만 선거를 치르기로 결정하였다.' },
    { id: 'w-cuba', track: 'west', year: 1962, label: '쿠바 미사일 위기', en: 'Cuban Missile Crisis',
      state: '국제', theme: '군사', kind: 'turning',
      body: '소련이 쿠바에 미사일 기지를 건설하려 하자 미국과 소련이 핵전쟁 직전까지 대립한 사건.' },
    { id: 'w-berlin', track: 'west', year: 1989, label: '베를린 장벽 붕괴', en: 'Fall of the Berlin Wall',
      state: '독일', theme: '정치', kind: 'turning',
      body: '동유럽의 공산 정권이 잇달아 무너지는 가운데 1989년 동서 베를린을 가르던 장벽이 무너졌다.' },
    { id: 'w-unify', track: 'west', year: 1990, label: '독일 통일', en: 'German Reunification',
      state: '독일', theme: '정치', kind: 'turning',
      body: '베를린 장벽 붕괴 이듬해 동독과 서독이 통일하였다.' },
    { id: 'w-ussr', track: 'west', year: 1991, label: '소련 해체', en: 'Dissolution of the Soviet Union',
      state: '러시아', theme: '정치', kind: 'turning',
      body: '고르바초프의 개혁·개방 이후 소련이 해체되고 독립 국가 연합(CIS)이 출범하였다.' },
    { id: 'w-eu', track: 'west', year: 1993, label: '유럽 연합', en: 'European Union',
      state: '유럽', theme: '경제', kind: 'turning',
      body: '마스트리흐트 조약으로 1993년 12개국이 참여한 유럽 연합(EU)이 창설되었다.' },
    { id: 'w-911', track: 'west', year: 2001, label: '9·11 테러', en: 'September 11 Attacks',
      state: '미국', theme: '사회', kind: 'turning',
      body: '2001년 미국에서 9·11 테러가 일어났다.' },
    { id: 'w-ukraine', track: 'west', year: 2022, label: '러시아의 우크라이나 공격', en: 'Russian Invasion of Ukraine',
      state: '러시아', theme: '군사', kind: 'turning',
      body: '2022년 러시아가 우크라이나를 공격하였다.' },

    // ============================================================
    // 서아시아·인도 WEST ASIA · INDIA  (~3200 BCE – 661 CE)
    // ============================================================
    // ---------- 선사시대 ----------
    { id: 's-paleo', track: 'westasia', year: -1798050, yearLabel: '약 180만 년 전 ~', label: '구석기 시대', en: 'Paleolithic',
      state: '구석기', theme: '사회', kind: 'turning',
      body: '서아시아·인도의 구석기 시대 — 조지아 드마니시 유적(약 180만 년 전)에서 아프리카 밖에서 가장 이른 시기의 인류 화석이 발견되었다. 뗀석기, 채집·수렵, 동굴 거주. 이라크 샤니다르 동굴(네안데르탈인 매장 흔적)과 같은 화석 인류 유적이 분포한다.' },
    { id: 's-neolithic', track: 'westasia', year: -8050, yearLabel: '약 1만 년 전 ~', label: '신석기 시대', en: 'Neolithic',
      state: '신석기', theme: '사회', kind: 'turning',
      body: '서아시아의 신석기 시대 — 비옥한 초승달 지대에서 최초의 농경·목축. 튀르키예 차탈회위크·괴베클리 테페, 요르단강 서안의 예리코 등의 신석기 촌락 유적이 대표적이다.' },
    { id: 's-bronze', track: 'westasia', year: -3500, yearLabel: '3500 BCE 무렵 ~', label: '청동기 시대', en: 'Bronze Age',
      state: '청동기', theme: '경제', kind: 'turning',
      body: '서아시아·인도의 청동기 시대 — BCE 3500년경 메소포타미아에서 청동기를 사용한 최초의 문명 발생. 도시 국가(우르·우루크 등) 발달, 쐐기 문자, 지구라트. 인도에서는 인더스 문명(모헨조다로·하라파)이 청동기 도시 문명으로 발전.' },
    // ---------- 문명 형성 ----------
    { id: 's-mesopotamia', track: 'westasia', year: -3500, label: '메소포타미아 문명', en: 'Mesopotamian Civilization',
      state: '메소포타미아 문명', theme: '문화', kind: 'turning',
      body: '티그리스강과 유프라테스강 유역에서 발생한 인류 최초의 문명. 쐐기 문자, 태음력, 60진법, 지구라트(신전 탑) 등. 함무라비 법전(바빌로니아 왕국)이 유명하다.' },
    { id: 's-indus', track: 'westasia', year: -2500, label: '인도 문명', en: 'Indus Valley Civilization',
      state: '인도 문명', theme: '문화', kind: 'turning', sub: 1, branch: true,
      body: '인더스강 유역의 하라파·모헨조다로 등 계획 도시 문명. 정연한 격자형 도로와 배수 시설, 공중 목욕탕, 미해독 인장 문자. 기원전 2500년경 발생. — 이 지점에서 인도 기록줄기가 서아시아 원줄기에서 갈래를 냄.' },
    { id: 's-hittite', track: 'westasia', year: -1650, yearLabel: '17세기 BCE경', label: '히타이트', en: 'Hittite',
      state: '히타이트', theme: '군사', kind: 'turning',
      body: '아나톨리아 반도에 자리 잡은 인도-유럽계 제국. 철제 무기와 전차로 바빌로니아를 정복하고 이집트와 카데시 전투(BCE 1274) 후 평화 조약(BCE 1259) 체결. 철기 문화를 서아시아에 전파.' },
    { id: 's-aryan', track: 'westasia', year: -1500, label: '아리아인 인도 진입', en: 'Aryan Migration',
      state: '인도', theme: '사회', kind: 'theme', sub: 1, noSync: true,
      body: '중앙아시아의 아리아인이 인더스 강 유역으로 이주. 베다 문화와 카스트(바르나) 제도의 기원.' },
    { id: 's-phoenicia', track: 'westasia', year: -1200, yearLabel: '12세기 BCE경', label: '페니키아', en: 'Phoenicia',
      state: '페니키아', theme: '외교', kind: 'turning',
      body: '지중해 동안의 해상 무역 민족. 카르타고 등 여러 식민 도시 건설. 표음 문자(알파벳의 기원) 사용. 해상 활동으로 서아시아 문명을 유럽에 전파.' },
    { id: 's-hebrew', track: 'westasia', year: -1050, yearLabel: '11세기 BCE경', label: '헤브라이', en: 'Hebrew',
      state: '헤브라이', theme: '종교', kind: 'turning',
      body: 'BCE 11세기경 이스라엘 왕국 건설, 다윗·솔로몬 왕 때 전성. 예루살렘에 야훼의 성전 건설. 유일신 신앙(유대교) 창시. 솔로몬 사후 이스라엘·유대로 분열, 후일 바빌론 유수.' },
    { id: 's-assyria', track: 'westasia', year: -700, yearLabel: '7세기 BCE경', label: '아시리아', en: 'Assyrian Empire',
      state: '아시리아', theme: '군사', kind: 'turning',
      body: 'BCE 7세기경 철제 무기와 기마병으로 오리엔트 세계를 처음 통일한 제국. 강압적인 통치로 반란이 잇따름.' },    { id: 's-buddhism', track: 'westasia', year: -563, yearLabel: '6세기 BCE경', label: '불교 성립', en: 'Buddhism',
      state: '불교', theme: '종교', kind: 'turning', sub: 1,
      body: '갠지스강 유역에서 고타마 싯다르타(석가모니, BCE 563?~483?)가 창시. 사성제(四聖諦)·팔정도(八正道)와 윤회·해탈 사상. 카스트(바르나) 제도와 베다의 권위를 비판하고 평등을 주장. 이후 마우리아 아소카왕 때 인도 전역과 스리랑카·동남아시아로 전파.' },
    { id: 's-jainism', track: 'westasia', year: -540, yearLabel: '6세기 BCE경', label: '자이나교 성립', en: 'Jainism',
      state: '자이나교', theme: '종교', kind: 'turning', sub: 1,
      body: '마하비라(바르다마나)가 창시. 극단적 불살생(아힘사)·고행·무소유. 영혼의 해탈을 위한 엄격한 계율. 카스트 제도와 베다 권위를 비판. 주로 상공업 계층에서 신봉.' },
    { id: 's-persia', track: 'westasia', year: -550, label: '아케메네스 왕조 페르시아', en: 'Achaemenid Persia',
      state: '페르시아', theme: '정치', kind: 'turning',
      body: '키루스 2세가 메디아·리디아·신바빌로니아를 정복하고 거대 제국 건설. 다리우스 1세 때 정점.' },
    { id: 's-magadha', track: 'westasia', year: -322, label: '마우리아 왕조', en: 'Maurya Empire',
      state: '인도', theme: '정치', kind: 'turning', sub: 1,
      body: '찬드라굽타 마우리아가 마가다국을 기반으로 인도 최초의 통일 왕조 수립. 알렉산드로스가 물러난 서북 인도까지 차지.' },
    { id: 's-ashoka', track: 'westasia', year: -268, label: '아소카왕', en: 'Ashoka the Great',
      state: '인도', theme: '종교', kind: 'turning', sub: 1,
      body: '칼링가 전쟁의 참혹을 본 아소카왕이 불교에 귀의. 비폭력(아힘사) 정치, 불교의 세계 종교화.' },
    { id: 's-parthia', track: 'westasia', year: -247, label: '파르티아', en: 'Parthian Empire',
      state: '파르티아', theme: '정치', kind: 'turning',
      body: '이란계 유목민 아르사케스가 셀레우코스로부터 독립. 동서 무역(비단길)의 중계자.' },
    { id: 's-kushan', track: 'westasia', year: 50, yearLabel: '1세기 CE 중엽', label: '쿠샨 왕조', en: 'Kushan Empire',
      state: '인도', theme: '문화', kind: 'turning', sub: 1,
      body: '월지족이 세운 쿠샨 왕조. 카니슈카 왕 때 정점. 간다라 미술(헬레니즘+불교)이 동아시아로 전파.' },
    { id: 's-sasan', track: 'westasia', year: 226, label: '사산 왕조 페르시아', en: 'Sasanian Persia',
      state: '사산', theme: '정치', kind: 'turning',
      body: '아르다시르 1세가 파르티아를 멸하고 사산조 건국. 조로아스터교를 국교로 삼고 비잔티움 제국과 대립.' },
    // 페르시아 문화 묶음 라벨 노드 (hidden) — 아케메네스~사산으로 이어진 페르시아의 문화·종교를 통합 열람
    { id: 's-persia-culture', track: 'westasia', year: 226, label: '페르시아 문화', en: 'Persian Culture',
      state: '페르시아', theme: '문화', kind: 'event', hidden: true,
      body: '아케메네스 왕조에서 사산 왕조로 이어진 페르시아의 문화. 여러 민족의 문화를 수용·융합한 국제적 성격을 띠어 페르세폴리스 궁전·아람어 공용어·뛰어난 공예 기술로 나타났고, 종교에서는 조로아스터교가 널리 숭배되어 사산 왕조 때 국교가 되었다. 페르시아의 유리 공예품·금속 세공품은 유럽과 이슬람 세계, 동아시아까지 전해졌다.' },
    { id: 's-gupta', track: 'westasia', year: 320, label: '굽타 왕조', en: 'Gupta Empire',
      state: '인도', theme: '문화', kind: 'turning', sub: 1,
      body: '찬드라굽타 1세가 마가다에서 굽타 왕조 건국. 산스크리트 문학·0의 발견·아잔타 석굴. 힌두교 정착.' },

    // 이슬람 — 무함마드와 정통 칼리프 시대
    { id: 's-hijra', track: 'westasia', year: 622, label: '이슬람교 성립', en: 'Rise of Islam · Hijra',
      state: '이슬람', theme: '종교', kind: 'turning',
      body: '무함마드가 박해를 피해 메카에서 메디나로 이주(헤지라). 이슬람력의 원년(AH 1). 움마(이슬람 공동체) 수립. 이슬람교의 공식 출발점.' },
    { id: 's-rashidun', track: 'westasia', year: 632, label: '정통 칼리프 시대', en: 'Rashidun Caliphate',
      state: '이슬람 세계', theme: '정치', kind: 'turning',
      body: '무함마드 사후 아부 바크르가 1대 칼리프로 선출. 우마르·우스만·알리에 이르는 4대 정통 칼리프 시대(~661).' },
    // ============================================================
    // 서아시아·인도 WEST ASIA · INDIA — 중세 ~ 현대 (7세기 ~)
    //   중세·근세는 국가·왕조만 노드로 두고 그 시기 사건은 해당 국가 본문에 담는다 (사용자 지시 2026-10-02)
    // ============================================================
    { id: 's-umayyad', track: 'westasia', year: 661, label: '우마이야 왕조', en: 'Umayyad Caliphate',
      state: '우마이야', theme: '정치', kind: 'turning',
      body: '우마이야 가문이 칼리프 자리를 세습하며 다마스쿠스에 도읍한 왕조(661~750). 인더스강 유역에서 이베리아반도에 이르는 영토를 확보하였다. 시리아 지역의 아랍인을 우대하여 비아랍인의 불만이 높아졌다.' },
    { id: 's-abbasid', track: 'westasia', year: 750, label: '아바스 왕조', en: 'Abbasid Caliphate',
      state: '아바스', theme: '정치', kind: 'turning',
      body: '아바스 가문이 비아랍인과 시아파의 도움으로 우마이야 왕조를 무너뜨리고 세운 왕조(750~1258). 바그다드를 새 수도로 삼고 민족 차별 정책을 폐지하였다. 751년 탈라스 전투 이후 제지법이 이슬람 세계에 전해졌다. 1258년 몽골에 멸망하였다.' },
    { id: 's-fatimid', track: 'westasia', year: 909, label: '파티마 왕조', en: 'Fatimid Caliphate',
      state: '파티마', theme: '정치', kind: 'turning',
      body: '10세기 초 북아프리카에서 일어나 이집트를 정복한 시아파 왕조(909~1171). 칼리프 칭호를 사용하여 아바스 왕조·후우마이야 왕조와 함께 칼리프가 셋으로 나뉜 분열의 시대를 열었다.' },
    { id: 's-seljuk', track: 'westasia', year: 1055, label: '셀주크 튀르크', en: 'Seljuk Turks',
      state: '셀주크 튀르크', theme: '정치', kind: 'turning',
      body: '튀르크계 셀주크 튀르크가 1055년 바그다드에 입성하여 술탄 칭호를 얻고 실권을 장악하였다. 1071년 만지케르트 전투에서 비잔티움 제국을 물리치고 예루살렘을 점령하여 십자군 전쟁의 계기가 되었다.' },
    { id: 's-delhi', track: 'westasia', year: 1210, yearLabel: '13세기 초', label: '델리 술탄 왕조', en: 'Delhi Sultanate',
      state: '인도', theme: '정치', kind: 'turning', sub: 1,
      body: '아이바크가 델리를 정복한 후 이슬람 왕조를 세웠고, 13세기 초부터 북인도에서 다섯 왕조가 이어졌다. 힌두교도가 지즈야(인두세)를 내면 신앙을 인정하는 관용 정책을 펼쳤으며, 인도에 이슬람 양식의 건물들이 세워졌다.' },
    { id: 's-ottoman', track: 'westasia', year: 1299, label: '오스만 제국', en: 'Ottoman Empire',
      state: '오스만 제국', theme: '정치', kind: 'turning',
      body: '셀주크 튀르크가 몽골의 침입으로 무너지자 튀르크 계통의 오스만족이 소아시아에 세운 나라(1299). 앙카라 전투(1402)에서 티무르 왕조에 패하였으나, 1453년 콘스탄티노폴리스를 점령하여 비잔티움 제국을 멸망시켰다. 술레이만 1세 때 헝가리를 정복하고 빈을 포위하였으며(1529), 레판토 해전(1571)에서 에스파냐 등에 패하였다.' },
    { id: 's-safavid', track: 'westasia', year: 1501, label: '사파비 왕조', en: 'Safavid Dynasty',
      state: '이란', theme: '정치', kind: 'turning',
      body: '1501년 이란 지역에서 성립하여 시아파 이슬람교를 국교로 정한 왕조. 아바스 1세 때 전성기를 맞아 이스파한으로 수도를 옮겼다.' },
    { id: 's-mughal', track: 'westasia', year: 1526, label: '무굴 제국', en: 'Mughal Empire',
      state: '인도', theme: '정치', kind: 'turning', sub: 1,
      body: '티무르의 후손으로 알려진 바부르가 델리 술탄 왕조를 정복하고 1526년 세운 나라. 아크바르 황제(1556 즉위)는 지즈야를 폐지하고 힌두교도에게 관직을 개방하는 등 관용 정책을 펼쳤다.' },
    { id: 's-aurangzeb', track: 'westasia', year: 1658, label: '아우랑제브 즉위', en: 'Accession of Aurangzeb',
      state: '인도', theme: '정치', kind: 'turning', sub: 1,
      body: '아우랑제브 황제는 영토를 크게 넓혔으나, 이슬람 제일주의를 내세워 지즈야를 부활시키고 힌두교 사원을 파괴하는 등 비이슬람교도를 탄압하였다. 이에 각지에서 반란이 일어났다.' },
    { id: 's-plassey', track: 'westasia', year: 1757, label: '플라시 전투', en: 'Battle of Plassey',
      state: '인도', theme: '군사', kind: 'turning', sub: 1,
      body: '영국 동인도 회사가 플라시 전투에서 프랑스를 물리치고 벵골 지역의 통치권을 차지하였다. 이후 영국은 19세기 중엽 인도 대부분을 차지하였다.' },
    { id: 's-tanzimat', track: 'westasia', year: 1839, label: '탄지마트', en: 'Tanzimat',
      state: '오스만 제국', theme: '정치', kind: 'turning',
      body: '오스만 제국이 1839년부터 ‘탄지마트(은혜 개혁)’라고 불리는 근대적 개혁을 추진하였다. 이후 의회 설립을 규정한 헌법을 제정하였으나(1876), 술탄 중심의 전제 정치로 헌법이 폐기되었다.' },
    { id: 's-sepoy', track: 'westasia', year: 1857, label: '세포이의 항쟁', en: 'Sepoy Mutiny',
      state: '인도', theme: '군사', kind: 'turning', sub: 1,
      body: '영국의 수탈과 인도의 종교적 전통을 무시하는 데 반발하여 동인도 회사의 인도인 용병(세포이)이 항쟁을 일으켰다(~1859). 대규모 민족 운동으로 발전하였으나 영국에 진압되었고, 무굴 제국 황제는 폐위되었다.' },
    { id: 's-indian-empire', track: 'westasia', year: 1877, label: '인도 제국', en: 'British Indian Empire',
      state: '인도', theme: '정치', kind: 'turning', sub: 1,
      body: '세포이의 항쟁을 진압한 영국이 인도를 직접 지배하는 영국령 인도 제국이 성립하였다.' },
    { id: 's-inc', track: 'westasia', year: 1885, label: '인도 국민 회의', en: 'Indian National Congress',
      state: '인도', theme: '정치', kind: 'turning', sub: 1,
      body: '인도인의 정치 기구로 결성되었다. 초기에는 영국의 인도 지배를 인정하면서 인도인의 권익 신장을 추구하였다.' },
    { id: 's-bengal', track: 'westasia', year: 1905, label: '벵골 분할령', en: 'Partition of Bengal',
      state: '인도', theme: '정치', kind: 'turning', sub: 1,
      body: '영국이 벵골 분할령을 발표하자 인도 국민 회의는 반영 운동으로 돌아섰다. 영국은 1911년 분할령을 취소하였다.' },
    { id: 's-iran-const', track: 'westasia', year: 1906, label: '이란 입헌 혁명', en: 'Persian Constitutional Revolution',
      state: '이란', theme: '정치', kind: 'turning',
      body: '열강이 이권을 침탈하고 영국이 카자르 왕조로부터 담배 독점권을 얻자 담배 불매 운동이 일어났다. 이러한 저항이 이어져 1906년 입헌 혁명이 일어나고 헌법이 제정되었다.' },
    { id: 's-young-turk', track: 'westasia', year: 1908, label: '청년 튀르크당 혁명', en: 'Young Turk Revolution',
      state: '오스만 제국', theme: '정치', kind: 'turning',
      body: '술탄의 전제 정치에 맞서 청년 튀르크당이 봉기하여 정권을 잡고 개혁을 추진하였다. 그러나 극단적인 튀르크 민족주의로 제국 내 다른 민족의 독립운동을 탄압하였다.' },
    { id: 's-turkey', track: 'westasia', year: 1923, label: '튀르키예 공화국', en: 'Republic of Türkiye',
      state: '튀르키예', theme: '정치', kind: 'turning',
      body: '제1차 세계 대전 후 무스타파 케말이 술탄제를 폐지하고 1923년 튀르키예 공화국을 수립하였다. 여성의 지위 향상 등 근대화 정책을 추진하였다.' },
    { id: 's-partition', track: 'westasia', year: 1947, label: '인도·파키스탄 분리 독립', en: 'Partition of India',
      state: '인도', theme: '정치', kind: 'turning', sub: 1,
      body: '인도는 1947년 영국으로부터 독립하였으나, 힌두교도 중심의 인도 연방과 이슬람교도 중심의 파키스탄으로 분리되었다.' },
    { id: 's-israel', track: 'westasia', year: 1948, label: '이스라엘 건국', en: 'Founding of Israel',
      state: '이스라엘', theme: '정치', kind: 'turning',
      body: '팔레스타인 지역에 이스라엘이 건국되면서 그곳에 살던 아랍인은 삶의 터전을 잃었다. 이후 팔레스타인 분쟁이 이어졌다.' },
    { id: 's-oslo', track: 'westasia', year: 1993, label: '오슬로 협정', en: 'Oslo Accords',
      state: '팔레스타인', theme: '외교', kind: 'turning',
      body: '이스라엘과 팔레스타인 해방 기구 사이에 오슬로 협정이 체결되었으나 분쟁은 계속되었다.' },
    { id: 's-syria', track: 'westasia', year: 2011, label: '시리아 내전', en: 'Syrian Civil War',
      state: '시리아', theme: '정치', kind: 'turning',
      body: '2011년 시리아 내전이 일어났다. 내전 과정에서 발생한 시리아 난민 수용 문제는 유럽 사회의 쟁점으로 떠올랐다.' },
  ]
};

window.TIMELINE_DB = {
  'k-balhae': {
    syncRatio: 0.88,
    fileRef: 'KR · 한국 원줄기 · 남북국 시대',
    // 문서 연출(스캔 문서) 적용 노드 — 탭: 지도·요약·상세·자료·탐구
    //   {{원본|왜곡}} = LUMINA가 바꿔 쓴 문장. 대응반 접속 시 왜곡된 문장이 보이고, 찾아 누르면 원본으로 정정된다.
    //   왜곡은 지도·요약·상세에만 넣는다. 자료·탐구 탭은 대응반 접속 시 봉인되었다가 모두 정정하면 열린다.
    //   연구원 접속에서는 원본만 보이고 탭 5개가 모두 열려 있다.
    docMode: true,
    docNo: 'KR-0698-BH',
    notes: {
      sections: [
        { head: 'I. 건국 (698)', list: [
          '고구려 멸망(668) 이후 고구려 유민의 저항',
          '대조영이 {{고구려 유민·말갈인을 이끌고 동모산에서 건국|속말 말갈인을 이끌고 당의 허락 아래 동모산에서 건국}}',
          '국호: 진(震) → 발해'
        ] },
        { head: 'II. 발전', list: [
          '무왕: 영토 확장, 장문휴의 수군이 당의 산둥 지방(등주) 공격(732)',
          '문왕: 당과 친선, 체제 정비, 상경으로 천도',
          '선왕: 최대 영토 확보 → 「해동성국」'
        ] },
        { head: 'III. 통치 체제', list: [
          '중앙: 3성 6부 — {{정당성 중심, 6부에 유교식 명칭|당의 관제를 명칭까지 그대로 사용}}',
          '감찰 기구 중정대 · 서적 관리 문적원 · 교육 기관 주자감',
          '지방: 5경 15부 62주'
        ] },
        { head: 'IV. 고구려 계승 의식', list: [
          '무왕의 국서: 「고구려의 옛 땅을 회복하고 부여의 풍속을 이었다」',
          '문왕: 일본에 보낸 국서에 「{{고려국왕|발해군왕}}」 칭호',
          '굴식 돌방무덤·모줄임천장(정혜공주 묘), 온돌 → 고구려 문화 계승'
        ] },
        { head: 'V. 멸망', list: [
          '926년 거란(요)의 침입으로 멸망'
        ] }
      ]
    },
    overview: {
      summary: '발해 — 고구려가 멸망한 뒤 대조영이 고구려 유민과 말갈인을 이끌고 698년 동모산에서 세운 나라. 남쪽의 통일신라와 함께 남북국을 이루었으며, {{고구려 계승 의식을 분명히 드러냈다|당의 지방 정권으로서 당에 복속하였다}}. 9세기 선왕 때 전성기를 맞아 「해동성국」으로 불렸고, 926년 거란에 멸망하였다.',
      terms: [
        { label: '대조영', def: '{{고구려 장수 출신|속말 말갈의 추장 출신}}. 698년 고구려 유민과 말갈인을 이끌고 동모산에서 발해를 건국.' },
        { label: '남북국 시대', def: '남쪽의 통일신라와 북쪽의 발해가 함께 존재한 시기.' },
        { label: '해동성국', def: '「바다 동쪽의 융성한 나라」. 선왕 때 최대 영토를 이룬 발해를 가리킨 이름.' },
        { label: '3성 6부', def: '당의 제도를 받아들였으나 정당성 중심으로 운영하고 6부에 유교식 명칭을 붙이는 등 독자적으로 운영.' },
        { label: '고구려 계승', def: '일본에 보낸 국서의 「고려국왕」 칭호, 고구려식 굴식 돌방무덤과 모줄임천장, 온돌 등에서 확인된다.' }
      ],
      timeline: [
        { y: 698, label: '대조영, 동모산에서 건국' },
        { y: 732, label: '무왕 — 장문휴, 당의 산둥 지방(등주) 공격' },
        { y: 756, label: '문왕 — 상경으로 천도 (756년경)' },
        { y: 818, label: '선왕 즉위 — 최대 영토, 「해동성국」' },
        { y: 926, label: '거란(요)의 침입으로 멸망' }
      ]
    },
    // LUMINA 접근·왜곡 보고 — 대응반 접속 시 지도 탭 옆에 뜨는 문서. ████ = 접근 흔적(판독 불가)
    lumina: {
      detected: '████. ██. ██  02:14 (서고 시각)',
      route: '제0열람실 제███석 → 한국 계통 · 7세기 말 서가 → 문서 KR-0698-BH 계열',
      accessor: '████████████',
      method: '기록 본문 개작 — 지도·요약·상세 문서의 문장을 지우지 않고 다른 문장으로 바꿔 씀. 부속 자료철·사료 탐구 보고는 열람 봉인',
      claims: [
        '발해는 속말 말갈인이 세운 나라이다.',
        '대조영은 당의 책봉을 받은 「발해군왕」이며, 발해는 당의 지방 정권이다.',
        '발해의 제도와 문화는 당의 것을 그대로 옮겨 온 것이다.',
        '따라서 발해의 역사는 한국사가 아니라 중국 동북 지방의 역사이다.'
      ],
      evidence: [
        '대조영은 고구려 장수 출신으로, 고구려 유민과 말갈인을 이끌고 동모산에서 발해를 세웠다(698).',
        '발해 왕은 일본에 보낸 국서에서 스스로 「고려국왕」이라 칭하였고, 일본은 발해에 보낸 사신을 「견고려사」라 하였다.',
        '발해는 당의 3성 6부를 받아들였으나 정당성 중심으로 운영하고 6부의 명칭을 유교 덕목에서 따오는 등 독자적으로 운영하였다.',
        '굴식 돌방무덤과 모줄임천장(정혜공주 묘), 온돌 등에서 고구려 문화를 계승한 모습이 확인된다.'
      ],
      cite: '동아출판 고등 한국사1 p.23 · 한국사2 「동아시아의 역사 갈등」'
    },
    // 지도 — 교과서 「발해의 발전」 지도 기준
    map: {
      title: '발해의 영역과 5경',
      googleQuery: 'Dunhua, Jilin, China',
      googleZoom: 6,
      pins: [
        { label: '동모산(둔화)', sub: '698 건국', amber: true },
        { label: '상경 용천부(닝안)' },
        { label: '중경 현덕부(허룽)' },
        { label: '동경 용원부(훈춘)' },
        { label: '서경 압록부(린장)' },
        { label: '남경 남해부(북청 추정)' },
        { label: '등주(산둥반도)', sub: '732 공격', red: true }
      ],
      notes: [
        '대조영은 고구려 유민과 말갈인을 이끌고 요동 지역으로 이동한 뒤, 추격해 온 당의 군대를 물리치고 동모산 근처에서 발해를 세웠다(698).',
        '무왕은 활발한 정복 활동으로 영토를 크게 넓혔고, 당이 압박해 오자 장문휴를 보내 당의 산둥 지방을 공격하였다(732).',
        '선왕 때 말갈 세력 대부분을 복속시키고 영토를 넓혀 {{옛 고구려 영토 대부분을|당이 설치한 홀한주 도독부의 관할 지역을}} 차지하였다.',
        '전략적 요충지에는 5경을 두었다. 지방은 5경 15부 62주로 정비하였다.'
      ],
      cite: '동아출판 고등 한국사1 p.23 「발해의 발전」'
    },
    // 자료 — 교과서 도판
    artifacts: [
      { slot: 'map', src: 'assets/w1/고대/한국/k-balhae-map.jpg',
        caption: '발해의 발전',
        note: '698년 동모산에서 건국, 732년 산둥반도(등주) 공격. 붉은 네모 표시는 발해의 5경. 발해가 랴오둥반도까지는 장악하지 못했다는 의견도 있다.',
        ref: '동아출판 고등 한국사1 p.23' },
      { slot: 'diagram', src: 'assets/w1/고대/한국/k-balhae-gov.jpg',
        caption: '발해의 중앙 통치 제도',
        note: '정당성의 장관인 대내상이 국가 행정을 총괄하였다. 좌사정과 우사정을 두고 3부씩 담당하게 하였으며, 6부의 명칭은 유교 덕목에서 따왔다. ( ) 안은 당의 관제.',
        ref: '동아출판 고등 한국사1 p.23' }
    ],
    // 탐구 — 상단 탐구 자료 이미지 + 분석 기록
    inquiry: {
      title: '발해에 대한 당시 사람들의 인식',
      src: 'assets/w1/고대/한국/k-balhae-insik.jpg',
      cite: '동아출판 고등 한국사1 p.23',
      question: '발해가 세워질 무렵, 발해와 주변 나라들은 발해를 어떤 나라로 인식하였을까?',
      findings: [
        { who: '발해', src: '「발해가 일본에 보낸 국서」',
          text: '문왕(대흠무)은 스스로를 「고(구)려 국왕」이라 칭하였다. 발해가 스스로 고구려를 잇는 나라임을 내세운 것이다.' },
        { who: '일본', src: '『속일본기』 · 나라 시대의 목간',
          text: '일본은 발해 국왕을 「고(구)려 국왕」이라 불렀고, 발해에 보낸 사신을 「견고려사」라고 하였다.' },
        { who: '신라', src: '최치원, 『고운집』',
          text: '최치원은 「지난날의 고구려가 오늘의 발해이다」라고 기록하였다.' },
        { who: '당', src: '『구당서』',
          text: '『구당서』는 「대조영은 본래 고구려의 별종이다」라고 기록하였다.' }
      ],
      conclusion: '발해 자신은 물론 일본·신라·당 모두 발해를 고구려와 이어진 나라로 인식하였다. 이는 발해가 고구려를 계승한 나라였음을 보여 주는 근거이다.'
    }
  },

  // ============================================================
  // [개요 보강] 유럽·미주 / 서아시아·인도 갈래점 노드 — 교과서 핵심 정리
  //   db 미색인이라 기록 열람이 "no data"로 뜨던 turning 노드의 개요(OVERVIEW) 파트 추가.
  //   출처: 미래엔 세계사 1 / 비상교육 세계사 교사용 교과서 (assets/w1/교과서)
  // ============================================================

  // ---------- 유럽·미주 ----------
  'w-rome-rep': {
    syncRatio: 0.90,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    overview: {
      summary: '로마 공화정 — 에트루리아 왕(타르퀴니우스)을 추방하고 BCE 509년에 수립된 귀족 중심의 공화 정치. 임기 1년의 집정관(콘술) 2인이 행정·군사를 맡고, 귀족(파트리키)의 원로원이 실질적인 정책을 결정하였으며, 비상사태에는 독재관을 임명하였다. 평민(플레브스)은 상공업 발달로 부를 쌓고 중장 보병으로 군대의 주력이 되면서 신분 투쟁을 벌여, 호민관·평민회 설치(BCE 494), 최초의 성문법 12표법(BCE 451), 집정관 1인을 평민에게 개방한 리키니우스법(BCE 367), 평민회 의결을 원로원 승인 없이 법으로 인정한 호르텐시우스법(BCE 287)을 얻어 귀족과 법적으로 동등한 권리를 확보하였다. 대외적으로는 이탈리아 반도를 통일하고, 한니발과 스키피오가 맞선 로마·카르타고 전쟁(BCE 264~146)에서 카르타고를 무너뜨려 지중해의 패권을 장악하였다. 그러나 정복으로 노예 노동의 대농장(라티푼디움)이 확산되며 자영농이 몰락하자, 그라쿠스 형제가 농지법·곡물법으로 개혁을 시도했으나 원로원 귀족의 반발로 실패하였다. 이후 벌족파와 민중파의 대립, 삼두 정치와 내란을 거쳐 악티움 해전(BCE 31)에서 승리한 옥타비아누스가 제정을 열면서(BCE 27) 공화정은 막을 내렸다.',
      terms: [
        { label: '집정관(콘술) · 원로원', def: '최고 관직 집정관 2인(임기 1년)과 귀족으로 구성된 원로원이 정치를 주도. 비상사태에는 독재관을 임명.' },
        { label: '호민관 · 평민회', def: '신분 투쟁으로 평민이 얻어낸 관직·의결 기구. 호민관은 집정관 등의 결정에 거부권을 행사.' },
        { label: '12표법 · 리키니우스법 · 호르텐시우스법', def: '12표법(최초의 성문법) → 리키니우스법(집정관 1인 평민 개방) → 호르텐시우스법(평민회 의결의 법적 효력).' },
        { label: '로마·카르타고 전쟁', def: '카르타고와 벌인 세 차례 전쟁(BCE 264~146). 한니발의 침입을 스키피오가 격퇴하고 서지중해 패권을 장악.' },
        { label: '라티푼디움 · 그라쿠스 형제', def: '노예 노동의 대농장 확산으로 자영농 몰락. 그라쿠스 형제가 농지법·곡물법으로 개혁을 시도했으나 실패.' },
        { label: '삼두 정치 · 악티움 해전', def: '1차(카이사르·크라수스·폼페이우스)·2차(옥타비아누스·안토니우스·레피두스) 삼두 정치의 내란 → 악티움 해전(BCE 31) 승리로 옥타비아누스가 지배권 장악 → 제정.' }
      ],
      timeline: [
        { y: -509, label: '◆ 공화정 수립 — 에트루리아 왕 추방' },
        { y: -494, label: '호민관·평민회 설치 (신분 투쟁)' },
        { y: -451, label: '12표법 제정' },
        { y: -264, label: '로마·카르타고 전쟁 시작 (~BCE 146)' },
        { y: -133, label: '그라쿠스 형제의 개혁 (~BCE 121)' },
        { y: -31,  label: '악티움 해전 — 옥타비아누스 승리' },
        { y: -27,  label: '제정 시작 → 공화정 종말' }
      ]
    },
    notes: {
      sections: [
        {
          head: 'I. 수립',
          list: [
            'BCE 6세기 말, 에트루리아 왕을 몰아내고 수립',
            '원로원 - 집정관 2인(콘술) - 민회로 구성'
          ]
        },
        {
          head: 'II. 평민권의 성장',
          list: [
            '상공업 발달 → 부유해진 평민 → 중장보병으로 군대의 주력 담당',
            '귀족 중심 정치에 대한 불만, 평민들의 신분 투쟁 → 정치적 권리 요구',
            '호민관·평민회 설치',
            '  · 평민 권리 신장',
            '  · 호민관: 집정관 등의 결정 거부권 행사 가능',
            '  · 평민회: 평민들의 의결 기구, 대표자 호민관',
            '법률 제정',
            '  · 12표법: 로마 최초의 성문법',
            '  · 리키니우스-섹스티우스법 (BCE 367) — 2명 집정관 중 1명은 평민에서 선출',
            '  · 호르텐시우스법 (BCE 287) — 평민회 결의가 원로원 승인 없이 법적 효력',
            '평민이 법률상 귀족과 동등한 권리 획득'
          ]
        },
        {
          head: 'III. 대외 팽창',
          list: [
            '이탈리아 반도 통일 (BCE 272)',
            '로마·카르타고 전쟁 (BCE 264~146)',
            '  · VS 카르타고, 1~3차에 걸친 전쟁',
            '  · 로마의 승리, 서지중해 패권 장악',
            '마케도니아와 그리스 정복',
            '현재 튀르키예 일부 지역까지 세력 확대',
            '결과',
            '  · 지중해 대부분 지배',
            '  · 정복지 속주화 및 총독 파견 통치'
          ]
        },
        {
          head: 'IV. 위기와 붕괴',
          list: [
            '라티푼디움',
            '  · 노예 노동을 이용한 대농장 경영 → 자영농 몰락, 빈민 양상',
            '그라쿠스 형제의 개혁',
            '  · 티베리우스 그라쿠스, 가이우스 그라쿠스',
            '  · 자영농 재건과 빈민 구제 정책을 통한 개혁 추진',
            '  · 농지법 (BCE 133): 호민관 티베리우스, 유력자 대토지 점유 제한',
            '  · 곡물법 (BCE 123): 호민관 가이우스, 빈민에게 값싼 곡물 제공',
            '  · 원로원 내 귀족들의 반발로 실패',
            '귀족(벌족)파 VS 평민(민중)파 = 대립 및 갈등 심화',
            '동맹시 전쟁 (BCE 91~88), 스파르타쿠스의 난 (BCE 73~71)',
            '제1차 삼두 정치: 폼페이우스, 크라수스, 카이사르',
            '제2·3차 삼두 정치: 옥타비아누스, 안토니우스, 레피두스',
            '악티움 해전 (BCE 31)에서 옥타비아누스 승리 → 로마 지배권 장악'
          ]
        }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '로마 공화정의 정치 형태',
        src: 'assets/w1/고대/유럽·미주/로마 공화정/로마 공화정의 구조.jpg',
        citation: '— 폴리비오스 『역사』 · 군주정(집정관)·귀족정(원로원)·민주정(평민회)의 세 요소가 견제와 균형을 이룬 혼합 정체' },
      { kind: '탐구 자료', title: '12표법의 의의',
        src: 'assets/w1/고대/유럽·미주/로마/12표법의 의의.png',
        citation: '— 키케로 『연설가에 대하여』 · 12표법은 모든 법의 원천이며, 그리스 철학자들의 모든 저술을 합친 것보다 소중하다' },
      { kind: '탐구 자료', title: '로마·카르타고 전쟁',
        src: 'assets/w1/고대/유럽·미주/로마 공화정/로마·카르타고 전쟁.jpg',
        citation: '— 폴리비오스 『역사』 · 스키피오가 한니발의 공격을 격퇴하고 카르타고를 점령. 로마의 승전과 카르타고의 패배를 필연적 숙명으로 규정' },
      { kind: '탐구 자료', title: '티베리우스 그라쿠스의 개혁',
        src: 'assets/w1/고대/유럽·미주/로마 공화정/그라쿠스의 개혁.jpg',
        citation: '— 카시우스 디오 『로마사』 · 농지법을 제출해 대중의 이익을 도모했으나 기존 관습·전통과 충돌, 반대파에 맞서 형제(가이우스)와 연대' },
      { kind: '탐구 자료', title: '제1차 삼두 정치의 전개',
        src: 'assets/w1/고대/유럽·미주/로마 공화정/제1차 삼두 정치의 전개.jpg',
        citation: '— 플로루스 『로마사 개요』 · 카이사르(갈리아)·크라수스(아시아)·폼페이우스(히스파니아)가 권력을 나눠 갖고 세계를 지배' },
      { kind: '탐구 자료', title: '카이사르의 개혁에 대한 키케로의 비판',
        src: 'assets/w1/고대/유럽·미주/로마 공화정/카이사르 개혁에 대한 키케로의 비판.jpg',
        citation: '— 키케로 『농지법에 관하여』 · 카이사르의 농지법을 그라쿠스처럼 국가 재정을 고갈시킨다고 비판' },
      { kind: '탐구 자료', title: '옥타비아누스의 이집트 지배',
        src: 'assets/w1/고대/유럽·미주/로마 공화정/옥타비아누스의 이집트 지배.png',
        citation: '— 이집트 부조 · 악티움 해전에서 승리한 옥타비아누스를 파라오로 표현. 클레오파트라를 대신한 이집트의 명실상부한 지배자' }
    ],
    artifacts: [
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/로마 공화정/[비상교육] 고등_세계사_1-3_50p_그라쿠스 형제.jpg',
        caption: '그라쿠스 형제',
        ref: '비상교육 세계사 1-3, p.50 — 티베리우스·가이우스 그라쿠스. 농지법(BCE 133)·곡물법(BCE 123)으로 자영농 재건과 빈민 구제를 추진했으나 원로원 귀족들의 반발로 실패' }
    ]
  },

  'w-greek-culture': {
    syncRatio: 0.90,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    overview: {
      summary: '그리스 문화 — 폴리스를 무대로 발달한 고대 그리스의 문화로, 인간을 중심에 둔 합리적·조화로운 성격이 특징이다. 그리스인은 신들도 인간과 같은 모습과 감정을 지닌 존재로 여겼으며, 이러한 인간 중심적 세계관은 문학·예술·철학 전반에 흐른다. 문학에서는 호메로스의 서사시 『일리아스』·『오디세이아』와 아이스킬로스·소포클레스·에우리피데스의 비극, 아리스토파네스의 희극이 발달하였다. 건축과 조각은 파르테논 신전과 아테나 여신상, 「원반 던지는 사람」처럼 조화와 균형의 미를 추구하였다. 철학은 만물의 근원을 탐구한 자연 철학에서 출발해, 인간과 사회로 관심을 돌린 소피스트(진리의 상대성)와 이에 맞서 절대적·보편적 진리를 강조한 소크라테스, 세계를 현실 세계와 이상적인 이데아 세계로 구분한 플라톤, 여러 학문을 집대성한 아리스토텔레스로 이어졌다. 역사 서술에서는 헤로도토스가 『역사』에서 페르시아 전쟁을, 투키디데스가 『펠로폰네소스 전쟁사』를 남겼다. 이 문화는 헬레니즘 시대를 거쳐 로마로 계승되어 서양 문화의 뿌리가 되었다.',
      terms: [
        { label: '인간 중심주의', def: '신도 인간과 같은 모습·감정을 지닌다고 본, 인간을 중심에 둔 그리스 고전 문화의 근본 성격.' },
        { label: '호메로스', def: '서사시 『일리아스』·『오디세이아』를 남긴 시인. 그리스 문학과 정체성의 바탕.' },
        { label: '파르테논 신전', def: '아테나 여신에게 바친 신전. 조화와 균형을 추구한 고전기 건축의 정수.' },
        { label: '소피스트', def: '인간과 변론에 주목한 직업 교사 집단. 진리의 상대성·주관성을 강조.' },
        { label: '소크라테스', def: '소피스트에 맞서 진리의 절대성·보편성을 강조한 철학자. 문답법으로 진리를 탐구.' },
        { label: '플라톤·아리스토텔레스', def: '플라톤은 세계를 현실 세계와 이상적인 이데아 세계로 구분했고, 아리스토텔레스는 여러 학문을 집대성하였다.' },
        { label: '헤로도토스·투키디데스', def: '헤로도토스는 『역사』로 페르시아 전쟁을, 투키디데스는 『펠로폰네소스 전쟁사』를 서술한 역사가.' }
      ],
      timeline: [
        { y: -800, label: '◆ 그리스 문화 형성 (대표 표기) — 호메로스 서사시' },
        { y: -472, label: '아이스킬로스 비극 상연 — 3대 비극 작가 활동' },
        { y: -447, label: '파르테논 신전 건축 시작 (~432)' },
        { y: -430, label: '헤로도토스 『역사』 · 소피스트 활동' },
        { y: -399, label: '소크라테스 사망' },
        { y: -387, label: '플라톤 아카데메이아 설립' },
        { y: -335, label: '아리스토텔레스 리케이온 설립' }
      ]
    },
    notes: {
      sections: [
        {
          head: 'I. 인간 중심주의',
          list: [
            '그리스 고전 문화를 관통하는 특징',
            '그리스의 신들 = 인간과 같은 모습·감정',
            '서양 문학과 예술의 원천'
          ]
        },
        {
          head: 'II. 문학',
          list: [
            '서사시: 호메로스 『일리아스』·『오디세이아』',
            '비극: 아이스킬로스, 소포클레스, 에우리피데스',
            '희극: 아리스토파네스 『개구리들』',
            '이외에도 서정시 발달'
          ]
        },
        {
          head: 'III. 건축 및 조각',
          list: [
            '파르테논 신전, 아테나 여신상 = 조화와 균형의 미'
          ]
        },
        {
          head: 'IV. 철학',
          list: [
            '자연 철학(6세기경): 우주와 만물의 근원 탐구',
            '소피스트',
            '  · 인간에 대한 관심 증가',
            '  · 수사학과 변론 구사 → 진리의 상대성 및 주관성 강조',
            '소크라테스: 진리의 절대성 및 보편성 강조',
            '플라톤: 이상 국가 ‘이데아(Idea)’ 제시',
            '아리스토텔레스',
            '  · 인간은 정치적 동물임을 강조, 여러 학문 정리'
          ]
        },
        {
          head: 'V. 역사',
          list: [
            '헤로도토스 『역사』',
            '  · 페르시아 전쟁 탐구',
            '투키디데스 『펠로폰네소스 전쟁사』'
          ]
        }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '그리스 문화의 발달',
        src: 'assets/w1/고대/유럽·미주/그리스 문화/그리스 문화의 발달.png',
        citation: '— 철학의 발달 · 소크라테스(진리는 상대적·주관적인 것이 아니라 보편적이고 절대적이다) · 플라톤(개인에게 주어진 역할에 따라 최선을 다하며 조화를 이룬다면 이상 국가가 형성된다) · 아리스토텔레스(오직 현실에서만 진리를 발견할 수 있다)' }
    ],
    artifacts: [
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/그리스 문화/[비상교육] 고등_세계사_1-3_48p_파르테논 신전.jpg',
        caption: '파르테논 신전',
        ref: '비상교육 세계사 1-3, p.48 — 아크로폴리스의 아테나 여신 신전. 조화와 균형의 미' },
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/그리스 문화/원반 던지는 사람.jpg',
        caption: '원반 던지는 사람',
        ref: '미론 作 — 인체의 균형과 운동의 순간을 포착한 고전기 그리스 조각' }
    ],
    linked: ['w-polis', 'w-sparta', 'w-athens', 'w-alexander-empire']
  },

  'w-rome-emp': {
    syncRatio: 0.92,
    fileRef: 'WN · 세계사 연표(정리 탭) / W1 · 미래엔 세계사 1',
    overview: {
      summary: '로마 제정 — 제2차 삼두 정치 시기 내전에서 승리한 옥타비아누스가 혼란을 수습하자 원로원이 아우구스투스(존엄한 자) 칭호를 부여하며 시작된 로마의 황제 정치(BCE 27). 그는 프린켑스(제1시민)를 자처하며 공화정의 여러 제도를 유지하는 듯했으나, 군사 지휘권과 재정을 장악해 사실상 황제로 군림하였다. 이후 5현제(네르바→트라야누스→하드리아누스→안토니누스 피우스→마르쿠스 아우렐리우스) 시대까지 약 200년간 로마는 평화와 번영을 누리고 영토가 최대(117년)에 이르렀다(로마의 평화, Pax Romana). 그러나 3세기 초반부터 군대가 정치에 개입하는 군인 황제 시대가 전개되어 내분과 이민족(게르만족·사산 조 페르시아)의 침입, 상공업·도시의 쇠퇴가 이어졌고, 농촌에서는 부자유 소작농을 이용한 콜로나투스가 확산되었다. 3세기 말 디오클레티아누스는 전제 군주제와 4분할 통치로, 콘스탄티누스 대제는 크리스트교 공인(밀라노 칙령 313)과 콘스탄티노폴리스 천도로 제국의 중흥을 꾀하였다. 테오도시우스 황제 사후 제국은 동·서로 분리되었고(395), 서로마 제국은 476년 게르만족의 침입으로 멸망하였으며, 동로마(비잔티움) 제국은 이후 약 1000년(1453)까지 지속되었다.',
      terms: [
        { label: '아우구스투스 · 프린켑스', def: '원로원이 옥타비아누스에게 부여한 칭호(BCE 27). 「제1시민」을 자처하며 사실상 황제로 군림 → 제정 시작.' },
        { label: '팍스 로마나(로마의 평화)', def: '아우구스투스부터 5현제 시대까지 약 200년간 이어진 평화·번영. 117년 제국 최대 영토.' },
        { label: '5현제 시대', def: '네르바 → 트라야누스 → 하드리아누스 → 안토니누스 피우스 → 마르쿠스 아우렐리우스. 혈연이 아닌 양자 계승으로 유능한 황제가 이어짐.' },
        { label: '군인 황제 시대 · 콜로나투스', def: '3세기 초반부터 군대가 황제를 옹립·폐위하며 정치 혼란. 부자유 소작농(콜로누스)을 이용한 대농장 경영(콜로나투스)이 확산.' },
        { label: '4분할 통치(디오클레티아누스)', def: '두 황제와 두 부황제가 제국을 넷으로 나누어 통치. 전제 군주제 도입으로 황제권 강화.' },
        { label: '동·서 분열(395)', def: '테오도시우스 사후 동로마(비잔티움)·서로마로 분리. 서로마는 476년 멸망, 동로마는 1453년까지 지속.' }
      ],
      timeline: [
        { y: -27, label: '◆ 옥타비아누스, 아우구스투스 칭호 → 제정 시작' },
        { y: 96,  label: '5현제 시대 개막(네르바) — 팍스 로마나' },
        { y: 235, label: '군인 황제 시대 (~284)' },
        { y: 284, label: '디오클레티아누스 — 전제 군주제·4분할 통치' },
        { y: 313, label: '밀라노 칙령 — 콘스탄티누스' },
        { y: 395, label: '로마 동·서 분열' },
        { y: 476, label: '서로마 제국 멸망' }
      ]
    },
    notes: {
      sections: [
        {
          head: 'I. 옥타비아누스 (BCE 27~CE 14)',
          list: [
            '스스로 프린켑스(제1시민) 칭호 사용',
            '\'공화정의 회복\', 원로원과 국정 협력',
            '원로원의 지지 → 아우구스투스(존엄한 자) 칭호 부여 (BCE 27)',
            '군대 주둔 속주의 통치권 이양 → 군대 장악',
            '재정까지 장악하며 사실상 황제로 군림',
            '군대·조세 개편, 변방 수비 강화 → 제국 번영 기틀 마련'
          ]
        },
        {
          head: 'II. Pax Romana (로마의 평화 시대)',
          list: [
            '옥타비아누스 ~ 5현제 시대',
            '5현제 시대',
            '  · CE 1세기부터 약 200여 년 간 평화와 안정, 최대 영토 확보',
            '  · 네르바 → 트라야누스 → 하드리아누스',
            '     → 안토니누스 피우스 → 마르쿠스 아우렐리우스'
          ]
        },
        {
          head: 'III. 제국의 쇠퇴',
          list: [
            '군인 황제 시대',
            '배경: 게르만족과 사산 조 페르시아의 위협, 상공업과 도시의 쇠퇴',
            '변경 군대의 황제 옹립 → 내분 심화, 국정 문란, 속주의 반란 증가',
            '콜로나투스: 콜로누스(부자유 소작농)를 이용한 대농장 경영',
            '자영농 몰락, 빈민 양상'
          ]
        },
        {
          head: 'IV. 제국의 중흥',
          list: [
            '디오클레티아누스 (284~305)',
            '  · 전제 군주제 도입, 4제 통치 체제',
            '콘스탄티누스 (306~337)',
            '  · 밀라노 칙령 (313) → 크리스트교 공인',
            '  · 콘스탄티노폴리스 천도',
            '테오도시우스 (379~395)',
            '  · 크리스트교 국교화, 제국 통일 도모'
          ]
        },
        {
          head: 'V. 제국의 분리 (395)',
          list: [
            '테오도시우스 황제 사망 이후',
            '   → 비잔티움 제국·서로마 제국',
            '게르만족의 침입',
            '   → 서로마 제국 멸망 (476)'
          ]
        }
      ]
    },
    artifacts: [
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/로마 제정/[비상교육] 고등_세계사_1-3_51p_로마 제국의 영역.jpg',
        caption: '로마 제국의 영역',
        ref: '비상교육 세계사 1-3, p.51 — 포에니 전쟁 이전의 영역·최대 영역(117년)·동서 분열 경계선(395)' },
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/로마 제정/미래엔_세계사_이미지_50쪽_로마_제국.JPG',
        caption: '로마 제국',
        ref: '미래엔 세계사 1, p.50 — 지중해 전역을 아우른 로마 제국의 영역' },
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/로마 제정/[비상교육] 고등_세계사_1-3_51p_4분할 통치를 표현한 조각.jpg',
        caption: '4분할 통치를 표현한 조각',
        ref: '디오클레티아누스가 제국을 두 명의 황제와 두 명의 부황제가 나누어 통치하도록 한 4제 통치 체제' },
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/로마 제정/트리야누스의 원주.jpg',
        caption: '트라야누스의 원주',
        ref: '5현제의 한 명인 트라야누스 황제의 기념 건축물. 대외 원정 과정이 부조로 새겨져 제국 최대 영토를 확보한 그의 업적을 기림' }
    ],
    linked: ['w-rome-found', 'w-rome-rep', 'w-jesus', 'w-edict', 'w-split', 'w-fall']
  },

  'w-edict': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.90,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    overview: {
      summary: '밀라노 칙령 — 313년 콘스탄티누스 대제가 리키니우스와 함께 발표한 칙령으로, 크리스트교를 비롯한 모든 종교의 신앙 자유를 공인하였다. 디오클레티아누스 황제 등의 박해를 받던 크리스트교가 비로소 합법 종교가 되었다. 콘스탄티누스는 니케아 공의회(325)를 소집해 삼위일체를 인정한 아타나시우스파를 정통으로, 예수의 신성을 부정한 아리우스파를 이단으로 규정하여 교리를 통일하였다. 이후 392년 테오도시우스 황제가 크리스트교를 로마의 국교로 삼고 다른 종교를 금지하면서, 교회 조직이 제국 행정과 결합해 중세 서유럽 문화의 정신적 바탕이 되었다.',
      terms: [
        { label: '콘스탄티누스 대제', def: '밀라노 칙령으로 크리스트교를 공인하고 콘스탄티노폴리스로 천도한 황제.' },
        { label: '밀라노 칙령', def: '313년 신앙의 자유를 공인한 칙령. 크리스트교 박해의 종식.' },
        { label: '니케아 공의회', def: '325년 소집된 공의회. 아타나시우스파(삼위일체)를 정통 교리로 확정.' },
        { label: '국교화', def: '392년 테오도시우스 황제가 크리스트교를 로마 국교로 선포.' }
      ],
      timeline: [
        { y: 313, label: '◆ 밀라노 칙령' },
        { y: 325, label: '니케아 공의회' },
        { y: 392, label: '크리스트교 국교화' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '밀라노 칙령 탐구 자료 (1)', ph: true,
        citation: '— 교과서 탐구 자료 미배치' },
      { kind: '탐구 자료', title: '밀라노 칙령 탐구 자료 (2)', ph: true,
        citation: '— 교과서 탐구 자료 미배치' }
    ],
    artifacts: [
      { slot: 'auto',
        caption: '밀라노 칙령 관련 자료 (1)',
        ref: '교과서 자료 미배치' },
      { slot: 'auto',
        caption: '밀라노 칙령 관련 자료 (2)',
        ref: '교과서 자료 미배치' }
    ]
  },

  // ---------- 서아시아·인도 ----------
  's-ashoka': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.90,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    overview: {
      summary: '아소카왕 — 인도 최초의 통일 왕조인 마우리아 왕조의 제3대 왕(재위 BCE 268경~232경). 동부 칼링가를 정복하는 과정에서 벌어진 전쟁의 참혹함을 본 뒤 불교에 귀의하여, 무력 대신 다르마(法, 보편적 도덕)에 의한 통치를 선언하였다. 불살생과 관용, 백성에 대한 도덕적 의무를 새긴 돌기둥(석주)과 마애 칙령을 제국 곳곳에 세웠고, 산치 대탑 등 불탑(스투파)을 건립하였다. 또 불경을 정리하는 결집을 후원하고 실론(스리랑카) 등 여러 지역에 포교단을 보내, 인도의 지역 신앙이던 불교가 세계 종교로 발전하는 결정적 계기를 마련하였다.',
      terms: [
        { label: '마우리아 왕조', def: '찬드라굽타가 세운 인도 최초의 통일 왕조(BCE 322~).' },
        { label: '칼링가 전쟁', def: '아소카왕이 벌인 정복 전쟁. 참상을 본 뒤 불교에 귀의하는 계기.' },
        { label: '다르마(법) 정치', def: '무력이 아닌 보편적 도덕에 따른 통치 이념.' },
        { label: '석주·마애 칙령', def: '통치 이념을 새겨 전국에 세운 돌기둥과 바위 비문.' },
        { label: '상좌부 불교', def: '아소카왕의 후원으로 스리랑카·동남아로 전파된 불교.' }
      ],
      timeline: [
        { yl: 'BCE 4세기 후반', label: '찬드라굽타 마우리아, 마우리아 왕조 건국' },
        { y: -268, label: '◆ 아소카왕 즉위' },
        { yl: 'BCE 3세기', label: '칼링가 정복, 불교에 의한 통치' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '아소카왕 탐구 자료 (1)', ph: true,
        citation: '— 교과서 탐구 자료 미배치' },
      { kind: '탐구 자료', title: '아소카왕 탐구 자료 (2)', ph: true,
        citation: '— 교과서 탐구 자료 미배치' }
    ],
    artifacts: [
      { slot: 'auto',
        caption: '아소카왕 관련 자료 (1)',
        ref: '교과서 자료 미배치' },
      { slot: 'auto',
        caption: '아소카왕 관련 자료 (2)',
        ref: '교과서 자료 미배치' }
    ]
  },

  's-rashidun': {
    syncRatio: 0.92,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    notes: {
      sections: [
        {
          head: '一. 성립',
          list: [
            '무함마드 사망 후, 계승자의 직함 ‘칼리프’',
            '칼리프 선출 (1~4대)',
            '이슬람 공동체의 지도자'
          ]
        },
        {
          head: '二. 전개',
          list: [
            '대외 정복 전쟁',
            '  · 사산 조 페르시아 멸망',
            '  · 예루살렘·이집트 점령',
            '  · 중앙아시아 세력 확대 → 대제국 건설'
          ]
        }
      ]
    },
    overview: {
      summary: '정통 칼리프 시대 — 무함마드가 사망한 632년부터 661년까지, 이슬람 공동체(움마)가 무함마드의 후계자인 칼리프를 선출하여 다스린 시기. 칼리프는 무함마드를 잇는 계승자로 종교 지도자이자 정치적 통치자를 겸하였으며, 아랍 부족들이 족장을 선출하던 관습에 따라 아부 바크르·우마르·우스만·알리가 차례로 선출되었다. 활발한 정복 활동으로 사산 왕조 페르시아를 멸망시키고(651) 비잔티움 제국을 압박하여 시리아·이집트를 빼앗아 대제국을 건설하였으며, 정복지에는 군영 도시(미스르)를 세우고 세금을 내면 피정복민의 신앙을 인정하는 관용 정책을 폈다. 제3대 우스만 때 쿠란을 정본으로 편찬하였다. 제4대 알리가 암살되자(661) 무아위야가 칼리프 자리를 세습하는 우마이야 왕조를 열었고, 이를 계기로 이슬람교도는 「칼리프는 알리의 가문에서만 나와야 한다」는 시아파와 「누구나 칼리프가 될 수 있다」는 수니파로 갈라져 대립하게 되었다.',
      terms: [
        { label: '칼리프', def: '무함마드를 잇는 계승자. 이슬람 공동체의 종교 지도자이자 정치적 통치자를 겸함.' },
        { label: '움마', def: '신앙으로 묶인 이슬람 공동체.' },
        { label: '정통 칼리프', def: '부족 족장 선출 관습에 따라 선출된 4대 칼리프(아부 바크르·우마르·우스만·알리). 라쉬둔 시대.' },
        { label: '대외 정복', def: '사산 왕조 페르시아를 멸망시키고 비잔티움 제국으로부터 시리아·이집트를 점령 → 대제국 건설.' },
        { label: '시아파 · 수니파', def: '알리 암살·우마이야 세습을 계기로 분열. 시아파(칼리프는 알리의 가문에서만)·수니파(누구나 칼리프가 될 수 있음).' }
      ],
      timeline: [
        { y: 622, label: '헤지라 — 무함마드 메디나 이주 (배경)' },
        { y: 632, label: '◆ 무함마드 사망 → 정통 칼리프 시대 개막 (아부 바크르)' },
        { y: 651, label: '사산 왕조 페르시아 멸망' },
        { y: 661, label: '알리 암살 → 우마이야 왕조 · 수니·시아 분열' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '이슬람 제국의 발전',
        src: 'assets/w1/고대/서아시아·인도/정통 칼리프 시대/스크린샷 2026-07-14 14.24.07.png',
        citation: '— 교과서 탐구 자료 (정통 칼리프 시대 → 우마이야 → 후우마이야·아바스·파티마 왕조)' },
      { kind: '탐구 자료', title: '정통 칼리프 시대의 시작 — 아부 바크르의 행적',
        src: 'assets/w1/고대/서아시아·인도/정통 칼리프 시대/스크린샷 2026-07-14 14.24.17.png',
        citation: '— 『아부 바크르의 행적』' }
    ],
    artifacts: [
      { slot: 'auto',
        src: 'assets/w1/고대/서아시아·인도/정통 칼리프 시대/스크린샷 2026-07-14 14.23.53.png',
        caption: '이슬람 제국의 영역',
        ref: '정통 칼리프·우마이야·아바스 왕조의 정복지와 정복 방향 (더 타임스 세계사, 2019)' }
    ]
  },// ============================================================
  // 조선 건국 · 1392
  // ============================================================
  'k-joseon': {
    notes: { sections: [] },
    syncRatio: 0.94,
    fileRef: 'K1 · pp. 3683–3724',
    overview: {
      summary: '조선 — 이성계가 신진 사대부와 함께 1392년 조선을 건국하고 한양으로 천도하였다(1394). 태종은 호패법(1413)을 실시하였고, 세종은 훈민정음을 창제하였다(1443). 세조는 직전법(1466)을 실시하였으며, 성종 때 『경국대전』(1485)이 반포되어 통치 체제가 정비되었다. 16세기 백운동 서원(1543)이 세워지고 사림이 성장하였다. 임진왜란(1592)과 병자호란(1636)을 겪었으며, 공납의 폐단을 줄이려 대동법(1608)을 실시하였다. 숙종 때 환국으로 붕당 정치가 변질되자 영조와 정조가 탕평책을 펼쳤고, 영조는 균역법(1750)을 실시하였다. 19세기 세도 정치 아래 홍경래의 난(1811) 등이 일어났다.',
      terms: [
        { label: '호패법', def: '16세 이상 남자에게 호패를 차게 한 제도.' },
        { label: '훈민정음', def: '세종이 창제한 우리 고유의 문자.' },
        { label: '대동법', def: '토산물 대신 쌀 등을 토지 결수에 따라 거둔 세법.' },
        { label: '탕평책', def: '붕당의 대립을 완화하려 한 영조·정조의 정책.' },
        { label: '균역법', def: '군포를 1년에 1필로 줄인 영조의 법.' },
        { label: '위화도', def: '압록강 하류에 위치한 섬으로, 요동 정벌에 반대하던 이성계가 군대를 돌린 곳이다.' },
        { label: '역성혁명', def: '왕이 부덕하여 민심을 잃으면 덕을 갖춘 다른 성씨가 왕위에 오를 수 있다는 유교적 정치 사상.' },
        { label: '신진 사대부', def: '권문세족의 횡포와 불교의 폐해를 비판한 새 정치 세력. 성리학을 이념으로 삼았다.' }
      ],
      timeline: [
        { y: 1392, label: '◆ 조선 건국' },
        { y: 1394, label: '한양 천도' },
        { y: 1413, label: '호패법 실시' },
        { y: 1443, label: '훈민정음 창제' },
        { y: 1466, label: '직전법 실시' },
        { y: 1485, label: '『경국대전』 반포' },
        { y: 1543, label: '백운동 서원 건립' },
        { y: 1592, label: '임진왜란' },
        { y: 1608, label: '대동법 실시' },
        { y: 1623, label: '인조반정' },
        { y: 1636, label: '병자호란' },
        { y: 1674, label: '숙종 즉위·환국' },
        { y: 1712, label: '백두산정계비' },
        { y: 1724, label: '영조 즉위·탕평책' },
        { y: 1750, label: '균역법 실시' },
        { y: 1776, label: '정조 즉위' },
        { y: 1801, label: '공노비 해방' },
        { y: 1811, label: '홍경래의 난' }
      ]
    },
    sources: [
      {
        kind: '실록',
        title: '『태조실록』 — 태조의 즉위',
        body: '왕위에 오르는데, 어좌를 피하고 기둥 안에 서서 신하들의 축하 인사를 받았다.',
        gloss: '덕치(德治)를 강조하는 유교 정치사상에 따라 자신의 힘을 드러내기보다 덕을 갖춘 군주임을 내세우려 한 것으로 짐작된다.',
        citation: '— K1, p. 3696'
      },
      {
        kind: '교과서 본문',
        title: '조선 건국의 전개',
        body: '위화도 회군으로 정치적 실권을 장악한 이성계와 정도전 등 신진 사대부는 먼저 과전법을 실시해 토지 제도를 개혁하고, 역성혁명에 반대하던 정몽주 등을 제거한 후 조선을 건국하였다(1392). 그리고 성리학을 새로운 통치 이념으로 삼아 조선 건국의 기반으로 채택, 유교적 민본 정치 구현의 기반을 마련하고 명 중심의 국제 질서에 참여하였다.',
        citation: '— K1, pp. 3685–3725'
      },
      {
        kind: '역사 인식',
        title: '국호 ‘조선’의 의미',
        body: '몽골의 침입과 원의 간섭에 저항하면서 고려인은 고구려·백제·신라의 후예이기 이전에 다 같은 단군의 후예라는 역사 인식이 점차 형성되었다. 이러한 인식은 이성계가 나라 이름을 ‘조선’으로 정하고, 단군과 고조선을 우리 역사의 기원으로 삼는 데 영향을 끼쳤다.',
        citation: '— K1, pp. 3404–3405'
      },
      {
        kind: '실록',
        title: '『효종실록』 — 임진왜란 이후 비변사의 위상',
        body: '취급되지 않는 것이 없는데, 의정부는 한갓 헛이름만 지니고 6조는 모두 그 직임을 상실하였습니다.',
        gloss: '비변사는 16세기 초 임시 기구로 설치되었으나 임진왜란이 일어나자 전쟁을 효율적으로 수행하기 위해 역할이 강화되어, 군사·외교뿐 아니라 일반 정무까지 관할하게 되었다.',
        citation: '— K1, pp. 3964–3967'
      },
      {
        kind: '교과서 본문',
        title: '북벌론의 근거',
        body: '우리나라는 실로 명 신종 황제의 은혜를 입어 임진왜란 때 나라가 이미 폐허가 되었다가 다시 보존되고, 백성이 거의 죽었다가 다시 소생하였으니, 우리나라 나무 한 그루와 풀 한 포기와 백성의 터럭 하나하나에도 황제의 은혜가 미치지 않은 것이 …',
        gloss: '송시열의 북벌론. 임진왜란 당시 명의 원군을 ‘재조지은’으로 받아들이는 인식이 17세기까지 이어졌다.',
        citation: '— K1, pp. 4514–4516'
      },
      {
        kind: '세계사 본문',
        title: '에도 막부 문화에 끼친 영향',
        body: '일본은 임진왜란 중 조선으로부터 활자, 그림, 서적 등을 약탈하였으며, 성리학자와 도자기 기술자 등을 포로로 잡아왔는데, 이는 에도 막부의 문화 발전에 큰 …',
        citation: '— W2, p. 2516'
      },
      {
        kind: '실록',
        title: '『세종실록』 — 민본의 원리',
        body: '나라는 백성을 근본으로 삼고, 백성은 먹는 것을 하늘로 삼는다. 농사짓는 일은 의식(衣食)의 근원으로 왕이 가장 힘써야 할 바이다.',
        gloss: '민본 정치에서 국왕이 가장 힘써야 할 일은 농업을 진흥하여 민생을 안정시키는 데 있음을 밝힌 구절이다.',
        citation: '— K1, p. 4647'
      },
      {
        kind: '실록',
        title: '『세종실록』 — 공법 여론 조사 (1430)',
        body: '서울과 지방의 벼슬아치들은 물론이고 일반 백성에게도 그 가부를 물어서 아뢰어라!',
        gloss: '1430년 세종은 새 조세 제도(공법)에 대해 약 5개월간 17만 2,806여 명을 대상으로 한 여론 조사를 명하였다. 결과는 찬성 9만 8,657여 명, 반대 7만 4,149여 명. 예상 밖의 반대로 세종은 시행을 보류하고 제도를 보완하였다.',
        citation: '— K1, pp. 3893–3907'
      }
    ],
    map: {
      title: '조선 건국 관련 지명',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 80 30 L 240 30 L 260 90 L 245 170 L 200 210 L 130 215 L 95 175 L 70 100 Z', label: '고려 → 조선' }
      ],
      pins: [
        { x: 115, y: 55, label: '위화도', sub: '1388 · 회군' },
        { x: 95, y: 95, label: '의주' },
        { x: 175, y: 130, label: '한양(漢陽)', sub: '1394 · 천도', amber: true },
        { x: 165, y: 95, label: '개경(開京)', sub: '고려 도읍' },
        { x: 145, y: 175, label: '전주', sub: '태조 어진 봉안' }
      ],
      arrows: [
        { from: [115, 55], to: [165, 95], label: '회군' },
        { from: [165, 95], to: [175, 130], label: '천도' }
      ]
    },
    artifacts: [
      { slot: 'portrait', caption: '태조 어진 (전북 전주 경기전)', ref: 'K1, p. 3705' },
      { slot: 'document', caption: '『태조실록』 즉위 기사', ref: 'K1, p. 3696' },
      { slot: 'wide', caption: '한양 도성 도면 / 경복궁 배치', ref: '교과서 자료 미배치' },
      { slot: 'wide', caption: '임진왜란 전황도 / 거북선', ref: '교과서 자료 미배치' },
      { slot: 'document', caption: '『이순신전』 (신채호)', ref: 'K2, p. 4770' },
      { slot: 'portrait', caption: '세종대왕 동상 (서울 종로구)', ref: 'K1, p. 3912' },
      { slot: 'document', caption: '『훈민정음 해례본』 (간송미술관)', ref: 'K3, p. 3961' },
      { slot: 'wide', caption: '공법 여론 조사 결과 (찬성 57.1%)', ref: 'K1, p. 3901' }
    ],
    linked: ['k-goryeo', 'k-daewongun', 'e-ming', 'e-qing', 'e-sengoku', 'e-edo']
  },

  // ============================================================
  // 훈민정음 창제 · 1443
  // ============================================================

  // ============================================================
  // 임진왜란 · 1592
  // ============================================================

  // ============================================================
  // 3·1 운동 · 1919
  // ============================================================

  // ============================================================
  // 광복 · 1945
  // ============================================================
  'k-liberation': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.93,
    fileRef: 'K4 · pp. 4–566',
    overview: {
      summary:
        '1945년 8월 15일 일제의 항복과 함께 한국은 광복을 맞이하였다. ' +
        '광복은 지난 수십 년간 애국선열들이 피땀 흘려 독립운동을 전개한 결과이자, 연합국이 카이로 선언·포츠담 선언에서 한국의 독립을 약속한 결과였다. ' +
        '그러나 광복은 연합국이 제2차 세계 대전에서 승리함으로써 얻은 결과이기도 했기 때문에 향후 한국의 진로는 미국·소련 등 연합국의 결정에 영향을 받았다. ' +
        '38도선을 경계로 미·소 군정이 실시되면서 한국인의 주권 행사는 미루어졌고, 모스크바 3국 외무 장관 회의의 신탁 통치 결정을 둘러싸고 좌익과 우익이 격렬히 대립하였다.',
      terms: [
        { label: '카이로·포츠담 선언', def: '연합국이 한국의 독립을 국제적으로 약속한 선언.' },
        { label: '38도선', def: '본래 일본군의 무장 해제를 위한 미·소의 임시 경계선이었으나, 3년에 걸친 미·소 군정과 냉전 격화로 민족의 분단선이 되었다.' },
        { label: '조선 건국 준비 위원회', def: '광복 당일 여운형이 조선 총독부로부터 행정권 이양을 교섭한 결과 조직된 단체.' }
      ],
      timeline: [
        { y: 1943, label: '카이로 선언 (한국 독립 약속)' },
        { y: 1945, label: '8·15 광복 · 미·소 군정 / 모스크바 3국 외상 회의' },
        { y: 1948, label: '5·10 총선거 / 대한민국 정부 수립' }
      ]
    },
    sources: [
      {
        kind: '연설',
        title: '여운형 — 건국 준비 위원회 연설 (1945. 8. 16.)',
        body:
          '광복 당일 한국인의 봉기를 우려한 조선 총독부는 민족 지도자로 신망받던 여운형과 접촉하여 행정권 이양을 교섭하였다. 정부 수립을 위한 강령에는 “우리는 완전한 독립 국가 건설을 기함. 우리는 전 민족의 정치적·경제적·사회적 기본 요구를 실현할 수 있는 민주주의 정권 수립을 기함” 등의 조건이 포함되었다.',
        citation: '— K4, pp. 420, 444–447'
      },
      {
        kind: '교과서 본문',
        title: '광복의 이중성',
        body:
          '광복은 지난 수십 년간 애국선열들이 피땀 흘려 독립운동을 전개한 결과였다. 연합국은 이러한 노력을 인정하여 이미 카이로 선언과 포츠담 선언에서 한국의 독립을 약속하였다. 그렇지만 광복은 연합국이 제2차 세계 대전에서 승리함으로써 얻은 결과이기도 하였기 때문에 향후 한국의 진로는 미국, 소련 등 연합국의 결정에 영향을 받았다.',
        citation: '— K4, pp. 434–443'
      },
      {
        kind: '담화문',
        title: '신탁 통치 반대 국민 총동원 시위 대회 선언문',
        body:
          '카이로·포츠담 선언과 국제 헌장으로 세계에 공약한 한국의 독립 부여는 이번 모스크바에서 열린 3국 외무 장관 회의의 신탁 관리 결의로써 수포로 돌아갔다. 동포여! 8·15 이전과 이후 피차의 과오와 마찰을 청산하고서 우리 정부(대한민국 임시 정부) 밑에 뭉치자. …… 3천만의 모든 힘을 발휘하여 신탁 관리제 …',
        citation: '— K4, pp. 562–568'
      }
    ],
    map: {
      title: '광복과 분단 — 38도선',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 110 30 L 245 30 L 260 90 L 250 175 L 215 215 L 145 215 L 110 180 L 90 100 Z',
          label: '한반도' }
      ],
      gridLine: { y: 110, label: '38°N · 미·소 군정 경계' },
      pins: [
        { x: 175, y: 80,  label: '평양',  sub: '소련 군정' },
        { x: 180, y: 145, label: '경성',  sub: '미군정' },
        { x: 145, y: 60,  label: '신의주' },
        { x: 220, y: 200, label: '부산' },
        { x: 60,  y: 50,  label: '카이로 · 포츠담', sub: '독립 약속', amber: true }
      ],
      arrows: [
        { from: [60, 50], to: [180, 145], label: '독립 약속' }
      ]
    },
    artifacts: [
      { slot: 'wide',     caption: '만세를 부르는 애국지사와 시민 (1945. 8. 16.)', ref: 'K4, p. 426' },
      { slot: 'document', caption: '제헌 헌법이 실린 대한민국 1호 관보 (1948. 9. 1.)', ref: 'K4, p. 910' },
      { slot: 'wide',     caption: '38선 경계와 미·소 군정 분포도',                 ref: 'K4, pp. 481–495' }
    ],
    linked: ['k-samil', 'k-annexation', 'k-gwangbokgun', 'k-geonguk', 'k-rok', 'k-gov-rhee', 'w-ww2', 'k-geonjun', 'k-moscow']
  },

  // ============================================================
  // 6·25 전쟁 · 1950
  // ============================================================

  // ============================================================
  // 프랑스 혁명 · 1789
  // ============================================================

  // ============================================================
  // 메이지 유신 · 1868
  // ============================================================

  // ============================================================
  // 구석기 시대 · 한반도 인류의 시작 (약 70만 년 전~)
  //   출처: K1 미래엔 한국사 교사용 교과서 Ⅰ 전근대 한국사의 이해 — PDF page 5 / p.12
  //   "선사 문화의 발달" 단원 · 구석기 문화 부분 전체 인용
  // ============================================================
  'k-paleo': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.88,
    fileRef: 'K1 · 미래엔 한국사 Ⅰ · p. 12 (PDF 5)',
    overview: {
      summary:
        '인류가 출현하여 살아온 대부분의 시간은 문자 기록이 없는 선사 시대이다. 선사 시대는 도구의 제작 기법에 따라 구석기 시대, 신석기 시대 등으로 구분된다. 우리나라의 구석기 시대는 약 70만 년 전부터 시작된 것으로 여겨진다. 구석기인은 주먹도끼 등 뗀석기를 만들어 사용하면서 채집과 사냥으로 생활하였고, 더 나은 삶의 환경을 찾아 오랜 세월 끊임없이 이동하였다. 또한 무리 지어 살면서 언어를 사용해 협동력을 높이고, 서로 떨어져 생활하는 무리와 경험이나 문화를 공유하였다. 한반도 일대에서도 구석기 문화가 수십만 년 동안 이어져 왔다. 도구가 더욱 정교해지면서 후기에는 슴베찌르개와 같은 이음 도구가 사용되었다. 구석기 시대 말부터 날씨가 점차 따뜻해져 기원전 8000년 무렵에는 한반도의 환경이 오늘날과 비슷하게 변하였다. 구석기 시대 사람들은 주변에 식량이 떨어지면 다른 지역으로 이동하였고, 동굴이나 바위 그늘, 막집에 살았다. 구석기 시대는 계급이 없는 평등 사회였다. 구석기 시대가 약 70만 년 전에 시작되었다는 견해는 상원 검은모루 동굴, 단양 금굴의 편년에 따른 것이다.',
      terms: [
        { label: '선사 시대',
          def: '문자 기록이 없는 역사 시대 이전의 시기이다. 도구 제작 기법에 따라 뗀석기를 사용한 구석기 시대, 간석기를 사용한 신석기 시대로 구분한다.' },
        { label: '뗀석기',
          def: '자연석을 깨거나 떼어 내어 만든 도구. 주먹도끼·찍개·찌르개 등이 있으며 구석기 시대의 대표적인 도구이다.' },
        { label: '이음 도구',
          def: '구석기 시대 후기 이후 작고 섬세하게 가공한 한 개 내지 여러 개의 석기를 나무나 뼈에 이어 쓰는 도구. 슴베찌르개가 대표적이다. (슴베 = 칼·낫 등의 자루 속에 박히는 부분)' },
        { label: '주먹도끼',
          def: '구석기 시대를 대표하는 뗀석기. 경기 연천 전곡리에서 출토된 유물이 유명하다.' },
        { label: '슴베찌르개',
          def: '구석기 시대 후기에 등장한 이음 도구. 경남 밀양·충북 단양에서 출토되었다.' },
        { label: '막집', def: '구석기 시대 사람들이 이동하며 지은 간단한 집. 동굴이나 바위 그늘에서도 살았다.' },
        { label: '평등 사회', def: '계급이 없는 사회. 구석기 시대와 신석기 시대는 평등 사회였다.' }
      ],
      timeline: [
        { yl: '약 70만 년 전', label: '◆ 한반도와 그 주변 지역에 사람이 살기 시작' },
        { yl: '후기 구석기', label: '슴베찌르개 등 이음 도구 사용' },
        { yl: '8000 BCE 무렵', label: '날씨가 따뜻해지며 신석기 시대 시작' },
        { yl: '20~15세기 BCE 무렵', label: '청동기 시대 시작' }
      ]
    },
    sources: [
      {
        kind: '교과서 본문',
        title: '선사 문화의 발달 — 시대 구분',
        body:
          '인류가 출현하여 살아온 대부분 시간은 문자 기록이 없는 선사 시대이다. 선사 시대는 도구의 제작 기법에 따라 구석기 시대, 신석기 시대 등으로 구분된다. 우리나라의 구석기 시대는 약 70만 년 전, 신석기 시대는 기원전 8,000년경부터 시작된 것으로 여겨진다.',
        gloss:
          '선사 시대는 문자 기록이 없는 역사 시대 이전의 시기이다. 도구 제작 기법에 따라 뗀석기를 사용한 구석기 시대, 간석기를 사용한 신석기 시대로 구분한다.',
        citation: '— K1, p. 12 (PDF 5)'
      },
      {
        kind: '교과서 본문',
        title: '구석기인의 생활 모습',
        body:
          '구석기인은 주먹도끼 등 뗀석기를 만들어 사용하면서 채집과 사냥으로 생활하였고, 더 나은 삶의 환경을 찾아 오랜 세월 끊임없이 이동하였다. 또한 무리 지어 살면서 언어를 사용해 협동력을 높이고, 서로 떨어져 생활하는 무리와 경험이나 문화를 공유하였다. 한반도 일대에서도 구석기 문화가 수십만 년 동안 이어져 왔다. 도구가 더욱 정교해지면서 후기에는 슴베찌르개와 같은 이음 도구가 사용되었다.',
        gloss:
          '구석기 시대 후기 이후 자연환경이 변화하면서 작고 날랜 동물이 많아지자, 이들을 잡기 위해 석기들을 작고 섬세하게 가공한 후, 한 개 내지 여러 개의 석기를 나무나 뼈에 이어 쓰는 이음 도구를 제작하여 사용하였다.',
        citation: '— K1, p. 12 (PDF 5)'
      },
      {
        kind: '교과서 본문',
        title: '구석기 시대 말의 환경 변화 → 신석기로의 이행',
        body:
          '구석기 시대 말부터 기온이 올라 해수면이 상승하였고, 1만 년 전 무렵에는 한반도의 환경도 오늘날과 비슷하게 변하였다. 인류가 이러한 환경 변화에 적응해 다양한 간석기와 토기를 만들어 사용하면서 신석기 시대가 전개되었다.',
        citation: '— K1, p. 12 (PDF 5)'
      },
      {
        kind: '판서 정리',
        title: '구석기 문화 — 도구와 사회 변화',
        body:
          '도구: 뗀석기, 후기에 이음 도구 사용. / 사회 변화: 불 사용, 채집·사냥으로 생활. 언어 사용, 무리 사회, 이동 생활.',
        citation: '— K1, p. 12 (PDF 5) 단원 지도 계획 판서'
      },
      {
        kind: '보충 자료',
        title: '구석기 시대 대표적인 유적',
        body:
          '평남 상원 검은모루 동굴 · 경기 연천 전곡리 · 충남 공주 석장리. 슴베찌르개 출토지: 경남 밀양 · 충북 단양.',
        citation: '— K1, p. 12 (PDF 5) 보충'
      }
    ],
    map: {
      title: '구석기 시대 대표 유적 분포 (한반도)',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 150 22 L 215 28 L 235 60 L 248 105 L 240 145 L 222 185 L 198 215 L 168 218 L 148 195 L 138 155 L 132 105 L 138 60 Z',
          label: '한반도 일대' }
      ],
      pins: [
        { x: 178, y: 55,  label: '상원 검은모루 동굴', sub: '평남', amber: true },
        { x: 200, y: 92,  label: '연천 전곡리',       sub: '주먹도끼 출토', amber: true },
        { x: 196, y: 118, label: '공주 석장리',       sub: '충남' },
        { x: 215, y: 138, label: '단양',              sub: '슴베찌르개' },
        { x: 205, y: 175, label: '밀양',              sub: '슴베찌르개' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '주먹도끼 (경기 연천 전곡리) — 구석기 대표 뗀석기',         ref: 'K1, p. 12 (PDF 5)' },
      { slot: 'square', caption: '슴베찌르개 (경남 밀양·충북 단양) — 후기 이음 도구',        ref: 'K1, p. 12 (PDF 5)' },
      { slot: 'wide',   caption: '검은모루 동굴 · 전곡리 · 석장리 — 대표 유적 분포도',      ref: 'K1, p. 12 (PDF 5) 보충' }
    ],
    linked: ['k-neolithic', 'k-bronze']
  },

  // ============================================================
  // 신석기 시대 · 기원전 8,000년경~ (간석기·토기·농경의 시작)
  //   출처: K1 미래엔 한국사 교사용 교과서 Ⅰ · PDF page 5~6 / p.12~13
  //   "선사 문화의 발달" 단원 · 신석기 문화 부분 전체 인용
  // ============================================================
  'k-neolithic': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.90,
    fileRef: 'K1 · 미래엔 한국사 Ⅰ · p. 12 (PDF 5)',
    overview: {
      summary:
        '구석기 시대 말부터 기온이 올라 해수면이 상승하였고, 1만 년 전 무렵에는 한반도의 환경도 오늘날과 비슷하게 변하였다. 인류가 이러한 환경 변화에 적응해 다양한 간석기와 토기를 만들어 사용하면서 신석기 시대가 전개되었다. 신석기인은 농경과 목축을 시작하여 스스로 식량을 생산하였다. 이와 더불어 정착 생활이 이루어지고 인구도 늘어났다. 한반도 일대에 살던 신석기인은 주로 강가나 바닷가에 마을을 이루고 살면서 부족을 형성하였다. 신석기 시대의 부족 사회는 함께 생산하고 나누는 평등한 공동체였다. 신석기 시대 사람들은 처음에는 물고기잡이, 사냥, 채집으로 식량을 구했으나 점차 농경과 목축으로 식량을 생산하기 시작하였다. 바닥을 파서 만든 움집에 살았으며, 부족은 연장자나 경험이 많은 사람이 이끌었다. 신석기 시대 초기에는 진흙으로 띠를 만들어 토기 표면에 붙여 무늬를 낸 덧무늬 토기 등도 사용하였다. 서울 암사동 유적은 빗살무늬 토기 문화의 전형적인 모습을 보인다.',
      terms: [
        { label: '간석기',
          def: '돌의 표면을 갈아 만든 도구. 뗀석기보다 정교하며 다양한 용도로 사용되었다. 신석기 시대의 대표 도구.' },
        { label: '신석기 혁명',
          def: '신석기 시대에 인류가 채집·사냥 단계에서 벗어나 농경과 목축으로 스스로 식량을 생산하게 된 변화. 식량 생산의 변화는 정착 생활과 인구 증가를 가져왔다.' },
        { label: '빗살무늬 토기',
          def: '표면에 빗살 모양 무늬가 새겨진 신석기 시대의 대표 토기. 서울 암사동 유적이 대표적이다. 음식 저장·조리에 사용되었다.' },
        { label: '부족 사회',
          def: '여러 씨족이 모여 만든 신석기 시대의 사회 단위. 정착 생활과 농경으로 인구가 증가하면서 형성되었다. 함께 생산하고 나누는 평등한 공동체였다.' },
        { label: '갈돌과 갈판',
          def: '곡식이나 도토리 등을 갈아 가루로 만들 때 사용한 신석기 시대의 식량 가공 도구. 제주 고산리 유적에서 출토되었다.' },
        { label: '움집', def: '바닥을 파서 만든 집. 구석기 시대의 막집과 다르다.' },
        { label: '덧무늬 토기', def: '진흙으로 띠를 만들어 토기 표면에 붙여 무늬를 낸 토기. 신석기 시대 초기에 사용하였다.' },
        { label: '서울 암사동 유적', def: '빗살무늬 토기 문화의 전형적인 모습을 보이는 신석기 시대 유적.' }
      ],
      timeline: [
        { yl: '약 70만 년 전', label: '구석기 시대 시작 (이전 단계)' },
        { yl: '8000 BCE 무렵', label: '◆ 신석기 시대 시작 — 간석기·토기 사용' },
        { yl: '신석기 초기', label: '덧무늬 토기 사용' },
        { yl: '신석기 중기 이후', label: '빗살무늬 토기 · 농경과 목축 시작' },
        { yl: '20~15세기 BCE 무렵', label: '청동기 시대 시작' }
      ]
    },
    sources: [
      {
        kind: '교과서 본문',
        title: '신석기 시대의 전개 — 환경 변화와 도구',
        body:
          '구석기 시대 말부터 기온이 올라 해수면이 상승하였고, 1만 년 전 무렵에는 한반도의 환경도 오늘날과 비슷하게 변하였다. 인류가 이러한 환경 변화에 적응해 다양한 간석기와 토기를 만들어 사용하면서 신석기 시대가 전개되었다.',
        citation: '— K1, p. 12 (PDF 5)'
      },
      {
        kind: '교과서 본문',
        title: '신석기 혁명 — 농경·목축의 시작',
        body:
          '신석기인은 농경과 목축을 시작하여 스스로 식량을 생산하였다. 이와 더불어 정착 생활이 이루어지고 인구도 늘어났다.',
        gloss:
          '식량을 채집·사냥에 의존하던 단계에서 스스로 생산하는 단계로 넘어간 변화를 흔히 "신석기 혁명"이라 부른다.',
        citation: '— K1, p. 12 (PDF 5)'
      },
      {
        kind: '교과서 본문',
        title: '신석기 부족 사회 — 강가·바닷가의 평등 공동체',
        body:
          '한반도 일대에 살던 신석기인은 주로 강가나 바닷가에 마을을 이루고 살면서 부족을 형성하였다. 신석기 시대의 부족 사회는 함께 생산하고 나누는 평등한 공동체였다.',
        citation: '— K1, p. 12 (PDF 5)'
      },
      {
        kind: '판서 정리',
        title: '신석기 문화 — 도구와 사회 변화',
        body:
          '도구: 간석기, 토기 사용. / 사회 변화: 신석기 혁명(농경ㆍ목축 시작), 정착 생활, 인구 증가 → 부족 사회(평등한 공동체).',
        citation: '— K1, p. 12 (PDF 5) 단원 지도 계획 판서'
      },
      {
        kind: '보충 자료',
        title: '신석기 시대 대표적인 유적',
        body:
          '서울 암사동 · 양양 오산리 · 부산 동삼동. 추가 유적: 제주 고산리(갈돌·갈판), 경남 진주 상촌리(탄화된 곡식), 강원 고성 문암리(밭 흔적).',
        citation: '— K1, p. 12 (PDF 5) 보충'
      }
    ],
    map: {
      title: '신석기 시대 대표 유적 분포 (한반도)',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 150 22 L 215 28 L 235 60 L 248 105 L 240 145 L 222 185 L 198 215 L 168 218 L 148 195 L 138 155 L 132 105 L 138 60 Z',
          label: '한반도 일대' }
      ],
      pins: [
        { x: 196, y: 105, label: '서울 암사동',     sub: '빗살무늬 토기', amber: true },
        { x: 222, y: 110, label: '양양 오산리',     sub: '돌도끼', amber: true },
        { x: 222, y: 175, label: '부산 동삼동',     sub: '신석기 유적' },
        { x: 198, y: 175, label: '진주 상촌리',     sub: '탄화 곡식' },
        { x: 230, y: 105, label: '고성 문암리',     sub: '밭 흔적' },
        { x: 188, y: 225, label: '제주 고산리',     sub: '갈돌·갈판' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '빗살무늬 토기 (서울 암사동) — 신석기 대표 토기',          ref: 'K1, p. 12 (PDF 5)' },
      { slot: 'square', caption: '돌도끼 (강원 양양 오산리) — 간석기',                       ref: 'K1, p. 12 (PDF 5)' },
      { slot: 'square', caption: '갈돌과 갈판 (제주 고산리) — 식량 가공 도구',              ref: 'K1, p. 12 (PDF 5)' },
      { slot: 'square', caption: '탄화된 곡식 (경남 진주 상촌리) — 농경 증거',              ref: 'K1, p. 12 (PDF 5)' },
      { slot: 'wide',   caption: '신석기 시대의 밭 흔적 (강원 고성 문암리) — 농경 정착',    ref: 'K1, p. 12 (PDF 5)' }
    ],
    linked: ['k-paleo', 'k-bronze', 'k-gojoseon']
  },

  // ============================================================
  // 청동기 시대 · 기원전 2000~1500년경 ~ (계급 분화·국가 출현의 시대)
  //   출처: K1 미래엔 한국사 교사용 교과서 Ⅰ · PDF page 6 / p.13
  //   "계급의 발생과 국가의 출현" 단원 · 청동기 문화 부분 전체 인용
  // ============================================================
  'k-bronze': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.91,
    fileRef: 'K1 · 미래엔 한국사 Ⅰ · p. 13 (PDF 6)',
    overview: {
      summary:
        '신석기 시대 말에서 청동기 시대로 이어지면서 농업 생산력이 늘고 사회 구조가 변화하였다. 잉여 생산물이 발생하면서 토지와 생산물에 대한 사유 개념이 나타나 빈부 차이가 생겼다. 더 많은 식량과 농경지를 확보하기 위한 집단 간의 다툼이 빈번해졌고 정복 활동도 활발하였다. 이러한 상황에서 점차 계급의 분화가 뚜렷해지고 막강한 권력과 경제력을 가진 지배자가 등장하였다. 다양한 청동기와 거대한 고인돌은 당시 지배자가 누렸던 권력과 부를 반영한 것으로 보인다. 세력이 강한 집단의 지배자는 천손 사상을 내세워 주변 집단을 통합하였다. 사회 집단의 규모가 점차 커지는 가운데 일정한 정치 조직을 갖춘 국가도 출현하였다. 고조선은 청동기 시대에 등장한 우리 역사상 최초의 국가이다. 기원전 20세기에서 기원전 15세기 무렵 만주와 한반도에서 청동기 시대가 시작되었다. 본격적인 농업이 시작되었고, 한반도 남부 지역에서는 벼농사도 이루어졌다. 부족 사이에 정복 전쟁이 자주 일어나는 과정에서 지배자인 군장이 등장하였다.',
      terms: [
        { label: '잉여 생산물',
          def: '농업 생산력 증가로 소비하고 남은 식량·물품. 토지와 생산물에 대한 사유 개념을 낳고 빈부 차이를 발생시켰다.' },
        { label: '사유 개념',
          def: '잉여 생산물 발생과 함께 토지·재산을 개인이 소유한다는 관념이 형성된 것. 계급 분화의 출발점이다.' },
        { label: '계급 분화',
          def: '잉여 생산물과 정복 활동을 통해 사회 구성원 간에 권력·경제력 격차가 뚜렷해지는 현상. 지배자와 피지배자가 갈라지는 변화이다.' },
        { label: '천손 사상',
          def: '세력이 강한 집단의 지배자가 자신을 하늘의 자손이라 주장하여 주변 집단을 통합하는 데 활용한 사상. 단군 신화에서도 발견된다.' },
        { label: '비파형 동검',
          def: '만주와 한반도에 걸쳐 발견되는 청동기 시대의 대표 유물. 검의 몸통과 손잡이가 따로 만들어지는 조립식이며, 검의 중앙에 돌기가 있다. (cf. 중국식 동검: 날이 곧고 손잡이·몸통이 함께 제작됨)' },
        { label: '반달 돌칼',
          def: '곡식을 추수할 때 썼던 반달 모양의 돌칼. 두 개의 구멍에 끈을 꿰어 사용하였다. 청동기 시대에도 농기구 같은 생활 도구는 여전히 돌이나 나무로 만들어졌다. 경기 여주 출토.' },
        { label: '고인돌',
          def: '청동기 시대의 대표적인 무덤 양식. 거대한 규모는 당시 지배자가 누렸던 권력과 부를 반영한다.' },
        { label: '장인',
          def: '구리·아연 등 청동의 원재료를 다룰 수 있는 전문 기술자. 청동기 제작은 장인이 있어야 가능했으며, 그 출현은 직업 및 역할 분화가 이루어졌음을 의미한다.' },
        { label: '군장', def: '청동기 시대에 부족 사이의 정복 전쟁 과정에서 등장한 지배자.' }
      ],
      timeline: [
        { yl: '8000 BCE 무렵 ~', label: '신석기 시대 (이전 단계)' },
        { y: -2333, label: '고조선 건국 — 청동기 시대 우리 역사 최초의 국가' },
        { yl: '20~15세기 BCE 무렵', label: '◆ 만주와 한반도 일대 청동기 시대 시작' },
        { yl: '5세기 BCE경', label: '철기 문화 시작 (다음 단계)' }
      ]
    },
    sources: [
      {
        kind: '교과서 본문',
        title: '청동기 시대 — 잉여 생산물과 계급 분화',
        body:
          '신석기 시대 말에서 청동기 시대로 이어지면서 농업 생산력이 늘고 사회 구조가 변화하였다. 잉여 생산물이 발생하면서 토지와 생산물에 대한 사유 개념이 나타나 빈부 차이가 생겼다. 더 많은 식량과 농경지를 확보하기 위한 집단 간의 다툼이 빈번해졌고 정복 활동도 활발하였다.',
        citation: '— K1, p. 13 (PDF 6)'
      },
      {
        kind: '교과서 본문',
        title: '지배자의 등장과 국가의 출현',
        body:
          '이러한 상황에서 점차 계급의 분화가 뚜렷해지고 막강한 권력과 경제력을 가진 지배자가 등장하였다. 다양한 청동기와 거대한 고인돌은 당시 지배자가 누렸던 권력과 부를 반영한 것으로 보인다. 세력이 강한 집단의 지배자는 천손 사상을 내세워 주변 집단을 통합하였다. 사회 집단의 규모가 점차 커지는 가운데 일정한 정치 조직을 갖춘 국가도 출현하였다. 고조선은 청동기 시대에 등장한 우리 역사상 최초의 국가이다.',
        citation: '— K1, p. 13 (PDF 6)'
      },
      {
        kind: '판서 정리',
        title: '청동기 문화 — 도구·경제·사회 변화',
        body:
          '도구: 간석기(반달 돌칼), 토기(민무늬 토기), 청동기(비파형 동검). / 경제: 농경 발달, 잉여 생산물 발생 → 사유의 개념 형성, 빈부 차이 발생. / 사회 변화: 지배자 등장, 정복 활동 → 계급 분화 촉진, 강한 집단이 주변 통합 → 국가 출현(고조선).',
        citation: '— K1, p. 13 (PDF 6) 단원 지도 계획 판서'
      },
      {
        kind: '보충 자료',
        title: '만주와 한반도 일대의 청동기·철기 시대',
        body:
          '기원전 2000년~기원전 1500년에 만주와 한반도 일대에서 청동기 문화가 시작되었다. 철기 문화는 기원전 5세기경 시작되었다. 청동기의 제작은 원재료인 구리, 아연과 이를 다룰 수 있는 전문 기술을 가진 장인이 있어야 가능한 일이었다. 즉, 장인의 출현은 당시 사회에서 직업 및 역할 분화가 이루어졌음을 의미한다.',
        citation: '— K1, p. 13 (PDF 6) 보충'
      },
      {
        kind: '자료 설명',
        title: '청동기 시대 마을의 모습',
        body:
          '잉여 생산물과 농경지를 둘러싼 대립이 빈번해지자 청동기 시대 사람들은 방어에 유리한 구릉에 마을을 형성하고 그 주변에 도랑(환호)과 나무 울타리(목책)를 만들었다.',
        citation: '— K1, p. 13 (PDF 6) 청동기 시대의 마을 복원 상상도 설명'
      },
      {
        kind: '자료 설명',
        title: '비파형 동검 vs 중국식 동검',
        body:
          '비파형 동검은 검의 몸통과 손잡이가 따로 만들어지는 조립식이며 검의 중앙에 돌기가 있다. 반면 중국식 동검은 날이 곧고 손잡이와 검의 몸통이 함께 붙어 제작된다.',
        citation: '— K1, p. 13 (PDF 6) 비파형 동검 자료 설명'
      }
    ],
    map: {
      title: '청동기 시대 — 만주·한반도 청동기 문화권',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 60 30 L 130 22 L 215 28 L 235 60 L 248 105 L 240 145 L 222 185 L 198 215 L 168 218 L 148 195 L 138 155 L 132 105 L 100 90 L 70 70 Z',
          label: '만주~한반도 청동기 문화권' }
      ],
      pins: [
        { x: 100, y: 60,  label: '랴오닝(요녕)', sub: '비파형 동검 분포', amber: true },
        { x: 175, y: 65,  label: '평양',         sub: '고조선 중심권' },
        { x: 192, y: 110, label: '여주',         sub: '반달 돌칼 출토', amber: true },
        { x: 178, y: 75,  label: '신천',         sub: '비파형 동검' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '비파형 동검 (만주·한반도) — 청동기 대표 유물',           ref: 'K1, p. 13 (PDF 6)' },
      { slot: 'square', caption: '반달 돌칼 (경기 여주) — 추수용 농기구',                   ref: 'K1, p. 13 (PDF 6)' },
      { slot: 'square', caption: '민무늬 토기 — 청동기 시대 토기',                          ref: 'K1, p. 13 (PDF 6)' },
      { slot: 'square', caption: '탁자식 고인돌 — 지배자의 무덤',                           ref: 'K1, p. 13 (PDF 6)' },
      { slot: 'wide',   caption: '청동기 시대의 마을 복원 상상도 — 환호(도랑)·목책(나무 울타리)', ref: 'K1, p. 13 (PDF 6)' }
    ],
    linked: ['k-neolithic', 'k-gojoseon', 'k-iron']
  },

  // ============================================================
  // 고조선 · 기원전 2333~108 (우리 역사상 최초의 국가)
  //   출처: K1 미래엔 한국사 교사용 교과서 Ⅰ · PDF page 7 / p.14
  //   "우리 역사상 최초의 국가 고조선" 단원 전체 인용
  // ============================================================
  'k-gojoseon': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.93,
    fileRef: 'K1 · 미래엔 한국사 Ⅰ · p. 14 (PDF 7)',
    overview: {
      summary:
        '고조선은 청동기 시대의 농경 문화를 바탕으로 성립하여 철기 시대까지 이어졌다. 『삼국유사』에 실려 있는 단군왕검의 고조선 건국 이야기에는 환웅이 이끄는 집단과 곰을 토템으로 하는 집단의 결합으로 이루어진 건국 과정과 지배 계급의 출현, 농경 사회의 모습 등이 반영되어 있다. 고조선은 랴오닝 지방과 한반도 서북부 일대를 무대로 성장하였으며, 기원전 7세기경에는 중국에도 그 존재가 알려져 있었다. 국가 체제를 정비하고 철기 문화를 수용하며 발전하던 고조선은 기원전 4세기에 중국의 전국 7웅 가운데 하나인 연과 맞서다가 공격을 받아 서쪽 영토를 잃기도 하였다. 하지만 기원전 3세기에는 부왕에서 준왕으로 왕위가 세습되었고, 상(相)·대부(大夫)·장군 등 관직을 두었다. 이러한 사실은 고조선이 국왕을 중심으로 일정한 관직 체계를 갖추고 있었음을 보여 준다. 중국의 진·한 교체기에 1천여 명의 무리를 이끌고 망명한 위만은 세력을 키워 준왕을 몰아내고 스스로 왕이 되었다(기원전 194). 그 후 고조선은 더욱 발전된 철기 문화를 기반으로 성장하면서 한반도 중남부의 진(辰)과 중국의 한(漢) 사이에서 중계 무역으로 이익을 얻었다. 그러나 한 무제의 침공을 받아 1년여간 항전했지만 결국 멸망하였다(기원전 108). 한은 고조선의 일부 지역에 낙랑군 등 군현을 설치하였다. 고조선은 8조항의 법률(8조법)로 사회 질서를 유지하였는데, 한 군현이 설치된 이후에는 법률이 60여 조로 늘어났다. 비파형 동검과 탁자식 고인돌, 미송리식 토기 등은 고조선의 문화와 관련된 것으로 여겨진다. 고조선의 중심지에 대해서는 랴오허강 유역설, 대동강 유역설, 이동설 등의 학설이 있다.',
      terms: [
        { label: '단군왕검',
          def: '고조선 지배자의 칭호. 단군은 제사장, 왕검은 정치적 지배자를 뜻한다. 제정일치 사회의 면모를 보여 준다.' },
        { label: '단군의 고조선 건국',
          def: '단군왕검의 고조선 건국에 관한 기록은 『삼국유사』, 『제왕운기』, 『동국통감』, 『동국여지승람』 등 여러 문헌에 실려 있다. 『동국통감』에 따르면 고조선은 기원전 2333년에 건국되었다.' },
        { label: '8조법',
          def: '고조선의 사회 규범. 현재는 3개조만 전해진다. "사람을 죽인 자는 즉시 죽이고, 남에게 상처를 입힌 자는 곡식으로 갚는다. 도둑질한 자는 노비로 삼는다." 한의 침입 이후 법률이 각박해지면서 조목도 60여 개로 늘어났다.' },
        { label: '위만 조선',
          def: '중국 진·한 교체기에 1천여 명을 이끌고 망명한 위만이 준왕을 몰아내고 스스로 왕이 된(기원전 194) 정권. 왕이 된 뒤에도 나라 이름을 그대로 조선이라 하였고, 토착민 출신이 높은 지위에 오른 경우가 많았다. 단군의 고조선을 계승한 것으로 볼 수 있다.' },
        { label: '중계 무역',
          def: '위만 조선이 한반도 중남부의 진(辰)과 중국의 한(漢) 사이에서 상품을 중간에서 매개하여 이익을 얻은 무역 형태. 발전된 철기 문화를 기반으로 가능했다.' },
        { label: '낙랑군 등 군현',
          def: '고조선 멸망 후(기원전 108) 한이 고조선의 일부 지역에 설치한 군현. 한사군(낙랑·진번·임둔·현도)이라고도 불린다.' },
        { label: '비파형 동검 · 탁자식 고인돌',
          def: '청동기 시대의 대표 유물. 두 유물의 분포 지역을 토대로 고조선 관련 문화 범위를 짐작할 수 있다.' },
        { label: '왕검성', def: '고조선의 수도. 한의 공격에 1년여 동안 맞서 싸웠으나 함락되며 고조선이 멸망하였다(기원전 108).' },
        { label: '미송리식 토기', def: '비파형 동검·탁자식 고인돌과 함께 고조선의 문화와 관련된 것으로 여겨지는 토기.' }
      ],
      timeline: [
        { y: -2333, label: '◆ 고조선 건국 (『동국통감』)' },
        { y: -700,  label: '기원전 7세기경 — 춘추 시대 제(齊)와 교역, 중국에 존재가 알려짐' },
        { y: -400,  label: '기원전 4세기 — 연과 대결, 서쪽 영토 상실' },
        { y: -300,  label: '기원전 3세기 — 부왕→준왕 왕위 세습, 상·대부·장군 관직 설치' },
        { y: -194,  label: '위만, 준왕을 몰아내고 즉위 — 위만 조선' },
        { y: -108,  label: '고조선 멸망 — 한 무제의 침공, 낙랑군 등 군현 설치' }
      ]
    },
    sources: [
      {
        kind: '교과서 본문',
        title: '고조선의 성립 — 단군 신화의 의미',
        body:
          '고조선은 청동기 시대의 농경 문화를 바탕으로 성립하여 철기 시대까지 이어졌다. 『삼국유사』에 실려 있는 단군왕검의 고조선 건국 이야기에는 환웅이 이끄는 집단과 곰을 토템으로 하는 집단의 결합으로 이루어진 건국 과정과 지배 계급의 출현, 농경 사회의 모습 등이 반영되어 있다.',
        citation: '— K1, p. 14 (PDF 7)'
      },
      {
        kind: '교과서 본문',
        title: '고조선의 성장과 국가 체제',
        body:
          '고조선은 랴오닝 지방과 한반도 서북부 일대를 무대로 성장하였으며, 기원전 7세기경에는 중국에도 그 존재가 알려져 있었다. 국가 체제를 정비하고 철기 문화를 수용하며 발전하던 고조선은 기원전 4세기에 중국의 전국 7웅 가운데 하나인 연과 맞서다가 공격을 받아 서쪽 영토를 잃기도 하였다. 하지만 기원전 3세기에는 부왕에서 준왕으로 왕위가 세습되었고, 상(相)·대부(大夫)·장군 등 관직을 두었다. 이러한 사실은 고조선이 국왕을 중심으로 일정한 관직 체계를 갖추고 있었음을 보여 준다.',
        gloss:
          '고조선은 기원전 7세기 무렵 춘추 시대의 제(齊)와 교역하였다는 중국 측 기록이 남아 있다.',
        citation: '— K1, p. 14 (PDF 7)'
      },
      {
        kind: '교과서 본문',
        title: '위만 조선과 멸망',
        body:
          '중국의 진·한 교체기에 1천여 명의 무리를 이끌고 망명한 위만은 세력을 키워 준왕을 몰아내고 스스로 왕이 되었다(기원전 194). 그 후 고조선은 더욱 발전된 철기 문화를 기반으로 성장하면서 한반도 중남부의 진(辰)과 중국의 한(漢) 사이에서 중계 무역으로 이익을 얻었다. 그러나 한 무제의 침공을 받아 1년여간 항전했지만 결국 멸망하였다(기원전 108). 한은 고조선의 일부 지역에 낙랑군 등 군현을 설치하였다.',
        gloss:
          '위만은 왕이 된 뒤에도 나라 이름을 그대로 조선이라 하였고, 그의 정권에는 토착민 출신이 높은 지위에 오른 경우가 많았다. 위만의 고조선은 단군의 고조선을 계승한 것으로 볼 수 있다.',
        citation: '— K1, p. 14 (PDF 7)'
      },
      {
        kind: '사료',
        title: '『한서』 — 고조선 8조법',
        body:
          '사람을 죽인 자는 즉시 죽이고, 남에게 상처를 입힌 자는 곡식으로 갚는다. 도둑질한 자는 노비로 삼는다. 이를 용서받고자 하는 자는 한 사람마다 50만 전을 내야 한다. …… 여자들은 모두 정숙하여 음란하고 편벽된 짓을 하지 않았다.',
        gloss:
          '위 사료를 통해 추측할 수 있는 고조선 사회의 모습 — 고조선은 생명과 노동력을 중시하였고, 사유 재산을 보호하였으며, 노비가 존재한 신분제 사회였다. 또한 남성 중심의 가부장적 사회였다. (8조법 중 현재는 3개조가 전해지고 있다. 고조선의 법률은 간략하였으나 한의 침입 이후 법률이 각박해지면서 조목도 60여 개로 늘어났다.)',
        citation: '— 『한서』 / K1, p. 14 (PDF 7) 사료 톡톡'
      },
      {
        kind: '판서 정리',
        title: '우리 역사상 최초의 국가 고조선',
        body:
          '① 성립: 청동기, 농경 문화를 기반으로 성립 → 철기 시대까지 발전. / ② 성쇠: 기원전 4세기에 연과 대결, 기원전 3세기에 왕위 세습·관직 설치 → 기원전 2세기 중국에서 이주해 온 위만이 집권 → 진(辰)과 중국 한 사이에서 중계 무역으로 성장 → 한의 침입으로 멸망(기원전 108). / ③ 사회: 8조법 운영 → 노동력 중시, 계급 존재, 농경 사회 등.',
        citation: '— K1, p. 14 (PDF 7) 단원 지도 계획 판서'
      }
    ],
    map: {
      title: '고조선 관련 문화 범위 — 탁자식 고인돌 · 비파형 동검 분포',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 50 40 L 130 22 L 200 28 L 230 50 L 245 95 L 240 145 L 222 185 L 198 215 L 168 218 L 148 195 L 138 155 L 132 105 L 100 90 L 70 70 Z',
          label: '고조선 관련 문화 범위 (랴오닝~한반도 서북부)' }
      ],
      pins: [
        { x:  80, y:  55, label: '랴오허(오허강)', sub: '랴오닝 지방' },
        { x: 110, y:  35, label: '백두산',          sub: '' },
        { x:  95, y:  78, label: '다링강',          sub: '랴오닝 문화권' },
        { x: 145, y:  55, label: '압록강',          sub: '' },
        { x: 170, y:  82, label: '평양',            sub: '고조선 중심', amber: true },
        { x: 180, y:  78, label: '탁자식 고인돌 (평양 장리)', sub: '청동기 무덤', amber: true },
        { x: 175, y:  92, label: '구월산',          sub: '단군 전승지' },
        { x: 190, y: 115, label: '마니산',          sub: '단군 제천단' },
        { x: 185, y:  68, label: '비파형 동검 (황해 신천)', sub: '고조선 유물' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '비파형 동검 (황해 신천) — 검날과 손잡이를 따로 만들어 조립', ref: 'K1, p. 14 (PDF 7)' },
      { slot: 'square', caption: '탁자식 고인돌 (평양 장리) — 청동기 시대 대표 무덤 양식',     ref: 'K1, p. 14 (PDF 7)' },
      { slot: 'wide',   caption: '탁자식 고인돌·비파형 동검 분포로 본 고조선 관련 문화 범위', ref: 'K1, p. 14 (PDF 7)' }
    ],
    linked: ['k-bronze', 'k-iron', 'k-buyeo']
  },

  // ============================================================
  // 철기 시대 · 기원전 5세기경 ~ (정복 활동·교역 확대·여러 나라의 출현)
  //   출처: K1 미래엔 한국사 교사용 교과서 Ⅰ · PDF page 6 / p.13
  //   "계급의 발생과 국가의 출현" 단원 · 철기 문화 부분 전체 인용
  // ============================================================
  'k-iron': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.89,
    fileRef: 'K1 · 미래엔 한국사 Ⅰ · p. 13 (PDF 6)',
    overview: {
      summary:
        '사회 변동은 철제 농기구와 무기의 보급으로 더욱 촉진되었다. 농업 생산력이 비약적으로 증가하여 경제 기반이 확대되었고, 정복 활동도 더욱 활발해졌다. 이에 따라 교역이 확대되고, 사회 집단의 통합이 빠르게 진행되었다. 철기 문화를 바탕으로 만주와 한반도 일대에는 부여, 고구려, 삼한 등 여러 나라가 나타났다. 한편 철기 유적에서 발견되는 명도전 등 화폐나 경남 창원 다호리 유적의 붓은 중국과 교류가 활발하였고 한자도 사용되었음을 보여 준다. 중국과의 교류는 만주와 한반도 일대 여러 나라의 문화 발전에도 많은 영향을 주었다. 청동기 시대의 청동은 지배층을 위한 의례용 기구로 많이 사용되었지만, 철기 시대의 철제 도구는 농기구 등으로 피지배층에게도 보급되었다. 쑹화강 유역의 부여는 일찍부터 중국과 교류하며 빠르게 성장하였고, 부여에서 온 이주민과 압록강 유역의 토착 세력이 졸본 지역에 고구려를 세웠다. 옥저와 동예는 왕이 없이 읍군, 삼로 등 군장이 나라를 다스렸으며, 한반도 남부 지역에서는 마한, 변한, 진한의 삼한이 성장하였다.',
      terms: [
        { label: '철제 농기구',
          def: '철로 만든 농기구. 청동기 시대의 돌·나무 농기구를 대체하면서 농업 생산력을 비약적으로 증가시켰다. 경제 기반 확대의 토대.' },
        { label: '철제 무기',
          def: '철로 만든 무기. 정복 활동이 더욱 활발해지는 계기가 되었고, 사회 집단의 통합을 촉진하였다.' },
        { label: '세형 동검',
          def: '철기 시대에 한반도 안에서 독자적으로 발전한 청동검. 비파형 동검에서 발전한 형태로, 충남 아산 등에서 출토. 철기 시대의 청동기는 주로 의식용으로 사용되었다.' },
        { label: '잔무늬 거울',
          def: '철기 시대의 의식용 청동기 유물. 표면에 잔무늬가 새겨져 있다.' },
        { label: '명도전',
          def: '중국의 화폐. 한반도(평북 위원 등)에서도 발견되며, 철기 시대 중국과의 활발한 교류를 보여 주는 증거이다.' },
        { label: '다호리 붓',
          def: '경남 창원 다호리 유적에서 출토된 붓. 철기 시대에 한자가 사용되었음을 보여 준다.' },
        { label: '여러 나라의 출현',
          def: '철기 문화를 바탕으로 만주와 한반도 일대에 부여·고구려·삼한 등 여러 나라가 나타났다.' },
        { label: '읍군·삼로', def: '왕이 없던 옥저와 동예에서 나라를 다스린 군장.' }
      ],
      timeline: [
        { y: -2000, label: '청동기 시대 (이전 단계)' },
        { y: -450,  yl: '5세기 BCE경', label: '◆ 철기 시대 (대표 표기) — 만주·한반도 철기 문화 시작 · 철제 농기구·무기 보급' },
        { y: -200,  yl: '2세기 BCE 무렵', label: '부여·고구려·삼한 등 여러 나라 등장' },
        { y: -108,  label: '고조선 멸망 → 만주·한반도 여러 나라 분립' }
      ]
    },
    sources: [
      {
        kind: '교과서 본문',
        title: '철기 시대 — 생산력 증가와 정복 활동',
        body:
          '사회 변동은 철제 농기구와 무기의 보급으로 더욱 촉진되었다. 농업 생산력이 비약적으로 증가하여 경제 기반이 확대되었고, 정복 활동도 더욱 활발해졌다. 이에 따라 교역이 확대되고, 사회 집단의 통합이 빠르게 진행되었다. 철기 문화를 바탕으로 만주와 한반도 일대에는 부여, 고구려, 삼한 등 여러 나라가 나타났다.',
        citation: '— K1, p. 13 (PDF 6)'
      },
      {
        kind: '교과서 본문',
        title: '중국과의 교류 — 명도전·다호리의 붓',
        body:
          '한편 철기 유적에서 발견되는 명도전 등 화폐나 경남 창원 다호리 유적의 붓은 중국과 교류가 활발하였고 한자도 사용되었음을 보여 준다. 중국과의 교류는 만주와 한반도 일대 여러 나라의 문화 발전에도 많은 영향을 주었다.',
        citation: '— K1, p. 13 (PDF 6)'
      },
      {
        kind: '판서 정리',
        title: '철기 문화 — 도구·경제·사회 변화',
        body:
          '도구: 청동기(주로 의식용, 세형 동검, 잔무늬 거울), 철기(농기구, 무기). / 경제: 철제 농기구 사용으로 농업 생산력 증가, 중국과 교류 활발(명도전). / 사회 변화: 정복 활동 활발, 교역 확대 → 사회 집단의 통합 촉진 → 만주와 한반도 일대에 여러 나라 출현.',
        citation: '— K1, p. 13 (PDF 6) 단원 지도 계획 판서'
      },
      {
        kind: '자료 설명',
        title: '명도전 — 중국과의 교류 증거',
        body:
          '명도전은 중국의 화폐로 한반도에서도 발견되었다. 평북 위원 등에서 출토되어 철기 시대에 만주·한반도 일대가 중국과 활발히 교류하였음을 알려 준다.',
        citation: '— K1, p. 13 (PDF 6) 명도전 자료 설명'
      },
      {
        kind: '자료 설명',
        title: '세형 동검 — 한반도 독자 발전',
        body:
          '비파형 동검은 만주와 한반도에 걸쳐 발견되는 청동기 시대의 대표적인 유물이다. 청동검은 철기 시대에 한반도 안에서 독자적인 세형 동검으로 발전하였다.',
        citation: '— K1, p. 13 (PDF 6) 비파형 동검·세형 동검 자료 설명'
      }
    ],
    map: {
      title: '철기 시대 — 만주·한반도 여러 나라 출현',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 60 30 L 130 22 L 215 28 L 235 60 L 248 105 L 240 145 L 222 185 L 198 215 L 168 218 L 148 195 L 138 155 L 132 105 L 100 90 L 70 70 Z',
          label: '만주~한반도 철기 문화권' }
      ],
      pins: [
        { x: 110, y:  45, label: '부여',          sub: '만주 송화강',  amber: true },
        { x: 145, y:  72, label: '고구려',        sub: '졸본·압록강', amber: true },
        { x: 145, y:  35, label: '위원 (명도전)', sub: '평북 — 중국 화폐' },
        { x: 218, y: 130, label: '아산',          sub: '세형 동검' },
        { x: 215, y: 175, label: '창원 다호리',   sub: '붓 출토 (한자 사용)', amber: true },
        { x: 195, y: 180, label: '삼한',          sub: '한반도 남부' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '명도전 (평북 위원) — 중국의 화폐 (교류의 증거)',           ref: 'K1, p. 13 (PDF 6)' },
      { slot: 'square', caption: '세형 동검 (충남 아산) — 한반도 독자 발전 청동검',         ref: 'K1, p. 13 (PDF 6)' },
      { slot: 'square', caption: '잔무늬 거울 — 철기 시대 의식용 청동기',                    ref: 'K1, p. 13 (PDF 6)' },
      { slot: 'wide',   caption: '경남 창원 다호리 출토 붓 — 한자 사용의 증거',              ref: 'K1, p. 13 (PDF 6)' }
    ],
    linked: ['k-bronze', 'k-gojoseon', 'k-buyeo', 'k-goguryeo', 'k-samhan']
  },

  // ============================================================
  // 동아시아 — 구석기 시대
  //   출처: W1 미래엔 세계사 교사용 교과서 1 (선사시대 단원)
  //          BS 비상교육 세계사 교사용 교과서 (1단원: 현생 인류와 문명의 형성)
  // ============================================================
  'e-paleo': {
    syncRatio: 0.85,
    fileRef: 'W1 · 미래엔 세계사 1, p.20 / BS · 비상교육 세계사, p.10 / DH1 · 미래엔 동아시아 역사 기행 I단원 (생태환경 배경)',
    notes: {
      sections: [
        {
          head: '一. 동아시아의 생태환경 (구석기 인류의 무대)',
          list: [
            '서쪽 — 히말라야산맥과 평균 해발 4,500m 이상의 티베트고원 (인도와 동아시아의 경계)',
            '동쪽 — 중국 동부·남부, 만주, 한반도 일대의 해발 1,000m 이하 평원 지대',
            '  · 황허강·창장강·메콩강 — 여름철 범람으로 비옥한 평야 형성',
            '북쪽 — 몽골 고비 사막과 초원 지대',
            '남쪽 — 일본·필리핀·인도네시아 등 도서 지형 (환태평양 조산대 — 「불의 고리」: 화산·지진 활발)',
            '계절풍의 영향으로 대륙 내부로 갈수록 건조하고 기온의 연교차가 큰 대륙성 기후',
            '→ 다양한 지형·기후는 구석기 인류의 분포와 생활 방식 차이의 기반이 됨'
          ]
        },
        {
          head: '二. 동아시아 구석기 시대 — 인류와 생활',
          list: [
            '인류가 출현했던 시기부터 약 1만 년 전까지 — 구석기 시대',
            '대표 화석: 베이징 주구점 — 호모 에렉투스(베이징 원인)',
            '도구: 뗀석기 (주먹도끼·찍개·긁개·자르개) + 골각기 (뼈·뿔로 만든 도구)',
            '경제: 채집·수렵·어로 — 자연에서 식량 채취',
            '주거: 동굴 · 바위 그늘 · 막집 — 이동 생활',
            '불 사용 → 추위 극복, 음식 익혀 먹기, 맹수 방어',
            '시신 매장 풍습 → 사후 세계 관념의 시작'
          ]
        },
        {
          head: '三. 한반도·일본의 구석기',
          list: [
            '한반도: 단양 금굴 · 공주 석장리 · 연천 전곡리(주먹도끼) · 평남 검은모루',
            '일본: 이와주쿠(군마현) 등',
            '환태평양 조산대 위의 일본 열도는 화산·지진이 잦았으나 신석기 이전부터 인류 활동'
          ]
        }
      ]
    },
    overview: {
      summary:
        '동아시아의 구석기 시대 — 인류가 출현했던 시기부터 약 1만 년 전까지를 구석기 시대라고 한다. 동아시아는 서쪽의 티베트고원·히말라야산맥, 동쪽의 황허·창장강 평원, 북쪽의 몽골 초원, 남쪽의 도서 지형 등 다양한 생태환경을 가졌으며, 이러한 자연환경은 구석기 인류의 분포와 생활의 토대가 되었다. 사람들은 뗀석기(주먹도끼·찍개·긁개)와 골각기를 사용하며 채집·수렵·어로를 통해 식량을 얻었고, 이동 생활을 하며 동굴·바위 그늘·막집에 거주하였다. 불을 사용해 추위를 피하고 음식을 익혀 먹었다. 중국 베이징 일대 주구점에서 호모 에렉투스(베이징 원인) 화석이 발견되었다.',
      terms: [
        { label: '베이징 원인',     def: '중국 베이징 주구점에서 발견된 호모 에렉투스 단계의 화석 인류.' },
        { label: '뗀석기',          def: '돌을 깨거나 떼어 만든 도구. 주먹도끼·찍개·긁개·자르개 등.' },
        { label: '골각기',          def: '동물의 뼈나 뿔로 만든 도구. 구석기 후기에 활발히 사용.' },
        { label: '호모 에렉투스',    def: '약 180만 년 전 등장한 인류. 직립 보행, 언어로 의사소통, 불 사용.' },
        { label: '티베트고원',       def: '동아시아 서쪽 평균 해발 4,500m 이상의 고원. 인도와 동아시아의 자연 경계.' },
        { label: '환태평양 조산대',  def: '동아시아 동쪽·남쪽 도서 지역을 통과하는 활발한 지진·화산대. 「불의 고리」.' }
      ],
      timeline: [
        { yl: '약 210만 년 전', label: '◆ 동아시아 인류의 흔적 — 중국 상천 유적 석기' },
        { yl: '약 1만 년 전', label: '신석기 시대로 이행' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '동아시아 구석기 — 사실 정리',
        body: '· 시기: 인류 출현 ~ 약 1만 년 전 / · 도구: 뗀석기·골각기 / · 생활: 채집·수렵·어로, 이동 / · 주거: 동굴·바위 그늘·막집 / · 불 사용, 시신 매장.',
        citation: '— W1 미래엔 세계사 1, BS 비상교육 세계사 (선사시대 단원 종합)' },
      { kind: '대표 화석', title: '베이징 원인 (주구점)',
        body: '중국 베이징 주구점에서 발견된 호모 에렉투스 단계의 화석 인류. 동아시아 구석기 인류의 대표 사례.',
        citation: '— W1 (선사시대 보충)' },
      { kind: '교과서 요약', title: '동아시아의 생태환경 — 구석기 인류의 무대',
        body: '서쪽: 히말라야산맥·티베트고원(평균 해발 4,500m 이상) / 동쪽: 황허·창장강·한반도의 해발 1,000m 이하 평원 / 북쪽: 몽골 고비 사막과 초원 / 남쪽: 환태평양 조산대 위의 도서 지형. 계절풍 영향으로 대륙 내부는 건조하고 연교차가 큰 대륙성 기후. 다양한 지형·기후는 구석기 시대 이래 동아시아 사람들의 생활 방식 차이의 기반이 되었다.',
        citation: '— DH1 미래엔 동아시아 역사 기행 I단원, pp.18~19 (동아시아의 생태환경)' }
    ],
    map: {
      title: '동아시아 구석기 대표 유적',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 40 60 L 220 30 L 280 60 L 320 130 L 280 200 L 200 220 L 120 200 L 60 150 Z', label: '동아시아' }
      ],
      pins: [
        { x: 130, y: 100, label: '주구점 (베이징)',     sub: '베이징 원인 화석', amber: true },
        { x: 200, y: 110, label: '한반도',              sub: '검은모루·전곡리·석장리' },
        { x: 270, y: 140, label: '일본 열도',           sub: '구석기 유적' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '베이징 원인 복원도 (호모 에렉투스)',  ref: 'W1' },
      { slot: 'square', caption: '동아시아 출토 뗀석기 — 주먹도끼·찍개', ref: 'BS p.10' }
    ],
    linked: ['k-paleo', 'e-neolithic', 'w-paleo', 's-paleo']
  },

  // ============================================================
  // 동아시아 — 신석기 시대
  // ============================================================
  'e-neolithic': {
    syncRatio: 0.88,
    fileRef: 'W1 · 미래엔 세계사 1, pp.19~20 / BS · 비상교육 세계사, p.11 / DH1 · 미래엔 동아시아 역사 기행 I단원 (생태환경에 따른 생활 분화)',
    notes: {
      sections: [
        {
          head: '一. 신석기 혁명 — 동아시아의 새로운 출발',
          list: [
            '약 1만 년 전 빙하기 종료 → 기후 온난화 → 동·식물상 변화',
            '식량 채집 단계 → 식량 생산 단계로 발전 (농경·목축의 시작) = 신석기 혁명',
            '간석기 · 토기 · 뼈바늘 등 새 도구 등장',
            '정착 생활·촌락 형성 → 인구 증가, 분업, 사회 조직의 토대',
            '자연 숭배(애니미즘)·영혼 숭배·토템 신앙 등 정신 문화 발달'
          ]
        },
        {
          head: '二. 생태환경에 따른 동아시아 생활의 분화',
          list: [
            '동아시아의 다양한 생태환경(지형·기후·강수량) → 지역별 생업 분화의 기반',
            '농경이 발달한 지역 — 연평균 강수량 400mm 이상의 평야 지대',
            '  · 강수량 풍부·기온 높은 남쪽 → 논농사(벼) — 창장강 유역, 한반도 남부, 일본 규슈 등',
            '  · 강수량 적고 기온 낮은 북쪽 → 밭농사(밀·잡곡) — 황허강 유역, 한반도 북부',
            '유목이 발달한 지역 — 강수량 적고 기온 낮은 초원 지대',
            '  · 양·염소·말·소·낙타 등 가축 사육, 계절 이동, 게르(이동식 가옥)',
            '해양 생활 — 동쪽·남쪽 도서·해안 지역 → 어로·조개 채취 (조개무지 유적)',
            '※ 신석기 시대부터 형성된 유목·농경·해양 세계의 분화는 이후 동아시아 역사의 큰 흐름이 됨'
          ]
        },
        {
          head: '三. 동아시아 신석기의 대표 문화',
          list: [
            '중국 황허강 유역 — 양사오 문화(중류, 채색 토기 채도) / 룽산 문화(하류, 검은 토기 흑도)',
            '한반도 — 빗살무늬 토기, 간석기 / 서울 암사동·부산 동삼동·양양 오산리 유적',
            '일본 — 조몬(縄文) 토기 — 새끼줄 무늬, 정착 채집·수렵·어로 생활',
            '몽골·만주 초원 — 후일의 유목 문화로 이어지는 신석기 후기 채집·수렵 단계'
          ]
        }
      ]
    },
    overview: {
      summary:
        '동아시아의 신석기 시대 — 약 1만 년 전 빙하기 종료 후 농경과 목축이 시작되어 인류 생활의 근본적 변화(신석기 혁명)가 일어났다. 동아시아의 다양한 생태환경(지형·기후·강수량 차이)에 따라 농경 세계(평야·강 유역)·유목 세계(북쪽 초원)·해양 세계(동남쪽 도서·해안)의 분화가 시작되었다. 황허강 유역에서는 양사오 문화의 채색 토기(채도)와 룽산 문화의 검은색 토기(흑도)가, 한반도에서는 빗살무늬 토기와 간석기, 일본에서는 조몬 토기가 발달하였다. 정착 생활과 촌락이 형성되며 이후 청동기 사회와 초기 국가로 이어지는 토대가 마련되었다.',
      terms: [
        { label: '양사오 문화',  def: '황허강 중류 일대의 신석기 문화. 채색 토기(채도)가 특징.' },
        { label: '룽산 문화',    def: '황허강 하류 일대의 신석기 후기 문화. 검은색 토기(흑도)가 특징.' },
        { label: '신석기 혁명',  def: '농경·목축의 시작으로 식량 채집 단계에서 식량 생산 단계로 발전한 변화.' },
        { label: '조몬 토기',    def: '일본의 신석기 시대 토기. 새끼줄 무늬(縄文)가 특징.' },
        { label: '농경 세계',    def: '연평균 강수량 400mm 이상의 평야·강 유역. 정착·벼농사 또는 밭농사 발달.' },
        { label: '유목 세계',    def: '강수량 적은 북쪽 초원 지대. 가축을 이끌고 계절 이동 생활.' },
        { label: '해양 세계',    def: '동쪽·남쪽 도서·해안 지역. 어로·조개 채취 중심의 생업.' }
      ],
      timeline: [
        { yl: '~ 약 1만 년 전', label: '구석기 시대' },
        { yl: '약 1만 년 전 ~', label: '◆ 동아시아 신석기 시대' },
        { yl: '8000 BCE경', label: '동아시아 농경 시작' },
        { yl: '6000 BCE경', label: '창장강 중·하류 벼농사 시작' },
        { y: -2500, label: '황허강 유역 청동기 사용·초기 국가 등장' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '동아시아 신석기 — 사실 정리',
        body: '· 시기: 약 1만 년 전 ~ / · 도구: 간석기·토기·뼈바늘 / · 경제: 농경·목축 시작 / · 주거: 움집, 강가·바닷가 정착 / · 문화: 애니미즘.',
        citation: '— W1, BS (선사시대 단원 종합)' },
      { kind: '대표 문화', title: '황허강 유역의 신석기 문화',
        body: '양사오(채색 토기 채도) / 룽산(검은색 토기 흑도). 이후 청동기를 사용하는 하·상(은) 왕조로 이행.',
        citation: '— W1 p.19' },
      { kind: '대표 문화', title: '한반도·일본의 신석기',
        body: '한반도: 빗살무늬 토기, 간석기 / 일본: 조몬 토기. 모두 농경·정착 생활로 이행.',
        citation: '— BS p.11 (대조 정리)' },
      { kind: '교과서 요약', title: '생태환경에 따른 동아시아 생활의 분화 — 농경·유목·해양 세계',
        body: '농경 세계: 연평균 강수량 400mm 이상 평야 지대. 남쪽(강수량·기온 ↑)은 논농사(벼), 북쪽(강수량·기온 ↓)은 밭농사(밀·잡곡). · 유목 세계: 강수량 적고 기온 낮은 초원 지대. 양·말·소 등 가축 사육·계절 이동. · 해양 세계: 동쪽·남쪽 도서·해안 지역. 어로·조개 채취 중심. 신석기 시대부터 형성된 이 세 세계의 분화는 이후 동아시아 역사의 큰 줄기가 된다.',
        citation: '— DH1 미래엔 동아시아 역사 기행 I단원, pp.20~22 (동아시아 사람들의 생활 모습)' }
    ],
    map: {
      title: '동아시아 신석기 대표 유적',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 40 60 L 220 30 L 280 60 L 320 130 L 280 200 L 200 220 L 120 200 L 60 150 Z', label: '동아시아' }
      ],
      pins: [
        { x: 120, y: 130, label: '양사오 (황허 중류)', sub: '채도', amber: true },
        { x: 160, y: 140, label: '룽산 (황허 하류)',   sub: '흑도', amber: true },
        { x: 215, y: 130, label: '한반도',             sub: '암사동 빗살무늬' },
        { x: 280, y: 150, label: '일본 열도',          sub: '조몬 토기' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '채도 (양사오 문화) — 채색 토기',   ref: 'W1 p.19' },
      { slot: 'square', caption: '흑도 (룽산 문화) — 검은색 토기',   ref: 'W1 p.19' },
      { slot: 'wide',   caption: '뼈바늘 (중국) — 신석기 도구',      ref: 'BS p.11' }
    ],
    linked: ['e-paleo', 'k-neolithic', 'w-neolithic', 's-neolithic', 'e-bronze', 'e-xia']
  },

  // ============================================================
  // 동아시아 — 청동기 시대
  // ============================================================
  'e-bronze': {
    syncRatio: 0.87,
    fileRef: 'W1 · 미래엔 세계사 1, p.19 / BS · 비상교육 세계사, p.12 / DH1 · 미래엔 동아시아 역사 기행 I단원',
    notes: {
      sections: [
        {
          head: '一. 동아시아 청동기의 시작',
          list: [
            'BCE 2500년경 황허강 유역에서 청동기 사용, 정치 조직을 갖춘 초기 국가 등장',
            '대표 유적: 얼리터우(二里頭) 문화 — 하(夏) 왕조의 유적으로 추정',
            '청동제 도구 · 무기 · 의식용 제기(정·작 등) 제작',
            '농기구는 여전히 석기·목기 사용 — 청동기는 의식용·지배층 도구에 한정',
            '도시 국가와 초기 왕조의 물질적 기반 형성'
          ]
        },
        {
          head: '二. 사회 변화 — 계급 사회의 등장',
          list: [
            '농업 생산력 증대 → 잉여 생산물 발생 → 사유 재산·계급 분화',
            '청동기 제작 기술과 자원(구리·주석) 통제 → 지배 계층 형성',
            '대규모 노동력 동원이 가능한 정치 조직 등장 → 도시 국가·왕조',
            '제정일치(祭政一致)의 신권 정치 — 지배자가 제사와 정치를 함께 주관',
            '갑골문(상 왕조) — 점복 기록, 한자(漢字)의 원형'
          ]
        },
        {
          head: '三. 한반도·일본의 청동기',
          list: [
            '한반도 — BCE 20~15세기 무렵 만주와 한반도에서 청동기 시대 시작',
            '  · 비파형 동검 · 거친무늬 거울 · 민무늬 토기',
            '  · 고인돌(支石墓) — 군장(족장)의 권력 상징',
            '  · 청동기 시대를 바탕으로 단군왕검의 고조선 건국 (BCE 2333, 전승)',
            '일본 — 야요이(弥生) 시대 (BCE 3세기경 ~)',
            '  · 청동기와 철기가 거의 동시에 한반도로부터 전래',
            '  · 청동제 동탁(銅鐸) · 동모(銅鉾) — 의식·제사용',
            '  · 벼농사 본격 보급, 정착 농경 사회로 전환'
          ]
        },
        {
          head: '四. 동아시아 청동기의 의미',
          list: [
            '신석기 시대 평등 공동체 → 계급 사회·국가로 이행',
            '청동기 → 철기로 이어지는 기술 발전이 동아시아 고대 왕조의 토대',
            '농경 세계(중국 황허·창장, 한반도 남부 등)와 유목 세계(몽골 초원), 해양 세계(일본 열도 등)의 분화가 본격화'
          ]
        }
      ]
    },
    overview: {
      summary:
        '동아시아의 청동기 시대 — BCE 2500년경 황허강 유역의 황토 지대를 중심으로 청동기를 사용하고 정치 조직을 갖춘 초기 국가가 등장하였다. 청동제 도구·무기·의식용 제기가 제작되었으나 농기구는 여전히 석기·목기를 사용하였다. 농업 생산력의 증대와 잉여 생산물의 발생은 계급 사회와 도시 국가·초기 왕조(하·상) 등장의 토대가 되었다. 한반도에서는 비파형 동검·고인돌·민무늬 토기가 대표적이며, 고조선 건국의 물질적 기반이 되었다. 일본에서는 야요이 시대에 청동기와 철기가 거의 동시에 전래되어 벼농사와 정착 농경 사회로의 전환을 이끌었다.',
      terms: [
        { label: '얼리터우 문화',  def: '황허강 유역의 청동기 초기 문화. 하(夏) 왕조의 유적으로 추정.' },
        { label: '정(鼎)·작(爵)',  def: '상 왕조의 대표적 청동 제기. 정은 솥, 작은 술잔.' },
        { label: '갑골문',         def: '거북 배딱지·소 어깨뼈에 점친 내용을 새긴 문자. 한자의 원형.' },
        { label: '비파형 동검',     def: '한반도 청동기 시대의 대표 유물. 비파 모양의 청동 검.' },
        { label: '고인돌',         def: '청동기 시대 군장(족장)의 무덤. 한반도에 집중 분포.' },
        { label: '야요이 시대',     def: '일본의 청동기·철기 시대. BCE 3세기경부터 벼농사 기술과 청동기·철기 전파.' }
      ],
      timeline: [
        { yl: '약 1만 년 전 ~', label: '신석기 시대' },
        { y: -2500, label: '◆ 황허강 유역 청동기 사용·초기 국가 등장' },
        { y: -2333, label: '고조선 건국 (한반도)' },
        { y: -1600, label: '상(商) 왕조 — 갑골문·청동기' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '동아시아 청동기 — 사실 정리',
        body: '· 시기: BCE 2500년경 ~ / · 도구: 청동제 무기·의식용 제기 (정·작 등), 농기구는 석기·목기 / · 사회: 계급 분화, 도시 국가·초기 왕조 형성, 제정일치 신권 정치.',
        citation: '— W1, BS (선사~문명 단원 종합)' },
      { kind: '교과서 요약', title: '한반도·일본의 청동기',
        body: '한반도: 비파형 동검·거친무늬 거울·민무늬 토기·고인돌. 고조선 건국의 토대. / 일본: 야요이 시대 — 청동기·철기 거의 동시 전래, 벼농사 보급, 정착 농경 사회로 전환.',
        citation: '— DH1 미래엔 동아시아 역사 기행, BS 비상교육' }
    ],
    map: {
      title: '동아시아 청동기 문화권',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 40 60 L 220 30 L 280 60 L 320 130 L 280 200 L 200 220 L 120 200 L 60 150 Z', label: '동아시아' }
      ],
      pins: [
        { x: 140, y: 120, label: '얼리터우 (황허 중류)', sub: '하 왕조 추정', amber: true },
        { x: 175, y: 110, label: '은허·정저우',           sub: '상 왕조 청동기', amber: true },
        { x: 215, y: 130, label: '한반도',                sub: '비파형 동검·고인돌' },
        { x: 280, y: 160, label: '일본 열도',             sub: '야요이 시대' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '상의 청동 정(鼎)·작(爵)',     ref: 'W1 p.19' },
      { slot: 'square', caption: '비파형 동검 (한반도)',         ref: 'BS p.12' },
      { slot: 'square', caption: '고인돌 (한반도)',              ref: 'BS p.12' },
      { slot: 'square', caption: '동탁 (일본 야요이)',            ref: 'BS' }
    ],
    linked: ['e-neolithic', 'e-xia', 'e-shang', 'k-bronze', 's-mesopotamia']
  },

  // ============================================================
  // 유럽·미주 — 구석기 시대
  // ============================================================
  'w-paleo': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.87,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사, p.10',
    overview: {
      summary:
        '유럽의 구석기 시대 — 뗀석기와 골각기를 사용하며 채집·수렵으로 생활하였고, 동굴·바위 그늘·막집에 거주하며 이동 생활을 하였다. 시신을 매장하고 사후 세계 관념을 가졌으며, 사냥의 성공과 다산·풍요를 기원하는 동굴 벽화·조각상을 남겼다. 대표 유적으로 프랑스 쇼베 동굴(약 BCE 32000~29000)·라스코 동굴, 스페인 알타미라 동굴 벽화, 오스트리아 빌렌도르프의 비너스 조각상이 있다.',
      terms: [
        { label: '오스트랄로피테쿠스 아파렌시스', def: '약 390만 년 전 출현. 두 발로 걸으며 간단한 도구를 사용한 최초의 인류.' },
        { label: '호모 에렉투스',          def: '직립 보행, 언어로 의사소통, 불 사용.' },
        { label: '호모 네안데르탈렌시스',   def: '사후 세계에 대한 관념을 가짐. 시신 매장 풍습.' },
        { label: '호모 사피엔스',           def: '현생 인류. 약 20만 년 전 아프리카에서 처음 등장하여 세계 각지로 퍼져 나감.' },
        { label: '쇼베 동굴',               def: '프랑스 남부 동굴 벽화 유적. 약 BCE 32000~29000년 그림. 들소·사슴·코뿔소 등.' },
        { label: '빌렌도르프의 비너스',     def: '오스트리아 출토 구석기 조각상. 다산과 풍요의 상징.' }
      ],
      timeline: [
        { yl: '약 140만~110만 년 전', label: '◆ 서유럽 최초의 인류 — 스페인 아타푸에르카' },
        { yl: '약 1만 년 전', label: '신석기 시대로 이행' },
        { y: -3000, label: '크레타(미노스) 문명' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '유럽 구석기 — 사실 정리',
        body: '· 도구: 뗀석기 (주먹도끼·찍개·긁개) / · 생활: 채집·수렵·어로, 이동 / · 주거: 동굴·바위 그늘·막집 / · 문화: 동굴 벽화, 조각상, 시신 매장.',
        citation: '— W1, BS (선사시대 단원 종합)' },
      { kind: '인류 진화', title: '인류의 출현 단계',
        body: '오스트랄로피테쿠스 아파렌시스 → 호모 에렉투스 → 호모 네안데르탈렌시스 → 호모 사피엔스.',
        citation: '— W1 p.20 (주제 마무리 표)' },
      { kind: '대표 유적', title: '유럽의 구석기 동굴 벽화',
        body: '프랑스 쇼베 (BCE 32000~29000) · 라스코 / 스페인 알타미라. 사냥의 성공을 기원한 주술적 의미.',
        citation: '— BS p.10' },
      { kind: '대표 조각', title: '빌렌도르프의 비너스 (오스트리아)',
        body: '여성의 가슴·배를 과장한 조각상. 다산과 풍요를 기원하는 의미로 추정.',
        citation: '— BS p.10' }
    ],
    map: {
      title: '유럽 구석기 대표 유적',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 30 60 L 200 30 L 280 50 L 320 100 L 300 170 L 220 200 L 100 200 L 50 140 Z', label: '유럽' }
      ],
      pins: [
        { x: 140, y: 130, label: '쇼베 동굴 (프랑스)',  sub: 'BCE 32000~29000 벽화', amber: true },
        { x: 130, y: 140, label: '라스코 (프랑스)',     sub: '동굴 벽화' },
        { x: 110, y: 160, label: '알타미라 (스페인)',   sub: '동굴 벽화', amber: true },
        { x: 200, y: 100, label: '빌렌도르프 (오스트리아)', sub: '비너스 조각상' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '쇼베 동굴 벽화 (프랑스) — 들소·사슴·코뿔소',          ref: 'BS p.10' },
      { slot: 'square', caption: '빌렌도르프의 비너스 (오스트리아) — 구석기 조각상',     ref: 'BS p.10' },
      { slot: 'square', caption: '주먹도끼 (탄자니아·유럽 출토) — 뗀석기 대표',         ref: 'BS p.10' }
    ],
    linked: ['w-neolithic', 'k-paleo', 'e-paleo', 's-paleo']
  },

  // ============================================================
  // 유럽·미주 — 신석기 시대
  // ============================================================
  'w-neolithic': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.86,
    fileRef: 'W1 · 미래엔 세계사 1, pp.19~20 / BS · 비상교육 세계사, p.11',
    overview: {
      summary:
        '유럽의 신석기 시대 — 빙하기 종료 후 기후가 온화해지면서 농경·목축이 시작되었다. 간석기와 토기를 사용하고, 강가·바닷가에 움집을 짓고 정착하여 촌락을 이루었다. 신석기 후기에는 거석 숭배 신앙이 나타나 영국의 스톤헨지와 같은 거석 문화 유적이 곳곳에 만들어졌다.',
      terms: [
        { label: '신석기 혁명', def: '농경·목축의 시작으로 인류가 식량 채집에서 식량 생산 단계로 이행한 변화.' },
        { label: '간석기',      def: '용도에 맞추어 돌을 갈아 만든 도구. 돌낫·돌도끼 등.' },
        { label: '거석 문화',   def: '큰 돌로 만든 무덤·기념물·신전. 종교적 숭배의 장소로 추정된다.' },
        { label: '스톤헨지',    def: '영국 솔즈베리 북쪽의 거석 유적. 종교적 숭배 장소로 추정.' },
        { label: '애니미즘',    def: '자연물에 영혼이 깃들어 있다고 믿는 신앙.' }
      ],
      timeline: [
        { yl: '~ 약 1만 년 전', label: '구석기 시대' },
        { yl: '약 1만 년 전 ~', label: '◆ 유럽 신석기 시대' },
        { y: -3000, label: '크레타(미노스) 문명' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '유럽 신석기 — 사실 정리',
        body: '· 도구: 간석기·토기 / · 경제: 농경·목축 시작 / · 주거: 움집, 정착 촌락 / · 문화: 애니미즘, 거석 숭배.',
        citation: '— W1, BS (선사시대 단원 종합)' },
      { kind: '대표 유적', title: '스톤헨지 (영국)',
        body: '신석기 후기 거석 문화 유적. 솔즈베리 북쪽. 종교적 숭배 장소로 추정.',
        citation: '— BS p.11' },
      { kind: '대표 유물', title: '돌도끼 (프랑스)',
        body: '신석기 시대 간석기. 농경과 일상생활에 사용.',
        citation: '— BS p.11' }
    ],
    map: {
      title: '유럽 신석기 대표 유적',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 30 60 L 200 30 L 280 50 L 320 100 L 300 170 L 220 200 L 100 200 L 50 140 Z', label: '유럽' }
      ],
      pins: [
        { x: 110, y: 80,  label: '스톤헨지 (영국)',  sub: '거석 문화', amber: true },
        { x: 130, y: 130, label: '돌도끼 출토 (프랑스)', sub: '간석기' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '스톤헨지 (영국) — 거석 문화',          ref: 'BS p.11' },
      { slot: 'square', caption: '돌도끼 (프랑스) — 신석기 간석기',       ref: 'BS p.11' }
    ],
    linked: ['w-paleo', 'w-bronze', 'k-neolithic', 'e-neolithic', 's-neolithic']
  },

  // ============================================================
  // 유럽·미주 — 청동기 시대
  // ============================================================
  'w-bronze': {
    syncRatio: 0.86,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사 (선사~문명 단원)',
    notes: {
      sections: [
        {
          head: '一. 유럽 청동기의 시작',
          list: [
            'BCE 3000년경 동지중해(에게해 일대)와 발칸·중부 유럽에서 청동기 보급',
            '서아시아·이집트와의 교역을 통해 청동기 기술이 유럽으로 확산',
            '청동제 무기·장신구·제기 — 지배층의 권위 상징',
            '농기구는 여전히 석기·목기 사용'
          ]
        },
        {
          head: '二. 에게 문명 — 유럽 최초의 청동기 문명',
          list: [
            '크레타(미노스) 문명 (BCE 3000년경 ~, 크레타섬)',
            '  · 크노소스 궁전, 선형 문자 A, 평화적 해상 무역',
            '미케네 문명 (BCE 1400년경 에게해 장악 ~ BCE 12세기경, 그리스 본토)',
            '  · 거석 성벽·사자문, 선형 문자 B, 상무적 문화, 트로이 전쟁의 전설적 시기',
            'BCE 12세기경 도리스인의 침입으로 미케네 문명 파괴 → 폴리스 문명으로 이행'
          ]
        },
        {
          head: '三. 중·서유럽의 청동기',
          list: [
            '발칸·중부 유럽 — 우네티체(Únětice) 문화 등 청동기 야금술 발달',
            '거석 숭배 — 영국 스톤헨지',
            '청동기 후기 → 켈트족의 철기 문화로 이어짐'
          ]
        },
        {
          head: '四. 아메리카 — 메소아메리카 문명의 형성',
          list: [
            '아메리카에서는 청동기 단계 없이 신석기에서 곧장 도시 문명으로 이행',
            '올멕 문명(멕시코만, BCE 1500년 무렵 형성 추정)',
            '거대 두상 조각·암각화·제사 토기'
          ]
        }
      ]
    },
    overview: {
      summary:
        '유럽·아메리카의 청동기 시대 — 유럽에서는 BCE 3000년경 동지중해와 발칸·중부 유럽에서 청동기가 보급되었다. BCE 3000년경부터 크레타섬에서 크레타(미노스) 문명이 발전하였고, BCE 1400년경에는 그리스 본토에서 남하해 온 미케네인이 에게해를 장악하였다. 아메리카에서는 마야 문명(BCE 3000~2000년 무렵 형성 추정)과 올멕 문명(BCE 1500년 무렵 형성 추정) 등 독자적인 고대 문명이 성립하였다.',
      terms: [
        { label: '미노아 문명',  def: '크레타 섬의 청동기 해양 문명. 크노소스 궁전·선형 문자 A.' },
        { label: '미케네 문명',  def: '그리스 본토의 청동기 왕국. 거석 성벽·선형 문자 B.' },
        { label: '스톤헨지',     def: '영국의 거석 기념물. 거석 숭배 신앙을 보여 준다.' },
        { label: '올멕 문명',    def: '멕시코만 일대의 문명. BCE 1500년 무렵 형성 추정. 거대 두상 조각이 특징.' }
      ],
      timeline: [
        { yl: '약 1만 년 전 ~', label: '신석기 시대' },
        { y: -3000, label: '◆ 크레타섬 — 크레타(미노스) 문명 발전' },
        { y: -1500, label: '올멕 문명 형성 추정 (아메리카)' },
        { y: -1400, label: '미케네인이 에게해 장악' },
        { yl: '12세기 BCE경', label: '도리스인의 침입으로 미케네 문명 파괴' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '유럽 청동기 — 사실 정리',
        body: '· 시기: BCE 3000년경 ~ / · 지역: 동지중해(에게해)·발칸·중부 유럽 / · 대표 문명: 미노아·미케네 / · 거석 문화 후기 — 스톤헨지 완성기.',
        citation: '— W1, BS (선사~문명 단원 종합)' },
      { kind: '교과서 요약', title: '아메리카는 청동기 단계 없이 도시 문명으로',
        body: '아메리카 대륙에서는 청동기 단계를 거의 거치지 않고 신석기에서 곧장 도시 문명(올멕)으로 이행. 멕시코만 일대의 올멕 문명은 BCE 1500년 무렵 형성된 것으로 추정.',
        citation: '— W1 p.14' }
    ],
    map: {
      title: '유럽·아메리카 청동기 문화권',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 40 60 L 220 30 L 280 60 L 320 130 L 280 200 L 200 220 L 120 200 L 60 150 Z', label: '에게~지중해' }
      ],
      pins: [
        { x: 150, y: 130, label: '크노소스 (크레타)', sub: '미노아 문명', amber: true },
        { x: 135, y: 110, label: '미케네',             sub: '본토 왕국', amber: true },
        { x: 100, y: 90,  label: '스톤헨지 (영국)',    sub: '거석 후기' },
        { x: 60,  y: 180, label: '올멕 (멕시코만)',     sub: '아메리카' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '미노아 — 크노소스 궁전 복원도', ref: 'BS' },
      { slot: 'square', caption: '미케네 사자문 — 거석 성벽',     ref: 'W1' },
      { slot: 'square', caption: '스톤헨지 — 거석 기념물',        ref: 'BS p.11' }
    ],
    linked: ['w-neolithic', 'w-aegean', 'w-america', 'e-bronze', 's-bronze']
  },

  // ============================================================
  // 서아시아·인도 — 구석기 시대
  // ============================================================
  's-paleo': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.84,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사, p.10',
    overview: {
      summary:
        '서아시아·인도의 구석기 시대 — 뗀석기와 골각기를 사용하며 채집·수렵으로 생활하였고, 동굴·바위 그늘에 거주하였다. 이라크 자그로스산맥의 샤니다르 동굴에서 네안데르탈인 매장 흔적이 발견되었으며, 인도 빔베트카(Bhimbetka) 바위 그늘에는 후기 구석기~신석기 암벽화가 남아 있다.',
      terms: [
        { label: '샤니다르 동굴', def: '이라크 자그로스산맥의 동굴. 네안데르탈인 화석과 매장 흔적 발견.' },
        { label: '빔베트카',     def: '인도 중부의 바위 그늘 유적. 후기 구석기~신석기 암벽화가 남아 있다.' },
        { label: '네안데르탈인', def: '호모 네안데르탈렌시스. 사후 세계 관념과 시신 매장 풍습.' }
      ],
      timeline: [
        { yl: '약 180만 년 전', label: '◆ 아프리카 밖 초기 인류 — 조지아 드마니시' },
        { yl: '약 1만 년 전', label: '신석기 시대로 이행' },
        { y: -3500, label: '수메르인의 도시 국가 — 메소포타미아 문명' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '서아시아·인도 구석기 — 사실 정리',
        body: '· 도구: 뗀석기·골각기 / · 생활: 채집·수렵, 이동 / · 주거: 동굴·바위 그늘 / · 문화: 시신 매장(샤니다르), 암벽화(빔베트카).',
        citation: '— W1, BS (선사시대 단원 종합)' },
      { kind: '대표 유적', title: '샤니다르 동굴 (이라크)',
        body: '자그로스산맥의 동굴 유적. 네안데르탈인 화석과 매장 흔적 발견.',
        citation: '— 선사시대 보충' }
    ],
    map: {
      title: '서아시아·인도 구석기 대표 유적',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 40 60 L 200 40 L 280 80 L 320 150 L 270 200 L 180 215 L 100 200 L 60 140 Z', label: '서아시아~인도' }
      ],
      pins: [
        { x: 130, y: 110, label: '샤니다르 (이라크)', sub: '네안데르탈인 동굴', amber: true },
        { x: 240, y: 170, label: '빔베트카 (인도)',   sub: '암벽화' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '샤니다르 동굴 (이라크) — 네안데르탈인 매장', ref: '선사시대 보충' },
      { slot: 'square', caption: '빔베트카 암벽화 (인도) — 후기 구석기',         ref: '선사시대 보충' }
    ],
    linked: ['s-neolithic', 'k-paleo', 'e-paleo', 'w-paleo']
  },

  // ============================================================
  // 서아시아·인도 — 신석기 시대
  // ============================================================
  's-neolithic': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.91,
    fileRef: 'W1 · 미래엔 세계사 1, p.20 / BS · 비상교육 세계사, p.11',
    overview: {
      summary:
        '서아시아의 신석기 시대 — 비옥한 초승달 지대(Fertile Crescent)에서 인류 최초의 농경·목축이 시작되었다. 튀르키예 아나톨리아반도의 차탈회위크는 점토질 벽돌로 지은 가옥들이 모여 촌락을 이룬 대표 신석기 유적이다. 인근 괴베클리 테페는 거석 신전 유적으로, 신석기 초기 종교 활동을 보여 준다. 요르단강 서안의 예리코 또한 가장 이른 시기의 정착 촌락 중 하나이다. 사하라 인근 알제리 타실리나제르 암벽화는 신석기 시대 농경 모습을 그리고 있다. 이란 등지에서 토기가 출토된다.',
      terms: [
        { label: '비옥한 초승달 지대', def: '서아시아의 지중해~메소포타미아에 걸친 초승달 모양의 비옥한 지역. 인류 최초의 농경·목축이 시작됨.' },
        { label: '차탈회위크',         def: '튀르키예 아나톨리아반도 남부의 신석기 촌락 유적. 점토질 벽돌 가옥이 밀집.' },
        { label: '괴베클리 테페',       def: '튀르키예의 거석 신전 유적. 신석기 초기 종교 활동의 증거.' },
        { label: '예리코',             def: '요르단의 가장 이른 신석기 정착 촌락 중 하나.' },
        { label: '타실리나제르 암벽화', def: '알제리 사하라 인근의 신석기 암벽화. 농경·목축 모습을 그림.' }
      ],
      timeline: [
        { yl: '~ 약 1만 년 전', label: '구석기 시대' },
        { yl: '약 1만 년 전 ~', label: '◆ 서아시아 신석기 시대' },
        { y: -3500, label: '메소포타미아 문명 시작' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '서아시아·인도 신석기 — 사실 정리',
        body: '· 도구: 간석기·토기·뼈바늘 / · 경제: 농경·목축 (인류 최초) / · 주거: 점토질 벽돌 가옥, 정착 촌락 / · 문화: 종교 활동(괴베클리), 거석 신전.',
        citation: '— W1, BS (선사시대 단원 종합)' },
      { kind: '대표 유적', title: '차탈회위크 (튀르키예)',
        body: '아나톨리아반도 남부. 점토질 벽돌로 지은 가옥들이 도로 없이 서로 붙어 있어 외부 공격에 방어가 유리.',
        citation: '— BS p.11' },
      { kind: '대표 유적', title: '괴베클리 테페 (튀르키예)',
        body: '신석기 초기 거석 신전 유적. 농경 정착 이전부터 종교 활동이 있었음을 시사.',
        citation: '— 선사시대 보충' },
      { kind: '대표 자료', title: '타실리나제르 암벽화 (알제리)',
        body: '사하라 사막 주변에서 일어난 신석기 시대 농경·목축 모습이 암벽에 그려져 있다.',
        citation: '— BS p.11' },
      { kind: '대표 유물', title: '토기 (이란)',
        body: '서아시아 신석기 시대의 토기. 곡식 저장·조리에 사용.',
        citation: '— BS p.11' }
    ],
    map: {
      title: '서아시아·인도 신석기 대표 유적',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 40 60 L 200 40 L 280 80 L 320 150 L 270 200 L 180 215 L 100 200 L 60 140 Z', label: '서아시아~인도' }
      ],
      pins: [
        { x: 90,  y: 80,  label: '차탈회위크 (튀르키예)', sub: '점토질 벽돌 촌락', amber: true },
        { x: 100, y: 90,  label: '괴베클리 테페',          sub: '거석 신전', amber: true },
        { x: 110, y: 110, label: '예리코 (요르단강 서안)', sub: '초기 정착 촌락' },
        { x: 160, y: 130, label: '이란',                   sub: '토기' },
        { x: 60,  y: 180, label: '타실리나제르 (알제리)',  sub: '암벽화' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '차탈회위크 (튀르키예) — 점토 벽돌 촌락',     ref: 'BS p.11' },
      { slot: 'square', caption: '타실리나제르 암벽화 (알제리) — 농경 모습',    ref: 'BS p.11' },
      { slot: 'square', caption: '토기 (이란) — 신석기 토기',                    ref: 'BS p.11' },
      { slot: 'wide',   caption: '괴베클리 테페 (튀르키예) — 거석 신전', ref: '선사시대 보충' }
    ],
    linked: ['s-paleo', 's-bronze', 'k-neolithic', 'e-neolithic', 'w-neolithic', 's-sumer']
  },

  // ============================================================
  // 서아시아·인도 — 청동기 시대
  // ============================================================
  's-bronze': {
    syncRatio: 0.89,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사 (선사~문명 단원)',
    notes: {
      sections: [
        {
          head: '一. 서아시아 청동기의 시작 — 인류 최초',
          list: [
            'BCE 3500년경 메소포타미아 — 수메르인의 도시 국가, 청동기를 사용한 최초의 문명',
            '티그리스·유프라테스강 유역에서 도시 국가(우르·우루크·라가시 등) 발전',
            '청동제 무기·제기·장신구·일상 용구 제작',
            '관개 농업 발달 — 잉여 생산물 축적, 신전 중심의 도시 사회 형성'
          ]
        },
        {
          head: '二. 메소포타미아 청동기 문명의 특징',
          list: [
            '쐐기 문자 — 점토판에 갈대 펜으로 새긴 인류 최초의 문자',
            '지구라트 — 신전 탑(에 메소포타미아 도시 국가의 상징)',
            '60진법 · 태음력 · 1년 12개월 · 1주 7일 등 천문학·수학 발달',
            '함무라비 법전 — 「눈에는 눈, 이에는 이」 동해보복법',
            '바빌로니아·아시리아·신바빌로니아 등 청동기~철기 전환기의 제국으로 이어짐'
          ]
        },
        {
          head: '三. 인더스 청동기 문명',
          list: [
            'BCE 2500년경 인더스강 유역에서 발생',
            '대표 도시 — 모헨조다로·하라파',
            '계획 도시(격자형 도로·상하수도·공중 목욕탕·곡물 창고)',
            '미해독 인장 문자 · 메소포타미아와의 해상 무역',
            'BCE 1800년경부터 쇠퇴 → BCE 1500년경 아리아인이 인더스강 유역으로 이동'
          ]
        },
        {
          head: '四. 청동기 → 철기로의 전환',
          list: [
            'BCE 1500년경 히타이트(아나톨리아) — 바빌론까지 세력 확대, 철기 문화 전파',
            '히타이트의 정복 활동으로 철기 문화가 서아시아 전역에 전파',
            '청동기 → 철기 전환은 군사·농업 생산력의 비약적 발전을 가져옴'
          ]
        }
      ]
    },
    overview: {
      summary:
        '서아시아·인도의 청동기 시대 — BCE 3500년경 메소포타미아 지역에서 수메르인이 우르 등 도시 국가를 세우고 청동기를 사용하는 최초의 문명을 일으켰다. 티그리스·유프라테스강 유역의 도시 국가(우르·우루크 등)들이 발전하면서 쐐기 문자, 지구라트, 60진법, 함무라비 법전 등 인류 최초의 도시 문명을 형성하였다. 인도에서는 BCE 2500년경 인더스강 유역의 모헨조다로·하라파를 중심으로 청동기 계획 도시 문명이 발달하였다. BCE 1500년경 아나톨리아의 히타이트가 바빌론까지 세력을 넓히고 철기 문화를 서아시아에 전파하였다.',
      terms: [
        { label: '수메르',       def: '메소포타미아 남부의 도시 국가군. 인류 최초의 청동기·문자·도시 문명.' },
        { label: '쐐기 문자',     def: '점토판에 갈대 펜으로 새긴 인류 최초의 문자.' },
        { label: '지구라트',     def: '메소포타미아 도시 국가의 신전 탑.' },
        { label: '함무라비 법전', def: '바빌로니아 함무라비 왕의 성문법. 동해보복법(눈에는 눈).' },
        { label: '인더스 문명',   def: 'BCE 2500년경 인더스강 유역의 청동기 계획 도시 문명. 모헨조다로·하라파.' },
        { label: '히타이트',     def: '아나톨리아의 인도-유럽계 제국. 철제 무기 본격 사용.' }
      ],
      timeline: [
        { yl: '약 1만 년 전 ~', label: '신석기 시대' },
        { y: -3500, label: '◆ 메소포타미아 — 수메르인의 도시 국가, 최초의 문명' },
        { y: -2500, label: '인더스 문명 — 모헨조다로·하라파' },
        { y: -1500, label: '히타이트 — 바빌론까지 세력 확대, 철기 문화 전파' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '서아시아 청동기 — 사실 정리',
        body: '· 시기: BCE 3500년경 ~ / · 지역: 메소포타미아(수메르) / · 도구: 청동제 무기·제기 / · 문화: 쐐기 문자·지구라트·60진법 / · 사회: 도시 국가, 관개 농업, 신전 중심.',
        citation: '— W1 미래엔 세계사 1, BS 비상교육 세계사' },
      { kind: '교과서 요약', title: '인더스 청동기 문명',
        body: 'BCE 2500년경 인더스강 유역의 모헨조다로·하라파 — 계획 도시(격자형 도로·상하수도·공중 목욕탕·곡물 창고). 미해독 인장 문자. 메소포타미아와의 해상 무역.',
        citation: '— W1 p.20, BS p.16' }
    ],
    map: {
      title: '서아시아·인도 청동기 문화권',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 40 60 L 220 30 L 280 60 L 320 130 L 280 200 L 200 220 L 120 200 L 60 150 Z', label: '서아시아~인도' }
      ],
      pins: [
        { x: 110, y: 100, label: '우르 (수메르)',     sub: '청동기·쐐기문자', amber: true },
        { x: 130, y: 90,  label: '바빌론',             sub: '함무라비 법전' },
        { x: 100, y: 80,  label: '하투샤 (히타이트)',   sub: '철기 사용 시작' },
        { x: 220, y: 150, label: '모헨조다로',         sub: '인더스 문명', amber: true },
        { x: 210, y: 130, label: '하라파',             sub: '인더스 문명' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '수메르 우르의 황소 머리 하프', ref: 'BS' },
      { slot: 'square', caption: '함무라비 법전 비석',           ref: 'W1' },
      { slot: 'square', caption: '인더스 인장 (모헨조다로)',     ref: 'W1 p.20' }
    ],
    linked: ['s-neolithic', 's-mesopotamia', 's-indus', 's-hittite', 'e-bronze', 'w-bronze']
  },

  // ============================================================
  // 메소포타미아 문명 (BCE 3500년경 ~) — 인류 최초의 문명
  //   출처: W1 미래엔 세계사 1, BS 비상교육 세계사
  // ============================================================
  's-mesopotamia': {
    syncRatio: 0.92,
    fileRef: 'W1 · 미래엔 세계사 1, pp.14~16 / BS · 비상교육 세계사, pp.12~14',
    notes: {
      sections: [
        {
          head: '1. 성립',
          list: [
            '위치: 티그리스강과 유프라테스강 사이의 「비옥한 초승달 지대」, 개방적 지형',
            '수메르인: 우르·우루크 등 도시 국가 건국 → 도시 간 세력 경쟁 (BCE 3500년경부터)',
            '아카드의 사르곤 1세: 메소포타미아 최초 통일 (BCE 2334) — 셈족 계열',
            '(고)바빌로니아 왕국 (BCE 1894~1500년경)',
            '  · 아무르인이 건국, 메소포타미아 전역 통일',
            '  · 함무라비왕 (BCE 1792~1750): 대외 확장, 지방관 파견, 도로·운하 건설, 『함무라비 법전』 편찬 (282개 조, "눈에는 눈" 동해 보복법, 신분에 따른 차등 처벌)',
            '  · 히타이트인에게 공격을 받고 멸망 (BCE 1500년경)'
          ]
        },
        {
          head: '2. 특징 — 개방적 지형, 불규칙적 범람',
          body: '개방적 지형으로 외부 침입이 잦아 여러 민족이 흥망성쇠를 거듭. 강의 불규칙적 범람으로 치수·관개가 정치권력의 핵심 과제가 되었다.'
        },
        {
          head: '   ▸ 정치',
          list: [
            '왕이 치수·관개 총괄',
            '왕 = 신의 대리자 → 신권 정치'
          ]
        },
        {
          head: '   ▸ 종교',
          list: [
            '현세 중시 (잦은 외침·자연재해로 인한 불안정한 환경에서 비롯)',
            '다신교 — 각 도시 국가마다 수호신을 모심',
            '지구라트(ziggurat) — 도시 중심의 계단식 신전 탑, 신과 인간을 이어주는 공간',
            '『길가메시 서사시』 — 영생을 찾아 떠나는 우르크 왕 길가메시의 이야기, 인류 최초의 서사시'
          ]
        },
        {
          head: '   ▸ 문화',
          list: [
            '쐐기 문자(설형 문자): 점토판에 갈대로 새김. 제사 의식·상거래·왕실 행정 기록',
            '태음력: 달의 차고 기우는 주기를 관측한 역법, 농경 일정 관리',
            '60진법: 농업·천문 관측에 활용 → 오늘날의 시간(60초·60분)·각도(360°) 단위의 기원',
            '점성술 사용: 별자리 관측으로 길흉 점복'
          ]
        }
      ]
    },
    overview: {
      summary:
        '메소포타미아 문명 — 기원전 3500년경 티그리스강과 유프라테스강 사이의 비옥한 초승달 지대에서 발생한 인류 최초의 문명. 개방적 지형으로 외부 침입이 잦아 여러 민족이 흥망성쇠를 거듭했다. 수메르인의 도시 국가(우르·우루크·라가시) 발달 → 아카드의 사르곤 1세 통일 → 바빌로니아의 함무라비 왕 통일·법전 반포. 쐐기 문자, 60진법, 태음력, 지구라트(신전 탑) 등을 발달시켰고, 현세 중심의 종교관을 지녔다.',
      terms: [
        { label: '비옥한 초승달 지대', def: '서아시아 메소포타미아~지중해 동안에 걸친 초승달 모양의 비옥한 농경 지대.' },
        { label: '수메르인',           def: '메소포타미아 남부에 우르·우루크 등 도시 국가를 세운 민족. 쐐기 문자·60진법 창안.' },
        { label: '쐐기 문자',          def: '점토판에 갈대로 새긴 메소포타미아의 문자. 인류 최초의 문자 체계 중 하나.' },
        { label: '지구라트',           def: '메소포타미아의 신전 탑. 도시 국가의 신앙 중심지.' },
        { label: '함무라비 법전',      def: '바빌로니아 함무라비 왕이 282개 조로 정비한 법전. 동해 보복법(눈에는 눈)으로 유명.' },
        { label: '60진법',             def: '수메르인이 사용한 60진법. 오늘날의 시간(60초·60분)·각도(360°) 단위의 기원.' }
      ],
      timeline: [
        { y: -3500, label: '◆ 메소포타미아 문명 발생 (대표 표기 위치)' },
        { y: -3200, label: '수메르 도시 국가 발달' },
        { y: -2334, label: '아카드 사르곤 1세 통일' },
        { y: -1894, label: '바빌로니아 왕국 성립' },
        { y: -1750, yl: '18세기 BCE', label: '함무라비 법전 편찬' },
        { y: -1500, yl: '1500 BCE경', label: '히타이트의 바빌로니아 정복' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '「길가메시 서사시」',
        src: 'assets/w1/고대/서아시아·인도/메소포타미아 문명/[교과서이미지] p23 길가메시.jpg',
        citation: '— 교과서 탐구 자료' },
      { kind: '탐구 자료', title: '「함무라비 법전」',
        src: 'assets/w1/고대/서아시아·인도/메소포타미아 문명/[교과서이미지] p21 함무라비 법전.jpg',
        citation: '— 교과서 탐구 자료' }
    ],
    map: {
      title: '메소포타미아 문명 (비옥한 초승달 지대)',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 40 80 L 160 50 L 240 80 L 280 130 L 250 170 L 180 180 L 110 160 L 50 130 Z', label: '비옥한 초승달 지대' }
      ],
      pins: [
        { x: 130, y: 110, label: '우르',           sub: '수메르 도시 국가', amber: true },
        { x: 145, y: 105, label: '우루크',         sub: '수메르 도시' },
        { x: 165, y: 100, label: '라가시',         sub: '수메르 도시' },
        { x: 175, y: 95,  label: '바빌론',         sub: '바빌로니아 수도', amber: true },
        { x: 195, y: 110, label: '니네베',         sub: '아시리아 수도' },
        { x: 200, y: 130, label: '티그리스강',     sub: '동쪽 강' },
        { x: 150, y: 130, label: '유프라테스강',   sub: '서쪽 강' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/메소포타미아 문명/[비상교육] 고등_세계사_1-1_13p_메소포타미아 문명 발상지.jpg',
        caption: '메소포타미아 문명 발상지',
        ref: '비옥한 초승달 지대 · 수메르인 초기 정착지 · 바빌로니아 왕국 영역' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/메소포타미아 문명/[비상교육] 고등_세계사_1-1_13p_우르의 지구라트.jpg',
        caption: '우르의 지구라트',
        ref: '메소포타미아 문명 신전 탑' }
    ],
    linked: ['s-neolithic', 's-sumer', 's-hammurabi', 'w-egypt-civ', 's-indus']
  },

  // ============================================================
  // 이집트 문명 (BCE 3000년경 ~) — 나일강의 선물
  // ============================================================
  'w-egypt-civ': {
    syncRatio: 0.93,
    fileRef: 'W1 · 미래엔 세계사 1, pp.17~19 / BS · 비상교육 세계사, pp.14~16',
    notes: {
      sections: [
        {
          head: '1. 성립',
          list: [
            '나일강 유역, 통일 왕국으로 발전 — 메네스(나르메르)왕의 상·하 이집트 통일 (BCE 3100)',
            '고왕국 (BCE 2686~2181) → 중왕국 (BCE 2055~1650) → 신왕국 (BCE 1550~1069)',
            '  · 고왕국: 수도 멤피스, 쿠푸·카프레·멘카우레의 기자 대피라미드 건설',
            '  · 중왕국: 수도 테베, 사회 재정비 — 힉소스인의 침입(BCE 1650)으로 종결',
            '  · 신왕국: 수도 테베, 영토 최대 확장(투트모세 3세), 람세스 2세의 카데시 전투(BCE 1274)'
          ]
        },
        {
          head: '2. 특징 — 폐쇄적 지역, 정기적 범람',
          body: '사막과 바다로 둘러싸인 폐쇄적 지형 → 외부 침입이 적어 오랜 기간 통일 왕조 지속. 나일강의 정기적 범람으로 비옥한 토양이 매년 공급 (= "이집트는 나일강의 선물" — 헤로도토스).'
        },
        {
          head: '   ▸ 정치',
          list: [
            '파라오: 태양신 「라」의 아들 → 신권 정치',
            '신관·관료: 지배층, 대규모 토지 소유',
            '농민: 피지배층, 공납·부역 의무, 토목 공사 동원',
            '노예: 피지배층, 각종 대규모 토목 공사 동원'
          ]
        },
        {
          head: '   ▸ 종교 — 내세 중시',
          list: [
            '영혼불멸 사상 — 죽은 후에도 영혼이 다시 돌아온다는 믿음',
            '미라 — 시신을 영구 보존하여 영혼이 돌아올 육신을 마련',
            '피라미드 — 파라오의 무덤, 기자의 쿠푸·카프레·멘카우레가 대표',
            '『사자의 서』 — 죽은 자가 사후 세계에서 신의 심판을 받는 과정을 그린 두루마리'
          ]
        },
        {
          head: '   ▸ 문화',
          list: [
            '태양력·천문학 발달 → 나일강 범람 시기 예측 (1년 365일)',
            '기하학·측량술 발달 → 나일강 범람 후 경작지 구획, 피라미드 건축',
            '의학 발달 — 미라 제작 과정에서 해부학적 지식 축적',
            '상형문자 고안 → 신성 문자(히에로글리프) · 신관 문자(히에라틱) · 민용 문자(데모틱)로 분화',
            '파피루스에 기록 — 나일강변에서 자라는 갈대 줄기로 제작한 종이의 원조'
          ]
        }
      ]
    },
    overview: {
      summary:
        '이집트 문명 — 기원전 3000년경 나일강 유역에서 발생. 사막과 바다로 둘러싸인 폐쇄적 지형 덕에 외부 침입이 적어 오랜 기간 통일 왕조가 지속되었다. 메네스(나르메르)가 상·하 이집트를 통일하고 파라오 신정 정치를 시작. 태양력(365일), 상형 문자(신성·신관·민용), 10진법, 측량술이 발달. 사후 세계를 믿어 피라미드·미라·『사자의 서』를 남겼다. 나일강의 정기적 범람을 이용한 농경이 문명의 토대였다.',
      terms: [
        { label: '나일강의 선물',     def: '헤로도토스가 이집트를 일컬은 표현. 나일강의 정기적 범람이 가져온 비옥한 토양 위에 문명이 발달.' },
        { label: '파라오',           def: '이집트의 왕. 태양신 라(Ra)·호루스의 화신으로 여겨진 신정 정치 군주.' },
        { label: '상형 문자',         def: '사물의 모양을 본뜬 이집트의 문자. 신성 문자(히에로글리프)·신관 문자·민용 문자(데모틱)로 분화.' },
        { label: '태양력',            def: '나일강 범람 주기를 관측해 만든 1년 365일의 역법. 이집트 천문학의 성과.' },
        { label: '피라미드',          def: '파라오의 무덤. 기자의 쿠푸·카프레·멘카우레 피라미드가 대표. 사후 세계 신앙의 표현.' },
        { label: '『사자의 서』',      def: '죽은 사람이 사후 세계에서 신의 심판을 받는 과정을 그린 두루마리. 사후 세계 신앙의 기록.' },
        { label: '미라',              def: '시신을 영구 보존하기 위한 처리. 영혼이 돌아올 육신을 보존한다는 사후 신앙에서 비롯.' }
      ],
      timeline: [
        { y: -3100, label: '메네스의 이집트 통일 (제1왕조)' },
        { y: -3000, label: '◆ 이집트 문명 형성 (대표 표기 위치)' },
        { y: -2700, label: '고왕국 시대 — 피라미드 건설' },
        { y: -2560, label: '쿠푸 왕의 대피라미드' },
        { y: -2055, label: '중왕국 시대' },
        { y: -1550, label: '신왕국 시대 — 람세스 2세 등' }
      ]
    },
    sources: [
      {
        kind: '사료',
        title: '「사자의 서」',
        src: 'assets/w1/고대/서아시아·인도/이집트 문명/사자의 서·이집트 내세관 (원본).png',
        citation: '— 「사자의 서」 / 교과서 발췌'
      },
      {
        kind: '사료',
        title: '로제타석',
        src: 'assets/w1/고대/서아시아·인도/이집트 문명/로제타석·상형 문자 (원본).png',
        citation: '— 로제타석 (영국 박물관 소장)'
      }
    ],
    map: {
      title: '이집트 문명 — 나일강 유역',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 170 30 L 200 30 L 215 90 L 220 150 L 240 200 L 180 220 L 160 200 L 150 150 L 155 90 Z', label: '나일강 유역' }
      ],
      pins: [
        { x: 195, y: 60,  label: '알렉산드리아',  sub: '나일 삼각주' },
        { x: 200, y: 80,  label: '하 이집트',     sub: '북부' },
        { x: 185, y: 130, label: '기자·멤피스',   sub: '대피라미드', amber: true },
        { x: 200, y: 165, label: '룩소르(테베)',  sub: '신왕국 수도', amber: true },
        { x: 215, y: 200, label: '상 이집트',     sub: '남부' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', src: 'assets/w1/고대/서아시아·인도/이집트 문명/[비상교육] 고등_세계사_1-1_14p_이집트 문명.jpg',
        caption: '이집트 문명의 영역과 정치 중심지',
        ref: '고왕국 · 중왕국 · 신왕국 · 멤피스 · 에케트아텐(텔 엘 아마르나) · 테베 · 피라미드 소재지' },
      { slot: 'square', src: 'assets/w1/고대/서아시아·인도/이집트 문명/pyramid-sphinx.png',
        caption: '기자의 대피라미드와 스핑크스',
        ref: '파라오 신권과 사후 세계 신앙의 상징' }
    ],
    linked: ['w-egypt', 'w-paleo', 'w-neolithic', 's-mesopotamia', 's-indus']
  },

  // ============================================================
  // 인도 문명 (BCE 2500년경 ~) — 인더스 계획 도시
  // ============================================================
  's-indus': {
    syncRatio: 0.90,
    fileRef: 'W1 · 미래엔 세계사 1, pp.20~22 / BS · 비상교육 세계사, pp.16~18',
    notes: {
      sections: [
        {
          head: '1. 성립',
          list: [
            '인더스강 상류 펀자브 지방에서 발생 (BCE 2500년경)',
            '드라비다인이 건설한 문명 — 후일 아리아인의 진입으로 남부로 밀려남',
            '모헨조다로(현 파키스탄 신드주)·하라파(현 펀자브주) 등의 계획 도시 건축'
          ]
        },
        {
          head: '2. 특징',
          list: [
            '청동기 문명',
            '정기적으로 범람하는 인더스강을 이용한 농업 — 보리·밀·목화 재배',
            '모헨조다로·하라파 — 벽돌로 지은 계획 도시',
            '  · 포장도로 · 공중목욕탕(약 12×7m) · 곡물 창고 · 광장 · 성채(시타델) · 정교한 배수 시설',
            '농경 · 목축 · 해상 무역 — 메소포타미아 지역과 활발히 교류 (인장이 메소포타미아에서도 출토)',
            '상형문자(인장 문자) 사용 — 약 400여 개 기호, 아직 미해독'
          ]
        },
        {
          head: '3. 아리아인의 이동 (BCE 1500년경)',
          list: [
            '경로: 중앙아시아 → 카이바르 고개를 넘어 인더스(펀자브) → 갠지스강 유역(BCE 1000년경)',
            '펀자브 지방을 정복한 뒤 동쪽으로 이동하며 원주민(드라비다인) 정복',
            '갠지스강 유역에서 철제 농기구로 토지를 개간하고 국가 형성',
            '인도-유럽계 언어(산스크리트) 전파'
          ]
        },
        {
          head: '   ▸ 카스트(바르나) 제도',
          list: [
            '원주민 지배를 위한 아리아인의 폐쇄적 신분제',
            '타고난 혈통으로 신분 결정 — 신분에 따라 사회적 지위·직업 결정 → 세습',
            '4계급: 브라만(사제) · 크샤트리아(전사·왕족) · 바이샤(평민·상공인) · 수드라(노예·피정복민)',
            '농경 문화 발달 → 갠지스강 유역에서 관개 농업 실시'
          ]
        },
        {
          head: '   ▸ 브라만교',
          list: [
            '농경 문화 영향 → 자연 현상을 신성화 (인드라·아그니·바루나 등 다신 숭배)',
            '경전 『베다』 — 산스크리트로 기록된 인류 최초기의 종교 문헌',
            '브라만(사제) 계급이 제사를 독점하며 권위 확립',
            '후일 힌두교의 사상적 기반이 됨 (브라흐마·비슈누·시바 삼주신 체계로 발전)'
          ]
        }
      ]
    },
    overview: {
      summary:
        '인도 문명 — 기원전 2500년경 인더스강 유역에서 발생한 도시 문명. 모헨조다로(현 파키스탄 신드주)와 하라파(현 펀자브주)가 대표 유적. 정연한 격자형 도로, 벽돌 가옥, 상하수도와 공중 목욕탕 등 발달한 계획 도시 구조가 특징이다. 인장 문자가 출토되지만 아직 해독되지 않았다. 메소포타미아와 해상·육로로 활발히 교역하였다. 기원전 1800년경부터 자연재해와 수로의 변경 등으로 쇠퇴하였고, 기원전 1500년경 아리아인이 들어오면서 베다 문명과 카스트(바르나) 제도가 형성된다.',
      terms: [
        { label: '인더스강',          def: '인도 북서부(현 파키스탄)를 흐르는 강. 인도 문명의 발생지.' },
        { label: '모헨조다로',         def: '인더스 문명의 대표 계획 도시. 격자형 도로·벽돌 가옥·공중 목욕탕·곡물 창고가 잘 보존되어 있다.' },
        { label: '하라파',             def: '인더스강 상류의 또 다른 대표 도시. 모헨조다로와 함께 인더스 문명의 핵심 유적.' },
        { label: '인장 문자',          def: '인더스 문명의 도장에 새겨진 미해독 그림 문자. 약 400여 개의 기호.' },
        { label: '아리아인',           def: '중앙아시아에서 인더스강 유역으로 이주한 인도-유럽계 민족. 베다 문화와 카스트 제도의 기원.' },
        { label: '카스트(바르나) 제도', def: '브라만(사제)·크샤트리아(전사)·바이샤(평민)·수드라(노예)의 4계급 신분제. 베다 시대 형성.' }
      ],
      timeline: [
        { y: -2500, label: '◆ 인도 문명 발생 (대표 표기 위치)' },
        { y: -2300, label: '모헨조다로·하라파 도시 번성' },
        { y: -1800, yl: '1800 BCE경', label: '인더스 문명 쇠퇴 시작 — 자연재해·수로 변경' },
        { y: -1500, yl: '1500 BCE경', label: '아리아인 인도 진입 — 펀자브 지방 정복' },
        { y: -1000, yl: '1000 BCE경', label: '갠지스강 유역 진출 · 철제 농기구로 개간 → 카스트(바르나)제 형성' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '모헨조다로의 도시 구조',
        src: 'assets/w1/고대/서아시아·인도/인도 문명/A8339060-BB01-4535-9A9E-5DE20A508FD3_4_5005_c.jpeg',
        citation: '— 교과서 탐구 자료' }
    ],
    map: {
      title: '인도 문명 — 인더스강 유역',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 60 60 L 200 40 L 280 70 L 320 140 L 270 200 L 180 210 L 100 190 L 50 130 Z', label: '인도 아대륙' }
      ],
      pins: [
        { x: 110, y: 90,  label: '하라파',           sub: '인더스 상류', amber: true },
        { x: 120, y: 130, label: '모헨조다로',       sub: '계획 도시', amber: true },
        { x: 140, y: 110, label: '인더스강',          sub: '문명 발생지' },
        { x: 210, y: 130, label: '갠지스강',          sub: '베다 문화 확산' },
        { x: 70,  y: 70,  label: '카이바르 고개',     sub: '아리아인 유입' }
      ],
      arrows: []
    },
    artifacts: [
      { slot: 'square', src: 'assets/w1/고대/서아시아·인도/인도 문명/미래엔_세계사_이미지_18쪽_인도_문명.JPG',
        caption: '인도 문명의 영역',
        ref: '인더스강 유역의 모헨조다로·하라파 등 계획 도시 · 아리아인의 이동 경로' },
      { slot: 'square', src: 'assets/w1/고대/서아시아·인도/인도 문명/[비상교육] 고등_세계사_1-1_16p_카스트제의 신분 구조.jpg',
        caption: '카스트제의 신분 구조',
        ref: '브라만 · 크샤트리아 · 바이샤 · 수드라의 4계급' },
      { slot: 'square', src: 'assets/w1/고대/서아시아·인도/인도 문명/[비상교육] 고등_세계사_1-1_16p_모헨조다로 유적에서 발견된 인물상.jpg',
        caption: '모헨조다로 유적에서 발견된 인물상',
        ref: '인더스 문명 — 「제사장 왕(Priest-King)」 석상' },
      { slot: 'square', src: 'assets/w1/고대/서아시아·인도/인도 문명/[비상교육] 고등_세계사_1-1_16p_모헨조다로 유적에서 발견된 인장.jpg',
        caption: '모헨조다로 유적에서 발견된 인장',
        ref: '미해독 인장 문자 · 동물 도상 (혹소·코끼리 등)' }
    ],
    linked: ['s-neolithic', 's-aryan', 's-mesopotamia', 'w-egypt-civ']
  },

  // ============================================================
  // 히타이트 (BCE 1600~1200) — 철기 문화의 전파자
  // ============================================================
  's-hittite': {
    syncRatio: 0.86,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    notes: {
      sections: [
        {
          head: '1. 성립 및 특징',
          list: [
            'BCE 2000년경 아나톨리아 반도(현 튀르키예)에서 세력 확대 — 인도-유럽계 민족, 수도 하투샤',
            '철제 무기와 전차 → 정복 활동의 압도적 우위',
            '(고)바빌로니아 공격 (BCE 1500년경) → 멸망시킴',
            '정복 과정에서 철기 문화를 서아시아 지역으로 전파',
            '이집트 람세스 2세와의 카데시 전투(BCE 1274) 후 인류 최초의 평화 조약(BCE 1259) 체결',
            'BCE 1200년경 「해양 민족」의 침입으로 쇠퇴'
          ]
        }
      ]
    },
    overview: {
      summary: '히타이트 — 아나톨리아 반도(현 튀르키예)에서 일어난 인도-유럽계 제국. 철제 무기와 전차를 바탕으로 강력한 군사력을 갖춰 바빌로니아 왕국을 정복(BCE 1500년경)했고, 이집트의 람세스 2세와 카데시 전투(BCE 1274) 후 인류 최초의 평화 조약(BCE 1259)을 체결. 철기 문화를 서아시아 일대에 확산시켰다.',
      terms: [
        { label: '하투샤',     def: '히타이트의 수도. 아나톨리아 중부.' },
        { label: '카데시 전투', def: 'BCE 1274 시리아에서 이집트(람세스 2세)와 벌인 대전.' },
        { label: '평화 조약',   def: 'BCE 1259 히타이트-이집트 간 인류 최초로 알려진 국가 간 평화 조약.' },
        { label: '철제 무기',   def: '히타이트가 처음 본격 사용. 청동보다 단단해 정복 활동에 큰 우위.' }
      ],
      timeline: [
        { y: -1650, yl: '17세기 BCE경', label: '◆ 히타이트 고왕국 성립 — 하투실리 1세 (대표 표기)' },
        { y: -1500, yl: '1500 BCE경', label: '바빌로니아 정복 — 바빌론까지 세력 확대' },
        { y: -1274, label: '카데시 전투 (vs 이집트 람세스 2세)' },
        { y: -1259, label: '인류 최초의 평화 조약' },
        { y: -1200, label: '쇠퇴 — 해양 민족의 침입' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '히타이트의 정복 활동', ph: true,
        citation: '— 교과서 탐구 자료 미배치' },
      { kind: '탐구 자료', title: '이집트와의 카데시 전투·평화 조약', ph: true,
        citation: '— 교과서 탐구 자료 미배치' }
    ],
    map: { title: '히타이트 — 아나톨리아 반도', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 60 70 L 220 50 L 280 90 L 270 160 L 180 180 L 80 150 Z', label: '아나톨리아~시리아' }],
      pins: [
        { x: 130, y: 100, label: '하투샤',  sub: '히타이트 수도', amber: true },
        { x: 200, y: 140, label: '카데시',  sub: 'BCE 1274 전투', amber: true },
        { x: 230, y: 100, label: '아시리아', sub: '동방 경쟁국' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/히타이트, 페니키아, 헤브라이/[비상교육] 고등_세계사_1-1_18p_에게 문명과 지중해 동부 연안 국가.jpg',
        caption: '에게 문명과 지중해 동부 연안 국가',
        ref: '비상교육 세계사 1-1 p.18 — 히타이트(아나톨리아)·페니키아·헤브라이 등 지중해 동부 연안 세력 분포도' }
    ],
    linked: ['s-mesopotamia', 's-phoenicia', 's-hebrew', 'w-egypt-civ']
  },

  // ============================================================
  // 헤브라이 (BCE 11세기경~) — 유일신 신앙의 기원
  // ============================================================
  's-hebrew': {
    syncRatio: 0.87,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    notes: {
      sections: [
        {
          head: '1. 성립',
          list: [
            '셈족 일파인 헤브라이인이 팔레스타인 지역(가나안) 정착',
            '모세의 출애굽(BCE 13세기경)으로 이집트에서 벗어남',
            '가나안 정착 후 12지파 연합 → 이스라엘 왕국으로 발전'
          ]
        },
        {
          head: '2. 이스라엘 왕국',
          list: [
            'BCE 11세기경 이스라엘 왕국 건설 → 다윗왕이 12지파를 통합',
            '수도 예루살렘, 솔로몬왕(BCE 970~931) 때 전성기 — 예루살렘 성전 건축',
            '솔로몬왕 사후 이스라엘(북, BCE 930~722)·유대(남, BCE 930~586)로 분열',
            '북 이스라엘은 아시리아에 멸망(BCE 722)',
            '신바빌로니아에 의해 유대 멸망(BCE 586) → 바빌론 유수(BCE 586~538)'
          ]
        },
        {
          head: '3. 유대교',
          list: [
            '유일신 여호와(야훼) 신앙',
            '구약 성경 — 토라(모세 5경)·예언서·시편 등',
            '선민(選民) 사상과 메시아(구원자) 사상',
            '율법 중심의 종교 생활',
            '후일 크리스트교·이슬람교 성립에 사상적 영향'
          ]
        }
      ]
    },
    overview: {
      summary: '헤브라이 — 팔레스타인 지역에 정착한 셈족 일파. BCE 11세기경 이스라엘 왕국을 세우고 다윗·솔로몬 왕 때 전성. 예루살렘에 야훼의 성전을 건설하고 유일신 신앙(유대교)을 정립. 솔로몬 사후 북쪽 이스라엘과 남쪽 유대로 분열. 바빌론 유수(BCE 586)를 거치며 신앙이 더욱 단단해졌다. 후일 크리스트교·이슬람교 성립에 영향.',
      terms: [
        { label: '야훼',      def: '헤브라이의 유일신.' },
        { label: '다윗·솔로몬', def: '통일 왕국의 두 군주. 솔로몬은 예루살렘 성전을 건축.' },
        { label: '예루살렘',   def: '헤브라이의 수도이자 종교 중심지.' },
        { label: '바빌론 유수', def: 'BCE 586 신바빌로니아가 유대를 정복하고 주민을 바빌론으로 끌고 간 사건.' },
        { label: '유대교',     def: '유일신 야훼를 섬기는 종교. 토라(모세 5경)와 탈무드.' }
      ],
      timeline: [
        { y: -1200, label: '가나안 정착' },
        { y: -1050, yl: '11세기 BCE경', label: '◆ 이스라엘 왕국 건설 (대표 표기)' },
        { y: -1000, yl: '10세기 BCE', label: '다윗왕의 12지파 통합 — 수도 예루살렘' },
        { y: -960,  label: '솔로몬 왕의 예루살렘 성전 건축' },
        { y: -930,  label: '이스라엘·유대 분열' },
        { y: -586,  label: '바빌론 유수' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '헤브라이의 통일 왕국과 유일신 신앙', ph: true,
        citation: '— 교과서 탐구 자료 미배치' },
      { kind: '탐구 자료', title: '분열과 바빌론 유수', ph: true,
        citation: '— 교과서 탐구 자료 미배치' }
    ],
    map: { title: '헤브라이 — 팔레스타인', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 130 60 L 200 60 L 220 130 L 180 200 L 130 200 L 110 130 Z', label: '팔레스타인' }],
      pins: [
        { x: 160, y: 100, label: '예루살렘', sub: '성전·수도', amber: true },
        { x: 145, y: 80,  label: '이스라엘', sub: '북쪽 왕국' },
        { x: 170, y: 130, label: '유대',     sub: '남쪽 왕국' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/히타이트, 페니키아, 헤브라이/[비상교육] 고등_세계사_1-1_18p_에게 문명과 지중해 동부 연안 국가.jpg',
        caption: '에게 문명과 지중해 동부 연안 국가',
        ref: '비상교육 세계사 1-1 p.18 — 헤브라이(팔레스타인)·페니키아·히타이트 등 지중해 동부 연안 세력 분포도' }
    ],
    linked: ['s-hittite', 's-phoenicia', 's-mesopotamia', 's-persia']
  },

  // ============================================================
  // 페니키아 (BCE 12세기경~) — 해상 무역과 알파벳
  // ============================================================
  's-phoenicia': {
    syncRatio: 0.85,
    fileRef: 'W1 · 미래엔 세계사 1, p.16 / BS · 비상교육 세계사',
    notes: {
      sections: [
        {
          head: '1. 성립 및 특징',
          list: [
            '지중해 동안(현 레바논 일대)에 시돈·티레·비블로스 등 도시 국가 분립 (BCE 12세기경~)',
            '해상 무역 — 흑해 및 지중해 전역',
            '  → 카르타고(BCE 814, 북아프리카) 등 식민 도시 건설',
            '자줏빛 염료(페니키아명의 어원)와 삼나무 수출',
            '표음 문자(페니키아 문자) — 무역 편의를 위해 고안한 22자모',
            '  → 그리스로 전해져 알파벳의 기원이 됨',
            '해상 활동을 통해 서아시아 문명을 유럽에 전파'
          ]
        }
      ]
    },
    overview: {
      summary: '페니키아 — 지중해 동안의 해상 무역 민족. 시돈·티레·비블로스 등 도시 국가가 활약. 카르타고(BCE 814) 등 지중해 곳곳에 식민 도시를 건설. 사물의 모양을 본뜬 그림 문자에서 발전한 표음 문자(페니키아 문자, 알파벳의 기원)를 사용. 해상 활동을 통해 서아시아 문명을 유럽에 전파.',
      terms: [
        { label: '티레·시돈',   def: '페니키아의 대표 도시 국가. 해상 무역의 거점.' },
        { label: '카르타고',    def: 'BCE 814 페니키아인이 북아프리카(현 튀니지)에 건설한 식민 도시. 후일 로마와 포에니 전쟁.' },
        { label: '페니키아 문자', def: '사람이 말하는 소리를 기호로 나타낸 표음 문자. 그리스 알파벳의 기원.' },
        { label: '자줏빛 염료', def: '페니키아가 무역으로 유명했던 사치품. 페니키아라는 이름의 어원.' }
      ],
      timeline: [
        { y: -1200, yl: '12세기 BCE경', label: '◆ 페니키아 해상 활동 본격화 (대표 표기)' },
        { y: -1000, label: '티레·시돈 전성' },
        { y: -814,  label: '카르타고 건설' },
        { y: -800,  yl: '8세기 BCE경', label: '알파벳 그리스 전파' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '페니키아의 해상 활동과 식민 도시', ph: true,
        citation: '— 교과서 탐구 자료 미배치' },
      { kind: '탐구 자료', title: '페니키아 문자의 영향', ph: true,
        citation: '— 교과서 탐구 자료 미배치' }
    ],
    map: { title: '페니키아의 해상 네트워크', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 40 80 L 320 60 L 320 180 L 40 200 Z', label: '지중해' }],
      pins: [
        { x: 220, y: 100, label: '티레',     sub: '본거지', amber: true },
        { x: 210, y: 95,  label: '시돈',     sub: '대표 도시' },
        { x: 200, y: 92,  label: '비블로스', sub: '문자 전파' },
        { x: 120, y: 150, label: '카르타고', sub: '북아프리카 식민지', amber: true }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/히타이트, 페니키아, 헤브라이/[비상교육] 고등_세계사_1-1_18p_에게 문명과 지중해 동부 연안 국가.jpg',
        caption: '에게 문명과 지중해 동부 연안 국가',
        ref: '비상교육 세계사 1-1 p.18 — 페니키아(티레·시돈·비블로스)·헤브라이·히타이트 등 지중해 동부 연안 세력 분포도' }
    ],
    linked: ['s-hebrew', 's-hittite', 'w-aegean']
  },

  // ============================================================
  // 에게 문명 (BCE 2000~1100) — 미노아·미케네
  // ============================================================
  'w-aegean': {
    syncRatio: 0.88,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    notes: {
      sections: [
        {
          head: 'I. 성립',
          list: [
            '청동기 해양 문명 (BCE 3000년경 ~ BCE 12세기경)',
            '에게해 일대 — 크레타 섬, 키클라데스 제도, 그리스 본토, 소아시아 서해안',
            '고대 이집트·서아시아 문명을 그리스 본토에 전달하는 교량 역할'
          ]
        },
        {
          head: 'II. 크레타(미노아) 문명',
          list: [
            '크레타섬 (BCE 3000년경 ~) — 강력한 왕권과 해상 무역',
            '크노소스 궁전 — 미궁(라비린토스) 전설의 무대, 다층 구조와 채광·배수 시설',
            '선형 문자 A (미해독)',
            '평화로운 해상 무역 — 황소 숭배, 여신·돌고래 등 자유분방한 벽화',
            'BCE 1400년경 그리스 본토에서 남하한 미케네인이 에게해 장악'
          ]
        },
        {
          head: 'III. 미케네 문명',
          list: [
            '그리스 본토 (BCE 1400년경 에게해 장악 ~ BCE 12세기경)',
            '상무적(尙武的) 문화 — 사자문(獅子門), 거석 성벽, 전사 귀족',
            '선형 문자 B (그리스어 표기)',
            '트로이 전쟁 승리 — 호메로스 『일리아스』의 전설적 무대',
            'BCE 12세기경 철기를 사용하는 도리스인의 침입으로 파괴 → 폴리스 문명으로 이행'
          ]
        }
      ]
    },
    overview: {
      summary: '에게 문명 — 에게해 일대에서 일어난 청동기 문명. BCE 3000년경부터 크레타섬에서 발전한 크레타(미노스) 문명(크노소스 궁전·선형 문자 A·해상 무역)과, BCE 1400년경 에게해를 장악한 그리스 본토의 미케네 문명(사자문·선형 문자 B·전사 귀족)을 통칭. 미케네 문명은 BCE 12세기경 철기를 사용하는 도리스인의 침입으로 파괴되었다.',
      terms: [
        { label: '미노아 문명',   def: '크레타 섬의 청동기 문명. 크노소스 궁전·선형 문자 A·평화로운 해상 무역.' },
        { label: '미케네 문명',   def: '그리스 본토의 청동기 왕국. 사자문·선형 문자 B·전사 귀족 문화.' },
        { label: '선형 문자 A',   def: '미노아의 미해독 문자.' },
        { label: '선형 문자 B',   def: '미케네의 그리스어 표기 문자.' },
        { label: '트로이 전쟁',   def: '미케네 시대 후기의 전설적 전쟁. 호메로스의 『일리아스』 소재.' }
      ],
      timeline: [
        { y: -3000, label: '◆ 크레타섬 — 크레타(미노스) 문명 발전' },
        { y: -1400, label: '그리스 본토에서 남하한 미케네인이 에게해 장악' },
        { yl: '12세기 BCE경', label: '철기를 사용하는 도리스인의 침입으로 미케네 문명 파괴' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '미노아 문명', ph: true,
        citation: '— 교과서 탐구 자료 미배치' },
      { kind: '탐구 자료', title: '미케네 문명', ph: true,
        citation: '— 교과서 탐구 자료 미배치' }
    ],
    map: { title: '에게해 일대 — 미노아·미케네', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 80 60 L 240 60 L 280 130 L 240 200 L 80 200 L 40 130 Z', label: '에게해' }],
      pins: [
        { x: 160, y: 180, label: '크노소스 (크레타)', sub: '미노아 궁전', amber: true },
        { x: 140, y: 110, label: '미케네',           sub: '본토 왕국', amber: true },
        { x: 220, y: 100, label: '트로이',           sub: '아나톨리아 서북' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/유럽·미주/에게 문명/[비상교육] 고등_세계사_1-1_18p_미노스의 프레스코화.jpg',
        caption: '미노스의 프레스코화',
        ref: '비상교육 세계사 1-1 p.18 — 크노소스 궁전의 벽화. 황소·돌고래 등 자유분방한 미노아의 평화적 해양 문화를 보여줌.' },
      { slot: 'auto', src: 'assets/w1/고대/유럽·미주/에게 문명/이미지 2026. 5. 26. 16.01.png',
        caption: '크노소스 궁전',
        ref: '비상교육 세계사 1-1 p.18 — 크레타 섬의 미노아 왕궁. 다층 구조와 채광·배수 시설, 「라비린토스(미궁)」 전설의 무대.' }
    ],
    linked: ['w-minoan', 'w-mycenae', 'w-polis', 's-phoenicia']
  },

  // ============================================================
  // 아메리카 문명 (BCE 1200~) — 올멕·마야·아스테카·잉카
  // ============================================================
  'w-america': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.84,
    fileRef: 'W1 · 미래엔 세계사 1, p.14 / BS · 비상교육 세계사',
    overview: {
      summary: '아메리카 문명 — 아프리카와 아시아에서 여러 문명이 성립할 무렵 아메리카 대륙에서 성립한 독자적인 고대 문명. 마야 문명은 BCE 3000~2000년 무렵 형성된 것으로 추정되며(0의 개념·20진법·천문학·그림 문자), 10세기경 도시들이 붕괴하였다. 멕시코만의 올멕 문명은 BCE 1500년 무렵 형성된 것으로 추정된다. 이후 아스테카·잉카로 이어진다. 옥수수 농경을 기반으로 한 도시 문명. 올멕 지도자는 스스로가 우주 구성의 중요한 역할을 한다고 주장하였다.',
      terms: [
        { label: '올멕',     def: '멕시코만 일대의 문명. BCE 1500년 무렵 형성 추정. 한 달 20일·1년 13개월 달력, 그림 문자, 거대 두상 조각.' },
        { label: '마야',     def: '한 달 20일, 1년 18개월에 5일을 덧붙여 365일을 1년으로 계산. 0과 20진법, 피라미드 신전.' },
        { label: '아스테카', def: '14~16세기 멕시코 중부. 테노치티틀란. 16세기 스페인 코르테스에 의해 멸망.' },
        { label: '잉카',     def: '15~16세기 안데스. 쿠스코 수도. 16세기 스페인 피사로에 의해 멸망.' }
      ],
      timeline: [
        { yl: '3000~2000 BCE 무렵', label: '◆ 마야 문명 형성 (추정)' },
        { y: -1500, label: '올멕 문명 형성 (추정)' },
        { yl: '10세기 CE경', label: '마야 문명의 도시 붕괴' },
        { yl: '15세기 CE 무렵', label: '신마야 문명 멸망' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '마야 문명의 중심지, 치첸이트사',
        src: 'assets/w1/고대/유럽·미주/이미지 2026. 5. 26. 16.02 (1).png',
        citation: '— 교과서 탐구 자료 · 쿠쿨칸의 피라미드(계단 수 91×4+꼭대기 1 = 365, 1년의 날수와 일치)와 천체 관측용 엘 카라콜' }
    ],
    map: { title: '아메리카 — 메소아메리카·안데스', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 80 30 L 200 40 L 250 100 L 230 200 L 150 220 L 90 180 L 60 100 Z', label: '아메리카 대륙' }],
      pins: [
        { x: 130, y:  90, label: '올멕 (멕시코만)', sub: 'BCE 1500 무렵', amber: true },
        { x: 140, y: 110, label: '마야 (유카탄)',     sub: '천문·수학', amber: true },
        { x: 130, y:  85, label: '아스테카 (멕시코)', sub: '14~16세기' },
        { x: 180, y: 200, label: '잉카 (페루 안데스)', sub: '쿠스코' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/유럽·미주/아메리카 문명/[비상교육] 고등_세계사_1-1_19p_아메리카 문명의 발상지.jpg',
        caption: '아메리카 문명의 발상지',
        ref: '비상교육 세계사 1-1 p.19 — 올멕·마야·아스테카·잉카 등 메소아메리카·안데스 문명의 분포도' },
      { slot: 'auto', src: 'assets/w1/고대/유럽·미주/아메리카 문명/이미지 2026. 5. 26. 16.02.png',
        caption: '올멕 인두상',
        ref: '높이 2.7m의 거대한 두상. 올멕 통치자의 모습으로 추정 — 여러 곳에서 발견되어 올멕의 영역을 파악하는 단서' }
    ],
    linked: ['w-paleo', 'w-neolithic', 'w-aegean']
  },

  // ============================================================
  // 불교 성립 (BCE 6세기) — 사성제·팔정도
  // ============================================================
  's-buddhism': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.92,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    overview: {
      summary: '불교 — BCE 6세기 무렵 갠지스강 유역에서 고타마 싯다르타(석가모니, BCE 563?~483?)가 창시. 사성제(고·집·멸·도)와 팔정도를 핵심 가르침으로 삼고, 윤회로부터의 해탈(열반)을 추구. 카스트(바르나) 제도와 베다의 권위·제사 만능주의를 비판하며 인간 평등을 주장하여 크샤트리아·바이샤·평민의 지지를 얻었다. 마우리아 아소카 왕대(BCE 3세기) 전 인도로 확산되고, 쿠샨 왕조에서 대승 불교로 발전해 동남아·동아시아까지 전파.',
      terms: [
        { label: '고타마 싯다르타', def: '석가모니. 카필라바스투(현 네팔)의 왕자 출신. 출가→깨달음→설법→입멸.' },
        { label: '사성제(四聖諦)',  def: '고(苦)·집(集)·멸(滅)·도(道)의 네 가지 진리.' },
        { label: '팔정도(八正道)',  def: '깨달음에 이르는 8가지 바른 길.' },
        { label: '윤회·해탈',        def: '업(카르마)에 따라 다시 태어남(윤회), 그로부터 벗어남(해탈/열반).' },
        { label: '카스트 비판',       def: '브라만 중심의 신분제와 베다 권위를 비판하여 평등을 주장.' }
      ],
      timeline: [
        { y: -563, label: '◆ 석가모니 탄생 (대표 표기)' },
        { y: -528, label: '깨달음 — 35세' },
        { y: -483, label: '입멸 — 80세' },
        { y: -250, label: '아소카 왕의 적극 후원·전파' },
        { y:  100, label: '쿠샨 왕조 대승 불교 발전' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '불교의 성립과 가르침', ph: true,
        citation: '— 교과서 탐구 자료 미배치' },
      { kind: '탐구 자료', title: '불교의 전파', ph: true,
        citation: '— 교과서 탐구 자료 미배치' }
    ],
    map: { title: '불교의 발생지와 초기 전파', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 60 60 L 240 50 L 280 110 L 270 180 L 180 200 L 90 180 L 50 130 Z', label: '인도 아대륙' }],
      pins: [
        { x: 160, y: 100, label: '룸비니',     sub: '석가모니 탄생지', amber: true },
        { x: 180, y: 110, label: '부다가야',   sub: '깨달음의 땅', amber: true },
        { x: 170, y: 105, label: '사르나트',   sub: '초전법륜지' },
        { x: 190, y: 110, label: '쿠시나가르', sub: '입멸지' },
        { x: 145, y: 130, label: '갠지스강',   sub: '발생 지역' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto',
        caption: '석가모니 좌상',
        ref: 'W1' },
      { slot: 'auto',
        caption: '아소카 왕 석주',
        ref: 'W1' },
      { slot: 'auto',
        caption: '간다라 미술 — 불상의 시작',
        ref: 'W1' }
    ],
    linked: ['s-jainism', 's-aryan', 's-magadha', 's-kushan', 's-gupta']
  },

  // ============================================================
  // 자이나교 성립 (BCE 6세기) — 불살생·고행
  // ============================================================
  's-jainism': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.88,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    overview: {
      summary: '자이나교 — BCE 6세기 무렵 마하비라(바르다마나)가 창시. 극단적 불살생(아힘사)·고행·무소유를 강조하며 영혼의 해탈을 추구. 카스트(바르나) 제도와 베다의 권위를 비판하여 평등을 주장. 농경 행위까지 살생으로 보는 엄격한 계율 때문에 주로 상공업 계층에서 신봉되었다.',
      terms: [
        { label: '마하비라(바르다마나)', def: '자이나교의 창시자. 약 BCE 540~468년.' },
        { label: '아힘사(불살생)',        def: '어떤 생명도 해치지 않는다는 자이나교의 핵심 계율.' },
        { label: '고행·무소유',            def: '욕망을 끊는 엄격한 수행과 소유를 버리는 삶.' },
        { label: '카스트 비판',            def: '브라만 중심 신분제와 베다 권위를 비판, 인간 평등 주장.' }
      ],
      timeline: [
        { y: -540, label: '◆ 마하비라 탄생 (대표 표기)' },
        { y: -468, label: '마하비라 입멸' },
        { y: -322, label: '마우리아 왕조 — 자이나교 확산' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '자이나교의 성립과 교리', ph: true,
        citation: '— 교과서 탐구 자료 미배치' }
    ],
    map: { title: '자이나교의 발생지', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 60 60 L 240 50 L 280 110 L 270 180 L 180 200 L 90 180 L 50 130 Z', label: '인도 아대륙' }],
      pins: [
        { x: 165, y: 110, label: '바이샬리', sub: '마하비라 탄생지', amber: true },
        { x: 175, y: 130, label: '파바',     sub: '입멸지' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto',
        caption: '마하비라 조각상',
        ref: 'W1' },
      { slot: 'auto',
        caption: '자이나교 사원',
        ref: 'BS' }
    ],
    linked: ['s-buddhism', 's-aryan', 's-magadha']
  },

  // ============================================================
  // 마우리아 왕조 (BCE 322~185) — 인도 최초의 통일 제국
  // ============================================================
  's-magadha': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.92,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    overview: {
      summary: '마우리아 왕조 — 찬드라굽타 마우리아가 BCE 322 마가다국을 기반으로 인도 최초의 통일 제국을 수립. 수도는 파탈리푸트라. 제3대 아소카 왕(BCE 268~232)이 전성기. 칼링가 전쟁의 참상을 보고 불교에 귀의하여 다르마(법) 정치를 펼치고 인도 전역과 실론(스리랑카)·동남아로 불교를 적극 전파. 곳곳에 석주와 마애 칙령을 세웠다.',
      terms: [
        { label: '찬드라굽타 마우리아', def: '왕조의 창시자. 알렉산드로스 사후의 혼란을 틈타 마가다국 권력 장악.' },
        { label: '파탈리푸트라',         def: '마우리아 왕조의 수도. 갠지스강 중류.' },
        { label: '아소카 왕',            def: 'BCE 268~232. 칼링가 전쟁 후 불교에 귀의한 마우리아 전성기 군주.' },
        { label: '칼링가 전쟁',          def: '인도 동부 칼링가국 정복 전쟁. 막대한 인명 피해가 아소카 왕의 회심 계기.' },
        { label: '석주·마애 칙령',       def: '아소카 왕이 다르마(법) 정치를 새긴 돌기둥과 바위 비문.' }
      ],
      timeline: [
        { y: -326, label: '알렉산드로스의 인더스 침공' },
        { y: -322, label: '◆ 마우리아 왕조 성립 (대표 표기)' },
        { y: -268, label: '아소카 왕 즉위' },
        { y: -261, label: '칼링가 전쟁 → 불교 귀의' },
        { y: -185, label: '마우리아 멸망' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '마우리아 왕조의 성립과 발전', ph: true,
        citation: '— 교과서 탐구 자료 미배치' },
      { kind: '탐구 자료', title: '아소카 왕의 불교 전파', ph: true,
        citation: '— 교과서 탐구 자료 미배치' }
    ],
    map: { title: '마우리아 제국의 영역', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 50 50 L 250 40 L 290 120 L 270 200 L 180 215 L 80 190 L 40 120 Z', label: '인도 아대륙' }],
      pins: [
        { x: 175, y: 110, label: '파탈리푸트라', sub: '수도', amber: true },
        { x: 210, y: 145, label: '칼링가',       sub: '아소카 전쟁터' },
        { x: 110, y:  80, label: '인더스',        sub: '서북 경계' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto',
        caption: '아소카 왕 석주 — 사르나트',
        ref: 'W1' },
      { slot: 'auto',
        caption: '아소카 마애 칙령 비문',
        ref: 'W1' },
      { slot: 'auto',
        caption: '마우리아 제국의 영역도',
        ref: 'W1' }
    ],
    linked: ['s-buddhism', 's-jainism', 's-kushan', 's-gupta', 's-aryan']
  },

  // ============================================================
  // 쿠샨 왕조 (CE 30~375) — 간다라 미술과 대승 불교
  // ============================================================
  's-kushan': {
    syncRatio: 0.90,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    notes: {
      sections: [
        {
          head: 'I. 성립',
          list: [
            '이란 계통 쿠샨족 서북 인도에서 성립 → 북인도 재통일'
          ]
        },
        {
          head: 'II. 발전',
          list: [
            '중계무역으로 번영',
            '중국(후한)-인도-이란(파르티아) 연결',
            '북부 인도와 중앙아시아 일대에 걸친 대제국으로 발전'
          ]
        },
        {
          head: 'III. 카니슈카왕 (2세기 중엽)',
          list: [
            '대승 불교',
            '중생 구제, 초월적 존재로서의 부처',
            '사막길(비단길)을 통해 중국 및 동아시아 지역 전파'
          ]
        },
        {
          head: 'IV. 간다라 양식',
          list: [
            '인도 문화 + 헬레니즘 문화',
            '인도 서북부 간다라 지방',
            '알렉산드로스의 침략으로 헬레니즘 전파',
            '인간적이고 사실적 표현이 특징',
            '중앙아시아와 중국을 거쳐 동아시아까지 영향'
          ]
        },
        {
          head: 'V. 쇠퇴',
          list: [
            '카니슈카왕 사후 국력 약화',
            '사산 조 페르시아에 의해 인더스강 서부 상실'
          ]
        }
      ]
    },
    overview: {
      summary: '쿠샨 왕조 — 1세기 중엽 이란 계통의 유목 민족인 쿠샨족이 서북 인도를 중심으로 세워 북인도를 재통일한 왕조. 중국(후한)·인도·서아시아(파르티아)·로마 제국을 연결하는 동서 교역로(비단길)를 장악하고 중계 무역으로 번영하였으며, 로마 화폐의 영향을 받은 금화를 주조해 널리 통용하였다. 2세기 중엽 카니슈카왕은 활발한 정복 전쟁으로 북인도에서 중앙아시아에 이르는 영토를 확보해 전성기를 이끌었고, 영토 확장과 함께 학문과 종교를 장려하며 불교 지원과 포교에 힘썼다. 이 시기에는 부처를 신앙의 대상(초월적 존재)으로 삼고 많은 사람(중생)의 구제를 강조하는 대승 불교가 발달하였는데, 대승 불교는 사막길(비단길)을 거쳐 중국·한반도 등 동아시아 지역으로 전파되었다. 이들은 자신을 「큰 수레(대승)」라 하고, 개인의 해탈만을 목표로 수행하던 기존 불교를 낮추어 「작은 수레(소승)」라 불렀으나 그 지지자들은 스스로를 상좌부 불교라 하였다. 한편 쿠샨 왕조의 중심이던 인도 서북부 간다라 지방에서는 인도 문화와 헬레니즘 문화가 융합한 간다라 양식의 불교 미술이 발달하였다. 불교 발생 초기에는 부처의 모습을 조각하는 것을 불경하게 여겨 발자국·보리수 나무·연꽃 등으로 표현하였으나, 알렉산드로스의 원정으로 전해진 헬레니즘의 영향과 신의 모습을 조각하는 그리스 문화의 영향을 받아 곱슬머리·오뚝한 코·섬세한 옷 주름을 갖춘, 대승 불교가 신격화한 부처를 인간의 모습으로 표현한 인간적·사실적인 불상이 제작되었다(간다라 지방 출토 트로이 신화 부조가 헬레니즘의 영향을 보여 준다). 간다라 양식은 중앙아시아와 중국을 거쳐 우리나라와 일본에까지 영향을 미쳤다(간다라 불상 → 윈강 석굴 불상 → 석굴암 본존상). 그러나 카니슈카왕 사후 국력이 약해졌고, 3세기 중엽 이후 사산 왕조 페르시아의 침입으로 인더스강 서부를 잃고 쇠퇴하여 인도 북부는 다시 여러 소국으로 분열되었다.',
      terms: [
        { label: '쿠샨족 · 성립', def: '1세기 중엽 이란 계통의 유목 민족이 서북 인도를 중심으로 건국 → 북인도 재통일.' },
        { label: '동서 교역로 장악', def: '중국(후한)·인도·서아시아(파르티아)·로마를 잇는 비단길을 장악 → 중계 무역으로 번영. 로마 화폐의 영향을 받은 금화 주조.' },
        { label: '카니슈카왕', def: '2세기 중엽 전성기 군주. 북인도~중앙아시아에 이르는 영토 확보, 학문과 종교 장려, 불교 지원과 포교.' },
        { label: '대승 불교', def: '중생 구제와 초월적 존재(신앙 대상)로서의 부처를 강조. 사막길(비단길)을 거쳐 중국·한반도 등 동아시아로 전파. 「큰 수레」의 뜻.' },
        { label: '상좌부 불교', def: '개인의 해탈을 목표로 수행하는 기존 불교. 대승 쪽에서 「소승(작은 수레)」이라 낮추어 불렀으나, 지지자들은 상좌부 불교라 하였다.' },
        { label: '간다라 양식', def: '인도 문화 + 헬레니즘 문화가 융합된 인도 서북부 간다라 지방의 미술 양식. 인간적·사실적 표현이 특징.' },
        { label: '불상의 등장', def: '초기에는 부처를 발자국·보리수·연꽃으로 표현 → 그리스 문화의 영향으로 곱슬머리·오뚝한 코·섬세한 옷 주름을 갖춘 인간 모습의 불상 제작.' },
        { label: '동아시아 전파', def: '간다라 양식이 중앙아시아·중국을 거쳐 우리나라·일본까지 영향(간다라 불상 → 윈강 석굴 불상 → 석굴암 본존상).' },
        { label: '쇠퇴', def: '카니슈카왕 사후 국력 약화 → 3세기 중엽 이후 사산 왕조 페르시아의 침입으로 인더스강 서부 상실, 인도 북부는 여러 소국으로 분열.' }
      ],
      timeline: [
        { y:  50, yl: '1세기 CE 중엽', label: '◆ 쿠샨 왕조 성립 (대표 표기) — 이란계 쿠샨족, 북인도 재통일' },
        { y: 150, yl: '2세기 CE 중엽', label: '카니슈카왕 — 전성기 · 불교 장려 · 대승 불교와 간다라 양식 불교 미술 발달' },
        { y: 250, yl: '3세기 CE 중엽', label: '사산 왕조 페르시아의 침입 — 인더스강 서부 상실' },
        { y: 320, label: '인도 북부 분열 → 굽타 왕조 성립' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '쿠샨 왕조의 성립과 전성', ph: true,
        citation: '— 교과서 탐구 자료 미배치' },
      { kind: '탐구 자료', title: '간다라 미술과 대승 불교', ph: true,
        citation: '— 교과서 탐구 자료 미배치' }
    ],
    map: { title: '쿠샨 왕조 — 중앙아시아~인도 북부', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 40 50 L 260 40 L 300 110 L 270 180 L 180 200 L 80 180 L 40 110 Z', label: '쿠샨 영역' }],
      pins: [
        { x: 130, y:  80, label: '바그람',     sub: '여름 수도', amber: true },
        { x: 110, y: 110, label: '간다라',     sub: '미술 중심지', amber: true },
        { x: 180, y: 130, label: '마투라',     sub: '인도식 불상' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto',
        caption: '간다라 불상 — 그리스풍',
        ref: 'W1' },
      { slot: 'auto',
        caption: '카니슈카 왕 금화',
        ref: 'W1' }
    ],
    linked: ['s-magadha', 's-buddhism', 's-gupta']
  },

  // ============================================================
  // 굽타 왕조 (CE 320~550) — 인도 고전 문화의 황금기
  // ============================================================
  's-gupta': {
    syncRatio: 0.93,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    notes: {
      sections: [
        {
          head: 'I. 성립',
          list: [
            '쿠샨 왕조 쇠퇴 이후 서북 인도 분열',
            '찬드라굽타 1세',
            '4세기 초 갠지스강 유역에서 성립'
          ]
        },
        {
          head: 'II. 찬드라굽타 2세(380~415)',
          list: [
            '북인도(벵골만~인더스강 유역) 차지',
            '남쪽으로 영토 확장',
            '행정 조직 정비, 농지 개간',
            '동서 해상무역 독점',
            '굽타 양식과 같은 독자적 인도 문화 발전'
          ]
        },
        {
          head: 'III. 쇠퇴 및 멸망',
          list: [
            '5세기경 에프탈의 침입',
            '왕위를 둘러싼 내분 → 6세기 중엽 멸망'
          ]
        },
        {
          head: 'IV. 힌두교 = 브라만교 + 불교 + 민간신앙',
          list: [
            '발전: 토착적 성격 → 급속한 대중화',
            '인도 민족 종교 발전 → 사회 통합',
            '지배층의 힌두교 후원',
            '왕 = 신에 비유',
            '  → 지배층의 권위 상승에 이용',
            '『마누 법전』',
            '카스트제 통해 신분 차별 합리화',
            '  → 일상에 영향'
          ]
        },
        {
          head: 'V. 인도 고전 문화의 발달',
          list: [
            '특징',
            '  · 인도 고유 특색 및 민족의식 강조',
            '  · 인도 고전 문화 황금기 = 굽타 문화',
            '산스크리트 문학',
            '  · 산스크리트어 공용어',
            '  · 『마하바라타』, 『라마야나』, 『샤쿤탈라』',
            '굽타 양식',
            '  · = 간다라 양식 + 인도 고유 특색',
            '  · 인도 특유 곡선미, 독특한 음영법 강조',
            '  · 동아시아 불교 미술에 영향',
            '  · 아잔타 석굴·엘로라 석굴'
          ]
        }
      ]
    },
    overview: {
      summary: '굽타 왕조 — 3세기 중반 사산 왕조 페르시아가 인더스강 유역으로 세력을 확대하자 쿠샨 왕조가 쇠퇴하고 서북 인도가 분열되었는데, 이 혼란한 북인도에서 찬드라굽타 1세가 4세기 초(320) 갠지스강 일대를 차지하며 세운 왕조. 전성기를 이룬 찬드라굽타 2세(380~415)는 동쪽으로 벵골만에서 서쪽 인더스강 유역까지 북인도를 통일하고 남쪽으로도 영토를 넓혀 왕조의 최대 판도를 이루었으며, 중앙과 지방의 행정 조직을 정비하고 농지를 개간하였고 동서 해상 무역을 독점하여 번영하였다. 굽타 왕들은 아소카왕의 석주에 별도의 비문을 새겨 자신이 아소카왕과 같은 왕임을 선전하며 국가 통합을 꾀하였다(사무드라굽타의 알라하바드 석주 비문). 정치와 경제가 안정되자 학문과 예술을 적극 지원하여 문학·예술·자연 과학·수학이 발전하였다. 종교에서는 브라만교를 바탕으로 불교와 다양한 민간 신앙이 융합된 힌두교가 발전하였는데, 토착적 성격이 강해 급속히 대중화되어 인도의 민족 종교로 자리 잡으며 사회 통합에 기여하였다. 브라흐마·비슈누·시바를 각각 우주를 창조·유지·파괴하는 신으로 숭배하였고, 왕들은 자신을 비슈누에 비유하며 힌두교를 후원해 지배층의 권위를 높였다. 힌두교가 발전하면서 브라만의 지위와 영향력이 커져 카스트제가 인도 사회에 정착하고 직업·신분 차별이 고착화되었으며, 카스트에 따른 의무와 관습을 규정한 『마누 법전』이 힌두교도의 일상생활에 큰 영향을 미쳤다. 문화에서는 인도 고유의 색채와 민족의식이 강조된 인도 고전 문화의 황금기가 열려, 산스크리트어가 공용어로 자리 잡고 『마하바라타』·『라마야나』가 오늘날의 형태로 정리되었으며 칼리다사가 희곡 『샤쿤탈라』를 지었다. 미술에서는 간다라 양식과 인도 고유 양식이 융합된 굽타 양식이 나타나 인도 특유의 곡선미와 음영법이 강조되었고(아잔타·엘로라 석굴의 벽화와 불상), 중앙아시아를 거쳐 중국·한국·일본 등 동아시아 불교 미술에 영향을 주었다. 자연 과학에서는 0의 개념과 10진법이 일상적으로 사용되고 천문학자 아리아바타가 원주율로 지구 둘레를 계산하며 지구가 둥글고 자전한다는 사실을 밝혔는데, 이러한 지식은 이슬람 세계에 전해져 천문학·수학 발달에 기여하였다. 그러나 5세기 중엽 이후 중앙아시아 유목민 에프탈의 침입과 왕위를 둘러싼 내분으로 쇠퇴하여 6세기 중엽 멸망하였다.',
      terms: [
        { label: '성립 배경', def: '3세기 중반 사산 왕조 페르시아의 인더스강 유역 진출 → 쿠샨 왕조 쇠퇴 → 서북 인도 분열.' },
        { label: '찬드라굽타 1세', def: '4세기 초(320) 갠지스강 일대를 차지하고 굽타 왕조를 세움.' },
        { label: '찬드라굽타 2세(380~415)', def: '전성기 군주. 벵골만~인더스강 유역의 북인도 통일과 남방 확장, 중앙·지방 조직 정비, 농지 개간, 동서 해상 무역 독점.' },
        { label: '아소카 석주 비문', def: '굽타 왕들이 기존 아소카왕 석주에 비문을 새겨 자신이 아소카왕 같은 왕임을 선전 → 국가 통합의 상징(사무드라굽타의 알라하바드 석주).' },
        { label: '힌두교', def: '브라만교 + 불교 + 민간 신앙이 융합. 토착적 성격 → 급속한 대중화, 인도의 민족 종교로 사회 통합에 기여. 브라흐마·비슈누·시바 = 창조·유지·파괴의 신.' },
        { label: '왕 = 신에 비유', def: '왕들이 자신을 비슈누에 비유하며 힌두교를 후원 → 지배층의 권위 상승에 이용, 힌두교는 왕실의 보호로 성장.' },
        { label: '카스트제 · 『마누 법전』', def: '브라만의 지위·영향력 강화 → 카스트제 정착, 직업·신분 차별 고착화. 카스트별 의무와 관습을 규정한 『마누 법전』이 일상생활에 큰 영향.' },
        { label: '산스크리트 문학', def: '산스크리트어가 공용어로 자리잡음. 『마하바라타』·『라마야나』 정리, 칼리다사의 희곡 『샤쿤탈라』.' },
        { label: '굽타 양식', def: '간다라 양식 + 인도 고유 특색. 인도 특유의 곡선미와 음영법, 옷 주름을 생략해 인체의 윤곽을 드러냄. 아잔타·엘로라 석굴 → 동아시아 불교 미술에 영향.' },
        { label: '자연 과학', def: '0의 개념과 10진법 일상화, 아리아바타의 지구 둘레 계산·자전 파악 → 이슬람 세계로 전해져 천문학·수학 발달에 기여.' },
        { label: '쇠퇴와 멸망', def: '5세기 중엽 이후 중앙아시아 유목민 에프탈의 침입 + 왕위를 둘러싼 내분 → 6세기 중엽 멸망.' }
      ],
      timeline: [
        { y: 320, label: '◆ 굽타 왕조 성립 (대표 표기) — 찬드라굽타 1세' },
        { y: 380, label: '찬드라굽타 2세 즉위 — 전성기(벵골만~인더스강)' },
        { y: 400, label: '산스크리트 문학 · 굽타 양식 · 0과 10진법' },
        { y: 450, label: '5세기 중엽 에프탈 침입 시작 — 쇠퇴' },
        { y: 550, label: '왕위 계승 내분 → 6세기 중엽 멸망' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '굽타 왕조의 국가 통합을 위한 노력',
        src: 'assets/w1/고대/서아시아·인도/굽타 왕조/굽타 왕조의 국가 통합을 위한 노력.jpg',
        citation: '— 사무드라굽타가 알라하바드 석주에 새긴 비문. 「이 대지 위에 높은 석주가 우뚝 솟아 있다. … 나 사무드라굽타는 탁월한 통치자의 반열에 오를 것임을 선포하노라.」 굽타 왕조의 여러 왕들은 기존에 세워져 있던 아소카왕의 석주에 별도의 비문을 새겨 넣으며 자신이 아소카왕과 같은 왕이라는 것을 선전하였다.' },
      { kind: '탐구 자료', title: '『마누 법전』에서 보는 카스트제',
        src: 'assets/w1/고대/서아시아·인도/굽타 왕조/마누법전에서 보는 카스트제.jpg',
        citation: '— 『마누 법전』 · 제1계급 브라만(사제) → 제2계급 크샤트리아(왕족·귀족) → 제3계급 바이샤(평민) → 제4계급 수드라(주로 노예). 창조주가 각각의 업을 정하여 브라만에게는 베다를 가르치고 제사 지내는 일을, 크샤트리아에게는 백성을 보호하는 일을, 바이샤에게는 농사를 짓고 짐승을 기르는 일을, 수드라에게는 앞선 세 신분의 사람들에게 봉사하는 임무를 명령하였다.' },
      { kind: '탐구 자료', title: '오늘날 숫자의 유래',
        src: 'assets/w1/고대/서아시아·인도/굽타 왕조/오늘날 숫자의 유래.jpg',
        citation: '— 인도의 10진법과 영(0)의 개념은 8세기경 아라비아에 전해졌다. 오늘날 「아라비아 숫자」로 알려져 있으나, 인도의 숫자 체계와 10진법이 아라비아에 전해져 형성된 것이다(인도 → 아라비아 → 유럽).' },
      { kind: '탐구 자료', title: '종교 전파와 동아시아·인도의 상호 작용',
        src: 'assets/w1/고대/서아시아·인도/굽타 왕조/종교 전파와 동아시아·인도의 상호작용.jpg',
        citation: '— 주제 탐구 · 인도에서 시작된 불교와 힌두교가 동아시아·동남아시아로 전파되어 각 지역에서 발전하며 상호 작용한 과정. 불교의 전파 과정(대승 불교·상좌부 불교), 윈강 석굴(중국) — 「왕이 곧 부처」 사상, 앙코르 와트(캄보디아), 보로부두르(인도네시아 자와섬).' }
    ],
    map: { title: '굽타 왕조의 영역', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 50 50 L 250 40 L 290 120 L 270 200 L 180 215 L 80 190 L 40 120 Z', label: '인도 아대륙' }],
      pins: [
        { x: 175, y: 110, label: '파탈리푸트라', sub: '굽타 수도', amber: true },
        { x: 165, y: 145, label: '아잔타·엘로라', sub: '석굴 미술', amber: true },
        { x: 150, y:  90, label: '갠지스강',     sub: '왕조의 본거지' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/굽타 왕조/굽타 왕조와 그 영향권.jpg',
        caption: '굽타 왕조와 그 영향권',
        ref: '굽타 왕조의 영역과 주요 불교 유적 — 북서쪽으로 에프탈·사산 왕조 페르시아와 접하고, 남쪽에는 촐라. 바라나시·파탈리푸트라·날란다·아잔타·엘로라' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/굽타 왕조/굽타 왕조의 영역.jpg',
        caption: '굽타 왕조의 영역',
        ref: '굽타 왕조의 최대 영역과 주요 불교 유적지 — 마투라·바라나시·파탈리푸트라·날란다·아잔타·엘로라. 벵골만~인더스강 유역의 북인도 통일' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/굽타 왕조/비슈누 신상.jpg',
        caption: '비슈누 신상',
        ref: '비슈누는 브라흐마(창조), 시바(파괴)와 함께 힌두교의 주요 신으로 우주의 유지를 주관하였다. 왕들은 자신을 비슈누에 비유하며 왕권을 높였다' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/굽타 왕조/시바 신상.jpg',
        caption: '시바 신상',
        ref: '시바는 파괴의 신으로 죽음을 관장하는데, 시바가 춤을 출 때 세상이 파괴되고 다음 세상이 온다고 하였다' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/굽타 왕조/아잔타 석굴 사원.jpg',
        caption: '아잔타 석굴 사원(인도)',
        ref: '굽타 양식의 벽화와 불상으로 유명한 석굴 사원군. 그 규모와 예술성으로 이름 높다' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/굽타 왕조/아잔타 석굴2.jpg',
        caption: '아잔타 석굴(인도) · 제26 석굴 열반상',
        ref: '약 30개의 동굴 사원으로, 인체의 윤곽을 그대로 드러낸 벽화 등 굽타 양식의 벽화와 불상을 볼 수 있다' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/굽타 왕조/연화수 보살 벽화.jpg',
        caption: '연화수 보살 벽화(아잔타 제1석굴)',
        ref: '29개 석굴의 대표적인 벽화. 옷 주름 선을 생략하여 인체의 윤곽을 드러내 인도 고유의 색채를 보여 준다' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/굽타 왕조/엘롤라 석굴 사원.jpg',
        caption: '엘로라 석굴 사원(인도)',
        ref: '바위를 통째로 깎아 만든 석굴 사원. 굽타 양식이 계승된 인도 고전 미술의 정수' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/굽타 왕조/엘롤라 석굴 사원2.jpg',
        caption: '엘로라 석굴(인도) · 자이나교의 창시자 마하비라상',
        ref: '5~10세기에 걸쳐 조성되었으며, 불교·힌두교·자이나교 등 다양한 종교의 사원으로 구성되어 있다' }
    ],
    linked: ['s-kushan', 's-magadha', 's-buddhism']
  },

  // ============================================================
  // 춘추(春秋) (BCE 770~) — 동주의 시작과 패권 다툼
  // ============================================================
  'e-chunqiu-zhanguo': {
    syncRatio: 0.92,
    fileRef: 'W1 · 미래엔 세계사 1, p.22 / DA · 동아시아 역사 기행',
    notes: {
      sections: [
        {
          head: '一. 성립',
          list: [
            '주 왕실 약화',
            '  · 주 왕실과 제후 간 혈연적 유대 약화, 제후 강성, 왕실 약화',
            '동주 성립 (BCE 770)',
            '  · 견융의 침입, 호경 → 뤄양 천도'
          ]
        },
        {
          head: '二. 춘추 시대',
          list: [
            '춘추 5패',
            '5패의 제후 통제',
            '존왕양이(尊王攘夷)'
          ]
        },
        {
          head: '三. 전국 시대',
          list: [
            '전국 7웅',
            '약소 제후국 병합·패권 경쟁',
            '약육강식(弱肉强食)'
          ]
        },
        {
          head: '四. 사회 변화',
          list: [
            '정치',
            '  · 영토 국가로 발전: 봉건제 → 군현제, 관료제',
            '경제',
            '  · 농업 생산량 증가: 철제 농기구, 우경, 토지 개발 활발',
            '사회',
            '  · 토지 사유화, 생산력 증대 → 소농민 가정이 사회 기초 단위',
            '  · 철기 보급 → 전쟁 양상 변화: 전차에서 기병·보병으로, 백성 지위 향상',
            '     → 철제 농기구 도입: 농업 생산력 증대'
          ]
        },
        {
          head: '五. 제자백가',
          list: [
            '제후들의 부국강병 추진',
            '국적·신분 관계없이 능력 위주 인재 등용 → 제자백가 등장',
            '유가: 공자·맹자·순자',
            '  · 인·예 중시, 덕치 주장, 이후 중국 사상과 문화의 주류',
            '  · 〈동아시아 역사 기행〉 한 무제 관학화 → 수·당 과거제·국자감',
            '     → 한자와 함께 동아시아(한국·일본·베트남) 공통 사상으로 확산',
            '법가: 상앙·이사·한비자',
            '  · 군주의 권위와 엄격한 법치 강조',
            '도가: 노자·장자',
            '  · 인위적 제도 배제, 무위자연 추구, 중국 예술·종교에 영향',
            '묵가: 묵자',
            '  · 겸애 사상, 개인 능력 중시 주장, 평화주의'
          ]
        }
      ]
    },
    overview: {
      summary: '춘추·전국 시대 — BCE 770 주가 호경에서 낙읍으로 천도하며 시작된 약 550년의 분열기. 춘추 시대(BCE 770~403)는 춘추 5패(제 환공·진 문공·초 장왕·오왕 합려·월왕 구천)가 패권을 다투었고, 전국 시대(BCE 403~221)는 7웅(秦·楚·齊·燕·趙·魏·韓)이 쟁패하였다. 철제 농기구·우경의 보급으로 농업 생산력이 비약적으로 발전하였고, 화폐·도시·상공업이 성장하였다. 공자·노자를 비롯해 유가·도가·법가·묵가·음양가·명가 등 제자백가의 사상이 꽃피었다. BCE 221 진의 시황제가 6국을 평정하며 통일.',
      terms: [
        { label: '동주(東周)',  def: '주가 낙읍으로 천도한 이후의 시기. 춘추~전국을 통칭.' },
        { label: '춘추 5패',    def: '제 환공·진 문공·초 장왕·오왕 합려·월왕 구천.' },
        { label: '전국 7웅',    def: '진(秦)·초(楚)·제(齊)·연(燕)·조(趙)·위(魏)·한(韓).' },
        { label: '제자백가',    def: '유가·도가·법가·묵가·음양가·명가 등 다양한 사상가의 등장.' },
        { label: '공자',        def: 'BCE 551~479. 노나라 출신 사상가. 인(仁)·예(禮)를 중심으로 유가 사상의 시조.' },
        { label: '법가',       def: '상앙·한비자. 엄격한 법·신상필벌. 진의 통일 이념적 기초.' },
        { label: '철제 농기구', def: '농업 생산력 비약. 사회 경제 변동의 토대.' }
      ],
      timeline: [
        { y: -770, label: '◆ 동주 시작 — 낙읍 천도 (대표 표기)' },
        { y: -679, label: '제 환공 패자 — 춘추 5패' },
        { y: -551, label: '공자 출생' },
        { y: -403, label: '전국 시대 개막 — 진(晉)이 한·위·조로 나뉨' },
        { y: -356, label: '상앙의 변법 (진)' },
        { y: -260, label: '장평 전투 (진 vs 조)' },
        { y: -221, label: '진의 통일' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '제자백가',
        src: 'assets/w1/고대/동아시아/춘추·전국 시대/이미지 2026. 5. 27. 14.15.jpeg',
        citation: '— 교과서 탐구 자료 · 유가(맹자)·도가(노자)·법가(한비자)·묵가(묵자)의 사상' }
    ],
    map: { title: '춘추·전국 시대 — 중원의 분열과 7웅', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 40 60 L 260 50 L 300 130 L 260 200 L 100 200 L 50 130 Z', label: '중국' }],
      pins: [
        { x: 175, y: 110, label: '낙읍(뤄양)', sub: '동주 도읍', amber: true },
        { x: 100, y: 100, label: '진(秦)',     sub: '서쪽 패자', amber: true },
        { x: 130, y: 130, label: '조(趙)',     sub: '북방' },
        { x: 170, y: 140, label: '위(魏)',     sub: '중원' },
        { x: 180, y: 110, label: '한(韓)',     sub: '중원' },
        { x: 200, y: 130, label: '제(齊)',     sub: '동방' },
        { x: 200, y: 180, label: '초(楚)',     sub: '남방' },
        { x: 210, y:  90, label: '연(燕)',     sub: '동북' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/동아시아/춘추·전국 시대/미래엔_세계사_이미지_22쪽_2_춘추_5패.JPG',
        caption: '춘추 5패',
        ref: '미래엔 세계사 1, p.22 — 춘추 시대의 5패 분포도' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/춘추·전국 시대/미래엔_세계사_이미지_22쪽_3_전국_7웅.JPG',
        caption: '전국 7웅',
        ref: '미래엔 세계사 1, p.22 — 전국 시대의 7웅 분포도' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/춘추·전국 시대/이미지 2026. 5. 27. 14.14 (1).png',
        caption: '철제 투구와 무기',
        ref: '철기의 보급 — 전국 시대 군사력·생산력 발전의 바탕' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/춘추·전국 시대/이미지 2026. 5. 27. 14.14.png',
        caption: '우경(牛耕)을 하는 모습',
        ref: '한대 화상석 — 소를 이용한 밭갈이. 철제 농기구와 함께 농업 생산력 비약' }
    ],
    linked: ['e-zhou', 'e-qin']
  },

  // ============================================================
  // 진(秦) (BCE 221~206) — 중국 최초의 통일 제국
  // ============================================================
  'e-qin': {
    syncRatio: 0.94,
    fileRef: 'W1 · 미래엔 세계사 1',
    notes: {
      sections: [
        {
          head: '一. 춘추·전국 시대 통일',
          list: [
            '법가 사상 기반의 변법 개혁 성공',
            '전국 6국 정복 → 통일 완수 (BCE 221)'
          ]
        },
        {
          head: '二. 시황제 (BCE 221~210)',
          list: [
            '황제 칭호 사용 = 시황제',
            '법치주의',
            '강력한 중앙 집권 체제 확립',
            '군현제',
            '  · 전국을 36군으로 나누고 관리 파견',
            '  · 전국 실시',
            '통일 정책',
            '  · 화폐(반량전)·문자(전서체)·도량형 통일',
            '  · 사상 통일: 분서갱유(焚書坑儒)',
            '     → 법가 외 사상 탄압',
            '대외 팽창',
            '  · 흉노 토벌 후 만리장성 축조',
            '  · 광둥성·베트남 북부까지 영토 확대'
          ]
        },
        {
          head: '三. 멸망',
          list: [
            '가혹한 법치, 대규모 토목 공사',
            '   → 백성 불만 고조',
            '시황제 사후',
            '  · 진승·오광의 난 (BCE 209)',
            '  · 각지 반란으로 멸망 (BCE 206)'
          ]
        }
      ]
    },
    overview: {
      summary:
        '진(秦) — BCE 221 시황제(영정)가 6국(한·조·위·초·연·제)을 평정하고 **중국 최초의 통일 제국**을 수립. 황제(皇帝) 칭호를 처음 사용하고 **군현제**를 시행하여 봉건제를 폐지·중앙집권을 확립하였다. 문자(소전체)·도량형·화폐(반량전)·수레폭을 통일하여 동아시아 한자 문화권의 표준을 마련. 법가 사상에 입각한 엄격한 통치(이사 재상)와 분서갱유로 사상 통제, 흉노 정벌·만리장성 축조, 남방 정복으로 영토 확장. 진 시황릉 병마용(兵馬俑)은 황제의 위세를 보여준다. 그러나 무거운 부역·가혹한 법치로 민심이 이반하여 시황제 사후 곧 진승·오광의 봉기와 항우·유방의 전쟁 속에서 BCE 206 단명에 멸망. 단명했지만 **이후 동아시아 중앙집권 황제 체제의 원형**이 되었다.',
      terms: [
        { label: '시황제',     def: '진의 첫 황제. 본명 영정. 황제 칭호 최초 사용.' },
        { label: '군현제',     def: '전국을 군·현으로 나누어 황제가 직접 임명한 관리가 다스리는 중앙집권 제도.' },
        { label: '도량형 통일', def: '도량(거리·길이)·형(무게)·수레폭의 통일.' },
        { label: '만리장성',    def: '흉노 침입에 대비한 장성. 시황제가 기존 장성을 연결·확장.' },
        { label: '분서갱유',    def: '실용 서적을 제외한 책을 불태우고 유생을 매장한 사상 탄압.' },
        { label: '병마용',      def: '진 시황릉의 흙으로 만든 병사·말 군상.' }
      ],
      timeline: [
        { y: -221, label: '◆ 진의 통일 — 시황제 (대표 표기)' },
        { y: -214, label: '만리장성 축조 본격화' },
        { y: -213, label: '분서' },
        { y: -210, label: '시황제 사망 — 사구의 변' },
        { y: -206, label: '진의 멸망 — 항우·유방의 봉기' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '진시황제의 사상 통제 정책 (분서갱유)',
        src: 'assets/w1/고대/동아시아/진/이미지 2026. 5. 28. 09.14 (1).png',
        citation: '— 『사기』 「진시황본기」 · 실용서(의약·농사)를 제외한 서적을 불태우고 비판하는 자를 처벌' },
      { kind: '탐구 자료', title: '시황제의 문자 통일',
        src: 'assets/w1/고대/동아시아/진/이미지 2026. 5. 28. 09.14 (2).png',
        citation: '— 교과서 탐구 자료 · 각국의 서로 다른 글자체를 소전체(진 전서체)로 통일' },
      { kind: '탐구 자료', title: '문자 통일 — 소전체(진 전서체)',
        src: 'assets/w1/고대/동아시아/진/이미지 2026. 5. 28. 09.15 (2).png',
        citation: '— 교과서 탐구 자료 · 여섯 나라의 글자를 진의 소전체로 통일' },
      { kind: '탐구 자료', title: '도량형 통일',
        src: 'assets/w1/고대/동아시아/진/이미지 2026. 5. 28. 09.15 (1).png',
        citation: '— 교과서 탐구 자료 · 무게를 다는 추와 양을 재는 용기의 규격 통일' },
      { kind: '탐구 자료', title: '화폐 통일 — 반량전',
        src: 'assets/w1/고대/동아시아/진/이미지 2026. 5. 28. 09.15.png',
        citation: '— 교과서 탐구 자료 · 각국의 도전·포전·의비전을 진의 반량전으로 통일' },
      { kind: '탐구 자료', title: '진시황제가 순행하며 세운 각석',
        src: 'assets/w1/고대/동아시아/진/이미지 2026. 5. 28. 09.23.png',
        citation: '— 낭야대 각석 · 순행을 통해 민심을 살피고 각지에 각석을 세워 황제의 권위를 과시' }
    ],
    map: { title: '진의 영역', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 40 60 L 280 50 L 320 140 L 280 200 L 100 200 L 50 130 Z', label: '진의 영역' }],
      pins: [
        { x: 130, y: 110, label: '함양',      sub: '진의 수도', amber: true },
        { x: 220, y:  80, label: '만리장성',   sub: '북방 방어선', amber: true },
        { x: 140, y: 130, label: '진 시황릉',  sub: '병마용 출토' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/동아시아/진/이미지 2026. 5. 28. 09.17 (1).png',
        caption: '만리장성',
        ref: '흉노의 침입을 막기 위해 전국 시대의 장성을 잇고 증축한 북방 방어선' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/진/이미지 2026. 5. 28. 09.17.png',
        caption: '진의 최대 영역과 주요 도로',
        ref: '교과서 자료 — 함양을 중심으로 뻗은 도로망과 만리장성·진의 영역' }
    ],
    linked: ['e-chunqiu-zhanguo', 'e-han-founded']
  },

  // ============================================================
  // 한(漢) (BCE 202~CE 220) — 황제 체제의 정착
  // ============================================================
  'e-han-founded': {
    syncRatio: 0.94,
    fileRef: 'W1 · 미래엔 세계사 1',
    notes: {
      sections: [
        {
          head: '一. 건국',
          list: [
            '한 고조(유방)의 중국 재통일, 장안에 도읍'
          ]
        },
        {
          head: '二. 고조 (BCE 202~195)',
          list: [
            '군국제 = 군현제 + 봉건제',
            '  · 수도 및 근처 권역 = 군현제, 그 외 지역 = 봉건제'
          ]
        },
        {
          head: '三. 무제 (BCE 141~87)',
          list: [
            '중앙 집권 체제 강화',
            '  · 군현제 전국 확대 시행',
            '동중서의 정책',
            '  · 향거리선제: 지방의 인재를 추천하여 관직에 등용',
            '  · 유교 관학화: 유교 통치 이념 및 화이관 확립',
            '  · 유교 진흥: 오경박사 설치, 태학 설립, 훈고학 발달',
            '대외 팽창',
            '  · 흉노 정벌: 대월지와의 동맹 → 장건 파견',
            '     → 사막길(비단길) 개척',
            '  · 남월(남비엣)과 고조선 정복',
            '경제 정책',
            '  · 소금·철 전매: 대외 확장에 따른 재정난 극복',
            '  · 균수법: 지방 특산물을 세금으로 징수',
            '      → 해당 물자 부족한 지방에 판매 = 유통 활성화',
            '  · 평준법: 물자가 풍부할 때 매입',
            '     → 가격 상승 시 시장에 판매',
            '     = 물가 안정 도모'
          ]
        },
        {
          head: '四. 쇠퇴와 멸망',
          list: [
            '신(新)',
            '  · 무제 사후 황제권 약화 → 외척 왕망의 왕위 찬탈 → 신 건국'
          ]
        },
        {
          head: '五. 역사서',
          list: [
            '사마천 『사기』',
            '  · 기전체: 본기(제왕)·세가(제후)·열전(인물)',
            '  · 전설 시대 ~ 한 무제'
          ]
        }
      ]
    },
    overview: {
      summary:
        '한(漢) — BCE 202 유방(고조)이 항우를 해하 전투에서 격파하고 건국, 장안에 도읍. 초기에는 진의 군현제와 주의 봉건제를 절충한 **군국제**를 시행하다가, 7국의 난(BCE 154) 진압 이후 군현제 중심으로 정비. 무제(BCE 141~87) 때 중앙집권을 강화하고 동중서의 건의로 **유교를 국교화**(BCE 136), 오경박사를 설치하여 이후 동아시아 한자 문화권의 사상적 기반을 마련. 흉노 정벌과 장건의 서역 파견(BCE 139)으로 비단길을 개통하고, 남월(BCE 111)·고조선(BCE 108)을 정벌하여 한반도와 베트남 북부까지 한자 문화권을 확장하였다. 8년 왕망의 신(新)으로 단절되었다가 25년 광무제가 후한을 재건, 낙양 도읍. 채륜의 종이 개량(105)으로 종이가 동아시아 전역에 보급. 환관·외척의 발호와 황건적의 난(184) 끝에 220년 조비의 위(魏)에 선양으로 멸망. **약 400년에 걸쳐 황제 체제·관료제·유교·한자·종이 등 동아시아 문명의 핵심 요소를 정착시킨 왕조**.',
      terms: [
        { label: '유방(고조)',  def: '한의 창건자. 군국제 시행.' },
        { label: '한 무제',     def: 'BCE 141~87. 한의 전성기. 중앙집권 강화, 유교 국교화, 흉노 정벌.' },
        { label: '유교 국교화', def: '동중서의 건의로 오경박사 설치, 유교가 국가 학문의 중심이 됨.' },
        { label: '비단길',      def: '장건의 서역 파견(BCE 139~)으로 개통된 동서 교역로.' },
        { label: '채륜의 종이', def: '105년 환관 채륜이 본격적인 제지법 개량. 이후 이슬람·유럽으로 전파.' },
        { label: '황건적의 난', def: '184년 도교 계열 종교 봉기. 후한 쇠퇴의 결정타.' }
      ],
      timeline: [
        { y: -202, label: '◆ 한 건국 — 유방 (대표 표기)' },
        { y: -141, label: '무제 즉위 — 한의 전성기' },
        { y: -136, label: '유교 국교화' },
        { y: -108, label: '고조선 멸망 → 한사군 설치' },
        { y:    8, label: '왕망의 신 — 한 일시 단절' },
        { y:   25, label: '후한 재건 — 광무제' },
        { y:  105, label: '채륜의 종이 개량' },
        { y:  220, label: '한 멸망 — 삼국 시대' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '한대의 대외 관계',
        src: 'assets/w1/고대/동아시아/전한/이미지 2026. 5. 28. 09.34.png',
        citation: '— 『사기』 「흉노 열전」 · 한 고조와 흉노의 전투, 무제의 대외 팽창(장건 파견·흉노 축출·정복)' },
      { kind: '탐구 자료', title: '한 무제의 통제 경제 정책',
        src: 'assets/w1/고대/동아시아/전한/이미지 2026. 5. 28. 09.35 (2).png',
        citation: '— 교과서 탐구 자료 · 전매제(소금·철·술)·균수법·평준법·화폐 관리' },
      { kind: '탐구 자료', title: '종이의 발명',
        src: 'assets/w1/고대/동아시아/전한/이미지 2026. 5. 28. 09.37 (1).png',
        citation: '— 금문·죽간·비단에서 종이로. 후한 채륜이 나무껍질·헌 옷 등 저렴한 원료로 종이를 개량' },
      { kind: '탐구 자료', title: '한의 역사가 사마천과 『사기』',
        src: 'assets/w1/고대/동아시아/전한/이미지 2026. 5. 28. 09.37.png',
        citation: '— 사마천이 신화 시대부터 무제 때까지를 다룬 기전체(본기·세가·열전·서·표) 역사서 『사기』' }
    ],
    map: { title: '한 제국의 영역과 비단길', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 40 60 L 300 50 L 340 140 L 300 200 L 100 200 L 50 130 Z', label: '한 제국' }],
      pins: [
        { x: 200, y: 130, label: '장안',       sub: '전한 수도', amber: true },
        { x: 230, y: 130, label: '낙양',       sub: '후한 수도', amber: true },
        { x: 110, y:  90, label: '비단길',     sub: '장건 개척' },
        { x: 260, y: 110, label: '낙랑',       sub: '한사군' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/동아시아/전한/미래엔_세계사_이미지_25쪽_한_무제.JPG',
        caption: '한 무제',
        ref: '미래엔 세계사 p.25 — 한 무제 초상' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/전한/이미지 2026. 5. 28. 09.35 (1).png',
        caption: '2세기경의 종이 조각',
        ref: '후한 채륜이 섬유질을 이용해 개량·정제한 종이. 저렴한 기록 매체의 보급' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/전한/이미지 2026. 5. 28. 09.35.png',
        caption: '군현제(위)와 군국제(아래)',
        ref: '군국제는 진의 군현제와 주의 봉건제를 절충 — 수도 주변은 군현제로 직접 통치, 나머지는 제후를 봉함' }
    ],
    linked: ['e-qin', 'e-han-gaozu', 'e-wudi', 'e-wang', 'e-later-han', 'e-han-end', 'e-3kingdoms', 'k-gojoseon']
  },

  // ============================================================
  // 후한(後漢) (CE 25~220) — 광무제의 한 재건·호족 연합 정권
  // ============================================================
  'e-later-han': {
    syncRatio: 0.88,
    fileRef: 'W1 · 미래엔 세계사 1',
    notes: {
      sections: [
        {
          head: '一. 건국 및 쇠퇴',
          list: [
            '광무제(유수)의 한 황실 재건 → 뤄양에 도읍(CE 25)',
            '외척·환관 세력 대두, 호족의 토지 겸병',
            '  → 백성 궁핍 및 불만',
            '황건적의 난(CE 184) 등의 농민 반란',
            '  → 위·촉·오 삼국 시대'
          ]
        },
        {
          head: '二. 역사서',
          list: [
            '반고 『한서』',
            '  · 기전체, 전한(前漢)의 역사'
          ]
        },
        {
          head: '三. 제지술',
          list: [
            '채륜의 개량으로 종이 보급 확대',
            '  → 학문과 사상의 발전 촉진'
          ]
        }
      ]
    },
    overview: {
      summary:
        '후한(後漢, 25~220) — 왕망의 신(新)이 무너진 혼란을 광무제(유수)가 수습하고 25년 한 황실을 재건한 왕조. 도읍을 장안에서 **뤄양(낙양)으로 옮겨** 전한(前漢)과 구분해 「후한」이라 부른다. 광무제는 노비 해방·조세 경감으로 민생을 안정시켰으나, 정권 자체가 **호족 연합**에 기반하여 호족의 대토지 소유(토지 겸병)는 갈수록 심화되었다. 대외적으로 **반초가 서역을 경영**하여 비단길을 재개통하고 감영을 대진(로마)에 파견했으며, 왜 노국왕에게 금인을 하사(57)하여 동아시아 책봉 체제를 확인했다. 문화적으로는 **채륜의 종이 개량**(105), 훈고학, 반고의 『한서』, 그리고 **불교의 중국 전래**가 이루어졌다. 후기에는 외척·환관의 발호(당고의 화)와 호족의 토지 겸병으로 자영농이 몰락하고, 태평도 계열의 **황건적의 난(184)**을 계기로 군웅이 할거하다가 220년 조비의 위(魏) 건국으로 멸망, 삼국 시대로 이어졌다.',
      terms: [
        { label: '광무제(유수)', def: '후한의 창건자. 25년 한 황실 재건, 뤄양 도읍.' },
        { label: '뤄양(낙양)',   def: '후한의 수도. 전한의 장안과 구분되는 동쪽 도읍.' },
        { label: '호족',         def: '대토지를 소유한 지방 유력 가문. 후한 정권의 기반이자 쇠퇴의 원인.' },
        { label: '반초',         def: '서역도호로서 50여 국을 복속, 비단길 재개통. 감영을 로마에 파견.' },
        { label: '한위노국왕 금인', def: '57년 후한 광무제가 왜 노국왕에게 하사한 금인. 동아시아 책봉 체제의 증거.' },
        { label: '채륜의 종이',   def: '105년 환관 채륜의 제지법 개량. 종이의 본격 보급.' },
        { label: '당고의 화',     def: '환관이 관료·사대부를 탄압한 사건. 후한 정치 혼란의 상징.' },
        { label: '황건적의 난',   def: '184년 태평도(장각)의 농민 봉기. 후한 붕괴와 삼국 시대의 도화선.' }
      ],
      timeline: [
        { y:  25, label: '◆ 후한 건국 — 광무제 (대표 표기)' },
        { y:  57, label: '왜 노국왕에 금인 하사' },
        { y:  73, label: '반초의 서역 경영 시작' },
        { y:  97, label: '감영을 대진(로마)에 파견' },
        { y: 105, label: '채륜의 종이 개량' },
        { y: 184, label: '황건적의 난' },
        { y: 220, label: '후한 멸망 — 조비의 위 건국, 삼국 시대' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '광무제의 한 재건', body: '신(新) 멸망의 혼란을 수습하고 25년 한 황실을 재건. 뤄양 도읍. 노비 해방·조세 경감으로 민생 안정. 호족 연합에 기반한 정권.', citation: '— W1 미래엔 세계사 1' },
      { kind: '교과서 요약', title: '반초의 서역 경영과 책봉', body: '반초가 서역도호로 50여 국을 복속하여 비단길 재개통, 감영을 대진(로마)에 파견. 왜 노국왕에게 금인 하사(57)로 동아시아 책봉 체제 확인.', citation: '— W1' },
      { kind: '교과서 요약', title: '쇠퇴와 멸망', body: '외척·환관의 권력 다툼(당고의 화)과 호족의 토지 겸병으로 자영농 몰락. 황건적의 난(184) → 군웅할거 → 220년 조비의 위 건국으로 멸망.', citation: '— W1' }
    ],
    map: { title: '후한의 영역과 비단길 재개통', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 40 60 L 300 50 L 340 140 L 300 200 L 100 200 L 50 130 Z', label: '후한' }],
      pins: [
        { x: 230, y: 120, label: '뤄양(낙양)', sub: '후한 수도', amber: true },
        { x: 110, y:  90, label: '서역',       sub: '반초 경영', amber: true },
        { x:  60, y:  80, label: '대진(로마)',  sub: '감영 파견' },
        { x: 300, y: 110, label: '왜 노국',     sub: '금인 하사(57)' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '「한위노국왕」 금인', ref: '후한 광무제가 왜 노국왕에게 하사(57). 동아시아 책봉 체제의 유물.' },
      { slot: 'square', caption: '채륜과 제지술',       ref: '105년 채륜의 종이 개량. 학문·기록의 비약적 발전.' }
    ],
    linked: ['e-han-founded', 'e-wang', 'e-han-end', 'e-3kingdoms', 'e-yayoi']
  },

  // ============================================================
  // 동진(東晉) (CE 317~420) — 강남 한족 정권·강남 개발의 시작
  // ============================================================
  'e-dongjin': {
    syncRatio: 0.86,
    fileRef: 'W1 · 미래엔 세계사 1 / DA · 동아시아 역사 기행 III단원',
    notes: {
      sections: [
        {
          head: '一. 수도 건강',
          list: []
        },
        {
          head: '二. 창장강 이남 지역(강남) 진출',
          list: []
        }
      ]
    },
    overview: {
      summary:
        '동진(東晉, 317~420) — 서진의 영가의 난(316)으로 화북을 잃은 후, 사마예가 강남 건강(建康, 현 난징)으로 피난하여 즉위(317). 한족 사대부와 강남 호족의 연합으로 성립한 강남 정권. **한족의 강남 대규모 이주**(영가의 난을 피한 사대부·농민)와 함께 양쯔강 유역의 농경·문화가 본격적으로 발전. 「의관남도(衣冠南渡)」로 표현되는 이 이주는 강남이 새로운 농경·문화 중심지로 부상하는 결정적 계기. 청담(淸談) 사상과 노장 철학이 융성하고, 도연명의 「귀거래사」·「도화원기」, 왕희지의 「난정서」 서예, 고개지의 그림 등 한족 문화의 정수가 꽃피었다. 화북의 5호 16국과 대립하면서 비수의 전투(383)에서 전진(前秦)을 격파하여 강남을 지킴. 420년 무장 유유(劉裕)가 동진을 폐하고 송(宋)을 세우면서 남북조 시대로 이행.',
      terms: [
        { label: '사마예',     def: '동진의 창건자(원제). 서진 황실 종친.' },
        { label: '건강(建康)',  def: '동진의 수도. 현 난징. 후일 남조 송·제·양·진의 수도도 됨.' },
        { label: '의관남도',    def: '사대부 계층의 강남 대거 이주. 강남 개발의 시작.' },
        { label: '비수의 전투', def: '383년 동진군이 전진(前秦)의 부견을 격파. 강남 한족 정권 수호의 결정적 전투.' },
        { label: '청담',       def: '죽림칠현·왕희지 등이 추구한 노장 사상 기반의 철학적 대화.' },
        { label: '도연명',     def: '동진의 시인. 「귀거래사」·「도화원기」.' }
      ],
      timeline: [
        { y: 316, label: '서진 멸망 — 영가의 난' },
        { y: 317, label: '◆ 동진 건국 — 사마예 (대표 표기)' },
        { y: 383, label: '비수의 전투 — 동진 승리' },
        { y: 420, label: '동진 멸망 — 유유의 송(宋) 건국, 남북조 시대' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '동진의 성립과 강남 개발', body: '서진 영가의 난 후 사마예가 건강에서 동진 건국. 한족의 강남 대이주로 양쯔강 유역 농경·문화 본격 발전.', citation: '— W1' },
      { kind: '교과서 요약', title: '비수의 전투와 한족 문화', body: '383년 비수의 전투에서 전진을 격파, 강남을 지킴. 청담 사상, 도연명·왕희지·고개지의 한족 문화 융성.', citation: '— W1' }
    ],
    map: { title: '동진 — 강남 한족 정권', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 40 60 L 280 50 L 320 140 L 280 200 L 100 200 L 50 130 Z', label: '중국' }],
      pins: [
        { x: 175, y: 100, label: '5호 16국', sub: '화북', amber: true },
        { x: 200, y: 180, label: '건강(난징)', sub: '동진 수도', amber: true },
        { x: 165, y: 140, label: '비수',     sub: '383년 전투' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/동아시아/동진/이미지 2026. 5. 28. 14.31 (1).png',
        caption: '고개지, 「여사잠도」',
        ref: '교과서 자료 — 동진 고개지(顧愷之)의 「여사잠도(女史箴圖)」' }
    ],
    linked: ['e-jin', 'e-wuhu', 'e-beiwei', 'e-wei-jin-nbc']
  },

  // ============================================================
  // 수(隋) (CE 589~618) — 약 370년 분열을 종식
  // ============================================================

  // ============================================================
  // 야요이 시대 (BCE 300~CE 300) — 일본 농경 사회의 시작
  // ============================================================
  'e-yayoi': {
    syncRatio: 0.88, fileRef: 'WN · 세계사 연표(정리 탭) p.45 / DA · 동아시아 역사 기행',
    notes: {
      sections: [
        {
          head: '청동기·철기 문화',
          list: [
            '대륙과 한반도에서 벼농사 및 금속기 전파',
            '여러 소국 성립 → CE 3세기경 30여 개 소국 연합체 형성'
          ]
        },
        {
          head: '야마타이국 · 히미코 (CE 3세기)',
          list: [
            '30여 소국을 거느린 연맹체',
            '여왕 히미코(卑彌呼)의 무격(샤먼) 정치',
            '239년 위(魏)에 사신 — 「친위왜왕(親魏倭王)」 칭호와 금인·동경 100매 받음',
            '동아시아 책봉·조공 체제에 일본이 처음 편입',
            '위치는 규슈설·기내설로 학설 갈림'
          ]
        }
      ]
    },
    overview: {
      summary: '야요이 시대(弥生時代, BCE 3세기 ~ CE 3세기) — BCE 3세기경 한반도에서 일본 열도(규슈 북부)로 벼농사·청동기·철기가 전해지면서 시작된 농경 사회. 야요이 토기·청동검·동탁(銅鐸) 사용. 농경 정착으로 마을이 늘어나며 소국(小國) 분립. 후한서·위지왜인전에는 30여 소국이 있었다고 기록. CE 3세기에는 여왕 **히미코의 야마타이국(邪馬台国)**이 30여 소국을 거느린 연맹체로 성장 — 239년 위(魏)에 사신을 보내 「친위왜왕」 칭호와 금인·동경 100매를 받으며 동아시아 책봉·조공 체제에 편입.',
      terms: [
        { label: '야요이 토기', def: '도쿄 야요이 마을에서 처음 발굴된 시대 표지 토기. 적갈색 단순한 문양.' },
        { label: '벼농사 전래', def: '한반도 남부를 거쳐 규슈 북부에 전해진 본격 벼농사.' },
        { label: '청동기·철기', def: '한반도에서 함께 전해진 금속 도구. 청동검·동탁은 의식용.' },
        { label: '소국 분립',    def: '농경 마을이 결합해 100여 소국 형성. 야마타이국의 모태.' },
        { label: '야마타이국',    def: 'CE 3세기 일본 열도의 30여 소국 연맹체. 여왕 히미코가 무격 정치로 통치.' },
        { label: '히미코',        def: '야마타이국의 여왕. 239년 위에 사신을 보내 친위왜왕 책봉.' },
        { label: '친위왜왕',      def: '239년 위가 히미코에게 내린 칭호. 동아시아 책봉 체제의 일본 편입.' },
        { label: '위지왜인전',     def: '『삼국지』 위서 동이전 왜인조. 3세기 일본의 모습을 전하는 1차 사료.' }
      ],
      timeline: [
        { y: -8050, yl: '약 1만 년 전 ~', label: '조몬 시대 (이전 단계)' },
        { y: -300,  yl: '3세기 BCE경', label: '◆ 야요이 시대 시작 (대표 표기)' },
        { y:  57,   label: '왜 노국왕, 후한에 사신 — 광무제로부터 금인 받음' },
        { y:  239,  label: '히미코 위에 사신 — 친위왜왕 책봉' },
        { y:  248,  label: '히미코 사망 (전승)' },
        { y:  300,  yl: '3세기 CE 말', label: '고분 시대로 이행' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '야요이의 농경 사회', body: '한반도로부터 벼농사·청동기·철기가 전해짐. 농경 정착과 소국 분립이 시작.', citation: '— W1, BS' },
      { kind: '교과서 요약', title: '야마타이국·히미코', body: 'CE 3세기 30여 소국을 거느린 야마타이국. 여왕 히미코가 239년 위에 사신을 보내 친위왜왕 칭호를 받음 — 동아시아 책봉 체제의 일본 편입.', citation: '— 위지왜인전, W1' }
    ],
    map: { title: '야요이 — 규슈 북부에서 일본 열도 전역으로', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 60 60 L 280 50 L 320 130 L 280 200 L 100 200 L 50 130 Z', label: '일본 열도' }],
      pins: [
        { x: 120, y: 150, label: '규슈 북부', sub: '벼농사 전래', amber: true },
        { x: 180, y: 120, label: '긴키',     sub: '농경 확산' },
        { x: 145, y: 135, label: '야마타이국', sub: '히미코의 연맹체' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/동아시아/야요이 시대/야요이 동탁.jpg',
        caption: '야요이 동탁(銅鐸)',
        ref: '야요이 시대의 의식용 청동기. 종 모양으로 농경 의례에 사용.' }
    ],
    linked: ['e-jomon', 'e-yamato', 'k-bronze']
  },

  // ============================================================
  // 야마토(大和) 정권 (4세기~) — 일본 최초의 통일 정권
  // ============================================================
  'e-yamato': {
    syncRatio: 0.89, fileRef: 'WN · 세계사 연표(정리 탭) p.5 / DA · 동아시아 역사 기행',
    notes: {
      sections: [
        {
          head: '一. 고분 시대 (3세기 말 ~ 7세기 초)',
          list: [
            '일본 열도 각지에 거대한 전방후원분(前方後圓墳) 축조',
            '지배자들의 거대 무덤 → 권력 과시',
            '한반도(백제·가야)·중국으로부터 도래인(渡來人) 유입',
            '   → 철기·도자기·한자·유교·불교 등 선진 문물 전래'
          ]
        },
        {
          head: '二. 성립',
          list: [
            '야마토 지방 소국의 연합 정권 (4세기경)',
            '긴키(畿內) 지방 중심으로 호족 연합 체제',
            '5세기에 큐슈 북부에서 간토 지방까지 세력 확장'
          ]
        },
        {
          head: '三. 동아시아 책봉 체제 편입',
          list: [
            '5세기 「왜 5왕」(찬·진·제·흥·무)',
            '중국 남조 송·제에 사신 파견 → 책봉 받음',
            '한반도와의 외교적 위세를 황제로부터 인정받으려 함'
          ]
        },
        {
          head: '四. 특징',
          list: [
            '다이센 고분 — 세계 최대급의 전방후원분',
            '오키미(大王) → 후일 천황(天皇)으로 발전',
            '천황가의 기원'
          ]
        }
      ]
    },
    overview: {
      summary: '야마토(大和) 정권 — 3세기 말부터 일본 열도에 거대한 전방후원분(前方後圓墳)이 축조된 고분 시대를 거치면서 형성된 일본 최초의 통일 정권. 4세기경 긴키(畿內)의 야마토 지방을 중심으로 호족 연합 체제로 출발하여 5세기에 규슈 북부에서 간토 지방까지 세력을 넓혔다. **5세기 「왜 5왕」**(찬·진·제·흥·무)이 중국 남조 송·제에 사신을 보내 책봉을 받으며 동아시아 책봉 체제에 적극 편입. 한반도(특히 백제·가야)로부터 **도래인(渡來人)**을 통해 철기·도자기·한자·유교·불교 등 선진 문물이 활발히 전래. 다이센 고분은 세계 최대급의 무덤으로 오키미(大王, 후일 천황)의 권위를 보여준다.',
      terms: [
        { label: '고분 시대',       def: '3세기 말~7세기 초. 일본 열도에 거대한 전방후원분이 축조된 시기.' },
        { label: '전방후원분',     def: '앞은 사각, 뒤는 둥근 형태의 거대 무덤. 야마토의 세력 확장의 지표.' },
        { label: '다이센 고분',     def: '오사카 사카이의 닌토쿠 천황릉으로 전해지는 세계 최대급 전방후원분.' },
        { label: '야마토',         def: '나라 분지를 중심으로 한 긴키 지방의 지역 이름. 정권의 명칭이 됨.' },
        { label: '오키미(大王)',    def: '야마토 정권의 군주 칭호. 후일 천황(天皇)으로 발전.' },
        { label: '왜 5왕',         def: '5세기 왜의 5명 왕(찬·진·제·흥·무)이 남조 송·제에 사신을 보낸 사실. 『송서』 왜국전.' },
        { label: '도래인',         def: '한반도·중국에서 일본으로 건너간 이주민. 선진 문물 전파.' },
        { label: '백제 교류',       def: '백제로부터 한자·유교·불교·역법·기술 전수. 칠지도(七支刀) 등이 유물.' }
      ],
      timeline: [
        { y: 300, yl: '3세기 CE 말', label: '고분 시대 시작 — 전방후원분 축조' },
        { y: 350, yl: '4세기 CE경', label: '◆ 야마토 정권 성립 — 소국 통합 (대표 표기)' },
        { y: 421, label: '왜왕 찬(讚), 송에 사신 — 왜 5왕의 시작' },
        { y: 538, label: '백제로부터 불교 전래 — 아스카 시대로 이행' },
        { y: 593, label: '쇼토쿠 태자 섭정' },
        { y: 645, label: '다이카 개신 → 율령 체제로 이행' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '야마토의 통합과 한반도 교류', body: '호족 연합으로 출발해 5세기 일본 전역으로 세력 확대. 한반도(백제·가야)와 활발한 교류로 한자·유교·불교 수용. 도래인을 통해 선진 문물 전래.', citation: '— W1' },
      { kind: '교과서 요약', title: '왜 5왕의 책봉', body: '5세기 왜의 5명 왕(찬·진·제·흥·무)이 중국 남조 송·제에 사신을 보내 책봉을 받음. 동아시아 책봉 체제에 적극 편입.', citation: '— 『송서』 왜국전' }
    ],
    map: { title: '야마토 정권의 영역', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 60 60 L 280 50 L 320 130 L 280 200 L 100 200 L 50 130 Z', label: '일본 열도' }],
      pins: [
        { x: 175, y: 120, label: '야마토 (나라)', sub: '정권 본거지', amber: true },
        { x: 165, y: 130, label: '다이센 고분',    sub: '세계 최대급 전방후원분', amber: true },
        { x: 130, y: 150, label: '규슈 북부',     sub: '한반도와의 교역항' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/동아시아/야마토 정권/이미지 2026. 6. 1. 13.30.png',
        caption: '일본 고대 국가의 발전',
        ref: '야마타이국·야마토 정권에서 아스카·나라·헤이안에 이르는 일본 고대 국가의 전개' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/야마토 정권/전방후원분.png',
        caption: '전방후원분(前方後圓墳)',
        ref: '앞은 사각, 뒤는 둥근 형태의 일본 특유 거대 무덤. 야마토 권력의 상징.' }
    ],
    linked: ['e-yayoi', 'e-asuka', 'k-baekje', 'k-gaya']
  },


  // ============================================================
  // 폴리스(πόλις) 성립 (BCE 10세기 무렵) — 그리스 도시 국가의 등장
  // ============================================================
  'w-polis': {
    syncRatio: 0.91, fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    notes: {
      sections: [
        {
          head: 'I. 형성',
          list: [
            '산지가 많고 복잡한 해안선 → 통일 국가 형성 X',
            '미케네 문명 붕괴 후 암흑기의 혼란 및 무질서 → 도시 국가(폴리스) 형성',
            'BCE 10세기 무렵부터 그리스 각지에 1,000여 개의 폴리스 분립'
          ]
        },
        {
          head: 'II. 구조',
          list: [
            '아크로폴리스 — 폴리스 중심의 언덕, 종교 및 군사 거점, 신전 건축 (예: 아테네 파르테논)',
            '아고라 — 광장, 시민 집회 및 상거래 장소, 정치·사회적 소통의 공간'
          ]
        },
        {
          head: 'III. 헬레네스 — 그리스 동족 의식',
          list: [
            '자신들을 헬레네스(Hellenes), 다른 민족을 바르바로이(Barbaroi)로 칭함',
            '언어(그리스어) 및 종교(올림포스 12신)의 공유',
            '올림피아 제전(BCE 776년 시작, 4년마다 개최)을 통한 일체감 확인',
            '호메로스 서사시 『일리아스』·『오디세이아』 정착',
            '페니키아 알파벳을 수용·개량하여 그리스 문자 정립'
          ]
        }
      ]
    },
    overview: {
      summary: '폴리스 — 산지가 많고 해안선이 복잡한 그리스는 오랫동안 통일 국가를 이루지 못하고, 암흑기의 혼란을 거쳐 해안 가까운 평야에 촌락을 이루고 살았다. 촌락들이 방어를 위해 높은 언덕에 성벽·요새를 쌓으면서 도시 국가인 폴리스로 발전하여, BCE 10세기 무렵부터 아테네·스파르타 등 1,000여 개의 폴리스가 각지에 분립하였다. 폴리스의 중심에는 종교·군사의 거점이자 신전이 선 아크로폴리스(언덕 위의 성채)가, 그 아래에는 시민이 모여 집회와 상거래를 하는 아고라(광장)가 있었다. 각 폴리스는 정치적으로 독립해 서로 다른 체제(아테네 민주정·스파르타 군국주의)를 이루었으나, 같은 언어(그리스어)와 종교(올림포스 12신)를 공유하며 자신들을 헬레네스, 다른 민족을 바르바로이라 부르는 동족 의식을 가졌다. 특히 4년마다 열린 올림피아 제전(BCE 776~)으로 결속을 다졌으며, 이는 오늘날 올림픽의 기원이 되었다.',
      terms: [
        { label: '폴리스(πόλις)', def: '아크로폴리스와 아고라를 중심으로 한 그리스의 도시 국가. 정치·종교·경제의 단위.' },
        { label: '그리스의 지형', def: '산지가 많고 해안선이 복잡 → 통일 국가를 이루지 못하고 폴리스가 각지에 독립적으로 분립.' },
        { label: '아크로폴리스', def: '폴리스 중심 언덕 위의 성채. 종교·군사의 거점이자 신전이 자리(예: 아테네 파르테논).' },
        { label: '아고라',       def: '폴리스의 광장. 시민 집회·상거래·정치의 중심.' },
        { label: '헬레네스 · 바르바로이', def: '그리스인은 자신들을 헬레네스로, 다른 민족을 바르바로이(알 수 없는 말을 쓰는 사람)로 칭하며 동족 의식을 가졌다.' },
        { label: '올림피아 제전', def: 'BCE 776년부터 4년마다 열린 범그리스 축제. 언어·종교와 함께 결속을 다짐 — 오늘날 올림픽의 기원.' }
      ],
      timeline: [
        { y: -1000, yl: '10세기 BCE 무렵', label: '◆ 폴리스 성립 (대표 표기)' },
        { y: -776, label: '제1회 올림피아 제전' },
        { y: -594, label: '솔론의 개혁 (아테네)' },
        { y: -508, label: '클레이스테네스의 민주 개혁' },
        { y: -490, label: '마라톤 전투' },
        { y: -461, label: '페리클레스 시대 — 아테네 민주정 황금기' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '폴리스의 성립과 구조', ph: true,
        citation: '— 교과서 탐구 자료 미배치' },
      { kind: '탐구 자료', title: '폴리스의 동질감', ph: true,
        citation: '— 교과서 탐구 자료 미배치' }
    ],
    map: { title: '그리스 폴리스의 분포', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 80 60 L 280 60 L 300 130 L 280 200 L 80 200 L 60 130 Z', label: '그리스' }],
      pins: [
        { x: 160, y: 100, label: '아테네',     sub: '아티카', amber: true },
        { x: 140, y: 150, label: '스파르타',   sub: '펠로폰네소스', amber: true },
        { x: 150, y: 110, label: '코린토스',   sub: '지협' },
        { x: 170, y: 110, label: '테베',       sub: '보이오티아' },
        { x: 120, y: 130, label: '올림피아',   sub: '제전' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/폴리스 성립/미래엔_세계사_이미지_44쪽_폴리스의_구조.jpg',
        caption: '폴리스의 구조',
        ref: '미래엔 세계사 1, p.44 — 언덕 위의 아크로폴리스(신전) · 중심의 아고라(광장) · 성벽과 주변 농경지' }
    ],
    linked: ['w-aegean', 'w-rome-found', 's-phoenicia']
  },

  // ============================================================
  // 아시리아 제국 (BCE 722~612) — 오리엔트 최초의 통일 제국
  // ============================================================
  's-assyria': {
    syncRatio: 0.88, fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    notes: {
      sections: [
        {
          head: '一. 특징',
          list: [
            '서아시아 지역 통일 (BCE 7세기)',
            '철제 무기와 기마병',
            '중앙집권 강화',
            '  · 정복지 총독 파견',
            '  · 군용 도로·교역로 정비',
            '수도 니네베',
            '  · 왕립 도서관 설립',
            '피지배 민족 강압적 통치',
            '  → 각지 반발로 멸망'
          ]
        }
      ]
    },
    overview: {
      summary: '아시리아 — 기원전 20세기경 티그리스강 상류의 작은 도시 국가에서 출발하여 메소포타미아 지역을 중심으로 발전한 셈족 제국. 기원전 7세기 무렵 뛰어난 철제 무기와 기마병(기병)을 앞세워 서아시아 세계의 상당 부분을 통일하고, 한때 이집트 지역까지 지배하여 오리엔트 최초의 통일 제국을 이루었다. 사르곤 2세(BCE 722)가 이스라엘을 멸하며 본격적인 정복에 나섰고, 아슈르바니팔 시대(BCE 668~627)에 전성기를 맞아 수도 니네베의 왕립 도서관에 수만 점의 점토판을 모았다(『길가메시 서사시』가 이곳에서 발견). 넓은 영토를 다스리기 위해 정복지에 총독을 파견하고 군용 도로와 교역로를 정비하는 등 중앙 집권을 강화하였으나, 정복지 주민에 대해 약탈적이고 가혹한 통치 정책을 취한 것이 피정복민의 적개심을 높이고 반란을 불러일으키는 요인으로 작용하였다. 결국 계속되는 반란 속에 신바빌로니아·메디아 연합군에게 니네베가 함락되어 멸망하였다(BCE 612). 아시리아의 멸망 이후 정치적으로 분열된 서아시아 세계는 뒷날 아케메네스 왕조 페르시아에 의해 다시 통일되었다.',
      terms: [
        { label: '기원과 성립',     def: '기원전 20세기경 티그리스강 상류의 작은 도시 국가에서 출발 → 메소포타미아 지역을 중심으로 발전.' },
        { label: '철제 무기 · 기마병', def: '기원전 7세기 무렵 뛰어난 철제 무기와 기병을 앞세워 서아시아 세계의 상당 부분을 통일.' },
        { label: '이집트 지배',      def: '한때 이집트 지역까지 지배 → 오리엔트 최초의 통일 제국을 이룸.' },
        { label: '사르곤 2세',      def: 'BCE 722 이스라엘을 멸하고 본격적 정복 활동을 펼친 군주.' },
        { label: '아슈르바니팔 · 니네베', def: 'BCE 668~627 전성기 군주. 수도 니네베의 왕립 도서관에 수만 점의 점토판을 수집(『길가메시 서사시』 발견).' },
        { label: '중앙 집권 정비',   def: '정복지에 총독 파견, 군용 도로와 교역로 정비.' },
        { label: '약탈적·가혹한 통치', def: '정복지 주민에 대한 약탈적 태도와 가혹한 통치 정책 → 피정복민의 적개심을 높이고 반란을 불러일으킨 멸망의 원인.' },
        { label: '멸망과 그 이후',   def: '계속된 반란 속에 신바빌로니아·메디아 연합군에게 멸망(BCE 612). 분열된 서아시아는 아케메네스 왕조 페르시아가 재통일.' }
      ],
      timeline: [
        { y: -2000, label: '기원전 20세기경 아시리아 성립 — 티그리스강 상류의 도시 국가' },
        { y: -722, label: '사르곤 2세 — 이스라엘 정복' },
        { y: -700, yl: '7세기 BCE경', label: '◆ 오리엔트 세계 통일 (대표 표기)' },
        { y: -671, label: '이집트 정복 — 한때 이집트 지역까지 지배' },
        { y: -668, label: '아슈르바니팔 즉위 — 전성기 · 니네베 왕립 도서관' },
        { y: -612, label: '니네베 함락 — 아시리아 멸망(신바빌로니아·메디아 연합)' },
        { y: -550, label: '분열된 서아시아 → 아케메네스 왕조 페르시아가 재통일' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '아시리아의 통일과 통치', body: '기마군단·철제 무기·전차로 오리엔트 최초의 통일 제국 완성. 가혹한 정복과 공포 통치.', citation: '— W1, BS' },
      { kind: '교과서 요약', title: '아슈르바니팔 도서관', body: '니네베 왕궁에 수만 점의 점토판 보관. 『길가메시 서사시』가 이곳에서 발견됨.', citation: '— W1' }
    ],
    map: { title: '아시리아 제국의 영역', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 60 60 L 300 50 L 320 130 L 290 200 L 100 200 L 50 130 Z', label: '오리엔트' }],
      pins: [
        { x: 200, y: 110, label: '니네베', sub: '수도', amber: true },
        { x: 195, y: 105, label: '아슈르', sub: '구 수도' },
        { x: 240, y: 140, label: '바빌론', sub: '정복지' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '아시리아 부조 — 사자 사냥', ref: 'W1' },
      { slot: 'wide',   caption: '아슈르바니팔 도서관 점토판', ref: 'W1' }
    ],
    linked: ['s-mesopotamia', 's-hebrew', 's-persia']
  },

  // ============================================================
  // 아케메네스 왕조 페르시아 (BCE 550~330) — 관용의 대제국
  // ============================================================
  's-persia': {
    syncRatio: 0.92, fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    notes: {
      sections: [
        {
          head: '一. 키루스 2세 (재위 BCE 559~530)',
          list: [
            '주변 국가들 정복 → 대제국의 기틀 마련',
            '타민족의 문화와 종교 존중 → 포용 정책을 통한 제국 성장',
            '이집트를 최종적으로 차지하며 서아시아 세계 통일 (BCE 525)'
          ]
        },
        {
          head: '二. 다리우스 1세 (BCE 522~486)',
          list: [
            '정복 전쟁',
            '  · 그리스 식민지 정복, 인도 북부~불가리아에 이르는 영토 확보 → 전성기',
            '통치',
            '  · 20여 개의 속주에 총독 파견',
            '  · 왕의 눈, 왕의 귀: 감찰 관리 파견하여 총독 감시',
            '  · 왕의 길: 세금과 공물의 효율적 유통을 위한 도로 건설',
            '  · 역참제 정비, 화폐 및 도량형 통일, 운하 건설(지중해~홍해)'
          ]
        },
        {
          head: '三. 쇠퇴',
          list: [
            '페르시아 전쟁 패배 → 중앙 세력 약화 및 총독들의 반란, 지배층 분열',
            'BCE 330 알렉산드로스에게 멸망'
          ]
        },
        {
          head: '四. 조로아스터교',
          list: [
            'BCE 6세기경 예언자 조로아스터에 의해 창조주 아후라 마즈다 숭배',
            '영토 확장을 신의 이름으로 정당화',
            '이원론적 세계관, 부활과 최후의 심판',
            '  → 유대교·크리스트교·이슬람교·대승 불교에 영향'
          ]
        },
        {
          head: '五. 문화',
          list: [
            '피정복민에 대한 포용 정책 → 문화·종교·언어 등 흡수',
            '  → 페르시아 문화의 세계적 확산'
          ]
        }
      ]
    },
    overview: {
      summary: '아케메네스 왕조 페르시아 — 뛰어난 철제 무기와 기마병으로 서아시아를 통일했던 아시리아가 가혹한 통치로 피정복민의 반란을 사 멸망한 뒤, 정치적으로 분열된 서아시아 세계를 다시 통일한 제국. 기원전 6세기경 키루스 2세가 메디아·리디아·신바빌로니아를 무너뜨리고 건국하였고, 캄비세스 2세가 이집트를 차지하며 오리엔트를 재통일하였다. 전성기를 이룬 다리우스 1세(BCE 522~486)는 이집트와 지중해 연안에서부터 인더스강에 이르는 대제국을 건설하고, 넓은 영토를 효율적으로 통치하고자 전국을 20여 개 주로 나누어 총독(사트라프)을 파견하는 한편 「왕의 눈」·「왕의 귀」라 불린 감찰관을 보내 총독을 감시·감독하였다. 또한 수도 수사와 서쪽 사르디스를 잇는 약 2,400~2,700km의 「왕의 길」이라는 도로망을 건설하고 곳곳에 역참을 설치하였으며, 화폐와 도량형 제도를 정비하여 중앙 집권 체제를 강화하였다. 헤로도토스에 따르면 상인이 3개월 걸리는 길을 왕의 사자는 왕의 길을 이용해 1주일 만에 이동하였다고 하니, 왕의 명령이 지방까지 빠르게 전달되어 중앙 집권에 도움이 되었고 상업 도로로도 쓰여 교역 발달에 기여하였다. 페르시아는 피정복민에게 공납(세금)을 거두는 대신 그들의 고유한 전통·문화·신앙을 존중하는 관용 정책으로 제국을 통치하여 세력을 더욱 확장하고 약 200년 동안 번영을 누렸다. 그러나 아테네 등 그리스 세계와 벌인 전쟁에서 패배하고 지방 총독들이 반란을 일으키면서 점차 쇠약해지다가, 기원전 4세기 말(BCE 330) 알렉산드로스의 침공을 받아 멸망하였다. 이후 페르시아의 전통은 파르티아와 사산 왕조 페르시아로 계승되었다.',
      terms: [
        { label: '아시리아 멸망 → 재통일', def: '아시리아는 정복지 주민에게 가혹한 통치 정책을 펴 반란을 자초하고 멸망 → 분열된 서아시아 세계를 아케메네스 왕조 페르시아가 다시 통일.' },
        { label: '키루스 2세',     def: '아케메네스 왕조의 창건자(기원전 6세기경). 메디아·리디아·신바빌로니아 정복. 바빌론 유수의 유대인 해방.' },
        { label: '다리우스 1세',    def: '전성기 군주. 이집트·지중해 연안에서 인더스강에 이르는 대제국 건설. 페르세폴리스 건설.' },
        { label: '총독(사트라프)',  def: '전국을 20여 개 주로 나누어 파견한 지방 총독. 광대한 영토의 효율적 통치를 위한 제도.' },
        { label: '왕의 눈 · 왕의 귀', def: '왕이 보낸 감찰관. 지방 총독을 감시·감독하여 중앙의 통제력을 유지.' },
        { label: '왕의 길',         def: '수도 수사~서쪽 사르디스를 잇는 약 2,400~2,700km 도로망. 곳곳에 역참 설치 → 상인은 3개월, 왕의 사자는 1주일(헤로도토스). 왕명의 신속한 전달로 중앙 집권 강화 + 상업 도로로 교역 발달에 기여.' },
        { label: '화폐 · 도량형 정비', def: '화폐와 도량형 제도를 통일하여 중앙 집권 체제를 강화.' },
        { label: '관용 정책',       def: '피정복민에게 공납(세금)을 거두는 대신 그들의 전통·문화·신앙을 존중 → 세력 확장, 약 200년간 번영.' },
        { label: '쇠퇴와 멸망',     def: '아테네 등 그리스 세계와의 전쟁에서 패배 + 지방 총독들의 반란 → 쇠약. 기원전 4세기 말(BCE 330) 알렉산드로스의 침공으로 멸망.' },
        { label: '조로아스터교',    def: '아후라 마즈다를 최고신으로 하는 이원론적 종교. 다리우스 1세 등의 후원으로 확산, 뒷날 사산 왕조의 국교.' }
      ],
      timeline: [
        { y: -550, label: '◆ 키루스 2세 건국 — 기원전 6세기경 (대표 표기)' },
        { y: -525, label: '캄비세스 2세 이집트 정복 — 오리엔트 재통일' },
        { y: -522, label: '다리우스 1세 즉위 — 전성기(인더스강~지중해)' },
        { y: -518, label: '20여 개 주 총독 파견 · 왕의 길 · 화폐/도량형 정비' },
        { y: -490, label: '마라톤 전투 패배' },
        { y: -480, label: '살라미스 해전 패배' },
        { y: -330, label: '알렉산드로스의 침공으로 멸망' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '아케메네스 왕조 페르시아의 팽창',
        src: 'assets/w1/고대/서아시아·인도/아케메네스 왕조 페르시아/아케메네스 왕조 페르시아의 팽창.png',
        citation: '— 교과서 탐구 자료 · 키루스 2세·다리우스 1세 시기의 정복과 영토 확장' }
    ],
    map: { title: '아케메네스 페르시아의 영역', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 40 60 L 320 50 L 340 140 L 300 200 L 80 200 L 30 130 Z', label: '아케메네스 제국' }],
      pins: [
        { x: 230, y: 130, label: '페르세폴리스', sub: '수도', amber: true },
        { x: 200, y: 110, label: '수사',         sub: '행정 수도' },
        { x: 240, y: 100, label: '엑바타나',     sub: '여름 수도' },
        { x: 130, y:  90, label: '사르디스',     sub: '왕의 길 서쪽 종점' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/아케메네스 왕조 페르시아/아시리아와 아케메네스 왕조 페르시아의 영역.png',
        caption: '아시리아와 아케메네스 왕조 페르시아의 영역',
        ref: '비상교육 세계사 — 아시리아와 아케메네스 왕조 페르시아의 영역 비교 지도' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/아케메네스 왕조 페르시아/[비상교육] 고등_세계사_1-3_41p_아케메네스 왕조 페르시아 시기의 마차.jpg',
        caption: '아케메네스 왕조 페르시아 시기의 마차',
        ref: '영국 대영 박물관 — 페르시아 주의 총독과 전령은 이와 비슷하게 생긴 전차를 타고 「왕의 길」을 이용하여 빠르게 이동할 수 있었다' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/아케메네스 왕조 페르시아/그리스와 이집트 양식이 혼합된 돌기둥.png',
        caption: '그리스와 이집트 양식이 혼합된 돌기둥',
        ref: '교과서 자료 · 아케메네스의 문화 융합(관용 정책)' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/아케메네스 왕조 페르시아/아시리아 양식으로 새겨진 인면수신상.jpg',
        caption: '아시리아 양식으로 새겨진 인면수신상',
        ref: '교과서 자료 · 피정복지 문화의 수용' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/아케메네스 왕조 페르시아/파라오로 묘사된 다리우스 1세의 모습.png',
        caption: '파라오로 묘사된 다리우스 1세',
        ref: '교과서 자료 · 이집트 통치와 관용 정책' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/아케메네스 왕조 페르시아/조로아스터교 사원 입구에 새겨진 아후라 마즈다.png',
        caption: '조로아스터교 — 아후라 마즈다',
        ref: '교과서 자료 · 조로아스터교 사원 입구의 아후라 마즈다' }
    ],
    linked: ['s-assyria', 's-mesopotamia', 's-parthia', 's-sasan', 'w-polis']
  },

  // ============================================================
  // 파르티아 (BCE 247~CE 224) — 동서 무역의 중계자
  // ============================================================
  's-parthia': {
    syncRatio: 0.86, fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    notes: {
      sections: [
        {
          head: '一. 건국',
          list: [
            '이란계 기마 유목민이 건국',
            '중국에서 안식국(安息國)으로 불림'
          ]
        },
        {
          head: '二. 동서 무역로 장악',
          list: [
            '로마 — 인도(쿠샨) — 중국(한)을 잇는 교역로 장악',
            '중계무역으로 번영'
          ]
        },
        {
          head: '三. 쇠퇴와 멸망',
          list: [
            '로마와의 대립으로 쇠퇴',
            '사산 조 페르시아에 멸망'
          ]
        }
      ]
    },
    overview: {
      summary: '파르티아 — BCE 247년 알렉산드로스 제국이 분열된 틈을 타 이란계 기마 유목민 아르사케스가 셀레우코스 왕조로부터 독립하여 세운 나라(중국에서는 안식국으로 불림). 크테시폰을 중심으로 메소포타미아~이란 일대를 지배하며, 지리적 이점을 살려 로마·인도(쿠샨)·중국(한)을 잇는 동서 무역로(비단길)를 장악해 중계 무역으로 번영하였다. 본래 민첩하고 용맹한 유목 민족으로 기마 전투와 활쏘기에 능하여, 카르하이 전투(BCE 53)에서 로마 크라수스의 대군을 섬멸하는 등 로마와 250년 가까이 대치하였다. 그러나 거듭된 로마와의 대립으로 국력이 쇠퇴하여 CE 224년 사산 왕조 페르시아에게 멸망하였다. 헬레니즘과 이란 문화가 융합한 파르티아 미술이 특징이다.',
      terms: [
        { label: '아르사케스 · 건국', def: '알렉산드로스 제국 분열을 틈타 셀레우코스 왕조로부터 독립해 파르티아를 세운 창건자(BCE 247).' },
        { label: '크테시폰',        def: '티그리스강변에 자리한 파르티아의 수도.' },
        { label: '동서 무역로 중계',  def: '로마·인도(쿠샨)·중국(한)을 잇는 비단길을 장악 → 중계 무역으로 막대한 부를 축적.' },
        { label: '카르하이 전투',    def: 'BCE 53. 파르티아 기마군단이 로마 크라수스의 대군을 섬멸.' },
        { label: '파르티아 사법',    def: '말 위에서 뒤를 향해 활을 쏘는 전술. 기마·활쏘기에 능한 유목 민족의 특징.' }
      ],
      timeline: [
        { y: -247, label: '◆ 파르티아 건국 — 아르사케스 (대표 표기)' },
        { y: -123, label: '미트라다테스 2세 전성기' },
        { y:  -53, label: '카르하이 전투 — 크라수스 격파' },
        { y:  224, label: '사산조 페르시아에게 멸망' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '파르티아의 성립과 발전', body: '이란계 유목민 아르사케스가 셀레우코스로부터 독립. 동서 무역(비단길)의 중계자.', citation: '— W1, BS' },
      { kind: '교과서 요약', title: '로마와의 대결', body: '카르하이 전투에서 로마 크라수스를 격파. 약 250년간 로마와 대치.', citation: '— W1' }
    ],
    map: { title: '파르티아의 영역과 비단길', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 60 60 L 300 50 L 320 140 L 290 200 L 80 200 L 40 130 Z', label: '파르티아' }],
      pins: [
        { x: 200, y: 130, label: '크테시폰', sub: '수도', amber: true },
        { x: 150, y: 120, label: '시리아',   sub: '로마와의 접경' },
        { x: 100, y: 110, label: '카르하이', sub: 'BCE 53 전투지' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'square', caption: '파르티아 기마궁수 부조', ref: 'W1' },
      { slot: 'square', caption: '파르티아 은화',           ref: 'W1' }
    ],
    linked: ['s-persia', 's-sasan', 's-kushan']
  },

  // ============================================================
  // 사산 왕조 페르시아 (CE 226~651) — 조로아스터교 국교
  // ============================================================
  's-sasan': {
    syncRatio: 0.90, fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    notes: {
      sections: [
        {
          head: '一. 건국',
          list: [
            '아케메네스 조 페르시아의 계승과 부흥을 내걸고 건국',
            '메소포타미아 지역~인더스 강에 이르는 대제국 건설'
          ]
        },
        {
          head: '二. 문화',
          list: [
            '조로아스터교 국교화, 마니교 등장',
            '아람어·쐐기 문자 등 다양한 언어와 문자 사용',
            '금은 공예품·유리·염색 기술',
            '  → 사막길 및 초원길을 통해 유럽과 동아시아에 전파'
          ]
        },
        {
          head: '三. 발전과 멸망',
          list: [
            '사막길·바닷길 등 동서 교통의 요충지 장악 → 중계 무역으로 번성',
            '비잔티움 제국과 전쟁 및 왕실 내분으로 쇠퇴',
            '정통 칼리프 시대 이슬람 제국에 멸망 (651)'
          ]
        }
      ]
    },
    overview: {
      summary: '사산 왕조 페르시아 — 아케메네스 왕조 페르시아의 부흥을 내걸고 CE 226년 아르다시르 1세가 파르티아를 멸하고 세운 제국. 메소포타미아에서 인더스강 유역에 이르는 대제국을 이루고, 동서 교역의 요충지를 장악해 중계 무역으로 번영하였다. 그의 아들 샤푸르 1세는 에데사 전투(260)에서 로마 황제 발레리아누스를 포로로 사로잡으며 전성기를 이끌었다. 종교로는 조로아스터교를 국교로 삼았는데, 이는 선(광명)의 신 아후라 마즈다와 악(암흑)의 신 아리만의 대립으로 세상을 보고 불을 숭배하는 종교로, 선악의 대결·최후의 심판·천국과 지옥 사상은 뒷날 유대교·크리스트교·이슬람교에 영향을 주었다. 한편 조로아스터교에 크리스트교·불교 등이 융합된 마니교가 등장했으나 이단으로 몰려 탄압받았다. 페르시아는 여러 민족의 문화를 융합한 국제적 문화를 꽃피워 유리 공예품·금속 세공품이 유럽·이슬람 세계와 동아시아(당)까지 전해졌다. 비잔티움 제국과의 오랜 전쟁과 왕실의 내분으로 쇠약해져 651년 이슬람 세력에게 멸망하였다.',
      terms: [
        { label: '아르다시르 1세 · 건국', def: '아케메네스 왕조의 부흥을 내걸고 파르티아를 멸하고 건국(226). 인더스강까지 대제국을 이룸.' },
        { label: '샤푸르 1세',     def: '에데사 전투(260)에서 로마 황제 발레리아누스를 사로잡은 전성기 군주.' },
        { label: '조로아스터교',    def: '선(광명)의 아후라 마즈다와 악(암흑)의 아리만의 대립·불 숭배. 사산조의 국교. 최후의 심판·천국과 지옥 사상은 유대교·크리스트교·이슬람교에 영향.' },
        { label: '마니교',         def: '조로아스터교에 크리스트교·불교가 융합된 종교. 조로아스터교와 대립해 이단으로 몰려 탄압받음.' },
        { label: '국제적 문화',     def: '여러 민족의 문화를 융합. 유리 공예품·금속 세공품이 유럽·이슬람 세계와 동아시아(당)까지 전파.' },
        { label: '멸망(651)',      def: '비잔티움 제국과의 오랜 전쟁과 왕실 내분으로 쇠약 → 이슬람 세력에게 멸망.' }
      ],
      timeline: [
        { y: 226, label: '◆ 사산 왕조 건국 — 아르다시르 1세 (대표 표기)' },
        { y: 260, label: '에데사 전투 — 발레리아누스 포로' },
        { y: 531, label: '호스로 1세 즉위' },
        { y: 651, label: '이슬람 세력에게 멸망' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '사산 왕조 페르시아와 조로아스터교',
        src: 'assets/w1/고대/서아시아·인도/사산 왕조 페르시아/사산 왕조 페르시아와 조로아스터교.png',
        citation: '— 교과서 탐구 자료 · 조로아스터교 국교화' },
      { kind: '탐구 자료', title: '사산 왕조 페르시아의 팽창',
        src: 'assets/w1/고대/서아시아·인도/사산 왕조 페르시아/사산 왕조 페르시아의 팽창.png',
        citation: '— 교과서 탐구 자료 · 동서 교통 요충지 장악과 영토 확장' }
    ],
    map: { title: '사산 왕조 페르시아', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 50 60 L 300 50 L 320 140 L 290 200 L 90 200 L 40 130 Z', label: '사산조' }],
      pins: [
        { x: 200, y: 130, label: '크테시폰', sub: '수도', amber: true },
        { x: 130, y: 110, label: '에데사',   sub: '260 전투', amber: true },
        { x: 230, y: 130, label: '엑바타나', sub: '주요 도시' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/사산 왕조 페르시아/파르티아와 사산 왕조 페르시아의 영역.png',
        caption: '파르티아와 사산 왕조 페르시아의 영역',
        ref: '교과서 자료 — 파르티아와 사산 왕조 페르시아의 영역 비교 지도' }
    ],
    linked: ['s-parthia', 's-persia', 's-hijra']
  },

  // ============================================================
  // 페르시아 문화 (주제 노드) — 아케메네스~사산의 문화와 종교
  // ============================================================
  's-persia-culture': {
    syncRatio: 0.90,
    fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    overview: {
      summary: '페르시아 문화 — 아케메네스 왕조에서 사산 왕조로 이어진 페르시아 문화의 가장 큰 특징은 다양한 민족의 문화를 수용하여 꽃피운 국제적 성격이다. 아케메네스 왕조 페르시아는 서아시아 지역에서 널리 쓰이던 아람어를 공용어로 삼았고, 수도 페르세폴리스(「페르시아의 도시」라는 뜻)의 궁전은 당시 서아시아의 건축 기술을 집대성한 것으로 정복한 여러 나라의 문화가 조화를 이룬 페르시아 문화의 특징을 잘 보여 준다. 이 궁전에서는 정복한 나라들이 공물을 바치는 의식이 거행되었다. 페르시아는 건축과 공예 부문에서 뛰어난 작품을 남겼는데, 사산 왕조 페르시아의 유리 공예품과 금속 세공품·견직물은 유럽과 이슬람 세계, 나아가 동아시아 지역까지 전해졌다(신라 출토 유리잔). 종교로는 조로아스터가 창시한 조로아스터교가 널리 숭배되었다. 이 종교는 세상을 선(광명)의 신 아후라 마즈다(「아후라」는 신, 「마즈다」는 지혜)가 악(암흑)의 신 앙라 마이뉴(아리만)와 대립하는 공간으로 보았고, 선한 신의 승리를 믿은 페르시아인들은 아후라 마즈다의 상징인 불을 숭배하여 배화교라고도 불렸다. 선과 악의 대결, 천국과 지옥의 대립 구도, 최후의 심판 등을 주요 내용으로 하는 교리는 이후 유대교·크리스트교·이슬람교 등 다른 종교에 영향을 주었다. 조로아스터교는 다리우스 1세 등의 후원으로 확산되었고, 사산 왕조 페르시아 시기에 국가적 통합을 위해 국교화되어 민족의 정통성을 강조하는 데 이용되었다. 왕은 아후라 마즈다의 뜻에 따라 왕이 되었다고 하여 왕권의 정당성을 뒷받침하였으며, 그 개방적인 성격은 페르시아 제국의 국제적 문화 형성에 토대가 되었다. 한편 사산 왕조 페르시아에서는 조로아스터교에 크리스트교·불교 등 외래 종교가 융합된 마니교가 등장하였으나, 조로아스터교와 대립하면서 이단으로 몰려 많은 탄압을 받았다.',
      terms: [
        { label: '국제적 문화', def: '여러 민족의 문화를 수용·융합하여 발전시킨 페르시아 문화의 근본 성격.' },
        { label: '아람어 공용어', def: '아케메네스 왕조 페르시아가 서아시아에서 널리 쓰이던 아람어를 제국의 공용어로 채택.' },
        { label: '페르세폴리스', def: '「페르시아의 도시」라는 뜻의 아케메네스 왕조 수도. 서아시아 건축 기술을 집대성한 궁전에 정복한 여러 나라의 문화가 반영되었고, 공물을 바치는 의식이 거행되었다.' },
        { label: '공예 기술의 전파', def: '사산 왕조 페르시아의 유리 공예품·금속 세공품·견직물이 유럽과 이슬람 세계, 동아시아(신라 출토 유리잔)까지 전해짐.' },
        { label: '조로아스터교', def: '조로아스터가 창시. 선(광명)의 신 아후라 마즈다가 악(암흑)의 신 앙라 마이뉴(아리만)를 물리치고 세상을 구원한다고 믿음. 불을 숭배하여 배화교라고도 함.' },
        { label: '아후라 마즈다', def: '조로아스터교의 최고신. 「아후라」는 신(神), 「마즈다」는 지혜를 의미. 왕은 아후라 마즈다의 뜻으로 왕이 되었다 하여 왕권의 정당성에 이용되었다.' },
        { label: '교리의 영향', def: '선악의 대결·최후의 심판·천국과 지옥 사상 → 유대교·크리스트교·이슬람교 등에 영향.' },
        { label: '국교화', def: '다리우스 1세 등의 후원으로 확산 → 사산 왕조 페르시아 때 국가적 통합과 민족의 정통성 강조를 위해 국교로 삼음.' },
        { label: '마니교', def: '사산 왕조 페르시아에서 조로아스터교에 크리스트교·불교 등이 융합되어 등장. 조로아스터교와 대립해 이단으로 몰려 탄압받음.' }
      ],
      timeline: [
        { y: -550, label: '아케메네스 왕조 페르시아 — 아람어 공용어 · 국제적 문화' },
        { y: -518, label: '페르세폴리스 궁전 건설 시작 — 다리우스 1세' },
        { y: -500, label: '조로아스터교 확산 — 다리우스 1세 등의 후원' },
        { y: 226,  label: '◆ 사산 왕조 페르시아 — 조로아스터교 국교화' },
        { y: 240,  label: '마니교 등장 → 이단으로 탄압' },
        { y: 400,  label: '유리 공예품·금속 세공품, 유럽·이슬람 세계·동아시아로 전파' }
      ]
    },
    notes: {
      sections: [
        {
          head: 'I. 국제적 성격의 문화',
          list: [
            '다양한 민족의 문화를 수용 → 국제적인 문화 발전',
            '아람어를 공용어로 사용(아케메네스 왕조)',
            '페르세폴리스 궁전 건설',
            '  · 「페르시아의 도시」라는 의미',
            '  · 서아시아 건축 기술 집대성, 정복한 여러 나라의 문화 반영',
            '  · 정복지의 공물 봉헌 의식 거행',
            '공예 기술 발달 → 사산 왕조의 유리 공예품·금속 세공품·견직물',
            '  · 유럽, 이슬람 세계, 동아시아까지 전파(신라 출토 유리잔)'
          ]
        },
        {
          head: 'II. 종교 — 조로아스터교',
          list: [
            '기원전 6세기경 조로아스터가 창시, 배화교(拜火敎)라고도 함',
            '세계관: 선(광명)의 신 아후라 마즈다 ↔ 악(암흑)의 신 앙라 마이뉴(아리만)',
            '  · 「아후라」=신, 「마즈다」=지혜',
            '  · 선한 신의 승리를 믿어 아후라 마즈다의 상징인 불을 숭배',
            '교리: 선과 악의 대결, 최후의 심판, 천국과 지옥',
            '  · 유대교·크리스트교·이슬람교 등에 영향'
          ]
        },
        {
          head: 'III. 조로아스터교의 발전과 마니교',
          list: [
            '다리우스 1세 등의 후원으로 확산',
            '사산 왕조 페르시아 시기 국교화',
            '  · 국가적 통합, 민족의 정통성 강조',
            '  · 왕은 아후라 마즈다의 뜻으로 왕이 되었다 → 왕권의 정당성에 이용',
            '  · 개방적 성격 → 페르시아 제국의 국제 문화 형성에 토대',
            '마니교 등장(사산 왕조)',
            '  · 조로아스터교 + 크리스트교·불교 등 외래 종교 융합',
            '  · 조로아스터교와 대립 → 이단으로 몰려 탄압'
          ]
        }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '사산 왕조 페르시아와 조로아스터교',
        src: 'assets/w1/고대/서아시아·인도/사산 왕조 페르시아/사산 왕조 페르시아와 조로아스터교.png',
        citation: '— 호스로 2세의 업적을 기리기 위해 조성된 부조. 사산 왕조 페르시아의 국왕이 조로아스터교의 최고신 아후라 마즈다(우측)로부터 통치권의 상징물을 받는 모습. 그는 조로아스터교를 국교로 신봉하여 국가 통합에 힘썼다.' }
    ],
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/아케메네스 왕조 페르시아/조로아스터교 사원 입구에 새겨진 아후라 마즈다.png',
        caption: '조로아스터교 사원 입구에 새겨진 아후라 마즈다',
        ref: '이란 — 조로아스터교의 최고신 아후라 마즈다. 「아후라」는 신, 「마즈다」는 지혜를 의미' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/아케메네스 왕조 페르시아/그리스와 이집트 양식이 혼합된 돌기둥.png',
        caption: '그리스와 이집트 양식이 혼합된 돌기둥',
        ref: '페르세폴리스 — 정복한 여러 나라의 문화가 조화를 이룬 국제적 문화의 사례' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/아케메네스 왕조 페르시아/아시리아 양식으로 새겨진 인면수신상.jpg',
        caption: '아시리아 양식으로 새겨진 인면수신상',
        ref: '페르세폴리스 궁전 — 피정복지 문화를 수용한 페르시아 문화의 국제적 성격' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/아케메네스 왕조 페르시아/파라오로 묘사된 다리우스 1세의 모습.png',
        caption: '파라오로 묘사된 다리우스 1세',
        ref: '이집트 양식으로 표현된 페르시아 왕 — 관용적·국제적 문화 정책' },
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/아케메네스 왕조 페르시아/[비상교육] 고등_세계사_1-3_41p_아케메네스 왕조 페르시아 시기의 마차.jpg',
        caption: '아케메네스 왕조 페르시아 시기의 마차',
        ref: '비상교육 세계사 1-3, p.41 — 뛰어난 공예 기술을 보여 주는 금속 세공품' }
    ],
    linked: ['s-persia', 's-sasan', 's-parthia']
  },

  // ============================================================
  // 이슬람교 성립 · 헤지라 (CE 622) — 무함마드의 메디나 이주
  // ============================================================
  's-hijra': {
    syncRatio: 0.94, fileRef: 'W1 · 미래엔 세계사 1 / BS · 비상교육 세계사',
    notes: {
      sections: [
        {
          head: '一. 배경',
          list: [
            '6세기 후반 사산 조 페르시아 vs 비잔티움 제국 → 갈등 고조',
            '유럽~인도·중국 간 교역로 차단 → 홍해~인도양 무역로 활성화',
            '홍해 연안의 메카·메디나 등이 상업 도시로 번영',
            '  → 빈부 격차 심화, 부족 간 대립 심화'
          ]
        },
        {
          head: '二. 성립',
          list: [
            '메카 상인 무함마드(570~632)가 이슬람교 성립 및 포교 시작',
            '특징',
            '  · 유일신 알라 숭배, 우상 숭배 배격, 알라 앞 모든 인간의 평등 강조',
            '  · 공동체 우선시, 차별 없는 평등 사회 지향'
          ]
        },
        {
          head: '三. 이슬람 공동체의 건설',
          list: [
            '헤지라(622): 성스러운 이주',
            '  · 메카의 보수적 귀족들의 박해 → 무함마드가 메카에서 메디나로 이주',
            '메디나에서 교세 확장 → 무함마드의 메카 장악, 아라비아 반도 대부분 장악'
          ]
        }
      ]
    },
    overview: {
      summary: '이슬람교 성립 — 대부분 사막과 초원인 아라비아반도에서 오아시스를 중심으로 부족 생활을 하던 아랍인들은, 6세기 후반 사산 왕조 페르시아와 비잔티움 제국의 충돌로 기존 동서 교통로가 막히자 홍해·아라비아해를 지나는 새 교역로로 눈을 돌렸고, 그 길목의 메카·메디나가 무역 도시로 번영하였다. 이 무렵 메카의 상인 무함마드(570~632)는 40세에 첫 계시를 받고, 우상 숭배를 배격하며 유일신 알라 앞에 모든 인간이 평등하다고 설파해 민중의 지지를 얻었다. 이슬람은 「알라에게 순종함」을, 무슬림은 「알라에 순종하는 자」를 뜻한다. 메카의 보수적 귀족층이 박해하자 무함마드는 622년 메디나로 이주하였고(헤지라, 이슬람력 원년), 그곳에서 무슬림 공동체(움마)를 세워 세력을 키운 뒤 630년 메카를 탈환하고 카바 신전을 정화하여 아라비아반도 대부분을 통일하였다. 신자들은 신앙 고백·예배·단식·희사·순례의 다섯 가지 의무(오행)를 지킨다.',
      terms: [
        { label: '무함마드',       def: '이슬람교를 창시한 메카의 상인·예언자(570~632).' },
        { label: '이슬람 · 무슬림',  def: '이슬람은 「알라에게 순종함」, 무슬림은 「알라에 순종하는 자」. 우상 배격·유일신·신 앞의 평등을 강조.' },
        { label: '교역로의 변화',    def: '사산조·비잔티움의 충돌로 기존 교통로가 막히자 홍해·아라비아해 교역로가 주목 → 메카·메디나 번영(이슬람 성립의 배경).' },
        { label: '헤지라(622)',    def: '박해를 피해 메카에서 메디나로 이주. 이슬람력 원년.' },
        { label: '움마',           def: '신앙으로 결속된 무슬림 공동체.' },
        { label: '5대 의무(오행)',   def: '신앙 고백(샤하다)·예배(살라트)·단식(사움)·희사(자카트)·순례(하지).' }
      ],
      timeline: [
        { y: 570, label: '무함마드 탄생 (메카)' },
        { y: 610, label: '첫 계시 — 천사 지브릴' },
        { y: 622, label: '◆ 헤지라 — 이슬람교 성립 (대표 표기)' },
        { y: 630, label: '메카 정복 — 카바 신전 정화' },
        { y: 632, label: '무함마드 사망 → 정통 칼리프 시대 개막' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '이슬람교의 창시와 확장 과정',
        src: 'assets/w1/고대/서아시아·인도/이슬람교 성립/이슬람교의 창시와 확장 과정.png',
        citation: '— 교과서 탐구 자료 · 무함마드의 계시·헤지라·메카 정복' },
      { kind: '탐구 자료', title: '이슬람교도의 신앙생활',
        src: 'assets/w1/고대/서아시아·인도/이슬람교 성립/이슬람교도의 신앙생활.png',
        citation: '— 교과서 탐구 자료 · 5대 의무 등 무슬림의 신앙생활' }
    ],
    map: { title: '메카·메디나 — 이슬람교의 발생지', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 80 40 L 230 40 L 270 100 L 270 200 L 130 220 L 70 170 Z', label: '아라비아 반도' }],
      pins: [
        { x: 150, y: 130, label: '메카',   sub: '카바 신전·발생지', amber: true },
        { x: 160, y: 105, label: '메디나', sub: '헤지라 정착지', amber: true },
        { x: 220, y: 200, label: '예멘',   sub: '남부 교역로' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/서아시아·인도/이슬람교 성립/파르티아와 사산 왕조 페르시아의 영역.png',
        caption: '파르티아와 사산 왕조 페르시아의 영역',
        ref: '이슬람 세력이 정복·흡수한 서아시아의 옛 제국 영역 (사산조 등)' }
    ],
    linked: ['s-rashidun', 's-sasan']
  },

  // ============================================================
  // 하(夏) — 중국 기록상 최초의 왕조 (BCE 2000경 ~ BCE 1600경)
  // ============================================================
  'e-xia': {
    syncRatio: 0.84,
    fileRef: 'W1 · 미래엔 세계사 1, p.19',
    notes: {
      sections: [
        {
          head: '一. 성립',
          list: [
            '황허강 유역 관개 농업 발달 → 잉여 생산물 → 계급 발생 → 청동기 문명',
            '중국 기록상 최초의 왕조 — 우(禹)임금이 세웠다고 전함 (전승)',
            '황허강 중류 얼리터우(二里頭) 유적이 그 실체로 추정 (1959년 발견)',
            'BCE 2000년경 ~ BCE 1600년경, 세습 왕조의 시작',
            '마지막 왕 걸왕(桀王)의 폭정 → 상(商)의 탕왕에게 멸망'
          ]
        }
      ]
    },
    overview: {
      summary:
        '하(夏) 왕조 — 중국 기록상 최초의 왕조(BCE 2000경 ~ BCE 1600경). 우(禹) 임금이 황허강의 홍수를 다스린 공으로 순(舜)에게서 왕위를 선양받아 세웠다고 전한다. 황허강 중류 일대에서 청동기 문명을 영위했으며, 1959년 발굴된 얼리터우(二里頭) 유적이 그 실체로 추정된다. 옌스 일대의 대규모 도시 유적·청동 정(鼎)·궁전 터가 발굴되어 동아시아 문명사의 시작점으로 평가받는다. 마지막 왕 걸왕(桀王)의 폭정으로 상의 탕왕에게 멸망.',
      terms: [
        { label: '우(禹) 임금',     def: '하 왕조의 시조로 전해지는 인물. 황허강의 치수 사업으로 명성을 떨침.' },
        { label: '얼리터우 유적',    def: '허난성 옌스시에서 발견된 청동기 시대 도시 유적. 하 왕조의 실체로 추정.' },
        { label: '걸왕(桀王)',       def: '하의 마지막 왕. 폭정으로 인심을 잃어 멸망의 원인이 됨.' }
      ],
      timeline: [
        { y: -2000, yl: '2000 BCE경', label: '◆ 하 왕조 성립 · 얼리터우 궁전 (대표 표기)' },
        { y: -1600, label: '상의 탕왕에게 멸망' }
      ]
    },
    sources: [
      { kind: '교과서 요약', title: '중국 최초의 왕조 하', body: '우 임금이 세웠다고 전하는 중국 최초 왕조. 얼리터우 유적이 그 실체로 추정.', citation: '— W1 p.19' }
    ],
    artifacts: [
      { slot: 'square', caption: '얼리터우 청동기 — 작(爵)', ref: 'W1' },
      { slot: 'wide',   caption: '얼리터우 유적 발굴 평면도',   ref: 'W1' }
    ],
    linked: ['e-shang']
  },

  // ============================================================
  // 상(商) — 황허 중류 도시 국가 연맹·신권 정치 (BCE 1600경 ~ BCE 1046경)
  // ============================================================
  'e-shang': {
    syncRatio: 0.91,
    fileRef: 'W1 · 미래엔 세계사 1, p.19',
    notes: {
      sections: [
        {
          head: '一. 성립',
          list: [
            '황허강 중류에서 탕왕이 하(夏)를 멸망시키고 건국 (BCE 1600년경)',
            '후기 수도는 은허(殷墟, 현 허난성 안양) → 「은(殷)」으로도 불림',
            '마지막 왕 주왕(紂王)의 폭정으로 주(周) 무왕에게 멸망 (BCE 1046년경)'
          ]
        },
        {
          head: '二. 정치',
          list: [
            '도시 국가 연맹체 — 황허강 중류 여러 도시 국가의 결합',
            '제정일치(祭政一致)의 신권 정치 — 왕이 제사장이자 정치 지도자',
            '왕은 점복을 통해 신의 뜻을 묻고 국가 대사 결정'
          ]
        },
        {
          head: '三. 특징',
          list: [
            '청동기(제기·무기에 사용) — 정(鼎)·작(爵) 등 의식용 청동기 발달',
            '석기(농기에 사용) — 청동기는 의식·무기에 한정, 농기구는 여전히 돌·나무',
            '갑골문자(甲骨文) — 거북 배딱지·소 어깨뼈에 점친 결과 새김, 한자(漢字)의 원형',
            '태음력 사용',
            '순장(殉葬) 풍습 → 계급 사회의 증거 (왕의 죽음에 가신·노예 함께 매장)'
          ]
        }
      ]
    },
    overview: {
      summary:
        '상(商) 왕조 — 탕왕이 하의 걸왕을 무력으로 멸하고 BCE 1600년경 건국. 황허 중류의 도시 국가 연맹체로 출발하여 제정일치(祭政一致)의 신권 정치를 펼쳤다. 왕은 점복(占卜)을 통해 신의 뜻을 묻고 국가 대사를 결정하였으며, 그 점복 기록을 거북 배딱지·소 어깨뼈에 새긴 갑골문자는 **한자(漢字)의 원형**이 되어 이후 동아시아 한자 문화권의 토대를 이루었다. 청동기(정·작 등 의식용 제기)·태음력·순장 풍습이 특징. BCE 1300년경 반경(盤庚)이 은(殷, 현 허난성 안양)으로 천도하면서 「은(殷)」으로도 불린다. 주왕(紂王)의 폭정으로 BCE 1046년경 주(周) 무왕에게 목야 전투에서 멸망.',
      terms: [
        { label: '탕왕(湯王)',   def: '상의 창시자. 하의 걸왕을 멸함.' },
        { label: '은허(殷墟)',   def: '상 후기 수도. 현 허난성 안양. 갑골문 출토지.' },
        { label: '갑골문',        def: '점친 결과를 거북 배딱지·소 어깨뼈에 새긴 글자. 한자의 원형 — 동아시아 한자 문화권의 토대.' },
        { label: '제정일치',      def: '제사와 정치를 한 사람(왕)이 함께 주관하는 신권 정치 형태.' },
        { label: '순장',          def: '왕의 죽음에 가신·노예 등을 함께 묻는 풍습. 계급 사회의 증거.' },
        { label: '청동 정(鼎)',   def: '상의 대표적 청동 제기. 솥 모양. 권위와 정통성의 상징.' }
      ],
      timeline: [
        { y: -1600, label: '◆ 상 성립 — 탕왕 (대표 표기)' },
        { y: -1300, label: '반경의 은(殷) 천도 — 은허' },
        { y: -1046, label: '목야 전투 → 주에게 멸망' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '상(商)의 신권 정치와 갑골문',
        src: 'assets/w1/고대/동아시아/상/이미지 2026. 5. 26. 15.28.png',
        citation: '— 교과서 탐구 자료' }
    ],
    artifacts: [
      { slot: 'square', src: 'assets/w1/고대/동아시아/상/미래엔_세계사_이미지_19쪽_1_상과_주.JPG',
        caption: '상과 주의 세력 범위',
        ref: '미래엔 세계사 p.19 — 황허강 중류 도시 국가 연맹에서 출발한 상(商)과 주(周)의 영역도' },
      { slot: 'square', src: 'assets/w1/고대/동아시아/상/[비상교육] 고등_세계사_1-1_17p_상의 청동 정(鼎).jpg',
        caption: '상의 청동 정(鼎)',
        ref: '비상교육 세계사 1-1 p.17 — 의식·제사용 청동 제기. 상 왕조 청동기 문화를 대표.' }
    ],
    linked: ['e-xia', 'e-zhou']
  },

  // ============================================================
  // 주(周) — 봉건제·종법제·천명사상 (BCE 1046경 ~ BCE 256)
  // ============================================================
  'e-zhou': {
    syncRatio: 0.93,
    fileRef: 'W1 · 미래엔 세계사 1, p.19',
    notes: {
      sections: [
        {
          head: '一. 성립',
          list: [
            '상(商)을 멸망시킨 후 무왕이 목야 전투(BCE 1046)에서 승리, 주(周) 건국',
            '호경(鎬京, 현 시안 부근)에 도읍',
            '황허강~창장강 일대까지 영토 확대',
            '서주(西周, BCE 1046~771) · 동주(東周, BCE 770~256)로 구분'
          ]
        },
        {
          head: '二. 봉건제 = 종법제 + 천명 사상',
          list: [
            '천자(왕): 수도 및 인근 지역 등의 직할지 통치',
            '제후(친족·공신): 나머지 지역을 봉토(封土)로 받아 통치, 군역·공납의 의무',
            '왕실이 감관(監官)을 파견하여 제후국 견제'
          ]
        },
        {
          head: '   ▸ 종법제 — 혈연 기반, 예법 중시',
          list: [
            '제사 계승(직계 적장자)과 종족 결합을 위한 친족 제도의 기본',
            '천자: 종가(宗家), 휘하 제후 통솔',
            '제후: 자신의 통치 지역에서 경(卿)·대부(大夫)·사(士) 통솔'
          ]
        },
        {
          head: '   ▸ 천명 사상',
          list: [
            '천명을 받은 자 = 천자(왕)',
            '정복 전쟁·역성혁명·왕위 정당성 합리화',
            '덕치주의 — 「덕 있는 자」가 천명을 받을 수 있다'
          ]
        },
        {
          head: '三. 쇠퇴',
          list: [
            'BCE 8세기경 견융(犬戎)의 침입 → 호경 함락',
            '낙읍(洛邑, 현 뤄양)으로 천도 (BCE 770)',
            '동주(東周) 성립 이후 춘추(春秋, BCE 770~403) → 전국(戰國, BCE 403~221) 시대 전개'
          ]
        }
      ]
    },
    overview: {
      summary:
        '주(周) — 무왕이 BCE 1046년경 목야 전투에서 상을 멸하고 호경(현 시안 부근)에 도읍을 정하며 건국. 천자가 직할지를 다스리고 왕족·공신을 제후로 봉해 분봉하는 **봉건제**, 직계 적장자 중심의 친족 제도인 **종법제**, 「덕 있는 자가 천명을 받는다」는 **천명 사상**이 3대 통치 원리를 이루었다. 이 세 원리는 이후 동아시아 한자 문화권 전체에 깊은 영향을 끼쳐 황제·관료 통치의 사상적 토대가 되었다. BCE 770 견융의 침입으로 호경이 함락되자 낙읍(현 뤄양)으로 천도하면서 동주(東周) 시대 시작 → 왕실의 권위가 약화되며 춘추·전국 시대로 이어진다.',
      terms: [
        { label: '봉건제',     def: '천자가 직할지를 다스리고 나머지 영토는 제후에게 분봉하여 다스리게 한 제도.' },
        { label: '종법제',     def: '직계 적장자 중심의 친족 제도. 봉건제를 혈연으로 뒷받침.' },
        { label: '천명사상',   def: '하늘이 덕 있는 자를 군주로 삼는다는 사상. 왕권에 정당성 부여.' },
        { label: '호경',       def: '서주의 도읍. 현 시안 부근.' },
        { label: '낙읍(洛邑)', def: '동주의 도읍. 현 뤄양. BCE 770 천도.' },
        { label: '경·대부·사', def: '제후 휘하의 신분 계급. 종법제 안에서 위계 형성.' }
      ],
      timeline: [
        { y: -1046, label: '◆ 주 건국 — 목야 전투 (대표 표기)' },
        { y: -841,  label: '국인 폭동' },
        { y: -770,  label: '낙읍 천도 → 동주 / 춘추 시대 개막' },
        { y: -403,  label: '전국 시대 개막 — 진(晉)이 한·위·조로 나뉨' },
        { y: -256,  label: '주 멸망 (진의 통일 35년 전)' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '주의 봉건제',
        body: '주(周)의 봉건제 — 천자가 직할지를 다스리고 왕족·공신을 제후로 봉해 분봉. 종법제(직계 적장자 중심)와 천명사상으로 뒷받침.',
        images: [
          { src: 'assets/w1/고대/동아시아/주/미래엔_세계사_이미지_19쪽_2_주의_봉건제.JPG', caption: '주의 봉건제 도해 — 천자·제후·경·대부·사·서민' },
          { src: 'assets/w1/고대/동아시아/주/이미지 2026. 5. 26. 15.33.png', caption: '주의 봉건제 — 분봉과 종법 관계 (의후궤 청동기 명문)' }
        ],
        citation: '— 미래엔 세계사 p.19 · 교과서 탐구 자료' }
    ],
    artifacts: [
      { slot: 'square', src: 'assets/w1/고대/동아시아/주/미래엔_세계사_이미지_19쪽_1_상과_주.JPG',
        caption: '상과 주의 세력 범위',
        ref: '미래엔 세계사 p.19 — 황허강 유역의 상(商)과 주(周)의 영역도' }
    ],
    linked: ['e-shang', 'e-chunqiu-zhanguo']
  },

  // ============================================================
  // 그리스·페르시아 전쟁 (BCE 492~479)
  //   출처: WN · 세계사 연표(정리 탭 적용) p.116 + W1 미래엔 / BS 비상교육
  // ============================================================
  // ============================================================
  // 스파르타
  // ============================================================
  'w-sparta': {
    syncRatio: 0.88,
    fileRef: 'WN · 세계사 연표(정리 탭) / W1 · 미래엔 세계사 1',
    overview: {
      summary: '스파르타 — 펠로폰네소스 반도에 도리스인이 세운 군국주의 폴리스. 소수의 도리스인 시민이 다수의 피정복민을 다스리기 위해 강력한 군사 국가 체제를 갖추었다. 두 명의 왕과 5인의 감독관(에포로스), 원로회, 민회로 통치하였으며, 정복당한 예속 농민 헤일로타이가 농업을, 반자유민 페리오이코이가 상공업을 담당하였다. 모든 남자 시민은 어려서부터 국가가 주관하는 엄격한 집단 군사 교육을 받아 평생 군인으로 복무하였다. 폐쇄적·보수적 사회를 유지하며 그리스 최강의 육군을 길렀고, 펠로폰네소스 동맹을 이끌어 아테네와 그리스의 패권을 다투었다.',
      terms: [
        { label: '도리스인', def: '펠로폰네소스 반도로 남하해 스파르타를 세운 소수 지배 집단.' },
        { label: '헤일로타이', def: '정복당한 예속 농민. 강하게 저항한 자들로, 농업에 종사하며 엄격히 통제됨.' },
        { label: '페리오이코이', def: '반자유민. 상공업에 종사했으나 정치 참여는 제한됨.' },
        { label: '군사 교육', def: '모든 남자 시민을 대상으로 한 집단생활·군사 훈련. 평생 군인으로 복무.' },
        { label: '에포로스(감독관)', def: '왕과 국정을 감독한 5인의 관리. 스파르타 통치의 실권.' }
      ],
      timeline: [
        { y: -800, label: '◆ 도리스인, 스파르타 건설(기원전 800년경)' },
        { y: -480, label: '테르모필레 전투' },
        { y: -431, label: '펠로폰네소스 전쟁 발발' }
      ]
    },
    notes: {
      sections: [
        {
          head: 'I. 성립',
          list: [
            '도리스인들이 펠로폰네소스 반도로 남하',
            '주변국 정복하여 영토 확장'
          ]
        },
        {
          head: 'II. 통치',
          list: [
            '도리스인(소수)이 주도하는 군사 통치 폐쇄 사회',
            '헤일로타이: 예속 농민, 정복 과정에서 강하게 저항한 자',
            '페리오이코이: 반자유민, 상공업 종사, 종속적 지위를 감수한 자'
          ]
        },
        {
          head: 'III. 교육',
          list: [
            '모든 남자 시민 대상, 집단 생활에 따른 군사 훈련 실시'
          ]
        }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '스파르타의 교육',
        src: 'assets/w1/고대/유럽·미주/스파르타/스크린샷 2026-07-15 15.37.28.png',
        citation: '— 교과서 탐구 자료 · 아고게 — 7세부터 30세까지 국가 주관 공동 교육(신체 단련·군사 훈련), 목적은 덕을 겸비한 용감한 전사 양성' },
      { kind: '탐구 자료', title: '델로스 동맹과 펠로폰네소스 동맹',
        src: 'assets/w1/고대/유럽·미주/스파르타/스크린샷 2026-07-15 15.59.59.png',
        citation: '— 아테네의 공물 징수 기록(메트로폴리탄 박물관) · 펠로폰네소스 동맹의 스파르타는 아테네가 델로스 동맹을 주도하며 세력을 확대하는 것을 견제, 양측의 대립이 점차 심화' }
    ],
    artifacts: [
      { slot: 'auto',
        caption: '스파르타 관련 자료 (1)',
        ref: '교과서 자료 미배치' },
      { slot: 'auto',
        caption: '스파르타 관련 자료 (2)',
        ref: '교과서 자료 미배치' }
    ],
    linked: ['w-polis', 'w-athens', 'w-greco-persian', 'w-peloponnesian']
  },

  // ============================================================
  // 아테네
  // ============================================================
  'w-athens': {
    syncRatio: 0.90,
    fileRef: 'WN · 세계사 연표(정리 탭) / W1 · 미래엔 세계사 1',
    overview: {
      summary: '아테네 — 아티카 반도의 폴리스로, 상공업과 무역으로 부를 쌓고 중장 보병으로 군대의 주력이 된 평민이 정치 참여를 요구하면서 왕정에서 귀족정·금권정·참주정을 거쳐 민주정으로 발전하였다. 솔론은 재산 정도에 따라 참정권을 나누는 개혁을 폈으나 갈등이 남았고, 페이시스트라토스 같은 참주가 등장하기도 하였다. 클레이스테네스는 혈연 중심의 부족제를 거주지 중심으로 개편하고 500인 평의회를 설치했으며, 참주의 출현을 막는 도편 추방제를 도입해 민주정의 기틀을 마련하였다. 페르시아 전쟁에서 함선의 노를 젓는 무산 시민이 활약하면서 발언권이 커졌고, 페리클레스 시대(BCE 5세기 중엽)에 성인 남자 시민 모두가 민회에서 입법권을 행사하고, 대부분의 관직을 추첨으로 뽑으며, 공무 수당을 지급해 가난한 시민도 참여하는 직접 민주 정치가 완성되었다. 다만 여성·노예·거류 외국인은 정치에서 제외된 제한적 민주정이었다.',
      terms: [
        { label: '솔론의 개혁', def: '재산 정도에 따라 참정권을 차등 분배한 금권정 개혁(BCE 6세기 초).' },
        { label: '참주정', def: '귀족·평민 대립의 혼란 속에 페이시스트라토스 등 참주가 정권을 장악한 정치.' },
        { label: '클레이스테네스', def: '부족제를 혈연→거주지 중심으로 개편하고 500인 평의회를 설치, 도편 추방제를 도입해 민주정의 기틀을 세움.' },
        { label: '도편 추방제', def: '참주가 될 위험이 있는 인물을 도자기 조각 투표(6,000표 이상)로 10년간 국외 추방한 제도.' },
        { label: '페리클레스 · 직접 민주 정치', def: '성인 남자 시민이 민회에서 직접 입법권을 행사. 관직 추첨제와 공무 수당제로 가난한 시민의 참여를 보장한 전성기.' },
        { label: '제한적 민주정', def: '참정권은 성인 남자 시민에 한정 — 여성·노예·거류 외국인은 제외.' }
      ],
      timeline: [
        { y: -750, yl: '8세기 BCE', label: '◆ 아테네 성립 (아티카 폴리스)' },
        { y: -594, label: '솔론의 개혁 — 재산에 따른 참정권 차등' },
        { y: -561, label: '페이시스트라토스의 참주정' },
        { y: -508, label: '클레이스테네스 — 부족제 개편·500인 평의회·도편 추방제' },
        { y: -461, label: '페리클레스 시대 — 직접 민주정 전성기 (~429)' }
      ]
    },
    notes: {
      sections: [
        {
          head: 'I. 정치 발전',
          list: [
            '왕정 → 귀족정 → 금권정 → 참주정 → 민주정'
          ]
        },
        {
          head: 'II. 귀족정 (BCE 7세기)',
          list: [
            '평민의 성장',
            '상공업 및 무역 발달 → 평민의 부 증가',
            '평민 중장보병이 군대의 주력',
            '   → 평민의 정치 권리 확대 요구'
          ]
        },
        {
          head: 'III. 금권정 (BCE 6세기 초)',
          list: [
            '솔론의 개혁',
            '재산에 따른 참정권 차등 분배',
            '   → 귀족 및 평민의 불만과 대립'
          ]
        },
        {
          head: 'IV. 참주정',
          list: [
            '귀족과 평민의 대립 격화 → 사회 혼란',
            '페이시스트라토스와 같은 참주들의 등장 → 정권 장악'
          ]
        },
        {
          head: 'V. 민주정 (BCE 6세기 말)',
          list: [
            '클레이스테네스 = 민주정의 기틀 마련',
            '  · 부족제 개편: 혈연 중심 → 거주지 중심',
            '  · 500인 평의회가 행정 담당',
            '  · 도편추방제: 참주 출현 방지를 위한 투표 제도',
            '페리클레스 = 민주정의 전성기 (BCE 5세기)',
            '  · 페르시아 전쟁 이후 아테네 국력 강화 → 델로스 동맹의 맹주, 해상 제국',
            '  · 민회 권한 강화: 전쟁 참여 평민의 발언권 강화, 실질적 입법권 행사',
            '  · 수당제: 공무 수당 지급 → 가난한 시민의 정치 참여 기회 확대',
            '  · 추첨제: 관직과 배심원을 추첨하여 임명 → 공무 담당',
            '한계: 여성·거류 외국인·노예에게는 참정권 X'
          ]
        }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '아테네 민주 정치',
        src: 'assets/w1/고대/유럽·미주/아테네/[비상교육] 고등_세계사_1-3_47p_아테네 민주 정치.jpg',
        citation: '— 비상교육 세계사 1-3, p.47 · 성년 남자 시민이 추첨으로 500인 평의회·시민 법정(배심원 6천 명)을, 선거로 장군(부족당 1명)을 구성. 민회에서 여성·거류 외국인·노예는 제외' },
      { kind: '탐구 자료', title: '델로스 동맹과 펠로폰네소스 동맹',
        src: 'assets/w1/고대/유럽·미주/아테네/스크린샷 2026-07-15 15.59.59.png',
        citation: '— 아테네의 공물 징수 기록(메트로폴리탄 박물관) · 델로스 동맹을 주도한 아테네가 동맹 폴리스들로부터 공물을 징수하고 기금을 행사. 스파르타가 이를 견제하며 양측의 대립이 심화' },
      { kind: '탐구 자료', title: '아테네 민주 정치, 어떻게 평가할까?',
        src: 'assets/w1/고대/유럽·미주/아테네/아테네 민주 정치 어떻게 평가할까.jpg',
        citation: '— 주제 토론 · 클레이스테네스(참주정 반대)·페리클레스(전성기)의 옹호와, 플루타르코스(사치·공적 남발 비판)·로렌 새먼스(여성·노예 배제, 소크라테스의 죽음 등 한계)의 비판으로 아테네 민주정을 다각도로 평가' }
    ],
    artifacts: [
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/아테네/[비상교육] 고등_세계사_1-3_46p_도편 추방제에 사용된 도기 조각.jpg',
        caption: '도편 추방제에 사용된 도기 조각',
        ref: '비상교육 세계사 1-3, p.46 — 오스트라콘에 새겨진 「테미스토클레스」의 이름' },
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/아테네/[비상교육] 고등_세계사_1-3_48p_파르테논 신전.jpg',
        caption: '파르테논 신전',
        ref: '비상교육 세계사 1-3, p.48 — 아크로폴리스의 아테나 여신 신전. 고전기 그리스 건축의 정수' }
    ],
    linked: ['w-polis', 'w-sparta', 'w-greco-persian', 'w-peloponnesian']
  },

  // ============================================================
  // 그리스·페르시아 전쟁
  // ============================================================
  'w-greco-persian': {
    syncRatio: 0.92,
    fileRef: 'WN · 세계사 연표(정리 탭) p.116 / W1 미래엔 세계사 1',
    notes: {
      sections: [
        {
          head: 'I. 배경',
          list: [
            '아케메네스 조 페르시아',
            '지중해로 세력 확대',
            '   → 그리스 세계와 충돌'
          ]
        },
        {
          head: 'II. 제1차 페르시아 전쟁 (BCE 492)',
          list: [
            '다리우스 1세',
            '트라키아 방면으로 대규모 군대 파견',
            '   → 폭풍으로 인해 철수'
          ]
        },
        {
          head: 'III. 제2차 페르시아 전쟁 (BCE 490)',
          list: [
            '마라톤 전투에서 아테네 승리'
          ]
        },
        {
          head: 'IV. 제3차 페르시아 전쟁 (BCE 480)',
          list: [
            '크세르크세스',
            '테르모필레 전투에서 스파르타 패배',
            '살라미스 해전에서 아테네 승리'
          ]
        },
        {
          head: 'V. 영향',
          list: [
            '아테네의 번영: 델로스 동맹 맹주',
            '강력한 해상국가로 발전'
          ]
        }
      ]
    },
    overview: {
      summary: '그리스·페르시아 전쟁 (BCE 492~479) — 아케메네스 페르시아의 3차에 걸친 그리스 침공. 마라톤(BCE 490)·살라미스 해전(BCE 480)·플라타이아이 전투(BCE 479)에서 그리스 폴리스 연합군 승리. 아테네의 델로스 동맹 맹주 등극과 해상 패권 확립의 계기.',
      terms: [
        { label: '아케메네스 페르시아', def: 'BCE 550 키루스 2세가 건국한 오리엔트 제국. 다리우스 1세 시기 전성기.' },
        { label: '다리우스 1세',        def: '아케메네스 전성기 군주. 1·2차 전쟁의 주역.' },
        { label: '마라톤 전투',         def: 'BCE 490. 아테네군이 페르시아군을 격파. 밀티아데스 지휘.' },
        { label: '크세르크세스 1세',    def: '다리우스의 아들. 3차 전쟁 주도.' },
        { label: '테르모필레 전투',     def: 'BCE 480. 스파르타 왕 레오니다스의 300인 결사대 전멸.' },
        { label: '살라미스 해전',       def: 'BCE 480. 테미스토클레스의 아테네 함대 승리.' },
        { label: '플라타이아이 전투',    def: 'BCE 479. 그리스 연합 육군의 최종 승리.' },
        { label: '델로스 동맹',         def: 'BCE 478. 아테네 중심의 대페르시아 방어 동맹. 후일 아테네 해상 제국으로 변질.' }
      ],
      timeline: [
        { y: -499, label: '이오니아 반란' },
        { y: -492, label: '◆ 제1차 전쟁 (대표 표기) — 폭풍으로 철수' },
        { y: -490, label: '제2차 전쟁 — 마라톤 전투' },
        { y: -480, label: '제3차 전쟁 — 테르모필레 / 살라미스 해전' },
        { y: -479, label: '플라타이아이 전투 — 사실상 종전' },
        { y: -478, label: '델로스 동맹 결성' },
        { y: -448, label: '칼리아스 평화 — 공식 종전' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '그리스·페르시아 전쟁의 전개', ph: true,
        citation: '— 교과서 탐구 자료 미배치' },
      { kind: '탐구 자료', title: '전쟁의 영향', ph: true,
        citation: '— 교과서 탐구 자료 미배치' }
    ],
    map: {
      title: '그리스·페르시아 전쟁 — 주요 전장',
      bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 60 60 L 320 50 L 340 140 L 280 200 L 100 200 L 50 130 Z', label: '에게해~소아시아' }],
      pins: [
        { x: 120, y: 130, label: '아테네',     sub: '델로스 동맹 맹주', amber: true },
        { x: 110, y: 140, label: '마라톤',     sub: 'BCE 490', amber: true },
        { x: 115, y: 135, label: '살라미스',   sub: 'BCE 480 해전', amber: true },
        { x: 140, y: 120, label: '테르모필레', sub: 'BCE 480' },
        { x: 130, y: 140, label: '플라타이아이', sub: 'BCE 479' },
        { x: 230, y: 130, label: '사르디스',   sub: '페르시아 출발지' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/그리스·페르시아 전쟁/[비상교육] 고등_세계사_1-3_47p_그리스·페르시아 전쟁의 전개.jpg',
        caption: '그리스·페르시아 전쟁의 전개',
        ref: '비상교육 세계사 1-3, p.47 — 페르시아 1차(BCE 492)·2차(BCE 490 마라톤)·3차(BCE 480 살라미스) 침입 경로와 주요 전투지' },
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/그리스·페르시아 전쟁/미래엔_세계사_이미지_45쪽_그리스_페르시아_전쟁.JPG',
        caption: '그리스·페르시아 전쟁',
        ref: '미래엔 세계사 1, p.45 — 아케메네스 왕조 페르시아의 3차 침입 경로. 테르모필레·마라톤·살라미스 전투' }
    ],
    linked: ['w-polis', 'w-athens', 'w-sparta', 's-persia', 'w-peloponnesian']
  },

  // ============================================================
  // 펠로폰네소스 전쟁
  // ============================================================
  'w-peloponnesian': {
    syncRatio: 0.89,
    fileRef: 'WN · 세계사 연표(정리 탭) / W1 · 미래엔 세계사 1',
    overview: {
      summary: '펠로폰네소스 전쟁 — 그리스·페르시아 전쟁 이후 델로스 동맹을 이끌며 세력을 키운 아테네와, 펠로폰네소스 동맹을 이끈 스파르타가 그리스의 패권을 두고 벌인 전쟁(BCE 431~404). 페리클레스가 델로스 동맹의 금고를 아테네로 옮기고 그 기금을 파르테논 신전 건축과 시민 수당에 쓰는 등 동맹을 아테네의 이익을 위한 것으로 변질시키자, 동맹국의 불만과 스파르타의 견제가 커지면서 전쟁이 일어났다. 아테네는 해군, 스파르타는 육군의 강점을 살려 약 27년간 대립하였고, 전염병으로 페리클레스를 잃은 아테네가 결국 BCE 404년 항복하였다. 스파르타가 패권을 잡았으나 곧 테베 등으로 주도권이 옮겨 다니는 내분이 이어졌고, 오랜 전쟁으로 폴리스의 시민 공동체가 무너지면서 그리스 세계 전체가 쇠퇴하였다. 결국 이 혼란을 틈타 북방의 마케도니아 필리포스 2세가 그리스를 제패하였다(BCE 338).',
      terms: [
        { label: '델로스 동맹 · 변질', def: '페르시아 재침에 대비해 아테네가 주도한 동맹. 페리클레스가 금고를 아테네로 옮기고 기금을 유용하면서 아테네 제국으로 변질 → 전쟁의 원인.' },
        { label: '펠로폰네소스 동맹', def: '스파르타가 이끈 폴리스 동맹. 아테네의 세력 확대를 견제하며 패권을 다툼.' },
        { label: '아테네의 항복(BCE 404)', def: '약 27년의 전쟁 끝에 아테네가 스파르타에 항복하며 전쟁 종결.' },
        { label: '폴리스의 쇠퇴', def: '장기간의 내전으로 시민 공동체가 무너지고 그리스 세계 전체가 약화됨.' },
        { label: '마케도니아의 제패(BCE 338)', def: '폴리스 쇠퇴를 틈타 필리포스 2세가 카이로네이아 전투에서 그리스를 제패.' }
      ],
      timeline: [
        { y: -478, label: '델로스 동맹 결성 (아테네 주도)' },
        { y: -454, label: '델로스 동맹 금고 아테네 이전 → 동맹 변질' },
        { y: -431, label: '◆ 펠로폰네소스 전쟁 발발 — 아테네 vs 스파르타' },
        { y: -429, label: '페리클레스, 역병으로 사망' },
        { y: -404, label: '아테네 항복 → 스파르타 패권' },
        { y: -338, label: '카이로네이아 전투 → 마케도니아의 그리스 제패' }
      ]
    },
    notes: {
      sections: [
        {
          head: 'I. 배경',
          list: [
            '아테네인 위주의 델로스 동맹 운영',
            '페리클레스가 델로스 동맹 금고를 아테네로 이전',
            '동맹 기금을 이용',
            '   → 파르테논 신전 건축',
            '   → 민회 참여자에게 수당 지급',
            '동맹국들의 불만 심화'
          ]
        },
        {
          head: 'II. 전개',
          list: [
            '동맹국 내부 반발 세력 + 스파르타 = 펠로폰네소스 동맹',
            '델로스 동맹(아테네) VS 펠로폰네소스 동맹(스파르타)',
            '펠로폰네소스 전쟁 발발',
            '   → 스파르타의 승리'
          ]
        },
        {
          head: 'III. 영향 및 결과',
          list: [
            '그리스 패권 이동',
            '스파르타에서 테베로 → 내분 심화',
            '마케도니아 필리포스 2세 세력 확장 → 그리스 폴리스 지배 (BCE 338)'
          ]
        }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '델로스 동맹과 펠로폰네소스 동맹',
        src: 'assets/w1/고대/유럽·미주/펠로폰네소스 전쟁/스크린샷 2026-07-15 15.59.59.png',
        citation: '— 아테네의 공물 징수 기록(메트로폴리탄 박물관) · 델로스 동맹을 주도한 아테네가 동맹 폴리스들로부터 공물을 징수하고 동맹 기금에 대한 관리권을 행사. 이에 펠로폰네소스 동맹의 스파르타가 아테네의 세력 확대를 견제하며 양측의 대립이 점차 심화 — 전쟁의 배경' }
    ],
    artifacts: [
      { slot: 'auto',
        caption: '펠로폰네소스 전쟁 관련 자료 (1)',
        ref: '교과서 자료 미배치' },
      { slot: 'auto',
        caption: '펠로폰네소스 전쟁 관련 자료 (2)',
        ref: '교과서 자료 미배치' }
    ],
    linked: ['w-athens', 'w-sparta', 'w-greco-persian', 'w-alexander-empire']
  },

  // ============================================================
  // 알렉산드로스 제국
  // ============================================================
  'w-alexander-empire': {
    syncRatio: 0.90,
    fileRef: 'WN · 세계사 연표(정리 탭) / W1 · 미래엔 세계사 1',
    overview: {
      summary: '알렉산드로스 제국 — 그리스를 제패한 마케도니아 필리포스 2세에 이어 즉위한 알렉산드로스(재위 BCE 336~323)가 동방 원정으로 건설한 대제국. 그는 이소스 전투(BCE 333)와 가우가멜라 전투(BCE 331)에서 다리우스 3세를 무찔러 아케메네스 왕조 페르시아를 무너뜨리고, 이집트를 거쳐 인더스강 유역까지 진출하여 유럽·아시아·아프리카에 걸친 대제국을 건설하였다. 정복지 곳곳에 알렉산드리아라는 도시를 세워 그리스인을 이주시키고, 페르시아식 전제 군주제를 도입하는 한편 피정복민의 전통과 관습을 존중하고 그리스인과 페르시아인의 결혼을 장려하는 동서 융합 정책을 폈다. 그 결과 그리스 문화와 오리엔트 문화가 결합한 헬레니즘 문화가 형성되어, 폴리스의 틀을 넘어 인류를 하나로 보는 세계 시민주의와 개인주의가 발달하였다. 철학에서는 욕망을 억제하는 스토아 학파와 마음의 안정을 추구하는 에피쿠로스 학파가, 과학에서는 아르키메데스(부력)·에우클레이데스(기하학)·에라토스테네스(지구 둘레 측정)가, 예술에서는 「라오콘 군상」·「밀로의 비너스」처럼 인간의 육체미와 감정을 사실적·관능적으로 표현한 조각이 발달하였다. 헬레니즘 미술은 인도의 간다라 미술 성립에 영향을 주었고, 로마로 계승되어 서양 고전 문화 완성에 기여하였다. 알렉산드로스 사후 제국은 마케도니아·시리아·이집트로 분열되었다.',
      terms: [
        { label: '동방 원정 · 이소스/가우가멜라 전투', def: '알렉산드로스가 이소스(BCE 333)·가우가멜라(BCE 331)에서 다리우스 3세를 격파, 페르시아를 무너뜨리고 인더스강까지 진출.' },
        { label: '동서 융합 정책', def: '알렉산드리아 건설·그리스인 이주, 그리스인과 페르시아인의 결혼 장려, 피정복민 전통·관습 존중, 전제 군주제 도입.' },
        { label: '헬레니즘 문화 · 세계 시민주의', def: '그리스+오리엔트 문화의 융합. 폴리스를 넘어 인류를 하나로 보는 세계 시민주의와 개인주의가 발달.' },
        { label: '스토아 · 에피쿠로스 학파', def: '스토아 학파(욕망 억제·이성적 삶)와 에피쿠로스 학파(마음의 안정·개인의 행복)가 등장.' },
        { label: '헬레니즘 과학', def: '아르키메데스(부력의 원리)·에우클레이데스(기하학)·에라토스테네스(지구 둘레)·아리스타르코스(태양중심설).' },
        { label: '헬레니즘 예술', def: '「라오콘 군상」·「밀로의 비너스」 등 인간의 육체미·감정을 사실적·관능적으로 표현. 인도 간다라 미술에 영향.' }
      ],
      timeline: [
        { y: -336, label: '◆ 알렉산드로스 즉위 → 동방 원정' },
        { y: -333, label: '이소스 전투 — 다리우스 3세 격파' },
        { y: -331, label: '가우가멜라 전투 — 페르시아군 격파 (BCE 330 멸망)' },
        { y: -323, label: '알렉산드로스 사망 → 제국 분열' }
      ]
    },
    notes: {
      sections: [
        {
          head: 'I. 알렉산드로스 (BCE 336~323)',
          list: [
            '마케도니아 왕 필리포스 2세 암살',
            '   → 아들 알렉산드로스 왕위 등극',
            '동방 원정',
            '아케메네스 조 페르시아 정복',
            '   → 이소스 전투 (BCE 333)',
            '   → 가우가멜라 전투 (BCE 331)',
            '이집트 정복, 인더스 강 유역 진출',
            '   → 유럽-아시아-아프리카 아우르는 대제국 건설'
          ]
        },
        {
          head: 'II. 동서융합 정책',
          list: [
            '알렉산드리아',
            '  · 정복지에 그리스식 도시 건설',
            '  · 그리스인 이주 → 그리스 문화 동방 전파',
            '  · 그리스인과 현지인 혼인 장려',
            '오리엔트(페르시아)식 전제 군주제 도입',
            '   = 강력한 왕권 행사',
            '피정복민의 전통 및 관습 존중, 동방 풍습 수용'
          ]
        },
        {
          head: 'III. 멸망',
          list: [
            '알렉산드로스 사망',
            '   → 마케도니아·시리아·이집트로 분열',
            '   → 로마에 멸망'
          ]
        },
        {
          head: '◆ 헬레니즘 문화 — I. 세계시민주의',
          list: [
            '그리스 문화 + 오리엔트 문화',
            '그리스 문화 기반, 오리엔트 문화권과의 교류',
            '이집트 알렉산드리아·시리아 안티오크 등',
            '   → 새로운 문화 중심지 대두'
          ]
        },
        {
          head: '◆ 헬레니즘 문화 — II. 철학',
          list: [
            '스토아 학파: 욕망 억제, 이성적 삶 추구',
            '에피쿠로스 학파',
            '  · 개인 행복을 위한 심적 안정·만족'
          ]
        },
        {
          head: '◆ 헬레니즘 문화 — III. 과학 발달',
          list: [
            '물리학: 아르키메데스 부력의 원리',
            '수학: 에우클레이데스 기하학',
            '천문학',
            '  · 에라토스테네스: 지구 자오선 측정',
            '  · 아리스타르코스: 태양중심설'
          ]
        },
        {
          head: '◆ 헬레니즘 문화 — IV. 예술',
          list: [
            '감정과 격정·육체미와 외양 강조',
            '   = 사실적·관능적',
            '「밀로의 비너스」, 「라오콘 군상」, 「사모트라케의 니케」',
            '인도 간다라 미술 성립에 영향',
            '로마에 수용되어 서양 고전 문화 완성에 기여'
          ]
        }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '알렉산드로스의 동방 원정',
        src: 'assets/w1/고대/유럽·미주/알렉산드로스 제국/알렉산드로스의 동방 원정.jpg',
        citation: '— 코끼리 머리 장식을 한 청동상(메트로폴리탄 박물관) · 정복 지역의 특색을 담아 자신의 정치적 권위를 상징한 유물. 인더스강~이집트에 이르는 대제국 건설을 과시' },
      { kind: '탐구 자료', title: '헬레니즘 문화의 조각상',
        src: 'assets/w1/고대/유럽·미주/알렉산드로스 제국/헬레니즘 문화의 조각상.jpg',
        citation: '— 「라오콘 군상」(바티칸 미술관)·「밀로의 비너스」(루브르 박물관) · 인간의 육체미와 감정을 사실적·관능적으로 표현. 북인도로 전파되어 간다라 미술 탄생에 영향' }
    ],
    artifacts: [
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/알렉산드로스 제국/[비상교육] 고등_세계사_1-3_49p_알렉산드로스 제국의 영토.jpg',
        caption: '알렉산드로스 제국의 영토',
        ref: '비상교육 세계사 1-3, p.49 — 제국의 초기 영역·최대 영역, 알렉산드로스의 원정로와 주요 전투지·알렉산드리아' },
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/알렉산드로스 제국/미래엔_세계사_이미지_46쪽_알렉산드로스.JPG',
        caption: '알렉산드로스의 정복 활동',
        ref: '미래엔 세계사 1, p.46 — 이소스·가우가멜라 전투와 인더스강까지 이어진 동방 원정로' },
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/알렉산드로스 제국/라오콘 군상.jpg',
        caption: '라오콘 군상',
        ref: '트로이의 제사장 라오콘과 두 아들이 바다뱀에 물려 죽는 장면. 헬레니즘 조각의 역동성과 격정을 대표 (바티칸 미술관)' },
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/알렉산드로스 제국/밀로의 비너스.jpg',
        caption: '밀로의 비너스',
        ref: '아프로디테로 추정되는 조각상. 1820년 밀로스섬에서 발견. 동적인 실루엣과 관능미로 헬레니즘 시대를 대표 (루브르 박물관)' }
    ],
    linked: ['w-peloponnesian', 's-persia', 's-magadha']
  },

  // ============================================================
  // 로마 (w-rome-found 노드) — 건국·공화정·제정·문화 전체
  // ============================================================
  'w-rome-found': {
    syncRatio: 0.94,
    fileRef: 'WN · 세계사 연표(정리 탭) / W1 · 미래엔 세계사 1',
    overview: {
      summary: '로마 — 이탈리아 중부 라티움의 작은 도시 국가에서 출발하여 공화정과 제정을 거쳐 지중해 일대를 통일한 고대 제국(건국 BCE 753 → 공화정 BCE 509 → 제정 BCE 27 → 395 동·서 분열 → 476 서로마 멸망). 로마 문화는 대제국 통치에 필요한 법률·토목·건축 등 실용적 분야에서 특히 발달하였다. 법률은 최초의 성문법인 12표법(관습법 성문화)에서 로마 시민을 위한 시민법으로, 다시 제국 안 모든 민족에게 적용되는 만민법으로 확대되었고, 6세기 비잔티움 제국에서 『유스티니아누스 법전』으로 집대성되어 후대 유럽 법의 토대가 되었다. 토목·건축에서는 계획도시와 도로망(「모든 길은 로마로 통한다」), 원형 경기장(콜로세움)·공중목욕탕·개선문·수도교를 남겼다. 문학은 키케로의 산문과 베르길리우스의 서사시 등 라틴 문학이, 철학은 마르쿠스 아우렐리우스의 『명상록』으로 대표되는 스토아 철학이 발달하였다. 역사서로는 카이사르 『갈리아 전기』, 리비우스 『로마사』, 타키투스 『게르마니아』, 플루타르코스 『영웅전』이 있고, 과학에서는 프톨레마이오스의 천동설이 나왔다. 이처럼 로마는 그리스·헬레니즘 문화를 수용해 실용성을 더함으로써 고전 문화를 완성하여 서양 문화의 원류가 되었다.',
      terms: [
        { label: '실용적 문화', def: '대제국 통치에 필요한 법률·토목·건축 등 실용 분야를 중심으로 발달한 로마 문화의 성격.' },
        { label: '12표법 → 시민법 → 만민법', def: '최초의 성문법 12표법(관습법 성문화) → 로마 시민을 위한 시민법 → 제국 안 모든 민족에게 적용된 만민법으로 확대.' },
        { label: '유스티니아누스 법전', def: '6세기 비잔티움 제국에서 로마법을 집대성 → 후대 유럽 법 체계의 토대.' },
        { label: '도로망', def: '「모든 길은 로마로 통한다」. 아피우스 가도 등 군사·행정용 포장 도로와 계획도시·수도교·공중목욕탕.' },
        { label: '스토아 철학', def: '헬레니즘 시대 스토아 학파를 계승. 마르쿠스 아우렐리우스의 『명상록』이 대표.' },
        { label: '고전 문화 완성', def: '그리스·헬레니즘 문화에 실용성을 더해 고전 문화를 완성 → 서양 문화의 원류.' }
      ],
      timeline: [
        { y: -753, label: '◆ 로마 건국' },
        { y: -509, label: '공화정 수립' },
        { y: -27, label: '제정 시작' },
        { y: 395, label: '동·서 분열' },
        { y: 476, label: '서로마 제국 멸망' }
      ]
    },
    notes: {
      sections: [
        {
          head: 'I. 건국',
          list: [
            '이탈리아 중부 라티움 지방, 도시 국가',
            '초대 왕 로물루스에 의해 건국'
          ]
        },
        {
          head: '◆ 로마 문화 — I. 실용주의',
          list: [
            '그리스 및 헬레니즘 문화 수용',
            '법률·토목·건축 발달'
          ]
        },
        {
          head: '◆ 로마 문화 — II. 법률',
          list: [
            '12표법 → 시민법 → 만민법',
            '12표법: 관습법 성문화',
            '시민법: 로마 시민에게 적용되는 법',
            '만민법: 제국 전역 자유인에게 시민권을 부여 → 법 적용'
          ]
        },
        {
          head: '◆ 로마 문화 — III. 토목 및 건축',
          list: [
            '판테온 신전, 원형 경기장(콜로세움)',
            '아피우스 가도, 수도교 등'
          ]
        },
        {
          head: '◆ 로마 문화 — IV. 문학',
          list: [
            '키케로의 산문',
            '베르길리우스의 서사시 등'
          ]
        },
        {
          head: '◆ 로마 문화 — V. 스토아 철학',
          list: [
            '헬레니즘 시대 스토아 학파의 영향',
            '마르쿠스 아우렐리우스의 『명상록』'
          ]
        },
        {
          head: '◆ 로마 문화 — VI. 역사',
          list: [
            '리비우스 『로마사』',
            '플루타르코스 『영웅전』',
            '카이사르 『갈리아 전기』',
            '타키투스 『게르마니아』'
          ]
        },
        {
          head: '◆ 로마 문화 — VII. 과학',
          list: [
            '프톨레마이오스의 천동설'
          ]
        }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '로마법의 발전',
        src: 'assets/w1/고대/유럽·미주/로마/[비상교육] 고등_세계사_1-3_52p_로마법의 발전.jpg',
        citation: '— 비상교육 세계사 1-3, p.52 · 관습법(불문법) → 12표법(로마 최초의 성문법) → 시민법(로마 시민을 위한 법) → 만민법(제국 안의 모든 민족에게 적용)' },
      { kind: '탐구 자료', title: '12표법의 의의',
        src: 'assets/w1/고대/유럽·미주/로마/12표법의 의의.png',
        citation: '— 키케로, 『연설가에 대하여』 · 12표법은 모든 법의 원천이며, 권위의 비중과 유용성의 풍부함에서 그리스 철학자들의 모든 저술을 합친 것보다 소중하다' }
    ],
    artifacts: [
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/로마/[비상교육] 고등_세계사_1-3_52p_포로 로마노.jpg',
        caption: '포로 로마노',
        ref: '비상교육 세계사 1-3, p.52 — 로마의 정치·종교·상업 중심 광장. 신전과 개선문 유적' },
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/로마/[비상교육] 고등_세계사_1-3_52p_콜로세움.jpg',
        caption: '콜로세움',
        ref: '비상교육 세계사 1-3, p.52 — 5만여 명을 수용한 원형 경기장. 아치와 콘크리트를 활용한 실용 건축' },
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/로마/[비상교육] 고등_세계사_1-3_52p_아피우스 가도.jpg',
        caption: '아피우스 가도',
        ref: '비상교육 세계사 1-3, p.52 — 「모든 길은 로마로 통한다」. 군사·행정용으로 놓인 포장 도로' },
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/로마/수도교.jpg',
        caption: '수도교',
        ref: '퐁 뒤 가르(프랑스) — 도시에 물을 공급한 로마의 토목 기술. 3층 아치 구조' },
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/로마/판테온 신전 내부.jpg',
        caption: '판테온 신전',
        ref: '모든 신에게 바친 로마의 신전. 지름 43m의 거대한 돔과 천장 채광창(오쿨루스) — 콘크리트·아치 공법의 정수' }
    ],
    linked: ['w-rome-rep', 'w-rome-emp', 'w-punic', 'w-jesus', 'w-edict', 'w-split', 'w-fall', 'w-polis']
  },

  // ============================================================
  // 크리스트교 등장
  // ============================================================
  'w-jesus': {
    syncRatio: 0.91,
    fileRef: 'WN · 세계사 연표(정리 탭) / W1 · 미래엔 세계사 1',
    overview: {
      summary: '크리스트교의 성립과 확산 — 로마 지배 아래 팔레스타인에서 등장한 예수가 민족과 신분을 초월한 신의 사랑·평등·인간애를 설파하며 시작된 종교. 유대교의 배타적 선민사상과 형식적 율법주의를 비판한 예수는 기득권층의 미움을 받아 십자가형으로 처형되었으나, 그가 부활하여 인류를 구원할 메시아(그리스도)라는 믿음이 퍼졌다. 베드로·바울 등 사도들의 전도로 신분과 민족을 넘어 노예·여성·하층민을 중심으로 빠르게 확산되었다. 다신교 국가였던 로마는 처음에 크리스트교를 용인하였으나, 신자들이 황제 숭배를 우상 숭배라며 거부하자 박해하기 시작하였다. 그럼에도 신자들은 지하 묘지인 카타콤에서 예배를 이어 가며 교세를 넓혔다. 결국 콘스탄티누스 대제가 밀라노 칙령(313)으로 신앙을 공인하고, 니케아 공의회(325)를 소집해 성부·성자·성령이 본질상 하나라는 삼위일체의 아타나시우스파를 정통으로, 예수의 신성을 부정한 아리우스파를 이단으로 규정하여 교리를 통일하였다. 이후 테오도시우스 황제가 국교로 선포(392)하면서 크리스트교는 세계적 종교로 발전해 서양 문화의 정신적 바탕이 되었다.',
      terms: [
        { label: '예수', def: '민족과 신분을 초월한 사랑·평등·인간애를 설파한 크리스트교의 창시자. 십자가형으로 순교.' },
        { label: '메시아(그리스도)', def: '인류를 구원할 구세주. 예수를 그리스도로 믿는 신앙이 교리의 핵심.' },
        { label: '사도 바울', def: '이방인에게 적극적으로 전도하여 크리스트교를 제국 전역에 확산시킨 사도.' },
        { label: '카타콤', def: '박해 시기 신자들이 지하 10~15m에 무덤·복도·방을 만들어 예배를 드린 지하 묘지. 종교적 열정을 담은 그림을 남김.' },
        { label: '밀라노 칙령(313)', def: '콘스탄티누스 대제가 크리스트교를 비롯한 모든 종교의 신앙을 공인한 칙령.' },
        { label: '니케아 공의회(325)', def: '콘스탄티누스가 소집한 공의회. 삼위일체의 아타나시우스파를 정통으로, 예수의 신성을 부정한 아리우스파를 이단으로 규정.' },
        { label: '삼위일체설', def: '성부·성자·성령이 본질상 하나라는 주장. 아타나시우스파는 예수를 인간인 동시에 완전한 신으로 봄(아리우스파는 성자를 성부에 종속된 존재로 봄).' },
        { label: '국교화(392)', def: '테오도시우스 황제가 크리스트교를 로마의 국교로 선포 → 세계적 종교로 발전.' }
      ],
      timeline: [
        { y: 30,  label: '◆ 예수 처형 → 크리스트교 성립' },
        { y: 313, label: '밀라노 칙령 — 신앙 공인 (콘스탄티누스)' },
        { y: 325, label: '니케아 공의회 — 아타나시우스파(삼위일체) 정통' },
        { y: 392, label: '테오도시우스 — 로마 국교화' }
      ]
    },
    notes: {
      sections: [
        {
          head: 'I. 유대교',
          list: [
            '팔레스타인의 유일신 종교',
            '「메시아」의 등장에 따른 구원 사상',
            '선민 사상, 율법주의 추구'
          ]
        },
        {
          head: 'II. 예수의 등장과 크리스트교 성립',
          list: [
            '유대교의 배타적 선민 사상과 율법주의 비판',
            '신분과 민족을 초월한 인간애, 보편적 사랑과 평등',
            '예수 사후 그의 가르침이 전파 → 크리스트교 성립',
            '베드로·바울 등의 선교 활동 → 로마로 확산'
          ]
        },
        {
          head: 'III. 박해',
          list: [
            '크리스트교도의 황제 숭배 거부 → 로마 제국의 박해 시작',
            '크리스트교의 저항과 교세 확산'
          ]
        },
        {
          head: 'IV. 콘스탄티누스 황제',
          list: [
            '밀라노 칙령 (313)으로 크리스트교 공인',
            '니케아 공의회 (325)에서 아타나시우스파 교리(삼위일체설)를 정통으로 인정'
          ]
        },
        {
          head: 'V. 테오도시우스 황제',
          list: [
            '크리스트교 국교 선포 (392)'
          ]
        }
      ]
    },
    sources: [],
    artifacts: [
      { slot: 'auto',
        src: 'assets/w1/고대/유럽·미주/크리스트교/제1차 니케아 공의회.jpg',
        caption: '니케아 공의회 (325)',
        ref: '콘스탄티누스 황제가 소집한 공의회. 삼위일체를 인정한 아타나시우스파를 정통으로, 아리우스파를 이단으로 규정하여 교리를 통일' }
    ],
    linked: ['s-hebrew', 'w-rome-found', 'w-edict', 'w-split']
  },

  // ============================================================
  // 조몬 시대 (縄文時代, BCE 10세기 ~ BCE 3세기) — 일본 신석기 문화
  //   출처: WN p.5 / DA 동아시아 역사 기행
  // ============================================================
  'e-jomon': {
    syncRatio: 0.85, fileRef: 'WN · 세계사 연표(정리 탭) p.5 / DA · 동아시아 역사 기행',
    notes: {
      sections: [
        {
          head: '조몬 시대 (縄文時代, 약 1만 년 전 ~ BCE 3세기경)',
          list: [
            '신석기 문화 — 조몬 토기와 간석기 사용',
            '본격 농경보다 사냥·채집·어로 중심 〈동아시아 역사 기행〉',
            '  · 풍부한 자연 자원 → 정착 생활·패총(貝塚) 형성',
            'BCE 3세기경부터 한반도 등지에서 벼농사 기술과 청동기·철기 전파 → 야요이 시대'
          ]
        }
      ]
    },
    overview: {
      summary:
        '조몬 시대(縄文時代, 약 1만 년 전 ~ BCE 3세기경) — 일본 열도의 신석기 문화로 일본 역사의 시작점. 빙하기 후 풍부해진 도토리·밤·도미·연어 등 풍요로운 자연 자원에 기반하여 본격적인 농경 이전부터 **정착 생활**을 시작하였다. 새끼줄(縄)을 굴려 무늬(文)를 낸 **조몬 토기**가 시대 이름의 어원. 동아시아 해양 세계의 한 갈래로 어로·조개 채취가 발달해 거대한 패총(貝塚)이 형성되었다. 산나이마루야마(아오모리현) 등 대규모 정착지 유적. BCE 3세기경부터 한반도 등지에서 벼농사 기술과 청동기·철기가 전파되어 야요이 시대가 전개되었다.',
      terms: [
        { label: '조몬 토기', def: '새끼줄(縄)을 굴려 무늬(文)를 낸 토기. 시대 이름의 어원.' },
        { label: '간석기',    def: '돌을 갈아 만든 신석기 시대 도구.' }
      ],
      timeline: [
        { yl: '약 1만 년 전 ~', label: '◆ 조몬 토기로 대표되는 신석기 문화' },
        { yl: '3세기 BCE경', label: '벼농사·청동기·철기 전파 → 야요이 시대' }
      ]
    },
    sources: [
      { kind: '정리 자료', title: '조몬 시대의 특징', body: '신석기 문화, 조몬 토기와 간석기 사용, 농경 시작.', citation: '— WN p.5' }
    ],
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/동아시아/조몬 시대/조몬 토기.png',
        caption: '조몬 토기',
        ref: '새끼줄(縄)을 굴려 무늬(文)를 낸 일본 신석기 시대의 대표 토기' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/조몬 시대/조몬 토우.png',
        caption: '조몬 토우(土偶)',
        ref: '조몬 시대의 점토 인형. 다산·풍요·주술적 의미.' }
    ],
    linked: ['e-yayoi', 'e-neolithic', 'k-neolithic']
  },

  // ============================================================
  // 아스카 시대 (飛鳥時代, 538 ~ 710) — 쇼토쿠 태자와 다이카 개신
  //   출처: WN p.5, p.45 / DA 동아시아 역사 기행
  // ============================================================
  'e-asuka': {
    syncRatio: 0.92, fileRef: 'WN · 세계사 연표(정리 탭) p.5, p.45 / DA · 동아시아 역사 기행',
    notes: {
      sections: [
        {
          head: '一. 쇼토쿠 태자 (聖徳太子, 574~622)',
          list: [
            '스이코 천황의 섭정 (593년 부터)',
            '중앙 집권 강화, 불교 진흥책 실시',
            '17조 헌법 (604) — 관료의 도덕적 행동 강령, 유교·불교 사상 반영',
            '관위 12계 (603) — 능력에 따른 12등급 인재 등용 제도',
            '견수사 파견 (607, 오노노 이모코) — 수의 율령·불교·문물 수용',
            '호류사(法隆寺) 건립 — 세계 최고(最古) 목조 건축의 하나',
            '신불습합 — 신토(神道)와 불교의 융합'
          ]
        },
        {
          head: '二. 다이카 개신 (大化改新, 645)',
          list: [
            '견수사·견당사를 통한 중국 문물 수용',
            '당의 율령 체제 도입',
            '국왕 중심 중앙 집권 체제, 연호 다이카',
            '국호 일본, 천황 칭호 사용'
          ]
        }
      ]
    },
    overview: {
      summary: '아스카 시대(飛鳥時代, 538 ~ 710) — 538년 백제로부터 불교 전래로 시작. 쇼토쿠 태자(593~622)가 중앙집권 강화와 불교 진흥(호류사 건립, 17조 헌법, 관위 12계). 645년 다이카 개신으로 당의 율령 체제 도입, 국호 「일본」·「천황」 칭호 사용 시작.',
      terms: [
        { label: '쇼토쿠 태자',   def: '스이코 천황의 섭정. 17조 헌법·관위 12계·견수사 파견.' },
        { label: '호류사(法隆寺)', def: '쇼토쿠 태자가 건립한 사찰. 세계 최고(最古) 목조 건축의 하나.' },
        { label: '신불습합',      def: '신토(神道)와 불교의 융합. 일본 종교 문화의 특징.' },
        { label: '다이카 개신',   def: '645년 나카노오에 황자가 소가씨를 제거하고 당의 율령제를 모방한 개혁.' },
        { label: '연호 다이카',   def: '일본 최초의 연호. 645년 사용 시작.' },
        { label: '천황(天皇)',    def: '다이카 개신 이후 정착한 일본 군주의 칭호.' }
      ],
      timeline: [
        { y: 538, label: '◆ 백제로부터 불교 전래 — 아스카 시작' },
        { y: 593, label: '쇼토쿠 태자 섭정 시작' },
        { y: 604, label: '17조 헌법 제정' },
        { y: 645, label: '다이카 개신' },
        { y: 690, yl: '7세기 CE 말', label: '국호 「일본」·칭호 「천황」 사용 시작' },
        { y: 710, label: '나라 천도 → 나라 시대로 이행' }
      ]
    },
    sources: [
      { kind: '정리 자료', title: '쇼토쿠 태자의 업적', body: '중앙 집권 강화·불교 진흥책·호류사 건립·신불습합.', citation: '— WN p.5' },
      { kind: '정리 자료', title: '다이카 개신', body: '견수사·견당사를 통한 중국 문물 수용, 당의 율령 체제 도입, 국왕 중심 중앙 집권, 연호 다이카·국호 일본·천황 칭호.', citation: '— WN p.5' }
    ],
    map: { title: '아스카 시대 — 야마토와 아스카', bounds: { w: 360, h: 240 },
      regions: [{ d: 'M 60 60 L 280 50 L 320 130 L 280 200 L 100 200 L 50 130 Z', label: '일본 열도' }],
      pins: [
        { x: 175, y: 120, label: '아스카',  sub: '쇼토쿠 태자', amber: true },
        { x: 180, y: 125, label: '호류사',  sub: '세계 최고 목조' }
      ], arrows: []
    },
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/동아시아/아스카 시대/이미지 2026. 6. 1. 13.30.png',
        caption: '일본 고대 국가의 발전',
        ref: '아스카·나라·헤이안 시대 도읍지와 야마타이국 등 일본 고대 국가의 전개' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/아스카 시대/KakaoTalk_Photo_2026-06-01-13-58-31.jpeg',
        caption: '쇼토쿠 태자',
        ref: '스이코 천황의 섭정. 17조 헌법·관위 12계·견수사 파견·불교 진흥.' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/아스카 시대/[비상교육] 고등_동아시아 역사 기행_2-2_53p_호류사 5층 목탑.jpg',
        caption: '호류사(法隆寺) 5층 목탑',
        ref: '비상교육 동아시아 역사 기행 p.53 — 세계 최고(最古) 목조 건축의 하나' }
    ],
    linked: ['e-yamato', 'e-nara', 'e-tang', 'k-baekje']
  },

  // ============================================================
  // 위·진·남북조 시대 (220~589) — 묶음 라벨 클릭으로 표시되는 통합 노드
  // ============================================================
  'e-wei-jin-nbc': {
    syncRatio: 0.92,
    fileRef: 'W1 · 미래엔 세계사 1 / DA · 동아시아 역사 기행 III단원 (인구 이동과 문화 교류)',
    notes: {
      sections: [
        {
          head: '북조',
          list: [
            '화북 지역, 북방 민족에 의해 점령',
            '북위의 통일로 안정기'
          ]
        },
        {
          head: '북위',
          list: [
            '一. 건국',
            '  · 선비족(탁발씨)의 화북 통일(439)',
            '二. 효문제(471~499)',
            '  · 한화 정책 = 호한융합',
            '  · 평성에서 뤄양으로 천도',
            '  · 한족 성씨 사용, 한족과 결혼 장려, 호복 금지',
            '  · 효문제 사후 한화 정책에 대한 반발 → 내분',
            '三. 균전제(485) = 가장 중요',
            '  · 일정 나이 이상 남녀에게 토지 지급',
            '  · 수·당 율령 체제로 계승'
          ]
        },
        {
          head: '동진',
          list: [
            '수도 건강',
            '창장강 이남 지역(강남) 진출'
          ]
        },
        {
          head: '一. 경제',
          list: [
            '한족의 강남 이주 증가, 벼농사 보급 → 경제력 향상'
          ]
        },
        {
          head: '二. 9품중정제',
          list: [
            '중정관이 9등급 평가를 통해 추천하여 관직 등용',
            '호족 세력의 관직 독점 → 문벌 귀족 사회 형성'
          ]
        },
        {
          head: '三. 문화',
          list: [
            '북조: 유목민의 강건한 기풍',
            '  · 국가적 유교 존중',
            '  · 불교: 문벌 귀족의 보호로 발전 → 윈강·룽먼 석굴 사원',
            '남조: 문벌 귀족 사회',
            '  · 노장·청담 사상 → 현실 도피적 성향, 죽림칠현',
            '  · 민간 신앙 + 도가 사상 = 도교'
          ]
        }
      ]
    },
    overview: {
      summary:
        '위·진·남북조 시대(220~589) — 한(漢) 멸망 후 약 370년의 분열기. 위·촉·오 삼국(220~280), 서진의 일시 통일(280~316), 5호 16국·동진의 남북 분열, 북위의 화북 통일(439)을 거쳐 남북조 시대로 이어졌다. 5호의 화북 정착과 한족의 강남 이주로 동아시아 사상 최대 규모의 **인구 이동**과 **호한 융합**이 일어났으며, 북위 효문제의 한화 정책(낙양 천도·균전제·삼장제)은 후일 수·당 율령 체제의 직접적 토대가 되었다. 불교가 호국 종교로 융성하여 윈강·룽먼 석굴이 조영되고 한반도·일본으로 전파되었다. 589년 수(隋)의 재통일로 종결.',
      terms: [
        { label: '9품중정제(구품관인법)', def: '위 진군의 인재 등용 제도. 9등급으로 인물을 평가 → 문벌 귀족 사회의 토대.' },
        { label: '8왕의 난', def: '서진 황실 종친 8명이 권력을 다툰 내란(291~306). 서진 쇠퇴의 결정적 원인.' },
        { label: '5호',     def: '흉노·갈·선비·저·강. 화북에 침입한 북방 유목민.' },
        { label: '호한 융합', def: '호족(이민족)과 한족의 문화·제도가 융합되는 과정.' },
        { label: '균전제',   def: '북위 효문제가 시행한 토지 분배제도. 수·당에 계승.' },
        { label: '효문제의 한화 정책', def: '북위 효문제(471~499)의 낙양 천도·호한 혼인·중국식 성씨 정책.' },
        { label: '윈강·룽먼 석굴', def: '북위의 대표 불교 석굴 미술. 동아시아 호국 불교 미술의 원형.' }
      ],
      timeline: [
        { y: 220, label: '◆ 위 건국 — 한 헌제 선양 (대표 표기)' },
        { y: 280, label: '서진의 천하 통일' },
        { y: 304, label: '5호 16국 시대 개막' },
        { y: 316, label: '서진 멸망 (영가의 난)' },
        { y: 386, label: '북위 건국 — 탁발규' },
        { y: 439, label: '북위 화북 통일 → 남북조 시대' },
        { y: 493, label: '북위 효문제 낙양 천도' },
        { y: 589, label: '수의 재통일 → 시대 종결' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '남조의 문화',
        src: 'assets/w1/고대/동아시아/위·진·남북조 시대/이미지 2026. 5. 28. 14.29.png',
        citation: '— 도연명 「귀거래사」 · 강남으로 피난한 한족 사대부의 청담·전원 문화' }
    ],
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/동아시아/위·진·남북조 시대/미래엔_세계사_이미지_27쪽_남북조_시대.JPG',
        caption: '남북조 시대 영역도',
        ref: '미래엔 세계사 p.27 — 남북조 시대 영역도' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/위·진·남북조 시대/[비상교육] 고등_세계사_1-2_32p_위진 남북조 시대의 왕조 변화.jpg',
        caption: '위·진·남북조 시대의 왕조 변화',
        ref: '교과서 자료 — 위·진·남북조 시대의 왕조 변천' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/위·진·남북조 시대/[비상교육] 고등_동아시아 역사 기행_2-2_52p_윈강 석굴 대불.jpg',
        caption: '윈강 석굴',
        ref: '비상교육 동아시아 역사 기행 p.52 — 윈강 석굴 대불' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/위·진·남북조 시대/이미지 2026. 5. 28. 14.31.png',
        caption: '룽먼 석굴',
        ref: '교과서 자료 — 룽먼(용문) 석굴 사원' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/동진/이미지 2026. 5. 28. 14.31 (1).png',
        caption: '고개지, 「여사잠도」',
        ref: '교과서 자료 — 동진 고개지(顧愷之)의 「여사잠도(女史箴圖)」' }
    ],
    linked: ['e-han-end', 'e-3kingdoms', 'e-jin', 'e-wuhu', 'e-beiwei', 'e-dongjin', 'e-sui']
  },

  // ============================================================
  // 위(魏) — 위·진·남북조 시대의 첫 왕조
  // ============================================================
  'e-3kingdoms': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.88,
    fileRef: 'W1 · 미래엔 세계사 1 / DA · 동아시아 역사 기행',
    overview: {
      summary:
        '위(魏)·촉(蜀)·오(吳) 삼국 시대(220~280) — 220년 조비가 한 헌제로부터 선양받아 위를 건국하면서 시작. 유비의 촉한·손권의 오와 함께 60년간 삼분(三分). 위는 화북, 촉은 사천, 오는 강남을 기반으로 정립(鼎立). 동아시아 한자 문화권의 분열기이지만, 위가 책봉을 통해 일본 야마타이국 등과 관계 맺으며 중국 중심 동아시아 질서는 유지되었다. 280년 서진(西晉)이 통일.',
      terms: [
        { label: '조비',     def: '위의 초대 황제. 한 헌제로부터 선양받아 위 건국(220).' },
        { label: '유비',     def: '촉한의 건국자. 한 황실 종친을 자처.' },
        { label: '손권',     def: '오의 건국자. 강남 지역 호족 기반.' },
        { label: '9품중정제(구품관인법)', def: '위 진군의 인재 등용 제도. 후일 문벌 귀족 형성의 토대.' }
      ],
      timeline: [
        { y: 220, label: '◆ 위 건국 — 한 헌제 선양 (대표 표기)' },
        { y: 221, label: '촉한 건국' },
        { y: 222, label: '오 건국' },
        { y: 239, label: '히미코 위에 사신 — 친위왜왕' },
        { y: 263, label: '촉한 멸망 (위에 항복)' },
        { y: 265, label: '서진 건국 (위→진 선양)' },
        { y: 280, label: '서진의 천하 통일' }
      ]
    },
    linked: ['e-later-han', 'e-jin', 'e-yayoi']
  },

  // ============================================================
  // 서진(西晉) — 단명한 통일 왕조
  // ============================================================
  'e-jin': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    syncRatio: 0.84,
    fileRef: 'W1 · 미래엔 세계사 1',
    overview: {
      summary:
        '서진(西晉, 265~316) — 사마염(무제)이 위의 황위를 선양받아 건국, 280년 오를 멸하고 60년 분열을 통일. 점전제·과전제로 토지 제도 정비. 그러나 호족 정치와 황실 외척의 권력 다툼, 8왕의 난(291~)으로 곧 쇠퇴. 흉노·선비 등 북방 5호(五胡)가 화북에 침입하여 316년 멸망. 한족은 남쪽으로 피난하여 동진(東晉)을 세우고, 화북은 5호 16국 시대로 들어선다 — 동아시아 사상 최대의 인구 이동기.',
      terms: [
        { label: '사마염',   def: '서진의 창건자(무제). 위 황실에서 선양받음.' },
        { label: '8왕의 난', def: '291~306년 황실 종친 8명이 황권을 다툰 내란. 서진 쇠퇴의 결정적 원인.' },
        { label: '5호',      def: '흉노·갈·선비·저·강. 화북에 침입한 북방 유목민.' },
        { label: '영가의 난', def: '316년 흉노가 낙양·장안을 함락한 사건. 서진 멸망.' }
      ],
      timeline: [
        { y: 265, label: '◆ 서진 건국 — 사마염 즉위 (대표 표기)' },
        { y: 280, label: '오 멸망 → 천하 통일' },
        { y: 291, label: '8왕의 난 시작' },
        { y: 304, label: '5호 16국 시대 개막' },
        { y: 316, label: '서진 멸망 — 영가의 난' },
        { y: 317, label: '동진(東晉) 성립 — 강남 한족 정권' }
      ]
    },
    linked: ['e-3kingdoms', 'e-wuhu']
  },

  // ============================================================
  // 5호 16국 — 동아시아 인구 이동기
  // ============================================================
  'e-wuhu': {
    syncRatio: 0.85,
    fileRef: 'W1 · 미래엔 세계사 1 / DA · 동아시아 역사 기행 III단원 (인구 이동과 문화 교류)',
    notes: {
      sections: [
        {
          head: '5호 16국',
          list: [
            '흉노·선비·갈·저·강',
            '화북 진출 → 16국 건국'
          ]
        }
      ]
    },
    overview: {
      summary:
        '5호 16국(五胡十六國, 304~439) — 흉노·갈·선비·저·강의 5호가 화북에 16개 왕조를 세운 분열기. 한족 일부는 남쪽 동진(東晉)으로 피난하여 강남 개발이 본격화되었다. 이 대규모 인구 이동으로 화북에서는 호한 융합이 진행되어 후일 균전제·부병제 같은 호한 융합형 제도의 토대가 마련되었으며, 강남에서는 한족 문화가 자리잡아 양쯔강 유역이 새로운 농경·문화 중심지로 부상하였다. 439년 북위(北魏)가 화북을 통일하면서 남북조 시대로 이행.',
      terms: [
        { label: '5호',         def: '흉노·갈·선비·저·강 5개 유목 민족.' },
        { label: '호한 융합',    def: '호족(이민족)과 한족의 문화·제도가 융합되는 과정.' },
        { label: '강남 개발',    def: '한족이 양쯔강 유역으로 이주하며 농경 발달. 일본·한반도로 문화 전파의 기반.' },
        { label: '균전제',       def: '북위 효문제가 시행. 호한 융합형 토지 제도. 수·당에 계승.' }
      ],
      timeline: [
        { y: 304, label: '◆ 5호 16국 시대 개막 (대표 표기)' },
        { y: 317, label: '동진 성립 — 강남 한족 정권' },
        { y: 386, label: '북위(선비 탁발씨) 건국' },
        { y: 439, label: '북위의 화북 통일 → 남북조 시대 개막' }
      ]
    },
    linked: ['e-jin', 'e-beiwei']
  },

  // ============================================================
  // 북위(北魏) — 화북 통일·한화 정책·균전제
  // ============================================================
  'e-beiwei': {
    syncRatio: 0.90,
    fileRef: 'W1 · 미래엔 세계사 1 / DA · 동아시아 역사 기행 III단원',
    notes: {
      sections: [
        {
          head: '一. 건국',
          list: [
            '선비족의 화북 통일'
          ]
        },
        {
          head: '二. 효문제(471~499)',
          list: [
            '한화 정책 = 호한융합',
            '평성에서 뤄양으로 천도',
            '한족 성씨 사용(탁발씨→원씨), 한족과 결혼 장려',
            '선비족 언어·복장(호복) 사용 금지',
            '효문제 사후 한화 정책에 대한 반발',
            '   → 내분 → 동위·서위로 분열'
          ]
        },
        {
          head: '三. 제도 — 수·당 율령 체제의 토대',
          list: [
            '균전제(均田制, 485)',
            '  · 일정 나이 이상의 남녀에게 토지 지급',
            '  · 자영농 육성·세수 확보 → 수·당으로 계승',
            '삼장제(三長制): 향촌 조직 정비 → 호적·세역 관리'
          ]
        },
        {
          head: '四. 문화',
          list: [
            '불교를 통치에 활용 — 황제 권위 강화',
            '  · 윈강·룽먼 석굴 사원 조성',
            '  · 한반도·일본으로 불교 전파의 기반'
          ]
        }
      ]
    },
    overview: {
      summary:
        '북위(北魏, 386~534) — 선비족 탁발규(도무제)가 386년 건국, 439년 태무제가 화북을 통일하여 5호 16국 분열을 종식. **효문제(471~499)의 한화 정책**(낙양 천도·호한 혼인·중국식 성씨·호복 금지)으로 호한 융합을 적극 추진하였다. **균전제**(485)와 삼장제를 시행하여 토지·향촌 조직을 정비, 이는 수·당 율령 체제의 직접적 토대가 되었다. 윈강·룽먼 석굴 등 불교 미술이 융성하였고, 한반도·일본으로 불교 문화가 전파되어 동아시아 호국 불교의 시작점이 되었다. 534년 동위·서위로 분열, 이후 북주의 양견이 수를 건국하면서 통일로 이어진다.',
      terms: [
        { label: '탁발규(도무제)', def: '선비족 탁발부의 지도자. 386년 북위 건국.' },
        { label: '효문제',        def: '북위의 황제. 한화 정책의 주도자.' },
        { label: '한화 정책',      def: '낙양 천도·호한 혼인·중국식 성씨·호복 금지 등 호족의 한화 정책.' },
        { label: '균전제',         def: '농민에게 토지를 균등 분배한 토지 제도(485). 수·당에 계승.' },
        { label: '삼장제',         def: '5가를 1린, 5린을 1리, 5리를 1당으로 묶은 향촌 조직. 호적·세역 관리.' },
        { label: '윈강·룽먼 석굴',  def: '북위의 대표 불교 석굴 미술. 동아시아 호국 불교 미술의 원형.' }
      ],
      timeline: [
        { y: 386, label: '◆ 북위 건국 — 탁발규 (대표 표기)' },
        { y: 439, label: '태무제 화북 통일' },
        { y: 471, label: '효문제 즉위' },
        { y: 485, label: '균전제 시행' },
        { y: 493, label: '낙양 천도' },
        { y: 534, label: '동위·서위로 분열' }
      ]
    },
    sources: [
      { kind: '탐구 자료', title: '북위의 한화 정책 (1)',
        src: 'assets/w1/고대/동아시아/북위/이미지 2026. 5. 28. 14.25.png',
        citation: '— 교과서 탐구 자료' },
      { kind: '탐구 자료', title: '북위의 한화 정책 (2)',
        src: 'assets/w1/고대/동아시아/북위/이미지 2026. 5. 28. 14.26.png',
        citation: '— 교과서 탐구 자료' }
    ],
    artifacts: [
      { slot: 'auto', src: 'assets/w1/고대/동아시아/위·진·남북조 시대/미래엔_세계사_이미지_27쪽_남북조_시대.JPG',
        caption: '남북조 시대',
        ref: '미래엔 세계사 p.27 — 남북조 시대 영역도' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/위·진·남북조 시대/[비상교육] 고등_동아시아 역사 기행_2-2_52p_윈강 석굴 대불.jpg',
        caption: '윈강 석굴',
        ref: '비상교육 동아시아 역사 기행 p.52 — 윈강 석굴 대불' },
      { slot: 'auto', src: 'assets/w1/고대/동아시아/위·진·남북조 시대/이미지 2026. 5. 28. 14.31.png',
        caption: '룽먼 석굴',
        ref: '교과서 자료 — 룽먼(용문) 석굴 사원' }
    ],
    linked: ['e-wuhu', 'e-sui']
  },
  // ============================================================
  // 중세 ~ 현대 신규 노드 104개 (2026-10-02) — 「크리스트교의 성립과 확산」(w-jesus)과 같은 구성
  //   개요(요약·용어·연표)는 교과서 본문 근거. 정리·탐구·자료는 자료 편입 시 채운다
  // ============================================================
  'e-liao': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '거란(요) — 당 멸망 후 5대 10국의 혼란기에 북방에서 성장한 거란족이 916년 세운 나라. 936년 만리장성 이남의 연운 16주를 차지하여 송과 대립하였다. 거란 문자를 만들어 고유의 문화를 지키려 하였다. 고려를 여러 차례 침입하였으며, 1125년 여진족의 금에 멸망하였다.',
      terms: [
        { label: '연운 16주', def: '만리장성 이남의 16개 주. 936년 거란이 차지하여 송과 대립하는 원인이 되었다.' },
        { label: '거란 문자', def: '거란이 고유의 문화를 지키기 위해 만든 문자.' }
      ],
      timeline: [
        { y: 916, label: '◆ 거란 건국' },
        { y: 936, label: '연운 16주 차지' },
        { y: 1125, label: '금에 멸망' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-tang', 'e-song', 'e-jin-jurchen', 'k-goryeo']
  },
  'e-song': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '송 — 당 멸망(907) 후 5대 10국의 혼란 속에서 절도사 조광윤(태조)이 960년 건국하고 카이펑에 도읍하였다. 절도사의 권한을 줄이고 과거제를 정비하여 문치주의를 펼쳤으며, 황제가 직접 시험하는 전시를 실시하였다. 과거를 통해 진출한 사대부가 지배층으로 성장하였다. 군사력이 약해져 거란·서하 등 북방 민족에게 세폐를 보내며 재정이 악화하자 왕안석이 신법을 추진하였다(1069). 1127년 금에 화북을 빼앗긴 뒤 남송으로 이어졌다.',
      terms: [
        { label: '문치주의', def: '무인 대신 학문과 교양을 갖춘 문관을 우대하여 다스리는 정치.' },
        { label: '전시', def: '황제가 직접 주관한 과거의 최종 시험.' },
        { label: '사대부', def: '과거를 통해 관료가 된 지배층. 유교적 교양을 갖추었다.' },
        { label: '왕안석의 신법', def: '재정 악화와 군사력 약화를 해결하려 추진한 개혁(1069).' }
      ],
      timeline: [
        { y: 907, label: '당 멸망 → 5대 10국' },
        { y: 960, label: '◆ 송 건국' },
        { y: 1069, label: '왕안석의 신법' },
        { y: 1127, label: '금에 화북 상실 → 남송' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-tang', 'e-liao', 'e-jin-jurchen', 'e-nansong', 'k-goryeo']
  },
  'e-jin-jurchen': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '금 — 여진의 아구다가 1115년 건국하였다. 1125년 거란(요)을 정복하고 곧이어 송을 공격하여 화북 지역을 차지하였다. 맹안·모극제로 여진족을 군사·행정 조직으로 편제하고, 여진 문자를 만들어 고유의 전통을 지키려 하였다. 고려에 사대를 요구하였다. 이후 남송과 손잡은 몽골의 공격으로 멸망하였다.',
      terms: [
        { label: '맹안·모극제', def: '300호를 1모극, 10모극을 1맹안으로 조직한 여진족의 군사·행정 제도.' },
        { label: '여진 문자', def: '금이 고유의 전통을 지키기 위해 만든 문자.' }
      ],
      timeline: [
        { y: 1115, label: '◆ 금 건국' },
        { y: 1125, label: '거란(요) 정복' },
        { y: 1127, label: '화북 차지 → 송 남천' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-liao', 'e-song', 'e-nansong', 'e-mongol', 'k-goryeo']
  },
  'e-nansong': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '남송 — 12세기 초 여진이 금을 세우고(1115) 요를 무너뜨린 뒤 송을 침입하여, 수도 카이펑을 함락하고 황제를 포로로 끌고 갔다(정강의 변, 1126~1127). 화북 지역을 빼앗긴 송은 왕조를 다시 세우고(남송, 1127) 임안(항저우)을 수도로 정하였다. 남송은 금과 맹약을 맺어 막대한 물자를 보내고 신하를 칭하였으나, 강남 개발에 힘써 경제적으로 번영하였다. 이후 몽골군이 수도 항저우를 함락하였고(1276), 1279년 남송의 저항이 완전히 끝나 원이 중국 전역을 장악하였다.',
      terms: [
        { label: '정강의 변', def: '금이 송의 수도 카이펑을 함락하고 황제를 포로로 끌고 간 사건(1126~1127).' },
        { label: '임안(항저우)', def: '남송의 수도.' },
        { label: '맹약', def: '금과 남송이 맺은 약속. 남송은 금에 막대한 물자를 보내고 신하를 칭하였다.' }
      ],
      timeline: [
        { y: 1115, label: '여진, 금 건국' },
        { y: 1126, label: '정강의 변' },
        { y: 1127, label: '◆ 남송 성립' },
        { y: 1276, label: '몽골군, 항저우 함락' },
        { y: 1279, label: '남송 멸망' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-song', 'e-jin-jurchen', 'e-yuan', 'e-mongol']
  },
  'e-kamakura': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '가마쿠라 막부 — 헤이안 시대 후반 율령 체제가 동요하고 사유지가 인정되면서 무사 세력이 성장하였다. 유력한 무사단의 우두머리 미나모토노 요리토모가 조정을 장악하던 다이라씨를 몰아내고 1192년 무사 정권인 막부를 열었다. 쇼군이 주종 관계로 맺어진 무사를 거느리고 다스렸다. 몽골·고려 연합군의 두 차례 원정은 일본군의 저항과 태풍으로 실패하였다.',
      terms: [
        { label: '막부', def: '쇼군이 이끄는 무사 정권.' },
        { label: '쇼군', def: '막부의 최고 지도자.' },
        { label: '주종 관계', def: '쇼군과 무사가 토지와 충성을 주고받으며 맺은 관계.' }
      ],
      timeline: [
        { y: 1192, label: '◆ 가마쿠라 막부 수립' },
        { yl: '13세기 후반', label: '몽골·고려 연합군의 일본 원정 실패' },
        { y: 1336, label: '무로마치 막부 수립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-heian', 'e-muromachi', 'e-yuan', 'k-goryeo']
  },
  'e-mongol': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '몽골 제국 — 13세기 초 테무친이 몽골 부족을 통일하고 1206년 칭기즈 칸으로 추대되었다. 천호제로 유목민을 군사·행정 조직으로 편제하고, 1219년부터 대대적인 정복 전쟁을 벌였다. 후계자들이 금을 멸망시키고 러시아 일대와 서아시아까지 장악하여 유라시아에 걸친 대제국을 이루었다. 역참을 설치하여 동서 교류가 활발해졌고 『동방견문록』 등이 편찬되었다.',
      terms: [
        { label: '천호제', def: '유목민을 1,000호 단위로 묶어 군사·행정 조직으로 편제한 제도.' },
        { label: '역참', def: '제국 곳곳을 잇는 교통·통신 시설. 동서 교류를 촉진하였다.' },
        { label: '『동방견문록』', def: '마르코 폴로의 동방 여행 기록.' }
      ],
      timeline: [
        { y: 1206, label: '◆ 칭기즈 칸, 몽골 통일' },
        { y: 1219, label: '대대적인 정복 전쟁' },
        { y: 1231, label: '고려 침략 시작' },
        { y: 1258, label: '아바스 왕조 멸망' },
        { y: 1271, label: '원 성립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-yuan', 'e-jin-jurchen', 'e-nansong', 's-abbasid', 'k-goryeo']
  },
  'e-yuan': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '원 — 칭기즈 칸의 손자 쿠빌라이 칸이 1271년 국호를 원으로 정하고 대도(베이징)를 수도로 삼았다. 1279년 남송을 멸망시켜 중국 전역을 지배하였다. 소수의 몽골인이 지배층을 이루었고, 색목인을 재정 관리 분야에 중용한 반면 한인과 남인을 차별하였다. 몽골·고려 연합군을 편성하여 두 차례 일본 원정을 단행하였으나 실패하였다. 14세기 중엽 홍건적의 반란이 일어났고, 명을 세운 주원장에게 쫓겨 북쪽으로 물러났다.',
      terms: [
        { label: '대도', def: '원의 수도. 오늘날의 베이징.' },
        { label: '색목인', def: '서역 출신의 여러 민족. 재정 관리 등에 중용되었다.' },
        { label: '한인·남인', def: '금 통치 아래의 한족(한인)과 남송 통치 아래의 한족(남인). 차별을 받았다.' }
      ],
      timeline: [
        { y: 1271, label: '◆ 원 성립' },
        { y: 1279, label: '남송 멸망 → 중국 전역 지배' },
        { y: 1368, label: '명 건국 → 북쪽으로 후퇴' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-mongol', 'e-nansong', 'e-ming', 'e-kamakura', 'k-goryeo']
  },
  'e-muromachi': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '무로마치 막부 — 14세기 아시카가 다카우지가 교토에 무로마치 막부를 열었다(1336~1573). 제3대 쇼군 아시카가 요시미쓰가 남북조를 통일하여 전국적인 지배권을 확립하였다. 무로마치 막부는 명과 정식으로 국교를 맺고, 명이 발행한 감합을 받아 감합 무역을 실시하였다. 그러나 15세기 후반 쇼군의 후계자 문제를 둘러싼 분쟁으로 막부의 권위가 실추되면서, 100년간 각지의 무사 가문들이 세력을 다투는 센고쿠(전국) 시대가 이어졌다. 센고쿠 시대가 본격적으로 전개되자 감합 무역은 중단되고 밀무역이 성행하였다.',
      terms: [
        { label: '감합 무역', def: '명이 발행한 무역 허가증(감합)을 가진 자에게만 허락한 조공 무역.' },
        { label: '다이묘', def: '각 지방을 다스린 무사 가문의 우두머리.' },
        { label: '센고쿠(전국) 시대', def: '무로마치 막부가 쇠퇴한 뒤 각지의 다이묘가 세력을 다툰 시대.' }
      ],
      timeline: [
        { y: 1336, label: '◆ 무로마치 막부 수립' },
        { y: 1467, label: '센고쿠(전국) 시대 시작' },
        { y: 1573, label: '무로마치 막부 멸망' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-kamakura', 'e-sengoku', 'e-ming']
  },
  'e-ming': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '명 — 14세기 중엽 원이 쇠퇴하자 홍건적 출신 주원장(홍무제)이 난징에 도읍을 정하고 1368년 명을 건국하였다. 홍무제는 이갑제를 실시하고 육유를 반포하여 향촌을 통제하였으며, 해금 정책으로 대외 무역을 통제하고 조공 무역만 허용하였다. 정난의 변을 통해 즉위한 영락제는 자금성을 건설하여 베이징으로 천도하고, 정화에게 대규모 함대를 이끌고 인도양 일대로 항해하게 하였다(1405~). 은이 대량으로 들어오자 1581년 일조편법을 확대 시행하였다. 1644년 이자성의 농민군이 베이징을 점령하면서 멸망하였다.',
      terms: [
        { label: '이갑제', def: '110호를 1리로 묶어 세금 징수와 치안을 맡긴 향촌 조직.' },
        { label: '육유', def: '홍무제가 반포한 백성 교화의 여섯 가지 가르침.' },
        { label: '해금 정책', def: '민간의 해상 무역을 금지하고 조공 무역만 허용한 정책.' },
        { label: '정화의 항해', def: '영락제의 명으로 정화가 이끈 대규모 함대의 인도양 원정.' },
        { label: '일조편법', def: '여러 세금을 은으로 한꺼번에 내게 한 세법.' }
      ],
      timeline: [
        { y: 1368, label: '◆ 명 건국' },
        { y: 1402, label: '영락제 즉위' },
        { y: 1405, label: '정화의 항해 시작' },
        { y: 1581, label: '일조편법 확대 시행' },
        { y: 1644, label: '명 멸망' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-yuan', 'e-qing', 'e-ming-fall', 'k-joseon']
  },
  'e-sengoku': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '센고쿠 시대 — 15세기 후반 무로마치 막부가 쇠퇴하면서 각 지역의 다이묘가 패권을 놓고 다투던 시대(1467~1590). 이 시기 포르투갈 상인을 통해 조총이 전래되었다. 16세기 후반 도요토미 히데요시가 100여 년에 걸친 혼란을 수습하고 일본을 통일한 뒤 조선을 침략하였다(임진 전쟁, 1592).',
      terms: [
        { label: '다이묘', def: '각 지역을 다스리며 패권을 다툰 유력 무사.' },
        { label: '조총', def: '포르투갈 상인을 통해 전래된 화승총.' }
      ],
      timeline: [
        { y: 1467, label: '◆ 센고쿠 시대 시작' },
        { y: 1590, label: '도요토미 히데요시, 일본 통일' },
        { y: 1592, label: '임진 전쟁' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-muromachi', 'e-edo', 'k-joseon']
  },
  'e-edo': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '에도 막부 — 도요토미 히데요시 사후 세키가하라 전투에서 승리한 도쿠가와 이에야스가 1603년 에도에 막부를 열었다. 쇼군이 다이묘의 영지 지배를 인정하는 막번 체제를 갖추고, 산킨코타이 제도로 지방의 다이묘를 통제하였다. 쇄국 정책을 펴면서도 나가사키에서 네덜란드와 교역하였고, 조선은 통신사를 파견하였다. 1854년 미국의 압력으로 개항하였고, 1868년 메이지 정부 수립으로 무너졌다.',
      terms: [
        { label: '막번 체제', def: '쇼군의 막부와 다이묘의 번이 함께 다스린 체제.' },
        { label: '산킨코타이 제도', def: '다이묘를 정기적으로 에도에 머물게 하여 통제한 제도.' },
        { label: '통신사', def: '조선이 일본에 보낸 외교 사절.' }
      ],
      timeline: [
        { y: 1603, label: '◆ 에도 막부 수립' },
        { y: 1854, label: '미일 화친 조약' },
        { y: 1868, label: '메이지 정부 수립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-sengoku', 'e-perry', 'e-meiji', 'k-joseon']
  },
  'e-houjin': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '후금 — 임진 전쟁 당시 조선을 지원한 명이 과도한 군사비 지출과 농민 반란 등으로 국력이 약해지자, 그 틈을 타 누르하치가 만주의 여진족을 통합하고 1616년 후금을 건국하였다. 만주족 사회를 군사적으로 재편한 팔기제를 두었다. 이후 명과 후금의 대립이 본격화되었고, 인조반정 이후 조선이 친명배금 노선을 강화하자 후금이 조선을 침입하였다(정묘 전쟁, 1627). 후금은 조선과 형제의 맹약을 맺고 물러났다. 1636년 홍타이지는 황제를 칭하고 국호를 청으로 바꾼 뒤 조선에 군신 관계를 요구하였다.',
      terms: [
        { label: '누르하치', def: '만주의 여진족을 통합하고 후금을 세운 인물(청 태조).' },
        { label: '팔기제', def: '만주족 사회를 군사적으로 재편하여 만든 군사·행정 조직.' },
        { label: '정묘 전쟁', def: '1627년 후금이 조선을 침입한 전쟁. 형제의 맹약을 맺고 철수하였다.' }
      ],
      timeline: [
        { y: 1616, label: '◆ 누르하치, 후금 건국' },
        { y: 1627, label: '정묘 전쟁' },
        { y: 1636, label: '홍타이지, 국호를 청으로 변경' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-ming', 'e-qing', 'k-joseon']
  },
  'e-qing': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '청 — 홍타이지(태종)가 1636년 국호를 청으로 바꾸고 (내)몽골과 조선을 공격하였다(병자 전쟁). 1644년 명이 멸망하자 산하이관을 지키던 명의 장수 오삼계의 도움을 받아 베이징에 들어가 중국을 지배하였다. 강희제가 삼번의 난을 진압하는 등 강희제·옹정제·건륭제 시기에 전성기를 누렸다. 만주족과 한족을 함께 등용하는 만한 병용제를 실시하는 한편 변발을 강요하였다. 아편 전쟁 이후 쇠퇴하여 신해혁명(1911)으로 무너졌다.',
      terms: [
        { label: '만한 병용제', def: '중요 관직에 만주족과 한족을 함께 임명한 제도.' },
        { label: '변발', def: '머리 주변을 깎고 뒷머리를 땋아 늘인 만주족의 머리 모양. 한족에게 강요되었다.' },
        { label: '삼번의 난', def: '강희제의 번 폐지에 반발한 한인 장수들의 반란.' }
      ],
      timeline: [
        { y: 1636, label: '◆ 국호 청' },
        { y: 1644, label: '베이징 입성' },
        { y: 1681, label: '삼번의 난 진압' },
        { y: 1840, label: '아편 전쟁' },
        { y: 1911, label: '신해혁명' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-houjin', 'e-ming-fall', 'e-opium', 'e-xinhai', 'k-joseon']
  },
  'e-ming-fall': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '명 멸망 — 명은 임진왜란 참전과 후금(청)과의 전쟁 등으로 재정난이 심해졌고, 각지에서 농민 반란이 일어났다. 병사 출신 이자성은 명 말기 여러 반란군을 지휘하며 세력을 키워 1643년 장안을 점령하고 새 왕조의 성립을 공포한 뒤 베이징으로 진격하였다. 이자성의 농민군이 베이징을 점령하면서 명은 멸망하였다(1644). 이후 청은 이자성의 농민군을 몰아내고 베이징을 점령하여 수도로 삼았으며, 명의 황족들이 강남에 세운 남명 정권을 무너뜨리고 삼번의 난과 타이완의 정성공 세력까지 진압하여 중국 지배를 확고히 하였다.',
      terms: [
        { label: '이자성', def: '명 말기 반란군을 이끈 병사 출신 인물. 베이징을 점령해 명을 멸망시켰다.' },
        { label: '남명 정권', def: '명이 멸망한 뒤 명의 황족들이 강남 지역에 세운 정권.' },
        { label: '삼번의 난', def: '청에 귀순하여 지방을 다스리던 오삼계 등 세 세력이 일으킨 반란. 강희제가 진압하였다.' }
      ],
      timeline: [
        { y: 1643, label: '이자성, 장안 점령' },
        { y: 1644, label: '◆ 이자성의 베이징 점령, 명 멸망' },
        { y: 1644, label: '청, 베이징을 수도로 삼음' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-ming', 'e-qing', 'e-houjin']
  },
  'e-nguyen': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '응우옌 왕조 — 1802년부터 1945년까지 베트남을 통치한 왕조로, 후에 왕궁을 중심으로 다스렸다. 19세기 후반 프랑스는 베트남의 프랑스 선교사 박해를 구실로 전쟁을 일으켰고, 전쟁에서 패한 베트남은 제1차 사이공 조약을 맺었다(1862). 이 조약에는 전쟁 배상금 지불, 코친차이나 동부 3성 할양, 다낭을 포함한 3개 항구 개항 등이 담겼다. 이후 프랑스는 베트남과 캄보디아, 라오스를 합쳐 프랑스령 인도차이나 연방을 수립하였다(1887).',
      terms: [
        { label: '제1차 사이공 조약', def: '1862년 베트남이 프랑스와 맺은 조약. 배상금 지불, 코친차이나 동부 3성 할양, 3개 항구 개항.' },
        { label: '후에 왕궁', def: '응우옌 왕조의 왕궁. 1993년 유네스코 세계 유산에 등재되었다.' },
        { label: '프랑스령 인도차이나 연방', def: '프랑스가 베트남·캄보디아·라오스를 합쳐 세운 식민지 연방.' }
      ],
      timeline: [
        { y: 1802, label: '◆ 응우옌 왕조 성립' },
        { y: 1862, label: '제1차 사이공 조약' },
        { y: 1887, label: '프랑스령 인도차이나 연방 수립' },
        { y: 1945, label: '응우옌 왕조 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-dr-vietnam', 'e-opium']
  },
  'e-opium': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '아편 전쟁 — 청은 광저우의 공행을 통해서만 서양 상인과 교역하게 하였다. 차·비단·도자기 수입으로 무역 적자가 커진 영국은 인도산 아편을 청에 밀수출하는 삼각 무역을 벌였다. 은이 빠져나가고 아편 중독자가 늘자 청이 아편을 단속하였고, 영국은 이를 빌미로 제1차 아편 전쟁(1840~1842)을 일으켰다. 근대식 화포로 무장한 영국군에 패한 청은 난징 조약을 맺었다. 1856년 제2차 아편 전쟁에서도 패하여 톈진 조약과 베이징 조약을 맺었다.',
      terms: [
        { label: '공행', def: '청 정부가 서양과의 무역을 허가한 광저우의 특허 상인 조합.' },
        { label: '삼각 무역', def: '영국·인도·청을 잇는 무역. 영국은 인도산 아편을 청에 팔아 은을 확보하였다.' },
        { label: '불평등 조약', def: '개항·영사 재판권·협정 관세 등 한쪽에 불리한 조약.' }
      ],
      timeline: [
        { y: 1840, label: '◆ 제1차 아편 전쟁' },
        { y: 1842, label: '난징 조약' },
        { y: 1856, label: '제2차 아편 전쟁' },
        { y: 1860, label: '베이징 조약' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-qing', 'e-nanjing', 'e-taiping', 'e-yangwu']
  },
  'e-nanjing': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '난징 조약 — 청은 서양 상인들이 광저우의 공행을 통해서만 교역하게 하였다. 차·비단·도자기 수입으로 무역 적자가 늘어난 영국은 인도산 아편을 청에 밀수출하였고, 청에서는 아편 중독자가 급증하고 은이 해외로 유출되어 재정난이 심각해졌다. 청 정부가 임칙서를 보내 아편을 단속하자 영국은 제1차 아편 전쟁을 일으켰다(1840). 전쟁에서 패한 청은 난징 조약을 맺어(1842) 상하이 등 5개 항구를 개항하고 홍콩을 영국에 넘겨주었으며 공행 무역을 폐지하였다. 이듬해 후먼 조약으로 영사 재판권과 최혜국 대우를 인정하였다.',
      terms: [
        { label: '공행', def: '서양 상인이 청과 교역할 때 반드시 거쳐야 했던 광저우의 상인 조직.' },
        { label: '임칙서', def: '청 정부가 광저우에 보내 아편을 몰수하고 단속한 관리.' },
        { label: '영사 재판권', def: '외국인이 죄를 지어도 자국 영사의 재판을 받게 하는 권리.' },
        { label: '최혜국 대우', def: '다른 나라에 준 가장 유리한 조건을 조약 상대국에도 똑같이 주는 것.' }
      ],
      timeline: [
        { y: 1840, label: '제1차 아편 전쟁' },
        { y: 1842, label: '◆ 난징 조약' },
        { y: 1843, label: '후먼 조약' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-opium', 'e-qing', 'e-perry']
  },
  'e-taiping': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '태평천국 운동 — 아편 전쟁 이후 배상금 부담 등으로 농민의 생활이 어려워진 가운데, 크리스트교의 영향을 받은 홍수전이 1851년 일으켰다. 만주족 왕조를 몰아내고 한족 국가를 세우자는 멸만흥한을 내걸고, 토지를 사람 수에 따라 나누어 주는 천조전무 제도와 남녀평등을 주장하여 농민의 지지를 얻었다. 난징을 점령하였으나 1864년 진압되었다.',
      terms: [
        { label: '멸만흥한', def: '만주족을 몰아내고 한족을 일으키자는 구호.' },
        { label: '천조전무 제도', def: '토지를 사람 수에 따라 균등하게 나누어 준다는 태평천국의 토지 제도.' }
      ],
      timeline: [
        { y: 1851, label: '◆ 태평천국 운동' },
        { y: 1864, label: '진압' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-opium', 'e-yangwu', 'e-qing']
  },
  'e-perry': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '미일 화친 조약 — 에도 막부는 쇄국 정책을 유지하였으나, 1853년 미국 페리 함대가 무력시위를 벌이며 개항을 요구하였다. 막부는 1854년 미일 화친 조약을 맺어 2개 항구를 개항하고 미국에 최혜국 대우를 인정하였다. 1858년에는 미일 수호 통상 조약으로 협정 관세와 영사 재판권을 인정하였다. 위기감이 커지면서 존왕양이 운동이 일어났다.',
      terms: [
        { label: '존왕양이 운동', def: '천황을 받들고 서양 세력을 물리치자는 운동.' },
        { label: '협정 관세', def: '관세를 상대국과 협의하여 정하게 한 불평등 조항.' }
      ],
      timeline: [
        { y: 1853, label: '페리 함대의 개항 요구' },
        { y: 1854, label: '◆ 미일 화친 조약' },
        { y: 1858, label: '미일 수호 통상 조약' },
        { y: 1868, label: '메이지 정부 수립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-edo', 'e-meiji', 'e-nanjing', 'k-ganghwa-treaty']
  },
  'e-yangwu': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '양무운동 — 태평천국 운동 진압 과정에서 서양 무기의 위력을 실감한 증국번·이홍장 등 한인 관료들이 1861년부터 추진한 근대화 운동. 중국의 전통 제도는 유지하면서 서양의 기술만 받아들이자는 중체서용론을 바탕으로 군수 공장 등을 세웠다. 1880년대에는 주변국에 대한 종주권을 강화하였다. 청일 전쟁(1894)에서 패하면서 한계가 드러났다.',
      terms: [
        { label: '중체서용', def: '중국의 전통(體)을 바탕으로 서양의 기술(用)을 받아들인다는 주장.' },
        { label: '이홍장', def: '양무운동을 주도한 한인 관료.' }
      ],
      timeline: [
        { y: 1861, label: '◆ 양무운동 시작' },
        { y: 1894, label: '청일 전쟁 패배' },
        { y: 1898, label: '무술변법' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-taiping', 'e-sino-jp', 'e-wuxu', 'e-qing']
  },
  'e-meiji': {
    notes: { sections: [] },
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '메이지 유신 — 개항 이후 존왕양이 운동이 확산되어 에도 막부가 무너지고 1868년 메이지 정부가 수립되었다. 천황 중심의 근대 국가를 세우기 위해 폐번치현(1871)으로 중앙 집권 체제를 갖추고, 신분제 개혁과 징병제 등 서양식 개혁을 추진하였다. 이와쿠라 사절단을 서양에 파견하였다. 이후 대외 팽창에 나서 조선을 개항시키고 청일 전쟁을 일으켰다.',
      terms: [
        { label: '폐번치현', def: '번을 폐지하고 현을 설치하여 중앙에서 관리를 파견한 개혁.' },
        { label: '이와쿠라 사절단', def: '메이지 정부가 서양의 제도와 문물을 시찰하기 위해 보낸 사절단.' },
        { label: '징병제', def: '국민에게 병역 의무를 지운 근대식 군사 제도.' }
      ],
      timeline: [
        { y: 1854, label: '개항' },
        { y: 1868, label: '◆ 메이지 정부 수립' },
        { y: 1871, label: '폐번치현' },
        { y: 1889, label: '일본 제국 헌법 공포' }
      ]
    },
    sources: [
      {
        kind: '교과서 본문',
        title: '메이지 유신의 단행',
        body: '하급 무사들이 전개한 막부 타도 운동이 성공하여 메이지 천황 중심의 신정부가 수립되었다. 메이지 정부는 부국강병과 불평등 조약 개정을 목표로, 적극적인 서구화 정책을 펼쳐 근대 국가로 발전하자는 메이지 유신을 단행하였다(1868).',
        citation: '— W5, pp. 1132–1137'
      },
      {
        kind: '교과서 본문',
        title: '폐번치현의 의미',
        body: '다이묘가 통치하던 번들을 통폐합하여 현을 설치하고, 중앙 정부가 직접 임명한 지사를 파견하는 폐번치현 …… 번을 없애고 현을 설치한다는 뜻으로 봉건제의 폐지를 의미한다.',
        citation: '— W5, pp. 1067–1069'
      },
      {
        kind: '비교사',
        title: '동아시아 근대 개혁의 모델',
        body: '일본에서는 개항 이후 하급 무사들을 중심으로 막부 타도 운동이 전개되어 천황 중심의 정권이 수립하였다. 메이지 정부는 문명 개화론과 폐번치현, 징병제 실시 등 개혁을 추진하였다. 조선의 김옥균, 박영효, 홍영식, 서광범 등은 일본의 메이지 유신을 모델로 급진적인 개혁을 추진 …',
        citation: '— W5, pp. 968–970'
      }
    ],
    artifacts: [
      { slot: 'portrait', caption: '도쿠가와 이에야스 — 1603년 에도 막부 개창', ref: 'W2, p. 1756' },
      { slot: 'wide', caption: '메이지 정부가 폐번치현 조서를 발표하는 모습', ref: 'W5, p. 1067' },
      { slot: 'wide', caption: '이와쿠라 사절단의 이동 경로 (1871)', ref: 'W5, p. 1198' },
      { slot: 'wide', caption: '근대화된 도쿄 긴자 거리 — 마차·서양식 건축', ref: 'W5, p. 646' }
    ],
    linked: ['e-perry', 'e-meiji-const', 'e-sino-jp', 'k-ganghwa-treaty', 'w-ww1', 'k-goryeo', 'k-donghak'],
    map: {
      title: '메이지 유신 — 일본 열도',
      bounds: { w: 360, h: 240 },
      regions: [
        {
          d: 'M 60 180 Q 90 160 130 170 Q 175 130 220 110 Q 270 80 300 50 Q 320 60 310 90 Q 270 130 230 150 Q 180 180 130 200 Q 90 215 60 180 Z',
          label: '일본'
        }
      ],
      pins: [
        { x: 220, y: 130, label: '에도→도쿄', sub: '1868 · 수도', amber: true },
        { x: 175, y: 155, label: '교토', sub: '천황 거처' },
        { x: 100, y: 195, label: '나가사키', sub: '데지마 · 난학' },
        { x: 140, y: 175, label: '시모다', sub: '1854 · 개항' },
        { x: 290, y: 80, label: '하코다테', sub: '1854 · 개항' }
      ],
      arrows: [
        { from: [175, 155], to: [220, 130], label: '천도' }
      ]
    }
  },
  'e-meiji-const': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '일본 제국 헌법 — 메이지 정부의 개혁 과정에서 1870년대부터 정부의 전제 정치를 비판하고 서양식 입헌 제도의 도입을 요구하는 자유 민권 운동이 일어났다. 정부는 1889년 일본 제국 헌법을 공포하고 제국 의회를 열었다. 헌법은 천황에게 전쟁 선포·조약 체결 등 많은 권한을 부여한 반면, 국민의 권리는 법률의 범위 안에서만 인정하였다.',
      terms: [
        { label: '자유 민권 운동', def: '헌법 제정과 의회 설립을 요구한 일본의 정치 운동.' },
        { label: '제국 의회', def: '일본 제국 헌법에 따라 설치된 의회.' }
      ],
      timeline: [
        { yl: '1870년대', label: '자유 민권 운동' },
        { y: 1889, label: '◆ 일본 제국 헌법 공포' },
        { y: 1894, label: '청일 전쟁' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-meiji', 'e-sino-jp']
  },
  'e-sino-jp': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '청일 전쟁 — 조선을 두고 청과 대립하던 일본이 일으킨 전쟁(1894~1895). 승리한 일본은 시모노세키 조약(1895)으로 청이 조선에 대한 권리를 포기하게 하고 랴오둥반도와 타이완을 넘겨받았다. 그러나 러시아·프랑스·독일의 삼국 간섭으로 랴오둥반도를 청에 돌려주었다. 이후 열강의 중국 침략이 심해졌다.',
      terms: [
        { label: '시모노세키 조약', def: '청일 전쟁을 끝낸 조약(1895).' },
        { label: '삼국 간섭', def: '러시아·프랑스·독일이 일본에 랴오둥반도를 청에 돌려주도록 압박한 사건.' }
      ],
      timeline: [
        { y: 1894, label: '◆ 청일 전쟁' },
        { y: 1895, label: '시모노세키 조약·삼국 간섭' },
        { y: 1898, label: '무술변법' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-yangwu', 'e-wuxu', 'e-meiji', 'k-donghak-rev', 'k-gabo']
  },
  'e-wuxu': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '무술변법 — 청일 전쟁에서 패한 뒤 양무운동에서 벗어나 정치 제도까지 바꾸어야 한다는 주장이 힘을 얻었다. 캉유웨이·량치차오 등이 광서제의 신임을 받아 입헌 군주제 도입 등 근대적 개혁을 추진하였다(1898). 그러나 서태후 등 보수 세력의 반발로 실패하였다. 변법자강 운동이라고도 한다.',
      terms: [
        { label: '변법자강 운동', def: '제도를 바꾸어 나라를 스스로 강하게 하자는 개혁 운동.' },
        { label: '입헌 군주제', def: '헌법에 따라 군주의 권한을 제한하는 정치 체제.' }
      ],
      timeline: [
        { y: 1894, label: '청일 전쟁' },
        { y: 1898, label: '◆ 무술변법' },
        { y: 1901, label: '신축조약' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-yangwu', 'e-sino-jp', 'e-xinchou']
  },
  'e-xinchou': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '신축조약 — 청일 전쟁 이후 열강이 각종 이권을 빼앗자, ‘청 왕조를 도와 서양 세력을 몰아내자(부청멸양)’를 내건 의화단 운동이 산둥에서 일어났다(1899). 일본을 비롯한 8개국 연합군이 이를 진압하고 베이징을 점령하였다. 청은 1901년 열강과 신축조약을 맺었다. 러시아는 의화단 진압을 구실로 만주에 군대를 주둔시켰다.',
      terms: [
        { label: '의화단 운동', def: '외세 배척을 내건 중국 민중의 무장 운동.' },
        { label: '부청멸양', def: '청을 도와 서양을 멸하자는 의화단의 구호.' }
      ],
      timeline: [
        { y: 1899, label: '의화단 운동' },
        { y: 1901, label: '◆ 신축조약' },
        { y: 1904, label: '러일 전쟁' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-wuxu', 'e-xinhai', 'e-qing', 'k-russo-japan']
  },
  'e-xinhai': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '신해혁명 — 쑨원은 도쿄에서 중국 동맹회를 결성하고(1905) 삼민주의를 지도 이념으로 삼아 혁명 운동을 이끌었다. 청 정부가 철도 국유화를 추진하자 저항이 일어났고, 1911년 우창에서 신식 군대를 중심으로 봉기가 일어나 각 성이 호응하였다. 쑨원이 임시 대총통으로 추대되어 1912년 중화민국이 수립되었다. 이후 위안스카이가 청 황제를 퇴위시키고 대총통이 되었다.',
      terms: [
        { label: '삼민주의', def: '민족·민권·민생의 세 원칙. 쑨원의 혁명 이념.' },
        { label: '중국 동맹회', def: '쑨원이 혁명 단체를 모아 결성한 조직(1905).' },
        { label: '중화민국', def: '신해혁명으로 수립된 공화국.' }
      ],
      timeline: [
        { y: 1905, label: '중국 동맹회 결성' },
        { y: 1911, label: '◆ 우창 봉기·신해혁명' },
        { y: 1912, label: '중화민국 수립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-qing', 'e-xinchou', 'e-may4', 'k-annexation']
  },
  'e-may4': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '5·4 운동 — 일본이 21개조 요구로 중국의 이권을 빼앗는 가운데, 천두슈 등은 낡은 유교 전통을 타파하고 서양의 과학과 민주주의를 받아들이자는 신문화 운동을 전개하였다. 파리 강화 회의에서 산둥반도의 독일 이권을 일본이 차지하는 것으로 인정되자, 1919년 베이징의 학생들이 시위를 벌였고 거국적인 항일 구국 운동으로 발전하였다. 이후 중국 공산당이 창당되었다(1921).',
      terms: [
        { label: '신문화 운동', def: '유교 전통을 비판하고 과학과 민주주의를 내세운 사상 운동.' },
        { label: '21개조 요구', def: '일본이 중국에 이권을 요구한 조항.' }
      ],
      timeline: [
        { y: 1919, label: '◆ 5·4 운동' },
        { y: 1921, label: '중국 공산당 창당' },
        { y: 1924, label: '제1차 국공 합작' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-samil', 'w-paris', 'e-kmt-ccp', 'e-xinhai']
  },
  'e-kmt-ccp': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '제1차 국공 합작 — 5·4 운동 이후 쑨원 등은 중국 국민당을, 천두슈 등은 중국 공산당을 결성하였다. 두 당은 군벌 타도와 반제국주의 운동을 위해 힘을 합쳐 국민 혁명을 추진하였다(제1차 국공 합작, 1924). 쑨원이 죽은 뒤 실권을 장악한 장제스는 베이징의 군벌 정부를 타도하기 위해 북벌을 단행하였고, 이 과정에서 공산당을 탄압하면서 제1차 국공 합작은 붕괴되었다(1927). 이후 장제스는 베이징을 점령하여 국민 혁명을 완성하였다(1928).',
      terms: [
        { label: '국공 합작', def: '중국 국민당과 중국 공산당이 손을 잡은 일. 제1차(1924)는 군벌 타도·반제국주의를 위해 이루어졌다.' },
        { label: '북벌', def: '장제스가 베이징의 군벌 정부를 타도하려고 벌인 군사 행동.' },
        { label: '5·4 운동', def: '1919년 베이징 학생들이 시작한 반군벌·반일본 시위. 거국적인 항일 구국 운동으로 발전하였다.' }
      ],
      timeline: [
        { y: 1919, label: '5·4 운동' },
        { y: 1924, label: '◆ 제1차 국공 합작' },
        { y: 1927, label: '제1차 국공 합작 붕괴' },
        { y: 1928, label: '장제스, 베이징 점령' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-may4', 'e-manchuria', 'e-sino-jp-war', 'e-civilwar']
  },
  'e-manchuria': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '만주 사변 — 1929년 미국에서 발생한 대공황이 확산되면서 일본에서도 기업이 도산하는 등 경제 침체가 이어졌다. 일본의 군부와 우익 세력은 대외 침략으로 경제 위기를 벗어나려 하였다. 1931년 일본군(관동군)은 중국 류탸오후에서 만주 철도 선로를 폭파하고 이를 중국의 소행으로 몰아 만주를 침공하였고, 이듬해 만주국을 세웠다(1932). 국제 연맹이 리튼 보고서를 토대로 만주국을 승인하지 않고 일본군의 철수를 요구하자, 일본은 국제 연맹에서 탈퇴하고 계속 무력을 행사하였다. 이후 일본은 화북 지역을 침략하였다.',
      terms: [
        { label: '류탸오후 사건', def: '1931년 일본군이 류탸오후에서 만주 철도 선로를 폭파하고 중국의 소행으로 몰아 만주를 침공한 사건.' },
        { label: '만주국', def: '일본이 만주에 세운 나라. 일본인이 실권을 장악하고 일본의 재벌이 경제를 지배한 괴뢰 정권이었다.' },
        { label: '관동군', def: '만주 사변과 만주국 수립을 주도한 일본군 부대.' }
      ],
      timeline: [
        { y: 1929, label: '대공황' },
        { y: 1931, label: '◆ 류탸오후 사건, 만주 사변' },
        { y: 1932, label: '만주국 수립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-depression', 'e-sino-jp-war', 'e-kmt-ccp']
  },
  'e-sino-jp-war': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '중일 전쟁 — 1937년 7월 루거우차오 다리 부근에서 일본군과 중국군이 충돌하였다(루거우차오 사건). 일본 정부의 강경파와 군부는 이를 빌미로 화북 지방에 대규모 군대를 보내 중일 전쟁을 일으켰다. 3개월 만에 상하이를 점령한 일본은 수도 난징을 비롯한 주요 도시를 빠르게 장악하였고, 난징을 점령하는 과정에서 수많은 중국인을 학살하였다(난징 대학살). 중국 국민당과 중국 공산당은 내전을 멈추고 제2차 국공 합작을 맺어 함께 일본에 맞섰다. 국민당 정부는 충칭으로 수도를 옮기며 항전을 계속하였고, 공산당은 유격전으로 항일 투쟁을 벌였다. 한국의 독립군 부대도 중국군과 연대하여 싸웠다.',
      terms: [
        { label: '루거우차오 사건', def: '1937년 루거우차오 다리 부근에서 일본군과 중국군이 충돌한 사건. 중일 전쟁의 발단이 되었다.' },
        { label: '난징 대학살', def: '일본군이 난징을 점령하는 과정에서 수많은 중국인을 학살한 사건.' },
        { label: '제2차 국공 합작', def: '중일 전쟁이 일어나자 국민당과 공산당이 내전을 중지하고 맺은 항일 통일 전선(1937).' }
      ],
      timeline: [
        { y: 1936, label: '시안 사건' },
        { y: 1937, label: '◆ 루거우차오 사건, 중일 전쟁' },
        { y: 1937, label: '제2차 국공 합작, 난징 대학살' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-manchuria', 'e-pacific', 'k-mobilization', 'k-gwangbokgun']
  },
  'e-pacific': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '아시아·태평양 전쟁 — 중일 전쟁이 길어지자 일본은 자원을 확보하려 동남아시아로 진출하였고, 미국은 석유 수출 금지 등으로 맞섰다. 일본은 1941년 진주만을 기습하고 ‘대동아 공영권’을 내세워 동남아시아와 태평양 일대를 점령하였다. 미드웨이 해전(1942) 이후 수세에 몰렸고, 1945년 히로시마·나가사키에 원자 폭탄이 투하되자 무조건 항복하였다.',
      terms: [
        { label: '대동아 공영권', def: '일본이 아시아 침략을 정당화하려 내세운 구호.' },
        { label: '미드웨이 해전', def: '미국이 일본 해군을 물리쳐 전세를 바꾼 해전(1942).' }
      ],
      timeline: [
        { y: 1941, label: '◆ 진주만 기습' },
        { y: 1942, label: '미드웨이 해전' },
        { y: 1945, label: '원자 폭탄 투하·일본 항복' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-sino-jp-war', 'w-ww2', 'k-liberation', 'e-sf']
  },
  'e-dr-vietnam': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '베트남 민주 공화국 — 호찌민은 인도차이나 공산당을 조직하고 독립운동을 이끌었다. 1945년 일본이 패망하자 베트남 민주 공화국 수립을 선포하였다. 프랑스가 다시 지배하려 하자 베트남·프랑스 전쟁이 일어났고, 디엔비엔푸 전투에서 승리하였다. 제네바 회담(1954)으로 북위 17도선을 경계로 남북이 나뉘었다.',
      terms: [
        { label: '호찌민', def: '베트남 독립운동과 베트남 민주 공화국을 이끈 지도자.' },
        { label: '디엔비엔푸 전투', def: '베트남이 프랑스군을 물리친 전투.' },
        { label: '제네바 회담', def: '베트남을 북위 17도선을 경계로 나눈 회담(1954).' }
      ],
      timeline: [
        { y: 1945, label: '◆ 베트남 민주 공화국 수립' },
        { y: 1954, label: '제네바 회담' },
        { y: 1975, label: '베트남 전쟁 종식' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-nguyen', 'e-vietwar-end', 'e-pacific']
  },
  'e-civilwar': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '국공 내전 — 일본이 패망한 뒤 미국의 중재로 국민당과 공산당이 쌍십 협정을 맺었으나(1945), 1946년 국민당이 공산당의 거점을 대대적으로 공격하면서 내전이 본격화되었다. 내전 초기에는 미국의 지원을 받은 국민당이 우세하였다. 그러나 공산당은 점령지에서 ‘경작자가 토지를 소유한다’는 원칙에 따라 토지 개혁을 시행하여 농민의 지지를 얻은 반면, 국민당은 물가 상승과 관료들의 부정부패로 민심을 잃었다. 공산당은 화이하이 전투 등에서 승리하고 난징을 점령하여 전세를 역전하였고, 1949년 10월 베이징에서 중화 인민 공화국을 수립하였다. 패배한 국민당은 타이완으로 옮겨 갔다.',
      terms: [
        { label: '쌍십 협정', def: '1945년 10월 10일 미국의 중재로 국민당과 공산당이 평화적으로 새 중국을 건설하기로 합의한 협정.' },
        { label: '토지 개혁', def: '공산당이 점령지에서 지주의 토지를 몰수해 경작자에게 나누어 준 개혁. 농민의 지지를 얻었다.' },
        { label: '중화 인민 공화국', def: '국공 내전에서 승리한 공산당이 1949년 세운 나라. 수도는 베이징.' }
      ],
      timeline: [
        { y: 1945, label: '쌍십 협정' },
        { y: 1946, label: '◆ 국공 내전 본격화' },
        { y: 1949, label: '중화 인민 공화국 수립, 국민당 타이완 이동' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-kmt-ccp', 'e-prc']
  },
  'e-prc': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '중화 인민 공화국 — 국공 내전에서 승리한 중국 공산당의 마오쩌둥이 1949년 10월 1일 톈안먼 광장에서 중화 인민 공화국 수립을 선포하고 베이징을 수도로 정하였다. 6·25 전쟁에 참전하였고, 대약진 운동(1958)의 실패와 문화 대혁명을 거쳤다. 덩샤오핑의 개혁·개방 이후 급속히 성장하여 2010년부터 세계 경제 2위 국가가 되었다.',
      terms: [
        { label: '대약진 운동', def: '마오쩌둥이 추진한 급진적 경제 발전 운동. 실패로 끝났다.' }
      ],
      timeline: [
        { y: 1949, label: '◆ 중화 인민 공화국 수립' },
        { y: 1950, label: '6·25 전쟁 참전' },
        { y: 1958, label: '대약진 운동' },
        { y: 1966, label: '문화 대혁명' },
        { y: 1978, label: '개혁·개방' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-civilwar', 'e-cultural', 'e-reform', 'k-gov-rhee']
  },
  'e-sf': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '샌프란시스코 강화 조약 — 1951년 일본과 연합국이 맺은 강화 조약. 일본은 이 조약으로 주권을 회복하였다. 냉전이 격화되는 가운데 미국은 일본을 동아시아의 반공 기지로 삼고자 미일 안전 보장 조약을 함께 맺었다. 이후 일본에서는 안보 조약 개정에 반대하는 안보 투쟁(1960)이 일어났다.',
      terms: [
        { label: '미일 안전 보장 조약', def: '미군의 일본 주둔을 인정한 미국과 일본의 조약.' }
      ],
      timeline: [
        { y: 1945, label: '일본 항복' },
        { y: 1951, label: '◆ 샌프란시스코 강화 조약' },
        { y: 1960, label: '안보 투쟁' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-pacific', 'w-coldwar', 'k-gov-park']
  },
  'e-cultural': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '문화 대혁명 — 대약진 운동의 실패로 정치적 위기에 빠진 마오쩌둥이 홍위병을 앞세워 류사오치·덩샤오핑 등 실용주의 세력을 자본주의에 협조하였다는 죄목으로 몰아낸 정치·권력 투쟁(1966~1976). 1981년 중국 공산당은 공식적으로 문화 대혁명이 잘못이었다고 평가하였다.',
      terms: [
        { label: '홍위병', def: '문화 대혁명에 동원된 학생 조직.' }
      ],
      timeline: [
        { y: 1958, label: '대약진 운동' },
        { y: 1966, label: '◆ 문화 대혁명 시작' },
        { y: 1976, label: '문화 대혁명 종결' },
        { y: 1981, label: '공산당의 공식 평가' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-prc', 'e-reform', 'e-nixon']
  },
  'e-nixon': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '닉슨 중국 방문 — 베트남 전쟁이 장기화되고 미국 내 반전 여론이 커지자, 미국의 닉슨 대통령은 닉슨 독트린을 발표하여(1969) 아시아에서 군사적 개입을 줄이고 각국이 스스로 안보를 책임지게 하였다. 이러한 긴장 완화(데탕트) 분위기 속에서 닉슨은 1972년 중국을 방문하여 마오쩌둥과 만났고, 이는 미·중 관계 정상화의 계기가 되었다. 같은 해 미국과 소련은 전략 무기 제한 협정을 맺었으며, 미국은 베트남 전쟁에서 철수하고 1979년 중국과 국교를 수립하였다.',
      terms: [
        { label: '닉슨 독트린', def: '1969년 미국이 아시아에서의 군사적 개입을 줄이고 각국이 자국의 안보를 스스로 책임지게 한다는 원칙.' },
        { label: '데탕트', def: '미국과 소련 사이의 긴장 완화.' },
        { label: '전략 무기 제한 협정(SALT)', def: '미국과 소련이 1972년과 1979년 두 차례 맺은 핵무기 제한 협정.' }
      ],
      timeline: [
        { y: 1969, label: '닉슨 독트린' },
        { y: 1972, label: '◆ 닉슨 중국 방문, SALT 체결' },
        { y: 1973, label: '파리 평화 협정' },
        { y: 1979, label: '미·중 국교 수립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-cultural', 'w-coldwar', 'k-gov-park']
  },
  'e-vietwar-end': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '베트남 전쟁 종식 — 제네바 회담(1954) 이후 남부에 베트남 공화국이 수립되었다(1955). 공산 세력의 활동이 활발해지자 미국은 통킹만 사건을 계기로 개입을 확대하였고, 한국도 군대를 파병하였다. 미국 안팎에서 반전 여론이 거세지는 가운데 파리 평화 협정(1973)으로 미군이 철수하였다. 1975년 북베트남이 사이공을 함락하면서 전쟁이 끝나고 베트남은 통일되었다.',
      terms: [
        { label: '통킹만 사건', def: '미국이 베트남 전쟁에 본격 개입하는 계기가 된 사건.' },
        { label: '파리 평화 협정', def: '미군 철수를 합의한 협정(1973).' }
      ],
      timeline: [
        { y: 1954, label: '제네바 회담' },
        { y: 1955, label: '베트남 공화국 수립' },
        { y: 1973, label: '파리 평화 협정' },
        { y: 1975, label: '◆ 베트남 전쟁 종식' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-dr-vietnam', 'w-coldwar', 'e-nixon']
  },
  'e-reform': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '개혁·개방 — 마오쩌둥이 죽고 권력을 장악한 덩샤오핑은 “검은 고양이든 흰 고양이든 쥐만 잘 잡으면 된다”는 흑묘백묘론을 내세운 실용주의 노선으로 1970년대 후반부터 개혁·개방 정책을 펼쳤다. 농업·공업·국방·과학 기술의 4개 부문 현대화와 시장 경제 체제 일부 도입을 목표로, 사기업 설립 허용, 국영 기업의 민간 매각, 경제특구 설치 등을 추진하였다. 이후 중국의 경제 성장이 두드러지고 생활 수준이 향상되었으나, 관료들의 부정부패와 빈부 격차 등의 부작용이 생겨났다. 덩샤오핑은 1992년 남순 강화로 개혁을 가속하였고, 중국은 홍콩(1997)과 마카오를 반환받았다.',
      terms: [
        { label: '흑묘백묘론', def: '어떤 방법이든 인민을 잘살게 하는 것이 중요하다는 덩샤오핑의 실용주의 주장.' },
        { label: '경제특구', def: '외국의 자본과 기술을 도입하려고 1970년대 말부터 설치한 특별 지역(선전·주하이 등).' },
        { label: '남순 강화', def: '1992년 덩샤오핑이 남쪽 지방을 돌며 시장 경제 도입과 개혁을 촉구한 일.' }
      ],
      timeline: [
        { y: 1978, label: '◆ 개혁·개방 정책 시작' },
        { y: 1989, label: '톈안먼 사건' },
        { y: 1992, label: '남순 강화' },
        { y: 1997, label: '홍콩 반환' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-cultural', 'e-tiananmen', 'e-prc']
  },
  'e-tiananmen': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사 / 동아시아 역사 기행',
    overview: {
      summary: '톈안먼 사건 — 덩샤오핑의 개혁·개방 정책으로 경제가 성장하였으나, 관료들의 부정부패와 빈부 격차 등의 부작용이 생겨나자 민주화를 요구하는 시위가 일어났다. 1989년 6월 4일 중국 톈안먼 광장에서 민주화를 요구하던 학생과 시민의 시위를 정부가 무력으로 진압하여 많은 사람이 희생되었다(6·4 사건). 중국의 개혁·개방은 경제 분야에서만 이루어졌으며, 정치적으로는 공산당 집권 체제가 유지되었다. 홍콩에서는 1990년부터 30년 이상 희생자 추모 행사가 열렸다.',
      terms: [
        { label: '톈안먼 광장', def: '1989년 민주화 시위가 벌어진 베이징의 광장. 1949년 마오쩌둥이 중화 인민 공화국 수립을 선포한 곳이기도 하다.' },
        { label: '6·4 사건', def: '톈안먼 사건이 일어난 1989년 6월 4일을 가리키는 이름.' }
      ],
      timeline: [
        { y: 1978, label: '개혁·개방 시작' },
        { y: 1989, label: '◆ 톈안먼 사건' },
        { y: 1990, label: '홍콩, 추모 행사 시작' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['e-reform', 'w-berlin', 'k-gov-chun']
  },
  'w-charlemagne': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '카롤루스 대제 대관 — 게르만족이 이동하여 서로마 제국이 멸망한 뒤(476), 프랑크 왕국의 클로비스가 왕조를 열고 로마 가톨릭교로 개종하여 로마 교회와 손잡았다. 카롤루스 대제는 서유럽 대부분을 통합하였고, 교황은 800년 그를 서로마 황제로 대관하였다. 이로써 로마 가톨릭교회와 게르만족이 결합한 서유럽 세계가 형성되었다.',
      terms: [
        { label: '프랑크 왕국', def: '게르만족이 세운 나라 가운데 가장 크게 성장한 왕국.' },
        { label: '클로비스', def: '프랑크 왕국을 세우고 로마 가톨릭교로 개종한 왕.' },
        { label: '카롤루스 대제', def: '서유럽 대부분을 통합하고 서로마 황제로 대관된 프랑크 왕국의 왕.' }
      ],
      timeline: [
        { y: 476, label: '서로마 제국 멸망' },
        { y: 800, label: '◆ 카롤루스 대제, 서로마 황제 대관' },
        { y: 843, label: '베르됭 조약' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-fall', 'w-verdun', 'w-schism']
  },
  'w-verdun': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '베르됭 조약 — 카롤루스 대제 사후 내분에 빠진 프랑크 왕국은 베르됭 조약(843)과 메르센 조약(870)으로 서프랑크·중프랑크·동프랑크로 나뉘었다. 이는 각각 오늘날 프랑스·이탈리아·독일의 기원이 되었다. 노르만족 등 이민족의 침입 속에서 서유럽에는 봉건제가 자리 잡았다.',
      terms: [
        { label: '봉건제', def: '주군이 봉신에게 토지(봉토)를 주고 봉신은 충성과 군사적 봉사를 하는 주종 관계.' },
        { label: '노르만족', def: '북유럽에서 서유럽 각지로 침입한 민족.' }
      ],
      timeline: [
        { y: 800, label: '카롤루스 대제 대관' },
        { y: 843, label: '◆ 베르됭 조약' },
        { y: 870, label: '메르센 조약' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-charlemagne', 'w-canossa']
  },
  'w-schism': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '동서 교회 분열 — 크리스트교의 5대 교구 가운데 로마 교회와 콘스탄티노폴리스 교회가 주도권을 다투었다. 8세기 전반 비잔티움 제국 황제 레오 3세가 성상 숭배 금지령을 내리자, 게르만족에게 포교하기 위해 성상이 필요하였던 로마 교회와의 대립이 격화되었다. 결국 1054년 로마 교황을 중심으로 한 로마 가톨릭교회와 비잔티움 황제가 통제하는 그리스 정교회로 분열되었다.',
      terms: [
        { label: '성상 숭배 금지령', def: '예수와 성모, 성자의 상을 만들거나 숭배하는 것을 금지한 비잔티움 황제의 칙령.' },
        { label: '황제 교황주의', def: '비잔티움 제국에서 황제가 교회를 지배한 체제.' },
        { label: '그리스 정교회', def: '비잔티움 황제가 통제한 동방의 크리스트교회.' }
      ],
      timeline: [
        { yl: '8세기 전반', label: '레오 3세, 성상 숭배 금지령' },
        { y: 1054, label: '◆ 동서 교회 분열' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-jesus', 'w-canossa', 'w-crusade']
  },
  'w-canossa': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '카노사의 굴욕 — 교회의 세속화가 나타나자 10세기 초 클뤼니 수도원을 중심으로 교회 개혁 운동이 일어났다. 교황 그레고리우스 7세는 성직 매매와 성직자의 결혼을 금지하고, 성직자 서임권을 둘러싸고 신성 로마 제국 황제 하인리히 4세와 대립하였다. 교황에게 파문당한 황제는 1077년 카노사에서 용서를 구하였다. 1122년 보름스 협약으로 교황이 서임권을 차지하였고, 13세기 인노켄티우스 3세 때 교황권이 절정에 이르렀다.',
      terms: [
        { label: '성직자 서임권', def: '성직자를 임명하는 권한.' },
        { label: '클뤼니 수도원', def: '10세기 초 교회 개혁 운동의 중심이 된 수도원.' },
        { label: '보름스 협약', def: '황제가 가진 성직자 서임권을 교황이 차지한 협약(1122).' }
      ],
      timeline: [
        { yl: '10세기 초', label: '클뤼니 수도원의 개혁 운동' },
        { y: 1077, label: '◆ 카노사의 굴욕' },
        { y: 1122, label: '보름스 협약' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-schism', 'w-crusade', 'w-avignon']
  },
  'w-crusade': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '십자군 전쟁 — 11세기 후반 셀주크 튀르크가 비잔티움 제국을 위협하자 비잔티움 황제가 교황에게 도움을 요청하였다. 교황 우르바누스 2세가 클레르몽 공의회(1095)에서 성지 회복을 위한 전쟁을 호소하여 1096년 십자군 전쟁이 시작되었다. 제1차 십자군은 예루살렘을 되찾았으나 이후 원정은 실패를 거듭하였고, 제4차 십자군(1202)은 콘스탄티노폴리스를 약탈하였다. 전쟁 결과 교황의 권위가 약해지고 동방 무역이 활발해졌으며, 이슬람·비잔티움 문화를 접한 경험은 르네상스의 자극제가 되었다.',
      terms: [
        { label: '클레르몽 공의회', def: '우르바누스 2세가 성지 회복을 호소한 공의회(1095).' },
        { label: '성지 회복', def: '예루살렘을 이슬람 세력에게서 되찾는 것.' }
      ],
      timeline: [
        { y: 1095, label: '클레르몽 공의회' },
        { y: 1096, label: '◆ 십자군 전쟁 시작' },
        { y: 1202, label: '제4차 십자군 전쟁 시작' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-seljuk', 'w-schism', 'w-avignon', 's-fatimid']
  },
  'w-avignon': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '아비뇽 유수 — 십자군 전쟁 실패 이후 교황의 권위가 약해졌다. 프랑스 왕 필리프 4세는 교황 보니파키우스 8세와 대립하였고, 의회(삼부회)의 지지를 얻어 교황을 굴복시켰다. 이후 교황청이 1309년부터 1377년까지 프랑스 아비뇽으로 옮겨져 프랑스 왕의 영향력 아래 놓였다. 이어 교회의 대분열이 일어났다가 콘스탄츠 공의회(1414)에서 수습되었다. 위클리프와 후스는 교회의 세속화를 비판하였다.',
      terms: [
        { label: '삼부회', def: '성직자·귀족·평민 대표로 구성된 프랑스의 신분제 의회.' },
        { label: '교회의 대분열', def: '교황이 동시에 여럿 서서 교회가 분열한 사태.' },
        { label: '위클리프·후스', def: '교회의 세속화를 비판한 개혁가.' }
      ],
      timeline: [
        { y: 1309, label: '◆ 아비뇽 유수' },
        { y: 1377, label: '교황청 로마 복귀' },
        { y: 1414, label: '콘스탄츠 공의회' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-canossa', 'w-crusade', 'w-luther']
  },
  'w-hundred': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '백년 전쟁 — 모직물 공업 지대인 플랑드르 지방을 둘러싼 이해관계와 영국 왕의 프랑스 왕위 계승권 주장으로 영국과 프랑스가 충돌하였다(1337~1453). 잔 다르크 등의 활약으로 프랑스가 승리하였다. 영국에서는 이어 장미 전쟁(1455)이 일어났다. 두 전쟁을 거치며 제후·기사 세력이 약해지고 국왕 중심의 중앙 집권 국가가 나타났다. 14세기 흑사병이 퍼진 뒤 농민 반란(자크리 난, 와트 타일러 난)이 일어나 장원제가 흔들렸다.',
      terms: [
        { label: '플랑드르', def: '모직물 공업이 발달한 지역. 영국과 프랑스의 이해가 엇갈렸다.' },
        { label: '잔 다르크', def: '백년 전쟁에서 프랑스의 승리를 이끈 인물.' },
        { label: '흑사병', def: '14세기 유럽에 퍼져 인구를 크게 줄인 전염병(페스트).' }
      ],
      timeline: [
        { y: 1337, label: '◆ 백년 전쟁 시작' },
        { y: 1358, label: '자크리 난(프랑스)' },
        { y: 1381, label: '와트 타일러 난(영국)' },
        { y: 1453, label: '백년 전쟁 종결' },
        { y: 1455, label: '장미 전쟁 시작' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-avignon', 'w-columbus']
  },
  'w-columbus': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '신항로 개척 — 『동방견문록』 등으로 동방에 대한 관심이 커지고 향신료 수요가 늘어났으나, 오스만 제국이 지중해 동부의 교역로를 장악하였다. 나침반과 항해술이 발달하면서 포르투갈과 에스파냐가 새 항로 개척에 나섰다. 에스파냐의 후원을 받은 콜럼버스가 1492년 서인도 제도에 도착하였고, 바스쿠 다 가마(1498)와 마젤란 일행(1519~1522)의 항해가 이어졌다. 이후 유럽·아메리카·아프리카·아시아를 잇는 세계적 교역망이 형성되었다.',
      terms: [
        { label: '신항로 개척', def: '15~16세기 유럽인이 아메리카와 아시아로 가는 바닷길을 연 일.' },
        { label: '향신료', def: '후추 등 음식의 풍미를 높이는 동방의 물품.' }
      ],
      timeline: [
        { y: 1492, label: '◆ 콜럼버스, 서인도 제도 도착' },
        { y: 1498, label: '바스쿠 다 가마, 인도 도착' },
        { y: 1519, label: '마젤란 일행 세계 일주 출발' },
        { y: 1521, label: '아스테카 제국 멸망' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-gama', 'w-magellan', 'w-aztec', 'w-inca', 'e-ming']
  },
  'w-gama': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '바스쿠 다 가마 인도 도착 — 포르투갈은 아프리카 서해안을 따라 남쪽으로 항로를 개척하였다. 바스쿠 다 가마는 아프리카 남쪽 끝을 돌아 1498년 인도 캘리컷에 도착하여 인도 항로를 열었다. 포르투갈은 이후 인도 고아와 믈라카(1511)를 점령하고 향신료 무역을 장악하였다.',
      terms: [
        { label: '캘리컷', def: '인도 서남부의 항구. 바스쿠 다 가마가 도착한 곳.' },
        { label: '믈라카', def: '동남아시아 해상 교역의 요충지. 1511년 포르투갈이 점령하였다.' }
      ],
      timeline: [
        { y: 1492, label: '콜럼버스, 서인도 제도 도착' },
        { y: 1498, label: '◆ 바스쿠 다 가마, 캘리컷 도착' },
        { y: 1511, label: '포르투갈, 믈라카 점령' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-columbus', 'w-magellan', 's-mughal']
  },
  'w-luther': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '종교 개혁 — 교황 레오 10세가 면벌부를 판매하자 루터가 1517년 「95개조 반박문」을 발표하였다. 루터는 믿음을 통해서만 구원받을 수 있으며 성서만이 신앙의 근거라고 주장하였다. 독일 제후들의 지지 속에 아우크스부르크 화의(1555)로 루터파가 공인되었다. 칼뱅은 예정설을 주장하여 신흥 상공업자의 지지를 받았고, 영국에서는 헨리 8세가 수장법(1534)을 공포하였다. 로마 가톨릭교회는 트리엔트 공의회를 열어 교리를 재확인하고 내부 개혁에 나섰다.',
      terms: [
        { label: '면벌부', def: '죄에 대한 벌을 면해 준다며 교회가 판매한 증서.' },
        { label: '예정설', def: '구원받을 사람은 신이 미리 정해 두었다는 칼뱅의 주장.' },
        { label: '수장법', def: '영국 국왕을 영국 교회의 수장으로 정한 법(1534).' },
        { label: '트리엔트 공의회', def: '교황의 권위와 교리를 재확인한 로마 가톨릭교회의 공의회.' }
      ],
      timeline: [
        { y: 1517, label: '◆ 루터, 「95개조 반박문」 발표' },
        { y: 1534, label: '헨리 8세, 수장법 공포' },
        { y: 1555, label: '아우크스부르크 화의' },
        { y: 1618, label: '30년 전쟁 시작' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-avignon', 'w-westphalia', 'w-armada']
  },
  'w-magellan': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '마젤란 세계 일주 — 에스파냐의 지원을 받은 마젤란 일행은 1519년 출발하여 남아메리카 남단을 돌아 태평양을 건넜다. 마젤란은 필리핀에서 죽었으나 일행은 1522년 돌아와 처음으로 세계 일주를 달성하였다. 에스파냐는 이후 필리핀 마닐라를 점령하였고(1571), 아메리카의 은이 마닐라를 거쳐 아시아로 흘러들었다.',
      terms: [
        { label: '갈레온 무역', def: '에스파냐가 대형 범선으로 아메리카와 아시아(마닐라)를 잇던 무역.' }
      ],
      timeline: [
        { y: 1519, label: '◆ 마젤란 일행 출발' },
        { y: 1522, label: '세계 일주 달성' },
        { y: 1571, label: '에스파냐, 마닐라 점령' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-columbus', 'w-gama', 'w-inca']
  },
  'w-aztec': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '아스테카 제국 멸망 — 아스테카 문명은 멕시코고원의 테노치티틀란을 중심으로 번영하였다. 에스파냐의 코르테스가 화포로 무장한 병력을 이끌고 1521년 아스테카 제국을 정복하였다. 유럽인이 옮긴 천연두 등 전염병으로 원주민 인구가 급감하였고, 에스파냐는 대농장과 광산에 원주민과 아프리카에서 끌려온 노예를 동원하였다.',
      terms: [
        { label: '테노치티틀란', def: '아스테카 제국의 수도.' },
        { label: '천연두', def: '유럽인이 아메리카로 옮긴 전염병. 원주민 인구 급감의 원인이 되었다.' }
      ],
      timeline: [
        { y: 1492, label: '콜럼버스, 서인도 제도 도착' },
        { y: 1521, label: '◆ 아스테카 제국 멸망' },
        { y: 1533, label: '잉카 제국 멸망' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-america', 'w-inca', 'w-columbus']
  },
  'w-inca': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '잉카 제국 멸망 — 안데스고원에서 발달한 잉카 문명은 산비탈에 계단식 밭을 만들고 관개 수로로 농업을 발전시켰다. 뛰어난 건축 기술로 도로망을 건설하고 수도 쿠스코에 태양신을 섬기는 신전을 세웠으며, 매듭 문자인 키푸로 정보를 기록하였다. 신항로 개척 이후 에스파냐의 피사로는 총포와 말로 무장한 소규모 부대를 이끌고 내전으로 쇠퇴한 잉카 제국을 정복하였다(1533). 그는 황제를 사로잡아 몸값으로 황금을 받은 뒤 처형하였다. 이후 에스파냐는 포토시 은광 등에서 원주민을 강제로 동원해 은을 캐냈고, 원주민은 가혹한 노동과 유럽에서 전파된 천연두·홍역 등의 전염병으로 크게 줄었다.',
      terms: [
        { label: '키푸', def: '잉카 제국에서 쓴 매듭 문자 체계. 끈·실의 색과 매듭으로 숫자와 정보를 기록하였다.' },
        { label: '쿠스코', def: '잉카 제국의 수도. 태양신을 섬기는 신전이 있었다.' },
        { label: '포토시 은광', def: '에스파냐가 원주민을 강제 동원해 개발한 세계 최대의 은광(1545년 발견).' }
      ],
      timeline: [
        { y: 1492, label: '콜럼버스, 서인도 제도 도착' },
        { y: 1533, label: '◆ 잉카 제국 멸망' },
        { y: 1545, label: '포토시 은광 발견' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-america', 'w-aztec', 'e-ming']
  },
  'w-armada': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '무적함대 격파 — 에스파냐의 펠리페 2세는 레판토 해전(1571)에서 오스만 제국의 함대를 격파하여 지중해 해상권을 장악하고, 아메리카 식민지의 부로 전성기를 누렸다. 영국의 엘리자베스 1세는 영국 국교회를 확립하고 중상주의 정책을 펼쳤으며, 1588년 에스파냐의 무적함대를 격파하였다. 이후 영국은 해외 시장을 개척하며 해상 강국으로 성장하였다.',
      terms: [
        { label: '중상주의', def: '국가가 상공업을 보호·육성하여 부를 늘리려는 경제 정책.' },
        { label: '무적함대', def: '에스파냐의 대함대.' }
      ],
      timeline: [
        { y: 1571, label: '레판토 해전' },
        { y: 1588, label: '◆ 영국, 무적함대 격파' },
        { y: 1600, label: '영국 동인도 회사 설립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-ottoman', 'w-luther', 'w-glorious']
  },
  'w-louis14': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '루이 14세 즉위 — 16~18세기 유럽에서는 관료제와 상비군을 바탕으로 국왕이 강력한 권력을 행사하는 절대 왕정이 나타났다. 국왕들은 왕권신수설로 권력을 정당화하고 중상주의 정책을 펼쳤다. 프랑스의 루이 14세는 1643년 즉위하여 콜베르를 등용해 중상주의를 추진하고, 베르사유 궁전을 지어 강력한 왕권을 과시하였다. 낭트 칙령을 폐지하여 신교도(위그노)가 대거 떠났다.',
      terms: [
        { label: '절대 왕정', def: '관료제와 상비군을 바탕으로 국왕이 강력한 권력을 행사한 정치 체제.' },
        { label: '왕권신수설', def: '왕권은 신으로부터 받은 것이라는 주장.' },
        { label: '베르사유 궁전', def: '루이 14세가 지은 궁전. 강력한 왕권의 상징.' }
      ],
      timeline: [
        { y: 1643, label: '◆ 루이 14세 즉위' },
        { y: 1648, label: '베스트팔렌 조약' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-westphalia', 'w-glorious', 'w-french-rev']
  },
  'w-westphalia': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '베스트팔렌 조약 — 종교 개혁 이후 신교와 구교의 대립으로 유럽 곳곳에서 종교 전쟁이 일어났다. 1618년 보헤미아에서 일어난 30년 전쟁이 신성 로마 제국 전역으로 퍼지고 국제 전쟁으로 확대되었다. 1648년 베스트팔렌 조약으로 전쟁이 끝나 네덜란드의 독립이 승인되고 칼뱅파가 인정되었으며, 신성 로마 제국 안 제후들의 권한이 강화되었다. 유럽에 종교적 관용이 자리 잡는 계기가 되었다.',
      terms: [
        { label: '30년 전쟁', def: '보헤미아에서 시작된 종교 전쟁이 국제 전쟁으로 확대된 전쟁(1618~1648).' }
      ],
      timeline: [
        { y: 1555, label: '아우크스부르크 화의' },
        { y: 1598, label: '낭트 칙령' },
        { y: 1618, label: '30년 전쟁 시작' },
        { y: 1648, label: '◆ 베스트팔렌 조약' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-luther', 'w-louis14']
  },
  'w-glorious': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '명예혁명 — 17세기 영국에서 국왕이 의회를 무시하고 전제 정치를 펼치자 의회는 권리 청원(1628)을 제출하였다. 청교도 혁명(1642~1649)으로 공화정이 수립되었으나 크롬웰의 독재 이후 왕정이 복고되었다. 제임스 2세가 다시 전제 정치를 펴자 의회는 1688년 그의 딸 메리와 남편 윌리엄을 공동 왕으로 추대하였다. 유혈 사태 없이 혁명이 이루어져 명예혁명이라 한다. 이듬해 권리 장전이 승인되어 의회 중심의 입헌 군주제가 확립되었다.',
      terms: [
        { label: '권리 청원', def: '의회의 동의 없는 과세 등을 금지하도록 왕에게 요구한 문서(1628).' },
        { label: '청교도 혁명', def: '크롬웰이 이끈 의회파가 왕을 처형하고 공화정을 세운 혁명.' },
        { label: '권리 장전', def: '의회의 권리를 법으로 확인한 문서(1689).' }
      ],
      timeline: [
        { y: 1628, label: '권리 청원' },
        { y: 1642, label: '청교도 혁명' },
        { y: 1688, label: '◆ 명예혁명' },
        { y: 1689, label: '권리 장전 승인' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-armada', 'w-us-indep', 'w-industrial']
  },
  'w-industrial': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '산업 혁명 — 18세기 후반 영국에서 시작된 기술 혁신과 생산 방식의 변화. 인클로저 운동으로 노동력이 풍부해지고, 해외 식민지로 자본과 시장을 확보하였으며, 석탄과 철 등 자원이 풍부하였다. 면직물 공업에서 기계가 발명되고 와트가 증기 기관을 개량하면서 공장제 기계 공업이 발달하였다. 1804년 최초의 증기 기관차가 선보이는 등 교통도 혁신되었다. 도시화가 진행되고 자본가와 노동자 계층이 형성되었으며, 노동 문제 속에서 사회주의 사상이 등장하였다.',
      terms: [
        { label: '인클로저 운동', def: '대지주가 공유지 등에 울타리를 쳐 농민이 도시 노동자가 된 현상.' },
        { label: '증기 기관', def: '와트가 개량한 동력 기관. 공장과 교통에 쓰였다.' },
        { label: '사회주의', def: '생산 수단의 공동 소유로 평등한 사회를 이루려는 사상.' }
      ],
      timeline: [
        { yl: '18세기 후반', label: '◆ 영국에서 산업 혁명 시작' },
        { y: 1804, label: '최초의 증기 기관차' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-glorious', 'w-feb', 'w-germany']
  },
  'w-us-indep': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '미국 독립 선언 — 영국이 7년 전쟁 이후 재정을 메우려 북아메리카 13개 식민지에 세금을 부과하자 식민지인들이 반발하였다. 보스턴 차 사건(1773) 이후 대륙 회의를 열었고(1774), 1776년 독립 선언문을 발표하였다. 독립 전쟁에서 승리하여 파리 조약(1783)으로 독립을 인정받았다. 1787년 삼권 분립과 연방제를 바탕으로 한 헌법을 제정하고 워싱턴을 초대 대통령으로 선출하였다.',
      terms: [
        { label: '보스턴 차 사건', def: '영국의 차 독점에 반발해 보스턴 항구의 차를 바다에 버린 사건(1773).' },
        { label: '대륙 회의', def: '식민지 대표들이 모여 영국에 대한 대응을 논의한 회의.' },
        { label: '삼권 분립', def: '입법·행정·사법의 권력을 나누어 견제하게 한 원칙.' }
      ],
      timeline: [
        { y: 1773, label: '보스턴 차 사건' },
        { y: 1774, label: '제1차 대륙 회의' },
        { y: 1776, label: '◆ 독립 선언문 발표' },
        { y: 1783, label: '파리 조약' },
        { y: 1787, label: '미국 헌법 제정' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-glorious', 'w-french-rev', 'w-civilwar']
  },
  'w-french-rev': {
    notes: { sections: [] },
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '프랑스 혁명 — 구제도의 모순과 계몽사상의 확산, 재정 위기 속에서 루이 16세가 삼부회를 소집하였다. 제3 신분 대표들이 1789년 국민 의회를 세우고 파리 시민이 바스티유 감옥을 습격하면서 혁명이 시작되었다. 국민 의회는 인권 선언을 발표하였다. 입법 의회(1791)에 이어 국민 공회(1792)가 공화정을 선포하고 루이 16세를 처형하였다. 로베스피에르의 공포 정치와 총재 정부(1795)를 거쳐 1799년 나폴레옹의 통령 정부가 수립되었다.',
      terms: [
        { label: '삼부회', def: '성직자(제1 신분)·귀족(제2 신분)·평민(제3 신분) 대표의 신분제 의회.' },
        { label: '인권 선언', def: '자유와 평등, 국민 주권 등 혁명의 기본 이념을 담은 선언(1789).' },
        { label: '공포 정치', def: '로베스피에르가 반혁명 세력을 가혹하게 처벌한 통치.' }
      ],
      timeline: [
        { y: 1789, label: '◆ 국민 의회 설립·바스티유 습격' },
        { y: 1791, label: '입법 의회' },
        { y: 1792, label: '국민 공회·공화정' },
        { y: 1795, label: '총재 정부' },
        { y: 1799, label: '통령 정부' }
      ]
    },
    sources: [
      {
        kind: '선언문',
        title: '「인간과 시민에 관한 권리 선언」 (1789. 8. 26.) — 발췌',
        body: '제11조  사상과 의견의 자유로운 전달은 인간의 가장 귀중한 권리 중 하나이다. 제12조  인권과 시민권을 보장하기 위해 공권력이 필요하다. 공권력은 모든 사람의 이익을 위해 마련된 것이고, 그것을 위임받은 사람들의 사적 이익을 위해 마련된 것이 아니다.',
        citation: '— W4, pp. 2936–2938 (이영효, 『사료로 읽는 서양사 4』)'
      },
      {
        kind: '교과서 본문',
        title: '혁명의 직접적 원인',
        body: '프랑스 혁명이 일어난 직접적인 원인은 잇따른 전쟁과 미국 혁명에 대한 개입, 사치 생활로 인한 왕실의 재정 위기였다. 1789년 루이 16세는 베르사유 궁전에 삼부회(삼신분회)를 소집하였다. … 국민 의회는 인근 테니스코트에 모여 새 헌법을 제정하기 전까지 해산하지 않겠다는 선언을 발표하였다. 이 사건은 프랑스 혁명이 본격화되는 하나의 계기가 되었다.',
        citation: '— W4, pp. 2888–2896'
      },
      {
        kind: '계보',
        title: '인권 선언의 사상적 계보',
        body: '권리 장전(1689)은 의회의 권한을 강조함으로써 입헌 정치를 확립하였고, 훗날 미국 독립 선언문과 프랑스의 인권 선언(인간과 시민의 권리선언)에도 영향을 주었다.',
        citation: '— W4, pp. 2769–2770'
      }
    ],
    artifacts: [
      { slot: 'document', caption: '프랑스 인권 선언 (1789. 8. 26.)', ref: 'W4, p. 2924' },
      { slot: 'wide', caption: '바스티유 광장 · 베르사유 궁전', ref: 'W4, pp. 2563–2566' },
      { slot: 'portrait', caption: '프랑스 혁명에서 활약한 시에예스', ref: 'W4, p. 2733' }
    ],
    linked: ['w-us-indep', 'w-napoleon', 'w-louis14', 'w-ww1', 'w-russia', 'e-meiji'],
    map: {
      title: '프랑스 혁명의 무대 — 파리',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 100 60 Q 80 110 110 170 Q 180 210 240 180 Q 270 130 245 80 Q 190 50 100 60 Z', label: '프랑스' }
      ],
      pins: [
        { x: 175, y: 105, label: '파리', sub: '국민 의회' },
        { x: 185, y: 100, label: '바스티유 광장', sub: '1789.7.14 습격', red: true },
        { x: 155, y: 115, label: '베르사유 궁전', sub: '삼부회 소집' },
        { x: 70, y: 180, label: '워털루', sub: '1815 · 나폴레옹 패배' }
      ],
      arrows: [
        { from: [155, 115], to: [185, 100], label: '파리 진출' }
      ]
    }
  },
  'w-napoleon': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '나폴레옹 황제 즉위 — 통령 정부의 제1 통령이 된 나폴레옹은 『나폴레옹 법전』을 편찬하는 등 개혁을 추진하여 국민의 지지를 얻었고, 1804년 국민 투표로 황제에 즉위하였다(제1 제정). 유럽 대부분을 장악하고 영국을 견제하려 대륙 봉쇄령을 내렸으나, 러시아가 영국과 교역을 계속하자 러시아 원정에 나섰다가 실패하였다(1812). 이후 몰락하였다. 나폴레옹 전쟁은 유럽 각지에 자유주의와 민족주의를 퍼뜨렸다.',
      terms: [
        { label: '『나폴레옹 법전』', def: '법 앞의 평등, 사유 재산 보호 등을 담은 민법전.' },
        { label: '대륙 봉쇄령', def: '유럽 대륙과 영국의 교역을 금지한 명령.' }
      ],
      timeline: [
        { y: 1799, label: '통령 정부 수립' },
        { y: 1804, label: '◆ 황제 즉위(제1 제정)' },
        { y: 1812, label: '러시아 원정' },
        { y: 1814, label: '빈 회의' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-french-rev', 'w-vienna', 'w-haiti']
  },
  'w-haiti': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '아이티 독립 — 생도맹그라고 불리던 섬에서 투생 루베르튀르가 이끈 흑인 노예들이 프랑스에 맞서 싸워 1804년 라틴 아메리카 최초의 독립 국가 아이티를 세웠다. 이후 식민지 태생 백인인 크리오요가 중심이 되어 독립운동이 확산되었고, 볼리바르와 산마르틴 등의 활약으로 라틴 아메리카 여러 나라가 독립하였다. 멕시코는 1821년 독립하였다.',
      terms: [
        { label: '크리오요', def: '라틴 아메리카 식민지에서 태어난 백인. 독립운동을 이끌었다.' },
        { label: '볼리바르·산마르틴', def: '라틴 아메리카 독립운동의 지도자.' }
      ],
      timeline: [
        { y: 1804, label: '◆ 아이티 독립' },
        { y: 1821, label: '멕시코 독립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-napoleon', 'w-vienna', 'w-us-indep']
  },
  'w-vienna': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '빈 회의 — 나폴레옹 몰락 후 오스트리아의 메테르니히 주도로 유럽 각국 대표가 모여 전후 처리를 논의하였다(1814~1815). 혁명 이전의 질서로 되돌리려는 빈 체제가 성립하였고, 이를 지키려 신성 동맹 등을 맺었다. 그러나 자유주의·민족주의 운동이 이어져 그리스가 오스만 제국으로부터 독립하고(1829) 라틴 아메리카 각국이 독립하였다.',
      terms: [
        { label: '빈 체제', def: '혁명 이전의 군주제 질서를 되살리려 한 보수적 국제 질서.' },
        { label: '메테르니히', def: '빈 회의를 주도한 오스트리아의 재상.' }
      ],
      timeline: [
        { y: 1814, label: '◆ 빈 회의' },
        { y: 1829, label: '그리스 독립' },
        { y: 1830, label: '7월 혁명' },
        { y: 1848, label: '2월 혁명 → 빈 체제 붕괴' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-napoleon', 'w-july', 'w-feb', 's-tanzimat']
  },
  'w-july': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '7월 혁명 — 빈 체제로 프랑스에서 부르봉 왕실이 부활하였다. 샤를 10세가 의회를 해산하고 선거권을 제한하는 등 전제 정치를 펼치자 1830년 파리 시민이 봉기하였다. 시민들은 루이 필리프를 왕으로 추대하여 7월 왕정을 수립하였다. 7월 혁명의 영향으로 벨기에가 독립하였다. 영국에서는 선거법 개정과 차티스트 운동 등 자유주의 개혁이 이어졌다.',
      terms: [
        { label: '7월 왕정', def: '7월 혁명으로 루이 필리프가 세운 입헌 군주정.' },
        { label: '차티스트 운동', def: '노동자들이 선거권 확대를 요구한 영국의 운동.' }
      ],
      timeline: [
        { y: 1814, label: '빈 회의' },
        { y: 1830, label: '◆ 7월 혁명' },
        { y: 1848, label: '2월 혁명' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-vienna', 'w-feb']
  },
  'w-feb': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '2월 혁명 — 7월 왕정 아래 선거권이 일부 부유층에 한정되자 중소 시민과 노동자가 선거권 확대를 요구하였다. 1848년 파리 시민이 7월 왕정을 무너뜨리고 제2공화정을 수립하였다. 그 영향으로 유럽 각지에서 혁명이 일어나 메테르니히가 물러나고 빈 체제가 무너졌다. 같은 해 마르크스와 엥겔스가 『공산당 선언』을 발표하였다. 이후 대통령에 당선된 루이 나폴레옹이 황제가 되었다(제2제정).',
      terms: [
        { label: '제2공화정', def: '2월 혁명으로 수립된 프랑스의 공화정.' },
        { label: '『공산당 선언』', def: '마르크스와 엥겔스가 노동자의 단결을 호소한 글(1848).' }
      ],
      timeline: [
        { y: 1830, label: '7월 혁명' },
        { y: 1848, label: '◆ 2월 혁명·빈 체제 붕괴' },
        { y: 1871, label: '독일 제국 수립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-july', 'w-vienna', 'w-italy', 'w-germany']
  },
  'w-italy': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '이탈리아 왕국 — 빈 체제 이후 이탈리아는 여러 왕국과 교황령 등으로 분열되어 있었고 오스트리아의 간섭을 받았다. 사르데냐 왕국이 통일 운동을 주도하여 북부를 통합하였고, 가리발디가 남부의 시칠리아와 나폴리를 점령하여 사르데냐 왕국에 바쳤다. 1861년 이탈리아 왕국이 수립되었고, 이후 베네치아를 병합하고 로마 교황령을 점령하여(1870) 통일을 완성하였다.',
      terms: [
        { label: '사르데냐 왕국', def: '이탈리아 통일을 주도한 북부의 왕국.' },
        { label: '가리발디', def: '남부 이탈리아를 점령하여 사르데냐 왕국에 바친 인물.' }
      ],
      timeline: [
        { y: 1848, label: '2월 혁명' },
        { y: 1861, label: '◆ 이탈리아 왕국 수립' },
        { y: 1870, label: '교황령 점령 → 통일 완성' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-feb', 'w-germany']
  },
  'w-civilwar': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '남북 전쟁 — 미국은 서부로 영토를 넓히면서 노예제를 둘러싸고 남부와 북부가 대립하였다. 공업이 발달한 북부는 보호 무역과 노예제 반대를, 대농장 중심의 남부는 자유 무역과 노예제 유지를 주장하였다. 노예제 확대에 반대한 링컨이 대통령에 당선되자 남부 주들이 연방에서 탈퇴하여 1861년 전쟁이 일어났다. 링컨이 노예 해방 선언(1863)을 발표하였고 1865년 북부가 승리하였다. 이후 대륙 횡단 철도가 개통되는 등 미국은 공업국으로 성장하였다.',
      terms: [
        { label: '노예 해방 선언', def: '링컨이 남부 반란 지역의 노예 해방을 선언한 문서(1863).' },
        { label: '대륙 횡단 철도', def: '미국 동부와 서부를 잇는 철도(1869).' }
      ],
      timeline: [
        { y: 1861, label: '◆ 남북 전쟁 발발' },
        { y: 1863, label: '노예 해방 선언' },
        { y: 1865, label: '북부 승리' },
        { y: 1869, label: '대륙 횡단 철도 개통' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-us-indep', 'w-industrial']
  },
  'w-germany': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '독일 제국 — 빈 체제 이후 독일 지역은 여러 국가로 나뉘어 있었다. 프로이센이 관세 동맹을 결성하여 경제적 통합을 주도하였고, 비스마르크는 철혈 정책을 내세워 군비를 확장하였다. 프로이센은 오스트리아(1866)와 프랑스(1870)와의 전쟁에서 승리한 뒤, 1871년 빌헬름 1세가 황제로 즉위하고 독일 제국의 성립을 선포하였다. 비스마르크는 프랑스를 고립시키는 동맹 체제를 만들었다.',
      terms: [
        { label: '관세 동맹', def: '프로이센 중심으로 독일 국가들의 관세를 없앤 경제 동맹.' },
        { label: '철혈 정책', def: '군비 확장(철과 피)으로 통일을 이루려 한 비스마르크의 정책.' }
      ],
      timeline: [
        { y: 1866, label: '프로이센·오스트리아 전쟁' },
        { y: 1870, label: '프로이센·프랑스 전쟁' },
        { y: 1871, label: '◆ 독일 제국 성립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-italy', 'w-ww1', 'w-feb']
  },
  'w-ww1': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '제1차 세계 대전 — 제국주의 열강의 식민지 경쟁 속에서 3국 동맹(독일·오스트리아·이탈리아)과 3국 협상(영국·프랑스·러시아)이 대립하였다. 발칸반도에서는 범게르만주의와 범슬라브주의가 충돌하여 ‘유럽의 화약고’라 불렸다. 1914년 사라예보 사건을 계기로 전쟁이 시작되었다. 신무기가 동원된 총력전이 벌어졌고, 독일의 무제한 잠수함 작전을 계기로 미국이 참전하였다(1917). 러시아는 혁명으로 전쟁에서 빠졌고, 1918년 독일이 항복하였다.',
      terms: [
        { label: '3국 동맹·3국 협상', def: '독일 중심의 동맹과 영국·프랑스·러시아의 협상 체제.' },
        { label: '사라예보 사건', def: '오스트리아 황태자 부부가 세르비아 청년에게 암살된 사건(1914).' },
        { label: '총력전', def: '국가의 모든 인적·물적 자원을 동원한 전쟁.' },
        { label: '범슬라브주의', def: '슬라브족의 단결을 내세운 러시아의 사상. 발칸반도로의 세력 확대 명분이 되었다.' },
        { label: '범게르만주의', def: '게르만족의 단결을 표방한 독일·오스트리아-헝가리의 사상.' }
      ],
      timeline: [
        { y: 1914, label: '◆ 사라예보 사건·전쟁 발발' },
        { y: 1917, label: '러시아 혁명·미국 참전' },
        { y: 1918, label: '독일 항복' },
        { y: 1919, label: '파리 강화 회의' }
      ]
    },
    sources: [
      {
        kind: '교과서 본문',
        title: '사라예보 사건과 총력전',
        body:
          '이러한 상황에서 사라예보 사건이 터지자 유럽 열강은 이해관계에 따라 편이 나뉘어 총력전을 벌였다. 팽팽하던 전쟁은 미국이 참전하면서 영국, 프랑스가 주축이 된 연합국의 승리로 막을 내렸다.',
        citation: '— K3, pp. 280–282'
      },
      {
        kind: '교과서 본문',
        title: '신무기와 인명 피해',
        body:
          '제1차 세계 대전은 탱크가 등장하고 독가스가 사용되는 등 이전의 전쟁과 다른 양상으로 전개되었다. 그 결과 엄청난 인명 피해와 시설 파괴가 발생하면서 평화를 갈망하는 목소리가 높아졌다. … 파괴력이 큰 신무기가 동원되어 900만여 명이 사망하고, 2,200만여 명이 부상을 입는 인명 피해가 발생하였다.',
        citation: '— K3, pp. 288–323'
      },
      {
        kind: '세계사 본문',
        title: '전쟁 양상을 바꾼 세 요소',
        body:
          '세 가지 요소가 전쟁의 양상을 완전히 뒤바꾸어 놓았다. 첫째, 그때까지 알려지지 않았던 장거리 대포, 기관총, 수류탄, 전차, 독가스, 전투기와 폭격기, 잠수함 등 …',
        citation: '— W5, pp. 2181–2183'
      },
      {
        kind: '사료',
        title: '사라예보 사건의 발단',
        body:
          '오스트리아-헝가리 제국의 보스니아 합병에 반발한 세르비아 청년이 오스트리아-헝가리 제국 황태자 부부를 암살하였다.',
        citation: '— K3, pp. 283–287'
      }
    ],
    map: {
      title: '제1차 세계 대전 — 유럽 전선',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 40 100 Q 70 60 130 70 Q 200 50 270 70 Q 320 90 330 140 Q 300 200 230 210 Q 150 220 80 200 Q 30 170 40 100 Z',
          label: '유럽' }
      ],
      pins: [
        { x: 215, y: 145, label: '사라예보',  sub: '1914.6.28', red: true },
        { x: 145, y: 110, label: '베를린',     sub: '동맹국' },
        { x: 110, y: 130, label: '파리',       sub: '연합국' },
        { x: 60,  y: 100, label: '런던' },
        { x: 280, y: 105, label: '상트페테르부르크', sub: '러시아 혁명' },
        { x: 195, y: 130, label: '빈',         sub: '오스트리아-헝가리' }
      ],
      arrows: [
        { from: [215, 145], to: [195, 130], label: '암살' },
        { from: [195, 130], to: [145, 110], label: '동맹' }
      ]
    },
    artifacts: [
      { slot: 'wide',     caption: '사라예보 사건 (1914)',                      ref: 'W5, p. 2164' },
      { slot: 'wide',     caption: '독가스 방독면을 쓴 병사',                    ref: 'K3, p. 322' },
      { slot: 'wide',     caption: '범게르만주의 ↔ 범슬라브주의 대립 지도',      ref: 'K3, p. 320' },
      { slot: 'document', caption: '윌슨의 14개조 평화 원칙 (파리 강화 회의)',    ref: 'K3, pp. 339–343' }
    ],
    linked: ['w-germany', 'w-russia', 'w-paris', 's-young-turk', 'k-samil', 'k-annexation']
  },
  'w-russia': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '러시아 혁명 — 제1차 세계 대전으로 고통받던 러시아에서 1917년 3월 혁명이 일어나 황제 니콜라이 2세가 물러나고 임시 정부가 수립되었다. 같은 해 11월 레닌이 이끄는 볼셰비키가 임시 정부를 무너뜨리고 소비에트 정권을 세웠다. 레닌은 독일과 강화를 맺어 전쟁에서 빠졌으며, 1922년 소비에트 사회주의 공화국 연방(소련)이 수립되었다. 레닌은 코민테른(1919)을 만들고 민족 자결의 원칙을 내세워 식민지 약소민족의 해방 운동을 지원할 것을 약속하였다.',
      terms: [
        { label: '볼셰비키', def: '레닌이 이끈 혁명 세력.' },
        { label: '소비에트', def: '노동자·군인의 자치 기구에서 출발하여 러시아 혁명 당시부터 의회를 대신하는 권력 기구가 되었다.' },
        { label: '소련', def: '소비에트 사회주의 공화국 연방(1922).' },
        { label: '코민테른', def: '레닌이 세계 사회주의 혁명을 위해 만든 국제 조직(1919).' }
      ],
      timeline: [
        { y: 1905, label: '피의 일요일 사건' },
        { y: 1917, label: '◆ 3월 혁명·11월 혁명' },
        { y: 1919, label: '코민테른 결성' },
        { y: 1922, label: '소련 수립' }
      ]
    },
    sources: [
      {
        kind: '선언문',
        title: '「전 러시아 소비에트 대회의 선언문」 (1917. 11. 8.)',
        body:
          '1917년 상트페테르부르크에서 노동자와 군인들이 전제 정치 타도와 전쟁 중지를 요구하는 3월 혁명을 추진하였다. 그 결과 차르가 물러나고 임시 정부가 구성되었다. 그러나 임시 정부는 제1차 세계 대전 참전을 계속하고 토지 제도 개혁을 연기하고 있었다.',
        citation: '— W5, pp. 2292, 2306–2307'
      },
      {
        kind: '논고',
        title: '레닌, 「사회주의 혁명과 민족 자결권 테제」 (1916)',
        body:
          '… 제국주의 세력에 대한 저항을 지원해야 한다.',
        gloss:
          '소련의 등장으로 국제 질서에 변화가 일어났다. 레닌은 민족 자결의 원칙을 내세우며 식민지 약소민족의 민족 해방 운동을 지원할 것을 약속하였고, 이에 일부 지식인과 청년들이 사회주의 사상에 관심을 가졌다.',
        citation: '— K3, p. 387'
      },
      {
        kind: '교과서 본문',
        title: '혁명의 국제적 영향',
        body:
          '러시아 혁명의 영향으로 영국, 프랑스는 물론 아시아·아프리카의 여러 나라에서 사회주의 정당이 결성되고 사회 운동이 활발히 일어났다. … 한국의 3·1 운동은 그 선구적 역할을 하였고, 인도에서는 비폭력·불복종 저항을 내세운 간디의 주도로 반영 운동이 본격화 …',
        citation: '— K3, pp. 348–356'
      }
    ],
    map: {
      title: '러시아 혁명 — 페트로그라드',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 30 110 Q 80 60 180 70 Q 280 60 330 90 Q 340 150 290 190 Q 200 220 110 210 Q 40 180 30 110 Z',
          label: '러시아 / 소련' }
      ],
      pins: [
        { x: 90,  y: 110, label: '상트페테르부르크', sub: '11월 혁명', amber: true },
        { x: 130, y: 130, label: '모스크바',         sub: '소비에트 정부' },
        { x: 180, y: 90,  label: '시베리아 횡단철도' },
        { x: 280, y: 180, label: '블라디보스토크',   sub: '극동' },
        { x: 60,  y: 80,  label: '브레스트',         sub: '브레스트리토프스크 조약' }
      ],
      arrows: [
        { from: [90, 110], to: [130, 130], label: '권력 이전' }
      ]
    },
    artifacts: [
      { slot: 'portrait', caption: '레닌 (1870~1924) — 1917년 11월 혁명 주도',  ref: 'W5, p. 2146' },
      { slot: 'wide',     caption: '소비에트 대회에서 연설하는 레닌',           ref: 'W5, p. 2304' },
      { slot: 'wide',     caption: '구세력의 청소 — 레닌이 차르·귀족·자본가를 쓸어버리는 포스터', ref: 'W5, pp. 2283–2285' }
    ],
    linked: ['w-ww1', 'w-ussr', 'e-kmt-ccp', 'k-samil', 'k-annexation']
  },
  'w-paris': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '파리 강화 회의 — 제1차 세계 대전의 전후 처리를 위해 1919년 전승국 대표들이 파리에 모였다. 미국 대통령 윌슨이 민족 자결주의 등을 담은 14개조 평화 원칙을 제시하였다. 독일은 베르사유 조약으로 모든 식민지를 잃고 막대한 배상금을 물게 되었다. 1920년 국제 연맹이 창설되었고, 워싱턴 회의(1921~1922)로 아시아·태평양의 질서가 정비되었다. 민족 자결주의는 3·1 운동과 5·4 운동 등 아시아의 민족 운동에 영향을 주었다.',
      terms: [
        { label: '14개조 평화 원칙', def: '윌슨이 제시한 전후 처리 원칙. 민족 자결주의를 담았다.' },
        { label: '베르사유 조약', def: '독일과 연합국이 맺은 강화 조약.' },
        { label: '국제 연맹', def: '세계 평화를 위해 1920년 창설된 국제기구.' }
      ],
      timeline: [
        { y: 1918, label: '독일 항복' },
        { y: 1919, label: '◆ 파리 강화 회의' },
        { y: 1920, label: '국제 연맹 창설' },
        { y: 1921, label: '워싱턴 회의' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-ww1', 'k-samil', 'e-may4', 'w-depression']
  },
  'w-depression': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '대공황 — 제1차 세계 대전 이후 미국은 세계 경제의 중심국으로 성장하였으나, 생산 과잉과 소비 부진이 겹쳐 1929년 주가가 대폭락하면서 대공황이 시작되었다. 많은 은행과 기업이 도산하고 실업자가 급증하였으며 공황은 전 세계로 확산되었다. 미국은 루스벨트 대통령의 뉴딜 정책으로 정부가 경제에 개입하였고, 영국·프랑스는 블록 경제를 형성하였다. 이탈리아·독일·일본에서는 전체주의가 강화되어 대외 침략에 나섰다.',
      terms: [
        { label: '뉴딜 정책', def: '루스벨트 정부가 경제에 적극 개입하여 공황을 극복하려 한 정책.' },
        { label: '블록 경제', def: '본국과 식민지를 묶어 다른 나라 상품을 막은 경제 정책.' },
        { label: '전체주의', def: '개인보다 국가를 앞세워 국민을 통제한 체제.' }
      ],
      timeline: [
        { y: 1922, label: '무솔리니, 로마 진군' },
        { y: 1929, label: '◆ 대공황 발생' },
        { y: 1931, label: '만주 사변' },
        { y: 1934, label: '히틀러, 총통 취임' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-paris', 'w-ww2', 'e-manchuria']
  },
  'w-ww2': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '제2차 세계 대전 — 대공황 이후 전체주의 국가들이 침략에 나섰다. 독일은 소련과 불가침 조약을 맺은 뒤 1939년 폴란드를 침공하였다. 독일은 파리를 점령하고 소련을 공격하였으며, 일본은 진주만을 기습하였다(1941). 나치 독일은 아우슈비츠 등 수용소에서 수백만 명의 유대인을 학살하였다(홀로코스트). 연합국은 스탈린그라드 전투와 노르망디 상륙 작전(1944)으로 반격하였고, 1945년 독일과 일본이 항복하였다.',
      terms: [
        { label: '독소 불가침 조약', def: '독일과 소련이 서로 공격하지 않기로 한 조약.' },
        { label: '홀로코스트', def: '나치 독일이 유대인을 대량 학살한 일.' },
        { label: '노르망디 상륙 작전', def: '연합군이 프랑스 북부에 상륙한 작전(1944).' }
      ],
      timeline: [
        { y: 1939, label: '◆ 독일, 폴란드 침공' },
        { y: 1941, label: '진주만 기습(아시아·태평양 전쟁)' },
        { y: 1944, label: '노르망디 상륙 작전' },
        { y: 1945, label: '독일·일본 항복' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-depression', 'e-pacific', 'w-un', 'k-liberation']
  },
  // 한반도 문제 국제 회의 — 한국 줄기 기록과 같은 내용 (연결만 반대 줄기로)
  'w-moscow': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '한국인 구성 임시 정부 수립',
          '미·소 공동 위원회 설치',
          '**신탁 통치** 제안',
          '미국·소련·영국(+중국)',
          '최장 5년간 통치 후 독립'
        ] },
        { list: [
          '우익의 반응',
          '김구, 이승만',
          '신탁 통치 반대',
          '좌익의 반응',
          '박헌영',
          '반대 → 지지'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '모스크바 3국 외상 회의 — 1945년 12월, 미국, 영국, 소련의 외무 장관이 모스크바에 모여 제2차 세계 대전 이후의 국제 문제를 논의하였다. 이 회의에서 한국에 정부를 수립하는 방법을 두고 미국이 신탁 통치 후 정부 수립을 제안하자, 소련은 임시 정부를 먼저 수립한 뒤 임시 정부와 함께 신탁 통치를 논의하자고 하였다. 회의 결과 미국과 소련의 의견을 절충하여 한반도에 민주주의 임시 정부를 수립하고, 미·소 공동 위원회를 설치하여 이를 협의하기로 하였다. 이와 함께 한국에 최대 5년간의 신탁 통치를 실시하기로 결정하였다. 회의 결과가 국내로 전해지는 과정에서 소련이 신탁 통치를, 미국은 즉시 독립을 주장했다는 보도가 퍼졌다. 김구, 이승만 등 우익 세력은 신탁 통치가 한국인의 자주권을 부정하는 것이라고 비판하면서 거세게 신탁 통치 반대(반탁) 운동을 벌였다. 좌익 세력도 처음에는 신탁 통치에 반대하였으나, 회의의 모든 결정 사항을 파악한 후에는 총체적으로 지지하는 쪽으로 입장을 바꾸었다. 여운형 등 중도 세력은 빨리 민주주의 임시 정부를 세우기 위해 미·소 공동 위원회에 적극 협조하고, 신탁 통치는 나중에 논의하자고 주장하였다.',
      terms: [
        { label: '신탁 통치', def: '일정한 지역이 자체 통치 능력을 갖출 때까지 유엔의 위임을 받은 국가가 유엔의 감독 아래 대신 통치해 주는 제도.' },
        { label: '미·소 공동 위원회', def: '한국의 민주주의 임시 정부 조직을 돕기 위해 설치하기로 한 기구.' },
        { label: '반탁 운동', def: '김구, 이승만 등 우익 세력이 신탁 통치가 한국인의 자주권을 부정한다며 벌인 신탁 통치 반대 운동.' }
      ],
      timeline: [
        { y: 1945, label: '◆ 모스크바 3국 외상 회의(12.)' },
        { y: 1946, label: '북조선 임시 인민 위원회 조직(2.)' },
        { y: 1946, label: '제1차 미·소 공동 위원회 개최(3.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-moscow', 'w-jointcomm1']
  },
  'w-jointcomm1': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '한국 측 협의 대상 자격 분쟁',
          '미국: 모든 정치 세력 참여',
          '소련: 3상 회의 지지 단체만 참여',
          '입장 차이로 인해 휴회'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '제1차 미·소 공동 위원회 — 신탁 통치를 둘러싸고 우익과 좌익이 격렬하게 대립하는 가운데, 미국과 소련은 모스크바 3국 외상 회의에서 결정된 민주주의 임시 정부 수립 방안을 논의하고자 1946년 3월에 서울 덕수궁에서 제1차 미·소 공동 위원회를 열었다. 이 회의에서 미국과 소련은 민주주의 임시 정부 수립에 참여할 정당과 사회단체의 범위를 놓고 대립하였다. 소련은 민주주의 임시 정부 수립을 위한 협의 대상에 모스크바 3국 외상 회의 결정을 지지하는 정당과 사회단체만 참여시키자고 주장하였다. 이에 맞서 미국은 의사 표현의 자유를 내세우면서 참여를 희망하는 모든 정당과 사회단체를 포함하자고 주장하였다. 결국 미국과 소련의 주장이 맞서면서 제1차 미·소 공동 위원회는 아무런 성과를 거두지 못하고 휴회되었다.',
      terms: [
        { label: '협의 대상', def: '민주주의 임시 정부 수립을 위한 협의에 참여할 정당과 사회단체. 소련은 3국 외상 회의 결정을 지지하는 단체만, 미국은 참여를 희망하는 모든 단체를 주장하였다.' },
        { label: '덕수궁 석조전', def: '미·소 공동 위원회가 개최된 곳. 태극기와 함께 미국과 소련의 국기가 게양되었다.' }
      ],
      timeline: [
        { y: 1945, label: '모스크바 3국 외상 회의(12.)' },
        { y: 1946, label: '◆ 제1차 미·소 공동 위원회 개최(3.)' },
        { y: 1946, label: '제1차 미·소 공동 위원회 무기한 휴회 선언(5.)' },
        { y: 1946, label: '이승만, 정읍 발언(6.)' },
        { y: 1947, label: '제2차 미·소 공동 위원회 개최(5.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-jointcomm1', 'w-moscow', 'w-jointcomm2']
  },
  'w-jointcomm2': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '한국 측 협의 대상 자격 분쟁',
          '입장 차이 재확인 → 결렬'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '제2차 미·소 공동 위원회 — 미국과 소련은 1947년 5월에 제2차 미·소 공동 위원회를 열었다. 하지만 회의는 아무런 성과를 거두지 못하였다. 이에 미국이 한반도 문제를 유엔 총회에 넘기자, 소련은 모스크바 3국 외상 회의 결정 위반이라고 반발하면서 유엔 총회에 불참하였다. 유엔 총회는 미국의 제안대로 유엔 감시하에 인구 비례에 따른 남북한 총선거를 실시하여 한반도에 정부를 세울 것을 결정하였다.',
      terms: [
        { label: '미·소 공동 위원회', def: '모스크바 3국 외상 회의 결정에 따라 한국의 민주주의 임시 정부 수립 방안을 논의한 미국과 소련의 회의.' }
      ],
      timeline: [
        { y: 1946, label: '제1차 미·소 공동 위원회 개최(3.)' },
        { y: 1947, label: '◆ 제2차 미·소 공동 위원회 개최(5.)' },
        { y: 1947, label: '유엔 총회, 남북 총선거안 결의(11.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-jointcomm2', 'w-jointcomm1', 'w-un-ga', 'w-coldwar']
  },
  'w-un-ga': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '유엔 감시하 남북 총선거',
          '**인구 비례 총선거**',
          '이후 유엔 한국 임시 위원단 파견 → 소련의 입북 거부'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '유엔 총회 — 제2차 미·소 공동 위원회가 성과 없이 끝나자 미국이 한반도 문제를 유엔 총회에 넘겼다. 소련은 모스크바 3국 외상 회의 결정 위반이라고 반발하면서 유엔 총회에 불참하였다. 유엔 총회는 미국의 제안대로 유엔 감시하에 인구 비례에 따른 남북한 총선거를 실시하여 한반도에 정부를 세울 것을 결정하였다. 이를 위해 유엔 한국 임시 위원단이 한반도에 파견되었지만, 소련은 위원단의 38도선 이북 방문을 거부하였다.',
      terms: [
        { label: '유엔 한국 임시 위원단', def: '유엔 감시하의 총선거를 위해 한반도에 파견되었다. 호주, 캐나다, 중국(중화민국), 엘살바도르, 프랑스, 인도, 필리핀, 시리아의 8개국으로 구성되었다.' },
        { label: '인구 비례 총선거', def: '인구 비례에 따른 남북한 총선거. 1948년 당시 남한의 인구가 약 2.1배 많았다.' }
      ],
      timeline: [
        { y: 1947, label: '제2차 미·소 공동 위원회 개최(5.)' },
        { y: 1947, label: '◆ 유엔 총회, 남북 총선거안 결의(11.)' },
        { y: 1948, label: '유엔 한국 임시 위원단 내한(1.)' },
        { y: 1948, label: '유엔 소총회, 선거 감시가 가능한 지역에서만 우선 선거 결의(2.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-un-ga', 'w-jointcomm2', 'w-un-little', 'w-un']
  },
  'w-un-little': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '선거 가능 지역 총선거',
          '38도선 이남 지역 총선거 → 5·10 총선거 결정'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '유엔 소총회 — 유엔 총회의 결정에 따라 유엔 한국 임시 위원단이 한반도에 파견되었지만, 소련은 위원단의 38도선 이북 방문을 거부하였다. 결국 유엔은 소총회를 열어 선거 감시가 가능한 지역에서만 선거를 치르기로 결정하였다. 소총회는 유엔 총회의 소집이 어려울 때 총회의 기능을 대신하기 위해 세운 기구로, 여기서 찬성 31표, 기권 11표, 반대 2표로 선거 감시 가능 지역 선거가 결정되었다. 남한만의 단독 선거가 결정되자 김구와 김규식 등은 통일 정부 수립을 위해 김일성 등 북한 지도부에 회담을 제안하였다.',
      terms: [
        { label: '소총회', def: '유엔 총회의 소집이 어려울 때 총회의 기능을 대신하기 위해 세운 기구.' },
        { label: '선거 감시 가능 지역 선거', def: '유엔 한국 임시 위원단이 접근할 수 있는 지역, 곧 38도선 이남 지역에서 선거를 치르기로 한 결정.' }
      ],
      timeline: [
        { y: 1948, label: '유엔 한국 임시 위원단 내한(1.)' },
        { y: 1948, label: '◆ 유엔 소총회, 선거 감시가 가능한 지역에서만 우선 선거 결의(2.)' },
        { y: 1948, label: '남북 협상(4.)' },
        { y: 1948, label: '5·10 총선거' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-un-little', 'w-un-ga']
  },
  'w-un': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '국제 연합 창설 — 제2차 세계 대전 중 연합국은 대서양 헌장(1941)에서 전후 국제 평화 기구 설립을 약속하였다. 1945년 국제 연합 헌장을 바탕으로 51개국이 참여하는 국제 연합(UN)이 출범하였다. 안전 보장 이사회의 상임 이사국에 거부권을 주었고, 국제 분쟁 해결을 위해 군사적 제재를 할 수 있게 하였다. 전쟁 범죄자는 뉘른베르크와 도쿄의 국제 군사 재판에서 처벌되었다.',
      terms: [
        { label: '대서양 헌장', def: '미국과 영국이 전후 세계 질서의 원칙을 밝힌 선언(1941).' },
        { label: '안전 보장 이사회', def: '국제 평화와 안전을 책임지는 국제 연합의 핵심 기구.' }
      ],
      timeline: [
        { y: 1941, label: '대서양 헌장' },
        { y: 1945, label: '◆ 국제 연합 창설' },
        { y: 1951, label: '샌프란시스코 강화 조약' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-ww2', 'w-coldwar', 'w-paris']
  },
  'w-coldwar': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '냉전 — 제2차 세계 대전 이후 미국 중심의 자본주의 진영과 소련 중심의 공산주의 진영이 직접적인 무력 충돌 없이 정치·외교·군사 등에서 대립한 상황. 1947년 미국이 트루먼 독트린과 마셜 계획을 발표하자 소련은 코민포름을 조직하였다. 북대서양 조약 기구(NATO, 1949)와 바르샤바 조약 기구(1955)가 결성되었고, 베를린 봉쇄·6·25 전쟁·베트남 전쟁 등으로 대립이 격화하였다. 아시아·아프리카 신생국들은 반둥 회의(1955)에서 제3 세계를 형성하였다.',
      terms: [
        { label: '트루먼 독트린', def: '공산주의 확산을 막겠다는 미국의 선언(1947).' },
        { label: '마셜 계획', def: '미국이 서유럽 경제 부흥을 지원한 계획.' },
        { label: '제3 세계', def: '어느 진영에도 속하지 않은 아시아·아프리카 신생국.' }
      ],
      timeline: [
        { y: 1947, label: '◆ 트루먼 독트린' },
        { y: 1949, label: '북대서양 조약 기구 결성' },
        { y: 1955, label: '반둥 회의' },
        { y: 1962, label: '쿠바 미사일 위기' },
        { y: 1969, label: '닉슨 독트린' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-un', 'w-cuba', 'w-berlin', 'k-gov-rhee', 'e-vietwar-end']
  },
  'w-cuba': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '쿠바 미사일 위기 — 1949년 소련이 원자 폭탄 개발에 성공하면서 미국과 소련은 군비 경쟁에 돌입하였다. 미국이 소련의 수도 모스크바를 타격할 수 있는 이탈리아와 튀르키예에 핵미사일을 배치하자, 소련은 핵전력의 열세를 만회하려 쿠바에 중거리 핵미사일 기지 건설을 추진하였다(1962). 미국은 이를 직접적인 위협이라며 즉각적인 철수를 요구하고 쿠바를 봉쇄하여 핵전쟁 위기가 고조되었다. 결국 소련이 쿠바에서 미사일을 철수하고, 미국은 쿠바를 침공하지 않겠다고 약속하며 튀르키예에서 핵미사일을 철수함으로써 위기가 일단락되었다. 이 사건으로 핵무기 확산의 위험성이 널리 인식되었다.',
      terms: [
        { label: '해상 봉쇄', def: '미국이 소련의 미사일 반입을 막으려고 쿠바 주변 바다를 막은 조치.' },
        { label: '흐루쇼프·케네디', def: '쿠바 미사일 위기 당시 소련의 서기장과 미국의 대통령.' }
      ],
      timeline: [
        { y: 1949, label: '소련, 원자 폭탄 개발' },
        { y: 1962, label: '◆ 쿠바 미사일 위기' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-coldwar', 'w-berlin']
  },
  'w-berlin': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '베를린 장벽 붕괴 — 1980년대 소련의 고르바초프가 페레스트로이카(개혁)·글라스노스트(개방) 정책을 펼치고 동유럽에 대한 불간섭을 선언하자, 동유럽에서 민주화 운동이 확산되었다. 폴란드에서는 바웬사의 자유 노조 운동이 총선거 승리로 이어졌다. 동독에서는 서독의 풍요와 자유를 동경한 주민들이 민주화와 자유를 요구하며 서독으로 탈출하였고, 결국 동독이 주민의 자유로운 통행을 허락하면서 냉전의 상징이던 베를린 장벽이 무너졌다(1989년 11월). 같은 해 12월 미국과 소련의 정상은 몰타 회담을 열어 냉전 체제의 종식을 선언하였다.',
      terms: [
        { label: '베를린 장벽', def: '냉전의 상징적 구조물. 동독이 소련의 승인을 받아 베를린에 세운 장벽(1961).' },
        { label: '자유 노조', def: '폴란드에서 바웬사가 이끈 노동조합 운동. 민주화를 이끌었다.' },
        { label: '몰타 회담', def: '1989년 12월 미소 정상이 지중해 몰타에서 냉전 종식을 선언한 회담.' }
      ],
      timeline: [
        { y: 1961, label: '베를린 장벽 건설' },
        { y: 1985, label: '고르바초프, 공산당 서기장 취임' },
        { y: 1989, label: '◆ 베를린 장벽 붕괴, 몰타 회담' },
        { y: 1990, label: '독일 통일' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-coldwar', 'w-unify', 'w-ussr', 'e-tiananmen']
  },
  'w-unify': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '독일 통일 — 제2차 세계 대전 후 독일은 동독과 서독으로 분단되었다. 서독의 빌리 브란트 총리는 동방 정책을 내세워 동독과 교류하고 동서 기본 조약을 맺었다(1972). 1989년 베를린 장벽이 무너진 이듬해 동독에서 자유 총선거를 실시한 결과 서독과의 통일을 약속하는 정당이 승리하였다. 이후 통일 논의가 활발하게 진행되어, 동독의 5개 주가 서독에 가입하는 방식으로 독일이 통일되었다(1990). 통일 이후 독일 정부는 동독 지역의 대학과 연구 기관을 육성하는 등 동서의 격차를 줄이려 노력하였다.',
      terms: [
        { label: '동방 정책', def: '서독 빌리 브란트 총리가 동독·동유럽과 교류하며 관계를 개선한 정책.' },
        { label: '동서 기본 조약', def: '1972년 동독과 서독이 맺은 조약.' }
      ],
      timeline: [
        { y: 1972, label: '동서 기본 조약' },
        { y: 1989, label: '베를린 장벽 붕괴' },
        { y: 1990, label: '◆ 독일 통일' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-berlin', 'w-coldwar', 'w-ussr']
  },
  'w-ussr': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '소련 해체 — 경제 침체에 빠진 소련에서 고르바초프가 개혁(페레스트로이카)과 개방(글라스노스트) 정책을 추진하였다. 동유럽 공산 정권이 무너지고 소련 안의 공화국들이 독립을 선언하면서 1991년 소련이 해체되고 독립 국가 연합(CIS)이 출범하였다. 이로써 냉전 체제가 끝났다.',
      terms: [
        { label: '페레스트로이카', def: '고르바초프의 개혁 정책.' },
        { label: '글라스노스트', def: '고르바초프의 개방 정책.' },
        { label: '독립 국가 연합(CIS)', def: '소련 해체 후 옛 공화국들이 만든 연합체.' }
      ],
      timeline: [
        { y: 1985, label: '고르바초프 집권' },
        { y: 1989, label: '몰타 회담' },
        { y: 1991, label: '◆ 소련 해체' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-berlin', 'w-unify', 'w-russia', 'k-gov-roh']
  },
  'w-eu': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '유럽 연합 — 제2차 세계 대전 이후 유럽은 경제 협력을 통해 통합을 추진하였다. 유럽 경제 공동체(EEC)와 유럽 공동체(EC)를 거쳐 1993년 마스트리흐트 조약으로 12개국이 참여한 유럽 연합(EU)이 출범하였다. 단일 화폐 유로를 도입하였다. 2016년 영국은 유럽 연합 탈퇴를 결정하였다.',
      terms: [
        { label: '마스트리흐트 조약', def: '유럽 연합 창설을 정한 조약.' },
        { label: '유로', def: '유럽 연합의 단일 화폐.' }
      ],
      timeline: [
        { y: 1993, label: '◆ 유럽 연합 창설' },
        { y: 2016, label: '영국, 탈퇴 결정' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-unify', 'w-coldwar']
  },
  'w-911': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '9·11 테러 — 2001년 9월 11일 이슬람 테러 단체 알카에다의 공격으로 미국 뉴욕의 세계 무역 센터와 국방부 건물에 항공기가 잇따라 충돌하여 짧은 시간에 많은 사상자를 냈다. 미국은 알카에다를 비호하던 아프가니스탄의 탈레반 정권을 공격하여 무너뜨렸다. 그러나 탈레반은 남부 지역을 중심으로 세력을 회복하여 2021년 다시 정권을 차지하였다. 이 사건 이후 테러는 국제 평화를 위협하는 지구적 과제로 인식되었다.',
      terms: [
        { label: '알카에다', def: '9·11 테러를 일으킨 이슬람 테러 단체.' },
        { label: '탈레반', def: '아프가니스탄의 이슬람 세력. 알카에다를 비호하다 미국의 공격으로 무너졌으나 2021년 재집권하였다.' }
      ],
      timeline: [
        { y: 2001, label: '◆ 9·11 테러' },
        { y: 2001, label: '미국의 아프가니스탄 공격, 탈레반 정권 붕괴' },
        { y: 2021, label: '탈레반 재집권' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-syria', 'w-ukraine']
  },
  'w-ukraine': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '러시아의 우크라이나 공격 — 우크라이나는 소련에 속해 있었으나 강한 민족의식을 유지하였고, 1991년 소련에서 독립한 뒤 서유럽 세력과의 협력을 강화하였다. 2014년 우크라이나에서 반정부 시위로 친러 정권이 축출되자, 러시아는 우크라이나 내 러시아인 보호를 명목으로 크림반도를 강제 병합하였다. 우크라이나가 북대서양 조약 기구(NATO)에 가입하려 하자, 러시아는 우크라이나와 같은 민족임을 내세워 2022년 우크라이나를 침공하였다. 탈냉전 이후에도 민족·영토 문제로 인한 지역 분쟁이 이어지고 있다.',
      terms: [
        { label: '크림반도 병합', def: '2014년 러시아가 러시아인 보호를 명목으로 우크라이나의 크림반도를 강제로 병합한 일.' },
        { label: '북대서양 조약 기구(NATO)', def: '제2차 세계 대전 이후 소련을 견제하려 결성된 유럽·북미 국가들의 정치·군사 동맹.' },
        { label: '지역 분쟁', def: '탈냉전 이후 민족·인종·종교·영토 등을 원인으로 이어지는 분쟁.' }
      ],
      timeline: [
        { y: 1991, label: '우크라이나 독립' },
        { y: 2014, label: '러시아, 크림반도 병합' },
        { y: 2022, label: '◆ 러시아의 우크라이나 침공' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-ussr', 'w-911']
  },
  's-umayyad': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '우마이야 왕조 — 정통 칼리프 시대에 4대 칼리프 알리가 암살된 뒤, 시리아 총독 무아위야가 칼리프에 올라 661년 다마스쿠스에 도읍한 왕조. 우마이야 가문이 칼리프 자리를 세습하면서 이를 인정하는 수니파와 알리의 후손만을 인정하는 시아파가 대립하였다. 대외 정복으로 인더스강 유역에서 이베리아반도에 이르는 영토를 확보하였으나, 투르·푸아티에 전투(732)에서 프랑크 왕국에 패하였다. 관료와 군대의 요직을 시리아 지역의 아랍인이 차지하여 비아랍인의 불만이 커졌고, 750년 아바스 가문에 무너졌다.',
      terms: [
        { label: '칼리프', def: '무함마드의 후계자로서 이슬람 공동체를 이끄는 지도자.' },
        { label: '수니파·시아파', def: '우마이야 왕조의 칼리프를 인정한 다수파(수니파)와 알리의 후손만을 정통으로 본 소수파(시아파).' }
      ],
      timeline: [
        { y: 632, label: '정통 칼리프 시대' },
        { y: 661, label: '◆ 우마이야 왕조 성립' },
        { y: 732, label: '투르·푸아티에 전투' },
        { y: 750, label: '아바스 왕조 성립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-rashidun', 's-abbasid', 'w-charlemagne']
  },
  's-abbasid': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '아바스 왕조 — 아바스 가문이 비아랍인과 시아파의 도움으로 750년 우마이야 왕조를 무너뜨리고 세웠다. 바그다드를 새 수도로 삼고, 이슬람교도라면 민족 차별 없이 같은 권리를 누리게 하였다. 751년 탈라스 전투에서 당군을 물리쳤고, 이를 계기로 제지법이 이슬람 세계에 전해졌다. 바그다드는 국제 교역의 중심지로 번영하였다. 10세기에는 후우마이야·파티마 왕조도 칼리프를 칭하여 분열되었고, 셀주크 튀르크에 실권을 빼앗긴 뒤 1258년 몽골에 멸망하였다.',
      terms: [
        { label: '바그다드', def: '아바스 왕조의 수도. 국제 교역과 학문의 중심지.' },
        { label: '탈라스 전투', def: '아바스 왕조가 당군을 물리친 전투(751). 제지법 전파의 계기.' }
      ],
      timeline: [
        { y: 750, label: '◆ 아바스 왕조 성립' },
        { y: 751, label: '탈라스 전투' },
        { y: 909, label: '파티마 왕조 성립' },
        { y: 1055, label: '셀주크 튀르크, 바그다드 입성' },
        { y: 1258, label: '몽골에 멸망' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-umayyad', 's-fatimid', 's-seljuk', 'e-tang', 'e-mongol']
  },
  's-fatimid': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '파티마 왕조 — 정통 칼리프 시대 이후 칼리프 계승을 둘러싼 대립으로 이슬람 세력은 수니파와 시아파로 갈라졌다. 10세기 초 북아프리카에서 일어난 시아파의 파티마 왕조는 이집트를 정복하고 칼리프의 칭호를 사용하였다(909~1171). 이로써 이슬람 세계는 바그다드의 아바스 왕조, 이베리아반도 코르도바의 후우마이야 왕조, 파티마 왕조가 각기 칼리프를 내세우는 분열의 시기를 맞았다.',
      terms: [
        { label: '칼리프', def: '무함마드 사후 이슬람 공동체를 이끈 정치·종교 지도자.' },
        { label: '수니파·시아파', def: '칼리프 계승을 둘러싼 대립으로 갈라진 이슬람의 두 종파. 이슬람 세계의 약 90%가 수니파, 10%가 시아파이다.' },
        { label: '후우마이야 왕조', def: '멸망한 우마이야 왕조의 일파가 코르도바를 수도로 세운 왕조(756~1031).' }
      ],
      timeline: [
        { y: 750, label: '아바스 왕조 성립' },
        { y: 756, label: '후우마이야 왕조 성립' },
        { y: 909, label: '◆ 파티마 왕조 성립' },
        { y: 1171, label: '파티마 왕조 멸망' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-abbasid', 's-umayyad', 'w-crusade']
  },
  's-seljuk': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '셀주크 튀르크 — 중앙아시아의 튀르크인은 처음에 이슬람 세계에서 노예나 용병으로 활동하였으나, 점차 군대와 궁정의 고위직에 올랐다. 셀주크 튀르크는 1055년 바그다드에 입성하여 술탄 칭호를 얻고 정치적 실권을 장악하였다. 1071년 만지케르트 전투에서 비잔티움 제국을 물리치고 예루살렘을 점령하였는데, 이는 십자군 전쟁의 계기가 되었다.',
      terms: [
        { label: '술탄', def: '칼리프가 정치적 지배자에게 준 칭호.' },
        { label: '만지케르트 전투', def: '셀주크 튀르크가 비잔티움 제국을 물리친 전투(1071).' }
      ],
      timeline: [
        { y: 1055, label: '◆ 셀주크 튀르크, 바그다드 입성' },
        { y: 1071, label: '만지케르트 전투' },
        { y: 1096, label: '십자군 전쟁 시작' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-abbasid', 'w-crusade', 's-ottoman']
  },
  's-delhi': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '델리 술탄 왕조 — 10세기 말부터 서아시아의 이슬람 세력이 북인도로 진출하였다(가즈니 왕조, 구르 왕조). 13세기 초 아이바크가 델리를 정복하고 이슬람 왕조를 세운 이후 북인도에서 이어진 다섯 이슬람 왕조를 델리 술탄 왕조라 한다. 힌두교도가 지즈야(인두세)를 내면 신앙을 인정하는 관용 정책을 펼쳤다. 이 시기 인도에 이슬람 양식의 건물들이 세워지며 인도의 이슬람화가 진행되었다.',
      terms: [
        { label: '지즈야', def: '이슬람 국가가 비이슬람교도에게 거둔 인두세.' },
        { label: '아이바크', def: '델리를 정복하고 델리 술탄 왕조를 연 인물.' }
      ],
      timeline: [
        { yl: '13세기 초', label: '◆ 델리 술탄 왕조 시대 시작' },
        { y: 1526, label: '무굴 제국 성립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-gupta', 's-mughal', 's-abbasid']
  },
  's-ottoman': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '오스만 제국 — 셀주크 튀르크가 몽골의 침입으로 무너지자 튀르크 계통의 오스만족이 1299년 소아시아에 세운 나라. 앙카라 전투(1402)에서 티무르 왕조에 패하였으나, 메흐메트 2세가 1453년 콘스탄티노폴리스를 점령하여 비잔티움 제국을 멸망시켰다. 술레이만 1세 때 헝가리를 정복하고 빈을 포위하였으며(1529), 유럽의 연합 함대를 무찔러 지중해를 장악하였다. 1571년 레판토 해전에서는 에스파냐에 처음으로 패하였다. 비이슬람교도의 자치를 허용하는 밀레트 제도와 크리스트교도 소년을 관리·군인으로 키우는 데브시르메 제도를 운영하였다.',
      terms: [
        { label: '밀레트', def: '비이슬람교도 공동체에 자치를 허용한 제도.' },
        { label: '데브시르메', def: '크리스트교도 소년을 뽑아 관리·군인으로 양성한 제도.' },
        { label: '티마르제', def: '술탄이 군인에게 토지의 징세권을 준 제도.' }
      ],
      timeline: [
        { y: 1299, label: '◆ 오스만 제국 건국' },
        { y: 1402, label: '앙카라 전투' },
        { y: 1453, label: '콘스탄티노폴리스 점령' },
        { y: 1529, label: '빈 포위' },
        { y: 1571, label: '레판토 해전' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-seljuk', 'w-armada', 's-safavid', 's-tanzimat']
  },
  's-safavid': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '사파비 왕조 — 16세기 초 이란 지역에서 이스마일 1세가 타브리즈를 수도로 사파비 왕조를 세웠다. 이스마일 1세는 고대 페르시아 군주의 칭호인 ‘샤’를 사용하는 등 페르시아 제국의 계승을 내세웠고, 시아파 이슬람교를 국교로 정하였다. 전성기를 이룬 아바스 1세는 수도를 이스파한으로 옮기고, 대규모 상비군을 유지하며 머스킷 총과 서구식 대포로 무장한 부대를 양성하였다. 수니파인 오스만 제국과 대립하였으며, 17세기 말부터 왕실 내부의 갈등으로 혼란해지고 아프간족의 침입을 받아 18세기 전반에 멸망하였다.',
      terms: [
        { label: '샤', def: '고대 페르시아 군주의 칭호. 사파비 왕조가 사용하였다.' },
        { label: '시아파 국교', def: '사파비 왕조가 시아파 이슬람교를 나라의 종교로 정한 일.' },
        { label: '이스파한', def: '아바스 1세가 옮긴 사파비 왕조의 수도. 이맘 광장과 이맘 모스크가 있다.' }
      ],
      timeline: [
        { yl: '16세기 초', label: '◆ 이스마일 1세, 사파비 왕조 건국' },
        { yl: '17세기 전반', label: '아바스 1세, 이스파한 천도·전성기' },
        { yl: '18세기 전반', label: '사파비 왕조 멸망' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-ottoman', 's-mughal', 's-iran-const']
  },
  's-mughal': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '무굴 제국 — 티무르의 후손으로 알려진 바부르가 델리 술탄 왕조를 정복하고 1526년 세웠다. 아크바르 황제(1556 즉위)는 지즈야를 폐지하고 힌두교도에게 관직을 개방하는 등 관용 정책을 펼쳐 제국의 기틀을 다졌다. 힌두 문화와 이슬람 문화가 융합한 인도·이슬람 문화가 발달하였고, 샤자한은 타지마할을 세웠다. 아우랑제브 황제(1658 즉위) 때 영토가 가장 넓어졌다.',
      terms: [
        { label: '바부르', def: '무굴 제국을 세운 인물.' },
        { label: '아크바르', def: '관용 정책으로 무굴 제국의 기틀을 다진 황제.' },
        { label: '타지마할', def: '샤자한이 왕비를 추모하며 세운 무덤. 인도·이슬람 건축의 대표작.' }
      ],
      timeline: [
        { y: 1526, label: '◆ 무굴 제국 성립' },
        { y: 1556, label: '아크바르 황제 즉위' },
        { y: 1658, label: '아우랑제브 황제 즉위' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-delhi', 's-aurangzeb', 's-safavid', 's-plassey']
  },
  's-aurangzeb': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '아우랑제브 즉위 — 아우랑제브 황제는 정복 활동으로 무굴 제국의 영토를 가장 넓혔다. 그러나 지나친 정복 활동으로 재정이 악화되었고, 이슬람 제일주의를 내세워 지즈야를 부활시키고 힌두교 사원을 파괴하는 등 비이슬람교도를 탄압하였다. 이에 라지푸트족 등 각지에서 반란이 일어나 제국이 쇠퇴하였다.',
      terms: [
        { label: '이슬람 제일주의', def: '이슬람교를 앞세워 다른 종교를 차별한 정책.' }
      ],
      timeline: [
        { y: 1556, label: '아크바르 즉위' },
        { y: 1658, label: '◆ 아우랑제브 즉위' },
        { y: 1757, label: '플라시 전투' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-mughal', 's-plassey']
  },
  's-plassey': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '플라시 전투 — 무굴 제국이 약해지자 유럽 여러 나라는 인도에서 더 많은 이익을 얻으려 경쟁하였다. 영국 동인도 회사는 플라시 전투에서 프랑스·벵골 연합군에 승리한 뒤(1757) 벵골 지방의 통치권과 조세 징수권을 차지하여 인도 지배의 발판을 마련하였다. 동인도 회사는 벵골 사람들에게서 거둔 세금으로 소금·향신료·면화 등을 사서 본국으로 보냈고, 인도인에게 목화 재배를 강요하며 영국의 값싼 면직물을 대량으로 들여왔다. 이 과정에서 인도의 수공업은 점차 몰락하였으며, 영국은 19세기 중엽 인도 대부분을 차지하였다.',
      terms: [
        { label: '동인도 회사', def: '17~18세기 유럽 각국의 상인들이 아시아 무역 독점과 식민지 경영의 특허를 얻어 세운 회사.' },
        { label: '벵골', def: '플라시 전투 이후 영국 동인도 회사가 통치권과 조세 징수권을 차지한 인도 동부 지방.' }
      ],
      timeline: [
        { y: 1757, label: '◆ 플라시 전투' },
        { yl: '19세기 중엽', label: '영국, 인도 대부분 차지' },
        { y: 1857, label: '세포이의 항쟁' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-mughal', 's-sepoy', 'w-industrial']
  },
  's-tanzimat': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '탄지마트 — 19세기 들어 오스만 제국은 이집트의 자치와 그리스의 독립(1829)을 허용하는 등 유럽 영토 대부분을 잃었다. 위기의식을 느낀 오스만 제국은 1839년부터 ‘탄지마트(은혜 개혁)’라 불리는 서구식 근대 개혁을 추진하였다. 1876년 의회 설립을 규정한 헌법을 제정하였으나, 술탄 중심의 전제 정치로 헌법이 폐기되었다.',
      terms: [
        { label: '탄지마트', def: '‘은혜 개혁’이라는 뜻의 오스만 제국의 근대 개혁.' }
      ],
      timeline: [
        { y: 1829, label: '그리스 독립' },
        { y: 1839, label: '◆ 탄지마트 선포' },
        { y: 1876, label: '헌법 제정' },
        { y: 1908, label: '청년 튀르크당 혁명' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-ottoman', 's-young-turk', 'w-vienna']
  },
  's-sepoy': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '세포이의 항쟁 — 영국의 수탈과 인도의 종교적 전통을 무시하는 데 반발하여 동인도 회사의 인도인 용병(세포이)이 1857년 항쟁을 일으켰다(~1859). 항쟁은 대규모 민족 운동으로 발전하였으나 영국의 무력에 진압되었고, 무굴 제국 황제는 폐위되었다. 이후 영국은 인도를 직접 지배하였다.',
      terms: [
        { label: '세포이', def: '영국 동인도 회사에 고용된 인도인 용병.' }
      ],
      timeline: [
        { y: 1757, label: '플라시 전투' },
        { y: 1857, label: '◆ 세포이의 항쟁' },
        { y: 1877, label: '영국령 인도 제국 성립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-plassey', 's-indian-empire', 's-mughal']
  },
  's-indian-empire': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '인도 제국 — 영국은 인도를 수탈하고 힌두교도와 이슬람교도 간의 갈등을 조장하였으며, 인도의 종교적 전통을 무시하였다. 이에 영국 동인도 회사에 고용된 인도인 용병 세포이가 항쟁을 일으켰고(1857), 각계각층이 참여하면서 대규모 민족 운동으로 발전하였다. 항쟁 세력은 한때 델리를 점령하였으나 내부 분열과 영국의 반격으로 진압되었다. 영국은 인도 통치 개선법을 제정하여(1858) 동인도 회사의 통치권을 거두고 무굴 제국의 황제를 폐위하였으며, 1877년 영국 왕이 인도 황제를 겸하는 영국령 인도 제국을 세워 인도를 직접 지배하였다. 세포이의 항쟁은 인도인의 민족의식을 일깨워 이후 반영 운동에 영향을 주었다.',
      terms: [
        { label: '세포이의 항쟁', def: '1857년 영국 동인도 회사에 고용된 인도인 용병 세포이가 일으킨 항쟁. 대규모 민족 운동으로 발전하였다.' },
        { label: '인도 통치 개선법', def: '1858년 영국이 동인도 회사의 인도 통치권을 거둔 법.' },
        { label: '영국령 인도 제국', def: '1877년 영국 왕이 인도 황제를 겸하며 세운 식민지 국가.' }
      ],
      timeline: [
        { y: 1857, label: '세포이의 항쟁' },
        { y: 1858, label: '인도 통치 개선법, 무굴 제국 황제 폐위' },
        { y: 1877, label: '◆ 영국령 인도 제국 성립' },
        { y: 1885, label: '인도 국민 회의 결성' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-sepoy', 's-inc']
  },
  's-inc': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '인도 국민 회의 — 영국은 인도인의 불만을 누그러뜨리려 인도인의 정치 기구를 만들도록 지원하였고, 1885년 인도 국민 회의가 결성되었다. 초기에는 영국의 인도 지배를 인정하면서 인도인의 권익 신장을 추구하였다. 벵골 분할령(1905) 이후 반영 운동으로 돌아서 영국 상품 배척, 스와라지(자치), 스와데시(국산품 애용), 민족 교육의 4대 강령을 채택하였다. 이후 간디와 네루가 이끄는 독립운동의 중심이 되었다.',
      terms: [
        { label: '스와라지', def: '인도인의 자치.' },
        { label: '스와데시', def: '국산품 애용 운동.' }
      ],
      timeline: [
        { y: 1885, label: '◆ 인도 국민 회의 결성' },
        { y: 1905, label: '벵골 분할령' },
        { y: 1947, label: '인도·파키스탄 분리 독립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-bengal', 's-indian-empire', 's-partition']
  },
  's-bengal': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '벵골 분할령 — 1905년 인도 총독은 벵골주가 넓고 인구가 많아 행정이 어렵다는 이유로 벵골 분할령을 발표하였다. 실제로는 힌두교도와 이슬람교도를 갈라 민족 운동을 약화하려는 것이었다. 이에 인도 국민 회의는 반영 운동으로 돌아서 4대 강령을 채택하였다. 영국은 1911년 분할령을 취소하였다.',
      terms: [
        { label: '분할 통치', def: '식민지 주민을 종교·민족으로 갈라 다스리는 지배 방식.' }
      ],
      timeline: [
        { y: 1885, label: '인도 국민 회의 결성' },
        { y: 1905, label: '◆ 벵골 분할령' },
        { y: 1911, label: '분할령 취소' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-inc', 's-partition']
  },
  's-iran-const': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '이란 입헌 혁명 — 카자르 왕조 시기 이란에서는 열강의 이권 침탈이 심해졌다. 영국이 카자르 왕조로부터 담배 제조·판매 독점권을 차지하자 담배 불매 운동이 일어났다. 이러한 저항이 이어져 1906년 입헌 혁명이 일어나고 헌법이 제정되었다. 이후 튀르키예 공화국 출범에 자극을 받아 리자 샤가 팔레비 왕조를 세웠다(1925).',
      terms: [
        { label: '담배 불매 운동', def: '영국의 담배 독점에 맞선 이란의 저항 운동.' },
        { label: '카자르 왕조', def: '19세기 이란의 왕조.' }
      ],
      timeline: [
        { y: 1906, label: '◆ 이란 입헌 혁명' },
        { y: 1925, label: '팔레비 왕조 수립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-safavid', 's-young-turk', 's-turkey']
  },
  's-young-turk': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '청년 튀르크당 혁명 — 1876년 헌법이 폐기된 뒤 술탄의 전제 정치가 이어지자, 1908년 청년 튀르크당이 봉기하여 정권을 장악하고 개혁을 추진하였다. 그러나 극단적인 튀르크 민족주의를 내세워 제국 내 다른 민족의 독립운동을 탄압하여 반발이 심해졌고, 오스만 제국의 통치력은 더욱 약해졌다.',
      terms: [
        { label: '청년 튀르크당', def: '오스만 제국의 근대화를 내건 개혁 세력.' }
      ],
      timeline: [
        { y: 1876, label: '오스만 제국 헌법 제정' },
        { y: 1908, label: '◆ 청년 튀르크당 혁명' },
        { y: 1923, label: '튀르키예 공화국 수립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-tanzimat', 's-turkey', 'w-ww1']
  },
  's-turkey': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '튀르키예 공화국 — 제1차 세계 대전에서 패한 오스만 제국이 영토를 분할당할 위기에 놓이자, 무스타파 케말이 저항 운동을 이끌었다. 그는 술탄제를 폐지하고 1923년 튀르키예 공화국을 수립하였다. 이후 여성의 지위 향상, 문자 개혁 등 근대화를 추진하였다. 튀르키예 공화국의 출범에 자극을 받아 이란에서는 팔레비 왕조가 수립되었다(1925).',
      terms: [
        { label: '무스타파 케말', def: '튀르키예 공화국을 세우고 근대화를 이끈 지도자.' },
        { label: '술탄제 폐지', def: '오스만 제국의 군주제를 없앤 조치.' }
      ],
      timeline: [
        { y: 1918, label: '제1차 세계 대전 종결' },
        { y: 1923, label: '◆ 튀르키예 공화국 수립' },
        { y: 1925, label: '이란, 팔레비 왕조 수립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-young-turk', 's-iran-const', 'w-ww1']
  },
  's-partition': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '인도·파키스탄 분리 독립 — 제1차 세계 대전 중 영국은 전쟁 협력의 대가로 인도의 자치를 약속하였으나 지키지 않고 롤럿법을 제정하였다(1919). 간디는 비폭력·불복종 운동을 이끌었고, 네루는 인도 국민 회의를 이끌며 완전한 독립을 주장하였다. 인도는 1947년 영국으로부터 독립하였으나 힌두교도 중심의 인도 연방과 이슬람교도 중심의 파키스탄으로 분리되었다. 이후 카슈미르 분쟁이 이어졌고, 1971년 동파키스탄이 방글라데시로 독립하였다.',
      terms: [
        { label: '롤럿법', def: '영장 없이 인도인을 체포·투옥할 수 있게 한 영국의 법(1919).' },
        { label: '비폭력·불복종 운동', def: '간디가 이끈 평화적 저항 운동.' },
        { label: '카슈미르 분쟁', def: '인도와 파키스탄이 카슈미르 지역을 두고 벌인 분쟁.' }
      ],
      timeline: [
        { y: 1919, label: '롤럿법' },
        { y: 1947, label: '◆ 인도·파키스탄 분리 독립' },
        { y: 1971, label: '방글라데시 독립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-inc', 's-bengal', 'w-coldwar']
  },
  's-israel': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '이스라엘 건국 — 제1차 세계 대전 중 영국은 아랍인과 유대인에게 각각 팔레스타인 지역에 나라를 세우도록 돕겠다고 약속하였다(후세인·맥마흔 선언, 밸푸어 선언). 1948년 팔레스타인 지역에 이스라엘이 건국되자 그곳에 살던 아랍인은 삶의 터전을 잃었다. 이후 팔레스타인 해방 기구가 창설되었고 팔레스타인 분쟁이 이어졌다.',
      terms: [
        { label: '밸푸어 선언', def: '영국이 유대인 국가 건설을 지지한 선언.' },
        { label: '후세인·맥마흔 선언', def: '영국이 아랍인의 독립 국가 건설을 약속한 선언.' },
        { label: '팔레스타인 분쟁', def: '이스라엘과 팔레스타인 아랍인 사이의 분쟁.' }
      ],
      timeline: [
        { y: 1948, label: '◆ 이스라엘 건국' },
        { y: 1993, label: '오슬로 협정' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-oslo', 's-syria', 'w-ww1']
  },
  's-oslo': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '오슬로 협정 — 제1차 세계 대전 이후 팔레스타인 지역에 많은 유대인이 이주하면서 아랍계 이슬람교도와 유대인 사이의 영토 분쟁이 종교·인종 갈등으로 확대되었다. 이스라엘이 건국되면서(1948) 삶의 터전을 잃은 팔레스타인 아랍인들은 팔레스타인 해방 기구(PLO)를 창설하여 무장 투쟁을 벌이고 반이스라엘 민중 봉기(인티파다)를 일으켰다. 1993년 이스라엘과 PLO는 오슬로 협정을 맺어 팔레스타인의 자치를 인정하였고, 이듬해 팔레스타인 자치 정부가 수립되었다. 그러나 이스라엘이 분리 장벽을 설치하는 등 대립은 그치지 않았고, 2023년에는 하마스와 이스라엘 사이에 전쟁이 일어났다.',
      terms: [
        { label: '팔레스타인 해방 기구(PLO)', def: '팔레스타인 독립 국가 건설을 목표로 1964년 결성된 기구.' },
        { label: '인티파다', def: '팔레스타인 주민들의 반이스라엘 민중 봉기.' },
        { label: '팔레스타인 자치 정부', def: '오슬로 협정에 따라 1994년 수립된 팔레스타인의 자치 기구.' }
      ],
      timeline: [
        { y: 1948, label: '이스라엘 건국' },
        { y: 1964, label: 'PLO 결성' },
        { y: 1993, label: '◆ 오슬로 협정' },
        { y: 1994, label: '팔레스타인 자치 정부 수립' },
        { y: 2023, label: '이스라엘-하마스 전쟁' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['s-israel', 'w-coldwar']
  },
  's-syria': {
    notes: { sections: [] },   // 정리 — 내용은 비워 둔다
    fileRef: '미래엔·비상교육 세계사',
    overview: {
      summary: '시리아 내전 — 2010년 말 튀니지에서 시작된 권위주의 정권에 저항하는 민주화 운동(아랍의 봄)이 서아시아와 북아프리카의 여러 나라로 확산되었다. 시리아에서는 독재 정권의 퇴출을 요구하는 반정부 시위로 내전이 시작되었으나(2011), 이슬람 종파 간의 갈등과 테러 행위가 일어나면서 세계적인 갈등으로 확대되었다. 내전을 피해 많은 난민이 발생하였고, 시리아 난민 수용 문제는 유럽 사회의 쟁점으로 떠올랐다. 유럽으로 가려다 목숨을 잃은 난민 아이 아일란 쿠르디의 죽음은 난민 문제의 심각성을 알리는 계기가 되었다.',
      terms: [
        { label: '아랍의 봄', def: '2010년 말 튀니지에서 시작되어 서아시아·북아프리카로 확산된 민주화 운동.' },
        { label: '난민', def: '인종·종교·정치적 이유의 박해나 분쟁을 피해 외국이나 다른 지방으로 탈출하는 사람.' }
      ],
      timeline: [
        { y: 2010, label: '아랍의 봄 시작(튀니지)' },
        { y: 2011, label: '◆ 시리아 내전 발발' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['w-911', 's-israel']
  },

  // ============================================================
  // 한국사 재구성 (2026-10-06) — 국가·대통령 집권기 노드 기록, 메인 전환 노드 기록
  // ============================================================
  'k-buyeo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '부여 — 쑹화강 유역의 부여는 일찍부터 중국과 교류하며 빠르게 성장하였다. 부여에는 왕이 있었으나, 가축의 이름을 딴 마가·우가·저가·구가 등 제가가 사출도라는 지역을 독자적으로 다스렸다. 제천 행사로 영고를 열었다. 부여에서 온 이주민은 압록강 유역의 토착 세력과 함께 졸본 지역에 고구려를 세웠다. 이후 부여 왕실은 고구려에 투항하였다(494). 부여에서는 밭농사와 목축이 이루어졌고, 순장의 풍속이 있었다. 『삼국지』에는 제가들이 사출도를 주관하는데 큰 곳은 수천 가, 작은 곳은 수백 가라고 기록되어 있다.',
      terms: [
        { label: '제가', def: '마가·우가·저가·구가 등 가축의 이름을 딴 부여의 지배층.' },
        { label: '사출도', def: '부여의 제가가 독자적으로 다스린 지역.' },
        { label: '영고', def: '부여의 제천 행사.' },
        { label: '마가·우가·저가·구가', def: '가축의 이름을 딴 부여의 제가. 사출도를 독자적으로 다스렸다.' },
        { label: '순장', def: '부여의 사회 풍속.' }
      ],
      timeline: [
        { yl: '2세기 BCE경', label: '◆ 부여 성립 — 쑹화강 유역' },
        { y: -37, label: '부여에서 온 이주민 등이 졸본에서 고구려 건국' },
        { y: 494, label: '부여 멸망' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gojoseon', 'k-goguryeo', 'k-okjeo']
  },
  'k-okjeo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '옥저 — 함경도 동해안 일대에 자리 잡은 나라. 왕이 없었고 읍군·삼로 등 군장이 나라를 다스렸다. 소금과 해산물이 풍부하였으며, 민며느리제와 가족 공동 묘의 풍속이 있었다. 고구려의 간섭으로 정치적 성장이 늦었고, 1세기 후반 고구려 태조왕에게 복속되었다. 1세기 후반 고구려 태조왕은 옥저를 복속시키고 한 군현을 공격하면서 왕권을 강화하였다.',
      terms: [
        { label: '읍군·삼로', def: '옥저와 동예를 다스린 군장.' },
        { label: '민며느리제', def: '옥저의 혼인 풍속.' },
        { label: '가족 공동 묘', def: '옥저의 장례 풍속.' },
        { label: '소금·해산물', def: '옥저에서 풍부하게 나던 산물.' }
      ],
      timeline: [
        { yl: '2세기 BCE경', label: '◆ 옥저 성립' },
        { yl: '1세기 후반', label: '고구려 태조왕, 옥저 복속' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-dongye', 'k-goguryeo', 'k-buyeo']
  },
  'k-dongye': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '동예 — 강원도 북부 동해안 일대의 나라. 왕이 없었고 읍군·삼로 등 군장이 나라를 다스렸다. 단궁·과하마·반어피가 특산물이었으며, 제천 행사로 무천을 열었다. 다른 부족의 영역을 침범하면 갚게 하는 책화와 족외혼의 풍속이 있었다. 고구려의 간섭으로 정치적 성장이 늦었고, 이후 고구려에 복속되었다.',
      terms: [
        { label: '단궁·과하마·반어피', def: '동예의 특산물(활·작은 말·바다표범 가죽).' },
        { label: '무천', def: '동예의 제천 행사.' },
        { label: '책화', def: '다른 부족의 영역을 침범하면 갚게 한 동예의 풍속.' },
        { label: '족외혼', def: '같은 집단 안에서 혼인하지 않는 동예의 풍속.' }
      ],
      timeline: [
        { yl: '2세기 BCE경', label: '◆ 동예 성립' },
        { yl: '2세기 후반', label: '고구려에 복속' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-okjeo', 'k-goguryeo']
  },
  'k-samhan': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '삼한 — 한반도 남부에서 성장한 마한·진한·변한. 마한은 54개, 진한과 변한은 각각 12개의 소국으로 이루어졌으며, 마한의 목지국 지배자가 삼한을 이끌었다. 신지·읍차 등의 정치적 지배자가 있었고, 제사장인 천군이 신성 구역인 소도를 다스렸다. 5월과 10월에 계절제를 열었다. 변한에서는 철이 많이 생산되었다. 마한은 백제, 진한은 신라, 변한은 가야로 발전하였다. 삼한은 여러 소국의 연합으로, 각 소국은 신지, 읍차 등의 지배자가 다스렸다. 『삼국지』에는 국읍에 각기 한 사람을 세워 천신에 제사 지내는 것을 주관하게 하고 천군이라 하였으며, 여러 나라가 각기 별읍을 두고 소도라 하였다고 기록되어 있다. 벼농사가 이루어졌다. 목지국의 왕이 진왕으로 삼한을 대표하였으며, 백제는 마한을 이끌던 목지국을 병합하여 한강 유역 대부분을 차지하였다. 경주 지역에서는 진한의 소국 중 하나인 사로국이 신라로 발전하였고, 낙동강 하류의 변한 지역에서는 여러 소국이 가야 연맹을 이루었다.',
      terms: [
        { label: '천군', def: '삼한의 제사장.' },
        { label: '소도', def: '천군이 다스린 신성 구역.' },
        { label: '목지국', def: '마한의 소국. 그 지배자가 삼한을 이끌었다.' },
        { label: '신지·읍차', def: '삼한의 각 소국을 다스린 지배자.' },
        { label: '계절제', def: '삼한의 제천 행사. 5월과 10월에 열었다.' },
        { label: '사로국', def: '진한의 소국 중 하나. 신라로 발전하였다.' }
      ],
      timeline: [
        { yl: '2세기 BCE 말', label: '◆ 삼한 성장 — 마한·진한·변한' },
        { y: -57, label: '진한의 사로국에서 신라 건국' },
        { y: -18, label: '마한 지역에서 백제 건국' },
        { y: 42, label: '변한 지역에서 가야 연맹 성립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-baekje', 'k-silla', 'k-gaya']
  },
  'k-goguryeo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '고구려 — 주몽(동명성왕)이 졸본에서 건국하였다. 국내성으로 도읍을 옮긴 뒤 정복 활동을 펼쳤고, 태조왕 때 옥저를 정복하였다. 소수림왕은 불교를 수용(372)하고 태학을 세웠으며, 광개토 대왕은 영토를 크게 넓혔다. 장수왕은 평양으로 천도(427)하고 남진 정책을 펼쳐 한강 유역을 차지하였다. 수와 당의 침입을 살수 대첩(612)과 안시성 전투(645)로 물리쳤으나, 668년 나당 연합군에 평양성이 함락되어 멸망하였다. 고구려는 부여에서 온 이주민과 압록강 유역의 토착 세력이 졸본 지역에 세웠으며, 5부가 연맹하여 발전하였다. 1세기 후반 태조왕은 옥저를 복속시키고 한 군현을 공격하면서 왕권을 강화하였다. 4세기에는 중국의 전연, 백제 근초고왕의 공격을 잇따라 받으며 위기를 겪기도 하였다. 광개토 대왕은 백제를 공격하여 한강 이북 지역을 점령하였으며, 만주 지역 대부분을 차지하고 신라에 침입한 왜를 물리쳤다. 고구려는 ‘영락’ 등 독자적인 연호와 ‘태왕’ 칭호를 사용하였다.',
      terms: [
        { label: '태학', def: '소수림왕이 세운 교육 기관.' },
        { label: '살수 대첩', def: '을지문덕이 수의 군대를 물리친 전투(612).' },
        { label: '안시성 전투', def: '당 태종의 침입을 막아 낸 전투(645).' },
        { label: '5부 연맹체', def: '고구려 초기의 정치 체제. 5부가 연맹하여 발전하였다.' },
        { label: '동맹', def: '고구려의 제천 행사.' },
        { label: '서옥제', def: '고구려의 혼인 풍속.' },
        { label: '광개토 대왕릉비', def: '광개토 대왕의 아들인 장수왕이 세운 비석(중국 지린).' }
      ],
      timeline: [
        { y: -37, label: '◆ 고구려 건국' },
        { y: 194, label: '진대법 실시' },
        { y: 372, label: '불교 수용·태학 설립' },
        { y: 373, label: '율령 반포' },
        { y: 400, label: '신라에 군대를 보내 왜를 물리침' },
        { y: 427, label: '평양 천도' },
        { y: 612, label: '살수 대첩' },
        { y: 645, label: '안시성 전투' },
        { y: 668, label: '고구려 멸망' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-buyeo', 'k-baekje', 'k-silla', 'k-balhae', 'e-sui', 'e-tang']
  },
  'k-baekje': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '백제 — 고구려에서 내려온 유이민(온조)과 한강 유역의 토착 세력이 결합하여 건국하였다. 고이왕 때 국가 체제를 정비하고, 근초고왕 때 마한을 통합하는 등 전성기를 맞았다. 고구려에 한성을 빼앗긴 뒤 웅진(공주)으로 수도를 옮겼고, 성왕은 사비(538)로 천도하여 중흥을 꾀하였다. 660년 나당 연합군에 사비성이 함락되어 멸망하였다. 마한의 한 소국이었던 백제는 한강 유역을 발판으로 성장하였다. 3세기 고이왕 때 관등제를 정비하고 등급별로 관복의 색깔을 정하였으며, 마한을 이끌던 목지국을 병합하여 한강 유역 대부분을 차지하였다. 근초고왕은 고구려의 평양성을 공격하여 황해도 일대를 차지하였다. 칠지도는 당시 백제와 왜의 활발한 교류를 보여 준다. 장수왕 때 한성이 함락되고 개로왕이 사로잡혀 죽은 뒤 웅진으로 수도를 옮겼으며, 무령왕을 거치면서 국력을 회복하였다. 성왕은 신라와 연합하여 한강 하류 지역을 일시적으로 되찾았으나 신라에 다시 빼앗겼다.',
      terms: [
        { label: '웅진·사비', def: '고구려의 남진 이후 백제가 차례로 옮긴 도읍(공주·부여).' },
        { label: '관등제', def: '고이왕 때 정비한 관리의 등급 제도. 등급에 따라 자주색, 붉은색, 푸른색 관복을 입게 하였다.' },
        { label: '칠지도', def: '백제 왕세자가 왜왕에게 주려고 만들었다는 명문이 있는 칼. 백제와 왜의 교류를 보여 준다.' },
        { label: '나제 동맹', def: '고구려에 맞서 백제와 신라가 맺은 동맹.' },
        { label: '관산성 전투', def: '신라군의 기습으로 성왕이 전사한 전투. 백제는 4인의 좌평과 29,600명의 병사가 전사하였다고 『삼국사기』에 기록되었다.' }
      ],
      timeline: [
        { y: -18, label: '◆ 백제 건국' },
        { y: 260, label: '관등제 실시' },
        { y: 384, label: '불교 수용' },
        { y: 538, label: '사비 천도' },
        { y: 554, label: '관산성 전투 — 성왕 전사' },
        { y: 660, label: '백제 멸망' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goguryeo', 'k-silla', 'k-samhan', 'e-asuka']
  },
  'k-silla': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '신라 — 박혁거세가 사로국(신라)을 건국하였다. 내물왕 때 마립간 칭호를 사용하였고, 지증왕은 국호를 신라로 정하고 우산국을 복속하였다. 법흥왕은 율령을 반포하고 불교를 공인(527)하였으며, 진흥왕은 화랑도를 국가 조직으로 개편하고 한강 유역을 차지하였으며 대가야를 정복하였다(562). 고구려·백제와 함께 삼국 시대를 이루었고, 당과 연합하여 백제(660)와 고구려(668)를 멸망시킨 뒤 676년 삼국을 통일하였다. 경주 지역에서는 진한의 소국 중 하나인 사로국이 신라로 발전하였다. 초기 신라에서는 박·석·김씨가 돌아가며 왕위에 올랐다. 4세기 말 내물왕은 김씨의 왕위 세습을 확립하였으며, 왜와 가야의 침입을 물리치기 위해 고구려 광개토 대왕의 도움을 받으면서 고구려의 간섭을 받게 되었다. 지증왕은 ‘국왕’ 칭호를 사용하였고, 법흥왕은 독자적 연호를 사용하여 자주성을 표현하였다. 진흥왕은 백제와 연합하여 한강 상류 지역을 점령한 뒤 백제를 공격해 한강 하류 지역도 차지하였으며, 한때 함흥평야까지 진출하였다.',
      terms: [
        { label: '마립간', def: '내물왕 때부터 쓴 신라 왕의 칭호.' },
        { label: '화랑도', def: '진흥왕이 국가 조직으로 개편한 청소년 단체.' },
        { label: '사로국', def: '진한의 소국 중 하나. 신라로 발전하였다.' },
        { label: '신라의 왕호', def: '거서간 → 차차웅 → 이사금 → 마립간 → 국왕으로 바뀌었다.' },
        { label: '진흥왕 순수비', def: '진흥왕 때 넓힌 영토에 세운 비석. 북한산·황초령·마운령 등에 있다.' }
      ],
      timeline: [
        { y: -57, label: '◆ 신라 건국' },
        { yl: '1세기 BCE', label: '삼국 시대 성립' },
        { y: 527, label: '불교 공인' },
        { y: 562, label: '대가야 정복' },
        { y: 676, label: '삼국 통일' },
        { y: 512, label: '이사부, 우산국 복속' },
        { y: 532, label: '금관가야 병합' },
        { y: 554, label: '관산성 전투 — 백제 성왕 전사' },
        { y: 660, label: '나당 연합군, 백제 멸망' },
        { y: 668, label: '나당 연합군, 고구려 멸망' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goguryeo', 'k-baekje', 'k-gaya', 'k-unify']
  },
  'k-gaya': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '가야 — 낙동강 하류 김해 일대에서 여러 소국이 가야 연맹을 이루었다. 초기에는 김수로왕의 금관가야가 연맹을 이끌었으나, 이후 고령의 대가야가 후기 가야 연맹을 주도하였다. 철이 풍부하였다. 중앙 집권 국가로 발전하지 못하고 금관가야(532)에 이어 대가야(562)가 신라에 정복되었다. 가야는 낙동강 하류의 변한 지역에서 여러 소국이 연맹을 이루어 성장하였다. 초기에는 김해의 금관가야가 질 좋은 철을 생산·수출하면서 주변 지역과 활발히 교류하였고, 백제·신라와 경쟁하면서 성장하였다. 그러나 광개토 대왕의 공격으로 금관가야의 세력이 약해지면서, 5세기 후반에는 고령의 대가야가 가야를 주도하는 세력으로 성장하였다. 신라 진흥왕 때 활약한 김무력, 삼국 통일에 기여한 김유신이 금관가야 왕족 출신이다.',
      terms: [
        { label: '금관가야', def: '김해의 가야. 전기 가야 연맹을 이끌었다.' },
        { label: '대가야', def: '고령의 가야. 후기 가야 연맹을 이끌었다.' },
        { label: '전기 가야 연맹', def: '김해의 금관가야가 이끈 가야 연맹.' },
        { label: '후기 가야 연맹', def: '5세기 후반부터 고령의 대가야가 주도한 가야 연맹.' }
      ],
      timeline: [
        { y: 42, label: '◆ 가야 연맹 성립' },
        { y: 400, label: '광개토 대왕의 공격으로 금관가야 약화' },
        { yl: '5세기 후반', label: '대가야가 가야를 주도' },
        { y: 532, label: '금관가야, 신라에 병합' },
        { y: 562, label: '대가야, 신라 진흥왕에게 정복' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-silla', 'k-baekje', 'k-samhan']
  },
  'k-era-samguk': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '삼국 시대 — 삼국 시대 초기에는 여러 부가 연합하여 국가를 이루었고, 고구려의 제가 회의 같은 회의 제도가 발달하였다. 삼국은 주변 지역을 정복하며 성장하는 과정에서 왕권이 강해졌고, 관등제와 신분제를 정비하였다. 또한 율령을 반포하여 왕을 중심으로 하는 지배 체제를 확립하고, 불교를 받아들여 왕권을 뒷받침하고 국가를 정신적으로 통합하려 하였다. 4세기에는 백제(근초고왕), 5세기에는 고구려(광개토 대왕·장수왕), 6세기에는 신라(진흥왕)가 차례로 한강 유역을 차지하며 성장하였다. 고구려는 수·당의 침략을 물리쳤으나, 나당 연합군에 백제(660)와 고구려(668)가 멸망하였고, 신라가 나당 전쟁에서 당군을 몰아내고 삼국을 통일하였다(676). 국가의 중요한 일은 각 부의 지배자들과 합의하여 결정하였는데, 고구려의 제가 회의, 신라의 제간 회의(이후 화백) 같은 회의 제도가 발달하였다. 왕권이 강해지면서 각 부의 독자성은 약해졌고, 복속된 지역의 지배자는 왕 아래의 귀족이 되었다. 한편 삼국 시대로 지칭되는 당시 한반도와 만주에는 부여, 가야, 탐라 등 여러 나라들이 있었으며, 고구려·백제·신라의 삼국만이 존재한 시기는 가야가 멸망하는 6세기 이후부터이다.',
      terms: [
        { label: '제가 회의', def: '고구려의 회의 제도. 각 부의 지배자인 ‘가’가 모여 나라의 중요한 일을 논의하여 결정하였다.' },
        { label: '율령', def: '범죄를 처벌하는 법(율)과 행정에 관한 법(령). 왕의 이름으로 반포되면서 귀족은 왕의 지배를 받는 존재가 되었다.' },
        { label: '관등제', def: '관리의 등급을 나누어 서열화한 제도.' },
        { label: '한강 유역', def: '원래 백제의 수도가 있던 곳. 삼국이 치열하게 다투었으며 고구려, 신라가 차례로 차지하였다.' },
        { label: '화백', def: '신라의 귀족 회의. 초기의 제간 회의가 이어진 것이다.' }
      ],
      timeline: [
        { y: -57, label: '신라 건국' },
        { y: -37, label: '고구려 건국' },
        { y: -18, label: '백제 건국' },
        { y: 427, label: '고구려, 평양 천도' },
        { y: 554, label: '백제 성왕 전사' },
        { y: 562, label: '대가야 정복' },
        { y: 612, label: '살수 대첩' },
        { y: 645, label: '안시성 전투' },
        { y: 648, label: '나당 동맹' },
        { y: 660, label: '백제 멸망' },
        { y: 668, label: '고구려 멸망' },
        { y: 676, label: '◆ 신라, 삼국 통일' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-silla', 'k-goguryeo', 'k-baekje', 'k-gaya', 'k-unify']
  },
  'k-taejo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '태조왕 — 고구려는 국내성으로 수도를 옮기면서 주변 지역으로 세력을 넓혔다. 1세기 후반 태조왕은 옥저를 복속시키고 한 군현을 공격하면서 왕권을 강화하였다. 압록강 중류 졸본 지역에 세워진 고구려는 부여에서 온 주몽 세력이 건국하였으며, 5부가 연맹하여 발전하였다.',
      terms: [
        { label: '국내성', def: '고구려가 졸본에서 옮긴 수도.' },
        { label: '옥저', def: '함경도 동해안 일대의 나라. 고구려의 간섭을 받다가 복속되었다.' },
        { label: '졸본', def: '압록강 중류에 있던 고구려의 첫 도읍.' },
        { label: '한 군현', def: '한이 고조선을 멸망시킨 뒤 옛 고조선과 주변 지역에 설치한 낙랑군 등 군현.' }
      ],
      timeline: [
        { y: -37, label: '주몽 세력, 졸본에서 고구려 건국' },
        { y: 53, label: '◆ 태조왕 즉위' },
        { y: 146, label: '태조왕 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goguryeo', 'k-okjeo', 'k-era-samguk']
  },
  'k-gogukcheon': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '고국천왕 — 194년 고구려는 가난한 백성을 돕기 위해 진대법을 실시하였다. 매년 봄 3월부터 가을 7월까지 관청의 곡식을 집안 식구의 많고 적음에 따라 빌려주고 겨울 10월에 갚게 하였다. 삼국은 진대법 등의 정책으로 백성의 생활을 안정시키고 재정을 튼튼히 하려 하였다. 고국천왕 때 고구려의 5부가 방위를 나타내는 이름의 5부로 바뀌었을 것으로 추정하기도 한다.',
      terms: [
        { label: '진대법', def: '고구려가 가난한 백성을 도우려고 실시한 제도. 봄에 곡식을 빌려주고 수확한 뒤 갚게 하였다.' },
        { label: '5부', def: '고구려를 이룬 다섯 부. 고국천왕 때 방위명 5부가 사용되었을 것으로 추정하기도 한다.' }
      ],
      timeline: [
        { y: 179, label: '고국천왕 즉위' },
        { y: 194, label: '◆ 진대법 실시' },
        { y: 197, label: '고국천왕 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goguryeo', 'k-era-samguk']
  },
  'k-micheon': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '미천왕 — 4세기 초 고구려의 미천왕은 낙랑군을 공격하여 한반도에서 몰아냈다(313). 미천왕이 죽은 뒤 고국원왕 때 전연의 침입으로 국내성이 함락되어 미천왕의 시신과 왕후 등이 포로로 잡혀가기도 하였다.',
      terms: [
        { label: '낙랑군', def: '고조선을 멸망시킨 한이 옛 고조선 지역에 설치한 군현.' },
        { label: '국내성', def: '고구려의 수도. 고국원왕 때 전연의 침입으로 함락되었다.' }
      ],
      timeline: [
        { y: 300, label: '미천왕 즉위' },
        { y: 313, label: '◆ 낙랑군 축출' },
        { y: 331, label: '미천왕 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goguryeo', 'k-gojoseon-fall', 'k-gogugwon']
  },
  'k-gogugwon': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '고국원왕 — 4세기 고구려는 중국의 전연, 백제 근초고왕의 공격을 잇따라 받으며 위기를 겪었다. 고국원왕 때 전연의 침입으로 국내성이 함락되어 미천왕의 시신과 왕후 등이 포로로 잡혀가기도 하였으며, 고국원왕은 백제 근초고왕이 평양성을 공격하였을 때 전사하였다. 이러한 위기 속에서 고구려는 4세기 후반 소수림왕 때 불교를 받아들이고 태학을 세웠으며, 율령을 반포하여 중앙 집권 체제를 정비하였다.',
      terms: [
        { label: '전연', def: '4세기 고구려를 침입한 중국의 나라.' },
        { label: '국내성', def: '고구려의 수도. 고국원왕 때 전연의 침입으로 함락되었다.' },
        { label: '평양성', def: '백제 근초고왕이 공격하여 고국원왕이 전사한 고구려의 성.' }
      ],
      timeline: [
        { y: 331, label: '고국원왕 즉위' },
        { y: 371, label: '◆ 백제의 평양성 공격, 고국원왕 전사' },
        { y: 372, label: '소수림왕, 불교 수용·태학 설립' },
        { y: 373, label: '소수림왕, 율령 반포' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goguryeo', 'k-geunchogo', 'k-sosurim']
  },
  'k-sosurim': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '소수림왕 — 위기 속에서 고구려는 4세기 후반 소수림왕 때 중앙 집권 체제를 정비하였다. 소수림왕은 불교를 받아들였으며, 태학을 세워 인재를 키웠다. 그리고 율령을 반포하여 국가 체제를 정비하였다. 이를 바탕으로 광개토 대왕 때 영토를 크게 넓혔다. 삼국은 율령을 반포하여 왕을 중심으로 하는 지배 체제를 확립하고, 불교를 받아들여 왕권을 뒷받침하고 국가를 정신적으로 통합하려고 하였다. 율령에는 중국 왕조들이 정비한 황제 중심의 중앙 집권적 통치 체제가 담겨 있어, 율령을 받아들인 것은 왕권의 강화로 해석된다. 고구려는 소수림왕, 신라는 법흥왕 때 율령을 반포하였다.',
      terms: [
        { label: '태학', def: '소수림왕이 세운 교육 기관. 인재를 키웠다.' },
        { label: '율령', def: '범죄를 처벌하는 법(율)과 행정에 관한 법(령).' }
      ],
      timeline: [
        { y: 371, label: '◆ 소수림왕 즉위' },
        { y: 372, label: '불교 수용 · 태학 설립' },
        { y: 373, label: '율령 반포' },
        { y: 384, label: '소수림왕 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goguryeo', 'k-gogugwon', 'k-gwanggaeto']
  },
  'k-gwanggaeto': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '광개토 대왕 — 고구려는 소수림왕의 체제 정비를 바탕으로 4세기 말 광개토 대왕 때 영토를 크게 넓혔다. 광개토 대왕은 백제를 공격하여 한강 이북 지역을 점령하였으며, 북쪽으로는 만주 지역 대부분을 차지하였다. 또한 군대를 보내 신라에 침입한 왜를 물리쳤다(400). 이때 고구려의 공격으로 금관가야의 세력이 약해졌다. 광개토 대왕은 ‘영락’이라는 독자적인 연호를 사용하였다. 경주 호우총에서 발견된 청동 ‘광개토 대왕’명 호우는 광개토 대왕이 죽은 뒤 만들어진 그릇으로 추정되며, 당시 고구려와 신라의 관계를 보여 준다. 금관가야가 약해진 뒤 5세기 후반에는 고령의 대가야가 가야를 주도하는 세력으로 성장하였다.',
      terms: [
        { label: '광개토 대왕릉비', def: '광개토 대왕의 업적을 새긴 비석(중국 지린).' },
        { label: '‘광개토 대왕’명 호우', def: '경주 호우총에서 출토된 청동 그릇. 광개토 대왕이 죽은 뒤 만들어진 것으로 추정되며, 고구려와 신라의 관계를 보여 준다.' },
        { label: '영락', def: '광개토 대왕이 사용한 독자적인 연호. 고구려는 ‘태왕’ 칭호도 사용하였다.' }
      ],
      timeline: [
        { y: 391, label: '◆ 광개토 대왕 즉위' },
        { y: 400, label: '신라 구원, 왜 격퇴' },
        { y: 412, label: '광개토 대왕 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goguryeo', 'k-sosurim', 'k-jangsu', 'k-gaya-early']
  },
  'k-jangsu': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '장수왕 — 광개토 대왕의 뒤를 이은 장수왕은 평양으로 수도를 옮기고(427) 남진 정책을 펼쳤다. 백제와 신라는 고구려에 맞서 나제 동맹을 맺었지만, 장수왕은 백제의 수도인 한성을 함락하고 한강 유역 전체를 차지하였다. 이때 백제의 개로왕은 사로잡혀 죽었다. 이 시기 고구려는 동북아시아의 강대국으로 성장하였다. 고구려는 5세기에 강해진 국력을 바탕으로 중국, 북방 유목 민족과 교류하면서 대외 관계를 안정시켰고, 독자적 천하관을 내세웠다. 충주 고구려비는 고구려의 세력이 남쪽으로 뻗어 나간 모습을 보여 준다.',
      terms: [
        { label: '남진 정책', def: '남쪽으로 진출하려는 정책.' },
        { label: '나제 동맹', def: '고구려의 남진에 맞서 백제와 신라가 맺은 동맹.' },
        { label: '충주 고구려비', def: '고구려의 남쪽 진출을 보여 주는 비석(충북).' },
        { label: '평양 천도', def: '장수왕이 수도를 국내성에서 평양으로 옮긴 일(427).' }
      ],
      timeline: [
        { y: 412, label: '장수왕 즉위' },
        { y: 427, label: '◆ 평양 천도' },
        { y: 475, label: '백제 한성 함락' },
        { y: 491, label: '장수왕 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goguryeo', 'k-gwanggaeto', 'k-gaero']
  },
  'k-goguryeo-sui': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '고구려-수 전쟁 — 6세기 후반 분열되었던 중국이 통일되면서 동아시아 정세에 큰 변화가 나타났다. 중국을 통일한 수는 고구려를 압박하여 복속시키려 하였고, 고구려가 반발하자 여러 차례 고구려를 공격하였다. 고구려는 수의 공격을 모두 물리쳤으며, 특히 612년에는 을지문덕이 수의 대군을 살수(청천강) 일대에서 크게 물리쳤다(살수 대첩). 고구려 영양왕이 직접 친위군과 말갈 기병을 이끌고 요서를 공격하기도 하였다. 살수 대첩은 일제 강점기 무렵 수공으로 승리한 전투라는 설이 널리 퍼졌으나, 실제로는 도하하는 수의 군대를 고구려 군대가 공격하여 승리한 전투로 여겨진다. 수를 이어 중국을 통일한 당도 여러 차례 고구려를 침입하였다.',
      terms: [
        { label: '살수 대첩', def: '612년 고구려의 을지문덕이 수의 대군을 살수(청천강)에서 크게 격파한 싸움.' },
        { label: '을지문덕', def: '612년 수의 대군을 살수(청천강) 일대에서 크게 물리친 고구려의 장수.' },
        { label: '영양왕', def: '친위군과 말갈 기병을 이끌고 요서를 공격한 고구려의 왕.' }
      ],
      timeline: [
        { y: 589, label: '수, 중국 통일' },
        { y: 598, label: '◆ 수의 고구려 침입' },
        { y: 612, label: '살수 대첩' },
        { y: 614, label: '수, 고구려에서 철수' },
        { y: 618, label: '당 건국' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goguryeo', 'k-goguryeo-tang']
  },
  'k-goguryeo-tang': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '고구려-당 전쟁 — 수를 이어 중국을 통일한 당도 여러 차례 고구려를 침입하였다. 고구려는 안시성 전투(645) 등에서 당의 군대를 물리치면서 당의 침입을 막아 냈다. 이후 신라는 김춘추를 당에 보내 나당 동맹을 맺었다(648). 6세기 말 중국을 통일한 수와 그 뒤를 이은 당은 적극적인 팽창 정책을 펼치면서 여러 차례 고구려를 침입하였다. 이에 맞서 고구려는 백제, 돌궐 등과 연계하려 하였다. 안시성 전투를 이끈 성주의 실제 이름은 알 수 없으나, 명 대의 소설에서 양만춘이라고 제시되었다. 한편 백제의 공격으로 위기에 처한 신라는 김춘추를 당에 보내 나당 동맹을 맺었고, 당과 연합하여 백제(660)와 고구려(668)를 차례로 멸망시켰다.',
      terms: [
        { label: '안시성 전투', def: '645년 고구려가 안시성에서 당의 군대를 물리친 싸움.' },
        { label: '천리장성', def: '고구려가 당의 침입에 대비하여 쌓은 장성(위치에 대해서는 여러 의견이 있다).' },
        { label: '나당 동맹', def: '백제의 공격으로 위기에 처한 신라가 김춘추를 당에 보내 맺은 동맹(648). 대동강을 경계로 영역을 나누기로 하였다.' },
        { label: '김춘추', def: '나당 동맹을 맺은 신라의 왕족. 이후 왕위에 올라(태종 무열왕) 삼국 통일 전쟁을 수행하였다.' }
      ],
      timeline: [
        { y: 645, label: '◆ 안시성 전투' },
        { y: 648, label: '나당 동맹' },
        { y: 660, label: '백제 멸망' },
        { y: 668, label: '고구려 멸망' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goguryeo', 'k-goguryeo-sui']
  },
  'k-goi': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '고이왕 — 마한의 한 소국이었던 백제는 한강 유역을 발판으로 빠르게 성장하였다. 3세기 고이왕 때는 관등제를 정비하고 등급별로 관복의 색깔을 정하여 관리의 서열을 명확히 하는 등 지배 체제를 정비하였다. 그리고 마한을 이끌던 목지국을 병합하여 한강 유역 대부분을 차지하였다. 관리들은 등급에 따라 자주색, 붉은색, 푸른색 관복을 입었다. 목지국의 왕은 진왕으로 삼한을 대표하였는데, 목지국의 병합 시기에 대해서는 온조왕설, 3세기설, 근초고왕설 등 다양한 의견이 있다.',
      terms: [
        { label: '관등제', def: '관리의 등급을 나누어 서열화한 제도.' },
        { label: '목지국', def: '마한을 이끌던 소국.' }
      ],
      timeline: [
        { y: 234, label: '◆ 고이왕 즉위' },
        { y: 260, label: '관등제 실시' },
        { y: 286, label: '고이왕 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-baekje', 'k-samhan', 'k-era-samguk']
  },
  'k-geunchogo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '근초고왕 — 4세기 후반 백제의 근초고왕은 남쪽으로 마한의 남은 세력을 공격하였으며, 가야에도 영향력을 행사하였다. 북쪽으로는 고구려의 평양성을 공격하여 고국원왕을 전사시키고 황해도 일대를 차지하였다. 또한 중국의 동진, 왜와 우호 관계를 맺고 교류하였다. 이로써 백제가 삼국 항쟁의 주도권을 잡았다. 한편 4세기 말 침류왕 때는 동진에서 불교를 받아들였다. 칠지도에는 백제 왕세자가 왜왕에게 주려고 만들었다는 명문이 있어 당시 백제와 왜의 교류를 보여 준다.',
      terms: [
        { label: '칠지도', def: '백제와 왜의 활발한 교류를 보여 주는 칼(일본 나라).' },
        { label: '동진', def: '근초고왕 때 백제가 우호 관계를 맺은 중국의 나라.' },
        { label: '평양성 공격', def: '근초고왕이 고구려 평양성을 공격하여 고국원왕을 전사시키고 황해도 일대를 차지한 일.' }
      ],
      timeline: [
        { y: 346, label: '근초고왕 즉위' },
        { y: 371, label: '◆ 평양성 공격' },
        { y: 375, label: '근초고왕 재위 끝' },
        { y: 384, label: '침류왕, 동진에서 불교 수용' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-baekje', 'k-gogugwon', 'k-chimnyu']
  },
  'k-chimnyu': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '침류왕 — 4세기 말 백제의 침류왕 때 동진에서 불교를 받아들였다. 삼국은 불교를 받아들여 왕권을 뒷받침하고 국가를 정신적으로 통합하려고 하였다. 앞서 근초고왕 때 백제는 중국의 동진, 왜와 우호 관계를 맺고 교류하였다. 백제는 이후에도 왜와 긴밀하게 교류하여 다양한 문물을 전해 주었다.',
      terms: [
        { label: '불교 수용', def: '삼국은 불교를 받아들여 왕권을 뒷받침하고 국가를 정신적으로 통합하려 하였다.' },
        { label: '동진', def: '백제가 우호 관계를 맺고 교류한 중국 왕조. 침류왕 때 이곳에서 불교를 받아들였다.' }
      ],
      timeline: [
        { y: 384, label: '◆ 침류왕 즉위, 불교 수용' },
        { y: 385, label: '침류왕 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-baekje', 'k-geunchogo', 'k-sosurim']
  },
  'k-gaero': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '개로왕 — 백제는 개로왕 때 북위에 고구려를 칠 군대를 요청하였으나 북위가 거절하였다. 이후 고구려 장수왕의 공격으로 백제의 수도 한성이 함락되고, 개로왕은 사로잡혀 죽었다(475). 이후 백제는 웅진으로 수도를 옮겼다. 북위가 군대 요청을 거절하면서 백제와 북위의 관계가 단절되었다. 백제와 신라는 고구려에 맞서 나제 동맹을 맺었지만 고구려의 남진을 막지 못하였다. 이후 무령왕을 거치면서 국력을 회복한 백제는 6세기 중엽 성왕 때 사비로 수도를 옮겼다.',
      terms: [
        { label: '한성', def: '한강 유역에 있던 백제의 수도.' },
        { label: '북위', def: '개로왕이 고구려를 칠 군대를 요청한 중국 북조의 나라. 요청을 거절하였다.' },
        { label: '나제 동맹', def: '고구려에 맞서 백제와 신라가 맺은 동맹.' }
      ],
      timeline: [
        { y: 455, label: '개로왕 즉위' },
        { y: 475, label: '◆ 한성 함락, 개로왕 전사' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-baekje', 'k-jangsu', 'k-munju']
  },
  'k-munju': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '문주왕 — 백제는 고구려에 한성을 빼앗긴 뒤 문주왕 때 웅진(공주)으로 수도를 옮겼다(475). 문주왕 때 탐라가 사신을 보내 공물을 바쳤다. 웅진으로 옮긴 뒤 백제는 무령왕을 거치면서 국력을 회복하였으며, 6세기 중엽 성왕 때 다시 사비(부여)로 수도를 옮겼다. 탐라는 이후 동성왕 때 백제에 복속되었다.',
      terms: [
        { label: '웅진', def: '한성을 빼앗긴 뒤 옮긴 백제의 수도. 지금의 공주.' },
        { label: '탐라', def: '문주왕 때 백제에 사신을 보내 공물을 바쳤으며, 동성왕 때 복속되었다.' }
      ],
      timeline: [
        { y: 475, label: '◆ 문주왕 즉위, 웅진 천도' },
        { y: 477, label: '문주왕 재위 끝' },
        { y: 538, label: '성왕, 사비 천도' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-baekje', 'k-gaero', 'k-muryeong']
  },
  'k-muryeong': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '무령왕 — 백제는 고구려에 한성을 빼앗긴 뒤 웅진(공주)으로 수도를 옮겼다. 이후 무령왕을 거치면서 국력을 회복하였고, 이를 바탕으로 6세기 중엽 성왕 때 사비(부여)로 수도를 옮겼다. 앞서 장수왕 때 백제의 수도 한성이 함락되고 개로왕이 사로잡혀 죽은 뒤 백제는 웅진으로 수도를 옮겼다. 무령왕 때 회복한 국력을 바탕으로 성왕은 신라와 연합하여 한강 하류 지역을 일시적으로 되찾기도 하였다.',
      terms: [
        { label: '웅진', def: '한성을 빼앗긴 뒤 옮긴 백제의 수도. 지금의 공주.' },
        { label: '사비', def: '성왕이 옮긴 백제의 수도(부여).' }
      ],
      timeline: [
        { y: 475, label: '한성 함락, 웅진 천도' },
        { y: 501, label: '◆ 무령왕 즉위' },
        { y: 523, label: '무령왕 재위 끝' },
        { y: 538, label: '성왕, 사비 천도' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-baekje', 'k-munju', 'k-seong']
  },
  'k-seong': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '성왕 — 국력을 회복한 백제는 6세기 중엽 성왕 때 사비(부여)로 수도를 옮겼다. 그리고 신라와 연합하여 한강 하류 지역을 일시적으로 되찾았으나, 신라에 다시 빼앗겼다. 성왕은 관산성에서 신라와 싸우다 전사하였다(554). 『일본서기』에는 성왕이 태자를 격려하러 가다가, 『삼국사기』에는 신라군을 공격하러 가다가 신라군의 기습으로 잡혀 전사한 것으로 기록되어 있다. 이 전투의 패배로 백제는 4인의 좌평과 29,600명의 병사가 전사하였다고 『삼국사기』에 기록되었다. 이로써 나제 동맹은 깨지고 한강 유역은 신라가 차지하였다.',
      terms: [
        { label: '사비', def: '성왕이 옮긴 백제의 수도. 지금의 부여.' },
        { label: '관산성', def: '554년 백제 성왕이 전사한 곳.' },
        { label: '나제 동맹', def: '고구려에 맞서 백제와 신라가 맺은 동맹. 한강 유역을 둘러싸고 깨졌다.' }
      ],
      timeline: [
        { y: 523, label: '성왕 즉위' },
        { y: 538, label: '사비 천도' },
        { y: 551, label: '신라와 연합해 한강 하류 일시 회복' },
        { y: 554, label: '◆ 성왕 전사' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-baekje', 'k-muryeong', 'k-jinheung']
  },
  'k-naemul': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '내물왕 — 초기 신라에서는 박·석·김씨가 돌아가며 왕위에 올랐다. 4세기 말 내물왕은 왕권을 강화하여 김씨의 왕위 세습을 확립하고, 왕의 칭호로 ‘마립간’을 사용하였다. 그러나 왜와 가야의 침입을 물리치기 위해 고구려 광개토 대왕의 도움을 받으면서, 고구려의 간섭을 받게 되었다. 신라의 왕호는 거서간, 차차웅, 이사금, 마립간, 국왕으로 바뀌었는데, 마립간은 대군장이라는 뜻이다. 『삼국사기』에는 마립간이 눌지왕 때 사용되었다고 전하나, 일반적으로 『삼국유사』의 설을 따라 내물왕 때부터 사용된 것으로 본다.',
      terms: [
        { label: '마립간', def: '‘대군장’이라는 뜻의 신라 왕호. 내물왕부터 사용하였다.' },
        { label: '김씨 왕위 세습', def: '내물왕 때 확립되었다. 그 전에는 박·석·김씨가 돌아가며 왕위에 올랐다.' },
        { label: '신라의 왕호', def: '거서간(군장) → 차차웅(제사장) → 이사금(연장자) → 마립간(대군장) → 국왕.' }
      ],
      timeline: [
        { y: 356, label: '◆ 내물왕 즉위' },
        { y: 400, label: '고구려군, 신라에 침입한 왜 격퇴' },
        { y: 402, label: '내물왕 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-silla', 'k-gwanggaeto', 'k-era-samguk']
  },
  'k-jijeung': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '지증왕 — 신라는 6세기에 중앙 집권 체제를 정비하고 영토를 크게 넓혔다. 지증왕은 나라 이름을 ‘신라’로 정하고 ‘국왕’ 칭호를 사용하였으며, 이사부를 보내 우산국을 복속시켰다(512). 국호는 그 전에 사로 등 다양한 명칭이 사용되다가 지증왕 때 ‘신라’로 확정되었다. 지증왕 때 이사부는 나무로 된 사자를 이용해 우산국의 항복을 받았다. 신라의 왕호는 거서간, 차차웅, 이사금, 마립간을 거쳐 지증왕 때 중국식 왕호인 ‘국왕’으로 바뀌었다.',
      terms: [
        { label: '우산국', def: '512년 이사부가 복속시킨 나라.' },
        { label: '이사부', def: '지증왕 때 우산국을 복속시킨 신라의 장수.' },
        { label: '국왕', def: '지증왕 때부터 사용한 중국식 왕호. 마립간 다음의 칭호이다.' }
      ],
      timeline: [
        { y: 500, label: '◆ 지증왕 즉위' },
        { y: 512, label: '우산국 복속' },
        { y: 514, label: '지증왕 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-silla', 'k-naemul', 'k-beopheung']
  },
  'k-beopheung': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '법흥왕 — 법흥왕은 율령을 반포하고 불교를 공인하여 중앙 집권 체제를 확립하였다. 또한 독자적 연호인 ‘건원’을 사용하고 금관가야를 병합하였다(532). 다른 나라의 연호를 쓰지 않고 독자적 연호를 사용한 것은 자주성을 표현한 것이다. 지증왕 때 다져진 체제를 바탕으로 신라는 6세기에 중앙 집권 체제를 정비하고 영토를 크게 넓혔다. 금관가야 왕족 출신인 김무력은 이후 관산성 전투에서 백제 성왕을 죽였으며, 김유신은 삼국 통일에 기여하였다. 법흥왕 때부터 사용한 독자적 연호는 신라가 독자적 천하관을 가지고 있었음을 보여 준다.',
      terms: [
        { label: '연호', def: '군주가 자신이 다스리는 시기를 나타내려고 붙이는 명칭. 독자적 연호는 자주성을 표현한다.' },
        { label: '건원', def: '법흥왕이 사용한 신라의 독자적 연호.' },
        { label: '율령 반포', def: '왕을 중심으로 하는 지배 체제를 확립하는 일. 율령이 왕의 이름으로 반포되면서 귀족은 왕의 지배를 받는 존재가 되었다.' },
        { label: '불교 공인', def: '불교를 받아들여 왕권을 뒷받침하고 국가를 정신적으로 통합하려 하였다(527).' }
      ],
      timeline: [
        { y: 514, label: '법흥왕 즉위' },
        { y: 520, label: '율령 반포' },
        { y: 527, label: '불교 공인' },
        { y: 532, label: '◆ 금관가야 병합' },
        { y: 540, label: '법흥왕 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-silla', 'k-jijeung', 'k-jinheung', 'k-gaya-early']
  },
  'k-jinheung': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '진흥왕 — 진흥왕은 청소년 수련 단체인 화랑도를 국가적 조직으로 개편하여 인재를 키웠다. 그리고 백제와 연합하여 한강 상류 지역을 점령하였으며, 이후 백제를 공격해 한강 하류 지역도 차지하였다. 또한 대가야를 정복하고(562) 한때 함흥평야까지 진출하였다. 단양 신라 적성비와 진흥왕 순수비가 이 시기 신라의 영토 확장을 보여 준다. 진흥왕은 독자적인 연호를 사용하였다. 한강 유역은 한반도의 중앙에 위치하고 있어 영토를 확장하려면 반드시 차지해야 하는 곳이었으므로 삼국이 치열하게 다투었다. 신라는 한강 유역을 차지하면서 당항성을 통해 중국과 직접 교류할 수 있게 되었다. 단양 신라 적성비는 신라가 적성 지역을 차지한 것을 기념하여 세운 비석으로, 적성 공략에 공을 세운 이사부 등 신라 장수의 이름이 기록되어 있다.',
      terms: [
        { label: '화랑도', def: '청소년 수련 단체. 진흥왕이 국가적 조직으로 개편하였다.' },
        { label: '진흥왕 순수비', def: '진흥왕 때 세워진 비석(서울 북한산·황초령·마운령). 창녕 척경비, 단양 신라 적성비와 함께 신라의 영토 확장을 보여 준다.' },
        { label: '단양 신라 적성비', def: '신라가 적성(단양) 지역을 차지한 것을 기념하여 세운 비석. 진흥왕 순수비에는 포함되지 않는다.' },
        { label: '당항성', def: '진흥왕 때 한강 유역을 차지한 신라가 중국과 직접 교류한 통로.' }
      ],
      timeline: [
        { y: 540, label: '진흥왕 즉위' },
        { y: 554, label: '관산성에서 백제 성왕 전사' },
        { y: 562, label: '◆ 대가야 정복' },
        { y: 576, label: '진흥왕 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-silla', 'k-beopheung', 'k-seong', 'k-gaya-late']
  },
  'k-nadang': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '나당 전쟁 — 백제와 고구려가 멸망한 뒤 당은 옛 땅에 웅진 도독부와 안동 도호부를 설치하고, 신라에도 계림 대도독부를 두어 한반도 전체를 장악하려 하였다. 이에 신라는 당과의 전쟁에 나섰다. 고구려 유민과 힘을 합쳐 요동을 공격하였으며(670), 이후 매소성 전투(675)와 기벌포 전투(676)에서 큰 승리를 거두었다. 이로써 신라는 당군을 몰아내고 삼국을 통일하였다(676). 나당 동맹 당시 신라와 당은 대동강을 경계로 영역을 나누기로 하였다. 삼국 통일 전쟁은 삼국과 당, 왜(일본)가 모두 참전한 동아시아 국제전이었으며, 티베트고원 지역에서 발생한 당과 토번의 전쟁도 나당 전쟁에서 신라가 승리하는 데 영향을 끼쳤다. 태종 무열왕(김춘추), 문무왕이 삼국 통일을 이끌면서 신라 왕실의 권위가 높아졌다.',
      terms: [
        { label: '계림 대도독부', def: '당이 신라에 두려 한 기구. 한반도 전체를 장악하려는 의도였다.' },
        { label: '매소성 전투', def: '675년 신라가 당군에 크게 이긴 싸움.' },
        { label: '기벌포 전투', def: '676년 신라가 당군에 이긴 싸움.' },
        { label: '웅진 도독부·안동 도호부', def: '백제와 고구려가 멸망한 뒤 당이 옛 백제와 고구려 땅에 각각 설치한 기구.' }
      ],
      timeline: [
        { y: 648, label: '나당 동맹' },
        { y: 660, label: '백제 멸망' },
        { y: 668, label: '고구려 멸망' },
        { y: 670, label: '◆ 신라·고구려 부흥군, 당 공격' },
        { y: 675, label: '매소성 전투' },
        { y: 676, label: '기벌포 전투, 삼국 통일' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-silla', 'k-unify']
  },
  'k-gaya-early': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '전기 가야 연맹 — 낙동강 하류의 변한 지역에서는 여러 소국이 가야 연맹을 이루어 성장하였다. 초기에는 김해의 금관가야가 가야 연맹을 이끌었다. 금관가야는 질 좋은 철을 생산·수출하면서 주변 지역과 활발히 교류하였고, 백제·신라와 경쟁하면서 성장하였다. 그러나 광개토 대왕 때 고구려의 공격으로 금관가야의 세력이 약해졌다.',
      terms: [
        { label: '금관가야', def: '김해의 가야. 전기 가야 연맹을 이끌었다.' },
        { label: '변한', def: '낙동강 하류 지역의 삼한. 가야 연맹의 바탕이 되었다.' },
        { label: '철', def: '금관가야가 생산·수출한 질 좋은 철. 주변 지역과 교류하는 기반이 되었다.' }
      ],
      timeline: [
        { y: 42, label: '가야 연맹 성립' },
        { y: 200, label: '◆ 금관가야 중심의 가야 연맹' },
        { y: 400, label: '고구려의 공격으로 금관가야 약화' },
        { y: 532, label: '금관가야, 신라에 병합' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gaya', 'k-gaya-late', 'k-gwanggaeto']
  },
  'k-gaya-late': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '후기 가야 연맹 — 고구려의 공격으로 금관가야의 세력이 약해지면서 5세기 후반에는 고령의 대가야가 가야를 주도하는 세력으로 성장하였다. 가야는 중앙 집권 국가로 발전하지 못하였고, 대가야는 신라 진흥왕에게 정복되었다(562). 가야는 뛰어난 철기 문화를 바탕으로 중국, 왜 등과 활발히 교류하였다. 금관가야는 신라 법흥왕 때 병합되었고(532), 대가야도 진흥왕 때 정복되었다.',
      terms: [
        { label: '대가야', def: '고령의 가야. 후기 가야 연맹을 이끌었다.' },
        { label: '덩이쇠', def: '철을 가공해 만든 것으로 금관가야의 고분에서 발견되었다. 화폐, 철기 제작 원료 등으로 쓰인 것으로 여겨진다.' }
      ],
      timeline: [
        { y: 400, label: '광개토 대왕의 공격으로 금관가야 약화' },
        { yl: '5세기 후반', label: '◆ 대가야 중심의 가야 연맹' },
        { y: 532, label: '금관가야, 신라에 병합' },
        { y: 562, label: '대가야, 신라 진흥왕에게 정복' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gaya', 'k-gaya-early', 'k-jinheung']
  },
  'k-gr-taejo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '태조 — 왕건은 고려를 세운 뒤 신라의 항복(935)을 받고 후백제를 멸망시켜 후삼국을 통일하였다(936). 태조는 유력한 호족 가문과 혼인하거나 왕씨 성을 내려 주어 호족을 포섭하였고, 기인 제도를 실시하고 중앙의 고위 관리를 사심관으로 임명하여 지방 호족을 견제하였다. 또한 세금을 줄여 백성의 생활을 안정시켰으며, 후대 왕에게 훈요 10조를 남겼다. 고구려 계승을 내세워 평양을 서경으로 삼고 북진 정책을 추진하였으며, 발해 유민을 적극적으로 받아들이고 발해를 멸망시킨 거란은 적대하였다. 후고구려를 세운 궁예가 포악한 정치로 민심을 잃자, 송악(개성)의 호족 출신인 왕건이 신하들의 추대를 받아 왕위에 올랐다(918). 왕건은 고구려를 계승한다는 의미로 나라 이름을 ‘고려’라 하였으며, 이듬해에는 수도를 철원에서 자신의 근거지인 송악으로 옮겼다. 후백제의 견훤이 신라 금성을 공격하자 태조는 직접 군대를 이끌고 남하하여 공산 전투를 벌였으나 대패하였다. 그러나 궁예, 견훤과 달리 신라에 우호적인 정책을 펼쳐 신라 귀족과 경상도 지역 호족의 지지를 얻었다. 태조는 조세를 거둘 때 일정한 법도가 있어야 한다는 취민유도를 표방하고 세율을 10분의 1로 정하였다.',
      terms: [
        { label: '기인 제도', def: '지방 호족의 자제를 인질로 삼아 수도에 머무르게 하고 출신 지역의 일을 자문하게 한 제도.' },
        { label: '사심관', def: '지방 세력을 통제하려고 그 지역에 연고가 있는 중앙 고위 관료에게 준 관직.' },
        { label: '훈요 10조', def: '태조가 후대 왕에게 남긴 통치의 교훈.' },
        { label: '취민유도', def: '백성에게서 세금을 거둘 때 일정한 법도가 있어야 한다는 원칙. 태조는 세율을 10분의 1로 정하였다.' },
        { label: '북진 정책', def: '고구려 계승을 내세워 평양을 서경으로 중시하고 북쪽으로 영토를 넓힌 정책.' }
      ],
      timeline: [
        { y: 918, label: '◆ 고려 건국' },
        { y: 919, label: '송악(개경)으로 천도' },
        { y: 927, label: '공산 전투' },
        { y: 935, label: '신라 항복' },
        { y: 936, label: '후삼국 통일' },
        { y: 943, label: '태조 사망, 훈요 10조' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goryeo', 'k-silla-fall', 'k-balhae-fall']
  },
  'k-gr-gwangjong': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '광종 — 태조가 죽은 뒤 왕위 다툼 속에 즉위한 광종은 공신과 호족 세력을 누르고 왕권을 강화하였다. 노비안검법을 시행하여 억울하게 노비가 된 사람들을 양인으로 되돌렸고, 그 결과 공신과 호족의 기반이 약해지고 국가 재정 기반이 확충되었다. 쌍기의 건의로 과거제를 실시하여 충성심과 유교 지식을 갖춘 사람을 관리로 뽑았으며, 관복 색깔을 등급에 따라 다르게 하였다. 반발한 공신과 호족을 숙청하고, ‘광덕’·‘준풍’이라는 독자적 연호를 사용하며 개경을 ‘황도’로 칭하였다. 태조가 죽은 뒤 왕위를 둘러싸고 치열한 다툼이 일어났고, 이러한 불안정한 정치 상황 속에서 광종이 왕위에 올랐다. 노비안검법에 공신과 호족을 중심으로 반발이 컸으며, 결국 성종 때 노비환천법이 제정되어 양인이 된 노비 중 일부를 다시 노비로 돌렸다. 과거제는 후주에서 귀화한 쌍기의 건의로 시행되었다. 광종은 관리의 등급을 자색(보라), 붉은색, 주황색, 녹색 관복으로 나누었다.',
      terms: [
        { label: '노비안검법', def: '억울하게 노비가 된 사람들을 조사하여 양인으로 되돌린 법.' },
        { label: '과거제', def: '시험으로 관리를 뽑는 제도. 광종이 쌍기의 의견을 받아들여 실시하였다.' },
        { label: '쌍기', def: '후주에서 귀화하여 광종에게 과거제 시행을 건의한 인물.' },
        { label: '광덕·준풍', def: '광종이 사용한 독자적 연호. 개경을 ‘황도’로 칭하며 고려가 황제국임을 내세웠다.' },
        { label: '노비환천법', def: '성종 때 제정되어 노비안검법으로 양인이 된 노비 중 일부를 다시 노비로 돌린 법.' }
      ],
      timeline: [
        { y: 949, label: '광종 즉위' },
        { y: 956, label: '노비안검법' },
        { y: 958, label: '◆ 과거제 실시' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goryeo', 'k-gr-taejo', 'k-gr-seongjong']
  },
  'k-gr-seongjong': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '성종 — 성종은 최승로가 건의한 시무 28조를 받아들여 유교를 바탕으로 통치 체제를 정비하였다. 중앙 통치 기구는 중국의 제도를 참고하여 2성 6부로 정비하였으며, 지방에는 12목을 설치하고 지방관을 파견하였다. 또한 국자감을 정비하고 지방에 경학박사를 파견하는 등 유학 교육을 장려하였다. 최승로의 시무 28조는 성종이 5품 이상의 관리에게 시무의 잘잘못을 논하는 글을 올리게 하자 최승로가 올린 개혁안으로, 현재 22조가 전한다. 최승로는 불교로 인한 사회적 폐단을 지적하고 유교에 바탕한 정치를 실현하자고 하였으며, 지방관 파견 등 민생 안정을 위한 여러 폐단의 시정을 주장하였다. 시무 28조 중 7조는 12목을 설치하고 지방관을 파견하는 것으로, 20조는 유교를 바탕으로 통치 체제를 정비하는 것으로 실현되었다.',
      terms: [
        { label: '시무 28조', def: '최승로가 성종에게 올린 개혁안. 유교를 나라를 다스리는 근원으로 삼을 것을 주장하였다.' },
        { label: '2성 6부', def: '중서문하성·상서성과 6부로 이루어진 고려의 중앙 행정 조직.' },
        { label: '12목', def: '성종 때 처음 지방관을 파견한 12개의 지방 행정 구역.' },
        { label: '최승로', def: '성종에게 시무 28조를 올린 신하.' },
        { label: '국자감', def: '중앙의 최고 교육 기관. 성종 때 정비되었다.' },
        { label: '경학박사', def: '성종 때 지방에 파견하여 유학 교육을 맡게 한 관리.' }
      ],
      timeline: [
        { y: 981, label: '성종 즉위' },
        { y: 983, label: '◆ 12목 설치' },
        { y: 993, label: '거란의 1차 침입, 서희의 외교 담판' },
        { y: 997, label: '성종 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goryeo', 'k-gr-gwangjong', 'k-gr-khitan']
  },
  'k-gr-khitan': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '고려-거란 전쟁 — 10세기 거란(요)은 송을 공격하기에 앞서 후방을 안정시키려 고려를 침입하였다(1차, 993). 서희가 거란 장수와 담판을 벌여 압록강 동쪽 지역을 확보하고 강동 6주를 설치하였다. 고려가 송과 계속 교류하자 거란이 다시 침입하여(2차, 1010) 개경이 함락되고 왕이 나주까지 피란하였으나, 양규 등이 돌아가는 거란군에 큰 타격을 주었다. 거란은 강동 6주 반환을 요구하며 다시 침입하였고(3차, 1018), 강감찬이 이끄는 고려군이 귀주에서 크게 격파하였다(귀주 대첩, 1019). 이후 고려·송·거란 사이에 세력 균형이 이루어졌다. 서희는 고려가 고구려를 계승한 나라임을 내세우고, 여진이 압록강 부근을 차지하여 거란과 교류하지 못한다고 하여 여진을 내쫓으면 거란과 교류하겠다고 하였다. 거란은 고려와 외교 관계를 맺어 후방을 안정시키고 송과의 전쟁에 전념할 수 있게 되었으며, 고려는 강동 6주를 얻었다. 강동 6주는 이후 거란의 여러 차례 침입에도 함락되지 않아 거란의 침입을 막는 보루가 되었다. 귀주 대첩은 거란의 10만 군대를 고려가 20여 만의 군대를 동원해 평야 지역에서 격파한 전투로, 우리 역사 최대 규모의 회전 중 하나이다. 당시 고려는 요와 사대 관계를 맺었지만 여전히 송에 사절을 보내는 등 그 관계는 상당히 느슨한 것이었다.',
      terms: [
        { label: '서희의 외교 담판', def: '거란의 1차 침입 때 서희가 거란 장수와 담판하여 강동 6주를 확보한 일.' },
        { label: '강동 6주', def: '압록강 동쪽에 설치한 6개 주.' },
        { label: '귀주 대첩', def: '1019년 강감찬이 귀주에서 거란군을 크게 격파한 싸움.' },
        { label: '양규', def: '거란의 2차 침입 때 돌아가는 거란군에게 큰 타격을 준 고려의 장수.' },
        { label: '강감찬', def: '귀주에서 거란군을 크게 격파한 고려의 장수.' }
      ],
      timeline: [
        { y: 993, label: '◆ 거란의 1차 침입, 서희의 외교 담판' },
        { y: 1010, label: '거란의 2차 침입' },
        { y: 1018, label: '거란의 3차 침입' },
        { y: 1019, label: '귀주 대첩' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goryeo', 'k-gr-jurchen', 'k-balhae-fall']
  },
  'k-gr-jurchen': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '여진의 침략 — 12세기에 들어 여진이 부족을 통합하면서 고려와 자주 충돌하였다. 고려는 윤관의 건의로 별무반을 편성하고, 여진을 공격하여 동북 9성을 쌓았다. 그러나 여진이 반환을 요구하며 계속 침입해 와 피해가 커지자, 조공을 바치고 침입하지 않겠다는 약속을 받고 동북 9성을 돌려주었다. 이후 여진이 금을 세우고 형제 관계를 요구하였으나 고려는 거부하였고, 거란을 멸망시킨 금이 군신 관계를 요구하자 당시 집권자 이자겸 등이 받아들였다. 별무반은 신기군(기병), 신보군(보병), 항마군(승병)으로 구성되었다. 동북 9성을 돌려주는 과정에서 윤관을 처벌하라는 의견도 제시되었으며, 윤관은 동북 9성 반환 이후 관직에서 은퇴하였다. 동북 9성의 위치에 대해서는 두만강 북쪽에서 함경도 일대에 걸쳐 있다는 설, 길주 이남의 함경도 일대로 비정하는 설, 함흥평야 일대로 보는 설 등 여러 학설이 있다.',
      terms: [
        { label: '별무반', def: '여진을 상대하기 위해 편성한 기병 중심의 부대. 신기군·신보군·항마군으로 구성.' },
        { label: '동북 9성', def: '윤관이 여진을 공격한 뒤 쌓은 9개의 성.' },
        { label: '윤관', def: '별무반을 편성하여 여진을 공격하고 동북 9성을 쌓은 고려의 장수.' },
        { label: '금', def: '여진이 세운 나라(1115). 거란을 멸망시키고 고려에 군신 관계를 요구하였다.' }
      ],
      timeline: [
        { y: 1107, label: '◆ 윤관, 여진 정벌' },
        { y: 1109, label: '동북 9성 반환' },
        { y: 1115, label: '여진, 금 건국' },
        { y: 1126, label: '금의 군신 관계 요구 수용' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goryeo', 'k-gr-khitan', 'k-gr-yijagyeom']
  },
  'k-gr-yijagyeom': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '이자겸의 난 — 고려 사회가 안정되면서 여러 세대에 걸쳐 높은 관리를 배출한 문벌이 나타나 권력을 독점하였다. 경원 이씨의 이자겸은 예종과 인종에게 잇따라 딸을 시집보내 권력을 독점하고 왕권을 위협하였다. 인종이 이자겸을 제거하려 하자 이자겸이 반란을 일으켰다(1126). 난은 진압되었으나 궁궐이 불타는 등 왕의 권위가 더욱 떨어졌다. 문벌은 왕실이나 다른 문벌과 폐쇄적인 혼인 관계를 맺어 권력을 독점하였다. 그중 경원 이씨 가문은 여러 대에 걸쳐 왕실과 혼인 관계를 맺으면서 권력을 키웠다. 『고려사』에는 이자겸이 다른 가문 출신이 왕비가 되어 권력을 빼앗길 것을 두려워하여 셋째 딸과 넷째 딸을 잇따라 인종의 왕비로 들였다고 기록되어 있으며, 이자겸은 『고려사』의 반역 열전에 올라 있다. 또한 금이 군신 관계를 요구하자 당시 집권자였던 이자겸 등이 이를 받아들였다. 이자겸의 난 이후 인종은 왕권을 회복하려 묘청 등 서경 세력을 등용하였다.',
      terms: [
        { label: '문벌', def: '여러 세대에 걸쳐 높은 관리를 배출하고 폐쇄적 혼인으로 권력을 독점한 가문.' },
        { label: '경원 이씨', def: '여러 대에 걸쳐 왕실과 혼인하며 권력을 키운 문벌.' },
        { label: '인종', def: '이자겸의 외손자이자 사위. 이자겸을 제거하려 하자 이자겸이 반란을 일으켰다.' }
      ],
      timeline: [
        { y: 1126, label: '금의 군신 관계 요구 — 이자겸 등 수용' },
        { y: 1126, label: '◆ 이자겸의 난' },
        { y: 1135, label: '묘청의 서경 천도 운동' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goryeo', 'k-gr-myocheong', 'k-gr-jurchen']
  },
  'k-gr-myocheong': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '묘청의 서경 천도 운동 — 이자겸의 난 이후 인종은 왕권을 회복하려 묘청 등 서경 세력을 등용하였다. 이들은 풍수지리설을 내세워 서경으로 수도를 옮기고, 황제 칭호와 연호를 사용하며 금을 정벌하자고 주장하였다. 그러나 김부식 등 개경 세력의 반대로 천도가 무산되자, 묘청은 나라 이름을 ‘대위’로 짓고 서경에서 반란을 일으켰다(1135). 반란은 김부식이 이끄는 관군에게 1년 만에 진압되었다. 서경 세력은 서경 임원역의 땅이 명당이므로 이곳에 궁궐을 짓고 옮겨 가면 금이 항복하고 주변 서른여섯 나라가 머리를 조아릴 것이라고 주장하였다. 서경 천도를 위해 강물 속에 기름 넣은 떡을 넣어 신령스러운 징조라고 하는 등 천도 여론을 조성하였고, 인종은 서경에 궁궐(대화궁)을 짓는 등 천도를 추진하였다. 그러나 왕의 서경 행차 시 각종 자연재해가 일어나 행차가 중지되기도 하였다. 신채호는 묘청의 난을 ‘조선 역사상 일천년래 제일대사건’이라 칭하며 이후 역사에 큰 영향을 끼친 중요한 사건으로 평가하였다.',
      terms: [
        { label: '풍수지리설', def: '산이나 땅, 하천 등의 모양이 인간의 운명에 영향을 끼친다는 사상.' },
        { label: '서경', def: '고려가 중시한 옛 고구려의 수도 평양.' },
        { label: '김부식', def: '서경 천도에 반대한 개경 세력. 묘청의 반란을 1년 만에 진압하였다.' },
        { label: '대위', def: '묘청이 서경에서 반란을 일으키며 지은 나라 이름.' }
      ],
      timeline: [
        { y: 1126, label: '이자겸의 난' },
        { y: 1135, label: '◆ 묘청, 서경에서 반란' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goryeo', 'k-gr-yijagyeom', 'k-gr-musin']
  },
  'k-gr-musin': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '무신 정변 — 문신을 중심으로 한 문벌이 권력을 독점하고 무신은 낮은 대우를 받았으며, 국왕도 측근과 향락에 빠져 있었다. 이에 이의방, 정중부 등이 정변을 일으켜 정권을 잡았다(1170). 초기에는 무신들의 권력 다툼으로 혼란하였으나, 최충헌이 교정도감을 설치하고 도방을 확대하면서 안정되었고, 아들 최우는 정방과 삼별초를 두었다. 최씨 정권은 4대 60여 년간 이어졌다. 이 시기 망이·망소이의 난(1176), 만적의 난(1198) 등 농민과 천민의 봉기가 잇따랐다. 이자겸의 난과 묘청의 난 등 정변이 이어지면서 무신의 역할이 커졌지만, 여전히 무신은 문신에 비해 낮은 대우를 받았다. 『고려사』에는 왕이 보현원으로 가는 길에 무신들에게 오병수박희를 하게 하였는데, 대장군 이소응이 이기지 못하고 도망가자 문신 한뢰가 뺨을 쳐 계단 아래로 떨어지게 하였다고 기록되어 있다. 최충헌은 경대승 때 설치된 도방을 6번으로 나누어 교대로 자신의 집을 경호하게 하였다. 무신 정변 이후 이의민과 같은 하층민 출신 권력자가 등장하는 등 신분 제도가 흔들리자, 사노비 만적 등은 신분 상승을 기대하며 개경에서 봉기를 계획하였으나 실패하였다. 무신 정변으로 왕조가 바뀌지 않은 것은 국왕의 권위가 어느 정도 남아 있었고, 무신들 사이의 상호 견제로 특정인이 왕조를 개창하기 어려웠기 때문으로 여겨진다.',
      terms: [
        { label: '교정도감', def: '최충헌이 설치하여 국가의 중요 정책을 결정한 기구.' },
        { label: '정방', def: '최우가 설치하여 인사권을 장악한 기구.' },
        { label: '삼별초', def: '최우가 조직한 군사 조직.' },
        { label: '도방', def: '경대승이 설치하고 최충헌이 확대한 사병 조직.' },
        { label: '만적', def: '무신 정권 시기 개경에서 봉기를 계획하였다가 실패한 사노비.' }
      ],
      timeline: [
        { y: 1170, label: '◆ 무신 정변' },
        { y: 1176, label: '망이·망소이의 난' },
        { y: 1196, label: '최충헌 집권' },
        { y: 1198, label: '만적의 난' },
        { y: 1258, label: '최씨 정권 붕괴' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goryeo', 'k-gr-myocheong', 'k-gr-mongol']
  },
  'k-gr-mongol': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '고려-몽골 전쟁 — 몽골은 과도한 공물을 요구하다 사신 피살 사건을 구실로 고려를 침입하였다(1231). 고려는 몽골과 일단 강화하고 수도를 강화도로 옮겨 싸울 준비를 하였다(1232). 몽골군이 다시 쳐들어오자 처인성과 충주성 등에서 부곡민·노비 등 하층민까지 저항하였다. 그러나 오랜 전쟁으로 수많은 사람이 죽고 국토가 황폐해졌으며, 결국 고려는 몽골과 강화하고 개경으로 환도하였다(1270). 이에 반발한 삼별초가 봉기하였으나 진압되었다(1273). 13세기 초 몽골이 세력을 키우는 가운데, 몽골에 쫓긴 거란족이 고려에 들어오자 몽골과 고려가 연합하여 강동성에서 거란족을 물리치면서 외교 관계를 맺었다. 몽골 사신 저고여가 돌아가다가 압록강 부근에서 살해되자, 고려는 여진의 소행이라고 해명하였으나 몽골은 이를 구실로 침략하였다. 처인성 전투에서는 승려였던 김윤후와 처인 부곡민이 몽골군을 물리치며 적장 살리타를 사살하였고, 김윤후는 이후 충주성 전투에서 노비들을 이끌고 몽골군을 물리쳤다. 삼별초는 좌·우별초와 신의군으로 구성된 부대로 무신 정권 때 최우가 설치하였으며, 진도와 제주도로 옮겨 가면서 고려 정부와 몽골에 맞서 싸웠다.',
      terms: [
        { label: '강화 천도', def: '1232년 몽골에 항전하려 수도를 강화도로 옮긴 일.' },
        { label: '처인성 전투', def: '1232년 처인성에서 몽골군에 맞선 싸움.' },
        { label: '삼별초', def: '개경 환도에 반발해 진도·제주도로 옮겨 가며 항쟁한 부대. 1273년 진압.' },
        { label: '김윤후', def: '처인성 전투에서 살리타를 사살하고, 충주성 전투에서 노비들을 이끌고 몽골군을 물리친 승려.' },
        { label: '충주성 전투', def: '김윤후가 노비들을 이끌고 몽골군을 물리친 전투(1253).' }
      ],
      timeline: [
        { y: 1231, label: '◆ 몽골의 1차 침입' },
        { y: 1232, label: '강화 천도' },
        { y: 1253, label: '충주성 전투' },
        { y: 1270, label: '개경 환도, 삼별초 봉기' },
        { y: 1273, label: '삼별초 진압' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goryeo', 'k-gr-musin', 'k-gr-yuan']
  },
  'k-gr-yuan': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '원 간섭기 — 몽골과 강화한 뒤 고려는 독립을 유지하였지만 원의 간섭을 받았다. 원은 일본 원정에 고려를 동원하고, 이를 위해 설치한 정동행성을 유지하여 내정에 간섭하였다. 금·은·매 등 공물과 공녀, 환관을 요구하였고, 고려 영토에 쌍성총관부·동녕부·탐라총관부를 설치하였다. 원과 관계를 맺어 권세를 누리는 사람들이 기존 권력층과 함께 권문세족을 이루었으며, 이들이 불법으로 농장을 확대하면서 농민의 삶이 어려워지고 국가 재정도 부족해졌다. 오랜 전쟁 끝에 몽골과 강화한 고려는 독립국의 지위를 유지하였지만 몽골(원) 중심의 국제 질서에 편입되었다. 고려 왕이 원의 공주와 결혼하면서 고려는 원의 부마국이 되었고, 왕실 용어와 관제를 제후국에 맞게 낮추었으며 왕위 계승과 내정에 원의 간섭을 받았다. 친원 세력들이 고려를 원의 행정 구역으로 편입하려 하기도 하였다. 공녀 요구로 고려에서는 조혼의 풍습이 유행하였으며, 공녀 중에서 원의 황후인 기황후가 나오기도 하였다. 원과의 교류가 활발해지면서 원의 복식과 언어가 고려에서 유행하였고(몽골풍), 원의 지배층 사이에서는 고려의 풍습이 유행하였다(고려양).',
      terms: [
        { label: '정동행성', def: '원이 일본 원정을 위해 설치한 기구. 이후 고려의 내정에 간섭하였다.' },
        { label: '쌍성총관부', def: '원이 고려 영토(철령 이북)에 설치한 기구.' },
        { label: '권문세족', def: '원 간섭기에 원과 관계를 맺어 권세를 누린 지배층.' },
        { label: '부마국', def: '고려 왕이 원의 공주와 결혼하면서 된 원의 사위 나라.' },
        { label: '공녀', def: '원의 요구로 바쳐진 여성. 이로 인해 고려에서는 조혼의 풍습이 유행하였다.' },
        { label: '몽골풍·고려양', def: '원 간섭기 고려에서 유행한 원의 풍속(몽골풍)과 원에서 유행한 고려의 풍속(고려양).' }
      ],
      timeline: [
        { y: 1258, label: '원, 쌍성총관부 설치' },
        { y: 1270, label: '◆ 개경 환도' },
        { y: 1356, label: '기철 등 친원 세력 숙청' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goryeo', 'k-gr-mongol', 'k-gr-gongmin']
  },
  'k-gr-gongmin': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '공민왕 — 14세기 중엽 원이 쇠퇴하자 공민왕은 반원 개혁을 추진하였다. 기철 등 친원 세력을 제거하고, 내정에 간섭하던 정동행성이문소를 폐지하였으며, 쌍성총관부를 공격하여 철령 이북의 땅을 되찾았다(1356). 몽골식 머리 모양과 의복도 버렸다. 또한 신돈을 등용하고 전민변정도감을 설치하여(1366) 권문세족이 불법으로 빼앗은 토지를 돌려주고 억울하게 노비가 된 사람을 양인으로 되돌리려 하였으며, 성균관을 정비하고 신진 사대부를 등용하였다. 기철은 원 순제의 어머니인 기황후의 오빠로, 이를 배경으로 고려에서 권력을 장악하고 불법 행위를 일삼았다. 공민왕은 원의 연호 사용을 중지하였으며, 원의 혼란을 틈타 이성계 등을 파견해 요동성을 점령하기도 하였다(1차 요동 정벌). 그러나 공민왕의 개혁은 홍건적과 왜구의 침입, 권문세족의 반발 등으로 큰 성과를 거두지 못하였고, 공민왕이 살해되면서 중단되었다.',
      terms: [
        { label: '반원 개혁', def: '원의 간섭에서 벗어나려 공민왕이 추진한 개혁.' },
        { label: '전민변정도감', def: '권문세족이 빼앗은 토지와 노비를 바로잡으려 설치한 기구.' },
        { label: '신진 사대부', def: '성리학을 바탕으로 개혁을 추구한 세력.' },
        { label: '정동행성이문소', def: '정동행성에 속한 관청. 원과 관련된 범죄를 담당하였으며 점차 친원 세력의 이익을 대변하였다.' },
        { label: '신돈', def: '공민왕에게 등용되어 전민변정도감을 이끈 승려 출신 인물.' }
      ],
      timeline: [
        { y: 1351, label: '공민왕 즉위' },
        { y: 1356, label: '◆ 친원 세력 숙청, 쌍성총관부 탈환' },
        { y: 1366, label: '전민변정도감 설치' },
        { y: 1374, label: '공민왕 피살 — 개혁 중단' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goryeo', 'k-gr-yuan', 'k-gr-decline']
  },
  'k-gr-decline': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '고려의 쇠퇴 — 공민왕의 개혁은 홍건적과 왜구의 침입, 권문세족의 반발 등으로 큰 성과를 거두지 못하였고, 공민왕이 살해되면서 중단되었다. 개혁 과정에서 성리학을 바탕으로 토지 문제와 불교의 폐단을 비판한 신진 사대부가 성장하였고, 홍건적과 왜구를 토벌하는 과정에서 이성계 등 신흥 무인 세력이 성장하였다. 명이 쌍성총관부 지역을 직접 다스리겠다고 하자 고려는 요동 정벌을 추진하였으나, 이성계가 위화도에서 군대를 돌려 권력을 장악하였다(1388). 이성계와 신진 사대부는 과전법을 시행하고(1391), 새 왕조를 세웠다(1392). 신진 사대부는 성균관에서 성리학 교육을 강화하고, 토지 제도를 개혁하며, 불교의 문제점을 바로잡고, 명과 친선 관계를 맺어야 한다고 주장하였다. 특히 정도전은 『불씨잡변』을 저술하여 불교의 교리를 비판하였다. 14세기에 원이 쇠퇴하고 명이 건국되자 고려는 명과 외교 관계를 맺었으나, 명이 고려를 압박해 오자 친원 정책과 친명 정책을 두고 논쟁이 일어났다. 신진 사대부는 고려 왕조를 유지하며 개혁을 추진하려 한 정몽주 등의 온건 개혁파와 새로운 왕조를 세워야 한다는 정도전 등의 급진 개혁파로 나뉘었고, 급진 개혁파는 정몽주 등을 제거한 뒤 이성계를 왕으로 추대하였다.',
      terms: [
        { label: '홍건적·왜구', def: '고려 말 고려를 침입한 한족 반란군과 일본 해적.' },
        { label: '신흥 무인 세력', def: '홍건적과 왜구를 토벌하며 성장한 이성계 등의 세력.' },
        { label: '위화도 회군', def: '1388년 이성계가 요동 정벌에 반대하여 군대를 돌려 개경으로 돌아온 일.' },
        { label: '온건 개혁파·급진 개혁파', def: '신진 사대부의 두 갈래. 온건 개혁파(정몽주 등)는 고려 왕조를 유지한 개혁을, 급진 개혁파(정도전 등)는 새 왕조 건국을 주장하였다.' },
        { label: '과전법', def: '이성계와 신진 사대부가 시행한 토지 제도 개혁. 신진 관료의 경제적 기반을 마련하였다.' }
      ],
      timeline: [
        { y: 1368, label: '명 건국' },
        { y: 1374, label: '공민왕 피살' },
        { y: 1388, label: '◆ 위화도 회군' },
        { y: 1391, label: '과전법 시행' },
        { y: 1392, label: '조선 건국' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-goryeo', 'k-gr-gongmin', 'k-js-taejo', 'k-goryeo-fall']
  },
  'k-js-taejo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '태조 — 위화도 회군(1388)으로 권력을 장악한 이성계와 신진 사대부는 과전법을 시행하여 토지 제도를 개혁하였다. 정몽주 등 온건 개혁파를 제거한 정도전 등 급진 개혁파가 이성계를 왕으로 추대하여 새 왕조를 세웠다(1392). 이성계(태조)는 나라 이름을 ‘조선’이라 하고 한양으로 수도를 옮겼다(1394). 태조 때 정도전은 성리학 이념을 바탕으로 통치 체제를 정비하였으며, 재상을 중심으로 하는 정치를 주장하였다.',
      terms: [
        { label: '과전법', def: '권세가의 토지를 몰수하고 관리와 국가 기관에 수조권을 나누어 준 제도.' },
        { label: '한양', def: '유교 사상을 바탕으로 건설된 조선의 수도. 경복궁 좌우에 종묘와 사직을 두었다.' }
      ],
      timeline: [
        { y: 1388, label: '위화도 회군' },
        { y: 1392, label: '◆ 조선 건국' },
        { y: 1394, label: '한양 천도' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-gr-decline', 'k-js-taejong']
  },
  'k-js-taejong': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '태종 — 재상 중심 정치를 주장한 정도전을 이방원이 제거하고 왕위에 올랐다(태종). 태종은 6조가 맡은 일을 의정부를 거치지 않고 왕에게 직접 보고하게 하는 6조 직계제를 실시하여, 왕을 중심으로 통치 체제를 정비하였다.',
      terms: [
        { label: '6조 직계제', def: '6조가 의정부를 거치지 않고 왕에게 직접 보고하고 명령을 받는 제도.' }
      ],
      timeline: [
        { y: 1400, label: '◆ 태종 즉위' },
        { y: 1418, label: '태종 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-taejo', 'k-js-sejong']
  },
  'k-js-sejong': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '세종 — 세종은 6조의 일을 의정부가 먼저 논의하여 왕의 허가를 받게 하는 의정부 서사제를 실시하여 왕권과 신권의 조화를 꾀하였다. 그리고 궁궐 안에 집현전을 두고 유교 의례를 정비하는 등 유교 정치를 실현하려 하였다. 훈민정음을 창제하였다(1443).',
      terms: [
        { label: '의정부 서사제', def: '6조의 일을 의정부가 먼저 논의하여 왕에게 올리는 제도. 다만 관리 임명·군사 업무 등은 6조가 직접 보고하였다.' },
        { label: '집현전', def: '세종이 궁궐 안에 둔 학문 연구 기관.' },
        { label: '훈민정음', def: '1443년 세종이 창제한 문자.' }
      ],
      timeline: [
        { y: 1418, label: '세종 즉위' },
        { y: 1443, label: '◆ 훈민정음 창제' },
        { y: 1450, label: '세종 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-taejong', 'k-js-sejo']
  },
  'k-js-sejo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '세조 — 세조는 단종의 왕위를 빼앗고 즉위하였으며, 이때 공을 세운 세력이 훈구가 되었다. 세조 때 조선의 성문 법전인 『경국대전』의 편찬이 시작되었다. 또한 현직 관리에게만 수조권을 지급하는 직전법을 실시하였다(1466).',
      terms: [
        { label: '훈구', def: '세조가 왕위에 오르는 데 공을 세운 세력.' },
        { label: '직전법', def: '현직 관리에게만 수조권을 지급한 제도.' },
        { label: '『경국대전』', def: '세조 때 편찬을 시작해 성종 때 완성·반포한 조선의 성문 법전.' }
      ],
      timeline: [
        { y: 1455, label: '◆ 세조 즉위' },
        { y: 1466, label: '직전법 실시' },
        { y: 1468, label: '세조 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-sejong', 'k-js-seongjong', 'k-js-hungu-sarim']
  },
  'k-js-seongjong': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '성종 — 성종 때 『경국대전』이 반포되면서(1485) 성문법에 바탕을 둔 통치 체제가 확립되었다. 『경국대전』은 이전·호전·예전·병전·형전·공전의 6전 체제로 구성되었다. 또한 성종은 김종직 등 사림을 등용하여 권력을 독점하던 훈구를 견제하였다.',
      terms: [
        { label: '『경국대전』', def: '조선의 성문 법전. 6전 체제로 구성되었다.' },
        { label: '사림', def: '정몽주·길재의 학통을 이은 지방 사족. 왕도 정치와 향촌 자치를 추구하였다.' }
      ],
      timeline: [
        { y: 1469, label: '성종 즉위' },
        { y: 1485, label: '◆ 『경국대전』 반포' },
        { y: 1494, label: '성종 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-sejo', 'k-js-hungu-sarim']
  },
  'k-js-hungu-sarim': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '훈구와 사림의 대립 — 15세기 중엽 세조의 즉위에 공을 세운 훈구가 정치권력을 장악하여 주요 관직을 독점하고 토지와 노비를 늘렸다. 이에 성종은 김종직 등 사림을 등용하여 훈구를 견제하였다. 사림은 조선 건국에 반대했던 정몽주, 길재 등의 학통을 이어받은 지방 사족으로, 왕도 정치와 향촌 자치를 추구하였고 주로 3사에 배치되어 훈구의 부정과 비리를 비판하였다. 이 대립은 이후 여러 차례의 사화로 이어졌다.',
      terms: [
        { label: '훈구', def: '세조가 왕위에 오르는 데 공을 세운 세력.' },
        { label: '사림', def: '성리학 연구와 교육에 힘쓴 지방 사족.' },
        { label: '왕도 정치', def: '왕이 인격을 수양하고 신하와 협력하여 나라를 다스리는 정치.' }
      ],
      timeline: [
        { y: 1469, label: '성종 즉위, 사림 등용' },
        { y: 1498, label: '무오사화' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-seongjong', 'k-js-muo']
  },
  'k-js-muo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '무오사화 — 연산군이 즉위한 뒤 훈구는 자신들을 비판하던 사림을 공격하였고, 사림을 못마땅하게 여긴 연산군도 이에 동조하였다. 김일손이 사초에 스승 김종직의 「조의제문」을 실은 것이 구실이 되어 사림 세력이 제거되었다(1498).',
      terms: [
        { label: '사화', def: '사림이 입은 화.' },
        { label: '「조의제문」', def: '김종직이 지은 글. 세조의 왕위 찬탈을 비판한 것으로 여겨져 사화의 구실이 되었다.' }
      ],
      timeline: [
        { y: 1498, label: '◆ 무오사화' },
        { y: 1504, label: '갑자사화' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-hungu-sarim', 'k-js-gapja']
  },
  'k-js-gapja': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '갑자사화 — 연산군 때에는 두 차례의 사화가 일어나 사림이 큰 피해를 입었다. 무오사화(1498)에 이어 갑자사화(1504)가 일어났다. 이후 중종반정으로 연산군이 쫓겨나고 중종이 즉위하였다(1506).',
      terms: [
        { label: '중종반정', def: '1506년 연산군을 몰아내고 중종을 세운 일.' }
      ],
      timeline: [
        { y: 1498, label: '무오사화' },
        { y: 1504, label: '◆ 갑자사화' },
        { y: 1506, label: '중종반정' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-muo', 'k-js-gimyo']
  },
  'k-js-gimyo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '기묘사화 — 중종반정으로 공을 세운 신하들의 권력이 커지자 중종은 조광조 등 사림을 등용해 견제하려 하였다. 조광조는 유교적 도덕 정치를 위해 현량과를 실시하여 사림을 등용하고, 중종반정 공신 중 자격이 없는 사람의 공신 칭호를 박탈할 것을 주장하였다. 공신들이 반발하고 중종도 급격한 개혁에 부담을 느끼면서 다시 사화가 일어나 조광조 등 많은 사림이 제거되었다(1519).',
      terms: [
        { label: '현량과', def: '학문과 행실이 뛰어난 인재를 추천받아 간단한 시험으로 등용하는 제도.' },
        { label: '조광조', def: '중종 때 유교적 도덕 정치를 위한 개혁을 추진한 사림.' }
      ],
      timeline: [
        { y: 1506, label: '중종반정' },
        { y: 1519, label: '◆ 현량과 실시, 기묘사화' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-gapja', 'k-js-eulsa']
  },
  'k-js-eulsa': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '을사사화 — 명종 때에도 외척 사이의 다툼에 휘말려 사림이 피해를 입었다(1545). 사림은 사화로 큰 피해를 입었지만 서원과 향약을 기반으로 향촌 사회에서 꾸준히 세력을 키워, 선조 때부터 중앙 정치를 이끌게 되었다.',
      terms: [
        { label: '외척', def: '왕의 외가 친척.' },
        { label: '서원·향약', def: '사림이 향촌에서 세력을 키운 기반.' }
      ],
      timeline: [
        { y: 1545, label: '◆ 을사사화' },
        { y: 1567, label: '선조 즉위' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-gimyo']
  },
  'k-js-imjin': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '임진왜란 — 16세기 후반 일본을 통일한 도요토미 히데요시가 조선을 침략하였다(1592). 전쟁 초반 조선군은 조총을 앞세운 일본군에 잇따라 패하여 한성을 빼앗겼고, 선조는 의주까지 피란하여 명에 지원군을 요청하였다. 바다에서는 이순신이 이끄는 수군이 한산도 등에서 여러 차례 승리하였고, 전국에서 의병이 일어나 일본군에 큰 타격을 주었다. 관군도 명의 지원군과 함께 평양성을 탈환하였다. 이후 일본군이 남해안으로 밀려나 휴전 회담을 제안하였다.',
      terms: [
        { label: '의병', def: '전직 관리·유학자·승려 등이 이끈 민간의 군대.' },
        { label: '한산도 대첩', def: '이순신이 이끄는 조선 수군이 한산도에서 일본 수군을 격파한 싸움.' }
      ],
      timeline: [
        { y: 1592, label: '◆ 임진왜란' },
        { y: 1597, label: '정유재란' },
        { y: 1598, label: '전쟁 종결' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-jeongyu', 'k-js-gwanghae']
  },
  'k-js-jeongyu': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '정유재란 — 임진왜란 중 3년에 걸친 휴전 협상이 결렬되자 일본군은 다시 조선을 침입하였다(1597). 조선군은 각지에서 일본군을 물리쳤고, 전세가 불리해진 일본군은 도요토미 히데요시가 죽자 물러나 7년에 걸친 전쟁이 끝났다(1598). 조선은 국토가 황폐해지고 수많은 사람이 희생되었으며, 만주에서는 여진이 성장하고 일본에서는 에도 막부가 세워졌다.',
      terms: [
        { label: '명량 대첩', def: '정유재란 때 이순신이 명량에서 일본 수군을 물리친 싸움.' }
      ],
      timeline: [
        { y: 1597, label: '◆ 정유재란' },
        { y: 1598, label: '일본군 철수, 전쟁 종결' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-imjin', 'k-js-gwanghae']
  },
  'k-js-gwanghae': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '광해군 — 선조의 뒤를 이은 광해군은 왜란의 피해를 극복하기 위해 토지 대장과 호적을 정비하여 국가 재정을 확충하고, 성곽을 수리하는 등 국방을 강화하였다. 만주에서 여진이 후금을 세우고 명과 대립하자, 광해군은 후금과의 충돌을 피하려 명과 후금 사이에서 중립 외교를 펼쳤다. 그러나 서인은 광해군의 중립 외교와 정치를 비판하며 광해군을 몰아내고 인조를 왕으로 세웠다(인조반정, 1623).',
      terms: [
        { label: '중립 외교', def: '명과 후금 사이에서 충돌을 피하려 한 광해군의 외교.' },
        { label: '인조반정', def: '1623년 서인이 광해군을 몰아내고 인조를 세운 일.' }
      ],
      timeline: [
        { y: 1608, label: '광해군 즉위' },
        { y: 1623, label: '◆ 인조반정' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-jeongyu', 'k-js-jeongmyo']
  },
  'k-js-jeongmyo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '정묘호란 — 인조가 즉위한 뒤 조선은 명과의 의리를 강조하며 후금과 거리를 두었다. 후금은 가도에 주둔한 명군을 제거하고 후방을 안정시키려 조선을 침략하였다(1627). 인조는 강화도로 피란하였고 관군과 의병이 각지에서 저항하였다. 명과 대립하여 전쟁을 오래 끌 수 없었던 후금은 조선과 형제 관계를 맺고 돌아갔다.',
      terms: [
        { label: '형제 관계', def: '정묘호란 뒤 후금과 맺은 관계.' }
      ],
      timeline: [
        { y: 1623, label: '인조반정' },
        { y: 1627, label: '◆ 정묘호란' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-gwanghae', 'k-js-byeongja']
  },
  'k-js-byeongja': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '병자호란 — 세력을 키운 후금은 나라 이름을 청으로 바꾸고 조선에 군신 관계를 강요하였다. 조선 조정은 척화론과 주화론으로 나뉘어 대립하였고, 척화론이 우세한 상황에서 조선이 요구를 거부하자 청이 다시 침략하였다(1636). 인조는 남한산성으로 피신하여 청에 맞섰지만 결국 청에 굴복하고 군신 관계를 맺었다.',
      terms: [
        { label: '척화론', def: '청과의 화의를 반대하고 명과의 의리를 지키자는 주장.' },
        { label: '주화론', def: '청의 요구를 받아들여 전쟁을 피하자는 주장(최명길).' }
      ],
      timeline: [
        { y: 1627, label: '정묘호란' },
        { y: 1636, label: '◆ 병자호란' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-jeongmyo']
  },
  'k-js-yesong': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '예송 — 붕당 정치는 현종 때 두 차례의 예송이 일어나면서 점차 변질되기 시작하였다. 예송은 효종과 효종의 왕비가 죽은 뒤 효종의 새어머니가 얼마 동안 상복을 입느냐로 시작해 효종의 정통성과 연계된 논쟁으로 발전하였다. 이 과정에서 붕당 사이의 대립이 심해졌다.',
      terms: [
        { label: '붕당', def: '선조 때 사림이 동인과 서인으로 나뉘면서 등장한 정치 집단.' },
        { label: '예송', def: '상복을 입는 기간을 둘러싼 논쟁.' }
      ],
      timeline: [
        { y: 1659, label: '◆ 첫 번째 예송' },
        { y: 1674, label: '두 번째 예송' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-hwanguk']
  },
  'k-js-hwanguk': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '환국 — 숙종은 붕당을 누르고 왕권을 강화하려 집권 붕당을 바꾸는 환국을 여러 차례 일으켰다. 환국으로 왕권은 일시적으로 강화되었지만, 붕당 정치의 공존 원칙은 무너졌다. 각 붕당은 상대 붕당을 인정하지 않고 권력을 독점하려 하였으며, 정권을 잡으면 상대 붕당을 탄압하였다. 붕당 간의 대립이 왕위 계승에까지 번지자 숙종 말에는 탕평론이 제기되었다.',
      terms: [
        { label: '환국', def: '집권 붕당을 바꾸는 일.' },
        { label: '탕평론', def: '붕당 사이의 치우침 없는 정치를 하자는 주장.' }
      ],
      timeline: [
        { y: 1674, label: '숙종 즉위' },
        { y: 1680, label: '◆ 환국' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-yesong', 'k-js-yeongjo']
  },
  'k-js-yeongjo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '영조 — 영조 때 본격적으로 탕평책이 시행되었다. 영조는 탕평책에 반대하는 관료를 파면하고 탕평파를 육성하여 자신의 탕평책을 따르는 사람들을 중심으로 정치를 운영하였으며, 성균관 앞에 탕평비를 세워 탕평의 의지를 알렸다. 붕당을 없애기 위해 붕당에 영향력을 행사하던 산림의 존재를 부정하고, 붕당의 지지 기반인 서원의 숫자도 줄였다.',
      terms: [
        { label: '탕평책', def: '붕당 사이의 치우침 없는 정치를 위한 정책.' },
        { label: '탕평비', def: '영조가 성균관 앞에 세운 비석.' },
        { label: '산림', def: '학문과 덕이 높지만 벼슬하지 않은 선비. 지방 사족의 여론을 이끌었다.' }
      ],
      timeline: [
        { y: 1724, label: '◆ 영조 즉위' },
        { y: 1776, label: '영조 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-hwanguk', 'k-js-jeongjo']
  },
  'k-js-jeongjo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '정조 — 영조를 이어 즉위한 정조는 노론뿐 아니라 그동안 소외되었던 남인과 소론을 포용하는 적극적인 탕평책을 펼쳤다. 규장각을 확대하고 젊고 유능한 인재를 다시 교육하는 초계문신제를 실시하여 지지 세력을 키웠으며, 서얼 등용도 확대하였다. 친위 부대인 장용영을 설치해 군사적 기반을 강화하고, 신도시 수원 화성을 건설해 개혁 정치의 중심지로 삼으려 하였다. 그러나 왕과 그 주변 세력에게 권력이 집중되면서 정조가 죽은 뒤 세도 정치가 나타나는 배경이 되기도 하였다.',
      terms: [
        { label: '규장각', def: '정조가 확대한 학문·정책 연구 기관.' },
        { label: '초계문신제', def: '젊고 유능한 인재를 선발하여 규장각에서 다시 교육한 제도.' },
        { label: '장용영', def: '정조가 설치한 친위 부대.' }
      ],
      timeline: [
        { y: 1776, label: '◆ 정조 즉위' },
        { y: 1800, label: '정조 재위 끝' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-yeongjo', 'k-js-sedo']
  },
  'k-js-sedo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1',
    overview: {
      summary: '세도 정치 시기 — 정조가 죽은 뒤 순조가 어린 나이로 즉위하자 순조의 장인 김조순을 중심으로 하는 안동 김씨가 권력을 장악하였다. 이후 철종 때까지 60여 년간 소수의 가문이 권력을 독점하는 세도 정치가 전개되었다. 세도 가문은 비변사와 5군영을 장악하였고, 왕권이 크게 약화되었으며 3사도 견제 기능을 잃었다. 과거 시험이 공정함을 잃고 관직을 사고파는 일이 많아졌으며, 수령과 아전이 과도하게 세금을 거두면서 삼정이 문란해졌다. 이에 홍경래의 난(1811), 임술 농민 봉기(1862) 등 농민 봉기가 일어났다.',
      terms: [
        { label: '세도 정치', def: '소수의 가문이 권력을 독점한 정치.' },
        { label: '삼정', def: '전정(토지세)·군정(군포)·환정(환곡).' }
      ],
      timeline: [
        { y: 1800, label: '◆ 순조 즉위' },
        { y: 1811, label: '홍경래의 난' },
        { y: 1862, label: '임술 농민 봉기' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-js-jeongjo', 'k-imsul']
  },
  'k-unify': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '통일신라 — 문무왕이 매소성·기벌포 전투에서 당군을 몰아내고 676년 대동강 이남을 통일하였다. 신문왕은 김흠돌의 난을 진압하고 9주 5소경을 설치하였으며, 관료전을 지급하고 녹읍을 폐지하여 왕권을 강화하였다. 8세기 후반 진골 귀족의 왕위 다툼으로 혼란에 빠졌고 지방에서 호족이 성장하였다. 후백제와 후고구려가 세워져 후삼국 시대가 열렸고, 935년 경순왕이 고려에 항복하여 멸망하였다. 삼국 통일 이후 신라는 여러 제도를 정비하여 넓어진 영토와 늘어난 인구를 효과적으로 통치하려 하였다. 왕의 직속 기구인 집사부를 중심으로 정치를 운영하여 집사부의 장관인 중시(시중)의 위상이 높아졌고, 귀족 합의 기구인 화백의 위상은 낮아졌다. 신문왕은 유학 교육 기관인 국학을 세워 왕을 보좌할 관리를 길렀다. 지방은 신라와 옛 고구려·백제 땅에 각각 3주를 설치하여 9주로 편성하고, 수도 금성(경주)이 동남쪽에 치우친 약점을 보완하려 5소경을 두었다. 촌주 등 지방 토착 세력을 일정 기간 수도에 올라와 근무하게 하는 상수리 제도를 시행하였으며, 군사 조직은 9서당과 10정을 중심으로 정비하였다.',
      terms: [
        { label: '9주 5소경', def: '신문왕이 정비한 통일신라의 지방 행정 조직.' },
        { label: '관료전·녹읍', def: '관리에게 준 토지(관료전)와 귀족이 백성까지 지배한 토지(녹읍). 신문왕은 녹읍을 폐지하였다.' },
        { label: '집사부', def: '왕의 직속 기구. 통일 이후 신라 정치 운영의 중심이 되었다.' },
        { label: '김흠돌의 난', def: '신문왕의 장인 김흠돌이 귀족들과 함께 반역을 꾸민 사건. 신문왕은 많은 귀족을 숙청하고 강력한 왕권을 확립하였다.' },
        { label: '상수리 제도', def: '촌주 등 지방 토착 세력을 일정 기간 수도에 올라와 근무하게 한 제도.' },
        { label: '9서당 10정', def: '통일 신라의 군사 조직. 중앙군인 9서당에는 신라인뿐 아니라 고구려·백제 유민 등도 편성되었다.' }
      ],
      timeline: [
        { y: 676, label: '◆ 삼국 통일' },
        { y: 681, label: '김흠돌의 난' },
        { y: 682, label: '국학 설립' },
        { y: 687, label: '관료전 지급' },
        { y: 689, label: '녹읍 폐지' },
        { y: 788, label: '독서삼품과 실시' },
        { y: 900, label: '견훤, 후백제 건국' },
        { y: 901, label: '궁예, 후고구려 건국' },
        { y: 935, label: '신라 멸망 — 경순왕, 고려에 항복' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-silla', 'k-balhae', 'k-goryeo', 'e-tang']
  },
  'k-goryeo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '고려 — 송악의 호족 출신 왕건이 918년 건국하고, 936년 후삼국을 통일하였다. 광종은 노비안검법(956)과 과거제(958)로 왕권을 강화하였고, 성종은 12목(983)을 설치하여 지방관을 파견하였다. 거란의 침입을 서희의 외교 담판(993)과 강감찬의 귀주 대첩(1019)으로 막아 냈다. 이자겸의 난(1126)과 묘청의 난(1135)으로 문벌 귀족 사회가 흔들렸고, 1170년 무신 정변으로 무신 정권이 성립하였다. 몽골의 침입(1231)에 강화도로 천도하여 항전하고 팔만대장경을 새겼으며, 개경 환도(1270) 후 삼별초가 항쟁하였다. 공민왕이 반원 개혁(1356)을 추진하였으나, 위화도 회군(1388)으로 권력을 잡은 이성계 세력이 1392년 조선을 세웠다. 고려는 건국 초부터 여러 나라와 활발히 교류하였다. 송과 적극적으로 교류하면서 다양한 문물을 받아들였으며 거란, 여진, 일본 등과도 교류하였고, 아라비아 상인도 고려에 찾아와 예성강 하류의 벽란도가 국제 무역항으로 번영하였다. 몽골과 강화한 뒤에는 독립국의 지위를 유지하였지만 몽골(원) 중심의 국제 질서에 편입되어, 고려 왕이 원의 공주와 결혼하면서 원의 부마국이 되었다. 원과의 교류가 활발해지면서 원의 복식과 언어가 고려에서 유행하였고(몽골풍), 원의 지배층 사이에서는 고려의 풍습이 유행하기도 하였다(고려양).',
      terms: [
        { label: '노비안검법', def: '억울하게 노비가 된 사람을 양인으로 되돌린 광종의 법(956).' },
        { label: '무신 정변', def: '무신들이 정변을 일으켜 정권을 장악한 사건(1170).' },
        { label: '팔만대장경', def: '몽골의 침입을 부처의 힘으로 물리치려 새긴 대장경.' },
        { label: '삼별초', def: '개경 환도에 반발하여 진도·탐라로 옮겨 가며 몽골에 항쟁한 부대.' },
        { label: '벽란도', def: '예성강 하류의 국제 무역항. 송, 아라비아 상인 등이 찾아왔다.' },
        { label: '몽골풍·고려양', def: '원 간섭기에 고려에서 유행한 원의 복식과 언어(몽골풍), 원의 지배층 사이에서 유행한 고려의 풍습(고려양).' },
        { label: '만월대', def: '개성에 있는 고려의 궁궐터. 남과 북은 2007년부터 여러 차례 발굴 조사를 진행하였다.' }
      ],
      timeline: [
        { y: 918, label: '◆ 고려 건국' },
        { y: 936, label: '후삼국 통일' },
        { y: 956, label: '노비안검법' },
        { y: 958, label: '과거제 실시' },
        { y: 983, label: '12목 설치' },
        { y: 993, label: '거란의 1차 침입' },
        { y: 1019, label: '귀주 대첩' },
        { y: 1126, label: '이자겸의 난' },
        { y: 1135, label: '묘청의 난' },
        { y: 1170, label: '무신 정변' },
        { y: 1198, label: '만적의 난' },
        { y: 1231, label: '몽골의 침입' },
        { y: 1232, label: '강화 천도' },
        { y: 1251, label: '팔만대장경 완성' },
        { y: 1270, label: '개경 환도·삼별초 항쟁' },
        { y: 1356, label: '공민왕의 반원 개혁' },
        { y: 1388, label: '위화도 회군' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-unify', 'k-joseon', 'e-song', 'e-liao', 'e-jin-jurchen', 'e-mongol', 'e-yuan']
  },
  'k-daewongun': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '흥선 대원군 집권 — 1863년 고종이 즉위하자 아버지 흥선 대원군이 집권하였다. 세도 정치를 바로잡고자 비변사를 축소·폐지하고 의정부와 삼군부의 기능을 되살렸으며 『대전회통』을 편찬하였다. 서원을 정리하고 호포제와 사창제를 실시하였다. 경복궁을 중건하면서 원납전을 거두고 당백전을 발행하여 백성의 불만을 샀다. 병인양요(1866)와 신미양요(1871)를 겪은 뒤 전국에 척화비를 세워 통상 수교 거부 정책을 강화하였다.',
      terms: [
        { label: '호포제', def: '양반에게도 군포를 거둔 제도.' },
        { label: '당백전', def: '경복궁 중건 비용을 마련하려 발행한 고액 화폐.' },
        { label: '척화비', def: '서양과의 통상 수교 거부 의지를 새긴 비석.' }
      ],
      timeline: [
        { y: 1863, label: '◆ 흥선 대원군 집권' },
        { y: 1866, label: '병인양요' },
        { y: 1871, label: '신미양요·척화비 건립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-imsul', 'k-sinmi', 'k-ganghwa-treaty', 'k-joseon']
  },
  'k-imsul': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '임술 농민 봉기 — 19세기 세도 정치 아래 삼정의 문란이 심해지자, 1862년(임술년) 경상도 단성과 진주를 시작으로 전국에서 농민들이 봉기하였다. 경상도·전라도·충청도를 중심으로 수십 곳에서 봉기가 일어났다. 정부는 박규수를 파견하여 수습하게 하고 삼정이정청을 설치하였다.',
      terms: [
        { label: '삼정', def: '전정·군정·환곡. 세도 정치기에 문란이 심해졌다.' },
        { label: '삼정이정청', def: '삼정의 문란을 바로잡으려 설치한 기구.' }
      ],
      timeline: [
        { y: 1811, label: '홍경래의 난' },
        { y: 1862, label: '◆ 임술 농민 봉기' },
        { y: 1863, label: '흥선 대원군 집권' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-joseon', 'k-daewongun', 'k-donghak']
  },
  'k-sinmi': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '신미양요 — 1866년 미국의 무장 상선 제너럴 셔먼호가 대동강을 따라 평양까지 올라와 교역을 요구하며 행패를 부리다 불태워졌다. 이를 구실로 1871년 미국 함대가 강화도를 침략하였다. 어재연이 이끈 조선군이 광성보에서 항전하였고, 미군은 물러났다. 흥선 대원군은 전국에 척화비를 세웠다.',
      terms: [
        { label: '제너럴 셔먼호 사건', def: '미국 상선이 평양에서 불태워진 사건(1866).' },
        { label: '광성보', def: '어재연이 미군에 맞서 싸운 강화도의 요새.' }
      ],
      timeline: [
        { y: 1866, label: '제너럴 셔먼호 사건·병인양요' },
        { y: 1871, label: '◆ 신미양요' },
        { y: 1876, label: '강화도 조약' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-daewongun', 'k-ganghwa-treaty', 'w-civilwar']
  },
  'k-imo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '임오군란 — 개화 정책으로 신식 군대인 별기군이 우대받는 반면 구식 군인은 13개월이나 급료를 받지 못하였다. 1882년 구식 군인들이 봉기하였고 도시 빈민도 합세하여 일본 공사관을 습격하였다. 흥선 대원군이 다시 집권하였으나 청군이 군란을 진압하고 대원군을 청으로 데려갔다. 이후 청은 조선의 내정에 간섭하고 조·청 상민 수륙 무역 장정을 맺었으며, 일본과는 제물포 조약을 맺었다.',
      terms: [
        { label: '별기군', def: '개화 정책으로 만든 신식 군대.' },
        { label: '제물포 조약', def: '임오군란 후 조선이 일본과 맺은 조약.' },
        { label: '조·청 상민 수륙 무역 장정', def: '청 상인의 내륙 통상을 허용한 조약.' }
      ],
      timeline: [
        { y: 1876, label: '강화도 조약' },
        { y: 1882, label: '◆ 임오군란' },
        { y: 1884, label: '갑신정변' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-ganghwa-treaty', 'k-gapsin', 'k-daewongun', 'e-yangwu']
  },
  'k-gapsin': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '갑신정변 — 청의 내정 간섭에 반발한 김옥균·박영효 등 급진 개화파가 일본의 지원을 약속받고 1884년 우정총국 개국 축하연에서 정변을 일으켰다. 개화당 정부는 청과의 사대 관계 폐지 등을 담은 개혁 정강을 발표하였으나, 청군의 개입으로 실패하였다. 이후 조선은 일본과 한성 조약을, 청과 일본은 톈진 조약을 맺었다.',
      terms: [
        { label: '급진 개화파', def: '김옥균·박영효 등 일본의 메이지 유신을 모델로 빠른 개혁을 추구한 세력.' },
        { label: '우정총국', def: '근대적 우편 업무를 맡은 관청. 정변이 일어난 곳.' }
      ],
      timeline: [
        { y: 1882, label: '임오군란' },
        { y: 1884, label: '◆ 갑신정변' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-imo', 'k-donghak-rev', 'e-meiji']
  },
  'k-gabo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '갑오개혁 — 1894년 경복궁을 점령한 일본의 간섭 속에 군국기무처가 설치되어 과거제 폐지 등 개혁을 추진하였다(제1차 갑오개혁). 신분제를 폐지하였다. 제2차 개혁에서는 홍범 14조를 반포하고 재판소를 설치하였다. 을미사변(1895) 이후 을미개혁으로 단발령과 태양력 사용 등을 실시하였다.',
      terms: [
        { label: '군국기무처', def: '제1차 갑오개혁을 추진한 기구.' },
        { label: '홍범 14조', def: '제2차 갑오개혁 때 반포한 개혁 강령.' },
        { label: '단발령', def: '을미개혁 때 상투를 자르게 한 명령.' }
      ],
      timeline: [
        { y: 1894, label: '◆ 제1차 갑오개혁' },
        { y: 1895, label: '을미사변·을미개혁' },
        { y: 1896, label: '아관 파천' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-donghak-rev', 'k-agwan', 'e-sino-jp']
  },
  'k-donghak-rev': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '동학 농민 운동 — 고부 군수 조병갑의 횡포에 맞서 전봉준 등이 농민 봉기를 일으켰다(1894). 동학 농민군은 ‘제폭구민’, ‘보국안민’을 내걸고 황토현·황룡촌 전투에서 승리하고 전주성을 점령하였다. 청·일 양국 군대가 들어오자 정부와 전주 화약을 맺고 집강소를 설치하여 개혁을 추진하였다. 일본이 경복궁을 점령하고 청일 전쟁을 일으키자 다시 봉기하였으나 우금치 전투에서 패하였다.',
      terms: [
        { label: '전주 화약', def: '동학 농민군이 정부와 맺은 화약.' },
        { label: '집강소', def: '동학 농민군이 전라도 일대에 설치한 개혁 기구.' },
        { label: '우금치 전투', def: '동학 농민군이 일본군·관군에 패한 전투.' }
      ],
      timeline: [
        { y: 1894, label: '◆ 동학 농민 운동' },
        { y: 1894, label: '갑오개혁·청일 전쟁' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-donghak', 'k-gabo', 'e-sino-jp']
  },
  'k-agwan': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '아관 파천 — 을미사변(1895)으로 명성 황후가 시해되고 단발령이 내려지자 을미의병이 일어났다. 1896년 고종은 러시아 공사관으로 거처를 옮겼다. 이후 러시아의 내정 간섭이 심해지고 열강의 이권 침탈이 본격화하였다. 고종은 1897년 경운궁으로 돌아와 대한 제국을 선포하였다.',
      terms: [
        { label: '을미사변', def: '일본이 명성 황후를 시해한 사건(1895).' },
        { label: '을미의병', def: '을미사변과 단발령에 반발하여 일어난 의병.' }
      ],
      timeline: [
        { y: 1895, label: '을미사변' },
        { y: 1896, label: '◆ 아관 파천' },
        { y: 1897, label: '대한 제국 수립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gabo', 'k-korean-empire']
  },
  'k-eulsa': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '을사늑약 — 러일 전쟁에서 승리한 일본은 1905년 이토 히로부미를 보내 위협 속에 을사늑약을 강제로 체결하였다. 대한 제국의 외교권이 박탈되고 통감부가 설치되었다. 장지연은 「시일야방성대곡」을 발표하였고 민영환은 자결로 항거하였으며, 을사의병이 일어났다. 고종은 조약의 무효를 알리려 헤이그 특사를 파견하였다(1907).',
      terms: [
        { label: '통감부', def: '을사늑약 이후 일본이 설치한 통치 기구.' },
        { label: '헤이그 특사', def: '을사늑약의 무효를 알리려 만국 평화 회의에 보낸 특사(1907).' }
      ],
      timeline: [
        { y: 1904, label: '러일 전쟁' },
        { y: 1905, label: '◆ 을사늑약' },
        { y: 1907, label: '헤이그 특사' },
        { y: 1910, label: '국권 피탈' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-russo-japan', 'k-gukchae', 'k-annexation']
  },
  'k-gukchae': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '국채 보상 운동 — 일본은 차관을 들여와 대한 제국을 경제적으로 예속시키려 하였다. 1907년 대구에서 서상돈 등이 일본에 진 나랏빚 1,300만 원을 국민의 힘으로 갚자며 국채 보상 운동을 시작하였다. 대한매일신보 등 언론이 지원하고 여성들도 패물을 내놓는 등 전국으로 확산되었으나, 통감부의 탄압으로 중단되었다.',
      terms: [
        { label: '국채 보상 운동', def: '일본에 진 빚을 국민 모금으로 갚으려 한 경제 구국 운동.' }
      ],
      timeline: [
        { y: 1905, label: '을사늑약' },
        { y: 1907, label: '◆ 국채 보상 운동' },
        { y: 1910, label: '국권 피탈' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-eulsa', 'k-annexation']
  },
  'k-singanhoe': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '신간회 결성 — 1920년대 민족주의 세력과 사회주의 세력이 연대해야 한다는 민족 유일당 운동이 일어났다. 1927년 비타협적 민족주의자와 사회주의자가 연합하여 최대 규모의 합법적 민족 협동 전선 단체인 신간회를 결성하였다. 신간회는 전국에 지회를 두고 활동하였으며, 광주 학생 항일 운동 때 진상 조사단을 파견하였다. 1931년 해소되었다.',
      terms: [
        { label: '민족 유일당 운동', def: '민족주의·사회주의 세력의 연대를 추진한 운동.' },
        { label: '민족 협동 전선', def: '이념이 다른 세력이 힘을 합친 연합.' }
      ],
      timeline: [
        { y: 1927, label: '◆ 신간회 결성' },
        { y: 1929, label: '광주 학생 항일 운동' },
        { y: 1931, label: '신간회 해소' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-samil', 'k-gwangju-student', 'k-610', 'k-geunuhoe', 'k-peace-law']
  },
  'k-gwangju-student': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '광주 학생 항일 운동 — 학생들은 독서회 등을 조직하여 식민지 차별 교육 철폐 등을 요구하였다. 1929년 10월 광주에서 출발한 통학 열차가 나주에 도착하였을 때 한·일 학생 사이에 충돌이 일어났고, 일제 경찰은 일방적으로 일본인 학생의 편을 들었다. 이에 광주의 학생들이 시위를 벌였고, 시위는 전국으로 확산되어 3·1 운동 이후 최대 규모의 민족 운동이 되었다. 신간회는 진상 조사단을 파견하였다.',
      terms: [
        { label: '독서회', def: '학생들이 조직한 비밀 결사. 운동 확산에 주도적인 역할을 하였다.' }
      ],
      timeline: [
        { y: 1919, label: '3·1 운동' },
        { y: 1927, label: '신간회 결성' },
        { y: 1929, label: '◆ 광주 학생 항일 운동' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-singanhoe', 'k-samil', 'k-610', 'k-wonsan']
  },
  'k-ganghwa-treaty': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '강화도 조약 — 1873년 흥선 대원군이 물러나고 고종이 직접 정치에 나서면서 통상 수교 거부 정책에 변화의 조짐이 나타났다. 1875년 일본은 조선을 강제로 개항하기 위해 군함 운요호를 강화도에 보내 초지진을 포격하고, 영종도에 상륙하여 살인과 약탈, 방화 등을 저질렀다(운요호 사건). 일본이 문호 개방을 요구하며 무력시위를 벌이자 조선 정부는 논의 끝에 개항을 결정하고 1876년 일본과 강화도 조약(조·일 수호 조규)을 맺었다. 강화도 조약은 조선이 맺은 최초의 근대적 조약이자 불평등 조약으로, 일본에 해안 측량을 허용하고 영사 재판권을 인정하는 등 조선의 주권을 침해하는 내용이 포함되었다. 이에 따라 1880년에 원산, 1883년에 인천이 추가로 개항되었다. 이어 맺은 조·일 수호 조규 부록과 조·일 무역 규칙도 개항장에서 일본 화폐 사용과 곡물의 무제한 유출을 허용하고 관세에 관련된 내용을 담지 않는 등 조선에 불리한 것이었다.',
      terms: [
        { label: '운요호 사건', def: '1875년 일본 군함 운요호가 강화도에 접근해 초지진을 포격하고 영종도에 상륙하여 살인·약탈을 저지른 사건.' },
        { label: '해안 측량권', def: '강화도 조약 7조. 일본이 조선 연해를 자유롭게 측량하고 지도를 제작하도록 허가하여 조선의 영토 주권을 침해하였다.' },
        { label: '영사 재판권', def: '강화도 조약 10조. 개항장에서 조선인에게 죄를 범한 일본인을 일본 관원이 심판하게 하여 조선의 사법 주권을 침해하였다.' },
        { label: '조·일 무역 규칙', def: '강화도 조약 이후 맺은 무역 규정. 양곡의 무제한 수출입, 일본 선박의 항세 면제 등을 담았다.' }
      ],
      timeline: [
        { y: 1873, label: '흥선 대원군이 물러나고 고종이 직접 정치에 나섬' },
        { y: 1875, label: '운요호 사건' },
        { y: 1876, label: '◆ 강화도 조약(조·일 수호 조규)·조·일 무역 규칙' },
        { y: 1880, label: '원산 개항' },
        { y: 1882, label: '조·미 수호 통상 조약' },
        { y: 1883, label: '인천 개항' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-sinmi', 'k-daewongun', 'k-imo', 'k-joseon', 'e-meiji']
  },
  'k-korean-empire': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '대한 제국 수립 — 아관 파천 이후 러시아의 영향력이 강화되자 러시아를 견제해야 한다는 여론이 높아졌고, 독립 협회 등 여러 세력도 고종의 환궁을 요구하였다. 이에 고종은 러시아 공사관에서 경운궁(지금의 덕수궁)으로 돌아왔다. 러시아와 일본의 세력 균형으로 외세의 간섭이 약해진 상황에서 고종은 연호를 ‘광무’로 정하고 환구단에서 황제로 즉위하여 대한 제국 수립을 선포하였다(1897). 이후 정부는 황제권 강화를, 독립 협회는 민권의 확대를 추구하였다. 독립 협회와 만민 공동회를 해산한 고종은 대한국 국제(1899)를 반포하여 대한 제국이 자주독립국이며 황제가 모든 권한을 가진 전제 군주 국가임을 분명히 하였다. 대한 제국은 ‘구본신참’을 기본 방향으로 광무개혁을 추진하여 원수부를 설치해 군사권을 황제에게 집중하고, 양전 사업과 지계 발급 사업을 벌였다.',
      terms: [
        { label: '환구단', def: '하늘에 제사를 지내는 장소. 1897년 10월 12일 고종의 황제 즉위식이 열렸다.' },
        { label: '대한국 국제', def: '1899년 반포. 대한 제국이 자주독립국이며 황제가 육해군 통솔권·입법권·행정권·사법권 등 모든 권한을 가진다고 규정하였다.' },
        { label: '구본신참', def: '옛것(제도 등)을 기본으로 새로운 것(기술 등)을 참고한다는 광무개혁의 방침.' },
        { label: '지계', def: '양전 사업으로 토지 소유자를 조사하여 발급한 근대적 토지 소유 증명서.' }
      ],
      timeline: [
        { y: 1896, label: '아관 파천' },
        { y: 1897, label: '◆ 대한 제국 수립(환구단 황제 즉위)' },
        { y: 1898, label: '독립 협회 해산' },
        { y: 1899, label: '대한국 국제 반포' },
        { y: 1900, label: '대한 제국 칙령 제41호 반포' },
        { y: 1904, label: '러·일 전쟁 발발' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-agwan', 'k-gabo', 'k-russo-japan', 'k-eulsa']
  },
  'k-annexation': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '국권 피탈 — 일본은 헤이그 특사 파견을 구실로 고종을 강제로 퇴위시켰다(1907). 순종이 즉위한 뒤 일본은 한·일 신협약(정미 7조약)을 강요하였고, 그 결과 통감이 추천한 일본인 차관이 각 부의 실권을 장악하였으며 대한 제국 군대도 강제로 해산되었다. 이를 계기로 의병 운동은 전국적인 의병 전쟁으로 발전하였다(정미의병). 이후 일본은 대한 제국의 사법권과 경찰권도 차지하였다. 1910년 8월 22일 일본군과 경찰의 삼엄한 경계 속에 ‘한·일 병합 조약’이 강제로 맺어졌고, 8월 29일 조약이 공포되고 순종의 퇴위가 선포되면서 대한 제국은 일본의 식민지가 되었다. 일제는 조선 총독부를 설치하고 헌병 경찰제를 시행하여 무단 통치를 실시하였다.',
      terms: [
        { label: '한·일 신협약(정미 7조약)', def: '1907년 일본이 강요한 조약. 통감이 한국 내정의 최고 감독권자가 되었고, 부수 각서에서 군대 해산을 명시하였다.' },
        { label: '‘한·일 병합 조약’', def: '1910년 이완용과 데라우치가 체결한 조약. 강제로 체결되었고 순종의 비준이 없어 불법성이 지적된다.' },
        { label: '조선 총독부', def: '국권 피탈 후 일제가 설치한 식민 통치 기구. 조선 총독은 입법·사법·행정 및 군사권을 장악하였고 군인 출신이 임명되었다.' },
        { label: '헌병 경찰제', def: '헌병이 일반 경찰 업무와 행정 업무까지 맡아보게 한 1910년대 무단 통치의 제도.' }
      ],
      timeline: [
        { y: 1905, label: '을사늑약' },
        { y: 1907, label: '헤이그 특사 파견·고종 강제 퇴위·한·일 신협약' },
        { y: 1909, label: '안중근, 이토 히로부미 처단' },
        { y: 1910, label: '◆ 국권 피탈·조선 총독부 설치' },
        { y: 1912, label: '조선 태형령 시행' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-eulsa', 'k-gukchae', 'k-russo-japan', 'k-samil', 'k-era-mudan']
  },
  'k-rok': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '제헌 헌법 → 국회 선출',
          '대통령 이승만, 부통령 이시영',
          '**반민법** 제정, **반민특위** 구성',
          '정부의 비협조적 태도',
          '경찰의 반민 특위 습격',
          '국회 프락치 사건, 공소 시효 축소',
          '농지 개혁 실시(1950)',
          '유상 매입·유상 분배'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '대한민국 정부 수립 — 1948년 5월 10일 유엔 한국 임시 위원단의 감시 아래 국회의원을 뽑기 위한 총선거가 남한에서 실시되었다(5·10 총선거). 5·10 총선거는 만 21세 이상 국민이 보통·평등·직접·비밀 선거의 원칙에 따라 참여한 우리 역사 최초의 민주 선거였으나, 김구·김규식 등 남북 협상파와 일부 좌익 세력은 참여하지 않았다. 5·10 총선거로 구성된 제헌 국회는 나라 이름을 대한민국으로 정하고 제헌 헌법을 제정하여 선포하였다(1948. 7. 17.). 제헌 헌법은 대한민국이 3·1 운동으로 수립된 대한민국 임시 정부의 법통을 계승한 민주 공화국임을 밝히고, 삼권 분립과 대통령 중심제, 국회에서 대통령을 뽑는 간접 선거제를 채택하였다. 제헌 국회는 이승만을 대통령, 이시영을 부통령으로 선출하였고, 이승만 대통령은 1948년 8월 15일에 대한민국 정부 수립을 선포하였다. 그해 말 유엔 총회는 대한민국 정부를 ‘한반도의 유일한 합법 정부’로 승인하였다.',
      terms: [
        { label: '5·10 총선거', def: '1948년 유엔 한국 임시 위원단의 감시 아래 남한에서 실시된 우리 역사 최초의 민주 선거.' },
        { label: '제헌 국회', def: '5·10 총선거로 구성되어 헌법을 만든 국회. 나라 이름을 대한민국으로 정하였다.' },
        { label: '제헌 헌법', def: '1948년 7월 17일 선포. 제1조에서 ‘대한민국은 민주 공화국이다.’라고 규정하였다.' }
      ],
      timeline: [
        { y: 1945, label: '8·15 광복' },
        { y: 1948, label: '5·10 총선거' },
        { y: 1948, label: '제헌 헌법 선포(7. 17.)' },
        { y: 1948, label: '◆ 대한민국 정부 수립(8. 15.)' },
        { y: 1948, label: '북한 정권 수립(9. 9.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-liberation', 'k-samil', 'k-gov-rhee', 'k-510', 'k-constitution', 'k-yeosun']
  },
  'k-era-mudan': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '무단 통치 — 일제는 한국의 국권을 강제로 빼앗은 뒤 조선 총독부를 설치하였다. 조선 총독은 입법·사법·행정 및 군사권을 장악한 식민 통치의 최고 권력자로 군인 출신이 임명되었다. 일제는 헌병 경찰제를 시행하여 헌병이 일반 경찰 업무와 행정 업무까지 맡아보게 하였으며, 헌병 경찰은 정식 재판 없이도 자신의 판단에 따라 한국인에게 벌금이나 구류 등 처분을 내릴 수 있었다. 그리고 1912년 조선 태형령을 제정하여 한국인을 매질할 수 있게 하였다. 일반 관리는 물론 학교 교원에게도 제복을 입고 칼을 차게 하여 위압적인 분위기를 조성하였고, 한국인의 언론·출판·집회·결사의 자유를 빼앗았다. 경제적으로는 토지 조사 사업을 실시하고 회사령을 제정하였다. 일제는 3·1 운동을 계기로 강압적인 무단 통치로는 한국인을 억누를 수 없다는 것을 깨닫고 통치 방식을 ‘문화 정치’로 바꾸었다.',
      terms: [
        { label: '조선 총독', def: '입법·사법·행정 및 군사권을 장악한 식민 통치의 최고 권력자. 군인 출신이 임명되었다.' },
        { label: '헌병 경찰제', def: '헌병이 일반 경찰 업무와 행정 업무까지 맡아보게 한 제도. 무단 통치를 헌병 경찰 통치라고도 한다.' },
        { label: '105인 사건', def: '일제가 총독 암살 모의 사건을 조작하여 독립운동가들을 기소한 사건.' }
      ],
      timeline: [
        { y: 1910, label: '◆ 국권 피탈·조선 총독부 설치·회사령 제정' },
        { y: 1912, label: '조선 태형령 시행·토지 조사령 공포' },
        { y: 1919, label: '3·1 운동' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-annexation', 'k-flogging', 'k-land-survey', 'k-company-law', 'k-samil', 'k-era-munhwa']
  },
  'k-era-munhwa': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '‘문화 정치’ — 일제는 3·1 운동을 계기로 무단 통치의 한계를 깨달았다. 이에 새 총독으로 해군 대장 출신인 사이토 마코토를 임명하고, 이른바 ‘문화 정치’를 내세워 한국인의 반발을 무마하려 하였다. 문관 출신도 총독으로 임명할 수 있도록 하겠다고 하였지만 실제로 임명되지는 않았다. 헌병 경찰제를 보통 경찰제로 바꾸었으나 경찰과 경찰 기관 수를 크게 늘리고 1군(郡) 1경찰서와 1면(面) 1주재소 체제를 확립하였으며, 치안 유지법을 제정하여(1925) 사회주의 운동과 민족 운동을 억압하였다. 도평의회와 부·면 협의회 등을 설치하였으나 실권이 없는 자문 기관이었다. 『동아일보』와 『조선일보』 등 한국인이 발행하는 신문이 창간되었지만, 일제는 기사를 검열하여 삭제하였으며 신문을 정간·폐간하기도 하였다. 일제의 ‘문화 정치’는 한국인을 기만하는 민족 분열 통치에 지나지 않았다.',
      terms: [
        { label: '민족 분열 통치', def: '‘문화 정치’의 실상. 한국인을 회유하고 분열하려 하였다.' },
        { label: '보통 경찰제', def: '헌병 경찰제를 대신한 제도. 그러나 경찰과 경찰 기관 수는 크게 늘었다.' },
        { label: '자치론', def: '일부 민족주의자들이 일제와 타협하여 자치권을 얻을 것을 주장한 것. 일제도 자치론자들을 지원하여 민족 운동을 분열시키려 하였다.' }
      ],
      timeline: [
        { y: 1919, label: '◆ ‘문화 정치’(민족 분열 통치) 시작' },
        { y: 1920, label: '회사령 폐지·산미 증식 계획 시작' },
        { y: 1925, label: '치안 유지법 제정' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-era-mudan', 'k-samil', 'k-sanmi', 'k-peace-law', 'k-era-malsal']
  },
  'k-era-malsal': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '민족 말살 정책 — 일제는 대공황 이후 만주를 침략하여 농업과 원료 공급 지대로 삼았으며, 한국을 군수 물자 보급 기지로 삼으려 하였다. 중·일 전쟁 발발 이후에는 병참 기지화 정책을 본격적으로 실시하였고, 1938년 국가 총동원법을 제정하여 침략 전쟁에 필요한 인력과 물자 수탈에 나섰다. 일제는 한국인을 침략 전쟁에 본격적으로 동원하고자 민족 말살 정책을 시행하였다. ‘일본(내)과 조선(선)이 하나(내선일체)’라고 하거나 ‘일본인과 한국인의 조상은 같다(일선동조론)’라고 주장하는 등 한국인을 일본인으로 동화시키려 하였다. 황국 신민 서사를 억지로 외우게 하고 신사 참배를 강요하였으며, 학교와 관공서에서 한국어 사용을 금지하고 한국인의 성과 이름을 일본식으로 바꿀 것을 강요하였다. 1944년에는 징병제를 실시하여 수많은 한국인을 전쟁터로 끌고 갔으며, 한국을 비롯한 식민지와 점령지의 여성들을 일본군 ‘위안부’로 강제 동원하였다.',
      terms: [
        { label: '병참 기지화 정책', def: '중·일 전쟁 이후 전쟁에 필요한 물자를 생산하기 위해 한국의 산업을 군수 산업 위주로 개편한 정책.' },
        { label: '내선일체', def: '‘일본(내)과 조선(선)이 하나’라는 주장. 한국인을 일본인으로 동화시키려 하였다.' },
        { label: '공출', def: '식량뿐만 아니라 농기구, 수저 등 각종 생활용품까지 빼앗아 군수 물자를 생산한 것.' }
      ],
      timeline: [
        { y: 1931, label: '만주 사변' },
        { y: 1937, label: '◆ 중·일 전쟁 발발·황국 신민 서사 제정' },
        { y: 1938, label: '국가 총동원법 제정' },
        { y: 1940, label: '일본식 성명 강요 시작' },
        { y: 1944, label: '징병제 실시' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-era-munhwa', 'k-mobilization', 'k-oath', 'k-soshi', 'k-joseoneo', 'k-liberation']
  },
  'k-company-law': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '회사령 — 일제는 1910년에 회사령을 제정하여 회사를 설립할 때는 조선 총독의 허가를 받도록 하였다. 또한 조선 총독이 사업의 정지 및 회사의 해산을 명령할 수 있도록 하였다. 이를 통해 한국인의 자본 축적을 차단하고, 한국을 일본의 원료 공급지이자 상품 시장으로 만들려 하였다. 일제는 어업령, 조선 광업령 등을 제정하여 경제 활동을 허가제로 전환하고 한국의 자원을 독점하였다. 제1차 세계 대전으로 일본 기업들도 자본을 축적하자 일제는 회사령을 폐지하고 회사 설립을 허가제에서 신고제로 전환하였다(1920). 회사령이 폐지되자 일본 기업들은 값싼 자원과 노동력을 찾아 한국에 진출하였다.',
      terms: [
        { label: '회사령', def: '회사를 설립할 때 조선 총독의 허가를 받도록 한 법령(1910). 1920년에 폐지되어 신고제로 바뀌었다.' },
        { label: '조선 광업령', def: '1915년 공포. 경제 활동을 허가제로 전환하여 한국의 자원을 독점하였다.' }
      ],
      timeline: [
        { y: 1910, label: '◆ 회사령 제정' },
        { y: 1915, label: '조선 광업령 공포' },
        { y: 1920, label: '회사령 폐지(신고제 전환)' },
        { y: 1923, label: '일본 상품의 관세 폐지' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-era-mudan', 'k-land-survey', 'k-mulsan']
  },
  'k-sinheung': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '신흥 강습소 설립 — 국외의 독립운동 기지는 한국인이 많이 살고 국내 진입이 용이한 서간도, 북간도, 연해주 지역에 집중되었다. 서간도에서는 국권 피탈을 전후하여 이주한 이회영 형제 등 신민회 회원들이 민족 운동을 주도하였다. 이들은 삼원보에 자치 기관인 경학사를 설립하고, 신흥 강습소를 세워 독립군을 양성하였다. 신흥 강습소는 이후 신흥 무관 학교로 개편되었으며, 지청천, 이범석 등 신흥 무관 학교 출신 및 관련 인물들은 다양한 독립운동을 펼쳤다.',
      terms: [
        { label: '경학사', def: '이회영 형제 등 신민회 회원들이 서간도 삼원보에 세운 자치 기관.' },
        { label: '신흥 무관 학교', def: '신흥 강습소가 개편된 독립군 양성 기관. 의열단도 신흥 무관 학교 출신이 중심이 되어 결성하였다.' }
      ],
      timeline: [
        { y: 1911, label: '◆ 신흥 강습소 설립' },
        { y: 1911, label: '중광단 조직' },
        { y: 1914, label: '대한 광복군 정부 조직' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-uigunbu', 'k-uiyeoldan', 'k-bongodong']
  },
  'k-land-survey': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '토지 조사 사업 — 일제는 한국을 강제 병합한 직후 임시 토지 조사국을 설치하고, 1912년에는 토지 조사령을 공포하여 전국적으로 토지 조사 사업을 실시하였다. 조선 총독부는 이 사업이 토지세를 공정하게 부과하고 근대적인 토지 소유권을 확립하기 위한 것이라고 선전하였다. 그러나 실제로는 토지세를 안정적으로 확보하여 식민지 통치 자금을 마련하고, 일본인이 쉽게 토지를 차지할 수 있게 하려는 것이었다. 토지 조사 사업은 조선 총독이 정한 기한 내에 토지 소유주가 직접 신고하는 방식으로 진행되었다. 토지 조사 사업으로 조선 총독부의 토지세 수입이 증가하였고, 소유권이 불분명한 토지는 조선 총독부의 소유가 되었다. 일제는 이 토지를 동양 척식 주식회사나 일본인 농업 이주민에게 넘겨주었다. 경작하던 토지를 잃은 농민들은 소작을 하거나 만주나 연해주 등지로 이주하기도 하였다.',
      terms: [
        { label: '토지 조사령', def: '1912년 공포. 토지 소유자가 정해진 기간 내에 소유지를 신고하도록 하였다.' },
        { label: '동양 척식 주식회사', def: '1908년 설립. 토지 조사 사업, 산미 증식 계획 등 일제의 한국 경제 침탈에 앞장섰으며 일제 강점기 한국 최대의 지주가 되었다.' }
      ],
      timeline: [
        { y: 1910, label: '임시 토지 조사국 설치' },
        { y: 1912, label: '◆ 토지 조사령 공포' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-era-mudan', 'k-company-law', 'k-sanmi', 'k-amtae']
  },
  'k-flogging': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '조선 태형령 — 무단 통치 시기 일제는 헌병 경찰제를 시행하였다. 헌병 경찰은 정식 재판 없이도 자신의 판단에 따라 한국인에게 벌금이나 구류 등 처분을 내릴 수 있었다. 그리고 일제는 1912년 조선 태형령을 제정하여 한국인을 매질할 수 있게 하였다. 조선 태형령은 3개월 이하의 징역 또는 구류에 처하는 자는 상황에 따라 태형에 처할 수 있도록 하였으며, 조선인에게만 적용하였다. 태형은 헌병 경찰의 주관적 판단에 따라 집행되어 같은 죄목이라도 처벌이 달랐다.',
      terms: [
        { label: '조선 태형령', def: '1912년 제정. 제13조에서 이 명령은 조선인에게만 적용한다고 규정하였다.' },
        { label: '헌병 경찰제', def: '헌병이 일반 경찰 업무와 행정 업무까지 맡아보게 한 제도.' }
      ],
      timeline: [
        { y: 1910, label: '조선 총독부 설치' },
        { y: 1912, label: '◆ 조선 태형령 시행' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-era-mudan', 'k-annexation']
  },
  'k-uigunbu': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '독립 의군부 — 일제는 대한 제국의 국권을 빼앗은 뒤 가혹한 무단 통치를 펼쳤고, 105인 사건 등을 조작하여 독립운동을 탄압하였다. 하지만 국내에서는 의병 운동이나 비밀 결사의 형태로 독립운동이 계속되었다. 임병찬은 고종의 비밀 지시를 받고 각지의 유생을 모아 독립 의군부를 조직하였다(1912). 독립 의군부는 나라를 되찾은 뒤 고종을 다시 왕위에 올리려는 복벽주의의 입장에서 의병 전쟁을 계획하였다. 그러나 조선 총독과 일본 총리에게 국권 반환 요구서를 발송하는 과정에서 조직이 발각되어 해체되었다.',
      terms: [
        { label: '복벽주의', def: '나라를 되찾은 뒤 고종을 다시 왕위에 올리려는 입장.' },
        { label: '105인 사건', def: '일제가 총독 암살 모의 사건을 조작하여 독립운동가들을 기소한 사건.' }
      ],
      timeline: [
        { y: 1912, label: '◆ 독립 의군부 조직' },
        { y: 1915, label: '대한 광복회 조직' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gwangbokhoe', 'k-era-mudan', 'k-sinheung']
  },
  'k-gwangbokhoe': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '대한 광복회 — 박상진 등은 대구에서 대한 광복회를 조직하였다(1915). 대한 광복회는 독립 전쟁으로 국권을 회복한 뒤 공화제 정부를 세우려 하였다. 이를 위해 군대식 조직을 갖추고 사관 학교 설립을 추진하였으며, 군자금 마련을 위하여 부유한 친일파를 처단하고 광산, 우편물 수송 차량 등을 습격하였다. 대한 광복회는 이 과정에서 일제에 조직이 발각되어 해체되었으나, 김좌진 등 일부 회원은 간도로 이동하여 투쟁을 이어 갔다.',
      terms: [
        { label: '공화제', def: '국민이 뽑은 대표자가 정치를 맡는 정치 체제.' },
        { label: '박상진', def: '중국에서 신해혁명을 목격하고 공화정 수립을 목표로 대한 광복회를 결성하였다.' }
      ],
      timeline: [
        { y: 1912, label: '독립 의군부 조직' },
        { y: 1915, label: '◆ 대한 광복회 조직' },
        { y: 1920, label: '청산리 대첩' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-uigunbu', 'k-cheongsanri', 'k-era-mudan']
  },
  'k-28': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '2·8 독립 선언 — 미국 대통령 윌슨은 제1차 세계 대전 중에 14개조 평화 원칙을 발표하였다. 14개조 평화 원칙에는 각 민족이 다른 민족의 간섭을 받지 않고 스스로 정치적 운명을 결정할 수 있다는 민족 자결주의가 포함되어 있었다. 한국인들도 국제 사회의 움직임에 발맞추어 적극적으로 독립운동을 전개하였다. 상하이의 신한청년당은 파리 강화 회의에 김규식을 대표로 파견하였고, 만주에서는 조소앙 등이 독립 선언을 준비하였다. 1919년 2월 8일에는 일본에서 유학생들이 중심이 되어 독립 선언서를 발표하였다(2·8 독립 선언). 한편 국내에서는 1919년 1월 고종이 갑자기 죽자 반일 감정이 높아졌고, 종교 지도자와 학생 대표들이 비밀리에 독립 선언과 만세 시위를 계획하였다.',
      terms: [
        { label: '민족 자결주의', def: '각 민족이 다른 민족의 간섭을 받지 않고 스스로 정치적 운명을 결정할 수 있다는 원칙.' },
        { label: '신한청년당', def: '한국의 독립을 준비하기 위해 1918년 독립운동가들이 상하이에 모여 조직한 단체.' }
      ],
      timeline: [
        { y: 1918, label: '신한청년당 조직' },
        { y: 1919, label: '파리 강화 회의에 김규식 파견' },
        { y: 1919, label: '◆ 2·8 독립 선언' },
        { y: 1919, label: '3·1 운동' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-samil', 'k-provisional', 'w-paris']
  },
  'k-provisional': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '대한민국 임시 정부 — 3·1 운동을 계기로 국내외에서 한성 정부, 대한민국 임시 정부, 대한 국민 의회 등 여러 임시 정부가 수립되었다. 이후 이들 정부는 대한민국 임시 정부로 통합되었다. 대한민국 임시 정부는 우리 역사 최초의 민주 공화제 정부로 통합 과정에서 한성 정부의 법통을 계승하고, 위치는 상하이에 두기로 하였다. 그리고 1919년 9월에 대한민국 임시 헌법을 공포하고 이승만을 대통령, 이동휘를 국무총리로 선출하였다. 대한민국 임시 정부는 삼권 분립의 원칙에 따라 임시 의정원, 법원, 국무원으로 구성되었으며, 국내 독립운동을 지도하고 활동에 필요한 자금을 조달하기 위해 연통제와 교통국을 두었다. 외교 활동으로 국제 사회에 한국의 독립을 호소하여 파리 강화 회의에 독립 청원서를 제출하고, 미국에는 구미 위원부를 두었다. 그러나 연통제와 교통국이 발각되면서 재정난에 빠졌고, 국민 대표 회의가 결렬된 뒤 침체에 빠졌다. 이후 1940년 충칭에 정착하여 한국광복군을 창설하고 김구를 주석으로 선출하였다.',
      terms: [
        { label: '연통제', def: '국내 각 지역에 설치한 비밀 행정 조직. 정부 문서와 명령 전달, 독립운동 자금 조달, 정보 보고 등을 맡았다.' },
        { label: '교통국', def: '통신 기관으로 정보 수집·분석과 연락을 담당하였다.' },
        { label: '임시 의정원', def: '대한민국 임시 정부의 입법 기관.' },
        { label: '구미 위원부', def: '미국 워싱턴에 설치되어 이승만을 중심으로 외교 활동을 펼친 기구.' }
      ],
      timeline: [
        { y: 1919, label: '◆ 대한민국 임시 정부 수립(4. 11. 상하이)' },
        { y: 1919, label: '대한민국 임시 정부로 통합(9.)' },
        { y: 1923, label: '국민 대표 회의 개최' },
        { y: 1925, label: '이승만 대통령 탄핵' },
        { y: 1932, label: '이봉창·윤봉길 의거' },
        { y: 1940, label: '충칭 정착·한국광복군 창설' },
        { y: 1941, label: '대한민국 건국 강령 발표' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-samil', 'k-national-rep', 'k-hanin', 'k-gwangbokgun', 'k-founding-plan', 'k-rok']
  },
  'k-uiyeoldan': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '의열단 — 무장 투쟁과 함께 의열 투쟁도 활발하게 일어났다. 독립운동가들은 개인 또는 소규모 조직으로 일제 요인과 친일파를 처단하고, 식민 통치 기관 등을 파괴하는 의열 투쟁으로 일제에 타격을 주고 한국인들에게 독립의 희망을 불어넣었다. 1919년 11월에 만주에서 김원봉, 윤세주 등이 중심이 되어 의열단을 결성하였다. 의열단은 일제의 감시를 피하기 위해 비밀 조직으로 운영되었으며, 신채호의 조선 혁명 선언을 활동 지침으로 삼고 일제 요인 처단, 식민 통치 기관 파괴 등 활동을 하였다. 1920년대 후반 의열단은 의열 투쟁만으로는 독립이 어렵다고 판단하였다. 의열단원들은 중국 황푸 군관 학교에 입학하여 정규 군사 훈련을 받았고, 1930년대에는 중국 국민당 정부의 지원을 받아 조선 혁명 간부 학교를 세워 독립운동 지도자를 양성하였다.',
      terms: [
        { label: '의열 투쟁', def: '개인 또는 소규모 조직으로 일제 요인과 친일파를 처단하고 식민 통치 기관 등을 파괴하는 투쟁.' },
        { label: '조선 혁명 선언', def: '김원봉이 신채호에게 부탁해 작성한 의열단의 활동 지침. 일제에 대한 직접 투쟁을 강조하였다.' }
      ],
      timeline: [
        { y: 1919, label: '◆ 의열단 결성(11.)' },
        { y: 1921, label: '김익상, 조선 총독부에 폭탄 투척' },
        { y: 1926, label: '나석주, 조선식산은행·동양 척식 주식회사에 폭탄 투척' },
        { y: 1935, label: '조선 민족 혁명당 결성' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-sinheung', 'k-minhyeok', 'k-uiyongdae', 'k-hanin']
  },
  'k-bongodong': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '봉오동 전투 — 3·1 운동 이후 독립군 부대들이 국내로 진입하여 일제와 전투를 벌이고 식민 통치 기관을 파괴하였다. 독립군의 잇따른 활동에 일제는 추격 부대를 편성하여 독립군 근거지를 수색·탄압하려 하였다. 홍범도의 대한 독립군, 최진동의 군무 도독부, 안무의 국민회군 등 독립군 부대는 연합하여 일제의 공격에 대비하였다. 그리고 1920년 6월 독립군 연합 부대가 봉오동 일대에서 일본군을 기습하여 크게 승리하였다(봉오동 전투). 봉오동 전투에서 패한 일제는 만주 지역 독립군을 공격하기 위해 훈춘 사건을 빌미로 만주에 대군을 파견하였다.',
      terms: [
        { label: '홍범도', def: '포수 출신으로 의병으로 활약하였다. 국권 피탈 이후 독립군을 이끌고 봉오동 전투, 청산리 대첩 등에서 활약하였다.' },
        { label: '훈춘 사건', def: '일제에 매수된 만주 지역 마적이 훈춘의 일본 영사관을 공격하고 일본인을 살해한 사건.' }
      ],
      timeline: [
        { y: 1920, label: '◆ 봉오동 전투(6.)' },
        { y: 1920, label: '청산리 대첩(10.)' },
        { y: 1920, label: '간도 참변' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-cheongsanri', 'k-gando', 'k-sinheung']
  },
  'k-cheongsanri': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '청산리 대첩 — 봉오동 전투에서 패한 일제는 훈춘 사건을 빌미로 만주에 대군을 파견하였다. 북간도 지역에 있던 김좌진의 북로 군정서, 홍범도의 대한 독립군 등은 일본군을 피해 연합하여 백두산 일대로 이동하였다. 이후 독립군 연합 부대가 추격해 온 일본군을 청산리 일대로 유인하여 큰 승리를 거두었다(청산리 대첩, 1920. 10.). 청산리 대첩은 독립군 최대의 승리였다.',
      terms: [
        { label: '북로 군정서', def: '대종교가 만든 중광단을 3·1 운동 이후 확대·개편한 독립군 부대. 김좌진이 이끌었다.' },
        { label: '김좌진', def: '대한 광복회에서 활동했으며, 북로 군정서를 이끌고 청산리 대첩 등에서 활약하였다.' }
      ],
      timeline: [
        { y: 1920, label: '봉오동 전투(6.)' },
        { y: 1920, label: '◆ 청산리 대첩(10.)' },
        { y: 1920, label: '간도 참변' },
        { y: 1921, label: '자유시 참변' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-bongodong', 'k-gando', 'k-jayusi', 'k-gwangbokhoe']
  },
  'k-gando': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '간도 참변 — 청산리 대첩을 전후하여 일제는 독립군 근거지를 없애고 잇따른 패배를 보복하려 하였다. 이에 간도 지역의 한국인을 학살하고 한국인 마을을 불살랐다(간도 참변). 대한민국 임시 정부 간도 통신원은 1920년 10월에서 11월까지 두 달 동안에만 3천 명 이상의 한국인이 학살되었다고 보고하였다. 독립군은 일본군을 피해 러시아와 만주의 국경 지대인 밀산부에 집결하여 대한 독립 군단을 조직하였다.',
      terms: [
        { label: '경신참변', def: '간도 참변의 다른 이름. 1920년 10월 초부터 1921년 4월 무렵까지 진행되었다.' },
        { label: '대한 독립 군단', def: '1920년 12월 밀산부에서 대종교의 지도자 서일을 총재로 결성하였다.' }
      ],
      timeline: [
        { y: 1920, label: '청산리 대첩(10.)' },
        { y: 1920, label: '◆ 간도 참변' },
        { y: 1920, label: '대한 독립 군단 창설(12.)' },
        { y: 1921, label: '자유시 참변' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-cheongsanri', 'k-jayusi', 'k-bongodong']
  },
  'k-sanmi': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '산미 증식 계획 — 일본에서는 쌀값이 폭등하여 각지에서 폭동이 일어나는 등 사회가 불안해졌다. 일제는 본국의 부족한 식량을 한국에서 확보하려고 1920년부터 산미 증식 계획을 실시하였다. 농지 확장, 신품종 도입, 수리 시설 개선 등으로 한국에서 쌀 생산을 늘려 일본으로 더 많은 쌀을 가져간다는 계획이었다. 산미 증식 계획으로 쌀 생산량은 어느 정도 늘어났다. 하지만 지속적으로 많은 양의 쌀이 일본으로 빠져나가면서 한국인의 쌀 소비량은 오히려 줄어들었다. 또한 일부 농민이 몰락하여 자작농, 자소작농이 줄고 소작농과 화전민이 늘어났다.',
      terms: [
        { label: '수리 시설', def: '저수지 등 물을 공급하는 시설.' },
        { label: '동양 척식 주식회사', def: '토지 조사 사업, 산미 증식 계획 등 일제의 한국 경제 침탈에 앞장섰다.' }
      ],
      timeline: [
        { y: 1920, label: '◆ 산미 증식 계획 시작' },
        { y: 1930, label: '풍년으로 쌀값 폭락' },
        { y: 1937, label: '중국 침략 본격화·미곡 수탈 강화' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-era-munhwa', 'k-land-survey', 'k-amtae']
  },
  'k-mulsan': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '물산 장려 운동 — 회사령이 폐지된 뒤 일본 기업들이 한국에 진출하였고, 1923년에 일본 상품의 관세가 폐지되어 값싼 일본 상품이 국내로 들어오면서 한국인 기업은 큰 타격을 입었다. 이에 민족 산업과 자본을 보호·육성하여 민족 경제의 자립을 이루자는 물산 장려 운동이 전개되었다. 조만식 등 민족주의 계열 인사들은 1920년에 평양에서 조선 물산 장려회를 조직하고 토산품 애용 운동을 펼쳤다. 1923년에는 서울에서도 조선 물산 장려회가 조직되는 등 물산 장려 운동은 전국으로 확산되었다. 물산 장려 운동은 한때 성과를 거두어 옷감 등 토산품의 소비가 크게 늘어났다. 그러나 생산량이 수요를 따르지 못해 상품 가격이 크게 올랐고, 일부 사회주의자를 중심으로 물산 장려 운동이 자본가의 이익만을 위한 것이라는 비판도 제기되었다. 물산 장려 운동은 1923년 이후 시들해졌다.',
      terms: [
        { label: '토산품', def: '그 지역에서 나는 물품.' },
        { label: '조선 물산 장려회', def: '1920년 평양에서 조만식 등이 조직하였고, 1923년 서울에서도 조직되었다.' }
      ],
      timeline: [
        { y: 1920, label: '회사령 폐지' },
        { y: 1920, label: '◆ 평양에서 조선 물산 장려회 조직' },
        { y: 1923, label: '서울에서 조선 물산 장려회 조직·일본 상품의 관세 폐지' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-company-law', 'k-minrip', 'k-era-munhwa']
  },
  'k-jayusi': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '자유시 참변 — 간도 참변 이후 독립군은 일본군을 피해 러시아와 만주의 국경 지대인 밀산부에 집결하여 대한 독립 군단을 조직하였다. 그리고 러시아 적군의 지원을 받기 위해 1921년 6월 러시아 영토인 자유시(스보보드니)로 이동하였다. 이후 독립군을 통합하는 과정에서 지휘권을 두고 다툼이 일어났고, 여기에 러시아 적군이 개입하여 강제로 무장 해제를 진행하면서 여러 독립군이 피해를 입었다(자유시 참변). 간도 참변과 자유시 참변으로 큰 피해를 입은 독립군은 조직을 재정비하여 참의부, 정의부, 신민부의 3부를 조직하였다.',
      terms: [
        { label: '러시아 적군', def: '소비에트 러시아의 군대.' },
        { label: '3부', def: '참의부·정의부·신민부. 공화주의와 삼권 분립에 바탕을 두었으며, 동포 사회를 이끄는 자치 정부의 역할을 하였다.' }
      ],
      timeline: [
        { y: 1920, label: '간도 참변' },
        { y: 1920, label: '대한 독립 군단 창설(12.)' },
        { y: 1921, label: '◆ 자유시 참변(6.)' },
        { y: 1925, label: '미쓰야 협정' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gando', 'k-mitsuya', 'k-cheongsanri']
  },
  'k-minrip': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '민립 대학 설립 운동 — 제2차 조선 교육령(1922)에 따라 대학 설립이 가능해지자 고등 교육을 실현하자는 민립 대학 설립 운동이 일어났다. 1922년에 이상재를 중심으로 서울에서 조선 민립 대학 기성회가 조직되었으며, 민립 대학 설립을 위해 전국적으로 모금 운동을 펼쳤다. 민립 대학 설립 운동은 전국적으로 큰 호응을 얻었으며, 해외의 한국인들도 모금 운동에 참여하였다. 그러나 일제가 민립 대학 설립 운동을 방해하고, 잇따른 자연재해로 모금 운동이 어려워지면서 민립 대학 설립 운동은 실패하였다. 한편 일제는 한국에 있는 일본인을 교육하고 한국인의 교육열을 무마하기 위해 1924년에 경성 제국 대학을 설립하였다.',
      terms: [
        { label: '조선 민립 대학 기성회', def: '1922년 이상재를 중심으로 서울에서 조직되어 민립 대학 설립을 위한 모금 운동을 펼쳤다.' },
        { label: '경성 제국 대학', def: '일제가 한국에 있는 일본인을 교육하고 한국인의 교육열을 무마하기 위해 1924년에 설립하였다.' }
      ],
      timeline: [
        { y: 1922, label: '제2차 조선 교육령' },
        { y: 1922, label: '◆ 조선 민립 대학 기성회 조직' },
        { y: 1924, label: '경성 제국 대학 설립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-mulsan', 'k-vnarod', 'k-era-munhwa']
  },
  'k-national-rep': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '국민 대표 회의 — 일제에 연통제와 교통국이 발각되면서 대한민국 임시 정부는 재정난에 빠졌다. 또한 초기의 주요 정책이었던 외교 독립론이 열강의 무관심으로 성과를 거두지 못하자 독립운동 방법론을 둘러싸고 대립이 심해졌다. 이에 1923년 독립운동의 새로운 길을 찾기 위해 국민 대표 회의가 열렸다. 하지만 개조파와 창조파의 대립으로 성과를 거두지 못하고 결렬되었다. 국민 대표 회의 결렬로 많은 독립운동가가 이탈하면서 대한민국 임시 정부는 침체에 빠졌다.',
      terms: [
        { label: '개조파·창조파', def: '국민 대표 회의에서 대립한 세력. 개조파의 대표적인 인물은 안창호, 창조파의 대표적인 인물은 신채호, 박용만 등이다. 김구, 이동녕 등은 현상 유지를 주장하였다.' }
      ],
      timeline: [
        { y: 1919, label: '대한민국 임시 정부 수립' },
        { y: 1923, label: '◆ 국민 대표 회의 개최' },
        { y: 1925, label: '이승만 대통령 탄핵' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-provisional', 'k-hanin']
  },
  'k-hyeongpyeong': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '형평 운동 — 갑오개혁으로 신분제는 폐지되었지만 백정에 대한 차별은 일제 강점기에도 지속되어, 호적에 직업을 도한(백정)으로 기록하거나 붉은 점을 찍는 등 따로 표시하여 구분하였다. 백정 자녀의 학교 입학이 거부되기도 하였으며, 학교에 들어간 뒤에도 차별을 받았다. 이에 1923년 경남 진주에서 조선 형평사가 조직되어 백정에 대한 사회적 차별을 없애고, 저울처럼 평등한 사회를 만들겠다는 형평 운동을 전개하였다. 조선 형평사는 전국으로 조직을 확대하였으며, 노동 운동, 농민 운동 등에 협력하기도 하였다. 그러나 1920년대 말부터 내부의 이념 갈등으로 조직이 약화되었고, 일제의 탄압도 강화되었다.',
      terms: [
        { label: '형평', def: '저울처럼 평등함을 의미한다.' },
        { label: '수평사', def: '일본에서 차별받던 부락민들이 조직한 단체. 형평사와 수평사는 차별에 맞서 국제적 연대를 모색하였다.' }
      ],
      timeline: [
        { y: 1894, label: '갑오개혁(신분제 폐지)' },
        { y: 1923, label: '◆ 조선 형평사 창립' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-geunuhoe', 'k-amtae', 'k-gabo']
  },
  'k-amtae': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '암태도 소작 쟁의 — 1920년대 일제가 쌀값을 낮게 유지하려고 하면서 지주의 수익이 감소하였다. 이에 지주들은 소작료를 높였으며, 70~80%의 소작료를 징수하는 경우도 있었다. 1920년대에 농민들은 소작권 보장, 소작료 인하, 토지세의 지주 부담 등을 요구하였다. 특히 1923년에 전라도 암태도에서 일어난 암태도 소작 쟁의에서는 소작인들이 지주와 일본 경찰의 탄압에 맞서 소작료를 낮추는 성과를 거두었다. 1927년에는 전국적인 농민 운동 단체인 조선 농민 총동맹이 결성되어 농민 운동의 규모와 조직이 한층 발전하였다.',
      terms: [
        { label: '암태 소작인회', def: '수확량의 70% 이상 소작료에 반발하여 소작료를 40%로 내릴 것을 요구하였고, 지주와 소작료를 40%로 내리기로 합의하였다.' },
        { label: '조선 농민 총동맹', def: '1927년 결성된 전국적인 농민 운동 단체.' }
      ],
      timeline: [
        { y: 1923, label: '◆ 암태도 소작 쟁의' },
        { y: 1927, label: '조선 농민 총동맹 결성' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-sanmi', 'k-land-survey', 'k-wonsan']
  },
  'k-kanto': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '관동 대지진 — 제1차 세계 대전 과정에서 일본의 산업이 크게 발전하면서 노동력이 부족해지자 많은 한국인이 일본으로 이주하였다. 1923년 9월 1일 도쿄 등 일본 관동 지역에 규모 7.9의 강한 지진이 일어났다. 일본 정부는 계엄령을 선포하고 군대와 경찰을 동원해 피해를 수습하였는데, 이 과정에서 한국인이 지진을 틈타 폭동을 일으키고 방화를 한다는 유언비어가 퍼졌다. 일본 정부와 언론은 이를 묵인하고 확산시켰다. 2일부터 무장한 자경단이 나타났으며, 이때부터 시작된 한국인 학살은 9월 6일 계엄 사령부의 지시 이후 점차 줄어들었다. 상하이 『독립신문』 특파원의 조사·보고에 따르면 당시 희생된 한국인은 6,661명에 달한다.',
      terms: [
        { label: '자경단', def: '관동 대지진 당시 9월 2일부터 무장하고 나타나 한국인을 학살한 집단.' }
      ],
      timeline: [
        { y: 1923, label: '◆ 관동 대지진(9. 1.)' },
        { y: 1923, label: '관동 지역 계엄령 시행·한국인 학살(9. 2.~)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-era-munhwa']
  },
  'k-peace-law': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '치안 유지법 — 일제는 ‘문화 정치’를 내세워 헌병 경찰제를 보통 경찰제로 바꾸었다. 하지만 경찰과 경찰 기관 수를 크게 늘리고, 1군(郡) 1경찰서와 1면(面) 1주재소 체제를 확립하였다. 그리고 치안 유지법을 제정하여(1925) 사회주의 운동과 민족 운동을 억압하는 등 한국인에 대한 감시와 탄압을 더욱 강화하였다. 치안 유지법으로 탄압받던 사회주의 세력에서도 비타협적 민족주의 세력과 연합하여 합법적 활동 공간을 마련하려는 움직임이 나타났다.',
      terms: [
        { label: '보통 경찰제', def: '3·1 운동 이후 헌병 경찰제를 대신한 제도. 그러나 경찰과 경찰 기관 수는 크게 늘었다.' }
      ],
      timeline: [
        { y: 1925, label: '◆ 치안 유지법 제정' },
        { y: 1926, label: '조선 민흥회 결성·정우회 선언' },
        { y: 1927, label: '신간회 결성' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-era-munhwa', 'k-singanhoe']
  },
  'k-mitsuya': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '미쓰야 협정 — 자유시 참변 이후 독립군은 3부를 편성하는 등 조직을 재정비하였다. 이에 일제는 만주 지역 독립군을 탄압하고 국내 진공을 막기 위해 1925년 6월 만주 펑톈성의 군벌과 미쓰야 협정을 맺었다. 미쓰야 협정은 조선 총독부 경무국장 미쓰야와 만주 펑톈성 경무처장 우진이 맺은 협정으로, 이후 하얼빈, 지린성도 협정에 가세하였다. 미쓰야 협정으로 만주 지역의 한국인들은 일제 군경만이 아니라 만주 지역 중국 관리의 감시를 받게 되어 3부의 활동이 어려워졌다. 또한 분열된 독립운동 세력을 통합하자는 민족 유일당 운동도 일어나, 3부 통합 운동이 펼쳐져 남만주에는 국민부가, 북만주에는 혁신 의회가 조직되었다.',
      terms: [
        { label: '3부', def: '참의부·정의부·신민부. 자유시 참변 이후 독립군이 조직을 재정비하여 편성하였다.' },
        { label: '민족 유일당 운동', def: '분열된 독립운동 세력을 통합하자는 운동.' }
      ],
      timeline: [
        { y: 1921, label: '자유시 참변' },
        { y: 1925, label: '◆ 미쓰야 협정(6.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-jayusi', 'k-provisional']
  },
  'k-610': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '6·10 만세 운동 — 사회주의 사상이 국내에 전해지면서 학생과 지식인 사이에 널리 퍼져 나갔다. 이러한 상황에서 대한 제국의 마지막 황제였던 순종이 세상을 떠났다. 사회주의 계열 단체와 천도교, 학생들은 순종의 장례일인 1926년 6월 10일에 대규모 만세 운동을 벌일 계획을 세웠다. 그러나 시위 계획이 사전에 일제에 발각되어 수많은 사람이 체포되었다. 일제의 감시에도 학생들은 예정대로 시위를 추진하여 6월 10일에 격문을 뿌리며 서울 곳곳에서 만세 시위를 벌였으며, 순종의 장례 행렬에 참여한 시민들도 시위에 참가하였다. 6·10 만세 운동은 학생들의 항일 운동이 더욱 활발해지는 계기가 되었다. 또한 민족주의 계열과 사회주의 계열이 함께 만세 시위를 준비하면서 통일된 독립운동의 필요성을 절실히 느끼게 되었으며, 이는 이후 민족 유일당 운동을 추진하는 데 영향을 주었다.',
      terms: [
        { label: '순종', def: '대한 제국의 마지막 황제. 국권 피탈 이후 ‘창덕궁 이왕’으로 불렸고, 1926년 4월 사망하였다.' },
        { label: '민족 유일당 운동', def: '분열된 독립운동 세력을 통합하자는 운동.' }
      ],
      timeline: [
        { y: 1926, label: '◆ 6·10 만세 운동' },
        { y: 1927, label: '신간회 결성' },
        { y: 1929, label: '광주 학생 항일 운동' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-singanhoe', 'k-gwangju-student', 'k-samil']
  },
  'k-geunuhoe': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '근우회 — 일제 강점기 여성은 가부장적인 사회 분위기에서 남성에 종속된 존재로 여겨졌으며 상속, 취업 등에서 차별받았다. 이에 여성의 사회적 지위 향상과 여성 해방을 목표로 하는 여성 운동이 일어났다. 1920년대 초에 차미리사 등은 조선 여자 교육회를 조직하여 여성 교육과 여성 계몽을 위한 활동을 펼쳤다. 1927년 5월에는 신간회 결성에 자극을 받아 ‘조선 여자의 공고한 단결과 지위 향상’을 목표로 하는 근우회가 창립되었다. 근우회는 민족주의 계열 및 사회주의 계열 여성 운동을 망라한 일제 강점기 최대의 여성 단체였다. 근우회는 기관지 『근우』를 발간하고 순회강연을 열어 여성 의식 향상에 노력하였으며, 노동 운동과 농민 운동 등 다양한 사회 운동을 지원하였다.',
      terms: [
        { label: '근우회', def: '신간회의 자매단체로 만 18세 이상 여성을 대상으로 하였다. 신간회 해소 당시 해산되었다.' },
        { label: '조선 여자 교육회', def: '1920년대 초 차미리사 등이 조직하여 여성 교육과 여성 계몽을 위한 활동을 펼쳤다.' }
      ],
      timeline: [
        { y: 1927, label: '신간회 결성' },
        { y: 1927, label: '◆ 근우회 창립(5.)' },
        { y: 1931, label: '신간회 해소' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-singanhoe', 'k-hyeongpyeong']
  },
  'k-wonsan': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '원산 총파업 — 일제 강점기 식민지 공업화로 공장이 늘어나면서 노동자의 수도 증가하였다. 한국인 노동자는 열악한 노동 환경과 장시간 노동에 시달렸으며, 일본인에 비해 낮은 임금을 받는 등 차별 대우를 받았다. 노동 운동은 1929년 원산 총파업으로 절정을 이루었다. 1928년에 원산의 한 석유 회사에서 일본인 감독관이 한국인 노동자를 구타하면서 시작된 파업은 1929년 1월 원산 지역 노동자 총파업으로 이어졌다. 파업 기간 중 국내는 물론 국외의 노동 단체도 격려와 지지를 보내왔다. 하지만 일제가 경찰과 군대, 폭력배까지 동원하여 탄압하면서 원산 총파업은 실패로 끝났다. 1930년대 들어 노동 운동은 사회주의 세력과 연결된 비합법 조직인 혁명적 노동조합을 중심으로 전개되었다.',
      terms: [
        { label: '혁명적 노동조합', def: '1930년대 사회주의 세력과 연결된 비합법 노동 조직.' }
      ],
      timeline: [
        { y: 1928, label: '원산의 석유 회사에서 파업 시작' },
        { y: 1929, label: '◆ 원산 총파업(1.)' },
        { y: 1929, label: '광주 학생 항일 운동' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-amtae', 'k-gwangju-student']
  },
  'k-vnarod': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '브나로드 운동 — 일제의 차별적인 교육 정책으로 한국인 중 상당수가 제대로 된 교육을 받지 못하였다. 이에 한글을 보급하여 민중을 깨우치고 생활을 개선하고자 하는 문맹 퇴치 운동이 일어났다. 각지에서 노동자와 농민을 대상으로 하는 야학이 세워졌으며, 『조선일보』는 1929년부터 ‘아는 것이 힘, 배워야 산다’라는 구호 아래 문자 보급 운동을 펼쳤다. 1930년대 초에는 『동아일보』가 ‘배우자, 가르치자, 다 함께 브나로드’라는 구호 아래 학생이 참여하는 농촌 계몽 운동인 브나로드 운동을 벌였다. 조선어 학회도 강습회를 열어 한글 보급에 나섰다. 일제는 이들 운동이 민족주의적 성격을 보인다는 구실을 내세우며 1935년부터 모두 금지하였다.',
      terms: [
        { label: '브나로드', def: '‘민중 속으로’라는 뜻. 19세기 후반 러시아 지식인이 시작한 계몽 운동에서 유래하였다.' },
        { label: '문맹 퇴치 운동', def: '한글을 보급하여 민중을 깨우치고 생활을 개선하고자 한 운동.' }
      ],
      timeline: [
        { y: 1929, label: '『조선일보』 문자 보급 운동' },
        { y: 1931, label: '◆ 『동아일보』 브나로드 운동 시작' },
        { y: 1935, label: '일제, 문맹 퇴치 운동 금지' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-minrip', 'k-joseoneo']
  },
  'k-hanin': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '이봉창·윤봉길 의거 — 대한민국 임시 정부는 국민 대표 회의 이후 침체를 겪었다. 게다가 만보산 사건 등으로 한국인과 중국인 사이의 민족 감정이 악화되면서 대한민국 임시 정부의 활동은 더욱 어려워졌다. 이에 김구는 대한민국 임시 정부의 침체를 극복하고 독립운동에 활력을 불어넣고자 1931년 한인 애국단을 조직하였다. 한인 애국단의 이봉창은 1932년 1월 도쿄에서 일왕의 마차 행렬에 폭탄을 던졌다. 이 의거는 비록 실패하였지만 일제에 큰 충격을 주었다. 이후 한인 애국단의 윤봉길이 상하이 훙커우 공원에서 열린 일왕의 생일 및 상하이 점령 기념 축하식 단상에 폭탄을 던져 많은 일제 장성과 고관을 살상하였다(1932. 4.). 윤봉길의 의거는 국내외의 관심을 불러일으켰으며, 이를 계기로 중국 국민당 정부는 대한민국 임시 정부를 인정하고 지원을 강화하였다.',
      terms: [
        { label: '한인 애국단', def: '1931년 김구가 대한민국 임시 정부의 침체를 극복하고 독립운동에 활력을 불어넣고자 조직하였다.' },
        { label: '만보산 사건', def: '1931년 중국 지린 만보산 지역에서 한국인 농민과 중국인 농민이 충돌한 사건. 일제가 사건을 조작·확대하였다.' }
      ],
      timeline: [
        { y: 1931, label: '한인 애국단 조직' },
        { y: 1932, label: '◆ 이봉창 의거(1.)·윤봉길 의거(4.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-provisional', 'k-uiyeoldan', 'k-national-rep']
  },
  'k-minhyeok': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '조선 민족 혁명당 — 일제가 만주를 점령하자 많은 독립군이 중국 관내로 이동하였다. 이에 독립운동 세력을 통합하여 난징에서 조선 민족 혁명당(민족 혁명당)이 세워졌다(1935). 조선 민족 혁명당은 의열단, 조선 혁명당, 한국 독립당, 신한 독립당 등이 결성하였으며, 민족주의 세력과 사회주의 세력 대부분을 통합한 중국 관내 최대 규모의 민족 통일 전선 정당이었다. 하지만 김구 등은 대한민국 임시 정부의 약화를 우려하여 참여하지 않았다. 한편 김원봉 중심의 의열단 계열이 조선 민족 혁명당을 주도하게 되자 민족주의 세력 일부도 이탈하였다. 중·일 전쟁이 일어나자 조선 민족 혁명당은 다른 단체들을 통합하여 조선 민족 전선 연맹을 결성하였다.',
      terms: [
        { label: '조선 민족 전선 연맹', def: '중·일 전쟁 이후 조선 민족 혁명당이 다른 단체들을 통합하여 결성하였다. 그 아래에 조선 의용대를 창설하였다.' }
      ],
      timeline: [
        { y: 1931, label: '만주 사변' },
        { y: 1935, label: '◆ 조선 민족 혁명당 결성' },
        { y: 1938, label: '조선 의용대 창설' },
        { y: 1942, label: '김원봉 등 대한민국 임시 정부 합류' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-uiyeoldan', 'k-uiyongdae', 'k-provisional']
  },
  'k-oath': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '황국 신민 서사 — 일제는 한국인을 침략 전쟁에 본격적으로 동원하고자 민족 말살 정책을 시행하였다. 이에 ‘일본(내)과 조선(선)이 하나(내선일체)’라고 하거나 ‘일본인과 한국인의 조상은 같다(일선동조론)’라고 주장하는 등 한국인을 일본인으로 동화시키려고 하였다. 일제는 한국인들을 세뇌하여 일왕에 충성하는 백성으로 만들기 위해 어린 학생에게까지 황국 신민 서사라는 충성 맹세문을 억지로 외우게 하였다. 학교, 관공서, 은행, 회사 등 모든 직장의 회의와 심지어는 결혼식 때에도 강제로 제창하게 하였다. 매일 아침 일본 궁성을 향해 허리 숙여 절하도록 하였으며(궁성요배), 전국에 일본의 신과 조상을 숭배하는 신사를 세우고 참배할 것을 강요하였다. 소학교의 명칭도 ‘황국 신민 학교’라는 뜻의 국민학교로 바꾸었다.',
      terms: [
        { label: '내선일체', def: '‘일본(내)과 조선(선)이 하나’라는 주장.' },
        { label: '궁성요배', def: '매일 아침 일본 궁성을 향해 허리 숙여 절하게 한 것.' },
        { label: '신사 참배', def: '일본의 신과 조상을 숭배하는 신사에 참배하게 한 것. 이를 거부하는 사람은 감옥에 가두기도 하였다.' }
      ],
      timeline: [
        { y: 1937, label: '중·일 전쟁 발발' },
        { y: 1937, label: '◆ 황국 신민 서사 제정' },
        { y: 1941, label: '국민학교령 제정' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-era-malsal', 'k-soshi', 'k-mobilization']
  },
  'k-uiyongdae': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '조선 의용대 — 중·일 전쟁이 일어나자 조선 민족 혁명당은 다른 단체들을 통합하여 조선 민족 전선 연맹을 결성하였다. 그리고 중국 국민당 정부의 지원을 받아 조선 민족 전선 연맹 아래에 조선 의용대를 창설하였다(1938). 조선 의용대는 중국 관내에서 결성한 최초의 한국인 무장 단체로 정보 수집, 포로 신문, 후방 교란 등 활동을 하였다. 한편 조선 의용대의 일부는 일제와 직접 맞서 싸우기 위해 화북으로 이동하여 조선 의용대 화북 지대를 결성하였다. 조선 의용대 화북 지대는 호가장 전투 등에서 큰 성과를 거두었다. 화북으로 이동하지 않은 조선 의용대 일부는 한국광복군에 합류하였다.',
      terms: [
        { label: '김원봉', def: '황푸 군관 학교를 졸업한 뒤 중국 국민당의 지원을 받아 조선 혁명 간부 학교를 세웠다. 이후 한국광복군 부사령관이 되었다.' },
        { label: '조선 의용대 화북 지대', def: '1941년 화북으로 이동한 조선 의용대가 결성하였으며, 1942년 조선 의용군으로 개편되었다.' }
      ],
      timeline: [
        { y: 1938, label: '◆ 조선 의용대 창설' },
        { y: 1941, label: '조선 의용대 화북 지대 결성(7.)·호가장 전투(12.)' },
        { y: 1942, label: '조선 의용대 일부, 한국광복군에 편입(5.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-minhyeok', 'k-gwangbokgun', 'k-hwabuk']
  },
  'k-soshi': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '일본식 성명 강요 — 일제는 한국인의 민족의식을 말살하기 위해 학교와 관공서에서 한국어 사용을 금지하고 일본어만 사용하게 하였다. 1938년 제3차 조선 교육령으로 조선어 수업이 사실상 폐지되었으며, 『조선일보』, 『동아일보』 등 한글 신문도 폐간하였다. 이에 더해 일제는 한국인의 성과 이름을 일본식으로 바꿀 것을 강요하였다. 이를 거부한 사람은 식량 및 물자 배급에서 제외되었으며, 자녀를 학교에 입학시킬 수도 없었다.',
      terms: [
        { label: '제3차 조선 교육령', def: '1938년. 조선어 수업이 사실상 폐지되었고 학교의 명칭이 일본인 학교와 동일하게 국민학교로 바뀌었다.' }
      ],
      timeline: [
        { y: 1938, label: '제3차 조선 교육령' },
        { y: 1940, label: '◆ 일본식 성명 강요 시작' },
        { y: 1942, label: '조선어 학회 사건' },
        { y: 1943, label: '제4차 조선 교육령(조선어 수업 완전 폐지)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-oath', 'k-joseoneo', 'k-era-malsal']
  },
  'k-founding-plan': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '대한민국 건국 강령 — 아시아·태평양 전쟁 발발 직전인 1941년 대한민국 임시 정부는 일제의 패망에 대비하여 대한민국 건국 강령을 발표하였다. 조소앙의 삼균주의에 기초한 건국 강령은 민주 공화정 수립, 토지 개혁, 대기업 국유화, 무상 교육 등의 내용을 담고 있었다. 건국 강령은 총강·복국·건국의 3장 24개 항으로 구성되어 있다. 이는 8·15 광복 이후 대한민국 정부 수립과 제헌 헌법 제정에 큰 영향을 끼쳤다.',
      terms: [
        { label: '삼균주의', def: '개인과 개인, 민족과 민족, 국가와 국가 간의 균등을 실현하기 위해 정치·경제·교육의 균등을 이루어야 한다는 사상.' }
      ],
      timeline: [
        { y: 1940, label: '한국광복군 창설' },
        { y: 1941, label: '◆ 대한민국 건국 강령 발표' },
        { y: 1941, label: '대일 선전 성명서 발표' },
        { y: 1948, label: '제헌 헌법 선포' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-provisional', 'k-gwangbokgun', 'k-rok']
  },
  'k-joseoneo': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '조선어 학회 사건 — 1921년 우리말과 글을 연구하기 위해 조선어 연구회가 조직되었다. 조선어 연구회는 『한글』 잡지를 발행하고 강습회를 여는 등 한글 보급에 노력하였으며, 한글 창제 기념일로 ‘가갸날(한글날)’을 제정하였다. 1931년 조선어 연구회는 조선어 학회로 이름을 바꾸고 한글 사전을 만들어 우리말과 글을 체계화하려고 하였다. 이에 우선 한글 맞춤법 통일안과 표준어를 제정하고, 이를 기초로 『조선말 큰사전』 편찬에 나섰다. 이에 일제는 1942년 조선어 학회 사건을 조작하여 조선어 학회 회원들을 체포·투옥하고 강제로 해산하였다. 이 과정에서 한징, 이윤재 등이 옥사하였다.',
      terms: [
        { label: '조선어 연구회', def: '1921년 우리말과 글을 연구하기 위해 조직되었다. 1931년 조선어 학회로 이름을 바꾸었다.' },
        { label: '『조선말 큰사전』', def: '조선어 학회 사건으로 원고가 압수되었으나 광복 이후 경성역 창고에서 발견되어 1947년 1권이 발간되었다.' }
      ],
      timeline: [
        { y: 1921, label: '조선어 연구회 조직' },
        { y: 1931, label: '조선어 학회로 개칭' },
        { y: 1942, label: '◆ 조선어 학회 사건' },
        { y: 1947, label: '『조선말 큰사전』 1권 발간' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-vnarod', 'k-soshi', 'k-era-malsal']
  },
  'k-hwabuk': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '건국 강령',
          '보통 선거 시행, 국민 기본권 확보',
          '남녀 평등, 대기업 국유화',
          '토지 분배, 의무 교육 실시',
          '북한 정권 수립 과정에서 와해'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '화북 조선 독립 동맹 — 1942년에 중국 화북 지역에서 한국인 사회주의자들이 중심이 되어 화북 조선 독립 동맹을 결성하였다. 화북 조선 독립 동맹은 조선 의용대 화북 지대를 조선 의용군으로 개편하고 군사 조직으로 삼았다. 조선 의용군은 옌안으로 이동하여 중국 공산당의 팔로군 등과 함께 일본군에 맞서 싸웠다. 한편 화북 조선 독립 동맹은 민주 공화국 수립, 토지 분배, 의무 교육 등을 내용으로 하는 강령을 발표하였다. 대한민국 임시 정부는 화북 조선 독립 동맹과도 연대를 추진하였으나, 일제의 항복으로 이루어지지는 못하였다.',
      terms: [
        { label: '조선 의용군', def: '조선 의용대 화북 지대를 개편한 화북 조선 독립 동맹의 군사 조직.' }
      ],
      timeline: [
        { y: 1941, label: '조선 의용대 화북 지대 결성' },
        { y: 1942, label: '◆ 화북 조선 독립 동맹 결성·조선 의용군 개편' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-uiyongdae', 'k-provisional', 'k-geonguk']
  },
  'k-geonguk': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '**여운형** 조직',
          '민족주의+사회주의 = 민족 연합 전선',
          '건국 강령',
          '민주주의 원칙, 노농 대중 해방'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '조선 건국 동맹 — 국내에서는 여운형이 중심이 되어 조선 건국 동맹을 결성하였다(1944). 조선 건국 동맹은 전국으로 조직을 확대하고 일제의 징병·징용, 공출 등을 방해하였다. 또한 대한민국 임시 정부 및 화북 조선 독립 동맹 등과 연계하여 국내외에서 무장봉기를 일으킬 계획을 세웠으나 일제의 패망으로 실행에 옮기지 못하였다. 한편 조선 건국 동맹은 일제 타도를 위한 대동단결, 민주주의 원칙에 바탕을 둔 국가 건설 등을 목표로 하는 강령을 발표하였다. 광복 이후에는 조선 건국 준비 위원회로 개편되었다.',
      terms: [
        { label: '조선 건국 준비 위원회', def: '광복 직후 여운형이 조선 건국 동맹을 중심으로 좌우를 통합해 조직하였다(건준).' }
      ],
      timeline: [
        { y: 1944, label: '◆ 조선 건국 동맹 결성' },
        { y: 1945, label: '8·15 광복·조선 건국 준비 위원회 조직' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-hwabuk', 'k-provisional', 'k-liberation', 'k-geonjun']
  },
  'k-mobilization': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '국가 총동원법 — 일제는 대공황 이후 만주를 침략하여 농업과 원료 공급 지대로 삼았으며, 한국을 군수 물자 보급 기지로 삼으려 하였다. 중·일 전쟁 발발 이후 일제는 전쟁에 필요한 물자를 생산하기 위해 병참 기지화 정책을 본격적으로 실시하였다. 1938년 일제는 국가 총동원법을 제정하여 본격적으로 침략 전쟁에 필요한 인력과 물자 수탈에 나섰다. 또한 일본에서 실시한 국민정신 총동원 운동을 한국에서도 실시하였으며, 말단 기구인 애국반을 통해 각종 정책을 선전하고 한국인의 일상생활을 통제하였다. 징병·징용 등으로 수많은 한국인이 일제의 침략 전쟁에 끌려갔으며, 1944년에는 징병제를 실시하였다. 공출이라는 이름으로 식량뿐만 아니라 농기구, 수저 등 각종 생활용품을 빼앗아 군수 물자를 생산하였다. 일제는 한국을 비롯한 식민지와 점령지의 여성들을 일본군 ‘위안부’로 강제 동원하였다.',
      terms: [
        { label: '애국반', def: '국민정신 총동원 운동의 말단 기구. 10개 집을 하나로 묶어 조직하였다.' },
        { label: '공출', def: '식량뿐만 아니라 농기구, 수저 등 각종 생활용품을 빼앗아 군수 물자를 생산한 것.' },
        { label: '병참 기지화 정책', def: '중·일 전쟁 이후 전쟁에 필요한 물자를 생산하기 위해 한국의 산업을 군수 산업 위주로 개편한 정책.' }
      ],
      timeline: [
        { y: 1937, label: '중·일 전쟁 발발' },
        { y: 1938, label: '◆ 국가 총동원법 제정' },
        { y: 1944, label: '징병제 실시·여자 정신 근로령 발표' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-era-malsal', 'k-oath', 'k-soshi', 'e-manchuria']
  },
  'k-gwangbokgun': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '한국광복군 창설 — 1940년 충칭에 정착한 대한민국 임시 정부는 일제와의 전쟁에 대비하여 지청천을 사령관으로 정규군인 한국광복군을 창설하였다. 그리고 강력한 지도력을 발휘할 수 있도록 주석을 중심으로 조직을 개편하고 김구를 주석으로 선출하였다. 1942년에는 김원봉 등 조선 민족 혁명당 계열 인사도 대한민국 임시 정부에 합류하였으며, 화북으로 이동하지 않은 조선 의용대 일부도 한국광복군에 합류하였다. 1941년에 일제가 아시아·태평양 전쟁을 일으키자 대한민국 임시 정부는 대일 선전 성명서를 발표하여 일제에 선전 포고를 하였다. 한국광복군은 미얀마·인도 전선에 공작대를 파견하였으며, 미국 전략 사무국(OSS)과 함께 국내 진공 작전을 준비하였다.',
      terms: [
        { label: '대일 선전 성명서', def: '1941년 대한민국 임시 정부가 일제에 선전 포고를 한 성명서.' },
        { label: '국내 진공 작전', def: '한국광복군이 미국 전략 사무국(OSS)과 함께 준비한 작전. 일제가 항복하면서 실행하지 못하였다.' }
      ],
      timeline: [
        { y: 1940, label: '◆ 한국광복군 창설' },
        { y: 1941, label: '대일 선전 성명서 발표' },
        { y: 1942, label: '조선 의용대 일부, 한국광복군에 편입' },
        { y: 1945, label: '8·15 광복' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-provisional', 'k-uiyongdae', 'k-founding-plan', 'k-liberation']
  },
  // ── 광복 ~ 6·25 전쟁 (2026-10-10) — 개요: 동아출판 한국사2 Ⅱ-1·2 본문 / 정리: 사용자 정리본 ──
  'k-geonjun': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '여운형+안재홍 = 좌우 합작',
          '전국 지부 설치',
          '치안 유지 및 행정',
          '조선 인민 공화국 선포',
          '전국 지부 → 인민 위원회 개편',
          '미국·소련 미승인',
          '민족 주의 세력 일부 이탈'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '조선 건국 준비 위원회 — 일본 항복 직전 여운형은 조선 총독부와 합의하여 일본인의 안전 귀환을 보장하고 치안 유지, 생활 안정을 위한 5개 조항을 확인받았다. 광복 직후 여운형은 조선 건국 동맹을 중심으로 좌익과 우익을 아울러 조선 건국 준비 위원회(건준)를 조직하였다. 건준은 전국에 지부와 치안대를 조직하고 식량과 생활필수품을 확보하는 등 사회 안정에 힘썼다. 그리고 한국인을 대표해 미군과 협상하려고 조선 인민 공화국 수립을 선포하고 각 지부를 인민 위원회로 전환하였다. 그러나 이 과정에서 좌익 세력이 주도권을 장악하자 일부 우익 세력이 건준을 탈퇴하였다. 미군정은 미군정만이 38도선 이남의 유일한 정부임을 밝히고 대한민국 임시 정부, 조선 인민 공화국 등의 대표성을 모두 인정하지 않았다.',
      terms: [
        { label: '조선 인민 공화국', def: '미군이 인천에 들어온 9월 8일 직전인 9월 6일에 선포하였다. 주석 이승만, 부주석 여운형 등으로 내각을 구성하였으나 좌익 세력이 대다수를 차지하였고, 귀국한 이승만은 취임을 거부하였다.' },
        { label: '인민 위원회', def: '조선 인민 공화국의 지부로 도, 시, 군, 면 단위로 조직되었다.' },
        { label: '조선 건국 준비 위원회 강령', def: '완전한 독립 국가 건설, 민주주의 정권 수립, 일시적 과도기의 국내 질서 자주적 유지와 대중 생활의 확보를 목표로 하였다.' }
      ],
      timeline: [
        { y: 1944, label: '조선 건국 동맹 결성' },
        { y: 1945, label: '◆ 조선 건국 준비 위원회 조직(8.)' },
        { y: 1945, label: '조선 인민 공화국 수립 선포(9.)' },
        { y: 1945, label: '미군정 시작(9.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-geonguk', 'k-liberation', 'k-moscow']
  },
  'k-moscow': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '한국인 구성 임시 정부 수립',
          '미·소 공동 위원회 설치',
          '**신탁 통치** 제안',
          '미국·소련·영국(+중국)',
          '최장 5년간 통치 후 독립'
        ] },
        { list: [
          '우익의 반응',
          '김구, 이승만',
          '신탁 통치 반대',
          '좌익의 반응',
          '박헌영',
          '반대 → 지지'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '모스크바 3국 외상 회의 — 1945년 12월, 미국, 영국, 소련의 외무 장관이 모스크바에 모여 제2차 세계 대전 이후의 국제 문제를 논의하였다. 이 회의에서 한국에 정부를 수립하는 방법을 두고 미국이 신탁 통치 후 정부 수립을 제안하자, 소련은 임시 정부를 먼저 수립한 뒤 임시 정부와 함께 신탁 통치를 논의하자고 하였다. 회의 결과 미국과 소련의 의견을 절충하여 한반도에 민주주의 임시 정부를 수립하고, 미·소 공동 위원회를 설치하여 이를 협의하기로 하였다. 이와 함께 한국에 최대 5년간의 신탁 통치를 실시하기로 결정하였다. 회의 결과가 국내로 전해지는 과정에서 소련이 신탁 통치를, 미국은 즉시 독립을 주장했다는 보도가 퍼졌다. 김구, 이승만 등 우익 세력은 신탁 통치가 한국인의 자주권을 부정하는 것이라고 비판하면서 거세게 신탁 통치 반대(반탁) 운동을 벌였다. 좌익 세력도 처음에는 신탁 통치에 반대하였으나, 회의의 모든 결정 사항을 파악한 후에는 총체적으로 지지하는 쪽으로 입장을 바꾸었다. 여운형 등 중도 세력은 빨리 민주주의 임시 정부를 세우기 위해 미·소 공동 위원회에 적극 협조하고, 신탁 통치는 나중에 논의하자고 주장하였다.',
      terms: [
        { label: '신탁 통치', def: '일정한 지역이 자체 통치 능력을 갖출 때까지 유엔의 위임을 받은 국가가 유엔의 감독 아래 대신 통치해 주는 제도.' },
        { label: '미·소 공동 위원회', def: '한국의 민주주의 임시 정부 조직을 돕기 위해 설치하기로 한 기구.' },
        { label: '반탁 운동', def: '김구, 이승만 등 우익 세력이 신탁 통치가 한국인의 자주권을 부정한다며 벌인 신탁 통치 반대 운동.' }
      ],
      timeline: [
        { y: 1945, label: '◆ 모스크바 3국 외상 회의(12.)' },
        { y: 1946, label: '북조선 임시 인민 위원회 조직(2.)' },
        { y: 1946, label: '제1차 미·소 공동 위원회 개최(3.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-geonjun', 'k-jointcomm1', 'k-liberation', 'w-moscow']
  },
  'k-jointcomm1': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '한국 측 협의 대상 자격 분쟁',
          '미국: 모든 정치 세력 참여',
          '소련: 3상 회의 지지 단체만 참여',
          '입장 차이로 인해 휴회'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '제1차 미·소 공동 위원회 — 신탁 통치를 둘러싸고 우익과 좌익이 격렬하게 대립하는 가운데, 미국과 소련은 모스크바 3국 외상 회의에서 결정된 민주주의 임시 정부 수립 방안을 논의하고자 1946년 3월에 서울 덕수궁에서 제1차 미·소 공동 위원회를 열었다. 이 회의에서 미국과 소련은 민주주의 임시 정부 수립에 참여할 정당과 사회단체의 범위를 놓고 대립하였다. 소련은 민주주의 임시 정부 수립을 위한 협의 대상에 모스크바 3국 외상 회의 결정을 지지하는 정당과 사회단체만 참여시키자고 주장하였다. 이에 맞서 미국은 의사 표현의 자유를 내세우면서 참여를 희망하는 모든 정당과 사회단체를 포함하자고 주장하였다. 결국 미국과 소련의 주장이 맞서면서 제1차 미·소 공동 위원회는 아무런 성과를 거두지 못하고 휴회되었다.',
      terms: [
        { label: '협의 대상', def: '민주주의 임시 정부 수립을 위한 협의에 참여할 정당과 사회단체. 소련은 3국 외상 회의 결정을 지지하는 단체만, 미국은 참여를 희망하는 모든 단체를 주장하였다.' },
        { label: '덕수궁 석조전', def: '미·소 공동 위원회가 개최된 곳. 태극기와 함께 미국과 소련의 국기가 게양되었다.' }
      ],
      timeline: [
        { y: 1945, label: '모스크바 3국 외상 회의(12.)' },
        { y: 1946, label: '◆ 제1차 미·소 공동 위원회 개최(3.)' },
        { y: 1946, label: '제1차 미·소 공동 위원회 무기한 휴회 선언(5.)' },
        { y: 1946, label: '이승만, 정읍 발언(6.)' },
        { y: 1947, label: '제2차 미·소 공동 위원회 개최(5.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-moscow', 'k-jwau', 'k-jointcomm2', 'w-jointcomm1']
  },
  'k-jwau': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '여운형+김규식',
          '미군정의 지원',
          '**좌우 합작 7원칙**(1946)',
          '미·소 공동 위원회 재개',
          '남북 망라한 임시 정부 수립',
          '토지 개혁: 유상 매상·무상 분배',
          '친일 반민족 행위자 처벌',
          '좌우 양측 비협조, 미군정 관심 X',
          '여운형 암살 → 운동 중단'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '좌우 합작 운동 — 신탁 통치를 둘러싼 좌우 대립이 거세지고 제1차 미·소 공동 위원회가 무기한 휴회되는 상황 속에서, 이승만은 통일 정부 수립이 어렵다면 남한만이라도 임시 정부를 수립할 것을 주장하였다(정읍 발언). 한편 여운형과 김규식 등 중도 세력은 좌우 합작 위원회를 구성하여 통일 정부 수립 운동을 펼쳤다. 미군정도 한국인의 지지를 얻고 소련과의 협상에서 유리한 위치를 차지하려고 좌우 합작 위원회를 지원하였다. 그러나 김구, 이승만, 한국 민주당 등의 우익 세력, 박헌영 등의 좌익 세력은 좌우 합작 위원회에 참여하지 않았다. 좌우 합작 위원회는 토지 개혁과 친일파 처벌 등에 대한 좌우익의 의견을 절충하여 좌우 합작 7원칙을 발표하였다. 한국 민주당은 유상 매입, 유상 분배 방식의 토지 개혁을 주장하면서, 좌익 세력도 무상 몰수, 무상 분배 방식의 토지 개혁과 친일 민족 반역자 즉시 처단을 주장하면서 좌우 합작 7원칙에 반대하였다. 이후 트루먼 독트린이 발표되는 등 냉전이 진행되면서 미군정이 좌우 합작 운동에 대한 지지를 철회하였다. 그리고 여운형이 암살되면서 좌우 합작 운동은 중단되었다(1947. 7.).',
      terms: [
        { label: '좌우 합작 7원칙', def: '좌우 합작 위원회가 좌우익의 의견을 절충하여 발표하였다. 3상 회의 결정에 따른 민주주의 임시 정부 수립, 미·소 공동 위원회 재개, 토지 개혁, 친일 민족 반역자 처벌 등의 내용을 담았다.' },
        { label: '남조선 과도 입법 의원', def: '좌우 합작 7원칙을 토대로 구성된 광복 이후 최초의 대의 정치 기관.' },
        { label: '정읍 발언', def: '1946년 이승만이 남한만이라도 임시 정부를 수립할 것을 주장한 발언.' }
      ],
      timeline: [
        { y: 1946, label: '제1차 미·소 공동 위원회 무기한 휴회 선언(5.)' },
        { y: 1946, label: '이승만, 정읍 발언(6.)' },
        { y: 1946, label: '◆ 좌우 합작 위원회 조직(7.)' },
        { y: 1946, label: '좌우 합작 7원칙 발표(10.)' },
        { y: 1947, label: '여운형 암살 — 좌우 합작 운동 중단(7.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-jointcomm1', 'k-jeongeup', 'k-jointcomm2', 'k-geonjun']
  },
  'k-jointcomm2': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '한국 측 협의 대상 자격 분쟁',
          '입장 차이 재확인 → 결렬'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '제2차 미·소 공동 위원회 — 미국과 소련은 1947년 5월에 제2차 미·소 공동 위원회를 열었다. 하지만 회의는 아무런 성과를 거두지 못하였다. 이에 미국이 한반도 문제를 유엔 총회에 넘기자, 소련은 모스크바 3국 외상 회의 결정 위반이라고 반발하면서 유엔 총회에 불참하였다. 유엔 총회는 미국의 제안대로 유엔 감시하에 인구 비례에 따른 남북한 총선거를 실시하여 한반도에 정부를 세울 것을 결정하였다.',
      terms: [
        { label: '미·소 공동 위원회', def: '모스크바 3국 외상 회의 결정에 따라 한국의 민주주의 임시 정부 수립 방안을 논의한 미국과 소련의 회의.' }
      ],
      timeline: [
        { y: 1946, label: '제1차 미·소 공동 위원회 개최(3.)' },
        { y: 1947, label: '◆ 제2차 미·소 공동 위원회 개최(5.)' },
        { y: 1947, label: '유엔 총회, 남북 총선거안 결의(11.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-jointcomm1', 'k-un-ga', 'w-coldwar', 'w-jointcomm2']
  },
  'k-un-ga': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '유엔 감시하 남북 총선거',
          '**인구 비례 총선거**',
          '이후 유엔 한국 임시 위원단 파견 → 소련의 입북 거부'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '유엔 총회 — 제2차 미·소 공동 위원회가 성과 없이 끝나자 미국이 한반도 문제를 유엔 총회에 넘겼다. 소련은 모스크바 3국 외상 회의 결정 위반이라고 반발하면서 유엔 총회에 불참하였다. 유엔 총회는 미국의 제안대로 유엔 감시하에 인구 비례에 따른 남북한 총선거를 실시하여 한반도에 정부를 세울 것을 결정하였다. 이를 위해 유엔 한국 임시 위원단이 한반도에 파견되었지만, 소련은 위원단의 38도선 이북 방문을 거부하였다.',
      terms: [
        { label: '유엔 한국 임시 위원단', def: '유엔 감시하의 총선거를 위해 한반도에 파견되었다. 호주, 캐나다, 중국(중화민국), 엘살바도르, 프랑스, 인도, 필리핀, 시리아의 8개국으로 구성되었다.' },
        { label: '인구 비례 총선거', def: '인구 비례에 따른 남북한 총선거. 1948년 당시 남한의 인구가 약 2.1배 많았다.' }
      ],
      timeline: [
        { y: 1947, label: '제2차 미·소 공동 위원회 개최(5.)' },
        { y: 1947, label: '◆ 유엔 총회, 남북 총선거안 결의(11.)' },
        { y: 1948, label: '유엔 한국 임시 위원단 내한(1.)' },
        { y: 1948, label: '유엔 소총회, 선거 감시가 가능한 지역에서만 우선 선거 결의(2.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-jointcomm2', 'k-un-little', 'w-un', 'w-un-ga']
  },
  'k-un-little': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '선거 가능 지역 총선거',
          '38도선 이남 지역 총선거 → 5·10 총선거 결정'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '유엔 소총회 — 유엔 총회의 결정에 따라 유엔 한국 임시 위원단이 한반도에 파견되었지만, 소련은 위원단의 38도선 이북 방문을 거부하였다. 결국 유엔은 소총회를 열어 선거 감시가 가능한 지역에서만 선거를 치르기로 결정하였다. 소총회는 유엔 총회의 소집이 어려울 때 총회의 기능을 대신하기 위해 세운 기구로, 여기서 찬성 31표, 기권 11표, 반대 2표로 선거 감시 가능 지역 선거가 결정되었다. 남한만의 단독 선거가 결정되자 김구와 김규식 등은 통일 정부 수립을 위해 김일성 등 북한 지도부에 회담을 제안하였다.',
      terms: [
        { label: '소총회', def: '유엔 총회의 소집이 어려울 때 총회의 기능을 대신하기 위해 세운 기구.' },
        { label: '선거 감시 가능 지역 선거', def: '유엔 한국 임시 위원단이 접근할 수 있는 지역, 곧 38도선 이남 지역에서 선거를 치르기로 한 결정.' }
      ],
      timeline: [
        { y: 1948, label: '유엔 한국 임시 위원단 내한(1.)' },
        { y: 1948, label: '◆ 유엔 소총회, 선거 감시가 가능한 지역에서만 우선 선거 결의(2.)' },
        { y: 1948, label: '남북 협상(4.)' },
        { y: 1948, label: '5·10 총선거' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-un-ga', 'k-samcheonman', 'k-nambuk', 'k-510', 'w-un-little']
  },
  'k-jeju43': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '제주 4·3 사건 — 1947년 3월 1일, 제주에서는 삼일절 기념행사가 끝난 뒤 통일 정부 수립을 요구하는 시위가 열렸다. 이 시위에서 경찰이 총을 쏘아 사상자가 발생하였고, 이에 반발하여 제주도 전역에서 총파업이 일어났다. 사건 수습 과정에서 미군정이 제주도민을 탄압하면서 미군정에 대한 반감이 높아졌다. 이러한 상황에서 1948년 4월 3일, 제주도의 좌익 세력이 단독 선거 반대, 통일 정부 수립을 내세우며 무장봉기를 일으켰다. 이를 군대와 경찰, 우익 단체 등을 동원하여 무력으로 제압하는 과정에서 제주도의 수많은 민간인이 희생되었다. 『제주 4·3 사건 진상 조사 보고서』에서는 공식적으로 민간인 희생자를 1만 4천여 명으로 추산했으며, 최대 3만 명에 이르는 민간인이 희생되었을 것으로 추정하기도 하였다. 제주 4·3 사건은 일어난 뒤에도 한동안 언급·논의가 금기시되었으며, 왜곡되어 알려졌다.',
      terms: [
        { label: '삼일절 발포 사건', def: '1947년 삼일절 기념식이 끝나고 일어난 통일 정부 수립 요구 시위에서 경찰이 발포하여 민간인 6명이 사망한 사건.' },
        { label: '제주 4·3 사건 진상 조사 보고서', def: '2003년 확정되었다. 민간인 희생자를 공식적으로 1만 4천여 명으로 추산하였다.' }
      ],
      timeline: [
        { y: 1947, label: '삼일절 발포 사건(3. 1.)' },
        { y: 1948, label: '◆ 무장봉기 발발(4. 3.)' },
        { y: 1948, label: '5·10 총선거 — 제주도 2곳 선거구 투표 무효' },
        { y: 1948, label: '계엄 발표·초토화 작전 개시(11. 17.)' },
        { y: 1954, label: '한라산 통행금지 해제(9. 21.)' },
        { y: 1999, label: '진상 규명 및 희생자 명예 회복에 관한 특별법 국회 통과(12.)' },
        { y: 2003, label: '진상 조사 보고서 확정·대통령 사과(10.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-un-little', 'k-510', 'k-yeosun']
  },
  'k-nambuk': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '남북 협상 — 남한만의 단독 선거가 결정되자 김구와 김규식 등은 통일 정부 수립을 위해 김일성 등 북한 지도부에 회담을 제안하였다. 1948년 4월에는 김구와 김규식이 38도선을 넘어 평양에서 북한 지도부와 남북 협상을 가졌다. 협상 결과 단독 선거 반대, 미·소 군대 철수를 요구하는 공동 성명이 채택되었다. 그러나 미국과 소련 모두 공동 성명을 무시하였으며, 북한 역시 독자적인 정권 수립을 추진하고 있었다. 유엔도 단독 선거 결정을 철회하지 않았다. 김구, 김규식 등 남북 협상파는 5·10 총선거에 참여하지 않았다.',
      terms: [
        { label: '남북 협상 공동 성명', def: '1948년 채택. 외국 군대의 즉시 동시 철거와 남조선 단독 선거 반대를 밝혔다.' },
        { label: '삼천만 동포에게 읍고함', def: '김구가 단독 정부를 세우는 데는 협력하지 않겠다고 밝힌 성명(1948).' }
      ],
      timeline: [
        { y: 1948, label: '유엔 소총회 결의(2.)' },
        { y: 1948, label: '김구, 삼천만 동포에게 읍고함(2.)' },
        { y: 1948, label: '◆ 남북 협상(4.)' },
        { y: 1948, label: '5·10 총선거' },
        { y: 1949, label: '김구 암살(6.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-un-little', 'k-samcheonman', 'k-510', 'k-jwau']
  },
  'k-510': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '직접·평등·비밀·보통 원칙',
          '21세 이상 모든 국민 투표권',
          '우리나라 최초 민주 선거',
          '제주도 선거구 2개 제외'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '5·10 총선거 — 1948년 5월 10일, 유엔 한국 임시 위원단의 감시 아래 국회의원을 뽑기 위한 총선거가 남한에서 실시되었다. 5·10 총선거는 만 21세 이상 국민이 보통·평등·직접·비밀 선거의 원칙에 따라 참여한 우리 역사 최초의 민주 선거였다. 그러나 김구, 김규식 등 남북 협상파와 일부 좌익 세력은 선거에 참여하지 않았다. 총선거로 제주도 2곳을 제외한 선거구에서 198명의 국회의원이 선출되었으며, 38도선 이북 지역의 국회의원은 선거가 가능해질 때 선출하기로 하였다. 5·10 총선거로 구성된 제헌 국회는 나라 이름을 대한민국으로 정하고, 제헌 헌법을 제정하여 선포하였다(1948. 7. 17.).',
      terms: [
        { label: '제헌 국회', def: '5·10 총선거로 구성되어 헌법을 만든 국회. 국회의원 임기는 2년이었다.' },
        { label: '국회의원 선거법', def: '1948년 3월 미 군정청이 발표하였다. 만 25세 이상에게 피선거권을 주었으며, 친일 세력에게는 선거권과 피선거권을 주지 않았다.' }
      ],
      timeline: [
        { y: 1948, label: '유엔 소총회 결의(2.)' },
        { y: 1948, label: '남북 협상(4.)' },
        { y: 1948, label: '◆ 5·10 총선거' },
        { y: 1948, label: '제헌 헌법 공포(7. 17.)' },
        { y: 1949, label: '제주도 2곳 선거구 국회의원 재선거(5. 10.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-un-little', 'k-nambuk', 'k-jeju43', 'k-constitution', 'k-rok']
  },
  'k-yeosun': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '여수·순천 10·19 사건 — 대한민국 정부 수립 이후인 1948년 10월, 이승만 정부는 여수에 주둔한 부대를 제주도에 파견하여 제주 4·3 사건을 진압하려고 하였다. 그러자 부대 내 좌익 세력 등이 ‘제주도 출동 반대’, ‘통일 정부 수립’ 등을 내세우며 여수·순천 지역을 점령하였다. 이들은 곧 진압되었지만, 일부는 지리산 등으로 이동하여 활동을 지속하였다. 한편 진압 과정에서 많은 민간인이 희생되었다. 이승만 정부는 이 사건을 계기로 군대 내 좌익 세력을 제거하였다. 그리고 국가 보안법을 제정하고, 국민 보도 연맹을 조직하는 등 반공 체제를 강화해 나갔다.',
      terms: [
        { label: '국가 보안법', def: '여수·순천 10·19 사건을 계기로 이승만 정부가 제정하였다(1948. 12. 공포).' },
        { label: '국민 보도 연맹', def: '사회주의 사상을 가진 사람들을 등록시켜 사상을 개조한다는 명분으로 조직한 단체. 6·25 전쟁이 일어나자 정부는 보도 연맹원을 처벌·학살하였다.' }
      ],
      timeline: [
        { y: 1948, label: '제주 4·3 사건(4.)' },
        { y: 1948, label: '대한민국 정부 수립(8. 15.)' },
        { y: 1948, label: '◆ 여수·순천 10·19 사건(10.)' },
        { y: 1948, label: '국가 보안법 공포(12.)' },
        { y: 2021, label: '진상 규명 및 희생자 명예 회복에 관한 특별법 국회 통과' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-jeju43', 'k-rok', 'k-gov-rhee']
  },
  'k-625': {
    notes: {   // 정리 — 사용자 정리본 그대로
      sections: [
        { list: [
          '배경',
          '소련과 중국의 북한 원조, 애치슨 선언(1950)',
          '전개: 북한의 기습 남침',
          'UN군 참전, 국군 작전권 이관',
          '낙동강 방어선: 임시 수도 부산',
          '**인천 상륙 작전**',
          '서울 수복',
          '중국군 개입',
          'UN군 최대 북진선 형성',
          '**흥남 철수, 1·4후퇴**',
          '중국 최대 남진선 형성',
          '소련 휴전 제의',
          '휴전 회담(1951.07.): 자유 송환 VS 자동 송환',
          '이승만의 반공 포로 석방(1953.06.18.)',
          '정전 협정 조인, DMZ 형성(1953)',
          '한·미 상호 방위 조약 체결'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '6·25 전쟁 — 남과 북에 대한민국 정부와 북한 정권이 각각 들어서면서 미국과 소련은 한반도에서 군대를 철수하였다. 북한은 소련과 중국에서 군사 지원을 받고, 국·공 내전에 참여하였던 조선 의용군을 편입하여 군사력을 강화하였다. 소련은 북한의 남침 계획에 동의하였으며, 중국도 필요할 경우 참전할 것을 약속하였다. 한편 미국은 태평양 방위선에서 한반도와 타이완을 제외한다는 애치슨 선언을 발표하였다. 1950년 6월 25일 새벽, 북한군은 38도선을 넘어 기습적으로 남침을 하였다. 유엔은 안전 보장 이사회를 열어 북한을 침략자로 규정하고 유엔군 파병을 결의하였고, 미국을 중심으로 한 16개국이 유엔군으로 참전하였다. 국군과 유엔군은 인천 상륙 작전으로 전세를 역전하고 서울을 되찾은 뒤 압록강까지 진격하였다. 그러나 중국군의 개입으로 다시 서울을 빼앗기고 한강 이남으로 물러났다(1·4 후퇴). 이후 전쟁은 38도선 부근에서 교착 상태에 빠졌고, 소련의 제안으로 정전 협상이 시작되었다. 휴전선 설정, 포로 송환 방식에 대한 입장 차이로 정전 회담은 2년 동안 계속되었으며, 이승만 정부는 정전에 반대하여 반공 포로를 일방적으로 석방하기도 하였다. 1953년 7월 27일 정전 협정이 체결되어 휴전선이 정해졌으며, 비무장 지대(DMZ)가 설치되었다. 정전에 반대한 이승만 정부도 미국에서 한·미 상호 방위 조약 체결을 약속받고 정전 협정을 지키겠다고 발표하였다.',
      terms: [
        { label: '애치슨 선언', def: '미국의 국무 장관 애치슨이 발표한 태평양 방위선. 한반도와 타이완이 제외되어 있다.' },
        { label: '인천 상륙 작전', def: '국군과 유엔군이 전세를 역전시킨 작전. 낙동강 전선의 반격과 함께 북한군이 거의 와해되었다.' },
        { label: '1·4 후퇴', def: '중국군의 개입으로 국군과 유엔군이 다시 서울을 빼앗기고 한강 이남으로 물러난 일.' },
        { label: '정전 협정', def: '1953년 7월 27일 체결. 휴전선이 정해지고 비무장 지대(DMZ)가 설치되었으며, 포로 송환은 자유의사를 존중하기로 하였다.' },
        { label: '한·미 상호 방위 조약', def: '1953년 10월 체결. 이승만 정부는 이 조약 체결을 약속받고 정전 협정을 지키겠다고 발표하였다.' }
      ],
      timeline: [
        { y: 1950, label: '애치슨 선언' },
        { y: 1950, label: '◆ 6·25 전쟁 발발(6.)' },
        { y: 1950, label: '인천 상륙 작전(9.)' },
        { y: 1950, label: '중국군 참전(10.)' },
        { y: 1951, label: '1·4 후퇴' },
        { y: 1953, label: '정전 협정 체결(7. 27.)' },
        { y: 1953, label: '한·미 상호 방위 조약 체결(10.)' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gov-rhee', 'k-yeosun', 'e-prc', 'w-coldwar'],
    // 지도 — 이승만 정부 기록의 「6·25 전쟁의 전개」와 같은 지도
    map: {
      title: '6·25 전쟁의 전개',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 110 30 L 245 30 L 260 90 L 250 175 L 215 215 L 145 215 L 110 180 L 90 100 Z', label: '한반도' }
      ],
      gridLine: { y: 110, label: '38°N · 정전선' },
      pins: [
        { x: 175, y: 60, label: '북한 남침', sub: '1950.6.25', red: true },
        { x: 180, y: 145, label: '서울' },
        { x: 220, y: 200, label: '부산 교두보' },
        { x: 200, y: 100, label: '인천 상륙', sub: '1950.9', amber: true },
        { x: 175, y: 35, label: '압록강', sub: '국군 진격 최북단' }
      ],
      arrows: [
        { from: [175, 60], to: [220, 200], label: '남침' },
        { from: [200, 100], to: [175, 35], label: '북진' }
      ]
    }
  },
  // ── 경제 개발 5개년 계획 묶음 (2026-10-10) — 개요: 동아출판 한국사2 Ⅱ-4 본문 ──
  'k-era-econ12': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '제1·2차 경제 개발 5개년 계획 — 5·16 군사 정변으로 집권한 박정희 정부는 집권의 정당성을 확보하기 위해 경제 개발을 최우선 과제로 삼았다. 이에 이전 정부들의 경제 개발 계획을 바탕으로 국가 주도의 경제 개발을 추진하였다. 1960년대에는 제1·2차 경제 개발 5개년 계획(1962~1971)을 추진하면서 섬유·가발·식료품 등 노동 집약적인 경공업을 중심으로 수출 규모를 키워 나갔다. 박정희 정부는 ‘수출이 곧 애국’이라고 내세우면서 수출 기업을 적극적으로 지원하였고, 경부 고속 도로와 포항 제철소 건설을 시작하는 등 사회 간접 자본도 확충하였다. 경제 개발 과정에서 서독에 파견된 광부와 간호사의 송금, 한·일 국교 정상화, 베트남 특수로 마련한 자금이 큰 역할을 하였다. 제1·2차 경제 개발 5개년 계획으로 한국 경제는 빠르게 발전하였다. 그러나 빠른 경제 성장 과정에서 기업들이 무리하게 자금을 빌려 사업을 확장하면서 재무 구조가 취약해졌다.',
      terms: [
        { label: '국가 주도의 경제 개발', def: '1962년부터 1991년까지 6차에 걸쳐 진행된 경제 개발 계획. 제5차부터는 경제 사회 발전 5개년 계획으로 명칭이 바뀌었다.' },
        { label: '경공업', def: '섬유·가발·식료품 등 노동 집약적인 산업. 1960년대 수출의 중심이었다.' },
        { label: '경부 고속 도로', def: '1968년에 착공하여 1970년에 완공하였다.' }
      ],
      timeline: [
        { y: 1962, label: '◆ 제1차 경제 개발 5개년 계획 시작' },
        { y: 1964, label: '수출 1억 달러 돌파' },
        { y: 1967, label: '수출 3억 달러 돌파' },
        { y: 1970, label: '경부 고속 도로 개통 · 새마을 운동 시작' },
        { y: 1971, label: '수출 10억 달러 돌파' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gov-park', 'k-era-econ34', 'k-gyeongbu', 'k-saemaeul', 'k-jeontaeil']
  },
  'k-era-econ34': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '제3·4차 경제 개발 5개년 계획 — 박정희 정부는 1970년대 제3·4차 경제 개발 5개년 계획(1972~1981)을 추진하면서 철강·화학·기계·조선 등 중화학 공업을 집중 육성하였다. 그 결과 한국 경제에서 중화학 공업 생산 비중이 확대되었다. 이는 수출 증가로 이어져 1970년대에는 연평균 10%가 넘는 고도성장을 이어 나갈 수 있었다. 그러나 한국 경제는 석유 등 원자재의 대외 의존도가 높아 원자재의 가격이 오를 때마다 어려움을 겪었다. 1973년에 발생한 제1차 석유 파동은 중동 지역에 진출한 기업과 노동자들이 벌어들인 외화로 극복하였다. 하지만 1970년대 후반 일어난 제2차 석유 파동은 중화학 공업에 대한 과잉 투자와 부가 가치세 도입에 따른 물가 상승까지 겹치며 한국 경제를 크게 위협하였다. 이 과정에서 유신 체제에 대한 국민의 불만도 높아졌다.',
      terms: [
        { label: '중화학 공업', def: '철강·화학·기계·조선 등의 산업. 1970년대에 집중 육성되었다.' },
        { label: '포항 제철소', def: '대일 청구권 자금으로 1970년에 건설을 시작해 1973년에 완성하였다. 중화학 공업 성장의 기반이 되었다.' },
        { label: '석유 파동', def: '중동 지역의 정세 변화로 석유 생산량이 감소하면서 석유 가격이 폭등한 일. 제1차는 제4차 중동 전쟁, 제2차는 이란의 이슬람 혁명으로 촉발되었다.' }
      ],
      timeline: [
        { y: 1972, label: '◆ 제3차 경제 개발 5개년 계획 시작' },
        { y: 1972, label: '8·3 조치' },
        { y: 1973, label: '포항 제철소 완성 · 제1차 석유 파동' },
        { y: 1977, label: '수출 100억 달러 돌파' },
        { y: 1978, label: '제2차 석유 파동 시작' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-era-econ12', 'k-gov-park', 'k-oil1', 'k-oil2', 'k-gov-chun']
  },
  'k-gov-rhee': {
    notes: {   // 정리 — 사용자 정리본 그대로 (정치·경제·통일)
      sections: [
        { head: '정치', list: [
          '제헌 헌법',
          '대통령 간선제 → 이승만 정부 출범',
          '제헌 의회 임기 2년',
          '1차 개헌 = **발췌 개헌**(1952)',
          '반민족 행위자 옹호 → 국민 반감',
          '국민 방위군 사건, 거창 양민 학살',
          '6·25 전쟁 중 → 부산 정치 파동',
          '대통령 직선제 → 2대 이승만 당선',
          '2차 개헌 = **사사오입 개헌**(1954)',
          '초대 대통령 중임 제한 철폐',
          '사사오입 적용 → 개헌안 통과',
          '**진보당 사건**(1958): 조봉암 처형',
          '독재 체제 강화',
          '반공주의, 경향신문 폐간',
          '3·15 부정 선거(1960)',
          '자유당 정권 유지 목표',
          '부통령 이기붕 당선 위해',
          '**4·19 혁명**(1960)',
          '마산 시위 중 김주열 사망',
          '시위 전국 확산, 대학교수 시국 선언',
          '이승만 하야, 미국 망명',
          '허정 과도 정부 출범'
        ] },
        { head: '경제', list: [
          '농지 개혁(1950)',
          '경자유전 원칙',
          '**유상 매입** : 1가구 3정보 이상, 지가 증권',
          '**유상 분배** : 1년 생산량 150%, 5년 분할 상환',
          '지주·소작제 X: 식민지 지주제 청산',
          '농지 아닌 토지는 개혁 대상 제외',
          '반민족 행위자 토지 몰수 X',
          '유상 분배 부담 → 소작농',
          '귀속 재산 처리법(1949)',
          '일본인 소유 공장 등을 민간에 불하',
          '원조 경제',
          '미국의 잉여 농산물 가공 → **삼백 산업**(면화, 설탕, 밀가루)'
        ] },
        { head: '통일', list: [
          '이승만 하야 이후',
          '남북 학생 회담 요구',
          '중립화 통일론 등장',
          '전쟁 중 양민 학살 사건 조사 요구'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '이승만 정부 — 1948년 5·10 총선거로 구성된 제헌 국회가 헌법을 제정하고 이승만을 대통령으로 선출하여 대한민국 정부가 수립되었다. 반민족 행위 처벌법을 제정하였으나 친일파 청산은 미흡하였고, 농지 개혁을 실시하였다. 1950년 6월 25일 북한군의 남침으로 6·25 전쟁이 일어나 1953년 정전 협정이 체결되었다. 발췌 개헌과 사사오입 개헌으로 장기 집권을 꾀하였고, 1960년 3·15 부정 선거에 맞선 4·19 혁명으로 이승만 대통령이 물러났다.',
      terms: [
        { label: '반민족 행위 처벌법', def: '친일 반민족 행위자를 처벌하려 제정한 법.' },
        { label: '사사오입 개헌', def: '이승만의 중임 제한을 없앤 개헌.' },
        { label: '4·19 혁명', def: '3·15 부정 선거에 맞서 학생과 시민이 일으킨 민주 혁명(1960).' }
      ],
      timeline: [
        { y: 1948, label: '◆ 대한민국 정부 수립' },
        { y: 1950, label: '6·25 전쟁' },
        { y: 1952, label: '발췌 개헌' },
        { y: 1953, label: '정전 협정' },
        { y: 1954, label: '사사오입 개헌' },
        { y: 1960, label: '4·19 혁명 — 이승만 대통령 하야' }
      ]
    },
    sources: [
      {
        kind: '교과서 본문',
        title: '한국사 전쟁의 성격과 6·25 전쟁',
        body: '한국사에는 수많은 전쟁이 등장합니다. 그런데 고려가 후삼국을 통일한 후에 일어난 전쟁은 거의 외세의 침략에 맞서 싸운 것입니다. 고려와 거란·몽골의 전쟁, 조선의 임진왜란과 병자호란, 구한말의 항일 의병 전쟁 등이 그것이죠. 한반도 내부에서 국토가 나뉘어 서로 싸운 전쟁은 6·25 전쟁이 유일합니다. 더욱이 6·25 전쟁에서는 대규모의 외국 군대가 양편에 가담하여 싸우기까지 하였습니다.',
        citation: '— K4, pp. 1195–1197'
      },
      {
        kind: '회고록',
        title: '김성칠, 『역사 앞에서』 — 발췌',
        body: '팽 돌고 눈앞이 깜깜해졌다.',
        gloss: '광복과 분단, 그 후 5년 동안 언제 일어날지 모르는 전쟁의 조짐에 많은 이들이 우려하던 시기의 회고.',
        citation: '— K4, p. 1249'
      }
    ],
    artifacts: [
      { slot: 'wide', caption: '전쟁이 촉발된 상황을 풍자한 만화 (1950. 7.)', ref: 'K4, p. 1255' }
    ],
    linked: ['k-rok', 'k-gov-chang', 'k-liberation', 'e-prc', 'k-625'],
    map: {
      title: '6·25 전쟁의 전개',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 110 30 L 245 30 L 260 90 L 250 175 L 215 215 L 145 215 L 110 180 L 90 100 Z', label: '한반도' }
      ],
      gridLine: { y: 110, label: '38°N · 정전선' },
      pins: [
        { x: 175, y: 60, label: '북한 남침', sub: '1950.6.25', red: true },
        { x: 180, y: 145, label: '서울' },
        { x: 220, y: 200, label: '부산 교두보' },
        { x: 200, y: 100, label: '인천 상륙', sub: '1950.9', amber: true },
        { x: 175, y: 35, label: '압록강', sub: '국군 진격 최북단' }
      ],
      arrows: [
        { from: [175, 60], to: [220, 200], label: '남침' },
        { from: [200, 100], to: [175, 35], label: '북진' }
      ]
    }
  },
  'k-gov-chang': {
    notes: {   // 정리 — 사용자 정리본 그대로 (정치·경제·통일)
      sections: [
        { head: '정치', list: [
          '3차 개헌(1960)',
          '**내각 책임제**',
          '양원제(민의원+참의원) → 장면 정부 출범',
          '4대 대통령 윤보선',
          '국무총리 장면',
          '국민 기본권 보장',
          '언론·출판·집회·결사 자유',
          '공무원 공개 채용 제도 실시',
          '지방 자치 제도 확대·시행',
          '경제 개발 계획안 마련',
          '4차 개헌 = 소급 입법(1960)',
          '3·15 부정 선거 처벌',
          '민주화 요구 소극 수용',
          '부정 선거 처벌에 소극적'
        ] },
        { head: '통일', list: [
          'UN 감시하 남북 총선거 주장',
          '민간 차원 통일 운동 반대'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '장면 내각 — 4·19 혁명 이후 허정을 중심으로 하는 과도 정부가 구성되어, 양원제 국회와 내각 책임제를 중심으로 헌법을 개정하였다. 새 헌법에 따라 실시된 총선거에서 민주당이 크게 승리하였고, 국회에서 윤보선이 대통령으로 선출되었으며, 윤보선이 지명한 장면이 국무총리로 인준을 받아 장면 내각이 세워졌다. 장면 내각은 민주화와 경제 발전을 국정 지표로 내세우고, 지방 자치제를 시행하고 경제 개발 5개년 계획을 마련하였다. 그러나 4·19 혁명 이후 쏟아져 나온 평화 통일 운동·노동 운동 등의 다양한 요구에 적절히 대응하지 못하였고, 부정 선거 책임자와 부정 축재자 처벌에도 소극적이었으며, 집권당인 민주당도 분열되었다. 1961년 5·16 군사 정변으로 무너졌다.',
      terms: [
        { label: '내각 책임제', def: '국회 다수당이 내각을 구성하는 정치 형태.' },
        { label: '양원제', def: '국회를 민의원(하원)과 참의원(상원)으로 구성하는 제도.' },
        { label: '허정 과도 정부', def: '4·19 혁명 이후 허정을 중심으로 구성된 과도 정부.' }
      ],
      timeline: [
        { y: 1960, label: '4·19 혁명, 허정 과도 정부' },
        { y: 1960, label: '◆ 장면 내각 수립' },
        { y: 1961, label: '5·16 군사 정변' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gov-rhee', 'k-gov-park']
  },
  'k-gov-park': {
    notes: {   // 정리 — 사용자 정리본 그대로 (정치·경제·통일)
      sections: [
        { head: '정치', list: [
          '5·16 군사 정변(1961)',
          '계엄 선포, 군정 실시(반공, 언론 탄압 등)',
          '**국가 재건 최고 회의**, 중앙정보부 설치',
          '5차 개헌(1962): 대통령 직선제, 단원제',
          '5대 대통령 박정희 당선(1963)→박정희 정부',
          '한·일 회담(1962): 김종필·오히라 비밀 회담',
          '6·3 시위(1964): ‘민족적 민주주의 장례식’',
          '비밀 회담 폭로 → 한·일 수교 반대',
          '**한·일 기본 조약**(1965) → 한·일 수교',
          '6차 개헌 = 3선 개헌(1969)',
          '청와대 습격 사건(1968)',
          '푸에블로호 나포 사건(1968)',
          '7대 대통령 박정희 당선(1971)',
          '7·4 남북 공동 성명(1972)',
          '7차 개헌 = 유신 헌법(1972)',
          '대통령 간선제, 6년 종신(중임 제한X)',
          '통일 주체 국민 회의에서 대통령 선출',
          '**국회 해산권, 국회 1/3 추천권, 긴급 조치권**',
          '대법원장·법관 임명권 행사 → 사법권 장악',
          '3·1 민주 구국 선언(1976)',
          '**YH무역 사건**(1979): 김영삼 제명',
          '부·마 민주화 운동(1979)',
          '10·26 사태 → 유신 체제 붕괴'
        ] },
        { head: '경제', list: [
          '제1·2차 경제 개발 5개년 계획(1962~1971)',
          '**경공업** 중심 수출 경제 정책: 노동 집약 산업',
          '저임금, 저곡가 → 정부 주도 수출',
          '국외 자금 충원 : 한·일 수교, 베트남 파병(1964~1965) : **파독 노동자(광부, 간호사)**',
          '경부 고속 국도 개통(1970)',
          '새마을 운동(1970): 농촌 개선 및 균형 발전',
          '**전태일** 분신(1970): 근로 기준법 준수 요구',
          '광주 대단지 사건(1971): 도시 빈민들의 항의',
          '제3·4차 경제 개발 5개년 계획(1972~1981)',
          '**중화학** 공업 중심: 포항 제철',
          '제1차 석유 파동(1973) → 중동 건설 외화',
          '수출 100억 달러 달성(1977)',
          '제2차 석유 파동(1978) → 경제 위기',
          '함평 고구마 사건(1976): 농민 피해 보상 투쟁'
        ] },
        { head: '통일', list: [
          '**7·4 남북 공동 성명**(1972)',
          '냉전 완화, 남북 적십자 회담 추진',
          '이후락과 김일성이 평양에서',
          '통일 3대 원칙: **자주, 평화, 민족 대단결**',
          '남북 조절 위원회 설치',
          '체제 강화 목적 → 유신 헌법, 사회주의 헌법'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '박정희 정부 — 1961년 박정희를 중심으로 한 군부 세력이 5·16 군사 정변을 일으켜 국가 재건 최고 회의를 구성하고 정권을 장악하였다. 1963년 대통령 선거에서 박정희가 당선되어 박정희 정부가 출범하였다. 제1차 경제 개발 5개년 계획(1962)을 시작으로 경제 성장을 추진하였고, 6·3 시위 속에서 한·일 협정(1965)을 체결하였으며 베트남 전쟁에 국군을 파병하였다. 3선 개헌(1969)에 이어 1972년 유신 헌법을 제정하여 대통령에게 권력을 집중시켰다. 부·마 민주 항쟁에 이어 1979년 10·26 사태로 유신 체제가 무너졌다.',
      terms: [
        { label: '5·16 군사 정변', def: '박정희 중심의 군부가 정권을 장악한 사건(1961).' },
        { label: '한·일 협정', def: '일본과 국교를 정상화한 협정(1965).' },
        { label: '유신 헌법', def: '대통령에게 권력을 집중시킨 헌법(1972).' }
      ],
      timeline: [
        { y: 1961, label: '5·16 군사 정변' },
        { y: 1962, label: '제1차 경제 개발 5개년 계획' },
        { y: 1963, label: '◆ 박정희 정부 출범' },
        { y: 1965, label: '한·일 협정' },
        { y: 1969, label: '3선 개헌' },
        { y: 1972, label: '유신 체제' },
        { y: 1979, label: '10·26 사태' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gov-chang', 'k-gov-choi', 'e-vietwar-end']
  },
  'k-gov-choi': {
    notes: { sections: [] },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '최규하 정부 — 1979년 10·26 사태로 박정희 대통령이 사망한 뒤, 국무총리였던 최규하가 통일 주체 국민회의를 통해 대통령을 승계하였다. 그러나 전두환·노태우 등 신군부가 12·12 사태로 군권을 장악하였고, 1980년 신군부의 압력으로 최규하 대통령이 물러났다.',
      terms: [
        { label: '신군부', def: '12·12 사태로 군권을 장악한 전두환·노태우 등 군부 세력.' }
      ],
      timeline: [
        { y: 1979, label: '◆ 10·26 사태·최규하 대통령 승계' },
        { y: 1980, label: '최규하 대통령 사임' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gov-park', 'k-gov-chun']
  },
  'k-gov-chun': {
    notes: {   // 정리 — 사용자 정리본 그대로 (정치·경제·통일)
      sections: [
        { head: '정치', list: [
          '10·26 사태 이후',
          '비상계엄 선포',
          '통일 주체 국민 회의·유신 헌법 → 대통령 최규하(10대)',
          '12·12 군사 쿠데타(1979) → 신군부 등장',
          '**서울의 봄**(1980): 민주화 열망',
          '5·18 민주화 운동(1980)',
          '계엄 철폐, 신군부 퇴진 요구',
          '계엄군 VS 시민군',
          '**국가 보위 비상 대책 위원회** 구성',
          '삼청 교육대 설치(1980)',
          '통일 주체 국민 회의·유신 헌법',
          '11대 대통령 전두환(1980)',
          '전두환 정부 출범(1980)',
          '8차 개헌(1980)',
          '대통령 간선제, 7년 단임',
          '12대 대통령 전두환(1981)',
          '**4·13 호헌 조치**(1987)',
          '6월 민주 항쟁(1987)',
          '박종철 고문치사 사건',
          '호헌 철폐·독재 타도, 이한열 사망',
          '6·29 민주화 선언 → 직선제 개헌'
        ] },
        { head: '경제', list: [
          '**3저 호황**(1986~1988)',
          '저금리, 저달러, 저유가',
          '우루과이 라운드(1986)',
          '시장 개방 확대 논의',
          '최저 임금법(1986)'
        ] },
        { head: '통일', list: [
          '북한이 수해 물자 지원(1984)',
          '최초 남북 이산가족 상봉'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '전두환 정부 — 12·12 사태로 군권을 장악한 신군부는 1980년 5월 17일 비상계엄을 전국으로 확대하였다. 이에 맞서 광주에서 5·18 민주화 운동이 일어났으나 계엄군에 무력으로 진압되었다. 신군부는 국가 보위 비상 대책 위원회를 설치하였고, 1980년 8월 전두환이 대통령이 되었다. 1987년 국민이 대통령 직선제 개헌을 요구하며 6월 민주 항쟁을 벌였고, 6·29 민주화 선언과 제9차 개헌이 이루어졌다.',
      terms: [
        { label: '5·18 민주화 운동', def: '신군부의 비상계엄 확대에 맞서 광주 시민과 학생이 민주화를 요구한 운동(1980).' },
        { label: '6월 민주 항쟁', def: '대통령 직선제 개헌을 요구한 전국적 민주화 운동(1987).' }
      ],
      timeline: [
        { y: 1979, label: '12·12 사태' },
        { y: 1980, label: '◆ 5·18 민주화 운동·전두환 대통령 취임' },
        { y: 1987, label: '6월 민주 항쟁·6·29 민주화 선언' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gov-choi', 'k-gov-roh']
  },
  'k-gov-roh': {
    notes: {   // 정리 — 사용자 정리본 (머리 항목 아래 세부 항목으로 배치 정리, 2026-10-10)
      sections: [
        { head: '정치', list: [
          { t: '9차 개헌', sub: ['대통령 직선제, 5년 단임'] },
          { t: '13대 대통령 노태우(1987) → 노태우 정부 출범(1988)', sub: ['여·야 합의 불발, 단일화 실패'] },
          '서울 올림픽 개최(1988)',
          '북방 외교: 소련 및 중국과 수교'
        ] },
        { head: '통일', list: [
          '남북 고위급 회담 개최(1990)',
          'UN 동시 가입(1991)',
          { t: '**남북 기본 합의서**(1991)', sub: ['상호 체제 인정, 상호 불가침', '남북 관계 → 잠정적 특수 관계', '남북 교류 → 민족 내부 교류'] },
          '한반도 비핵화 공동 선언(1992)'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '노태우 정부 — 6월 민주 항쟁 이후 대통령 직선제로 치러진 선거에서 당선된 노태우가 1988년 취임하였다. 서울 올림픽 대회를 개최하고 북방 외교를 추진하였다. 1991년 남북한이 유엔에 동시 가입하고 남북 기본 합의서를 채택하였으며, 1992년 한반도 비핵화 공동 선언을 발표하였다.',
      terms: [
        { label: '북방 외교', def: '사회주의 국가들과 관계를 개선한 외교 정책.' },
        { label: '남북 기본 합의서', def: '남북한이 화해·불가침·교류 협력에 합의한 문서(1991).' }
      ],
      timeline: [
        { y: 1988, label: '◆ 노태우 대통령 취임·서울 올림픽' },
        { y: 1991, label: '남북한 유엔 동시 가입·남북 기본 합의서' },
        { y: 1992, label: '한반도 비핵화 공동 선언' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gov-chun', 'k-gov-kys', 'w-ussr']
  },
  'k-gov-kys': {
    notes: {   // 정리 — 사용자 정리본 (머리 항목 아래 세부 항목으로 배치 정리, 2026-10-10)
      sections: [
        { head: '정치', list: [
          { t: '지방 자치제', sub: ['전면 실시'] },
          { t: '역사 바로 세우기 운동', sub: ['전두환·노태우 구속'] },
          '임기 말 외환 위기 발생'
        ] },
        { head: '경제', list: [
          '금융 실명제',
          '부동산 실명제',
          'OECD 가입',
          '우루과이 라운드 유지',
          '외환 위기(1997)'
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '김영삼 정부 — 1993년 취임한 김영삼 정부는 금융 실명제를 실시하였고, 1995년 제1회 전국 동시 지방 선거를 시행하였다. 1996년 경제 협력 개발 기구(OECD)에 가입하였으나, 1997년 외환 위기가 닥쳐 국제 통화 기금(IMF)과 구제 금융 협약을 맺었다.',
      terms: [
        { label: '금융 실명제', def: '금융 거래를 실제 이름으로만 하게 한 제도(1993).' },
        { label: '외환 위기', def: '외화 부족으로 IMF의 구제 금융을 받은 경제 위기(1997).' }
      ],
      timeline: [
        { y: 1993, label: '◆ 김영삼 대통령 취임·금융 실명제' },
        { y: 1995, label: '전국 동시 지방 선거' },
        { y: 1996, label: 'OECD 가입' },
        { y: 1997, label: '외환 위기' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gov-roh', 'k-gov-kdj']
  },
  'k-gov-kdj': {
    notes: {   // 정리 — 사용자 정리본 (머리 항목 아래 세부 항목으로 배치 정리, 2026-10-10)
      sections: [
        { head: '정치', list: [
          '평화적 여야 정권 교체'
        ] },
        { head: '경제', list: [
          { t: '신자유주의 경제 정책', sub: ['경쟁·효율 중시', '합병', '정리 해고', '비정규직'] },
          { t: '외환 위기 졸업', sub: ['금모으기 운동', '노사정 위원회'] },
          '한·칠레 FTA'
        ] },
        { head: '통일', list: [
          { t: '햇볕 정책', sub: ['정주영 소 떼 방북', '금강산 해로 관광'] },
          { t: '**6·15 남북 공동 선언**(2000)', sub: ['최초 남북 정상 회담', '(남)연합체≒(북)낮은 단계 연방제', '개성 공단, 이산 가족 상봉', '경의선, 금강산 육로 관광'] }
        ] }
      ]
    },
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '김대중 정부 — 1997년 외환 위기 속에서 치러진 대통령 선거에서 야당의 김대중이 당선되어, 정부 수립 50년 만에 처음으로 선거에 의한 여야 간 평화적 정권 교체가 이루어졌다. 외환 위기 극복에 힘썼고, 1999년 국민 기초 생활 보장법을 제정하였다. 2000년 평양에서 남북 정상 회담을 갖고 6·15 남북 공동 선언을 발표하였다.',
      terms: [
        { label: '6·15 남북 공동 선언', def: '첫 남북 정상 회담에서 발표한 선언(2000).' },
        { label: '국민 기초 생활 보장법', def: '최저 생활을 보장하는 사회 복지 제도(1999).' }
      ],
      timeline: [
        { y: 1998, label: '◆ 김대중 대통령 취임' },
        { y: 1999, label: '국민 기초 생활 보장법 제정' },
        { y: 2000, label: '6·15 남북 공동 선언' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gov-kys', 'k-gov-rmh']
  },
  'k-gov-rmh': {
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '노무현 정부 — 2003년 출범한 노무현(참여) 정부는 더불어 사는 균형 발전 사회 등을 목표로 제시하였다. 국가 정보원·검찰 등 국가 기관의 독립성을 강화하고, 혁신 도시를 건설하여 주요 공공 기관의 지방 이전을 추진하였다. 과거사 정리를 위해 친일 반민족 행위 진상 규명 위원회와 진실·화해를 위한 과거사 정리 위원회를 조직하였다. 그러나 부동산 가격 급등 등으로 부정적인 평가를 받기도 하였다. 김대중 정부의 대북 화해 협력 정책을 이어받아 개성 공단을 조성하였고, 2007년 평양에서 남북 정상 회담을 열어 10·4 남북 정상 선언을 발표하였다.',
      terms: [
        { label: '혁신 도시', def: '노무현 정부가 주요 공공 기관을 옮기려 지방에 건설한 도시.' },
        { label: '개성 공단', def: '남북 경제 협력으로 개성에 조성한 공업 단지(2003 착공, 2016 폐쇄).' },
        { label: '10·4 남북 정상 선언', def: '2007년 평양 남북 정상 회담에서 발표한 남북 관계 발전과 평화 번영을 위한 선언.' }
      ],
      timeline: [
        { y: 2003, label: '◆ 노무현 대통령 취임, 개성 공단 착공' },
        { y: 2005, label: '진실·화해를 위한 과거사 정리 위원회 출범' },
        { y: 2007, label: '남북 정상 회담, 10·4 남북 정상 선언' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gov-kdj', 'k-gov-lmb']
  },
  'k-gov-lmb': {
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '이명박 정부 — 2008년 이명박 대통령이 취임하면서 10년 만에 다시 여야 정권이 교체되었다. 이명박 정부는 선진 일류 국가를 목표로 내세우고 성장 위주의 경제 정책을 추진하였다. 하지만 미국산 쇠고기 수입과 4대강 살리기 사업을 추진하는 과정에서 시민 사회와 갈등을 빚기도 하였다. 한편 북한이 천안함 피격 사건과 연평도 포격전을 일으키고(2010) 잇따라 핵 실험을 하면서 남북 관계가 악화되었다.',
      terms: [
        { label: '4대강 살리기 사업', def: '이명박 정부가 추진한 하천 정비 사업. 시민 사회와 갈등을 빚었다.' },
        { label: '천안함 피격 사건', def: '2010년 서해에서 해군 천안함이 북한의 공격으로 침몰한 사건.' },
        { label: '연평도 포격전', def: '2010년 북한이 서해 연평도를 포격한 사건.' }
      ],
      timeline: [
        { y: 2008, label: '◆ 이명박 대통령 취임' },
        { y: 2008, label: '금강산 관광 중단' },
        { y: 2010, label: '천안함 피격 사건, 연평도 포격전' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gov-rmh', 'k-gov-pgh']
  },
  'k-gov-pgh': {
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '박근혜 정부 — 2013년 출범한 박근혜 정부는 일자리 중심의 창조 경제, 안전과 통합의 사회 등을 국정 목표로 내세웠다. 2014년 세월호 참사가 일어났고, 2016년 개성 공단이 폐쇄되었다. 민간인이 대통령과 밀착하여 국정에 개입한 사실이 드러나 촛불 집회가 이어졌고, 2017년 박근혜 대통령이 탄핵되었다.',
      terms: [
        { label: '촛불 집회', def: '대통령의 퇴진을 요구한 평화적 시민 집회.' }
      ],
      timeline: [
        { y: 2013, label: '◆ 박근혜 대통령 취임' },
        { y: 2014, label: '세월호 참사' },
        { y: 2016, label: '개성 공단 폐쇄' },
        { y: 2017, label: '박근혜 대통령 탄핵' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gov-lmb', 'k-gov-moon']
  },
  'k-gov-moon': {
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '문재인 정부 — 2016년 민간인의 국정 개입과 부정부패가 알려지자 시민들은 촛불 집회를 열어 대통령 탄핵을 촉구하였고, 2017년 3월 헌법재판소가 박근혜 대통령의 탄핵을 결정하였다. 탄핵 이후 치러진 선거에서 문재인 대통령이 당선되어 여야 정권이 교체되었다. 문재인 정부는 더불어 잘사는 경제, 평화와 번영의 한반도 등을 목표로 내세웠다. 문재인 정부가 제시한 남북 화해 협력 방안에 북한이 호응하면서 2018년 평창 동계 올림픽에 북한 선수단이 참가하였고, 남북한 정상이 판문점과 평양에서 세 차례 정상 회담을 열어 판문점 선언 등을 발표하였다. 한편 2020년 초부터 코로나19가 유행하여 사회·경제적 어려움을 겪었다.',
      terms: [
        { label: '촛불 집회', def: '항의나 추모를 목적으로 하는 비폭력 평화 시위의 한 방식(2016~2017).' },
        { label: '판문점 선언', def: '2018년 남북 정상 회담에서 한반도의 평화와 번영, 통일을 위해 발표한 선언.' }
      ],
      timeline: [
        { y: 2017, label: '박근혜 대통령 탄핵' },
        { y: 2017, label: '◆ 문재인 대통령 취임' },
        { y: 2018, label: '평창 동계 올림픽, 남북 정상 회담·판문점 선언' },
        { y: 2020, label: '코로나19 확산' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gov-pgh', 'k-gov-yoon']
  },
  'k-gov-yoon': {
    fileRef: '동아출판 한국사1·2',
    overview: {
      summary: '윤석열 정부 — 2022년 3월에 치러진 선거에서 윤석열 대통령이 당선되어 다시 여야 정권이 교체되었다. 윤석열 정부는 다시 도약하는 대한민국, 함께 잘사는 국민의 나라를 국정 비전으로 내세웠다. 이로써 1987년 6월 민주 항쟁 이후 선거를 통한 평화적 정권 교체가 자리 잡았다.',
      terms: [
        { label: '정권 교체', def: '선거를 통해 집권 세력이 바뀌는 일. 6월 민주 항쟁 이후 평화적 정권 교체가 자리 잡았다.' }
      ],
      timeline: [
        { y: 1987, label: '6월 민주 항쟁' },
        { y: 2022, label: '◆ 윤석열 대통령 취임' }
      ]
    },
    sources: [],
    artifacts: [],
    linked: ['k-gov-moon']
  },
  'k-samil': {
    notes: { sections: [] },
    syncRatio: 0.96,
    fileRef: 'K3 · pp. 1010–1563',
    overview: {
      summary: '나라 안팎에서 항일 투쟁이 활발히 전개되는 가운데 러시아 혁명으로 사회주의 국가가 출현하고 미국 대통령 윌슨이 민족 자결주의를 제창하여 국제 정세에 변화가 나타났다. 신한 청년당의 파리 강화 회의 대표 파견과 일본 도쿄 유학생의 2·8 독립 선언이 자극이 되었고, 고종의 서거로 일제의 독살설이 퍼지며 국민이 크게 분노하였다. 1919년 3월 1일 손병희·이승훈·한용운 등 33인의 민족 대표는 태화관에서, 학생·시민은 탑골 공원에서 독립 선언서를 발표하였다. 만세 시위는 전국 도시·농촌과 만주·연해주·미주·일본 등 국외로 확산되었으며, 약 3개월간 1,500회 이상의 시위에 약 200만 명이 참가하였다. 극소수의 친일파를 제외한 전 계층이 참여한 운동으로, 그 결과 민주 공화제의 대한민국 임시 정부가 수립되었다.',
      terms: [
        { label: '민족 자결주의', def: '각 민족은 자신의 정치적 운명을 스스로 결정할 권리가 있다는 원칙. 미국 대통령 윌슨이 제시.' },
        { label: '2·8 독립 선언', def: '도쿄 유학생 최팔용 등이 중심이 되어 발표. 결의문은 이광수가 작성. 3·1 운동의 기폭제.' },
        { label: '신한 청년당', def: '상하이의 젊은 활동가들이 결성. 파리 강화 회의에 김규식을 대표로 파견하여 3·1 운동과 임시 정부 수립의 기반을 조성하였다.' }
      ],
      timeline: [
        { y: 1917, label: '러시아 혁명 · 윌슨 14개조 평화 원칙' },
        { y: 1919, label: '2·8 독립 선언 / 3·1 운동 / 임시 정부 수립' }
      ]
    },
    sources: [
      {
        kind: '독립 선언서',
        title: '「3·1 독립 선언서」 (1919) — 발췌',
        body: '정의와 휴머니티를 앞세운 한국이 독립 선언을 하였다. 선언문에서 “우리의 독립 선언은 현재의 고통스러운 상처를 없애고 불법적인 일본의 압제에서 벗어나 후손들에게 부끄러운 유산이 아닌 영원한 자유를 물려 …”',
        citation: '— K3, pp. 1549–1551'
      },
      {
        kind: '통계 · 사료',
        title: '박은식, 『한국통사』 — 일제의 탄압',
        body: '3·1 운동은 일제의 가혹한 탄압과 만행 속에서도 3개월에 걸쳐 전국에서 1,500회 이상 시위가 일어났으며, 약 200만 명이 참가한 것으로 추산된다. 이 과정에서 일제에 살해당한 사람이 약 7,500명, 부상자가 약 1만 6,000명, 피검자가 약 4만 …',
        citation: '— K3, pp. 1501–1503'
      },
      { kind: '국제 보도', title: '중국 『국민일보』의 보도', body: '중국의 『국민일보』는 아시아의 3대 혁명으로 신해혁명, 러시아 혁명, 3·1 운동을 지목하였다.', citation: '— K3, p. 1563' },
      {
        kind: '교과서 본문',
        title: '3·1 운동의 의의',
        body: '3·1 운동은 군대까지 동원한 일제의 무자비한 탄압으로 엄청난 희생과 피해를 겪었지만 독립으로 곧바로 이어지지 못하였다. 그렇지만 3·1 운동은 신분과 직업, … 3·1 운동을 계기로 민주 공화제의 대한민국 임시 정부가 수립되었고, 이로써 …',
        citation: '— K3, pp. 1526–1540'
      }
    ],
    map: {
      title: '3·1 운동의 국내외 전개',
      bounds: { w: 360, h: 240 },
      regions: [
        { d: 'M 120 60 L 230 60 L 250 110 L 235 180 L 195 215 L 135 215 L 105 175 L 95 110 Z', label: '한반도' }
      ],
      pins: [
        { x: 175, y: 110, label: '경성', sub: '탑골 공원 · 3.1', amber: true },
        { x: 155, y: 95, label: '평양', sub: '평양·원산 동시 시위' },
        { x: 305, y: 50, label: '도쿄', sub: '2·8 독립 선언' },
        { x: 60, y: 60, label: '상하이', sub: '신한 청년당 · 임시 정부' },
        { x: 50, y: 30, label: '파리', sub: '김규식 파견' },
        { x: 320, y: 35, label: '블라디보스토크', sub: '연해주' },
        { x: 30, y: 130, label: '필라델피아', sub: '미주 시위' }
      ],
      arrows: [
        { from: [305, 50], to: [175, 110], label: '2·8 → 3·1' },
        { from: [175, 110], to: [60, 60], label: '임정 수립' }
      ]
    },
    artifacts: [
      { slot: 'document', caption: '「3·1 독립 선언서」', ref: 'K3, pp. 1549–1551' },
      { slot: 'document', caption: '「2·8 독립 선언 결의문」 (1919)', ref: 'K3, pp. 1402–1404' },
      { slot: 'wide', caption: '덕수궁 앞 만세 시위 · 3·1 운동 재현 행사', ref: 'K3, pp. 1388, 1422' },
      { slot: 'portrait', caption: '김규식 — 파리 강화 회의', ref: 'K3, p. 1717' }
    ],
    linked: ['k-annexation', 'k-28', 'k-provisional', 'k-era-mudan', 'k-liberation', 'k-rok', 'w-ww1', 'w-russia']
  }

};

/* ---------------------------------------------------------------------------
 * ESM / CommonJS 로 쓸 경우 아래 주석을 해제하세요.
 * --------------------------------------------------------------------------- */
// export const TIMELINE_DATA = window.TIMELINE_DATA;
// export const TIMELINE_DB   = window.TIMELINE_DB;
// export default { TIMELINE_DATA, TIMELINE_DB };
//
// if (typeof module !== 'undefined' && module.exports) {
//   module.exports = { TIMELINE_DATA: window.TIMELINE_DATA, TIMELINE_DB: window.TIMELINE_DB };
// }
